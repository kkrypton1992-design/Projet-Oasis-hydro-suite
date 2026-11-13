import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDatabasePool, setDatabaseProvider } from '../../src/db';
import { SqliteDatabaseProvider } from '../../src/db/sqlite/sqliteProvider';
import { createApiApp } from '../../src/server/app';
import { Project } from '../../src/types/oasis';

let tempDir: string | null = null;
let dbFilePath = '';

beforeEach(async () => {
  delete process.env.ENFORCE_RBAC;
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oasis-api-sqlite-'));
  dbFilePath = path.join(tempDir, 'oasis-hydro.sqlite');

  const provider = new SqliteDatabaseProvider(dbFilePath);
  await provider.init();
  await provider.seedInitialProjectIfEmpty();
  setDatabaseProvider(provider);
});

afterEach(async () => {
  await closeDatabasePool();
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  tempDir = null;
});

describe('API REST intégrée avec SQLite local réel', () => {
  it('expose /api/ready avec dialect="sqlite", liste les projets et persiste les recalculs via PUT/GET', async () => {
    const app = createApiApp();

    const readyRes = await request(app).get('/api/ready');
    expect(readyRes.status).toBe(200);
    expect(readyRes.body.status).toBe('ready');
    expect(readyRes.body.dialect).toBe('sqlite');
    expect(readyRes.body.database).toBe('SQLite Local Embarqué');
    expect(readyRes.body.schemaVersion).toBe(1);
    expect(readyRes.body.storageLocation).toBe(dbFilePath);

    const activeRes = await request(app).get('/api/projects/active');
    expect(activeRes.status).toBe(200);
    const project = activeRes.body as Project;
    expect(project.watersheds.length).toBeGreaterThan(0);

    // Modification d'un paramètre hydrologique via API
    const updatedPayload: Project = {
      ...project,
      title: 'Étude Autonome SQLite Validée',
      watersheds: project.watersheds.map((w, idx) =>
        idx === 0 ? { ...w, runoffCoefficient: 0.78 } : w
      )
    };

    const putRes = await request(app)
      .put(`/api/projects/${project.id}`)
      .set('x-user-role', 'CHIEF_ENGINEER')
      .send(updatedPayload);
    expect(putRes.status).toBe(200);
    expect(putRes.body.title).toBe('Étude Autonome SQLite Validée');
    expect(putRes.body.watersheds[0].runoffCoefficient).toBeCloseTo(0.78, 4);

    // Sauvegarde d'un rapport technique réel en base SQLite
    const repRes = await request(app)
      .post(`/api/projects/${project.id}/reports`)
      .set('x-user-role', 'CHIEF_ENGINEER')
      .send({
        code: 'NC-SQLITE-01',
        title: 'Note Certifiée SQLite',
        type: 'HYDRAULIC_CALCULATION_NOTE',
        status: 'VALIDATED',
        content: { source: 'sqlite-integration-test' }
      });
    expect(repRes.status).toBe(201);

    // Fermeture puis réouverture réelle depuis le fichier .sqlite sur disque
    await closeDatabasePool();
    const reopened = new SqliteDatabaseProvider(dbFilePath);
    await reopened.init();
    setDatabaseProvider(reopened);

    const freshApp = createApiApp();
    const fetchedRes = await request(freshApp).get(`/api/projects/${project.id}`);
    expect(fetchedRes.status).toBe(200);
    expect(fetchedRes.body.title).toBe('Étude Autonome SQLite Validée');
    expect(fetchedRes.body.watersheds[0].runoffCoefficient).toBeCloseTo(0.78, 4);

    const reportsRes = await request(freshApp).get(`/api/projects/${project.id}/reports`);
    expect(reportsRes.status).toBe(200);
    expect(reportsRes.body).toHaveLength(1);
    expect(reportsRes.body[0].code).toBe('NC-SQLITE-01');

    const workflowRes = await request(freshApp).get(`/api/projects/${project.id}/workflow`);
    expect(workflowRes.status).toBe(200);
    expect(workflowRes.body.length).toBeGreaterThanOrEqual(1);

    const stationsRes = await request(freshApp).get('/api/stations');
    expect(stationsRes.status).toBe(200);
    expect(stationsRes.body.length).toBeGreaterThanOrEqual(1);
  });
});
