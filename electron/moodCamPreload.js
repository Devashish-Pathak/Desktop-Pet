const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('moodcamAPI', {
  reportReaction: (reaction) => ipcRenderer.send('camera-mood-detected', reaction),
});
