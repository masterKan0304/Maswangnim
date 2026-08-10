// ============================================================
// 카제나 카드 맞히기 - 퀴즈용 카드 데이터 편집 파일
// ------------------------------------------------------------
// window.QUIZ_CARDS 배열에 카드를 하나씩 추가하면 됩니다.
// 데일리는 오늘 날짜를 기준으로 이 배열 중 하나가 자동으로 고정되고,
// 자유 모드는 이 배열 중 하나가 무작위로 뽑힙니다.
//
// 각 카드 항목 설명:
//   name        : 카드 이름 (정답으로 입력해야 하는 값이자 자동완성 목록에 쓰입니다)
//   rarity      : 희귀도 — gray(일반) / blue(희귀) / yellow(전설) / purple(신화)
//   attribute   : 속성 — passion(열정) / order(질서) / instinct(본능) / justice(정의) /
//                 void(공허) / common(공용) / monster(몬스터)
//   type        : 유형 — attack(공격) / skill(스킬) / upgrade(강화)
//   cost        : 비용 — 0, 1, 2, 3 등의 숫자 또는 'X', '-' 처럼 따옴표로 감싼 텍스트
//   illust      : 실제 카드 일러스트 이미지 경로. "일러스트 일부 공개" 정보를 열면 이 이미지를
//                 500% 확대해서 무작위 위치를 잘라 보여주고, 정답을 맞히면 전체가 공개됩니다.
//                 (quiz/{카드 이름} 등 원하는 경로에 이미지를 넣고 적어주세요)
//   tooltip     : 카드 설명 텍스트. [ 주도 ] 같은 특수 능력 표기도 그냥 맨 앞에 이어서
//                 적으면 됩니다 (예: '[ 주도 ]\n드로우 3, 드로우 3\n드로우 3').
//                 줄바꿈(Enter)과 쉼표(,)를 기준으로 잘라서, 그 사이 텍스트를 하나의
//                 정보 단위로 취급합니다. 정보 버튼을 누를 때마다 그 단위 중 하나가
//                 무작위로 통째로 드러나며, 드러난 텍스트에는 카드 툴팁과 동일한 색상
//                 규칙([대괄호]→주황, 숫자→파랑, "따옴표"→파랑 밑줄, -텍스트-→파랑)이
//                 자동으로 적용됩니다. 줄바꿈과 쉼표 자체는 항상 그대로 보입니다.
//                 세미콜론(;)도 줄바꿈/쉼표와 똑같이 정보 단위를 나누는 기준으로
//                 쓸 수 있는데, 화면에 드러날 때는 ; 대신 그냥 띄어쓰기로 보입니다.
//                 (예: '핸드에 진혼의 탄환이 있다면;1장 버리고 피해량 +100%' 은
//                 2개의 정보 단위이며, 뒤쪽이 드러나면 "1장 버리고 피해량 +100%"로 보입니다)
// ============================================================

