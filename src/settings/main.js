const els = {
  petName: document.getElementById('petName'),
  energyValue: document.getElementById('energyValue'),
  energyBarFill: document.getElementById('energyBarFill'),
  launchAtStartup: document.getElementById('launchAtStartup'),
  hourlyAnnouncements: document.getElementById('hourlyAnnouncements'),
  soundEffects: document.getElementById('soundEffects'),
  voiceEnabled: document.getElementById('voiceEnabled'),
  walkSpeed: document.getElementById('walkSpeed'),
  walkSpeedLabel: document.getElementById('walkSpeedLabel'),
  petColor: document.getElementById('petColor'),
  fetchBtn: document.getElementById('fetchBtn'),
  tttBtn: document.getElementById('tttBtn'),
  typingBtn: document.getElementById('typingBtn'),
  memoryBtn: document.getElementById('memoryBtn'),
  catchBtn: document.getElementById('catchBtn'),
  worldTimeBtn: document.getElementById('worldTimeBtn'),
  accessory: document.getElementById('accessory'),
  secondPetEnabled: document.getElementById('secondPetEnabled'),
  cameraMoodEnabled: document.getElementById('cameraMoodEnabled'),
  statsGrid: document.getElementById('statsGrid'),
  resetStatsBtn: document.getElementById('resetStatsBtn'),
  reminderList: document.getElementById('reminderList'),
  reminderText: document.getElementById('reminderText'),
  reminderInterval: document.getElementById('reminderInterval'),
  addReminderBtn: document.getElementById('addReminderBtn'),
  closeBtn: document.getElementById('closeBtn'),
};

let reminders = [];

function makeId() {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function markSelected(group, value) {
  group.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.value === value);
  });
}

function saveReminders() {
  window.settingsAPI.set({ reminders });
}

function renderReminders() {
  els.reminderList.innerHTML = '';

  if (!reminders.length) {
    const empty = document.createElement('div');
    empty.className = 'note';
    empty.textContent = 'No reminders yet — add one below.';
    els.reminderList.appendChild(empty);
    return;
  }

  for (const reminder of reminders) {
    const row = document.createElement('div');
    row.className = 'reminder-row';

    const info = document.createElement('span');
    info.className = 'reminder-info';
    info.title = reminder.text;
    info.textContent = `"${reminder.text}" every ${reminder.intervalMinutes} min`;

    const enabledToggle = document.createElement('input');
    enabledToggle.type = 'checkbox';
    enabledToggle.checked = reminder.enabled;
    enabledToggle.title = 'Enabled';
    enabledToggle.addEventListener('change', () => {
      reminder.enabled = enabledToggle.checked;
      saveReminders();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'reminder-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', () => {
      reminders = reminders.filter((r) => r.id !== reminder.id);
      saveReminders();
      renderReminders();
    });

    row.append(info, enabledToggle, deleteBtn);
    els.reminderList.appendChild(row);
  }
}

const STAT_LABELS = [
  ['fetchCount', 'Fetch games played'],
  ['tttPlayerWins', 'Tic Tac Toe wins'],
  ['tttPetWins', 'Tic Tac Toe losses'],
  ['tttDraws', 'Tic Tac Toe draws'],
  ['typingBestWpm', 'Best typing WPM'],
  ['typingTestsCompleted', 'Typing tests completed'],
  ['memoryGamesWon', 'Memory games won'],
  ['memoryBestMoves', 'Best memory moves'],
  ['catchBestScore', 'Best catch score'],
];

function renderStats(stats) {
  els.statsGrid.innerHTML = '';
  for (const [key, label] of STAT_LABELS) {
    const cell = document.createElement('div');
    const value = document.createElement('span');
    value.className = 'stat-value';
    value.textContent = stats?.[key] ?? 0;
    const labelEl = document.createElement('span');
    labelEl.className = 'stat-label';
    labelEl.textContent = label;
    cell.append(value, labelEl);
    els.statsGrid.appendChild(cell);
  }
}

function applyToForm(settings) {
  els.petName.value = settings.petName;
  els.launchAtStartup.checked = settings.launchAtStartup;
  els.hourlyAnnouncements.checked = settings.hourlyAnnouncements;
  els.soundEffects.checked = settings.soundEffects;
  els.voiceEnabled.checked = settings.voiceEnabled;
  els.walkSpeed.value = settings.walkSpeed;
  els.walkSpeedLabel.textContent = `${settings.walkSpeed.toFixed(1)}x`;
  els.secondPetEnabled.checked = settings.secondPetEnabled;
  els.cameraMoodEnabled.checked = settings.cameraMoodEnabled;
  markSelected(els.petColor, settings.petColor);
  markSelected(els.accessory, settings.accessory);
  renderStats(settings.stats);
  reminders = settings.reminders || [];
  renderReminders();
}

window.settingsAPI.get().then(applyToForm);
window.settingsAPI.onSettingsChanged(applyToForm);

els.petName.addEventListener('change', () => {
  window.settingsAPI.set({ petName: els.petName.value });
});

els.soundEffects.addEventListener('change', () => {
  window.settingsAPI.set({ soundEffects: els.soundEffects.checked });
});

els.voiceEnabled.addEventListener('change', () => {
  window.settingsAPI.set({ voiceEnabled: els.voiceEnabled.checked });
});

els.fetchBtn.addEventListener('click', () => window.settingsAPI.playFetch());

els.launchAtStartup.addEventListener('change', () => {
  window.settingsAPI.set({ launchAtStartup: els.launchAtStartup.checked });
});

els.hourlyAnnouncements.addEventListener('change', () => {
  window.settingsAPI.set({ hourlyAnnouncements: els.hourlyAnnouncements.checked });
});

els.walkSpeed.addEventListener('input', () => {
  const value = parseFloat(els.walkSpeed.value);
  els.walkSpeedLabel.textContent = `${value.toFixed(1)}x`;
  window.settingsAPI.set({ walkSpeed: value });
});

els.petColor.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-value]');
  if (!btn) return;
  markSelected(els.petColor, btn.dataset.value);
  window.settingsAPI.set({ petColor: btn.dataset.value });
});

