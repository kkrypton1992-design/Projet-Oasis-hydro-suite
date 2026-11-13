/**
 * OASIS HYDRO SUITE — Point d'entrée de l'application Desktop Electron (CommonJS)
 * Compatible avec "type": "module" dans package.json via l'extension .cjs.
 */

const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let desktopBackend = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function resolveIconPath() {
  const candidates =
    process.platform === 'win32'
      ? [
          path.join(__dirname, 'resources', 'icon.ico'),
          path.join(__dirname, 'resources', 'icon.png')
        ]
      : [
          path.join(__dirname, 'resources', 'icon.png'),
          path.join(__dirname, 'resources', 'icon.ico')
        ];

  return candidates.find((p) => fs.existsSync(p));
}

function resolveExistingPath(candidates) {
  return candidates.find((p) => Boolean(p) && fs.existsSync(p));
}

function resolveDataDir() {
  if (process.env.OASIS_DATA_DIR && process.env.OASIS_DATA_DIR.trim() !== '') {
    return path.resolve(process.env.OASIS_DATA_DIR.trim());
  }
  // En mode Portable Windows, stocke la base juste à côté de l'exécutable
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'data');
  }
  // En installation standard (NSIS / Linux / macOS), utilise le dossier utilisateur applicatif
  return path.join(app.getPath('userData'), 'data');
}

async function ensureEmbeddedBackendStarted() {
  if (desktopBackend) return desktopBackend;

  const backendBundlePath = path.join(__dirname, 'dist', 'desktop-backend.cjs');
  if (!fs.existsSync(backendBundlePath)) {
    throw new Error(
      `Le module backend desktop compilé est introuvable (${backendBundlePath}). Exécutez "npm run build:electron" avant de lancer l'application Desktop.`
    );
  }

  const distDir = path.join(__dirname, '..', 'dist');
  const wasmPath = resolveExistingPath([
    process.resourcesPath ? path.join(process.resourcesPath, 'sql-wasm.wasm') : '',
    path.join(__dirname, 'dist', 'sql-wasm.wasm'),
    path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
  ]);
  if (!wasmPath) {
    throw new Error(
      'Ressource SQLite WebAssembly introuvable (sql-wasm.wasm). Réinstallez l’application ou relancez "npm run build:electron".'
    );
  }

  const defaultConfigPath = resolveExistingPath([
    process.resourcesPath ? path.join(process.resourcesPath, 'default.json') : '',
    path.join(__dirname, 'dist', 'default.json'),
    path.join(__dirname, '..', 'config', 'default.json')
  ]);

  const dataDir = resolveDataDir();
  const { startEmbeddedDesktopBackend } = require(backendBundlePath);
  desktopBackend = await startEmbeddedDesktopBackend({
    dataDir,
    distDir,
    wasmPath,
    defaultConfigPath
  });

  return desktopBackend;
}

