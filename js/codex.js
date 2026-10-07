// ─────────────────────────────────────────────
//  도감: 스킬 / 블록 / 적
//  왼쪽 절반은 목록(격자), 오른쪽 절반은 고른 항목의 자세한 정보 + 미리보기 영상
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { game } from './state.js';
import { SUBJECTS, SUBJECT_ORDER, CHANGES, CHANGE_ORDER, ENEMY_TYPES, ELEMENTS, ENEMY_SKILLS, MAX_SKILL_LEVEL, unlockLevel } from './config.js';
import { SKILL_DEFS, SKILL_ORDER, baseStats, shownStats, statText, statLabel, milestoneText } from './skills.js';
import { makeSentence, makeWord, makeFixed, makeRange, makePercent, makeOp, TEMPLATE_INFO, RARITY_NAME, OP_NAME, OP_SYMBOL } from './blocks.js';
import { ic } from './icons.js';
import { sfx } from './audio.js';
import { STAGE } from './stage.js';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

// ── 블록 도감 데이터 ──
const TEMPLATE_DESC = {
  SNC: '주체의 값을 수치만큼 바꾸는 문장입니다.',
  SSC: '앞 주체의 값만큼 뒤 주체의 값을 바꾸는 문장입니다.',
  ZONE: '적을 처치하면 그 자리에 스킬 속성의 지대를 남깁니다. 지대 위의 적은 해당 상태이상에 걸립니다.',
  INFUSE: '투사체가 속성 지대 위를 지나가면 그 속성의 피해를 추가로 얻습니다.',
  AMP: '장착된 다른 모든 문장의 효과를 바꿉니다.',
};
const NUMBERS = [
  { key: 'fixed', name: '고정값', block: () => makeFixed(5), range: '2 ~ 8', desc: '항상 같은 값을 가진 수치입니다.' },
  { key: 'range', name: '랜덤값', block: () => makeRange(3, 7), range: '최소 2 ~ 6, 최대 3 ~ 10', desc: '사용할 때마다 범위 안에서 무작위 값이 정해지는 수치입니다.' },
  { key: 'percent', name: '백분율', block: () => makePercent(30), range: '10% ~ 90%', desc: '현재 값에 대한 비율로 작용하는 수치입니다.' },
];
const OPS = ['+', '-', '*', '/'];

// ── 적 도감 데이터 (스테이지 등장 순서) ──
const ENEMIES = [
  { type: 'green', grade: '일반' },
  { type: 'yellow', grade: '일반' },
  { type: 'elite', grade: '정예' },
  { type: 'red', grade: '일반' },
  { type: 'boss', grade: '보스' },
];
const L = ENEMY_SKILLS;
const ENEMY_ABILITY = {
  elite: [`${L.eliteLeap.every}초마다 ${L.eliteLeap.charge}초간 힘을 모은 뒤, 플레이어 위치로 최대 ${L.eliteLeap.range} 거리까지 도약합니다. 착지 지점에는 경고 장판이 나타나며, 안에 있으면 공격력의 ${L.eliteLeap.dmgMul * 100}% 피해를 입고 밀려납니다.`],
  boss: [
    `${L.bossSpit.every}초마다 ${L.bossSpit.charge}초간 힘을 모은 뒤, 플레이어 쪽으로 최대 ${L.bossSpit.bounces}번 튕기는 점액을 내보냅니다. 튕길 때마다 주위에 피해를 주고 밀어내며 슬라임을 소환합니다. 마지막에는 3배로 소환합니다.`,
    `${L.bossStomp.every}초마다 ${L.bossStomp.time}초간 제자리에서 ${L.bossStomp.jumps}번 뛰며, 착지할 때마다 주위에 피해를 주고 밀어내며 슬라임 ${L.bossStomp.spawn}마리를 소환합니다.`,
  ],
};

const state = { tab: 'skill', sel: { skill: 'fireball', block: 's:SNC', enemy: 'green' }, level: 1 };
let opts = null;
let renderer = null, camera = null, canvas = null, previewOn = false, viewW = 11;

export function initCodex(o) {
  opts = o;   // { demo, scene, ui }
}

