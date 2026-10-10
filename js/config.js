// ─────────────────────────────────────────────
//  게임 전역 설정값
// ─────────────────────────────────────────────
export const STAGE_TIME = 600;
// 오버킬: 2분에서 시작, 맵의 적이 적으면 줄고(30 이하), 많으면 늘어남(90 이상, 최대 3분). 1분 이하면 스테이지 시간 1.5배, 0이면 2배
export const OVERKILL = { start: 120, max: 180, low: 30, high: 90, fast: 60, mul1: 1.5, mul2: 2 };          // 보스 등장까지 (초)
export const WORLD_HALF = 58;           // 플레이 가능 영역 반경 (정사각형 half size)
export const PAUSE_ON_MENU = true;      // 인벤토리/스킬 창을 열면 게임 일시정지
export const INV_W = 10;
export const INV_H = 5;
export const START_REROLLS = 5;
export const MAX_SKILLS = 10;
export const BASE_SENTENCE_SLOTS = 2;
export const MAX_SENTENCE_SLOTS = 5;
export const MAX_SKILL_LEVEL = 5;
export const MAX_ENEMIES = 380;
export const PROJ_SPEED_UNIT = 2;      // 투사체 속도 스탯 1 = 초당 월드 2 (스탯 6 → 기존과 같은 실제 속도)
export const STAT_UNIT = 5;             // 스탯상의 거리/효과 범위 단위 → 월드 단위 변환 (플레이어 지름 = 스탯 5)
export const PROJ_SIZE_UNIT = 20;       // 투사체 크기 스탯 → 월드 (스탯 20 = 월드 1)
export const DASH = { cooldown: 5, distance: 3, duration: 0.14 };

export const PLAYER = {
  maxHp: 50,
  radius: 0.5,          // 피격 지름 1
  speed: 5,
  regenInterval: 10,
  regenAmount: 1,
  invuln: 0.5,          // 피격 후 무적 시간
  maxMana: 100,
  manaRegen: 10,        // 초당
  gemMagnet: 2.6,
  blockMagnet: 1.6,
};

