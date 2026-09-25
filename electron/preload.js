const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  setIgnoreMouseEvents: (ignore, options) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore, options),
  quit: () => ipcRenderer.send('quit-app'),
  showContextMenu: () => ipcRenderer.send('show-pet-context-menu'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  onSettingsChanged: (callback) =>
    ipcRenderer.on('settings-updated', (_event, settings) => callback(settings)),
  onFetchTriggered: (callback) => ipcRenderer.on('trigger-fetch', () => callback()),
  savePetX: (x) => ipcRenderer.send('save-pet-x', x),
  onTttGoTo: (callback) => ipcRenderer.on('ttt-go-to', (_event, point) => callback(point)),
  notifyStamped: () => ipcRenderer.send('ttt-stamped'),
  recordStat: (type, payload) => ipcRenderer.send('record-stat', { type, payload }),
  onMoodEvent: (callback) => ipcRenderer.on('mood-event', (_event, payload) => callback(payload)),
  onCameraMoodEvent: (callback) => ipcRenderer.on('camera-mood-event', (_event, reaction) => callback(reaction)),
  reportMood: (mood) => ipcRenderer.send('pet-mood-update', mood),
});
