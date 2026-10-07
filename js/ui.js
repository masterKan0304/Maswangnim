import { ic } from './icons.js';
import { STAGE, toStageX, toStageY, stageRect } from './stage.js';
import { sfx } from './audio.js';
import { game, bump, inventoryAdd } from './state.js';
import { INV_W, INV_H, MAX_SKILLS, MAX_SENTENCE_SLOTS, SUBJECTS, CHANGES, STAGE_TIME, DASH, ELEMENTS, xpToNext } from './config.js';
import {
  blockLabel, colorKey, kindName, isComplete, missingCount, sentenceParts, slotChipLabel, PLACEHOLDER,
  evalNumber, fmtValue, slotAccepts, sentenceAccepts, dismantle, OP_SYMBOL, numText, blockSig, randomOfType, TEMPLATE_INFO, RARITY_NAME,
} from './blocks.js';
import { getResult, baseStats, fmtStat, statText, statLabel, shownStats, extraLines, maxStacks, getStats, avg, enchantReq, triggerGoal, milestoneText } from './skills.js';

const $ = (s) => document.querySelector(s);
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function findProp(node, prop) {
  while (node && node !== document.body && node !== document) {
    if (node[prop] != null) return node;
    node = node.parentElement;
  }
  return null;
}
const NUM_DESC = { fixed: '항상 같은 값입니다.', range: '적용될 때마다 범위 안에서 무작위로 정해집니다.', percent: '비율로 적용됩니다.' };
const KIND_BADGE = { sentence: '문장', subject: '주체', change: '변화', number: '수치', op: '연산' };
const STAT_SHORT = { damage: '피해량', area: '효과 범위', range: '사거리', duration: '지속 시간', castSpeed: '시전 속도', shield: '보호막', pierce: '관통', projSize: '투사체 크기', projSpeed: '투사체 속도', projCount: '투사체 개수', chains: '연쇄 횟수', statusChance: '상태이상 발생율', projDuration: '투사체 지속 시간', manaCost: '마나', cooldown: '쿨타임',
  critChance: '치명타 확률', critDamage: '치명타 피해', critFlat: '치명타 추가 피해', penetration: '저항 무시', fireDmg: '화염 피해', iceDmg: '냉기 피해', lightningDmg: '번개 피해' };
const shortName = (def, k) => (k === 'damage' && def.element ? statLabel(def, k) : (def.labels && def.labels[k]) || STAT_SHORT[k]);
// 속성 피해 표시 색
const ELEM_CLASS = { fireDmg: 'fire', iceDmg: 'ice', lightningDmg: 'lightning' };
const statElemClass = (def, k) => (k === 'damage' ? def.element : ELEM_CLASS[k]) || '';

// ─────────────────────────────────────────────
//  위치(loc) 추상화 — 인벤토리 칸 / 문장 칸 / 연산 칸 / 스킬 문장 칸
// ─────────────────────────────────────────────
function getAt(loc) {
  switch (loc.t) {
    case 'inv': return game.inventory[loc.i];
    case 'sent': return loc.block.slots[loc.i].block;
    case 'op': return loc.block.slots[loc.i];
    case 'skill': return loc.skill.sentences[loc.i];
    case 'rc': return game.recomb[loc.i];
  }
  return null;
}
function setAt(loc, b) {
  switch (loc.t) {
    case 'inv': game.inventory[loc.i] = b; break;
    case 'sent': loc.block.slots[loc.i].block = b; break;
    case 'op': loc.block.slots[loc.i] = b; break;
    case 'skill': loc.skill.sentences[loc.i] = b; break;
    case 'rc': game.recomb[loc.i] = b; break;
  }
}
function accepts(loc, b) {
  if (!b) return true;
  switch (loc.t) {
    case 'inv': return true;
    case 'skill': return b.kind === 'sentence' && loc.i < loc.skill.maxSlots;
    case 'sent': return sentenceAccepts(loc.block, loc.i, b);
    case 'op': return slotAccepts('opnum', b);
    // 재조합 칸: 다른 칸에 이미 들어 있는 블록과 같은 유형만
    case 'rc': return game.recomb.every((o, j) => j === loc.i || !o || colorKey(o) === colorKey(b));
  }
  return false;
}
const sameLoc = (a, b) => a.t === b.t && a.i === b.i && a.block === b.block && a.skill === b.skill;

// ─────────────────────────────────────────────
export class UI {
  constructor() {
    this.invEl = $('#inv-grid');
    this.skillsEl = $('#skills-list');
    this.popupsEl = $('#popups');
    this.tipEl = $('#tooltip');
    this.ghostEl = $('#ghost');
    this.skillbarEl = $('#skillbar');
    this.toastsEl = $('#toasts');
    this.drag = null;
    this.tipNode = null;
    this.zTop = 1;
    this.mouse = { x: 0, y: 0 };
    this.popupPos = {};
    this.buildSkillbar();
    this.bindEvents();
    this.updateToggles();
  }

  // ── 공통 ──────────────────────────────
  changed() { bump(); this.refresh(); }

  refresh() {
    this.renderInventory();
    this.renderSkills();
    this.renderPopups();
    this.renderSkillbar();
  }

  toast(msg, cls = '') {
    const t = el('div', 'toast ' + cls, msg);
    this.toastsEl.appendChild(t);
    setTimeout(() => t.classList.add('out'), 1800);
    setTimeout(() => t.remove(), 2300);
    while (this.toastsEl.children.length > 4) this.toastsEl.firstChild.remove();
  }

  onPickup(block) {
    if (game.invOpen || game.skillsOpen) this.refresh();
    const k = colorKey(block);
    this.toast(`<span class="tchip k-${k}">${KIND_BADGE[k]}</span> ${block.kind === 'sentence' ? '문장 블록' : blockLabel(block)} 획득`, 'pick');
  }

  // Z / X 토글 상태 표시
  updateToggles() {
    const a = $('#tg-label'), b = $('#tg-pick');
    a.innerHTML = `<kbd>Z</kbd> 이름표 ${game.showLabels ? 'ON' : 'OFF'}`;
    b.innerHTML = `<kbd>X</kbd> 자동 획득 ${game.autoPickup ? 'ON' : 'OFF'}`;
    a.classList.toggle('off', !game.showLabels);
    b.classList.toggle('off', !game.autoPickup);
  }

  // 인벤토리/스킬 창으로 일시정지 중일 때: 화면 어둡게 + "일시정지됨" 표시
  setPausedView(on) {
    if (this._pausedView === on) return;
    this._pausedView = on;
    $('#pause-dim').classList.toggle('on', on);
    $('#paused-label').classList.toggle('hidden', !on);
    document.body.classList.toggle('game-paused', on);
  }

