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
    tooltip: '[ 주도 ]\n뽑을 카드에;"호밍 애로우";3장 생성'
  },
  {
    name: '호밍 애로우',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: '-',
    illust: 'cards/힐데/blue1_1.webp',
    tooltip: '[ 사용불가 / 소멸 ]\n체력이 가장 낮은 적 추가 공격 120%\n드로우 1\n감응 : 이 카드 발동'
  },
  {
    name: '플라즈마 레인',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 1,
    illust: 'cards/힐데/blue2.webp',
    tooltip: '모든 적;피해 60%,;이온화 2'
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
  },
  {
    name: '니아의 호기심',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/니아의호기심.webp',
    tooltip: '뽑을 카드의 무작위 카드;3장을 확인\n하나를 선택하여 드로우\n나머지는 버리기'
  },
  {
    name: '마음을 담아서!',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/마음을담아서.webp',
    tooltip: '[ 안식 ]\n피해 100%\n"하트 브레이커" 2장 생성'
  },
  {
    name: '이리 와 밀크 퐁',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/이리와밀크퐁.webp',
    tooltip: '"하트 쉐이커";2장 생성'
  },
  {
    name: '정화의 피스톨',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/정화의피스톨.webp',
    tooltip: '[ 탄환 ] [ 안식 ]\n피해 120%, 공명 2\n버려질 시 대상에게 자신의 공명 3번 더 발동'
  },
  {
    name: '피어나는 사랑',
    rarity: 'yellow',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/피어나는사랑.webp',
    tooltip: '안식 카드;드로우 1\n버리기 1'
  },
  {
    name: '해방된 마음',
    rarity: 'purple',
    attribute: 'passion',
    type: 'attack',
    cost: 2,
    illust: 'quiz/해방된마음.webp',
    tooltip: '소멸 탄환 카드;2장 드로우\n피해 300%\n핸드의 서로 다른 탄환 카드 수만큼;피해량 30% 증가'
  },
  {
    name: '어둠의 참격',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/어둠의참격.webp',
    tooltip: '[ 주도 ]\n피해 100%\n1턴간 기본 공격 카드의;피해량 100% 증가'
  },
  {
    name: '공명하는 어둠',
    rarity: 'blue',
    attribute: 'void',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/공명하는어둠.webp',
    tooltip: '[ 유일 ]\n비용 1인 카드의;피해량 +40%\n턴 종료 시 치유 60%'
  },
  {
    name: '간식 시간',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/간식시간.webp',
    tooltip: '[ 소멸 ]\n핸드의 카드 1장 선택 소멸\n치유 200%\n드로우 1'
  },
  {
    name: '암흑 응집',
    rarity: 'yellow',
    attribute: 'void',
    type: 'skill',
    cost: 1,
    illust: 'quiz/암흑응집.webp',
    tooltip: '핸드의 공격 카드 1장 선택,;1턴간 사용 시까지;피해량 +100%'
  },
  {
    name: '포식자의 칼날',
    rarity: 'purple',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/포식자의칼날.webp',
    tooltip: '피해 250%;1턴간;사기 2'
  },
  {
    name: '대용량 탄창',
    rarity: 'blue',
    attribute: 'passion',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/대용량탄창.webp',
    tooltip: '[ 주도 ]\n턴 시작 시;런처 탄환 1장 생성'
  },
  {
    name: 'S.S.S',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/SSS.webp',
    tooltip: '피해 100%\n1턴간 탄환 카드의;피해량 +40%'
  },
  {
    name: '플라멘베르퍼',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 2,
    illust: 'quiz/플라멘베르퍼.webp',
    tooltip: '모든 적 피해 180%\n드로우 1\n버리기 1'
  },
  {
    name: '섬광탄',
    rarity: 'yellow',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/섬광탄.webp',
    tooltip: '모든 적 피해 120%\n약화 2\n대상이 실드를 보유하면;피해량 +50%'
  },
  {
    name: 'R.P.G-7',
    rarity: 'purple',
    attribute: 'passion',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/RPG7.webp',
    tooltip: '탄환 카드;소멸 시;모든 적 고정 피해 40%'
  },
  {
    name: '연속 격발',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/연속격발.webp',
    tooltip: '피해 50% × 2\n치명타 수만큼 핸드건 탄환 생성\n치명확률 +50%'
  },
  {
    name: '은밀한 장전',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 1,
    illust: 'quiz/은밀한장전.webp',
    tooltip: '핸드건 탄환;2장 생성'
  },
  {
    name: '기회 포착',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 1,
    illust: 'quiz/기회포착.webp',
    tooltip: '[ 주도 ]\n실드 100%\n다음에 사용하는 탄환 카드의;피해량 +120%'
  },
  {
    name: '마안의 난무',
    rarity: 'yellow',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/마안의난무.webp',
    tooltip: '피해 50%\n이번 턴 사용한 탄환 카드 수만큼;타격 1회 추가'
  },
  {
    name: '필살탄',
    rarity: 'purple',
    attribute: 'order',
    type: 'attack',
    cost: 0,
    illust: 'quiz/필살탄.webp',
    tooltip: '[ 사용 불가 ] [ 유일 ] [ 탄환 ]\n피해 300%\n핸드건 탄환 카드 5장 사용 시;사용 불가 제거'
  },
  {
    name: '기록자',
    rarity: 'blue',
    attribute: 'justice',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/기록자.webp',
    tooltip: '[ 유일 ] [ 개전 ]\n카드 발동 시 그 카드 비용 만큼;시간 기록 1'
  },
  {
    name: '시간축 파괴',
    rarity: 'blue',
    attribute: 'justice',
    type: 'attack',
    cost: 2,
    illust: 'quiz/시간축 파괴.webp',
    tooltip: '피해 300%\n핸드의 카드 비용 합만큼;피해량 20% 증가 (최대 200%)'
  },
  {
    name: '확정된 미래',
    rarity: 'blue',
    attribute: 'justice',
    type: 'skill',
    cost: 1,
    illust: 'quiz/확정된미래.webp',
    tooltip: '핸드의 비용 2 이하인 카드;1장 사용 시까지 비용 1 증가,;비용 3인 무작위 카드 1장 발동'
  },
  {
    name: '크로노 서클',
    rarity: 'yellow',
    attribute: 'justice',
    type: 'skill',
    cost: 1,
    illust: 'quiz/크로노서클.webp',
    tooltip: '"운명 각인";2장 생성'
  },
  {
    name: '타임 패러독스',
    rarity: 'purple',
    attribute: 'justice',
    type: 'skill',
    cost: 0,
    illust: 'quiz/타임패러독스.webp',
    tooltip: '[ 유일 ]\n시간 기록 모두 감소\n그 수만큼 시간 초월'
  },
  {
    name: '나락충',
    rarity: 'gray',
    attribute: 'monster',
    type: 'skill',
    cost: 0,
    illust: 'quiz/나락충.webp',
    tooltip: '[ 소멸 ]\n사기 1 감소\n결의 3 감소'
  },
  {
    name: '나락충',
    rarity: 'gray',
    attribute: 'monster',
    type: 'skill',
    cost: 0,
    illust: 'quiz/나락충.webp',
    tooltip: '[ 소멸 ]\n사기 1 감소\n결의 3 감소'
  },
  {
    name: '알비툼',
    rarity: 'blue',
    attribute: 'monster',
    type: 'upgrade',
    cost: 0,
    illust: 'quiz/알비툼.webp',
    tooltip: '받는 피해량 -15%;(턴당 1회)'
  },
  {
    name: '오토마타 카발리',
    rarity: 'blue',
    attribute: 'monster',
    type: 'attack',
    cost: 1,
    illust: 'quiz/오토마타카발리.webp',
    tooltip: '피해 150%\n취약 4'
  },
  {
    name: '오토마타 후사르',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'attack',
    cost: 2,
    illust: 'quiz/오토마타후사르.webp',
    tooltip: '방어 기반 피해 200%\n실드 200%\n실드 획득 시 이 카드 1턴간;사용 시까지 비용 1 감소'
  },
  {
    name: '빔슈터',
    rarity: 'gray',
    attribute: 'monster',
    type: 'attack',
    cost: 3,
    illust: 'quiz/빔슈터.webp',
    tooltip: '피해 350%\n대상이 실드를 보유하면;피해량 +50%'
  },
  {
    name: '서늘한 대부',
    rarity: 'gray',
    attribute: 'monster',
    type: 'skill',
    cost: 0,
    illust: 'quiz/서늘한대부.webp',
    tooltip: '뽑을 카드 맨 아래의 카드 1장 발동\n핸드의 카드 1장 선택,;그 카드 뽑을 카드 맨 아래로 이동'
  },
  {
    name: '컬티스트 아비터',
    rarity: 'gray',
    attribute: 'monster',
    type: 'skill',
    cost: 1,
    illust: 'quiz/컬티스트아비터.webp',
    tooltip: '실드 140%\n다음 턴 시작 시 모든 적;행동 카운트 2 증가'
  },
  {
    name: '사이보그 오토마톤',
    rarity: 'gray',
    attribute: 'monster',
    type: 'attack',
    cost: 5,
    illust: 'quiz/사이보그오토마톤.webp',
    tooltip: '방어 기반 피해 600%\n소각 :;이 카드 발동'
  },
  {
    name: '어둠 손아귀',
    rarity: 'gray',
    attribute: 'monster',
    type: 'attack',
    cost: 1,
    illust: 'quiz/어둠손아귀.webp',
    tooltip: '피해 120% × 2\n처치 : 무작위 적들에게;약화 120% × 2'
  },
  {
    name: '도미니온',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'upgrade',
    cost: 2,
    illust: 'quiz/도미니온.webp',
    tooltip: '턴 시작 시;사기 1'
  },
  {
    name: '정령 피닉스',
    rarity: 'blue',
    attribute: 'monster',
    type: 'skill',
    cost: 1,
    illust: 'quiz/정령피닉스.webp',
    tooltip: '[ 소멸 ]\n결의 2\n감소한 체력만큼 실드 획득'
  },
  {
    name: '집행자 슬로터',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'upgrade',
    cost: 2,
    illust: 'quiz/집행자슬로터.webp',
    tooltip: '실드 70%;보존'
  },
  {
    name: '악령 듀라한',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/악령듀라한.webp',
    tooltip: '타게팅 공격 카드;사용 시 대상에게;고통 1'
  },
  {
    name: '황폐의 악령 듀라한',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'skill',
    cost: 'X',
    illust: 'quiz/황폐의악령듀라한.webp',
    tooltip: 'X만큼 1턴 간 불굴 3\n다음 턴 X만큼;1턴간 사기 3'
  },
  {
    name: '악령 샐러맨더',
    rarity: 'blue',
    attribute: 'monster',
    type: 'skill',
    cost: 1,
    illust: 'quiz/악령샐러맨더.webp',
    tooltip: '[ 소멸 2 ]\n드로우 4'
  },
  {
    name: '황폐의 악령 샐러맨더',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'skill',
    cost: 0,
    illust: 'quiz/황폐의악령샐러맨더.webp',
    tooltip: '[ 소멸 ]\n핸드의 카드 전부 소멸\n드로우 3'
  },
  {
    name: '유령',
    rarity: 'purple',
    attribute: 'monster',
    type: 'skill',
    cost: 1,
    illust: 'quiz/유령.webp',
    tooltip: '[ 소멸 ]\n영체화 1'
  },
  {
    name: '음산한 대모',
    rarity: 'blue',
    attribute: 'monster',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/음산한대모.webp',
    tooltip: '턴 종료 시;무작위 적에게;피해 200%'
  },
  {
    name: '상실의 굶주림',
    rarity: 'blue',
    attribute: 'monster',
    type: 'skill',
    cost: 1,
    illust: 'quiz/상실의굶주림.webp',
    tooltip: '[ 소멸 ]\n드로우 1\n핸드의 카드가 없다면;드로우 4 추가'
  },
  {
    name: '공허의 굶주림',
    rarity: 'blue',
    attribute: 'monster',
    type: 'skill',
    cost: 0,
    illust: 'quiz/공허의굶주림.webp',
    tooltip: '[ 소멸 ]\n사기 흡수 2'
  },
  {
    name: '심판관 도미니온',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'skill',
    cost: 2,
    illust: 'quiz/심판관도미니온.webp',
    tooltip: '[ 소멸 ]\n아군 손상 제거\n실드 700%'
  },
  {
    name: '레버넌트 아비터',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/레버넌트아비터.webp',
    tooltip: '[ 개전 ]\n뽑을 카드의 강화 카드;1장 선택하여 사용'
  },
  {
    name: '로튼 리퍼',
    rarity: 'gray',
    attribute: 'monster',
    type: 'attack',
    cost: 1,
    illust: 'quiz/로튼리퍼.webp',
    tooltip: '[ 신속 ]\n피해 160%\n행동 카운트 1 증가'
  },
  {
    name: '녹슨 못 세븐 암즈',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'upgrade',
    cost: 3,
    illust: 'quiz/녹슨못세븐암즈.webp',
    tooltip: '공격 카드 7장 사용 시;모든 적 고정 피해 700%'
  },
  {
    name: '고통의 치천사',
    rarity: 'gray',
    attribute: 'monster',
    type: 'attack',
    cost: 2,
    illust: 'quiz/고통의치천사.webp',
    tooltip: '피해 250%\n핸드에 이 카드만 있다면;비용 2 감소'
  },
  {
    name: '세븐 암즈',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'attack',
    cost: 1,
    illust: 'quiz/세븐암즈.webp',
    tooltip: '[ 신속 ]\n피해 120%\n대상의 행동 카운트 5 이상일 시;행동 포인트 2 획득'
  },
  {
    name: '갑각충',
    rarity: 'blue',
    attribute: 'monster',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/갑각충.webp',
    tooltip: '결정화;5'
  },
  {
    name: '수줍은 정원사',
    rarity: 'gray',
    attribute: 'monster',
    type: 'attack',
    cost: 1,
    illust: 'quiz/수줍은정원사.webp',
    tooltip: '피해 50% × 4\n표식 3'
  },
  {
    name: '슬로터',
    rarity: 'gray',
    attribute: 'monster',
    type: 'skill',
    cost: 2,
    illust: 'quiz/슬로터.webp',
    tooltip: '[ 소멸 ]\n실드 200%\n획득한 실드만큼 모든 적 피해'
  },
  {
    name: '솔저 프라임',
    rarity: 'blue',
    attribute: 'monster',
    type: 'attack',
    cost: 2,
    illust: 'quiz/솔저프라임.webp',
    tooltip: '피해 300%\n격파 시;행동 포인트 2 획득'
  },
  {
    name: '속박의 교리',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/속박의교리.webp',
    tooltip: '피해 200%\n대상이 공명 상태라면;피해량 100% 증가'
  },
  {
    name: '꿈의 세계',
    rarity: 'yellow',
    attribute: 'common',
    type: 'attack',
    cost: 3,
    illust: 'quiz/꿈의세계.webp',
    tooltip: '[ 안식 ]\n피해 300%\n버려질 시 뽑을 카드에서;무작위 카드 2장 버리기'
  },
  {
    name: '넘침의 울림',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/넘침의울림.webp',
    tooltip: '[ 안식 ]\n피해 200%\n버려질 시 대상에게 공명 2'
  },
  {
    name: '감정의 폭발',
    rarity: 'blue',
    attribute: 'common',
    type: 'upgrade',
    cost: 2,
    illust: 'quiz/감정의폭발.webp',
    tooltip: '[ 주도 ]\n카드가 4장 버려질 시;행동 포인트 1\n(턴당 1회)'
  },
  {
    name: '감정의 폭발',
    rarity: 'blue',
    attribute: 'common',
    type: 'upgrade',
    cost: 2,
    illust: 'quiz/감정의폭발.webp',
    tooltip: '[ 주도 ]\n카드가 4장 버려질 시;행동 포인트 1\n(턴당 1회)'
  },
  {
    name: '내면의 각성',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/내면의각성.webp',
    tooltip: '[ 안식 ]\n버리기 1\n무작위 공격 카드 1장 드로우\n그 카드 연결 부여'
  },
  {
    name: '상실의 페르소나',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/상실의페르소나.webp',
    tooltip: '자신의 공격 카드 드로우 1\n그 카드가 안식 카드면;연결 부여'
  },
  {
    name: '진실의 공명',
    rarity: 'blue',
    attribute: 'common',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/진실의공명.webp',
    tooltip: '[ 개전 ]\n능력으로 드로우 시;모든 적 공명 1 (턴당 1회)'
  },
  {
    name: '악몽의 이면',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/악몽의이면.webp',
    tooltip: '[ 안식 ]\n드로우 2\n뽑을 카드에 "끔찍한 기억" 1장 생성'
  },
  {
    name: '광기의 속삭임',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/광기의속삭임.webp',
    tooltip: '버리기 1\n다음 사용하는 공격 카드;피해량 +100%'
  },
  {
    name: '오염된 포자',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/오염된포자.webp',
    tooltip: '[ 보존 ] [ 소멸 ]\포자증식 1\n보존 : "오염된 포자" 1장 생성'
  },
  {
    name: '숲의 굶주림',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/숲의굶주림.webp',
    tooltip: '방어 기반 피해 300%\n핸드의 소멸 카드 모두 소멸,;그 수만큼 피해량 +25%'
  },
  {
    name: '잊혀진 무덤',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 6,
    illust: 'quiz/잊혀진무덤.webp',
    tooltip: '[ 점화 ] [ 보존 ] [ 소멸 ]\n이 카드 비용 감소 시 1턴간 자신의 치명확률 +10%\n소각 : "오염된 포자" 1장 생성'
  },
  {
    name: '버섯 탄환',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 3,
    illust: 'quiz/버섯탄환.webp',
    tooltip: '[ 탄환 ] [ 소멸 ]\n피해 450%\n포자증식 효과 2배'
  }
];
