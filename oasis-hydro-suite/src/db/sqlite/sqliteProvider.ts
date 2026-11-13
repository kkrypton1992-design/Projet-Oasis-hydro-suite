/**
 * OASIS HYDRO SUITE — Fournisseur SQLite Local Embarqué (sql.js + Drizzle ORM)
 * Zéro dépendance externe : crée la base, exécute les migrations versionnées
 * et écrit atomiquement le fichier .sqlite sur disque.
 */

import { and, eq, notInArray } from 'drizzle-orm';
import { drizzle, SQLJsDatabase } from 'drizzle-orm/sql-js';
import fs from 'fs';
import path from 'path';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
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
import { applySqliteMigrations } from './migrations.ts';
import * as sqliteSchema from './schema.ts';

function resolveSqlWasmBinary(): Uint8Array {
  const candidates = [
    process.env.OASIS_SQL_WASM_PATH,
    path.join(path.dirname(process.argv[1] || process.cwd()), 'sql-wasm.wasm'),
    process.resourcesPath ? path.join(process.resourcesPath, 'sql-wasm.wasm') : undefined,
    path.resolve(process.cwd(), 'electron', 'dist', 'sql-wasm.wasm'),
    path.resolve(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return new Uint8Array(fs.readFileSync(candidate));
    }
  }

  throw new Error(
    `Module WebAssembly SQLite introuvable (sql-wasm.wasm). Chemins vérifiés : ${candidates.join(', ')}`
  );
}

function parseJsonSafe<T>(raw: string | null | undefined, context: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`Données JSON SQLite corrompues (${context}).`, { cause: err });
  }
}

export class SqliteDatabaseProvider implements DatabaseProvider {
  public readonly dialect = 'sqlite' as const;
  public readonly storageLocation: string;

  private sqliteDb: SqlJsDatabase | null = null;
  private drizzleDb: SQLJsDatabase<typeof sqliteSchema> | null = null;
  private schemaVersion = 0;
  private initPromise: Promise<void> | null = null;

  constructor(sqliteFilePath: string) {
    this.storageLocation = sqliteFilePath;
  }