async function createWindow() {
  const iconPath = resolveIconPath();

  let targetUrl = process.env.VITE_DEV_SERVER_URL || '';
  if (!targetUrl) {
    try {
      const backend = await ensureEmbeddedBackendStarted();
      targetUrl = backend.url;
    } catch (err) {
      dialog.showErrorBox(
        'Erreur d’initialisation locale OASIS HYDRO SUITE',
        `Impossible de démarrer la base locale SQLite ou le moteur applicatif :\n\n${
          err instanceof Error ? err.message : String(err)
        }`
      );
      app.quit();
      return;
    }
  }

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'OASIS HYDRO SUITE — Ingénierie Hydrologique & Hydraulique',
    backgroundColor: '#0E4A7B',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: true
    },
    ...(iconPath ? { icon: iconPath } : {})
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.loadURL(targetUrl).catch((err) => {
    dialog.showErrorBox(
      'Erreur de chargement',
      `Impossible de charger l'interface locale (${targetUrl}) : ${err.message}`
    );
  });

  const appVersion = app.getVersion();

  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouveau Projet',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow && mainWindow.webContents.send('menu-action', 'new-project')
        },
        {
          label: 'Ouvrir un Projet (.oasis.json)...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (!mainWindow) return;
            const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
              title: 'Ouvrir un projet OASIS HYDRO SUITE',
              filters: [
                { name: 'Projet OASIS (*.oasis.json)', extensions: ['oasis.json', 'json'] }
              ],
              properties: ['openFile']
            });
            if (canceled || !filePaths || !filePaths[0]) return;

            try {
              const content = fs.readFileSync(filePaths[0], 'utf-8');
              JSON.parse(content);
              mainWindow.webContents.send('load-project-content', content);
            } catch (err) {
              dialog.showErrorBox(
                'Fichier projet invalide',
                `Impossible d'ouvrir le fichier sélectionné : ${err instanceof Error ? err.message : String(err)}`
              );
            }
          }
        },
        {
          label: 'Enregistrer le Projet',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow && mainWindow.webContents.send('menu-action', 'save-project')
        },
        { type: 'separator' },
        {
          label: 'Exporter la Note de Calculs (PDF)...',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow && mainWindow.webContents.send('menu-action', 'print-report')
        },
        {
          label: 'Exporter les Couches SIG (GeoJSON)...',
          click: () => mainWindow && mainWindow.webContents.send('menu-action', 'export-geojson')
        },
        { type: 'separator' },
        {
          label: 'Ouvrir le Dossier des Données Locales',
          click: () => {
            const dir = resolveDataDir();
            fs.mkdirSync(dir, { recursive: true });
            shell.openPath(dir);
          }
        },
        {
          label: 'Quitter',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Calculs & Modules',
      submenu: [
        {
          label: 'Tableau de bord',
          click: () => mainWindow && mainWindow.webContents.send('switch-tab', 'dashboard')
        },
        {
          label: 'Cartographie SIG',
          click: () => mainWindow && mainWindow.webContents.send('switch-tab', 'gis')
        },
        {
          label: 'Moteur Hydrologique (Kirpich, Montana, Débits)',
          click: () => mainWindow && mainWindow.webContents.send('switch-tab', 'hydrology')
        },
        {
          label: 'Moteur Hydraulique (Manning-Strickler)',
          click: () => mainWindow && mainWindow.webContents.send('switch-tab', 'hydraulics')
        },
        {
          label: 'Dimensionnement Automatique',
          click: () => mainWindow && mainWindow.webContents.send('switch-tab', 'dimensioning')
        },
        {
          label: 'Contrôle Qualité & Conformité',
          click: () => mainWindow && mainWindow.webContents.send('switch-tab', 'quality')
        },
        {
          label: 'Générateur de Rapports',
          click: () => mainWindow && mainWindow.webContents.send('switch-tab', 'reporting')
        },
        {
          label: 'Diagnostic & Conformité',
          click: () => mainWindow && mainWindow.webContents.send('switch-tab', 'ai')
        }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { role: 'forceReload', label: "Forcer l'actualisation" },
        ...(isDev ? [{ role: 'toggleDevTools', label: 'Outils de développement' }] : []),
        { type: 'separator' },
        { role: 'resetZoom', label: 'Taille normale' },
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
      ]
    },
    {
      label: 'Aide & Stockage',
      submenu: [
        {
          label: 'Emplacement de la Base Locale SQLite...',
          click: () => {
            if (!mainWindow) return;
            const sqlitePath = desktopBackend
              ? desktopBackend.sqlitePath
              : path.join(resolveDataDir(), 'oasis-hydro.sqlite');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Base de données locale autonome',
              message: 'Mode Desktop Autonome — SQLite Embarqué',
              detail: `Fichier de base locale :\n${sqlitePath}\n\nAucune base externe ni mot de passe SQL n'est requis.`
            });
          }
        },
        {
          label: 'Documentation Technique Officielle',
          click: () =>
            shell.openExternal('https://github.com/kkrypton1992-design/Projet-Oasis-hydro-suite')
        },
        { type: 'separator' },
        {
          label: "À propos d'OASIS HYDRO SUITE",
          click: () => {
            if (!mainWindow) return;
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: "À propos d'OASIS HYDRO SUITE",
              message: `OASIS HYDRO SUITE v${appVersion}\nSuite d'Ingénierie Hydrologique & Hydraulique`,
              detail:
                'Calculs basés sur Kirpich, Passini, Giandotti, Montana et Manning-Strickler.\nStockage local autonome SQLite embarqué.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('is-desktop-mode', () => true);
ipcMain.handle('get-storage-info', () => ({
  mode: 'local-sqlite',
  dataDir: resolveDataDir(),
  sqlitePath: desktopBackend
    ? desktopBackend.sqlitePath
    : path.join(resolveDataDir(), 'oasis-hydro.sqlite')
}));

app.whenReady().then(createWindow);

app.on('before-quit', async (event) => {
  if (desktopBackend && !isQuitting) {
    event.preventDefault();
    isQuitting = true;
    try {
      await desktopBackend.close();
    } catch (err) {
      console.error('[electron] Erreur lors de la fermeture du backend local:', err);
    } finally {
      desktopBackend = null;
      app.quit();
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
