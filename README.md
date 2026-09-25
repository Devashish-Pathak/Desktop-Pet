# Desktop Pet

A small chibi cat (optionally with a friend) that lives on top of your
Windows desktop. It wanders around, idles with the occasional stretch/yawn,
rests in the corner when left alone, reacts when you hover or click, can be
picked up and dressed up with an accessory, plays fetch, plays Tic Tac Toe
(walking to the board to place its own moves), speaks reminders and the
hourly time aloud, and comes with three standalone minigames/tools (a
MonkeyType-style typing trainer, a memory-matching game, and a catch-the-
treats arcade game) — all fully configurable from its own Settings window,
which also tracks your stats across everything.

## Run it

```bash
npm install
npm start
```

Or double-click the **"Desktop Pet"** shortcut on your Desktop, which launches
`electron.exe` directly with no console window.

A tray icon (bottom-right, near the clock) gives you Show/Hide, Play Fetch,
Play Tic Tac Toe, Typing Trainer, Memory Match, Catch the Treats, Settings,
and Quit — the pet window itself has no border or taskbar entry.

## Features

- **Wandering** — idles, strolls around the screen, and rests in the
  bottom-right corner after a while (never lies down or leaves the ground —
  see `groundY` handling below). While idle it occasionally stretches, yawns,
  or grooms itself, and breathes with a subtle continuous rise/fall the rest
  of the time, so it never looks like a frozen frame. It also sometimes
  wanders toward wherever your cursor recently was instead of a fully random
  spot — a little "curiosity" bias, not just aimless pacing.