  public async init(): Promise<void> {
    if (this.sqliteDb && this.drizzleDb) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const wasmBinary = resolveSqlWasmBinary();
        const SQL = await initSqlJs({ wasmBinary });

        const isMemory = this.storageLocation === ':memory:';
        let initialData: Uint8Array | null = null;

        if (!isMemory) {
          const dir = path.dirname(this.storageLocation);
          fs.mkdirSync(dir, { recursive: true });
          if (fs.existsSync(this.storageLocation)) {
            const fileBuf = fs.readFileSync(this.storageLocation);
            if (fileBuf.byteLength === 0) {
              throw new Error(
                `Le fichier SQLite "${this.storageLocation}" est vide ou corrompu (0 octet).`
              );
            }
            initialData = new Uint8Array(fileBuf);
          }
        }

        const dbInstance = initialData ? new SQL.Database(initialData) : new SQL.Database();

        // Vérifie l'intégrité minimale si le fichier existait déjà
        dbInstance.exec('PRAGMA quick_check;');
        this.schemaVersion = applySqliteMigrations(dbInstance);
        this.sqliteDb = dbInstance;
        this.drizzleDb = drizzle(dbInstance, { schema: sqliteSchema });

        // Crée le fichier physique immédiatement au premier lancement
        if (!isMemory) {
          this.flushToDisk();
        }
      } catch (err) {
        this.sqliteDb = null;
        this.drizzleDb = null;
        this.initPromise = null;
        throw new Error(
          `Échec d'initialisation de la base SQLite locale (${this.storageLocation}) : ${
            err instanceof Error ? err.message : String(err)
          }`,
          { cause: err }
        );
      }
    })();

    return this.initPromise;
  }

  private ensureReady(): { raw: SqlJsDatabase; orm: SQLJsDatabase<typeof sqliteSchema> } {
    if (!this.sqliteDb || !this.drizzleDb) {
      throw new Error('Base SQLite non initialisée. Appelez init() avant toute requête.');
    }
    return { raw: this.sqliteDb, orm: this.drizzleDb };
  }

  private flushToDisk(): void {
    if (this.storageLocation === ':memory:' || !this.sqliteDb) return;
    const exported = this.sqliteDb.export();
    const tmpPath = `${this.storageLocation}.tmp`;
    fs.mkdirSync(path.dirname(this.storageLocation), { recursive: true });
    fs.writeFileSync(tmpPath, Buffer.from(exported));
    fs.renameSync(tmpPath, this.storageLocation);
  }

  private runInTransaction<T>(fn: (orm: SQLJsDatabase<typeof sqliteSchema>) => T): T {
    const { raw, orm } = this.ensureReady();
    raw.run('BEGIN TRANSACTION');
    try {
      const result = fn(orm);
      raw.run('COMMIT');
      this.flushToDisk();
      return result;
    } catch (err) {
      try {
        raw.run('ROLLBACK');
      } catch {
        // Ignore rollback failure if no tx active
      }
      throw err;
    }
  }

  public async checkReadiness(): Promise<DatabaseReadiness> {
    const start = Date.now();
    try {
      await this.init();
      const { raw } = this.ensureReady();
      raw.exec('SELECT 1');
      return {
        connected: true,
        dialect: 'sqlite',
        storageLocation: this.storageLocation,
        latencyMs: Date.now() - start,
        schemaVersion: this.schemaVersion
      };
    } catch (err) {
      return {
        connected: false,
        dialect: 'sqlite',
        storageLocation: this.storageLocation,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : 'Erreur SQLite inconnue'
      };
    }
  }

  public async close(): Promise<void> {
    if (this.sqliteDb) {
      if (this.storageLocation !== ':memory:') {
        this.flushToDisk();
      }
      this.sqliteDb.close();
      this.sqliteDb = null;
      this.drizzleDb = null;
      this.initPromise = null;
    }
  }

  public async getAllProjects(): Promise<ProjectSummaryRow[]> {
    await this.init();
    const { orm } = this.ensureReady();
    const rows = orm
      .select({
        id: sqliteSchema.projects.id,
        code: sqliteSchema.projects.code,
        title: sqliteSchema.projects.title,
        client: sqliteSchema.projects.client,
        updatedAt: sqliteSchema.projects.updatedAt
      })
      .from(sqliteSchema.projects)
      .all();

    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      client: r.client,
      updatedAt: new Date(r.updatedAt)
    }));
  }

  public async getProjectById(projectId: string): Promise<Project | null> {
    await this.init();
    const { orm } = this.ensureReady();
    const p = orm
      .select()
      .from(sqliteSchema.projects)
      .where(eq(sqliteSchema.projects.id, projectId))
      .get();

    if (!p) return null;

    const wsRows = orm
      .select()
      .from(sqliteSchema.watersheds)
      .where(eq(sqliteSchema.watersheds.projectId, projectId))
      .all();
    const stRows = orm
      .select()
      .from(sqliteSchema.hydraulicStructures)
      .where(eq(sqliteSchema.hydraulicStructures.projectId, projectId))
      .all();

    const mappedWatersheds: Watershed[] = wsRows.map((w) => {
      const tcJson = parseJsonSafe<unknown>(w.calculatedTc, `watershed.${w.id}.tc`);
      const flowsJson = parseJsonSafe<unknown>(w.calculatedFlows, `watershed.${w.id}.flows`);
      const coordsJson =
        parseJsonSafe<WatershedPoint[]>(w.coordinates, `watershed.${w.id}.coordinates`) || [];
      const parsedTc = tcJson ? CalculatedTcSchema.safeParse(tcJson) : null;
      const parsedFlows = flowsJson ? CalculatedFlowsSchema.safeParse(flowsJson) : null;

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
        coordinates: coordsJson,
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
      position: parseJsonSafe<WatershedPoint>(s.position, `structure.${s.id}.position`) || {
        lat: 0,
        lng: 0
      },
      results:
        parseJsonSafe<HydraulicCalculationResults>(s.results, `structure.${s.id}.results`) ??
        undefined
    }));

    const parsedSettings = parseJsonSafe<ProjectSettings>(p.settings, `project.${p.id}.settings`);
    if (!parsedSettings) {
      throw new Error(`Paramètres manquants pour le projet SQLite ${p.id}.`);
    }

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
      createdAt: new Date(p.createdAt).toISOString(),
      updatedAt: new Date(p.updatedAt).toISOString(),
      settings: parsedSettings,
      watersheds: mappedWatersheds,
      structures: mappedStructures
    };
  }

  public async saveOrUpdateFullProject(project: Project): Promise<Project> {
    await this.init();
    const recalculated = recalculateEntireProject(project);
    const nowIso = new Date().toISOString();

    this.runInTransaction((orm) => {
      orm
        .insert(sqliteSchema.projects)
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
          settings: JSON.stringify(recalculated.settings),
          createdAt: recalculated.createdAt || nowIso,
          updatedAt: nowIso
        })
        .onConflictDoUpdate({
          target: sqliteSchema.projects.id,
          set: {
            code: recalculated.code,
            title: recalculated.title,
            client: recalculated.client,
            engineer: recalculated.engineer,
            location: recalculated.location,
            description: recalculated.description,
            status: recalculated.status,
            version: recalculated.version,
            settings: JSON.stringify(recalculated.settings),
            updatedAt: nowIso
          }
        })
        .run();

      const wsIds = recalculated.watersheds.map((w) => w.id);
      if (wsIds.length === 0) {
        orm
          .delete(sqliteSchema.watersheds)
          .where(eq(sqliteSchema.watersheds.projectId, recalculated.id))
          .run();
      } else {
        orm
          .delete(sqliteSchema.watersheds)
          .where(
            and(
              eq(sqliteSchema.watersheds.projectId, recalculated.id),
              notInArray(sqliteSchema.watersheds.id, wsIds)
            )
          )
          .run();
      }

      for (const ws of recalculated.watersheds) {
        orm
          .insert(sqliteSchema.watersheds)
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
            coordinates: JSON.stringify(ws.coordinates || []),
            calculatedTc: ws.calculatedTc ? JSON.stringify(ws.calculatedTc) : null,
            calculatedFlows: ws.calculatedFlows ? JSON.stringify(ws.calculatedFlows) : null
          })
          .onConflictDoUpdate({
            target: sqliteSchema.watersheds.id,
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
              coordinates: JSON.stringify(ws.coordinates || []),
              calculatedTc: ws.calculatedTc ? JSON.stringify(ws.calculatedTc) : null,
              calculatedFlows: ws.calculatedFlows ? JSON.stringify(ws.calculatedFlows) : null
            }
          })
          .run();
      }

      const stIds = recalculated.structures.map((s) => s.id);
      if (stIds.length === 0) {
        orm
          .delete(sqliteSchema.hydraulicStructures)
          .where(eq(sqliteSchema.hydraulicStructures.projectId, recalculated.id))
          .run();
      } else {
        orm
          .delete(sqliteSchema.hydraulicStructures)
          .where(
            and(
              eq(sqliteSchema.hydraulicStructures.projectId, recalculated.id),
              notInArray(sqliteSchema.hydraulicStructures.id, stIds)
            )
          )
          .run();
      }

      for (const st of recalculated.structures) {
        orm
          .insert(sqliteSchema.hydraulicStructures)
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
            diameterM: st.diameterM ?? null,
            widthM: st.widthM ?? null,
            heightM: st.heightM ?? null,
            sideSlopeM: st.sideSlopeM ?? null,
            cellsCount: st.cellsCount || 1,
            lengthM: st.lengthM,
            bedSlopeMPerM: st.bedSlopeMPerM,
            designFlowM3s: st.designFlowM3s,
            checkFlowM3s: st.checkFlowM3s,
            position: JSON.stringify(st.position),
            results: st.results ? JSON.stringify(st.results) : null
          })
          .onConflictDoUpdate({
            target: sqliteSchema.hydraulicStructures.id,
            set: {
              projectId: recalculated.id,
              watershedId: st.watershedId,
              code: st.code,
              pkMeters: st.pkMeters,
              name: st.name,
              type: st.type,
              material: st.material,
              stricklerK: st.stricklerK,
              diameterM: st.diameterM ?? null,
              widthM: st.widthM ?? null,
              heightM: st.heightM ?? null,
              sideSlopeM: st.sideSlopeM ?? null,
              cellsCount: st.cellsCount || 1,
              lengthM: st.lengthM,
              bedSlopeMPerM: st.bedSlopeMPerM,
              designFlowM3s: st.designFlowM3s,
              checkFlowM3s: st.checkFlowM3s,
              position: JSON.stringify(st.position),
              results: st.results ? JSON.stringify(st.results) : null
            }
          })
          .run();
      }
    });

    return {
      ...recalculated,
      updatedAt: nowIso
    };
  }

  public async deleteProject(projectId: string): Promise<boolean> {
    await this.init();
    return this.runInTransaction((orm) => {
      const existing = orm
        .select({ id: sqliteSchema.projects.id })
        .from(sqliteSchema.projects)
        .where(eq(sqliteSchema.projects.id, projectId))
        .get();
      if (!existing) return false;
      orm.delete(sqliteSchema.projects).where(eq(sqliteSchema.projects.id, projectId)).run();
      return true;
    });
  }

  public async seedInitialProjectIfEmpty(): Promise<Project> {
    await this.init();
    const { orm } = this.ensureReady();
    const existing = orm.select({ id: sqliteSchema.projects.id }).from(sqliteSchema.projects).all();

    if (existing.length === 0) {
      const saved = await this.saveOrUpdateFullProject(DEFAULT_REAL_PROJECT);

      // Amorçage initial des stations de référence & workflow en base locale
      this.runInTransaction((txOrm) => {
        const existingStations = txOrm.select().from(sqliteSchema.stations).all();
        if (existingStations.length === 0) {
          txOrm
            .insert(sqliteSchema.stations)
            .values([
              {
                id: 'sta-toulouse-rn1',
                code: 'ST-HYDRO-01',
                name: 'Station Pluviométrique Secteur RN1 Nord',
                type: 'PLUVIOMETRIC',
                coordinates: JSON.stringify({ lat: 43.625, lng: 1.485 }),
                elevationM: 148,
                active: true
              }
            ])
            .run();
        }

        const existingWorkflow = txOrm
          .select()
          .from(sqliteSchema.workflow)
          .where(eq(sqliteSchema.workflow.projectId, saved.id))
          .all();
        if (existingWorkflow.length === 0) {
          txOrm
            .insert(sqliteSchema.workflow)
            .values({
              id: `wf-${saved.id}-init`,
              projectId: saved.id,
              stepName: 'INITIALISATION_MODELE_HYDRAULIQUE',
              status: 'APPROVED',
              validationNotes: 'Base SQLite locale initialisée avec le dossier RN1.'
            })
            .run();
        }
      });

      return saved;
    }

    const full = await this.getProjectById(existing[0].id);
    if (!full) {
      throw new Error(`Incohérence SQLite : projet "${existing[0].id}" introuvable.`);
    }
    return full;
  }

  public async getReportsByProjectId(projectId: string): Promise<ReportRecord[]> {
    await this.init();
    const { orm } = this.ensureReady();
    const rows = orm
      .select()
      .from(sqliteSchema.reports)
      .where(eq(sqliteSchema.reports.projectId, projectId))
      .all();

    return rows.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      code: r.code,
      title: r.title,
      type: r.type,
      status: r.status,
      content: parseJsonSafe<Record<string, unknown>>(r.content, `report.${r.id}`) || {},
      createdAt: new Date(r.createdAt)
    }));
  }

  public async saveReport(reportData: SaveReportInput): Promise<ReportRecord> {
    await this.init();
    const nowIso = new Date().toISOString();
    const status = reportData.status || 'DRAFT';
    const type = reportData.type || 'HYDRAULIC_CALCULATION_NOTE';

    this.runInTransaction((orm) => {
      orm
        .insert(sqliteSchema.reports)
        .values({
          id: reportData.id,
          projectId: reportData.projectId,
          code: reportData.code,
          title: reportData.title,
          type,
          status,
          content: JSON.stringify(reportData.content),
          createdAt: nowIso
        })
        .onConflictDoUpdate({
          target: sqliteSchema.reports.id,
          set: {
            title: reportData.title,
            status,
            content: JSON.stringify(reportData.content)
          }
        })
        .run();
    });

    return {
      id: reportData.id,
      projectId: reportData.projectId,
      code: reportData.code,
      title: reportData.title,
      type,
      status,
      content: reportData.content,
      createdAt: new Date(nowIso)
    };
  }

  public async getWorkflowByProjectId(projectId: string): Promise<WorkflowRecord[]> {
    await this.init();
    const { orm } = this.ensureReady();
    const rows = orm
      .select()
      .from(sqliteSchema.workflow)
      .where(eq(sqliteSchema.workflow.projectId, projectId))
      .all();

    return rows.map((w) => ({
      id: w.id,
      projectId: w.projectId,
      stepName: w.stepName,
      status: w.status,
      validationNotes: w.validationNotes,
      updatedAt: new Date(w.updatedAt)
    }));
  }

  public async getAllStations(): Promise<StationRecord[]> {
    await this.init();
    const { orm } = this.ensureReady();
    const rows = orm.select().from(sqliteSchema.stations).all();

    return rows.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      type: s.type,
      coordinates: parseJsonSafe<{ lat: number; lng: number }>(
        s.coordinates,
        `station.${s.id}`
      ) || { lat: 0, lng: 0 },
      elevationM: s.elevationM,
      active: Boolean(s.active),
      createdAt: new Date(s.createdAt)
    }));
  }

  public async getSeriesByStationId(stationId: string): Promise<Array<Record<string, unknown>>> {
    await this.init();
    const { orm } = this.ensureReady();
    const rows = orm
      .select()
      .from(sqliteSchema.hydroSeries)
      .where(eq(sqliteSchema.hydroSeries.stationId, stationId))
      .all();

    return rows.map((r) => ({ ...r }));
  }
}
