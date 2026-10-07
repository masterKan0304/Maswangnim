// ─────────────────────────────────────────────
//  메인 화면: 왼쪽 메뉴 버튼으로 오른쪽 화면을 전환
//  (기본: 게임 미리보기 / 스테이지 선택 / 업그레이드 · 설정은 오른쪽 위에 팝업)
// ─────────────────────────────────────────────
import { profile, saveProfile, renderUpgrades, renderSettings } from './meta.js';
import { STAGES, stageById, stageLabel, isStageUnlocked, isStartable, lastStartable } from './stages.js';
import { accountNeed } from './config.js';
import { openCodex, closeCodex, attachPreview } from './codex.js';
import { CHARACTERS, CHARACTER_ORDER, masteryNeed } from './characters.js';
import { masteryOf } from './meta.js';
import { SKILL_DEFS } from './skills.js';
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
  // 화면이 하나라도 열려 있으면 메뉴 전체를 불투명하게 받쳐 미리보기가 가장자리로 비치지 않게
  $('#menu').classList.toggle('covered', settingsOpen || !!view);
}

export function setView(v) {
  // 다른 화면을 열면 설정 창은 닫음
  const st = $('#settings');
  if (v && !st.classList.contains('hidden')) { st.classList.add('hidden'); st.classList.remove('in-menu'); }
  if (view === v) { markNav(); return; }
  view = v;
  $('#view-stage').classList.toggle('hidden', v !== 'stage');
  $('#view-upgrade').classList.toggle('hidden', v !== 'upgrade');
  $('#view-codex').classList.toggle('hidden', v !== 'codex');
  if (v === 'codex') openCodex();
  else if (v === 'char') renderChar();
  else closeCodex();
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
  if (open) renderSettings(opts.applySettings, opts.keysChanged);
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
  const ch = CHARACTERS[profile.character] || CHARACTERS.masang;
  $('#menu-char').innerHTML = `${ic(ch.icon)} ${ch.name}`;
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

// ── 캐릭터 선택 ──
// 위 왼쪽: 전용 스킬 8칸 (4x2) + 플레이 미리보기 / 위 오른쪽: 설명 · 고유 패시브 · 숙련도 / 아래: 캐릭터 목록
const CHAR_SLOTS = 3;   // 아래 목록 칸 수 (아직 없는 캐릭터는 '준비 중')
function renderChar() {
  const body = $('#char-body');
  body.innerHTML = '';
  const id = CHARACTERS[profile.character] ? profile.character : 'masang';
  const ch = CHARACTERS[id];
  const m = masteryOf(id);
  const need = masteryNeed(m.lv);

  const top = document.createElement('div');
  top.className = 'ch-top';
  const left = document.createElement('div');
  left.className = 'ch-left';
  const grid = document.createElement('div');
  grid.className = 'ch-skills';
  ch.skills.forEach((key, i) => {
    const slot = document.createElement('div');
    if (!key) {
      slot.className = 'ch-skill empty';
      slot.innerHTML = '<span class="ch-q">?</span>';
      slot._tip = () => '<div class="tip-title">준비 중</div><div class="tip-dim">아직 공개되지 않은 전용 스킬입니다.</div>';
    } else {
      const d = SKILL_DEFS[key], lv = ch.unlock[key] || 1, locked = m.lv < lv;
      slot.className = 'ch-skill' + (locked ? ' locked' : '');
      slot.style.setProperty('--c', d.color);
      slot.innerHTML = `${d.icon}<span class="cx-ap ${d.passive ? 'p' : 'a'}">${d.passive ? 'P' : 'A'}</span>${i === 0 ? '<span class="ch-basic">기본</span>' : ''}${locked ? `<span class="ch-lock">${ic('lock')} 숙련 ${lv}</span>` : ''}`;
      slot._tip = () => `<div class="tip-title">${d.icon} ${d.name} <span class="tip-dim">${d.passive ? '패시브' : '액티브'}</span></div><div>${d.desc}</div>`
        + `<div class="tip-dim">3레벨 효과 : ${d.levelText(3).slice(1).filter(Boolean)[0] || ''}</div><div class="tip-dim">5레벨 효과 : ${d.levelText(5).slice(1).filter(Boolean)[0] || ''}</div>`
        + (i === 0 ? '<div class="tip-ok">스테이지를 시작할 때 장착하고 시작합니다.</div>' : '')
        + (locked ? `<div class="tip-warn">${ic('lock')} 숙련도 ${lv} 레벨에 해금됩니다.</div>` : '');
    }
    grid.appendChild(slot);
  });
  const pv = document.createElement('div');
  pv.className = 'ch-preview';
  pv.innerHTML = '<span class="cx-pv-label">미리보기</span>';
  left.append(grid, pv);

  const right = document.createElement('div');
  right.className = 'ch-right';
  right.innerHTML = `<div class="ch-head"><span class="ch-portrait" style="--c:${ch.color}">${ic(ch.icon)}</span><div><div class="ch-name">${ch.name}</div><div class="ch-sub">기본 캐릭터</div></div></div>
    <div class="ch-desc">${ch.desc}</div>
    <div class="ch-passive"><div class="chp-title">${ic(ch.passive.icon)} 고유 패시브 · ${ch.passive.name}</div><div class="chp-desc">${ch.passive.desc}</div></div>
    <div class="ch-mastery"><div class="chm-head"><span>숙련도 <b>Lv.${m.lv}</b></span><span class="chm-xp">${Math.floor(m.xp).toLocaleString()} / ${need.toLocaleString()}</span></div>
      <div class="acct-bar"><i style="width:${Math.min(100, (m.xp / need) * 100)}%"></i></div>
      <div class="chm-note">이 캐릭터로 스테이지에서 얻은 경험치만큼 숙련도가 오릅니다.</div></div>`;
  top.append(left, right);

  const list = document.createElement('div');
  list.className = 'ch-list';
  for (let i = 0; i < CHAR_SLOTS; i++) {
    const cid = CHARACTER_ORDER[i];
    const card = document.createElement('div');
    if (!cid) {
      card.className = 'ch-card soon';
      card.innerHTML = '<div class="chc-ic">?</div><div class="chc-name">준비 중</div>';
    } else {
      const c = CHARACTERS[cid];
      card.className = 'ch-card' + (cid === id ? ' sel' : '');
      card.style.setProperty('--c', c.color);
      card.innerHTML = `<div class="chc-ic">${ic(c.icon)}</div><div class="chc-name">${c.name}</div><div class="chc-lv">숙련도 Lv.${masteryOf(cid).lv}</div>`;
      card.addEventListener('click', () => {
        if (profile.character === cid) return;
        profile.character = cid; saveProfile(); sfx('select'); updateStageTag(); renderChar();
      });
    }
    list.appendChild(card);
  }
  body.append(top, list);

  // 해금된 전용 스킬로 싸우는 미리보기
  const keys = ch.skills.filter((k) => k && m.lv >= (ch.unlock[k] || 1));
  attachPreview(pv, { kind: 'character', charId: id, skills: keys });
}
