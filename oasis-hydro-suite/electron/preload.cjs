/**
 * OASIS HYDRO SUITE — Electron Preload Bridge (CommonJS)
 * Exposition sécurisée de l'API bureau vers le renderer React via contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('oasisDesktop', {
  isDesktop: true,
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
  onMenuAction: (callback) => {
    const handler = (_event, action) => callback(action);
    ipcRenderer.on('menu-action', handler);
    return () => ipcRenderer.removeListener('menu-action', handler);
  },
  onSwitchTab: (callback) => {
    const handler = (_event, tab) => callback(tab);
    ipcRenderer.on('switch-tab', handler);
    return () => ipcRenderer.removeListener('switch-tab', handler);
  },
  onLoadProject: (callback) => {
    const handler = (_event, content) => callback(content);
    ipcRenderer.on('load-project-content', handler);
    return () => ipcRenderer.removeListener('load-project-content', handler);
  }
});
