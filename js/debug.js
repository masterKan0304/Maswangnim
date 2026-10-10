// ─────────────────────────────────────────────
//  디버그 모드 (전투 중 F8)
// ─────────────────────────────────────────────
import { game, bump, inventoryAdd } from './state.js';
import { SUBJECTS, SUBJECT_ORDER, CHANGES, MAX_SENTENCE_SLOTS, MAX_SKILL_LEVEL, MAX_SKILLS, hpScale, WORLD_HALF } from './config.js';
import { SKILL_DEFS, SKILL_ORDER, createSkill } from './skills.js';
import { CHARACTERS, CHARACTER_ORDER } from './characters.js';
import { makeSentence, makeWord, makeFixed, makeRange, makePercent, TEMPLATES, sentenceText, slotAccepts } from './blocks.js';
import { ic } from './icons.js';
import { sfx } from './audio.js';

const $ = (s) => document.querySelector(s);
const WORDS = SUBJECT_ORDER.filter((k) => !SUBJECTS[k].noWord);
const TEMPLATE_NAMES = { SNC: '구현 (주체 - 수치 - 변화)', SSC: '구현 (주체 - 주체 - 변화)', ZONE: '지대 생성', INFUSE: '지대 촉발', AMP: '주도' };

// 문장 만들기 작업 상태
const draft = { tpl: 'SNC', blocks: [null, null, null], sel: -1, ntype: 'fixed', a: 4, b: 8 };

export function toggleDebug(open = !game.debugOpen) {
  game.debugOpen = open;
  $('#win-debug').classList.toggle('hidden', !open);
  sfx(open ? 'open' : 'close');
  if (open) renderDebug();
  else game.sys.ui.hideTip();
}

function toggleBtn(on, onFlip) {
  const btn = document.createElement('button');
  btn.className = 'toggle' + (on ? ' on' : '');
  btn.innerHTML = '<span class="t-on">ON</span><span class="t-off">OFF</span><i></i>';
  btn.addEventListener('click', () => {
    const v = !btn.classList.contains('on');
    btn.classList.toggle('on', v);
    sfx(v ? 'toggleOn' : 'toggleOff');
    onFlip(v);
  });
  return btn;
}

function row(label, right) {
  const r = document.createElement('div');
  r.className = 'set-row';
  r.innerHTML = `<span class="set-label">${label}</span>`;
  r.appendChild(right);
  return r;
}

function section(title) {
  const s = document.createElement('div');
  s.className = 'set-sec';
  s.innerHTML = `<div class="set-title">${title}</div>`;
  return s;
}

function spawnNear(type) {
  const p = game.sys.player.pos;
  const a = Math.random() * Math.PI * 2;
  const x = Math.max(-WORLD_HALF + 2, Math.min(WORLD_HALF - 2, p.x + Math.cos(a) * 8));
  const z = Math.max(-WORLD_HALF + 2, Math.min(WORLD_HALF - 2, p.z + Math.sin(a) * 8));
  const e = game.sys.enemies.spawn(type, x, z, type === 'boss' ? 1 : hpScale(game.time));
  e.debugSpawn = true;   // 디버그로 만든 최종 보스는 처치해도 게임이 끝나지 않음
  game.sys.fx.ring(x, z, 3, type === 'boss' ? 0xb07cff : 0x3f8cff, 0.8);
  sfx(type === 'boss' ? 'boss' : 'elite');
}

