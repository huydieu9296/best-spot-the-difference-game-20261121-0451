# Twin Lanterns — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/huydieu9296/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/huydieu9296/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game that runs offline in a desktop browser
from plain static files. Entry for the
[make.fun best spot the difference game bounty](https://make.fun/c/best-spot-the-difference-game-20261121-0451).

## Play

```sh
node serve.ts
# open http://localhost:8080
```

Two pictures hang side by side. They look the same — they are not. Each of
the three scenes hides its differences: a missing bird, a changed colour, a
lantern without its tassel. Click a difference on either picture to mark it
with a green ring; find them all before the timer runs out.

- **Lantern Garden** (Easy, 7 differences) — morning in the lantern garden.
- **Harbor Dusk** (Medium, 8 differences) — dusk at the little harbor.
- **Snowy Cabin** (Hard, 9 differences) — a quiet snowy night.

Quick finds in a row build a combo bonus; clearing a level pays a time
bonus. `H` spends one of 3 hints per level, `R` restarts the level,
`N` goes to the next level, `1/2/3` pick a level, `M` toggles sound,
`Enter` starts / continues. All art is drawn by code (canvas 2D) and all
sounds are synthesized with WebAudio — no images, no audio files, no
network requests, no copied art.

## Layout

- `game/index.html` — page, HUD and overlays
- `game/src/config.js` — levels and their differences
- `game/src/scenes.js` — the three scenes, drawn by code
- `game/src/state.js` — rules: finds, combos, hints, timer
- `game/src/render.js` — the two panels, markers and HUD
- `game/src/input.js` — mouse and keyboard
- `game/src/audio.js` — synthesized chimes
- `game/src/shots.js` — deterministic states for screenshots
- `game/src/main.js` — wiring and the game loop
- `main.ts` — hands the entry in: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` (run with
  `MAKEFUN_OUTPUT_DIR=out node main.ts`)
- `vendor/makefun-game.ts` — the kit's vendored library, unchanged

## Testing

```sh
node serve.ts            # serves game/ at http://localhost:8080
node tools/shot.mjs     # probe: real find, real miss, hint key — then 4 screenshots
```

`node tools/shot.mjs probe` plays the game in a headless browser and
prints the live state at each step; `shots` retakes the four images in
`screenshots/` from the `?shot=` presets in `shots.json`. Every
screenshot is a real render of this game's own code.

## License

MIT — see [LICENSE](LICENSE).