- **Its eyes actually watch you** — they glance toward the cursor from a
  distance (not just when you're right next to it), which is the single
  cheapest thing in this app for making it feel alive.
- **Mood** — a hidden 0-100 value that slowly drifts down over ~30 minutes of
  no interaction and gets boosted by petting, dragging, and winning games.
  Low mood (or late at night) makes it noticeably more likely to go rest
  instead of wandering — a simple day/sleep rhythm built on the existing
  corner-rest behavior. High mood shows as slightly bigger eyes and a faint
  permanent blush, separate from the hover blush.
- **Hover reactions** — eyes widen, blush, and sparkles when the cursor is
  near it; a "hi!" speech bubble greets you.
- **Click** — a heart/sparkle burst, a random phrase, and a synthesized meow
  (if sound effects are on).
- **Drag** — pick it up and move it anywhere; if it's mid-air when you let
  go it actually falls with gravity (accelerating, not an instant teleport)
  until it hits the ground. Drop it near the bottom-right corner and it
  lands straight into rest mode instead of wandering back out; drag it to
  the very top of the screen to close the app (with a little
  puff-of-smoke goodbye).
- **Accessories** (Settings → Appearance) — dress it up with a hat, bandana,
  or collar, independent of its color.
- **A second pet** (Settings → Appearance → "Second pet") — an optional
  companion that wanders on its own and occasionally walks over to visit the
  main pet. Purely decorative — it doesn't respond to hover/click/drag,
  which keeps the click-through hit-testing simple to reason about.
- **Play Fetch** — a minigame triggered from the right-click menu, the tray
  menu, or the Settings window: a ball drops somewhere on screen, the pet runs
  to grab it, then runs back and does a little "tada!".
- **Play Tic Tac Toe** — opens its own board window. You're X, the pet is O,
  and you pick a difficulty (Easy/Medium/Hard — Hard plays a proper minimax
  search and cannot be beaten, only drawn). On the pet's turn, it physically
  walks across your screen to the board window, stamps its mark on the cell
  it chose, then walks all the way back to where it started before your turn
  comes up again. Because the pet is genuinely the one playing here (unlike
  the other games, which are all about your own skill), the outcome actually
  affects its mood — happy hearts and a mood boost if it wins, a little sad
  if it loses.
- **Typing Trainer** — a MonkeyType-style typing test in its own window:
  time-based (15/30/60/120s) or word-count-based (10/25/50/100 words) tests,
  live per-character correctness coloring, a moving caret, a live
  countdown/progress counter, and a results screen with WPM, raw WPM,
  accuracy, and time. Your last-used mode/duration is remembered. Not tied to
  the pet — it's a standalone practice tool.
- **Memory Match** — a classic pairs-matching card game in its own window,
  three sizes (6/8/12 pairs). Tracks your move count and best score.
- **Catch the Treats** — a small real-time arcade game: move a basket with
  ←/→ or A/D to catch treats falling from the top before you run out of
  misses (Easy/Medium/Hard changes fall speed, spawn rate, and how many
  misses you're allowed). Tracks your best score.
- **Hourly time announcement** — a speech bubble like *"Mochi says: it's
  3:00 PM"*, right on the system clock's hour boundary (toggleable).
- **Custom reminders** (Settings → Reminders) — add as many recurring
  messages as you want, each on its own interval, e.g. *"Please stand up,
  you've been at the laptop too long"* every 30 minutes and *"Drink some
  water"* every 50 minutes. Each has its own on/off toggle and can be
  deleted; they run independently as speech bubbles.
- **Voice** — reminders and the hourly time announcement are spoken aloud via
  the OS's built-in text-to-speech (no external service, works offline),
  separate from the speech-bubble text. Toggleable independently of sound
  effects in Settings. Hover greetings, click reactions, and minigame chatter
  stay silent-bubble-only by design, so it doesn't talk constantly.
- **Settings window** (right-click → Settings…) — rename the pet, recolor it,
  give it an accessory, toggle a second pet, adjust walk speed, toggle sound
  effects, toggle voice, toggle the hourly announcement, toggle
  launch-at-Windows-startup, manage reminders, or launch any minigame/tool.
  Settings persist to `%APPDATA%/desktop-pet/settings.json` and apply live,
  no restart needed.
- **Stats** (Settings → Stats) — fetch games played, Tic Tac Toe
  wins/losses/draws, best typing WPM and tests completed, memory games won
  and best move count, and best catch score — all tracked automatically as
  you play, with a Reset Stats button. Updates live even while Settings is
  open, from whichever window the game happened in.
- **Position memory** — remembers roughly where it was left and resumes there
  next launch.
- **Sound effects** — small synthesized meow/blip/chime sounds via Web Audio,
  no audio files needed. Toggleable in Settings, independent of voice.
- **Camera mood detection** (Settings → Camera Mood, **off by default**) —
  reads your facial expression via webcam and reacts with a speech bubble +
  voice line. Fully offline (`face-api.js`, running entirely on your
  machine — nothing is ever sent anywhere or stored), no video preview ever
  shows, and the camera only turns on for a brief moment roughly every 2
  minutes rather than running continuously. This detects basic expressions
  (happy/sad/angry/fearful/disgusted/surprised), not true physiological
  stress — treat it as a fun ambient read, not a real measurement. Windows
  will still show its own camera-in-use indicator and ask for permission the
  first time, same as any app using the webcam.

## How it works

- **`electron/main.js`** — creates one transparent, frameless, always-on-top
  window covering the whole screen. It's click-through by default
  (`setIgnoreMouseEvents`) so it never blocks clicks to whatever is behind it,
  except in the small area where the pet actually is. Also owns the tray icon
  and the Settings window.
- **`electron/settingsStore.js`** — a tiny JSON-file settings store (no extra
  dependency). Validates/clamps everything on read and write so a corrupted or
  hand-edited file can't crash the app. Also owns `recordStat(type, payload)`
  — the single place stat updates are computed (increment counters, keep-if-
  better for best-score fields), so a stat update from any window is always
  one atomic read-modify-write against the one source of truth.
- **`electron/settingsPreload.js`** / **`electron/preload.js`** /
  **`electron/tictactoePreload.js`** / **`electron/typingTrainerPreload.js`**
  / **`electron/memoryGamePreload.js`** / **`electron/catchGamePreload.js`**
  — each window's isolated `contextBridge` API (`window.settingsAPI`,
  `window.petAPI`, `window.tttAPI`, `window.typingAPI`, `window.memoryAPI`,
  `window.catchAPI`). The game windows' `recordStat` all send the same
  `record-stat` IPC message; `electron/main.js` broadcasts the updated
  settings back to both the pet window and the Settings window (if open) so
  the Stats panel refreshes live.
- **`electron/petMenu.js`** — the right-click popup menu template. New
  app-level features generally get one line here.
- **`src/main.js`** — the render/input loop. On every `mousemove` it hit-tests
  the cursor against the pet's bounding box and flips click-through on/off, so
  hover, click, and drag "just work" without a native OS mouse hook. Also
  fetches/subscribes to settings and applies them live.
- **`src/pet.js`** — pet state (position, facing, animation timers, mood)
  plus a `BehaviorManager` that runs the current behavior each frame.
  `forceState()` is the generic hook for jumping straight into a behavior
  from user input (used by both drag and fetch). `update()` also advances
  `breathPhase` and decays `mood` every frame — both are continuous,
  state-independent — and `boostMood(amount)` is the one place mood ever
  goes up, clamped to `[0, 100]`, called from interactions (click, drag,
  fetch) and from the Tic Tac Toe mood-event handler in `src/main.js`.
- **`src/behaviors/`** — one file per state (`idle`, `walk`, `rest`, `drag`,
  `fetch`, `boardVisit`, `fall`). Each exports `enter(pet, world)` and
  `update(pet, dt, world)`; `update` returns the name of the next state, or
  `null` to stay put. Every ground-standing behavior pins
  `pet.y = world.groundY` every frame, so the pet can structurally never
  drift off-screen. `boardVisit` and `fall` are the exceptions — `boardVisit`
  is used by Tic Tac Toe to send the pet to an arbitrary on-screen point (a
  board cell, in a different window) and back; `fall` is entered whenever
  `drag.js` releases the pet mid-air (rather than snapping straight to the
  ground), applying real acceleration (`fallVelocity += GRAVITY * dt`) until
  it lands, then handing off to whatever `pet.landTarget` says (`'idle'` or
  `'rest'`, set by `drag.js` based on where it was dropped). `idle` also
  drives the occasional stretch/yawn/groom micro-animation
  (`pet.microAnim`/`pet.microPhase`), read by `draw.js` only while
  `state === 'idle'` so it can never bleed into another behavior's pose, and
  weights its walk-vs-rest roll by time of day (`isNightTime()`, 11pm-6am)
  and low mood, so it naturally naps more at night or when it's been
  ignored. `walk` occasionally (30% of the time) picks its wander target
  near `world.mouseX` instead of fully at random — a cheap "curiosity" cue.
- **`src/draw.js`** — procedural canvas rendering, no image assets. Colors
  come from a swappable palette (`setPalette`, driven by `petColor`, with an
  optional per-call override — see `src/friend.js`). There's also a
  `setSkin`/cat-vs-dog rendering path already built in, but the dog option is
  currently disabled (not selectable in Settings — see
  `electron/settingsStore.js`'s `SKINS` list) — flip that back on to bring it
  back. `drawAccessory()` renders the hat/bandana/collar on top of everything
  else, under the face. `drawPet()` also takes an optional `lookAt` point
  (world-space, typically the cursor) and offsets the eye ellipses toward it
  — converted into the canvas's already-translated-and-facing-flipped local
  space via `worldDelta * facing` for x — and reads `pet.mood`/`pet.breathPhase`
  (both optional, defaulting gracefully) for the faint high-mood blush and
  the idle breathing scale. Swap this whole module for a sprite sheet later
  without touching any behavior code.
- **`src/friend.js`** — the optional second pet. A small self-contained
  state machine (idle/walk only — no drag/fetch/boardVisit, and never
  hovered) that wanders on its own and sometimes walks over to "visit" the
  main pet, spawning a particle when it arrives. Reuses `drawPet()` with a
  fixed `'gray'` palette override so it's visually distinct regardless of the
  main pet's color. `src/main.js` creates/destroys it based on the
  `secondPetEnabled` setting.
- **`src/sound.js`** — tiny synthesized sound effects (Web Audio oscillators),
  lazily initialized behind a real user gesture so autoplay policies never
  block it.
- **`src/voice.js`** — actual spoken text-to-speech via the browser's
  built-in `speechSynthesis`/`SpeechSynthesisUtterance` (OS voices — SAPI on
  Windows), gated by the `voiceEnabled` setting. Separate from `sound.js`,
  which only does short non-verbal effects.
- **`src/clock.js`** — self-scheduling hourly announcement; always computes
  the exact delay to the next `:00` and re-arms itself.
- **`src/reminders.js`** — runs the user-defined reminder list, each on its
  own repeating `setTimeout`. `applyReminders()` tears down and rebuilds all
  timers, so `src/main.js` only calls it when the reminders array itself
  changed (a `JSON.stringify` key comparison) — otherwise any unrelated
  settings tweak would reset everyone's countdown.
- **`src/particles.js`** / **`src/speech.js`** — small reusable effects:
  floating hearts/sparkles, and speech bubbles (auto-clamped to stay on
  screen even near the edges).
- **`src/settings/`** — the Settings window's own HTML/CSS/JS, talking to the
  main process purely through `window.settingsAPI`.
- **`src/tictactoe/`** — the Tic Tac Toe window. `logic.js` is pure game
  rules + AI (win detection, easy/random, medium/heuristic,
  hard/minimax) with zero DOM or Electron dependencies, so it's directly
  unit-testable under plain Node. `main.js` is the DOM/IPC glue: it computes
  a cell's absolute *screen* coordinates with
  `window.screenX/screenY + getBoundingClientRect()` (works because both
  this window and the pet's overlay live on the same display), sends them to
  the pet via `tttAPI.requestVisit(x, y)`, and awaits `onStampComplete`
  before actually writing the move into the board — see the `gameId` counter
  there, which guards against a stale in-flight computer move landing on a
  board that was reset with "New Game" while the pet was still walking.
  `electron/main.js` just relays two IPC messages between this window and
  the pet window (`ttt-request-visit` → pet, `ttt-stamped` → back here); the
  pet side is the `boardVisit` behavior above.
- **`src/typingtrainer/`** — the Typing Trainer window, structured the same
  way as `tictactoe/`: `words.js` is a plain word list + random picker,
  `engine.js` is the whole test state machine (`TypingTest` — typing/
  backspace/word-submit, timing, and the WPM/raw-WPM/accuracy scoring) with
  zero DOM dependencies, and `main.js` is pure DOM/input glue (renders words
  as spans, positions the caret via `getBoundingClientRect` diffs against the
  words container, drives the countdown timer for time mode). All the
  interesting correctness — character-by-character scoring, mode
  auto-finish, the auto-refilling word buffer for time mode — lives in
  `engine.js` and is unit-tested directly.
- **`src/memorygame/`** — the Memory Match window. `logic.js`'s
  `MemoryGame` class (flip/match/mismatch/lock/win, zero DOM) is unit-tested
  directly; `main.js` renders the card grid and handles the flip-back delay
  after a mismatch.
- **`src/catchgame/`** — the Catch the Treats window. `logic.js`'s
  `CatchGame` class (catcher movement, treat spawning/falling, scoring,
  difficulty presets, zero DOM) is unit-tested directly; `main.js` is a small
  canvas game loop (arrow keys / A-D move the catcher) that assigns each
  treat a random emoji via a `WeakMap` the first time it's drawn, keeping
  `logic.js` itself visual-agnostic.
- **`src/moodcam/`** — the camera mood detector, running in a `show: false`
  BrowserWindow created/destroyed by `electron/main.js` purely based on the
  `cameraMoodEnabled` setting (never touches the camera unless the user has
  opted in). `reactions.js` is pure expression→reaction logic (confidence
  threshold, neutral/repeat suppression so a sustained expression only
  reacts once, mood delta per category) with zero camera/DOM dependency —
  directly unit-tested. `main.js` loads `face-api.js` (bundled as a plain
  `<script>` UMD global — bare `import 'face-api.js'` doesn't resolve in an
  unbundled renderer) plus its pretrained models (`models/`, fetched once
  from the library's GitHub release, not part of the npm package), then on
  each interval: acquires the camera, waits briefly for a real frame, runs
  `detectSingleFace().withFaceExpressions()`, and — critically — always
  releases the camera (`track.stop()`) in a `finally` block afterward, so the
  OS camera-in-use indicator only lights up for that one brief check rather
  than staying on continuously. Reactions are sent via `moodcamAPI.reportReaction`
  → `electron/main.js` → forwarded to the pet window as `camera-mood-event`,
  where they apply a mood delta and speak through the existing
  speech-bubble + `voice.js` TTS pipeline — no new UI needed for that part.

## Adding a new feature

Most new features are a new behavior:

1. Create `src/behaviors/myThing.js` exporting `{ enter, update }`.
2. Register it in `src/behaviors/index.js`'s `behaviors` map.
3. Trigger it — either by returning its name from another behavior's
   `update`, or by calling `pet.forceState('myThing', world)` directly (see
   `Pet.startDrag` / the fetch-trigger wiring in `src/main.js` for examples).

For a new **setting**: add it to `DEFAULTS`/`sanitize()` in
`electron/settingsStore.js`, add a control for it in `src/settings/index.html`
+ `src/settings/main.js`, and read it off `world.settings` wherever the pet
renderer needs it (it's live-updated, no restart required).

Ideas for later: a hunger/mood stat, re-enabling the dog skin (or more
species), more accessories, multi-monitor support, more minigames, giving
the second pet its own color/accessory instead of a fixed gray look.

## Packaging a distributable

```bash
npm run dist
```

Uses `electron-builder` (already configured in `package.json`) to produce a
Windows installer in `dist/`. You'll want a real `assets/icon.ico` before
shipping this — the tray icon is currently a 1x1 placeholder pixel.
