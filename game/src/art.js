// Twin Lanterns — all scene painting, drawn fresh with canvas primitives.
// Each painter draws one panel of a level: the base scene identical on both
// sides, then each difference drawn per side. Panel space is 600 x 600;
// (ox, oy) is the panel origin on the board canvas, side is 'L' or 'R',
// t is seconds since the level started (for gentle motion).
import { LEVELS } from './levels.js';

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}
function poly(ctx, pts, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}
function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
// A four-point sparkle star.
function sparkle(ctx, x, y, r, fill, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}
// A paper lantern with a tassel; sway tilts it a little.
function lantern(ctx, x, y, s, color, sway) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sway);
  line(ctx, 0, -14 * s, 0, -8 * s, '#3a2a1a', 2);
  ellipse(ctx, 0, 0, 13 * s, 16 * s, color);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(-3 * s, -13 * s, 3 * s, 26 * s);
  rect(ctx, -6 * s, -18 * s, 12 * s, 4 * s, '#8a6d2f');
  rect(ctx, -6 * s, 14 * s, 12 * s, 4 * s, '#8a6d2f');
  line(ctx, 0, 18 * s, 0, 30 * s, '#d8a03c', 2);
  circle(ctx, 0, 32 * s, 2.5 * s, '#d8a03c');
  ctx.restore();
}
function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.arc(x - 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}
function sittingCat(ctx, x, y, s, color) {
  // Sitting cat silhouette: body, head, ears, tail curl. y is the ground line.
  ellipse(ctx, x, y - 12 * s, 11 * s, 13 * s, color);
  circle(ctx, x + 1 * s, y - 30 * s, 8 * s, color);
  poly(ctx, [[x - 5 * s, y - 35 * s], [x - 7 * s, y - 43 * s], [x - 1 * s, y - 37 * s]], color);
  poly(ctx, [[x + 4 * s, y - 37 * s], [x + 8 * s, y - 43 * s], [x + 8 * s, y - 35 * s]], color);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4 * s;
  ctx.beginPath();
  ctx.arc(x + 12 * s, y - 4 * s, 7 * s, Math.PI * 0.9, Math.PI * 2.1);
  ctx.stroke();
}

const NIGHT_STARS = [
  [40, 60], [110, 40], [180, 90], [250, 50], [330, 70], [410, 44], [520, 60],
  [70, 130], [150, 110], [220, 140], [360, 110], [560, 130], [60, 200],
  [200, 200], [280, 230], [380, 200], [440, 250], [540, 280], [30, 260],
  [160, 260], [250, 300], [330, 280], [30, 330], [580, 340], [500, 330],
];

