const NIGHT_START_HOUR = 23;
const NIGHT_END_HOUR = 6;
const LOW_MOOD_THRESHOLD = 30;

function isNightTime() {
  const hour = new Date().getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

export const idle = {
  enter(pet) {
    pet.stateTimer = 1500 + Math.random() * 2500;
    if (pet.microAnimTimer === undefined) pet.microAnimTimer = 800 + Math.random() * 1500;
  },

  update(pet, dt, world) {
    pet.y = world.groundY; // always stand on the ground, never drift off it
    pet.stateTimer -= dt;
    pet.tailPhase += dt * 0.0015;

    // Occasional stretch/yawn/groom so idle doesn't look frozen — purely
    // cosmetic, read by draw.js only while state === 'idle'.
    if (pet.microAnim) {
      pet.microPhase += dt / pet.microDuration;
      if (pet.microPhase >= 1) pet.microAnim = null;
    } else {
      pet.microAnimTimer -= dt;
      if (pet.microAnimTimer <= 0) {
        pet.microAnimTimer = 3000 + Math.random() * 4000;
        if (Math.random() < 0.4) {
          const kinds = ['stretch', 'yawn', 'groom'];
          pet.microAnim = kinds[Math.floor(Math.random() * kinds.length)];
          pet.microPhase = 0;
          pet.microDuration = 900 + Math.random() * 500;
        }
      }
    }

    if (pet.stateTimer <= 0) {
      // Late at night, or when it's been ignored for a while (low mood),
      // it's noticeably more likely to go rest than to wander off — a
      // simple day/sleep rhythm layered on top of the existing corner-rest
      // behavior, rather than a whole separate "asleep" state.
      const sleepy = isNightTime() || (pet.mood ?? 70) < LOW_MOOD_THRESHOLD;
      const walkChance = sleepy ? 0.25 : 0.55;
      const restChance = sleepy ? 0.5 : 0.15;

      const roll = Math.random();
      if (roll < walkChance) return 'walk';
      if (roll < walkChance + restChance) return 'rest';
      pet.stateTimer = 1000 + Math.random() * 2000; // stay idle a bit longer
    }
    return null;
  },
};
