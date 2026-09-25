const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('memoryAPI', {
  recordStat: (type, payload) => ipcRenderer.send('record-stat', { type, payload }),
});
