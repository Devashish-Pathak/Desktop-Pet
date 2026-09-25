import { playBlip } from '../sound.js';

const CLOSE_ZONE = 42; // px from the top of the screen that triggers a quit
const REST_DROP_ZONE = 200; // px from the right edge that counts as "the bottom-right corner"

export const drag = {
  enter(pet, world) {
    pet.dragOffsetX = world.mouseX - pet.x;
    pet.dragOffsetY = world.mouseY - pet.y;
    pet.dragged = true;
    pet.closing = false;
    world.speech.say('wheee!', 1200);
    if (world.settings?.soundEffects ?? true) playBlip();
    pet.boostMood?.(3);
  },

  update(pet, dt, world) {
    if (pet.closing) return null; // quit already scheduled, ignore further input

    pet.tailPhase += dt * 0.02;
    pet.x = Math.max(20, Math.min(world.screenWidth - 20, world.mouseX - pet.dragOffsetX));
    // no upper-side (top) clamp here: letting the pet reach y=0 is what lets it hit the close
    // zone below. The ground is still a hard floor, so it can never be dragged off the bottom.
    pet.y = Math.min(world.groundY, world.mouseY - pet.dragOffsetY);

    const topOfPet = pet.y - pet.height;
    if (topOfPet <= CLOSE_ZONE) {
      pet.closing = true;
      world.speech.say('bye!', 500);
      world.particles.spawn(pet.x, pet.y - pet.height, '💨', '#cfd8e3');
      world.particles.spawn(pet.x - 10, pet.y - pet.height + 8, '💨', '#cfd8e3');
      world.particles.spawn(pet.x + 10, pet.y - pet.height + 4, '💨', '#cfd8e3');
      setTimeout(() => world.quitApp(), 250);
      return null;
    }

    if (!world.mouseDown) {
      pet.dragged = false;
      world.savePetX(pet.x);
      // Dropped near the bottom-right corner — land straight into rest
      // instead of wandering back out. The actual landing (ground snap,
      // "plop!"/"zzz..." bubble, dust puff) happens in fall.js once it
      // actually reaches the ground — see pet.landTarget there.
      pet.landTarget = world.screenWidth - pet.x <= REST_DROP_ZONE ? 'rest' : 'idle';
      return 'fall';
    }
    return null;
  },
};
