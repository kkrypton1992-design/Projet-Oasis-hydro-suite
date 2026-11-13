/**
 * OASIS HYDRO SUITE — Fournisseur PostgreSQL / PostGIS Optionnel
 * Utilisé uniquement lorsque DB_PROVIDER=postgres, APP_MODE=remote ou configuration SQL explicite.
 */

import { and, eq, notInArray } from 'drizzle-orm';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { AppConfig } from '../../config/env.ts';
import { recalculateEntireProject } from '../../core/projectEngine.ts';
import { DEFAULT_REAL_PROJECT } from '../../data/referenceProject.ts';
import { CalculatedFlowsSchema, CalculatedTcSchema } from '../../shared/validation/schemas.ts';
import {
  HydraulicCalculationResults,
  HydraulicStructure,
  Project,
  ProjectSettings,
  Watershed,
  WatershedPoint
} from '../../types/oasis.ts';
import {
  DatabaseProvider,
  DatabaseReadiness,
  ProjectSummaryRow,
  ReportRecord,
  SaveReportInput,
  StationRecord,
  WorkflowRecord
} from '../provider.ts';
import * as pgSchema from '../schema.ts';

export class PostgresDatabaseProvider implements DatabaseProvider {
  public readonly dialect = 'postgres' as const;
  public readonly storageLocation: string;

  private readonly dbConfig: AppConfig['db'];
  private pool: Pool | null = null;
  private orm: NodePgDatabase<typeof pgSchema> | null = null;

