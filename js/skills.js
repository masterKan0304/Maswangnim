import { ic } from './icons.js';
import { SUBJECTS, SUBJECT_ORDER, BASE_SENTENCE_SLOTS, MAX_SENTENCE_SLOTS, CHANGES, ELEMENTS, DAMAGE_EXTRA, STAT_DEFAULTS, ELEMENT_DMG, ZONE_BASE_AREA } from './config.js';
import { evalNumber, isComplete, fmtValue } from './blocks.js';
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
const dmgUp40 = (st, lv) => pctUp(st, 'damage', 0.4, lv);

export const SKILL_DEFS = {
  fireball: {
    key: 'fireball', name: '파이어볼', icon: ic('fire'), color: '#ff7a2e', element: 'fire', passive: false, castTime: 0.15, projectile: true,
    short: '가장 가까운 적에게 화염구를 발사합니다. 적중하면 폭발합니다.',
    desc: '가장 가까운 적에게 화염구를 발사합니다. 적중하면 폭발해 주위 적에게 피해를 줍니다.',
    keywords: ['화염', '효과 범위', '지속 시간', '투사체', '연쇄', '상태이상', '스킬 쿨타임'],
    base: { damage: [8, 12], duration: 1.5, projSize: 10, projSpeed: 6, projCount: 1, statusChance: 40, manaCost: 5, cooldown: 1.5 },
    areaFromProjSize: 1.5,   // 기본 폭발 범위 = 최종 투사체 크기 × 1.5 (3레벨부터 × 2.25) — 실제 크기로는 투사체의 6배 / 9배
    labels: { duration: '투사체 지속 시간' },
    relevant: ['damage', 'area', 'duration', 'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'statusChance', 'manaCost', 'cooldown'],
    levelUp: dmgUp40,
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '기본 폭발 범위가 50% 증가합니다.', lv === 5 && '적중하면 작은 화염구 3개가 앞으로 튑니다.'],
    extra: (sk) => [`폭발 범위는 실제 투사체 크기의 ${sk.level >= 3 ? 9 : 6}배입니다.`, sk.level >= 5 && '적중하면 작은 화염구 3개가 튑니다.'],
  },
  frostBarrier: {
    key: 'frostBarrier', name: '냉기 보호막', icon: ic('shield'), color: '#6fd3ff', element: 'ice', passive: true, maxStacks: 3,
    short: '피해를 입으면 보호막을 얻고 주위에 냉기 피해를 줍니다.',
    desc: '쿨타임마다 스택을 얻습니다. 피해를 입으면 스택을 소모해 보호막을 얻고 주위 적에게 냉기 피해를 줍니다.',
    keywords: ['냉기', '보호막', '효과 범위', '지속 시간', '상태이상', '스킬 쿨타임', '패시브'],
    base: { damage: [3, 9], area: 40, duration: 3, shield: 10, statusChance: 80, cooldown: 10 },
    relevant: ['damage', 'area', 'shield', 'duration', 'statusChance', 'cooldown'],
    levelUp(st, lv) { pctUp(st, 'damage', 0.3, lv); pctUp(st, 'shield', 0.3, lv); },
    levelText: (lv) => ['피해량과 보호막 획득량이 30% 증가합니다.', lv === 3 && '최대 스택이 1 증가합니다.', lv === 5 && '피해를 준 적을 밀쳐냅니다.'],
    extra: (sk) => [`최대 스택은 ${sk.level >= 3 ? 4 : 3}개입니다.`, sk.level >= 5 && '피해를 준 적을 밀쳐냅니다.'],
  },
  iceball: {
    key: 'iceball', name: '아이스볼', icon: ic('snowflake'), color: '#9fe6ff', element: 'ice', passive: false, castTime: 0.2, projectile: true,
    contactDamage: [1, 2], tick: 0.2, fireInterval: 0.1, contactChanceRatio: 2 / 3,
    short: '무작위 위치에 아이스볼을 만듭니다. 아이스볼은 주위에 얼음 투사체를 흩뿌립니다.',
    desc: '사거리 안 무작위 위치에 아이스볼을 만듭니다. 아이스볼은 얼음 투사체를 흩뿌리고, 닿은 적에게도 피해를 줍니다.',
    keywords: ['냉기', '효과 범위', '지속 시간', '투사체', '연쇄', '상태이상', '스킬 쿨타임'],
    areaUnit: 50,   // 아이스볼 구체 크기는 수치 10 = 실제 0.2 (다른 스킬 효과 범위와 비슷한 자릿수)
    base: { damage: [4, 7], area: 45, range: 25, duration: 6, projDuration: 0.75, projSize: 4, projSpeed: 6, projCount: 1, statusChance: 30, manaCost: 10, cooldown: 10 },
    labels: { duration: '아이스볼 지속 시간' },
    relevant: ['damage', 'area', 'duration', 'projDuration', 'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'statusChance', 'manaCost', 'cooldown'],
    hiddenUses: ['range'],
    levelUp: dmgUp40,
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '투사체를 더 촘촘히, 반대 방향으로도 발사합니다.', lv === 5 && '아이스볼을 하나 더 만듭니다.'],
    extra: (sk) => ['아이스볼에 닿은 적도 피해를 입습니다.', sk.level >= 3 && '반대 방향으로도 투사체를 발사합니다.', sk.level >= 5 && '아이스볼을 2개 만듭니다.'],
  },
  magnet: {
    key: 'magnet', name: '자석', icon: ic('magnet'), color: '#ff6b8a', element: null, passive: false, castTime: 0.1,
    short: '주위의 경험치와 떨어진 블록을 끌어당깁니다.',
    desc: '주위의 경험치, 블록, 블록 상자를 끌어당깁니다. 직접 버린 블록은 끌어당기지 않습니다.',
    keywords: ['스킬 쿨타임'],
    base: { range: 50, manaCost: 10, cooldown: 15 },
    relevant: ['manaCost', 'cooldown'],
    hiddenUses: ['range'],
    levelUp(st, lv) {
      const m = (1 + 0.3 * (lv - 1)) * (lv >= 5 ? 2 : 1);
      st.range = { min: st.range.min * m, max: st.range.max * m };
      if (lv >= 3) st.cooldown = { min: 10, max: 10 };
    },
    levelText: (lv) => ['끌어당기는 범위가 30% 증가합니다.', lv === 3 && '기본 쿨타임이 10초가 됩니다.', lv === 5 && '끌어당기는 범위가 2배가 됩니다.'],
    extra: (sk) => [`끌어당기는 범위는 ${Math.round(baseStats(sk).range.min)}입니다.`],
  },
  fireAura: {
    key: 'fireAura', name: '화염의 기운', icon: ic('meteor'), color: '#ff5a2a', element: 'fire', passive: true,
    short: '화상 상태인 적을 처치하면 폭발이 일어납니다.',
    desc: '화상 상태인 적을 처치하면 그 자리에서 폭발해 주위 적에게 화염 피해를 줍니다.',
    keywords: ['화염', '효과 범위', '상태이상', '패시브'],
    base: { damage: [4, 8], area: 20, statusChance: 60 },
    relevant: ['damage', 'area', 'statusChance'],
    levelUp(st, lv) { dmgUp40(st, lv); if (lv >= 3) st.area = { min: st.area.min * 1.3, max: st.area.max * 1.3 }; },
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '기본 폭발 범위가 30% 증가합니다.', lv === 5 && '남은 화상 피해가 폭발 피해에 더해집니다.'],
    extra: (sk) => [sk.level >= 5 && '남은 화상 피해가 폭발 피해에 더해집니다.'],
  },
  frostAura: {
    key: 'frostAura', name: '냉기의 기운', icon: ic('snowcloud'), color: '#8fe3ff', element: 'ice', passive: true, projectile: true,
    short: '둔화 상태인 적을 처치하면 얼음 투사체가 사방으로 퍼집니다.',
    desc: '둔화 상태인 적을 처치하면 그 자리에서 얼음 투사체가 사방으로 퍼집니다.',
    keywords: ['냉기', '지속 시간', '투사체', '연쇄', '상태이상', '패시브'],
    base: { damage: [3, 12], duration: 0.5, projSize: 6, projSpeed: 9, projCount: 10, statusChance: 30 },
    labels: { duration: '투사체 지속 시간' },
    relevant: ['damage', 'duration', 'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'statusChance'],
    levelUp(st, lv) {
      dmgUp40(st, lv);
      if (lv >= 3) st.projCount = { min: 12, max: 12 };
      if (lv >= 5) st.pierce = { min: 2, max: 2 };
    },
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '기본 투사체 개수가 12개가 됩니다.', lv === 5 && '기본 관통 횟수가 2회가 됩니다.'],
  },
  snowfall: {
    key: 'snowfall', name: '낙석', icon: ic('snowball'), color: '#c8f2ff', element: 'ice', passive: false, castTime: 0.15,
    short: '체력이 가장 높은 적에게 커다란 눈덩이를 떨어뜨립니다.',
    desc: '사거리 안에서 체력이 가장 높은 적에게 눈덩이를 떨어뜨립니다. 범위 안의 적은 피해를 입고 밀려납니다.',
    keywords: ['냉기', '효과 범위', '연쇄', '상태이상', '스킬 쿨타임'],
    base: { damage: [8, 21], area: 25, range: 40, statusChance: 80, manaCost: 12, cooldown: 6 },
    relevant: ['damage', 'area', 'chains', 'statusChance', 'manaCost', 'cooldown'],
    hiddenUses: ['range'],
    levelUp(st, lv) { dmgUp40(st, lv); if (lv >= 3) st.area = { min: st.area.min * 1.5, max: st.area.max * 1.5 }; },
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '기본 범위가 50% 증가합니다.', lv === 5 && '박힌 눈덩이가 잠시 후 한 번 더 폭발합니다.'],
    extra: (sk) => ['연쇄하면 같은 자리에 눈덩이가 다시 떨어집니다.', sk.level >= 5 && '박힌 눈덩이가 0.75초 후 폭발합니다.'],
  },
  enchant: {
    key: 'enchant', name: '효과 부여', icon: ic('sparkle'), color: '#ffd45a', element: null, passive: true,
    xpReq: 10, heal: 2, mana: 4,
    short: '경험치를 모을 때마다 보호막, 마나, 체력 중 하나를 얻습니다.',
    desc: '경험치를 일정량 얻을 때마다 보호막, 마나 회복, 체력 회복 중 하나가 발동합니다.',
    keywords: ['보호막', '지속 시간', '마나', '회복', '패시브'],
    base: { shield: 3, duration: 3 },
    relevant: ['shield', 'duration'],
    levelText: (lv) => ['필요한 경험치가 1 감소합니다.', lv === 3 && '보호막, 마나, 체력 회복량이 50% 증가합니다.', lv === 5 && '발동할 때 다른 효과 하나를 더 얻습니다.'],
    levelUp(st, lv) { if (lv >= 3) st.shield = { min: st.shield.min * 1.5, max: st.shield.max * 1.5 }; },
    extra: (sk) => {
      const m = sk.level >= 3 ? 1.5 : 1;
      return [`경험치 ${enchantReq(sk)}마다 발동합니다.`, `마나 ${+(sk.def.mana * m).toFixed(1)}, 체력 ${+(sk.def.heal * m).toFixed(1)}을 회복합니다.`, sk.level >= 5 && '발동할 때 효과를 하나 더 얻습니다.'];
    },
  },
  triggerKill: {
    key: 'triggerKill', name: '발동 : 처치', icon: ic('skull'), color: '#c07cff', element: null, passive: true, payload: true,
    short: '적을 처치해 중첩을 모으면, 장착된 문장을 다음 공격 스킬에 적용합니다.',
    desc: '적을 처치하면 중첩을 얻습니다. 중첩이 가득 차면 장착된 문장들이 다음 공격 스킬에 적용됩니다. 이 스킬 자신에게는 적용되지 않습니다.',
    keywords: ['처치', '중첩', '문장', '지속 시간', '패시브'],
    base: { duration: 4 },
    relevant: ['duration'],
    levelText: (lv) => ['문장 1개당 필요한 중첩이 3 감소합니다.', lv === 3 && '문장의 효과가 20% 강해집니다.', lv === 5 && '다음 3번의 공격 스킬에 적용됩니다.'],
    extra: (sk) => [`목표치는 ${triggerGoal(sk)}입니다.`, sk.level >= 3 && '문장의 효과가 20% 강해집니다.', sk.level >= 5 && '다음 3번의 공격 스킬에 적용됩니다.'],
  },
  flamethrower: {
    key: 'flamethrower', name: '화염 방사', icon: ic('flamewave'), color: '#ff6a1a', element: 'fire', passive: false, castTime: 0.1,
    tick: 0.25, turnSpeed: 60,
    short: '가장 가까운 적을 향해 부채꼴 불길을 내뿜습니다.',
    desc: '지속 시간 동안 가장 가까운 적을 향해 부채꼴 불길을 내뿜습니다. 불길이 끝나면 쿨타임이 시작됩니다.',
    keywords: ['화염', '효과 범위', '지속 시간', '상태이상', '스킬 쿨타임'],
    base: { damage: [2, 5], area: 20, duration: 2.5, statusChance: 40, manaCost: 8, cooldown: 2.5 },
    labels: { area: '불길 길이' },
    relevant: ['damage', 'area', 'duration', 'statusChance', 'manaCost', 'cooldown'],
    levelUp(st, lv) { dmgUp40(st, lv); if (lv >= 3) st.area = { min: 28, max: 28 }; },
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '불길이 더 넓고 길어집니다.', lv === 5 && '불길에 맞은 적은 화염 피해를 더 받습니다.'],
    extra: (sk) => [sk.level >= 5 && '불길에 맞은 적은 화염 피해를 최대 50% 더 받습니다.'],
  },
};
// ── 마솽 전용 스킬 ──
Object.assign(SKILL_DEFS, {
  leafCut: {
    key: 'leafCut', name: '이파리 베기', icon: ic('leafblade'), color: '#5cc85a', element: null, passive: false, castTime: 0.1, projectile: true, owner: 'masang', basic: true,
    short: '가까운 적을 향해 이파리를 날려 피해를 줍니다.',
    desc: '가까운 적을 향해 날카로운 이파리를 발사합니다. 이파리는 적중한 적에게 피해를 줍니다.',
    keywords: ['투사체', '연쇄', '스킬 쿨타임'],
    base: { damage: [6, 12], duration: 1, projSize: 6, projSpeed: 8, projCount: 1, manaCost: 3, cooldown: 1.2 },
    labels: { duration: '투사체 지속 시간' },
    relevant: ['damage', 'duration', 'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'manaCost', 'cooldown'],
    levelUp(st, lv) { dmgUp40(st, lv); if (lv >= 5) st.projCount = { min: 3, max: 3 }; },
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '이파리가 적을 따라갑니다. 여러 개면 모두 한 대상을 따라갑니다.', lv === 5 && '기본 투사체 개수가 3개가 됩니다.'],
    extra: (sk) => [sk.level >= 3 && '이파리가 한 대상을 따라갑니다.'],
  },
  nature: {
    key: 'nature', name: '자연화', icon: ic('nature'), color: '#4fbf4a', element: null, passive: false, castTime: 0.15, owner: 'masang', heal: 1,
    short: '주위 적의 생기를 흡수해 양분을 얻고, 모은 양분으로 체력을 회복합니다.',
    desc: '효과 범위 안의 적 하나당 양분을 1 얻습니다. 이 스킬로 얻은 양분 10마다 체력을 1 회복합니다.',
    keywords: ['양분', '회복', '효과 범위', '스킬 쿨타임'],
    base: { area: 40, manaCost: 8, cooldown: 6 },
    relevant: ['area', 'manaCost', 'cooldown'],
    levelUp(st, lv) { st.cooldown = { min: 6 - 0.5 * (lv - 1), max: 6 - 0.5 * (lv - 1) }; if (lv >= 3) st.area = { min: 60, max: 60 }; },
    levelText: (lv) => ['기본 스킬 쿨타임이 0.5초 줄어듭니다.', lv === 3 && '기본 효과 범위가 60이 됩니다.', lv === 5 && '적 하나당 양분을 2 얻습니다.'],
    extra: (sk) => [`적 하나당 양분 ${sk.level >= 5 ? 2 : 1}, 이 스킬로 얻은 양분 10마다 체력 1 회복`],
  },
  fruit: {
    key: 'fruit', name: '열매 맺기', icon: ic('fruit'), color: '#ff5a6e', element: null, passive: true, owner: 'masang',
    short: '꽃이 일정 수 피어날 때마다 열매가 자라 적이 많은 곳으로 던져집니다.',
    desc: '꽃이 피어날 때마다 중첩을 1 얻고, 중첩이 필요한 꽃 수(5)에 도달하면 그만큼 소모해 그 꽃에서 열매가 자랍니다. 열매가 자랄 때마다 3초간 필요한 꽃 수가 2 늘어납니다. (중첩됨) 열매는 가장 가까운 적에게 던져져 범위 안의 적에게 피해를 주고 바깥으로 밀쳐냅니다. 투사체가 늘어나면 남은 열매는 목표 주위 20 범위에 떨어집니다.',
    keywords: ['투사체', '효과 범위', '꽃', '패시브'],
    base: { damage: [15, 30], area: 25, projSpeed: 5, projCount: 1 },
    relevant: ['damage', 'area', 'projSpeed', 'projCount'],
    levelUp: dmgUp40,
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '열매가 무작위 속성(7가지 중 하나)을 띠고, 기본 피해의 40%만큼 그 속성 피해를 더 줍니다.', lv === 5 && '기본 필요한 꽃 수가 3이 됩니다.'],
    extra: (sk) => [`꽃 중첩 ${sk.stacks} / ${fruitNeed(sk)} (열매가 자랄 때마다 3초간 필요한 꽃 +2)`, sk.level >= 3 && '열매가 화염 · 냉기 · 자연 · 해양 · 대지 · 칠흑 · 광휘 중 무작위 속성을 띱니다.'],
  },
  pineWind: {
    key: 'pineWind', name: '솔바람', icon: ic('wind'), color: '#9fe8c0', element: null, passive: false, castTime: 0.1, projectile: true, owner: 'masang',
    short: '적을 관통하고 지형에 튕기는 솔바람을 내보냅니다. 꽃에 닿으면 꽃이 강하게 터집니다.',
    desc: '가까운 적을 향해 솔바람을 내보냅니다. 솔바람은 적을 관통하고 지형에 튕기며, 지나간 적을 다시 지나가면 또 피해를 줍니다. 꽃에 닿으면 꽃이 바로 터지며 효과 범위와 피해가 50% 증가합니다.',
    keywords: ['투사체', '관통', '연쇄', '꽃', '스킬 쿨타임'],
    base: { damage: [4, 12], duration: 4, projSize: 30, projSpeed: 8, projCount: 1, manaCost: 5, cooldown: 1.5 },
    labels: { duration: '투사체 지속 시간' },
    relevant: ['damage', 'duration', 'projSize', 'projSpeed', 'projCount', 'chains', 'manaCost', 'cooldown'],
    levelUp(st, lv) { dmgUp40(st, lv); if (lv >= 3) st.projCount = { min: 3, max: 3 }; if (lv >= 5) st.chains = { min: st.chains.min + 3, max: st.chains.max + 3 }; },
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '기본 투사체 개수가 3개가 됩니다.', lv === 5 && '연쇄 횟수가 3 증가하고, 처음 3번의 연쇄는 꽃을 향합니다. 꽃에 닿을 때마다 피해량과 투사체 크기가 20% 증가합니다. (투사체 크기는 최대 100%)'],
    extra: (sk) => [sk.level >= 5 && '사거리 안에 꽃이 있으면 처음 3번의 연쇄는 꽃을 향합니다.', sk.level >= 5 && '꽃에 닿을 때마다 피해량 · 투사체 크기 +20% (크기 최대 +100%, 연쇄에도 이어짐)'],
  },
  roots: {
    key: 'roots', name: '옭아매는 뿌리', icon: ic('roots'), color: '#8ab84a', element: null, passive: false, castTime: 0.15, projectile: true, owner: 'masang', rootTime: 1.5,
    short: '적을 향해 덩굴 뿌리를 뻗어 피해를 주고 속박합니다.',
    desc: '가까운 적을 향해 땅을 타고 나아가는 덩굴 뿌리를 내보냅니다. 뿌리에 닿은 적은 피해를 입고 속박 지속 시간 동안 움직이지 못합니다. 정예와 보스는 속박되지 않습니다. 지속 시간 블록은 투사체 지속 시간과 속박 지속 시간에 모두 적용됩니다.',
    keywords: ['투사체', '관통', '연쇄', '속박', '스킬 쿨타임'],
    base: { damage: [8, 16], duration: 2.5, rootDuration: 1.5, projSize: 12, projSpeed: 4, projCount: 1, pierce: 3, manaCost: 8, cooldown: 5 },
    labels: { duration: '투사체 지속 시간' },
    relevant: ['damage', 'duration', 'rootDuration', 'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'manaCost', 'cooldown'],
    levelUp: dmgUp40,
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '뿌리가 가장 가까운 적을 따라가며, 관통할 때마다 새 대상을 찾습니다.', lv === 5 && '뿌리가 처음 적을 관통할 때 뿌리 3개가 더 뻗어 나갑니다.'],
    extra: (sk) => ['닿은 적을 속박합니다. (정예 · 보스 면역)', sk.level >= 3 && '가장 가까운 적을 따라갑니다.', sk.level >= 5 && '처음 관통할 때 뿌리 3개가 더 뻗어 나갑니다.'],
  },
  strawDoll: {
    key: 'strawDoll', name: '짚 인형', icon: ic('doll'), color: '#e6c26a', element: null, passive: false, castTime: 0.15, owner: 'masang', lureArea: 50, hpRatio: 0.4,
    short: '마솽을 닮은 짚 인형을 세워 적을 끌어들이고, 시간이 지나거나 부서지면 폭발합니다.',
    desc: '사거리 안에서 적이 가장 많이 뭉쳐 있는 곳에 마솽을 본뜬 짚 인형을 세웁니다. 인형은 주위(효과 범위 50)의 적을 끌어들여 공격을 대신 받습니다. 지속 시간이 끝나거나 체력(플레이어 최대 체력의 40%)을 모두 잃으면 폭발해 주위 적에게 피해를 줍니다.',
    keywords: ['유인', '효과 범위', '지속 시간', '스킬 쿨타임'],
    base: { damage: [15, 25], area: 30, range: 60, duration: 3, manaCost: 20, cooldown: 20 },
    labels: { area: '폭발 범위' },
    relevant: ['damage', 'area', 'duration', 'manaCost', 'cooldown'],
    hiddenUses: ['range'],
    levelUp: dmgUp40,
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '인형이 적들로부터 도망칩니다.', lv === 5 && '인형을 하나 더 세웁니다.'],
    extra: (sk) => [`인형 체력: 플레이어 최대 체력의 40%`, sk.level >= 3 && '인형이 적들로부터 도망칩니다.', sk.level >= 5 && '인형을 2개 세웁니다.'],
  },
  honeyBomb: {
    key: 'honeyBomb', name: '꿀열매 폭탄', icon: ic('honey'), color: '#ffb52e', element: null, passive: false, castTime: 0.1, owner: 'masang',
    heal: 1,
    short: '머리에 열매를 이고 꿀을 모은 뒤 터뜨려 주위 적을 밀쳐내고 체력을 회복합니다.',
    desc: '지속 시간 동안 머리에 열매를 이고 꿀을 모읍니다. 모으는 동안 이동 속도가 느려지지만 0.25초마다 열매가 커지며 피해량, 효과 범위, 체력 회복량이 각각의 증가량만큼 늘어납니다. 지속 시간이 끝나거나 대시하면 열매를 터뜨려 주위 적에게 피해를 주고 밀쳐내며 체력을 회복합니다. 터뜨린 뒤 쿨타임이 시작됩니다.',
    keywords: ['효과 범위', '회복', '지속 시간', '스킬 쿨타임'],
    base: { damage: [4, 8], area: 10, duration: 2.5, honeyDmgGrow: 15, honeyAreaGrow: 20, honeyHealGrow: 0.2, manaCost: 15, cooldown: 8 },
    relevant: ['damage', 'honeyDmgGrow', 'area', 'honeyAreaGrow', 'honeyHealGrow', 'duration', 'manaCost', 'cooldown'],
    levelUp: dmgUp40,
    levelText: (lv) => ['피해량이 40% 증가합니다.', lv === 3 && '꿀을 모으는 동안 느려지는 정도가 절반이 됩니다. (10%~25%)', lv === 5 && '모은 시간 1초마다 피해와 체력 회복량이 10%씩 더 늘어납니다. (최대 100%)'],
    extra: (sk) => [`꿀을 모으는 동안 이동 속도 ${sk.level >= 3 ? '10%~25%' : '20%~50%'} 감소`, sk.level >= 5 && '모은 시간 1초마다 피해 · 회복 10% 증가'],
  },
  worldSeed: {
    key: 'worldSeed', name: '세계수의 씨앗', icon: ic('worldtree'), color: '#ffe680', element: null, passive: true, owner: 'masang',
    short: '양분을 얻을 때마다 중첩을 쌓고, 가득 차면 퍼져 나가는 고리를 따라 꽃이 만개합니다.',
    desc: '양분을 얻을 때마다 중첩을 1 얻습니다. 중첩이 100에 도달하면 마솽을 중심으로 효과 범위만큼 고리가 퍼져 나가며, 고리의 가장자리를 따라 꽃 50송이가 고르게 피어납니다. 이 꽃들은 1초 뒤 저절로 터집니다. 효과 범위가 넓을수록 고리가 빠르게 퍼집니다.',
    keywords: ['양분', '중첩', '효과 범위', '꽃', '패시브'],
    base: { area: 120, flowerCount: 50 },
    relevant: ['flowerCount', 'area'],
    levelUp(st, lv) { st.flowerCount = { min: st.flowerCount.min + 10 * (lv - 1), max: st.flowerCount.max + 10 * (lv - 1) }; },
    // 3레벨: 늘어난 효과 범위 5당 꽃 +1 (업그레이드 · 문장으로 늘어난 범위 포함)
    finalize(st, base, sk) {
      if (sk.level < 3) return;
      const add = Math.max(0, Math.floor(((st.area.min + st.area.max) / 2 - (base.area.min + base.area.max) / 2) / 5));
      st.flowerCount = { min: st.flowerCount.min + add, max: st.flowerCount.max + add };
    },
    levelText: (lv) => ['피어나는 꽃이 10송이 늘어납니다.', lv === 3 && '늘어난 효과 범위 5당 꽃이 1송이 더 핍니다.', lv === 5 && '고리가 적에게 닿으면 그 적의 자리에 꽃이 핍니다.'],
    extra: (sk) => [`중첩 ${Math.floor(sk.stacks)} / 100`, sk.level >= 5 && '고리가 닿은 적의 자리에 꽃이 핍니다.'],
  },
});

