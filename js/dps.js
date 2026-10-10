// ─────────────────────────────────────────────
//  피해량 표 (화면 좌측): 공격 스킬별 총 누적 피해량 / 순위 표시
// ─────────────────────────────────────────────
import { game } from './state.js';

const ROW_H = 40;        // 표 한 줄 높이 (px)

// 피해 기록 (enemies.damage 에서 호출) — 스킬별 총 누적 피해량
export function recordDamage(sk, amount) {
  if (!sk || !(amount > 0)) return;
  sk.dmgTotal = (sk.dmgTotal || 0) + amount;
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
  const list = game.skills.filter(isAttack).map((sk) => ({ sk, v: sk.dmgTotal || 0 }));
  // 마솽 패시브 '개화': 꽃 폭발 피해 (세계수의 씨앗 꽃 포함)
  const bloom = game.sys.bloom;
  if (bloom && bloom.active()) list.push({ sk: bloom.src, v: bloom.src.dmgTotal || 0 });
  box.classList.toggle('hidden', !list.length || game.state === 'start');
  const listEl = document.getElementById('dps-list');
  // 사라진 스킬 정리
  for (const [sk, r] of rows) if (!list.some((x) => x.sk === sk)) { r.el.remove(); rows.delete(sk); }
  // 순위: 누적 피해량 높은 순 (같으면 획득 순서 유지)
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
