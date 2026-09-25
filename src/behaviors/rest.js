const SPEED = 0.045; // px/ms, same pace as walking
const CORNER_MARGIN = 40; // how close to the bottom-right corner counts as "arrived"

// Instead of lying down wherever it happens to be, the pet walks itself to
// the bottom-right corner and idles there quietly. Any hover interaction
// wakes it up immediately, whether it's still on its way or already parked.
export const rest = {
  enter(pet, world) {
    pet.targetX = world.screenWidth - CORNER_MARGIN;
    pet.facing = pet.targetX >= pet.x ? 1 : -1;
  },

  update(pet, dt, world) {
    pet.y = world.groundY; // always stand on the ground, never drift off it

    if (pet.hovered) return 'idle'; // any interaction wakes it back up

    const dx = pet.targetX - pet.x;
    if (Math.abs(dx) > 4) {
      pet.walkPhase += dt * 0.012;
      pet.tailPhase += dt * 0.004;
      pet.x += Math.sign(dx) * SPEED * (world.settings?.walkSpeed ?? 1) * dt;
      pet.x = Math.max(20, Math.min(world.screenWidth - 20, pet.x));
      return null;
    }

    // parked in the corner: just stay put
    pet.tailPhase += dt * 0.0006;
    return null;
  },
};
