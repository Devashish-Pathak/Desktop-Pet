// Right-click popup menu for the pet. Add new feature entries to this
// template as they're built — each app-level feature should end up as one
// item (or submenu) here.
function buildPetMenuTemplate({
  app,
  petName,
  openSettings,
  triggerFetch,
  openTicTacToe,
  openTypingTrainer,
  openMemoryGame,
  openCatchGame,
  openWorldTime,
}) {
  return [
    { label: petName || 'Desktop Pet', enabled: false },
    { type: 'separator' },
    { label: 'Play Fetch', click: () => triggerFetch() },
    { label: 'Play Tic Tac Toe', click: () => openTicTacToe() },
    { label: 'Typing Trainer', click: () => openTypingTrainer() },
    { label: 'Memory Match', click: () => openMemoryGame() },
    { label: 'Catch the Treats', click: () => openCatchGame() },
    { label: 'World Time', click: () => openWorldTime() },
    { label: 'Settings…', click: () => openSettings() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ];
}

module.exports = { buildPetMenuTemplate };
