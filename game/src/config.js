// config.js — the static data for "Twin Lanterns".
// One clear job: describe the three levels and where their differences
// hide. The art itself lives in scenes.js and is drawn by code; this
// file only says what is different, where, and how big the target is.
// Both panels share one coordinate space, 560 by 420.
//
// A spot is { key, cx, cy, rad, name, cheer }:
//   key   — stable id the scenes and the state machine agree on
//   cx,cy — centre of the difference in panel coordinates
//   rad   — how close a click must land to count (and the marker size)
//   name  — short label, shown in the hint text
//   cheer — the line the game shows when the player finds it

export const PANEL_W = 560;
export const PANEL_H = 420;
export const LEVEL_SECONDS = 180;
export const FIND_SCORE = 100;
export const HINTS_PER_LEVEL = 3;

export const LEVELS = [
  {
    id: 'garden',
    title: 'Lantern Garden',
    blurb: 'Morning in the lantern garden — 7 changes hide in plain sight.',
    grade: 'Easy',
    seconds: LEVEL_SECONDS,
    spots: [
      { key: 'sunrays', cx: 470, cy: 64, rad: 36, name: 'sun rays', cheer: 'The sun got its rays back!' },
      { key: 'cloud', cx: 300, cy: 52, rad: 30, name: 'high cloud', cheer: 'A cloud drifted back into the sky.' },
      { key: 'bird', cx: 190, cy: 118, rad: 22, name: 'little bird', cheer: 'The little bird is singing again.' },
      { key: 'butterfly', cx: 430, cy: 190, rad: 24, name: 'butterfly', cheer: 'The butterfly is red again, not blue.' },
      { key: 'flower', cx: 140, cy: 360, rad: 20, name: 'purple flower', cheer: 'That flower is purple again.' },
      { key: 'tassel', cx: 290, cy: 332, rad: 22, name: 'lantern tassel', cheer: 'The lantern tassel is back where it belongs.' },
      { key: 'fish', cx: 390, cy: 350, rad: 22, name: 'pond fish', cheer: 'The pond fish is swimming again.' },
    ],
  },
  {
    id: 'harbor',
    title: 'Harbor Dusk',
    blurb: 'Dusk at the little harbor — 8 changes, and the light is fading.',
    grade: 'Medium',
    seconds: LEVEL_SECONDS,
    spots: [
      { key: 'moon', cx: 90, cy: 66, rad: 30, name: 'moon', cheer: 'The moon is full and bright again.' },
      { key: 'star', cx: 215, cy: 40, rad: 16, name: 'bright star', cheer: 'The bright star is twinkling again.' },
      { key: 'gull', cx: 320, cy: 80, rad: 20, name: 'second gull', cheer: 'The second gull came home to roost.' },
      { key: 'beacon', cx: 452, cy: 140, rad: 26, name: 'lighthouse beam', cheer: 'The lighthouse beam is shining again.' },
      { key: 'flag', cx: 196, cy: 240, rad: 20, name: 'boat flag', cheer: 'The little red flag is flying again.' },
      { key: 'crate', cx: 365, cy: 318, rad: 24, name: 'second crate', cheer: 'A crate reappeared on the dock.' },
      { key: 'fish', cx: 300, cy: 322, rad: 22, name: 'jumping fish', cheer: 'The jumping fish is back above the waves.' },
      { key: 'rope', cx: 430, cy: 360, rad: 22, name: 'rope coil', cheer: 'The rope coil is back on the dock.' },
    ],
  },
  {
    id: 'cabin',
    title: 'Snowy Cabin',
    blurb: 'A quiet snowy night — 9 changes, and every one of them is small.',
    grade: 'Hard',
    seconds: LEVEL_SECONDS,
    spots: [
      { key: 'northstar', cx: 110, cy: 50, rad: 16, name: 'north star', cheer: 'The north star is shining again.' },
      { key: 'smoke', cx: 330, cy: 150, rad: 26, name: 'chimney smoke', cheer: 'Smoke is curling from the chimney again.' },
      { key: 'hat', cx: 150, cy: 272, rad: 22, name: 'snowman hat', cheer: 'The snowman wears his red hat again.' },
      { key: 'window', cx: 257, cy: 257, rad: 22, name: 'window light', cheer: 'The cabin window is glowing warm again.' },
      { key: 'wreath', cx: 280, cy: 298, rad: 20, name: 'door wreath', cheer: 'The wreath is hanging on the door again.' },
      { key: 'sled', cx: 400, cy: 350, rad: 24, name: 'red sled', cheer: 'The little red sled is back in the snow.' },
      { key: 'deer', cx: 505, cy: 320, rad: 24, name: 'deer', cheer: 'The deer stepped back out of the pines.' },
      { key: 'ornament', cx: 95, cy: 265, rad: 18, name: 'pine ornament', cheer: 'A red ornament is back on the pine.' },
      { key: 'fence', cx: 235, cy: 352, rad: 20, name: 'fence post', cheer: 'The missing fence post is back in place.' },
    ],
  },
];

// Look a level up by id; fall back to the first level for unknown ids.
export function levelById(id) {
  for (const level of LEVELS) {
    if (level.id === id) return level;
  }
  return LEVELS[0];
}

// How many differences the whole game hides, across all three scenes.
export const TOTAL_SPOTS = LEVELS.reduce((sum, level) => sum + level.spots.length, 0);