window.QUIZ_CARDS = [
  {
    name: '퀴버 로딩',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'cards/힐데/blue1.webp',
    tooltip: '[ 주도 ]\n뽑을 카드에;"호밍 애로우" 3장 생성'
  },
  {
    name: '호밍 애로우',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: '-',
    illust: 'cards/힐데/blue1_1.webp',
    tooltip: '[ 사용불가 / 소멸 ]\n체력이 가장 낮은 적 추가 공격 120%\n드로우 1\n감응: 이 카드 발동'
  },
  {
    name: '플라즈마 레인',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 1,
    illust: 'cards/힐데/blue2.webp',
    tooltip: '모든 적 피해 60%, 이온화 2'
  },
  {
    name: '드로우 & 릴리즈',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'cards/힐데/blue3.webp',
    tooltip: '자신의 공격 카드 드로우 2\n1턴간 사용 시까지 그 카드 피해량 +50%'
  },
  {
    name: '빅 게임 레인저',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'upgrade',
    cost: 1,
    illust: 'cards/힐데/yellow.webp',
    tooltip: '[ 유일 / 주도 ]\n타격 시 일점 조준 2'
  },
  {
    name: '볼텍스 애로우',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'attack',
    cost: 1,
    illust: 'cards/힐데/purple.webp',
    tooltip: '[ 유일 ]\n드로우 3\n모든 적 피해 120%\n이번 턴 드로우한 공격 카드 수만큼;피해량 +60% (최대 8장)'
  },
  {
    name: '즉결 심판',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/즉결심판.webp',
    tooltip: '피해 180%\n핸드에 진혼의 탄환이 있다면;1장 버리고 피해량 +100%'
  },
  {
    name: '칠흑의 송시',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/칠흑의송시.webp',
    tooltip: '피해 50% × 3\n핸드의 진혼의 탄환 수만큼;피해량 +20%'
  },
  {
    name: '비탄의 메아리',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/비탄의메아리.webp',
    tooltip: '피해 140%\n진혼의 탄환;2장 생성'
  },
  {
    name: '운명을 삼킨 꽃',
    rarity: 'yellow',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/운명을삼킨꽃.webp',
    tooltip: '핸드의 카드;2장까지 버리기\n그 수만큼 진혼의 탄환 생성'
  },
  {
    name: '결사의 일격',
    rarity: 'purple',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/결사의일격.webp',
    tooltip: '[ 보존 ]\n피해 150%\n진혼의 탄환 모두 버리기,;그 수만큼 피해량 +50%'
  },
  {
    name: '검의 비',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/검의비.webp',
    tooltip: '피해 80% × 2\n감응 :;극광검 1장 생성'
  },
  {
    name: '만인의 영웅',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/만인의영웅.webp',
    tooltip: '[ 안식 ]\n드로우 3\그 카드들을 이번 턴 동안 연결'
  },
  {
    name: '한 줄기 빛',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/한줄기빛.webp',
    tooltip: '피해 120%\n핸드의 연결 카드 수만큼;피해량 +120%'
  },
  {
    name: '극광 전개',
    rarity: 'yellow',
    attribute: 'passion',
    type: 'skill',
    cost: 2,
    illust: 'quiz/극광전개.webp',
    tooltip: '[ 안식 ]\n극광검 2장 생성\n1턴간 극광검 피해량 +50%'
  },
  {
    name: '극광 응축',
    rarity: 'purple',
    attribute: 'passion',
    type: 'skill',
    cost: 0,
    illust: 'quiz/극광응축.webp',
    tooltip: '[ 사용 불가 ] [ 유일 ] [ 회수 3 ]\n무덤으로 이동 시;극광의 빛 1'
  },
  {
    name: '굶주림의 굴레',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 1,
    illust: 'quiz/굶주림의굴레.webp',
    tooltip: '방어 기반 피해 30% × 3\n감응 :;탐식 4'
  },
  {
    name: '무한한 허기',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 0,
    illust: 'quiz/무한한허기.webp',
    tooltip: '다음 2번의 탐식 발동 시;핸드의 무작위 카드 1장;1턴간 비용 1 감소'
  },
  {
    name: '능동 제어',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/능동제어.webp',
    tooltip: '탐식이 6 미만이라면;탐식 6\n6 이상이라면 포식 2'
  },
  {
    name: '탐식의 영역',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'attack',
    cost: 1,
    illust: 'quiz/탐식의영역.webp',
    tooltip: '모든 적 방어 기반 피해 100%\n대상의 다음 격파 시까지;받는 강인도 피해 100% 증가'
  },
  {
    name: '완전한 식사',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'attack',
    cost: 6,
    illust: 'quiz/완전한식사.webp',
    tooltip: '[ 보존 ] [ 유일 ]\n탐식이 감소되면 사용 시까지 비용 1 감소,;치유량 +30% (최대 10)\n모든 적 방어 기반 피해 160%\n치유 100%\n포식 4'
  },
  {
    name: '파쇄',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 3,
    illust: 'quiz/파쇄.webp',
    tooltip: '[ 유일 ] [ 개전 ] [ 소멸 ] [ 증발 ]\n방어 기반 피해 350%\n소각 : 파쇄 Lv.1 1장 생성'
  },
  {
    name: '노련한 일격',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/노련한일격.webp',
    tooltip: '방어 기반 피해 140%\n피해 기반 실드 20%\n1턴간 소멸 카드의 피해량 20% 증가'
  },
  {
    name: '치명적 일격',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/치명적일격.webp',
    tooltip: '방어 기반 피해 140%\n핸드의 비용이 가장 높은 소멸 카드의;비용만큼 피해량 20% 증가,;그 카드 소멸'
  },
  {
    name: '역전의 칼날',
    rarity: 'yellow',
    attribute: 'order',
    type: 'upgrade',
    cost: 0,
    illust: 'quiz/역전의칼날.webp',
    tooltip: '[ 유일 ]\n능력으로 실드 획득 시;칼날 벼리기 1'
  },
  {
    name: '투지',
    rarity: 'purple',
    attribute: 'order',
    type: 'skill',
    cost: 1,
    illust: 'quiz/투지.webp',
    tooltip: '핸드의 비용이 가장 높은;자신의 공격 카드 1장 발동,;그 카드 소멸'
  },
  {
    name: 'G코드',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/G코드.webp',
    tooltip: '데시벨 2\n뽑을 카드 맨 위의;카드 1장 발동'
  },
  {
    name: '악센트 뮤트',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/악센트뮤트.webp',
    tooltip: '비용이 가장 높은 카드 1장 버리기\n그 카드를 소유한 전투원;무작위 적 추가 공격 150%'
  },
  {
    name: '소울리프',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/소울리프.webp',
    tooltip: '[ 보존 ]\n치유 150%\n1턴간 카드를 버릴 시;데시벨 1, 탄력 2'
  },
  {
    name: '아다지오',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'skill',
    cost: 0,
    illust: 'quiz/아다지오.webp',
    tooltip: '드로우 1\n버리기 1\n이 효과로 버려진 카드를;뽑을 카드 위로 이동'
  }
];
