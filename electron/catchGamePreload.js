const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('catchAPI', {
  recordStat: (type, payload) => ipcRenderer.send('record-stat', { type, payload }),
});
