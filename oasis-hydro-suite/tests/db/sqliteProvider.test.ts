import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../../src/config/env';
import { DEFAULT_REAL_PROJECT } from '../../src/data/referenceProject';
import { recalculateEntireProject } from '../../src/core/projectEngine';
import { PostgresDatabaseProvider } from '../../src/db/postgres/postgresProvider';
import { createDatabaseProvider } from '../../src/db/providerFactory';
import { SqliteDatabaseProvider } from '../../src/db/sqlite/sqliteProvider';

const tempDirs: string[] = [];

function createTempDbPath(filename = 'oasis-test.sqlite'): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oasis-sqlite-test-'));
  tempDirs.push(dir);
  return path.join(dir, 'nested', filename);
}

async function withEnv(
  vars: Record<string, string | undefined>,
  fn: () => void | Promise<void>
): Promise<void> {
  const backup: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    backup[key] = process.env[key];
    const nextVal = vars[key];
    if (nextVal === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = nextVal;
    }
  }
  try {
    await fn();
  } finally {
    for (const key of Object.keys(vars)) {
      if (backup[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = backup[key];
      }
    }
  }
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('Configuration & sélection automatique du DatabaseProvider', () => {
  it('sélectionne SQLite local par défaut sans aucun identifiant ni variable SQL_*', async () => {
    await withEnv(
      {
        NODE_ENV: 'development',
        APP_MODE: undefined,
        DB_PROVIDER: undefined,
        SQL_HOST: undefined,
        SQL_USER: undefined,
        SQL_PASSWORD: undefined,
        SQL_DB_NAME: undefined
      },
      () => {
        const cfg = loadConfig();
        expect(cfg.mode).toBe('local');
        expect(cfg.db.dialect).toBe('sqlite');
        const provider = createDatabaseProvider(cfg);
        expect(provider).toBeInstanceOf(SqliteDatabaseProvider);
      }
    );
  });

  it('force SQLite en mode APP_MODE=local même si des variables SQL_* sont présentes dans le shell', async () => {
    await withEnv(
      {
        NODE_ENV: 'production',
        APP_MODE: 'local',
        DB_PROVIDER: 'auto',
        SQL_HOST: '10.0.0.5',
        SQL_USER: 'pguser',
        SQL_PASSWORD: 'secret',
        SQL_DB_NAME: 'oasis'
      },
      () => {
        const cfg = loadConfig();
        expect(cfg.mode).toBe('local');
        expect(cfg.db.dialect).toBe('sqlite');
        expect(createDatabaseProvider(cfg)).toBeInstanceOf(SqliteDatabaseProvider);
      }
    );
  });

  it('sélectionne PostgresDatabaseProvider uniquement si configuré explicitement et complet', async () => {
    await withEnv(
      {
        NODE_ENV: 'production',
        APP_MODE: 'remote',
        DB_PROVIDER: 'postgres',
        SQL_HOST: '127.0.0.1',
        SQL_USER: 'oasis',
        SQL_PASSWORD: 'pw',
        SQL_DB_NAME: 'oasis_db'
      },
      () => {
        const cfg = loadConfig({ requireDbCredentials: true });
        expect(cfg.db.dialect).toBe('postgres');
        expect(createDatabaseProvider(cfg)).toBeInstanceOf(PostgresDatabaseProvider);
      }
    );
  });

  it('rejette explicitement APP_MODE=remote sans identifiants SQL_* (zéro fallback silencieux)', async () => {
    await withEnv(
      {
        NODE_ENV: 'production',
        APP_MODE: 'remote',
        DB_PROVIDER: 'auto',
        SQL_HOST: undefined,
        SQL_USER: undefined,
        SQL_PASSWORD: undefined,
        SQL_DB_NAME: undefined
      },
      () => {
        expect(() => loadConfig({ requireDbCredentials: true })).toThrow(
          /Configuration PostgreSQL incomplète/
        );
      }
    );
  });
});

describe('SqliteDatabaseProvider — Persistance locale embarquée & migrations', () => {
  it('crée automatiquement le fichier SQLite, applique la migration v1 et seed le projet initial', async () => {
    const dbPath = createTempDbPath();
    expect(fs.existsSync(dbPath)).toBe(false);

    const provider = new SqliteDatabaseProvider(dbPath);
    await provider.init();

    expect(fs.existsSync(dbPath)).toBe(true);
    expect(fs.statSync(dbPath).size).toBeGreaterThan(0);

    const readiness = await provider.checkReadiness();
    expect(readiness.connected).toBe(true);
    expect(readiness.dialect).toBe('sqlite');
    expect(readiness.schemaVersion).toBe(1);
    expect(readiness.storageLocation).toBe(dbPath);

    const seeded = await provider.seedInitialProjectIfEmpty();
    expect(seeded.id).toBe(DEFAULT_REAL_PROJECT.id);
    expect(seeded.watersheds.length).toBeGreaterThan(0);
    expect(seeded.structures.length).toBeGreaterThan(0);

    // Vérifie l'idempotence d'un second appel au seed
    const secondSeed = await provider.seedInitialProjectIfEmpty();
    expect(secondSeed.id).toBe(seeded.id);
    const list = await provider.getAllProjects();
    expect(list).toHaveLength(1);

    const stations = await provider.getAllStations();
    expect(stations.length).toBeGreaterThanOrEqual(1);
    const series = await provider.getSeriesByStationId(stations[0].id);
    expect(Array.isArray(series)).toBe(true);

    await provider.close();
  });

  it('persiste intégralement les modifications, suppressions orphelines, workflow et rapports après fermeture/réouverture', async () => {
    const dbPath = createTempDbPath();
    const provider1 = new SqliteDatabaseProvider(dbPath);
    await provider1.init();
    const seeded = await provider1.seedInitialProjectIfEmpty();

    // Modification d'un bassin + suppression d'un ouvrage pour vérifier le nettoyage transactionnel
    const edited = recalculateEntireProject({
      ...seeded,
      title: 'Aménagement Corridor Nord — Phase APD',
      watersheds: seeded.watersheds.map((w, idx) =>
        idx === 0 ? { ...w, runoffCoefficient: 0.72, areaKm2: w.areaKm2 * 1.25 } : w
      ),
      structures: seeded.structures.slice(0, 1)
    });

    const saved = await provider1.saveOrUpdateFullProject(edited);
    expect(saved.title).toBe('Aménagement Corridor Nord — Phase APD');
    expect(saved.structures).toHaveLength(1);

    const savedReport = await provider1.saveReport({
      id: 'rep-sql-001',
      projectId: saved.id,
      code: 'NC-APD-001',
      title: 'Note de Calcul Locale SQLite',
      type: 'HYDRAULIC_CALCULATION_NOTE',
      status: 'VALIDATED',
      content: { complianceRatePct: 100, author: 'Chef de Projet' }
    });
    expect(savedReport.id).toBe('rep-sql-001');

    await provider1.close();

    // Réouverture depuis le fichier disque avec une nouvelle instance
    const provider2 = new SqliteDatabaseProvider(dbPath);
    await provider2.init();

    const reloaded = await provider2.getProjectById(seeded.id);
    expect(reloaded).not.toBeNull();
    expect(reloaded?.title).toBe('Aménagement Corridor Nord — Phase APD');
    expect(reloaded?.watersheds[0].runoffCoefficient).toBeCloseTo(0.72, 4);
    expect(reloaded?.structures).toHaveLength(1);
    expect(reloaded?.structures[0].designFlowM3s).toBeCloseTo(
      edited.structures[0].designFlowM3s,
      4
    );

    const workflow = await provider2.getWorkflowByProjectId(seeded.id);
    expect(workflow.length).toBeGreaterThanOrEqual(1);
    expect(workflow[0].stepName).toBe('INITIALISATION_MODELE_HYDRAULIQUE');

    const reports = await provider2.getReportsByProjectId(seeded.id);
    expect(reports).toHaveLength(1);
    expect(reports[0].title).toBe('Note de Calcul Locale SQLite');
    expect(reports[0].content).toEqual({ complianceRatePct: 100, author: 'Chef de Projet' });

    const deleted = await provider2.deleteProject(seeded.id);
    expect(deleted).toBe(true);
    expect(await provider2.getProjectById(seeded.id)).toBeNull();

    await provider2.close();
  });

  it('lève une erreur explicite si le fichier SQLite existant est vide ou corrompu (zéro fallback silencieux)', async () => {
    const emptyPath = createTempDbPath('empty.sqlite');
    fs.mkdirSync(path.dirname(emptyPath), { recursive: true });
    fs.writeFileSync(emptyPath, Buffer.alloc(0));

    const emptyProvider = new SqliteDatabaseProvider(emptyPath);
    await expect(emptyProvider.init()).rejects.toThrow(/vide ou corrompu/);

    const corruptPath = createTempDbPath('corrupt.sqlite');
    fs.mkdirSync(path.dirname(corruptPath), { recursive: true });
    fs.writeFileSync(corruptPath, 'NOT_A_VALID_SQLITE_BINARY_FILE');
    const corruptProvider = new SqliteDatabaseProvider(corruptPath);
    await expect(corruptProvider.init()).rejects.toThrow(
      /Échec d'initialisation de la base SQLite/
    );
  });
});
