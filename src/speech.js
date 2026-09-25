// Tiny speech-bubble helper: shows a line of text above the pet for a while.
export class Speech {
  constructor() {
    this.text = '';
    this.timer = 0;
  }

  say(text, durationMs = 1800) {
    this.text = text;
    this.timer = durationMs;
  }

  update(dt) {
    if (this.timer > 0) this.timer -= dt;
  }

  get visible() {
    return this.timer > 0 && this.text;
  }

  draw(ctx, x, y) {
    if (!this.visible) return;
    ctx.save();
    ctx.font = '13px sans-serif';
    const padding = 8;
    const width = ctx.measureText(this.text).width + padding * 2;
    const height = 24;
    const margin = 4;
    const maxBx = (ctx.canvas?.width ?? Infinity) - width - margin;
    const bx = Math.max(margin, Math.min(maxBx, x - width / 2));
    const by = y - height - 14;
    // keep the tail attached to the box even when the box got nudged on-screen
    const tailX = Math.max(bx + 10, Math.min(bx + width - 10, x));

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    roundRect(ctx, bx, by, width, height, 8);
    ctx.fill();
    ctx.stroke();

    // little tail pointing at the pet
    ctx.beginPath();
    ctx.moveTo(tailX - 5, by + height);
    ctx.lineTo(tailX + 5, by + height);
    ctx.lineTo(tailX, by + height + 7);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, bx + width / 2, by + height / 2);
    ctx.restore();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
