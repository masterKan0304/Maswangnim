// ============================================================
// 카제나 카드 맞히기 - 퀴즈용 카드 데이터 편집 파일
// ------------------------------------------------------------
// window.QUIZ_CARDS 배열에 카드를 하나씩 추가하면 됩니다.
// 데일리는 오늘 날짜를 기준으로 이 배열 중 하나가 자동으로 고정되고,
// 자유 모드는 이 배열 중 하나가 무작위로 뽑힙니다.
//
// 각 카드 항목 설명:
//   name          : 카드 이름 (정답으로 입력해야 하는 값이자 자동완성 목록에 쓰입니다)
//   rarity        : 희귀도 — gray(일반) / blue(희귀) / yellow(전설) / purple(신화)
//   attribute     : 속성 — passion(열정) / order(질서) / instinct(본능) / justice(정의) /
//                   void(공허) / common(공용) / monster(몬스터)
//   type          : 유형 — attack(공격) / skill(스킬) / upgrade(강화)
//   illustColor   : 일러스트 색상 — red(빨강) / blue(파랑) / green(초록) / yellow(노랑) /
//                   purple(보라) / brown(갈색) / gray(회색) / white(하양) / pink(분홍) / black(검정)
//   illust        : 실제 카드 일러스트 이미지 경로. 정답을 맞히면 이 이미지가 공개됩니다.
//                   (quiz/{카드 이름} 등 원하는 경로에 이미지를 넣고 적어주세요)
//   specialAbility: 카드 툴팁 맨 위에 붙는 대괄호 표기. 예) '[ 주도 ]', '[ 유일 / 주도 ]'
//                   없는 카드는 '' 로 비워두면 정보 버튼에 "특수 능력 없음"이 표시됩니다.
//   tooltip       : 카드 설명 텍스트. 숫자(%나 x배수 포함)는 ? 로, 나머지 텍스트는 XXX로
//                   가려진 채 시작해서 정보 버튼을 누를 때마다 하나씩 무작위로 드러납니다.
//                   줄바꿈은 Enter로, 쉼표(,)와 콜론(:)은 그대로 노출됩니다.
// ============================================================

window.QUIZ_CARDS = [
  {
    name: '멀티샷',
    rarity: 'gray',
    attribute: 'instinct',
    type: 'attack',
    illustColor: 'gray',
    illust: 'cards/힐데/attack.webp',
    specialAbility: '',
    tooltip: '모든 적 피해 60%'
  },
  {
    name: '퀴버 로딩',
    rarity: 'blue',
    attribute: 'instinct',
    type: 'skill',
    illustColor: 'blue',
    illust: 'cards/힐데/blue1.webp',
    specialAbility: '[ 주도 ]',
    tooltip: '뽑을 카드에 "호밍 애로우" 3장 생성, 이번 턴 능력으로 드로우한 카드 수만큼 피해량 +30% (최대 300%)'
  },
  {
    name: '볼텍스 애로우',
    rarity: 'purple',
    attribute: 'instinct',
    type: 'attack',
    illustColor: 'yellow',
    illust: 'cards/힐데/purple.webp',
    specialAbility: '',
    tooltip: '드로우 3\n모든 적 피해 120%, 이번 턴 드로우한 공격 카드 수만큼 피해량 +60% (최대 8장)'
  }
];
