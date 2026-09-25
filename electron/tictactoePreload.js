const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tttAPI', {
  // Ask the pet to walk over to an absolute screen point and "stamp" its
  // mark there. Register onStampComplete ONCE (not per-move) — it's a
  // persistent event subscription, not a one-shot callback.
  requestVisit: (x, y) => ipcRenderer.send('ttt-request-visit', { x, y }),
  onStampComplete: (callback) => ipcRenderer.on('ttt-stamp-complete', () => callback()),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (partial) => ipcRenderer.send('set-settings', partial),
  recordStat: (type, payload) => ipcRenderer.send('record-stat', { type, payload }),
});
