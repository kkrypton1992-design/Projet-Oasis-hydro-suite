/**
 * OASIS HYDRO SUITE — Migrations Versionnées SQLite Locale
 * Garantit la création automatique du schéma au premier lancement et les évolutions futures
 * de manière transactionnelle et idempotente.
 */

import type { Database as SqlJsDatabase } from 'sql.js';

export interface SqliteMigration {
  version: number;
  name: string;
  statements: string[];
}

export const SQLITE_MIGRATIONS: SqliteMigration[] = [
  {
    version: 1,
    name: '001_initial_oasis_schema',
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        display_name TEXT,
        role TEXT NOT NULL DEFAULT 'ENGINEER',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        client TEXT NOT NULL,
        engineer TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
        version TEXT NOT NULL DEFAULT '1.2.0',
        settings TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS studies (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        study_id TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS watersheds (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        area_km2 REAL NOT NULL,
        length_km REAL NOT NULL,
        delta_h REAL NOT NULL,
        slope_percent REAL NOT NULL,
        runoff_coefficient REAL NOT NULL,
        soil_type TEXT NOT NULL DEFAULT '',
        vegetation TEXT NOT NULL DEFAULT '',
        color TEXT NOT NULL DEFAULT '#0284c7',
        coordinates TEXT NOT NULL,
        calculated_tc TEXT,
        calculated_flows TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS hydraulic_structures (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        watershed_id TEXT NOT NULL,
        code TEXT NOT NULL,
        pk_meters INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        material TEXT NOT NULL,
        strickler_k REAL NOT NULL,
        diameter_m REAL,
        width_m REAL,
        height_m REAL,
        side_slope_m REAL,
        cells_count INTEGER NOT NULL DEFAULT 1,
        length_m REAL NOT NULL,
        bed_slope_m_per_m REAL NOT NULL,
        design_flow_m3s REAL NOT NULL,
        check_flow_m3s REAL NOT NULL,
        position TEXT NOT NULL,
        results TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS stations (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        coordinates TEXT NOT NULL,
        elevation_m REAL NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS hydro_series (
        id TEXT PRIMARY KEY,
        station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
        return_period_years INTEGER NOT NULL,
        intensity_mm_h REAL NOT NULL,
        rainfall_mm REAL NOT NULL,
        montana_a REAL,
        montana_b REAL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'HYDRAULIC_CALCULATION_NOTE',
        status TEXT NOT NULL DEFAULT 'DRAFT',
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS workflow (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        step_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        validation_notes TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_watersheds_project ON watersheds(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_structures_project ON hydraulic_structures(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reports_project ON reports(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_workflow_project ON workflow(project_id)`
    ]
  }
];

export function applySqliteMigrations(sqliteDb: SqlJsDatabase): number {
  sqliteDb.run('PRAGMA foreign_keys = ON;');
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const appliedRes = sqliteDb.exec('SELECT version FROM _schema_migrations ORDER BY version ASC');
  const appliedSet = new Set<number>();
  if (appliedRes[0]) {
    for (const row of appliedRes[0].values) {
      appliedSet.add(Number(row[0]));
    }
  }

  let latestVersion = appliedSet.size > 0 ? Math.max(...appliedSet) : 0;

  for (const migration of SQLITE_MIGRATIONS) {
    if (appliedSet.has(migration.version)) {
      continue;
    }

    sqliteDb.run('BEGIN TRANSACTION');
    try {
      for (const stmt of migration.statements) {
        sqliteDb.run(stmt);
      }
      sqliteDb.run('INSERT INTO _schema_migrations (version, name) VALUES (?, ?)', [
        migration.version,
        migration.name
      ]);
      sqliteDb.run('COMMIT');
      latestVersion = migration.version;
    } catch (err) {
      try {
        sqliteDb.run('ROLLBACK');
      } catch {
        // Ignore rollback failure
      }
      throw new Error(
        `Échec de migration SQLite v${migration.version} (${migration.name}) : ${
          err instanceof Error ? err.message : String(err)
        }`,
        { cause: err }
      );
    }
  }

  return latestVersion;
}
