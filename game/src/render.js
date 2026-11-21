// render.js — one clear job: paint the two panels and the HUD.
// The left canvas always shows the original scene, the right canvas
// the changed one. Found spots get a green ring with a check on BOTH
// panels, so a screenshot shows the hunt's progress at a glance. A
// hint pulses a gold ring around one unfound spot; a miss flashes a
// red cross that fades away.

import { PANEL_W, PANEL_H, TOTAL_SPOTS } from './config.js';
import { paintScene } from './scenes.js';
import { activeLevel, spotsLeft, spotsFound } from './state.js';

const missFlashes = []; // { x, y, until }

export function markMiss(x, y) {
  missFlashes.push({ x, y, until: Date.now() + 700 });
}

function drawFoundRing(ctx, x, y, r) {
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r + 3, 0, Math.PI * 2);
  ctx.stroke();
  // Check mark inside the ring.
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.12, y + r * 0.35);
  ctx.lineTo(x + r * 0.5, y - r * 0.35);
  ctx.stroke();
}

function drawHintRing(ctx, spot) {
  const pulse = 6 + Math.sin(Date.now() / 150) * 4;
  ctx.strokeStyle = '#f6c453';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.arc(spot.cx, spot.cy, spot.rad + pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawMissCross(ctx, flash) {
  const left = flash.until - Date.now();
  if (left <= 0) return;
  ctx.globalAlpha = Math.max(0.15, left / 700);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const s = 10;
  ctx.beginPath();
  ctx.moveTo(flash.x - s, flash.y - s);
  ctx.lineTo(flash.x + s, flash.y + s);
  ctx.moveTo(flash.x + s, flash.y - s);
  ctx.lineTo(flash.x - s, flash.y + s);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function paintOnePanel(ctx, game, changedKeys) {
  const level = activeLevel(game);
  paintScene(ctx, level.id, changedKeys);
  for (const spot of level.spots) {
    if (game.foundIds.has(spot.key)) drawFoundRing(ctx, spot.cx, spot.cy, spot.rad);
  }
  if (game.hintSpot && Date.now() < game.hintSpot.until) {
    const spot = level.spots.find((s) => s.key === game.hintSpot.key);
    if (spot && !game.foundIds.has(spot.key)) drawHintRing(ctx, spot);
  }
  const now = Date.now();
  for (let i = missFlashes.length - 1; i >= 0; i--) {
    if (missFlashes[i].until <= now) missFlashes.splice(i, 1);
    else drawMissCross(ctx, missFlashes[i]);
  }
}

export function paintPanels(game, leftCtx, rightCtx) {
  const level = activeLevel(game);
  const allKeys = level.spots.map((s) => s.key);
  paintOnePanel(leftCtx, game, []);
  paintOnePanel(rightCtx, game, allKeys);
}

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function refreshHud(game, els) {
  const level = activeLevel(game);
  els.levelName.textContent = `${level.title} · ${level.grade}`;
  els.captionRight.textContent = `${level.spots.length} differences hide between the two`;
  els.timer.textContent = formatClock(game.secondsLeft);
  els.timer.classList.toggle('danger', game.secondsLeft <= 30 && game.screen === 'playing');
  els.points.textContent = String(game.points);
  els.counter.textContent = `${spotsLeft(game)} left`;
  els.note.textContent = game.note;
  els.hintButton.textContent = `Hint (${game.hints})  [H]`;
  els.hintButton.disabled = game.hints <= 0 || game.screen !== 'playing';
  els.dots.innerHTML = '';
  for (const spot of level.spots) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (game.foundIds.has(spot.key) ? ' found' : '');
    dot.title = spot.name;
    els.dots.appendChild(dot);
  }
  const show = (el, on) => el.classList.toggle('hidden', !on);
  show(els.overlayMenu, game.screen === 'menu');
  show(els.overlayLevelClear, game.screen === 'level-clear');
  show(els.overlayAllClear, game.screen === 'all-clear');
  show(els.overlayOutOfTime, game.screen === 'out-of-time');
  if (game.screen === 'level-clear') {
    els.levelClearText.textContent = `You found all ${level.spots.length} differences in ${level.title}! Score: ${game.points}.`;
  }
  if (game.screen === 'out-of-time') {
    els.outOfTimeText.textContent = `Time up! You found ${spotsFound(game)} of ${level.spots.length} differences in ${level.title}.`;
  }
  if (game.screen === 'all-clear') {
    els.allClearText.textContent = `You cleared all 3 scenes! Total score: ${game.points} — with ${game.clearedTotal} of ${TOTAL_SPOTS} differences found.`;
  }
}

export { PANEL_W, PANEL_H };