  hurtFlash() {
    const v = $('#vignette');
    v.classList.remove('hit'); void v.offsetWidth; v.classList.add('hit');
  }

  // ── 블록 타일 ─────────────────────────
  makeTile(b) {
    const k = colorKey(b);
    const t = el('div', `tile k-${k}`);
    t.dataset.bid = b.id;   // 튜토리얼 강조용
    t.appendChild(el('span', 'badge', KIND_BADGE[k]));
    if (b.kind === 'sentence') {
      if (isComplete(b)) t.classList.add('complete');
      const info = TEMPLATE_INFO[b.template];
      t.classList.add('rar' + info.rarity);
      t.appendChild(el('div', 'tlabel small', info.label));
      const dots = el('div', 'sdots');
      // 연산 블록이 들어간 칸은 연산 색으로 표시
      for (const sl of b.slots) dots.appendChild(el('i', `sd t-${sl.block && sl.block.kind === 'op' ? 'op' : sl.type === 'numflat' ? 'number' : sl.type}${sl.block ? ' on' : ''}${sl.locked ? ' lk' : ''}`));
      t.appendChild(dots);
    } else if (b.kind === 'op') {
      const f = b.slots.filter(Boolean).length;
      if (f === 2) t.classList.add('complete');
      t.appendChild(el('div', 'tlabel op', blockLabel(b)));
    } else {
      const lab = blockLabel(b);
      t.appendChild(el('div', `tlabel${lab.length > 4 ? ' small' : ''}${b.kind === 'number' ? ' num' : ''}`, lab));
    }
    t._tip = () => this.blockTip(b);
    return t;
  }

  // 문장 렌더 (chip 포함)
  renderSentenceInto(container, s, interactive) {
    for (const part of sentenceParts(s)) {
      if (part.text != null) { container.appendChild(document.createTextNode(part.text)); continue; }
      const i = part.slot;
      const slot = s.slots[i];
      const chip = el('span', 'chip');
      chip.dataset.slot = `${s.id}:${i}`;   // 튜토리얼 강조용
      if (slot.block) {
        chip.classList.add('filled', 'k-' + colorKey(slot.block));
        chip.textContent = slotChipLabel(s, i);
        if (slot.locked) { chip.classList.add('locked'); chip.title = '고정된 칸 (변경 불가)'; }
        if (slot.block.kind === 'op' && !evalNumber(slot.block)) chip.classList.add('incomplete');
      } else {
        chip.classList.add('empty', 't-' + slot.type);
        chip.textContent = `[${PLACEHOLDER[slot.type]}]`;
      }
      if (interactive) {
        const loc = { t: 'sent', block: s, i };
        if (!slot.locked) { chip._drop = loc; chip.classList.add('droppable'); if (slot.block) chip._drag = loc; }
        // 끼워진 블록 우클릭 → 즉시 인벤토리로 해제
        if (slot.block && !slot.locked) chip._rclick = () => this.releaseToInv(loc);
        if (slot.block) { const b = slot.block; chip._tip = () => this.blockTip(b) + (slot.locked ? `<div class="tip-warn">${ic('lock')} 고정된 칸이라 바꿀 수 없습니다.</div>` : ''); }
        else chip._tip = () => `<div class="tip-title">빈 칸</div><div>${{ subject: '단어:주체 블록을', number: '수치 블록이나 연산 블록을', numflat: '고정값이나 랜덤값 수치 블록을', change: '단어:변화 블록을' }[slot.type]} 넣을 수 있습니다.</div>`;
      }
      container.appendChild(chip);
    }
  }

  sentenceHTML(s) {
    const d = el('div');
    this.renderSentenceInto(d, s, false);
    return d.innerHTML;
  }

  blockTip(b) {
    const k = colorKey(b);
    let h = `<div class="tip-kind k-${k}">${kindName(b)}</div>`;
    if (b.kind === 'sentence') {
      h += `<div class="tip-sentence">${this.sentenceHTML(b)}</div>`;
      const r = TEMPLATE_INFO[b.template].rarity;
      h += `<div class="tip-rar rar${r}">희귀도 ${r} · ${RARITY_NAME[r]}</div>`;
      h += isComplete(b) ? '<div class="tip-ok">✔ 완성된 문장입니다. 스킬에 장착하면 효과가 적용됩니다.</div>'
        : `<div class="tip-warn">✖ 빈 칸이 ${missingCount(b)}개 남았습니다.</div>`;
      if (b.slots.some((s) => s.locked)) h += `<div class="tip-dim">${ic('lock')} 표시된 칸은 바꿀 수 없습니다.</div>`;
      h += '<div class="tip-dim">우클릭하면 문장을 편집합니다.</div>';
    } else if (b.kind === 'word') {
      const d = SUBJECTS[b.key] || CHANGES[b.key];
      h += `<div class="tip-title">${d.name}</div><div>${d.desc}</div>`;
    } else if (b.kind === 'op') {
      const v = evalNumber(b);
      h += `<div class="tip-title">${numText(b).slice(1, -1)}</div>`;
      h += v ? `<div class="tip-ok">= ${fmtValue(v)}</div>` : '<div class="tip-warn">빈 칸에 수치 블록을 넣어야 합니다.</div>';
      h += '<div class="tip-dim">문장의 수치 칸에 넣습니다. 우클릭하면 편집합니다.</div>';
    } else {
      h += `<div class="tip-title big">${blockLabel(b)}</div>`;
      h += `<div class="tip-dim">${NUM_DESC[b.ntype]}</div>`;
    }
    h += '<div class="tip-dim">창 밖으로 끌어 놓으면 버립니다.</div>';
    return h;
  }

  // ── 인벤토리 ──────────────────────────
  renderInventory() {
    const g = this.invEl;
    g.innerHTML = '';
    let used = 0;
    for (let i = 0; i < INV_W * INV_H; i++) {
      const cell = el('div', 'cell droppable');
      const loc = { t: 'inv', i };
      cell._drop = loc;
      const b = game.inventory[i];
      if (b) {
        used++;
        const tile = this.makeTile(b);
        tile._drag = loc;
        if (b.kind === 'sentence' || b.kind === 'op') tile._ctx = b;
        cell.appendChild(tile);
      }
      g.appendChild(cell);
    }
    $('#inv-count').textContent = `${used} / ${INV_W * INV_H}`;
  }

