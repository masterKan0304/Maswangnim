// ─────────────────────────────────────────────
//  메타 진행: 골드 / 업그레이드 / 설정 (브라우저에 저장)
// ─────────────────────────────────────────────
import { sfx, setVolumes } from './audio.js';
import { STAGE } from './stage.js';

const SAVE_KEY = 'blockchain-save-v1';

export const profile = {
  gold: 0,
  upgrades: {},
  settings: { master: 80, bgm: 50, sfx: 70, ui: 70, masterOn: true, bgmOn: true, sfxOn: true, uiOn: true, labels: true, autoPickup: true },
};

export function loadProfile() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      profile.gold = d.gold || 0;
      profile.upgrades = d.upgrades || {};
      Object.assign(profile.settings, d.settings || {});
    }
  } catch (e) { /* 저장소를 쓸 수 없으면 기본값으로 진행 */ }
  applyVolumeSettings();
}

export function saveProfile() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(profile)); } catch (e) { /* 무시 */ }
}

export function applyVolumeSettings() {
  const s = profile.settings;
  // 각 항목의 토글이 꺼져 있으면 0
  const v = (k) => (s[k + 'On'] === false ? 0 : s[k] / 100);
  setVolumes({ master: v('master'), bgm: v('bgm'), sfx: v('sfx'), ui: v('ui') });
}

