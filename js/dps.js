// ─────────────────────────────────────────────
//  DPS 표 (화면 좌측): 공격 스킬별 최근 피해량 기록 / 순위 표시
// ─────────────────────────────────────────────
import { game } from './state.js';

const BW = 0.5;          // 기록 칸 하나의 길이 (초)
const NB = 20;           // 칸 수 → 최근 10초 평균
const ROW_H = 40;        // 표 한 줄 높이 (px)

// 피해 기록 (enemies.damage 에서 호출)
export function recordDamage(sk, amount) {
  if (!sk || !(amount > 0)) return;
  const idx = Math.floor(game.time / BW);
  advance(sk, idx);
  sk.dmgB[idx % NB] += amount;
}

function advance(sk, idx) {
  if (!sk.dmgB) { sk.dmgB = new Float64Array(NB); sk.dmgI = idx; if (sk.dpsStart == null) sk.dpsStart = game.time; return; }
  if (idx <= sk.dmgI) return;
  for (let i = sk.dmgI + 1; i <= Math.min(idx, sk.dmgI + NB); i++) sk.dmgB[i % NB] = 0;
  sk.dmgI = idx;
}

export function skillDps(sk) {
  if (sk.dpsStart == null) sk.dpsStart = game.time;
  if (!sk.dmgB) return 0;
  advance(sk, Math.floor(game.time / BW));
  let sum = 0;
  for (let i = 0; i < NB; i++) sum += sk.dmgB[i];
  const span = Math.max(1, Math.min(NB * BW, game.time - sk.dpsStart));
  return sum / span;
}

// 한국식 단위 표기 (최대 2개 단위): 3450만 2432 / 1억 3450만 / 1조 1000억
export function fmtKo(n) {
  n = Math.floor(n);
  if (n < 1e4) return `${n}`;
  const units = n >= 1e12 ? [[1e12, '조'], [1e8, '억']] : n >= 1e8 ? [[1e8, '억'], [1e4, '만']] : [[1e4, '만'], [1, '']];
  const hi = Math.floor(n / units[0][0]);
  const lo = Math.floor((n % units[0][0]) / units[1][0]);
  return lo > 0 ? `${hi}${units[0][1]} ${lo}${units[1][1]}` : `${hi}${units[0][1]}`;
}

const isAttack = (sk) => !!sk.def.base.damage;
const rows = new Map();   // skill → { el, name, num, fill }
let acc = 0;

export function updateDpsTable(dt) {
  const box = document.getElementById('dps');
  if (!box) return;
  acc -= dt;
  if (acc > 0) return;
  acc = 0.25;
  const list = game.skills.filter(isAttack).map((sk) => ({ sk, v: skillDps(sk) }));
  box.classList.toggle('hidden', !list.length || game.state === 'start');
  const listEl = document.getElementById('dps-list');
  // 사라진 스킬 정리
  for (const [sk, r] of rows) if (!list.some((x) => x.sk === sk)) { r.el.remove(); rows.delete(sk); }
  // 순위: DPS 높은 순 (같으면 획득 순서 유지)
  list.sort((a, b) => b.v - a.v || game.skills.indexOf(a.sk) - game.skills.indexOf(b.sk));
  const top = list.length ? list[0].v : 0;
  listEl.style.height = `${list.length * ROW_H}px`;
  list.forEach(({ sk, v }, rank) => {
    let r = rows.get(sk);
    if (!r) {
      const el = document.createElement('div');
      el.className = 'dps-row';
      el.style.setProperty('--c', sk.def.color);
      el.innerHTML = `<div class="dps-icon">${sk.def.icon}</div><div class="dps-main"><div class="dps-head"><span class="dps-name">${sk.def.name}</span><b class="dps-num"></b></div><div class="dps-bar"><i></i></div></div>`;
      el.style.transform = `translateY(${rank * ROW_H}px)`;
      listEl.appendChild(el);
      r = { el, num: el.querySelector('.dps-num'), fill: el.querySelector('.dps-bar i') };
      rows.set(sk, r);
    }
    r.el.style.transform = `translateY(${rank * ROW_H}px)`;
    r.el.classList.toggle('first', rank === 0 && v > 0);
    r.num.textContent = fmtKo(v);
    r.fill.style.width = `${top > 0 ? (v / top) * 100 : 0}%`;
  });
}
