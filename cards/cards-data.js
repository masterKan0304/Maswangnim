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
//                 - \텍스트\ 로 감싼 부분: E08C99 색이 됩니다.
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
      tooltip: '[ 유일 ]\n드로우 3\n모든 적 피해 120%\n이번 턴 드로우한 공격 카드 수만큼 피해량 +60% (최대 8장)'
    }
  ],
  tenebria: [
    {
      name: '사운드 체크',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/테네브리아/attack.webp',
      tooltip: '피해 120%\n소각 : 치유 60%'
    },
    {
      name: '사운드 체크',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/테네브리아/attack.webp',
      tooltip: '피해 120%\n소각 : 치유 60%'
    },
    {
      name: '팬 서비스',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/테네브리아/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '뮤직 스타트',
      cost: 0,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/테네브리아/blue1.webp',
      tooltip: '[ 유일 / 개막 ]\n모든 기본 공격 카드 소멸\n뽑을 카드에 아군의 "리듬" 2장씩 생성\n자신의 리듬 카드에 신속 부여',
      awakenings: [
        { cost: 0, type: 'upgrade', tooltip: '[ 유일 / 개막 ]\n모든 기본 공격 카드 소멸\n뽑을 카드에 아군의 |"리듬 : 크레센도"| 2장씩 생성\n자신의 리듬 카드에 신속 부여' },
        { cost: 0, type: 'upgrade', tooltip: '[ 유일 / 개막 ]\n모든 기본 공격 카드 소멸\n뽑을 카드에 아군의 |"리듬 : 스타카토"| 2장씩 생성\n자신의 리듬 카드에 신속 부여' },
        { cost: 0, type: 'upgrade', tooltip: '[ 유일 / 개막 ]\n모든 기본 공격 카드 소멸\n뽑을 카드에 아군의 |"리듬 : 포르티시모"| 2장씩 생성\n자신의 리듬 카드에 신속 부여' },
        { cost: 0, type: 'upgrade', tooltip: '[ 유일 / 개막 ]\n모든 기본 공격 카드 소멸\n뽑을 카드에 아군의 |"리듬 : 페르마타"| 2장씩 생성' },
        { cost: 0, type: 'upgrade', tooltip: '[ 유일 / 개막 ]\n모든 기본 공격 카드 소멸\n뽑을 카드에 아군의 |"리듬 : 아르페지오"| \\1\\장씩 생성' }
      ]
    },
    {
      name: '스포트라이트',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/테네브리아/blue2.webp',
      tooltip: '피해 140%\n리듬 카드 1장 핸드로 이동\n발동 시까지 비용 2 감소',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 |210%|\n리듬 카드 |2|장 핸드로 이동\n|그 카드 중 1|장 발동 시까지 비용 2 감소' },
        { cost: 1, type: 'upgrade', tooltip: '|한 턴에 리듬 카드 3장 발동 시 핸드에 소멸이 부여된 "스포트라이트" 1장 생성, 그 카드 비용 1 감소 (턴당 1회)|' },
        { cost: 2, type: 'attack', tooltip: '피해 |350|%\n리듬 카드 |2장까지 선택하여| 핸드로 이동, |그 카드 발동|' },
        { cost: 0, type: 'skill', tooltip: '|뽑을 카드와 무덤의 리듬 카드 3장까지 선택하여 뽑을 카드 위로 이동\n그 카드 중 1장 드로우|' },
        { cost: 0, type: 'attack', tooltip: '피해 140%\n|드로우 2\n그 중 리듬 카드가 아닌 카드 모두 버리기|' }
      ]
    },
    {
      name: '콜 & 리스폰스',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/테네브리아/blue3.webp',
      tooltip: '[ 신속 ]\n피해 200%\n핸드에 있다면 리듬 카드로도 취급\n감응 : 리듬 카드 드로우 1',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |250|%\n핸드에 있다면 리듬 카드로도 취급\n감응 : 리듬 카드 드로우 |2|' },
        { cost: 2, type: 'attack', tooltip: '[ 신속 ]\n피해 |240% × 2|\n|뽑을 카드와| 핸드에 있다면 |리듬 카드 발동 시 이 카드 발동|' },
        { cost: 1, type: 'skill', tooltip: '|리듬 카드 드로우 2|\n|뽑을 카드|에 있다면 |리듬 카드 발동 시 이 카드 발동|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 \\120\\%\n|리듬 카드 발동 시 이 카드 타격 1회 추가 (최대 5회)|' },
        { cost: 7, type: 'attack', tooltip: '|[ 보존 / 신속 ]|\n피해 |700|%\n핸드에 있다면 리듬 카드로도 취급\n|리듬 카드 발동 시 이 카드 발동 시까지 비용 1 감소|' }
      ]
    },
    {
      name: '앙코르',
      cost: 1,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/테네브리아/yellow.webp',
      tooltip: '피해 120%\n직전 발동한 카드가 리듬 카드라면 그 카드 발동',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 120%\n직전 발동한 카드가 리듬 카드라면 그 카드 |2번| 발동' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|리듬 카드 2장 발동 시마다 체력이 가장 낮은 적에게 피해 100% (턴당 15회)|' },
        { cost: 1, type: 'skill', tooltip: '|다음 발동하는 3장의 리듬 카드 비용 1 감소, 타격 1회 추가|' },
        { cost: 3, type: 'skill', tooltip: '|[ 유일 ]|\n|무덤의 리듬 카드 모두 발동|' },
        { cost: 0, type: 'skill', tooltip: '|드로우 1|\n|그 카드가 리듬 카드라면 1턴간 발동 시까지 피해량 100% 증가, 1번 더 반복 (최대 2회)|' }
      ]
    },
    {
      name: '포토 타임',
      cost: 1,
      type: 'skill',
      grade: 'purple',
      media: 'cards/테네브리아/purple.webp',
      tooltip: '[ 유일 / 보존 ]\n무대의 열기 1\n리듬 카드가 발동하거나 핸드로 이동하면 이 카드 발동 시까지 무대의 열기 1 증가 (최대 9회)'
    }
  ],
  pei: [
    {
      name: '창염',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/페이/attack.webp',
      tooltip: '피해 100%\n염무 1'
    },
    {
      name: '창염',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/페이/attack.webp',
      tooltip: '피해 100%\n염무 1'
    },
    {
      name: '우수',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/페이/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '구마의 형세',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/페이/blue1.webp',
      plus_card: '염무곡',
      tooltip: '[ 개전 / 유일 ]\n능력으로 드로우 시 강림 1\n뽑을 카드에 "염무곡" 8장 생성',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n능력으로 드로우 시 강림 1\n뽑을 카드에 "염무곡" 8장 생성\n|그 카드의 피해량 +50%|', plus_card: '염무곡' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n능력으로 드로우 시 강림 1\n뽑을 카드에 "염무곡" 8장 생성\n|턴 시작 시 "염무곡" 1장 드로우|', plus_card: '염무곡' },
        { cost: 0, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n능력으로 드로우 시 강림 1\n뽑을 카드에 "염무곡" 8장 생성\n|드로우 2|', plus_card: '염무곡' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n능력으로 드로우 시 강림 1\n뽑을 카드에 "염무곡" \\7\\장 생성\n|염무 발동 시 대상에게 추가 공격 100%|', plus_card: '염무곡' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n능력으로 드로우 시 강림 1\n뽑을 카드에 |"염무곡 : 천"| \\6\\장 생성', plus_card: '염무곡 : 천' }
      ]
    },
    {
      name: '염무곡',
      cost: 0,
      type: 'attack',
      grade: '',
      media: 'cards/페이/blue1_1.webp',
      tooltip: '피해 70%\n염무 1\n이 카드로 염무 발동 시 드로우 1'
    },
    {
      name: '염무곡 : 천',
      cost: 0,
      type: 'attack',
      grade: '',
      media: 'cards/페이/blue1_1.webp',
      tooltip: '피해 110%\n염무 1\n이 카드로 염무 발동 시 강림 3'
    },
    {
      name: '독무',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/페이/blue2.webp',
      tooltip: '드로우 2\n드로우한 카드 중 비용이 1 이상인 카드 모두 버리기',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '드로우 |3|\n드로우한 카드 중 비용이 1 이상인 카드 모두 버리기' },
        { cost: 0, type: 'skill', tooltip: '|비용이 0인 자신의 카드 드로우| 2' },
        { cost: 1, type: 'attack', tooltip: '|대상에게 뽑을 카드의 "염무곡" 3장 발동|\n|발동한 수만큼 강림 2|', plus_card: '염무곡' },
        { cost: 0, type: 'skill', tooltip: '드로우 \\1\\\n|비용이 2 이하인 자신의 카드 드로우 시 그 카드 발동하고 드로우 2|' },
        { cost: 0, type: 'attack', tooltip: '|비용이 X인 카드| 드로우 \\1\\\n|그 카드의 X를 사용 시까지 X+1로 적용|' }
      ]
    },
    {
      name: '밤새 내리는 비',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      plus_card: '염무곡',
      media: 'cards/페이/blue3.webp',
      tooltip: '염무 1\n연속 : "염무곡" 1장 드로우',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '염무 1\n연속 : "염무곡" |2|장 드로우' },
        { cost: 0, type: 'skill', tooltip: '염무 |2|\n연속 : |다음 2번의 염무 발동 시 염무 2|' },
        { cost: 1, type: 'skill', tooltip: '|무덤의 "염무곡" 수만큼 염무 1|', plus_card: '염무곡' },
        { cost: 0, type: 'skill', tooltip: '염무 |2|\n|턴 시작 시 핸드로 이동|' },
        { cost: 0, type: 'skill', tooltip: '염무 1\n연속 : |다음 X를 X+2로 적용|' }
      ]
    },
    {
      name: '혼염무',
      cost: 'X',
      type: 'attack',
      grade: 'yellow',
      media: 'cards/페이/yellow.webp',
      tooltip: '피해 100% × X+1\n드로우 X',
      awakenings: [
        { cost: 'X', type: 'attack', tooltip: '피해 |180|% × X+1\n드로우 X' },
        { cost: 'X', type: 'attack', tooltip: '|[ 유일 ]|\n피해 100% × X+1\n|타격횟수 만큼 대상에게 무덤의 "염무곡" 발동|', plus_card: '염무곡' },
        { cost: 'X', type: 'attack', tooltip: '피해 |150|% × X+1\n|타격횟수 만큼 다음 "낙구천"의 피해량 50% 증가 (최대 500%)', plus_card: '낙구천' },
        { cost: 'X', type: 'skill', tooltip: '드로우 X\n|염무 X × 2|\n강림 X' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 유일 ]|\n|염무의 타격 1회 추가|' }
      ]
    },
    {
      name: '낙구천',
      cost: 0,
      type: 'attack',
      grade: '',
      media: 'cards/페이/yellow_1.webp',
      tooltip: '[ 증발 / 소멸 ]\n피해 110% × 3'
    },
    {
      name: '염무무곡',
      cost: 0,
      type: 'skill',
      grade: 'purple',
      plus_card: '염무곡',
      media: 'cards/페이/purple.webp',
      tooltip: '[ 소멸 / 유일 ]\n이번 턴에 획득한 강림 수만큼 "염무곡" 핸드로 이동'
    }
  ],
  adelheid: [
    {
      name: '모두 모여',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/아델하이트/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: '요정의 가호',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/아델하이트/attack.webp',
      tooltip: '실드 100%'
    },
    {
      name: '요정의 가호',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/아델하이트/attack.webp',
      tooltip: '실드 100%'
    },
    {
      name: '옛날 옛적에',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/아델하이트/blue1.webp',
      tooltip: '[ 소멸 2 ]\n뽑을 카드의 무작위 카드 2장 축복 부여, 그 카드 중 1장 드로우',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 소멸 2 ]\n뽑을 카드의 무작위 카드 |3|장 축복 부여, 그 카드 중 1장 드로우' },
        { cost: 0, type: 'skill', tooltip: '|[ 개전 / 소멸 2 ]|\n뽑을 카드에서 |1장 선택| 드로우, 그 카드에 축복 부여' },
        { cost: 0, type: 'skill', tooltip: '[ 소멸 2 ]\n|버리기 1|\n|그 카드를 소유한 전투원의 무작위| 카드 |3|장 축복 부여' },
        { cost: 'X', type: 'skill', tooltip: '|[ 보존 / 소멸 2 ]|\n|X|만큼 드로우, 그 카드에 축복 부여' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|카드 생성 시| 축복 부여 |(턴당 5회)|' }
      ]
    },
    {
      name: '우리를 지켜줘',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/아델하이트/blue2.webp',
      tooltip: '다음 2장의 축복 카드 발동 시 축복 카드 드로우 1',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '다음 |3|장의 축복 카드 발동 시 축복 카드 드로우 1' },
        { cost: 1, type: 'skill', tooltip: '다음 |2번 핸드의 카드가 0장일 시| 축복 카드 드로우 1' },
        { cost: 1, type: 'skill', tooltip: '드로우 |3|\n|그 카드 1턴간 비용 0~2로 변경|' },
        { cost: 0, type: 'skill', tooltip: '드로우 1\n|그 카드가 축복 카드라면 드로우 1 추가|' },
        { cost: 1, type: 'skill', tooltip: '|자신의| 축복 카드 드로우 1\n|1턴간 그 카드 피해량, 실드 획득량 60% 증가|' }
      ]
    },
    {
      name: '동화 속 친구들',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      plus_card: ['멍멍이', '곰돌이'],
      media: 'cards/아델하이트/blue3.webp',
      tooltip: '[ 유일 ]\n"멍멍이" 혹은 "곰돌이" 1장 선택 생성',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n"멍멍이" 1장 생성\n|보유한 축복 카드 1장당 "멍멍이" 피해량 +20% (최대 15장)|', plus_card: '멍멍이' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n"곰돌이" 1장 생성\n|피해를 받을 시 "곰돌이" 핸드로 이동 (턴당 1회)|', plus_card: '곰돌이' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n|뽑을 카드에 "멍멍이(무리)" 4|장 생성', plus_card: '멍멍이(무리)' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n"곰돌이" 1장 생성\n|"곰돌이" 사용 시 반격 1, 1턴간 반격 보존|', plus_card: '곰돌이' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n|"멍멍이(변화)"| 1장 생성', plus_card: '멍멍이(변화)', plus_card: '곰돌이(변화)' }
      ]
    },
    {
      name: '멍멍이',
      cost: 0,
      type: 'attack',
      grade: '',
      media: 'cards/아델하이트/blue3_1.webp',
      tooltip: '[ 신속 / 축복 ]\n방어 기반 피해 72%'
    },
    {
      name: '멍멍이(무리)',
      cost: 0,
      type: 'attack',
      grade: '',
      media: 'cards/아델하이트/blue3_1.webp',
      tooltip: '[ 연결 / 안식 ]\n방어 기반 피해 60% × 4\n발동 전 연결된 "멍멍이" 수만큼 피해량 50% 증가'
    },
    {
      name: '멍멍이(변화)',
      cost: 0,
      type: 'attack',
      grade: '',
      media: 'cards/아델하이트/blue3_1.webp',
      tooltip: '[ 신속 ]\n방어 기반 피해 60% × 4\n공격 카드 발동 시 이 카드 "곰돌이(변화)"로 변경'
    },
    {
      name: '곰돌이',
      cost: 0,
      type: 'skill',
      grade: '',
      media: 'cards/아델하이트/blue3_2.webp',
      tooltip: '[ 신속 / 축복 ]\n실드 240%\n피해 감소 2'
    },
    {
      name: '곰돌이(변화)',
      cost: 0,
      type: 'skill',
      grade: '',
      media: 'cards/아델하이트/blue3_2.webp',
      tooltip: '[ 신속 ]\n실드 200%\n피해 감소 2\n스킬 카드 발동 시 이 카드 "멍멍이(변화)"로 변경'
    },
    {
      name: '혼염무',
      cost: 'X',
      type: 'attack',
      grade: 'yellow',
      media: 'cards/페이/yellow.webp',
      tooltip: '피해 100% × X+1\n드로우 X',
      awakenings: [
        { cost: 'X', type: 'attack', tooltip: '피해 |180|% × X+1\n드로우 X' },
        { cost: 'X', type: 'attack', tooltip: '|[ 유일 ]|\n피해 100% × X+1\n|타격횟수 만큼 대상에게 무덤의 "염무곡" 발동|', plus_card: '염무곡' },
        { cost: 'X', type: 'attack', tooltip: '피해 |150|% × X+1\n|타격횟수 만큼 다음 "낙구천"의 피해량 50% 증가 (최대 500%)', plus_card: '낙구천' },
        { cost: 'X', type: 'skill', tooltip: '드로우 X\n|염무 X × 2|\n강림 X' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 유일 ]|\n|염무의 타격 1회 추가|' }
      ]
    },
    {
      name: '낙구천',
      cost: 0,
      type: 'attack',
      grade: '',
      media: 'cards/페이/yellow_1.webp',
      tooltip: '[ 증발 / 소멸 ]\n피해 110% × 3'
    },
    {
      name: '염무무곡',
      cost: 0,
      type: 'skill',
      grade: 'purple',
      plus_card: '염무곡',
      media: 'cards/페이/purple.webp',
      tooltip: '[ 소멸 / 유일 ]\n이번 턴에 획득한 강림 수만큼 "염무곡" 핸드로 이동'
    }
  ]
};
