const SPEED = 0.35; // px/ms — a 2D travel speed, faster than walking since it covers more ground
const ARRIVE_DISTANCE = 12;

// Used by the Tic Tac Toe minigame: the pet leaves the ground, walks in a
// straight line to an arbitrary on-screen point (a board cell, which lives
// in a different window), "stamps" its mark there, then returns to exactly
// where it started before resuming normal behavior. Unlike ground-locked
// behaviors, this one deliberately does NOT pin pet.y to world.groundY while
// traveling — that's what lets it leave the ground to reach the board.
export const boardVisit = {
  enter(pet, world) {
    pet.visitHomeX = pet.x;
    pet.visitHomeY = pet.y;
    pet.visitPhase = 'toBoard';
    pet.visitTargetX = world.tttTarget.x;
    pet.visitTargetY = world.tttTarget.y;
    // See fetch.js for why this matters: a stale hover flag from just before
    // this was triggered shouldn't be able to interfere with anything here
    // (this behavior doesn't even check hover, but keep it consistent).
    pet.hovered = false;
  },

  update(pet, dt, world) {
    pet.walkPhase += dt * 0.014;
    pet.tailPhase += dt * 0.012;

    const targetX = pet.visitPhase === 'toBoard' ? pet.visitTargetX : pet.visitHomeX;
    const targetY = pet.visitPhase === 'toBoard' ? pet.visitTargetY : pet.visitHomeY;
    const dx = targetX - pet.x;
    const dy = targetY - pet.y;
    const dist = Math.hypot(dx, dy);
    pet.facing = dx >= 0 ? 1 : -1;

    if (dist < ARRIVE_DISTANCE) {
      if (pet.visitPhase === 'toBoard') {
        world.particles.spawn(pet.x, pet.y - pet.height, '✨', '#f2c94c');
        world.notifyStamped?.();
        pet.visitPhase = 'toHome';
        return null;
      }
      pet.y = world.groundY; // back on solid ground
      return 'idle';
    }

    const speed = SPEED * (world.settings?.walkSpeed ?? 1);
    pet.x += (dx / dist) * speed * dt;
    pet.y += (dy / dist) * speed * dt;
    return null;
  },
};
