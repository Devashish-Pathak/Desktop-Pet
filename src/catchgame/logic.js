// Pure catch-the-falling-treats game state — no DOM dependencies, directly
// testable. Coordinates are in an abstract "play field" space; the UI maps
// that to canvas pixels.
// Falling treats spend ~3-6s in the air at these speeds (ground is ~290px
// down), which is much longer than the old spawn interval — so even on easy,
// 4-5 treats would be in the air simultaneously (arrival rate x time-in-
// system). maxOnScreen puts a hard cap on that so "easy" actually means one
// treat to track at a time, not a wall of them.
const DIFFICULTIES = {
  easy: { speedMin: 0.05, speedMax: 0.07, spawnMin: 900, spawnMax: 1400, maxMisses: 6, maxOnScreen: 1 },
  medium: { speedMin: 0.09, speedMax: 0.15, spawnMin: 450, spawnMax: 750, maxMisses: 3, maxOnScreen: 2 },
  hard: { speedMin: 0.13, speedMax: 0.22, spawnMin: 300, spawnMax: 550, maxMisses: 3, maxOnScreen: 3 },
};

export class CatchGame {
  constructor(width, difficulty = 'medium') {
    this.width = width;
    this.difficulty = DIFFICULTIES[difficulty] ? difficulty : 'medium';
    this.catcherWidth = 70;
    this.catcherX = width / 2;
    this.treats = []; // { x, y, speed }
    this.score = 0;
    this.misses = 0;
    this.over = false;
    this.spawnTimer = 300;
  }

  get maxMisses() {
    return DIFFICULTIES[this.difficulty].maxMisses;
  }

  moveCatcherTo(x) {
    this.catcherX = Math.max(this.catcherWidth / 2, Math.min(this.width - this.catcherWidth / 2, x));
  }

  moveCatcherBy(dx) {
    this.moveCatcherTo(this.catcherX + dx);
  }

  update(dt, groundY) {
    if (this.over) return;

    const cfg = DIFFICULTIES[this.difficulty];
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.treats.length < cfg.maxOnScreen) {
      this.treats.push({
        x: 20 + Math.random() * (this.width - 40),
        y: 0,
        speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
      });
      this.spawnTimer = cfg.spawnMin + Math.random() * (cfg.spawnMax - cfg.spawnMin);
    }

    const remaining = [];
    for (const t of this.treats) {
      t.y += t.speed * dt;
      if (t.y >= groundY) {
        if (Math.abs(t.x - this.catcherX) <= this.catcherWidth / 2) {
          this.score++;
        } else {
          this.misses++;
          if (this.misses >= this.maxMisses) this.over = true;
        }
      } else {
        remaining.push(t);
      }
    }
    this.treats = remaining;
  }
}
