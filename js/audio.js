// ─────────────────────────────────────────────
//  사운드 — 파일 없이 Web Audio API 로 직접 합성
//  버스: master → (bgm / sfx(전투) / ui)
// ─────────────────────────────────────────────
let ctx = null;
let master, buses, noiseBuf;
const vol = { master: 0.8, bgm: 0.5, sfx: 0.7, ui: 0.7 };
const lastPlay = {};

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(comp).connect(ctx.destination);
  buses = { bgm: ctx.createGain(), sfx: ctx.createGain(), ui: ctx.createGain() };
  for (const b of Object.values(buses)) b.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  applyVolumes();
  startBgm();
}

export function setVolumes(v) {
  Object.assign(vol, v);
  applyVolumes();
}
function applyVolumes() {
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(vol.master, t, 0.05);
  buses.bgm.gain.setTargetAtTime(vol.bgm * 0.55, t, 0.05);
  buses.sfx.gain.setTargetAtTime(vol.sfx, t, 0.05);
  buses.ui.gain.setTargetAtTime(vol.ui, t, 0.05);
}

// ── 합성 도구 ─────────────────────────────
function tone(bus, { freq = 440, to = null, dur = 0.15, type = 'sine', gain = 0.2, attack = 0.005, delay = 0, detune = 0 }) {
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.detune.value = detune;
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(buses[bus]);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(bus, { dur = 0.2, gain = 0.2, type = 'lowpass', freq = 1000, to = null, q = 1, delay = 0, attack = 0.005 }) {
  const t = ctx.currentTime + delay;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(Math.max(30, to), t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(buses[bus]);
  s.start(t, Math.random() * 0.5);
  s.stop(t + dur + 0.05);
}

// ── 효과음 목록 ──────────────────────────
// [버스, 최소 재생 간격(초), 재생 함수]
const SFX = {
  // 전투
  fire:    ['sfx', 0.05, () => { noise('sfx', { dur: 0.22, gain: 0.25, type: 'bandpass', freq: 1400, to: 400, q: 0.8 }); tone('sfx', { freq: 220, to: 110, dur: 0.18, type: 'triangle', gain: 0.12 }); }],
  explode: ['sfx', 0.04, () => { noise('sfx', { dur: 0.4, gain: 0.35, type: 'lowpass', freq: 1200, to: 100 }); tone('sfx', { freq: 120, to: 40, dur: 0.3, gain: 0.35 }); }],
  zap:     ['sfx', 0.04, () => { tone('sfx', { freq: 1600, to: 220, dur: 0.14, type: 'square', gain: 0.07 }); noise('sfx', { dur: 0.1, gain: 0.15, type: 'highpass', freq: 3000 }); }],
  iceShot: ['sfx', 0.07, () => tone('sfx', { freq: 2200 + Math.random() * 600, to: 1500, dur: 0.07, type: 'triangle', gain: 0.05 })],
  iceball: ['sfx', 0.1, () => { [1318, 1760, 2093].forEach((f, i) => tone('sfx', { freq: f, dur: 0.35, type: 'triangle', gain: 0.08, delay: i * 0.05 })); noise('sfx', { dur: 0.3, gain: 0.08, type: 'highpass', freq: 5000 }); }],
  flame:   ['sfx', 0.2, () => noise('sfx', { dur: 0.3, gain: 0.22, type: 'bandpass', freq: 700, to: 500, q: 0.6, attack: 0.03 })],
  hit:     ['sfx', 0.035, () => noise('sfx', { dur: 0.05, gain: 0.12, type: 'bandpass', freq: 2200, q: 2 })],
  kill:    ['sfx', 0.03, () => {
    const c = combo('kill', 0.6);
    const f = 420 * Math.pow(2, Math.min(c, 24) / 24);          // 연속 처치할수록 음이 올라감
    tone('sfx', { freq: f * 1.6, to: f * 0.45, dur: 0.12, gain: 0.12 });
    tone('sfx', { freq: f * 2.4, to: f * 1.2, dur: 0.06, type: 'triangle', gain: 0.05 });
    noise('sfx', { dur: 0.06, gain: 0.08, type: 'bandpass', freq: 1800, q: 1.5 });
  }],
  bigkill: ['sfx', 0.2, () => {
    tone('sfx', { freq: 160, to: 40, dur: 0.5, gain: 0.3 });
    noise('sfx', { dur: 0.5, gain: 0.25, freq: 900, to: 120 });
    [784, 988, 1175, 1568].forEach((f, i) => tone('sfx', { freq: f, dur: 0.3, type: 'triangle', gain: 0.1, delay: 0.08 + i * 0.05 }));
  }],
  hurt:    ['sfx', 0.1, () => { tone('sfx', { freq: 240, to: 70, dur: 0.2, type: 'square', gain: 0.12 }); noise('sfx', { dur: 0.12, gain: 0.15, freq: 800 }); }],
  shield:  ['sfx', 0.1, () => { tone('sfx', { freq: 400, to: 1000, dur: 0.3, type: 'sine', gain: 0.15 }); tone('sfx', { freq: 600, to: 1500, dur: 0.3, type: 'triangle', gain: 0.06 }); }],
  frost:   ['sfx', 0.1, () => { noise('sfx', { dur: 0.35, gain: 0.18, type: 'highpass', freq: 2500, to: 6000 }); tone('sfx', { freq: 1760, dur: 0.3, type: 'triangle', gain: 0.07 }); }],
  dash:    ['sfx', 0.1, () => noise('sfx', { dur: 0.2, gain: 0.22, type: 'bandpass', freq: 2500, to: 500, q: 1.2 })],
  magnet:  ['sfx', 0.2, () => { tone('sfx', { freq: 200, to: 900, dur: 0.4, type: 'sawtooth', gain: 0.05 }); tone('sfx', { freq: 300, to: 1200, dur: 0.4, gain: 0.08 }); }],
  gem:     ['sfx', 0.025, () => {
    const c = combo('gem', 0.45);
    const f = 880 * Math.pow(2, (c % 16) / 12);                  // 연속 획득 시 음계를 타고 올라감
    tone('sfx', { freq: f, to: f * 1.5, dur: 0.07, type: 'sine', gain: 0.06 });
    tone('sfx', { freq: f * 2, dur: 0.05, type: 'triangle', gain: 0.025, delay: 0.02 });
  }],
  block:   ['sfx', 0.05, () => { tone('sfx', { freq: 880, dur: 0.12, type: 'triangle', gain: 0.12 }); tone('sfx', { freq: 1320, dur: 0.18, type: 'triangle', gain: 0.1, delay: 0.06 }); }],
  chest:   ['sfx', 0.2, () => [523, 659, 784, 1047].forEach((f, i) => tone('sfx', { freq: f, dur: 0.25, type: 'triangle', gain: 0.14, delay: i * 0.07 }))],
  boss:    ['sfx', 1, () => { tone('sfx', { freq: 65, dur: 1.4, type: 'sawtooth', gain: 0.18, attack: 0.15 }); tone('sfx', { freq: 98, dur: 1.4, type: 'sawtooth', gain: 0.1, attack: 0.2 }); noise('sfx', { dur: 1.2, gain: 0.12, freq: 200, attack: 0.3 }); }],
  elite:   ['sfx', 1, () => { tone('sfx', { freq: 110, to: 82, dur: 0.8, type: 'sawtooth', gain: 0.14, attack: 0.08 }); }],
  levelup: ['ui', 0.3, () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone('ui', { freq: f, dur: 0.3, type: 'triangle', gain: 0.13, delay: i * 0.06 }))],
  victory: ['ui', 1, () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone('ui', { freq: f, dur: 0.4, type: 'triangle', gain: 0.15, delay: i * 0.12 }))],
  defeat:  ['ui', 1, () => [392, 349, 311, 262].forEach((f, i) => tone('ui', { freq: f, dur: 0.5, type: 'triangle', gain: 0.14, delay: i * 0.22 }))],
  // UI
  click:   ['ui', 0.03, () => { tone('ui', { freq: 1500, to: 1100, dur: 0.05, type: 'square', gain: 0.045 }); tone('ui', { freq: 2400, dur: 0.03, type: 'sine', gain: 0.04, delay: 0.015 }); }],
  hover:   ['ui', 0.045, () => tone('ui', { freq: 2600 + Math.random() * 300, dur: 0.025, type: 'sine', gain: 0.025 })],
  select:  ['ui', 0.1, () => {
    [659, 831, 988, 1319].forEach((f, i) => tone('ui', { freq: f, dur: 0.35, type: 'triangle', gain: 0.12, delay: i * 0.035 }));
    tone('ui', { freq: 220, to: 440, dur: 0.25, type: 'sawtooth', gain: 0.05 });
    noise('ui', { dur: 0.35, gain: 0.07, type: 'highpass', freq: 5000, delay: 0.05 });
  }],
  cardIn:  ['ui', 0.15, () => { [0, 0.06, 0.12].forEach((d, i) => { noise('ui', { dur: 0.12, gain: 0.08, type: 'bandpass', freq: 1200 + i * 600, to: 3000, delay: d }); tone('ui', { freq: 700 + i * 220, dur: 0.1, type: 'triangle', gain: 0.05, delay: d }); }); }],
  reroll:  ['ui', 0.15, () => { for (let i = 0; i < 6; i++) tone('ui', { freq: 900 + Math.random() * 900, dur: 0.04, type: 'square', gain: 0.035, delay: i * 0.035 }); tone('ui', { freq: 1320, dur: 0.15, type: 'triangle', gain: 0.08, delay: 0.24 }); }],
  toggleOn:  ['ui', 0.05, () => { tone('ui', { freq: 660, dur: 0.06, type: 'triangle', gain: 0.08 }); tone('ui', { freq: 990, dur: 0.1, type: 'triangle', gain: 0.08, delay: 0.05 }); }],
  toggleOff: ['ui', 0.05, () => { tone('ui', { freq: 990, dur: 0.06, type: 'triangle', gain: 0.08 }); tone('ui', { freq: 660, dur: 0.1, type: 'triangle', gain: 0.08, delay: 0.05 }); }],
  equip:   ['ui', 0.05, () => { tone('ui', { freq: 523, dur: 0.08, type: 'square', gain: 0.05 }); tone('ui', { freq: 784, dur: 0.14, type: 'triangle', gain: 0.1, delay: 0.05 }); noise('ui', { dur: 0.08, gain: 0.05, type: 'highpass', freq: 3000, delay: 0.05 }); }],
  start:   ['ui', 0.5, () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone('ui', { freq: f, dur: 0.3, type: 'sawtooth', gain: 0.05, delay: i * 0.06 })); noise('ui', { dur: 0.6, gain: 0.1, type: 'bandpass', freq: 400, to: 4000, attack: 0.2 }); }],
  open:    ['ui', 0.05, () => tone('ui', { freq: 500, to: 900, dur: 0.1, type: 'triangle', gain: 0.1 })],
  close:   ['ui', 0.05, () => tone('ui', { freq: 900, to: 500, dur: 0.1, type: 'triangle', gain: 0.1 })],
  pick:    ['ui', 0.03, () => tone('ui', { freq: 700, to: 900, dur: 0.05, type: 'triangle', gain: 0.08 })],
  drop:    ['ui', 0.03, () => { tone('ui', { freq: 320, to: 180, dur: 0.08, type: 'triangle', gain: 0.14 }); noise('ui', { dur: 0.05, gain: 0.06, freq: 900 }); }],
  discard: ['ui', 0.05, () => noise('ui', { dur: 0.18, gain: 0.12, type: 'bandpass', freq: 600, to: 200 })],
  error:   ['ui', 0.1, () => { tone('ui', { freq: 180, dur: 0.12, type: 'square', gain: 0.06 }); tone('ui', { freq: 150, dur: 0.12, type: 'square', gain: 0.06, delay: 0.1 }); }],
  recomb:  ['ui', 0.2, () => { [400, 600, 900, 1350].forEach((f, i) => tone('ui', { freq: f, dur: 0.18, type: 'sine', gain: 0.1, delay: i * 0.05 })); noise('ui', { dur: 0.3, gain: 0.06, type: 'highpass', freq: 4000, delay: 0.15 }); }],
  buy:     ['ui', 0.1, () => { tone('ui', { freq: 1568, dur: 0.1, type: 'square', gain: 0.05 }); tone('ui', { freq: 2093, dur: 0.25, type: 'square', gain: 0.05, delay: 0.08 }); }],
  warn:    ['ui', 0.5, () => { tone('ui', { freq: 880, dur: 0.12, type: 'square', gain: 0.05 }); tone('ui', { freq: 880, dur: 0.12, type: 'square', gain: 0.05, delay: 0.18 }); }],
};

