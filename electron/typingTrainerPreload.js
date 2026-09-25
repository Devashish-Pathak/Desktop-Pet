const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('typingAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (partial) => ipcRenderer.send('set-settings', partial),
  recordStat: (type, payload) => ipcRenderer.send('record-stat', { type, payload }),
});
