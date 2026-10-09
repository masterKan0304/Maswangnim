// ─────────────────────────────────────────────
//  메타 진행: 골드 / 업그레이드 / 설정 (브라우저에 저장)
// ─────────────────────────────────────────────
import { sfx, setVolumes } from './audio.js';
import { STAGE } from './stage.js';
import { ic } from './icons.js';
import { accountNeed, ACCOUNT_UNLOCKS } from './config.js';
import { CHARACTERS, masteryNeed } from './characters.js';
import { NODES, NODE, EDGES, CLUSTERS, ROOT, neighborsOf, emptyMods, OLD_COST } from './upgrades.js';
import { KB, KEY_ACTIONS, keyName, keyOf, loadKeys, isAllowedKey, duplicateCodes } from './keys.js';

const SAVE_KEY = 'blockchain-save-v1';

export const profile = {
  gold: 0,
  upgrades: {},
  cleared: [],     // 클리어한 스테이지 번호 (첫 클리어 보상을 받은 스테이지)
  stage: 0,        // 마지막으로 고른 스테이지 (처음 플레이하면 튜토리얼)
  accountLevel: 1, // 계정 레벨
  accountXp: 0,    // 현재 레벨에서 쌓인 계정 경험치
  character: 'masang',   // 고른 캐릭터
  mastery: {},           // 캐릭터별 숙련도 { id: { lv, xp } }
  crystals: 0,           // 크리스탈 (스테이지 클리어마다 1개, 빨간 업그레이드에 씀)
  upgVer: 2,             // 업그레이드 트리 버전
  settings: { master: 80, bgm: 50, sfx: 70, ui: 70, masterOn: true, bgmOn: true, sfxOn: true, uiOn: true, labels: true, autoPickup: true },
};

export function loadProfile() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      profile.gold = d.gold || 0;
      profile.upgrades = d.upgrades || {};
      profile.cleared = Array.isArray(d.cleared) ? d.cleared : [];
      // 이전 저장 데이터: 이미 플레이한 기록이 있으면 스테이지 1 선택
      profile.stage = d.stage ?? (d.gold || Object.keys(profile.upgrades).length ? 1 : 0);
      profile.accountLevel = d.accountLevel || 1;
      profile.accountXp = d.accountXp || 0;
      profile.character = d.character || 'masang';
      profile.mastery = d.mastery || {};
      profile.crystals = d.crystals || 0;
      // 이전 업그레이드 트리: 쓴 골드를 모두 돌려주고 새 트리로
      if (d.upgVer !== 2) {
        for (const [id, lv] of Object.entries(profile.upgrades)) {
          const c = OLD_COST[id];
          if (c) for (let l = 0; l < lv; l++) profile.gold += c * 5 * (l + 1);
        }
        profile.upgrades = {};
        profile.upgVer = 2;
      }
      Object.assign(profile.settings, d.settings || {});
    }
  } catch (e) { /* 저장소를 쓸 수 없으면 기본값으로 진행 */ }
  applyVolumeSettings();
}

export function saveProfile() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(profile)); } catch (e) { /* 무시 */ }
}

// 캐릭터 숙련도
export const masteryOf = (id) => profile.mastery[id] || (profile.mastery[id] = { lv: 1, xp: 0 });
export function addMasteryXp(id, v) {
  const m = masteryOf(id);
  const from = m.lv;
  m.xp += Math.floor(v);
  while (m.xp >= masteryNeed(m.lv)) { m.xp -= masteryNeed(m.lv); m.lv++; }
  const ch = CHARACTERS[id];
  const unlocked = ch ? ch.skills.filter((k) => k && ch.unlock[k] > from && ch.unlock[k] <= m.lv) : [];
  return { from, to: m.lv, unlocked };
}

