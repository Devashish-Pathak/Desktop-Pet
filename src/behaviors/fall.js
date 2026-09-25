const GRAVITY = 0.0022; // px/ms² — tuned so a full-screen drop takes ~1s

// Entered when the pet is dropped mid-air (see drag.js). Accelerates
// downward instead of teleporting straight to the ground. `pet.landTarget`
// (set by whoever triggered the fall) decides which state it lands into —
// defaults to 'idle' if nothing set it.
export const fall = {
  enter(pet) {
    pet.fallVelocity = 0;
  },

  update(pet, dt, world) {
    pet.tailPhase += dt * 0.01;
    pet.fallVelocity += GRAVITY * dt;
    pet.y += pet.fallVelocity * dt;

    if (pet.y >= world.groundY) {
      pet.y = world.groundY;
      world.particles.spawn(pet.x - 8, pet.y - 4, '💨', '#cfd8e3');
      world.particles.spawn(pet.x + 8, pet.y - 4, '💨', '#cfd8e3');
      world.speech.say(pet.landTarget === 'rest' ? 'zzz...' : 'plop!', 900);
      const next = pet.landTarget || 'idle';
      pet.landTarget = null;
      return next;
    }
    return null;
  },
};