export function openCodex() { renderCodex(); }

// 도감을 닫음: 미리보기 장면을 끝내고 교차 편집 미리보기로 돌아감
export function closeCodex() {
  setPreview(null);
}

export const codexPreviewActive = () => previewOn;

function setPreview(cfg) {
  previewOn = !!cfg;
  opts.demo.setShowcase(cfg);
  const box = $('#cx-preview');
  if (box) box.classList.toggle('hidden', !cfg);
  if (!cfg) return;
  viewW = cfg.kind === 'enemy' ? (cfg.type === 'boss' ? 17 : cfg.type === 'elite' ? 13 : 9) : 11.5;
}

// 매 프레임: 미리보기 영상 그리기 (도감 전용 렌더러)
export function renderCodexPreview() {
  if (!previewOn) return;
  if (!canvas || !canvas.offsetParent) return;
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
  }
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const pr = Math.min(2, devicePixelRatio * STAGE.scale);
  if (canvas.width !== Math.round(w * pr) || canvas.height !== Math.round(h * pr)) {
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
  }
  const a = w / h;
  camera.left = -viewW / 2; camera.right = viewW / 2;
  camera.top = viewW / a / 2; camera.bottom = -viewW / a / 2;
  camera.updateProjectionMatrix();
  camera.position.set(30, 27, 30);
  camera.lookAt(0, 0, 0);
  renderer.render(opts.scene, camera);
}

// ── 화면 ──
function renderCodex() {
  const root = $('#codex-body');
  root.innerHTML = '';
  const tabs = el('div', 'cx-tabs');
  for (const [k, name, icon] of [['skill', '스킬', 'book'], ['block', '블록', 'puzzle'], ['enemy', '적', 'skull']]) {
    const b = el('button', 'cx-tab' + (state.tab === k ? ' on' : ''), `${ic(icon)} ${name}`);
    b.addEventListener('click', () => { if (state.tab !== k) { state.tab = k; state.level = 1; sfx('select'); renderCodex(); } });
    tabs.appendChild(b);
  }
  root.appendChild(tabs);
  const body = el('div', 'cx-body');
  const grid = el('div', 'cx-grid');
  const detail = el('div', 'cx-detail');
  const info = el('div', 'cx-info');
  const pv = el('div', 'cx-preview hidden', '<span class="cx-pv-label">미리보기</span>');
  pv.id = 'cx-preview';
  // 미리보기 캔버스는 하나를 계속 재사용 (렌더러를 매번 새로 만들지 않도록)
  if (!canvas) { canvas = document.createElement('canvas'); canvas.id = 'codex-canvas'; }
  pv.prepend(canvas);
  detail.append(info, pv);
  body.append(grid, detail);
  root.appendChild(body);

  if (state.tab === 'skill') renderSkills(grid, info);
  else if (state.tab === 'block') renderBlocks(grid, info);
  else renderEnemies(grid, info);
}

function item(grid, id, iconHtml, name, opts2 = {}) {
  const tab = state.tab;
  const it = el('div', 'cx-item' + (state.sel[tab] === id ? ' sel' : '') + (opts2.locked ? ' locked' : ''), `<div class="cx-ic">${iconHtml}</div><div class="cx-name">${name}</div>${opts2.badge ? `<span class="cx-badge">${opts2.badge}</span>` : ''}`);
  if (opts2.color) it.style.setProperty('--c', opts2.color);
  it.addEventListener('click', () => {
    if (state.sel[tab] === id) return;
    state.sel[tab] = id; state.level = 1; sfx('select'); renderCodex();
  });
  grid.appendChild(it);
}

function section(grid, title) { grid.appendChild(el('div', 'cx-sec', title)); }

