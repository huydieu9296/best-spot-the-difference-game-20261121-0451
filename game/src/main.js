// main.js — one clear job: wire the game together and run its loop.
// It builds the game state, paints both panels every animation frame
// (so the hint pulse and miss flash animate), ticks the clock, and
// connects the buttons and the keyboard. No network, no storage, no
// libraries — just the modules beside it.

import { LEVELS, PANEL_W, PANEL_H } from './config.js';
import {
  SCREENS, newGame, activeLevel, beginLevel, trySpot, spendHint,
  tickClock, nextLevelIndex,
} from './state.js';
import { paintPanels, refreshHud, markMiss } from './render.js';
import { attachInput } from './input.js';
import { applyShotPreset } from './shots.js';
import {
  chimeFound, chimeMiss, chimeHint, chimeStart, chimeLevelClear, chimeAllClear,
  setSilenced, isSilenced,
} from './audio.js';

const $ = (id) => document.getElementById(id);

const leftCanvas = $('panel-left');
const rightCanvas = $('panel-right');
leftCanvas.width = PANEL_W;
leftCanvas.height = PANEL_H;
rightCanvas.width = PANEL_W;
rightCanvas.height = PANEL_H;
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');

const game = newGame();

const els = {
  levelName: $('hud-level'),
  timer: $('hud-timer'),
  points: $('hud-score'),
  counter: $('hud-counter'),
  note: $('hud-message'),
  captionRight: $('caption-right-count'),
  hintButton: $('btn-hint'),
  dots: $('hud-dots'),
  overlayMenu: $('overlay-menu'),
  overlayLevelClear: $('overlay-level-done'),
  overlayAllClear: $('overlay-win'),
  overlayOutOfTime: $('overlay-time-up'),
  levelClearText: $('level-done-text'),
  outOfTimeText: $('time-up-text'),
  allClearText: $('win-text'),
};

// Level picker buttons on the menu overlay.
const picker = $('level-picker');
LEVELS.forEach((level, i) => {
  const btn = document.createElement('button');
  btn.className = 'level-card';
  btn.innerHTML = `<b>${i + 1}. ${level.title}</b><span>${level.grade} · ${level.spots.length} differences · ${level.seconds}s</span><em>${level.blurb}</em>`;
  btn.addEventListener('click', () => {
    beginLevel(game, i);
    chimeStart();
  });
  picker.appendChild(btn);
});

function onPanelClick(x, y) {
  const result = trySpot(game, x, y);
  if (result === 'found') {
    chimeFound();
    if (game.screen === SCREENS.LEVEL_CLEAR) chimeLevelClear();
  } else if (result === 'miss') {
    chimeMiss();
    markMiss(x, y);
  }
}

const actions = {
  onPanelClick,
  onHint: () => {
    const pick = spendHint(game);
    if (pick) chimeHint();
  },
  onRestart: () => beginLevel(game, game.levelIndex),
  onNext: () => {
    if (game.screen === SCREENS.LEVEL_CLEAR) {
      const next = nextLevelIndex(game);
      if (next === 0) {
        game.screen = SCREENS.ALL_CLEAR;
        chimeAllClear();
      } else {
        beginLevel(game, next);
      }
    }
  },
  onMute: () => {
    setSilenced(!isSilenced());
    $('btn-mute').textContent = isSilenced() ? 'Sound: off  [M]' : 'Sound: on  [M]';
  },
  onMenu: () => {
    if (game.screen !== SCREENS.MENU) {
      game.screen = SCREENS.MENU;
      game.note = 'Pick a level and start hunting!';
    }
  },
  onEnter: () => {
    if (game.screen === SCREENS.MENU) beginLevel(game, 0);
    else if (game.screen === SCREENS.LEVEL_CLEAR) actions.onNext();
    else if (game.screen === SCREENS.OUT_OF_TIME) beginLevel(game, game.levelIndex);
    else if (game.screen === SCREENS.ALL_CLEAR) beginLevel(game, 0);
  },
  onLevelPick: (i) => {
    if (game.screen === SCREENS.MENU || game.screen === SCREENS.ALL_CLEAR) beginLevel(game, i);
  },
};

attachInput([leftCanvas, rightCanvas], actions);

$('btn-hint').addEventListener('click', actions.onHint);
$('btn-restart').addEventListener('click', actions.onRestart);
$('btn-next').addEventListener('click', actions.onNext);
$('btn-retry').addEventListener('click', () => beginLevel(game, game.levelIndex));
$('btn-menu').addEventListener('click', actions.onMenu);
$('btn-play-again').addEventListener('click', () => beginLevel(game, 0));
$('btn-mute').addEventListener('click', actions.onMute);

// Screenshot presets (?shot=cover etc.) build their state through the
// same functions a player uses. The flag below also freezes the clock
// for screenshots so the shot is stable.
const shot = new URLSearchParams(window.location.search).get('shot');
const shotMode = applyShotPreset(game, shot);

// Test hook for the maker's own screenshot script: lets it click real
// spots and read the live state. It is part of the shipped game,
// harmless in play.
window.__twin = {
  game,
  level: () => activeLevel(game),
  foundCount: () => game.foundIds.size,
  remaining: () => activeLevel(game).spots.length - game.foundIds.size,
  panels: { left: leftCanvas, right: rightCanvas },
};

let lastTick = performance.now();
function frame(now) {
  const dt = Math.min(0.25, (now - lastTick) / 1000);
  lastTick = now;
  if (!shotMode) tickClock(game, dt);
  paintPanels(game, leftCtx, rightCtx);
  refreshHud(game, els);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
