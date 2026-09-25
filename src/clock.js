import { speak } from './voice.js';

// Announces the current time (from the system clock) once, right at the top
// of every hour, using the existing speech-bubble system.
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function startHourlyAnnouncements(world) {
  function announce() {
    if (world.settings?.hourlyAnnouncements ?? true) {
      const name = world.settings?.petName;
      const prefix = name ? `${name} says: ` : '';
      const text = `${prefix}it's ${formatTime(new Date())}`;
      world.speech.say(text, 4000);
      if (world.settings?.voiceEnabled ?? true) speak(text);
    }
    scheduleNext();
  }

  function scheduleNext() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(now.getHours() + 1, 0, 0, 0); // top of the next hour
    setTimeout(announce, next - now);
  }

  scheduleNext();
}
