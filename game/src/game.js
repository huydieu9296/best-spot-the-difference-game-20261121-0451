// Twin Lanterns — game state, input and flow. The board is one canvas with
// two 600x600 panels side by side; the HUD and overlays are plain DOM.
import { LEVELS, PANEL, POINTS_FOUND, POINTS_MISS, POINTS_HINT, HINTS_PER_LEVEL, TIME_BONUS_PER_SECOND } from './levels.js';
import { paintPanel } from './art.js';
import { sound } from './sound.js';

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const hudLevel = document.getElementById('hud-level');
const hudScene = document.getElementById('hud-scene');
const hudScore = document.getElementById('hud-score');
const hudTime = document.getElementById('hud-time');
const hudRemaining = document.getElementById('hud-remaining');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const overlaySub = document.getElementById('overlay-sub');
const overlayBtn = document.getElementById('overlay-btn');
const statusLine = document.getElementById('status');

const game = {
  state: 'title', // title | playing | levelDone | timeup | victory
  levelIndex: 0,
  found: new Set(),
  foundAt: new Map(), // diff id -> timestamp of the find (for the pop animation)
  misses: 0,
  totalFound: 0,
  totalMisses: 0,
  hintsUsed: 0,
  hintDiff: null,
  hintUntil: 0,
  score: 0,
  timeLeft: 0,
  levelStart: 0,
  totalTime: 0,
  missFlashes: [], // {x, y, at} in canvas coordinates
  overlayAction: null,
};

function level() { return LEVELS[game.levelIndex]; }
function remaining() { return level().diffs.length - game.found.size; }
function fmtTime(s) {
  const t = Math.max(0, Math.ceil(s));
  return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
}

function updateHud() {
  const lv = level();
  hudLevel.textContent = (game.levelIndex + 1) + ' / ' + LEVELS.length;
  hudScene.textContent = lv.name;
  hudScore.textContent = game.score;
  hudTime.textContent = fmtTime(game.timeLeft);
  hudTime.classList.toggle('low', game.timeLeft <= 30 && game.state === 'playing');
  hudRemaining.textContent = remaining();
}

function announce(msg) { statusLine.textContent = msg; }

function showOverlay(title, text, sub, btnLabel, action) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlaySub.textContent = sub;
  overlayBtn.textContent = btnLabel;
  game.overlayAction = action;
  overlay.classList.remove('hidden');
}
function hideOverlay() {
  overlay.classList.add('hidden');
  game.overlayAction = null;
}

function startLevel(index) {
  game.levelIndex = index;
  game.found = new Set();
  game.foundAt = new Map();
  game.hintsUsed = 0;
  game.hintDiff = null;
  game.timeLeft = level().timeLimit;
  game.levelStart = performance.now();
  game.missFlashes = [];
  game.state = 'playing';
  hideOverlay();
  updateHud();
  announce('Level ' + (index + 1) + ': ' + level().name + '. Find ' + level().diffs.length + ' differences.');
}

function startGame() {
  game.score = 0;
  game.totalFound = 0;
  game.totalMisses = 0;
  game.totalTime = 0;
  game.misses = 0;
  sound.unlock();
  startLevel(0);
}

function levelComplete() {
  const bonus = Math.ceil(game.timeLeft) * TIME_BONUS_PER_SECOND;
  game.score += bonus;
  game.totalTime += level().timeLimit - game.timeLeft;
  game.state = 'levelDone';
  sound.win();
  updateHud();
  setTimeout(() => {
    if (game.state !== 'levelDone') return;
    const last = game.levelIndex === LEVELS.length - 1;
    showOverlay(
      last ? 'All scenes cleared!' : 'Scene complete!',
      'You found every difference in ' + level().name + ' — time bonus +' + bonus + '.',
      'Score: ' + game.score,
      last ? 'See your results' : 'Next scene',
      () => {
        if (last) showVictory();
        else startLevel(game.levelIndex + 1);
      },
    );
  }, 750);
}

function showVictory() {
  game.state = 'victory';
  const total = game.totalFound + game.totalMisses;
  const acc = total === 0 ? 100 : Math.round((game.totalFound / total) * 100);
  const mins = Math.floor(game.totalTime / 60);
  const secs = Math.round(game.totalTime % 60);
  showOverlay(
    'You found them all!',
    'Final score: ' + game.score + ' — ' + game.totalFound + ' differences found, ' + acc + '% accuracy, ' + mins + 'm ' + secs + 's of hunting.',
    'Twin Lanterns thanks you for playing. Play again to beat your score!',
    'Play again',
    startGame,
  );
  announce('Victory! Final score ' + game.score + '.');
}

