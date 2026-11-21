// state.js — one clear job: the game's state and its rules.
// A level is cleared when every spot is found before the clock runs
// out. Points: 100 a find, plus a combo bonus for quick finds in a
// row, plus a time bonus when a level is cleared. A miss breaks the
// combo; a hint never does.

import { LEVELS, FIND_SCORE, HINTS_PER_LEVEL } from './config.js';

export const SCREENS = {
  MENU: 'menu',
  PLAYING: 'playing',
  LEVEL_CLEAR: 'level-clear',
  ALL_CLEAR: 'all-clear',
  OUT_OF_TIME: 'out-of-time',
};

export function newGame() {
  return {
    screen: SCREENS.MENU,
    levelIndex: 0,
    foundIds: new Set(), // spot keys found in the current level
    hints: HINTS_PER_LEVEL,
    hintSpot: null, // { key, until } while a hint ring is pulsing
    points: 0,
    combo: 0,
    lastFindMs: 0,
    secondsLeft: LEVELS[0].seconds,
    note: 'Pick a level and start hunting!',
    misses: 0,
    clearedTotal: 0,
    startedMs: 0,
  };
}

export function activeLevel(game) {
  return LEVELS[game.levelIndex];
}

export function spotsLeft(game) {
  return activeLevel(game).spots.length - game.foundIds.size;
}

// How many spots are already found in the current level.
export function spotsFound(game) {
  return game.foundIds.size;
}

export function beginLevel(game, levelIndex) {
  const level = LEVELS[levelIndex];
  game.screen = SCREENS.PLAYING;
  game.levelIndex = levelIndex;
  game.foundIds = new Set();
  game.hints = HINTS_PER_LEVEL;
  game.hintSpot = null;
  game.combo = 0;
  game.secondsLeft = level.seconds;
  game.note = `${level.title}: find all ${level.spots.length} differences!`;
  game.startedMs = Date.now();
}

// The closest spot not yet found, if the click lands inside its ring.
export function spotAt(game, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const spot of activeLevel(game).spots) {
    if (game.foundIds.has(spot.key)) continue;
    const d = Math.hypot(spot.cx - x, spot.cy - y);
    if (d < bestDist) {
      bestDist = d;
      best = spot;
    }
  }
  return best && bestDist <= best.rad ? best : null;
}

// Try a click at panel coordinates. Returns 'found' | 'miss' | 'ignored'.
export function trySpot(game, x, y) {
  if (game.screen !== SCREENS.PLAYING) return 'ignored';
  const spot = spotAt(game, x, y);
  if (!spot) {
    game.misses += 1;
    game.combo = 0;
    game.note = 'Not quite — look closer!';
    return 'miss';
  }
  game.foundIds.add(spot.key);
  game.clearedTotal += 1;
  const now = Date.now();
  const quick = now - game.lastFindMs < 5000;
  game.combo = quick ? game.combo + 1 : 1;
  game.lastFindMs = now;
  const bonus = (game.combo - 1) * 20;
  game.points += FIND_SCORE + bonus;
  game.note = bonus > 0
    ? `${spot.cheer} +${FIND_SCORE + bonus} (combo x${game.combo})`
    : `${spot.cheer} +${FIND_SCORE}`;
  if (game.foundIds.size === activeLevel(game).spots.length) {
    const timeBonus = Math.round(game.secondsLeft) * 5;
    game.points += timeBonus;
    game.screen = SCREENS.LEVEL_CLEAR;
    game.note = `Level clear! Time bonus +${timeBonus}.`;
  }
  return 'found';
}

// Spend a hint: pick a random unfound spot and pulse a ring around it.
export function spendHint(game) {
  if (game.screen !== SCREENS.PLAYING || game.hints <= 0) return null;
  const open = activeLevel(game).spots.filter((s) => !game.foundIds.has(s.key));
  if (open.length === 0) return null;
  const pick = open[Math.floor(Math.random() * open.length)];
  game.hints -= 1;
  game.hintSpot = { key: pick.key, until: Date.now() + 2500 };
  game.note = `Hint: something is different near the ${pick.name}…`;
  return pick;
}

export function tickClock(game, dtSeconds) {
  if (game.screen !== SCREENS.PLAYING) return;
  game.secondsLeft -= dtSeconds;
  if (game.secondsLeft <= 0) {
    game.secondsLeft = 0;
    game.screen = SCREENS.OUT_OF_TIME;
    game.note = `Time up! You found ${game.foundIds.size} of ${activeLevel(game).spots.length}. Try again!`;
  }
}

export function nextLevelIndex(game) {
  return (game.levelIndex + 1) % LEVELS.length;
}
