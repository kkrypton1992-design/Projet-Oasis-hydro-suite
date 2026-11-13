/**
 * OASIS HYDRO SUITE — Repository Rapports & Workflow
 * Délègue au DatabaseProvider actif (SQLite local ou PostgreSQL optionnel).
 */

import { getDatabaseProvider } from '../index.ts';
import { ReportRecord, SaveReportInput, WorkflowRecord } from '../provider.ts';

export async function getReportsByProjectId(projectId: string): Promise<ReportRecord[]> {
  const provider = await getDatabaseProvider();
  return provider.getReportsByProjectId(projectId);
}

export async function saveReport(reportData: SaveReportInput): Promise<ReportRecord> {
  const provider = await getDatabaseProvider();
  return provider.saveReport(reportData);
}

export async function getWorkflowByProjectId(projectId: string): Promise<WorkflowRecord[]> {
  const provider = await getDatabaseProvider();
  return provider.getWorkflowByProjectId(projectId);
}