// 번개 속성 스킬(연쇄 번개 / 번개의 기운 / 번개 광선)은 목록에서 뺌 — 새 속성 스킬로 대체 예정
// 마솽 전용 스킬은 모두 자연 속성 (피해를 주는 스킬은 상태이상 발생율도 가짐)
for (const k of ['leafCut', 'nature', 'fruit', 'pineWind', 'roots', 'strawDoll', 'honeyBomb', 'worldSeed']) {
  const d = SKILL_DEFS[k];
  d.element = 'nature';
  if (!d.keywords.includes('자연')) d.keywords.unshift('자연');
  if (d.base.damage) {
    if (d.base.statusChance == null) d.base.statusChance = 25;
    if (!d.relevant.includes('statusChance')) d.relevant.push('statusChance');
  }
}
// 꿀열매 폭탄은 광휘 속성
SKILL_DEFS.honeyBomb.element = 'radiant';
SKILL_DEFS.honeyBomb.keywords = SKILL_DEFS.honeyBomb.keywords.map((w) => (w === '자연' ? '광휘' : w));

// 열매 맺기: 다음 열매에 필요한 꽃 수 (기본 5, 5레벨 3 / 열매가 자랄 때마다 3초간 +2, 중첩)
export const FRUIT_PEN_TIME = 3;
export const fruitNeed = (sk) => (sk.level >= 5 ? 3 : 5) + 2 * ((sk.fruitPen && sk.fruitPen.length) || 0);

