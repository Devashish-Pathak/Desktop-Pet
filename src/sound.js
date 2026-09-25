// Tiny synthesized sound effects via Web Audio — no audio files needed.
// The AudioContext is created lazily, on the first call, so it's always
// constructed inside a real user gesture (click, drag, menu action) and
// never trips the browser's autoplay restrictions.
let ctx;

function getContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, type = 'sine', peak = 0.12, delay = 0) {
  const audioCtx = getContext();
  const start = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playMeow() {
  tone(720, 0.12, 'sine', 0.12);
  tone(480, 0.16, 'sine', 0.1, 0.09);
}

export function playBlip() {
  tone(900, 0.06, 'triangle', 0.08);
}

export function playChime() {
  tone(880, 0.12, 'sine', 0.1);
  tone(1175, 0.18, 'sine', 0.1, 0.1);
}
