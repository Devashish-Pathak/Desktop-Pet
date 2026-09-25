import { Pet } from './pet.js';
import { Particles } from './particles.js';
import { Speech } from './speech.js';
import { drawPet, setPalette, setSkin } from './draw.js';
import { startHourlyAnnouncements } from './clock.js';
import { applyReminders } from './reminders.js';
import { playMeow } from './sound.js';
import { speak } from './voice.js';
import { Friend } from './friend.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const PHRASES = ['hi!', ':)', 'hehe', 'pspsps', 'more pls', 'purr~'];

const DEFAULT_SETTINGS = {
  launchAtStartup: false,
  hourlyAnnouncements: true,
  petColor: 'orange',
  walkSpeed: 1,
  petName: 'Mochi',
  petSkin: 'cat',
  soundEffects: true,
  voiceEnabled: true,
  lastX: null,
  reminders: [],
  accessory: 'none',
  secondPetEnabled: false,
  cameraMoodEnabled: false,
};

const world = {
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  mouseDown: false,
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  groundY: window.innerHeight - 4,
  particles: new Particles(),
  speech: new Speech(),
  quitApp: () => window.petAPI.quit(),
  savePetX: (x) => window.petAPI.savePetX(x),
  notifyStamped: () => window.petAPI.notifyStamped(),
  recordStat: (type, payload) => window.petAPI.recordStat(type, payload),
  settings: { ...DEFAULT_SETTINGS },
  ball: null, // owned by the fetch minigame behavior; main.js just draws it
  tttTarget: null, // owned by the boardVisit behavior; where it's currently headed
};

const pet = new Pet(world.screenWidth / 2, world.groundY);
let friend = null;

let lastRemindersKey = '';

function applySettings(settings) {
  world.settings = settings;
  setPalette(settings.petColor);
  setSkin(settings.petSkin);
  pet.accessory = settings.accessory;

  if (settings.secondPetEnabled && !friend) {
    const spawnX = Math.max(20, Math.min(world.screenWidth - 20, pet.x - 220));
    friend = new Friend(spawnX, world.groundY);
  } else if (!settings.secondPetEnabled && friend) {
    friend = null;
  }

  // Only rebuild reminder timers when the list itself actually changed —
  // otherwise an unrelated settings tweak (color, name, ...) would reset
  // everyone's in-progress countdown.
  const remindersKey = JSON.stringify(settings.reminders);
  if (remindersKey !== lastRemindersKey) {
    lastRemindersKey = remindersKey;
    applyReminders(world, settings.reminders);
  }
}

window.petAPI.getSettings().then((settings) => {
  applySettings(settings);
  if (typeof settings.lastX === 'number') {
    pet.x = Math.max(20, Math.min(world.screenWidth - 20, settings.lastX));
  }
});
window.petAPI.onSettingsChanged(applySettings);

window.petAPI.onFetchTriggered(() => {
  if (pet.state === 'drag') return; // ignore while being carried around
  pet.forceState('fetch', world);
});

window.petAPI.onTttGoTo(({ x, y }) => {
  // Unlike fetch, this one always interrupts whatever the pet is doing
  // (including a drag) — the Tic Tac Toe window is waiting on the pet to
  // actually place its mark, so silently ignoring the request would leave
  // the game stuck on "thinking" forever.
  world.tttTarget = { x, y };
  pet.forceState('boardVisit', world);
});

// Tic Tac Toe is the one minigame where the pet is genuinely the one
// competing (it's playing O), so its outcome gets an emotional reaction —
// the other games (typing/memory/catch) are player-skill games the pet
// isn't really a participant in, so they don't move its mood.
window.petAPI.onMoodEvent(({ type, payload }) => {
  if (type !== 'tttResult') return;
  if (payload === 'petWin') {
    pet.boostMood(10);
    world.speech.say('yay! purrfect!', 1200);
    world.particles.spawn(pet.x - 8, pet.y - pet.height - 6, '❤', '#e0607a');
    world.particles.spawn(pet.x + 8, pet.y - pet.height, '❤', '#e0607a');
  } else if (payload === 'playerWin') {
    pet.boostMood(-5);
    world.speech.say('aw, good game...', 1200);
    world.particles.spawn(pet.x, pet.y - pet.height, '💧', '#8fb4d9');
  } else if (payload === 'draw') {
    pet.boostMood(2);
    world.speech.say('so close!', 1000);
  }
});

