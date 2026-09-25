// Small, self-contained particle system for reactions (hearts, sparkles, Zzz).
export class Particles {
  constructor() {
    this.items = [];
  }

  spawn(x, y, glyph, color) {
    this.items.push({
      x,
      y,
      glyph,
      color,
      vy: -0.35 - Math.random() * 0.25,
      vx: (Math.random() - 0.5) * 0.3,
      life: 1,
      size: 14 + Math.random() * 6,
    });
  }

  update(dt) {
    for (const p of this.items) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt / 900;
    }
    this.items = this.items.filter((p) => p.life > 0);
  }

  draw(ctx) {
    for (const p of this.items) {
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.font = `${p.size}px sans-serif`;
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.fillText(p.glyph, p.x, p.y);
      ctx.restore();
    }
  }
}