// 스킬
function renderSkills(grid, info) {
  for (const key of SKILL_ORDER) {
    const d = SKILL_DEFS[key];
    const lv = unlockLevel('skills', key);
    item(grid, key, d.icon, d.name, { color: d.color, locked: game.accountLevel < lv, badge: game.accountLevel < lv ? `${ic('lock')} Lv.${lv}` : '' });
  }
  const d = SKILL_DEFS[state.sel.skill];
  const lv = state.level;
  const st = baseStats({ def: d, key: d.key, level: lv }, lv);
  const need = unlockLevel('skills', d.key);
  const tags = [d.element ? `<span class="elem e-${d.element}">${ELEMENTS[d.element].name}</span>` : '', `<span class="cx-tag">${d.passive ? '패시브' : '액티브'}</span>`,
    need > 1 ? `<span class="cx-tag ${game.accountLevel >= need ? 'ok' : 'lock'}">계정 Lv.${need} 해금</span>` : ''].join('');
  const stats = shownStats(d, st).filter((k) => st[k] && st[k].max !== 0).map((k) => `<div class="cx-stat"><span>${statLabel(d, k)}</span><b>${statText(k, st)}</b></div>`).join('');
  info.innerHTML = `<div class="cx-title"><span class="cx-big" style="--c:${d.color}">${d.icon}</span><div><div class="cx-nm">${d.name}</div><div class="cx-tags">${tags}</div></div></div>
    <div class="cx-desc">${d.desc}</div>
    <div class="cx-levels"></div>
    <div class="cx-stats">${stats || '<div class="tip-dim">표시할 능력치가 없습니다.</div>'}</div>
    ${[3, 5].map((m) => `<div class="cx-mile${lv >= m ? ' on' : ''}">${m}레벨 효과 : ${milestoneText(d, m)}</div>`).join('')}`;
  const levels = info.querySelector('.cx-levels');
  for (let i = 1; i <= MAX_SKILL_LEVEL; i++) {
    const b = el('button', 'cx-lv' + (i === lv ? ' on' : '') + (i === 3 || i === 5 ? ' mile' : ''), `Lv.${i}`);
    b.addEventListener('click', () => { if (state.level !== i) { state.level = i; sfx('select'); renderCodex(); } });
    levels.appendChild(b);
  }
  setPreview({ kind: 'skill', key: d.key, level: lv });
}