// 짧은 시간 안에 연달아 울리면 카운트가 올라가는 콤보 (gap 초 이상 쉬면 초기화)
const combos = {};
function combo(key, gap) {
  const now = ctx.currentTime;
  const c = combos[key] || (combos[key] = { n: 0, t: 0 });
  c.n = now - c.t > gap ? 0 : c.n + 1;
  c.t = now;
  return c.n;
}

export function sfx(name) {
  if (!ctx || ctx.state !== 'running') return;
  const s = SFX[name];
  if (!s) return;
  const now = ctx.currentTime;
  if (lastPlay[name] && now - lastPlay[name] < s[1]) return;
  lastPlay[name] = now;
  s[2]();
}

// ── 배경 음악 (간단한 절차적 루프) ──────────
// Am - F - C - G 진행, 패드 + 베이스 + 아르페지오
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let bgmTimer = null, nextBar = 0, barIdx = 0;
const BAR = 2.4; // 초 (100 BPM, 4/4)

function scheduleBar(t, chord) {
  // 패드
  for (const m of chord) {
    for (const det of [-6, 6]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det;
      f.type = 'lowpass'; f.frequency.value = 900;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.018, t + 0.4);
      g.gain.linearRampToValueAtTime(0.0001, t + BAR + 0.1);
      o.connect(f).connect(g).connect(buses.bgm);
      o.start(t); o.stop(t + BAR + 0.2);
    }
  }
  // 베이스
  for (let b = 0; b < 4; b++) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    const bt = t + b * (BAR / 4);
    o.type = 'triangle'; o.frequency.value = mtof(chord[0] - 12);
    g.gain.setValueAtTime(0.0001, bt);
    g.gain.exponentialRampToValueAtTime(0.11, bt + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, bt + 0.45);
    o.connect(g).connect(buses.bgm);
    o.start(bt); o.stop(bt + 0.5);
  }
  // 아르페지오
  const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
  for (let i = 0; i < 8; i++) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    const at = t + i * (BAR / 8);
    o.type = 'sine'; o.frequency.value = mtof(chord[pattern[i]] + 12);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.035, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
    o.connect(g).connect(buses.bgm);
    o.start(at); o.stop(at + 0.3);
  }
}

function startBgm() {
  if (bgmTimer) return;
  nextBar = ctx.currentTime + 0.2;
  bgmTimer = setInterval(() => {
    while (nextBar < ctx.currentTime + 0.6) {
      scheduleBar(nextBar, CHORDS[barIdx % CHORDS.length]);
      barIdx++;
      nextBar += BAR;
    }
  }, 150);
}