// 계정 경험치 추가 → 오른 레벨들과 새로 해금된 항목을 돌려줌
export function addAccountXp(v) {
  const from = profile.accountLevel;
  profile.accountXp += Math.floor(v);
  while (profile.accountXp >= accountNeed(profile.accountLevel)) {
    profile.accountXp -= accountNeed(profile.accountLevel);
    profile.accountLevel++;
  }
  const unlocked = { skills: [], templates: [] };
  for (let lv = from + 1; lv <= profile.accountLevel; lv++) {
    const u = ACCOUNT_UNLOCKS[lv];
    if (u) { unlocked.skills.push(...u.skills); unlocked.templates.push(...u.templates); }
  }
  return { from, to: profile.accountLevel, unlocked };
}

export function applyVolumeSettings() {
  const s = profile.settings;
  // 각 항목의 토글이 꺼져 있으면 0
  const v = (k) => (s[k + 'On'] === false ? 0 : s[k] / 100);
  setVolumes({ master: v('master'), bgm: v('bgm'), sfx: v('sfx'), ui: v('ui') });
}

// ─────────────────────────────────────────────
//  업그레이드 트리 (upgrades.js) — 연결된 업그레이드를 하나라도 얻으면 살 수 있음
//  빨간 노드는 같은 묶음의 파란 노드를 모두 얻어야 하고, 크리스탈로 삼
// ─────────────────────────────────────────────
export const levelOf = (id) => profile.upgrades[id] || 0;
export const costOf = (u) => (u.crystal ? u.crystal : u.costs[Math.min(levelOf(u.id), u.costs.length - 1)]);
export function isUnlocked(u) {
  if (u.id === ROOT) return true;
  if (CLUSTERS[u.id]) return CLUSTERS[u.id].every((b) => levelOf(b) > 0);
  return neighborsOf(u.id).some((n) => levelOf(n) > 0);
}
const lockReason = (u) => (CLUSTERS[u.id]
  ? `${CLUSTERS[u.id].map((b) => `"${NODE[b].name}"`).join(', ')}을(를) 모두 얻어야 합니다.`
  : '연결된 업그레이드를 하나 이상 얻어야 합니다.');

export function computeMods(noUpgrades = false) {
  const m = emptyMods();
  if (!noUpgrades) for (const u of NODES) { const l = levelOf(u.id); if (l > 0) u.fx(m, l); }
  return m;
}

// ─────────────────────────────────────────────
//  업그레이드 창 (배경 드래그로 이동, 휠로 확대/축소)
// ─────────────────────────────────────────────
const view = { x: null, y: null, z: 0.46 };
let bound = false;

