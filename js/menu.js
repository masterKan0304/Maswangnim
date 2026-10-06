// ─────────────────────────────────────────────
//  메인 화면: 왼쪽 메뉴 버튼으로 오른쪽 화면을 전환
//  (기본: 게임 미리보기 / 스테이지 선택 / 업그레이드 · 설정은 오른쪽 위에 팝업)
// ─────────────────────────────────────────────
import { profile, saveProfile, renderUpgrades, renderSettings } from './meta.js';
import { STAGES, stageById, isStageUnlocked } from './stages.js';
import { ic } from './icons.js';
import { sfx } from './audio.js';

const $ = (s) => document.querySelector(s);
let view = null;          // null(미리보기) | 'stage' | 'upgrade'
let opts = null;

export function initMenu(o) {
  opts = o;   // { onStart(stageId), refreshGold(), applySettings(), hideTip() }
  for (const b of document.querySelectorAll('.nav-btn')) {
    b.addEventListener('click', () => {
      const v = b.dataset.view;
      if (v === 'settings') { toggleMenuSettings(); return; }
      setView(view === v ? null : v);
    });
  }
  for (const b of document.querySelectorAll('[data-view-close]')) b.addEventListener('click', () => setView(null));
  // 설정 창의 닫기 버튼: 메뉴 버튼 강조 해제
  $('#settings [data-close]').addEventListener('click', () => { $('#settings').classList.remove('in-menu'); markNav(); });
  updateStageTag();
}

export function showMenu() {
  $('#menu').classList.remove('hidden');
  document.body.classList.add('in-menu');
}

export function hideMenu() {
  $('#menu').classList.add('hidden');
  document.body.classList.remove('in-menu');
}

function markNav() {
  const settingsOpen = !$('#settings').classList.contains('hidden');
  for (const b of document.querySelectorAll('.nav-btn')) {
    b.classList.toggle('active', b.dataset.view === 'settings' ? settingsOpen : b.dataset.view === view);
  }
}

export function setView(v) {
  if (view === v) return;
  view = v;
  $('#view-stage').classList.toggle('hidden', v !== 'stage');
  $('#view-upgrade').classList.toggle('hidden', v !== 'upgrade');
  if (v === 'stage') renderStages();
  if (v === 'upgrade') renderUpgrades(opts.refreshGold);
  opts.hideTip();
  sfx(v ? 'open' : 'close');
  markNav();
}

function toggleMenuSettings() {
  const s = $('#settings');
  const open = s.classList.contains('hidden');
  s.classList.toggle('hidden', !open);
  s.classList.toggle('in-menu', open);
  if (open) renderSettings(opts.applySettings);
  opts.hideTip();
  sfx(open ? 'open' : 'close');
  markNav();
}

// Esc: 열린 설정 / 화면을 닫고 미리보기로 돌아감
export function menuBack() {
  const s = $('#settings');
  if (!s.classList.contains('hidden')) { s.classList.add('hidden'); s.classList.remove('in-menu'); opts.hideTip(); sfx('close'); markNav(); return; }
  if (view) setView(null);
}

function updateStageTag() {
  const st = stageById(profile.stage);
  $('#menu-stage').textContent = `스테이지 ${st.id} · ${st.name}`;
}

// ── 스테이지 선택 ──
function renderStages() {
  const body = $('#stage-body');
  body.innerHTML = '';
  if (!isStageUnlocked(profile.stage, profile.cleared) || !stageById(profile.stage).ready) profile.stage = 1;
  const cards = document.createElement('div');
  cards.className = 'stage-cards';
  for (const st of STAGES) {
    const unlocked = isStageUnlocked(st.id, profile.cleared);
    const cleared = profile.cleared.includes(st.id);
    const card = document.createElement('div');
    card.className = 'stage-card' + (st.id === profile.stage ? ' sel' : '') + (!unlocked ? ' locked' : '') + (unlocked && !st.ready ? ' soon' : '');
    card.style.setProperty('--c1', st.colors[0]);
    card.style.setProperty('--c2', st.colors[1]);
    const state = !unlocked ? `${ic('lock')} 잠김` : !st.ready ? '준비 중' : cleared ? `${ic('crown')} 클리어` : '';
    card.innerHTML = `<div class="stc-thumb">${ic(st.icon)}</div><div class="stc-no">STAGE ${st.id}</div><div class="stc-name">${st.name}</div><div class="stc-state">${state}</div>`;
    card._tip = () => !unlocked
      ? `<div class="tip-title">스테이지 ${st.id} · ${st.name}</div><div class="tip-warn">${ic('lock')} 스테이지 ${st.id - 1}을(를) 클리어하면 열립니다.</div>`
      : `<div class="tip-title">스테이지 ${st.id} · ${st.name}</div><div>${st.desc}</div>`;
    card.addEventListener('click', () => {
      if (!unlocked) { sfx('error'); return; }
      if (profile.stage !== st.id) { profile.stage = st.id; saveProfile(); updateStageTag(); sfx('select'); }
      renderStages();
    });
    cards.appendChild(card);
  }
  body.appendChild(cards);

  // 고른 스테이지 정보 + 시작 버튼
  const cur = stageById(profile.stage);
  const detail = document.createElement('div');
  detail.className = 'stage-detail';
  detail.innerHTML = `<div class="sd-name">스테이지 ${cur.id} · ${cur.name}</div><div class="sd-desc">${cur.desc}</div>`;
  const start = document.createElement('button');
  start.className = 'big-btn';
  start.id = 'btn-start';
  start.textContent = cur.ready ? '시작' : '준비 중';
  start.disabled = !cur.ready;
  start.addEventListener('click', () => { if (cur.ready) opts.onStart(cur.id); });
  detail.appendChild(start);
  body.appendChild(detail);
}
