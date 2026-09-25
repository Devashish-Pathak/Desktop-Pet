// Speaks text aloud using the browser's built-in speech synthesis (offline,
// no external service, no API key). Distinct from src/sound.js, which only
// plays short non-verbal effects (meow/blip/chime).
export function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}
