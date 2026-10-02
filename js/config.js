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
export const STAT_UNIT = 5;             // 스탯상의 거리/크기 단위 → 월드 단위 변환 (플레이어 지름 = 스탯 5)
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
// noWord: 단어 블록으로 나오지 않는 내부 스탯 (사거리는 숨김 처리, 투사체 지속 시간은 '지속 시간'을 따라감)
export const SUBJECT_ORDER = ['damage', 'area', 'range', 'duration', 'projDuration', 'castSpeed', 'shield', 'pierce', 'projSize', 'projSpeed', 'projCount', 'chains', 'statusChance', 'manaCost', 'cooldown'];
export const SUBJECTS = {
  damage:    { name: '피해량',       min: 1,               desc: '스킬이 적에게 주는 피해량' },
  area:      { name: '효과 범위',    min: 0.5,             desc: '스킬의 효과 범위(지름). 파이어볼은 폭발 범위(기본 = 투사체 크기 × 6), 아이스볼은 구체 크기' },
  range:     { name: '사거리',       min: 0.5, noWord: true, hidden: true, desc: '스킬의 사거리' },
  duration:  { name: '지속 시간',    min: 0.1, max: 60, unit: '초', desc: '스킬 효과의 지속 시간. 투사체 스킬은 투사체가 유지되는 시간에도 적용' },
  projDuration: { name: '투사체 지속 시간', min: 0.05, max: 60, unit: '초', noWord: true, desc: '투사체가 유지되는 시간 (지속 시간 키워드의 영향을 받음)' },
  castSpeed: { name: '시전 속도',    min: 0.1, max: 20, noWord: true, hidden: true, desc: '스킬 선딜레이를 줄입니다(기본 1). 아이스볼은 파편 발사 속도도 빨라집니다' },
  shield:    { name: '보호막 획득량', min: 0,              desc: '스킬로 얻는 보호막의 양' },
  pierce:    { name: '관통 횟수',    min: 0, max: 999, int: true, desc: '투사체가 적을 관통하는 횟수. 관통 기능이 없던 스킬에도 부여됩니다' },
  projSize:  { name: '투사체 크기',  min: 0.5,             desc: '투사체의 크기(지름)' },
  projSpeed: { name: '투사체 속도',  min: 0.1, max: 50,    desc: '투사체의 비행 속도' },
  projCount: { name: '투사체 개수',  min: 1, max: 40, int: true, desc: '한 번에 발사되는 투사체 수. 좌 → 우 → 좌 순으로 20°씩 추가 발사' },
  chains:    { name: '연쇄 횟수',    min: 0, max: 50, int: true, desc: '연쇄 번개: 다른 적에게 이어지는 횟수. 투사체 스킬: 적중 시 1회 소모해 가장 가까운 적을 향해 다시 발사 (유도 아님)' },
  statusChance: { name: '상태이상 발생율', min: 0, max: 100, unit: '%', pctOnly: true, desc: '속성 피해를 줄 때 상태이상을 부여할 확률. 수치는 백분율 블록만 넣을 수 있으며, %p 단위로 더하거나 뺍니다 (40% + 20% 증가 = 60%)' },
  manaCost:  { name: '마나 소모량',  min: 0,               desc: '스킬을 사용할 때 소모하는 마나 (0 까지 감소 가능)' },
  cooldown:  { name: '스킬 쿨타임',  min: 0.1, unit: '초', sentenceUnit: '초', desc: '스킬 재사용 대기시간' },
};

// 단어:변화
export const CHANGE_ORDER = ['inc', 'dec', 'set'];
export const CHANGES = {
  inc: { name: '증가', verb: '증가합니다', desc: '값에 수치를 더합니다. 백분율이면 N% 만큼 곱연산으로 증가' },
  dec: { name: '감소', verb: '감소합니다', desc: '값에서 수치를 뺍니다. 백분율이면 N% 만큼 곱연산으로 감소' },
  set: { name: '같음', verb: '같아집니다', desc: '값을 해당 수치로 고정합니다. 백분율이면 (직전까지의 값 × N%) 가 됩니다' },
};

export const ENEMY_TYPES = {
  green:  { name: '그린 슬라임', hp: 10,   dmg: 2,  speed: 2.4, radius: 0.42, xp: 1, color: 0x2fe07c },
  yellow: { name: '옐로 슬라임', hp: 25,   dmg: 4,  speed: 2.1, radius: 0.52, xp: 3, color: 0xf6cf3a },
  red:    { name: '레드 슬라임', hp: 50,   dmg: 8,  speed: 1.9, radius: 0.66, xp: 6, color: 0xec4f4a },
  elite:  { name: '정예 슬라임', hp: 300,  dmg: 10, speed: 2.0, radius: 1.05, xp: 12, color: 0x3f8cff },   // 중간 보스 (2/4/6/8분)
  boss:   { name: '킹 슬라임',   hp: 5000, dmg: 15, speed: 1.7, radius: 2.0,  xp: 0, color: 0x9b5cf0 },
};

export const DROP = {
  chance: 0.033,
  kinds: { sentence: 30, word: 35, number: 30, op: 5 },
  subjectRatio: 0.7,                               // 단어 블록 중 주체 비율 (나머지 30% 변화)
  changes: { inc: 45, dec: 30, set: 25 },
  numberTypes: { fixed: 40, percent: 30, range: 30 },
  numberFalloff: 0.75,                             // 숫자가 클수록 희귀 (한 단계 오를 때마다 가중치 ×0.75)
  ops: { '+': 45, '-': 30, '/': 17, '*': 8 },       // * > / > - > + 순으로 희귀
  templates: { SNC: 65, SSC: 35 },
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
  fire:      { name: '화염', color: '#ff7a2e', status: '화상', desc: '3초간 0.5초마다 (부여한 공격 피해의 10~20%) 화염 피해 (최소 1)' },
  ice:       { name: '냉기', color: '#7fd8ff', status: '둔화', desc: '3초간 이동 속도 30% 감소' },
  lightning: { name: '번개', color: '#ffe066', status: '감전', desc: '3초간 받는 피해 20% 증가' },
};
export const STATUS = { duration: 3, burnTick: 0.5, slow: 0.3, shockAmp: 0.2 };
export const BOX = { baseChance: 0.01, growPer10Hp: 0.01 };   // 블록 상자: 처치마다 확률 × (1 + 체력10당 1%), 드랍 시 초기화
