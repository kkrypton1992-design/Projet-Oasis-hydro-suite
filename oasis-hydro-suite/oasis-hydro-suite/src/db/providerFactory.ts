/**
 * OASIS HYDRO SUITE — Fabrique & Sélection Automatique du DatabaseProvider
 * - Par défaut (mode local / desktop sans configuration) : SQLite local embarqué
 * - Optionnel (mode remote / DB_PROVIDER=postgres / env SQL_* complet) : PostgreSQL
 */

import { AppConfig, loadConfig } from '../config/env.ts';
import { PostgresDatabaseProvider } from './postgres/postgresProvider.ts';
import { DatabaseProvider } from './provider.ts';
import { SqliteDatabaseProvider } from './sqlite/sqliteProvider.ts';

export function createDatabaseProvider(config: AppConfig = loadConfig()): DatabaseProvider {
  if (config.db.dialect === 'postgres') {
    return new PostgresDatabaseProvider(config.db);
  }
  return new SqliteDatabaseProvider(config.db.sqlitePath);
}