export function renderDebug() {
  const body = $('#debug-body');
  body.innerHTML = '';
  const d = game.debug;

  // ── 토글 ──
  const s1 = section('기능');
  s1.appendChild(row('모든 스킬 문장 칸 해금', toggleBtn(d.unlockSlots, (v) => {
    d.unlockSlots = v;
    if (v) for (const sk of game.skills) sk.maxSlots = MAX_SENTENCE_SLOTS;
    bump(); game.sys.ui.refresh();
  })));
  s1.appendChild(row('레벨업 비활성화', toggleBtn(d.noLevelUp, (v) => { d.noLevelUp = v; })));
  s1.appendChild(row('무적 모드 (체력·마나 소모 없음)', toggleBtn(d.god, (v) => { d.god = v; })));
  body.appendChild(s1);

  // ── 보스 생성 ──
  const s2 = section('적 생성');
  const bossRow = document.createElement('div');
  bossRow.className = 'dbg-btns';
  for (const [type, label, icon] of [['elite', '중간 보스 생성', 'gem'], ['boss', '최종 보스 생성', 'crown']]) {
    const b = document.createElement('button');
    b.className = 'menu-btn';
    b.innerHTML = `${ic(icon)} ${label}`;
    b.addEventListener('click', () => spawnNear(type));
    bossRow.appendChild(b);
  }
  s2.appendChild(bossRow);
  body.appendChild(s2);

  // ── 스킬 획득 (숙련도 · 계정 레벨로 잠긴 스킬도) ──
  const sg = section('스킬 획득');
  const keys = [...SKILL_ORDER];
  for (const cid of CHARACTER_ORDER) for (const k of CHARACTERS[cid].skills) if (k && SKILL_DEFS[k] && !keys.includes(k)) keys.push(k);
  const chips = document.createElement('div');
  chips.className = 'dbg-chips';
  for (const k of keys) {
    const d = SKILL_DEFS[k], have = game.skills.some((s) => s.key === k);
    const b = document.createElement('button');
    b.className = 'dbg-chip' + (have ? ' on' : '');
    b.innerHTML = `${d.icon} ${d.name}`;
    b.addEventListener('click', () => {
      if (game.skills.some((s) => s.key === k)) { game.sys.ui.toast('이미 가지고 있는 스킬입니다', 'warn'); sfx('error'); return; }
      if (game.skills.length >= MAX_SKILLS) { game.sys.ui.toast('스킬 칸이 가득 찼습니다', 'warn'); sfx('error'); return; }
      game.skills.push(createSkill(k));
      sfx('select');
      game.sys.ui.toast(`[디버그] 스킬 획득: ${d.name}`);
      bump(); game.sys.ui.refresh(); renderDebug();
    });
    chips.appendChild(b);
  }
  sg.appendChild(chips);
  body.appendChild(sg);

  // ── 스킬 레벨 ──
  const s3 = section('스킬 레벨');
  if (!game.skills.length) s3.appendChild(Object.assign(document.createElement('div'), { className: 'dbg-dim', textContent: '보유한 스킬이 없습니다.' }));
  for (const sk of game.skills) {
    const r = document.createElement('div');
    r.className = 'set-row';
    r.innerHTML = `<span class="set-label">${sk.def.icon} ${sk.def.name}</span>`;
    const ctl = document.createElement('div');
    ctl.className = 'dbg-stepper';
    const minus = document.createElement('button'), plus = document.createElement('button'), val = document.createElement('b');
    minus.textContent = '−'; plus.textContent = '+'; val.textContent = `Lv.${sk.level}`;
    const set = (lv) => { sk.level = Math.max(1, Math.min(MAX_SKILL_LEVEL, lv)); val.textContent = `Lv.${sk.level}`; bump(); game.sys.ui.refresh(); };
    minus.addEventListener('click', () => set(sk.level - 1));
    plus.addEventListener('click', () => set(sk.level + 1));
    ctl.append(minus, val, plus);
    r.appendChild(ctl);
    s3.appendChild(r);
  }
  body.appendChild(s3);

  // ── 문장 블록 생성 ──
  const s4 = section('문장 블록 생성');
  const tpls = document.createElement('div');
  tpls.className = 'dbg-chips';
  for (const t of Object.keys(TEMPLATES)) {
    const b = document.createElement('button');
    b.className = 'dbg-chip' + (draft.tpl === t ? ' on' : '');
    b.textContent = TEMPLATE_NAMES[t];
    b.addEventListener('click', () => { draft.tpl = t; draft.blocks = TEMPLATES[t].map(() => null); draft.sel = -1; renderDebug(); });
    tpls.appendChild(b);
  }
  s4.appendChild(tpls);

  // 미리보기: 칸을 클릭하면 아래에서 넣을 블록을 고름
  const preview = makeSentence(draft.tpl, false);
  preview.slots.forEach((sl, i) => { sl.block = draft.blocks[i]; });
  const line = document.createElement('div');
  line.className = 'sentence-line dbg-preview';
  game.sys.ui.renderSentenceInto(line, preview, false);
  [...line.querySelectorAll('.chip')].forEach((chip, i) => {
    chip.classList.add('dbg-slot');
    if (draft.sel === i) chip.classList.add('sel');
    chip.addEventListener('click', () => { draft.sel = i; renderDebug(); });
  });
  s4.appendChild(line);
  s4.appendChild(Object.assign(document.createElement('div'), { className: 'dbg-dim', textContent: '칸을 클릭해 넣을 블록을 고릅니다.' }));

  if (draft.sel >= 0) {
    const type = TEMPLATES[draft.tpl][draft.sel];
    const pick = document.createElement('div');
    pick.className = 'dbg-chips';
    const put = (blk) => { draft.blocks[draft.sel] = blk; draft.sel = -1; renderDebug(); };
    if (type === 'subject') {
      for (const k of WORDS) {
        const b = document.createElement('button');
        b.className = 'dbg-chip k-subject';
        b.textContent = SUBJECTS[k].name;
        b.addEventListener('click', () => put(makeWord(k)));
        pick.appendChild(b);
      }
    } else if (type === 'change') {
      for (const k of Object.keys(CHANGES)) {
        const b = document.createElement('button');
        b.className = 'dbg-chip k-change';
        b.textContent = CHANGES[k].name;
        b.addEventListener('click', () => put(makeWord(k)));
        pick.appendChild(b);
      }
    } else {
      // 수치: 고정 / 랜덤 / 백분율 + 값 입력
      const kinds = type === 'numflat' ? [['fixed', '고정값'], ['range', '랜덤값']] : [['fixed', '고정값'], ['range', '랜덤값'], ['percent', '백분율']];
      if (!kinds.some((k) => k[0] === draft.ntype)) draft.ntype = 'fixed';
      for (const [k, label] of kinds) {
        const b = document.createElement('button');
        b.className = 'dbg-chip k-number' + (draft.ntype === k ? ' on' : '');
        b.textContent = label;
        b.addEventListener('click', () => { draft.ntype = k; renderDebug(); });
        pick.appendChild(b);
      }
      const inputs = document.createElement('div');
      inputs.className = 'dbg-inputs';
      const mk = (v, set) => { const i = document.createElement('input'); i.type = 'number'; i.value = v; i.addEventListener('input', () => set(+i.value)); return i; };
      inputs.appendChild(mk(draft.a, (v) => { draft.a = v; }));
      if (draft.ntype === 'range') { inputs.appendChild(document.createTextNode(' ~ ')); inputs.appendChild(mk(draft.b, (v) => { draft.b = v; })); }
      if (draft.ntype === 'percent') inputs.appendChild(document.createTextNode(' %'));
      const ok = document.createElement('button');
      ok.className = 'menu-btn';
      ok.textContent = '넣기';
      ok.addEventListener('click', () => {
        const a = draft.a, b = Math.max(draft.a, draft.b);
        put(draft.ntype === 'fixed' ? makeFixed(a) : draft.ntype === 'range' ? makeRange(Math.min(draft.a, draft.b), b) : makePercent(a));
      });
      inputs.appendChild(ok);
      pick.appendChild(inputs);
    }
    s4.appendChild(pick);
  }

  const make = document.createElement('button');
  make.className = 'big-btn dbg-make';
  make.textContent = '인벤토리에 생성';
  make.addEventListener('click', () => {
    const s = makeSentence(draft.tpl, false);
    s.slots.forEach((sl, i) => { if (draft.blocks[i] && slotAccepts(sl.type, draft.blocks[i])) sl.block = draft.blocks[i]; });
    if (!inventoryAdd(s)) { game.sys.ui.toast('인벤토리가 가득 찼습니다', 'warn'); sfx('error'); return; }
    draft.blocks = TEMPLATES[draft.tpl].map(() => null);   // 같은 블록 객체를 다시 쓰지 않도록 비움
    game.sys.ui.toast(`[디버그] 문장 생성: ${sentenceText(s)}`);
    sfx('block');
    game.sys.ui.refresh();
    renderDebug();
  });
  s4.appendChild(make);
  body.appendChild(s4);
}

export function initDebug() {
  $('#debug-close').addEventListener('click', () => toggleDebug(false));
}
