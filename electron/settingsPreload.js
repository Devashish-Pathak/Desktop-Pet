const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('settingsAPI', {
  get: () => ipcRenderer.invoke('get-settings'),
  set: (partial) => ipcRenderer.send('set-settings', partial),
  close: () => ipcRenderer.send('close-settings'),
  playFetch: () => ipcRenderer.send('request-fetch'),
  playTicTacToe: () => ipcRenderer.send('request-tictactoe'),
  openTypingTrainer: () => ipcRenderer.send('request-typingtrainer'),
  resetStats: () => ipcRenderer.send('reset-stats'),
  openMemoryGame: () => ipcRenderer.send('request-memorygame'),
  openCatchGame: () => ipcRenderer.send('request-catchgame'),
  openWorldTime: () => ipcRenderer.send('request-worldtime'),
  onSettingsChanged: (callback) =>
    ipcRenderer.on('settings-updated', (_event, settings) => callback(settings)),
  onPetMoodUpdate: (callback) => ipcRenderer.on('pet-mood-update', (_event, mood) => callback(mood)),
});
