import { MemoryGame } from './logic.js';

const board = document.getElementById('board');
const status = document.getElementById('status');
const difficultyGroup = document.getElementById('difficultyGroup');
const newGameBtn = document.getElementById('newGameBtn');
const results = document.getElementById('results');
const resultMoves = document.getElementById('resultMoves');
const playAgainBtn = document.getElementById('playAgainBtn');

const GRID_COLUMNS = { 6: 4, 8: 4, 12: 6 };
const MISMATCH_DELAY_MS = 700;

let pairCount = 8;
let game = null;
let cardEls = [];

function selectDifficulty(value) {
  [...difficultyGroup.querySelectorAll('button')].forEach((b) => {
    b.classList.toggle('selected', b.dataset.value === String(value));
  });
}

function render() {
  status.textContent = `Moves: ${game.moves}`;
  cardEls.forEach((el, i) => {
    const card = game.cards[i];
    const faceUp = card.matched || game.flippedIndices.includes(i);
    el.textContent = faceUp ? card.symbol : '';
    el.classList.toggle('up', faceUp && !card.matched);
    el.classList.toggle('matched', card.matched);
    el.disabled = card.matched || game.locked;
  });
}

function handleFlip(i) {
  const result = game.flip(i);
  if (result === 'ignored') return;
  render();

  if (result === 'mismatch') {
    setTimeout(() => {
      game.resolveMismatch();
      render();
    }, MISMATCH_DELAY_MS);
  } else if (result === 'won') {
    resultMoves.textContent = `${game.moves} moves`;
    results.classList.remove('hidden');
    board.classList.add('hidden');
    window.memoryAPI?.recordStat('memoryWin', game.moves);
  }
}

function newGame() {
  game = new MemoryGame(pairCount);
  results.classList.add('hidden');
  board.classList.remove('hidden');
  board.style.gridTemplateColumns = `repeat(${GRID_COLUMNS[pairCount]}, 62px)`;
  board.innerHTML = '';
  cardEls = game.cards.map((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.addEventListener('click', () => handleFlip(i));
    board.appendChild(btn);
    return btn;
  });
  render();
}

difficultyGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-value]');
  if (!btn) return;
  pairCount = Number(btn.dataset.value);
  selectDifficulty(pairCount);
  newGame();
});

newGameBtn.addEventListener('click', newGame);
playAgainBtn.addEventListener('click', newGame);

selectDifficulty(pairCount);
newGame();
