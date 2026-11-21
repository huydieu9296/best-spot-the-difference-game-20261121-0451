// scenes.js — one clear job: draw every scene with plain canvas 2D.
// All art is original and drawn here by code: no images, no copied art.
// Each scene is painted twice. The LEFT panel is the original; the
// RIGHT panel applies every spot in config.js (the `mods` set holds the
// keys of the changes to apply). A difference is therefore a real,
// visible change between the two panels — never a trick of the eye.

import { PANEL_W, PANEL_H } from './config.js';

// --- small drawing helpers ---------------------------------------------

function disc(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function oval(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function box(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function wash(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}

function puff(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 15 * s, 0, Math.PI * 2);
  ctx.arc(x + 40 * s, y, 17 * s, 0, Math.PI * 2);
  ctx.fill();
}

function sparkle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function evergreen(ctx, x, y, s, green) {
  box(ctx, x - 4 * s, y, 8 * s, 14 * s, '#6b4a2f');
  ctx.fillStyle = green;
  for (let i = 0; i < 3; i++) {
    const w = (46 - i * 11) * s;
    const ty = y - i * 22 * s;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, ty);
    ctx.lineTo(x, ty - 30 * s);
    ctx.lineTo(x + w / 2, ty);
    ctx.closePath();
    ctx.fill();
  }
}

// --- Level 1: Lantern Garden --------------------------------------------

function paintGarden(ctx, mods) {
  wash(ctx, '#a8dcff', '#eafbe9');

  // Sun, top right. Its rays vanish in the changed panel.
  disc(ctx, 470, 64, 28, '#ffd94d');
  if (!mods.has('sunrays')) {
    ctx.strokeStyle = '#ffd94d';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(470 + Math.cos(a) * 36, 64 + Math.sin(a) * 36);
      ctx.lineTo(470 + Math.cos(a) * 48, 64 + Math.sin(a) * 48);
      ctx.stroke();
    }
  }

  puff(ctx, 120, 58, 1);
  if (!mods.has('cloud')) puff(ctx, 300, 52, 0.9);

  // Rolling hill.
  ctx.fillStyle = '#7cc46a';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(280, 250, PANEL_W, 310);
  ctx.lineTo(PANEL_W, PANEL_H);
  ctx.lineTo(0, PANEL_H);
  ctx.closePath();
  ctx.fill();

  // Big tree on the left, with two red apples.
  box(ctx, 82, 220, 16, 90, '#7a5230');
  disc(ctx, 90, 205, 42, '#3f9e4d');
  disc(ctx, 58, 225, 28, '#4cb15a');
  disc(ctx, 122, 225, 28, '#4cb15a');
  disc(ctx, 90, 180, 26, '#57bd63');
  disc(ctx, 70, 195, 8, '#e2574c');
  disc(ctx, 112, 205, 8, '#e2574c');

  // Little bird in the sky (missing in the changed panel).
  if (!mods.has('bird')) {
    ctx.strokeStyle = '#33415c';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(182, 118, 10, Math.PI * 1.15, Math.PI * 1.85);
    ctx.arc(198, 118, 10, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    disc(ctx, 190, 110, 5, '#33415c');
  }

  // Butterfly: red on the left, blue on the right.
  const wing = mods.has('butterfly') ? '#3b82f6' : '#ef4444';
  oval(ctx, 420, 184, 12, 16, wing);
  oval(ctx, 440, 184, 12, 16, wing);
  oval(ctx, 420, 200, 9, 11, wing);
  oval(ctx, 440, 200, 9, 11, wing);
  ctx.strokeStyle = '#33415c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(430, 178);
  ctx.lineTo(430, 204);
  ctx.stroke();

  // Flower row; the flower at x=140 is purple left, yellow right.
  const petals = ['#ff8fb3', '#ffffff', '#8b5cf6', '#ff8fb3', '#ffffff'];
  [60, 100, 140, 180, 220].forEach((x, i) => {
    const petal = i === 2 && mods.has('flower') ? '#facc15' : petals[i];
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5;
      disc(ctx, x + Math.cos(a) * 9, 360 + Math.sin(a) * 9, 6, petal);
    }
    disc(ctx, x, 360, 6, '#f59e0b');
    ctx.strokeStyle = '#3f9e4d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 368);
    ctx.lineTo(x, 390);
    ctx.stroke();
  });

  // Pond with a fish (the fish is gone in the changed panel).
  oval(ctx, 390, 350, 72, 24, '#7cc4e8');
  oval(ctx, 390, 350, 60, 18, '#9ad7f0');
  if (!mods.has('fish')) {
    oval(ctx, 390, 350, 14, 7, '#ff9f1c');
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.moveTo(402, 350);
    ctx.lineTo(412, 344);
    ctx.lineTo(412, 356);
    ctx.closePath();
    ctx.fill();
    disc(ctx, 382, 348, 2, '#1f2937');
  }

  // Paper lantern on its pole (tassel missing on the right).
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(290, 250);
  ctx.lineTo(290, 292);
  ctx.stroke();
  ctx.fillStyle = '#e2574c';
  ctx.beginPath();
  ctx.ellipse(290, 306, 20, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f6c453';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(272, 300);
  ctx.lineTo(308, 300);
  ctx.moveTo(272, 312);
  ctx.lineTo(308, 312);
  ctx.stroke();
  if (!mods.has('tassel')) {
    ctx.strokeStyle = '#f6c453';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(290, 330);
    ctx.lineTo(290, 344);
    ctx.stroke();
    disc(ctx, 290, 347, 4, '#f6c453');
  }
}

// --- Level 2: Harbor Dusk -----------------------------------------------

function paintHarbor(ctx, mods) {
  wash(ctx, '#2c3e6e', '#e8915a');

  // Moon: full and bright left, small and pale right.
  if (mods.has('moon')) {
    disc(ctx, 90, 66, 17, '#c9c2a8');
  } else {
    disc(ctx, 90, 66, 26, '#f5f0d8');
    disc(ctx, 82, 60, 5, '#ddd5b5');
    disc(ctx, 98, 72, 4, '#ddd5b5');
  }
  if (!mods.has('star')) sparkle(ctx, 215, 40, 9, '#fff7cc');
  sparkle(ctx, 300, 36, 7, '#fff7cc');
  sparkle(ctx, 160, 96, 6, '#fff7cc');

  // Sea.
  box(ctx, 0, 250, PANEL_W, 170, '#274b63');
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  for (const [x, y] of [[60, 300], [240, 330], [420, 310], [140, 380], [330, 390]]) {
    ctx.beginPath();
    ctx.arc(x, y, 18, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }

  // Dock.
  box(ctx, 300, 330, 260, 14, '#8a6b4a');
  box(ctx, 300, 344, 260, 10, '#75593d');
  box(ctx, 320, 344, 10, 40, '#6b4a2f');
  box(ctx, 500, 344, 10, 40, '#6b4a2f');

  // Crates: two stacked on the left panel, one on the right.
  box(ctx, 330, 306, 26, 24, '#c98f4e');
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 2;
  ctx.strokeRect(330, 306, 26, 24);
  if (!mods.has('crate')) {
    box(ctx, 358, 306, 26, 24, '#b57a3a');
    ctx.strokeRect(358, 306, 26, 24);
  }

  // Rope coil (gone on the right).
  if (!mods.has('rope')) {
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(430, 360, 12, 0, Math.PI * 2);
    ctx.arc(430, 360, 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Lighthouse with a beam (beam off on the right).
  box(ctx, 436, 150, 32, 180, '#f3ede0');
  ctx.fillStyle = '#e2574c';
  ctx.fillRect(436, 190, 32, 22);
  ctx.fillRect(436, 250, 32, 22);
  box(ctx, 430, 128, 44, 24, '#33415c');
  disc(ctx, 452, 140, 10, '#ffd94d');
  if (!mods.has('beacon')) {
    ctx.fillStyle = 'rgba(255,217,77,0.45)';
    ctx.beginPath();
    ctx.moveTo(452, 140);
    ctx.lineTo(300, 100);
    ctx.lineTo(300, 180);
    ctx.closePath();
    ctx.fill();
  }

  // Boat with a red flag (no flag on the right).
  ctx.fillStyle = '#7a4a2b';
  ctx.beginPath();
  ctx.moveTo(130, 300);
  ctx.lineTo(240, 300);
  ctx.lineTo(220, 322);
  ctx.lineTo(150, 322);
  ctx.closePath();
  ctx.fill();
  box(ctx, 180, 240, 5, 62, '#5b3a24');
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(185, 244);
  ctx.lineTo(185, 290);
  ctx.lineTo(222, 268);
  ctx.closePath();
  ctx.fill();
  if (!mods.has('flag')) {
    ctx.fillStyle = '#e2574c';
    ctx.beginPath();
    ctx.moveTo(185, 236);
    ctx.lineTo(208, 242);
    ctx.lineTo(185, 248);
    ctx.closePath();
    ctx.fill();
  }

  // Gulls: two on the left panel, one on the right.
  ctx.strokeStyle = '#f3ede0';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(248, 92, 9, Math.PI * 1.15, Math.PI * 1.85);
  ctx.arc(264, 92, 9, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  if (!mods.has('gull')) {
    ctx.beginPath();
    ctx.arc(312, 80, 9, Math.PI * 1.15, Math.PI * 1.85);
    ctx.arc(328, 80, 9, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // Jumping fish (gone on the right).
  if (!mods.has('fish')) {
    ctx.strokeStyle = '#9ad7f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(300, 322, 14, Math.PI, Math.PI * 2);
    ctx.stroke();
    oval(ctx, 300, 306, 10, 5, '#9ad7f0');
  }
}

// --- Level 3: Snowy Cabin -----------------------------------------------

function paintCabin(ctx, mods) {
  wash(ctx, '#16233f', '#3b4a6b');
  if (!mods.has('northstar')) sparkle(ctx, 110, 50, 9, '#fff7cc');
  sparkle(ctx, 200, 38, 6, '#fff7cc');
  sparkle(ctx, 430, 46, 7, '#fff7cc');
  sparkle(ctx, 520, 90, 5, '#fff7cc');
  disc(ctx, 500, 60, 20, '#f5f0d8');

  // Snow ground.
  ctx.fillStyle = '#f4f8ff';
  ctx.beginPath();
  ctx.moveTo(0, 330);
  ctx.quadraticCurveTo(280, 300, PANEL_W, 335);
  ctx.lineTo(PANEL_W, PANEL_H);
  ctx.lineTo(0, PANEL_H);
  ctx.closePath();
  ctx.fill();

  // Pines. The left pine loses its red ornament on the right.
  evergreen(ctx, 95, 265, 1, '#2e6b3e');
  if (!mods.has('ornament')) disc(ctx, 95, 265, 5, '#e2574c');
  disc(ctx, 81, 285, 4, '#e2574c');
  evergreen(ctx, 470, 270, 0.9, '#2e6b3e');

  // Deer in the pines (gone on the right).
  if (!mods.has('deer')) {
    ctx.fillStyle = '#8a6b4a';
    oval(ctx, 505, 320, 16, 10, '#8a6b4a');
    disc(ctx, 517, 304, 6, '#8a6b4a');
    ctx.fillRect(493, 326, 4, 14);
    ctx.fillRect(511, 326, 4, 14);
    ctx.strokeStyle = '#6b4a2f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(515, 298);
    ctx.lineTo(521, 290);
    ctx.moveTo(519, 298);
    ctx.lineTo(525, 292);
    ctx.stroke();
  }

  // Cabin body and snowy roof.
  box(ctx, 222, 220, 120, 110, '#8a5a3b');
  ctx.fillStyle = '#5b3a24';
  ctx.beginPath();
  ctx.moveTo(210, 222);
  ctx.lineTo(282, 168);
  ctx.lineTo(354, 222);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f4f8ff';
  ctx.beginPath();
  ctx.moveTo(210, 222);
  ctx.lineTo(282, 168);
  ctx.lineTo(354, 222);
  ctx.lineTo(344, 222);
  ctx.lineTo(282, 182);
  ctx.lineTo(220, 222);
  ctx.closePath();
  ctx.fill();

  // Chimney and smoke (no smoke on the right).
  box(ctx, 316, 178, 18, 40, '#6b4a2f');
  if (!mods.has('smoke')) {
    disc(ctx, 322, 168, 9, 'rgba(255,255,255,0.85)');
    disc(ctx, 330, 152, 12, 'rgba(255,255,255,0.7)');
    disc(ctx, 342, 136, 15, 'rgba(255,255,255,0.55)');
  }

  // Window: warm light left, dark right, with a glow spill on the snow.
  box(ctx, 240, 240, 34, 34, mods.has('window') ? '#33415c' : '#ffd166');
  ctx.strokeStyle = '#5b3a24';
  ctx.lineWidth = 3;
  ctx.strokeRect(240, 240, 34, 34);
  ctx.beginPath();
  ctx.moveTo(257, 240);
  ctx.lineTo(257, 274);
  ctx.moveTo(240, 257);
  ctx.lineTo(274, 257);
  ctx.stroke();
  if (!mods.has('window')) {
    ctx.fillStyle = 'rgba(255,209,102,0.25)';
    ctx.beginPath();
    ctx.moveTo(240, 274);
    ctx.lineTo(274, 274);
    ctx.lineTo(296, 330);
    ctx.lineTo(218, 330);
    ctx.closePath();
    ctx.fill();
  }

  // Door with a wreath (no wreath on the right).
  box(ctx, 296, 282, 30, 48, '#5b3a24');
  disc(ctx, 320, 306, 3, '#f6c453');
  if (!mods.has('wreath')) {
    ctx.strokeStyle = '#3f9e4d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(280, 298, 11, 0, Math.PI * 2);
    ctx.stroke();
    disc(ctx, 280, 287, 3, '#e2574c');
  }

  // Snowman with a red hat (hat gone on the right).
  disc(ctx, 150, 340, 26, '#ffffff');
  disc(ctx, 150, 306, 19, '#ffffff');
  disc(ctx, 150, 282, 13, '#ffffff');
  disc(ctx, 146, 280, 2, '#1f2937');
  disc(ctx, 154, 280, 2, '#1f2937');
  ctx.fillStyle = '#ff9f1c';
  ctx.beginPath();
  ctx.moveTo(150, 284);
  ctx.lineTo(164, 287);
  ctx.lineTo(150, 290);
  ctx.closePath();
  ctx.fill();
  if (!mods.has('hat')) {
    box(ctx, 140, 262, 20, 10, '#e2574c');
    box(ctx, 136, 270, 28, 5, '#e2574c');
  }

  // Sled (gone on the right).
  if (!mods.has('sled')) {
    ctx.strokeStyle = '#e2574c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(382, 350);
    ctx.lineTo(422, 350);
    ctx.moveTo(388, 342);
    ctx.lineTo(416, 342);
    ctx.moveTo(388, 342);
    ctx.lineTo(384, 350);
    ctx.moveTo(416, 342);
    ctx.lineTo(420, 350);
    ctx.stroke();
  }

  // Fence: the post at x=235 is missing on the right.
  ctx.fillStyle = '#8a6b4a';
  for (const x of [150, 190, 235, 274]) {
    if (x === 235 && mods.has('fence')) continue;
    ctx.fillRect(x - 3, 340, 6, 26);
  }
  ctx.fillRect(140, 348, 150, 5);
  ctx.fillRect(140, 358, 150, 5);

  // Fresh snow dots.
  for (const [x, y] of [[60, 350], [200, 390], [360, 380], [520, 370], [40, 400]]) {
    disc(ctx, x, y, 3, 'rgba(255,255,255,0.9)');
  }
}

const PAINTERS = { garden: paintGarden, harbor: paintHarbor, cabin: paintCabin };

// Paint one panel of a level. `changedKeys` are the spot keys applied to
// this panel: none for the left panel, all of them for the right one.
export function paintScene(ctx, levelId, changedKeys) {
  const mods = new Set(changedKeys);
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  PAINTERS[levelId](ctx, mods);
}
