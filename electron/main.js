const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { buildPetMenuTemplate } = require('./petMenu');
const settingsStore = require('./settingsStore');

// 1x1 red pixel PNG, used as a placeholder tray icon until a real one is added.
const PLACEHOLDER_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

let win;
let tray;
let settingsWin;
let tttWin;
let typingWin;
let memoryWin;
let catchWin;
let moodCamWin;
let worldTimeWin;

function createWindow() {
  const { x, y, width, height } = screen.getPrimaryDisplay().bounds;

  win = new BrowserWindow({
    x,
    y,
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    hasShadow: false,
    fullscreenable: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  win.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log(`[renderer] ${message} (${sourceId}:${line})`);
  });

  // Whole window is click-through by default; the renderer tells us
  // (via IPC) when the cursor is actually over the pet.
  win.setIgnoreMouseEvents(true, { forward: true });

  win.on('closed', () => {
    win = null;
  });
}

function openSettingsWindow() {
  if (settingsWin) {
    settingsWin.focus();
    return;
  }

  settingsWin = new BrowserWindow({
    width: 460,
    height: 840,
    minWidth: 380,
    minHeight: 420,
    resizable: true,
    minimizable: false,
    maximizable: true,
    show: false,
    title: 'Desktop Pet Settings',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'settingsPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile(path.join(__dirname, '..', 'src', 'settings', 'index.html'));

  // Windows without this sit visibly blank until some input event forces a
  // repaint (e.g. a click) — waiting for the first real frame before
  // showing avoids that entirely, rather than showing at creation time.
  settingsWin.once('ready-to-show', () => settingsWin.show());

  settingsWin.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log(`[settings-renderer] ${message} (${sourceId}:${line})`);
  });

  settingsWin.on('closed', () => {
    settingsWin = null;
  });
}

function triggerFetch() {
  if (win) win.webContents.send('trigger-fetch');
}

function openTicTacToeWindow() {
  if (tttWin) {
    tttWin.focus();
    return;
  }

  tttWin = new BrowserWindow({
    width: 340,
    height: 460,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false,
    title: 'Tic Tac Toe',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'tictactoePreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  tttWin.setMenuBarVisibility(false);
  tttWin.loadFile(path.join(__dirname, '..', 'src', 'tictactoe', 'index.html'));

  tttWin.once('ready-to-show', () => tttWin.show());

  tttWin.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log(`[ttt-renderer] ${message} (${sourceId}:${line})`);
  });

  tttWin.on('closed', () => {
    tttWin = null;
  });
}

function openTypingTrainerWindow() {
  if (typingWin) {
    typingWin.focus();
    return;
  }

  typingWin = new BrowserWindow({
    width: 720,
    height: 460,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false,
    title: 'Typing Trainer',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'typingTrainerPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  typingWin.setMenuBarVisibility(false);
  typingWin.loadFile(path.join(__dirname, '..', 'src', 'typingtrainer', 'index.html'));

  typingWin.once('ready-to-show', () => typingWin.show());

  typingWin.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log(`[typing-renderer] ${message} (${sourceId}:${line})`);
  });

  typingWin.on('closed', () => {
    typingWin = null;
  });
}

function openMemoryGameWindow() {
  if (memoryWin) {
    memoryWin.focus();
    return;
  }

  memoryWin = new BrowserWindow({
    width: 480,
    height: 560,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false,
    title: 'Memory Match',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'memoryGamePreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  memoryWin.setMenuBarVisibility(false);
  memoryWin.loadFile(path.join(__dirname, '..', 'src', 'memorygame', 'index.html'));

  memoryWin.once('ready-to-show', () => memoryWin.show());

  memoryWin.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log(`[memory-renderer] ${message} (${sourceId}:${line})`);
  });

  memoryWin.on('closed', () => {
    memoryWin = null;
  });
}

function openCatchGameWindow() {
  if (catchWin) {
    catchWin.focus();
    return;
  }

  catchWin = new BrowserWindow({
    width: 520,
    height: 470,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false,
    title: 'Catch the Treats',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'catchGamePreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  catchWin.setMenuBarVisibility(false);
  catchWin.loadFile(path.join(__dirname, '..', 'src', 'catchgame', 'index.html'));

  catchWin.once('ready-to-show', () => catchWin.show());

  catchWin.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log(`[catch-renderer] ${message} (${sourceId}:${line})`);
  });

  catchWin.on('closed', () => {
    catchWin = null;
  });
}

function openWorldTimeWindow() {
  if (worldTimeWin) {
    worldTimeWin.focus();
    return;
  }

  worldTimeWin = new BrowserWindow({
    width: 640,
    height: 620,
    minWidth: 360,
    minHeight: 400,
    resizable: true,
    minimizable: false,
    maximizable: true,
    show: false,
    title: 'World Time',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'worldTimePreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  worldTimeWin.setMenuBarVisibility(false);
  worldTimeWin.loadFile(path.join(__dirname, '..', 'src', 'worldtime', 'index.html'));

  worldTimeWin.once('ready-to-show', () => worldTimeWin.show());

  worldTimeWin.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log(`[worldtime-renderer] ${message} (${sourceId}:${line})`);
  });

  worldTimeWin.on('closed', () => {
    worldTimeWin = null;
  });
}

// Opt-in only (cameraMoodEnabled defaults to false). This window is never
// shown — no video preview, nothing rendered — it only exists to run
// face-api.js against brief periodic camera captures. It's created/destroyed
// entirely based on the setting, so the camera is never touched at all
// unless the user has explicitly turned this on in Settings.
function createMoodCamWindow() {
  if (moodCamWin) return;

  moodCamWin = new BrowserWindow({
    width: 1,
    height: 1,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'moodCamPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  moodCamWin.loadFile(path.join(__dirname, '..', 'src', 'moodcam', 'index.html'));

  moodCamWin.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log(`[moodcam-renderer] ${message} (${sourceId}:${line})`);
  });

  moodCamWin.on('closed', () => {
    moodCamWin = null;
  });
}

