import { CatchGame } from './logic.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const difficultyGroup = document.getElementById('difficultyGroup');
const newGameBtn = document.getElementById('newGameBtn');
const scoreEl = document.getElementById('score');
const missesEl = document.getElementById('misses');
const maxMissesEl = document.getElementById('maxMisses');
const results = document.getElementById('results');
const finalScore = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');

const GROUND_Y = canvas.height - 30;
const CATCHER_SPEED = 0.5; // px/ms
const TREAT_GLYPHS = ['🦴', '🍪', '🐟', '🥕'];

let difficulty = 'medium';
let game = null;
let keys = new Set();
let lastTime = null;
let rafId = null;

// Assigns each treat a stable glyph the first time it's drawn, without
// requiring logic.js (which is deliberately DOM/visual-agnostic) to know
// anything about emoji.
const treatGlyphs = new WeakMap();
function glyphFor(treat) {
  if (!treatGlyphs.has(treat)) {
    treatGlyphs.set(treat, TREAT_GLYPHS[Math.floor(Math.random() * TREAT_GLYPHS.length)]);
  }
  return treatGlyphs.get(treat);
}

function selectDifficulty(value) {
  [...difficultyGroup.querySelectorAll('button')].forEach((b) => {
    b.classList.toggle('selected', b.dataset.value === value);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#e0dacf';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '24px sans-serif';
  for (const t of game.treats) {
    ctx.fillText(glyphFor(t), t.x, t.y);
  }

  ctx.font = '34px sans-serif';
  ctx.fillText('🧺', game.catcherX, GROUND_Y + 24);
}

function loop(now) {
  if (lastTime === null) lastTime = now;
  const dt = Math.min(now - lastTime, 50);
  lastTime = now;

  if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) game.moveCatcherBy(-CATCHER_SPEED * dt);
  if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) game.moveCatcherBy(CATCHER_SPEED * dt);

  game.update(dt, GROUND_Y);
  scoreEl.textContent = game.score;
  missesEl.textContent = game.misses;
  draw();

  if (game.over) {
    finalScore.textContent = `Score: ${game.score}`;
    results.classList.remove('hidden');
    canvas.classList.add('hidden');
    window.catchAPI?.recordStat('catchScore', game.score);
    rafId = null;
    return;
  }
  rafId = requestAnimationFrame(loop);
}

function newGame() {
  game = new CatchGame(canvas.width, difficulty);
  results.classList.add('hidden');
  canvas.classList.remove('hidden');
  scoreEl.textContent = '0';
  missesEl.textContent = '0';
  maxMissesEl.textContent = game.maxMisses;
  lastTime = null;
  if (!rafId) rafId = requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
  keys.add(e.key);
});
window.addEventListener('keyup', (e) => keys.delete(e.key));

difficultyGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-value]');
  if (!btn) return;
  difficulty = btn.dataset.value;
  selectDifficulty(difficulty);
  newGame();
});

newGameBtn.addEventListener('click', newGame);
playAgainBtn.addEventListener('click', newGame);

selectDifficulty(difficulty);
newGame();
