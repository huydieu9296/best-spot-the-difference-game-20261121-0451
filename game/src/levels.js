// Twin Lanterns — level data.
// Each level is a hand-drawn scene with 6 differences. A difference lives in
// panel-local coordinates (each panel is 600 x 600) and has a kind the painter
// in art.js knows how to draw on each side. Nothing here is borrowed: every
// scene, name and difference was invented for this game.
export const LEVELS = [
  {
    id: 'lantern-night',
    name: 'Lantern Night',
    subtitle: 'A festival street under a paper moon',
    timeLimit: 150,
    diffs: [
      { id: 1, x: 468, y: 108, r: 36, kind: 'moon-craters', label: 'craters on the moon' },
      { id: 2, x: 300, y: 168, r: 28, kind: 'lantern-color', label: 'one lantern changed colour' },
      { id: 3, x: 132, y: 428, r: 32, kind: 'cat', label: 'a cat on the rooftop' },
      { id: 4, x: 524, y: 218, r: 20, kind: 'star', label: 'an extra bright star' },
      { id: 5, x: 428, y: 472, r: 32, kind: 'awning', label: 'a missing awning stripe' },
      { id: 6, x: 92, y: 302, r: 28, kind: 'window', label: 'a window gone dark' },
    ],
  },
  {
    id: 'harbour-dawn',
    name: 'Harbour Dawn',
    subtitle: 'First light over the fishing boats',
    timeLimit: 150,
    diffs: [
      { id: 1, x: 472, y: 148, r: 32, kind: 'lamp', label: 'the lighthouse lamp' },
      { id: 2, x: 178, y: 330, r: 36, kind: 'sail', label: 'a sail changed colour' },
      { id: 3, x: 318, y: 118, r: 24, kind: 'gull', label: 'a gull in the sky' },
      { id: 4, x: 522, y: 468, r: 24, kind: 'buoy', label: 'a floating buoy' },
      { id: 5, x: 466, y: 262, r: 20, kind: 'window', label: 'a lighthouse window gone dark' },
      { id: 6, x: 118, y: 478, r: 26, kind: 'fish', label: 'a fish jumping out of the water' },
    ],
  },
  {
    id: 'garden-tea',
    name: 'Garden Tea',
    subtitle: 'Afternoon tea among the tulips',
    timeLimit: 150,
    diffs: [
      { id: 1, x: 300, y: 330, r: 24, kind: 'knob', label: 'the teapot lid knob' },
      { id: 2, x: 452, y: 182, r: 26, kind: 'butterfly', label: 'a butterfly over the flowers' },
      { id: 3, x: 138, y: 482, r: 24, kind: 'tulip', label: 'one tulip changed colour' },
      { id: 4, x: 372, y: 402, r: 24, kind: 'cup', label: 'a second teacup' },
      { id: 5, x: 522, y: 302, r: 24, kind: 'bird', label: 'a bird on the fence' },
      { id: 6, x: 118, y: 122, r: 30, kind: 'cloud', label: 'an extra cloud' },
    ],
  },
];

export const PANEL = { w: 600, h: 600, leftX: 20, rightX: 660, y: 30 };
export const POINTS_FOUND = 100;
export const POINTS_MISS = 25;
export const POINTS_HINT = 50;
export const HINTS_PER_LEVEL = 3;
export const TIME_BONUS_PER_SECOND = 2;
