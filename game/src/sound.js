// Twin Lanterns — tiny WebAudio synth. No audio files: every sound is a
// short oscillator envelope, created on the first user gesture.
let audio = null;
let muted = false;

function ensureAudio() {
  if (!audio) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio = new Ctx();
  }
  if (audio.state === 'suspended') audio.resume();
  return audio;
}

function tone(freq, startAt, dur, type, vol) {
  const ctx = ensureAudio();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + dur + 0.05);
}

export const sound = {
  unlock() { ensureAudio(); },
  get muted() { return muted; },
  toggleMute() {
    muted = !muted;
    return muted;
  },
  // A soft tick for any click.
  tick() { tone(1200, 0, 0.05, 'sine', 0.05); },
  // Two-note chime when a difference is found.
  found() {
    tone(660, 0, 0.18, 'sine', 0.14);
    tone(990, 0.09, 0.28, 'sine', 0.14);
  },
  // Low buzz for a wrong click.
  miss() { tone(160, 0, 0.22, 'sawtooth', 0.07); },
  // Rising arpeggio for a finished level.
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.12));
  },
  // Gentle shimmer for a hint.
  hint() {
    tone(880, 0, 0.12, 'sine', 0.08);
    tone(1175, 0.08, 0.16, 'sine', 0.08);
  },
  // Sad little fall for time running out.
  timeout() {
    [392, 330, 262].forEach((f, i) => tone(f, i * 0.14, 0.25, 'triangle', 0.1));
  },
};