function paintLanternNight(ctx, ox, oy, side, t) {
  ctx.save();
  ctx.translate(ox, oy);
  const sky = ctx.createLinearGradient(0, 0, 0, 600);
  sky.addColorStop(0, '#171233');
  sky.addColorStop(0.55, '#3a1f4d');
  sky.addColorStop(1, '#5c2740');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 600);
  for (const [sx, sy] of NIGHT_STARS) {
    const tw = 0.5 + 0.5 * Math.sin(t * 1.4 + sx);
    sparkle(ctx, sx, sy, 3.2, '#ffe9b0', 0.45 + 0.45 * tw);
  }
  // The paper moon, glowing.
  const glow = ctx.createRadialGradient(468, 108, 20, 468, 108, 110);
  glow.addColorStop(0, 'rgba(255,233,168,0.55)');
  glow.addColorStop(1, 'rgba(255,233,168,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(340, 0, 260, 240);
  circle(ctx, 468, 108, 46, '#ffe9a8');
  if (side === 'L') {
    circle(ctx, 452, 96, 7, '#e8c87e');
    circle(ctx, 482, 120, 9, '#e8c87e');
    circle(ctx, 468, 128, 5, '#e8c87e');
  }
  // Far skyline silhouettes.
  ctx.fillStyle = '#241a3d';
  poly(ctx, [[0, 470], [0, 430], [60, 430], [60, 400], [120, 400], [120, 470]], '#241a3d');
  poly(ctx, [[180, 470], [180, 440], [240, 440], [240, 410], [300, 410], [300, 470]], '#241a3d');
  poly(ctx, [[330, 470], [330, 420], [420, 420], [420, 470]], '#241a3d');
  // Tall house on the left, with two windows.
  rect(ctx, 56, 252, 104, 218, '#2c1e3e');
  poly(ctx, [[48, 256], [108, 212], [168, 256]], '#1c1430');
  rect(ctx, 82, 296, 22, 30, side === 'L' ? '#ffd76a' : '#241a33');
  rect(ctx, 124, 356, 22, 30, '#ffd76a');
  rect(ctx, 82, 356, 22, 30, '#3a2a55');
  // Lantern string sagging across the street.
  ctx.strokeStyle = '#1a1226';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(16, 148);
  ctx.quadraticCurveTo(300, 196, 584, 148);
  ctx.stroke();
  const drops = [90, 180, 300, 420, 510];
  const colours = ['#e23b3b', '#f2a541', '#e23b3b', '#f2a541', '#e23b3b'];
  drops.forEach((lx, i) => {
    const ly = 148 + Math.sin((lx / 600) * Math.PI) * 22 + 16;
    const sway = Math.sin(t * 0.9 + i * 1.7) * 0.06;
    const col = lx === 300 ? (side === 'L' ? '#e23b3b' : '#37b06a') : colours[i];
    lantern(ctx, lx, ly, 1, col, sway);
  });
  // Market stall 1 (left) with a striped awning; a cat sits on it, left only.
  rect(ctx, 44, 500, 196, 82, '#5a3a22');
  rect(ctx, 44, 500, 196, 10, '#7a5230');
  for (let i = 0; i < 5; i++) {
    rect(ctx, 34 + i * 44, 462, 44, 36, i % 2 === 0 ? '#f5e6c8' : '#c94f43');
  }
  rect(ctx, 34, 462, 220, 6, '#8a6d2f');
  if (side === 'L') sittingCat(ctx, 132, 462, 1, '#120e1c');
  // Market stall 2 (right); one awning stripe is missing on the right side.
  rect(ctx, 360, 500, 196, 82, '#5a3a22');
  rect(ctx, 360, 500, 196, 10, '#7a5230');
  for (let i = 0; i < 5; i++) {
    if (side === 'R' && i === 2) continue;
    rect(ctx, 350 + i * 44, 462, 44, 36, i % 2 === 0 ? '#f5e6c8' : '#c94f43');
  }
  if (side === 'R') rect(ctx, 350 + 2 * 44, 462, 44, 36, '#3a2430');
  rect(ctx, 350, 462, 220, 6, '#8a6d2f');
  // Street and a big glowing lantern in the foreground corner.
  rect(ctx, 0, 582, 600, 18, '#1a1226');
  lantern(ctx, 548, 548, 1.6, '#e23b3b', Math.sin(t * 0.7) * 0.05);
  // Extra bright star, right side only.
  if (side === 'R') sparkle(ctx, 524, 218, 8, '#ffffff', 1);
  ctx.restore();
}

