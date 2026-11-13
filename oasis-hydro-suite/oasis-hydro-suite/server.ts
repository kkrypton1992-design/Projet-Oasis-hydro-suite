/**
 * OASIS HYDRO SUITE — Point d'Entrée Serveur Full-Stack
 * Fonctionne sans configuration ni secrets en mode local (SQLite embarqué)
 * ou avec PostgreSQL optionnel (mode remote / dev / prod).
 */

import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { loadConfig } from './src/config/env.ts';
import { checkDatabaseReadiness, closeDatabasePool, getDatabaseProvider } from './src/db/index.ts';
import { createApiApp } from './src/server/app.ts';
import { logger } from './src/server/logger.ts';
import { errorHandlerMiddleware } from './src/server/middleware/errorHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer(): Promise<void> {
  const config = loadConfig();
  const app = createApiApp();

  // Initialisation explicite du DatabaseProvider (SQLite local auto-créé ou PostgreSQL)
  try {
    const provider = await getDatabaseProvider();
    await provider.seedInitialProjectIfEmpty();
  } catch (err) {
    logger.error('Échec d’initialisation de la base de données au démarrage', {
      dialect: config.db.dialect,
      error: err instanceof Error ? err.message : String(err)
    });
  }

  const dbCheck = await checkDatabaseReadiness();
  if (dbCheck.connected) {
    logger.info('Base de données prête', {
      dialect: dbCheck.dialect,
      storageLocation: dbCheck.storageLocation,
      schemaVersion: dbCheck.schemaVersion,
      latencyMs: dbCheck.latencyMs
    });
  } else {
    logger.warn('Base de données indisponible au démarrage (readiness=/api/ready en 503)', {
      dialect: dbCheck.dialect,
      error: dbCheck.error
    });
  }

  if (config.env !== 'production' && config.mode !== 'prod') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.use(errorHandlerMiddleware);

  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info('Serveur OASIS HYDRO SUITE démarré', {
      port: config.port,
      mode: config.mode,
      env: config.env,
      dialect: config.db.dialect,
      enforceRbac: config.enforceRbac
    });
  });

  const shutdown = async (signal: string) => {
    logger.info(`Arrêt gracieux reçu (${signal})...`);
    server.close(async () => {
      await closeDatabasePool();
      logger.info('Serveur HTTP et base de données fermés.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

startServer().catch((err) => {
  logger.error('Échec critique au démarrage du serveur', {
    error: err instanceof Error ? err.message : String(err)
  });
  process.exit(1);
});
