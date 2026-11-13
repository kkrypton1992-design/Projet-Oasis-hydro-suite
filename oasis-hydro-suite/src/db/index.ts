/**
 * OASIS HYDRO SUITE — Point d'Entrée Persistance
 * Initialise et expose le DatabaseProvider actif (SQLite local par défaut ou PostgreSQL optionnel).
 */

import { loadConfig } from '../config/env.ts';
import { DatabaseProvider, DatabaseReadiness } from './provider.ts';
import { createDatabaseProvider } from './providerFactory.ts';

declare global {
  var _oasisDbProvider: DatabaseProvider | undefined;
}

export async function getDatabaseProvider(): Promise<DatabaseProvider> {
  if (!global._oasisDbProvider) {
    const config = loadConfig();
    const provider = createDatabaseProvider(config);
    await provider.init();
    global._oasisDbProvider = provider;
  }
  return global._oasisDbProvider;
}

export async function setDatabaseProvider(provider: DatabaseProvider): Promise<void> {
  if (global._oasisDbProvider && global._oasisDbProvider !== provider) {
    await global._oasisDbProvider.close();
  }
  await provider.init();
  global._oasisDbProvider = provider;
}

export async function checkDatabaseReadiness(): Promise<DatabaseReadiness> {
  try {
    const provider = await getDatabaseProvider();
    return await provider.checkReadiness();
  } catch (err) {
    const config = loadConfig({ requireDbCredentials: false });
    return {
      connected: false,
      dialect: config.db.dialect,
      storageLocation:
        config.db.dialect === 'sqlite'
          ? config.db.sqlitePath
          : `${config.db.host}:${config.db.port}/${config.db.database}`,
      latencyMs: 0,
      error: err instanceof Error ? err.message : 'Échec initialisation base de données'
    };
  }
}

export async function closeDatabasePool(): Promise<void> {
  if (global._oasisDbProvider) {
    await global._oasisDbProvider.close();
    global._oasisDbProvider = undefined;
  }
}