// Reports from the (opt-in, off-by-default) camera mood window — see
// src/moodcam/. Only fires for a genuinely new, confident, non-neutral
// expression reading (see reactions.js's dedup logic), so this is not a
// constant stream of chatter.
window.petAPI.onCameraMoodEvent((reaction) => {
  if (!reaction) return;
  pet.boostMood(reaction.moodDelta);
  world.speech.say(reaction.phrase, 3000);
  if (world.settings.voiceEnabled) speak(reaction.phrase);
});

let dragCandidate = false;
let sparkleTimer = 0;
let autosaveTimer = 20000;
let moodReportTimer = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  world.screenWidth = window.innerWidth;
  world.screenHeight = window.innerHeight;
  world.groundY = window.innerHeight - 4;
  pet.x = Math.min(pet.x, world.screenWidth - 20);
  if (pet.state !== 'drag') pet.y = world.groundY; // re-anchor immediately on display/DPI changes
}
window.addEventListener('resize', resize);
resize();

startHourlyAnnouncements(world);

function reactToClick() {
  world.particles.spawn(pet.x - 10, pet.y - pet.height - 10, '❤', '#e0607a');
  world.particles.spawn(pet.x + 12, pet.y - pet.height - 4, '✨', '#f2c94c');
  world.speech.say(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  if (world.settings.soundEffects) playMeow();
  pet.boostMood(8);
}

function updateHover() {
  if (pet.state === 'drag') return; // stay captured while dragging

  const isOver = pet.hitTest(world.mouseX, world.mouseY);
  if (isOver !== pet.hovered) {
    pet.hovered = isOver;
    window.petAPI.setIgnoreMouseEvents(!isOver, isOver ? {} : { forward: true });
    if (isOver) {
      world.speech.say('hi!', 900);
      pet.boostMood(1);
    }
  }
}

window.addEventListener('mousemove', (e) => {
  world.mouseX = e.clientX;
  world.mouseY = e.clientY;
  updateHover();

  if (dragCandidate && world.mouseDown && pet.state !== 'drag') {
    pet.startDrag(world);
    dragCandidate = false;
  }
});

window.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return; // only the left button drags/clicks the pet
  world.mouseDown = true;
  if (pet.hovered) dragCandidate = true;
});

window.addEventListener('mouseup', (e) => {
  if (e.button !== 0) return;
  world.mouseDown = false;
  if (dragCandidate) reactToClick(); // was a click, not a drag
  dragCandidate = false;
});

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (pet.hovered) window.petAPI.showContextMenu();
});

function drawBall() {
  if (!world.ball) return;
  ctx.save();
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎾', world.ball.x, world.ball.y);
  ctx.restore();
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(now - lastTime, 50); // clamp so tab-switch/pause doesn't jump the pet
  lastTime = now;

  pet.update(dt, world);
  if (friend) friend.update(dt, world, pet);
  world.particles.update(dt);
  world.speech.update(dt);

  if (pet.hovered && pet.state !== 'drag') {
    sparkleTimer -= dt;
    if (sparkleTimer <= 0) {
      world.particles.spawn(pet.x + (Math.random() - 0.5) * 30, pet.y - pet.height, '✨', '#f2c94c');
      sparkleTimer = 700 + Math.random() * 500;
    }
  }

  autosaveTimer -= dt;
  if (autosaveTimer <= 0) {
    world.savePetX(pet.x);
    autosaveTimer = 20000;
  }

  // Mood is a continuously-decaying runtime value that only lives here (it's
  // not persisted settings data), so push it periodically for the Settings
  // window's energy bar — main.js just no-ops the forward if Settings isn't
  // open, so this is cheap regardless.
  moodReportTimer -= dt;
  if (moodReportTimer <= 0) {
    window.petAPI.reportMood(pet.mood);
    moodReportTimer = 1000;
  }

  const lookAt = { x: world.mouseX, y: world.mouseY };
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  if (friend) drawPet(ctx, friend, 'gray', lookAt);
  drawPet(ctx, pet, undefined, lookAt);
  world.particles.draw(ctx);
  world.speech.draw(ctx, pet.x, pet.y - pet.height);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
