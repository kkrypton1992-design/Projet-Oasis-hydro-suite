/**
 * OASIS HYDRO SUITE — Repository Projets, Bassins & Ouvrages
 * Délègue au DatabaseProvider actif (SQLite local par défaut ou PostgreSQL optionnel).
 */

import { Project } from '../../types/oasis.ts';
import { getDatabaseProvider } from '../index.ts';
import { ProjectSummaryRow } from '../provider.ts';

export async function getAllProjects(): Promise<ProjectSummaryRow[]> {
  const provider = await getDatabaseProvider();
  return provider.getAllProjects();
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const provider = await getDatabaseProvider();
  return provider.getProjectById(projectId);
}

export async function saveOrUpdateFullProject(project: Project): Promise<Project> {
  const provider = await getDatabaseProvider();
  return provider.saveOrUpdateFullProject(project);
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const provider = await getDatabaseProvider();
  return provider.deleteProject(projectId);
}

export async function seedInitialProjectIfEmpty(): Promise<Project> {
  const provider = await getDatabaseProvider();
  return provider.seedInitialProjectIfEmpty();
}
