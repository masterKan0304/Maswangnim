// ============================================================
// 파트너 데이터 편집 파일
// ------------------------------------------------------------
// 파트너를 추가/수정하려면 아래 목록에 { ... } 항목을 추가/편집하면 됩니다.
// 필터링이 걸려있지 않을 때는 여기 적힌 순서대로 왼쪽부터 나열됩니다.
//
// 전투원(agents/agents-data.js)과 다른 점:
//   - attribute(속성) 필드가 없습니다. 파트너는 속성 분류가 없어요.
//   - grade(등급)는 5 / 4 / 3 까지 존재합니다.
//   - grade 아이콘 이미지는 agents 폴더의 것을 그대로 재사용합니다
//     (agents/grade_5.png, grade_4.png, grade_3.png / grade_5_tag.png, grade_4_tag.png, grade_3_tag.png).
//
// 각 항목의 항목 설명:
//   id          : 파트너 고유 값 (영문/숫자, 중복 금지)
//   name        : 파트너 이름
//   job         : 직업 하나만 선택 — striker / ranger / vanguard / hunter / controller / psionic
//   grade       : 등급 하나만 선택 — 5 (5성) / 4 (4성) / 3 (3성)
//   illust      : 우측에 크게 보여줄 일러스트 이미지 경로 (partner 폴더에 넣고 파일명 적기)
//   icon        : 하단 목록에 보여줄 작은 아이콘 이미지 경로 (비워두면 illust와 동일한 이미지 사용)
//   tagline     : 이름 아래 한 줄 소개 문구
//   description : 상세 설명 (줄바꿈하고 싶은 곳에서 Enter로 줄을 바꾸면 그대로 반영됩니다)
// ============================================================

window.PARTNER_DATA = [
  {
    id: 'yuni',
    name: '유니',
    job: 'ranger',
    grade: 5,
    illust: 'partner/유니_B.png',
    icon: 'partner/유니_A.webp',
    tagline: '폭스 소대의 브레이크 담당',
    description: '아이언 레인 폭스 소대 소속.\n소대장을 향한 충성심이 대단하며, 그 충섬심을 정론과 잔소리로 표현한다.\n힐데가 무모한 작전을 가져오면 누구보다 먼저 나서서 반대하고\n정론으로 받아 치지만, 작전 수행 중에는 맡은 역할을 완벽하게 해낸다.',
    passive: '전장 포화 교범',
    passive_tooltip: '담당 전투원의 공격력이 16/18/20/22/24% 증가합니다.\n담당 전투원이 뽑을 카드에서 "본능" 속성 공격 카드 생성 시\n그 카드의 추가 공격 피해량이 사용시까지 40/50/60/70/80% 증가합니다.',
    ego: '전방 사격 개시!',
    ego_point: 2,
    ego_tooltip: '피해 250%\n핸드에 담당 전투원의 무작위\n공격 카드 1장 약점 공격 2 부여',
    ego_media: 'partner/유니_D.webp',
  },
  {
    id: 'priscilla',
    name: '프리실라',
    job: 'striker',
    grade: 5,
    illust: 'partner/프리실라_B.png',
    icon: 'partner/프리실라_A.webp',
    tagline: '테트라 가문의 가주',
    description: '군사 가문인 테트라 가문의 가주가 일찍 사망하면서,\n후계자인 프리실라는 어린 나이에 가주 자리에 올랐다.\n나이가 어려 무시하는 세력들을 제압하기 위해, 프리실라는\n폭군처럼 방해자들을 숙청하며 현재의 자리를 유지하고 있다.',
    passive: '거미의 영역',
    passive_tooltip: '담당 전투원의 공격력, 체력, 피해량이 12/14/16/18/20% 증가합니다.\n담당 전투원이 격파 상태인 대상에게 주는 피해가 +25/32/38/44/50% 됩니다.',
    ego: '테트라의 거미줄',
    ego_point: 2,
    ego_tooltip: '피해 250%\n핸드에 담당 전투원의 무작위\n공격 카드 1장 약점 공격 2 부여',
    ego_media: 'partner/프리실라_D.webp',
  },
  {
    id: 'solia',
    name: '솔리아',
    job: 'ranger',
    grade: 5,
    illust: 'partner/솔리아_B.png',
    icon: 'partner/솔리아_A.webp',
    tagline: '레오스 가문의 선구자',
    description: '방주 체레스 문명의 선구자인 솔리아는 다른 실레이마와 비교해도 지지 않을\n막강한 힘을 지녔다. 강자 특유의 여유와 제멋대로인 성격으로 누구도\n이해할 수 없는 존재로 여겨지고 있지만, 사실은 사람을 이해하는데\n서툰 것뿐. 대부분의 행동은 자신만의 방식으로 선의를 베푸는 것이다.',
    passive: '시공의 비틀림',
    passive_tooltip: '담당 전투원의 공격력이 12/14/16/18/20% 증가합니다.\n담당 전투원이 주는 추가 공격 피해량이 +20/25/30/35/40% 됩니다.',
    ego: '시공간 균열',
    ego_point: 3,
    ego_tooltip: '피해 250%\n표식 1',
    ego_media: 'partner/솔리아_D.webp',
  },
  {
    id: 'eishlen',
    name: '아이슐렌',
    job: 'vanguard',
    grade: 5,
    illust: 'partner/아이슐렌_B.png',
    icon: 'partner/아이슐렌_A.webp',
    tagline: '이노스의 야망',
    description: '병약함과 무력함을 야망과 집념, 비상한 머리로 극복해낸 천재.\n금단의 마도서를 얻어 미지의 존재의 힘을 빌려 쓰게 되었다.\n그 능력과 성격적 결함을 감안하는 한이 있더라도,\n아이슐렌은 명실공히 실레이마의 한 축이다.',
    passive: '마력 파동',
    passive_tooltip: '담당 전투원의 방어력, 체력, 실드 획득량이 12/14/16/18/20% 증가합니다.',
    ego: '이노스의 수호',
    ego_point: 4,
    ego_tooltip: '실드 100%\n턴 종료 시 실드 50% 보존',
    ego_media: 'partner/아이슐렌_D.webp',
  },
  {
    id: 'serithea',
    name: '세리테아',
    job: 'hunter',
    grade: 5,
    illust: 'partner/세리테아_B.png',
    icon: 'partner/세리테아_A.webp',
    tagline: '귀족을 동경하는 아가씨',
    description: '실레이마 특유의 거만함은 있지만 다른 사람들의 눈에\n얄팍한 허세처럼 귀엽게 보이는 정도다. 약간의 애정결핍이 있으며,\n부족한 자존감을 채우기 위해 남들에게 사랑받을 수 있는 컨셉을\n만들어 자신인 척 위장하고 다닌다.',
    passive: '앙상블',
    passive_tooltip: '담당 전투원의 공격력이 12/14/16/18/20% 증가합니다.\n담당 전투원의 공격 카드의 치명확률이 +8/10/12/14/16% 됩니다.',
    ego: '진홍빛 로맨스',
    ego_point: 3,
    ego_tooltip: '피해 250%\n취약 2',
    ego_media: 'partner/세리테아_D.webp',
  },
];