function destroyMoodCamWindow() {
  if (moodCamWin) {
    moodCamWin.close();
    moodCamWin = null;
  }
}

function applyCameraMoodSetting(enabled) {
  if (enabled) createMoodCamWindow();
  else destroyMoodCamWindow();
}

function createTray() {
  const icon = nativeImage.createFromDataURL(PLACEHOLDER_ICON);
  tray = new Tray(icon);
  tray.setToolTip(settingsStore.get().petName);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show / Hide',
        click: () => {
          if (!win) return;
          win.isVisible() ? win.hide() : win.show();
        },
      },
      { label: 'Play Fetch', click: () => triggerFetch() },
      { label: 'Play Tic Tac Toe', click: () => openTicTacToeWindow() },
      { label: 'Typing Trainer', click: () => openTypingTrainerWindow() },
      { label: 'Memory Match', click: () => openMemoryGameWindow() },
      { label: 'Catch the Treats', click: () => openCatchGameWindow() },
      { label: 'World Time', click: () => openWorldTimeWindow() },
      { label: 'Settings…', click: () => openSettingsWindow() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ])
  );
}

// A packaged build's own exe already knows what to launch, so the default
// (no path/args) is correct there. Running from source, electron.exe is
// generic — without telling Windows which app directory to load, enabling
// this would just open a blank Electron window at login. So point it at
// electron.exe + this app's directory explicitly, same as the Desktop
// shortcut does.
function applyLaunchAtStartup(enabled) {
  if (app.isPackaged) {
    app.setLoginItemSettings({ openAtLogin: enabled });
  } else {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: process.execPath,
      args: [app.getAppPath()],
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  applyLaunchAtStartup(settingsStore.get().launchAtStartup);
  applyCameraMoodSetting(settingsStore.get().cameraMoodEnabled);
});

ipcMain.on('set-ignore-mouse-events', (_event, ignore, options) => {
  if (!win) return;
  win.setIgnoreMouseEvents(ignore, options);
});

ipcMain.on('quit-app', () => app.quit());

ipcMain.on('show-pet-context-menu', () => {
  if (!win) return;
  const menu = Menu.buildFromTemplate(
    buildPetMenuTemplate({
      app,
      petName: settingsStore.get().petName,
      openSettings: openSettingsWindow,
      triggerFetch,
      openTicTacToe: openTicTacToeWindow,
      openTypingTrainer: openTypingTrainerWindow,
      openMemoryGame: openMemoryGameWindow,
      openCatchGame: openCatchGameWindow,
      openWorldTime: openWorldTimeWindow,
    })
  );
  menu.popup({ window: win });
});

ipcMain.on('save-pet-x', (_event, x) => {
  if (typeof x === 'number' && Number.isFinite(x)) settingsStore.set({ lastX: x });
});

ipcMain.handle('get-settings', () => settingsStore.get());

function broadcastSettings(updated) {
  if (win) win.webContents.send('settings-updated', updated);
  if (settingsWin) settingsWin.webContents.send('settings-updated', updated);
}

ipcMain.on('set-settings', (_event, partial) => {
  const updated = settingsStore.set(partial);
  if ('launchAtStartup' in partial) applyLaunchAtStartup(updated.launchAtStartup);
  if ('cameraMoodEnabled' in partial) applyCameraMoodSetting(updated.cameraMoodEnabled);
  if (tray && 'petName' in partial) tray.setToolTip(updated.petName);
  broadcastSettings(updated);
});

ipcMain.on('camera-mood-detected', (_event, reaction) => {
  if (win) win.webContents.send('camera-mood-event', reaction);
});

ipcMain.on('pet-mood-update', (_event, mood) => {
  if (settingsWin) settingsWin.webContents.send('pet-mood-update', mood);
});

ipcMain.on('record-stat', (_event, { type, payload }) => {
  broadcastSettings(settingsStore.recordStat(type, payload));
  // Only Tic Tac Toe results are forwarded as an emotional reaction — the
  // pet is genuinely a participant there (it plays O). The other games are
  // player-skill games it isn't competing in.
  if (type === 'tttResult' && win) win.webContents.send('mood-event', { type, payload });
});

ipcMain.on('reset-stats', () => {
  broadcastSettings(settingsStore.resetStats());
});

ipcMain.on('close-settings', () => {
  if (settingsWin) settingsWin.close();
});

ipcMain.on('open-settings', () => openSettingsWindow());

ipcMain.on('request-fetch', () => triggerFetch());

ipcMain.on('request-tictactoe', () => openTicTacToeWindow());

ipcMain.on('request-typingtrainer', () => openTypingTrainerWindow());

ipcMain.on('request-memorygame', () => openMemoryGameWindow());

ipcMain.on('request-catchgame', () => openCatchGameWindow());

ipcMain.on('request-worldtime', () => openWorldTimeWindow());

// Tic Tac Toe cross-window choreography: the TTT window computes a cell's
// absolute screen position and asks the pet to walk there; once the pet
// arrives and "stamps" it, the pet window reports back so the TTT window can
// actually place the mark.
ipcMain.on('ttt-request-visit', (_event, point) => {
  if (win) win.webContents.send('ttt-go-to', point);
});

ipcMain.on('ttt-stamped', () => {
  if (tttWin) tttWin.webContents.send('ttt-stamp-complete');
});

app.on('window-all-closed', () => {
  app.quit();
});
