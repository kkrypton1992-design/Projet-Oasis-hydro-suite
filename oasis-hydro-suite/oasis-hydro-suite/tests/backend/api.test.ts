import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { DEFAULT_REAL_PROJECT } from '../../src/data/referenceProject';
import { recalculateEntireProject } from '../../src/core/projectEngine';
import { createApiApp } from '../../src/server/app';
import { ApiDependencies } from '../../src/server/routes/apiRouter';
import { Project } from '../../src/types/oasis';

interface StoredReportRecord {
  id: string;
  projectId: string;
  code: string;
  title: string;
  type: string;
  status: string;
  content: Record<string, unknown>;
  createdAt: Date;
}

function makeDeps() {
  const initial = recalculateEntireProject(DEFAULT_REAL_PROJECT);
  const projects = new Map<string, Project>([[initial.id, initial]]);
  const reports: StoredReportRecord[] = [];
  let dbReady = true;

  const deps: Partial<ApiDependencies> = {
    checkDatabaseReadiness: vi.fn(async () =>
      dbReady
        ? {
            connected: true,
            dialect: 'sqlite' as const,
            storageLocation: ':memory:',
            latencyMs: 2
          }
        : {
            connected: false,
            dialect: 'sqlite' as const,
            storageLocation: ':memory:',
            latencyMs: 12,
            error: 'Connection refused'
          }
    ),
    getAllProjects: vi.fn(async () =>
      Array.from(projects.values()).map((p) => ({
        id: p.id,
        code: p.code,
        title: p.title,
        client: p.client,
        updatedAt: new Date(p.updatedAt)
      }))
    ),
    getProjectById: vi.fn(async (id: string) => projects.get(id) ?? null),
    getActiveProject: vi.fn(async (id?: string) => (id ? projects.get(id) : initial) ?? initial),
    saveProject: vi.fn(async (p: Project) => {
      const recalculated = recalculateEntireProject(p);
      projects.set(recalculated.id, recalculated);
      return recalculated;
    }),
    getAllStations: vi.fn(async () => []),
    getReportsByProjectId: vi.fn(async (projectId: string) =>
      reports.filter((r) => r.projectId === projectId)
    ),
    saveReport: vi.fn((async (r: {
      id: string;
      projectId: string;
      code: string;
      title: string;
      type?: string;
      status?: string;
      content: Record<string, unknown>;
    }) => {
      const created: StoredReportRecord = {
        id: r.id,
        projectId: r.projectId,
        code: r.code,
        title: r.title,
        type: r.type || 'HYDRAULIC_CALCULATION_NOTE',
        status: r.status || 'DRAFT',
        content: r.content,
        createdAt: new Date()
      };
      reports.push(created);
      return created;
    }) as unknown as ApiDependencies['saveReport']),
    getWorkflowByProjectId: vi.fn(async () => [])
  };

  return {
    initial,
    deps,
    setDbReady: (val: boolean) => {
      dbReady = val;
    }
  };
}

describe('Backend REST API integration', () => {
  beforeEach(() => {
    delete process.env.ENFORCE_RBAC;
  });

  it('responds 200 on /api/health and checks real DB readiness on /api/ready', async () => {
    const { deps, setDbReady } = makeDeps();
    const app = createApiApp(deps);

    const health = await request(app).get('/api/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');
    expect(health.headers['x-request-id']).toBeDefined();

    const readyOk = await request(app).get('/api/ready');
    expect(readyOk.status).toBe(200);
    expect(readyOk.body.status).toBe('ready');
    expect(readyOk.body.connected).toBe(true);

    setDbReady(false);
    const readyDown = await request(app).get('/api/ready');
    expect(readyDown.status).toBe(503);
    expect(readyDown.body.status).toBe('unavailable');
    expect(readyDown.body.connected).toBe(false);
  });

  it('lists and fetches projects and returns 404 JSON on unknown project or unknown API route', async () => {
    const { initial, deps } = makeDeps();
    const app = createApiApp(deps);

    const listRes = await request(app).get('/api/projects');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    const oneRes = await request(app).get(`/api/projects/${initial.id}`);
    expect(oneRes.status).toBe(200);
    expect(oneRes.body.id).toBe(initial.id);

    const notFound = await request(app).get('/api/projects/unknown-id');
    expect(notFound.status).toBe(404);
    expect(notFound.body.error.code).toBe('NOT_FOUND');

    const unknownRoute = await request(app).get('/api/does-not-exist');
    expect(unknownRoute.status).toBe(404);
    expect(unknownRoute.body.error.code).toBe('NOT_FOUND');
  });

  it('enforces Zod validation (400) and malformed JSON handling (400)', async () => {
    const { initial, deps } = makeDeps();
    const app = createApiApp(deps);

    const invalidPayload = await request(app)
      .put(`/api/projects/${initial.id}`)
      .set('x-user-role', 'CHIEF_ENGINEER')
      .send({ id: '', title: '' });
    expect(invalidPayload.status).toBe(400);
    expect(invalidPayload.body.error.code).toBe('VALIDATION_ERROR');

    const badJson = await request(app)
      .put(`/api/projects/${initial.id}`)
      .set('x-user-role', 'CHIEF_ENGINEER')
      .set('Content-Type', 'application/json')
      .send('{"brokenJson": ');
    expect(badJson.status).toBe(400);
    expect(badJson.body.error.code).toBe('MALFORMED_JSON');
  });

  it('enforces RBAC permissions on write routes and rejects CLIENT_VIEWER with 403', async () => {
    const { initial, deps } = makeDeps();
    const app = createApiApp(deps);

    const viewerRes = await request(app)
      .put(`/api/projects/${initial.id}`)
      .set('x-user-role', 'CLIENT_VIEWER')
      .send(initial);
    expect(viewerRes.status).toBe(403);
    expect(viewerRes.body.error.code).toBe('FORBIDDEN');

    process.env.ENFORCE_RBAC = 'true';
    const noHeaderRes = await request(app).put(`/api/projects/${initial.id}`).send(initial);
    expect(noHeaderRes.status).toBe(401);
    expect(noHeaderRes.body.error.code).toBe('UNAUTHORIZED');

    const engineerRes = await request(app)
      .put(`/api/projects/${initial.id}`)
      .set('x-user-role', 'CHIEF_ENGINEER')
      .send(initial);
    expect(engineerRes.status).toBe(200);
    expect(engineerRes.body.id).toBe(initial.id);
  });

  it('creates technical reports with status 201 and validates payload', async () => {
    const { initial, deps } = makeDeps();
    const app = createApiApp(deps);

    const badReport = await request(app)
      .post(`/api/projects/${initial.id}/reports`)
      .set('x-user-role', 'CHIEF_ENGINEER')
      .send({ title: '' });
    expect(badReport.status).toBe(400);

    const created = await request(app)
      .post(`/api/projects/${initial.id}/reports`)
      .set('x-user-role', 'CHIEF_ENGINEER')
      .send({
        code: 'NC-RN1-01',
        title: 'Note de calcul RN1',
        type: 'HYDRAULIC_CALCULATION_NOTE',
        status: 'DRAFT',
        content: { summary: 'Synthèse certifiée', complianceRatePct: 100 }
      });
    expect(created.status).toBe(201);
    expect(created.body.id).toBeDefined();
    expect(created.body.projectId).toBe(initial.id);
  });
});
