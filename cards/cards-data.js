// ============================================================
// 카드 정보 데이터 편집 파일
// ------------------------------------------------------------
// 전투원 id(agents/agents-data.js의 id)를 키로 해서, 그 전투원의 카드 배열을 적으면 됩니다.
// 카드 이미지/영상 파일은 cards/{전투원 이름} 폴더에 넣고 media 경로에 적어주세요.
//
// 각 카드 항목 설명:
//   name      : 카드 이름
//   cost      : 카드 코스트. 보통 숫자, 'X'나 '-' 처럼 텍스트로 쓰고 싶으면 따옴표로 감싸서 적으면 그대로 표시됩니다.
//   type      : 카드 유형 — attack(공격) / skill(스킬) / upgrade(강화)
//   grade     : 카드 등급 — gray(회색) / blue(파랑) / yellow(노랑) / purple(보라).
//               비워두면('') 8장 목록에는 안 나오고, plus_card로만 참조되는 숨김 카드가 됩니다.
//   plus_card : (선택) 이 카드에 커서를 올렸을 때 왼쪽에 추가로 보여줄 다른 카드의 이름.
//               그 카드는 등급을 비워두면 이 카드의 등급 색을 그대로 물려받습니다.
//   media     : 카드 일러스트 경로. .webm/.mp4면 자동으로 영상(상시 재생)으로, 그 외엔 이미지로 표시됩니다.
//   tooltip   : 카드 설명 텍스트. 아래 규칙이 자동으로 적용되니 <color> 태그는 더 이상 쓰지 않아도 됩니다.
//               - [대괄호] 로 감싼 부분은 대괄호 포함 EAAA00 색
//               - 숫자는 전부 7EE4FF 색 (예: +60% 중 60만)
//               - "따옴표" 로 감싼 부분은 따옴표를 지우고 7EE4FF 색 + 밑줄
//               - 그 외 나머지는 흰색
//               줄바꿈하고 싶은 곳은 Enter로 줄을 바꾸면 그대로 반영됩니다.
// ============================================================

window.AGENTS_CARDS = {
  hilde: [
    {
      name: '멀티샷',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/힐데/attack.webp',
      tooltip: '모든 적 피해 60%'
    },
    {
      name: '멀티샷',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/힐데/attack.webp',
      tooltip: '모든 적 피해 60%'
    },
    {
      name: '보우 가드',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/힐데/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '퀴버 로딩',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      plus_card: '호밍 애로우',
      media: 'cards/힐데/blue1.webp',
      tooltip: '[주도]\n뽑을 카드에 "호밍 애로우" 3장 생성'
    },
    {
      name: '호밍 애로우',
      cost: '-',
      type: 'attack',
      grade: '',
      media: 'cards/힐데/blue1_1.webp',
      tooltip: '[사용불가 / 소멸]\n체력이 가장 낮은 적 추가 공격 120%\n드로우 1\n감응: 이 카드 발동'
    },
    {
      name: '플라즈마 레인',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/힐데/blue2.webp',
      tooltip: '모든 적 피해 60%, 이온화 2'
    },
    {
      name: '드로우 & 릴리즈',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/힐데/blue3.webp',
      tooltip: '자신의 공격 카드 드로우 2\n1턴간 사용 시까지 그 카드 피해량 +50%'
    },
    {
      name: '빅 게임 레인저',
      cost: 1,
      type: 'upgrade',
      grade: 'yellow',
      media: 'cards/힐데/yellow.webp',
      tooltip: '[유일 / 주도]\n타격 시 일점 조준 2'
    },
    {
      name: '볼텍스 애로우',
      cost: 1,
      type: 'attack',
      grade: 'purple',
      media: 'cards/힐데/purple.webp',
      tooltip: '[유일]\n드로우 3\n모든 적 피해 120%\n이번 턴 드로우한 공격 카드 수만큼 피해량 +60% (최대 8장)'
    }
  ]
};
