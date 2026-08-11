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
    tooltip: '피해 180%\n핸드에 "진혼의 탄환"이 있다면;1장 버리고 피해량 +100%'
  },
  {
    name: '칠흑의 송시',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/칠흑의송시.webp',
    tooltip: '피해 50% × 3\n핸드의 "진혼의 탄환" 수만큼;피해량 +20%'
  },
  {
    name: '비탄의 메아리',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/비탄의메아리.webp',
    tooltip: '피해 140%\n"진혼의 탄환";2장 생성'
  },
  {
    name: '운명을 삼킨 꽃',
    rarity: 'yellow',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/운명을삼킨꽃.webp',
    tooltip: '핸드의 카드;2장까지 버리기\n그 수만큼 "진혼의 탄환" 생성'
  },
  {
    name: '결사의 일격',
    rarity: 'purple',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/결사의일격.webp',
    tooltip: '[ 보존 ]\n피해 150%\n"진혼의 탄환" 모두 버리기,;그 수만큼 피해량 +50%'
  },
  {
    name: '검의 비',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/검의비.webp',
    tooltip: '피해 80% × 2\n감응 :;"극광검" 1장 생성'
  },
  {
    name: '만인의 영웅',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/만인의영웅.webp',
    tooltip: '[ 안식 ]\n드로우 3\n그 카드들을 이번 턴 동안 연결'
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
    tooltip: '[ 안식 ]\n"극광검" 2장 생성\n1턴간 "극광검" 피해량 +50%'
  },
  {
    name: '극광 응축',
    rarity: 'purple',
    attribute: 'passion',
    type: 'skill',
    cost: 0,
    illust: 'quiz/극광응축.webp',
    tooltip: '[ 사용 불가 / 유일 / 회수 3 ]\n무덤으로 이동 시;극광의 빛 1'
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
    tooltip: '[ 보존 / 유일 ]\n탐식이 감소되면 사용 시까지 비용 1 감소,;치유량 +30% (최대 10)\n모든 적 방어 기반 피해 160%\n치유 100%\n포식 4'
  },
  {
    name: '파쇄',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 3,
    illust: 'quiz/파쇄.webp',
    tooltip: '[ 유일 / 개전 / 소멸 / 증발 ]\n방어 기반 피해 350%\n소각 : 파쇄 Lv.1 1장 생성'
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
    tooltip: '[ 탄환 / 안식 ]\n피해 120%, 공명 2\n버려질 시 대상에게 자신의 공명 3번 더 발동'
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
    tooltip: '피해 250%\n1턴간;사기 2'
  },
  {
    name: '대용량 탄창',
    rarity: 'blue',
    attribute: 'passion',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/대용량탄창.webp',
    tooltip: '[ 주도 ]\n턴 시작 시;"런처 탄환" 1장 생성'
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
    tooltip: '피해 50% × 2\n치명타 수만큼 "핸드건 탄환" 생성\n치명확률 +50%'
  },
  {
    name: '은밀한 장전',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 1,
    illust: 'quiz/은밀한장전.webp',
    tooltip: '"핸드건 탄환";2장 생성'
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
    tooltip: '[ 사용 불가 / 유일 / 탄환 ]\n피해 300%\n"핸드건 탄환" 카드 5장 사용 시;사용 불가 제거'
  },
  {
    name: '기록자',
    rarity: 'blue',
    attribute: 'justice',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/기록자.webp',
    tooltip: '[ 유일 / 개전 ]\n카드 발동 시 그 카드 비용 만큼;시간 기록 1'
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
    name: '음울한 대부',
    rarity: 'gray',
    attribute: 'monster',
    type: 'attack',
    cost: 1,
    illust: 'quiz/음울한대부.webp',
    tooltip: '피해 50% × 4\n고통 6'
  },
  {
    name: '정령 캐폭스',
    rarity: 'blue',
    attribute: 'monster',
    type: 'skill',
    cost: 1,
    illust: 'quiz/정령캐폭스.webp',
    tooltip: '[ 소멸 ]\n뽑을 카드에서 1장 선택 드로우;그 카드에 회수 부여'
  },
  {
    name: '냉혹한 대모',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'skill',
    cost: 8,
    illust: 'quiz/냉혹한대모.webp',
    tooltip: '[ 보존 ]\n행동 포인트 3 회복\n타격 시 사용 시까지 비용 1 감소'
  },
  {
    name: '트래퍼',
    rarity: 'gray',
    attribute: 'monster',
    type: 'skill',
    cost: 1,
    illust: 'quiz/트래퍼.webp',
    tooltip: '실드 120%, 취약 1\n대상이 행동하지 않았다면;실드 획득량 +120%,;취약 1 추가'
  },
  {
    name: '독의 정령 캐폭스',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'skill',
    cost: 0,
    illust: 'quiz/독의정령캐폭스.webp',
    tooltip: '뽑을 카드에서 1장 선택 드로우,;그 카드에 정령독 부여'
  },
  {
    name: '바인 로드',
    rarity: 'blue',
    attribute: 'monster',
    type: 'skill',
    cost: 0,
    illust: 'quiz/바인로드.webp',
    tooltip: '[ 소멸 3 ]\n자신의 소멸 카드;드로우 2'
  },
  {
    name: '방랑자 나락충',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/방랑자나락충.webp',
    tooltip: '피해를 받을 때마다;고정 치유 80%'
  },
  {
    name: '방랑자 알비툼',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'skill',
    cost: 0,
    illust: 'quiz/방랑자알비툼.webp',
    tooltip: '[ 종극 ]\n날갯짓 1'
  },
  {
    name: '방랑자 솔저 프라임',
    rarity: 'yellow',
    attribute: 'monster',
    type: 'attack',
    cost: 3,
    illust: 'quiz/방랑자솔저프라임.webp',
    tooltip: '피해 500%\n처치 : 행동 포인트 3 회복,;이 카드 손패로 이동'
  },
  {
    name: '날개 인면수',
    rarity: 'gray',
    attribute: 'monster',
    type: 'attack',
    cost: 1,
    illust: 'quiz/날개인면수.webp',
    tooltip: '무작위 적들에게;피해 50% × 5'
  },
  {
    name: '울브즈 베인',
    rarity: 'gray',
    attribute: 'monster',
    type: 'attack',
    cost: 1,
    illust: 'quiz/울브즈베인.webp',
    tooltip: '모든 적 피해 120%,;약화 2,;손상 2'
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
    tooltip: '[ 보존 / 소멸 ]\포자증식 1\n보존 : "오염된 포자" 1장 생성'
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
    tooltip: '[ 점화 / 보존 / 소멸 ]\n이 카드 비용 감소 시 1턴간 자신의 치명확률 +10%\n소각 : "오염된 포자" 1장 생성'
  },
  {
    name: '버섯 탄환',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 3,
    illust: 'quiz/버섯탄환.webp',
    tooltip: '[ 탄환 / 소멸 ]\n피해 450%\n포자증식 효과 2배'
  },
  {
    name: '자연의 선물',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/자연의선물.webp',
    tooltip: '[ 소멸 ]\n핸드의 카드 수만큼 치유 20%\n조율 : 핸드의 카드 수만큼 "오염된 포자" 1장 생성'
  },
  {
    name: '양분 흡수',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/양분흡수.webp',
    tooltip: '[ 소멸 ]\n핸드의 카드 1장 선택 소멸\n그 카드 비용만큼 핸드의 무작위 카드 1장;1턴간 사용 시까지 비용 1 감소'
  },
  {
    name: '잔상초',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/잔상초.webp',
    tooltip: '[ 회수 2 / 소멸 3 ]\n실드 60%\n소각 : "오염된 포자" 1장 생성'
  },
  {
    name: '포자 채집기',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/포자채집기.webp',
    tooltip: '[ 보존 / 소멸 ]\n소각 : "오염된 포자" 2장 생성\n보존 : "오염된 포자" 1장 생성'
  },
  {
    name: '산성 가스',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/산성가스.webp',
    tooltip: '[ 회수 / 소멸 ]\n모든 적 손상 3'
  },
  {
    name: '공격성 돌연변이',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/공격성돌연변이.webp',
    tooltip: '[ 소멸 ]\n자신의 공격 카드 드로우 1,;1턴간 그 카드 피해량 +50%'
  },
  {
    name: '조준 사격',
    rarity: 'yellow',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/조준사격.webp',
    tooltip: '피해 400%\n처치 : 크레딧 20 획득'
  },
  {
    name: '기습',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/기습.webp',
    tooltip: '피해 80%\n격파 시 이 카드를;무덤에서 핸드로 이동'
  },
  {
    name: '마력 폭주',
    rarity: 'gray',
    attribute: 'common',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/마력폭주.webp',
    tooltip: '면역 2'
  },
  {
    name: '원자 분해',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/원자분해.webp',
    tooltip: '모든 적 관통;피해 230%'
  },
  {
    name: '공격하라!',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/공격하라.webp',
    tooltip: '뽑을 카드의 공격 카드 1장 선택,;그 카드 핸드로 이동'
  },
  {
    name: '호전성',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/호전성.webp',
    tooltip: '핸드에 공격 카드가 없을 시;드로우 2'
  },
  {
    name: '카모플라쥬',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 2,
    illust: 'quiz/카모플라쥬.webp',
    tooltip: '[ 소멸 ]\n회피 1\n다음 턴 드로우 2'
  },
  {
    name: '압류',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/압류.webp',
    tooltip: '드로우 1\n뽑을 카드 혹은 버린 카드에서;무작위 금기 카드 1장 핸드로 이동'
  },
  {
    name: '연속 공격',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 1,
    illust: 'quiz/연속공격.webp',
    tooltip: '피해 50%;× 3'
  },
  {
    name: '반격 준비',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/반격준비.webp',
    tooltip: '[ 소멸 ]\n에고 스킬 슬롯을 다른 에고 스킬들로 교체'
  },
  {
    name: '필살의 사격',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/필살의사격.webp',
    tooltip: '피해 350%\n다음 턴 시작 시;드로우 1'
  },
  {
    name: '파멸',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 1,
    illust: 'quiz/파멸.webp',
    tooltip: '[ 소멸 ]\n피해 300%\n버리기 1'
  },
  {
    name: '각오',
    rarity: 'gray',
    attribute: 'common',
    type: 'upgrade',
    cost: 2,
    illust: 'quiz/각오.webp',
    tooltip: '턴 시작 시 핸드의 무작위;공격 카드 1장;1턴간 피해량 +50%'
  },
  {
    name: '혼신',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/혼신.webp',
    tooltip: '방어 기반 피해 100% × 2\n결의 수만큼 피해량 +20%'
  },
  {
    name: '에너지 보호막',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/에너지보호막.webp',
    tooltip: '[ 소멸 ]\n실드 100%\n행동 포인트 1 획득'
  },
  {
    name: '금융 치료',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/금융치료.webp',
    tooltip: '[ 소멸 ]\n치유 200%\n체력이 가득 찬 상태라면 크레딧 30 획득'
  },
  {
    name: '구급 키트',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 2,
    illust: 'quiz/구급키트.webp',
    tooltip: '[ 천상 / 소멸 ]\n치유 250%'
  },
  {
    name: '금지된 알고리즘',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 3,
    illust: 'quiz/금지된알고리즘.webp',
    tooltip: '[ 소멸 / 주도 ]\n핸드에 무작위 금기 카드;1장 생성'
  },
  {
    name: '강제 학습 장치',
    rarity: 'blue',
    attribute: 'common',
    type: 'upgrade',
    cost: 2,
    illust: 'quiz/강제학습장치.webp',
    tooltip: '[ 주도 ]\n카드 4장 사용 시;드로우 1 (턴당 1회)'
  },
  {
    name: '견고함',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/견고함.webp',
    tooltip: '실드 150%\n연속 : 다음 턴 시작 시;실드 150%'
  },
  {
    name: '장비 가방',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/장비가방.webp',
    tooltip: '[ 소멸 ]\n드로우 2'
  },
  {
    name: '영광의 저항',
    rarity: 'gray',
    attribute: 'common',
    type: 'upgrade',
    cost: 3,
    illust: 'quiz/영광의저항.webp',
    tooltip: '턴 시작 시 아군에게;최대 체력 10% 고정 피해\n행동 포인트 1 획득'
  },
  {
    name: '육탄전',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 1,
    illust: 'quiz/육탄전.webp',
    tooltip: '[ 소멸 ]\n방어 기반 피해 200%\n결정화 2'
  },
  {
    name: '무거운 강타',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/무거운강타.webp',
    tooltip: '피해 200%\n취약 2\n약화 2'
  },
  {
    name: '묵직한 타격',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/묵직한타격.webp',
    tooltip: '[ 소멸 ]\n피해 200%\n취약 효과 2배'
  },
  {
    name: '비장의 한 발',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/비장의한발.webp',
    tooltip: '[ 보존 / 소멸 ]\n피해 100%\n보존 : 피해량 +50%'
  },
  {
    name: '직감 점화',
    rarity: 'gray',
    attribute: 'common',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/직감점화.webp',
    tooltip: '카드 생성 시;무작위 번뜩임 부여 (턴당 1회)'
  },
  {
    name: '철벽',
    rarity: 'blue',
    attribute: 'common',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/직감점화.webp',
    tooltip: '[ 개전 ]\n결의 1\n불굴 1'
  },
  {
    name: '심판',
    rarity: 'purple',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/심판.webp',
    tooltip: '[ 보존 / 소멸 ]\n피해 1000%\n강인도 피해 10'
  },
  {
    name: '어둠의 지식',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/어둠의지식.webp',
    tooltip: '[ 종극 / 소멸 ]\n드로우 1\n그 카드 발동'
  },
  {
    name: '도약 공격',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 1,
    illust: 'quiz/도약공격.webp',
    tooltip: '피해 200%\n영감 : 비용 1 감소,;드로우 1'
  },
  {
    name: '기동 사격',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/기동사격.webp',
    tooltip: '[ 개전 / 소멸 ]\n모든 적 피해 200%'
  },
  {
    name: '근육 강화 진화체',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 1,
    illust: 'quiz/근육강화진화체.webp',
    tooltip: '피해 80% × 2\n영감 : 타격 2회 추가'
  },
  {
    name: '협상',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/협상.webp',
    tooltip: '[ 보존 / 소멸 ]\n사기 2\n모든 적 사기 2'
  },
  {
    name: '압도',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/압도.webp',
    tooltip: '[ 소멸 ]\n모든 적 피해 100% × 3\n뽑을 카드에 "과부하" 2장 생성'
  },
  {
    name: '꿰뚫기',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/꿰뚫기.webp',
    tooltip: '[ 소멸 ]\n피해 200%\n취약 1\n약화 1\n고통 1'
  },
  {
    name: '정밀 조준',
    rarity: 'yellow',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/정밀조준.webp',
    tooltip: '피해 120%\n드로우 1\n핸드의 카드 1장 선택,;그 카드 뽑을 카드 맨 위로 이동'
  },
  {
    name: '전투 준비',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/전투준비.webp',
    tooltip: '무작위 델랑 상점 카드 1장 생성\n1턴간 그 카드의 비용 0으로 변경'
  },
  {
    name: '증식형 바이러스',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/증식형바이러스.webp',
    tooltip: '피해 120% × 1\n감응 : 타격 1회 추가 (최대 5 중첩)'
  },
  {
    name: '보호의 외침',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/보호의외침.webp',
    tooltip: '실드 130%\n실드가 없다면 실드 100% 증가'
  },
  {
    name: '짓이기기',
    rarity: 'yellow',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/짓이기기.webp',
    tooltip: '[ 약점 공격 ]\n피해 150% × 2\n드로우 1'
  },
  {
    name: '빠른 연사',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/빠른연사.webp',
    tooltip: '피해 80%\n드로우 1'
  },
  {
    name: '퀵드로우',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 0,
    illust: 'quiz/퀵드로우.webp',
    tooltip: '[ 개전 / 소멸 ]\n피해 150%\n표식 1'
  },
  {
    name: '격분',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/격분.webp',
    tooltip: '피해 300%\n핸드에 다른 전투원의 카드가 없다면;이 카드 비용 2 감소'
  },
  {
    name: '집결',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/집결.webp',
    tooltip: '[ 신속 / 소멸 2 ]\n드로우 1\n모든 적 행동 카운트 3 증가'
  },
  {
    name: '재활용',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/재활용.webp',
    tooltip: '에고 포인트 2 이상일 시;행동 포인트 1 획득,;에고 포인트 2 감소'
  },
  {
    name: '집요한 인내',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 2,
    illust: 'quiz/집요한인내.webp',
    tooltip: '[ 보존 ]\n실드 350%'
  },
  {
    name: '재정비',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/재정비.webp',
    tooltip: '[ 소멸 ]\n드로우 3'
  },
  {
    name: '참회',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/참회.webp',
    tooltip: '[ 소멸 ]\n사기 1 감소\n결의 1 감소'
  },
  {
    name: '신성한 일격',
    rarity: 'blue',
    attribute: 'common',
    type: 'attack',
    cost: 1,
    illust: 'quiz/신성한일격.webp',
    tooltip: '[ 소멸 ]\n피해 200%\n강인도 피해 2'
  },
  {
    name: '가학성',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/가학성.webp',
    tooltip: '[ 주도 ]\n모든 적 취약 1\n핸드의 무작위 공격 카드 1장;1턴간 사용 시까지 비용 1 감소'
  },
  {
    name: '자가 발전 실험',
    rarity: 'blue',
    attribute: 'common',
    type: 'upgrade',
    cost: 2,
    illust: 'quiz/자가발전실험.webp',
    tooltip: '[ 주도 ]\n핸드의 카드가 6장 이상일 시;핸드의 무작위 카드 1장;1턴간 비용 0으로 변경 (턴당 1회)'
  },
  {
    name: '껍질 형성 세포',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/껍질형성세포.webp',
    tooltip: '[ 보존 ]\n실드 70%\n핸드의 카드 수만큼 실드 +25%'
  },
  {
    name: '충격',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 2,
    illust: 'quiz/충격.webp',
    tooltip: '모든 적 피해 200%\n취약 2'
  },
  {
    name: '두개골 강타',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 1,
    illust: 'quiz/두개골강타.webp',
    tooltip: '피해 200%\n약점 공격 : 피해량 +50%'
  },
  {
    name: '수면 열매',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/수면열매.webp',
    tooltip: '[ 종극 / 소멸 ]\n무작위 전투원 스트레스 5 감소'
  },
  {
    name: '가시 방패',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 1,
    illust: 'quiz/가시방패.webp',
    tooltip: '모든 적 방어 기반 피해 100%\n파괴 : 타격 1회 추가'
  },
  {
    name: '전략의 시작점',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/전략의시작점.webp',
    tooltip: '[ 소멸 ]\n에고 포인트 2 획득'
  },
  {
    name: '태클',
    rarity: 'gray',
    attribute: 'common',
    type: 'attack',
    cost: 3,
    illust: 'quiz/태클.webp',
    tooltip: '[ 분쇄 ]\n방어 기반 피해 400%\n체력이 가득 찬 상태라면;이 카드 비용 1 감소'
  },
  {
    name: '전술 대응',
    rarity: 'blue',
    attribute: 'common',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/전술대응.webp',
    tooltip: '[ 개전 ]\n실드를 보유한 대상에게;피해량 25% 증가 (최대 1)'
  },
  {
    name: '전략의 재구성',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/전략의재구성.webp',
    tooltip: '[ 소멸 ]\n다음 사용하는 에고 스킬의 비용 1 감소'
  },
  {
    name: '공허의 방랑자',
    rarity: 'blue',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/공허의방랑자.webp',
    tooltip: '[ 소멸 ]\n1턴간 대상의 행동 카운트 감소하지 않음'
  },
  {
    name: '해소의 바람',
    rarity: 'gray',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/해소의바람.webp',
    tooltip: '모든 적 고통 2\n핸드의 상태이상, 저주 카드;2장까지 선택 소멸'
  },
  {
    name: '금기 : 일회용 자아',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 1,
    illust: 'quiz/일회용자아.webp',
    tooltip: '드로우 1,;그 카드 비용만큼 드로우'
  },
  {
    name: '금기 : 폭력의 환희',
    rarity: 'yellow',
    attribute: 'common',
    type: 'attack',
    cost: 9,
    illust: 'quiz/폭력의환희.webp',
    tooltip: '[ 보존 ]\n피해 150% × 4\n능력으로 드로우 시 이 카드 비용 1 감소'
  },
  {
    name: '금기 : 새겨진 악의',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 2,
    illust: 'quiz/새겨진악의.webp',
    tooltip: '[ 주도 ]\n드로우 1\n핸드의 무작위 카드 발동 2'
  },
  {
    name: '금기 : 영생의 허기',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/영생의허기.webp',
    tooltip: '[ 보존 / 소멸 ]\n감응 : 드로우 1,;행동 포인트 1 획득'
  },
  {
    name: '금기 : 자유의 손짓',
    rarity: 'yellow',
    attribute: 'common',
    type: 'skill',
    cost: 0,
    illust: 'quiz/자유의손짓.webp',
    tooltip: '[ 소멸 / 개전 ]\n핸드의 무작위 카드 1장;비용 1 감소'
  },
  {
    name: '금기 : 허무의 인도',
    rarity: 'yellow',
    attribute: 'common',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/허무의인도.webp',
    tooltip: '[ 개전 ]\n능력으로 드로우 시 치유 40%,;무작위 전투원 스트레스 1 감소'
  },
  {
    name: '금기 : 분노의 초상',
    rarity: 'yellow',
    attribute: 'common',
    type: 'attack',
    cost: 1,
    illust: 'quiz/분노의초상.webp',
    tooltip: '피해 70% × 1\n핸드의 카드 4장당 타격 1회 추가\n타격횟수 만큼 드로우 1'
  },
  {
    name: '발도',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 0,
    illust: 'quiz/발도.webp',
    tooltip: '[ 신속 ]\n피해 120%\n흑운태세 획득\n흑운태세 : 피해량 100% 증가'
  },
  {
    name: '흑운 오의 : 잔',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/흑운오의잔.webp',
    tooltip: '자신의 카드;드로우 1\n흑운태세 획득'
  },
  {
    name: '흑운 오의 : 멸',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/흑운오의멸.webp',
    tooltip: '[ 신속 ]\n피해 200%\n흑운태세 : 타격 1회 추가'
  },
  {
    name: '흑운 심법',
    rarity: 'yellow',
    attribute: 'void',
    type: 'skill',
    cost: 1,
    illust: 'quiz/흑운심법.webp',
    tooltip: '[ 주도 ]\n1턴간 흑운태세 보존\n흑운태세 : 1턴간 자신의 공격 카드 피해량 +40%'
  },
  {
    name: '흑운 오의 : 흑무',
    rarity: 'purple',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/흑운오의흑무.webp',
    tooltip: '피해 120%\n흑운태세 : 핸드의 스킬 카드 수만큼;타격 1회 추가'
  },
  {
    name: '얼음 파편',
    rarity: 'blue',
    attribute: 'justice',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/얼음파편.webp',
    tooltip: '[ 주도 ]\n결정화 3\n턴 시작 시 반격 1'
  },
  {
    name: '빙하의 철권',
    rarity: 'blue',
    attribute: 'justice',
    type: 'attack',
    cost: 2,
    illust: 'quiz/빙하의철권.webp',
    tooltip: '방어 기반 피해 300%\n피해 기반 실드 50%'
  },
  {
    name: '빙벽',
    rarity: 'blue',
    attribute: 'justice',
    type: 'skill',
    cost: 2,
    illust: 'quiz/빙벽.webp',
    tooltip: '실드 200%\n반격 2\n2턴간 반격의 대상이 모든 적으로 적용'
  },
  {
    name: '냉기 충전',
    rarity: 'yellow',
    attribute: 'justice',
    type: 'skill',
    cost: 1,
    illust: 'quiz/냉기충전.webp',
    tooltip: '실드 140%\n모든 적 취약 3'
  },
  {
    name: '혹한의 폭풍',
    rarity: 'purple',
    attribute: 'justice',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/혹한의폭풍.webp',
    tooltip: '[ 주도 ]\n결정화 2\n실드 획득 시 반격 1'
  },
  {
    name: '의지의 돌진',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/의지의돌진.webp',
    tooltip: '[ 분쇄 ]\n방어 기반 피해 140%\n피해 기반 실드 20%\n반격 1'
  },
  {
    name: '마리벨 셀터 MK. II',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/마리벨셀터.webp',
    tooltip: '[ 분쇄 ]\n방어 기반 피해 120%\n피해 기반 실드 100%'
  },
  {
    name: '울브즈 돔',
    rarity: 'blue',
    attribute: 'passion',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/울브즈돔.webp',
    tooltip: '반격 2\n턴 시작 시 반격 1\n결정화 2'
  },
  {
    name: '아~ 그렇구나',
    rarity: 'yellow',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/아그렇구나.webp',
    tooltip: '실드 100%\n반격 1\n모든 적 약화 1'
  },
  {
    name: '셀터 스트라이크',
    rarity: 'purple',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/셀터스트라이크.webp',
    tooltip: '[ 분쇄 ]\n보유한 실드만큼;고정 피해'
  },
  {
    name: '화룡의 보석',
    rarity: 'blue',
    attribute: 'passion',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/화룡의보석.webp',
    tooltip: '[ 유일 / 개전 ]\n자신의 공격 카드의 피해량 20% 증가\n공격 카드 사용 시 대상에게 열정 약점 1'
  },
  {
    name: '승룡각',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/승룡각.webp',
    tooltip: '피해 100%\n잔불 2\n연속 : 타격 1회 추가'
  },
  {
    name: '공방일체',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 0,
    illust: 'quiz/공방일체.webp',
    tooltip: '자신의 기본 카드 드로우 2,;1턴간 사용 시까지;그 카드의 비용 1 감소'
  },
  {
    name: '향족의 정신',
    rarity: 'yellow',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/향족의정신.webp',
    tooltip: '[ 보존 ]\n1턴간 자신의 카드 사용 시;자신의 피해량 +20%'
  },
  {
    name: '화룡경천',
    rarity: 'purple',
    attribute: 'passion',
    type: 'attack',
    cost: 2,
    illust: 'quiz/화룡경천.webp',
    tooltip: '[ 약점 공격 ]\n피해 300%\n파괴 : 잔불 보존'
  },
  {
    name: '물의 근원',
    rarity: 'blue',
    attribute: 'justice',
    type: 'skill',
    cost: 0,
    illust: 'quiz/물의근원.webp',
    tooltip: '치유 100%\n행동 포인트 1 획득'
  },
  {
    name: '파도의 가호',
    rarity: 'blue',
    attribute: 'justice',
    type: 'skill',
    cost: 1,
    illust: 'quiz/파도의가호.webp',
    tooltip: '[ 보존 ]\n치유 100%\n행동 포인트 수만큼;치유량 30% 증가'
  },
  {
    name: '작전 분석',
    rarity: 'blue',
    attribute: 'justice',
    type: 'skill',
    cost: 0,
    illust: 'quiz/작전분석.webp',
    tooltip: '물결 1\n1턴간 치유량 +50%'
  },
  {
    name: '소용돌이',
    rarity: 'yellow',
    attribute: 'justice',
    type: 'attack',
    cost: 2,
    illust: 'quiz/소용돌이.webp',
    tooltip: '모든 적 피해 200%\n타격한 대상 수만큼;치유 50%'
  },
  {
    name: '범람',
    rarity: 'purple',
    attribute: 'justice',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/범람.webp',
    tooltip: '[ 유일 ]\n물결 1\n턴 시작 시 물결 1'
  },
  {
    name: '발사 준비',
    rarity: 'blue',
    attribute: 'passion',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/발사준비.webp',
    tooltip: '[ 유일 / 개전 ]\n"발리스타" 1장 생성\n턴 시작 시 "발리스타" 1장 생성'
  },
  {
    name: '숨돌리기',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/숨돌리기.webp',
    tooltip: '실드 100%\n다른 전투원의 카드;드로우 2'
  },
  {
    name: '결심의 펜던트',
    rarity: 'blue',
    attribute: 'passion',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/결심의펜던트.webp',
    tooltip: '다른 전투원의;스킬 카드 사용 시;장전 1'
  },
  {
    name: '코왈스키 경',
    rarity: 'yellow',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/코왈스키경.webp',
    tooltip: '핸드의 "발리스타" 1장 선택,;발동 시까지 피해량 +100%\n드로우 1'
  },
  {
    name: '폭격 준비',
    rarity: 'purple',
    attribute: 'passion',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/폭격준비.webp',
    tooltip: '[ 유일 ]\n장전 최대 중첩 1 증가\n장전 2'
  },
  {
    name: '빈틈 발견',
    rarity: 'blue',
    attribute: 'justice',
    type: 'attack',
    cost: 1,
    illust: 'quiz/빈틈발견.webp',
    tooltip: '[ 보존 ]\n피해 140%\n보존 : 1턴간 타격 1회 추가'
  },
  {
    name: '충전탄',
    rarity: 'blue',
    attribute: 'justice',
    type: 'attack',
    cost: 2,
    illust: 'quiz/충전탄.webp',
    tooltip: '[ 보존 ]\n피해 240%\n보존 : 피해량 +120%'
  },
  {
    name: '숨겨온 초코바',
    rarity: 'blue',
    attribute: 'justice',
    type: 'skill',
    cost: 0,
    illust: 'quiz/숨겨온초코바.webp',
    tooltip: '[ 소멸 ]\n드로우 3'
  },
  {
    name: '무제한 화력',
    rarity: 'yellow',
    attribute: 'justice',
    type: 'skill',
    cost: 1,
    illust: 'quiz/무제한화력.webp',
    tooltip: '실드 100%\n다음 사용하는 자신의 공격 카드;피해량 +80%'
  },
  {
    name: '중화기 전문가',
    rarity: 'purple',
    attribute: 'justice',
    type: 'skill',
    cost: 1,
    illust: 'quiz/중화기전문가.webp',
    tooltip: '"빈틈 발견" 혹은 "충전탄" 1장 생성,;그 카드에 소멸 부여,;사용 시까지 비용 1 감소'
  },
  {
    name: '호밍 레이저',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 0,
    illust: 'quiz/호밍레이저.webp',
    tooltip: '피해 100%\n잔광 2\n격파 시 무덤에서 핸드로 이동'
  },
  {
    name: '플라스마 미사일',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 1,
    illust: 'quiz/플라스마미사일.webp',
    tooltip: '피해 120%\n강인도 피해 0.5\n대상이 격파되지 않았다면 1번 더 발동'
  },
  {
    name: '샤이닝 코어',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/샤이닝코어.webp',
    tooltip: '"호밍 레이저L" 2장 생성'
  },
  {
    name: '코발트 라이트',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'attack',
    cost: 3,
    illust: 'quiz/코발트라이트.webp',
    tooltip: '무작위 적들에게 피해 120% × 4\n타격당 강인도 피해 1'
  },
  {
    name: '페일 슈팅 스타',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'attack',
    cost: 2,
    illust: 'quiz/페일슈팅스타.webp',
    tooltip: '피해 150%\n뽑을 카드와 무덤의;"호밍 레이저" 3장 발동'
  },
  {
    name: '고배율 조준경',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/고배율조준경.webp',
    tooltip: '표식 2'
  },
  {
    name: '목표 포착',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/목표포착.webp',
    tooltip: '피해 150%\n감응 : 무작위 적 표식 1'
  },
  {
    name: '드론 폭격',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/드론폭격.webp',
    tooltip: '모든 적 피해 120%,;열정 약점 1'
  },
  {
    name: '전술 기동',
    rarity: 'yellow',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/전술기동.webp',
    tooltip: '실드 150%\n강인도 피해 2'
  },
  {
    name: '저격수의 영역',
    rarity: 'purple',
    attribute: 'passion',
    type: 'upgrade',
    cost: 0,
    illust: 'quiz/저격수의영역.webp',
    tooltip: '[ 유일 ]\n표식 피해량 +80%'
  },
  {
    name: '옛날 옛적에',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 1,
    illust: 'quiz/옛날옛적에.webp',
    tooltip: '[ 소멸 2 ]\n뽑을 카드의 무작위 카드 2장 축복 부여,;그 카드 중 1장 드로우'
  },
  {
    name: '우리를 지켜줘',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 1,
    illust: 'quiz/우리를지켜줘.webp',
    tooltip: '다음 2장의 축복 카드 발동 시;축복 카드 드로우 1'
  },
  {
    name: '동화 속 친구들',
    rarity: 'blue',
    attribute: 'void',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/동화속친구들.webp',
    tooltip: '[ 유일 ]\n"멍멍이" 혹은 "곰돌이";1장 선택 생성'
  },
  {
    name: '이야기 속 진실',
    rarity: 'yellow',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/이야기속진실.webp',
    tooltip: '[ 신속 ]\n방어 기반 피해 200%\n1턴간 대상이 받는 피해량 +100%'
  },
  {
    name: '비밀의 정원',
    rarity: 'purple',
    attribute: 'void',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/비밀의정원.webp',
    tooltip: '[ 유일 ]\n실드 200%\n실드 보존 25%'
  },
  {
    name: '호버링 메탈',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 1,
    illust: 'quiz/호버링메탈.webp',
    tooltip: '피해 감소 3\n금속화 2'
  },
  {
    name: '메탈 피어스',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/메탈피어스.webp',
    tooltip: '방어 기반 피해 90% × 2\n금속화 상태라면 금속화 1 감소,;취약 2'
  },
  {
    name: '금속 추출',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 1,
    illust: 'quiz/금속추출.webp',
    tooltip: '금속화 2\n1턴간 결의 2'
  },
  {
    name: '풀 메탈 허리케인',
    rarity: 'yellow',
    attribute: 'order',
    type: 'attack',
    cost: 2,
    illust: 'quiz/풀메탈허리케인.webp',
    tooltip: '모든 적 방어 기반 피해 200%\n1턴간 금속화의 대상이 모든 적으로 적용,;피해량 +20%'
  },
  {
    name: '아이언 스킨',
    rarity: 'purple',
    attribute: 'order',
    type: 'skill',
    cost: 1,
    illust: 'quiz/아이언스킨.webp',
    tooltip: '[ 소멸 / 종극 ]\n1턴간 받는 피해량 20% 감소\n금속화 최대 4 감소\n그 수만큼 받는 피해량 20% 추가 감소'
  },
  {
    name: '성스러운 향로',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/성스러운향로.webp',
    tooltip: '[ 개전 ]\n"피조물★" 2장 생성'
  },
  {
    name: '성장 촉진',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/성장촉진.webp',
    tooltip: '치유 100%\n핸드의 자신의 카드 1장 선택,;보존 효과 2회 발동'
  },
  {
    name: '귀찮아',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 0,
    illust: 'quiz/귀찮아.webp',
    tooltip: '핸드의 카드 수만큼;고정 피해 40%, 치유 20%'
  },
  {
    name: '성장하는 피조물',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/성장하는피조물.webp',
    tooltip: '[ 보존 ]\n"피조물★" 1장 생성\n보존 : 이 카드 "피조물★★★"로 변경'
  },
  {
    name: '빛의 의지',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/빛의의지.webp',
    tooltip: '치유 200%\n핸드의 모든 카드의;보존 효과 발동'
  },
  {
    name: '바람 충전',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/바람충전.webp',
    tooltip: '다음 사용하는 자신의 공격 카드;타격 1회 추가'
  },
  {
    name: '바람 베기',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 2,
    illust: 'quiz/바람베기.webp',
    tooltip: '모든 적 피해 280%'
  },
  {
    name: '방어구 부수기',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/방어구부수기.webp',
    tooltip: '피해 140%\n취약 2'
  },
  {
    name: '바람타기',
    rarity: 'yellow',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/바람타기.webp',
    tooltip: '실드 150%\n버린 카드에서 "바람 충전"을;핸드로 이동'
  },
  {
    name: '질풍의 일격',
    rarity: 'purple',
    attribute: 'passion',
    type: 'attack',
    cost: 2,
    illust: 'quiz/질풍의일격.webp',
    tooltip: '피해 300%\n실드 130%'
  },
  {
    name: '제압 준비',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 0,
    illust: 'quiz/제압준비.webp',
    tooltip: '자신의 공격 카드 드로우 1\n1턴간 그 카드 피해량 40% 증가'
  },
  {
    name: '훔쳐베기',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 2,
    illust: 'quiz/훔쳐베기.webp',
    tooltip: '모든 적 피해 220%\n단일 대상일 경우 피해량 50% 증가\n영감 : 비용 1 감소'
  },
  {
    name: '눈속임 일격',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/눈속임일격.webp',
    tooltip: '[ 보존 ]\n피해 180%\n핸드의 무작위 자신의 카드 1장;영감 효과 활성화'
  },
  {
    name: '빙점 칼날',
    rarity: 'yellow',
    attribute: 'order',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/빙점칼날.webp',
    tooltip: '[ 유일 ]\n자신의 영감 효과가 활성화된 카드 사용 시;모든 적 피해 120%'
  },
  {
    name: '빙산 가르기',
    rarity: 'purple',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/빙산가르기.webp',
    tooltip: '모든 적 피해 180%\n영감 : 타격 1회 추가'
  },
  {
    name: '업화',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/업화.webp',
    tooltip: '[ 개전 ]\n피해 100% × 2\n주박술 1\n주박술 : 타격 1회 추가'
  },
  {
    name: '츠쿠요미',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/츠쿠요미.webp',
    tooltip: '다음 사용하는 자신의 공격 카드;타격 수만큼 도깨비불 3'
  },
  {
    name: '황혼의 결속',
    rarity: 'blue',
    attribute: 'void',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/황혼의결속.webp',
    tooltip: '[ 개전 / 유일 ]\n턴 시작 시 구속 획득\n무작위 다른 전투원의 카드 2장;사용 시까지 비용 1 감소'
  },
  {
    name: '도깨비 사냥',
    rarity: 'yellow',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/도깨비사냥.webp',
    tooltip: '[ 신속 ]\n피해 70% × 3\n다음 사용하는 결속 카드 피해량 +80%'
  },
  {
    name: '달그림자',
    rarity: 'purple',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/달그림자.webp',
    tooltip: '[ 결속 1 / 보존 ]\n피해 80% × 1\n결속 중첩 수만큼 피해량 +80%'
  },
  {
    name: '팝 아이드 파퍼',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/팝아이드파퍼.webp',
    tooltip: '4개의 퀘스트 중 무작위 1개 시작'
  },
  {
    name: '데블 다이스',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 1,
    illust: 'quiz/데블다이스.webp',
    tooltip: '피해 160%\n드로우 1'
  },
  {
    name: '카드 섞기',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/카드섞기.webp',
    tooltip: '[ 소멸 ]\n핸드의 모든 카드 버리기\n그 수만큼 드로우'
  },
  {
    name: '다이스 트릭',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'attack',
    cost: 2,
    illust: 'quiz/다이스트릭.webp',
    tooltip: '피해 240%\n1턴간 사기 1 감소\n완료한 퀘스트 수만큼 비용 감소'
  },
  {
    name: '조커',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/조커.webp',
    tooltip: '뽑을 카드에서;1장 선택 드로우'
  },
  {
    name: '허무의 잔상',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/허무의잔상.webp',
    tooltip: '피해 320%\n"허무" 2장 생성'
  },
  {
    name: '소멸의 낙인',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 3,
    illust: 'quiz/소멸의낙인.webp',
    tooltip: '모든 적 피해 400%\n카드 소멸 시 이 카드 1턴간;사용 시까지 비용 1 감소'
  },
  {
    name: '블랙홀',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 2,
    illust: 'quiz/블랙홀.webp',
    tooltip: '피해 240%\n소멸된 "허무" 수만큼;피해량 +40%'
  },
  {
    name: '허망의 서약',
    rarity: 'yellow',
    attribute: 'void',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/허망의서약.webp',
    tooltip: '[ 유일 ]\n"허무" 생성 시 피해, 치유 100% 효과를 가진;비용 1의 공격 카드로 변경'
  },
  {
    name: '무환의 울림',
    rarity: 'purple',
    attribute: 'void',
    type: 'attack',
    cost: 2,
    illust: 'quiz/무환의울림.webp',
    tooltip: '피해 240%\n"허무" 3장 생성\n그 수만큼 피해량 +40%'
  },
  {
    name: '벌쳐 사출',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 3,
    illust: 'quiz/벌쳐사출.webp',
    tooltip: '[ 천상 / 보존 ]\n모든 적 방어 기반 피해 120%\n실드 100%\n은빛 장막 1'
  },
  {
    name: '대검 아퀼라',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 1,
    illust: 'quiz/대검아퀼라.webp',
    tooltip: '모든 적 방어 기반 피해 150%\n핸드에 "벌쳐 사출"이 있다면;비용 1 증가, 피해량 +100%'
  },
  {
    name: '위압',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 2,
    illust: 'quiz/위압.webp',
    tooltip: '실드 250%\n모든 적 강인도 피해 1'
  },
  {
    name: '재집결',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'skill',
    cost: 1,
    illust: 'quiz/재집결.webp',
    tooltip: '실드 120%\n비용이 가장 높은 카드;드로우 1'
  },
  {
    name: '절대 수호',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'skill',
    cost: 'X',
    illust: 'quiz/절대수호.webp',
    tooltip: '[ 종극 ]\nX만큼 실드 100%\n1턴간 핸드의 모든 카드 보존'
  },
  {
    name: '뮤직 스타트',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 0,
    illust: 'quiz/뮤직스타트.webp',
    tooltip: '[ 유일 / 개막 ]\n모든 기본 공격 카드 소멸\n뽑을 카드에 아군의 리듬 2장씩 생성\n자신의 리듬 카드에 신속 부여'
  },
  {
    name: '스포트라이트',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/스포트라이트.webp',
    tooltip: '피해 140%\n리듬 카드 1장 핸드로 이동\n발동 시까지 비용 2 감소'
  },
  {
    name: '콜 & 리스폰스',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/콜리스폰스.webp',
    tooltip: '[ 신속 ]\n피해 200%\n핸드에 있다면 리듬 카드로도 취급\n감응 : 리듬 카드 드로우 1'
  },
  {
    name: '앙코르',
    rarity: 'yellow',
    attribute: 'passion',
    type: 'attack',
    cost: 1,
    illust: 'quiz/앙코르.webp',
    tooltip: '피해 120%\n직전 발동한 카드가 리듬 카드라면;그 카드 발동'
  },
  {
    name: '포토 타임',
    rarity: 'purple',
    attribute: 'passion',
    type: 'skill',
    cost: 1,
    illust: 'quiz/포토타임.webp',
    tooltip: '[ 유일 / 보존 ]\n무대의 열기 1\n리듬 카드가 발동하거나 핸드로 이동하면;이 카드 발동 시까지 무대의 열기 1 증가 (최대 9회)'
  },
  {
    name: '단검 꺼내기',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 1,
    illust: 'quiz/단검꺼내기.webp',
    tooltip: '"그림자 단검" 2장 생성'
  },
  {
    name: '저주 부여',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/저주부여.webp',
    tooltip: '1턴간 공격 카드 사용 시;대상에게 고통 1'
  },
  {
    name: '그림자 장전',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 1,
    illust: 'quiz/그림자장전.webp',
    tooltip: '치유 100%\n"상급 그림자 단검" 1장 생성'
  },
  {
    name: '급소 공격',
    rarity: 'yellow',
    attribute: 'void',
    type: 'attack',
    cost: 2,
    illust: 'quiz/급소공격.webp',
    tooltip: '피해 80% × 3\n대상이 고통 상태라면;피해량 +50%'
  },
  {
    name: '저주 도려내기',
    rarity: 'purple',
    attribute: 'void',
    type: 'skill',
    cost: 1,
    illust: 'quiz/저주도려내기.webp',
    tooltip: '대상이 보유한 자신의 고통 발동'
  },
  {
    name: '퀀텀 시드',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 0,
    illust: 'quiz/퀀텀시드.webp',
    tooltip: '치유 100%\n뽑을 카드에 창조 카드 2장 생성\n그 중 1장 드로우'
  },
  {
    name: '항상 결집',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 1,
    illust: 'quiz/항상결집.webp',
    tooltip: '[ 보존 ]\n창조 카드 2장 드로우\n그 카드들의 무작위 효과 1턴간 2배'
  },
  {
    name: '창조와 파괴',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/창조와파괴.webp',
    tooltip: '방어 기반 피해 120%\n실드 80%\n치유 80%\n조율 : 모든 효과 2배'
  },
  {
    name: '쌍생성',
    rarity: 'yellow',
    attribute: 'order',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/쌍생성.webp',
    tooltip: '[ 유일 ]\n창조 카드 2장 생성 시;버린 카드에 동일한 카드 1장 생성'
  },
  {
    name: '사건의 지평선',
    rarity: 'purple',
    attribute: 'order',
    type: 'skill',
    cost: 2,
    illust: 'quiz/사건의지평선.webp',
    tooltip: '[ 유일 / 형상 강화 ]\n행동 포인트 1\n드로우 1\n다음 공격 카드의 첫 타격 피해량 40% 증가'
  },
  {
    name: '구마의 형세',
    rarity: 'blue',
    attribute: 'void',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/구마의형세.webp',
    tooltip: '[ 개전 / 유일 ]\n능력으로 드로우 시 강림 1\n뽑을 카드에 "염무곡" 8장 생성'
  },
  {
    name: '독무',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/독무.webp',
    tooltip: '드로우 2\n드로우한 카드 중 비용이 1 이상인;카드 모두 버리기'
  },
  {
    name: '밤새 내리는 비',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/밤새내리는비.webp',
    tooltip: '염무 1\n연속 "염무곡" 1장 드로우'
  },
  {
    name: '혼염무',
    rarity: 'yellow',
    attribute: 'void',
    type: 'attack',
    cost: 'X',
    illust: 'quiz/혼염무.webp',
    tooltip: '피해 100% × X+1\n드로우 X'
  },
  {
    name: '염무무곡',
    rarity: 'purple',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/염무무곡.webp',
    tooltip: '[ 소멸 / 유일 ]\n이번 턴에 획득한 강림 수만큼;"염무곡" 핸드로 이동'
  },
  {
    name: '염무곡',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 0,
    illust: 'quiz/염무곡.webp',
    tooltip: '피해 70%\n염무 1\n이 카드로 염무 발동 시 드로우 1'
  },
  {
    name: '낙구천',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 0,
    illust: 'quiz/낙구천.webp',
    tooltip: '[ 증발 / 소멸 ]\n피해 110% × 3'
  },
  {
    name: '앵커 슛',
    rarity: 'blue',
    attribute: 'justice',
    type: 'attack',
    cost: 2,
    illust: 'quiz/앵커슛.webp',
    tooltip: '[ 분쇄 ]\n피해 300%\n이 카드를 사용한 수만큼 피해량 +100% (최대 10)'
  },
  {
    name: '앵커포인터',
    rarity: 'blue',
    attribute: 'justice',
    type: 'skill',
    cost: 0,
    illust: 'quiz/앵커포인터.webp',
    tooltip: '뽑을 카드 혹은 무덤에서;"앵커 슛"을 핸드로 이동'
  },
  {
    name: '파워 차지',
    rarity: 'blue',
    attribute: 'justice',
    type: 'attack',
    cost: 2,
    illust: 'quiz/파워차지.webp',
    tooltip: '모든 적 피해 180%\n단일 대상일 경우 피해량 +80%'
  },
  {
    name: '에너지 충전',
    rarity: 'yellow',
    attribute: 'justice',
    type: 'skill',
    cost: 1,
    illust: 'quiz/에너지충전.webp',
    tooltip: '[ 보존 ]\n1턴간 자신의 공격 카드;피해량 30% 증가'
  },
  {
    name: '끌어올리기',
    rarity: 'purple',
    attribute: 'justice',
    type: 'skill',
    cost: 0,
    illust: 'quiz/끌어올리기.webp',
    tooltip: '[ 보존 ]\n핸드의 "앵커 슛" 1턴간 사용 시까지;피해량 80% 증가'
  },
  {
    name: '사냥 본능',
    rarity: 'blue',
    attribute: 'order',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/사냥본능.webp',
    tooltip: '[ 개전 ]\n다른 전투원의 강화 혹은 스킬 카드 사용 시;사냥 개시 1'
  },
  {
    name: '단검 방사',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/단검방사.webp',
    tooltip: '[ 신속 ]\n무작위 적들에게 피해 60% × 3\n타격한 대상 수만큼 사냥 개시'
  },
  {
    name: '빠른 해결법',
    rarity: 'blue',
    attribute: 'order',
    type: 'attack',
    cost: 1,
    illust: 'quiz/빠른해결법.webp',
    tooltip: '[ 신속 ]\n피해 80% × 2\n사냥 개시 상태라면;공격 카드 1장 드로우'
  },
  {
    name: '딩고 하울링',
    rarity: 'yellow',
    attribute: 'order',
    type: 'skill',
    cost: 1,
    illust: 'quiz/딩고하울링.webp',
    tooltip: '실드 100%\n사냥 개시 2'
  },
  {
    name: '해결사의 방식',
    rarity: 'purple',
    attribute: 'order',
    type: 'upgrade',
    cost: 1,
    illust: 'quiz/해결사의방식.webp',
    tooltip: '[ 유일 ]\n사냥 개시의 추가 공격;피해량 40% 증가'
  },
  {
    name: '발리스타',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: '-',
    illust: 'quiz/발리스타.webp',
    tooltip: '[ 증발 ]\n턴 종료 시 무작위 적 추가 공격 150%'
  },
  {
    name: '극광검',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 0,
    illust: 'quiz/극광검.webp',
    tooltip: '[ 연결 ]\n피해 100%\n버려질 시 무작위 적 추가 공격 100%\n이 카드는 셔플 시 뽑을 카드로 이동하지 않음'
  },
  {
    name: '극광 해방',
    rarity: 'purple',
    attribute: 'passion',
    type: 'attack',
    cost: 0,
    illust: 'quiz/극광해방.webp',
    tooltip: '[ 유일 ]\n피해 300%\n무덤의 "극광검" 모두 소멸하고 그 수만큼 피해량 +60%\n턴 종료 시 이 카드 "극광 응축"으로 변경'
  },
  {
    name: '멍멍이',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 0,
    illust: 'quiz/멍멍이.webp',
    tooltip: '[ 신속 / 축복 ]\n방어 기반 피해 72%'
  },
  {
    name: '곰돌이',
    rarity: 'blue',
    attribute: 'void',
    type: 'skill',
    cost: 0,
    illust: 'quiz/곰돌이.webp',
    tooltip: '[ 신속 / 축복 ]\n실드 240%\n피해 감소 2'
  },
  {
    name: '진혼의 탄환',
    rarity: 'blue',
    attribute: 'void',
    type: 'attack',
    cost: 1,
    illust: 'quiz/진혼의탄환.webp',
    tooltip: '[ 탄환 / 소멸 ]\n피해 160%\n버린 카드로 이동 시;무작위 적 추가 공격 120%'
  },
  {
    name: '하트 브레이커',
    rarity: 'blue',
    attribute: 'passion',
    type: 'attack',
    cost: 0,
    illust: 'quiz/하트브레이커.webp',
    tooltip: '[ 탄환 / 신속 / 소멸 ]\n피해 80%\n무작위 탄환 버리기 1\n버려질 시 무작위 적 추가 공격 120%'
  },
  {
    name: '하트 쉐이커',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 0,
    illust: 'quiz/하트쉐이커.webp',
    tooltip: '[ 탄환 / 신속 / 소멸 ]\n공명 1\n뽑을 카드에서 무작위 카드 버리기 1\n버려질 시 무작위 적 공명 2'
  },
  {
    name: '큐피드 샷',
    rarity: 'blue',
    attribute: 'passion',
    type: 'skill',
    cost: 0,
    illust: 'quiz/큐피드샷.webp',
    tooltip: '[ 탄환 / 안식 ]\n피해 120%\n핸드의 탄환 수만큼 무작위 적 추가 공격 60%'
  },
  {
    name: '말랑이★',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 0,
    illust: 'quiz/말랑이1.webp',
    tooltip: '[ 소멸 / 보존 / 피조물 ]\n1턴간 피해량 10% 증가\n보존 : 다음 사용하는 공격 카드의 피해량 10% 증가'
  },
  {
    name: '말랑이★★',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'skill',
    cost: 0,
    illust: 'quiz/말랑이2.webp',
    tooltip: '[ 소멸 / 보존 / 피조물 ]\n1턴간 피해량 20% 증가\n보존 : 다음 사용하는 공격 카드의 피해량 20% 증가'
  },
  {
    name: '말랑이★★★',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'skill',
    cost: 0,
    illust: 'quiz/말랑이3.webp',
    tooltip: '[ 소멸 / 보존 / 피조물 ]\n1턴간 피해량 35% 증가\n보존 : 다음 사용하는 공격 카드의 피해량 35% 증가'
  },
  {
    name: '날렵이★',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'attack',
    cost: 0,
    illust: 'quiz/날렵이1.webp',
    tooltip: '[ 소멸 / 보존 / 피조물 ]\n피해 100%\n보존 : 피해량 +40%'
  },
  {
    name: '날렵이★★',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'attack',
    cost: 0,
    illust: 'quiz/날렵이2.webp',
    tooltip: '[ 소멸 / 보존 / 피조물 ]\n피해 200%\n보존 : 피해량 +80%'
  },
  {
    name: '날렵이★★★',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'attack',
    cost: 0,
    illust: 'quiz/날렵이3.webp',
    tooltip: '[ 소멸 / 보존 / 피조물 ]\n피해 350%\n보존 : 피해량 +150%'
  },
  {
    name: '튼튼이★',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    cost: 0,
    illust: 'quiz/튼튼이1.webp',
    tooltip: '[ 소멸 / 보존 / 피조물 ]\n실드 100%\n보존 : 치유 60%'
  },
  {
    name: '튼튼이★★',
    rarity: 'yellow',
    attribute: 'instinct',
    type: 'skill',
    cost: 0,
    illust: 'quiz/튼튼이2.webp',
    tooltip: '[ 소멸 / 보존 / 피조물 ]\n실드 200%\n보존 : 치유 120%'
  },
  {
    name: '튼튼이★★★',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'skill',
    cost: 0,
    illust: 'quiz/튼튼이3.webp',
    tooltip: '[ 소멸 / 보존 / 피조물 ]\n실드 350%\n보존 : 치유 200%'
  },
  {
    name: '창조 : ○',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 0,
    illust: 'quiz/창조1.webp',
    tooltip: '[ 소멸 ]\n치유 50%\n행동 포인트 1'
  },
  {
    name: '창조 : △',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 0,
    illust: 'quiz/창조2.webp',
    tooltip: '[ 소멸 ]\n실드 50%\n다음 공격 카드의 첫 타격 피해량 30% 증가 (최대 300%)'
  },
  {
    name: '창조 : □',
    rarity: 'blue',
    attribute: 'order',
    type: 'skill',
    cost: 0,
    illust: 'quiz/창조3.webp',
    tooltip: '[ 소멸 ]\n치유 50%\n창조 카드 1장 드로우'
  },
  {
    name: '운명 각인',
    rarity: 'blue',
    attribute: 'justice',
    type: 'attack',
    cost: 2,
    illust: 'quiz/운명각인.webp',
    tooltip: '[ 보존 / 소멸 ]\n이 카드 비용만큼 피해 120%\n핸드의 모든 "운명 각인" 비용 1 증가\n이 카드가 핸드를 벗어날 시 비용 2로 변경'
  },
  {
    name: '운명 왜곡',
    rarity: 'blue',
    attribute: 'justice',
    type: 'skill',
    cost: 0,
    illust: 'quiz/운명왜곡.webp',
    tooltip: '[ 증발 / 소멸 ]\n다음 사용하는 자신의 공격 카드 피해량 30% 증가\n그 카드 비용만큼 피해량 추가로 10% 증가'
  }
];
