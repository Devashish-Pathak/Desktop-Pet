// Pure Tic Tac Toe rules + AI — no DOM/Electron dependencies, so this can be
// unit tested directly under plain Node. The board is a 9-cell array of
// 'X' | 'O' | null, index 0..8 left-to-right, top-to-bottom.
export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every((cell) => cell) ? 'draw' : null;
}

export function emptyCells(board) {
  const out = [];
  for (let i = 0; i < board.length; i++) if (!board[i]) out.push(i);
  return out;
}

export function randomMove(board) {
  const empties = emptyCells(board);
  return empties[Math.floor(Math.random() * empties.length)];
}

// Returns an index where `player` would immediately win by playing there,
// or null if there is no such move.
export function findWinningMove(board, player) {
  for (const i of emptyCells(board)) {
    const copy = board.slice();
    copy[i] = player;
    if (checkWinner(copy) === player) return i;
  }
  return null;
}

function minimax(board, player) {
  const winner = checkWinner(board);
  if (winner === 'O') return { score: 1 };
  if (winner === 'X') return { score: -1 };
  if (winner === 'draw') return { score: 0 };

  const moves = emptyCells(board).map((i) => {
    const copy = board.slice();
    copy[i] = player;
    return { index: i, score: minimax(copy, player === 'O' ? 'X' : 'O').score };
  });

  return player === 'O'
    ? moves.reduce((best, m) => (m.score > best.score ? m : best))
    : moves.reduce((best, m) => (m.score < best.score ? m : best));
}

// The pet always plays 'O'. `difficulty` is 'easy' | 'medium' | 'hard'.
export function computerMove(difficulty, board) {
  if (difficulty === 'hard') return minimax(board, 'O').index;
  if (difficulty === 'medium') {
    return findWinningMove(board, 'O') ?? findWinningMove(board, 'X') ?? randomMove(board);
  }
  return randomMove(board);
}