// 단어:주체
// noWord: 단어 블록으로 나오지 않는 내부 스탯 / hidden: 스킬 창에 표시하지 않음
// pctOnly: 수치는 백분율만, %p 단위로 계산 / pctType: 다른 문장의 '만큼' 값으로 쓰일 때 백분율로 취급
export const SUBJECT_ORDER = ['damage', 'fireDmg', 'iceDmg', 'natureDmg', 'oceanDmg', 'earthDmg', 'darkDmg', 'radiantDmg', 'area', 'range', 'duration', 'rootDuration', 'flowerCount', 'honeyDmgGrow', 'honeyAreaGrow', 'honeyHealGrow', 'projDuration', 'castSpeed', 'shield',
  'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'critChance', 'critDamage', 'critFlat', 'penetration', 'penPct', 'statusChance', 'manaCost', 'cooldown', 'haste'];
export const SUBJECTS = {
  damage:    { name: '피해량',       min: 1,               desc: '스킬이 주는 피해량입니다. 이미 추가된 속성 피해에도 함께 적용됩니다.' },
  fireDmg:   { name: '화염 피해',    min: 0, element: 'fire',      desc: '추가 화염 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다. 계산에 사용될 때는 스킬의 최종 피해가 아닌 기본 피해를 기준으로 계산합니다.' },
  iceDmg:    { name: '냉기 피해',    min: 0, element: 'ice',       desc: '추가 냉기 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다. 계산에 사용될 때는 스킬의 최종 피해가 아닌 기본 피해를 기준으로 계산합니다.' },
  natureDmg: { name: '자연 피해',   min: 0, element: 'nature',    desc: '추가 자연 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다. 계산에 사용될 때는 스킬의 최종 피해가 아닌 기본 피해를 기준으로 계산합니다.' },
  oceanDmg:  { name: '해양 피해',    min: 0, element: 'ocean',     desc: '추가 해양 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다. 계산에 사용될 때는 스킬의 최종 피해가 아닌 기본 피해를 기준으로 계산합니다.' },
  earthDmg:  { name: '대지 피해',    min: 0, element: 'earth',     desc: '추가 대지 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다. 계산에 사용될 때는 스킬의 최종 피해가 아닌 기본 피해를 기준으로 계산합니다.' },
  darkDmg:   { name: '칠흑 피해',    min: 0, element: 'dark',      desc: '추가 칠흑 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다. 계산에 사용될 때는 스킬의 최종 피해가 아닌 기본 피해를 기준으로 계산합니다.' },
  radiantDmg: { name: '광휘 피해',   min: 0, element: 'radiant',   desc: '추가 광휘 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다. 계산에 사용될 때는 스킬의 최종 피해가 아닌 기본 피해를 기준으로 계산합니다.' },
  area:      { name: '효과 범위',    min: 0.5,             desc: '스킬이 닿는 범위입니다.' },
  range:     { name: '사거리',       min: 0.5, noWord: true, hidden: true, desc: '스킬의 사거리입니다.' },
  duration:  { name: '지속 시간',    min: 0.1, max: 60, unit: '초', desc: '스킬 효과가 유지되는 시간입니다.' },
  flowerCount: { name: '꽃 생성 수', min: 0, max: 999, int: true, noWord: true, desc: '세계수의 씨앗이 고리를 따라 피워 내는 꽃의 수입니다.' },
  honeyDmgGrow: { name: '피해량 증가량', min: 0, unit: '%', plus: true, noWord: true, desc: '열매가 커질 때(0.25초마다)마다 늘어나는 피해량입니다. 처음 피해량을 기준으로 합니다.' },
  honeyAreaGrow: { name: '효과 범위 증가량', min: 0, unit: '%', plus: true, noWord: true, desc: '열매가 커질 때(0.25초마다)마다 늘어나는 효과 범위입니다. 처음 효과 범위를 기준으로 합니다.' },
  honeyHealGrow: { name: '체력 회복 증가량', min: 0, plus: true, noWord: true, desc: '열매가 커질 때(0.25초마다)마다 늘어나는 체력 회복량입니다.' },
  rootDuration: { name: '속박 지속 시간', min: 0.1, max: 60, unit: '초', noWord: true, desc: '적을 속박하는 시간입니다. 지속 시간 블록의 효과를 함께 받습니다.' },
  projDuration: { name: '투사체 지속 시간', min: 0.05, max: 60, unit: '초', noWord: true, desc: '투사체가 유지되는 시간입니다.' },
  castSpeed: { name: '시전 속도',    min: 0.1, max: 20, noWord: true, hidden: true, desc: '스킬을 시전하는 속도입니다.' },
  shield:    { name: '보호막 획득량', min: 0,              desc: '얻는 보호막의 양입니다.' },
  pierce:    { name: '관통 횟수',    min: 0, max: 999, int: true, desc: '투사체가 적을 관통하는 횟수입니다.' },
  projSize:  { name: '투사체 크기',  min: 2,               desc: '투사체의 크기입니다.' },
  projSpeed: { name: '투사체 속도',  min: 0.1, max: 50,    desc: '투사체가 날아가는 속도입니다.' },
  projCount: { name: '투사체 개수',  min: 1, max: 40, int: true, desc: '한 번에 발사되는 투사체 수입니다.' },
  chains:    { name: '연쇄 횟수',    min: 0, max: 50, int: true, desc: '적중 후 다른 적에게 다시 이어지는 횟수입니다.' },
  critChance: { name: '치명타 확률', min: 0, max: 100, unit: '%', pctOnly: true, pctType: true, desc: '공격이 치명타가 될 확률입니다. 백분율만 넣을 수 있습니다.' },
  critDamage: { name: '치명타 피해량', min: 0, unit: '%', pctType: true, pctAdd: true, desc: '치명타가 터지면 피해가 이 비율만큼 증가합니다. 백분율은 비율에, 고정값은 추가 피해에 더해집니다.' },
  critFlat:  { name: '치명타 추가 피해', min: 0, noWord: true, hidden: true, desc: '' },
  penetration: { name: '저항 무시',  min: 0,               desc: '적의 속성 저항을 무시합니다. 백분율이 먼저 적용됩니다.' },
  penPct:    { name: '저항 무시(%)', min: 0, max: 1, noWord: true, hidden: true, desc: '' },
  statusChance: { name: '상태이상 발생율', min: 0, max: 100, unit: '%', pctOnly: true, pctType: true, desc: '속성 상태이상을 부여할 확률입니다. 백분율만 넣을 수 있습니다.' },
  manaCost:  { name: '마나 소모량',  min: 0,               desc: '스킬을 사용할 때 소모하는 마나입니다.' },
  cooldown:  { name: '스킬 쿨타임',  min: 0.1, unit: '초', sentenceUnit: '초', noWord: true, desc: '스킬을 다시 사용하기까지의 시간입니다.' },
  // 스킬 가속: 최종 쿨타임 = 기본 쿨타임 × 100 ÷ (100 + 스킬 가속) — 액티브 스킬에만 적용, 높을수록 효과가 점점 줄어듦
  haste:     { name: '스킬 가속',    min: 0, pctAdd: true, desc: '스킬 쿨타임이 줄어듭니다. 값이 높을수록 줄어드는 정도가 점점 작아지며, 액티브 스킬에만 적용됩니다.' },
};
// 공격 스킬이면 공통으로 사용하는 스탯
export const DAMAGE_EXTRA = ['fireDmg', 'iceDmg', 'natureDmg', 'oceanDmg', 'earthDmg', 'darkDmg', 'radiantDmg', 'critChance', 'critDamage', 'critFlat', 'penetration', 'penPct'];
export const STAT_DEFAULTS = { castSpeed: 1, critChance: 10, critDamage: 100 };   // 치명타: 피해 +100%
export const ELEMENT_DMG = { fire: 'fireDmg', ice: 'iceDmg', nature: 'natureDmg', ocean: 'oceanDmg', earth: 'earthDmg', dark: 'darkDmg', radiant: 'radiantDmg' };

// 단어:변화
export const CHANGE_ORDER = ['inc', 'dec', 'set'];
export const CHANGES = {
  inc: { name: '증가', verb: '증가합니다', desc: '값을 늘립니다. 백분율이면 비율만큼 늘립니다.' },
  dec: { name: '감소', verb: '감소합니다', desc: '값을 줄입니다. 백분율이면 비율만큼 줄입니다.' },
  set: { name: '같음', verb: '같아집니다', desc: '값을 해당 수치로 바꿉니다. 백분율이면 현재 값의 그 비율이 됩니다.' },
};

export const ENEMY_TYPES = {
  green:  { name: '그린 슬라임', hp: 10,   dmg: 2,  speed: 2.4, radius: 0.42, xp: 1, color: 0x2fe07c, element: 'nature' },
  yellow: { name: '옐로 슬라임', hp: 25,   dmg: 4,  speed: 2.1, radius: 0.52, xp: 3, color: 0xf6cf3a, element: 'nature' },
  red:    { name: '레드 슬라임', hp: 50,   dmg: 8,  speed: 1.9, radius: 0.66, xp: 6, color: 0xec4f4a, element: 'nature' },
  elite:  { name: '정예 슬라임', hp: 300,  dmg: 10, speed: 2.0, radius: 1.05, xp: 12, color: 0x3f8cff, res: 40, element: 'nature' },   // 중간 보스 (2/4/6/8분)
  boss:   { name: '킹 슬라임',   hp: 5000, dmg: 15, speed: 1.7, radius: 2.0,  xp: 0, color: 0x9b5cf0, res: 80, element: 'nature' },   // res: 모든 속성 저항
};

export const DROP = {
  chance: 0.033,
  kinds: { sentence: 30, word: 35, number: 30, op: 5 },
  subjectRatio: 0.7,                               // 단어 블록 중 주체 비율 (나머지 30% 변화)
  changes: { inc: 45, dec: 30, set: 25 },
  numberTypes: { fixed: 40, percent: 30, range: 30 },
  numberFalloff: 0.75,                             // 숫자가 클수록 희귀 (한 단계 오를 때마다 가중치 ×0.75)
  ops: { '+': 45, '-': 30, '/': 17, '*': 8 },       // * > / > - > + 순으로 희귀
  // 문장 희귀도 1 / 2 / 3 = 70 / 25 / 5%
  templates: { SNC: 45.5, SSC: 24.5, ZONE: 12.5, INFUSE: 12.5, AMP: 5 },
  prefillChance: 0.25,                             // 문장 블록 각 칸이 미리 채워져(고정) 있을 확률
};

export const BLOCK_COLORS = {
  sentence: '#9d6bff',
  subject:  '#17b897',
  change:   '#3d8bff',
  number:   '#ff9a2e',
  op:       '#ff4f7b',
};

export const xpToNext = (lv) => 5 + (lv - 1) * 6;
export const hpScale = (t) => 1 + 0.3 * (t / 60);   // 1분당 +30%, 시간에 따라 균일하게 증가 (Lv.1 스테이지)
export const ELITE_TIMES = [120, 240, 360, 480];  // 중간 보스 등장 시각 (남은 시간 8/6/4/2분)

// 스킬 속성 & 상태이상
export const ELEMENTS = {
  fire:      { name: '화염', icon: 'fire', color: '#ff7a2e', status: '화상', desc: '3초간 0.5초마다 화염 피해를 입힙니다.' },
  ice:       { name: '냉기', icon: 'snowflake', color: '#7fd8ff', status: '둔화', desc: '3초간 이동 속도가 30% 감소합니다.' },
  nature:    { name: '자연', icon: 'leaf', color: '#6fd36a', status: '중독', desc: '3초간 1초마다 최대 체력의 5%(정예 2%, 보스 0.5%)만큼 자연 피해를 입힙니다.' },
  ocean:     { name: '해양', icon: 'wave', color: '#3fa8ff', status: '탈진', desc: '3초간 기술을 쓰는 속도와 기술 쿨타임이 30% 느려집니다.' },
  earth:     { name: '대지', icon: 'rock', color: '#c8925a', status: '기절', desc: '1초간 움직이지도, 기술을 쓰지도, 부딪혀 피해를 주지도 못합니다. (정예 30%, 보스 70% 짧게) 대지 지대 위에서는 기절 대신 모든 저항이 지대를 만든 공격 피해의 50%만큼 감소합니다.' },
  dark:      { name: '칠흑', icon: 'moon', color: '#9a6bff', status: '공포', desc: '3초간 플레이어에게서 달아나며 이동 속도가 30% 느려지고, 받는 모든 피해의 20%를 칠흑 피해로 더 받습니다. (정예·보스 66% 짧게, 풀린 뒤 3초간 면역)' },
  radiant:   { name: '광휘', icon: 'sun', color: '#ffe680', status: '축성', desc: '3초간 받은 피해를 쌓아 두었다가 끝날 때 그 50%를 광휘 피해로 줍니다. 축성 중 다시 걸리면 쌓인 피해의 100%를 바로 주고 새로 축성합니다.' },
};
export const STATUS = {
  duration: 3, burnTick: 0.5, slow: 0.3,
  poisonPct: { normal: 0.05, elite: 0.02, boss: 0.005 }, poisonTick: 1,     // 중독
  exhaust: 0.3,                                                            // 탈진: 기술 속도 / 쿨타임 30% 감속
  stun: 1, stunMul: { elite: 0.7, boss: 0.3 },                             // 기절 (정예 30% / 보스 70% 짧게)
  fearSlow: 0.3, fearExtra: 0.2, fearBossMul: 0.34, fearImmune: 3,         // 공포
  consecrate: 0.5, consecrateRe: 1,                                        // 축성
};
// 속성 상성: 키 속성은 값 속성들의 공격에 25% 피해를 더 받음 (같은 속성끼리는 상태이상을 걸 수 없음)
export const ELEMENT_WEAK = {
  fire: ['ocean', 'earth'], ocean: ['nature', 'ice'], nature: ['fire', 'ice'], ice: ['fire', 'earth'], earth: ['ocean', 'nature'],
  dark: ['radiant'], radiant: ['dark'],
};
export const WEAK_MUL = 1.25;
export const isWeak = (defEl, atkEl) => !!(defEl && atkEl && ELEMENT_WEAK[defEl] && ELEMENT_WEAK[defEl].includes(atkEl));
// 역상성: 이 속성에게 공격받으면 25% 덜 받음
export const ELEMENT_RESIST = { fire: ['nature', 'ice'], ocean: ['fire', 'earth'], nature: ['ocean', 'earth'], ice: ['ocean', 'nature'], earth: ['fire', 'ice'] };
export const RESIST_MUL = 0.75;
export const isResist = (defEl, atkEl) => !!(defEl && atkEl && ELEMENT_RESIST[defEl] && ELEMENT_RESIST[defEl].includes(atkEl));
// 받는 피해 배율 (상성 1.25 / 역상성 0.75 / 그 외 1)
export const elemMul = (defEl, atkEl) => (isWeak(defEl, atkEl) ? WEAK_MUL : isResist(defEl, atkEl) ? RESIST_MUL : 1);
// 속성 키워드 툴팁
const elName = (k) => `<b style="color:${ELEMENTS[k].color}">${ELEMENTS[k].name}</b>`;
// mode: 'atk' 피해를 줄 때만 / 'def' 피해를 받을 때만 / 그 외 둘 다
export function elemTipHTML(el, mode) {
  const E = ELEMENTS[el];
  if (!E) return '';
  let h = `<div class="tip-title" style="color:${E.color}">${E.name} 속성</div>`;
  const atk = mode !== 'def', def = mode !== 'atk';
  if (def && ELEMENT_WEAK[el]) h += `<div class="tip-warn">약점: ${ELEMENT_WEAK[el].map(elName).join(', ')} 속성에게 받는 피해가 25% 증가합니다.</div>`;
  if (def && ELEMENT_RESIST[el]) h += `<div class="tip-ok">저항: ${ELEMENT_RESIST[el].map(elName).join(', ')} 속성에게 받는 피해가 25% 감소합니다.</div>`;
  const strong = Object.keys(ELEMENT_WEAK).filter((k) => ELEMENT_WEAK[k].includes(el));
  if (atk && strong.length) h += `<div>${strong.map(elName).join(', ')} 속성에게 25% 더 큰 피해를 줍니다.</div>`;
  const weakAtk = Object.keys(ELEMENT_RESIST).filter((k) => ELEMENT_RESIST[k].includes(el));
  if (atk && weakAtk.length) h += `<div>${weakAtk.map(elName).join(', ')} 속성에게는 25% 작은 피해를 줍니다.</div>`;
  if (atk) h += `<div class="tip-dim">${E.status}: ${E.desc}</div>`;
  h += `<div class="tip-dim">${mode === 'def' ? `${E.name} 속성의 공격으로는 상태이상에 걸리지 않습니다.` : '같은 속성끼리는 상태이상을 걸 수 없습니다.'}</div>`;
  return h;
}
export const BOX = { baseChance: 0.01, growPer10Hp: 0.01 };   // 블록 상자: 처치마다 확률 × (1 + 체력10당 1%), 드랍 시 초기화
export const ZONE_BASE_AREA = 20;   // 처치 시 남기는 속성 지대의 기본 범위

// ─────────────────────────────────────────────
//  계정 레벨: 스테이지에서 얻은 골드의 25%가 계정 경험치로 쌓임 (캐릭터 숙련도는 그 75%)
//  필요 경험치 500 → 750 → 1000 → 1300 → 1650 ... (세 번째부터 증가폭이 50씩 커짐)
// ─────────────────────────────────────────────
export function accountNeed(lv) {
  let need = 500;
  for (let k = 1; k < lv; k++) need += k <= 2 ? 250 : 250 + 50 * (k - 2);
  return need;
}
// 계정 레벨에 따라 해금되는 스킬 / 문장 (여기 없는 것은 처음부터 사용 가능)
export const ACCOUNT_UNLOCKS = {
  2: { skills: ['fireAura', 'frostAura'], templates: [] },
  3: { skills: ['triggerKill', 'magnet'], templates: ['ZONE', 'INFUSE'] },
  4: { skills: [], templates: ['AMP'] },
};
export function unlockLevel(kind, key) {
  for (const [lv, u] of Object.entries(ACCOUNT_UNLOCKS)) if (u[kind].includes(key)) return +lv;
  return 1;
}

// ─────────────────────────────────────────────
//  스테이지 1 정예 / 최종 보스 기술 (거리·범위는 스탯 단위: 실제 거리 = 값 / 5, 범위는 지름)
// ─────────────────────────────────────────────
export const ENEMY_SKILLS = {
  // 정예: 10초마다 2초간 힘을 모은 뒤 플레이어 위치로 2초에 걸쳐 도약 (최대 60), 착지 범위 30 안이면 공격력 150% 피해 + 밀려남
  eliteLeap: { every: 10, charge: 2, leap: 2, range: 60, area: 30, dmgMul: 1.5 },
  // 보스: 8초마다 1초간 힘을 모은 뒤 플레이어 쪽으로 최대 3번 튕기는 점액 (한 번에 1초 동안 12 이동, 튕길 때 범위 20 피해 + 밀어냄 + 소환)
  bossSpit: { every: 8, charge: 1, bounces: 3, hop: 12, hopTime: 1, area: 20, spawn: { green: 2, yellow: 1 }, lastMul: 3 },
  // 보스: 14초마다 3초간 제자리에서 3번 점프, 착지마다 주위 피해 + 밀어냄 + 일반 몬스터 6마리를 바깥으로 튀어나오게 소환
  bossStomp: { every: 14, jumps: 3, time: 3, area: 40, spawn: 6 },
};
