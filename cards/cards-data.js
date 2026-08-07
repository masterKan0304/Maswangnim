// ============================================================
// 카드 정보 데이터 편집 파일
// ------------------------------------------------------------
// 전투원 id(agents/agents-data.js의 id)를 키로 해서, 그 전투원의 카드 배열을 적으면 됩니다.
// 카드 이미지/영상 파일은 cards/{전투원 이름} 폴더에 넣고 media 경로에 적어주세요.
//
// 각 카드 항목 설명:
//   name    : 카드 이름
//   cost    : 카드 코스트 (숫자, 또는 'X')
//   type    : 카드 유형 — attack(공격) / skill(스킬) / upgrade(강화)
//   grade   : 카드 등급 — gray(회색) / blue(파랑) / yellow(노랑) / purple(보라)
//   media   : 카드 일러스트 경로. .webm/.mp4면 자동으로 영상(상시 재생)으로, 그 외엔 이미지로 표시됩니다.
//   tooltip : 카드 설명 텍스트. <color=#RRGGBB>강조할 부분</color> 으로 감싸면 그 부분만 색이 칠해집니다.
//             줄바꿈하고 싶은 곳은 Enter로 줄을 바꾸면 그대로 반영됩니다.
// ============================================================

window.AGENTS_CARDS = {
  hilde: [
    {
      name: '멀티샷',
      cost: 1,
      type: 'attack',
      grade: 'purple',
      media: 'cards/힐데/attack.webp',
      tooltip: '모든 적 피해 <color=#ff5714>60%</color>'
    },
    {
      name: '볼텍스 애로우',
      cost: 1,
      type: 'attack',
      grade: 'purple',
      media: 'cards/힐데/purple.webm',
      tooltip: '<color=#ff5714>[유일]</color> 드로우 3\n이번 턴 능력으로 드로우한 공격 카드 수만큼 피해량 <color=#ff5714>+60%</color> (최대 8장)'
    },
    {
      name: '보우 가드',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/힐데/skill.webp',
      tooltip: '실드 <color=#5486d2>100%</color>'
    },
    {
      name: '퀴버 로딩',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/힐데/blue1.webm',
      tooltip: '<color=#5486d2>[주도]</color>\n뽑을 카드에 호밍 애로우 3장 생성'
    },
    {
      name: '드로우 & 릴리즈',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/힐데/blue2.webm',
      tooltip: '자신의 공격 카드 드로우 2\n1턴간 사용 시까지 그 카드 피해량 <color=#5486d2>+50%</color>'
    },
    {
      name: '속사',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/힐데/blue3.webm',
      tooltip: '다음 공격 카드의 코스트 <color=#5486d2>-1</color>\n(최소 0)'
    },
    {
      name: '빅 게임 레인저',
      cost: 1,
      type: 'upgrade',
      grade: 'yellow',
      media: 'cards/힐데/yellow.webm',
      tooltip: '<color=#f5c542>[유일] [주도]</color>\n타격 시 일점 조준 2'
    }
  ]
};
