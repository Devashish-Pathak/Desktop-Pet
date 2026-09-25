import { playChime } from '../sound.js';

const SPEED = 0.06; // a little faster than a normal walk — it's excited
const MARGIN = 60; // how close to the screen edge the ball is allowed to land
const MIN_THROW = 280; // never drop the ball closer than this to the pet

// A small minigame triggered from the right-click/tray menu: a ball drops
// somewhere on screen, the pet runs to grab it, then runs back to where it
// started. `world.ball` is owned by this behavior — main.js just draws it
// when present.
export const fetchGame = {
  enter(pet, world) {
    pet.fetchHomeX = pet.x;
    pet.fetchPhase = 'toBall';
    // Triggering fetch from the right-click menu requires hovering the pet
    // first, but Electron's native menu doesn't send mousemove events to the
    // renderer while it's open — so `pet.hovered` is often still stale-true
    // the instant this behavior starts. Reset it so update()'s hover-cancel
    // check (below) doesn't immediately abort the game before it's visible;
    // the next real mousemove reconciles it correctly either way.
    pet.hovered = false;

    // Throw the ball toward whichever side of the screen has more room, so
    // it always lands a real distance away instead of sometimes appearing
    // right next to the pet.
    const distLeft = pet.x - MARGIN;
    const distRight = world.screenWidth - MARGIN - pet.x;
    const throwRight = distRight >= distLeft;
    const available = Math.max(0, throwRight ? distRight : distLeft);
    const distance = Math.min(available, MIN_THROW + Math.random() * 200);
    const ballX = throwRight ? pet.x + distance : pet.x - distance;

    world.ball = { x: Math.max(MARGIN, Math.min(world.screenWidth - MARGIN, ballX)), y: world.groundY };
    world.speech.say('fetch!', 900);
  },

  update(pet, dt, world) {
    pet.y = world.groundY; // always stand on the ground, never drift off it
    pet.walkPhase += dt * 0.016;
    pet.tailPhase += dt * 0.01;

    if (pet.hovered) {
      // interrupted by a pet — drop the game and say hi like normal
      world.ball = null;
      return 'idle';
    }

    const speed = SPEED * (world.settings?.walkSpeed ?? 1);

    if (pet.fetchPhase === 'toBall') {
      const dx = world.ball.x - pet.x;
      pet.facing = dx >= 0 ? 1 : -1;
      if (Math.abs(dx) < 10) {
        world.ball = null;
        world.particles.spawn(pet.x, pet.y - pet.height, '✨', '#f2c94c');
        world.speech.say('got it!', 700);
        pet.fetchPhase = 'return';
        return null;
      }
      pet.x += Math.sign(dx) * speed * dt;
      return null;
    }

    // fetchPhase === 'return'
    const dxHome = pet.fetchHomeX - pet.x;
    pet.facing = dxHome >= 0 ? 1 : -1;
    if (Math.abs(dxHome) < 10) {
      if (world.settings?.soundEffects ?? true) playChime();
      world.speech.say('tada!', 900);
      world.recordStat?.('fetchComplete');
      pet.boostMood?.(10);
      return 'idle';
    }
    pet.x += Math.sign(dxHome) * speed * dt;
    pet.x = Math.max(20, Math.min(world.screenWidth - 20, pet.x));
    return null;
  },
};
