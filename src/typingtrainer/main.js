import { createTest } from './engine.js';

const modeGroup = document.getElementById('modeGroup');
const timeValues = document.getElementById('timeValues');
const wordValues = document.getElementById('wordValues');
const liveStat = document.getElementById('liveStat');
const typingArea = document.getElementById('typingArea');
const wordsEl = document.getElementById('wordsEl');
const caretEl = document.getElementById('caret');
const hintEl = document.getElementById('hint');
const resultsEl = document.getElementById('results');
const resWpm = document.getElementById('resWpm');
const resAcc = document.getElementById('resAcc');
const resRaw = document.getElementById('resRaw');
const resTime = document.getElementById('resTime');
const restartBtn = document.getElementById('restartBtn');

let mode = 'time';
let value = 30;
let test = null;
let tickTimer = null;
let remainingSeconds = 0;

function selectGroup(group, current) {
  [...group.querySelectorAll('button')].forEach((btn) => {
    const key = group === modeGroup ? btn.dataset.mode : String(btn.dataset.value);
    btn.classList.toggle('selected', key === String(current));
  });
}

function stopTimer() {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function startTimer() {
  remainingSeconds = value;
  liveStat.textContent = remainingSeconds;
  tickTimer = setInterval(() => {
    remainingSeconds -= 1;
    liveStat.textContent = Math.max(remainingSeconds, 0);
    if (remainingSeconds <= 0) {
      stopTimer();
      test.finish();
      showResults();
    }
  }, 1000);
}

function renderWords() {
  wordsEl.innerHTML = '';
  wordsEl.appendChild(caretEl);

  const renderEnd = Math.max(test.wordIndex + 40, 60);
  test.words.slice(0, renderEnd).forEach((word, i) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word' + (i === test.wordIndex ? ' current' : '');
    const typed = test.typed[i] || '';

    for (let j = 0; j < word.length; j++) {
      const charEl = document.createElement('span');
      charEl.className = 'char';
      charEl.textContent = word[j];
      if (i < test.wordIndex || j < typed.length) {
        charEl.classList.add(typed[j] === word[j] ? 'correct' : 'incorrect');
      }
      wordEl.appendChild(charEl);
    }
    for (let j = word.length; j < typed.length; j++) {
      const extraEl = document.createElement('span');
      extraEl.className = 'char extra';
      extraEl.textContent = typed[j];
      wordEl.appendChild(extraEl);
    }

    wordsEl.appendChild(wordEl);
  });

  positionCaret();
}

function positionCaret() {
  // wordsEl's first "word" child comes right after the caret element itself
  const currentWordEl = wordsEl.querySelectorAll('.word')[test.wordIndex];
  if (!currentWordEl) return;

  const containerRect = wordsEl.getBoundingClientRect();
  const typedLen = test.typed[test.wordIndex].length;
  const charEls = currentWordEl.querySelectorAll('.char');

  let refRect;
  let atStart = true;
  if (typedLen > 0 && charEls[typedLen - 1]) {
    refRect = charEls[typedLen - 1].getBoundingClientRect();
    atStart = false;
  } else {
    refRect = currentWordEl.getBoundingClientRect();
  }

  const left = atStart ? refRect.left - containerRect.left : refRect.right - containerRect.left;
  const top = refRect.top - containerRect.top;
  caretEl.style.height = `${refRect.height}px`;
  caretEl.style.transform = `translate(${left}px, ${top}px)`;

  // keep the current line within the visible window
  typingArea.scrollTop = currentWordEl.offsetTop - 4;
}

function updateLiveStat() {
  if (mode === 'words') liveStat.textContent = `${test.wordIndex}/${value}`;
}

function showResults() {
  stopTimer();
  const r = test.results();
  resWpm.textContent = r.wpm;
  resAcc.textContent = `${r.accuracy}%`;
  resRaw.textContent = r.rawWpm;
  resTime.textContent = `${r.timeSeconds}s`;
  window.typingAPI?.recordStat('typingResult', r.wpm);
  resultsEl.classList.remove('hidden');
  typingArea.classList.add('hidden');
  hintEl.classList.add('hidden');
}

function restart() {
  stopTimer();
  test = createTest(mode, value);
  resultsEl.classList.add('hidden');
  typingArea.classList.remove('hidden');
  hintEl.classList.remove('hidden');
  liveStat.textContent = mode === 'time' ? value : `0/${value}`;
  renderWords();
}

function setMode(newMode) {
  mode = newMode;
  selectGroup(modeGroup, newMode);
  timeValues.classList.toggle('hidden', newMode !== 'time');
  wordValues.classList.toggle('hidden', newMode !== 'words');
  const group = newMode === 'time' ? timeValues : wordValues;
  const selectedBtn = group.querySelector('button.selected') || group.querySelector('button');
  value = Number(selectedBtn.dataset.value);
  selectGroup(group, value);
  window.typingAPI?.setSettings({ typingMode: mode });
  restart();
}

function setValue(newValue) {
  value = newValue;
  selectGroup(mode === 'time' ? timeValues : wordValues, value);
  window.typingAPI?.setSettings(mode === 'time' ? { typingTimeValue: value } : { typingWordValue: value });
  restart();
}

modeGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-mode]');
  if (btn) setMode(btn.dataset.mode);
});
timeValues.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-value]');
  if (btn) setValue(Number(btn.dataset.value));
});
wordValues.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-value]');
  if (btn) setValue(Number(btn.dataset.value));
});
restartBtn.addEventListener('click', restart);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    restart();
    return;
  }

  if (!test || test.finished) return;

  if (e.key === 'Backspace') {
    e.preventDefault();
    test.backspace();
    renderWords();
    return;
  }

  if (e.key === ' ') {
    e.preventDefault();
    test.submitWord();
    updateLiveStat();
    if (test.finished) showResults();
    else renderWords();
    return;
  }

  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    const alreadyStarted = !!test.startTime;
    test.typeChar(e.key);
    if (!alreadyStarted && mode === 'time') startTimer();
    renderWords();
  }
});

async function init() {
  let saved = { typingMode: 'time', typingTimeValue: 30, typingWordValue: 25 };
  try {
    saved = { ...saved, ...(await window.typingAPI.getSettings()) };
  } catch {
    // typingAPI unavailable — fall back to defaults above
  }
  mode = saved.typingMode;
  value = mode === 'time' ? saved.typingTimeValue : saved.typingWordValue;
  selectGroup(modeGroup, mode);
  timeValues.classList.toggle('hidden', mode !== 'time');
  wordValues.classList.toggle('hidden', mode !== 'words');
  selectGroup(mode === 'time' ? timeValues : wordValues, value);
  restart();
}

init();
