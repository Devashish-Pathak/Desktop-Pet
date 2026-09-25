// Tiny JSON-file settings store (no extra dependency needed for this).
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DEFAULTS = {
  launchAtStartup: false,
  hourlyAnnouncements: true,
  petColor: 'orange',
  petSkin: 'cat',
  walkSpeed: 1,
  petName: 'Mochi',
  soundEffects: true,
  lastX: null, // remembered position between launches; null = use the default center spot
  reminders: [], // [{ id, text, intervalMinutes, enabled }]
  tttDifficulty: 'medium',
  voiceEnabled: true, // speak reminders + hourly time aloud via text-to-speech
  typingMode: 'time',
  typingTimeValue: 30,
  typingWordValue: 25,
  accessory: 'none',
  secondPetEnabled: false,
  cameraMoodEnabled: false, // opt-in, off by default — see src/moodcam/
  // Keep this starter spread in sync with DEFAULT_CITIES in
  // src/worldtime/logic.js (duplicated rather than shared: that file uses ES
  // module syntax for the renderer/tests, this one is CommonJS for the main
  // process, and there's no bundler here to bridge the two).
  worldClockCities: ['Asia/Kathmandu', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'Asia/Tokyo', 'Australia/Sydney'],
  worldClockUse24Hour: false,
  stats: {
    fetchCount: 0,
    tttPlayerWins: 0,
    tttPetWins: 0,
    tttDraws: 0,
    typingTestsCompleted: 0,
    typingBestWpm: 0,
    memoryGamesWon: 0,
    memoryBestMoves: 0,
    catchBestScore: 0,
  },
};

const COLORS = ['orange', 'gray', 'charcoal', 'cream'];
const SKINS = ['cat']; // dog skin exists in src/draw.js but is disabled for now — not user-selectable
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TYPING_MODES = ['time', 'words'];
const TYPING_TIME_VALUES = [15, 30, 60, 120];
const TYPING_WORD_VALUES = [10, 25, 50, 100];
const ACCESSORIES = ['none', 'hat', 'bandana', 'collar'];
const MAX_NAME_LENGTH = 20;
const MAX_REMINDERS = 20;
const MAX_REMINDER_TEXT = 80;
const MIN_INTERVAL_MINUTES = 1;
const MAX_INTERVAL_MINUTES = 1440; // 24h
const MAX_WORLD_CLOCK_CITIES = 20;

