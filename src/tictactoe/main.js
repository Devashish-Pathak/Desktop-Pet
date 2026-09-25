import { checkWinner, computerMove } from './logic.js';

const boardEl = document.getElementById('board');
const cells = [...boardEl.querySelectorAll('.cell')];
const statusEl = document.getElementById('status');
const difficultySelect = document.getElementById('difficulty');
const newGameBtn = document.getElementById('newGameBtn');

let board = Array(9).fill(null);
let gameOver = false;
let awaitingStamp = false;
let gameId = 0; // bumped on "New Game" so a stale in-flight stamp can't write into the fresh board

function setStatus(text) {
  statusEl.textContent = text;
}

function render() {
  cells.forEach((cell, i) => {
    cell.textContent = board[i] ?? '';
    cell.classList.toggle('x', board[i] === 'X');
    cell.classList.toggle('o', board[i] === 'O');
    cell.disabled = !!board[i] || gameOver || awaitingStamp;
  });
  newGameBtn.disabled = awaitingStamp;
}

function endIfDone() {
  const result = checkWinner(board);
  if (!result) return false;
  gameOver = true;
  if (result === 'draw') {
    setStatus("It's a draw!");
    window.tttAPI.recordStat('tttResult', 'draw');
  } else if (result === 'X') {
    setStatus('You win!');
    window.tttAPI.recordStat('tttResult', 'playerWin');
  } else {
    setStatus('The pet wins!');
    window.tttAPI.recordStat('tttResult', 'petWin');
  }
  render();
  return true;
}

function cellScreenCenter(index) {
  const rect = cells[index].getBoundingClientRect();
  return {
    x: window.screenX + rect.left + rect.width / 2,
    y: window.screenY + rect.top + rect.height / 2,
  };
}

// Registered once — NOT inside playerMove — otherwise every computer turn
// would stack another listener and old ones would keep firing too.
let pendingStampResolve = null;
window.tttAPI.onStampComplete(() => {
  if (pendingStampResolve) {
    const resolve = pendingStampResolve;
    pendingStampResolve = null;
    resolve();
  }
});

function requestStampAt(x, y) {
  return new Promise((resolve) => {
    pendingStampResolve = resolve;
    window.tttAPI.requestVisit(x, y);
  });
}

async function playerMove(index) {
  if (gameOver || awaitingStamp || board[index]) return;

  board[index] = 'X';
  render();
  if (endIfDone()) return;

  const myGameId = gameId;
  setStatus('The pet is thinking…');
  awaitingStamp = true;
  render();

  await new Promise((r) => setTimeout(r, 400)); // brief pause so "thinking" is readable
  if (myGameId !== gameId) return; // a New Game happened while we were waiting

  const target = computerMove(difficultySelect.value, board);
  const { x, y } = cellScreenCenter(target);
  await requestStampAt(x, y);
  if (myGameId !== gameId) return; // New Game happened mid-walk — don't write into the fresh board

  board[target] = 'O';
  awaitingStamp = false;
  render();
  if (!endIfDone()) setStatus('Your turn (X)');
}

cells.forEach((cell, i) => cell.addEventListener('click', () => playerMove(i)));

newGameBtn.addEventListener('click', () => {
  gameId++;
  board = Array(9).fill(null);
  gameOver = false;
  awaitingStamp = false;
  setStatus('Your turn (X)');
  render();
});

window.tttAPI.getSettings().then((settings) => {
  difficultySelect.value = settings.tttDifficulty || 'medium';
});

difficultySelect.addEventListener('change', () => {
  window.tttAPI.setSettings({ tttDifficulty: difficultySelect.value });
});

render();