els.tttBtn.addEventListener('click', () => window.settingsAPI.playTicTacToe());
els.typingBtn.addEventListener('click', () => window.settingsAPI.openTypingTrainer());
els.memoryBtn.addEventListener('click', () => window.settingsAPI.openMemoryGame());
els.catchBtn.addEventListener('click', () => window.settingsAPI.openCatchGame());
els.worldTimeBtn.addEventListener('click', () => window.settingsAPI.openWorldTime());

els.accessory.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-value]');
  if (!btn) return;
  markSelected(els.accessory, btn.dataset.value);
  window.settingsAPI.set({ accessory: btn.dataset.value });
});

els.secondPetEnabled.addEventListener('change', () => {
  window.settingsAPI.set({ secondPetEnabled: els.secondPetEnabled.checked });
});

els.cameraMoodEnabled.addEventListener('change', () => {
  window.settingsAPI.set({ cameraMoodEnabled: els.cameraMoodEnabled.checked });
});

els.resetStatsBtn.addEventListener('click', () => window.settingsAPI.resetStats());

function addReminder() {
  const text = els.reminderText.value.trim();
  const interval = parseInt(els.reminderInterval.value, 10);
  if (!text || !Number.isFinite(interval) || interval < 1) return;

  reminders = [...reminders, { id: makeId(), text, intervalMinutes: interval, enabled: true }];
  saveReminders();
  renderReminders();
  els.reminderText.value = '';
  els.reminderInterval.value = '';
  els.reminderText.focus();
}

els.addReminderBtn.addEventListener('click', addReminder);
els.reminderText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addReminder();
});
els.reminderInterval.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addReminder();
});

els.closeBtn.addEventListener('click', () => window.settingsAPI.close());

// Matches LOW_MOOD_THRESHOLD in src/behaviors/idle.js — below this, the pet
// is actually more likely to nap instead of wander, so the color cue below
// reflects a real behavior change, not an arbitrary number.
const LOW_ENERGY_THRESHOLD = 30;

window.settingsAPI.onPetMoodUpdate((mood) => {
  const rounded = Math.max(0, Math.min(100, Math.round(mood)));
  els.energyValue.textContent = `${rounded}%`;
  els.energyBarFill.style.width = `${rounded}%`;
  els.energyBarFill.classList.toggle('low', rounded < LOW_ENERGY_THRESHOLD);
});
