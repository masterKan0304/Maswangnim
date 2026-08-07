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
//   awakenings : (선택, grade가 blue나 yellow인 카드만) 번뜩임 5단계 배열.
//               각 항목은 cost / type / tooltip 만 새로 적으면 되고(등급·일러스트는 원본 카드 그대로 사용),
//               plus_card도 단계별로 다르게 적거나 아예 안 적을 수 있습니다(안 적으면 그 단계는 plus_card 없음).
//               이 필드가 있으면 카드에 커서를 올렸을 때 확대 미리보기 대신 "번뜩임" 안내가 뜨고,
//               클릭하면 5장이 나열되는 번뜩임 화면이 열립니다.
//               번뜩임 카드의 tooltip에서만 추가로 쓸 수 있는 표시:
//                 - |텍스트| 로 감싼 부분: 대괄호/숫자/따옴표였던 색은 99D81F로, 나머지는 E1FFD2로 바뀝니다.
//                   (예: |[ 주도 ]| 도 정상적으로 99D81F가 됩니다)
//                 - \텍스트\ 로 감싼 부분: CE4A5F 색이 됩니다.
//                   ⚠️ 주의: \ 바로 뒤에 숫자가 오면(예: \2\) 반드시 \\2\\ 처럼 백슬래시를 두 번 써야 합니다.
//                   한 번만 쓰면(\2\) 자바스크립트가 그 부분을 통째로 이상한 문자로 바꿔버려서
//                   숫자와 백슬래시가 전부 사라지고 깨진 모양으로 보입니다. 숫자가 아닌 글자가 바로
//                   뒤에 올 때는 한 번(\텍스트\)만 써도 괜찮습니다.
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
      tooltip: '[ 주도 ]\n뽑을 카드에 "호밍 애로우" 3장 생성',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 주도 ]\n뽑을 카드에 "호밍 애로우" |4|장 생성, |그 카드 중 1장 드로우|', plus_card: '호밍 애로우' },
        { cost: 1, type: 'skill', tooltip: '[ 주도 ]\n뽑을 카드에 |"호밍 애로우(균열)"| 3장 생성', plus_card: '호밍 애로우(균열)' },
        { cost: 1, type: 'skill', tooltip: '[ 주도 ]\n뽑을 카드에 |"호밍 애로우(특대)"| \\1\\장 생성', plus_card: '호밍 애로우(특대)' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 / 주도 ]|\n뽑을 카드에 "호밍 애로우" \\2\\장 생성\n|적 처치 시 뽑을 카드에 "호밍 애로우" 2장 생성 (턴당 5회)|', plus_card: '호밍 애로우' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 / 개막 ]|\n|턴 시작 시| 뽑을 카드에 "호밍 애로우" 3장 생성\n|"호밍 애로우"가 턴 드로우 대상이 되지 않음|', plus_card: '호밍 애로우' }
      ]
    },
    {
      name: '호밍 애로우',
      cost: '-',
      type: 'attack',
      grade: '',
      media: 'cards/힐데/blue1_1.webp',
      tooltip: '[ 사용불가 / 소멸 ]\n체력이 가장 낮은 적 추가 공격 120%\n드로우 1\n감응: 이 카드 발동'
    },
    {
      name: '호밍 애로우(균열)',
      cost: '-',
      type: 'attack',
      grade: '',
      media: 'cards/힐데/blue1_2.webp',
      tooltip: '[ 사용불가 / 소멸 ]\n모든 적 추가 공격 50%\n균열 1\n드로우 1\n감응: 이 카드 발동'
    },
    {
      name: '호밍 애로우(특대)',
      cost: '-',
      type: 'attack',
      grade: '',
      media: 'cards/힐데/blue1_3.webp',
      tooltip: '[ 사용불가 / 소멸 ]\n체력이 가장 높은 적 추가 공격 500%\n드로우 1\n감응: 이 카드 발동'
    },
    {
      name: '플라즈마 레인',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/힐데/blue2.webp',
      tooltip: '모든 적 피해 60%, 이온화 2',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '|[ 주도 ]|\n모든 적 피해 |100|%, 이온화 2\n|감응: 무작위 적 이온화 2|' },
        { cost: 1, type: 'skill', tooltip: '|[ 주도 ]|\n|모든 적| 이온화 |3|\n|드로우 1|' },
        { cost: 1, type: 'attack', tooltip: '모든 적 피해 |100|%, 이온화 |3|\n|처치: 모든 적 균열 3 (최대 1회)|' },
        { cost: 3, type: 'attack', tooltip: '|[ 점화 ]|\n모든 적 |관통 피해 180|%, 이온화 |3|' },
        { cost: 1, type: 'attack', tooltip: '모든 적 피해 |120|%\n|자신의 공격 카드 드로우 1|\n|연속: 비용 1 감소|' }
      ]
    },
    {
      name: '드로우 & 릴리즈',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/힐데/blue3.webp',
      tooltip: '자신의 공격 카드 드로우 2\n1턴간 사용 시까지 그 카드 피해량 +50%',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '|[ 주도 ]|\n자신의 공격 카드 드로우 2\n1턴간 사용 시까지 그 카드 피해량 +50%' },
        { cost: 1, type: 'skill', tooltip: '|[ 주도 ]|\n|드로우| 2\n|다음 3번 자신의 추가 공격 시 모든 적 균열 1|' },
        { cost: 0, type: 'skill', tooltip: '|핸드의 모든 카드 뽑을 카드로 이동, 그 수만큼 드로우|' },
        { cost: 1, type: 'skill', tooltip: '|주도| 카드 드로우 2\n1턴간 사용 시까지 그 카드 |비용 1 감소|' },
        { cost: 2, type: 'skill', tooltip: '|이번 턴 능력으로 드로우한 카드 수만큼 다음 자신의 공격 카드 피해량 30% 증가 (최대 300%)|' }
      ]
    },
    {
      name: '빅 게임 레인저',
      cost: 1,
      type: 'upgrade',
      grade: 'yellow',
      media: 'cards/힐데/yellow.webp',
      tooltip: '[ 유일 / 주도 ]\n타격 시 일점 조준 2',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 주도 ]\n타격 시 일점 조준 |3|' },
        { cost: 0, type: 'upgrade', tooltip: '|[ 유일 / 개전 ]|\n|드로우 2|\n타격 시 일점 조준 2' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 주도 ]\n타격 시 일점 조준 2\n|감응 효과 발동 시 일점 조준 2|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 주도 ]\n|능력으로 해로운 효과 부여 시| 일점 조준 |5|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 주도 ]\n|턴 시작 시| 일점 조준 |30|\n|자신의 공격 카드 사용 불가|' }
      ]
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