function isValidTimeZone(tz) {
  try {
    // eslint-disable-next-line no-new
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function sanitizeWorldClockCities(list) {
  if (!Array.isArray(list)) return [...DEFAULTS.worldClockCities];
  const seen = new Set();
  const out = [];
  for (const tz of list) {
    if (typeof tz !== 'string' || !tz || seen.has(tz) || !isValidTimeZone(tz)) continue;
    seen.add(tz);
    out.push(tz);
    if (out.length >= MAX_WORLD_CLOCK_CITIES) break;
  }
  return out;
}

function sanitizeStats(raw) {
  const s = raw && typeof raw === 'object' ? raw : {};
  const num = (v) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.floor(Number(v)) : 0);
  return {
    fetchCount: num(s.fetchCount),
    tttPlayerWins: num(s.tttPlayerWins),
    tttPetWins: num(s.tttPetWins),
    tttDraws: num(s.tttDraws),
    typingTestsCompleted: num(s.typingTestsCompleted),
    typingBestWpm: num(s.typingBestWpm),
    memoryGamesWon: num(s.memoryGamesWon),
    memoryBestMoves: num(s.memoryBestMoves),
    catchBestScore: num(s.catchBestScore),
  };
}

function sanitizeReminders(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((r) => r && typeof r === 'object')
    .slice(0, MAX_REMINDERS)
    .map((r, i) => ({
      id: typeof r.id === 'string' && r.id ? r.id : `reminder-${Date.now()}-${i}`,
      text: String(r.text ?? '').trim().slice(0, MAX_REMINDER_TEXT),
      intervalMinutes: Math.min(
        MAX_INTERVAL_MINUTES,
        Math.max(MIN_INTERVAL_MINUTES, Math.round(Number(r.intervalMinutes)) || 30)
      ),
      enabled: r.enabled !== false,
    }))
    .filter((r) => r.text.length > 0);
}

let cache = null;

function filePath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function sanitize(raw) {
  const merged = { ...DEFAULTS, ...raw };
  const name = String(merged.petName ?? '').trim().slice(0, MAX_NAME_LENGTH);
  return {
    launchAtStartup: !!merged.launchAtStartup,
    hourlyAnnouncements: !!merged.hourlyAnnouncements,
    petColor: COLORS.includes(merged.petColor) ? merged.petColor : DEFAULTS.petColor,
    petSkin: SKINS.includes(merged.petSkin) ? merged.petSkin : DEFAULTS.petSkin,
    walkSpeed: Math.min(2, Math.max(0.5, Number(merged.walkSpeed) || DEFAULTS.walkSpeed)),
    petName: name || DEFAULTS.petName,
    soundEffects: !!merged.soundEffects,
    lastX: typeof merged.lastX === 'number' && Number.isFinite(merged.lastX) ? merged.lastX : null,
    reminders: sanitizeReminders(merged.reminders),
    tttDifficulty: DIFFICULTIES.includes(merged.tttDifficulty) ? merged.tttDifficulty : DEFAULTS.tttDifficulty,
    voiceEnabled: !!merged.voiceEnabled,
    typingMode: TYPING_MODES.includes(merged.typingMode) ? merged.typingMode : DEFAULTS.typingMode,
    typingTimeValue: TYPING_TIME_VALUES.includes(merged.typingTimeValue)
      ? merged.typingTimeValue
      : DEFAULTS.typingTimeValue,
    typingWordValue: TYPING_WORD_VALUES.includes(merged.typingWordValue)
      ? merged.typingWordValue
      : DEFAULTS.typingWordValue,
    accessory: ACCESSORIES.includes(merged.accessory) ? merged.accessory : DEFAULTS.accessory,
    secondPetEnabled: !!merged.secondPetEnabled,
    cameraMoodEnabled: !!merged.cameraMoodEnabled,
    worldClockCities: sanitizeWorldClockCities(merged.worldClockCities),
    worldClockUse24Hour: !!merged.worldClockUse24Hour,
    stats: sanitizeStats(merged.stats),
  };
}

function load() {
  if (cache) return cache;
  try {
    cache = sanitize(JSON.parse(fs.readFileSync(filePath(), 'utf-8')));
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

function get() {
  return { ...load() };
}

function set(partial) {
  cache = sanitize({ ...load(), ...partial });
  fs.writeFileSync(filePath(), JSON.stringify(cache, null, 2));
  return get();
}

// Centralized here (rather than computed by whichever renderer sends the
// event) so a stat update is always a single atomic read-modify-write
// against the one source of truth, regardless of which window triggered it.
function recordStat(type, payload) {
  const stats = { ...load().stats };
  if (type === 'fetchComplete') {
    stats.fetchCount++;
  } else if (type === 'tttResult') {
    if (payload === 'playerWin') stats.tttPlayerWins++;
    else if (payload === 'petWin') stats.tttPetWins++;
    else if (payload === 'draw') stats.tttDraws++;
  } else if (type === 'typingResult') {
    stats.typingTestsCompleted++;
    const wpm = Math.floor(Number(payload)) || 0;
    if (wpm > stats.typingBestWpm) stats.typingBestWpm = wpm;
  } else if (type === 'memoryWin') {
    stats.memoryGamesWon++;
    const moves = Math.floor(Number(payload)) || 0;
    if (moves > 0 && (stats.memoryBestMoves === 0 || moves < stats.memoryBestMoves)) {
      stats.memoryBestMoves = moves;
    }
  } else if (type === 'catchScore') {
    const score = Math.floor(Number(payload)) || 0;
    if (score > stats.catchBestScore) stats.catchBestScore = score;
  }
  return set({ stats });
}

function resetStats() {
  return set({ stats: { ...DEFAULTS.stats } });
}

module.exports = { get, set, DEFAULTS, recordStat, resetStats };