  // ── 스킬 창 ───────────────────────────
  renderSkills() {
    const wrap = this.skillsEl;
    wrap.innerHTML = '';
    $('#skills-count').textContent = `${game.skills.length} / ${MAX_SKILLS}`;
    game.skills.forEach((sk) => {
      const d = sk.def;
      const card = el('div', 'skill-card' + (sk.collapsed ? ' collapsed' : ''));
      const head = el('div', 'sc-head');
      const title = el('div', 'sc-title', `<span class="sc-icon" style="--c:${d.color}">${d.icon}</span>
        <span class="sc-namebox"><span class="sc-name">${d.name}</span><span class="sc-lv">Lv.${sk.level}${d.element ? ` <span class="elem e-${d.element}">${ELEMENTS[d.element].name}</span>` : ''}</span></span>`);
      title._tip = () => this.skillTip(sk);
      head.appendChild(title);

      // 문장 블록 장착 칸 (정사각형)
      const slots = el('div', 'sc-slots');
      for (let i = 0; i < MAX_SENTENCE_SLOTS; i++) {
        const sq = el('div', 'sq');
        if (i >= sk.maxSlots) {
          sq.classList.add('locked');
          sq.innerHTML = ic('lock');
          sq._tip = () => '<div class="tip-dim">잠긴 칸입니다. 레벨업 선택지로 열 수 있습니다.</div>';
        } else {
          const loc = { t: 'skill', skill: sk, i };
          sq._drop = loc;
          sq.classList.add('droppable');
          const s = sk.sentences[i];
          if (s) {
            const tile = this.makeTile(s);
            tile._drag = loc;
            tile._ctx = s;
            sq.appendChild(tile);
          } else {
            sq.appendChild(el('span', 'sq-num', `${i + 1}`));
            sq._tip = () => '<div>문장 블록을 끌어다 놓으면 장착됩니다.</div><div class="tip-dim">왼쪽 칸부터 순서대로 적용됩니다.</div>';
          }
        }
        slots.appendChild(sq);
      }
      head.appendChild(slots);

      if (d.passive) head.appendChild(el('span', 'sc-passive', '패시브'));
      else {
        const lab = el('label', 'sc-auto');
        const cb = el('input');
        cb.type = 'checkbox';
        cb.checked = sk.auto;
        cb.addEventListener('change', () => { sk.auto = cb.checked; this.renderSkillbar(); });
        lab.append(cb, document.createTextNode(' 자동 사용'));
        head.appendChild(lab);
      }
      const fold = el('button', 'sc-fold', sk.collapsed ? '▸' : '▾');
      fold.title = sk.collapsed ? '펼치기' : '접기';
      fold.addEventListener('click', () => { sk.collapsed = !sk.collapsed; this.renderSkills(); });
      head.appendChild(fold);
      card.appendChild(head);

      if (!sk.collapsed) {
        const { stats, log } = getResult(sk);
        const base = baseStats(sk);
        const rows = el('div', 'sc-rows');
        for (let i = 0; i < sk.maxSlots; i++) {
          const row = el('div', 'srow');
          row.appendChild(el('span', 'sr-num', `${i + 1}`));
          const s = sk.sentences[i];
          if (s) {
            row._ctx = s;
            row._tip = () => this.blockTip(s);
            const txt = el('span', 'sr-text');
            this.renderSentenceInto(txt, s, false);
            row.appendChild(txt);
            const entry = log.find((l) => l.i === i);
            if (d.payload) {
              const ok = isComplete(s);
              row.classList.add(ok ? 'ok' : 'bad');
              row.appendChild(el('span', 'sr-eff' + (ok ? '' : ' warn'), ok ? '다음 공격 스킬에 적용' : '미완성'));
            } else if (entry && entry.ok && entry.na) {
              // 스킬에 없는 키워드를 바꾸려는 문장
              row.classList.add('na');
              row.appendChild(el('span', 'sr-eff na', '적용되지 않음'));
            } else if (entry && entry.ok && entry.text) {
              row.classList.add('ok');
              row.appendChild(el('span', 'sr-eff', entry.text));
            } else if (entry && entry.ok) {
              row.classList.add('ok');
              const sub = entry.subj === 'penPct' ? 'penetration' : entry.subj;
              const fmt = (v) => (sub === 'penetration' && entry.subj === 'penPct' ? `${Math.round(v.max * 100)}%` : fmtStat(sub, v));
              row.appendChild(el('span', 'sr-eff', `${shortName(d, sub)} ${fmt(entry.before)} → <b>${fmt(entry.after)}</b>`));
            } else {
              row.classList.add('bad');
              row.appendChild(el('span', 'sr-eff warn', (entry && entry.reason) || '미완성'));
            }
          } else {
            row.appendChild(el('span', 'sr-empty', '비어 있음'));
          }
          rows.appendChild(row);
        }
        card.appendChild(rows);

        const sts = el('div', 'sc-stats');
        for (const k of shownStats(d, stats)) {
          if (k !== 'penetration' && stats[k].max === 0) continue; // 0 인 값은 표시하지 않음 (예: 관통 기능이 없는 스킬)
          const changed = statText(k, stats) !== statText(k, base);
          const ec = statElemClass(d, k);
          const span = el('span', 'st' + (changed ? ' changed' : '') + (ec ? ' el-' + ec : ''), `${shortName(d, k)} <b>${statText(k, stats)}</b>`);
          span._tip = () => `<div class="tip-title">${statLabel(d, k)}</div><div>${k === 'damage' && d.element ? `${ELEMENTS[d.element].name} 속성의 피해량입니다.` : SUBJECTS[k].desc}</div><div class="tip-dim">기본 ${statText(k, base)} → 최종 ${statText(k, stats)}</div>`;
          sts.appendChild(span);
        }
        for (const x of extraLines(sk)) sts.appendChild(el('span', 'st extra', x));
        card.appendChild(sts);
      }
      wrap.appendChild(card);
    });
    for (let i = game.skills.length; i < MAX_SKILLS; i++) {
      wrap.appendChild(el('div', 'skill-empty', `빈 스킬 슬롯 ${(i + 1) % 10} · 레벨업 선택지로 스킬을 얻을 수 있습니다.`));
    }
  }

