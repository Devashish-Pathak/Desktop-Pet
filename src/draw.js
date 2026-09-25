// Procedural renderer for a small chibi pet. No image assets needed;
// swap this out for a sprite sheet later without touching behavior code.
const PALETTES = {
  orange: { body: '#f2a65a', belly: '#fbe3c2', outline: '#8a5a2b' },
  gray: { body: '#9aa3ad', belly: '#e4e8ec', outline: '#4b5157' },
  charcoal: { body: '#4b4f58', belly: '#8b8f99', outline: '#1f2125' },
  cream: { body: '#f0e4cf', belly: '#fff9ef', outline: '#b7a680' },
};

let palette = PALETTES.orange;
let skin = 'cat'; // 'cat' | 'dog'

export function setPalette(name) {
  palette = PALETTES[name] || PALETTES.orange;
}

export function setSkin(name) {
  skin = name === 'dog' ? 'dog' : 'cat';
}

// `paletteOverride` lets a second, independently-styled pet (see src/friend.js)
// reuse this same renderer without touching the module-level palette/skin
// that the main pet's settings drive. `lookAt` (optional {x, y} in the same
// world/screen space as x/y) makes the eyes glance toward that point —
// typically the mouse cursor, for a "this thing is watching you" effect.
export function drawPet(ctx, pet, paletteOverride, lookAt) {
  const { x, y, facing, state, hovered, blink, walkPhase, tailPhase, dragged, accessory } = pet;
  const w = pet.width;
  const h = pet.height;
  const mood = pet.mood ?? 70;
  const activePalette = paletteOverride ? PALETTES[paletteOverride] || palette : palette;
  const BODY_COLOR = activePalette.body;
  const BELLY_COLOR = activePalette.belly;
  const OUTLINE = activePalette.outline;

  ctx.save();
  ctx.translate(x, y); // (x, y) = feet / ground contact point
  ctx.scale(facing, 1);

  const moving = state === 'walk' || state === 'rest';

  // Occasional idle stretch/yawn/groom — purely cosmetic, only while truly
  // idle so it can never bleed into another behavior's pose.
  const micro = state === 'idle' ? pet.microAnim : null;
  const microT = micro ? Math.sin(Math.min(pet.microPhase, 1) * Math.PI) : 0; // smooth 0→1→0 envelope

  // A gentle continuous breathing scale while it's just standing there doing
  // nothing else — fills the "dead frame" between micro-animations. Folded
  // into the walk-bob squash factor below since the two never apply at once.
  const breathing = !moving && !micro ? 1 + Math.sin(pet.breathPhase ?? 0) * 0.015 : 1;
  const squash = (moving ? 1 + Math.sin(walkPhase) * 0.04 : 1) * breathing;

  // Eyes glance toward lookAt (e.g. the cursor), converted from world space
  // into this canvas's local (translated + facing-flipped) coordinate space.
  let pupilDX = 0;
  let pupilDY = 0;
  if (lookAt) {
    const worldDX = lookAt.x - x;
    const worldDY = lookAt.y - y;
    const dist = Math.hypot(worldDX, worldDY) || 1;
    const maxPupilOffset = 1.6;
    pupilDX = (worldDX / dist) * maxPupilOffset * facing; // facing flips local x
    pupilDY = (worldDY / dist) * maxPupilOffset;
  }

  ctx.save();

  // tail
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  if (skin === 'dog') {
    // short, fast, side-to-side wag near the back of the body
    const wag = Math.sin(tailPhase * 3.2) * 0.6;
    ctx.save();
    ctx.translate(-w * 0.36, -h * 0.42);
    ctx.rotate(wag);
    ctx.fillStyle = BODY_COLOR;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
    drawEllipse(ctx, 0, -6, 5, 11, true);
    ctx.restore();
  } else {
    ctx.beginPath();
    const tailWag = Math.sin(tailPhase) * 0.35;
    ctx.moveTo(-w * 0.32, -h * 0.35);
    ctx.quadraticCurveTo(
      -w * 0.75,
      -h * (0.55 + tailWag * 0.3),
      -w * 0.6 - 6,
      -h * (0.95 + tailWag * 0.2)
    );
    ctx.strokeStyle = BODY_COLOR;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // legs (simple bobbing ellipses)
  const legOffset = moving ? Math.sin(walkPhase) * 4 : 0;
  ctx.fillStyle = BODY_COLOR;
  if (micro === 'stretch') {
    // front legs reach forward, back legs stay put — classic stretch
    drawEllipse(ctx, -w * (0.2 + microT * 0.35), -4 + microT * 2, 8, 6);
    drawEllipse(ctx, w * 0.2, -4, 8, 6);
  } else if (micro === 'groom') {
    // one paw lifts up toward the face
    drawEllipse(ctx, -w * 0.2, -4 - microT * (h * 0.4), 7, 6);
    drawEllipse(ctx, w * 0.2, -4, 8, 6);
  } else {
    drawEllipse(ctx, -w * 0.2, -4 + legOffset * 0.3, 8, 6);
    drawEllipse(ctx, w * 0.2, -4 - legOffset * 0.3, 8, 6);
  }

  // body — stretch elongates it, yawn puffs it up slightly
  const stretchX = micro === 'stretch' ? 1 + microT * 0.25 : 1;
  const yawnPuff = micro === 'yawn' ? 1 + microT * 0.08 : 1;
  ctx.fillStyle = BODY_COLOR;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  drawEllipse(ctx, 0, -h * 0.55 * squash, w * 0.42 * stretchX, h * 0.5 * squash * yawnPuff, true);

  // belly
  ctx.fillStyle = BELLY_COLOR;
  drawEllipse(ctx, 0, -h * 0.45 * squash, w * 0.26 * stretchX, h * 0.32 * squash * yawnPuff);

  // snout (dog only)
  if (skin === 'dog') {
    ctx.fillStyle = BELLY_COLOR;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
    drawEllipse(ctx, -w * 0.3, -h * 0.52 * squash, 8, 6, true);
  }

  // ears
  ctx.fillStyle = BODY_COLOR;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  if (skin === 'dog') {
    // floppy ears hanging down either side of the head
    drawFloppyEar(ctx, -w * 0.32, -h * 0.85, -0.35);
    drawFloppyEar(ctx, w * 0.16, -h * 0.85, 0.35);
  } else {
    triangle(ctx, -w * 0.28, -h * 0.92, 14, 16, -0.25);
    triangle(ctx, w * 0.1, -h * 0.92, 14, 16, 0.25);
  }

  // accessory — sits on top of everything drawn so far, under the face
  if (accessory && accessory !== 'none') {
    drawAccessory(ctx, accessory, w, h, squash);
  }

  // face
  const eyeY = -h * 0.6 * squash;
  const moodEyeAdjust = ((mood - 50) / 50) * 0.6; // sleepier/smaller eyes when mood is low, brighter/bigger when high
  const eyeSize = (hovered ? 5.5 : 4) + moodEyeAdjust;
  ctx.fillStyle = '#2b2b2b';
  if (blink || micro === 'yawn') {
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 2;
    line(ctx, -w * 0.12 - 4, eyeY, -w * 0.12 + 4, eyeY);
    line(ctx, w * 0.02 - 4, eyeY, w * 0.02 + 4, eyeY);
  } else {
    drawEllipse(ctx, -w * 0.12 + pupilDX, eyeY + pupilDY, eyeSize * 0.6, eyeSize);
    drawEllipse(ctx, w * 0.02 + pupilDX, eyeY + pupilDY, eyeSize * 0.6, eyeSize);
  }

  // yawning mouth
  if (micro === 'yawn') {
    ctx.fillStyle = '#7a4a3a';
    drawEllipse(ctx, -w * 0.05, eyeY + 9 + microT * 3, 3 + microT * 2, 2 + microT * 3);
  }

  // blush when hovered/happy, or just a faint glow when mood is especially high
  if (hovered || dragged || mood >= 88) {
    ctx.fillStyle = hovered || dragged ? 'rgba(255,120,120,0.45)' : 'rgba(255,120,120,0.18)';
    drawEllipse(ctx, -w * 0.22, eyeY + 8, 4, 2.5);
    drawEllipse(ctx, w * 0.12, eyeY + 8, 4, 2.5);
  }

  ctx.restore();
  ctx.restore();
}

function drawAccessory(ctx, accessory, w, h, squash) {
  const neckY = -h * 0.4 * squash;

  if (accessory === 'hat') {
    ctx.save();
    ctx.translate(0, -h * 0.9 * squash);
    ctx.fillStyle = '#d1554a';
    ctx.strokeStyle = '#8a3a32';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(11, 0);
    ctx.lineTo(0, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    drawEllipse(ctx, 0, -6, 3.5, 2.5);
    ctx.fillStyle = '#f2c94c';
    drawEllipse(ctx, 0, -22, 3, 3, true);
    ctx.restore();
    return;
  }

  if (accessory === 'bandana') {
    ctx.save();
    ctx.fillStyle = '#4b7bec';
    ctx.strokeStyle = '#2f5bb0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.24, neckY - 6);
    ctx.lineTo(w * 0.24, neckY - 6);
    ctx.lineTo(0, neckY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    drawEllipse(ctx, -6, neckY - 1, 1.8, 1.8);
    drawEllipse(ctx, 6, neckY - 1, 1.8, 1.8);
    drawEllipse(ctx, 0, neckY + 5, 1.8, 1.8);
    ctx.restore();
    return;
  }

  if (accessory === 'collar') {
    ctx.save();
    ctx.strokeStyle = '#7a4a2b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, neckY - 4, w * 0.27, 5, 0, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.fillStyle = '#f2c94c';
    drawEllipse(ctx, 0, neckY + 3, 3, 3, true);
    ctx.restore();
  }
}

function drawEllipse(ctx, x, y, rx, ry, withStroke = false) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (withStroke) ctx.stroke();
}

function drawFloppyEar(ctx, x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  drawEllipse(ctx, 0, 10, 7, 15, true);
  ctx.restore();
}

function triangle(ctx, x, y, w, h, skew) {
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + skew * h, y + h);
  ctx.lineTo(x + w / 2 + skew * h, y + h);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
