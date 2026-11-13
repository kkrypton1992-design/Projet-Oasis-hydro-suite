/**
 * Compile le backend desktop (Express + SQLite embarqué + moteurs métier)
 * dans electron/dist/desktop-backend.cjs et copie les ressources runtime nécessaires
 * (sql-wasm.wasm et config/default.json) pour un packaging Electron autonome.
 */

import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'electron', 'dist');

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  await build({
    entryPoints: [path.join(rootDir, 'src', 'electron', 'desktopBackend.ts')],
    outfile: path.join(outDir, 'desktop-backend.cjs'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    sourcemap: false,
    external: ['electron', 'pg-native'],
    logLevel: 'info'
  });

  const wasmSrc = path.join(rootDir, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  if (!fs.existsSync(wasmSrc)) {
    throw new Error(`Fichier WASM SQLite introuvable : ${wasmSrc}`);
  }
  fs.copyFileSync(wasmSrc, path.join(outDir, 'sql-wasm.wasm'));

  const defaultCfgSrc = path.join(rootDir, 'config', 'default.json');
  if (fs.existsSync(defaultCfgSrc)) {
    fs.copyFileSync(defaultCfgSrc, path.join(outDir, 'default.json'));
  }

  console.log('[build-electron-backend] Backend desktop compilé dans electron/dist/');
}

main().catch((err) => {
  console.error('[build-electron-backend] Échec:', err);
  process.exit(1);
});