// ─────────────────────────────────────────────
//  업그레이드 트리 (중앙에서 문어발처럼 사방으로 뻗음)
//  pos: 트리 좌표 (1 = 칸 간격), parent: 선행 업그레이드 (1레벨 이상 필요)
// ─────────────────────────────────────────────
export const UPGRADES = [
  { id: 'core',      name: '기초 훈련',  icon: '💪', pos: [0, 0],       max: 3, cost: 20, desc: '최대 체력이 5 증가합니다.',               fx: (m, l) => { m.maxHp += 5 * l; } },
  // 생존 (왼쪽)
  { id: 'vital',     name: '강인함',     icon: '❤️', pos: [-1.5, 0],    max: 5, cost: 25, parent: 'core',   desc: '최대 체력이 5 증가합니다.',               fx: (m, l) => { m.maxHp += 5 * l; } },
  { id: 'regen',     name: '재생',       icon: '🌿', pos: [-2.8, -0.8], max: 3, cost: 40, parent: 'vital',  desc: '체력 재생 주기가 1.5초 줄어듭니다.',      fx: (m, l) => { m.regenMinus += 1.5 * l; } },
  { id: 'guard',     name: '보호 본능',  icon: '🛡️', pos: [-2.8, 0.8],  max: 3, cost: 35, parent: 'vital',  desc: '피격 후 무적 시간이 0.1초 늘어납니다.',   fx: (m, l) => { m.invuln += 0.1 * l; } },
  { id: 'heal',      name: '응급 처치',  icon: '🩹', pos: [-4.0, 0],    max: 3, cost: 60, parent: 'regen',  desc: '체력 재생량이 1 증가합니다.',             fx: (m, l) => { m.regenAmount += l; } },
  // 기동 (위)
  { id: 'swift',     name: '신속',       icon: '👟', pos: [0, -1.5],    max: 5, cost: 25, parent: 'core',   desc: '이동 속도가 4% 증가합니다.',              fx: (m, l) => { m.speedMul += 0.04 * l; } },
  { id: 'blink',     name: '순간 이동',  icon: '💨', pos: [-0.9, -2.7], max: 3, cost: 40, parent: 'swift',  desc: '대시 쿨타임이 0.5초 줄어듭니다.',         fx: (m, l) => { m.dashCd -= 0.5 * l; } },
  { id: 'leap',      name: '도약',       icon: '🦘', pos: [0.9, -2.7],  max: 3, cost: 35, parent: 'swift',  desc: '대시 거리가 12% 늘어납니다.',             fx: (m, l) => { m.dashDistMul += 0.12 * l; } },
  { id: 'prepared',  name: '준비된 시작', icon: '🎒', pos: [0, -3.6],   max: 3, cost: 70, parent: 'blink',  desc: '게임을 시작할 때 무작위 블록을 1개 더 얻습니다.', fx: (m, l) => { m.startBlocks += l; } },
  // 마법 (오른쪽)
  { id: 'vessel',    name: '마나 그릇',  icon: '🔷', pos: [1.5, 0],     max: 5, cost: 25, parent: 'core',   desc: '최대 마나가 10 증가합니다.',              fx: (m, l) => { m.maxMana += 10 * l; } },
  { id: 'flow',      name: '마나 순환',  icon: '🌀', pos: [2.8, -0.8],  max: 5, cost: 35, parent: 'vessel', desc: '초당 마나 재생이 1 증가합니다.',            fx: (m, l) => { m.manaRegen += l; } },
  { id: 'power',     name: '마력 증폭',  icon: '🔮', pos: [2.8, 0.8],   max: 5, cost: 40, parent: 'vessel', desc: '적에게 주는 모든 피해가 5% 증가합니다.',  fx: (m, l) => { m.dmgMul += 0.05 * l; } },
  { id: 'element',   name: '원소 친화',  icon: '🌈', pos: [4.0, 0.8],   max: 3, cost: 60, parent: 'power',  desc: '상태이상 발생율이 3% 증가합니다.',       fx: (m, l) => { m.statusAdd += 3 * l; } },
  { id: 'focus',     name: '집중',       icon: '🧘', pos: [4.0, -0.8],  max: 3, cost: 60, parent: 'flow',   desc: '모든 스킬의 마나 소모가 0.5 줄어듭니다.',   fx: (m, l) => { m.manaCostMinus += 0.5 * l; } },
  // 행운 (아래)
  { id: 'study',     name: '배움',       icon: '📖', pos: [0, 1.5],     max: 5, cost: 25, parent: 'core',   desc: '경험치 획득량이 5% 증가합니다.',            fx: (m, l) => { m.xpMul += 0.05 * l; } },
  { id: 'collector', name: '수집가',     icon: '🧲', pos: [-0.9, 2.7],  max: 5, cost: 35, parent: 'study',  desc: '블록 드랍률이 10% 증가합니다.',           fx: (m, l) => { m.dropMul += 0.1 * l; } },
  { id: 'foresight', name: '선견지명',   icon: '🎲', pos: [0.9, 2.7],   max: 3, cost: 45, parent: 'study',  desc: '시작 리롤이 1 증가합니다.',               fx: (m, l) => { m.rerolls += l; } },
  { id: 'reach',     name: '끌림',       icon: '🫴', pos: [-1.8, 3.6],  max: 3, cost: 40, parent: 'collector', desc: '아이템 획득 범위가 15% 넓어집니다.',   fx: (m, l) => { m.pickupMul += 0.15 * l; } },
  { id: 'greed',     name: '탐욕',       icon: '💰', pos: [1.8, 3.6],   max: 3, cost: 60, parent: 'foresight', desc: '골드 획득량이 10% 증가합니다.',          fx: (m, l) => { m.goldMul += 0.1 * l; } },
];
const UP = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

export const levelOf = (id) => profile.upgrades[id] || 0;
export const costOf = (u) => u.cost * 5 * (levelOf(u.id) + 1);   // 레벨마다 비용 증가
export const isUnlocked = (u) => !u.parent || levelOf(u.parent) > 0;

export function computeMods() {
  const m = {
    maxHp: 0, regenMinus: 0, regenAmount: 0, invuln: 0, speedMul: 1, dashCd: 0, dashDistMul: 1, startBlocks: 0,
    maxMana: 0, manaRegen: 0, dmgMul: 1, statusAdd: 0, manaCostMinus: 0,
    xpMul: 1, dropMul: 1, rerolls: 0, pickupMul: 1, goldMul: 1,
  };
  for (const u of UPGRADES) { const l = levelOf(u.id); if (l > 0) u.fx(m, l); }
  return m;
}

// ─────────────────────────────────────────────
//  업그레이드 창
// ─────────────────────────────────────────────
const CELL_X = 132, CELL_Y = 98;
// 트리 보기 상태: 배경 드래그로 이동, 휠로 확대/축소 (창을 닫았다 열어도 유지)
const view = { x: null, y: null, z: 1 };
let bound = false;