// 세계수의 씨앗: 피어나는 꽃 수 (기본 50, 레벨마다 +10, 3레벨: 늘어난 효과 범위 5당 +1)
export function seedFlowerCount(sk) {
  const v = getStats(sk).flowerCount;
  return Math.floor((v.min + v.max) / 2 + 1e-9);
}

export const SKILL_ORDER = ['fireball', 'frostBarrier', 'iceball', 'magnet', 'fireAura', 'frostAura', 'enchant', 'triggerKill', 'flamethrower', 'snowfall'];
export const ATTACK_SKILLS = ['fireball', 'iceball', 'flamethrower', 'snowfall', 'leafCut', 'pineWind', 'roots', 'strawDoll', 'honeyBomb'];
// 3레벨 / 5레벨에 추가되는 효과 설명
export const milestoneText = (d, lv) => d.levelText(lv).slice(1).filter(Boolean)[0] || '';
export const enchantReq = (sk) => Math.max(1, sk.def.xpReq - (sk.level - 1));
export const triggerPer = (sk) => Math.max(1, 50 - 3 * (sk.level - 1));
export const completeSentences = (sk) => sk.sentences.slice(0, sk.maxSlots).filter((s) => s && isComplete(s));
export const triggerGoal = (sk) => completeSentences(sk).length * triggerPer(sk);

