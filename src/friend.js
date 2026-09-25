// A second, purely autonomous pet — no hover/drag/click support (that would
// require extending the click-through hit-testing to multiple pets, which is
// out of scope for a decorative companion). It wanders on its own and
// occasionally walks over to visit the main pet.
const WANDER_SPEED = 0.045;
const GREET_CHANCE = 0.3;
const GREET_MIN_DISTANCE = 150; // don't bother "visiting" if already this close

export class Friend {
  constructor(x, groundY) {
    this.x = x;
    this.y = groundY;
    this.width = 60;
    this.height = 52;
    this.facing = 1;
    this.walkPhase = 0;
    this.tailPhase = 0;
    this.breathPhase = Math.random() * Math.PI * 2;
    this.blink = false;
    this.blinkTimer = 2000 + Math.random() * 2000;
    this.hovered = false; // never set true — draw.js reads it for the blush effect only
    this.dragged = false;
    this.accessory = 'none';
    this.state = 'idle';
    this.stateTimer = 1500 + Math.random() * 2500;
    this.targetX = x;
    this.greeting = false;
  }

  update(dt, world, companion) {
    this.breathPhase += dt * 0.0016;
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.blink = !this.blink;
      this.blinkTimer = this.blink ? 120 : 2200 + Math.random() * 2500;
    }
    this.y = world.groundY;

    if (this.state === 'idle') {
      this.tailPhase += dt * 0.0015;
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        const canGreet = companion && Math.abs(companion.x - this.x) > GREET_MIN_DISTANCE;
        if (canGreet && Math.random() < GREET_CHANCE) {
          this.greeting = true;
          this.targetX = companion.x + (companion.x < this.x ? 70 : -70);
        } else {
          this.greeting = false;
          const margin = 60;
          this.targetX = margin + Math.random() * (world.screenWidth - margin * 2);
        }
        this.facing = this.targetX >= this.x ? 1 : -1;
        this.state = 'walk';
      }
      return;
    }

    // state === 'walk' (covers both random wandering and greeting-approach —
    // kept as one state so it matches draw.js's existing "moving" pose check)
    this.walkPhase += dt * 0.012;
    this.tailPhase += dt * 0.004;
    const dx = this.targetX - this.x;
    if (Math.abs(dx) < 4) {
      if (this.greeting && companion) {
        world.particles.spawn((this.x + companion.x) / 2, this.y - this.height, '💛', '#f2c94c');
      }
      this.state = 'idle';
      this.stateTimer = (this.greeting ? 1000 : 1500) + Math.random() * 2000;
      this.greeting = false;
      return;
    }
    this.x += Math.sign(dx) * WANDER_SPEED * (world.settings?.walkSpeed ?? 1) * dt;
    this.x = Math.max(20, Math.min(world.screenWidth - 20, this.x));
  }
}