function treeBounds() {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const u of UPGRADES) {
    minX = Math.min(minX, u.pos[0] * CELL_X); maxX = Math.max(maxX, u.pos[0] * CELL_X);
    minY = Math.min(minY, u.pos[1] * CELL_Y); maxY = Math.max(maxY, u.pos[1] * CELL_Y);
  }
  return { minX: minX - 80, maxX: maxX + 80, minY: minY - 60, maxY: maxY + 90 };
}

// 트리가 화면 밖으로 너무 멀리 나가지 않도록: 화면 중앙이 항상 트리의 가장 바깥 노드들 안쪽에 있게 제한
function clampView(W, H) {
  const b = treeBounds();
  const z = view.z;
  const lo = (a, mn, mx) => Math.max(mn, Math.min(mx, a));
  view.x = lo(view.x, W / 2 - (b.maxX - 80) * z, W / 2 - (b.minX + 80) * z);
  view.y = lo(view.y, H / 2 - (b.maxY - 90) * z, H / 2 - (b.minY + 60) * z);
}

function applyView() {
  const box = document.getElementById('up-tree');
  const layer = document.getElementById('up-canvas');
  if (!layer) return;
  clampView(box.clientWidth, box.clientHeight);
  layer.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.z})`;
}

function bindTreeControls() {
  if (bound) return;
  bound = true;
  const box = document.getElementById('up-tree');
  let pan = null;
  box.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('.up-node')) return;
    pan = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    box.classList.add('panning');
    e.preventDefault();
  });
  addEventListener('pointermove', (e) => {
    if (!pan) return;
    view.x = pan.vx + (e.clientX - pan.x) / STAGE.scale;
    view.y = pan.vy + (e.clientY - pan.y) / STAGE.scale;
    applyView();
  });
  addEventListener('pointerup', () => { pan = null; box.classList.remove('panning'); });
  box.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = box.getBoundingClientRect();
    const mx = (e.clientX - r.left) / STAGE.scale, my = (e.clientY - r.top) / STAGE.scale;
    const z2 = Math.max(0.6, Math.min(1.8, view.z * (e.deltaY > 0 ? 0.9 : 1.1)));
    view.x = mx - (mx - view.x) * (z2 / view.z);
    view.y = my - (my - view.y) * (z2 / view.z);
    view.z = z2;
    applyView();
  }, { passive: false });
}

export function renderUpgrades(onGold) {
  bindTreeControls();
  const box = document.getElementById('up-tree');
  box.innerHTML = '';
  document.getElementById('up-gold').textContent = profile.gold.toLocaleString();
  if (view.x == null) { view.x = box.clientWidth / 2; view.y = box.clientHeight / 2 - 10; }
  const layer = document.createElement('div');
  layer.id = 'up-canvas';
  box.appendChild(layer);
  const P = (u) => [u.pos[0] * CELL_X, u.pos[1] * CELL_Y];

  // 연결선
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', 1); svg.setAttribute('height', 1);
  svg.classList.add('up-lines');
  for (const u of UPGRADES) {
    if (!u.parent) continue;
    const [x1, y1] = P(UP[u.parent]), [x2, y2] = P(u);
    const line = document.createElementNS(svgNS, 'path');
    const mx = (x1 + x2) / 2;
    line.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
    line.setAttribute('class', levelOf(u.id) > 0 ? 'on' : isUnlocked(u) ? 'open' : '');
    svg.appendChild(line);
  }
  layer.appendChild(svg);

  // 노드
  for (const u of UPGRADES) {
    const [x, y] = P(u);
    const lv = levelOf(u.id);
    const maxed = lv >= u.max;
    const unlocked = isUnlocked(u);
    const cost = costOf(u);
    const poor = !maxed && profile.gold < cost;
    const node = document.createElement('div');
    node.className = 'up-node' + (lv > 0 ? ' owned' : '') + (maxed ? ' maxed' : '') + (!unlocked ? ' locked' : '') + (unlocked && !maxed && !poor ? ' affordable' : '');
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.innerHTML = `<div class="un-circle"><span class="un-icon">${u.icon}</span><span class="un-lv">${lv}/${u.max}</span></div>
      <div class="un-name">${u.name}</div>
      <div class="un-cost${poor ? ' poor' : ''}">${maxed ? 'MAX' : `${unlocked ? '' : '🔒 '}💰 ${cost}`}</div>`;
    node._tip = () => {
      let h = `<div class="tip-title">${u.icon} ${u.name} <span class="tip-dim">Lv.${lv}/${u.max}</span></div><div>레벨마다 ${u.desc}</div>`;
      if (!unlocked) h += `<div class="tip-warn">🔒 "${UP[u.parent].name}"을(를) 먼저 1레벨 이상 올려야 합니다.</div>`;
      else if (maxed) h += '<div class="tip-ok">최대 레벨입니다.</div>';
      else h += `<div class="${poor ? 'tip-warn' : 'tip-ok'}">강화 비용은 💰 ${cost}입니다. (보유 ${profile.gold})</div>`;
      return h;
    };
    node.addEventListener('click', () => {
      if (!unlocked || maxed || poor) { sfx('error'); return; }
      profile.gold -= cost;
      profile.upgrades[u.id] = lv + 1;
      saveProfile();
      sfx('buy');
      renderUpgrades(onGold);
      if (onGold) onGold();
    });
    layer.appendChild(node);
  }
  applyView();
}

// ─────────────────────────────────────────────
//  설정 창
// ─────────────────────────────────────────────
// 켜고 끄는 토글 버튼: 다시 그리지 않고 클래스만 바꿔서 동그라미가 좌우로 미끄러지게
function makeToggle(on, onFlip) {
  const btn = document.createElement('button');
  btn.className = 'toggle' + (on ? ' on' : '');
  btn.innerHTML = '<span class="t-on">ON</span><span class="t-off">OFF</span><i></i>';
  btn.addEventListener('click', () => {
    const v = !btn.classList.contains('on');
    btn.classList.toggle('on', v);
    onFlip(v);
  });
  return btn;
}

export function renderSettings(onChange) {
  const s = profile.settings;
  const box = document.getElementById('set-body');
  box.innerHTML = '';
  const sliders = [['master', '전체 사운드'], ['bgm', '배경 사운드'], ['sfx', '전투 사운드'], ['ui', 'UI 사운드']];
  const sec1 = document.createElement('div');
  sec1.className = 'set-sec';
  sec1.innerHTML = '<div class="set-title">🔊 사운드</div>';
  for (const [k, label] of sliders) {
    const row = document.createElement('div');
    row.className = 'set-row' + (s[k + 'On'] === false ? ' muted' : '');
    row.innerHTML = `<span class="set-label">${label}</span><input type="range" min="0" max="100" step="1" value="${s[k]}"><span class="set-val">${s[k]}</span>`;
    const input = row.querySelector('input'), val = row.querySelector('.set-val');
    input.addEventListener('input', () => {
      s[k] = +input.value;
      val.textContent = s[k];
      applyVolumeSettings();
    });
    input.addEventListener('change', () => { saveProfile(); sfx(k === 'sfx' ? 'kill' : 'click'); });
    const tg = makeToggle(s[k + 'On'] !== false, (on) => {
      s[k + 'On'] = on;
      row.classList.toggle('muted', !on);
      applyVolumeSettings();
      saveProfile();
      sfx(on ? 'toggleOn' : 'toggleOff');
    });
    tg.classList.add('small');
    row.appendChild(tg);
    sec1.appendChild(row);
  }
  box.appendChild(sec1);

  const sec2 = document.createElement('div');
  sec2.className = 'set-sec';
  sec2.innerHTML = '<div class="set-title">🎮 게임</div>';
  const toggles = [['labels', '아이템 이름표 표시', 'Z'], ['autoPickup', '아이템 자동 획득', 'X']];
  for (const [k, label, key] of toggles) {
    const row = document.createElement('div');
    row.className = 'set-row';
    row.innerHTML = `<span class="set-label">${label} <kbd>${key}</kbd></span>`;
    row.appendChild(makeToggle(s[k], (on) => {
      s[k] = on;
      sfx(on ? 'toggleOn' : 'toggleOff');
      saveProfile();
      if (onChange) onChange();
    }));
    sec2.appendChild(row);
  }
  box.appendChild(sec2);
}
