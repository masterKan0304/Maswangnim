import { ic } from './icons.js';
import { game, bump } from './state.js';
import { MAX_SKILLS, MAX_SKILL_LEVEL, MAX_SENTENCE_SLOTS, SUBJECTS, ELEMENTS } from './config.js';
import { SKILL_DEFS, SKILL_ORDER, createSkill, baseStats, fmtStat } from './skills.js';

const elemTag = (d) => (d.element ? `<span class="elem e-${d.element}">${ELEMENTS[d.element].name}</span> ` : '');
const keywordHTML = (d) => `<div class="kw-list">${d.keywords.map((k) => `<span class="kw">${k}</span>`).join('')}</div>`;

// 선택지 → 표시용 객체. id 는 리롤 중복 방지용 (같은 유형+대상이면 같은 id)
function describe(c) {
  if (c.type === 'skill') {
    const d = SKILL_DEFS[c.key];
    return {
      id: `skill:${c.key}`, icon: d.icon, tag: `${elemTag(d)}새 스킬${d.passive ? ' · 패시브' : ''}`, title: `스킬 획득 - ${d.name}`,
      desc: d.short, detail: keywordHTML(d), tip: `<div class="tip-title">${d.icon} ${d.name}</div><div>${d.short}</div>${keywordHTML(d)}`,
      apply() { game.skills.push(createSkill(c.key)); bump(); },
    };
  }
  if (c.type === 'level') {
    const sk = c.sk, d = sk.def, nl = sk.level + 1;
    const a = baseStats(sk, sk.level), b = baseStats(sk, nl);
    const lines = d.levelText(nl).filter(Boolean);
    const diffs = [];
    for (const k of ['damage', 'shield', 'area', 'range', 'chains', 'projCount', 'pierce', 'cooldown']) {
      const x = fmtStat(k, a[k]), y = fmtStat(k, b[k]);
      if (x !== y) diffs.push(`기본 ${SUBJECTS[k].name} ${x} → <b>${y}</b>`);
    }
    const milestone = lines.slice(1).map((l) => `<div class="lu-mile">★ Lv.${nl}: ${l}</div>`).join('');
    return {
      id: `level:${d.key}`, icon: d.icon, tag: `Lv.${sk.level} → Lv.${nl}`, title: `${d.name} 레벨 업`,
      desc: lines[0] + milestone,
      detail: diffs.join('<br>') || '능력이 강화됩니다.',
      apply() { sk.level++; bump(); },
    };
  }
  if (c.type === 'slot') {
    const sk = c.sk;
    return {
      id: `slot:${sk.key}`, icon: ic('puzzle'), tag: sk.def.name, title: '문장 블록 최대치 +1',
      desc: `${sk.def.name}에 장착할 수 있는 문장 블록 수가 1 증가합니다.`,
      detail: `문장 슬롯 ${sk.maxSlots} → <b>${sk.maxSlots + 1}</b> (최대 ${MAX_SENTENCE_SLOTS})`,
      apply() { sk.maxSlots++; bump(); },
    };
  }
  return {
    id: 'pickBlock', type: 'pickBlock', icon: ic('gift'), tag: '블록', title: '블록 선택 획득',
    desc: '무작위 블록 3개 중 하나를 골라 얻습니다.',
    detail: '블록 종류는 무작위입니다.',
    apply() {},
  };
}

// exclude: 직전에 보였던 선택지 id — 가능한 한 다시 나오지 않게 함
export function rollChoices(exclude = new Set()) {
  const pool = [];
  for (const key of SKILL_ORDER) {
    if (!game.skills.some((s) => s.key === key) && game.skills.length < MAX_SKILLS) pool.push({ type: 'skill', key, w: 1.2 });
  }
  for (const sk of game.skills) {
    if (sk.level < MAX_SKILL_LEVEL) pool.push({ type: 'level', sk, w: 1 });
    if (sk.maxSlots < MAX_SENTENCE_SLOTS) pool.push({ type: 'slot', sk, w: 0.8 });
  }
  pool.push({ type: 'pickBlock', w: 1 });

  const all = pool.map((c) => ({ ...describe(c), w: c.w }));
  const fresh = all.filter((c) => !exclude.has(c.id));
  const stale = all.filter((c) => exclude.has(c.id));
  const picks = [];
  for (const src of [fresh, stale]) {
    while (picks.length < 3 && src.length) {
      const total = src.reduce((s, c) => s + c.w, 0);
      let r = Math.random() * total;
      let idx = 0;
      for (; idx < src.length; idx++) { r -= src[idx].w; if (r <= 0) break; }
      picks.push(src.splice(Math.min(idx, src.length - 1), 1)[0]);
    }
  }
  return picks;
}