// 블록 (문장 > 주체 > 변화 > 수치 > 연산)
function renderBlocks(grid, info) {
  const tile = (b) => opts.ui.makeTile(b).outerHTML;
  section(grid, '문장');
  for (const t of Object.keys(TEMPLATE_INFO)) item(grid, `s:${t}`, tile(makeSentence(t, false)), TEMPLATE_INFO[t].label + (t === 'SSC' ? ' (주·주)' : t === 'SNC' ? ' (주·수)' : ''));
  section(grid, '주체');
  for (const k of SUBJECT_ORDER.filter((k) => !SUBJECTS[k].noWord)) item(grid, `w:${k}`, tile(makeWord(k)), SUBJECTS[k].name);
  section(grid, '변화');
  for (const k of CHANGE_ORDER) item(grid, `c:${k}`, tile(makeWord(k)), CHANGES[k].name);
  section(grid, '수치');
  for (const n of NUMBERS) item(grid, `n:${n.key}`, tile(n.block()), n.name);
  section(grid, '연산');
  for (const o of OPS) item(grid, `o:${o}`, tile(makeOp(o)), OP_NAME[o]);
  setPreview(null);

  const [kind, key] = state.sel.block.split(':');
  let h = '';
  if (kind === 's') {
    const inf = TEMPLATE_INFO[key];
    const need = unlockLevel('templates', key);
    h = `<div class="cx-title"><span class="cx-big tilebox">${tile(makeSentence(key, false))}</span><div><div class="cx-nm">${inf.label}</div><div class="cx-tags"><span class="cx-tag">문장</span><span class="cx-tag rar${inf.rarity}">${RARITY_NAME[inf.rarity]}</span>${need > 1 ? `<span class="cx-tag ${game.accountLevel >= need ? 'ok' : 'lock'}">계정 Lv.${need} 해금</span>` : ''}</div></div></div>
      <div class="cx-desc">${TEMPLATE_DESC[key]}</div><div class="cx-sub">문장 구성</div><div class="sentence-line cx-line"></div>`;
  } else if (kind === 'w') {
    const S = SUBJECTS[key];
    const notes = [S.pctOnly ? '백분율 수치만 넣을 수 있습니다.' : '', S.int ? '정수로만 적용됩니다 (소수점 버림).' : '', S.unit ? `단위: ${S.unit}` : ''].filter(Boolean);
    h = `<div class="cx-title"><span class="cx-big tilebox">${tile(makeWord(key))}</span><div><div class="cx-nm">${S.name}</div><div class="cx-tags"><span class="cx-tag">단어:주체</span></div></div></div>
      <div class="cx-desc">${S.desc}</div>${notes.map((n) => `<div class="cx-note">${n}</div>`).join('')}`;
  } else if (kind === 'c') {
    const C = CHANGES[key];
    h = `<div class="cx-title"><span class="cx-big tilebox">${tile(makeWord(key))}</span><div><div class="cx-nm">${C.name}</div><div class="cx-tags"><span class="cx-tag">단어:변화</span></div></div></div>
      <div class="cx-desc">${C.desc}</div><div class="cx-note">문장에서는 "${C.verb}"로 쓰입니다.</div>`;
  } else if (kind === 'n') {
    const N = NUMBERS.find((n) => n.key === key);
    h = `<div class="cx-title"><span class="cx-big tilebox">${tile(N.block())}</span><div><div class="cx-nm">${N.name}</div><div class="cx-tags"><span class="cx-tag">수치</span></div></div></div>
      <div class="cx-desc">${N.desc}</div><div class="cx-stat range"><span>등장할 수 있는 값</span><b>${N.range}</b></div><div class="cx-note">숫자가 클수록 드물게 등장합니다.</div>`;
  } else {
    h = `<div class="cx-title"><span class="cx-big tilebox">${tile(makeOp(key))}</span><div><div class="cx-nm">${OP_NAME[key]} (${OP_SYMBOL[key]})</div><div class="cx-tags"><span class="cx-tag">연산</span></div></div></div>
      <div class="cx-desc">수치 블록 두 개를 ${OP_NAME[key]}해 하나의 수치로 만듭니다. 문장 블록의 수치 칸에 넣어 사용합니다.</div>`;
  }
  info.innerHTML = h;
  if (kind === 's') opts.ui.renderSentenceInto(info.querySelector('.cx-line'), makeSentence(key, false), false);
}

// 적 (스테이지 등장 순서)
function renderEnemies(grid, info) {
  section(grid, '스테이지 1 · 초원');
  for (const en of ENEMIES) {
    const T = ENEMY_TYPES[en.type];
    const col = '#' + T.color.toString(16).padStart(6, '0');
    item(grid, en.type, `<span class="cx-slime" style="--c:${col}"></span>`, T.name, { color: col, badge: en.grade !== '일반' ? en.grade : '' });
  }
  const en = ENEMIES.find((x) => x.type === state.sel.enemy);
  const T = ENEMY_TYPES[en.type];
  const col = '#' + T.color.toString(16).padStart(6, '0');
  const ab = ENEMY_ABILITY[en.type] || [];
  info.innerHTML = `<div class="cx-title"><span class="cx-big"><span class="cx-slime big" style="--c:${col}"></span></span><div><div class="cx-nm">${T.name}</div><div class="cx-tags"><span class="cx-tag grade-${en.grade}">${en.grade}</span></div></div></div>
    <div class="cx-stats">
      <div class="cx-stat"><span>기본 체력</span><b>${T.hp.toLocaleString()}</b></div>
      <div class="cx-stat"><span>공격력</span><b>${T.dmg}</b></div>
      <div class="cx-stat"><span>이동 속도</span><b>${T.speed}</b></div>
      ${T.res ? `<div class="cx-stat"><span>모든 속성 저항</span><b>${T.res}</b></div>` : ''}
    </div>
    ${ab.length ? `<div class="cx-sub">기술</div>${ab.map((a) => `<div class="cx-ability">${a}</div>`).join('')}` : '<div class="cx-note">특별한 기술 없이 플레이어에게 다가와 부딪힙니다.</div>'}`;
  setPreview({ kind: 'enemy', type: en.type });
}
