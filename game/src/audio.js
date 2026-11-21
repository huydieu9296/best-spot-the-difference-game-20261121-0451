// audio.js — one clear job: tiny synthesized sounds via WebAudio.
// No audio files are shipped; every chime is an oscillator, so the
// game stays offline and static. Mute is a plain flag the UI toggles,
// and a blocked audio context never breaks the game.

let sharedCtx = null;
let silenced = false;

function audioContext() {
  if (!sharedCtx) sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (sharedCtx.state === 'suspended') void sharedCtx.resume();
  return sharedCtx;
}

function tone(freq, delay, length, type, volume) {
  if (silenced) return;
  try {
    const ac = audioContext();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + length);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + length);
  } catch {
    // Sound is decoration: never let it stop the game.
  }
}

export function chimeFound() {
  tone(660, 0, 0.12, 'sine', 0.18);
  tone(880, 0.09, 0.18, 'sine', 0.18);
  tone(1320, 0.18, 0.22, 'sine', 0.12);
}

export function chimeMiss() {
  tone(180, 0, 0.15, 'square', 0.08);
}

export function chimeHint() {
  tone(520, 0, 0.1, 'sine', 0.12);
  tone(780, 0.08, 0.14, 'sine', 0.12);
}

// Short rising arpeggio when a level begins.
export function chimeStart() {
  tone(392, 0, 0.1, 'triangle', 0.14);
  tone(523, 0.08, 0.12, 'triangle', 0.14);
  tone(659, 0.16, 0.16, 'triangle', 0.14);
}

export function chimeLevelClear() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.16));
}

export function chimeAllClear() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.16));
}

export function setSilenced(value) {
  silenced = value;
}

export function isSilenced() {
  return silenced;
}
