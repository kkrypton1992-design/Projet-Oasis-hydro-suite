/**
 * OASIS HYDRO SUITE — Client API Frontend
 * Interface REST typée sans fallback silencieux masquant les erreurs serveur/disque.
 */

import { recalculateEntireProject } from '../core/projectEngine';
import { HydraulicStructure, Project, ProjectSettings, UserRole } from '../types/oasis';

const API_BASE = '/api';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiReadinessResponse {
  status: 'ready' | 'unavailable';
  dialect: 'sqlite' | 'postgres';
  database: string;
  storageLocation: string;
  schemaVersion?: number;
  connected: boolean;
  latencyMs: number;
  error?: string;
}

export interface StoredReportItem {
  id: string;
  projectId: string;
  code: string;
  title: string;
  type: string;
  status: string;
  content: Record<string, unknown>;
  createdAt: string;
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string; details?: unknown } | string;
    };
    if (body && typeof body.error === 'object' && body.error !== null) {
      return new ApiError(
        body.error.message || `Erreur serveur HTTP ${res.status}`,
        res.status,
        body.error.code || 'API_ERROR',
        body.error.details
      );
    }
    if (body && typeof body.error === 'string') {
      return new ApiError(body.error, res.status);
    }
  } catch {
    // Réponse non-JSON
  }
  return new ApiError(`Erreur HTTP ${res.status} (${res.statusText})`, res.status);
}

function wrapNetworkError(err: unknown, actionLabel: string): ApiError {
  if (err instanceof ApiError) return err;
  const detail = err instanceof Error ? err.message : String(err);
  return new ApiError(
    `Service backend local ou base de données inaccessible (${actionLabel}) : ${detail}`,
    503,
    'BACKEND_UNAVAILABLE'
  );
}

export class ApiClient {
  private static currentRole: UserRole = 'CHIEF_ENGINEER';

  static setUserRole(role: UserRole): void {
    this.currentRole = role;
  }

  private static getHeaders(includeContentType = false): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'x-user-role': this.currentRole
    };
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  static async getReadiness(): Promise<ApiReadinessResponse> {
    try {
      const res = await fetch(`${API_BASE}/ready`, {
        headers: this.getHeaders(false)
      });
      const body = (await res.json()) as ApiReadinessResponse;
      return body;
    } catch (err) {
      throw wrapNetworkError(err, 'vérification base de données');
    }
  }

  static async getActiveProject(): Promise<Project> {
    try {
      const res = await fetch(`${API_BASE}/projects/active`, {
        headers: this.getHeaders(false)
      });
      if (!res.ok) {
        throw await parseErrorResponse(res);
      }
      return (await res.json()) as Project;
    } catch (err) {
      throw wrapNetworkError(err, 'chargement du projet actif');
    }
  }

  static async saveProject(project: Project): Promise<Project> {
    const recalculated = recalculateEntireProject(project);
    try {
      const res = await fetch(`${API_BASE}/projects/${recalculated.id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(recalculated)
      });
      if (!res.ok) {
        throw await parseErrorResponse(res);
      }
      return (await res.json()) as Project;
    } catch (err) {
      throw wrapNetworkError(err, 'enregistrement du projet');
    }
  }

  static async updateStructure(projectId: string, structure: HydraulicStructure): Promise<Project> {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/structures/${structure.id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(structure)
      });
      if (!res.ok) {
        throw await parseErrorResponse(res);
      }
      return (await res.json()) as Project;
    } catch (err) {
      throw wrapNetworkError(err, 'mise à jour de l’ouvrage');
    }
  }

  static async updateSettings(projectId: string, settings: ProjectSettings): Promise<Project> {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/settings`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(settings)
      });
      if (!res.ok) {
        throw await parseErrorResponse(res);
      }
      return (await res.json()) as Project;
    } catch (err) {
      throw wrapNetworkError(err, 'mise à jour des réglages');
    }
  }

  static async deleteStructure(projectId: string, structureId: string): Promise<Project> {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/structures/${structureId}`, {
        method: 'DELETE',
        headers: this.getHeaders(false)
      });
      if (!res.ok) {
        throw await parseErrorResponse(res);
      }
      return (await res.json()) as Project;
    } catch (err) {
      throw wrapNetworkError(err, 'suppression de l’ouvrage');
    }
  }

  static async deleteWatershed(projectId: string, watershedId: string): Promise<Project> {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/watersheds/${watershedId}`, {
        method: 'DELETE',
        headers: this.getHeaders(false)
      });
      if (!res.ok) {
        throw await parseErrorResponse(res);
      }
      return (await res.json()) as Project;
    } catch (err) {
      throw wrapNetworkError(err, 'suppression du bassin versant');
    }
  }

  static async getReports(projectId: string): Promise<StoredReportItem[]> {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports`, {
        headers: this.getHeaders(false)
      });
      if (!res.ok) {
        throw await parseErrorResponse(res);
      }
      return (await res.json()) as StoredReportItem[];
    } catch (err) {
      throw wrapNetworkError(err, 'lecture des rapports archivés');
    }
  }

  static async saveReport(
    projectId: string,
    report: {
      code: string;
      title: string;
      type?: string;
      status?: 'DRAFT' | 'VALIDATED' | 'ARCHIVED';
      content: Record<string, unknown>;
    }
  ): Promise<StoredReportItem> {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(report)
      });
      if (!res.ok) {
        throw await parseErrorResponse(res);
      }
      return (await res.json()) as StoredReportItem;
    } catch (err) {
      throw wrapNetworkError(err, 'archivage du rapport');
    }
  }
}
