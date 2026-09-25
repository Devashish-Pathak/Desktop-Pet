const SPEED = 0.045; // px/ms
const CURIOSITY_CHANCE = 0.3;
const CURIOSITY_JITTER = 200; // px of randomness around the cursor, so it doesn't walk exactly onto it

export const walk = {
  enter(pet, world) {
    const margin = 60;
    const curious = typeof world.mouseX === 'number' && Math.random() < CURIOSITY_CHANCE;
    if (curious) {
      const jitter = (Math.random() - 0.5) * 2 * CURIOSITY_JITTER;
      pet.targetX = Math.max(margin, Math.min(world.screenWidth - margin, world.mouseX + jitter));
    } else {
      pet.targetX = margin + Math.random() * (world.screenWidth - margin * 2);
    }
    pet.facing = pet.targetX >= pet.x ? 1 : -1;
  },

  update(pet, dt, world) {
    pet.y = world.groundY; // always stand on the ground, never drift off it
    pet.walkPhase += dt * 0.012;
    pet.tailPhase += dt * 0.004;

    const dx = pet.targetX - pet.x;
    if (Math.abs(dx) < 4) return 'idle';

    pet.x += Math.sign(dx) * SPEED * (world.settings?.walkSpeed ?? 1) * dt;
    pet.x = Math.max(20, Math.min(world.screenWidth - 20, pet.x));
    return null;
  },
};