function sailboat(ctx, x, y, s, sailColor, hullColor) {
  // Hull, mast and a triangular sail. (x, y) is the waterline centre.
  poly(ctx, [[x - 34 * s, y], [x + 34 * s, y], [x + 22 * s, y + 16 * s], [x - 22 * s, y + 16 * s]], hullColor);
  line(ctx, x, y - 52 * s, x, y, '#4a3220', 3 * s);
  poly(ctx, [[x + 3 * s, y - 50 * s], [x + 3 * s, y - 6 * s], [x + 34 * s, y - 6 * s]], sailColor);
  poly(ctx, [[x - 3 * s, y - 44 * s], [x - 3 * s, y - 6 * s], [x - 26 * s, y - 6 * s]], '#f5e6c8');
}
function paintHarbourDawn(ctx, ox, oy, side, t) {
  ctx.save();
  ctx.translate(ox, oy);
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#ffd9a0');
  sky.addColorStop(0.6, '#ffb37a');
  sky.addColorStop(1, '#e88a7a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 380);
  // Low sun with soft rays.
  circle(ctx, 110, 120, 34, '#fff3c4');
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + t * 0.05;
    line(ctx, 110 + Math.cos(a) * 44, 120 + Math.sin(a) * 44,
      110 + Math.cos(a) * 56, 120 + Math.sin(a) * 56, 'rgba(255,243,196,0.8)', 3);
  }
  // Gulls; one is missing on the right side.
  gull(ctx, 220, 90, 1, '#5a3a3a');
  gull(ctx, 420, 70, 0.8, '#5a3a3a');
  if (side === 'L') gull(ctx, 318, 118, 1, '#5a3a3a');
  // Sea with slow rolling wave lines.
  const sea = ctx.createLinearGradient(0, 380, 0, 600);
  sea.addColorStop(0, '#2f6f8f');
  sea.addColorStop(1, '#1d4a66');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 380, 600, 220);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 5; row++) {
    const wy = 410 + row * 36;
    ctx.beginPath();
    for (let wx = 0; wx <= 600; wx += 20) {
      const yy = wy + Math.sin(wx * 0.03 + t * 1.2 + row * 2) * 4;
      if (wx === 0) ctx.moveTo(wx, yy); else ctx.lineTo(wx, yy);
    }
    ctx.stroke();
  }
  // Lighthouse on the right: striped tower, lamp room, one window.
  poly(ctx, [[438, 380], [448, 150], [496, 150], [506, 380]], '#f5ead2');
  ctx.save();
  ctx.beginPath();
  ctx.rect(438, 150, 68, 230);
  ctx.clip();
  ctx.fillStyle = '#c94f43';
  ctx.fillRect(438, 210, 68, 34);
  ctx.fillRect(438, 300, 68, 34);
  ctx.restore();
  rect(ctx, 444, 118, 56, 32, '#3a2a3a');
  poly(ctx, [[438, 120], [472, 92], [506, 120]], '#8a2f2f');
  rect(ctx, 458, 128, 28, 20, side === 'L' ? '#ffe9a8' : '#2c2233');
  if (side === 'L') {
    const glow = ctx.createRadialGradient(472, 138, 4, 472, 138, 70);
    glow.addColorStop(0, 'rgba(255,233,168,0.9)');
    glow.addColorStop(1, 'rgba(255,233,168,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(472, 138, 70, 0, Math.PI * 2);
    ctx.fill();
  }
  rect(ctx, 460, 256, 24, 30, side === 'L' ? '#ffd76a' : '#2c2233');
  // Boats: the near one has a sail that changes colour.
  sailboat(ctx, 178, 408, 1, side === 'L' ? '#ffffff' : '#d23b3b', '#6b4226');
  sailboat(ctx, 330, 452, 0.8, '#7fb3d5', '#4a3220');
  // Buoy, right side only, bobbing on the waves.
  if (side === 'R') {
    const by = 468 + Math.sin(t * 1.5) * 3;
    poly(ctx, [[512, by + 14], [532, by + 14], [526, by - 10], [518, by - 10]], '#d23b3b');
    rect(ctx, 514, by - 16, 16, 8, '#f5ead2');
    circle(ctx, 522, by - 18, 3, '#f5ead2');
  }
  // A fish jumping out of the water, right side only.
  if (side === 'R') {
    const fy = 478 + Math.sin(t * 2) * 2;
    ctx.save();
    ctx.translate(118, fy);
    ctx.rotate(-0.6);
    ellipse(ctx, 0, 0, 16, 7, '#9fd8ef');
    poly(ctx, [[-14, 0], [-22, -7], [-22, 7]], '#7fb3d5');
    ctx.restore();
    circle(ctx, 100, 494, 2.5, '#ffffff');
    circle(ctx, 134, 496, 2.5, '#ffffff');
    circle(ctx, 118, 500, 2, '#ffffff');
  }
  // Rocks at the bottom left.
  ellipse(ctx, 60, 592, 70, 26, '#5a5a6e');
  ellipse(ctx, 130, 596, 46, 18, '#4a4a5e');
  ctx.restore();
}

