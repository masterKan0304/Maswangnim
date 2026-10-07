// ─────────────────────────────────────────────
//  메인 화면: 왼쪽 메뉴 버튼으로 오른쪽 화면을 전환
//  (기본: 게임 미리보기 / 스테이지 선택 / 업그레이드 · 설정은 오른쪽 위에 팝업)
// ─────────────────────────────────────────────
import { profile, saveProfile, renderUpgrades, renderSettings } from './meta.js';
import { STAGES, stageById, stageLabel, isStageUnlocked, isStartable, lastStartable } from './stages.js';
import { accountNeed } from './config.js';
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
  updateAccount();
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
  if (v === 'stage') { viewIdx = -1; renderStages(); }
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
  $('#menu-stage').textContent = stageLabel(stageById(profile.stage));
}

export function updateAccount() {
  const need = accountNeed(profile.accountLevel);
  $('#acct-lv').textContent = profile.accountLevel;
  $('#acct-fill').style.width = `${Math.min(100, (profile.accountXp / need) * 100)}%`;
  $('#acct-xp').textContent = `${Math.floor(profile.accountXp).toLocaleString()} / ${need.toLocaleString()}`;
}

// ── 스테이지 선택: 고른 스테이지가 가운데 오는 가로 목록 ──
let viewIdx = -1;      // 보고 있는 스테이지 (잠긴 스테이지도 볼 수 있음)
const CARD_W = 220, CARD_GAP = 28;

function renderStages() {
  const body = $('#stage-body');
  if (!isStartable(stageById(profile.stage), profile.cleared)) profile.stage = lastStartable(profile.cleared).id;
  if (viewIdx < 0) viewIdx = STAGES.findIndex((s) => s.id === profile.stage);
  body.innerHTML = '';

  const strip = document.createElement('div');
  strip.className = 'stage-strip';
  const track = document.createElement('div');
  track.className = 'stage-track';
  STAGES.forEach((st, i) => {
    const unlocked = isStageUnlocked(st.id, profile.cleared);
    const card = document.createElement('div');
    card.className = 'stage-card' + (i === viewIdx ? ' sel' : '') + (!unlocked ? ' locked' : '') + (unlocked && !st.ready ? ' soon' : '');
    card.style.setProperty('--c1', st.colors[0]);
    card.style.setProperty('--c2', st.colors[1]);
    const state = !unlocked ? `${ic('lock')} 잠김` : !st.ready ? '준비 중' : profile.cleared.includes(st.id) ? `${ic('crown')} 클리어` : '';
    card.innerHTML = `<div class="stc-thumb">${ic(st.icon)}</div><div class="stc-no">${st.no}</div><div class="stc-name">${st.name}</div><div class="stc-state">${state}</div>`;
    card.addEventListener('click', () => { if (i !== viewIdx) selectIdx(i); });
    track.appendChild(card);
  });
  strip.appendChild(track);
  const arrow = (dir) => {
    const b = document.createElement('button');
    b.className = `stage-arrow ${dir < 0 ? 'left' : 'right'}`;
    b.innerHTML = dir < 0 ? '‹' : '›';
    b.disabled = dir < 0 ? viewIdx <= 0 : viewIdx >= STAGES.length - 1;
    b.addEventListener('click', () => selectIdx(viewIdx + dir));
    return b;
  };
  strip.append(arrow(-1), arrow(1));
  body.appendChild(strip);
  // 고른 카드가 가운데 오도록 이동 (처음 그릴 때는 애니메이션 없이)
  const center = () => {
    const x = strip.clientWidth / 2 - (viewIdx * (CARD_W + CARD_GAP) + CARD_W / 2);
    track.style.transform = `translateX(${x}px)`;
  };
  track.style.transition = 'none';
  center();
  requestAnimationFrame(() => { track.style.transition = ''; });
  track._center = center;

  // 고른 스테이지 정보 + 첫 클리어 보상 + 시작 버튼
  const cur = STAGES[viewIdx];
  const unlocked = isStageUnlocked(cur.id, profile.cleared);
  const startable = isStartable(cur, profile.cleared);
  const got = profile.cleared.includes(cur.id);
  const detail = document.createElement('div');
  detail.className = 'stage-detail';
  detail.innerHTML = `<div class="sd-name">${stageLabel(cur)}</div><div class="sd-desc">${cur.desc}</div>
    <div class="sd-info"><span>${ic('swirl')} 진행 시간 : ${cur.time}</span><span>${ic('flag')} ${cur.clear}</span></div>
    <div class="sd-reward${got ? ' got' : ''}"><span class="sdr-label">첫 클리어 보상</span><span class="sdr-item">${ic('coin')} ${cur.reward.gold.toLocaleString()}</span>${got ? `<span class="sdr-check">✔</span>` : ''}</div>`;
  detail.querySelector('.sd-reward')._tip = () => `<div class="tip-title">첫 클리어 보상</div><div>처음 클리어하면 ${ic('coin')} <b>${cur.reward.gold.toLocaleString()}</b> 골드를 받습니다.</div>`
    + (got ? '<div class="tip-ok">이미 받은 보상입니다.</div>' : '<div class="tip-dim">보상은 한 번만 받을 수 있습니다.</div>');
  const start = document.createElement('button');
  start.className = 'big-btn';
  start.id = 'btn-start';
  start.textContent = !unlocked ? '잠김' : !cur.ready ? '준비 중' : '시작';
  start.disabled = !startable;
  start.addEventListener('click', () => { if (startable) opts.onStart(cur.id); });
  detail.appendChild(start);
  body.appendChild(detail);
}

function selectIdx(i) {
  if (i < 0 || i >= STAGES.length || i === viewIdx) return;
  viewIdx = i;
  const st = STAGES[i];
  if (isStartable(st, profile.cleared) && profile.stage !== st.id) { profile.stage = st.id; saveProfile(); updateStageTag(); }
  sfx('select');
  // 카드 강조 / 이동만 바꾸고 나머지 정보는 다시 그림
  const oldTrack = $('#stage-body .stage-track');
  const prev = oldTrack ? oldTrack.style.transform : '';
  renderStages();
  const track = $('#stage-body .stage-track');
  if (prev) {
    track.style.transition = 'none';
    track.style.transform = prev;
    requestAnimationFrame(() => requestAnimationFrame(() => { track.style.transition = ''; track._center(); }));
  }
}