  skillTip(sk) {
    const d = sk.def;
    const { stats } = getResult(sk);
    let h = `<div class="tip-title">${d.icon} ${d.name} <span class="tip-dim">Lv.${sk.level}</span>${d.element ? ` <span class="elem e-${d.element}">${ELEMENTS[d.element].name}</span>` : ''}</div><div>${d.desc}</div>`;
    if (d.element) h += `<div class="tip-dim">${ELEMENTS[d.element].status}: ${ELEMENTS[d.element].desc}</div>`;
    for (const [k, el2] of [['fireDmg', 'fire'], ['iceDmg', 'ice'], ['lightningDmg', 'lightning']]) {
      if (el2 !== d.element && stats[k] && stats[k].max > 0) h += `<div class="tip-ok">추가 ${ELEMENTS[el2].name} 피해를 얻었습니다.</div>`;
    }
    h += `<div class="tip-stats">${shownStats(d, stats).filter((k) => k === 'penetration' || stats[k].max !== 0).map((k) => { const ec = statElemClass(d, k); return `<span class="${ec ? 'el-' + ec : ''}">${shortName(d, k)}</span> <b>${statText(k, stats)}</b>`; }).join('<br>')}</div>`;
    // 3레벨 / 5레벨 추가 효과 (도달한 효과는 강조)
    for (const lv of [3, 5]) h += `<div class="tip-mile${sk.level >= lv ? ' on' : ''}">${lv}레벨 효과 : ${milestoneText(d, lv)}</div>`;
    if (sk.key === 'frostBarrier') h += `<div class="tip-dim">스택 ${sk.stacks} / ${maxStacks(sk)}</div>`;
    if (sk.key === 'triggerKill') h += `<div class="tip-dim">중첩 ${Math.floor(sk.stacks)} / ${triggerGoal(sk) || '완성된 문장을 장착해야 합니다.'}</div>`;
    if (sk.key === 'enchant') h += `<div class="tip-dim">경험치 ${Math.floor(sk.xpAcc || 0)} / ${enchantReq(sk)}</div>`;
    if (!d.passive) h += `<div class="tip-dim">클릭하거나 숫자키로 사용합니다. 우클릭하면 자동 사용이 ${sk.auto ? '꺼집니다' : '켜집니다'}.</div>`;
    return h;
  }

  // ── 스킬 바 ───────────────────────────
  buildSkillbar() {
    this.sbSlots = [];
    for (let i = 0; i < MAX_SKILLS; i++) {
      const s = el('div', 'sb-slot');
      s.innerHTML = `<span class="sb-icon"></span><span class="sb-cd"></span><span class="sb-key">${(i + 1) % 10}</span><span class="sb-auto">AUTO</span><span class="sb-stack"></span>`;
      this.skillbarEl.appendChild(s);
      this.sbSlots.push(s);
    }
  }

  renderSkillbar() {
    this.sbSlots.forEach((s, i) => {
      const sk = game.skills[i];
      s.classList.toggle('empty', !sk);
      s.querySelector('.sb-icon').innerHTML = sk ? sk.def.icon : '';
      s.classList.toggle('auto', !!(sk && sk.auto && !sk.def.passive));
      s.classList.toggle('passive', !!(sk && sk.def.passive));
      s.classList.toggle('stacked', !!(sk && (sk.key === 'frostBarrier' || sk.key === 'triggerKill' || sk.key === 'enchant')));
      if (sk) s.style.setProperty('--sc', sk.def.color);
      s._tip = sk ? () => this.skillTip(sk) : null;
      s._click = sk && !sk.def.passive ? () => { game.sys.skillsRt.tryCast(sk, true); } : null;
      s._rclick = sk && !sk.def.passive ? () => { sk.auto = !sk.auto; this.toast(`${sk.def.name} 자동 사용 ${sk.auto ? 'ON' : 'OFF'}`); this.refresh(); } : null;
    });
  }

  // ── 팝업 ──────────────────────────────
  // 문장 팝업 / 연산 팝업은 종류별로 하나씩만 열리며, 다른 블록을 우클릭하면 내용이 교체됨.
  // 창 위치는 종류별로 기억해 닫았다 열어도 같은 위치에 열림.
  openPopup(block) {
    const kind = block.kind;
    let p = game.popups.find((q) => q.block.kind === kind);
    if (p) p.block = block;
    else {
      const mem = this.popupPos[kind];
      p = { block, x: mem ? mem.x : null, y: mem ? mem.y : null, z: 0 };
      game.popups.push(p);
    }
    p.z = ++this.zTop;
    this.renderPopups();
  }

  closePopup(block) {
    game.popups = game.popups.filter((p) => p.block !== block);
    this.renderPopups();
  }

  // 열린 창(인벤토리/스킬/다른 팝업)과 겹치지 않는 가까운 위치 찾기
  placePopup(p, w) {
    const pw = w.offsetWidth, ph = w.offsetHeight, M = 10;
    const rects = [];
    for (const id of ['#win-inv', '#win-skills']) {
      const e = $(id);
      if (!e.classList.contains('hidden')) rects.push(stageRect(e.getBoundingClientRect()));
    }
    for (const q of game.popups) if (q !== p && q.el) rects.push(stageRect(q.el.getBoundingClientRect()));
    const anchors = rects;
    const cands = [];
    for (const a of anchors) {
      const top = Math.max(M, Math.min(a.top, STAGE.H - ph - M));
      cands.push([a.left - pw - M, top], [a.left, a.bottom + M], [a.right - pw, a.bottom + M],
        [a.left, a.top - ph - M], [a.right + M, top]);
    }
    cands.push([STAGE.W / 2 - pw / 2, STAGE.H - ph - 110]);
    const fits = ([x, y]) => x >= M && y >= M && x + pw <= STAGE.W - M && y + ph <= STAGE.H - M;
    const overlap = ([x, y]) => rects.reduce((sum, r) =>
      sum + Math.max(0, Math.min(x + pw, r.right) - Math.max(x, r.left)) * Math.max(0, Math.min(y + ph, r.bottom) - Math.max(y, r.top)), 0);
    // 화면 안에 들어오는 후보 중 겹침이 가장 적은 곳 (동률이면 앞선 후보 = 가까운 위치 우선)
    let best = null, bestO = Infinity;
    for (const c of cands) {
      if (!fits(c)) continue;
      const o = overlap(c);
      if (o < bestO - 1) { best = c; bestO = o; }
    }
    best = best || [M, M];
    p.x = best[0]; p.y = best[1];
    this.popupPos[p.block.kind] = { x: p.x, y: p.y };
  }

  closeTopPopup() {
    const top = game.popups.reduce((a, p) => (!a || p.z > a.z ? p : a), null);
    if (!top) return;
    if (top.block.kind === 'recomb') this.closeRecomb(true);
    else this.closePopup(top.block);
  }

  // ── 재조합 ────────────────────────────
  openRecomb() {
    if (!game.popups.some((p) => p.block.kind === 'recomb')) {
      const mem = this.popupPos.recomb;
      game.popups.push({ block: { kind: 'recomb' }, x: mem ? mem.x : null, y: mem ? mem.y : null, z: ++this.zTop });
    }
    this.renderPopups();
  }

