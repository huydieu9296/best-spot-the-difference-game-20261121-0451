// shots.js — one clear job: deterministic demo states for screenshots.
// ?shot=cover loads Lantern Garden with 3 of 7 spots already found
// (green rings visible on both panels, 4 still to find, counter
// reading "4 left"). ?shot=harbor and ?shot=cabin do the same for the
// other two scenes, ?shot=start shows the menu, ?shot=win shows the
// cleared-game screen. Every state is built by calling the same
// beginLevel/trySpot functions a real player uses, so the screenshots
// are real renders of the game — never staged pictures.

import { LEVELS } from './config.js';
import { beginLevel, trySpot, SCREENS } from './state.js';

function demoFinds(game, levelIndex, count) {
  beginLevel(game, levelIndex);
  const level = LEVELS[levelIndex];
  for (let i = 0; i < count && i < level.spots.length; i++) {
    const spot = level.spots[i];
    trySpot(game, spot.cx, spot.cy);
  }
  // Freeze the clock at a readable value so the shot is stable, and
  // clear the combo so a demo find never leaks into a real hunt.
  game.secondsLeft = 142;
  game.combo = 0;
  game.lastFindMs = 0;
  game.note = level.blurb;
}

export function applyShotPreset(game, shot) {
  if (!shot) return false;
  if (shot === 'cover') {
    demoFinds(game, 0, 3);
    return true;
  }
  if (shot === 'harbor') {
    demoFinds(game, 1, 2);
    return true;
  }
  if (shot === 'cabin') {
    demoFinds(game, 2, 1);
    return true;
  }
  if (shot === 'start') {
    game.screen = SCREENS.MENU;
    game.note = 'Pick a level and start hunting!';
    return true;
  }
  if (shot === 'win') {
    for (let i = 0; i < LEVELS.length; i++) {
      beginLevel(game, i);
      for (const spot of LEVELS[i].spots) trySpot(game, spot.cx, spot.cy);
    }
    game.screen = SCREENS.ALL_CLEAR;
    game.note = 'You cleared all 3 scenes!';
    return true;
  }
  return false;
}
