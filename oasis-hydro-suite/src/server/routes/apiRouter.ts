/**
 * OASIS HYDRO SUITE — Routeur REST API Officiel
 * Regroupe les endpoints métiers validés, sécurisés par RBAC et observabilité.
 */

import { NextFunction, Request, Response, Router } from 'express';
import { loadConfig } from '../../config/env.ts';
import { checkDatabaseReadiness } from '../../db/index.ts';
import { getAllProjects, getProjectById } from '../../db/repositories/projectRepository.ts';
import {
  getReportsByProjectId,
  getWorkflowByProjectId,
  saveReport
} from '../../db/repositories/reportRepository.ts';
import { getAllStations } from '../../db/repositories/stationRepository.ts';
import { ProjectService } from '../../services/projectService.ts';
import {
  HydraulicStructureSchema,
  ProjectSchema,
  ProjectSettingsSchema,
  ReportCreateSchema,
  WatershedSchema
} from '../../shared/validation/schemas.ts';
import { UserRole } from '../../types/oasis.ts';
import { NotFoundError } from '../errors.ts';
import { requireRoles } from '../middleware/authRole.ts';
import { validateBody } from '../middleware/validate.ts';

const ENGINEERING_WRITE_ROLES: UserRole[] = ['ADMIN', 'CHIEF_ENGINEER', 'HYDRAULIC_CALCULATOR'];
const SETTINGS_WRITE_ROLES: UserRole[] = ['ADMIN', 'CHIEF_ENGINEER', 'AUDITOR'];

export interface ApiDependencies {
  checkDatabaseReadiness: typeof checkDatabaseReadiness;
  getActiveProject: typeof ProjectService.getActiveProject;
  saveProject: typeof ProjectService.saveProject;
  updateProjectSettings: typeof ProjectService.updateProjectSettings;
  upsertStructure: typeof ProjectService.upsertStructure;
  upsertWatershed: typeof ProjectService.upsertWatershed;
  deleteStructure: typeof ProjectService.deleteStructure;
  deleteWatershed: typeof ProjectService.deleteWatershed;
  getAllProjects: typeof getAllProjects;
  getProjectById: typeof getProjectById;
  getReportsByProjectId: typeof getReportsByProjectId;
  saveReport: typeof saveReport;
  getWorkflowByProjectId: typeof getWorkflowByProjectId;
  getAllStations: typeof getAllStations;
}