  // 재조합 칸에 남은 블록은 인벤토리로 돌려보냄 (가득 차면 발밑에 떨어뜨림)
  returnRecombBlocks() {
    const left = [];
    for (let i = 0; i < 3; i++) {
      const b = game.recomb[i];
      if (!b) continue;
      game.recomb[i] = null;
      if (!inventoryAdd(b)) left.push(b);
    }
    if (left.length) {
      const p = game.sys.player.pos;
      game.sys.dropBlocks(left, p.x, p.z, { minD: 1.5, maxD: 2.5 });
    }
  }

  // 문장/연산 블록에 끼워진 블록을 인벤토리 빈칸으로 해제
  releaseToInv(loc) {
    const rb = getAt(loc);
    if (!rb) return;
    if (game.tutorial && !game.tutorial.canDrag(rb, loc)) { sfx('error'); return; }
    const i = game.inventory.indexOf(null);
    if (i < 0) { this.toast('인벤토리가 가득 찼습니다', 'warn'); sfx('error'); return; }
    this.hideTip();
    this.move(loc, { t: 'inv', i });
  }

  // 재조합 창이 열려 있을 때 인벤토리 블록 클릭 → 빈 재조합 칸으로 바로 이동 (같은 유형만)
  quickRecomb(loc) {
    const b = getAt(loc);
    if (!b) return;
    const i = game.recomb.indexOf(null);
    if (i < 0) { this.toast('재조합 칸이 가득 찼습니다', 'warn'); sfx('error'); return; }
    const to = { t: 'rc', i };
    if (!accepts(to, b)) { this.toast('재조합 칸에 들어 있는 블록과 같은 유형만 넣을 수 있습니다', 'warn'); sfx('error'); return; }
    this.move(loc, to);
  }

  closeRecomb(render = true) {
    this.returnRecombBlocks();
    game.popups = game.popups.filter((p) => p.block.kind !== 'recomb');
    if (render) this.changed();
  }

  doRecombine() {
    if (game.recomb.every(Boolean)) sfx('recomb');
    const items = game.recomb;
    if (items.some((b) => !b)) return;
    const type = colorKey(items[0]);
    const exclude = new Set(items.map(blockSig));
    // 문장/연산 블록 안에 끼워 둔(고정 아닌) 블록은 빼서 돌려줌
    const extras = [];
    for (const b of items) extras.push(...dismantle(b).slice(1));
    game.recomb = [null, null, null];
    const result = randomOfType(type, exclude);
    const left = [];
    for (const b of [result, ...extras]) if (!inventoryAdd(b)) left.push(b);
    if (left.length) {
      const p = game.sys.player.pos;
      game.sys.dropBlocks(left, p.x, p.z, { minD: 1.5, maxD: 2.5 });
    }
    this.lastRecomb = result;
    this.toast(`${ic('flask')} 재조합 완료! <span class="tchip k-${type}">${KIND_BADGE[type]}</span> ${result.kind === 'sentence' ? '문장 블록' : blockLabel(result)}`, 'pick');
    if (extras.length) this.toast(`안에 끼워져 있던 블록 ${extras.length}개를 돌려받았습니다`);
    this.changed();
    const idx = game.inventory.indexOf(result);
    if (idx >= 0) {
      const cell = this.invEl.children[idx];
      if (cell) cell.classList.add('flash-new');
    }
  }