  constructor(dbConfig: AppConfig['db']) {
    this.dbConfig = dbConfig;
    this.storageLocation = `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
  }

  public async init(): Promise<void> {
    if (this.pool && this.orm) return;

    this.pool = new Pool({
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      user: this.dbConfig.user,
      password: this.dbConfig.password,
      database: this.dbConfig.database,
      max: this.dbConfig.maxConnections,
      connectionTimeoutMillis: this.dbConfig.connectionTimeoutMs
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });

    this.orm = drizzle(this.pool, { schema: pgSchema });
  }

  private async ensureReady(): Promise<{ pool: Pool; orm: NodePgDatabase<typeof pgSchema> }> {
    await this.init();
    if (!this.pool || !this.orm) {
      throw new Error('Pool PostgreSQL non initialisé.');
    }
    return { pool: this.pool, orm: this.orm };
  }

  public async checkReadiness(): Promise<DatabaseReadiness> {
    const start = Date.now();
    try {
      const { pool } = await this.ensureReady();
      await pool.query('SELECT 1');
      return {
        connected: true,
        dialect: 'postgres',
        storageLocation: this.storageLocation,
        latencyMs: Date.now() - start
      };
    } catch (err) {
      return {
        connected: false,
        dialect: 'postgres',
        storageLocation: this.storageLocation,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : 'Erreur inconnue PostgreSQL'
      };
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.orm = null;
    }
  }

  public async getAllProjects(): Promise<ProjectSummaryRow[]> {
    const { orm } = await this.ensureReady();
    return await orm
      .select({
        id: pgSchema.projects.id,
        code: pgSchema.projects.code,
        title: pgSchema.projects.title,
        client: pgSchema.projects.client,
        updatedAt: pgSchema.projects.updatedAt
      })
      .from(pgSchema.projects);
  }

  public async getProjectById(projectId: string): Promise<Project | null> {
    const { orm } = await this.ensureReady();
    const projRows = await orm
      .select()
      .from(pgSchema.projects)
      .where(eq(pgSchema.projects.id, projectId));
    if (projRows.length === 0) return null;

    const p = projRows[0];
    const wsRows = await orm
      .select()
      .from(pgSchema.watersheds)
      .where(eq(pgSchema.watersheds.projectId, projectId));
    const stRows = await orm
      .select()
      .from(pgSchema.hydraulicStructures)
      .where(eq(pgSchema.hydraulicStructures.projectId, projectId));

    const mappedWatersheds: Watershed[] = wsRows.map((w) => {
      const parsedTc = w.calculatedTc ? CalculatedTcSchema.safeParse(w.calculatedTc) : null;
      const parsedFlows = w.calculatedFlows
        ? CalculatedFlowsSchema.safeParse(w.calculatedFlows)
        : null;
      return {
        id: w.id,
        code: w.code,
        name: w.name,
        areaKm2: w.areaKm2,
        lengthKm: w.lengthKm,
        deltaH: w.deltaH,
        slopePercent: w.slopePercent,
        runoffCoefficient: w.runoffCoefficient,
        soilType: w.soilType,
        vegetation: w.vegetation,
        color: w.color,
        coordinates: Array.isArray(w.coordinates) ? (w.coordinates as WatershedPoint[]) : [],
        calculatedTc: parsedTc?.success ? parsedTc.data : undefined,
        calculatedFlows: parsedFlows?.success ? parsedFlows.data : undefined
      };
    });

    const mappedStructures: HydraulicStructure[] = stRows.map((s) => ({
      id: s.id,
      code: s.code,
      pkMeters: s.pkMeters,
      name: s.name,
      type: s.type as HydraulicStructure['type'],
      material: s.material as HydraulicStructure['material'],
      stricklerK: s.stricklerK,
      diameterM: s.diameterM ?? undefined,
      widthM: s.widthM ?? undefined,
      heightM: s.heightM ?? undefined,
      sideSlopeM: s.sideSlopeM ?? undefined,
      cellsCount: s.cellsCount,
      lengthM: s.lengthM,
      bedSlopeMPerM: s.bedSlopeMPerM,
      watershedId: s.watershedId,
      designFlowM3s: s.designFlowM3s,
      checkFlowM3s: s.checkFlowM3s,
      position: (s.position as WatershedPoint) || { lat: 0, lng: 0 },
      results: (s.results as HydraulicCalculationResults | null) ?? undefined
    }));

    return {
      id: p.id,
      code: p.code,
      title: p.title,
      client: p.client,
      engineer: p.engineer,
      location: p.location,
      description: p.description,
      status: p.status as Project['status'],
      version: p.version,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      settings: p.settings as ProjectSettings,
      watersheds: mappedWatersheds,
      structures: mappedStructures
    };
  }

  public async saveOrUpdateFullProject(project: Project): Promise<Project> {
    const { orm } = await this.ensureReady();
    const recalculated = recalculateEntireProject(project);

    await orm.transaction(async (tx) => {
      await tx
        .insert(pgSchema.projects)
        .values({
          id: recalculated.id,
          code: recalculated.code,
          title: recalculated.title,
          client: recalculated.client,
          engineer: recalculated.engineer,
          location: recalculated.location,
          description: recalculated.description,
          status: recalculated.status,
          version: recalculated.version,
          settings: recalculated.settings,
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: pgSchema.projects.id,
          set: {
            code: recalculated.code,
            title: recalculated.title,
            client: recalculated.client,
            engineer: recalculated.engineer,
            location: recalculated.location,
            description: recalculated.description,
            status: recalculated.status,
            version: recalculated.version,
            settings: recalculated.settings,
            updatedAt: new Date()
          }
        });

      const wsIds = recalculated.watersheds.map((w) => w.id);
      if (wsIds.length === 0) {
        await tx
          .delete(pgSchema.watersheds)
          .where(eq(pgSchema.watersheds.projectId, recalculated.id));
      } else {
        await tx
          .delete(pgSchema.watersheds)
          .where(
            and(
              eq(pgSchema.watersheds.projectId, recalculated.id),
              notInArray(pgSchema.watersheds.id, wsIds)
            )
          );
      }

      for (const ws of recalculated.watersheds) {
        await tx
          .insert(pgSchema.watersheds)
          .values({
            id: ws.id,
            projectId: recalculated.id,
            code: ws.code,
            name: ws.name,
            areaKm2: ws.areaKm2,
            lengthKm: ws.lengthKm,
            deltaH: ws.deltaH,
            slopePercent: ws.slopePercent,
            runoffCoefficient: ws.runoffCoefficient,
            soilType: ws.soilType,
            vegetation: ws.vegetation,
            color: ws.color || '#0284c7',
            coordinates: ws.coordinates,
            calculatedTc: ws.calculatedTc,
            calculatedFlows: ws.calculatedFlows
          })
          .onConflictDoUpdate({
            target: pgSchema.watersheds.id,
            set: {
              projectId: recalculated.id,
              code: ws.code,
              name: ws.name,
              areaKm2: ws.areaKm2,
              lengthKm: ws.lengthKm,
              deltaH: ws.deltaH,
              slopePercent: ws.slopePercent,
              runoffCoefficient: ws.runoffCoefficient,
              soilType: ws.soilType,
              vegetation: ws.vegetation,
              color: ws.color || '#0284c7',
              coordinates: ws.coordinates,
              calculatedTc: ws.calculatedTc,
              calculatedFlows: ws.calculatedFlows
            }
          });
      }

      const stIds = recalculated.structures.map((s) => s.id);
      if (stIds.length === 0) {
        await tx
          .delete(pgSchema.hydraulicStructures)
          .where(eq(pgSchema.hydraulicStructures.projectId, recalculated.id));
      } else {
        await tx
          .delete(pgSchema.hydraulicStructures)
          .where(
            and(
              eq(pgSchema.hydraulicStructures.projectId, recalculated.id),
              notInArray(pgSchema.hydraulicStructures.id, stIds)
            )
          );
      }

      for (const st of recalculated.structures) {
        await tx
          .insert(pgSchema.hydraulicStructures)
          .values({
            id: st.id,
            projectId: recalculated.id,
            watershedId: st.watershedId,
            code: st.code,
            pkMeters: st.pkMeters,
            name: st.name,
            type: st.type,
            material: st.material,
            stricklerK: st.stricklerK,
            diameterM: st.diameterM,
            widthM: st.widthM,
            heightM: st.heightM,
            sideSlopeM: st.sideSlopeM,
            cellsCount: st.cellsCount || 1,
            lengthM: st.lengthM,
            bedSlopeMPerM: st.bedSlopeMPerM,
            designFlowM3s: st.designFlowM3s,
            checkFlowM3s: st.checkFlowM3s,
            position: st.position,
            results: st.results
          })
          .onConflictDoUpdate({
            target: pgSchema.hydraulicStructures.id,
            set: {
              projectId: recalculated.id,
              watershedId: st.watershedId,
              code: st.code,
              pkMeters: st.pkMeters,
              name: st.name,
              type: st.type,
              material: st.material,
              stricklerK: st.stricklerK,
              diameterM: st.diameterM,
              widthM: st.widthM,
              heightM: st.heightM,
              sideSlopeM: st.sideSlopeM,
              cellsCount: st.cellsCount || 1,
              lengthM: st.lengthM,
              bedSlopeMPerM: st.bedSlopeMPerM,
              designFlowM3s: st.designFlowM3s,
              checkFlowM3s: st.checkFlowM3s,
              position: st.position,
              results: st.results
            }
          });
      }
    });

    return recalculated;
  }

  public async deleteProject(projectId: string): Promise<boolean> {
    const { orm } = await this.ensureReady();
    const deleted = await orm
      .delete(pgSchema.projects)
      .where(eq(pgSchema.projects.id, projectId))
      .returning({ id: pgSchema.projects.id });
    return deleted.length > 0;
  }

  public async seedInitialProjectIfEmpty(): Promise<Project> {
    const { orm } = await this.ensureReady();
    const existing = await orm
      .select({ id: pgSchema.projects.id })
      .from(pgSchema.projects)
      .limit(1);
    if (existing.length === 0) {
      return await this.saveOrUpdateFullProject(DEFAULT_REAL_PROJECT);
    }
    const full = await this.getProjectById(existing[0].id);
    if (!full) {
      throw new Error(`Incohérence PostgreSQL : projet "${existing[0].id}" introuvable.`);
    }
    return full;
  }

  public async getReportsByProjectId(projectId: string): Promise<ReportRecord[]> {
    const { orm } = await this.ensureReady();
    const rows = await orm
      .select()
      .from(pgSchema.reports)
      .where(eq(pgSchema.reports.projectId, projectId));
    return rows.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      code: r.code,
      title: r.title,
      type: r.type,
      status: r.status,
      content: (r.content as Record<string, unknown>) || {},
      createdAt: r.createdAt
    }));
  }

  public async saveReport(reportData: SaveReportInput): Promise<ReportRecord> {
    const { orm } = await this.ensureReady();
    const type = reportData.type || 'HYDRAULIC_CALCULATION_NOTE';
    const status = reportData.status || 'DRAFT';

    const rows = await orm
      .insert(pgSchema.reports)
      .values({
        id: reportData.id,
        projectId: reportData.projectId,
        code: reportData.code,
        title: reportData.title,
        type,
        status,
        content: reportData.content
      })
      .onConflictDoUpdate({
        target: pgSchema.reports.id,
        set: {
          title: reportData.title,
          status,
          content: reportData.content
        }
      })
      .returning();

    const saved = rows[0];
    return {
      id: saved.id,
      projectId: saved.projectId,
      code: saved.code,
      title: saved.title,
      type: saved.type,
      status: saved.status,
      content: (saved.content as Record<string, unknown>) || {},
      createdAt: saved.createdAt
    };
  }

  public async getWorkflowByProjectId(projectId: string): Promise<WorkflowRecord[]> {
    const { orm } = await this.ensureReady();
    return await orm
      .select()
      .from(pgSchema.workflow)
      .where(eq(pgSchema.workflow.projectId, projectId));
  }

  public async getAllStations(): Promise<StationRecord[]> {
    const { orm } = await this.ensureReady();
    const rows = await orm.select().from(pgSchema.stations);
    return rows.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      type: s.type,
      coordinates: (s.coordinates as { lat: number; lng: number }) || { lat: 0, lng: 0 },
      elevationM: s.elevationM,
      active: s.active,
      createdAt: s.createdAt
    }));
  }

  public async getSeriesByStationId(stationId: string): Promise<Array<Record<string, unknown>>> {
    const { orm } = await this.ensureReady();
    const rows = await orm
      .select()
      .from(pgSchema.hydroSeries)
      .where(eq(pgSchema.hydroSeries.stationId, stationId));
    return rows.map((r) => ({ ...r }));
  }
}