function tulip(ctx, x, y, s, color) {
  line(ctx, x, y, x, y + 26 * s, '#3f7d3a', 3 * s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y - 2 * s);
  ctx.quadraticCurveTo(x - 11 * s, y - 16 * s, x - 4 * s, y - 12 * s);
  ctx.quadraticCurveTo(x, y - 20 * s, x + 4 * s, y - 12 * s);
  ctx.quadraticCurveTo(x + 11 * s, y - 16 * s, x + 9 * s, y - 2 * s);
  ctx.quadraticCurveTo(x, y + 4 * s, x - 9 * s, y - 2 * s);
  ctx.fill();
}
function teapot(ctx, x, y, s, knobColor) {
  // Body, spout, handle, lid and knob. (x, y) is the table line under it.
  ellipse(ctx, x, y - 22 * s, 30 * s, 24 * s, '#7fb3d5');
  poly(ctx, [[x - 28 * s, y - 30 * s], [x - 46 * s, y - 44 * s], [x - 40 * s, y - 26 * s]], '#7fb3d5');
  ctx.strokeStyle = '#5a8fb0';
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.arc(x + 32 * s, y - 24 * s, 12 * s, -Math.PI * 0.6, Math.PI * 0.55);
  ctx.stroke();
  ellipse(ctx, x, y - 44 * s, 18 * s, 6 * s, '#5a8fb0');
  circle(ctx, x, y - 50 * s, 6 * s, knobColor);
}
function butterfly(ctx, x, y, s, t, colorA, colorB) {
  const flap = Math.sin(t * 10) * 0.5 + 0.5;
  const bob = Math.sin(t * 2.2) * 4;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = colorA;
  ctx.beginPath();
  ctx.ellipse(-9 * s, -4 * s, 10 * s, 7 * s * (0.5 + flap * 0.5), -0.5, 0, Math.PI * 2);
  ctx.ellipse(9 * s, -4 * s, 10 * s, 7 * s * (0.5 + flap * 0.5), 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colorB;
  ctx.beginPath();
  ctx.ellipse(-8 * s, 5 * s, 7 * s, 5 * s, -0.4, 0, Math.PI * 2);
  ctx.ellipse(8 * s, 5 * s, 7 * s, 5 * s, 0.4, 0, Math.PI * 2);
  ctx.fill();
  line(ctx, 0, -8 * s, 0, 8 * s, '#3a2a1a', 2 * s);
  ctx.restore();
}
function paintGardenTea(ctx, ox, oy, side, t) {
  ctx.save();
  ctx.translate(ox, oy);
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#a8d8ef');
  sky.addColorStop(1, '#e8f7ee');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 400);
  // Sun and clouds; one cloud only on the right side.
  circle(ctx, 90, 90, 32, '#fff3c4');
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    line(ctx, 90 + Math.cos(a) * 40, 90 + Math.sin(a) * 40,
      90 + Math.cos(a) * 52, 90 + Math.sin(a) * 52, 'rgba(255,243,196,0.9)', 3);
  }
  function cloud(cx, cy, s) {
    ctx.fillStyle = '#ffffff';
    ellipse(ctx, cx, cy, 34 * s, 16 * s, '#ffffff');
    ellipse(ctx, cx - 20 * s, cy + 4 * s, 20 * s, 12 * s, '#ffffff');
    ellipse(ctx, cx + 22 * s, cy + 4 * s, 22 * s, 12 * s, '#ffffff');
  }
  cloud(250, 90, 1);
  cloud(430, 60, 0.8);
  if (side === 'R') cloud(118, 122, 0.9);
  // Fence along the back of the garden; a bird perches on it, right only.
  rect(ctx, 0, 300, 600, 10, '#8a6d4a');
  rect(ctx, 0, 336, 600, 10, '#8a6d4a');
  for (let px = 20; px < 600; px += 56) rect(ctx, px, 292, 10, 64, '#7a5c3a');
  if (side === 'R') {
    ellipse(ctx, 522, 288, 12, 9, '#5a6e8a');
    circle(ctx, 532, 278, 6, '#5a6e8a');
    poly(ctx, [[536, 276], [542, 279], [536, 281]], '#f2a541');
    line(ctx, 518, 296, 516, 300, '#3a2a1a', 2);
    line(ctx, 526, 296, 526, 300, '#3a2a1a', 2);
  }
  // Lawn.
  ctx.fillStyle = '#6fae56';
  ctx.fillRect(0, 356, 600, 244);
  ctx.fillStyle = '#5d9c48';
  for (let i = 0; i < 12; i++) {
    ellipse(ctx, 40 + i * 52, 380 + (i % 3) * 8, 30, 6, '#5d9c48');
  }
  // Round garden table with teapot and cups.
  ellipse(ctx, 300, 392, 130, 22, '#8a5a34');
  rect(ctx, 292, 410, 16, 90, '#6b4226');
  teapot(ctx, 300, 392, 1, side === 'L' ? '#d23b3b' : '#3b6ed2');
  // Cup one, both sides; cup two, left only.
  function cup(cx) {
    rect(ctx, cx - 14, 392 - 22, 28, 22, '#f5ead2');
    ctx.strokeStyle = '#c9b48f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + 16, 392 - 12, 7, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
  }
  cup(246);
  if (side === 'L') cup(372);
  // Tulip bed along the bottom; one tulip changes colour.
  const tulips = [
    [60, 520, '#e26a8a'], [138, 482, null], [200, 530, '#f2a541'],
    [280, 520, '#e26a8a'], [360, 534, '#f2a541'], [440, 520, '#e26a8a'],
    [520, 528, '#f2a541'], [570, 500, '#e26a8a'],
  ];
  for (const [tx, ty, col] of tulips) {
    const c = col === null ? (side === 'L' ? '#e26a8a' : '#f2d13c') : col;
    tulip(ctx, tx, ty, 1.1, c);
  }
  // A butterfly drifts over the flowers, left only.
  if (side === 'L') butterfly(ctx, 452, 182, 1, t, '#e26a8a', '#f2a541');
  // A tree on the right edge.
  rect(ctx, 552, 240, 18, 120, '#6b4226');
  circle(ctx, 540, 210, 42, '#4f8a44');
  circle(ctx, 576, 230, 34, '#5d9c48');
  circle(ctx, 520, 240, 26, '#5d9c48');
  ctx.restore();
}

// Paint one panel of a level. Also draws the panel frame and its label.
export function paintPanel(ctx, level, ox, oy, side, t) {
  if (level.id === 'lantern-night') paintLanternNight(ctx, ox, oy, side, t);
  else if (level.id === 'harbour-dawn') paintHarbourDawn(ctx, ox, oy, side, t);
  else paintGardenTea(ctx, ox, oy, side, t);
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 4;
  ctx.strokeRect(ox + 2, oy + 2, 596, 596);
  ctx.fillStyle = 'rgba(10,6,18,0.55)';
  ctx.fillRect(ox + 2, oy + 2, 64, 26);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(side === 'L' ? 'LEFT' : 'RIGHT', ox + 12, oy + 16);
}

export function levelById(id) {
  return LEVELS.find((l) => l.id === id);
}
