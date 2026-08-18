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
      grade_color: 'blue',
      media: 'cards/페이/blue1_1.webp',
      tooltip: '피해 70%\n염무 1\n이 카드로 염무 발동 시 드로우 1'
    },
    {
      name: '염무곡 : 천',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
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
        { cost: 1, type: 'skill', tooltip: '|대상에게 뽑을 카드의 "염무곡" 3장 발동|\n|발동한 수만큼 강림 2|', plus_card: '염무곡' },
        { cost: 0, type: 'skill', tooltip: '드로우 \\1\\\n|비용이 2 이하인 자신의 카드 드로우 시 그 카드 발동하고 드로우 2|' },
        { cost: 0, type: 'skill', tooltip: '|비용이 X인 카드| 드로우 \\1\\\n|그 카드의 X를 사용 시까지 X+1로 적용|' }
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
        { cost: 'X', type: 'attack', tooltip: '피해 |150|% × X+1\n|타격횟수 만큼 다음 "낙구천"의 피해량 50% 증가 (최대 500%)|', plus_card: '낙구천' },
        { cost: 'X', type: 'skill', tooltip: '드로우 X\n|염무 X × 2|\n|강림 X|' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 유일 ]|\n|염무의 타격 1회 추가|' }
      ]
    },
    {
      name: '낙구천',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
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
      media: 'cards/아델하이트/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '요정의 가호',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/아델하이트/skill.webp',
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
      plus_card: [ '멍멍이', '곰돌이' ],
      media: 'cards/아델하이트/blue3.webp',
      tooltip: '[ 유일 ]\n"멍멍이" 혹은 "곰돌이" 1장 선택 생성',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n"멍멍이" 1장 생성\n|보유한 축복 카드 1장당 "멍멍이" 피해량 +20% (최대 15장)|', plus_card: '멍멍이' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n"곰돌이" 1장 생성\n|피해를 받을 시 "곰돌이" 핸드로 이동 (턴당 1회)|', plus_card: '곰돌이' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n|뽑을 카드에 "멍멍이(무리)" 4|장 생성', plus_card: '멍멍이(무리)' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n"곰돌이" 1장 생성\n|"곰돌이" 사용 시 반격 1, 1턴간 반격 보존|', plus_card: '곰돌이' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n|"멍멍이(변화)"| 1장 생성', plus_card: [ '멍멍이(변화)', '곰돌이(변화)' ] }
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
      name: '이야기 속 진실',
      cost: 1,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/아델하이트/yellow.webp',
      tooltip: '[ 신속 ]\n방어 기반 피해 200%\n1턴간 대상이 받는 피해량 +100%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n방어 기반 피해 |300|%\n|약화 2|\n1턴간 대상이 받는 피해량 +100%' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n방어 기반 피해 200%\n|버린 카드에서 축복 카드 2장 핸드로 이동|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n방어 기반 피해 200%\n1턴간 |"멍멍이", "곰돌이"의 피해량, 실드 획득량 100% 증가|', plus_card: [ '멍멍이', '곰돌이' ] },
        { cost: 2, type: 'attack', tooltip: '|[ 안식 ]|\n방어 기반 피해 |400|%\n|핸드의 축복 카드 수만큼 피해량 30% 증가|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n방어 기반 피해 |300|%\n|행동 카운트 4 증가|' }
      ]
    },
    {
      name: '비밀의 정원',
      cost: 1,
      type: 'upgrade',
      grade: 'purple',
      media: 'cards/아델하이트/purple.webp',
      tooltip: '[ 유일 ]\n실드 200%\n실드 보존 25%'
    }
  ],
  heidemarie: [
    {
      name: '검광',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/하이데마리/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '검광',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/하이데마리/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '검막',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/하이데마리/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '검의 비',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      plus_card: '극광검',
      media: 'cards/하이데마리/blue1.webp',
      tooltip: '피해 80% × 2\n감응 : "극광검" 1장 생성',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '|[ 안식 ]|\n피해 80% × 2\n감응 : "극광검" |2|장 생성', plus_card: '극광검' },
        { cost: 2, type: 'attack', tooltip: '|[ 신속 ]|\n피해 |180|%\n|핸드의 "극광검" 수만큼 타격 1회 추가|\n감응 : "극광검" 1장 생성', plus_card: '극광검' },
        { cost: 1, type: 'skill', tooltip: '|무덤의 "극광검" 5장 대상에게 추가 공격으로 발동|', plus_card: '극광검' },
        { cost: 1, type: 'skill', tooltip: '"극광검" |2|장 생성, |그 카드에 회수 부여|', plus_card: '극광검' },
        { cost: 3, type: 'attack', tooltip: '|[ 소멸 / 종극 / 보존 / 유일 ]|\n|모든 적 피해 500%|\n|핸드에 "극광 해방"이 있다면 소멸하고 무덤의 "극광검" 수만큼 피해량 +80%|', plus_card: [ '극광검', '극광 해방' ] }
      ]
    },
    {
      name: '극광검',
      cost: 0,
      type: 'attack',
      grade: '',
      media: 'cards/하이데마리/blue1_1.webp',
      tooltip: '[ 연결 ]\n피해 100%\n버려질 시 무작위 적 추가 공격 100%\n이 카드는 셔플 시 뽑을 카드로 이동하지 않음'
    },
    {
      name: '극광 해방',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
      media: 'cards/하이데마리/blue1_2.webp',
      tooltip: '[ 유일 ]\n피해 300%\n무덤의 "극광검" 모두 소멸하고 그 수만큼 피해량 +60%\n턴 종료 시 이 카드 "극광 응축"으로 변경'
    },
    {
      name: '만인의 영웅',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/하이데마리/blue2.webp',
      tooltip: '[ 안식 ]\n드로우 3\n그 카드들을 이번 턴 동안 연결',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '|[ 연결 / 안식 ]|\n드로우 3\n그 카드들을 이번 턴 동안 연결' },
        { cost: 1, type: 'skill', tooltip: '[ 안식 ]\n드로우 3\n|핸드의 비용이 1 이하인| 카드들을 이번 턴 동안 연결' },
        { cost: 0, type: 'skill', tooltip: '|[ 신속 ]|\n드로우 \\1\\\n|핸드의 안식 카드| 이번 턴 동안 연결' },
        { cost: 0, type: 'skill', tooltip: '|[ 소멸 2 ]|\n|뽑을 카드 혹은 버린 카드에서 카드 1장 선택, 그 카드 연결 부여하고 핸드로 이동|' },
        { cost: 1, type: 'skill', tooltip: '|[ 신속 ]|\n|자신의 공격 카드| 드로우 \\2\\\n|핸드의 모든 공격 카드| 이번 턴 동안 연결' }
      ]
    },
    {
      name: '한 줄기 빛',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/하이데마리/blue3.webp',
      tooltip: '[ 연결 ]\n피해 120%\n핸드의 연결 카드 수만큼 피해량 +120%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 연결 ]\n피해 |180|%\n핸드의 연결 카드 수만큼 피해량 +|180|%' },
        { cost: 2, type: 'attack', tooltip: '|[ 연결 / 신속 ]|\n피해 |300|%\n|핸드의 연결 카드가 3장 이상이라면 피해 3배|' },
        { cost: 1, type: 'attack', tooltip: '|[ 연결 / 안식 ]|\n피해 \\100\\%\n|이 카드가 핸드 혹은 무덤에 있다면 연결 카드의 피해량 +80%|' },
        { cost: 3, type: 'skill', tooltip: '|[ 연결 / 소멸 ]|\n|핸드의 연결 카드를 버리지 않고 모두 발동|' },
        { cost: 2, type: 'attack', tooltip: '|[ 연결 / 유일 ]|\n|직접 사용 시| 피해 |350% × 2|\n|버려질 시 모든 적 피해 300%|' }
      ]
    },
    {
      name: '극광 전개',
      cost: 2,
      type: 'skill',
      grade: 'yellow',
      plus_card: '극광검',
      media: 'cards/하이데마리/yellow.webp',
      tooltip: '[ 안식 ]\n"극광검" 2장 생성\n1턴간 "극광검" 피해량 +50%',
      awakenings: [
        { cost: 2, type: 'skill', tooltip: '|[ 연결 / 안식 ]|\n"극광검" 2장 생성\n1턴간 "극광검" 피해량 +|70|%', plus_card: '극광검' },
        { cost: 2, type: 'skill', tooltip: '[ 안식 ]\n"극광검" 2장 생성\n|다음 2번| "극광검" 피해량 +|200|%', plus_card: '극광검' },
        { cost: 2, type: 'skill', tooltip: '|[ 연결 ]|\n|핸드의 연결 카드 수만큼| "극광검" 생성', plus_card: '극광검' },
        { cost: 2, type: 'skill', tooltip: '|[ 연결 / 안식 ]|\n|버린 카드에| "극광검" |6|장 생성', plus_card: '극광검' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 안식 / 유일 ]|\n|턴 시작 시| "극광검" 2장 생성\n|"극광검" 피해량 +50%|', plus_card: '극광검' }
      ]
    },
    {
      name: '극광 응축',
      cost: '-',
      type: 'skill',
      grade: 'purple',
      media: 'cards/하이데마리/purple.webp',
      tooltip: '[ 유일 / 연결 / 회수 3 ]\n무덤으로 이동 시 극광의 빛 1'
    }
  ],
  diana: [
    {
      name: '교란 사격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/디아나/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '교란 사격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/디아나/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '보호해줘',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/디아나/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '마음을 담아서!',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      plus_card: '하트 브레이커',
      media: 'cards/디아나/blue1.webp',
      tooltip: '[ 안식 ]\n피해 100%\n"하트 브레이커" 2장 생성',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 안식 ]\n피해 |150|%\n"하트 브레이커" |3|장 생성', plus_card: '하트 브레이커' },
        { cost: 1, type: 'attack', tooltip: '[ 안식 ]\n피해 |150|%\n"하트 브레이커" \\1\\장 생성\n|소멸 탄환 카드 드로우 2|', plus_card: '하트 브레이커' },
        { cost: 1, type: 'attack', tooltip: '[ 안식 ]\n피해 |150|%\n|핸드의 비용 1 이하인 모든 소멸 카드를 "하트 브레이커"로 변경|', plus_card: '하트 브레이커' },
        { cost: 2, type: 'skill', tooltip: '[ 안식 ]\n"하트 브레이커" 2장 생성\n|핸드의 모든 소멸 탄환 카드에 안식 부여|', plus_card: '하트 브레이커' },
        { cost: 3, type: 'upgrade', tooltip: '[ 안식 ]\n|턴 시작 시| "하트 브레이커" 2장 생성\n|보유한 하트 탄환이 5장 이하라면 1장 더 생성|', plus_card: '하트 브레이커' }
      ]
    },
    {
      name: '하트 브레이커',
      cost: 0,
      type: 'attack',
      grade: '',
      media: 'cards/디아나/blue1_1.webp',
      tooltip: '[ 탄환 / 신속 / 소멸 ]\n피해 80%\n무작위 탄환 버리기 1\n버려질 시 무작위 적 추가 공격 120%'
    },
    {
      name: '이리 와 밀크 퐁',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      plus_card: '하트 쉐이커',
      media: 'cards/디아나/blue2.webp',
      tooltip: '"하트 쉐이커" 2장 생성',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '"하트 쉐이커" 2장 생성\n|다음 전투원이 다음 3번의 추가 공격 시 대상에게 공명 1|', plus_card: '하트 쉐이커' },
        { cost: 1, type: 'skill', tooltip: '|핸드의 카드 2장까지 버리기|\n|버린 수 +1만큼 "하트 쉐이커" 생성|', plus_card: '하트 쉐이커' },
        { cost: 0, type: 'skill', tooltip: '|핸드의 비용 0인 소멸 카드를 무작위 하트 탄환으로 변경|', plus_card: [ '하트 브레이커', '하트 쉐이커' ] },
        { cost: 1, type: 'skill', tooltip: '|하트 탄환 1장씩 생성|\n|핸드의 서로 다른 탄환 카드 수만큼 무작위 적 공명 1|', plus_card: [ '하트 브레이커', '하트 쉐이커' ] },
        { cost: 2, type: 'skill', tooltip: '|[ 보존 / 유일 ]|\n|핸드의 모든 "하트 쉐이커"를 "하트 브레이커"로 변경|\n|보존 : "하트 쉐이커" 1장 생성|', plus_card: [ '하트 브레이커', '하트 쉐이커' ] }
      ]
    },
    {
      name: '정화의 피스톨',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/디아나/blue3.webp',
      tooltip: '[ 탄환 / 안식 ]\n피해 120%\n공명 2\n버려질 시 대상에게 자신의 공명 3번 더 발동',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 탄환 / 안식 ]\n피해 |180|%\n공명 |3|\n버려질 시 대상에게 자신의 공명 |5|번 더 발동' },
        { cost: 1, type: 'attack', tooltip: '[ 탄환 / 안식 ]\n피해 |180|%\n|다음 5번의 신속 공격 카드 사용 시 대상에게 공명 1|' },
        { cost: 1, type: 'skill', tooltip: '|[ 안식 ]|\n피해 |180|%\n대상이 보유한 자신의 공명 |10|회 발동' },
        { cost: 1, type: 'attack', tooltip: '[ 탄환 / 안식 ]\n피해 |180|%\n|이번 턴에 버린 탄환 수만큼 피해량 +100%|' },
        { cost: 1, type: 'attack', tooltip: '[ 탄환 / 안식 ]\n|모든 적 피해 180|%\n버려질 시 |모든 적이 보유한| 공명 \\2\\회 발동' }
      ]
    },
    {
      name: '하트 쉐이커',
      cost: 0,
      type: 'skill',
      grade: '',
      media: 'cards/디아나/blue2_1.webp',
      tooltip: '[ 탄환 / 신속 / 소멸 ]\n공명 1\n뽑을 카드에서 무작위 카드 버리기 1\n버려질 시 무작위 적 공명 2'
    },
    {
      name: '피어나는 사랑',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/디아나/yellow.webp',
      tooltip: '안식 카드 드로우 1\n버리기 2',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '안식 카드 드로우 1\n버리기 \\1\\\n|버린 카드가 다른 전투원의 카드라면 하트 탄환 2장 생성|', plus_card: [ '하트 브레이커', '하트 쉐이커' ] },
        { cost: 1, type: 'skill', tooltip: '안식 카드 드로우 1\n버리기 2\n|버린 카드의 비용 합만큼 모든 적 공명 1 (최대 6)|' },
        { cost: 1, type: 'skill', tooltip: '|핸드의 탄환 카드 3장까지 버리기|\n|버린 수| \\-1\\|만큼| 안식 카드 드로우' },
        { cost: 1, type: 'skill', tooltip: '|핸드의 탄환 카드 모두 버리기|\n|그 수만큼 무작위 적 추가 공격 80%|' },
        { cost: 3, type: 'upgrade', tooltip: '|[ 안식 / 유일 ]|\n|핸드에 자신의 안식 카드가 없다면 자신의| 안식 카드 드로우 1 |(턴당 1회)|' }
      ]
    },
    {
      name: '해방된 마음',
      cost: 2,
      type: 'attack',
      grade: 'purple',
      media: 'cards/디아나/purple.webp',
      tooltip: '소멸 탄환 카드 2장 드로우\n피해 300%\n핸드의 서로 다른 탄환 카드 수만큼 피해량 30% 증가'
    }
  ],
  rita: [
    {
      name: '시간 가속',
      cost: 3,
      type: 'attack',
      grade: 'gray',
      media: 'cards/리타/attack.webp',
      tooltip: '피해 350%'
    },
    {
      name: '시간 가속',
      cost: 3,
      type: 'attack',
      grade: 'gray',
      media: 'cards/리타/attack.webp',
      tooltip: '피해 350%'
    },
    {
      name: '되감기',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/리타/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '기록자',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/리타/blue1.webp',
      tooltip: '[ 유일 / 개전 ]\n카드 발동 시 그 카드 비용만큼 시간 기록 1',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n카드 발동 시 그 카드 비용만큼 시간 기록 1\n|시간 초월 제거 시 시간 기록 3|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n카드 발동 시 그 카드 비용만큼 시간 기록 1\n|턴 종료 시 시간 초월 수만큼 무작위 적 피해 100%|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n카드 |소멸| 시 시간 기록 1' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n카드 발동 시 그 카드 비용만큼 시간 기록 1\n|카드를 버릴 시 시간 기록 1|' },
        { cost: 1, type: 'upgrade', tooltip: '카드 발동 시 그 카드 비용만큼 시간 기록 1\n|보존 효과 발동 시 시간 기록 1|' }
      ]
    },
    {
      name: '시간축 파괴',
      cost: 2,
      type: 'attack',
      grade: 'blue',
      media: 'cards/리타/blue2.webp',
      tooltip: '피해 300%\n핸드의 카드 비용 합만큼 피해량 20% 증가 (최대 200%)',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '피해 |540|%\n핸드의 카드 비용 합만큼 피해량 20% 증가 (최대 200%)' },
        { cost: 1, type: 'attack', tooltip: '피해 300%\n핸드의 |비용 1 이하인 카드 수|만큼 피해량 |30|% 증가' },
        { cost: 3, type: 'skill', tooltip: '|다음 사용하는 자신의 공격 카드 3장의 피해량 100% 증가|' },
        { cost: 3, type: 'attack', tooltip: '[ 보존 ]\n피해 |480|%\n취약 |2|\n|시간 초월 획득 시 이 카드가 핸드에 있다면 발동|' },
        { cost: 2, type: 'attack', tooltip: '피해 300%\n|핸드의 모든 "운명 각인" 비용 4로 변경|', plus_card: '운명 각인' }
      ]
    },
    {
      name: '확정된 미래',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/리타/blue3.webp',
      tooltip: '핸드의 비용 2 이하인 카드 1장 사용 시까지 비용 1 증가, 비용 3인 무작위 카드 1장 발동',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '핸드의 비용 2 이하인 카드 1장 사용 시까지 비용 1 증가, 비용 3인 무작위 카드 1장 발동' },
        { cost: 0, type: 'skill', tooltip: '핸드의 비용 |3인 무작위 공격 카드 1장 발동|' },
        { cost: 3, type: 'skill', tooltip: '|뽑을 카드|의 비용 |3인 무작위 카드 1장 발동|' },
        { cost: 2, type: 'skill', tooltip: '핸드의 비용 2|인 무작위 카드 2장 발동|' },
        { cost: 3, type: 'upgrade', tooltip: '|[ 유일 ]|\n|비용이 증가한 카드 직접 사용 시 무작위 적 피해 300%|' }
      ]
    },
    {
      name: '크로노 서클',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      plus_card: '운명 각인',
      media: 'cards/리타/yellow.webp',
      tooltip: '"운명 각인" 2장 생성',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '"운명 각인" |3|장 생성', plus_card: '운명 각인' },
        { cost: 1, type: 'skill', tooltip: '|[ 보존 ]|\n"운명 각인" 2장 생성\n|보존 : "운명 각인" 1장 생성|', plus_card: '운명 각인' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 유일 ]|\n|시간 초월 획득 시 자신의 기본 카드 모두 핸드로 이동|' },
        { cost: 1, type: 'skill', tooltip: '|모든 카드의 소멸 카드 1장 선택 소멸, 그 카드 비용만큼| "운명 각인" 생성', plus_card: '운명 각인' },
        { cost: 3, type: 'upgrade', tooltip: '|[ 유일 ]|\n|시간 초월 획득 시 비용 2인 공격 카드 드로우 3|' }
      ]
    },
    {
      name: '운명 각인',
      cost: 2,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/리타/yellow_1.webp',
      tooltip: '[ 보존 / 소멸 ]\n이 카드 비용만큼 피해 120%\n핸드의 모든 "운명 각인" 비용 1 증가\n이 카드가 핸드를 벗어날 시 비용 2로 변경'
    },
    {
      name: '타임 패러독스',
      cost: 0,
      type: 'skill',
      grade: 'purple',
      media: 'cards/리타/purple.webp',
      tooltip: '[ 유일 ]\n시간 기록 모두 감소\n그 수만큼 시간 초월'
    }
  ],
  tiphera: [
    {
      name: '물질 분해',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/티페라/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: '장벽 전개',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/리타/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '장벽 전개',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/리타/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '퀀텀 시드',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      plus_card: [ '창조 : ○', '창조 : △', '창조 : □' ],
      media: 'cards/티페라/blue1.webp',
      tooltip: '치유 100%\n뽑을 카드에 창조 카드 2장 생성\n그 중 1장 드로우',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '치유 |150|%\n뽑을 카드에 창조 카드 |3|장 생성\n그 중 1장 드로우' },
        { cost: 0, type: 'skill', tooltip: '치유 100%\n|창조 카드 1장 선택|\n|핸드와 뽑을 카드에 1장씩 생성|' },
        { cost: 0, type: 'skill', tooltip: '|드로우 1|\n|생성될 창조 카드 예측|\n창조 카드 \\1\\장 생성\n|예측이 맞았다면 뽑을 카드에 나머지 생성' },
        { cost: 1, type: 'skill', tooltip: '뽑을 카드에 창조 카드 |3|장 생성\n그 중 1장 드로우\n|무작위 자신의 카드 1장 보존 효과 2회 발동|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n창조 카드 \\1\\장 생성\n|행동 포인트가 0일 시 핸드와 뽑을 카드에 창조 카드 1장씩 생성 (턴당 1회)|' }
      ]
    },
    {
      name: '창조 : ○',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'blue',
      media: 'cards/티페라/blue1_1.webp',
      tooltip: '[ 소멸 ]\n치유 50%\n행동 포인트 1'
    },
    {
      name: '창조 : △',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'blue',
      media: 'cards/티페라/blue1_2.webp',
      tooltip: '[ 소멸 ]\n실드 50%\n다음 공격 카드의 첫 타격 피해량 30% 증가 (최대 300%)'
    },
    {
      name: '창조 : □',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'blue',
      media: 'cards/티페라/blue1_3.webp',
      tooltip: '[ 소멸 ]\n치유 50%\n창조 카드 1장 드로우'
    },
    {
      name: '형상 결집',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/리타/blue2.webp',
      tooltip: '[ 보존 ]\n창조 카드 2장 드로우\n그 카드들의 무작위 효과 1턴간 2배',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n창조 카드 |3|장 드로우\n그 카드들의 무작위 효과 1턴간 2배' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n창조 카드 |4|장 드로우\n|핸드의 소멸 카드 1장 선택 소멸|' },
        { cost: 0, type: 'skill', tooltip: '[ 보존 ]\n|핸드의 모든 창조 카드 다른 창조 카드로 변경|\n|보존 : 창조 카드 1장 드로우|' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n|모든 카드의 소멸 카드 3장까지 선택 소멸|\n|그 수만큼 소멸 카드 드로우|' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n|창조 카드 1장 드로우|\n|같은 카드를 연속해서 뽑을 때까지 반복 (최대 6회)|' }
      ]
    },
    {
      name: '창조와 파괴',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/티페라/blue3.webp',
      tooltip: '방어 기반 피해 120%\n실드 80%\n치유 80%\n조율 : 모든 효과 2배',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |180|%\n실드 |100|%\n치유 |100|%\n조율 : 모든 효과 2배' },
        { cost: 5, type: 'attack', tooltip: '방어 기반 피해 |550|%\n|카드 소멸 시 이 카드 1턴간 사용 시까지 비용 1 감소|' },
        { cost: 2, type: 'attack', tooltip: '|[ 보존 ]|\n방어 기반 피해 |160|%\n실드 \\40\\%\n치유 \\40\\%\n|보존 : 발동 시까지| 모든 효과 100% 증가 |(최대 4회)|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|행동 포인트가 0일 시 "창조와 파괴" 1장 생성\n|그 카드 비용 1 감소, 소멸 부여 (턴당 1회)|' },
        { cost: 5, type: 'attack', tooltip: '|이 카드의 비용만큼 방어 기반 피해 150%|\n|카드 소멸 시 이 카드 비용 1 ~ 9 무작위 변경|' }
      ]
    },
    {
      name: '쌍생성',
      cost: 1,
      type: 'upgrade',
      grade: 'yellow',
      media: 'cards/티페라/yellow.webp',
      tooltip: '[ 유일 ]\n창조 카드 2장 생성 시 버린 카드에 동일한 카드 1장 생성',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 / 개전 ]|\n창조 카드 2장 생성 시 버린 카드에 동일한 카드 1장 생성' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 / 개전 ]|\n창조 카드 \\3\\장 생성 시 |핸드|에 동일한 카드 1장 생성\n|그 카드에 보존 부여|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 / 개전 ]|\n|"창조 : □" 발동 시| 버린 카드에 |다른 창조 카드| 1장 생성', plus_card: '창조 : □' },
        { cost: 1, type: 'skill', tooltip: '[ 유일 ]\n|창조 카드 1장씩 생성|\n|다음 소멸하는 창조 카드 1장 생성|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 / 개전 ]|\n|창조 카드 핸드로 이동 시 그 카드 복제, 무작위 효과 제거 (턴당 5회)|' }
      ]
    },
    {
      name: '사건의 지평선',
      cost: 2,
      type: 'skill',
      grade: 'purple',
      media: 'cards/티페라/purple.webp',
      tooltip: '[ 유일 / 형상 강화 (0/3) ]\n행동 포인트 1\n드로우 1\n다음 공격 카드의 첫 타격 피해량 40% 증가'
    }
  ],
  nine: [
    {
      name: '참격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/나인/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: '참격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/나인/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: '칼등 막기',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/나인/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '파쇄',
      cost: 3,
      type: 'attack',
      grade: 'blue',
      plus_card: [ '파쇄 Lv. 1', '파쇄 Lv. 2', '파쇄 Lv. 3' ],
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 개전 / 소멸 / 증발 ]\n방어 기반 피해 350%\n소각 : "파쇄 Lv. 1" 1장 생성',
      awakenings: [
        { name: '파쇄(철갑)', cost: 3, type: 'attack', tooltip: '[ 유일 / 개전 / 소멸 / 증발 ]\n방어 기반 피해 |400|%\n|실드 200%|\n소각 : |"파쇄(철갑) Lv. 1"| 1장 생성', plus_card: [ '파쇄(철갑) Lv. 1', '파쇄(철갑) Lv. 2', '파쇄(철갑) Lv. 3' ] },
        { name: '파쇄(극강)', cost: 3, type: 'attack', tooltip: '[ 유일 / 개전 / 소멸 / 증발 ]\n방어 기반 피해 \\300\\%\n소각 : |"파쇄(극강) Lv. 1"| 1장 생성', plus_card: [ '파쇄(극강) Lv. 1', '파쇄(극강) Lv. 2', '파쇄(극강) Lv. 3', '파쇄(극강) Lv. 4', '파쇄(극강) Lv. 5' ] },
        { name: '파쇄(섬광)', cost: 3, type: 'attack', tooltip: '|[ 유일 / 개전 / 점화 / 소멸 / 증발 ]|\n방어 기반 피해 |400|%\n소각 : |"파쇄(섬광) Lv. 1"| 1장 생성', plus_card: [ '파쇄(섬광) Lv. 1', '파쇄(섬광) Lv. 2', '파쇄(섬광) Lv. 3' ] },
        { name: '파쇄(몰살)', cost: 3, type: 'attack', tooltip: '[ 유일 / 개전 / 소멸 / 증발 ]\n|모든 적| 방어 기반 피해 |400|%\n|대상 수만큼 피해량 10% 감소|\n소각 : |"파쇄(몰살) Lv. 1"| 1장 생성', plus_card: [ '파쇄(몰살) Lv. 1', '파쇄(몰살) Lv. 2', '파쇄(몰살) Lv. 3' ] },
        { name: '파쇄(기습)', cost: 3, type: 'attack', tooltip: '|[ 유일 / 개전 / 소멸 / 보존 ]|\n방어 기반 피해 |400|%\n|아군이 반격 시 이 카드 발동|\n소각 : |"파쇄(기습) Lv. 1"| 1장 생성', plus_card: [ '파쇄(기습) Lv. 1', '파쇄(기습) Lv. 2', '파쇄(기습) Lv. 3' ] }
      ]
    },
    {
      name: '파쇄 Lv. 1',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 420%\n소각 : "파쇄 Lv. 2" 1장 생성'
    },
    {
      name: '파쇄 Lv. 2',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 500%\n소각 : "파쇄 Lv. 3" 1장 생성'
    },
    {
      name: '파쇄 Lv. 3',
      cost: 2,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 보존 ]\n방어 기반 피해 600%\n소각 : 턴 시작 시 핸드에 "파쇄" 1장 생성'
    },
    {
      name: '파쇄(철갑) Lv. 1',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 480%\n실드 200%\n소각 : "파쇄(철갑) Lv. 2" 1장 생성'
    },
    {
      name: '파쇄(철갑) Lv. 2',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 580%\n실드 200%\n소각 : "파쇄(철갑) Lv. 3" 1장 생성'
    },
    {
      name: '파쇄(철갑) Lv. 3',
      cost: 2,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 보존 ]\n방어 기반 피해 700%\n실드 200%\n소각 : 턴 시작 시 핸드에 "파쇄(철갑)" 1장 생성'
    },
    {
      name: '파쇄(극강) Lv. 1',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 360%\n소각 : "파쇄(극강) Lv. 2" 1장 생성'
    },
    {
      name: '파쇄(극강) Lv. 2',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 420%\n소각 : "파쇄(극강) Lv. 3" 1장 생성'
    },
    {
      name: '파쇄(극강) Lv. 3',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 550%\n소각 : "파쇄(극강) Lv. 4" 1장 생성'
    },
    {
      name: '파쇄(극강) Lv. 4',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 680%\n소각 : "파쇄(극강) Lv. 5" 1장 생성'
    },
    {
      name: '파쇄(극강) Lv. 5',
      cost: 2,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 보존 ]\n방어 기반 피해 1000%\n소각 : 턴 시작 시 핸드에 "파쇄(극강)" 1장 생성'
    },
    {
      name: '파쇄(섬광) Lv. 1',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 점화 / 소멸 / 증발 ]\n방어 기반 피해 480%\n소각 : "파쇄(섬광) Lv. 2" 1장 생성'
    },
    {
      name: '파쇄(섬광) Lv. 2',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 점화 / 소멸 / 증발 ]\n방어 기반 피해 580%\n소각 : "파쇄(섬광) Lv. 3" 1장 생성'
    },
    {
      name: '파쇄(섬광) Lv. 3',
      cost: 2,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 점화 / 소멸 / 보존 ]\n방어 기반 피해 700%\n소각 : 턴 시작 시 핸드에 "파쇄(섬광)" 1장 생성'
    },
    {
      name: '파쇄(몰살) Lv. 1',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n모든 적 방어 기반 피해 480%\n대상 수만큼 피해량 10% 감소\n소각 : "파쇄(몰살) Lv. 2" 1장 생성'
    },
    {
      name: '파쇄(몰살) Lv. 2',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n모든 적 방어 기반 피해 580%\n대상 수만큼 피해량 10% 감소\n소각 : "파쇄(몰살) Lv. 3" 1장 생성'
    },
    {
      name: '파쇄(몰살) Lv. 3',
      cost: 2,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 보존 ]\n모든 적 방어 기반 피해 700%\n대상 수만큼 피해량 10% 감소\n소각 : 턴 시작 시 핸드에 "파쇄(몰살)" 1장 생성'
    },
    {
      name: '파쇄(기습) Lv. 1',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 480%\n아군이 반격 시 이 카드 발동\n소각 : "파쇄(기습) Lv. 2" 1장 생성'
    },
    {
      name: '파쇄(기습) Lv. 2',
      cost: 3,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 증발 ]\n방어 기반 피해 580%\n아군이 반격 시 이 카드 발동\n소각 : "파쇄(기습) Lv. 3" 1장 생성'
    },
    {
      name: '파쇄(기습) Lv. 3',
      cost: 2,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
      media: 'cards/나인/blue1.webp',
      tooltip: '[ 유일 / 소멸 / 보존 ]\n방어 기반 피해 700%\n아군이 반격 시 이 카드 발동\n소각 : 턴 시작 시 핸드에 "파쇄(기습)" 1장 생성'
    },
    {
      name: '노련한 일격',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/나인/blue2.webp',
      tooltip: '방어 기반 피해 140%\n피해 기반 실드 20%\n1턴간 소멸 카드의 피해량 20% 증가',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |210|%\n피해 기반 실드 20%\n1턴간 소멸 카드의 피해량 |30|% 증가' },
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |210|%\n피해 기반 실드 20%\n|이번 턴 소멸한 카드가 있다면 이 카드 1턴간 사용 시까지| 피해량 |30|% 증가' },
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |210|%\n피해 기반 실드 20%\n1턴간 |스킬 카드의 실드 획득량 30|% 증가' },
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 140%\n피해 기반 실드 20%\n|핸드의 소멸 카드 수만큼 피해량 +60%|' },
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |210|%\n피해 기반 실드 20%\n1턴간 소멸 카드 |발동 시 반격 1|' }
      ]
    },
    {
      name: '치명적 일격',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/나인/blue3.webp',
      tooltip: '방어 기반 피해 140%\n비용이 가장 높은 소멸 카드의 비용만큼 피해량 20% 증가, 그 카드 소멸',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |210|%\n비용이 가장 높은 소멸 카드의 비용만큼 피해량 |30|% 증가, 그 카드 소멸' },
        { cost: 2, type: 'attack', tooltip: '방어 기반 피해 |260|%\n비용이 가장 높은 카드의 비용만큼 피해량 20% 증가' },
        { cost: 5, type: 'skill', tooltip: '|[ 유일 / 점화 / 보존 ]|\n|핸드의 "파쇄" 카드를 최종 단계로 변경|' },
        { cost: 1, type: 'skill', tooltip: '|핸드의 무작위 다른 전투원의 소멸 카드 2장을 소멸|\n|그 수만큼 다음 사용하는 자신의 공격 카드 사용 시까지 피해량 30% 증가|' },
        { cost: 1, type: 'attack', tooltip: '|[ 보존 ]|\n방어 기반 피해 |210|%\n|반격을 보유한 아군 수만큼 피해량 80% 증가|' }
      ]
    },
    {
      name: '역전의 칼날',
      cost: 0,
      type: 'upgrade',
      grade: 'yellow',
      media: 'cards/나인/yellow.webp',
      tooltip: '[ 유일 ]\n능력으로 실드 획득 시 칼날 벼리기 1',
      awakenings: [
        { cost: 0, type: 'upgrade', tooltip: '[ 유일 ]\n|카드 소멸 시| 칼날 벼리기 1' },
        { cost: 0, type: 'upgrade', tooltip: '[ 유일 ]\n|실드 획득량 15% 증가|, 능력으로 실드 획득 시 칼날 벼리기 1' },
        { cost: 0, type: 'upgrade', tooltip: '|[ 유일 / 개전 ]|\n능력으로 실드 획득 시 칼날 벼리기 1' },
        { cost: 0, type: 'upgrade', tooltip: '[ 유일 ]\n|반격 획득 시 칼날 벼리기+ 1|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n|턴 시작 시 핸드의 파쇄 카드 1회 발동|' }
      ]
    },
    {
      name: '투지',
      cost: 1,
      type: 'skill',
      grade: 'purple',
      media: 'cards/나인/purple.webp',
      tooltip: '비용이 가장 높은 자신의 공격 카드 1장 발동, 그 카드 소멸'
    }
  ],
  narja: [
    {
      name: 'NA : 공격 반응',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/나르쟈/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: 'NA : 보호 반응',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/나르쟈/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: 'NA : 보호 반응',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/나르쟈/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '굶주림의 굴레',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/나르쟈/blue1.webp',
      tooltip: '감응 : 탐식 4\n방어 기반 피해 30% × 3',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '감응 : 탐식 |6|\n방어 기반 피해 30% × |4|' },
        { cost: 0, type: 'attack', tooltip: '감응 : 탐식 \\1\\\n방어 기반 피해 30% × \\2\\\n|턴 시작 시 이전 턴에 탐식을 3회 이상 발동했다면 핸드로 이동|' },
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |50|% × 3\n|보유한 탐식 4마다 타격 1회 추가 (최대 3회)|' },
        { cost: 1, type: 'skill', tooltip: '|[ 보존 ]|\n|탐식 최대 5 감소|\n|그 수만큼 다음 사용하는 공격 카드의 피해 +40%|\n|5 감소했다면 포식 3|' },
        { cost: 0, type: 'skill', tooltip: '|실드 60%|\n|탐식 최대 3 감소|\n|그 수만큼 반복|' }
      ]
    },
    {
      name: '무한한 허기',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/나르쟈/blue2.webp',
      tooltip: '다음 2번의 탐식 발동 시 핸드의 무작위 카드 1장 1턴간 비용 1 감소',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '|탐식 3|\n다음 2번의 탐식 발동 시 핸드의 무작위 카드 1장 1턴간 비용 1 감소' },
        { cost: 0, type: 'skill', tooltip: '핸드의 무작위 카드 |2|장 1턴간 비용 1 감소' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|1턴간 탐식 3번 발동 시| 핸드의 무작위 카드 1장 |사용 시까지| 비용 1 감소\n|(턴당 1회)|' },
        { cost: 0, type: 'skill', tooltip: '|[ 보존 ]|\n|1턴간 방어 기반 피해 +100%|' },
        { cost: 1, type: 'skill', tooltip: '|[ 주도 ]|\n|탐식 7|\n|1턴간 탐식 발동 시마다 다음 "완전한 식사"의 피해량 +40%|', plus_card: '완전한 식사' }
      ]
    },
    {
      name: '능동 제어',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/나르쟈/blue3.webp',
      tooltip: '탐식이 6 미만이라면 탐식 6\n6 이상이라면 포식 2',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '탐식이 6 미만이라면 탐식 |9|\n6 이상이라면 포식 |3|' },
        { cost: 0, type: 'skill', tooltip: '|"완전한 식사"가 뽑을 카드에 있다면 핸드로 이동|\n|버린 카드에 있다면 1턴간 사기 3|', plus_card: '완전한 식사' },
        { cost: 1, type: 'skill', tooltip: '|2턴간 대상의 행동 카운트가 감소할 때마다 탐식 1|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|탐식 10|\n|공격 카드 1장 선택|\n|그 카드가 핸드로 이동할 때마다 포식 1|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|기본 공격 카드로 타격 시마다 탐식 1|\n|기본 공격 카드의 피해량 +50%|' }
      ]
    },
    {
      name: '역전의 칼날',
      cost: 1,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/나르쟈/yellow.webp',
      tooltip: '모든 적 방어 기반 피해 100%\n대상의 다음 격파 시까지 받는 강인도 피해 100% 증가',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '모든 적 방어 기반 피해 100%\n대상의 다음 격파 시까지 받는 강인도 피해 100% 증가, |격파 시 탐식 3|' },
        { cost: 1, type: 'attack', tooltip: '모든 적 방어 기반 피해 100%\n|2턴간 대상이 받는 방어 기반 피해 +100%|' },
        { cost: 1, type: 'attack', tooltip: '모든 적 방어 기반 피해 |150|%\n|다음 5번의 대상 타격 시 치유 40%|' },
        { cost: 3, type: 'attack', tooltip: '|[ 보존 ]|\n모든 적 방어 기반 피해 |320|%\n|탐식과 포식이 있다면 1번 더 발동|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|"완전한 식사" 사용 시마다 치유 200%|', plus_card: '완전한 식사' }
      ]
    },
    {
      name: '완전한 식사',
      cost: 6,
      type: 'attack',
      grade: 'purple',
      grade_color: 'purple',
      media: 'cards/나르쟈/purple.webp',
      tooltip: '[ 보존 / 유일 ]\n탐식이 감소되면 사용 시까지 비용 1 감소, 치유량 +30% (최대 10)\n모든 적 방어 기반 피해 160%\n치유 100%\n포식 4'
    }
  ],
  sereniel: [
    {
      name: '펄스 타격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/세레니엘/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '펄스 타격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/세레니엘/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '마그네틱 필드',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/세레니엘/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '호밍 레이저',
      cost: 0,
      type: 'attack',
      grade: 'blue',
      grade_color: 'blue',
      media: 'cards/세레니엘/blue1.webp',
      tooltip: '피해 100%\n잔광 2\n격파 시 무덤에서 핸드로 이동',
      awakenings: [
        { cost: 0, type: 'attack', tooltip: '피해 |150|%\n|격파 시 핸드로 이동|\n|파괴 : 타격 1회 추가|' },
        { cost: 0, type: 'attack', tooltip: '피해 |150|%\n잔광 |3|\n|격파 시 핸드로 이동|' },
        { cost: 1, type: 'attack', tooltip: '피해 |150|%\n잔광 2\n|버린 카드에 "호밍 레이저L" 2장 생성|', plus_card: '호밍 레이저L' },
        { cost: 0, type: 'attack', tooltip: '피해 100%\n잔광 \\1\\\n|격파 혹은 턴 시작 시 핸드로 이동|' },
        { cost: 0, type: 'attack', tooltip: '피해 |150|%\n잔광 2\n|무덤의 "호밍 레이저L" 핸드로 이동|', plus_card: '호밍 레이저L' }
      ]
    },
    {
      name: '호밍 레이저L',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'blue',
      media: 'cards/세레니엘/blue1.webp',
      tooltip: '[ 소멸 2 ]\n피해 60%\n잔광 1\n격파 시 무덤에서 핸드로 이동'
    },
    {
      name: '플라스마 미사일',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/세레니엘/blue2.webp',
      tooltip: '피해 120%\n강인도 피해 0.5\n대상이 격파되지 않았다면 1번 더 발동',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 |180|%\n강인도 피해 |1|\n대상이 격파되지 않았다면 1번 더 발동' },
        { cost: 1, type: 'attack', tooltip: '피해 |180|%\n|대상의 감소한 강인도 수만큼 피해량 +60% (최대 10)|' },
        { cost: 1, type: 'attack', tooltip: '피해 120%\n|본능 약점 2|\n|1턴 간 "호밍 레이저" 피해량 +60%|', plus_card: '호밍 레이저' },
        { cost: 1, type: 'attack', tooltip: '피해 120%\n|뽑을 카드에 "호밍 레이저L" 3장 생성|', plus_card: '호밍 레이저L' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|턴 종료 시 무작위 적에게 피해 50%|\n|1턴간 핸드로 이동된 "호밍 레이저" 수만큼 피해량 +30%|', plus_card: '호밍 레이저' }
      ]
    },
    {
      name: '샤이닝 코어',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      plus_card: '호밍 레이저L',
      media: 'cards/세레니엘/blue3.webp',
      tooltip: '"호밍 레이저L" 2장 생성',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '"호밍 레이저L" |3|장 생성', plus_card: '호밍 레이저L' },
        { cost: 1, type: 'skill', tooltip: '"호밍 레이저L" 2장 생성, |그 카드의 소멸 2 증가|', plus_card: '호밍 레이저L' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 / 개전 ]|\n"호밍 레이저L" 2장 생성\n|격파 시 "호밍 레이저L" 2장 생성|', plus_card: '호밍 레이저L' },
        { cost: 'X', type: 'skill', tooltip: '"호밍 레이저L" |X+1장 생성|\n|그 카드에 신속 부여|', plus_card: '호밍 레이저L' },
        { cost: 1, type: 'upgrade', tooltip: '|고유 번뜩임이 발생한 "호밍 레이저" 1장 선택 생성|' }
      ]
    },
    {
      name: '코발트 라이트',
      cost: 3,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/세레니엘/yellow.webp',
      tooltip: '무작위 적들에게 피해 120% × 4\n타격당 강인도 피해 1',
      awakenings: [
        { cost: 3, type: 'attack', tooltip: '무작위 적들에게 피해 |180|% × 4\n타격당 강인도 피해 1\n|격파 : 비용 1 감소|' },
        { cost: 3, type: 'attack', tooltip: '|[ 보존 ]|\n무작위 적들에게 피해 120% × 4\n타격당 강인도 피해 1\n|보존 : 사용 시까지 타격 1회 추가 (최대 5회)|' },
        { cost: 2, type: 'attack', tooltip: '무작위 적들에게 피해 120% × 4\n|타격한 대상 수만큼 "호밍 레이저L" 1장 생성|', plus_card: '호밍 레이저L' },
        { cost: 1, type: 'attack', tooltip: '무작위 적들에게 피해 120%\n|핸드의 "호밍 레이저" 수만큼 타격 1회 추가|' },
        { cost: 3, type: 'attack', tooltip: '|[ 약점 공격 ]|\n|피해| 120% × 4\n|격파 : 1번 더 발동|' }
      ]
    },
    {
      name: '페일 슈팅 스타',
      cost: 2,
      type: 'attack',
      grade: 'purple',
      plus_card: '호밍 레이저',
      media: 'cards/세레니엘/purple.webp',
      tooltip: '피해 150%\n뽑을 카드와 무덤의 "호밍 레이저" 3장 발동'
    }
  ],
  chizuru: [
    {
      name: '참월',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/치즈루/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '참월',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      grade_color: 'gray',
      media: 'cards/치즈루/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '혼불의 보호',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/치즈루/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '업화',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/치즈루/blue1.webp',
      tooltip: '[ 개전 ]\n피해 100%\n주박술 1\n주박술 : 타격 2회 추가',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 개전 ]\n피해 |150|%\n주박술 1\n주박술 : 타격 2회 추가' },
        { cost: 1, type: 'attack', tooltip: '[ 개전 ]\n피해 |150|%\n주박술 1\n주박술 : |다음 사용하는 자신의 카드 비용 2 감소|' },
        { cost: 1, type: 'attack', tooltip: '[ 개전 ]\n피해 |180|%\n주박술 1\n주박술 : |피해량 150%| 증가' },
        { cost: 1, type: 'skill', tooltip: '[ 개전 ]\n주박술 1\n|"달그림자" 1장 생성|', plus_card: '달그림자' },
        { cost: 0, type: 'skill', tooltip: '|[ 개전 / 소멸 ]|\n주박술 1\n주박술 : |주박술 대상 처치 시 이 카드 생성|' }
      ]
    },
    {
      name: '츠쿠요미',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/치즈루/blue2.webp',
      tooltip: '다음 자신의 공격 카드 사용 시 타격 수만큼 도깨비불 3',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '다음 자신의 공격 카드 사용 시 타격 수만큼 도깨비불 |4|' },
        { cost: 0, type: 'skill', tooltip: '다음 자신의 공격 카드 사용 시 |타격 1회 추가|\n타격 수만큼 도깨비불 \\2\\' },
        { cost: 0, type: 'skill', tooltip: '|다음 자신의 "달그림자" 혹은 "달그림자+" 타격 2회 추가|', plus_card: [ '달그림자', '달그림자+' ] },
        { cost: 0, type: 'skill', tooltip: '|핸드에 있는 자신의 공격 카드 수만큼| 도깨비불 3' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 / 주도 ]|\n|자신의 공격 카드 사용 시 도깨비불 2|' }
      ]
    },
    {
      name: '황혼의 결속',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/치즈루/blue3.webp',
      tooltip: '[ 개전 / 유일 ]\n턴 시작 시 구속 획득\n무작위 다른 전투원 카드 2장 사용 시까지 비용 1 감소',
      awakenings: [
        { cost: 0, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n턴 시작 시 구속 획득\n무작위 다른 전투원 카드 2장 사용 시까지 비용 1 감소' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n턴 시작 시 구속 획득\n|"달그림자+" 사용 시, 다음 사용하는 카드 1장 사용 시까지| 비용 1 감소', plus_card: '달그림자+' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n턴 시작 시 구속 획득\n무작위 다른 전투원 카드 2장 |발동|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n턴 시작 시 구속 획득\n무작위 |주도 카드 2장 발동|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 / 유일 ]\n턴 시작 시 구속 획득\n|비용이 가장 높은 카드 1장 사용 시까지 비용 2 감소|' }
      ]
    },
    {
      name: '도깨비 사냥',
      cost: 1,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/치즈루/yellow.webp',
      tooltip: '[ 신속 ]\n피해 60% × 3\n다음 사용하는 결속 카드 피해량 +80%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 \\50\\% × |4|\n다음 사용하는 결속 카드 피해량 +|100|%' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |150|% × \\2\\\n다음 사용하는 결속 카드 피해량 +|100|%' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |100|% × 3\n|"달그림자"를 제외한 핸드에 다른 공격 카드가 없다면 타격 2회 추가|', plus_card: '달그림자' },
        { cost: 1, type: 'skill', tooltip: '[ 신속 ]\n|"참월" 2장 생성|\n|그 카드에 소멸 부여|\n|사용 시까지 비용 1 감소|', plus_card: '참월' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|"달그림자+" 피해량 +80%|\n|턴 시작 시 도깨비불 3|', plus_card: '달그림자+' }
      ]
    },
    {
      name: '달그림자',
      cost: 1,
      type: 'attack',
      grade: 'purple',
      grade_color: 'purple',
      media: 'cards/치즈루/purple.webp',
      tooltip: '[ 결속 1 / 보존 ]\n피해 80%\n결속 중첩 수만큼 피해량 +80%'
    },
    {
      name: '달그림자+',
      cost: 1,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
      media: 'cards/치즈루/purple.webp',
      tooltip: '[ 유일 / 결속 3 / 보존 ]\n피해 180% × 2\n최대 체력의 5% 만큼 회복\n결속 중첩 수만큼 피해량 +80%'
    }
  ],
  yuki: [
    {
      name: '장검 베기',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/유키/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '고속 베기',
      cost: 2,
      type: 'attack',
      grade: 'gray',
      media: 'cards/유키/attack2.webp',
      tooltip: '피해 220%'
    },
    {
      name: '흘려 보내기',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/유키/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '제압 준비',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/유키/blue1.webp',
      tooltip: '자신의 공격 카드 드로우 1\n1턴간 그 카드 피해량 40% 증가',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '|[ 보존 ]|\n자신의 공격 카드 드로우 1\n1턴간 그 카드 피해량 |80|% 증가' },
        { cost: 0, type: 'skill', tooltip: '자신의 공격 카드 드로우 1\n1턴간 |자신의 공격| 카드 피해량 \\30\\% 증가' },
        { cost: 0, type: 'skill', tooltip: '자신의 공격 카드 드로우 |2|\n1턴간 그 카드의 피해량 \\10\\% \\감소\\' },
        { cost: 0, type: 'skill', tooltip: '자신의 공격 카드 드로우 1\n1턴간 그 카드 피해량 40% 증가\n|영감 : 자신의 공격 카드 드로우 1|' },
        { cost: 0, type: 'skill', tooltip: '자신의 공격 카드 드로우 1\n|다음 턴 시작 시 자신의 공격 카드 드로우 2|' }
      ]
    },
    {
      name: '훔쳐베기',
      cost: 2,
      type: 'attack',
      grade: 'blue',
      media: 'cards/유키/blue2.webp',
      tooltip: '모든 적 피해 220%\n단일 대상일 경우 피해량 50% 증가\n영감 : 비용 1 감소',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 |330|%\n단일 대상일 경우 피해량 50% 증가\n영감 : 비용 1 감소' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 220%\n단일 대상일 경우 피해량 50% 증가\n영감 : 비용 |2| 감소' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 220%\n단일 대상일 경우 피해량 50% 증가\n영감 : |타격 1회 추가|' },
        { cost: 2, type: 'attack', tooltip: '|[ 보존 ]|\n|피해 400%|\n|1턴간 드로우한 자신의 카드 수만큼 피해량 +150% (최대 5)|' },
        { cost: 3, type: 'attack', tooltip: '모든 적 피해 |360|%\n|사용 시 비용 1 감소|\n단일 대상일 경우 피해량 50% 증가' }
      ]
    },
    {
      name: '눈속임 일격',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/유키/blue3.webp',
      tooltip: '[ 보존 ]\n피해 180%\n핸드의 무작위 자신의 카드 1장 영감 효과 활성화',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 보존 ]\n피해 |240|%\n|핸드의 자신의 카드 1장 선택|, 영감 효과 활성화' },
        { cost: 1, type: 'attack', tooltip: '|[ 보존 / 회수 ]|\n피해 |240|%\n핸드의 무작위 자신의 카드 1장 영감 효과 활성화' },
        { cost: 1, type: 'skill', tooltip: '|핸드의 자신의 카드 모두 영감 효과 활성화|\n|1턴간 자신의 영감 효과가 활성화된 카드 사용 시 무작위 적 피해 100%|' },
        { cost: 1, type: 'attack', tooltip: '피해 180%\n|영감을 효과를 보유한 카드 드로우 1|' },
        { cost: 1, type: 'attack', tooltip: '피해 |200|%\n|영감 : 타격 1회 추가|' }
      ]
    },
    {
      name: '빙점 칼날',
      cost: 1,
      type: 'upgrade',
      grade: 'yellow',
      media: 'cards/유키/yellow.webp',
      tooltip: '[ 유일 ]\n자신의 영감 효과가 활성화된 카드 사용 시 모든 적 피해 120%',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n자신의 영감 효과가 활성화된 카드 사용 시 모든 적 피해 |160|%' },
        { cost: 0, type: 'upgrade', tooltip: '|[ 유일 / 개전 ]|\n자신의 영감 효과가 활성화된 카드 사용 시 모든 적 피해 120%' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n자신의 영감 효과가 활성화된 카드 사용 시 |무작위 적 피해 120% × 2|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n|자신의 전체 공격 카드 피해량 50% 증가|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n|턴 시작 시 핸드의 무작위 카드 2장 영감 효과 활성화|' }
      ]
    },
    {
      name: '빙산 가르기',
      cost: 1,
      type: 'attack',
      grade: 'purple',
      media: 'cards/유키/purple.webp',
      tooltip: '모든 적 피해 180%\n영감 : 타격 1회 추가'
    }
  ],
  haru: [
    {
      name: '앵커',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/하루/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '파워 앵커',
      cost: 2,
      type: 'attack',
      grade: 'gray',
      media: 'cards/하루/attack2.webp',
      tooltip: '피해 220%'
    },
    {
      name: '앵커 드롭',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/하루/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '앵커 슛',
      cost: 2,
      type: 'attack',
      grade: 'blue',
      media: 'cards/하루/blue1.webp',
      tooltip: '[ 분쇄 ]\n피해 300%\n이 카드를 사용한 수만큼 피해량 +100% (최대 10)',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '[ 분쇄 ]\n피해 |400|%\n이 카드를 사용한 수만큼 피해량 +|150|% (최대 10)' },
        { cost: 2, type: 'attack', tooltip: '[ 분쇄 ]\n피해 |350|%\n|연속 : 타격 1회 추가|' },
        { cost: 2, type: 'attack', tooltip: '[ 분쇄 ]\n피해 |350|%\n|다른 전투원 카드 모두 버리기, 그 수만큼 피해량 +150%|' },
        { cost: 2, type: 'attack', tooltip: '[ 분쇄 ]\n피해 |380|%\n이 카드를 사용한 수만큼 피해량 +|100|%\n|뽑을 카드에 이 카드 생성 (전투당 2회)|' },
        { cost: 2, type: 'attack', tooltip: '[ 분쇄 ]\n피해 |350|%\n이 카드를 사용한 수만큼 피해량 +|100|% (최대 10)\n|치명타 시 핸드로 이동 (턴당 1회)|' }
      ]
    },
    {
      name: '앵커포인터',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      plus_card: '앵커 슛',
      media: 'cards/하루/blue2.webp',
      tooltip: '뽑을 카드 혹은 버린 카드에서 "앵커 슛"을 핸드로 이동',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '|모든 앵커 슛에 회수 부여|', plus_card: '앵커 슛' },
        { cost: 0, type: 'skill', tooltip: '뽑을 카드 혹은 버린 카드에서 "앵커 슛"을 핸드로 이동, |그 카드에 보존 부여|', plus_card: '앵커 슛' },
        { cost: 0, type: 'skill', tooltip: '|[ 회수 ]|\n뽑을 카드 혹은 버린 카드에서 "앵커 슛"을 핸드로 이동', plus_card: '앵커 슛' },
        { cost: 0, type: 'skill', tooltip: '뽑을 카드 혹은 버린 카드에서 "앵커 슛"을 핸드로 이동, |1턴간 사용 시까지 그 카드의 피해량 +20%|', plus_card: '앵커 슛' },
        { cost: 0, type: 'skill', tooltip: '뽑을 카드 혹은 버린 카드에서 "앵커 슛"을 핸드로 이동, |1턴간 사용 시까지 그 카드의 치명확률 +25%|', plus_card: '앵커 슛' }
      ]
    },
    {
      name: '파워 차지',
      cost: 2,
      type: 'attack',
      grade: 'blue',
      media: 'cards/하루/blue3.webp',
      tooltip: '모든 적 피해 180%\n단일 대상일 경우 피해량 +80%',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 |270|%\n단일 대상일 경우 피해량 +|120|%' },
        { cost: 2, type: 'attack', tooltip: '|[ 약점 공격 ]|\n모든 적 피해 |270|%' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 |270|%\n|처치 : 이 카드 1번 더 발동 (최대 1회)|' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 |240|%\n|타격한 대상 수만큼 다음 사용하는 자신의 공격 카드 피해량 +30%|' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 |300|%\n|연속 : 이 카드 비용 1로 변경|' }
      ]
    },
    {
      name: '에너지 충전',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/하루/yellow.webp',
      tooltip: '[ 보존 ]\n1턴간 자신의 공격 카드 피해량 30% 증가',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n1턴간 자신의 공격 카드 피해량 |40|% 증가' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n|다음 사용하는 공격 카드의 피해량 50% 증가, 강인도 피해 1|' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n1턴간 |핸드의 자신의 카드 수만큼| 자신의 공격 카드 피해량 +|70|%' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n1턴간 자신의 공격 카드 피해량 30% 증가\n|자신의 카드 드로우 1|' },
        { cost: 0, type: 'upgrade', tooltip: '|[ 유일 ]|\n자신의 공격 카드 피해량 \\20\\% 증가' }
      ]
    },
    {
      name: '끌어올리기',
      cost: 0,
      type: 'skill',
      grade: 'purple',
      plus_card: '앵커 슛',
      media: 'cards/하루/purple.webp',
      tooltip: '[ 보존 ]\n핸드의 "앵커 슛" 1턴간 사용 시까지 피해량 80% 증가'
    }
  ],
  renoa: [
    {
      name: '섬멸 사격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/레노아/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '섬멸 사격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/레노아/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '검은 장막',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/레노아/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '비탄의 메아리',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      plus_card: '진혼의 탄환',
      media: 'cards/레노아/blue1.webp',
      tooltip: '피해 140%\n"진혼의 탄환" 1장 생성',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 140%\n"진혼의 탄환" |2|장 생성', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'attack', tooltip: '피해 140%\n"진혼의 탄환" 1장 생성, |2장 버린 카드에 생성|', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'attack', tooltip: '피해 140%\n"진혼의 탄환" 1장 생성, |뽑을 카드의 "진혼의 탄환" 2장 버리기|', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'skill', tooltip: '"진혼의 탄환" |3|장 생성', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 개전 ]|\n"진혼의 탄환" 1장 생성\n|턴 시작 시 "진혼의 탄환" 1장 생성|', plus_card: '진혼의 탄환' }
      ]
    },
    {
      name: '진혼의 탄환',
      cost: 1,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/레노아/blue1_1.webp',
      tooltip: '[ 탄환 / 소멸 ]\n피해 160%\n버린 카드로 이동 시 무작위 적 추가 공격 120%'
    },
    {
      name: '즉결 심판',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      plus_card: '진혼의 탄환',
      media: 'cards/레노아/blue2.webp',
      tooltip: '피해 180%\n핸드에 "진혼의 탄환"이 있다면 1장 버리고 피해량 +100%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 |270|%\n핸드에 "진혼의 탄환"이 있다면 1장 버리고 피해량 +|150|%', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'attack', tooltip: '피해 |220|%\n|뽑을 카드|에 "진혼의 탄환"이 있다면 1장 버리고 피해량 +|120|%', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'attack', tooltip: '피해 |220|%\n|버린 카드에 "진혼의 탄환"이 있다면 1장 소멸하고 타격 1회 추가|', plus_card: '진혼의 탄환' },
        { cost: 2, type: 'attack', tooltip: '피해 180%\n|버린 카드로 이동 시 무작위 적 추가 공격 250%|' },
        { cost: 1, type: 'upgrade', tooltip: '|턴 종료 시 체력이 가장 낮은 적에게 추가 공격 200%|' }
      ]
    },
    {
      name: '칠흑의 송시',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      plus_card: '진혼의 탄환',
      media: 'cards/레노아/blue3.webp',
      tooltip: '피해 50% × 3\n핸드의 "진혼의 탄환" 수만큼 피해량 +20%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 |75|% × 3\n핸드의 "진혼의 탄환" 수만큼 피해량 +30%', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'skill', tooltip: '|뽑을 카드와 버린 카드에서 "진혼의 탄환" 3장까지 핸드로 이동|', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'attack', tooltip: '피해 50% × 3\n|대상에게 핸드의 "진혼의 탄환" 수만큼 표식 1|', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'attack', tooltip: '피해 50% × 3\n|1턴간 "진혼의 탄환"의 추가 공격 피해량 100% 증가|', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'attack', tooltip: '피해 50% × 3\n|버린 카드의 "진혼의 탄환" 모두 소멸, 그 수만큼 피해량 50% 증가|', plus_card: '진혼의 탄환' }
      ]
    },
    {
      name: '운명을 삼킨 꽃',
      cost: 0,
      type: 'skill',
      grade: 'yellow',
      plus_card: '진혼의 탄환',
      media: 'cards/레노아/yellow.webp',
      tooltip: '핸드의 카드 2장까지 버리기\n그 수만큼 "진혼의 탄환" 생성',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '핸드의 카드 |3|장까지 버리기\n그 수만큼 "진혼의 탄환" 생성', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'skill', tooltip: '|[ 소멸 ]|\n핸드의 |다른 전투원의 카드 모두 버리기|\n그 수만큼 "진혼의 탄환" |2|장 생성', plus_card: '진혼의 탄환' },
        { cost: 0, type: 'skill', tooltip: '핸드의 카드 2장까지 버리기\n|버린 카드의 비용 1당 다음 사용하는 카드 피해량 +40%|', plus_card: '진혼의 탄환' },
        { cost: 1, type: 'skill', tooltip: '|드로우 2|\n|핸드에 진혼의 탄환이 있다면 드로우 1 추가|', plus_card: '진혼의 탄환' },
        { cost: 0, type: 'skill', tooltip: '|핸드의 모든 "진혼의 탄환"에 회수 부여|', plus_card: '진혼의 탄환' }
      ]
    },
    {
      name: '결사의 일격',
      cost: 1,
      type: 'attack',
      grade: 'purple',
      plus_card: '진혼의 탄환',
      media: 'cards/레노아/purple.webp',
      tooltip: '[ 보존 ]\n피해 150%\n"진혼의 탄환" 모두 버리기, 그 수만큼 피해량 +50%'
    }
  ],
  veronica: [
    {
      name: '속사탄',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/베로니카/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '속사탄',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/베로니카/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '금선화의 환상',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/베로니카/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '발사 준비',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      plus_card: '발리스타',
      media: 'cards/베로니카/blue1.webp',
      tooltip: '[ 유일 / 개전 ]\n"발리스타" 1장 생성\n턴 시작 시 "발리스타" 1장 생성',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n"발리스타" 1장 생성\n턴 시작 시 "발리스타" 1장 생성, |50% 확률로 1장 추가 생성|', plus_card: '발리스타' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n|"관통 발리스타"| 1장 생성\n턴 시작 시 |"관통 발리스타"| 1장 생성', plus_card: '관통 발리스타' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n|"강화 발리스타"| 1장 생성\n턴 시작 시 |"강화 발리스타"| 1장 생성', plus_card: '강화 발리스타' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n|"대형 발리스타"| 1장 생성\n턴 시작 시 |"대형 발리스타"| 1장 생성', plus_card: '대형 발리스타' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n|"연사 발리스타"| 1장 생성\n턴 시작 시 |"연사 발리스타"| 1장 생성', plus_card: '연사 발리스타' }
      ]
    },
    {
      name: '발리스타',
      cost: '-',
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/베로니카/blue1_1.webp',
      tooltip: '[ 증발 ]\n턴 종료 시 무작위 적 추가 공격 150%'
    },
    {
      name: '관통 발리스타',
      cost: '-',
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/베로니카/blue1_2.webp',
      tooltip: '[ 증발 ]\n턴 종료 시 무작위 적 관통 피해 200%\n대상이 실드를 보유하면 피해량 +50%'
    },
    {
      name: '강화 발리스타',
      cost: '-',
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/베로니카/blue1_1.webp',
      tooltip: '[ 증발 ]\n턴 종료 시 무작위 적 추가 공격 200%\n치명확률 +30%'
    },
    {
      name: '대형 발리스타',
      cost: '-',
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/베로니카/blue1_3.webp',
      tooltip: '[ 증발 ]\n턴 종료 시 모든 적 추가 공격 150%'
    },
    {
      name: '연사 발리스타',
      cost: '-',
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/베로니카/blue1_4.webp',
      tooltip: '[ 증발 ]\n턴 종료 시 무작위 적들에게 추가 공격 100% × 2'
    },
    {
      name: '초소형 발리스타',
      cost: '-',
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/베로니카/blue1_5.webp',
      tooltip: '[ 증발 ]\n턴 종료 시 무작위 적 추가 공격 40%'
    },
    {
      name: '숨돌리기',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/베로니카/blue2.webp',
      tooltip: '실드 100%\n다른 전투원의 카드 드로우 2',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '다른 전투원의 카드 드로우 2' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n다른 전투원의 카드 드로우 2\n|그 카드가 스킬 카드일 시 장전 1|' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n다른 전투원의 카드 드로우 2\n|그 카드 중 1장 1턴간 사용 시까지 비용 1 감소|' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n|핸드의 다른 전투원의 스킬 카드 수만큼 장전 1|' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n|핸드의 다른 전투원의 카드 모두 버리기|\n|그 수만큼 장전 1|' }
      ]
    },
    {
      name: '결심의 펜던트',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/베로니카/blue3.webp',
      tooltip: '다른 전투원의 스킬 카드 사용 시 장전 1',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '스킬 카드 사용 시 장전 1' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n다른 전투원의 스킬 카드 사용 시 장전 1\n|3장 사용 시 다음 턴 시작 시 "초소형 발리스타" 1장 생성|', plus_card: '초소형 발리스타' },
        { cost: 1, type: 'skill', tooltip: '|[ 소멸 2 ]|\n|1턴간 카드 사용 시| 장전 1' },
        { cost: 1, type: 'upgrade', tooltip: '다른 전투원의 스킬 카드 사용 시 장전 1\n|50% 확률로 장전 1 추가|' },
        { cost: 1, type: 'skill', tooltip: '|[ 보존 / 회수 4 ]|\n장전 |2|' }
      ]
    },
    {
      name: '코왈스키 경',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/베로니카/yellow.webp',
      tooltip: '핸드의 발리스타 1장 선택, 발동 시까지 피해량 +100%\n드로우 1',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '핸드의 발리스타 1장 선택, 발동 시까지 피해량 +|150|%\n드로우 |2|' },
        { cost: 1, type: 'skill', tooltip: '드로우 1\n|1턴간 발리스타 피해량 30% 증가|' },
        { cost: 1, type: 'skill', tooltip: '드로우 |2|\n|스킬 카드 드로우 시 "발리스타" 1장 생성|', plus_card: '발리스타' },
        { cost: 1, type: 'skill', tooltip: '핸드의 |무작위 발리스타 1장 피해량 +250%, 발동 후 소멸|' },
        { cost: 1, type: 'skill', tooltip: '핸드의 발리스타 1장 선택 |소멸|\n|발리스타 2장 생성|\n|그 카드 피해량 발동 시까지 25% 감소|' }
      ]
    },
    {
      name: '폭격 준비',
      cost: 1,
      type: 'upgrade',
      grade: 'purple',
      media: 'cards/베로니카/purple.webp',
      tooltip: '[ 유일 ]\n장전 최대 중첩 1 증가\n장전 2'
    }
  ],
  ruke: [
    {
      name: '단발 사격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/루크/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '단발 사격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/루크/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '그림자 은신',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/루크/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '연속 격발',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ],
      media: 'cards/루크/blue1.webp',
      tooltip: '피해 50% × 2\n치명타 수만큼 "핸드건 탄환" 생성\n치명확률 +50%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '|[ 회수 ]|\n피해 |75|% × 2\n치명타 수만큼 "핸드건 탄환" 생성\n치명확률 +50%', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] },
        { cost: 1, type: 'attack', tooltip: '피해 \\30\\% × |3|\n치명타 수만큼 "핸드건 탄환" 생성\n치명확률 +50%', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] },
        { cost: 1, type: 'attack', tooltip: '피해 |300|%\n치명타 수만큼 "핸드건 탄환" 생성\n|확정 치명|', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] },
        { cost: 0, type: 'attack', tooltip: '|[ 탄환 ]|\n피해 |100|% × |3|\n치명확률 +50%', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] },
        { cost: 1, type: 'attack', tooltip: '피해 |100|% × 2\n치명타 수만큼 |드로우|\n치명확률 +|70|%' }
      ]
    },
    {
      name: '매그넘탄',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'gray',
      media: 'cards/루크/blue1_1.webp',
      tooltip: '[ 증발 / 소멸 / 탄환 ]\n피해 70%'
    },
    {
      name: '은탄',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'gray',
      media: 'cards/루크/blue1_2.webp',
      tooltip: '[ 증발 / 소멸 / 탄환 ]\n피해 50%\n약점 공격 : 피해량 100% 증가'
    },
    {
      name: '우라늄탄',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'gray',
      media: 'cards/루크/blue1_3.webp',
      tooltip: '[ 증발 / 소멸 / 탄환 ]\n피해 50%\n대상이 실드를 보유하면 피해량 100% 증가'
    },
    {
      name: '예광탄',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'gray',
      media: 'cards/루크/blue1_4.webp',
      tooltip: '[ 증발 / 소멸 / 탄환 ]\n피해 30%\n표식 1'
    },
    {
      name: '은밀한 장전',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ],
      media: 'cards/루크/blue2.webp',
      tooltip: '"핸드건 탄환" 2장 생성',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '"핸드건 탄환" 2장 생성\n|그 카드의 치명확률 +30%|', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] },
        { cost: 1, type: 'skill', tooltip: '"핸드건 탄환" |3|장 생성', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] },
        { cost: 1, type: 'skill', tooltip: '"핸드건 탄환" 2장 생성\n|다음 턴 시작 시 "핸드건 탄환" 2장 생성|', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] },
        { cost: 0, type: 'upgrade', tooltip: '|턴 시작 시| "핸드건 탄환" \\1\\장 생성', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] },
        { cost: 2, type: 'skill', tooltip: '|[ 소멸 ]|\n"핸드건 탄환" |5|장 생성', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] }
      ]
    },
    {
      name: '기회 포착',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/루크/blue3.webp',
      tooltip: '[ 주도 ]\n실드 100%\n다음 사용하는 탄환 카드의 피해량 +120%',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 주도 ]\n실드 |150|%\n다음 사용하는 탄환 카드의 피해량 +|170|%' },
        { cost: 1, type: 'skill', tooltip: '[ 주도 ]\n실드 100%\n다음 사용하는 탄환 카드 |2장|의 피해량 +120%' },
        { cost: 1, type: 'skill', tooltip: '[ 주도 ]\n실드 100%\n|1턴간| 탄환 카드의 피해량 +\\70\\%' },
        { cost: 1, type: 'skill', tooltip: '[ 주도 ]\n실드 100%\n다음 사용하는 |공격 카드|의 피해량 +\\100\\%' },
        { cost: 1, type: 'upgrade', tooltip: '[ 주도 ]\n|"핸드건 탄환" 카드|의 피해량 +\\30\\%', plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ] }
      ]
    },
    {
      name: '마안의 난무',
      cost: 1,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/루크/yellow.webp',
      tooltip: '피해 50%\n이번 턴 사용한 탄환 카드 수만큼 타격 1회 추가',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 |75|%\n이번 턴 사용한 탄환 카드 수만큼 타격 1회 추가' },
        { cost: 1, type: 'attack', tooltip: '피해 50%\n이번 턴 사용한 |공격 카드| 수만큼 타격 1회 추가' },
        { cost: 1, type: 'attack', tooltip: '피해 50%\n이번 턴 사용한 탄환 카드 수만큼 타격 1회 추가\n|약점 공격 : 피해량 +50%|' },
        { cost: 1, type: 'attack', tooltip: '피해 50%\n|실드 50%|\n이번 턴 사용한 탄환 카드 수만큼 타격 1회 추가, |실드 획득량 +50%|' },
        { cost: 3, type: 'attack', tooltip: '피해 50% × |6|\n|탄환 카드 사용 시 1턴간 사용 시까지 비용 1 감소|' }
      ]
    },
    {
      name: '필살탄',
      cost: 0,
      type: 'attack',
      grade: 'purple',
      plus_card: [ '매그넘탄', '은탄', '우라늄탄', '예광탄' ],
      media: 'cards/루크/purple.webp',
      tooltip: '[ 사용 불가 / 유일 / 탄환 ]\n피해 300%\n"핸드건 탄환" 카드 5장 사용 시 사용 불가 제거'
    }
  ],
  hugo: [
    {
      name: '단검 던지기',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/휴고/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '단검 던지기',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/휴고/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '방어 시스템',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/휴고/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '사냥 본능',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/휴고/blue1.webp',
      tooltip: '[ 개전 ]\n다른 전투원의 강화 혹은 스킬 카드 사용 시 사냥 개시 1',
      awakenings: [
        { cost: 0, type: 'upgrade', tooltip: '[ 개전 ]\n다른 전투원의 강화 혹은 스킬 카드 사용 시 사냥 개시 1' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 ]\n다른 전투원의 강화 혹은 스킬 카드 사용 시 사냥 개시 1\n|50% 확률로 사냥 개시 1 추가|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 ]\n다른 전투원의 강화 혹은 스킬 카드 사용 시 사냥 개시 1\n|사냥 개시가 발동되면 대상에게 협공 50%|' },
        { cost: 0, type: 'skill', tooltip: '|핸드의 스킬 수만큼 사냥 개시|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 개전 ]\n|강화 혹은 스킬 카드| 사용 시 사냥 개시 1' }
      ]
    },
    {
      name: '단검 방사',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/휴고/blue2.webp',
      tooltip: '[ 신속 ]\n무작위 적들에게 피해 60% × 3\n타격한 대상 수만큼 사냥 개시',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n무작위 적들에게 피해 |90|% × 3\n타격한 대상 수만큼 사냥 개시' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |90|% × 3\n사냥 개시 |2|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |250|%\n|피해를 줬을 시 무작위 아군이 대상에게 협공 100%|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n무작위 적들에게 피해 |90|% × 3\n|사냥 개시 상태라면 피해량 100% 증가|' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 유일 ]|\n|턴 시작 시| 무작위 적들에게 피해 60% × \\2\\\n타격한 대상 수만큼 사냥 개시' }
      ]
    },
    {
      name: '빠른 해결법',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/휴고/blue3.webp',
      tooltip: '[ 신속 ]\n피해 80% × 2\n사냥 개시 상태라면 공격 카드 1장 드로우',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |120|% × 2\n사냥 개시 상태라면 공격 카드 1장 드로우' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 80% × 2\n사냥 개시 상태라면 |타격 1회 추가|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |100|% × 2\n사냥 개시 상태라면 드로우 |2|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |100|% × |3|\n사냥 개시 상태라면 |모든 적 행동 카운트 2 증가|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |120|%\n사냥 개시 수만큼 |타격 1회 추가|' }
      ]
    },
    {
      name: '딩고 하울링',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/휴고/yellow.webp',
      tooltip: '실드 100%\n사냥 개시 2',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n사냥 개시 |3|' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n|사냥 개시 상태라면 실드 획득량 +50%|\n사냥 개시 2' },
        { cost: 1, type: 'upgrade', tooltip: '|사냥 개시 획득 시 공격 카드 드로우 1 (턴당 1회)|' },
        { cost: 1, type: 'skill', tooltip: '사냥 개시 2\n|연속 : 사냥 개시 2 추가|' },
        { cost: 1, type: 'skill', tooltip: '사냥 개시 2\n|공격 카드 드로우 2|' }
      ]
    },
    {
      name: '해결사의 방식',
      cost: 1,
      type: 'upgrade',
      grade: 'purple',
      media: 'cards/휴고/purple.webp',
      tooltip: '[ 유일 ]\n사냥 개시의 추가 공격 피해량 40% 증가'
    }
  ],
  orlea: [
    {
      name: '공격해, 얘들아',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/오를레아/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '빛의 치유',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/오를레아/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '빛의 치유',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/오를레아/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '성스러운 향로',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      plus_card: [ '말랑이★', '튼튼이★', '날렵이★' ],
      media: 'cards/오를레아/blue1.webp',
      tooltip: '[ 개전 ]\n"피조물★" 2장 생성',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 개전 ]\n"피조물★" |3|장 생성', plus_card: [ '말랑이★', '튼튼이★', '날렵이★' ] },
        { cost: 2, type: 'upgrade', tooltip: '|[ 개전 / 주도 ]|\n"피조물★" 2장 생성\n|턴 시작 시 "피조물★" 1장 생성|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★' ] },
        { cost: 1, type: 'skill', tooltip: '[ 개전 ]\n|"말랑이★"|, "피조물★" |1장씩 생성|\n|다음 "말랑이" 사용 시 "말랑이★" 생성|', plus_card: [ '말랑이★', '말랑이★★', '말랑이★★★', '튼튼이★', '날렵이★' ] },
        { cost: 1, type: 'skill', tooltip: '[ 개전 ]\n|"날렵이★"|, "피조물★" |1장씩 생성|\n|다음 사용하는 "날렵이" 피해량 40% 증가|', plus_card: [ '날렵이★', '날렵이★★', '날렵이★★★', '말랑이★', '튼튼이★' ] },
        { cost: 1, type: 'skill', tooltip: '[ 개전 ]\n|"튼튼이★"|, "피조물★" |1장씩 생성|\n|다음 "튼튼이" 사용 시 실드 150%|', plus_card: [ '튼튼이★', '튼튼이★★', '튼튼이★★★', '말랑이★', '날렵이★' ] }
      ]
    },
    {
      name: '성장 촉진',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/오를레아/blue2.webp',
      tooltip: '치유 100%\n핸드의 자신의 카드 1장 선택, 보존 효과 2회 발동',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '치유 100%\n|핸드의 카드| 1장 선택, 보존 효과 2회 발동' },
        { cost: 1, type: 'skill', tooltip: '|[ 소멸 ]|\n치유 |200|%\n핸드의 자신의 |"피조물"| 1장 선택, |핸드에 복제|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★' ] },
        { cost: 1, type: 'skill', tooltip: '치유 |150|%\n핸드의 자신의 카드 1장 선택, 보존 효과 2회 발동\n|그 카드가 "말랑이"일 시 모든 적 취약 2|', plus_card: [ '말랑이★', '말랑이★★', '말랑이★★★' ] },
        { cost: 1, type: 'skill', tooltip: '치유 |150|%\n핸드의 자신의 카드 1장 선택, 보존 효과 2회 발동\n|그 카드가 "날렵이"일 시 보존 효과 3회로 발동|', plus_card: [ '날렵이★', '날렵이★★', '날렵이★★★' ] },
        { cost: 1, type: 'skill', tooltip: '치유 |150|%\n핸드의 자신의 카드 1장 선택, 보존 효과 2회 발동\n|그 카드가 "튼튼이"일 시 아군 스트레스 5 감소|', plus_card: [ '튼튼이★', '튼튼이★★', '튼튼이★★★' ] }
      ]
    },
    {
      name: '귀찮아',
      cost: 0,
      type: 'attack',
      grade: 'blue',
      media: 'cards/오를레아/blue3.webp',
      tooltip: '핸드의 카드 수만큼 고정 피해 40%, 치유 20%',
      awakenings: [
        { cost: 0, type: 'attack', tooltip: '핸드의 카드 수만큼 고정 피해 40%\n|6장 이상일 시 치유 200%|' },
        { cost: 1, type: 'attack', tooltip: '|방어 기반 피해 100%|\n|핸드의 "피조물" 수만큼 피해량 +100%, 치유 60%|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★' ] },
        { cost: 3, type: 'attack', tooltip: '|[ 보존 ]|\n|방어 기반 피해 450%|\n|치유 200%|\n|보존 : 비용 1 감소|' },
        { cost: 0, type: 'attack', tooltip: '|무작위 적들에게 방어 기반 피해 60% × 3|\n|타격한 대상 수만큼 "피조물★" 1장 생성|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★' ] },
        { cost: 1, type: 'attack', tooltip: '|[ 보존 ]|\n|방어 기반 피해 120%|\n|이 카드 핸드에 있을 때 "피조물" 생성한 수만큼 사용 시까지 피해량 +120%|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★' ] }
      ]
    },
    {
      name: '성장하는 피조물',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      plus_card: [ '말랑이★', '튼튼이★', '날렵이★', '말랑이★★★', '튼튼이★★★', '날렵이★★★' ],
      media: 'cards/오를레아/yellow.webp',
      tooltip: '[ 보존 ]\n"피조물★" 1장 생성\n보존 : 이 카드 "피조물★★★"로 변경',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n"피조물★" 1장 생성\n보존 : |"피조물★" 1장 생성|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★' ] },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n"피조물★" 1장 생성\n보존 : 이 카드| "피조물★★"|로 변경, |모든 "피조물★" 1장씩 생성|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★', '말랑이★★', '튼튼이★★', '날렵이★★' ] },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n"피조물★" 1장 생성\n보존 : 이 카드 |"말랑이★★★"|로 변경, |모든 적 취약 2|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★', '말랑이★★★' ] },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n"피조물★" 1장 생성\n보존 : 이 카드 |"날렵이★★★"|로 변경, |보존 효과 2회 발동|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★', '날렵이★★★' ] },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n"피조물★" 1장 생성\n보존 : 이 카드 |"튼튼이★★★"|로 변경, |모든 적 약화 3|', plus_card: [ '말랑이★', '튼튼이★', '날렵이★', '튼튼이★★★' ] }
      ]
    },
    {
      name: '빛의 의지',
      cost: 1,
      type: 'skill',
      grade: 'purple',
      media: 'cards/오를레아/purple.webp',
      tooltip: '치유 200%\n핸드의 모든 카드의 보존 효과 발동'
    },
    {
      name: '말랑이★',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'blue',
      media: 'cards/오를레아/blue1_1_1.webp',
      tooltip: '[ 소멸 / 보존 / 피조물 ]\n1턴간 피해량 10% 증가\n보존 : 다음 사용하는 공격 카드의 피해량 10% 증가'
    },
    {
      name: '말랑이★★',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/오를레아/blue1_1_2.webp',
      tooltip: '[ 소멸 / 보존 / 피조물 ]\n1턴간 피해량 20% 증가\n보존 : 다음 사용하는 공격 카드의 피해량 20% 증가'
    },
    {
      name: '말랑이★★★',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'purple',
      media: 'cards/오를레아/blue1_1_3.webp',
      tooltip: '[ 소멸 / 보존 / 피조물 ]\n1턴간 피해량 35% 증가\n보존 : 다음 사용하는 공격 카드의 피해량 35% 증가'
    },
    {
      name: '날렵이★',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/오를레아/blue1_2_1.webp',
      tooltip: '[ 소멸 / 보존 / 피조물 ]\n피해 100%\n보존 : 피해량 +40%'
    },
    {
      name: '날렵이★★',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/오를레아/blue1_2_2.webp',
      tooltip: '[ 소멸 / 보존 / 피조물 ]\n피해 200%\n보존 : 피해량 +80%'
    },
    {
      name: '날렵이★★★',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'purple',
      media: 'cards/오를레아/blue1_2_3.webp',
      tooltip: '[ 소멸 / 보존 / 피조물 ]\n피해 350%\n보존 : 피해량 +150%'
    },
    {
      name: '튼튼이★',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'blue',
      media: 'cards/오를레아/blue1_3_1.webp',
      tooltip: '[ 소멸 / 보존 / 피조물 ]\n실드 100%\n보존 : 치유 60%'
    },
    {
      name: '튼튼이★★',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/오를레아/blue1_3_2.webp',
      tooltip: '[ 소멸 / 보존 / 피조물 ]\n실드 200%\n보존 : 치유 120%'
    },
    {
      name: '튼튼이★★★',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'purple',
      media: 'cards/오를레아/blue1_3_3.webp',
      tooltip: '[ 소멸 / 보존 / 피조물 ]\n실드 350%\n보존 : 치유 200%'
    }
  ],
  rin: [
    {
      name: '흑운검 일식',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/린/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '흑운검 삼식',
      cost: 2,
      type: 'attack',
      grade: 'gray',
      media: 'cards/린/attack2.webp',
      tooltip: '피해 220%'
    },
    {
      name: '수호',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/린/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '발도',
      cost: 0,
      type: 'attack',
      grade: 'blue',
      media: 'cards/린/blue1.webp',
      tooltip: '[ 신속 ]\n피해 120%\n흑운태세 획득\n흑운태세 : 피해량 100% 증가',
      awakenings: [
        { cost: 0, type: 'attack', tooltip: '[ 신속 ]\n피해 |180|%\n흑운태세 획득\n흑운태세 : 피해량 100% 증가' },
        { cost: 0, type: 'attack', tooltip: '[ 신속 ]\n피해 |180|%\n흑운태세 획득\n흑운태세 : |타격 1회 추가|' },
        { cost: 0, type: 'attack', tooltip: '|[ 신속 ]|\n피해 |450|%\n흑운태세 : |이 카드 사용 가능|' },
        { cost: 0, type: 'attack', tooltip: '[ 신속 ]\n피해 |150|%\n흑운태세 획득\n흑운태세 : |핸드의 카드 수만큼 피해량 30% 증가|' },
        { cost: 2, type: 'attack', tooltip: '[ 신속 ]\n피해 |360|%\n흑운태세 획득\n흑운태세 : 피해량 100% 증가' }
      ]
    },
    {
      name: '흑운 오의 : 잔',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/린/blue2.webp',
      tooltip: '자신의 카드 드로우 1\n흑운태세 획득',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '|실드 100%|\n자신의 카드 드로우 |2|\n흑운태세 획득' },
        { cost: 0, type: 'skill', tooltip: '자신의 카드 드로우 1, |1턴간 사용 시까지 그 카드 비용 1 감소|\n흑운태세 획득' },
        { cost: 0, type: 'skill', tooltip: '자신의 |공격 카드| 드로우 1, |1턴간 사용 시까지 그 카드 피해량 50% 증가|\n흑운태세 획득' },
        { cost: 0, type: 'skill', tooltip: '|뽑을 카드 혹은 버린 카드에서 "흑운 오의 : 멸", "흑운 오의 : 흑무"를 핸드로 이동|', plus_card: [ '흑운 오의 : 멸', '흑운 오의 : 흑무' ] },
        { cost: 1, type: 'upgrade', tooltip: '|턴 시작 시 흑운태세 상태라면 자신의 카드 드로우 1|' }
      ]
    },
    {
      name: '흑운 오의 : 멸',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/린/blue3.webp',
      tooltip: '[ 신속 ]\n피해 200%\n흑운태세 : 타격 1회 추가',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |300|%\n흑운태세 : 타격 1회 추가|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 \\100\\% × |2|\n흑운태세 : 타격 |2|회 추가' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 \\150\\% × |2|\n흑운태세 : |치명피해 +100%|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 |300|%\n흑운태세 : |피해량 100% 증가|' },
        { cost: 1, type: 'attack', tooltip: '[ 신속 ]\n피해 200%\n흑운태세 : |핸드의 모든 자신의 카드 1턴간 사용 시까지 비용 1 감소|' }
      ]
    },
    {
      name: '흑운 심법',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/린/yellow.webp',
      tooltip: '[ 주도 ]\n1턴간 흑운태세 보존\n흑운태세 : 1턴간 자신의 공격 카드 피해량 +40%',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 주도 ]\n1턴간 흑운태세 보존\n흑운태세 : 1턴간 자신의 공격 카드 피해량 +|80|%' },
        { cost: 1, type: 'skill', tooltip: '1턴간 흑운태세 보존\n흑운태세 : |자신의 카드 드로우 2|' },
        { cost: 1, type: 'skill', tooltip: '[ 주도 ]\n1턴간 흑운태세 보존\n|"흑운 오의 : 멸" 1장 생성, 그 카드에 증발 부여|', plus_card: '흑운 오의 : 멸' },
        { cost: 1, type: 'upgrade', tooltip: '[ 주도 ]\n|턴 시작 시 흑운태세 획득|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 주도 ]\n|흑운태세 상태라면 자신의 공격 카드 피해량 50% 증가|' }
      ]
    },
    {
      name: '흑운 오의 : 흑무',
      cost: 1,
      type: 'attack',
      grade: 'purple',
      media: 'cards/린/purple.webp',
      tooltip: '피해 120%\n흑운태세 : 핸드의 스킬 카드 수만큼 타격 1회 추가'
    }
  ],
  meilin: [
    {
      name: '일격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/메이린/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '일격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/메이린/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '화룡호신',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/메이린/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '화룡의 보석',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/메이린/blue1.webp',
      tooltip: '[ 유일 / 개전 ]\n자신의 공격 카드 피해량 20% 증가\n공격 카드 사용 시 대상에게 열정 약점 1',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n자신의 공격 카드 피해량 |30|% 증가\n공격 카드 사용 시 대상에게 열정 약점 1' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n자신의 공격 카드 피해량 20% 증가\n공격 카드 사용 시 대상에게 |강인도 피해 1|' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n자신의 공격 카드 피해량 20% 증가\n공격 카드 사용 시 대상에게 |잔불 1|, 열정 약점 1' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 / 개전 ]\n자신의 |치명확률 30% 증가|\n|치명타 시 대상에게 강인도 피해 1, 잔불 1|' },
        { cost: 2, type: 'upgrade', tooltip: '[ 개전 ]\n|격파 시 대상에게 피해 300%|' }
      ]
    },
    {
      name: '승룡각',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/메이린/blue2.webp',
      tooltip: '피해 100%\n잔불 2\n연속 : 타격 1회 추가',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 100%\n잔불 2\n연속 : 타격 |2|회 추가' },
        { cost: 1, type: 'attack', tooltip: '피해 |150|%\n잔불 |3|\n연속 : 타격 1회 추가' },
        { cost: 2, type: 'attack', tooltip: '피해 |200|%\n|다음 사용하는 열정 카드 타격 1회 추가|' },
        { cost: 1, type: 'attack', tooltip: '피해 100%\n|다음 사용하는 자신의 기본 공격 카드 타격 2회 추가|' },
        { cost: 2, type: 'attack', tooltip: '피해 |150|%\n|1턴간 사용한 열정 카드 수만큼 타격 1회 추가|' }
      ]
    },
    {
      name: '공방일체',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/메이린/blue3.webp',
      tooltip: '자신의 기본 카드 드로우 2\n1턴간 사용 시까지 그 카드의 비용 1 감소',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '자신의 기본 카드 드로우 2\n1턴간 사용 시까지 그 카드의 비용 1 감소, |피해량, 실드 획득량 50% 증가|' },
        { cost: 0, type: 'skill', tooltip: '자신의 기본 카드 |2장 핸드로 이동|, 1턴간 사용 시까지 그 카드의 비용 1 감소' },
        { cost: 2, type: 'skill', tooltip: '자신의 기본 카드 드로우 2\n|핸드의 카드 2장까지 선택 소멸\n그 수만큼 1턴간 사기 2, 결의 2|' },
        { cost: 0, type: 'upgrade', tooltip: '|일격 2장 생성|\n|그 카드의 비용 1 감소|' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 유일 ]|\n|자신의 기본 카드 피해량 100% 증가|' }
      ]
    },
    {
      name: '향족의 정신',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/메이린/yellow.webp',
      tooltip: '[ 보존 ]\n1턴간 자신의 카드 사용 시 자신의 피해량 +20%',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n1턴간 |열정 카드| 사용 시 자신의 피해량 +20%' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n1턴간 자신의 카드 사용 시 자신의 피해량 +|30|%' },
        { cost: 0, type: 'skill', tooltip: '|[ 개전 ]|\n1턴간 자신의 카드 사용 시 자신의 피해량 +20%' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n1턴간 자신의 카드 사용 시 |무작위 적 잔불 1|' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n1턴간 자신의 카드 사용 시 자신의 |기본 카드|의 피해량 +|50|%' }
      ]
    },
    {
      name: '화룡경천',
      cost: 2,
      type: 'attack',
      grade: 'purple',
      media: 'cards/메이린/purple.webp',
      tooltip: '[ 약점 공격 ]\n피해 300%\n파괴 : 잔불 보존'
    }
  ],
  khaliphe: [
    {
      name: '채찍질',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/칼리페/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: '베어올리기',
      cost: 2,
      type: 'attack',
      grade: 'gray',
      media: 'cards/칼리페/attack.webp',
      tooltip: '방어 기반 피해 220%'
    },
    {
      name: '티르의 맹세',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/칼리페/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '벌쳐 사출',
      cost: 3,
      type: 'attack',
      grade: 'blue',
      media: 'cards/칼리페/blue1.webp',
      tooltip: '[ 천상 / 보존 ]\n모든 적 방어 기반 피해 120%\n실드 100%\n은빛 장막 1',
      awakenings: [
        { cost: 3, type: 'attack', tooltip: '[ 천상 / 보존 ]\n모든 적 방어 기반 피해 |280|%\n은빛 장막 1' },
        { cost: 3, type: 'attack', tooltip: '[ 천상 / 보존 ]\n실드 |280|%\n은빛 장막 1' },
        { cost: 3, type: 'attack', tooltip: '[ 천상 / 보존 ]\n모든 적 방어 기반 피해 |180|%\n실드 |150|%\n은빛 장막 1' },
        { cost: 3, type: 'attack', tooltip: '[ 천상 / 보존 ]\n모든 적 방어 기반 피해 |180|%\n은빛 장막 1\n|보존 : 실드 100%|' },
        { cost: 3, type: 'attack', tooltip: '[ 천상 / 보존 ]\n모든 적 방어 기반 피해 |180|%\n은빛 장막 1\n|핸드의 카드 수만큼 실드 40%|' }
      ]
    },
    {
      name: '대검 아퀼라',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      plus_card: '벌쳐 사출',
      media: 'cards/칼리페/blue2.webp',
      tooltip: '모든 적 방어 기반 피해 150%\n핸드에 "벌쳐 사출"이 있다면 비용 1 증가, 피해량 +100%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '모든 적 방어 기반 피해 |210|%\n핸드에 "벌쳐 사출"이 있다면 비용 1 증가, 피해량 +|120|%', plus_card: '벌쳐 사출' },
        { cost: 2, type: 'attack', tooltip: '모든 적 방어 기반 피해 |220|%\n|사용 시 피해량 +40%|' },
        { cost: 2, type: 'attack', tooltip: '모든 적 방어 기반 피해 |220|%\n핸드에 "벌쳐 사출"이 있다면 |은빛 장막 1|', plus_card: '벌쳐 사출' },
        { cost: 2, type: 'attack', tooltip: '|[ 보존 ]|\n모든 적 방어 기반 피해 |220|%\n|보존 : 다음 사용하는 "벌쳐 사출"의 피해량 60%|', plus_card: '벌쳐 사출' },
        { cost: 1, type: 'attack', tooltip: '|[ 회수 3 ]|\n모든 적 방어 기반 피해 150%\n핸드에 "벌쳐 사출"이 있다면 비용 1 증가, 피해량 +100%', plus_card: '벌쳐 사출' }
      ]
    },
    {
      name: '위압',
      cost: 2,
      type: 'skill',
      grade: 'blue',
      media: 'cards/칼리페/blue3.webp',
      tooltip: '실드 250%\n모든 적 강인도 피해 1',
      awakenings: [
        { cost: 2, type: 'skill', tooltip: '실드 |300|%\n모든 적 강인도 피해 1\n|적 수만큼 피해감소 1' },
        { cost: 2, type: 'skill', tooltip: '실드 |300|%\n모든 적 강인도 피해 1\n|격파 상태인 적 취약 2|\n|아닐 시 약화 2|' },
        { cost: 2, type: 'skill', tooltip: '실드 |300|%\n모든 적 강인도 피해 |2|' },
        { cost: 2, type: 'skill', tooltip: '실드 250%\n모든 적 강인도 피해 1\n|핸드의 카드 수만큼 실드 획득량 +40%|' },
        { cost: 2, type: 'skill', tooltip: '실드 |300|%\n모든 적 강인도 피해 1\n|모든 적 행동 카운트 5 증가|' }
      ]
    },
    {
      name: '재집결',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/칼리페/yellow.webp',
      tooltip: '실드 120%\n비용이 가장 높은 카드 드로우 1',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n비용이 가장 높은 카드 드로우 1\n|은빛 장막 1|' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n|천상 카드 드로우 1|\n|은빛 장막 1|' },
        { cost: 2, type: 'skill', tooltip: '|[ 천상 ]|\n실드 |150|%\n비용이 가장 높은 카드 드로우 1\n|은빛 장막 1|' },
        { cost: 1, type: 'skill', tooltip: '실드 120%\n|드로우 1|\n|그 카드의 비용만큼 실드 60%|\n|은빛 장막 1|' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n|뽑을 카드에서 비용 2 이상인 카드 1장 선택 드로우|' }
      ]
    },
    {
      name: '절대 수호',
      cost: 'X',
      type: 'skill',
      grade: 'purple',
      media: 'cards/칼리페/purple.webp',
      tooltip: '[ 종극 ]\nX만큼 실드 100%\n1턴간 핸드의 모든 카드 보존'
    }
  ],
  magna: [
    {
      name: '빙결의 주먹',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/마그나/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: '서리 방패',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/마그나/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '서리 방패',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/마그나/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '얼음 파편',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/마그나/blue1.webp',
      tooltip: '[ 주도 ]\n결정화 2\n턴 시작 시 반격 1',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 주도 ]\n결정화 |4|\n턴 시작 시 반격 1' },
        { cost: 1, type: 'upgrade', tooltip: '[ 주도 ]\n결정화 2\n턴 시작 시 반격 |2|' },
        { cost: 0, type: 'upgrade', tooltip: '|[ 개전 ]|\n결정화 2\n턴 시작 시 반격 1' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 유일 / 주도 ]|\n결정화 2\n|턴 종료 시 모든 적 방어 기반 피해 200%|' },
        { cost: 2, type: 'skill', tooltip: '[ 주도 ]\n반격 |4|\n|다음 반격 피해량 30% 증가|' }
      ]
    },
    {
      name: '빙하의 철권',
      cost: 2,
      type: 'attack',
      grade: 'blue',
      media: 'cards/마그나/blue2.webp',
      tooltip: '방어 기반 피해 300%\n피해 기반 실드 50%',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '방어 기반 피해 |450|%\n피해 기반 실드 50%' },
        { cost: 2, type: 'attack', tooltip: '방어 기반 피해 300%\n|취약 3|' },
        { cost: 2, type: 'attack', tooltip: '방어 기반 피해 |450|%\n|실드 보유 시 피해량 50% 증가|' },
        { cost: 2, type: 'attack', tooltip: '|모든 적| 방어 기반 피해 300%\n피해 기반 실드 50%' },
        { cost: 2, type: 'attack', tooltip: '|[ 소멸 2 ]|\n방어 기반 피해 |400|%\n피해 기반 실드 50%\n|1턴간 실드 보존 1|' }
      ]
    },
    {
      name: '빙벽',
      cost: 2,
      type: 'skill',
      grade: 'blue',
      media: 'cards/마그나/blue3.webp',
      tooltip: '실드 180%\n반격 2\n1턴간 반격의 대상이 모든 적으로 적용',
      awakenings: [
        { cost: 2, type: 'skill', tooltip: '실드 |270|%\n반격 |3|\n1턴간 반격의 대상이 모든 적으로 적용' },
        { cost: 2, type: 'skill', tooltip: '실드 |270|%\n|자신의 보유 반격 수만큼 실드 획득량 +30%|\n반격 2' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 주도 ]|\n|반격의 대상이 모든 적으로 적용|' },
        { cost: 2, type: 'attack', tooltip: '실드 180%\n|보유한 실드만큼 모든 적 피해|' },
        { cost: 2, type: 'skill', tooltip: '실드 180%\n반격 2\n|2|턴간 반격의 대상이 모든 적으로 적용' }
      ]
    },
    {
      name: '냉기 충전',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/마그나/yellow.webp',
      tooltip: '실드 100%\n모든 적 취약 2',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n모든 적 취약 2\n|적 수만큼 실드 획득량 +50%|' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n모든 적 취약 |3|' },
        { cost: 1, type: 'upgrade', tooltip: '|반격한 대상에게 취약 2|' },
        { cost: 1, type: 'attack', tooltip: '|무작위 적들에게 방어 기반 피해 100% × 3|\n|타격한 대상에게 취약 1|' },
        { cost: 1, type: 'skill', tooltip: '모든 적 취약 2\n|반격 2|' }
      ]
    },
    {
      name: '혹한의 폭풍',
      cost: 1,
      type: 'upgrade',
      grade: 'purple',
      media: 'cards/마그나/purple.webp',
      tooltip: '[ 주도 ]\n능력으로 실드 획득 시 반격 1'
    }
  ],
  kayron: [
    {
      name: '멸',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/카일론/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '멸',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/카일론/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '구',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/카일론/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '허무의 잔상',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      plus_card: '허무',
      media: 'cards/카일론/blue1.webp',
      tooltip: '피해 320%\n"허무" 2장 생성',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 |480|%\n"허무" |3|장 생성', plus_card: '허무' },
        { cost: 1, type: 'attack', tooltip: '피해 \\240\\%\n"허무" 2장 생성\n|소멸된 "허무" 수만큼 피해량 +20%|', plus_card: '허무' },
        { cost: 1, type: 'attack', tooltip: '피해 320%\n"허무" 2장 생성\n|그 카드에 증발 부여|' },
        { cost: 'X', type: 'attack', tooltip: '피해 \\150\\%\n|X만큼 피해량 +150%|\n|"허무" X+1장 생성|', plus_card: '허무' },
        { cost: 0, type: 'attack', tooltip: '피해 \\150\\%\n"허무" 2장 생성\n|이번 전투 동안 생성한 "허무" 수만큼 피해량 +30%|', plus_card: '허무' }
      ]
    },
    {
      name: '허무',
      cost: 1,
      type: 'debuff',
      grade: '',
      grade_color: 'gray',
      media: 'cards/카일론/blue1_1.webp',
      tooltip: '[ 소멸 ]'
    },
    {
      name: '소멸의 낙인',
      cost: 3,
      type: 'attack',
      grade: 'blue',
      media: 'cards/카일론/blue2.webp',
      tooltip: '모든 적 피해 400%\n카드 소멸 시 이 카드 1턴간 사용 시까지 비용 1 감소',
      awakenings: [
        { cost: 3, type: 'attack', tooltip: '모든 적 피해 |600|%\n카드 소멸 시 이 카드 1턴간 사용 시까지 비용 1 감소' },
        { cost: 3, type: 'attack', tooltip: '|무작위 적| 피해 400% × |2|\n카드 소멸 시 이 카드 1턴간 사용 시까지 비용 1 감소' },
        { cost: 7, type: 'attack', tooltip: '모든 적 피해 |600|%\n|소멸된 "허무" 수만큼 비용 감소|', plus_card: '허무' },
        { cost: 1, type: 'attack', tooltip: '모든 적 피해 \\300\\%\n|이번 턴 소멸한 카드 수만큼 피해량 +40%|' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 400%\n|이번 턴에 소멸한 카드가 있다면 모든 적 고통 3|' }
      ]
    },
    {
      name: '블랙홀',
      cost: 2,
      type: 'attack',
      grade: 'blue',
      plus_card: '허무',
      media: 'cards/카일론/blue3.webp',
      tooltip: '피해 240%\n소멸된 "허무" 수만큼 피해량 +40%',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '피해 |360|%\n|핸드의 "허무" 2장 발동|', plus_card: '허무' },
        { cost: 2, type: 'attack', tooltip: '피해 |360|%\n소멸된 "허무" 수만큼 피해량 +|60|%', plus_card: '허무' },
        { cost: 2, type: 'attack', tooltip: '|무작위 적| 피해 \\60\\%\n소멸된 "허무" 수만큼 |타격 1회 추가 (최대 5회)|', plus_card: '허무' },
        { cost: 2, type: 'attack', tooltip: '피해 |300|%\n소멸된 "허무" |5장당 타격 1회 추가 (최대 2회)|', plus_card: '허무' },
        { cost: 1, type: 'upgrade', tooltip: '|"허무" 소멸 시 무작위 적 고정 피해 100%|', plus_card: '허무' }
      ]
    },
    {
      name: '희망의 서약',
      cost: 1,
      type: 'upgrade',
      grade: 'yellow',
      plus_card: '허무',
      plus_type: 'attack',
      plus_tooltip: '[ 소멸 ]\n피해 80%\n치유 80%',
      media: 'cards/카일론/yellow.webp',
      tooltip: '[ 유일 ]\n"허무" 생성 시 피해, 치유 80% 효과를 가진 비용 1의 공격 카드로 변경',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n"허무" 생성 시 피해, 치유 |150|% 효과를 가진 비용 1의 공격 카드로 변경', plus_card: '허무', plus_type: 'attack', plus_tooltip: '[ 소멸 ]\n피해 150%\n치유 150%' },
        { cost: 0, type: 'upgrade', tooltip: '|[ 유일 / 개전 ]|\n"허무" 생성 시 피해, 치유 80% 효과를 가진 비용 1의 공격 카드로 변경', plus_card: '허무', plus_type: 'attack', plus_tooltip: '[ 소멸 ]\n피해 80%\n치유 80%' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n"허무" 생성 시 피해 |200|% 효과를 가진 비용 1의 공격 카드로 변경', plus_card: '허무', plus_type: 'attack', plus_tooltip: '[ 소멸 ]\n피해 200%' },
        { cost: 0, type: 'skill', tooltip: '|[ 소멸 / 보존 ]|\n|핸드의 "허무", 상태이상, 저주 카드 모두 소멸|\n|그 수만큼 드로우|', plus_card: '허무' },
        { cost: 0, type: 'upgrade', tooltip: '|"허무" 카드 2장 소멸 시 모든 적 고통 2|', plus_card: '허무' }
      ]
    },
    {
      name: '무환의 울림',
      cost: 2,
      type: 'attack',
      grade: 'purple',
      plus_card: '허무',
      media: 'cards/카일론/purple.webp',
      tooltip: '피해 240%\n"허무" 3장 생성\n그 수만큼 피해량 +40%'
    }
  ],
  owen: [
    {
      name: '내려베기',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/오웬/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '내려베기',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/오웬/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '무기 막기',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/오웬/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '바람 충전',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/오웬/blue1.webp',
      tooltip: '다음 사용하는 자신의 공격 카드 타격 1회 추가',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '|[ 회수 ]|\n다음 사용하는 자신의 공격 카드 타격 1회 추가' },
        { cost: 1, type: 'skill', tooltip: '다음 사용하는 |공격 카드| 타격 1회 추가\n|피해량 25% 감소|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n자신의 공격 카드 |사용 시 30% 확률로 타격 1회 추가|' },
        { cost: 1, type: 'skill', tooltip: '|[ 유일 / 소멸 ]|\n다음 사용하는 |스킬 카드 1번 더 발동|' },
        { cost: 1, type: 'skill', tooltip: '다음 사용하는 자신의 공격 카드 타격 |3|회 추가\n|피해량 50% 감소|' }
      ]
    },
    {
      name: '바람 베기',
      cost: 2,
      type: 'attack',
      grade: 'blue',
      media: 'cards/오웬/blue2.webp',
      tooltip: '모든 적 피해 280%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '모든 적 피해 280%' },
        { cost: 2, type: 'attack', tooltip: '피해 \\150\\% × |3|' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 280%\n|처치 : 이 카드 1번 더 발동|' },
        { cost: 2, type: 'upgrade', tooltip: '|턴 시작 시 행동 포인트 1 감소\n턴 종료 시 모든 적 피해 280%|' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 280%\n|강인도 피해 100% 증가|' }
      ]
    },
    {
      name: '방어구 부수기',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/오웬/blue3.webp',
      tooltip: '피해 140%\n취약 2',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 |210|%\n|1턴간 불굴 4 감소|' },
        { cost: 0, type: 'attack', tooltip: '피해 140%\n취약 2' },
        { cost: 1, type: 'attack', tooltip: '피해 |210|%\n취약 2\n|대상이 취약 상태라면 피해량 30% 증가|' },
        { cost: 1, type: 'attack', tooltip: '피해 |210|%\n취약 2\n|대상이 실드를 보유하면 피해량 30% 증가|' },
        { cost: 1, type: 'attack', tooltip: '피해 140%\n취약 3\n|"바람 충전" 사용 시 이 카드 버린 카드에서 핸드로 이동|', plus_card: '바람 충전' }
      ]
    },
    {
      name: '바람타기',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      plus_card: '바람 충전',
      media: 'cards/오웬/yellow.webp',
      tooltip: '실드 150%\n버린 카드에서 "바람 충전"을 핸드로 이동',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '실드 |220|%\n버린 카드에서 |자신의 카드 2장을| 핸드로 이동' },
        { cost: 1, type: 'upgrade', tooltip: '|"바람 충전" 사용 시 실드 120%, 모든 적 피해 120%|', plus_card: '바람 충전' },
        { cost: 1, type: 'skill', tooltip: '실드 150%\n|다음 사용하는 자신의 공격 카드 타격 1회 추가|' },
        { cost: 1, type: 'skill', tooltip: '실드 |220|%\n|피해 감소 3|' },
        { cost: 1, type: 'skill', tooltip: '실드 |220|%\n|이번 턴에 "바람 충전"을 사용했다면 이 카드 1번 더 발동|', plus_card: '바람 충전' }
      ]
    },
    {
      name: '질풍의 일격',
      cost: 2,
      type: 'attack',
      grade: 'purple',
      media: 'cards/오웬/purple.webp',
      tooltip: '피해 300%\n실드 130%'
    }
  ],
  selena: [
    {
      name: '교전 사격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/셀레나/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '교전 사격',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/셀레나/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '긴급 차폐',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/셀레나/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '고배율 조준경',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/셀레나/blue1.webp',
      tooltip: '표식 2',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '표식 2\n|대상이 공격 행동 예고 상태라면 표식 2 추가|' },
        { cost: 1, type: 'upgrade', tooltip: '|자신의 공격 카드 사용 시 대상에게| 표식 \\1\\' },
        { cost: 1, type: 'skill', tooltip: '표식 2\n|1턴간 표식 피해량 +50%|' },
        { cost: 0, type: 'skill', tooltip: '|1턴간 다른 전투원의 공격 카드 사용 시 대상에게 협공 100%|' },
        { cost: 1, type: 'upgrade', tooltip: '|턴 시작 시 모든 적| 표식 \\1\\' }
      ]
    },
    {
      name: '목표 포착',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/셀레나/blue2.webp',
      tooltip: '피해 150%\n감응 : 무작위 적 표식 1',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 \\100\\%\n감응 : 무작위 적 |피해 300%|' },
        { cost: 1, type: 'attack', tooltip: '피해 150%\n표식 |2|\n|대상이 표식 상태라면 표식 2|' },
        { cost: 1, type: 'skill', tooltip: '|실드 150%|\n|모든 적| 표식 |2|' },
        { cost: 1, type: 'skill', tooltip: '|실드 150%|\n감응 : |드로우 1|' },
        { cost: 1, type: 'upgrade', tooltip: '|격파 시 대상에게 협공 200%|' }
      ]
    },
    {
      name: '드론 폭격',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/셀레나/blue3.webp',
      tooltip: '모든 적 피해 120%, 열정 약점 1',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '모든 적 피해 120%, 열정 약점 |2|' },
        { cost: 1, type: 'attack', tooltip: '모든 적 피해 120%\n|연속 : 모든 적 표식 2|' },
        { cost: 0, type: 'attack', tooltip: '모든 적 피해 120%\n|이번 턴 사용한 열정 공격 카드 수만큼 피해량 +40%|' },
        { cost: 1, type: 'skill', tooltip: '|1턴간 약점 공격 시 대상에게 협공 100%|' },
        { cost: 1, type: 'upgrade', tooltip: '|열정 공격 카드 사용 시 대상에게 협공 50%|' }
      ]
    },
    {
      name: '전술 기동',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/셀레나/yellow.webp',
      tooltip: '실드 150%\n강인도 피해 2',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '실드 |225|%\n강인도 피해 |3|' },
        { cost: 1, type: 'attack', tooltip: '|피해 150%|\n|이 카드의 강인도 피해 150% 증가|' },
        { cost: 1, type: 'skill', tooltip: '실드 |225|%\n강인도 피해 2\n|격파 상태인 적 표식 2|' },
        { cost: 0, type: 'skill', tooltip: '|[ 보존 ]|\n|격파 상태라면 강인도 재충전|' },
        { cost: 1, type: 'skill', tooltip: '|모든 적| 강인도 피해 \\1\\, |표식 1|' }
      ]
    },
    {
      name: '저격수의 영역',
      cost: 0,
      type: 'upgrade',
      grade: 'purple',
      media: 'cards/셀레나/purple.webp',
      tooltip: '[ 유일 ]\n표식 피해량 +80%'
    }
  ],
  beril: [
    {
      name: '런처',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/베릴/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '차지 런처',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/베릴/attack2.webp',
      tooltip: '피해 220%'
    },
    {
      name: '보호막',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/베릴/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '빈틈 발견',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/베릴/blue1.webp',
      tooltip: '[ 보존 ]\n피해 140%\n보존 : 1턴간 타격 1회 추가',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 보존 ]\n피해 |210|%\n보존 : |피해량 +180%|' },
        { cost: 1, type: 'attack', tooltip: '[ 보존 ]\n피해 |260|%\n보존 : |비용 0으로 변경|' },
        { cost: 1, type: 'attack', tooltip: '[ 보존 ]\n피해 \\110\\%\n보존 : 1턴간 타격 |2|회 추가' },
        { cost: 1, type: 'attack', tooltip: '[ 보존 ]\n피해 |180|%\n보존 : |피해량 +80%|' },
        { cost: 1, type: 'upgrade', tooltip: '|자신의 카드 보존 시 무작위 적들에게 추가 공격 150%|' }
      ]
    },
    {
      name: '충전탄',
      cost: 2,
      type: 'attack',
      grade: 'blue',
      media: 'cards/베릴/blue2.webp',
      tooltip: '[ 보존 ]\n피해 240%\n보존 : 피해량 +120%',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '[ 보존 ]\n피해 |360|%\n보존 : 피해량 +|180|%' },
        { cost: 1, type: 'attack', tooltip: '[ 보존 ]\n피해 240%\n|연속 : 피해량 +120%|' },
        { cost: 3, type: 'attack', tooltip: '[ 보존 ]\n피해 |500|%\n보존 : |사용 시까지 비용 1 감소|' },
        { cost: 2, type: 'attack', tooltip: '[ 보존 ]\n피해 |360|%\n보존 : 피해량 +|240|% |(최대 1회)|' },
        { cost: 2, type: 'attack', tooltip: '[ 보존 ]\n피해 \\140\\% × |2|\n보존 : 피해량 +\\80\\%' }
      ]
    },
    {
      name: '숨겨온 초코바',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/베릴/blue3.webp',
      tooltip: '[ 소멸 ]\n드로우 3',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '[ 소멸 ]\n드로우 3\n|사기 1|' },
        { cost: 0, type: 'skill', tooltip: '[ 소멸 ]\n드로우 3\n|핸드의 무작위 자신의 카드 1장 비용 1 감소|' },
        { cost: 0, type: 'skill', tooltip: '[ 소멸 ]\n드로우 3\n|다음 턴 시작 시 드로우 2|' },
        { cost: 0, type: 'skill', tooltip: '드로우 \\1\\\n|핸드의 모든 자신의 카드 보존 효과 발동|' },
        { cost: 0, type: 'skill', tooltip: '|[ 유일 / 소멸 2 ]|\n드로우 3' }
      ]
    },
    {
      name: '무제한 화력',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/베릴/yellow.webp',
      tooltip: '실드 100%\n다음 사용하는 자신의 공격 카드 피해량 +80%',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n다음 사용하는 자신의 공격 카드 피해량 +|120|%' },
        { cost: 1, type: 'skill', tooltip: '|1턴간| 자신의 공격 카드 피해량 +80%' },
        { cost: 1, type: 'skill', tooltip: '다음 사용하는 자신의 공격 카드 피해량 +|160|%' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n다음 사용하는 |공격 카드| 피해량 +80%' },
        { cost: 1, type: 'upgrade', tooltip: '|자신의 공격 카드 피해량 30% 증가|' }
      ]
    },
    {
      name: '중화기 전문가',
      cost: 1,
      type: 'skill',
      grade: 'purple',
      plus_card: [ '빈틈 발견', '충전탄' ],
      media: 'cards/베릴/purple.webp',
      tooltip: '"빈틈 발견" 혹은 "충전탄" 1장 생성, 그 카드에 소멸 부여, 사용 시까지 비용 1 감소'
    }
  ],
  amir: [
    {
      name: '레이피어',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/아미르/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: '레이피어',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/아미르/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: '강철 보호막',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/아미르/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '호버링 메탈',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/아미르/blue1.webp',
      tooltip: '피해 감소 3\n금속화 2',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '피해 감소 3\n금속화 |4|' },
        { cost: 1, type: 'skill', tooltip: '피해 감소 \\2\\\n금속화 2\n|반격 2|' },
        { cost: 2, type: 'skill', tooltip: '|[ 천상 ]|\n피해 감소 3\n금속화 |3|' },
        { cost: 1, type: 'skill', tooltip: '|[ 소멸 ]|\n피해 감소 3\n금속화 |5|' },
        { cost: 1, type: 'upgrade', tooltip: '금속화 2\n|턴 시작 시 금속화 1|' }
      ]
    },
    {
      name: '메탈 피어스',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/아미르/blue2.webp',
      tooltip: '방어 기반 피해 90% × 2\n금속화 상태라면 금속화 1 감소, 취약 2',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |110|% × 2\n금속화 상태라면 금속화 1 감소, |타격 1회 추가|, 취약 2' },
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |200|%\n|금속화 최대 2 감소|\n|그 수만큼 피해량 +150%|' },
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 90% × 2\n취약 \\1\\\n|금속화 2|' },
        { cost: 2, type: 'attack', tooltip: '방어 기반 피해 |110|% × 2\n취약 \\1\\\n|회복 시 1턴간 사용 시까지 비용 1 감소|' },
        { cost: 1, type: 'attack', tooltip: '방어 기반 피해 |110|% × 2\n금속화 상태라면 금속화 1 감소, 취약 2, |약화 2|' }
      ]
    },
    {
      name: '금속 추출',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/아미르/blue3.webp',
      tooltip: '금속화 2\n1턴간 결의 2',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '금속화 2\n|1턴간 스킬 카드의 실드 획득량 30% 증가|' },
        { cost: 1, type: 'skill', tooltip: '금속화 |3|\n1턴간 결의 |3|' },
        { cost: 1, type: 'skill', tooltip: '금속화 2\n|1턴간 스킬 카드 사용 시 금속화 1 (최대 2회)|' },
        { cost: 2, type: 'skill', tooltip: '|[ 천상 ]|\n금속화 2\n1턴간 결의 |3|' },
        { cost: 1, type: 'skill', tooltip: '금속화 |3|\n|1턴간 금속화의 피해량 +30%|' }
      ]
    },
    {
      name: '풀 메탈 허리케인',
      cost: 2,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/아미르/yellow.webp',
      tooltip: '모든 적 방어 기반 피해 200%\n1턴간 금속화의 대상이 모든 적으로 적용, 피해량 +20%',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '모든 적 방어 기반 피해 200%\n1턴간 금속화의 대상이 모든 적으로 적용, 피해량 +|60|%' },
        { cost: 2, type: 'attack', tooltip: '모든 적 방어 기반 피해 200%\n|1턴간 금속화 효과의 타격 1회 추가|, 피해량 +|50|%' },
        { cost: 2, type: 'upgrade', tooltip: '모든 적 방어 기반 피해 200%\n|턴 종료 시 금속화 최대 2 감소|\n|그 수만큼 모든 적 방어 기반 피해 120%|' },
        { cost: 2, type: 'attack', tooltip: '모든 적 방어 기반 피해 \\80\\% × |4|\n1턴간 금속화의 대상이 모든 적으로 적용, 피해량 +20%' },
        { cost: 2, type: 'attack', tooltip: '모든 적 방어 기반 피해 \\100\\% × |3|\n|금속화 최대 2 감소|\n|그 수만큼 타격 1회 추가|' }
      ]
    },
    {
      name: '아이언 스킨',
      cost: 1,
      type: 'skill',
      grade: 'purple',
      media: 'cards/아미르/purple.webp',
      tooltip: '[ 소멸 / 종극 ]\n1턴간 받는 피해량 20% 감소\n금속화 최대 4 감소\n그 수만큼 받는 피해량 20% 추가 감소'
    }
  ],
  maribel: [
    {
      name: '셸터 킥',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/마리벨/attack.webp',
      tooltip: '방어 기반 피해 100%'
    },
    {
      name: '셸터 디펜스',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/마리벨/skill2.webp',
      tooltip: '실드 100%'
    },
    {
      name: '셸터 홀드',
      cost: 2,
      type: 'skill',
      grade: 'gray',
      media: 'cards/마리벨/skill.webp',
      tooltip: '실드 220%'
    },
    {
      name: '의지의 돌진',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/마리벨/blue1.webp',
      tooltip: '[ 분쇄 ]\n방어 기반 피해 140%\n피해 기반 실드 20%\n반격 1',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 분쇄 ]\n방어 기반 피해 |210|%\n피해 기반 실드 20%\n반격 1\n|피해를 줬을 시 반격 1 추가|' },
        { cost: 1, type: 'attack', tooltip: '[ 분쇄 ]\n방어 기반 피해 140%\n피해 기반 실드 20%\n반격 |2|' },
        { cost: 2, type: 'attack', tooltip: '[ 분쇄 ]\n|모든 적| 방어 기반 피해 |210|%\n피해 기반 실드 20%\n|피해를 준 대상만큼 반격 획득|' },
        { cost: 1, type: 'attack', tooltip: '[ 분쇄 ]\n방어 기반 피해 |210|%\n피해 기반 실드 20%\n|보유한 실드의 30%만큼 피해량 증가|' },
        { cost: 2, type: 'upgrade', tooltip: '|턴 종료 시 반격 1|\n|무작위 적들에게 방어 기반 피해 210%|' }
      ]
    },
    {
      name: '마리벨 셸터 MK. II',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/마리벨/blue2.webp',
      tooltip: '[ 분쇄 ]\n방어 기반 피해 120%\n피해 기반 실드 100%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 분쇄 ]\n|모든 적| 방어 기반 피해 120%\n피해 기반 실드 100%' },
        { cost: 1, type: 'attack', tooltip: '[ 분쇄 ]\n방어 기반 피해 |160|%\n피해 기반 실드 100%' },
        { cost: 2, type: 'attack', tooltip: '[ 분쇄 ]\n방어 기반 피해 |280|%\n피해 기반 실드 100%' },
        { cost: 2, type: 'attack', tooltip: '[ 분쇄 ]\n방어 기반 피해 |160|%\n|자신의 반격 수만큼 피해량 +50%|' },
        { cost: 0, type: 'upgrade', tooltip: '|공격 카드 사용 시 준 피해량의 30%만큼 고정 실드 획득|' }
      ]
    },
    {
      name: '울브즈 돔',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/마리벨/blue3.webp',
      tooltip: '반격 2\n턴 시작 시 반격 1\n결정화 2',
      awakenings: [
        { cost: 0, type: 'upgrade', tooltip: '|[ 개전 ]|\n반격 2\n턴 시작 시 반격 1\n결정화 2' },
        { cost: 1, type: 'upgrade', tooltip: '반격 2\n턴 시작 시 반격 1, |고정 실드 80%|' },
        { cost: 1, type: 'upgrade', tooltip: '반격 2\n턴 시작 시 반격 |2|\n결정화 2' },
        { cost: 0, type: 'skill', tooltip: '반격 2, |1턴간 결의 2|' },
        { cost: 2, type: 'upgrade', tooltip: '|[ 주도 ]|\n턴  시작 시 반격 |2|\n|자신의 반격 피해량 +20%|' }
      ]
    },
    {
      name: '아~ 그렇구나',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/마리벨/yellow.webp',
      tooltip: '실드 100%\n반격 1\n모든 적 약화 1',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n반격 1\n모든 적 약화 |2|' },
        { cost: 1, type: 'skill', tooltip: '실드 |150|%\n반격 |2|' },
        { cost: 1, type: 'skill', tooltip: '반격 |2|\n모든 적 약화 |2|' },
        { cost: 1, type: 'upgrade', tooltip: '|턴 종료 시 체력이 가장 낮은 적에게 보유한 실드의 50%만큼 고정 피해|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|턴 시작 시 자신의 반격 수만큼 고정 실드 25%|' }
      ]
    },
    {
      name: '셸터 스트라이크',
      cost: 1,
      type: 'attack',
      grade: 'purple',
      media: 'cards/마리벨/purple.webp',
      tooltip: '[ 분쇄 ]\n보유한 실드만큼 고정 피해'
    }
  ],
  rukas: [
    {
      name: '머신건',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/루카스/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '머신건',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/루카스/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '방호 소이탄',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/루카스/skill.webp',
      tooltip: '실드 100%'
    },
    {
      name: '대용량 탄창',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      plus_card: [ '철갑탄', '폭발탄', '확산탄', '냉각탄', '화염탄' ],
      media: 'cards/루카스/blue1.webp',
      tooltip: '[ 주도 ]\n턴 시작 시 "런처 탄환" 1장 생성',
      awakenings: [
        { cost: 0, type: 'upgrade', tooltip: '|[ 개전 ]|\n턴 시작 시 "런처 탄환" 1장 생성', plus_card: [ '철갑탄', '폭발탄', '확산탄', '냉각탄', '화염탄' ] },
        { cost: 1, type: 'upgrade', tooltip: '[ 주도 ]\n턴 시작 시 "런처 탄환" |2|장 생성', plus_card: [ '철갑탄', '폭발탄', '확산탄', '냉각탄', '화염탄' ] },
        { cost: 1, type: 'upgrade', tooltip: '[ 주도 ]\n턴 시작 시 "런처 탄환" 1장 생성, |50% 확률로 1턴간 사용 시까지 그 카드의 비용 1 감소|', plus_card: [ '철갑탄', '폭발탄', '확산탄', '냉각탄', '화염탄' ] },
        { cost: 1, type: 'upgrade', tooltip: '[ 주도 ]\n턴 시작 시 "런처 탄환" 1장 생성, |50% 확률로 드로우 1|', plus_card: [ '철갑탄', '폭발탄', '확산탄', '냉각탄', '화염탄' ] },
        { cost: 1, type: 'skill', tooltip: '|[ 소멸 ]|\n"런처 탄환" |5|장 생성', plus_card: [ '철갑탄', '폭발탄', '확산탄', '냉각탄', '화염탄' ] }
      ]
    },
    {
      name: '철갑탄',
      cost: 1,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/루카스/blue1_1.webp',
      tooltip: '[ 소멸 / 증발 / 탄환 ]\n피해 120%\n다른 적 피해 60%\n대상이 실드를 보유하면 피해량 +30%'
    },
    {
      name: '폭발탄',
      cost: 1,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/루카스/blue1_2.webp',
      tooltip: '[ 소멸 / 증발 / 탄환 ]\n피해 120%\n다른 적 피해 60%\n모든 적 약화 1'
    },
    {
      name: '확산탄',
      cost: 1,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/루카스/blue1_3.webp',
      tooltip: '[ 소멸 / 증발 / 탄환 ]\n피해 120%\n다른 적 피해 60%\n모든 적 손상 1'
    },
    {
      name: '냉각탄',
      cost: 1,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/루카스/blue1_4.webp',
      tooltip: '[ 소멸 / 증발 / 탄환 ]\n피해 120%\n다른 적 피해 60%\n모든 적 행동 카운트 1 증가'
    },
    {
      name: '화염탄',
      cost: 1,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/루카스/blue1_5.webp',
      tooltip: '[ 소멸 / 증발 / 탄환 ]\n피해 120%\n다른 적 피해 60%\n모든 적 고통 1'
    },
    {
      name: 'S.S.S',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/루카스/blue2.webp',
      tooltip: '피해 100%\n1턴간 탄환 카드의 피해량 +40%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 |200|%\n1턴간 탄환 카드의 피해량 +40%' },
        { cost: 1, type: 'skill', tooltip: '|2|턴간 탄환 카드의 피해량 +40%' },
        { cost: 1, type: 'attack', tooltip: '피해 |150|%\n|핸드의 탄환 카드 수만큼 피해량 +60%|' },
        { cost: 1, type: 'attack', tooltip: '피해 |150|%\n|다음 사용하는| 탄환 카드의 피해량 +|120|%' },
        { cost: 1, type: 'attack', tooltip: '피해 100%\n|1턴간 탄환 카드 사용 시 무작위 적 고정 피해 50%|' }
      ]
    },
    {
      name: '플라멘베르퍼',
      cost: 2,
      type: 'attack',
      grade: 'blue',
      media: 'cards/루카스/blue3.webp',
      tooltip: '모든 적 피해 180%\n드로우 1\n버리기 1',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 180%\n드로우 1\n버리기 |2|\n|버린 수만큼 "런처 탄환" 생성|', plus_card: [ '철갑탄', '폭발탄', '확산탄', '냉각탄', '화염탄' ] },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 |315|%\n드로우 1\n버리기 1' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 |270|%\n|치명타 시 모든 적 피해 150%|' },
        { cost: 2, type: 'attack', tooltip: '|핸드의 탄환 카드 2장까지 소멸|\n|모든 적 피해 270%|\n|소멸한 카드 수만큼 피해량 50% 증가|' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 |270|%\n|타격한 대상 수만큼 "런처 탄환" 생성|', plus_card: [ '철갑탄', '폭발탄', '확산탄', '냉각탄', '화염탄' ] }
      ]
    },
    {
      name: '섬광탄',
      cost: 1,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/루카스/yellow.webp',
      tooltip: '모든 적 피해 120%\n약화 2\n대상이 실드를 보유하면 피해량 +50%',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '모든 적 피해 |180|%\n약화 2\n대상이 실드를 보유하면 피해량 +|75|%' },
        { cost: 1, type: 'skill', tooltip: '|1턴간 실드를 보유한 대상 타격 시 피해량 +50%|' },
        { cost: 1, type: 'attack', tooltip: '|[ 보존 ]|\n모든 적 피해 |180|%\n|열정 약점 2|' },
        { cost: 1, type: 'attack', tooltip: '모든 적 피해 |180|%\n|표식 2|\n대상이 실드를 보유하면 피해량 +50%' },
        { cost: 1, type: 'upgrade', tooltip: '|실드를 보유한 대상 타격 시 피해량 30% 증가|' }
      ]
    },
    {
      name: 'R.P.G-7',
      cost: 1,
      type: 'upgrade',
      grade: 'purple',
      media: 'cards/루카스/purple.webp',
      tooltip: '탄환 카드 소멸 시 모든 적 고정 피해 40%'
    }
  ],
  nia: [
    {
      name: '스트로크',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/니아/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '앰프 테라피',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/니아/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '앰프 테라피',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/니아/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: 'G코드',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/니아/blue1.webp',
      tooltip: '데시벨 2\n뽑을 카드 맨 위의 카드 1장 발동',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '데시벨 2\n뽑을 카드 맨 위의 카드 |3장 확인|\n|하나를 선택하여 발동|' },
        { cost: 1, type: 'skill', tooltip: '데시벨 2\n뽑을 카드 맨 위의 카드 1장 발동\n|그 카드 비용만큼 데시벨|' },
        { cost: 1, type: 'skill', tooltip: '데시벨 2\n|뽑을 카드 맨 위의 카드를 소유한 전투원 무작위 적 추가 공격 120%|\n|그 카드 발동|' },
        { cost: 1, type: 'skill', tooltip: '데시벨 |3|\n뽑을 카드 맨 위의 카드 |3장 버리기|' },
        { cost: 2, type: 'skill', tooltip: '뽑을 카드 맨 위의 카드 1장 발동\n|데시벨 상태라면 데시벨 1 감소, 1장 추가 발동|' }
      ]
    },
    {
      name: '악센트 뮤트',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/니아/blue2.webp',
      tooltip: '비용이 가장 높은 카드 1장 버리기\n그 카드를 소유한 전투원 무작위 적 추가 공격 150%',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '|무작위 카드| 1장 버리기\n그 카드를 소유한 전투원 무작위 적 추가 공격 |250|%' },
        { cost: 1, type: 'skill', tooltip: '|버리기 1|\n그 카드를 소유한 전투원 무작위 적 추가 공격 |200|%' },
        { cost: 1, type: 'skill', tooltip: '|치유 150%|\n|비용이 가장 낮은 카드 1장 발동|' },
        { cost: 2, type: 'upgrade', tooltip: '|턴 시작 시 버리기 1|\n그 카드를 소유한 전투원 무작위 적 추가 공격 150%' },
        { cost: 1, type: 'skill', tooltip: '|비용이 가장 높은 카드 모두 버리기|\n그 카드를 소유한 전투원 무작위 적 추가 공격 \\100\\%' }
      ]
    },
    {
      name: '소울리프',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/니아/blue3.webp',
      tooltip: '[ 보존 ]\n치유 150%\n1턴간 카드를 버릴 시 데시벨 1, 탄력 2',
      awakenings: [
        { cost: 2, type: 'skill', tooltip: '치유 |200|%\n데시벨 |2|\n탄력 |4|\n|버려졌을 때에도 발동|' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n치유 150%\n1턴간 |핸드의| 카드 버릴 시 |치유 100%|, 데시벨 1' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n1턴간 |핸드의| 카드 버릴 시 |그 카드를 소유한 전투원 무작위 적 추가 공격 100%|' },
        { cost: 2, type: 'skill', tooltip: '치유 |200|%\n데시벨 |2|\n|다음 데시벨의 효과가 1번 더 발동|' },
        { cost: 2, type: 'upgrade', tooltip: '카드를 버릴 시 데시벨 1, 탄력 2' }
      ]
    },
    {
      name: '아다지오',
      cost: 0,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/니아/yellow.webp',
      tooltip: '드로우 1\n버리기 1\n이 효과로 버려진 카드를 뽑을 카드 위로 이동',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '드로우 |2|\n버리기 |2|\n이 효과로 버려진 카드를 뽑을 카드 위로 이동' },
        { cost: 0, type: 'skill', tooltip: '드로우 1\n|1장까지 버리기|\n|버렸다면 소멸이 부여된 "아다지오" 1장 생성|', plus_card: '아다지오', plus_tooltip: '[ 소멸 ]\n드로우 1\n버리기 1\n이 효과로 버려진 카드를 뽑을 카드 위로 이동' },
        { cost: 0, type: 'skill', tooltip: '드로우 1\n|그 카드의 비용만큼 데시벨 1|\n버리기 1\n|그 카드의 비용만큼 치유 100%|' },
        { cost: 3, type: 'skill', tooltip: '|뽑을 카드 맨 위 카드 2장 버리기|\n드로우 |2|\n|보유한 데시벨 수만큼 비용 1 감소|' },
        { cost: 0, type: 'skill', tooltip: '버리기 1\n|그 카드를 소유한 전투원 카드 2장 드로우|' }
      ]
    },
    {
      name: '니아의 호기심',
      cost: 1,
      type: 'skill',
      grade: 'purple',
      media: 'cards/니아/purple.webp',
      tooltip: '뽑을 카드의 무작위 카드 3장을 확인\n하나를 선택하여 드로우\n나머지는 버리기'
    }
  ],
  mika: [
    {
      name: '물의 화살',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/미카/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '물의 보호막',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/미카/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '물의 보호막',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/미카/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '물의 근원',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/미카/blue1.webp',
      tooltip: '치유 100%\n행동 포인트 1 획득',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '치유 |150|%\n행동 포인트 1 획득\n|물결 1|' },
        { cost: 1, type: 'skill', tooltip: '치유 |150|%\n행동 포인트 |2| 획득\n|회복 시 1턴간 사용 시까지 비용 1 감소|' },
        { cost: 0, type: 'skill', tooltip: '|[ 보존 ]|\n치유 |150|%\n행동 포인트 1 획득\n|다음 사용하는 카드의 치유량 50% 증가|' },
        { cost: 0, type: 'skill', tooltip: '치유 |150|%\n행동 포인트 1 획득\n|아군 스트레스 2 감소|' },
        { cost: 0, type: 'skill', tooltip: '|[ 소멸 ]|\n치유 100%\n행동 포인트 |3| 획득' }
      ]
    },
    {
      name: '파도의 가호',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/미카/blue2.webp',
      tooltip: '[ 보존 ]\n치유 100%\n행동 포인트 수만큼 치유량 30% 증가',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n치유 |150|%\n행동 포인트 수만큼 치유량 30% 증가\n|초과한 치유량만큼 실드 획득|' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n치유 |150|%\n행동 포인트 수만큼 치유량 30% 증가\n|물결 1|' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n치유 |150|%\n행동 포인트 수만큼 |다음 사용하는 카드의 치유량 20% 증가|' },
        { cost: 1, type: 'skill', tooltip: '[ 보존 ]\n치유 |150|%\n|치유량 만큼 무작위 적 피해|' },
        { cost: 0, type: 'skill', tooltip: '|[ 종극 ]|\n치유 \\50\\%\n|이번 턴 사용한 행동 포인트 수만큼 치유량 +50%|' }
      ]
    },
    {
      name: '작전 분석',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/미카/blue3.webp',
      tooltip: '물결 1\n1턴간 치유량 +50%',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '|치유 50%|\n물결 1\n|2|턴간 치유량 +50%' },
        { cost: 0, type: 'skill', tooltip: '물결 |2|\n1턴간 치유량 +50%' },
        { cost: 0, type: 'skill', tooltip: '물결 |2|\n1턴간 |자신의| 치유량 +|100|%' },
        { cost: 0, type: 'skill', tooltip: '|1턴간 자신의 카드 사용 시| 물결 1' },
        { cost: 0, type: 'upgrade', tooltip: '물결 |2|\n|치유량 +50%|' }
      ]
    },
    {
      name: '소용돌이',
      cost: 2,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/미카/yellow.webp',
      tooltip: '모든 적 피해 200%\n타격한 대상 수만큼 치유 50%',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 200%\n타격한 대상 수만큼 치유 |100|%' },
        { cost: 1, type: 'attack', tooltip: '모든 적 피해 200%\n타격한 대상 수만큼 |물결 1|' },
        { cost: 2, type: 'attack', tooltip: '모든 적 피해 200%\n타격한 대상 수만큼 |다음 사용하는 카드의 치유량 20% 증가|' },
        { cost: 4, type: 'attack', tooltip: '모든 적 피해 |300|%\n|회복하면 사용 시까지 비용 1 감소|' },
        { cost: 2, type: 'attack', tooltip: '|치유 100%|\n모든 적 피해 \\100\\%\n|이 카드의 치유량 만큼 피해량 증가|' }
      ]
    },
    {
      name: '범람',
      cost: 1,
      type: 'upgrade',
      grade: 'purple',
      media: 'cards/미카/purple.webp',
      tooltip: '[ 유일 ]\n물결 1\n턴 시작 시 물결 1'
    }
  ],
  cassius: [
    {
      name: '카드',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/카시우스/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '와일드 카드',
      cost: 2,
      type: 'attack',
      grade: 'gray',
      media: 'cards/카시우스/attack2.webp',
      tooltip: '피해 220%'
    },
    {
      name: '마력장',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/카시우스/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '팝 아이드 파퍼',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ],
      media: 'cards/카시우스/blue1.webp',
      tooltip: '4개의 "퀘스트" 중 무작위 1개 시작',
      awakenings: [
        { cost: 0, type: 'upgrade', tooltip: '|[ 개전 ]|\n4개의 "퀘스트" 중 무작위 1개 시작', plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ] },
        { cost: 0, type: 'upgrade', tooltip: '4개의 "퀘스트" 중 무작위 1개 시작\n|"퀘스트" 카드 생성 시 증발 제거, 보존 부여|', plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ] },
        { cost: 0, type: 'upgrade', tooltip: '4개의 "퀘스트" 중 무작위 1개 시작\n|퀘스트 완료 시 한층 더 강한 "퀘스트" 카드 생성|', plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ] },
        { cost: 0, type: 'upgrade', tooltip: '4개의 "퀘스트" 중 |1개를 선택하여 시작|', plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ] },
        { cost: 0, type: 'upgrade', tooltip: '4개의 "퀘스트" 중 무작위 1개 시작\n|퀘스트 완료 시 다른 무작위 "퀘스트"로 교체|', plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ] }
      ]
    },
    {
      name: '퀘스트: \'0\' 트리플',
      cost: '-',
      type: 'upgrade',
      grade: '',
      grade_color: 'blue',
      media: 'cards/카시우스/blue1_1.webp',
      tooltip: '비용이 0인 카드 3장 사용 시 "\'0\' 트리플" 생성'
    },
    {
      name: '퀘스트: \'1\' 트리플',
      cost: '-',
      type: 'upgrade',
      grade: '',
      grade_color: 'blue',
      media: 'cards/카시우스/blue1_2.webp',
      tooltip: '비용이 1인 카드 3장 사용 시 "\'1\' 트리플" 생성'
    },
    {
      name: '퀘스트: 스트레이트',
      cost: '-',
      type: 'upgrade',
      grade: '',
      grade_color: 'blue',
      media: 'cards/카시우스/blue1_3.webp',
      tooltip: '비용이 0, 1, 2인 카드를 각각 사용 시 "스트레이트" 생성'
    },
    {
      name: '퀘스트: 풀 하우스',
      cost: '-',
      type: 'upgrade',
      grade: '',
      grade_color: 'blue',
      media: 'cards/카시우스/blue1_4.webp',
      tooltip: '각 전투원 카드 사용 시 "풀 하우스" 생성'
    },
    {
      name: '\'0\' 트리플',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/카시우스/blue1_1.webp',
      tooltip: '[ 소멸 / 증발 ]\n피해 200%\n이번 턴 사용한 공격 카드 수만큼 피해 40% (최대 4회)'
    },
    {
      name: '\'1\' 트리플',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/카시우스/blue1_2.webp',
      tooltip: '[ 소멸 / 증발 ]\n피해 150%\n치유 150%'
    },
    {
      name: '스트레이트',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'blue',
      media: 'cards/카시우스/blue1_3.webp',
      tooltip: '[ 소멸 / 증발 ]\n1턴간 사기, 결의, 불굴 2'
    },
    {
      name: '풀 하우스',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'blue',
      media: 'cards/카시우스/blue1_4.webp',
      tooltip: '[ 소멸 / 증발 ]\n드로우 1\n무작위 아군 스트레스 2 감소'
    },
    {
      name: '강해진 \'0\' 트리플',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/카시우스/blue1_1.webp',
      tooltip: '[ 소멸 / 증발 ]\n피해 250%\n이번 턴 사용한 공격 카드 수만큼 피해 50% (최대 4회)'
    },
    {
      name: '강해진 \'1\' 트리플',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/카시우스/blue1_2.webp',
      tooltip: '[ 소멸 / 증발 ]\n피해 200%\n치유 200%'
    },
    {
      name: '강해진 스트레이트',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/카시우스/blue1_3.webp',
      tooltip: '[ 소멸 / 증발 ]\n1턴간 사기, 결의, 불굴 3'
    },
    {
      name: '강해진 풀 하우스',
      cost: 0,
      type: 'skill',
      grade: '',
      grade_color: 'yellow',
      media: 'cards/카시우스/blue1_4.webp',
      tooltip: '[ 소멸 / 증발 ]\n드로우 1\n무작위 아군 스트레스 3 감소'
    },
    {
      name: '데블 다이스',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/카시우스/blue2.webp',
      tooltip: '피해 160%\n드로우 1',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '피해 |200|%\n|"퀘스트 카드" 1장 생성|', plus_card: [ '\'0\' 트리플', '\'1\' 트리플', '스트레이트', '풀 하우스' ] },
        { cost: 1, type: 'attack', tooltip: '|[ 회수 3 ]|\n피해 160%\n드로우 1' },
        { cost: 1, type: 'attack', tooltip: '|모든 적| 피해 160%\n|타격한 대상 수만큼 드로우|' },
        { cost: 1, type: 'attack', tooltip: '피해 |240|%\n드로우 |2|\n|버리기 2|' },
        { cost: 0, type: 'attack', tooltip: '드로우 1\n|그 카드의 비용만큼 모든 적 피해 80%|' }
      ]
    },
    {
      name: '카드 섞기',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      media: 'cards/카시우스/blue3.webp',
      tooltip: '[ 소멸 ]\n핸드의 모든 카드 버리기\n그 수만큼 드로우',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '|[ 소멸 2 ]|\n핸드의 모든 카드 버리기\n그 수만큼 드로우' },
        { cost: 1, type: 'skill', tooltip: '[ 소멸 ]\n|핸드의 카드 원하는 만큼 버리기|\n그 수만큼 드로우' },
        { cost: 1, type: 'skill', tooltip: '[ 소멸 ]\n|핸드와 버린 카드의 모든 카드를 뽑을 카드로 이동|\n|드로우 5|' },
        { cost: 0, type: 'skill', tooltip: '[ 소멸 ]\n|버린 카드에서 카드를 5장까지 선택, 뽑을 카드 맨 위로 이동|' },
        { cost: 0, type: 'skill', tooltip: '|드로우 3|\n|그 카드들의 비용 합이 4 이하라면 모두 버리기|' }
      ]
    },
    {
      name: '다이스 트릭',
      cost: 2,
      type: 'attack',
      grade: 'yellow',
      plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ],
      media: 'cards/카시우스/yellow.webp',
      tooltip: '피해 240%\n1턴간 사기 1 감소\n완료한 "퀘스트" 수만큼 비용 감소',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '피해 |360|%\n1턴간 사기 1 감소\n완료한 "퀘스트" 수만큼 비용 감소', plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ] },
        { cost: 2, type: 'attack', tooltip: '|모든 적| 피해 |300|%\n1턴간 사기 1 감소\n완료한 "퀘스트" 수만큼 비용 감소', plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ] },
        { cost: 0, type: 'attack', tooltip: '피해 \\80\\%\n완료한 "퀘스트" 수만큼 |피해량 +80% (최대 5회)|', plus_card: [ '퀘스트: \'0\' 트리플', '퀘스트: \'1\' 트리플', '퀘스트: 스트레이트', '퀘스트: 풀 하우스' ] },
        { cost: 2, type: 'upgrade', tooltip: '|[ 유일 ]|\n|"퀘스트 카드" 사용 시 치유 100%, 무작위 적 고정 피해 100%|', plus_card: [ '\'0\' 트리플', '\'1\' 트리플', '스트레이트', '풀 하우스' ] },
        { cost: 2, type: 'upgrade', tooltip: '|[ 유일 ]|\n|턴 시작 시 "강해진 퀘스트 카드" 1장 생성|', plus_card: [ '강해진 \'0\' 트리플', '강해진 \'1\' 트리플', '강해진 스트레이트', '강해진 풀 하우스' ] }
      ]
    },
    {
      name: '조커',
      cost: 1,
      type: 'skill',
      grade: 'purple',
      media: 'cards/카시우스/purple.webp',
      tooltip: '뽑을 카드에서 1장 선택 드로우'
    }
  ],
  rei: [
    {
      name: '암흑 칼날',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/레이/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '암흑 칼날',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/레이/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '물질 재생',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/레이/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '어둠의 참격',
      cost: 1,
      type: 'attack',
      grade: 'blue',
      media: 'cards/레이/blue1.webp',
      tooltip: '[ 주도 ]\n피해 100%\n1턴간 기본 공격 카드의 피해량 100% 증가',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '[ 주도 ]\n피해 |150|%\n1턴간 기본 공격 카드의 피해량 |150|% 증가' },
        { cost: 1, type: 'attack', tooltip: '피해 |350|%\n|1턴간 피해량 20% 감소|' },
        { cost: 1, type: 'attack', tooltip: '[ 주도 ]\n피해 |150|%\n|기본 카드 모두 버리기, 그 수만큼 타격 1회 추가|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 유일 ]|\n|기본 공격 카드의 피해량 80% 증가|' },
        { cost: 0, type: 'skill', tooltip: '|[ 보존 ]|\n|핸드의 기본 카드 모두 발동|' }
      ]
    },
    {
      name: '공명하는 어둠',
      cost: 1,
      type: 'upgrade',
      grade: 'blue',
      media: 'cards/레이/blue2.webp',
      tooltip: '[ 유일 ]\n비용 1인 카드의 피해량 +40%\n턴 종료 시 치유 60%',
      awakenings: [
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n비용 1인 카드의 피해량 +|60|%\n턴 종료 시 치유 |90|%' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n|공허 카드의 피해량 +40%|\n턴 종료 시 치유 |90|%' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n비용 1인 카드의 피해량, |실드 획득량, 치유량| +40%\n턴 종료 시 치유 |90|%' },
        { cost: 1, type: 'upgrade', tooltip: '[ 유일 ]\n비용 1 |이하인 카드|의 피해량 +40%\n턴 종료 시 치유 |90|%' },
        { cost: 0, type: 'skill', tooltip: '|치유 100%|\n|1턴간 비용 1인 카드의 피해량 +80%|' }
      ]
    },
    {
      name: '간식 시간',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/레이/blue3.webp',
      tooltip: '[ 소멸 ]\n핸드의 카드 1장 선택 소멸\n치유 200%\n드로우 1',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '|[ 소멸 2 ]|\n핸드의 카드 1장 선택 소멸\n치유 200%\n드로우 1' },
        { cost: 0, type: 'skill', tooltip: '|[ 보존 / 소멸 ]|\n치유 200%\n드로우 |2|' },
        { cost: 0, type: 'skill', tooltip: '[ 소멸 ]\n치유 \\150\\%\n핸드의 카드 |2장까지| 선택 소멸, |그 수만큼 드로우|' },
        { cost: 0, type: 'skill', tooltip: '[ 소멸 ]\n치유 \\150\\%\n|뽑을 카드에서 1장까지| 선택 소멸, |그 수만큼 드로우|' },
        { cost: 0, type: 'skill', tooltip: '[ 소멸 ]\n치유 \\150\\%\n핸드의 카드 |2|장 선택 소멸\n|공허 카드 1장 선택 드로우|' }
      ]
    },
    {
      name: '암흑 응집',
      cost: 1,
      type: 'skill',
      grade: 'yellow',
      media: 'cards/레이/yellow.webp',
      tooltip: '핸드의 공격 카드 1장 선택, 1턴간 사용 시까지 피해량 +100%',
      awakenings: [
        { cost: 1, type: 'skill', tooltip: '핸드의 공격 카드 1장 선택, 1턴간 사용 시까지 피해량 +|150|%' },
        { cost: 1, type: 'skill', tooltip: '핸드의 |카드| 1장 선택, 1턴간 사용 시까지 피해량, |실드 획득량, 치유량| +100%' },
        { cost: 1, type: 'skill', tooltip: '|1턴간 공허 공격 카드의 피해량 +50%|' },
        { cost: 1, type: 'skill', tooltip: '|공격 카드| 1장 선택, 사용 시까지 피해량 +100%' },
        { cost: 1, type: 'upgrade', tooltip: '핸드의 공격 카드 1장 선택, |피해량 +50%|' }
      ]
    },
    {
      name: '포식자의 칼날',
      cost: 1,
      type: 'attack',
      grade: 'purple',
      media: 'cards/레이/purple.webp',
      tooltip: '피해 250%\n1턴간 사기 2'
    }
  ],
  trisa: [
    {
      name: '단검 투척',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/트리사/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '단검 투척',
      cost: 1,
      type: 'attack',
      grade: 'gray',
      media: 'cards/트리사/attack.webp',
      tooltip: '피해 100%'
    },
    {
      name: '어둠의 손길',
      cost: 1,
      type: 'skill',
      grade: 'gray',
      media: 'cards/트리사/skill.webp',
      tooltip: '치유 100%'
    },
    {
      name: '단검 꺼내기',
      cost: 1,
      type: 'trisa',
      grade: 'blue',
      plus_card: '그림자 단검',
      media: 'cards/트리사/blue1.webp',
      tooltip: '"그림자 단검" 2장 생성',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '"그림자 단검" 2장 생성', plus_card: '그림자 단검' },
        { cost: 1, type: 'skill', tooltip: '"그림자 단검" |3|장 생성', plus_card: '그림자 단검' },
        { cost: 1, type: 'upgrade', tooltip: '"그림자 단검" \\1\\장 생성\n|턴 시작 시 "그림자 단검" 1장 생성|', plus_card: '그림자 단검' },
        { cost: 1, type: 'skill', tooltip: '"그림자 단검" 2장 생성\n|생성된 "그림자 단검"의 고통 부여 효과가 2 증가|', plus_card: '그림자 단검' },
        { cost: 1, type: 'skill', tooltip: '|[ 소멸 ]|\n"그림자 단검" |4|장 생성', plus_card: '그림자 단검' }
      ]
    },
    {
      name: '그림자 단검',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/트리사/blue1_1.webp',
      tooltip: '[ 소멸 ]\n피해 80%\n고통 1'
    },
    {
      name: '상급 그림자 단검',
      cost: 0,
      type: 'attack',
      grade: '',
      grade_color: 'blue',
      media: 'cards/트리사/blue1_1.webp',
      tooltip: '[ 소멸 ]\n고통 2\n피해 50%\n대상의 고통 수만큼 피해량 +10%'
    },
    {
      name: '저주 부여',
      cost: 0,
      type: 'skill',
      grade: 'blue',
      media: 'cards/트리사/blue2.webp',
      tooltip: '1턴간 공격 카드 사용 시 대상에게 고통 1',
      awakenings: [
        { cost: 0, type: 'skill', tooltip: '1턴간 |카드| 사용 시 |무작위 적| 고통 1' },
        { cost: 0, type: 'skill', tooltip: '|2|턴간 공격 카드 사용 시 대상에게 고통 1' },
        { cost: 1, type: 'skill', tooltip: '|[ 주도 ]|\n|무작위 적들에게 고통 4 × 2|' },
        { cost: 1, type: 'upgrade', tooltip: '|[ 개전 ]|\n|모든 적 고통 2|\n|턴 시작 시 모든 적 고통 2|' },
        { cost: 2, type: 'upgrade', tooltip: '|카드로 고통 부여 시 대상에게 고통 1 추가|' }
      ]
    },
    {
      name: '그림자 장전',
      cost: 1,
      type: 'skill',
      grade: 'blue',
      plus_card: '상급 그림자 단검',
      media: 'cards/트리사/blue3.webp',
      tooltip: '치유 100%\n"상급 그림자 단검" 1장 생성',
      awakenings: [
        { cost: 1, type: 'attack', tooltip: '|[ 보존 ]|\n|모든 적 피해 80%|\n|고통 2|\n|핸드의 "그림자 단검" 모두 소멸, 그 수만큼 반복|', plus_card: '그림자 단검' },
        { cost: 0, type: 'skill', tooltip: '치유 |150|%\n"상급 그림자 단검" 1장 생성', plus_card: '상급 그림자 단검' },
        { cost: 'X', type: 'skill', tooltip: '치유 100% × |X|\n|"그림자 단검", "상급 그림자 단검" 중 무작위 X장 생성|', plus_card: [ '그림자 단검', '상급 그림자 단검' ] },
        { cost: 1, type: 'skill', tooltip: '|모든 "그림자 단검" 소멸, 그 수만큼 "상급 그림자 단검" 생성', plus_card: [ '그림자 단검', '상급 그림자 단검' ] },
        { cost: 1, type: 'skill', tooltip: '|[ 소멸 2 ]|\n|카드 모두 버리기|\n|그 수만큼 "그림자 단검" 생성|', plus_card: '그림자 단검' }
      ]
    },
    {
      name: '급소 공격',
      cost: 2,
      type: 'attack',
      grade: 'yellow',
      media: 'cards/트리사/yellow.webp',
      tooltip: '피해 80% × 3\n대상이 고통 상태라면 피해량 +50%',
      awakenings: [
        { cost: 2, type: 'attack', tooltip: '|[ 주도 ]|\n피해 |150|% × 3' },
        { cost: 2, type: 'attack', tooltip: '피해 |120|% × 3\n대상이 고통 상태라면 피해량 +|70|%' },
        { cost: 1, type: 'attack', tooltip: '피해 80% × 3\n|고통 2 ~ 6|' },
        { cost: 2, type: 'attack', tooltip: '피해 |200|% × \\2\\\n|대상의 고통 3 이상일 시 1번 더 발동|' },
        { cost: 2, type: 'attack', tooltip: '피해 |150|% × 3\n|대상의 고통 수만큼 피해량 +10%|' }
      ]
    },
    {
      name: '저주 도려내기',
      cost: 1,
      type: 'skill',
      grade: 'purple',
      media: 'cards/트리사/purple.webp',
      tooltip: '대상이 보유한 자신의 고통 발동'
    }
  ]
};