  renderRecomb(p) {
    const w = el('div', 'popup ui-zone recomb-pop');
    w.style.left = (p.x ?? 0) + 'px';
    w.style.top = (p.y ?? 0) + 'px';
    w.style.zIndex = 60 + p.z;
    const head = el('div', 'pop-head', `<span>${ic('flask')} 재조합</span>`);
    const close = el('button', 'pop-close', '✕');
    close.addEventListener('click', () => this.closeRecomb(true));
    head.appendChild(close);
    head.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('button')) return;
      ev.preventDefault();
      const ox = toStageX(ev.clientX) - p.x, oy = toStageY(ev.clientY) - p.y;
      p.z = ++this.zTop; w.style.zIndex = 60 + p.z;
      const mv = (e) => {
        p.x = toStageX(e.clientX) - ox; p.y = toStageY(e.clientY) - oy;
        w.style.left = p.x + 'px'; w.style.top = p.y + 'px';
        this.popupPos.recomb = { x: p.x, y: p.y };
      };
      const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
      addEventListener('pointermove', mv);
      addEventListener('pointerup', up);
    });
    w.appendChild(head);
    const body = el('div', 'pop-body');
    const filled = game.recomb.filter(Boolean);
    const type = filled.length ? colorKey(filled[0]) : null;
    const row = el('div', 'rc-row');
    for (let i = 0; i < 3; i++) {
      const sq = el('div', 'sq rc-sq droppable');
      const loc = { t: 'rc', i };
      sq._drop = loc;
      const b = game.recomb[i];
      if (b) {
        const tile = this.makeTile(b);
        tile._drag = loc;
        if (b.kind === 'sentence' || b.kind === 'op') tile._ctx = b;
        sq.appendChild(tile);
      } else {
        sq.appendChild(el('span', 'sq-num', '+'));
        sq._tip = () => (type ? `<div><span class="tchip k-${type}">${KIND_BADGE[type]}</span> 유형 블록만 넣을 수 있습니다.</div>` : '<div>블록을 끌어다 놓으면 들어갑니다.</div><div class="tip-dim">같은 유형 블록 3개가 필요합니다.</div>');
      }
      row.appendChild(sq);
      if (i < 2) row.appendChild(el('span', 'rc-plus', '+'));
    }
    row.appendChild(el('span', 'rc-plus', '→'));
    const btn = el('button', 'rc-btn', '재조합');
    btn.disabled = filled.length < 3;
    btn.addEventListener('click', () => this.doRecombine());
    row.appendChild(btn);
    body.appendChild(row);
    body.appendChild(el('div', 'pop-status ' + (filled.length === 3 ? 'ok' : ''), type
      ? `유형: <span class="tchip k-${type}">${KIND_BADGE[type]}</span> (${filled.length}/3)`
      : '같은 유형의 블록 3개를 넣으세요 (0/3)'));
    body.appendChild(el('div', 'pop-hint', '같은 유형의 새 블록 1개 획득 (넣은 3개와 중복 없음)'));
    w.appendChild(body);
    w.addEventListener('pointerdown', () => { if (p.z !== this.zTop) { p.z = ++this.zTop; w.style.zIndex = 60 + p.z; } });
    this.popupsEl.appendChild(w);
    p.el = w;
  }

  reachable() {
    const s = new Set();
    const visit = (b) => {
      if (!b || s.has(b)) return;
      s.add(b);
      if (b.kind === 'sentence') b.slots.forEach((sl) => visit(sl.block));
      if (b.kind === 'op') b.slots.forEach(visit);
    };
    game.inventory.forEach(visit);
    game.skills.forEach((sk) => sk.sentences.forEach(visit));
    game.recomb.forEach(visit);
    return s;
  }

  renderPopups() {
    const reach = this.reachable();
    game.popups = game.popups.filter((p) => p.block.kind === 'recomb' || reach.has(p.block));
    this.popupsEl.innerHTML = '';
    for (const p of game.popups) {
      const b = p.block;
      if (b.kind === 'recomb') { this.renderRecomb(p); continue; }
      const w = el('div', `popup ui-zone k-${colorKey(b)}`);
      w.style.left = p.x + 'px';
      w.style.top = p.y + 'px';
      w.style.zIndex = 60 + p.z;
      const head = el('div', 'pop-head', `<span>${b.kind === 'sentence' ? `${ic('scroll')} 문장 블록` : `${ic('calc')} 연산 블록 (${OP_SYMBOL[b.op]})`}</span>`);
      const close = el('button', 'pop-close', '✕');
      close.addEventListener('click', () => this.closePopup(b));
      head.appendChild(close);
      head.addEventListener('pointerdown', (ev) => {
        if (ev.target.closest('button')) return;
        ev.preventDefault();
        const ox = toStageX(ev.clientX) - p.x, oy = toStageY(ev.clientY) - p.y;
        p.z = ++this.zTop; w.style.zIndex = 60 + p.z;
        const mv = (e) => {
          p.x = toStageX(e.clientX) - ox; p.y = toStageY(e.clientY) - oy;
          w.style.left = p.x + 'px'; w.style.top = p.y + 'px';
          this.popupPos[b.kind] = { x: p.x, y: p.y };
        };
        const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
        addEventListener('pointermove', mv);
        addEventListener('pointerup', up);
      });
      w.appendChild(head);
      const body = el('div', 'pop-body');
      if (b.kind === 'sentence') {
        const line = el('div', 'sentence-line');
        this.renderSentenceInto(line, b, true);
        body.appendChild(line);
        body.appendChild(isComplete(b)
          ? el('div', 'pop-status ok', '✔ 완성되었습니다. 스킬에 장착하면 효과가 적용됩니다.')
          : el('div', 'pop-status bad', `✖ 미완성 — 빈 칸 ${missingCount(b)}개`));
        body.appendChild(el('div', 'pop-hint', '인벤토리의 블록을 빈 칸으로 끌어 넣습니다. 끼워진 블록을 우클릭하면 인벤토리로 돌아갑니다.'));
      } else {
        const line = el('div', 'sentence-line op-line');
        for (let i = 0; i < 2; i++) {
          const chip = el('span', 'chip');
          const nb = b.slots[i];
          const loc = { t: 'op', block: b, i };
          chip._drop = loc;
          chip.classList.add('droppable');
          if (nb) {
            chip.classList.add('filled', 'k-number');
            chip.textContent = blockLabel(nb);
            chip._drag = loc;
            chip._rclick = () => this.releaseToInv(loc);
            chip._tip = () => this.blockTip(nb);
          } else {
            chip.classList.add('empty', 't-number');
            chip.textContent = '[수치]';
            chip._tip = () => '<div>수치 블록을 넣을 수 있습니다. 연산 블록은 넣을 수 없습니다.</div>';
          }
          line.appendChild(chip);
          if (i === 0) line.appendChild(el('span', 'op-sym', OP_SYMBOL[b.op]));
        }
        const v = evalNumber(b);
        line.appendChild(el('span', 'op-res', v ? `= ${fmtValue(v)}` : '= ?'));
        body.appendChild(line);
        body.appendChild(el('div', 'pop-hint', '문장 블록의 수치 칸에 넣어 사용합니다. 끼워진 블록을 우클릭하면 인벤토리로 돌아갑니다.'));
      }
      w.appendChild(body);
      w.addEventListener('pointerdown', () => { if (p.z !== this.zTop) { p.z = ++this.zTop; w.style.zIndex = 60 + p.z; } });
      this.popupsEl.appendChild(w);
      p.el = w;
    }
    for (const p of game.popups) {
      if (p.x == null) {
        this.placePopup(p, p.el);
        p.el.style.left = p.x + 'px';
        p.el.style.top = p.y + 'px';
      }
    }
  }

  // ── 드래그 & 드롭 ─────────────────────
  bindEvents() {
    // 상호작용 가능한 UI 에 마우스를 올리면 짧은 효과음
    const HOVER = 'button, .lu-card, .up-node, .sb-slot:not(.empty), .tile, .tag, .srow, .sq.droppable';
    let lastHover = null;
    document.addEventListener('pointerover', (e) => {
      if (this.drag && this.drag.started) return;
      const h = e.target.closest && e.target.closest(HOVER);
      if (h && h !== lastHover) sfx('hover');
      lastHover = h;
    });
    document.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const n = findProp(e.target, '_drag');
      if (n) {
        const b = getAt(n._drag);
        if (!b) return;
        if (game.tutorial && !game.tutorial.canDrag(b, n._drag)) { sfx('error'); this.toast('지금은 이 블록을 옮길 수 없습니다', 'warn'); e.preventDefault(); return; }
        this.drag = { loc: n._drag, b, sx: e.clientX, sy: e.clientY, started: false };
        e.preventDefault();
        return;
      }
      const c = findProp(e.target, '_click');
      if (c) { sfx('click'); c._click(); }
    });

    document.addEventListener('pointermove', (e) => {
      this.mouse.x = toStageX(e.clientX); this.mouse.y = toStageY(e.clientY);
      const d = this.drag;
      if (d) {
        if (!d.started && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) this.startDrag();
        if (d.started) {
          this.ghostEl.style.transform = `translate(${this.mouse.x - 26}px, ${this.mouse.y - 26}px)`;
          const t = document.elementFromPoint(e.clientX, e.clientY);
          const dn = findProp(t, '_drop');
          const out = !dn && !(t && t.closest('.ui-zone'));
          this.ghostEl.classList.toggle('discard', out);
          return;
        }
      }
      this.updateTip(e.target);
    });

    document.addEventListener('pointerup', (e) => {
      const d = this.drag;
      if (!d) return;
      this.drag = null;
      if (d.started) this.finishDrag(e, d);
      else if (d.loc.t === 'inv' && game.popups.some((p) => p.block.kind === 'recomb')) this.quickRecomb(d.loc);
    });

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.drag) return;
      const r = findProp(e.target, '_rclick');
      if (r) { r._rclick(); return; }
      const n = findProp(e.target, '_ctx');
      if (n) { sfx('open'); this.openPopup(n._ctx); }
    });
  }

  updateTip(target) {
    const n = findProp(target, '_tip');
    if (n !== this.tipNode) {
      this.tipNode = n;
      if (n) { this.tipEl.innerHTML = n._tip(); this.tipEl.classList.remove('hidden'); }
      else this.tipEl.classList.add('hidden');
    }
    if (n) {
      const r = { width: this.tipEl.offsetWidth, height: this.tipEl.offsetHeight };
      let x = this.mouse.x + 16, y = this.mouse.y + 16;
      if (x + r.width > STAGE.W - 8) x = this.mouse.x - r.width - 12;
      if (y + r.height > STAGE.H - 8) y = STAGE.H - r.height - 8;
      this.tipEl.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  hideTip() { this.tipNode = null; this.tipEl.classList.add('hidden'); }

  startDrag() {
    sfx('pick');
    const d = this.drag;
    d.started = true;
    this.hideTip();
    this.ghostEl.innerHTML = '';
    this.ghostEl.appendChild(this.makeTile(d.b));
    this.ghostEl.classList.remove('hidden');
    document.body.classList.add('dragging');
    document.querySelectorAll('.droppable').forEach((n) => {
      if (n._drop && !sameLoc(n._drop, d.loc) && accepts(n._drop, d.b)) n.classList.add('can-drop');
    });
  }

  finishDrag(e, d) {
    this.ghostEl.classList.add('hidden');
    this.ghostEl.classList.remove('discard');
    document.body.classList.remove('dragging');
    document.querySelectorAll('.can-drop').forEach((n) => n.classList.remove('can-drop'));
    const t = document.elementFromPoint(e.clientX, e.clientY);
    const dn = findProp(t, '_drop');
    if (dn) this.move(d.loc, dn._drop);
    else if (t && t.closest('.ui-zone')) { /* UI 위에서 놓음 → 취소 */ }
    else if (game.tutorial) { this.toast('튜토리얼에서는 블록을 버릴 수 없습니다', 'warn'); sfx('error'); }
    else this.discard(d.loc);
  }

  move(from, to) {
    if (sameLoc(from, to)) return;
    const a = getAt(from), b = getAt(to);
    if (!a) return;
    if (!accepts(to, a)) { this.toast('그 칸에는 넣을 수 없는 블록입니다', 'warn'); sfx('error'); return; }
    if (b && !accepts(from, b)) { this.toast('서로 교체할 수 없습니다', 'warn'); sfx('error'); return; }
    sfx(to.t === 'skill' ? 'equip' : 'drop');
    setAt(from, null);
    setAt(to, a);
    if (b) setAt(from, b);
    this.changed();
  }

  discard(loc) {
    const b = getAt(loc);
    if (!b) return;
    setAt(loc, null);
    const parts = dismantle(b);
    const p = game.sys.player.pos;
    game.sys.dropBlocks(parts, p.x, p.z, { requireExit: true, minD: 2.2, maxD: 3.6 });
    sfx('discard');
    this.toast(parts.length > 1 ? `블록을 해체하여 ${parts.length}개를 버렸습니다` : '블록을 버렸습니다');
    this.changed();
  }

  // ── 창 열기/닫기 ──────────────────────
  setWindows(inv, skills, force = false) {
    if (game.tutorial && !force) [inv, skills] = game.tutorial.filterWindows(inv, skills);
    if (inv !== game.invOpen || skills !== game.skillsOpen) sfx((inv && !game.invOpen) || (skills && !game.skillsOpen) ? 'open' : 'close');
    game.invOpen = inv;
    game.skillsOpen = skills;
    $('#win-inv').classList.toggle('hidden', !inv);
    $('#win-skills').classList.toggle('hidden', !skills);
    if (!inv) this.closeRecomb(false);
    if (!inv && !skills) { game.popups = []; this.hideTip(); }
    this.refresh();
  }

  // ── 레벨업 ────────────────────────────
  showLevelUp(choices, onPick, onReroll) {
    sfx('levelup');
    sfx('cardIn');
    const box = $('#lu-cards');
    box.innerHTML = '';
    choices.forEach((c) => {
      const card = el('div', 'lu-card');
      card.innerHTML = `<div class="lu-tag">${c.tag}</div><div class="lu-icon">${c.icon}</div><div class="lu-title">${c.title}</div><div class="lu-desc">${c.desc}</div><div class="lu-detail">${c.detail}</div>`;
      card.addEventListener('click', () => { sfx('select'); onPick(c); });
      card._tip = () => c.tip || `<div class="tip-title">${c.title}</div><div>${c.desc}</div><div class="tip-ok">${c.detail}</div>`;
      box.appendChild(card);
    });
    const rr = $('#lu-reroll');
    rr.innerHTML = `${ic('dice')} 리롤 (${game.rerolls})`;
    rr.disabled = game.rerolls <= 0;
    rr.onclick = onReroll;
    $('#lu-title').textContent = 'LEVEL UP!';
    $('#lu-level').textContent = `Lv.${game.level - game.pendingLevels + 1}`;
    $('#levelup').classList.remove('hidden');
  }

  // 블록 선택 획득: 블록 3개 중 하나
  showBlockPick(blocks, onPick, onReroll, title = '블록 선택') {
    sfx('cardIn');
    const box = $('#lu-cards');
    box.innerHTML = '';
    blocks.forEach((b) => {
      const card = el('div', 'lu-card block-card');
      const tileWrap = el('div', 'lu-tile');
      tileWrap.appendChild(this.makeTile(b));
      card.appendChild(el('div', 'lu-tag', kindName(b)));
      card.appendChild(tileWrap);
      card.appendChild(el('div', 'lu-title', b.kind === 'sentence' ? '문장 블록' : blockLabel(b)));
      let desc = '';
      if (b.kind === 'sentence') desc = `<div class="tip-sentence">${this.sentenceHTML(b)}</div>`;
      else if (b.kind === 'word') desc = (SUBJECTS[b.key] || CHANGES[b.key]).desc;
      else if (b.kind === 'op') desc = '두 수치 블록을 연산해 하나의 수치로 만듭니다.';
      else desc = NUM_DESC[b.ntype];
      card.appendChild(el('div', 'lu-desc', desc));
      card.addEventListener('click', () => { sfx('select'); onPick(b); });
      card._tip = () => this.blockTip(b);
      box.appendChild(card);
    });
    const rr = $('#lu-reroll');
    rr.innerHTML = `${ic('dice')} 리롤 (${game.rerolls})`;
    rr.disabled = game.rerolls <= 0;
    rr.onclick = onReroll;
    $('#lu-title').innerHTML = title;   // 제목에 아이콘(SVG)이 들어갈 수 있음
    $('#lu-level').textContent = '하나를 골라 획득';
    $('#levelup').classList.remove('hidden');
  }
  hideLevelUp() { $('#levelup').classList.add('hidden'); this.hideTip(); }

  renderBuffs() {
    const box = $('#buffs');
    if (box.children.length !== game.buffs.length) {
      box.innerHTML = '';
      for (const b of game.buffs) {
        const d = el('div', 'buff', `${b.icon}<span class="bc"></span>`);
        d.style.setProperty('--bc', b.color);
        box.appendChild(d);
      }
    }
    game.buffs.forEach((b, i) => {
      const d = box.children[i];
      d.style.setProperty('--t', Math.max(0, b.t / b.max));
      d.querySelector('.bc').textContent = b.charges > 1 ? b.charges : '';
    });
  }

  // 보스 체력 바: 살아 있는 보스(킹 슬라임 먼저, 중간 보스 순)를 최대 4개까지 가로로 나눠 표시
  updateBossBars() {
    const list = game.sys.enemies.list.filter((e) => e.alive && (e.boss || e.elite))
      .sort((a, b) => (b.boss ? 1 : 0) - (a.boss ? 1 : 0)).slice(0, 4);
    const box = $('#bossbar');
    box.classList.toggle('hidden', list.length === 0);
    if (!this.bossList || this.bossList.length !== list.length || this.bossList.some((e, i) => e !== list[i])) {
      this.bossList = list;
      box.innerHTML = '';
      for (const e of list) {
        const d = el('div', 'bb' + (e.elite ? ' elite' : ''));
        d.innerHTML = `<div class="bb-name">${e.boss ? `${ic('crown')} 킹 슬라임` : `${ic('gem')} 정예 슬라임`} <span class="bb-hp"></span></div>
          <div class="bb-track"><div class="bb-fill"></div></div><div class="bb-status"></div>`;
        box.appendChild(d);
      }
    }
    list.forEach((e, i) => {
      const d = box.children[i];
      d.querySelector('.bb-fill').style.width = `${Math.max(0, e.hp / e.maxHp) * 100}%`;
      d.querySelector('.bb-hp').textContent = `${Math.floor(Math.max(0, e.hp))} / ${Math.floor(e.maxHp)}`;
      // 걸려 있는 상태이상 아이콘
      const st = [];
      if (e.burnT > 0) st.push([ic('fire'), '화상', 'fire', e.burnT]);
      if (e.chillT > 0) st.push([ic('snowflake'), '둔화', 'ice', e.chillT]);
      if (e.shockT > 0) st.push([ic('bolt'), '감전', 'lightning', e.shockT]);
      if (e.fireVuln > 0) st.push([ic('flamewave'), `화염 취약 +${Math.round(e.fireVuln * 100)}%`, 'fire', 0]);
      const key = st.map((x) => x[1] + (x[3] > 0 ? Math.ceil(x[3]) : '')).join('|');
      const sd = d.querySelector('.bb-status');
      if (sd._key !== key) {
        sd._key = key;
        sd.innerHTML = st.map(([ic, name, cls, t]) => `<span class="bs e-${cls}" title="${name}">${ic}${t > 0 ? `<i>${Math.ceil(t)}</i>` : ''}</span>`).join('');
      }
    });
  }

  // ── HUD (매 프레임) ───────────────────
  updateHUD() {
    const pl = game.sys.player;
    $('#hpfill').style.width = `${(pl.hp / pl.maxHp) * 100}%`;
    $('#shieldfill').style.width = `${Math.min(1, pl.shield / pl.maxHp) * 100}%`;
    $('#mpfill').style.width = `${(pl.mana / pl.maxMana) * 100}%`;
    $('#mptext').textContent = `${Math.floor(pl.mana)} / ${pl.maxMana}`;
    this.renderBuffs();
    $('#hptext').textContent = `${Math.floor(pl.hp)} / ${pl.maxHp}${pl.shield > 0 ? `  (+${Math.floor(pl.shield)})` : ''}`;
    const need = xpToNext(game.level);
    $('#xpfill').style.width = `${(game.xp / need) * 100}%`;
    $('#lvl').textContent = `Lv.${game.level}`;
    $('#xptext').textContent = `${Math.floor(game.xp)} / ${need}`;
    if (game.state === 'victory' || game.state === 'clear') $('#timer').textContent = 'CLEAR';
    else if (game.tutorial) $('#timer').textContent = 'TUTORIAL';
    else if (game.bossSpawned) $('#timer').textContent = 'BOSS';
    else {
      const r = Math.max(0, STAGE_TIME - game.time);
      $('#timer').textContent = `${String(Math.floor(r / 60)).padStart(2, '0')}:${String(Math.floor(r % 60)).padStart(2, '0')}`;
    }
    $('#timer').classList.toggle('boss', game.bossSpawned);
    $('#killnum').textContent = game.kills;
    this.updateBossBars();

    const db = $('#dashbox');
    const dcd = Math.max(0, pl.dashCd);
    db.classList.toggle('show', dcd > 0);
    db.style.setProperty('--cd', dcd / pl.dashCooldown());
    db.querySelector('.dcd').textContent = dcd > 0 ? (dcd >= 1 ? Math.ceil(dcd) : dcd.toFixed(1)) : '';

    this.sbSlots.forEach((s, i) => {
      const sk = game.skills[i];
      if (!sk) return;
      let frac = 0, label = '';
      if (sk.key === 'frostBarrier') {
        frac = sk.stacks >= maxStacks(sk) ? 0 : 1 - sk.stackTimer / (sk.stackNeed || 1);
        s.querySelector('.sb-stack').textContent = sk.stacks;
      } else if (sk.key === 'triggerKill') {
        // 목표치까지의 진행률 (%)
        const goal = triggerGoal(sk);
        s.querySelector('.sb-stack').textContent = goal > 0 ? `${Math.floor(Math.min(1, sk.stacks / goal) * 100)}%` : '-';
      } else if (sk.key === 'enchant') {
        // 목표 경험치까지의 진행률 (%)
        s.querySelector('.sb-stack').textContent = `${Math.floor(Math.min(1, (sk.xpAcc || 0) / enchantReq(sk)) * 100)}%`;
      } else if (sk.def.passive) {
        frac = 0;
      } else if (sk.flame) {
        frac = 0;
        label = sk.flame.t.toFixed(1);
      } else if (sk.cd > 0) {
        frac = sk.cd / (sk.cdMax || 1);
        label = sk.cd >= 1 ? Math.ceil(sk.cd) : sk.cd.toFixed(1);
      }
      s.style.setProperty('--cd', frac);
      s.querySelector('.sb-cd').textContent = label;
      s.classList.toggle('active-skill', !!sk.flame);
      s.classList.toggle('nomana', !sk.def.passive && pl.mana < avg(getStats(sk).manaCost));
    });
  }
}
