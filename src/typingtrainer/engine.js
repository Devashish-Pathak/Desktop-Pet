import { pickWords } from './words.js';

const REFILL_BATCH = 50; // how many more words to generate when time mode runs low

// Pure typing-test state machine — no DOM/Electron dependencies, so it's
// directly unit-testable under plain Node.
export class TypingTest {
  constructor(words, mode, limit) {
    this.words = words; // array of target words
    this.mode = mode; // 'time' | 'words'
    this.limit = limit; // seconds (time mode) or word count (words mode)
    this.wordIndex = 0;
    this.typed = ['']; // typed[i] = what the user actually typed for word i
    this.startTime = null;
    this.endTime = null;
    this.finished = false;
  }

  get currentWord() {
    return this.words[this.wordIndex] ?? '';
  }

  typeChar(ch) {
    if (this.finished) return;
    if (!this.startTime) this.startTime = Date.now();
    this.typed[this.wordIndex] += ch;
  }

  backspace() {
    if (this.finished) return;
    const cur = this.typed[this.wordIndex];
    if (cur.length > 0) this.typed[this.wordIndex] = cur.slice(0, -1);
  }

  submitWord() {
    if (this.finished) return;
    if (this.typed[this.wordIndex].length === 0) return; // ignore space on an empty word
    this.wordIndex++;

    if (this.mode === 'words' && this.wordIndex >= this.limit) {
      this.finish();
      return;
    }

    this.typed.push('');
    if (this.wordIndex >= this.words.length - 5) {
      this.words = this.words.concat(pickWords(REFILL_BATCH));
    }
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.endTime = Date.now();
  }

  elapsedSeconds() {
    if (!this.startTime) return 0;
    return ((this.endTime ?? Date.now()) - this.startTime) / 1000;
  }

  // WPM/accuracy from the final state of everything actually typed —
  // "correct" = matches the target word's spelling at that position,
  // "extra" = typed past the end of the target word, "missed" = never
  // typed (only counted for words that were actually submitted).
  results() {
    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;

    for (let i = 0; i < this.typed.length; i++) {
      const typedWord = this.typed[i];
      if (!typedWord) continue;
      const target = this.words[i] ?? '';

      for (let j = 0; j < typedWord.length; j++) {
        if (j < target.length) {
          if (typedWord[j] === target[j]) correctChars++;
          else incorrectChars++;
        } else {
          extraChars++;
        }
      }

      if (i < this.wordIndex && typedWord.length < target.length) {
        missedChars += target.length - typedWord.length;
      }
    }

    const totalTypedChars = correctChars + incorrectChars + extraChars;
    const minutes = Math.max(this.elapsedSeconds() / 60, 1e-9);
    const wpm = (correctChars / 5) / minutes;
    const rawWpm = (totalTypedChars / 5) / minutes;
    const accuracy = totalTypedChars > 0 ? (correctChars / totalTypedChars) * 100 : 100;

    return {
      wpm: Math.round(wpm),
      rawWpm: Math.round(rawWpm),
      accuracy: Math.round(accuracy * 10) / 10,
      correctChars,
      incorrectChars,
      extraChars,
      missedChars,
      timeSeconds: Math.round(this.elapsedSeconds() * 10) / 10,
      wordsTyped: this.wordIndex,
    };
  }
}

export function createTest(mode, limit) {
  const initialCount = mode === 'words' ? limit : 100;
  return new TypingTest(pickWords(initialCount), mode, limit);
}