export function createSkill(key) {
  return {
    key, def: SKILL_DEFS[key], level: 1, maxSlots: game.debug && game.debug.unlockSlots ? MAX_SENTENCE_SLOTS : BASE_SENTENCE_SLOTS,
    sentences: new Array(MAX_SENTENCE_SLOTS).fill(null),
    auto: true, cd: 0, cdMax: 1,
    stacks: 0, stackTimer: 0, stackNeed: 0,
  };
}

export const isDamaging = (def) => def.relevant.includes('damage');
export const maxStacks = (sk) => (sk.def.maxStacks || 0) + (sk.key === 'frostBarrier' && sk.level >= 3 ? 1 : 0);
export function statLabel(def, k) {
  if (k === 'damage' && def.element) return `${ELEMENTS[def.element].name} 피해`;
  return (def.labels && def.labels[k]) || SUBJECTS[k].name;
}
export const skillUses = (def, k) => def.relevant.includes(k) || (def.hiddenUses || []).includes(k) || (isDamaging(def) && DAMAGE_EXTRA.includes(k)) || (k === 'haste' && !def.passive);
export const extraLines = (sk) => (typeof sk.def.extra === 'function' ? sk.def.extra(sk) : sk.def.extra || []).filter(Boolean);

// 스킬 창에 보일 스탯 목록: 속성 피해(주 속성 먼저) → 기존 스탯 → 치명타/저항 무시
export function shownStats(def, stats) {
  const out = def.relevant.filter((k) => !SUBJECTS[k].hidden);
  if (isDamaging(def)) {
    const i = out.indexOf('damage') + 1;
    const extras = Object.values(ELEMENT_DMG).filter((k) => k !== ELEMENT_DMG[def.element] && (!stats || stats[k].max > 0));
    out.splice(i, 0, ...extras);
    out.push('critChance', 'critDamage');
    if (!stats || stats.penetration.max > 0 || stats.penPct.max > 0) out.push('penetration');
  }
  if (!def.passive && (!stats || (stats.hasteTotal ? stats.hasteTotal.max : stats.haste.max) > 0)) out.push('haste');
  return out;
}

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
  for (const k of SUBJECT_ORDER) st[k] = iv(d.base[k] ?? STAT_DEFAULTS[k] ?? 0);
  // 업그레이드 '기초 훈련': 스킬 기본 피해량 증가
  const bm = (game.mods && game.mods.baseDmgMul) || 1;
  st.damage = { min: st.damage.min * bm, max: st.damage.max * bm };
  if (d.levelUp) d.levelUp(st, level);
  const f = areaFactor(skill, level);
  if (f) st.area = { min: st.projSize.min * f, max: st.projSize.max * f };
  st.zone = { min: 0, max: 0 };                  // 처치 시 지대 지속 시간 (문장)
  st.zoneArea = iv(ZONE_BASE_AREA);
  st.infuse = null;                              // 지대 통과 시 얻는 속성 피해 (문장)
  return st;
}