function treeBounds() {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const u of NODES) { minX = Math.min(minX, u.x); maxX = Math.max(maxX, u.x); minY = Math.min(minY, u.y); maxY = Math.max(maxY, u.y); }
  return { minX: minX - 80, maxX: maxX + 80, minY: minY - 60, maxY: maxY + 90 };
}

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
    const z2 = Math.max(0.35, Math.min(1.6, view.z * (e.deltaY > 0 ? 0.9 : 1.1)));
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
  const cr = document.getElementById('up-crystal');
  if (cr) cr.textContent = profile.crystals;
  // 처음 열면 트리 전체가 보이도록 (기초 훈련이 아래 가운데)
  if (view.x == null) { view.x = box.clientWidth / 2; view.y = box.clientHeight - 70; }
  const layer = document.createElement('div');
  layer.id = 'up-canvas';
  box.appendChild(layer);

  // 연결선 (빨간 노드 ↔ 묶음 파란 노드는 붉은 선)
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', 1); svg.setAttribute('height', 1);
  svg.classList.add('up-lines');
  const line = (a, b, cls) => {
    const l = document.createElementNS(svgNS, 'line');
    l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
    l.setAttribute('class', cls);
    svg.appendChild(l);
  };
  for (const [ia, ib] of EDGES) {
    const a = NODE[ia], b = NODE[ib];
    const la = levelOf(ia) > 0, lb = levelOf(ib) > 0;
    line(a, b, la && lb ? 'on' : la || lb ? 'open' : '');
  }
  for (const [rid, blues] of Object.entries(CLUSTERS)) for (const bid of blues) line(NODE[rid], NODE[bid], 'red' + (levelOf(bid) > 0 ? ' on' : ''));
  layer.appendChild(svg);

  // 노드
  for (const u of NODES) {
    const lv = levelOf(u.id);
    const maxed = lv >= u.max;
    const unlocked = isUnlocked(u);
    const cost = costOf(u);
    const have = u.crystal ? profile.crystals : profile.gold;
    const poor = !maxed && have < cost;
    const node = document.createElement('div');
    node.className = `up-node k-${u.kind}` + (lv > 0 ? ' owned' : '') + (maxed ? ' maxed' : '') + (!unlocked ? ' locked' : '') + (unlocked && !maxed && !poor ? ' affordable' : '');
    node.style.left = u.x + 'px';
    node.style.top = u.y + 'px';
    const costHtml = maxed ? 'MAX' : `${unlocked ? '' : ic('lock') + ' '}${u.crystal ? ic('gem') : ic('coin')} ${cost.toLocaleString()}`;
    node.innerHTML = `<div class="un-circle"><span class="un-icon">${u.iconHtml}</span>${u.max > 1 ? `<span class="un-lv">${lv}/${u.max}</span>` : ''}</div>
      <div class="un-name">${u.name}</div>
      <div class="un-cost${poor ? ' poor' : ''}">${costHtml}</div>`;
    node._tip = () => {
      let h = `<div class="tip-title">${u.iconHtml} ${u.name} <span class="tip-dim">${u.max > 1 ? `Lv.${lv}/${u.max}` : lv ? '획득' : ''}</span></div><div>${u.max > 1 ? '레벨마다 ' : ''}${u.desc}</div>`;
      if (u.kind === 'r') h += '<div class="tip-dim">크리스탈은 스테이지를 클리어할 때마다 1개 얻습니다.</div>';
      if (!unlocked) h += `<div class="tip-warn">${ic('lock')} ${lockReason(u)}</div>`;
      else if (maxed) h += '<div class="tip-ok">최대 레벨입니다.</div>';
      else h += `<div class="${poor ? 'tip-warn' : 'tip-ok'}">비용은 ${u.crystal ? `${ic('gem')} 크리스탈 ${cost}개` : `${ic('coin')} ${cost.toLocaleString()}`}입니다. (보유 ${u.crystal ? profile.crystals : profile.gold.toLocaleString()})</div>`;
      return h;
    };
    node.addEventListener('click', () => {
      if (!unlocked || maxed || poor) { sfx('error'); return; }
      if (u.crystal) profile.crystals -= cost; else profile.gold -= cost;
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

// ─────────────────────────────────────────────
//  설정 창: 게임 / 조작 / 사운드
// ─────────────────────────────────────────────
let setTab = 'game';
let capture = null;   // 키 입력을 기다리는 중인 조작 { action, btn }

export function renderSettings(onChange, onKeys) {
  const s = profile.settings;
  const box = document.getElementById('set-body');
  box.innerHTML = '';
  stopCapture();
  const tabs = document.createElement('div');
  tabs.className = 'set-tabs';
  for (const [k, name, icon] of [['game', '게임', 'gamepad'], ['keys', '조작', 'hand'], ['sound', '사운드', 'speaker']]) {
    const b = document.createElement('button');
    b.className = 'set-tab' + (setTab === k ? ' on' : '');
    b.innerHTML = `${ic(icon)} ${name}`;
    b.addEventListener('click', () => { if (setTab !== k) { setTab = k; sfx('select'); renderSettings(onChange, onKeys); } });
    tabs.appendChild(b);
  }
  box.appendChild(tabs);
  const sec = document.createElement('div');
  sec.className = 'set-sec';
  box.appendChild(sec);

  if (setTab === 'sound') {
    const sliders = [['master', '전체 사운드'], ['bgm', '배경 사운드'], ['sfx', '전투 사운드'], ['ui', 'UI 사운드']];
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
      sec.appendChild(row);
    }
    return;
  }

  if (setTab === 'game') {
    for (const [k, label, action] of [['labels', '아이템 이름표 표시', 'labels'], ['autoPickup', '아이템 자동 획득', 'pickup']]) {
      const row = document.createElement('div');
      row.className = 'set-row';
      row.innerHTML = `<span class="set-label">${label} <kbd>${keyOf(action)}</kbd></span>`;
      row.appendChild(makeToggle(s[k], (on) => {
        s[k] = on;
        sfx(on ? 'toggleOn' : 'toggleOff');
        saveProfile();
        if (onChange) onChange();
      }));
      sec.appendChild(row);
    }
    return;
  }

  // 조작: 버튼을 누른 뒤 키를 입력하면 할당
  const grid = document.createElement('div');
  grid.className = 'key-grid';
  const dups = duplicateCodes();
  for (const [action, label] of KEY_ACTIONS) {
    const row = document.createElement('div');
    row.className = 'key-row';
    row.innerHTML = `<span class="set-label">${label}</span>`;
    const btn = document.createElement('button');
    btn.className = 'key-btn' + (dups.has(KB[action]) ? ' dup' : '');
    btn.textContent = keyName(KB[action]);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (capture && capture.action === action) { stopCapture(); return; }
      startCapture(action, btn, () => { saveKeys(); renderSettings(onChange, onKeys); if (onKeys) onKeys(); });
    });
    row.appendChild(btn);
    grid.appendChild(row);
  }
  sec.appendChild(grid);
  const foot = document.createElement('div');
  foot.className = 'key-foot';
  foot.innerHTML = `<span class="key-msg">${dups.size ? `${ic('warn')} 빨간 키는 여러 조작에 함께 할당되어 있습니다. 모두 동작합니다.` : '버튼을 누른 뒤 원하는 키를 입력하세요. Esc 로 취소합니다.'}</span>`;
  const reset = document.createElement('button');
  reset.className = 'menu-btn key-reset';
  reset.textContent = '기본값으로';
  reset.addEventListener('click', () => { loadKeys({}); saveKeys(); sfx('select'); renderSettings(onChange, onKeys); if (onKeys) onKeys(); });
  foot.appendChild(reset);
  sec.appendChild(foot);
}

