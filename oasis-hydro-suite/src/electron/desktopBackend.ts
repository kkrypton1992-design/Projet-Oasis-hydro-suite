/**
 * OASIS HYDRO SUITE — Serveur Embarqué pour Application Desktop Electron
 * Exécute l'API REST Express + SQLite local directement dans le processus bureau,
 * sans serveur externe, sans PostgreSQL ni configuration manuelle.
 */

import express, { Request, Response } from 'express';
import fs from 'fs';
import { AddressInfo } from 'net';
import path from 'path';
import { closeDatabasePool, getDatabaseProvider } from '../db/index.ts';
import { createApiApp } from '../server/app.ts';
import { logger } from '../server/logger.ts';
import { errorHandlerMiddleware } from '../server/middleware/errorHandler.ts';

export interface EmbeddedDesktopBackendOptions {
  dataDir: string;
  distDir: string;
  wasmPath: string;
  defaultConfigPath?: string;
}

export interface EmbeddedDesktopBackendHandle {
  url: string;
  port: number;
  sqlitePath: string;
  close: () => Promise<void>;
}

export async function startEmbeddedDesktopBackend(
  options: EmbeddedDesktopBackendOptions
): Promise<EmbeddedDesktopBackendHandle> {
  const sqlitePath = path.join(options.dataDir, 'oasis-hydro.sqlite');

  // Force explicitement le mode autonome local SQLite pour le binaire Desktop
  process.env.APP_MODE = 'local';
  process.env.DB_PROVIDER = 'sqlite';
  process.env.SQLITE_DB_PATH = sqlitePath;
  process.env.OASIS_DATA_DIR = options.dataDir;
  process.env.OASIS_SQL_WASM_PATH = options.wasmPath;
  if (options.defaultConfigPath) {
    process.env.OASIS_DEFAULT_CONFIG_PATH = options.defaultConfigPath;
  }

  fs.mkdirSync(options.dataDir, { recursive: true });

  const provider = await getDatabaseProvider();
  await provider.seedInitialProjectIfEmpty();

  const app = createApiApp();

  if (!fs.existsSync(path.join(options.distDir, 'index.html'))) {
    throw new Error(
      `Interface frontend introuvable dans "${options.distDir}". Exécutez "npm run build:electron".`
    );
  }

  app.use(express.static(options.distDir));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(options.distDir, 'index.html'));
  });
  app.use(errorHandlerMiddleware);

  const server = await new Promise<ReturnType<typeof app.listen>>((resolve, reject) => {
    const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
    srv.on('error', reject);
  });

  const addr = server.address() as AddressInfo;
  const port = addr.port;
  const url = `http://127.0.0.1:${port}`;

  logger.info('Backend desktop SQLite embarqué démarré', {
    url,
    sqlitePath
  });

  return {
    url,
    port,
    sqlitePath,
    close: async () => {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
      await closeDatabasePool();
    }
  };
}
