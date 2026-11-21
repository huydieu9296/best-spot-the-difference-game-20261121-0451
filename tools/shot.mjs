// shot.mjs — maker tooling (NOT part of the entry): play-tests the game
// in a real browser and takes the screenshots listed in shots.json.
// Usage: node tools/shot.mjs [probe|shots|all]
//   probe — click a real spot and a wrong spot, press H, print live state.
//   shots — take the 4 screenshots from shots.json via ?shot= presets.
// The server (node serve.ts, port 8080) must be running first.

import { createRequire } from 'node:module';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const require = createRequire('/home/hatch/workspace/makefun/playwright-shot/package.json');
const { chromium } = require('playwright-core');

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const shots = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'));
const chromePath = join(homedir(), '.cache/ms-playwright/chromium-1255/chrome-linux64/chrome');
const BASE = 'http://localhost:8080';

async function open(page, query) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${BASE}/${query}`, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  return errors;
}

// Map panel coords (560x420) to page coords on the right canvas.
async function panelToPage(page, x, y) {
  const box = await page.evaluate(() => {
    const r = document.getElementById('panel-right').getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });
  return { x: box.left + (x / 560) * box.width, y: box.top + (y / 420) * box.height };
}

async function probe(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  const errors = await open(page, '');
  // Start level 1 from the menu.
  await page.click('.level-card');
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => ({
    screen: window.__twin.game.screen,
    remaining: window.__twin.remaining(),
    points: window.__twin.game.points,
  }));
  // Click a REAL spot: the sun rays at panel (470, 64).
  const p1 = await panelToPage(page, 470, 64);
  await page.mouse.click(p1.x, p1.y);
  await page.waitForTimeout(300);
  const afterFind = await page.evaluate(() => ({
    found: window.__twin.foundCount(),
    remaining: window.__twin.remaining(),
    points: window.__twin.game.points,
    note: window.__twin.game.note,
  }));
  // Click a wrong spot: empty sky at (350, 150).
  const p2 = await panelToPage(page, 350, 150);
  await page.mouse.click(p2.x, p2.y);
  await page.waitForTimeout(300);
  const afterMiss = await page.evaluate(() => ({
    found: window.__twin.foundCount(),
    misses: window.__twin.game.misses,
    note: window.__twin.game.note,
  }));
  // Keyboard: H spends a hint.
  await page.keyboard.press('h');
  await page.waitForTimeout(300);
  const afterHint = await page.evaluate(() => ({
    hints: window.__twin.game.hints,
    hintSpot: !!window.__twin.game.hintSpot,
  }));
  console.log(JSON.stringify({ errors, before, afterFind, afterMiss, afterHint }, null, 2));
  const ok = before.screen === 'playing' && before.remaining === 7
    && afterFind.found === 1 && afterFind.remaining === 6 && afterFind.points >= 100
    && afterMiss.found === 1 && afterMiss.misses === 1
    && afterHint.hints === 2 && afterHint.hintSpot === true
    && errors.length === 0;
  console.log(ok ? 'PROBE PASS' : 'PROBE FAIL');
  await page.close();
  return ok;
}

async function takeShots(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  for (const shot of shots) {
    const errors = await open(page, shot.query);
    const path = join(root, 'screenshots', shot.name);
    await page.screenshot({ path, type: 'jpeg', quality: 82 });
    const bytes = statSync(path).size;
    const state = await page.evaluate(() => ({
      screen: window.__twin.game.screen,
      found: window.__twin.foundCount(),
      remaining: window.__twin.remaining(),
      counter: document.getElementById('hud-counter').textContent,
    }));
    console.log(shot.name, `${bytes} bytes`, JSON.stringify(state), errors.length ? `ERRORS: ${errors.join(' | ')}` : 'no page errors');
  }
  await page.close();
}

const mode = process.argv[2] ?? 'all';
const browser = await chromium.launch({ executablePath: chromePath });
let ok = true;
if (mode === 'probe' || mode === 'all') ok = (await probe(browser)) && ok;
if (mode === 'shots' || mode === 'all') await takeShots(browser);
await browser.close();
if (!ok) process.exit(1);
console.log('done');
