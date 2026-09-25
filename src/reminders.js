// Runs the user's custom reminders (Settings → Reminders): each one repeats
// on its own interval, self-scheduling like the hourly clock announcement.
// applyReminders() tears down and rebuilds every timer, so callers should
// only call it when the reminders list has actually changed — see the
// remindersKey guard in src/main.js — otherwise every unrelated settings
// change (color, name, ...) would reset everyone's countdown.
import { speak } from './voice.js';

let timers = [];

function clearAll() {
  timers.forEach(clearTimeout);
  timers = [];
}

function scheduleOne(reminder, world) {
  const ms = reminder.intervalMinutes * 60 * 1000;
  const timer = setTimeout(() => {
    world.speech.say(reminder.text, 5000);
    if (world.settings?.voiceEnabled ?? true) speak(reminder.text);
    scheduleOne(reminder, world); // keep repeating on the same interval
  }, ms);
  timers.push(timer);
}

export function applyReminders(world, reminders) {
  clearAll();
  (reminders || [])
    .filter((r) => r.enabled && r.text && r.intervalMinutes > 0)
    .forEach((r) => scheduleOne(r, world));
}
