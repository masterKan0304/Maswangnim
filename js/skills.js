import { SUBJECTS, SUBJECT_ORDER, BASE_SENTENCE_SLOTS, MAX_SENTENCE_SLOTS } from './config.js';
import { evalNumber, isComplete } from './blocks.js';
import { game } from './state.js';

// ─────────────────────────────────────────────
//  스킬 정의
//  relevant: 스킬 창에 표시되는 스탯 / hiddenUses: 실제로 쓰지만 표시하지 않는 스탯
//  keywords: 레벨업 선택지에 보여줄 키워드 / labels: 스킬별 스탯 표시 이름
//  levelUp(st, lv): 레벨에 따른 기본 스탯 보정 / levelText(lv): 해당 레벨 도달 시 설명
// ─────────────────────────────────────────────
const pctUp = (st, key, rate, lv) => {
  const m = 1 + rate * (lv - 1);
  st[key] = { min: st[key].min * m, max: st[key].max * m };
};

export const SKILL_DEFS = {
  fireball: {
    key: 'fireball', name: '파이어볼', icon: '🔥', color: '#ff7a2e', element: 'fire', passive: false, castTime: 0.15,
    short: '커서 방향으로 화염구를 발사합니다. 적중 시 폭발해 주위 적에게 피해를 줍니다.',
    desc: '커서 방향으로 화염구를 발사합니다. 적중 시 폭발해 범위 안의 모든 적에게 피해를 줍니다. 투사체는 투사체 지속 시간 동안 날아갑니다.',
    keywords: ['화염', '효과 범위', '지속 시간', '투사체', '연쇄', '상태이상', '스킬 쿨타임'],
    base: { damage: [8, 12], duration: 1.5, projSize: 2.5, projSpeed: 6, projCount: 1, statusChance: 40, manaCost: 5, cooldown: 1.5 },
    areaFromProjSize: 6,   // 기본 폭발 범위 = 최종 투사체 크기 × 6 (3레벨부터 × 9)
    labels: { duration: '투사체 지속 시간' },
    relevant: ['damage', 'area', 'duration', 'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'statusChance', 'manaCost', 'cooldown'],
    levelUp(st, lv) { pctUp(st, 'damage', 0.4, lv); },
    levelText: (lv) => ['피해량 40% 증가', lv === 3 && '기본 폭발 범위 50% 증가 (투사체 크기 × 9)', lv === 5 && '적중 시 진행 방향으로 작은 투사체 3개가 튐'],
    extra: (sk) => [`기본 폭발 범위 = 투사체 크기 × ${sk.level >= 3 ? 9 : 6}`, '관통 시 적중할 때마다 다시 폭발', sk.level >= 5 && '적중 시 작은 투사체 3개 (크기 40% · 속도 97.5% · 지속 25% · 피해 40%, 만료 시에도 폭발)'],
  },
  frostBarrier: {
    key: 'frostBarrier', name: '냉기 보호막', icon: '🛡️', color: '#6fd3ff', element: 'ice', passive: true, maxStacks: 3,
    short: '피해를 입으면 보호막을 얻고, 주위 적에게 냉기 피해를 줍니다.',
    desc: '패시브. 쿨타임마다 스택을 1개 얻습니다. 피해를 입으면 스택을 소모해 지속 시간 동안 보호막을 얻고, 주위 효과 범위 안의 적에게 냉기 피해를 줍니다. 입은 피해는 보호막이 먼저 받습니다.',
    keywords: ['냉기', '보호막', '효과 범위', '지속 시간', '상태이상', '스킬 쿨타임', '패시브'],
    base: { damage: [3, 9], area: 40, duration: 3, shield: 10, statusChance: 80, cooldown: 10 },
    relevant: ['damage', 'area', 'shield', 'duration', 'statusChance', 'cooldown'],
    levelUp(st, lv) { pctUp(st, 'damage', 0.3, lv); pctUp(st, 'shield', 0.3, lv); },
    levelText: (lv) => ['피해량 30% · 보호막 획득량 30% 증가', lv === 3 && '최대 스택 +1 (4개)', lv === 5 && '피해를 준 적을 효과 범위의 70% 만큼 밀쳐냄'],
    extra: (sk) => [`최대 스택 ${sk.level >= 3 ? 4 : 3}`, sk.level >= 5 && '적 밀쳐내기 (효과 범위의 70%)'],
  },
  chainLightning: {
    key: 'chainLightning', name: '연쇄 번개', icon: '⚡', color: '#ffe066', element: 'lightning', passive: false, castTime: 0.1,
    short: '가장 가까운 적에게 번개를 쏘고, 다른 적들에게 연쇄됩니다.',
    desc: '가장 가까운 적에게 번개를 내보낸 뒤, 대상 주변의 무작위 적에게 연쇄 횟수만큼 이어집니다. 연쇄 대상만 피해를 입습니다. (투사체 아님)',
    keywords: ['번개', '연쇄', '투사체', '상태이상', '스킬 쿨타임'],
    base: { damage: [1, 15], range: 30, chains: 3, projCount: 1, projSize: 1, projSpeed: 6, statusChance: 40, manaCost: 6, cooldown: 2 },
    labels: { projCount: '번개 줄기 수', projSize: '번개 굵기', projSpeed: '연쇄 속도' },
    relevant: ['damage', 'chains', 'projCount', 'projSize', 'projSpeed', 'statusChance', 'manaCost', 'cooldown'],
    hiddenUses: ['range'],
    levelUp(st, lv) { pctUp(st, 'damage', 0.4, lv); if (lv >= 3) st.chains = { min: 6, max: 6 }; },
    levelText: (lv) => ['피해량 40% 증가', lv === 3 && '기본 연쇄 횟수 6회', lv === 5 && '번개 줄기에 닿은 적도 피해를 입음'],
    extra: (sk) => [sk.level >= 5 && '번개 줄기에 닿은 적도 피해'],
  },
  iceball: {
    key: 'iceball', name: '아이스볼', icon: '❄️', color: '#9fe6ff', element: 'ice', passive: false, castTime: 0.2,
    contactDamage: [1, 2], tick: 0.2, fireInterval: 0.1, contactChanceRatio: 2 / 3,
    short: '사거리 내 무작위 위치에 아이스볼을 생성합니다. 아이스볼은 주위에 얼음 투사체를 흩뿌려 적중 시 피해를 줍니다.',
    desc: '사거리 내 무작위 위치에 아이스볼을 설치합니다. 아이스볼은 방향을 바꾸며 얼음 투사체를 흩뿌리고(처음 적중한 적에게만 피해), 닿은 적에게 0.2초마다 접촉 피해를 줍니다.',
    keywords: ['냉기', '효과 범위', '지속 시간', '투사체', '연쇄', '상태이상', '스킬 쿨타임'],
    base: { damage: [4, 7], area: 4.5, range: 25, duration: 6, projDuration: 0.75, projSize: 1, projSpeed: 6, projCount: 1, statusChance: 30, manaCost: 10, cooldown: 10 },
    labels: { duration: '아이스볼 지속 시간' },
    relevant: ['damage', 'area', 'duration', 'projDuration', 'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'statusChance', 'manaCost', 'cooldown'],
    hiddenUses: ['range'],
    levelUp(st, lv) { pctUp(st, 'damage', 0.4, lv); },
    levelText: (lv) => ['피해량 40% 증가', lv === 3 && '투사체가 30°씩 회전하며 반대 방향으로도 1개 추가 발사', lv === 5 && '아이스볼을 무작위 위치에 하나 더 생성'],
    extra: (sk) => ['접촉 피해 1~2 / 0.2초 (피해량 비율 적용)', '접촉 시 상태이상 확률 = 발생율의 2/3', `발사 각도 ${sk.level >= 3 ? 30 : 36}°${sk.level >= 3 ? ' · 반대 방향 추가 발사' : ''}`, sk.level >= 5 && '아이스볼 2개 생성'],
  },
  magnet: {
    key: 'magnet', name: '자석', icon: '🧲', color: '#ff6b8a', element: null, passive: false, castTime: 0.1,
    short: '주위의 경험치와 떨어진 블록을 끌어당깁니다.',
    desc: '사거리(반경) 안의 경험치와 떨어진 블록, 블록 상자를 자신에게 끌어당깁니다. 인벤토리에서 직접 버린 블록은 제외됩니다.',
    keywords: ['스킬 쿨타임'],
    base: { range: 50, manaCost: 10, cooldown: 15 },
    relevant: ['manaCost', 'cooldown'],
    hiddenUses: ['range'],
    levelUp(st, lv) {
      const m = (1 + 0.3 * (lv - 1)) * (lv >= 5 ? 2 : 1);
      st.range = { min: st.range.min * m, max: st.range.max * m };
      if (lv >= 3) st.cooldown = { min: 10, max: 10 };
    },
    levelText: (lv) => ['기본 사거리 30% 증가', lv === 3 && '기본 쿨타임 10초', lv === 5 && '기본 사거리 2배'],
    extra: (sk) => [`끌어당기는 반경 ${Math.round(baseStats(sk).range.min)}`],
  },
  fireAura: {
    key: 'fireAura', name: '화염의 기운', icon: '☄️', color: '#ff5a2a', element: 'fire', passive: true,
    short: '화상 상태인 적을 처치하면 폭발이 일어납니다.',
    desc: '패시브. 화상 상태인 적을 처치하면 그 자리에서 폭발이 일어나 효과 범위 안의 적에게 화염 피해를 줍니다.',
    keywords: ['화염', '효과 범위', '상태이상', '패시브'],
    base: { damage: [4, 8], area: 20, statusChance: 60 },
    relevant: ['damage', 'area', 'statusChance'],
    levelUp(st, lv) { pctUp(st, 'damage', 0.4, lv); if (lv >= 3) st.area = { min: st.area.min * 1.3, max: st.area.max * 1.3 }; },
    levelText: (lv) => ['피해량 40% 증가', lv === 3 && '기본 폭발 범위 30% 증가', lv === 5 && '처치된 적의 남은 화상 피해를 폭발 피해에 추가'],
    extra: (sk) => [sk.level >= 5 && '남은 화상 피해를 폭발 피해에 추가'],
  },
  frostAura: {
    key: 'frostAura', name: '냉기의 기운', icon: '🌨️', color: '#8fe3ff', element: 'ice', passive: true,
    short: '둔화 상태인 적을 처치하면 얼음 투사체가 사방으로 흩뿌려집니다.',
    desc: '패시브. 둔화 상태인 적을 처치하면 그 자리에서 얼음 투사체가 사방으로 흩뿌려져 각각 냉기 피해를 줍니다. 투사체 개수에 따라 발사각이 균등하게 나뉩니다.',
    keywords: ['냉기', '지속 시간', '투사체', '연쇄', '상태이상', '패시브'],
    base: { damage: [3, 12], duration: 0.5, projSize: 1.5, projSpeed: 9, projCount: 10, statusChance: 30 },
    labels: { duration: '투사체 지속 시간' },
    relevant: ['damage', 'duration', 'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'statusChance'],
    levelUp(st, lv) {
      pctUp(st, 'damage', 0.4, lv);
      if (lv >= 3) st.projCount = { min: 12, max: 12 };
      if (lv >= 5) st.pierce = { min: 2, max: 2 };
    },
    levelText: (lv) => ['피해량 40% 증가', lv === 3 && '기본 투사체 개수 12개', lv === 5 && '기본 관통 횟수 2회'],
  },
  enchant: {
    key: 'enchant', name: '효과 부여', icon: '✨', color: '#ffd45a', element: null, passive: true,
    xpReq: 10, heal: 2, mana: 4,
    short: '경험치를 일정량 얻을 때마다 보호막 / 마나 회복 / 체력 회복 중 하나를 얻습니다.',
    desc: '패시브. 경험치를 요구량만큼 얻을 때마다 무작위로 [지속 시간 동안 보호막 획득 · 마나 회복 · 체력 회복] 중 하나가 발동합니다.',
    keywords: ['보호막', '지속 시간', '마나', '회복', '패시브'],
    base: { shield: 3, duration: 3 },
    relevant: ['shield', 'duration'],
    levelText: (lv) => ['경험치 요구량 1 감소', lv === 3 && '보호막 획득량 · 마나 회복량 · 체력 회복량 50% 증가', lv === 5 && '효과가 발동할 때 다른 효과 하나를 추가로 얻음'],
    levelUp(st, lv) { if (lv >= 3) st.shield = { min: st.shield.min * 1.5, max: st.shield.max * 1.5 }; },
    extra: (sk) => {
      const m = sk.level >= 3 ? 1.5 : 1;
      return [`경험치 요구량 ${enchantReq(sk)}`, `마나 회복 ${+(sk.def.mana * m).toFixed(1)}`, `체력 회복 ${+(sk.def.heal * m).toFixed(1)}`, sk.level >= 5 && '발동 시 다른 효과 하나 추가'];
    },
  },
  triggerKill: {
    key: 'triggerKill', name: '발동 : 처치', icon: '💀', color: '#c07cff', element: null, passive: true, payload: true,
    short: '적을 처치해 중첩을 모으면, 장착된 문장의 효과를 다음 공격 스킬에 적용합니다.',
    desc: '패시브. 적 처치 시 그 적 체력의 20% 만큼 중첩을 얻습니다. 중첩이 목표치(장착된 완성 문장 1개당 50)에 도달하면 소모하고, 지속 시간 동안 버프를 얻습니다. 버프 중 다음 공격 스킬을 사용하면 이 스킬에 장착된 문장들의 효과가 그 스킬에 함께 적용됩니다. (이 스킬의 문장은 자신에게는 적용되지 않음)',
    keywords: ['처치', '중첩', '문장', '지속 시간', '패시브'],
    base: { duration: 4 },
    relevant: ['duration'],
    levelText: (lv) => ['문장 1개당 중첩 목표치 3 감소', lv === 3 && '장착된 문장의 효과 20% 증가', lv === 5 && '목표치 도달 시 다음 3회의 공격 스킬에 적용'],
    extra: (sk) => [`목표치 ${triggerGoal(sk)} (문장 1개당 ${triggerPer(sk)})`, `현재 중첩 ${Math.floor(sk.stacks)}`, sk.level >= 3 && '문장 효과 20% 증가', sk.level >= 5 && '다음 3회 공격 스킬에 적용'],
  },
  flamethrower: {
    key: 'flamethrower', name: '화염 방사', icon: '🌋', color: '#ff6a1a', element: 'fire', passive: false, castTime: 0.1,
    tick: 0.25, turnSpeed: 60,
    short: '가장 가까운 적을 향해 부채꼴 불길을 지속 시간 동안 방사합니다.',
    desc: '가장 가까운 적을 향해 지속 시간 동안 부채꼴 불길을 방사해 0.25초마다 피해를 줍니다. 불길은 초당 60°로 가장 가까운 적을 향해 회전합니다. 지속 시간이 끝난 뒤에 쿨타임이 돌기 시작합니다. (효과 범위 = 불길 길이)',
    keywords: ['화염', '효과 범위', '지속 시간', '상태이상', '스킬 쿨타임'],
    base: { damage: [1, 3], area: 20, duration: 2.5, statusChance: 40, manaCost: 8, cooldown: 2.5 },
    labels: { area: '불길 길이' },
    relevant: ['damage', 'area', 'duration', 'statusChance', 'manaCost', 'cooldown'],
    levelUp(st, lv) { pctUp(st, 'damage', 0.4, lv); if (lv >= 3) st.area = { min: 28, max: 28 }; },
    levelText: (lv) => ['피해량 40% 증가', lv === 3 && '부채꼴 각도 150°, 기본 불길 길이 28', lv === 5 && '불길에 맞은 적은 화염 피해를 5%씩 더 받음 (최대 50%)'],
    extra: (sk) => [`부채꼴 각도 ${sk.level >= 3 ? 150 : 90}°`, '회전 속도 초당 60°', '0.25초마다 피해', sk.level >= 5 && '맞은 적의 화염 피해 +5%씩 (최대 50%)'],
  },
};
export const SKILL_ORDER = ['fireball', 'frostBarrier', 'chainLightning', 'iceball', 'magnet', 'fireAura', 'frostAura', 'enchant', 'triggerKill', 'flamethrower'];
export const ATTACK_SKILLS = ['fireball', 'chainLightning', 'iceball', 'flamethrower'];
export const enchantReq = (sk) => Math.max(1, sk.def.xpReq - (sk.level - 1));
export const triggerPer = (sk) => Math.max(1, 50 - 3 * (sk.level - 1));
export const completeSentences = (sk) => sk.sentences.slice(0, sk.maxSlots).filter((s) => s && isComplete(s));
export const triggerGoal = (sk) => completeSentences(sk).length * triggerPer(sk);

export function createSkill(key) {
  return {
    key, def: SKILL_DEFS[key], level: 1, maxSlots: BASE_SENTENCE_SLOTS,
    sentences: new Array(MAX_SENTENCE_SLOTS).fill(null),
    auto: true, cd: 0, cdMax: 1,
    stacks: 0, stackTimer: 0, stackNeed: 0,
  };
}

export const maxStacks = (sk) => (sk.def.maxStacks || 0) + (sk.key === 'frostBarrier' && sk.level >= 3 ? 1 : 0);
export const statLabel = (def, k) => (def.labels && def.labels[k]) || SUBJECTS[k].name;
export const skillUses = (def, k) => def.relevant.includes(k) || (def.hiddenUses || []).includes(k);
export const shownStats = (def) => def.relevant.filter((k) => !SUBJECTS[k].hidden);
export const extraLines = (sk) => (typeof sk.def.extra === 'function' ? sk.def.extra(sk) : sk.def.extra || []).filter(Boolean);

// ─────────────────────────────────────────────
//  스탯 계산 (모든 스탯은 {min, max} 구간)
// ─────────────────────────────────────────────
const iv = (v) => (Array.isArray(v) ? { min: v[0], max: v[1] } : { min: v, max: v });

export function areaFactor(skill, level = skill.level) {
  const f = skill.def.areaFromProjSize;
  return f ? (level >= 3 ? f * 1.5 : f) : 0;
}

export function baseStats(skill, level = skill.level) {
  const d = skill.def;
  const st = {};
  for (const k of SUBJECT_ORDER) st[k] = iv(d.base[k] ?? (k === 'castSpeed' ? 1 : 0));
  if (d.levelUp) d.levelUp(st, level);
  const f = areaFactor(skill, level);
  if (f) st.area = { min: st.projSize.min * f, max: st.projSize.max * f };
  return st;
}

function clampStat(key, x) {
  const def = SUBJECTS[key];
  let v = Math.max(def.min, x);
  if (def.max != null) v = Math.min(def.max, v);
  return v;
}

export function applyEffect(stats, subj, val, change) {
  const s = stats[subj];
  let lo, hi;
  if (SUBJECTS[subj].pctOnly) {
    // 상태이상 발생율: %p 단위로 더하기/빼기/고정 (40% + 20% 증가 = 60%)
    const k = val.pct ? 100 : 1;
    const a = val.min * k, b = val.max * k;
    if (change === 'inc') { lo = s.min + a; hi = s.max + b; }
    else if (change === 'dec') { lo = s.min - a; hi = s.max - b; }
    else { lo = a; hi = b; }
  } else if (val.pct) {
    if (change === 'inc') { lo = s.min * (1 + val.min); hi = s.max * (1 + val.max); }
    else if (change === 'dec') { lo = s.min * (1 - val.min); hi = s.max * (1 - val.max); }
    else { lo = s.min * val.min; hi = s.max * val.max; }
  } else {
    if (change === 'inc') { lo = s.min + val.min; hi = s.max + val.max; }
    else if (change === 'dec') { lo = s.min - val.min; hi = s.max - val.max; }
    else { lo = val.min; hi = val.max; }
  }
  lo = clampStat(subj, lo); hi = clampStat(subj, hi);
  stats[subj] = { min: Math.min(lo, hi), max: Math.max(lo, hi) };
}

// 장착된 문장 순서대로 적용
// extra: 추가로 적용할 문장 (발동 : 처치 버프), scale: 추가 문장 수치 배율
function runSentences(skill, stats, extra = [], scale = 1) {
  const log = [];
  const d = skill.def;
  // 발동 : 처치 처럼 문장이 자신에게 적용되지 않는 스킬
  const own = d.payload ? [] : skill.sentences.slice(0, skill.maxSlots).map((s, i) => ({ s, i, k: 1 }));
  const list = own.concat(extra.map((s, j) => ({ s, i: 100 + j, k: scale })));
  for (const { s, i, k } of list) {
    if (!s) continue;
    if (!isComplete(s)) { log.push({ i, ok: false }); continue; }
    const subj = s.slots[0].block.key;
    const change = s.slots[2].block.key;
    let val = s.template === 'SNC'
      ? evalNumber(s.slots[1].block)
      : { ...stats[s.slots[1].block.key], pct: false };
    if (k !== 1) val = { ...val, min: val.min * k, max: val.max * k };
    // 백분율 전용 스탯에 백분율이 아닌 수치 (연산 결과 포함)
    if (s.template === 'SNC' && SUBJECTS[subj].pctOnly && !val.pct) { log.push({ i, ok: false, reason: '백분율만 가능' }); continue; }
    // 스킬에 없는 키워드 → 적용되지 않음
    if (!skillUses(d, subj)) { log.push({ i, ok: true, na: true, subj }); continue; }
    const before = { ...stats[subj] };
    applyEffect(stats, subj, val, change);
    // 아이스볼: 지속 시간 변화가 투사체 지속 시간에도 똑같이 적용
    if (subj === 'duration' && skillUses(d, 'projDuration')) applyEffect(stats, 'projDuration', val, change);
    log.push({ i, ok: true, subj, before, after: { ...stats[subj] } });
  }
  return log;
}

export function computeStats(skill, extra = [], scale = 1) {
  const base = baseStats(skill);
  let stats = { ...base };
  let log = runSentences(skill, stats, extra, scale);
  // 파이어볼: 기본 폭발 범위를 최종 투사체 크기 × 배율로 다시 잡고 문장을 재적용
  const f = areaFactor(skill);
  if (f) {
    const ps = stats.projSize;
    stats = { ...base, area: { min: ps.min * f, max: ps.max * f } };
    log = runSentences(skill, stats, extra, scale);
  }
  return { stats, log };
}

export function getResult(skill) {
  if (skill._ver !== game.version || !skill._res) {
    skill._res = computeStats(skill);
    skill._ver = game.version;
  }
  return skill._res;
}
export const getStats = (skill) => getResult(skill).stats;

// ─────────────────────────────────────────────
//  표시 / 샘플링
// ─────────────────────────────────────────────
export function fmtNum(key, x) {
  if (key === 'damage') return Math.floor(x);           // UI 에서는 소수점 버림
  if (SUBJECTS[key].int) return Math.round(x);
  return Math.round(x * 100) / 100;
}
export function fmtStat(key, v) {
  const a = fmtNum(key, v.min), b = fmtNum(key, v.max);
  const u = SUBJECTS[key].unit || '';
  return (a === b ? `${a}` : `${a}~${b}`) + u;
}
export const sample = (v) => v.min + Math.random() * (v.max - v.min);
export const sampleInt = (v) => Math.round(sample(v));
export const avg = (v) => (v.min + v.max) / 2;
// 상태이상 확률 (0~1)
export const statusProb = (st, ratio = 1) => ((sample(st.statusChance) + game.mods.statusAdd) / 100) * ratio;
