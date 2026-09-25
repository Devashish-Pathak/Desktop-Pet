import { idle } from './idle.js';
import { walk } from './walk.js';
import { rest } from './rest.js';
import { drag } from './drag.js';
import { fetchGame } from './fetch.js';
import { boardVisit } from './boardVisit.js';
import { fall } from './fall.js';

// New behaviors go here. Each must export { enter(pet, world), update(pet, dt, world) }
// where update returns the name of the next state, or null to keep the current one.
export const behaviors = { idle, walk, rest, drag, fetch: fetchGame, boardVisit, fall };

export class BehaviorManager {
  constructor(initial = 'idle') {
    this.current = initial;
  }

  enter(pet, world) {
    behaviors[this.current].enter?.(pet, world);
  }

  update(pet, dt, world) {
    const next = behaviors[this.current].update(pet, dt, world);
    if (next && next !== this.current) {
      this.current = next;
      this.enter(pet, world);
    }
  }
}