function timeUp() {
  game.state = 'timeup';
  game.totalTime += level().timeLimit;
  sound.timeout();
  showOverlay(
    "Time's up!",
    'The lanterns dim before you found every difference in ' + level().name + ' — ' + remaining() + ' still hiding.',
    'Score so far: ' + game.score,
    'Try this scene again',
    () => startLevel(game.levelIndex),
  );
}

function useHint() {
  if (game.state !== 'playing') return;
  if (game.hintsUsed >= HINTS_PER_LEVEL) {
    announce('No hints left on this scene.');
    return;
  }
  const unfound = level().diffs.filter((d) => !game.found.has(d.id));
  if (unfound.length === 0) return;
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  game.hintDiff = pick;
  game.hintUntil = performance.now() + 2500;
  game.hintsUsed += 1;
  game.score = Math.max(0, game.score - POINTS_HINT);
  sound.hint();
  updateHud();
  announce('Hint: look near the pulsing ring. ' + (HINTS_PER_LEVEL - game.hintsUsed) + ' hints left.');
}

function panelAt(cx, cy) {
  // Canvas coordinates -> { side, lx, ly } in panel-local space, or null.
  if (cy < PANEL.y || cy > PANEL.y + PANEL.h) return null;
  if (cx >= PANEL.leftX && cx <= PANEL.leftX + PANEL.w) return { side: 'L', lx: cx - PANEL.leftX, ly: cy - PANEL.y };
  if (cx >= PANEL.rightX && cx <= PANEL.rightX + PANEL.w) return { side: 'R', lx: cx - PANEL.rightX, ly: cy - PANEL.y };
  return null;
}

function handleClick(clientX, clientY) {
  if (game.state !== 'playing') return;
  sound.unlock();
  const rect = canvas.getBoundingClientRect();
  const cx = (clientX - rect.left) * (canvas.width / rect.width);
  const cy = (clientY - rect.top) * (canvas.height / rect.height);
  const hit = panelAt(cx, cy);
  if (!hit) return;
  for (const d of level().diffs) {
    if (game.found.has(d.id)) continue;
    const dx = hit.lx - d.x;
    const dy = hit.ly - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      game.found.add(d.id);
      game.foundAt.set(d.id, performance.now());
      game.totalFound += 1;
      game.score += POINTS_FOUND;
      sound.found();
      updateHud();
      if (remaining() === 0) levelComplete();
      else announce('Found: ' + d.label + '. ' + remaining() + ' left.');
      return;
    }
  }
  // A miss: small penalty and a red cross where the player clicked.
  game.score = Math.max(0, game.score - POINTS_MISS);
  game.misses += 1;
  game.totalMisses += 1;
  game.missFlashes.push({ x: cx, y: cy, at: performance.now() });
  sound.miss();
  sound.tick();
  updateHud();
  announce('Not a difference. ' + remaining() + ' left.');
}

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  handleClick(e.clientX, e.clientY);
});
overlayBtn.addEventListener('click', () => {
  sound.unlock();
  if (game.overlayAction) game.overlayAction();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    if (game.state !== 'playing' && game.overlayAction) {
      e.preventDefault();
      sound.unlock();
      game.overlayAction();
    }
    return;
  }
  const k = e.key.toLowerCase();
  if (k === 'h') useHint();
  else if (k === 'r' && (game.state === 'playing' || game.state === 'timeup')) startLevel(game.levelIndex);
  else if (k === 'm') {
    const muted = sound.toggleMute();
    announce(muted ? 'Sound off.' : 'Sound on.');
  }
});

// ---- Rendering ----

function drawMarker(ctx, d, panelX, now) {
  const born = game.foundAt.get(d.id) || now;
  const age = Math.min(1, (now - born) / 280);
  const r = d.r + 8 + (1 - age) * 14;
  const x = panelX + d.x;
  const y = PANEL.y + d.y;
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * age;
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#fff3c4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r + 3, 0, Math.PI * 2);
  ctx.stroke();
  // A small tick at the top of the ring.
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 7, y - r - 2);
  ctx.lineTo(x - 1, y - r + 5);
  ctx.lineTo(x + 9, y - r - 7);
  ctx.stroke();
  ctx.restore();
}