function clampStat(key, x) {
  const def = SUBJECTS[key];
  let v = Math.max(def.min, x);
  if (def.max != null) v = Math.min(def.max, v);
  return v;
}

export function applyEffect(stats, subj, val, change) {
  // 저항 무시: 백분율은 % 저항 무시, 고정/랜덤은 고정 저항 무시로 따로 쌓임
  if (subj === 'penetration' && val.pct) { subj = 'penPct'; val = { ...val, pct: false }; }
  // 치명타 피해: 백분율은 기본 100% 에 %p 로 합연산, 고정/랜덤은 치명타 때 더해지는 추가 피해에 적용
  if (subj === 'critDamage' && !val.pct) subj = 'critFlat';
  const s = stats[subj];
  let lo, hi;
  if (SUBJECTS[subj].pctOnly || SUBJECTS[subj].pctAdd) {
    // 확률 / 치명타 피해량: %p 단위로 더하기/빼기/고정 (40% + 20% 증가 = 60%)
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

// "장착된 다른 모든 문장의 효과" 문장이 다른 문장의 수치를 바꿈
function ampTransform(val, amp) {
  const v = { ...val };
  const a = amp.val;
  if (a.pct) {
    const f = (x, p) => (amp.change === 'inc' ? x * (1 + p) : amp.change === 'dec' ? x * (1 - p) : x * p);
    v.min = f(val.min, a.min); v.max = f(val.max, a.max);
  } else {
    const k = val.pct ? 0.01 : 1;   // 백분율 수치에는 %p 로 적용
    if (amp.change === 'inc') { v.min += a.min * k; v.max += a.max * k; }
    else if (amp.change === 'dec') { v.min -= a.min * k; v.max -= a.max * k; }
    else { v.min = a.min * k; v.max = a.max * k; }
  }
  return { ...v, min: Math.min(v.min, v.max), max: Math.max(v.min, v.max) };
}

const scaleVal = (val, k) => (k === 1 ? val : { ...val, min: val.min * k, max: val.max * k });

// 장착된 문장 순서대로 적용
// extra: 추가로 적용할 문장 (발동 : 처치 버프), scale: 추가 문장 수치 배율
function runSentences(skill, stats, extra = [], scale = 1) {
  const log = [];
  const d = skill.def;
  // 발동 : 처치 처럼 문장이 자신에게 적용되지 않는 스킬
  const own = d.payload ? [] : skill.sentences.slice(0, skill.maxSlots).map((s, i) => ({ s, i, k: 1 }));
  const list = own.concat(extra.map((s, j) => ({ s, i: 100 + j, k: scale })));
  // 효과 변화 문장 (어느 칸에 있든 다른 모든 문장에 적용)
  const amps = [];
  for (const { s, k } of list) {
    if (s && s.template === 'AMP' && isComplete(s)) amps.push({ val: scaleVal(evalNumber(s.slots[0].block), k), change: s.slots[1].block.key });
  }
  const amped = (val) => amps.reduce((v, a) => ampTransform(v, a), val);

  for (const { s, i, k } of list) {
    if (!s) continue;
    if (!isComplete(s)) { log.push({ i, ok: false }); continue; }

    if (s.template === 'AMP') {
      const a = { val: scaleVal(evalNumber(s.slots[0].block), k), change: s.slots[1].block.key };
      log.push({ i, ok: true, text: `다른 문장 효과 ${fmtValue(a.val)} ${CHANGES[a.change].name}` });
      continue;
    }
    if (s.template === 'ZONE') {
      const val = amped(scaleVal(evalNumber(s.slots[0].block), k));
      if (val.pct) { log.push({ i, ok: false, reason: '고정/랜덤 값만 가능' }); continue; }
      if (!isDamaging(d) || !d.element) { log.push({ i, ok: true, na: true }); continue; }
      stats.zone = { min: stats.zone.min + Math.max(0, val.min), max: stats.zone.max + Math.max(0, val.max) };
      log.push({ i, ok: true, text: `처치 시 지대 ${fmtValue(val)}초` });
      continue;
    }
    if (s.template === 'INFUSE') {
      const val = amped(scaleVal(evalNumber(s.slots[0].block), k));
      if (!d.projectile) { log.push({ i, ok: true, na: true }); continue; }
      const cur = stats.infuse;
      stats.infuse = cur && cur.pct === val.pct ? { min: cur.min + val.min, max: cur.max + val.max, pct: val.pct } : val;
      log.push({ i, ok: true, text: `지대 통과 시 속성 피해 +${fmtValue(stats.infuse)}` });
      continue;
    }

    let subj = s.slots[0].block.key;
    const change = s.slots[2].block.key;
    let val;
    if (s.template === 'SNC') val = amped(scaleVal(evalNumber(s.slots[1].block), k));
    else {
      // '만큼' 값: 백분율 계열 스탯(확률 등)은 백분율로 적용
      let src = s.slots[1].block.key;
      // 스킬의 주 속성과 같은 속성 피해 = 그 스킬의 피해량 (예: 파이어볼의 화염 피해)
      if (SUBJECTS[src].element && SUBJECTS[src].element === d.element) src = 'damage';
      const sv = stats[src];
      val = SUBJECTS[src].pctType ? { min: sv.min / 100, max: sv.max / 100, pct: true } : { ...sv, pct: false };
      val = scaleVal(val, k);
    }
    // 백분율 전용 스탯에 백분율이 아닌 수치 (연산 결과 포함)
    if (SUBJECTS[subj].pctOnly && !val.pct) { log.push({ i, ok: false, reason: '백분율만 가능' }); continue; }
    // 스킬의 주 속성과 같은 속성 피해는 피해량에 더함
    if (SUBJECTS[subj].element && SUBJECTS[subj].element === d.element) subj = 'damage';
    // 스킬에 없는 키워드 → 적용되지 않음
    if (!skillUses(d, subj)) { log.push({ i, ok: true, na: true, subj }); continue; }
    // 실제로 바뀌는 내부 스탯 (저항 무시 % / 치명타 추가 피해)
    const key = subj === 'penetration' && val.pct ? 'penPct' : subj === 'critDamage' && !val.pct ? 'critFlat' : subj;
    const before = { ...stats[key] };
    if (SUBJECTS[subj].element && stats[subj].max === 0 && val.pct && change !== 'dec') {
      // 없던 속성 피해를 백분율로 늘리면: 스킬 피해량의 그 비율만큼 속성 피해가 생김 (냉기 스킬 + 화염 피해 90% 증가)
      stats[subj] = { min: stats.damage.min * val.min, max: stats.damage.max * val.max };
    } else applyEffect(stats, subj, val, change);
    // 피해량 변화는 이미 추가된 속성 피해에도 적용
    if (subj === 'damage') for (const ek of Object.values(ELEMENT_DMG)) if (stats[ek].max > 0) applyEffect(stats, ek, val, change);
    // 지속 시간 변화는 투사체 지속 시간에도 똑같이 적용
    if (subj === 'duration' && skillUses(d, 'projDuration')) applyEffect(stats, 'projDuration', val, change);
    // 지속 시간 변화는 속박 지속 시간에도 (옭아매는 뿌리)
    if (subj === 'duration' && skillUses(d, 'rootDuration')) applyEffect(stats, 'rootDuration', val, change);
    log.push({ i, ok: true, subj: key, before, after: { ...stats[key] } });
  }
  return log;
}

// 지대: 스킬의 지속 시간 / 효과 범위 변화 비율을 그대로 따라감
function finishZone(stats, base) {
  if (stats.zone.max <= 0) return;
  const ratio = (k) => {
    const b = (base[k].min + base[k].max) / 2, f = (stats[k].min + stats[k].max) / 2;
    return b > 0 ? f / b : 1;
  };
  const rd = ratio('duration'), ra = ratio('area');
  stats.zone = { min: stats.zone.min * rd, max: stats.zone.max * rd };
  stats.zoneArea = { min: stats.zoneArea.min * ra, max: stats.zoneArea.max * ra };
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
  finishZone(stats, base);
  applyUpgradeStats(skill, stats);
  if (skill.def.finalize) skill.def.finalize(stats, base, skill);
  return { stats, log };
}

// 업그레이드 효과 (효과 범위 / 사거리 / 투사체 속도 · 지속 · 관통) + 스킬 가속 → 최종 쿨타임
function applyUpgradeStats(skill, st) {
  const m = game.mods || {}, d = skill.def;
  const mul = (k, f) => { if (f && f !== 1 && st[k]) st[k] = { min: st[k].min * f, max: st[k].max * f }; };
  // 피해량: 투사체 속도 비례 추가 피해(비장의 한 발) → 스킬 피해 % · 투사체 스킬 피해 % (문장으로 얻은 속성 피해에도)
  if (d.projectile && m.projSpeedDmg && st.damage.max > 0) {
    const add = ((st.projSpeed.min + st.projSpeed.max) / 2) * (m.projSpeedMul || 1) * m.projSpeedDmg;
    st.damage = { min: st.damage.min + add, max: st.damage.max + add };
  }
  const dmgF = (m.dmgMul || 1) * (d.projectile && m.projDmg ? 1 + m.projDmg : 1);
  for (const k of ['damage', ...Object.values(ELEMENT_DMG)]) mul(k, dmgF);
  mul('area', m.areaMul);
  mul('range', m.rangeMul);
  if (d.projectile || d.relevant.includes('projSpeed')) {
    mul('projSpeed', m.projSpeedMul);
    mul('projDuration', m.projLifeMul);
    if (d.labels && d.labels.duration === '투사체 지속 시간') mul('duration', m.projLifeMul);
    if (m.pierceAdd && d.relevant.includes('pierce')) st.pierce = { min: st.pierce.min + m.pierceAdd, max: st.pierce.max + m.pierceAdd };
  }
  if (!d.passive) {
    const hMin = st.haste.min + (m.haste || 0), hMax = st.haste.max + (m.haste || 0);
    st.hasteTotal = { min: hMin, max: hMax };
    st.cooldown = { min: Math.max(0.1, (st.cooldown.min * 100) / (100 + hMax)), max: Math.max(0.1, (st.cooldown.max * 100) / (100 + hMin)) };
  }
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
  if (key === 'damage' || SUBJECTS[key].element) return Math.round(x);   // 피해량: 소수점 반올림 (실제 피해도 반올림)
  if (SUBJECTS[key].int) return Math.floor(x + 1e-9);   // 정수 스탯(관통/개수/연쇄)은 소수점 버림
  return Math.round(x * 100) / 100;
}
export function fmtStat(key, v) {
  const a = fmtNum(key, v.min), b = fmtNum(key, v.max);
  const u = SUBJECTS[key].unit || '', pre = SUBJECTS[key].plus ? '+' : '';
  return pre + (a === b ? `${a}` : `${a}~${b}`) + u;
}
// 스탯 표시 (저항 무시는 % + 고정값을 함께)
export function statText(k, stats) {
  if (k === 'haste') {
    const h = stats.hasteTotal || stats.haste;
    const pct = Math.round((h.max / (100 + h.max)) * 100);
    return `${fmtStat('haste', h)} (쿨타임 -${pct}%)`;
  }
  if (k === 'critDamage') {
    const f = stats.critFlat;
    return (f && f.max > 0 ? `${fmtStat('critFlat', f)} + ` : '') + fmtStat('critDamage', stats.critDamage);   // 예: 5 + 150%
  }
  if (k === 'penetration') {
    const p = Math.round(((stats.penPct.min + stats.penPct.max) / 2) * 100);
    return `${p}% + ${fmtStat('penetration', stats.penetration)}`;
  }
  return fmtStat(k, stats[k]);
}
export const sample = (v) => v.min + Math.random() * (v.max - v.min);
// 정수 스탯 표본: 소수점은 버리고, 범위 안의 정수를 고르게 뽑음 (2 × 150% = 3, 2.5 → 2)
export const sampleInt = (v) => {
  const lo = Math.floor(v.min + 1e-9), hi = Math.floor(v.max + 1e-9);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
};
export const avg = (v) => (v.min + v.max) / 2;
// 상태이상 확률 (0~1)
export const statusProb = (st, ratio = 1) => ((sample(st.statusChance) + game.mods.statusAdd) / 100) * ratio;
