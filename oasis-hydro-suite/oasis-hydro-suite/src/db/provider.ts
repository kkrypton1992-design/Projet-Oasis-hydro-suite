/**
 * OASIS HYDRO SUITE — Abstraction de Persistance (DatabaseProvider)
 * Définit le contrat unique entre la couche métier/API et les moteurs de stockage :
 * - SqliteDatabaseProvider (par défaut : base locale embarquée sans configuration)
 * - PostgresDatabaseProvider (optionnel : PostgreSQL/PostGIS pour mode backend/prod/remote)
 */

import { DatabaseDialect } from '../config/env.ts';
import { Project } from '../types/oasis.ts';

export interface DatabaseReadiness {
  connected: boolean;
  dialect: DatabaseDialect;
  storageLocation: string;
  latencyMs: number;
  schemaVersion?: number;
  error?: string;
}

export interface ProjectSummaryRow {
  id: string;
  code: string;
  title: string;
  client: string;
  updatedAt: Date;
}

export interface ReportRecord {
  id: string;
  projectId: string;
  code: string;
  title: string;
  type: string;
  status: string;
  content: Record<string, unknown>;
  createdAt: Date;
}

export interface WorkflowRecord {
  id: string;
  projectId: string;
  stepName: string;
  status: string;
  validationNotes: string;
  updatedAt: Date;
}

export interface StationRecord {
  id: string;
  code: string;
  name: string;
  type: string;
  coordinates: { lat: number; lng: number };
  elevationM: number;
  active: boolean;
  createdAt: Date;
}

export interface SaveReportInput {
  id: string;
  projectId: string;
  code: string;
  title: string;
  type?: string;
  status?: string;
  content: Record<string, unknown>;
}

export interface DatabaseProvider {
  readonly dialect: DatabaseDialect;
  readonly storageLocation: string;

  init(): Promise<void>;
  checkReadiness(): Promise<DatabaseReadiness>;
  close(): Promise<void>;

  getAllProjects(): Promise<ProjectSummaryRow[]>;
  getProjectById(projectId: string): Promise<Project | null>;
  saveOrUpdateFullProject(project: Project): Promise<Project>;
  deleteProject(projectId: string): Promise<boolean>;
  seedInitialProjectIfEmpty(): Promise<Project>;

  getReportsByProjectId(projectId: string): Promise<ReportRecord[]>;
  saveReport(reportData: SaveReportInput): Promise<ReportRecord>;
  getWorkflowByProjectId(projectId: string): Promise<WorkflowRecord[]>;

  getAllStations(): Promise<StationRecord[]>;
  getSeriesByStationId(stationId: string): Promise<Array<Record<string, unknown>>>;
}
