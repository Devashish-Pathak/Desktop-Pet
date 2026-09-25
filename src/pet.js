import { BehaviorManager } from './behaviors/index.js';

const MOOD_DECAY_PER_MS = 100 / (30 * 60 * 1000); // drifts from 100 to 0 over ~30 min of no interaction

export class Pet {
  constructor(x, groundY) {
    this.x = x;
    this.y = groundY; // feet position
    this.width = 60;
    this.height = 52;
    this.facing = 1;

    this.walkPhase = 0;
    this.tailPhase = 0;
    this.breathPhase = Math.random() * Math.PI * 2;
    this.stateTimer = 0;

    this.blink = false;
    this.blinkTimer = 2000 + Math.random() * 2000;

    this.hovered = false;
    this.dragged = false;
    this.accessory = 'none';

    this.mood = 70; // 0-100, decays slowly over time, boosted by interaction — see boostMood()

    this.behavior = new BehaviorManager('idle');
  }

  get state() {
    return this.behavior.current;
  }

  hitTest(mouseX, mouseY, padding = 6) {
    const left = this.x - this.width / 2 - padding;
    const right = this.x + this.width / 2 + padding;
    const top = this.y - this.height - padding;
    const bottom = this.y + padding;
    return mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom;
  }

  boostMood(amount) {
    this.mood = Math.max(0, Math.min(100, this.mood + amount));
  }

  // Jump straight into a behavior, bypassing whatever its update() would
  // normally return. Used for anything triggered directly by user input
  // (starting a drag, starting a minigame) rather than a natural transition.
  forceState(name, world) {
    this.behavior.current = name;
    this.behavior.enter(this, world);
  }

  startDrag(world) {
    this.forceState('drag', world);
  }

  update(dt, world) {
    this.behavior.update(this, dt, world);

    this.breathPhase += dt * 0.0016;
    this.mood = Math.max(0, this.mood - dt * MOOD_DECAY_PER_MS);

    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.blink = !this.blink;
      this.blinkTimer = this.blink ? 120 : 2200 + Math.random() * 2500;
    }
  }
}
