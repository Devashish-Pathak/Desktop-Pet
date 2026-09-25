const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('worldTimeAPI', {
  get: () => ipcRenderer.invoke('get-settings'),
  set: (partial) => ipcRenderer.send('set-settings', partial),
});
