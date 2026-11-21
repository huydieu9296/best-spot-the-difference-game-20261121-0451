// input.js — one clear job: turn mouse clicks and keys into actions.
// A click on either panel maps to panel coordinates (the canvas is
// scaled by CSS, so the click is scaled back into the 560x420 space).
// Keyboard: H hint, R restart the level, N next level, 1/2/3 pick a
// level, M mute, Enter start or continue.

import { PANEL_W, PANEL_H } from './config.js';

function panelPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * PANEL_W;
  const y = ((event.clientY - rect.top) / rect.height) * PANEL_H;
  return { x, y };
}

export function attachInput(canvases, actions) {
  for (const canvas of canvases) {
    canvas.addEventListener('click', (event) => {
      const { x, y } = panelPoint(canvas, event);
      actions.onPanelClick(x, y);
    });
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') actions.onHint();
    else if (key === 'r') actions.onRestart();
    else if (key === 'n') actions.onNext();
    else if (key === 'm') actions.onMute();
    else if (key === 'enter') actions.onEnter();
    else if (key === 'escape') actions.onMenu();
    else if (key === '1' || key === '2' || key === '3') actions.onLevelPick(Number(key) - 1);
  });
}
