/**
 * OASIS HYDRO SUITE — Service Métier Backend (Service Layer)
 * Orchestration des calculs physiques, validation d'existence et persistance en base.
 */

import { recalculateEntireProject } from '../core/projectEngine.ts';
import {
  getProjectById,
  saveOrUpdateFullProject,
  seedInitialProjectIfEmpty
} from '../db/repositories/projectRepository.ts';
import { NotFoundError } from '../server/errors.ts';
import { HydraulicStructure, Project, ProjectSettings, Watershed } from '../types/oasis.ts';

export class ProjectService {
  /**
   * Récupère le projet actif (ou l'initialise si la base est neuve).
   * Si un projectId explicite est fourni et n'existe pas, lève une NotFoundError.
   */
  static async getActiveProject(projectId?: string): Promise<Project> {
    if (projectId) {
      const found = await getProjectById(projectId);
      if (!found) {
        throw new NotFoundError(`Projet "${projectId}" introuvable.`);
      }
      return found;
    }
    return await seedInitialProjectIfEmpty();
  }

  /**
   * Sauvegarde complète d'un projet avec recalcul systématique.
   */
  static async saveProject(project: Project): Promise<Project> {
    const fullyRecalculated = recalculateEntireProject(project);
    return await saveOrUpdateFullProject(fullyRecalculated);
  }

  /**
   * Met à jour les réglages normatifs d'un projet existant et recalcule.
   */
  static async updateProjectSettings(
    projectId: string,
    settings: ProjectSettings
  ): Promise<Project> {
    const proj = await this.getActiveProject(projectId);
    return await this.saveProject({
      ...proj,
      settings
    });
  }

  /**
   * Ajoute ou met à jour un bassin versant sur un projet existant.
   */
  static async upsertWatershed(projectId: string, watershed: Watershed): Promise<Project> {
    const proj = await this.getActiveProject(projectId);
    const exists = proj.watersheds.some((w) => w.id === watershed.id);
    const updatedWatersheds = exists
      ? proj.watersheds.map((w) => (w.id === watershed.id ? watershed : w))
      : [...proj.watersheds, watershed];

    return await this.saveProject({
      ...proj,
      watersheds: updatedWatersheds
    });
  }

  /**
   * Met à jour ou ajoute la géométrie/paramètres d'un ouvrage hydraulique.
   */
  static async upsertStructure(projectId: string, structure: HydraulicStructure): Promise<Project> {
    const proj = await this.getActiveProject(projectId);
    const exists = proj.structures.some((s) => s.id === structure.id);
    const updatedStructures = exists
      ? proj.structures.map((s) => (s.id === structure.id ? structure : s))
      : [...proj.structures, structure];

    return await this.saveProject({
      ...proj,
      structures: updatedStructures
    });
  }

  /**
   * Supprime un ouvrage hydraulique d'un projet existant.
   */
  static async deleteStructure(projectId: string, structureId: string): Promise<Project> {
    const proj = await this.getActiveProject(projectId);
    const exists = proj.structures.some((s) => s.id === structureId);
    if (!exists) {
      throw new NotFoundError(
        `Ouvrage "${structureId}" introuvable dans le projet "${projectId}".`
      );
    }
    const updatedStructures = proj.structures.filter((s) => s.id !== structureId);
    return await this.saveProject({
      ...proj,
      structures: updatedStructures
    });
  }

  /**
   * Supprime un bassin versant d'un projet existant.
   */
  static async deleteWatershed(projectId: string, watershedId: string): Promise<Project> {
    const proj = await this.getActiveProject(projectId);
    const exists = proj.watersheds.some((w) => w.id === watershedId);
    if (!exists) {
      throw new NotFoundError(
        `Bassin versant "${watershedId}" introuvable dans le projet "${projectId}".`
      );
    }
    const updatedWatersheds = proj.watersheds.filter((w) => w.id !== watershedId);
    return await this.saveProject({
      ...proj,
      watersheds: updatedWatersheds
    });
  }
}
