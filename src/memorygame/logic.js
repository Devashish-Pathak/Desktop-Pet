// Pure memory-matching game state — no DOM dependencies, directly testable.
const EMOJI_POOL = ['🐱', '🐶', '🎾', '❤️', '✨', '🦴', '🌟', '🐾', '🍎', '🎈', '🌈', '🍪'];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createDeck(pairCount) {
  const symbols = EMOJI_POOL.slice(0, pairCount);
  const deck = shuffle(symbols.flatMap((s) => [s, s]));
  return deck.map((symbol, i) => ({ id: i, symbol, matched: false }));
}

export class MemoryGame {
  constructor(pairCount = 8) {
    this.pairCount = pairCount;
    this.cards = createDeck(pairCount);
    this.flippedIndices = [];
    this.moves = 0;
    this.locked = false; // true while a mismatched pair is waiting to be flipped back
  }

  // Returns: 'ignored' | 'flipped' | 'matched' | 'won' | 'mismatch'
  flip(index) {
    if (this.locked) return 'ignored';
    if (index < 0 || index >= this.cards.length) return 'ignored';
    if (this.cards[index].matched) return 'ignored';
    if (this.flippedIndices.includes(index)) return 'ignored';

    this.flippedIndices.push(index);
    if (this.flippedIndices.length === 1) return 'flipped';

    this.moves++;
    const [a, b] = this.flippedIndices;
    if (this.cards[a].symbol === this.cards[b].symbol) {
      this.cards[a].matched = true;
      this.cards[b].matched = true;
      this.flippedIndices = [];
      return this.isWon() ? 'won' : 'matched';
    }
    this.locked = true;
    return 'mismatch';
  }

  // Caller shows the mismatched pair briefly, then calls this to flip them
  // back and unlock the board.
  resolveMismatch() {
    this.flippedIndices = [];
    this.locked = false;
  }

  isWon() {
    return this.cards.every((c) => c.matched);
  }
}