const defaultDeps: ApiDependencies = {
  checkDatabaseReadiness,
  getActiveProject: (id?: string) => ProjectService.getActiveProject(id),
  saveProject: (proj) => ProjectService.saveProject(proj),
  updateProjectSettings: (id, settings) => ProjectService.updateProjectSettings(id, settings),
  upsertStructure: (id, st) => ProjectService.upsertStructure(id, st),
  upsertWatershed: (id, ws) => ProjectService.upsertWatershed(id, ws),
  deleteStructure: (id, stId) => ProjectService.deleteStructure(id, stId),
  deleteWatershed: (id, wsId) => ProjectService.deleteWatershed(id, wsId),
  getAllProjects,
  getProjectById,
  getReportsByProjectId,
  saveReport,
  getWorkflowByProjectId,
  getAllStations
};

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function createApiRouter(customDeps: Partial<ApiDependencies> = {}): Router {
  const deps: ApiDependencies = { ...defaultDeps, ...customDeps };
  const router = Router();

  // 1. Liveness Probe
  router.get('/health', (_req: Request, res: Response) => {
    const cfg = loadConfig({ requireDbCredentials: false });
    res.status(200).json({
      status: 'ok',
      service: 'oasis-hydro-suite-api',
      version: cfg.version,
      mode: cfg.mode,
      env: cfg.env,
      dialect: cfg.db.dialect,
      timestamp: new Date().toISOString()
    });
  });

  // 2. Readiness Probe (vérification réelle du DatabaseProvider actif : SQLite ou PostgreSQL)
  router.get(
    '/ready',
    asyncHandler(async (_req: Request, res: Response) => {
      const dbStatus = await deps.checkDatabaseReadiness();
      const label =
        dbStatus.dialect === 'sqlite' ? 'SQLite Local Embarqué' : 'PostgreSQL / PostGIS';

      if (!dbStatus.connected) {
        res.status(503).json({
          status: 'unavailable',
          dialect: dbStatus.dialect,
          database: label,
          storageLocation: dbStatus.storageLocation,
          connected: false,
          latencyMs: dbStatus.latencyMs,
          error: dbStatus.error || 'Connexion base indisponible',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        status: 'ready',
        dialect: dbStatus.dialect,
        database: label,
        storageLocation: dbStatus.storageLocation,
        schemaVersion: dbStatus.schemaVersion,
        connected: true,
        latencyMs: dbStatus.latencyMs,
        timestamp: new Date().toISOString()
      });
    })
  );

  // 3. Projet actif
  router.get(
    '/projects/active',
    asyncHandler(async (_req: Request, res: Response) => {
      const project = await deps.getActiveProject();
      res.status(200).json(project);
    })
  );

  // 4. Liste des projets
  router.get(
    '/projects',
    asyncHandler(async (_req: Request, res: Response) => {
      const list = await deps.getAllProjects();
      res.status(200).json(list);
    })
  );

  // 5. Détail d'un projet par ID
  router.get(
    '/projects/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const project = await deps.getProjectById(req.params.id);
      if (!project) {
        throw new NotFoundError(`Projet "${req.params.id}" introuvable.`);
      }
      res.status(200).json(project);
    })
  );

  // 6. Sauvegarde complète d'un projet (validée & protégée RBAC)
  router.put(
    '/projects/:id',
    requireRoles(ENGINEERING_WRITE_ROLES),
    validateBody(ProjectSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const saved = await deps.saveProject({
        ...req.body,
        id: req.params.id
      });
      res.status(200).json(saved);
    })
  );

  // 7. Mise à jour des paramètres normatifs
  router.put(
    '/projects/:id/settings',
    requireRoles(SETTINGS_WRITE_ROLES),
    validateBody(ProjectSettingsSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const updated = await deps.updateProjectSettings(req.params.id, req.body);
      res.status(200).json(updated);
    })
  );

  // 8. Mise à jour / création d'un ouvrage hydraulique
  router.put(
    '/projects/:id/structures/:stId',
    requireRoles(ENGINEERING_WRITE_ROLES),
    validateBody(HydraulicStructureSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const updated = await deps.upsertStructure(req.params.id, {
        ...req.body,
        id: req.params.stId
      });
      res.status(200).json(updated);
    })
  );

  // 9. Mise à jour / création d'un bassin versant
  router.put(
    '/projects/:id/watersheds/:wsId',
    requireRoles(ENGINEERING_WRITE_ROLES),
    validateBody(WatershedSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const updated = await deps.upsertWatershed(req.params.id, {
        ...req.body,
        id: req.params.wsId
      });
      res.status(200).json(updated);
    })
  );

  // 10. Suppression d'un ouvrage hydraulique
  router.delete(
    '/projects/:id/structures/:stId',
    requireRoles(ENGINEERING_WRITE_ROLES),
    asyncHandler(async (req: Request, res: Response) => {
      const updated = await deps.deleteStructure(req.params.id, req.params.stId);
      res.status(200).json(updated);
    })
  );

  // 11. Suppression d'un bassin versant
  router.delete(
    '/projects/:id/watersheds/:wsId',
    requireRoles(ENGINEERING_WRITE_ROLES),
    asyncHandler(async (req: Request, res: Response) => {
      const updated = await deps.deleteWatershed(req.params.id, req.params.wsId);
      res.status(200).json(updated);
    })
  );

  // 12. Rapports techniques
  router.get(
    '/projects/:id/reports',
    asyncHandler(async (req: Request, res: Response) => {
      const projectReports = await deps.getReportsByProjectId(req.params.id);
      res.status(200).json(projectReports);
    })
  );

  router.post(
    '/projects/:id/reports',
    requireRoles([...ENGINEERING_WRITE_ROLES, 'AUDITOR']),
    validateBody(ReportCreateSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const reportId = req.body.id || `rep-${Date.now()}`;
      const saved = await deps.saveReport({
        ...req.body,
        id: reportId,
        projectId: req.params.id
      });
      res.status(201).json(saved);
    })
  );

  // 13. Workflow & Audit Trail
  router.get(
    '/projects/:id/workflow',
    asyncHandler(async (req: Request, res: Response) => {
      const wf = await deps.getWorkflowByProjectId(req.params.id);
      res.status(200).json(wf);
    })
  );

  // 14. Stations pluviométriques
  router.get(
    '/stations',
    asyncHandler(async (_req: Request, res: Response) => {
      const stationList = await deps.getAllStations();
      res.status(200).json(stationList);
    })
  );

  // 15. Route API inconnue -> 404 JSON propre
  router.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Endpoint API introuvable : ${req.method} ${req.originalUrl}`));
  });

  return router;
}