function saveKeys() {
  profile.settings.keys = { ...KB };
  saveProfile();
}

function stopCapture() {
  if (!capture) return;
  capture.btn.classList.remove('listening');
  capture.btn.textContent = keyName(KB[capture.action]);
  removeEventListener('keydown', onCaptureKey, true);
  removeEventListener('pointerdown', onCapturePointer, true);
  removeEventListener('wheel', onCaptureWheel, true);
  capture = null;
}

function startCapture(action, btn, done) {
  stopCapture();
  capture = { action, btn, done };
  btn.classList.add('listening');
  btn.textContent = '키 입력…';
  sfx('open');
  addEventListener('keydown', onCaptureKey, true);
  addEventListener('pointerdown', onCapturePointer, true);
  addEventListener('wheel', onCaptureWheel, true);
}

function rejectCapture(msg) {
  const c = capture;
  sfx('error');
  stopCapture();
  c.btn.classList.add('reject');
  const m = document.querySelector('#set-body .key-msg');
  if (m) { m.textContent = msg; m.classList.add('bad'); }
  setTimeout(() => c.btn.classList.remove('reject'), 450);
}

// 키 입력 대기 중에는 게임 단축키로 넘기지 않음
function onCaptureKey(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
  if (!capture) return;
  if (e.code === 'Escape') { stopCapture(); sfx('close'); return; }
  if (!isAllowedKey(e.code)) { rejectCapture(`'${keyName(e.code)}' 키는 할당할 수 없습니다.`); return; }
  const c = capture;
  KB[c.action] = e.code;
  stopCapture();
  sfx('equip');
  c.done();
}
function onCapturePointer(e) {
  if (!capture) return;
  if (e.target === capture.btn) return;   // 같은 버튼을 다시 누르면 취소 (click 에서 처리)
  e.preventDefault(); e.stopPropagation();
  rejectCapture('마우스 버튼은 할당할 수 없습니다.');
}
function onCaptureWheel(e) {
  if (!capture) return;
  e.preventDefault(); e.stopPropagation();
  rejectCapture('마우스 휠은 할당할 수 없습니다.');
}
