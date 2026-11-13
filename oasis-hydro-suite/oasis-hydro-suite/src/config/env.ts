/**
 * OASIS HYDRO SUITE — Configuration & Validation d'Environnement
 * Modes supportés : local | dev | prod | remote
 * Par défaut : mode local embarqué SQLite sans aucun secret ni base externe requise.
 */

import fs from 'fs';
import path from 'path';

export type AppMode = 'local' | 'dev' | 'prod' | 'remote';
export type AppEnvironment = 'development' | 'test' | 'production';
export type DatabaseDialect = 'sqlite' | 'postgres';
export type DatabaseProviderPreference = 'auto' | DatabaseDialect;

interface DefaultConfigFile {
  appName?: string;
  version?: string;
  mode?: AppMode;
  port?: number;
  enforceRbac?: boolean;
  database?: {
    provider?: DatabaseProviderPreference;
    sqlite?: {
      filePath?: string;
    };
    postgres?: {
      port?: number;
      maxConnections?: number;
      connectionTimeoutMs?: number;
    };
  };
}

export interface AppConfig {
  appName: string;
  version: string;
  mode: AppMode;
  env: AppEnvironment;
  port: number;
  enforceRbac: boolean;
  db: {
    providerPreference: DatabaseProviderPreference;
    dialect: DatabaseDialect;
    sqlitePath: string;
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
    maxConnections: number;
    connectionTimeoutMs: number;
  };
}

function readDefaultConfigFile(): DefaultConfigFile {
  const candidates = [
    process.env.OASIS_DEFAULT_CONFIG_PATH,
    path.resolve(process.cwd(), 'config', 'default.json')
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const raw = fs.readFileSync(candidate, 'utf-8');
      return JSON.parse(raw) as DefaultConfigFile;
    }
  }
  return {};
}

function parseNodeEnv(raw?: string): AppEnvironment {
  if (raw === 'production' || raw === 'test' || raw === 'development') {
    return raw;
  }
  return 'development';
}

function parseAppMode(
  rawMode: string | undefined,
  nodeEnv: AppEnvironment,
  fallback: AppMode
): AppMode {
  if (rawMode === 'local' || rawMode === 'dev' || rawMode === 'prod' || rawMode === 'remote') {
    return rawMode;
  }
  if (rawMode && rawMode.trim() !== '') {
    throw new Error(
      `APP_MODE invalide "${rawMode}". Valeurs autorisées : local, dev, prod, remote.`
    );
  }
  if (nodeEnv === 'production') return 'prod';
  if (nodeEnv === 'development' && process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    return 'dev';
  }
  return fallback;
}

function parseProviderPreference(
  raw: string | undefined,
  fallback: DatabaseProviderPreference
): DatabaseProviderPreference {
  if (!raw || raw.trim() === '') return fallback;
  if (raw === 'auto' || raw === 'sqlite' || raw === 'postgres') return raw;
  throw new Error(`DB_PROVIDER invalide "${raw}". Valeurs autorisées : auto, sqlite, postgres.`);
}

function parsePositiveInt(raw: string | undefined, fallback: number, name: string): number {
  if (!raw || raw.trim() === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Variable d'environnement invalide ${name}="${raw}" (entier positif attendu).`);
  }
  return parsed;
}

export function loadConfig(options: { requireDbCredentials?: boolean } = {}): AppConfig {
  const fileDefaults = readDefaultConfigFile();
  const env = parseNodeEnv(process.env.NODE_ENV);
  const mode = parseAppMode(process.env.APP_MODE, env, fileDefaults.mode || 'local');

  const providerPreference = parseProviderPreference(
    process.env.DB_PROVIDER,
    fileDefaults.database?.provider || 'auto'
  );

  const host = process.env.SQL_HOST?.trim() || '';
  const user = process.env.SQL_USER?.trim() || '';
  const password = process.env.SQL_PASSWORD ?? '';
  const database = process.env.SQL_DB_NAME?.trim() || '';
  const hasPostgresCredentials = Boolean(host && user && password !== '' && database);

  let dialect: DatabaseDialect;
  if (providerPreference === 'sqlite' || mode === 'local') {
    dialect = 'sqlite';
  } else if (providerPreference === 'postgres' || mode === 'remote') {
    dialect = 'postgres';
  } else {
    // Sélection automatique : PostgreSQL si configuré en dev/prod, sinon SQLite local embarqué
    dialect = env !== 'test' && hasPostgresCredentials ? 'postgres' : 'sqlite';
  }

  const requirePgCreds = options.requireDbCredentials ?? (dialect === 'postgres' && env !== 'test');
  if (dialect === 'postgres' && requirePgCreds) {
    const missing: string[] = [];
    if (!host) missing.push('SQL_HOST');
    if (!user) missing.push('SQL_USER');
    if (!password) missing.push('SQL_PASSWORD');
    if (!database) missing.push('SQL_DB_NAME');
    if (missing.length > 0) {
      throw new Error(
        `Configuration PostgreSQL incomplète en mode "${mode}" (DB_PROVIDER=${providerPreference}). Variables manquantes : ${missing.join(', ')}`
      );
    }
  }

  const defaultSqliteFile = fileDefaults.database?.sqlite?.filePath || './data/oasis-hydro.sqlite';
  const sqlitePath =
    process.env.SQLITE_DB_PATH?.trim() ||
    (process.env.OASIS_DATA_DIR?.trim()
      ? path.join(process.env.OASIS_DATA_DIR.trim(), 'oasis-hydro.sqlite')
      : path.resolve(process.cwd(), defaultSqliteFile));

  return {
    appName: fileDefaults.appName || 'OASIS HYDRO SUITE',
    version: fileDefaults.version || '1.2.0',
    mode,
    env,
    port: parsePositiveInt(process.env.PORT, fileDefaults.port || 3000, 'PORT'),
    enforceRbac: process.env.ENFORCE_RBAC === 'true' || Boolean(fileDefaults.enforceRbac),
    db: {
      providerPreference,
      dialect,
      sqlitePath,
      host: host || '127.0.0.1',
      user: user || 'postgres',
      password,
      database: database || 'oasis_hydro',
      port: parsePositiveInt(
        process.env.SQL_PORT,
        fileDefaults.database?.postgres?.port || 5432,
        'SQL_PORT'
      ),
      maxConnections: parsePositiveInt(
        process.env.SQL_POOL_MAX,
        fileDefaults.database?.postgres?.maxConnections || 10,
        'SQL_POOL_MAX'
      ),
      connectionTimeoutMs: parsePositiveInt(
        process.env.SQL_TIMEOUT_MS,
        fileDefaults.database?.postgres?.connectionTimeoutMs || 15000,
        'SQL_TIMEOUT_MS'
      )
    }
  };
}
