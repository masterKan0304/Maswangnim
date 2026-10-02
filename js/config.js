// ─────────────────────────────────────────────
//  게임 전역 설정값
// ─────────────────────────────────────────────
export const STAGE_TIME = 600;          // 보스 등장까지 (초)
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
export const SUBJECT_ORDER = ['damage', 'fireDmg', 'iceDmg', 'lightningDmg', 'area', 'range', 'duration', 'projDuration', 'castSpeed', 'shield',
  'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'critChance', 'critDamage', 'critFlat', 'penetration', 'penPct', 'statusChance', 'manaCost', 'cooldown'];
export const SUBJECTS = {
  damage:    { name: '피해량',       min: 1,               desc: '스킬이 주는 피해량입니다. 이미 추가된 속성 피해에도 함께 적용됩니다.' },
  fireDmg:   { name: '화염 피해',    min: 0, element: 'fire',      desc: '추가 화염 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다.' },
  iceDmg:    { name: '냉기 피해',    min: 0, element: 'ice',       desc: '추가 냉기 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다.' },
  lightningDmg: { name: '번개 피해', min: 0, element: 'lightning', desc: '추가 번개 피해를 얻습니다. 스킬의 속성은 바뀌지 않습니다.' },
  area:      { name: '효과 범위',    min: 0.5,             desc: '스킬이 닿는 범위입니다.' },
  range:     { name: '사거리',       min: 0.5, noWord: true, hidden: true, desc: '스킬의 사거리입니다.' },
  duration:  { name: '지속 시간',    min: 0.1, max: 60, unit: '초', desc: '스킬 효과가 유지되는 시간입니다.' },
  projDuration: { name: '투사체 지속 시간', min: 0.05, max: 60, unit: '초', noWord: true, desc: '투사체가 유지되는 시간입니다.' },
  castSpeed: { name: '시전 속도',    min: 0.1, max: 20, noWord: true, hidden: true, desc: '스킬을 시전하는 속도입니다.' },
  shield:    { name: '보호막 획득량', min: 0,              desc: '얻는 보호막의 양입니다.' },
  pierce:    { name: '관통 횟수',    min: 0, max: 999, int: true, desc: '투사체가 적을 관통하는 횟수입니다.' },
  projSize:  { name: '투사체 크기',  min: 2,               desc: '투사체의 크기입니다.' },
  projSpeed: { name: '투사체 속도',  min: 0.1, max: 50,    desc: '투사체가 날아가는 속도입니다.' },
  projCount: { name: '투사체 개수',  min: 1, max: 40, int: true, desc: '한 번에 발사되는 투사체 수입니다.' },
  chains:    { name: '연쇄 횟수',    min: 0, max: 50, int: true, desc: '적중 후 다른 적에게 다시 이어지는 횟수입니다.' },
  critChance: { name: '치명타 확률', min: 0, max: 100, unit: '%', pctOnly: true, pctType: true, desc: '공격이 치명타가 될 확률입니다. 백분율만 넣을 수 있습니다.' },
  critDamage: { name: '치명타 피해량', min: 100, unit: '%', pctType: true, desc: '치명타 피해입니다. 백분율은 배율에, 고정값은 추가 피해에 더해집니다.' },
  critFlat:  { name: '치명타 추가 피해', min: 0, noWord: true, hidden: true, desc: '' },
  penetration: { name: '저항 무시',  min: 0,               desc: '적의 속성 저항을 무시합니다. 백분율이 먼저 적용됩니다.' },
  penPct:    { name: '저항 무시(%)', min: 0, max: 1, noWord: true, hidden: true, desc: '' },
  statusChance: { name: '상태이상 발생율', min: 0, max: 100, unit: '%', pctOnly: true, pctType: true, desc: '속성 상태이상을 부여할 확률입니다. 백분율만 넣을 수 있습니다.' },
  manaCost:  { name: '마나 소모량',  min: 0,               desc: '스킬을 사용할 때 소모하는 마나입니다.' },
  cooldown:  { name: '스킬 쿨타임',  min: 0.1, unit: '초', sentenceUnit: '초', desc: '스킬을 다시 사용하기까지의 시간입니다.' },
};
// 공격 스킬이면 공통으로 사용하는 스탯
export const DAMAGE_EXTRA = ['fireDmg', 'iceDmg', 'lightningDmg', 'critChance', 'critDamage', 'critFlat', 'penetration', 'penPct'];
export const STAT_DEFAULTS = { castSpeed: 1, critChance: 10, critDamage: 200 };
export const ELEMENT_DMG = { fire: 'fireDmg', ice: 'iceDmg', lightning: 'lightningDmg' };

// 단어:변화
export const CHANGE_ORDER = ['inc', 'dec', 'set'];
export const CHANGES = {
  inc: { name: '증가', verb: '증가합니다', desc: '값을 늘립니다. 백분율이면 비율만큼 늘립니다.' },
  dec: { name: '감소', verb: '감소합니다', desc: '값을 줄입니다. 백분율이면 비율만큼 줄입니다.' },
  set: { name: '같음', verb: '같아집니다', desc: '값을 해당 수치로 바꿉니다. 백분율이면 현재 값의 그 비율이 됩니다.' },
};

export const ENEMY_TYPES = {
  green:  { name: '그린 슬라임', hp: 10,   dmg: 2,  speed: 2.4, radius: 0.42, xp: 1, color: 0x2fe07c },
  yellow: { name: '옐로 슬라임', hp: 25,   dmg: 4,  speed: 2.1, radius: 0.52, xp: 3, color: 0xf6cf3a },
  red:    { name: '레드 슬라임', hp: 50,   dmg: 8,  speed: 1.9, radius: 0.66, xp: 6, color: 0xec4f4a },
  elite:  { name: '정예 슬라임', hp: 300,  dmg: 10, speed: 2.0, radius: 1.05, xp: 12, color: 0x3f8cff, res: 40 },   // 중간 보스 (2/4/6/8분)
  boss:   { name: '킹 슬라임',   hp: 5000, dmg: 15, speed: 1.7, radius: 2.0,  xp: 0, color: 0x9b5cf0, res: 80 },   // res: 모든 속성 저항
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
  fire:      { name: '화염', color: '#ff7a2e', status: '화상', desc: '3초간 0.5초마다 화염 피해를 입힙니다.' },
  ice:       { name: '냉기', color: '#7fd8ff', status: '둔화', desc: '3초간 이동 속도가 30% 감소합니다.' },
  lightning: { name: '번개', color: '#ffe066', status: '감전', desc: '3초간 받는 피해가 20% 증가합니다.' },
};
export const STATUS = { duration: 3, burnTick: 0.5, slow: 0.3, shockAmp: 0.2 };
export const BOX = { baseChance: 0.01, growPer10Hp: 0.01 };   // 블록 상자: 처치마다 확률 × (1 + 체력10당 1%), 드랍 시 초기화
export const ZONE_BASE_AREA = 20;   // 처치 시 남기는 속성 지대의 기본 범위