function drawMiss(ctx, flash, now) {
  const age = (now - flash.at) / 650;
  if (age >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - age;
  ctx.strokeStyle = '#ff6b5e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const s = 10;
  ctx.beginPath();
  ctx.moveTo(flash.x - s, flash.y - s);
  ctx.lineTo(flash.x + s, flash.y + s);
  ctx.moveTo(flash.x + s, flash.y - s);
  ctx.lineTo(flash.x - s, flash.y + s);
  ctx.stroke();
  ctx.restore();
}

function drawHintRing(ctx, now) {
  if (!game.hintDiff || now > game.hintUntil) return;
  const d = game.hintDiff;
  const pulse = 1 + 0.12 * Math.sin(now / 130);
  const r = (d.r + 10) * pulse;
  for (const px of [PANEL.leftX, PANEL.rightX]) {
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#7fd8ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px + d.x, PANEL.y + d.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBottomStrip(ctx, now) {
  // Progress dots for this scene, and a shrinking time bar.
  const lv = level();
  const cy = 668;
  ctx.fillStyle = '#c9b48f';
  ctx.font = '15px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(lv.name + ' — ' + lv.subtitle, 24, cy);
  const total = lv.diffs.length;
  for (let i = 0; i < total; i++) {
    const dx = 640 + i * 26;
    ctx.beginPath();
    ctx.arc(dx, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = game.found.has(lv.diffs[i].id) ? '#ffd76a' : 'rgba(255,255,255,0.25)';
    ctx.fill();
  }
  const frac = game.state === 'playing' ? game.timeLeft / lv.timeLimit : 0;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(830, cy - 7, 420, 12);
  ctx.fillStyle = frac > 0.25 ? '#7fd8a0' : '#ff6b5e';
  ctx.fillRect(830, cy - 7, Math.max(0, 420 * frac), 12);
}

let lastTs = 0;
function frame(ts) {
  const now = performance.now();
  const dt = lastTs === 0 ? 0 : Math.min(0.1, (ts - lastTs) / 1000);
  lastTs = ts;
  if (game.state === 'playing') {
    game.timeLeft -= dt;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      updateHud();
      timeUp();
    } else {
      hudTime.textContent = fmtTime(game.timeLeft);
      hudTime.classList.toggle('low', game.timeLeft <= 30);
    }
  }
  const lv = level();
  const elapsed = (now - game.levelStart) / 1000;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0d0a14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  paintPanel(ctx, lv, PANEL.leftX, PANEL.y, 'L', elapsed);
  paintPanel(ctx, lv, PANEL.rightX, PANEL.y, 'R', elapsed);
  for (const d of lv.diffs) {
    if (!game.found.has(d.id)) continue;
    drawMarker(ctx, d, PANEL.leftX, now);
    drawMarker(ctx, d, PANEL.rightX, now);
  }
  drawHintRing(ctx, now);
  game.missFlashes = game.missFlashes.filter((f) => now - f.at < 650);
  for (const f of game.missFlashes) drawMiss(ctx, f, now);
  drawBottomStrip(ctx, now);
  requestAnimationFrame(frame);
}

// ---- Title screen and test hook ----

showOverlay(
  'Twin Lanterns',
  'Two pictures hang side by side — but six little things are different. Find them all before the lanterns burn down!',
  '3 scenes · 6 differences each · 2:30 per scene · a wrong click costs 25 points',
  'Light the lanterns',
  startGame,
);
updateHud();
requestAnimationFrame(frame);

// A small hook for automated play-testing: state reads and scripted clicks.
// It only reads or drives the same handlers a player uses.
window.__spot = {
  get state() { return game.state; },
  get levelIndex() { return game.levelIndex; },
  get levelName() { return level().name; },
  get score() { return game.score; },
  get misses() { return game.misses; },
  get timeLeft() { return game.timeLeft; },
  get remaining() { return remaining(); },
  get hintsUsed() { return game.hintsUsed; },
  get muted() { return sound.muted; },
  diffs() {
    return level().diffs.map((d) => ({ id: d.id, x: d.x, y: d.y, r: d.r, found: game.found.has(d.id), label: d.label }));
  },
  panelPoint(side, lx, ly) {
    const px = side === 'L' ? PANEL.leftX : PANEL.rightX;
    const rect = canvas.getBoundingClientRect();
    return {
      clientX: rect.left + ((px + lx) / canvas.width) * rect.width,
      clientY: rect.top + ((PANEL.y + ly) / canvas.height) * rect.height,
    };
  },
  clickDiff(id) {
    const d = level().diffs.find((x) => x.id === id);
    if (!d) return false;
    const p = this.panelPoint('L', d.x, d.y);
    handleClick(p.clientX, p.clientY);
    return game.found.has(id);
  },
  clickAtCanvas(cx, cy) {
    const rect = canvas.getBoundingClientRect();
    handleClick(
      rect.left + (cx / canvas.width) * rect.width,
      rect.top + (cy / canvas.height) * rect.height,
    );
  },
  start: startGame,
  next() { if (game.overlayAction) game.overlayAction(); },
  hint: useHint,
};
