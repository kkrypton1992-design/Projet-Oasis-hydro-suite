/**
 * Démarre OASIS HYDRO SUITE en mode local autonome (SQLite embarqué, zéro configuration SQL)
 * de manière 100% portable sur Windows, macOS et Linux.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const env = {
  ...process.env,
  APP_MODE: 'local',
  DB_PROVIDER: 'sqlite'
};

// Supprime d'éventuelles variables SQL héritées du shell en mode local strict
delete env.SQL_HOST;
delete env.SQL_USER;
delete env.SQL_PASSWORD;
delete env.SQL_DB_NAME;

const tsxCli = path.join(rootDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const child = spawn(process.execPath, [tsxCli, path.join(rootDir, 'server.ts')], {
  cwd: rootDir,
  env,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
