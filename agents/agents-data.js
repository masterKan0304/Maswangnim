// ============================================================
// 요원 데이터 편집 파일
// ------------------------------------------------------------
// 요원을 추가/수정하려면 아래 목록에 { ... } 항목을 추가/편집하면 됩니다.
// 필터링이 걸려있지 않을 때는 여기 적힌 순서대로 왼쪽부터 나열됩니다.
//
// 각 항목의 항목 설명:
//   id          : 요원 고유 값 (영문/숫자, 중복 금지)
//   name        : 요원 이름
//   job         : 직업 하나만 선택 — striker / ranger / vanguard / hunter / controller / psionic
//   attribute   : 속성 하나만 선택 — passion / justice / order / instinct / void
//   grade       : 등급 하나만 선택 — 5 (5성) / 4 (4성)
//   illust      : 우측에 크게 보여줄 일러스트 이미지 경로 (agents 폴더에 넣고 파일명 적기)
//   icon        : 하단 목록에 보여줄 작은 아이콘 이미지 경로 (비워두면 illust와 동일한 이미지 사용)
//   tagline     : 이름 아래 한 줄 소개 문구
//   description : 상세 설명 (줄바꿈하고 싶은 곳에서 Enter로 줄을 바꾸면 그대로 반영됩니다)
//   cardTagline     : (선택) 카드 정보 화면에서 대신 보여줄 한 줄 소개. 안 적으면 tagline이 그대로 쓰입니다.
//   cardDescription : (선택) 카드 정보 화면에서 대신 보여줄 상세 설명. 안 적으면 description이 그대로 쓰입니다.
//                     (카드 정보로 전환해도 직업/속성 아이콘과 이름은 그대로 유지되고, 이 두 문구만 바뀝니다)
// ============================================================

window.AGENTS_DATA = [
  {
    id: 'hilde',
    name: '힐데',
    job: 'ranger',
    attribute: 'instinct',
    grade: 5,
    illust: 'agents/힐데_B.webp',
    icon: 'agents/힐데_A.webp',
    tagline: '전장의 사기꾼으로 불리는 희대의 지략가',
    description: '아이언 레인 폭스 소대의 소대장으로 전장의 사기꾼으로 불리는 지략가.\n소탈하고 낙천적인 성격 때문에 허술해 보이지만,\n적의 빈틈을 파고들어 정확하게 명중시키는 솜씨가 대단하다.\n사람의 목숨보다 귀중한 건 없다는 확고한 신념을 가지고 있다.',
    cardTagline: '드로우 보조 및 추가 공격 특화',
    cardDescription: '[호밍 애로우]를 생성해 추가 공격과 드로우를 지원하고,\n[빅 게임 레인저]로 아군의 플레이를 "일점 조준"으로\n전환해 강력한 추가 공격을 전개하며,\n이온화로 적이 받는 피해량을 증가시킬 수 있습니다.'
  },
  {
    id: 'pei',
    name: '페이',
    job: 'ranger',
    attribute: 'void',
    grade: 5,
    illust: 'agents/페이_B.png',
    icon: 'agents/페이_A.webp',
    tagline: '방주 추락 의혹에 휩싸인 고고한 미녀',
    description: '고혹적인 미인이지만 페이의 미모에 눈을 빼앗겨서는 안 된다.\n페이는 우주 역사상 가장 높은 현상금이 걸린 위험한 여성이다.\n페이의 행적은 신출귀몰하나 카오스 교단 소탕 의뢰를 받는다면 그녀와 마주칠 수도 있다.\n그녀의 목적이 카오스 교단 말살이기 때문.'
  },
  {
    id: 'tenebria',
    name: '테네브리아',
    job: 'psionic',
    attribute: 'passion',
    grade: 5,
    illust: 'agents/테네브리아_B.png',
    icon: 'agents/테네브리아_A.webp',
    tagline: '은하 최고의 아이돌, 가장 빛나는 별',
    description: '은하계 최고의 아이돌.\n밝은 미소와 넘치는 활력으로 많은 이들의 사랑을 한몸에 받고 있다.\n테네브리아의 무대를 본 사람이라면 뛰어난 가창력,\n압도적인 퍼포먼스에 사로잡혀 헤어나올 수 없다.'
  },
  {
    id: 'Adelheid',
    name: '아델하이트',
    job: 'vanguard',
    attribute: 'void',
    grade: 5,
    illust: 'agents/아델하이트_B.png',
    icon: 'agents/아델하이트_A.webp',
    tagline: '동화를 구현하는 소녀',
    description: '테라시온의 특수 사건 수사부 소속 아미르가 해적 함선에서\n구조한 어린 소녀로, 동화 구현 능력자다.\n빛으로 동화 속 존재를 만들어 공격할 수 있다.\n평소 동화를 빗대어 비유하거나 상황을 묘사하면서 대화를 하곤 한다.'
  },
  {
    id: 'heidemarie',
    name: '하이데마리',
    job: 'ranger',
    attribute: 'passion',
    grade: 5,
    illust: 'agents/하이데마리_B.png',
    icon: 'agents/하이데마리_A.webp',
    tagline: '과거의 영웅 그래고 대중의 우상',
    description: '에데니티호의 비극, 엘리나드 사건 당시 대활약한 영웅.\n부상으로 요원 자리에서 은퇴한 후에도 열렬한 대중의 지지를 받았으며,\n비극을 극복하고 앞으로 나아가야 한다는 명분에 떠밀려 시장이 되었다.\n　'
  },
  {
    id: 'diana',
    name: '디아나',
    job: 'hunter',
    attribute: 'passion',
    grade: 5,
    illust: 'agents/디아나_B.png',
    icon: 'agents/디아나_A.webp',
    tagline: '사랑을 퍼뜨리는 아이돌',
    description: '일반적인 대사제들이 갖고 있는 권위나 힘 등은\n갖고 있지 않은 명예 대사제에 가깝다.\n딱딱하고 정적일 것 같은 성전십자회의 이미지를 타파하는 성전십자회의 간판.\n다른 사람들의 행복을 위해, 그리고 사랑을 위해 활동한다.'
  },
  {
    id: 'rita',
    name: '리타',
    job: 'psionic',
    attribute: 'justice',
    grade: 5,
    illust: 'agents/리타_B.png',
    icon: 'agents/리타_A.webp',
    tagline: '우주 만물의 기록자',
    description: '흔들리는 자아와 막연한 두려움 사이에서 자신만의 장소를 찾아 헤매던 소녀.\n하지만 함장과의 만남으로 자신의 진정한 사명을 깨닫고,\n만물의 기록자로서 다시 태어난다.\n기록자로서 우주에서 가장 흥미로운 대상인 함장의 행적을 지켜보고 있다.'
  },
  {
    id: 'tiphera',
    name: '티페라',
    job: 'controller',
    attribute: 'order',
    grade: 5,
    illust: 'agents/티페라_B.png',
    icon: 'agents/티페라_A.webp',
    tagline: '비밀 임무를 수행하는 제국의 집행관',
    description: '씩씩하고 성실하게 맡은 일을 완벽히 수행하려 노력하는 제국의 집행관.\n매사 자신감이 넘쳐 실수를 하기도 하지만,\n확고한 자신만의 정의와 신념을 지니고 있다.\n　'
  },
  {
    id: 'nine',
    name: '나인',
    job: 'vanguard',
    attribute: 'order',
    grade: 5,
    illust: 'agents/나인_B.png',
    icon: 'agents/나인_A.webp',
    tagline: '사지에서 공포를 모르듯 굳건하게 서는 용병',
    description: '과거 사망률 100%의 위험한 의뢰만 도맡으면서도\n생환율 100%의 전설적인 기록을 만들어낸 인물로,\n은하계 용병 랭킹보드의 1위였다.\n현재는 모종의 사유로 거대한 에너지원을 찾고 있다.'
  },
  {
    id: 'narja',
    name: '나르쟈',
    job: 'controller',
    attribute: 'instinct',
    grade: 5,
    illust: 'agents/나르쟈_B.png',
    icon: 'agents/나르쟈_A.webp',
    tagline: '펠티온의 강화된 레플리카',
    description: '카구야 제약에서 만든 인공 생명체, 레플리카.\nNA-02라는 개체번호로 불렸다.\n의식이 연결된 비룡 엘리시온을 조종하여 적을 공격한다.\n자신의 의지와 관계없이 태어나 고통받으면서 삶을 향한 근본적인 피로와 염증을 느낀다.'
  },
  {
    id: 'sereniel',
    name: '세레니엘',
    job: 'hunter',
    attribute: 'instinct',
    grade: 5,
    illust: 'agents/세레니엘_B.png',
    icon: 'agents/세레니엘_A.webp',
    tagline: '방주 수호를 위하여 포화를 퍼붓는 수호천사',
    description: '테라시온의 항공을 지키는 방주수호국장.\n방주수호국의 리더인 데다가 아름다운 날개를 달고 하늘을 나는 모습 덕에\n수호천사라는 별명이 붙었다. 다만 눈 하나 깜빡하지 않고 범죄자들에게\n화력을 퍼부어 체포하기에, 일각에선 죽음의 천사라 불리기도 한다.'
  },
  {
    id: 'chizuru',
    name: '치즈루',
    job: 'psionic',
    attribute: 'void',
    grade: 5,
    illust: 'agents/치즈루_B.png',
    icon: 'agents/치즈루_A.webp',
    tagline: '영원한 어둠을 봉인한 무녀',
    description: '월영검의 계승자이자, 우미시로 행성 출신의 무녀.\n행동이 단아하고 기품 있으며, 결코 꺾이지 않는 의지를 지니고 있다.\n그녀의 주변에는 늘 어둠이 맴돌고 있다. 그녀 자신은 패배하지 않기에,\n주변의 모든 것이 꺾이고 무너져 패배한다.'
  },
  {
    id: 'yuki',
    name: '유키',
    job: 'striker',
    attribute: 'order',
    grade: 5,
    illust: 'agents/유키_B.png',
    icon: 'agents/유키_A.webp',
    tagline: '특수사건수사부의 부장',
    description: '자리에 걸맞지 않게 장난스럽고 짓궃은 성격이 눈에 띈다.\n실력 하나는 확실한데다가 중요한 순간엔\n누구보다 뛰어난 집중력을 보여주기에\n상부에서도 상당히 신임하고 있다.'
  },
  {
    id: 'haru',
    name: '하루',
    job: 'striker',
    attribute: 'justice',
    grade: 5,
    illust: 'agents/하루_B.png',
    icon: 'agents/하루_A.webp',
    tagline: '맑은 미소의 봄빛 화창한 소녀',
    description: '아카데미에 재학 중인 선도부 위원.\n나긋나긋하고 부드러운 성품으로 평판이 좋다.\n보기와 달리 엄청난 대식가로, 특히 단 것을 좋아한다. 능력을 충전하기 위해\n먹는 것일 뿐이라고 변명하지만, 행복한 얼굴에서 음식 자체를 즐기는 모습이 엿보인다.'
  },
  {
    id: 'renoa',
    name: '레노아',
    job: 'hunter',
    attribute: 'void',
    grade: 5,
    illust: 'agents/레노아_B.png',
    icon: 'agents/레노아_A.webp',
    tagline: '검은 장미의 시인',
    description: '유스티티아호 출신의 엘리트 요원.\n어떤 상황에서도 냉철한 태도를 지녔지만, 한편으론 소녀다운 감수성을 유지하고 있다.\n시를 쓰는 취미가 있으며, 글을 쓸 때를 제외하고는\n자신에 대한 이야기를 하는 걸 좋아하지 않는다.'
  },
  {
    id: 'veronica',
    name: '베로니카',
    job: 'ranger',
    attribute: 'passion',
    grade: 5,
    illust: 'agents/베로니카_B.png',
    icon: 'agents/베로니카_A.webp',
    tagline: '정체성 혼란을 겪는 토끼쥐',
    description: '본인은 토끼이지만, 쥐인 아버지에게 키워져 토끼와 쥐 사이에서 헤맨다.\n블랙 스피카의 악당적인 이미지에 맞춰\n범죄자처럼 굴려고 애쓰긴 하지만, 영 소질은 없다.\n오히려 선한 사람의 행동을 악당의 미덕이라고 생각하는 편.'
  },
  {
    id: 'ruke',
    name: '루크',
    job: 'hunter',
    attribute: 'order',
    grade: 5,
    illust: 'agents/루크_B.png',
    icon: 'agents/루크_A.webp',
    tagline: '냉철한 설계자',
    description: '루카스의 쌍둥이 동생. 다소 무뚝뚝하고 진중한 성격이지만\n내면에 따뜻하고 순수한 마음을 가지고 있다.\n이성적이고 침착한 태도 탓에 사람들에게 관심이 없는 것처럼 보이지만,\n실제로는 높은 관찰력으로 상대에게 필요한 조언을 해주곤 한다.'
  },
  {
    id: 'hugo',
    name: '휴고',
    job: 'ranger',
    attribute: 'order',
    grade: 5,
    illust: 'agents/휴고_B.png',
    icon: 'agents/휴고_A.webp',
    tagline: '아쥬르 상단의 해결사',
    description: '캐러밴 방주 내에서 휴고의 해결 사무소를 운영하고 있다.\n골치 아픈 몬스터나 떼인 돈 찾기, 사람 찾기 등\n시시콜콜하거나 위험하기까지 한 일들을 고루 맡아서 해결해주곤 한다.\n일하지 않을 땐 무기력하고 게으른 모습을 보이곤 한다.'
  },
  {
    id: 'orlea',
    name: '오를레아',
    job: 'controller',
    attribute: 'instinct',
    grade: 5,
    illust: 'agents/오를레아_B.png',
    icon: 'agents/오를레아_A.webp',
    tagline: '미래를 보는 사제',
    description: '빛을 다룰 수 있고, 미래시라는 것으로 종종 미래를 보곤 한다.\n감정 변화가 적은 편으로, 웃지 않거나 차가운 인상은 아니지만\n슬픔도 분노도 속을 알 수 없는 분위기를 풍기곤 한다.\n주로 퀸토와 함께 활동하곤 한다.'
  },
  {
    id: 'rin',
    name: '린',
    job: 'striker',
    attribute: 'void',
    grade: 5,
    illust: 'agents/린_B.png',
    icon: 'agents/린_A.webp',
    tagline: '사랑을 꿈꾸는 천재 검사',
    description: '"우주에서 단 하나뿐인, 운명적인 사랑"을 찾기 위해 떠돌고 있다.\n평범한 사랑을 하는게 목표.\n언젠가 운명의 상대를 만날 수 있을 것이라는\n희망을 품고 우주 곳곳을 돌아다니고 있다.'
  },
  {
    id: 'meilin',
    name: '메이린',
    job: 'striker',
    attribute: 'passion',
    grade: 5,
    illust: 'agents/메이린_B.png',
    icon: 'agents/메이린_A.webp',
    tagline: '향족의 마지막 수행자',
    description: '지구에서 오랜 기간 깊은 지하에서 살아가며\n생존한 향족이라는 소수 민족의 수행자이다.\n지구의 카오스로 동족을 모두 잃은 메이린은, 향족의 가르침 중\n하나인 "모두를 사랑하라"는 가치를 지키기 위해 노력하고 있다.'
  },
  {
    id: 'khaliphe',
    name: '칼리페',
    job: 'vanguard',
    attribute: 'instinct',
    grade: 5,
    illust: 'agents/칼리페_B.png',
    icon: 'agents/칼리페_A.webp',
    tagline: '화이트 알테어의 수장',
    description: '부드러운 카리스마를 가지고 있어,\n파밀리아 일원들에게 존경을 받고 있는 인물이다.\n하지만 자유분방한 파밀리아 일원들이 여러 사고를 치곤해서,\n칼리페는 이를 수습하기 위해 과도한 업무량에 시달리기도 한다.'
  },
  {
    id: 'magna',
    name: '마그나',
    job: 'vanguard',
    attribute: 'justice',
    grade: 5,
    illust: 'agents/마그나_B.png',
    icon: 'agents/마그나_A.webp',
    tagline: '낭만을 쫓는 모험가',
    description: '화이트 알테어의 일원으로, 신나고 즐거운 것,\n보물들을 찾아다니며 모험하는 것을 즐긴다.\n하찮은 물건이라도 모험 중에 발견하면 보물이라 부르며\n천진난만하게 기뻐하곤 한다.'
  },
  {
    id: 'kayron',
    name: '카일론',
    job: 'psionic',
    attribute: 'void',
    grade: 5,
    illust: 'agents/카일론_B.png',
    icon: 'agents/카일론_A.webp',
    tagline: '기억을 잃은 채 안식을 쫓는 각성자',
    description: '카일론이 누구인지, 어디에서 왔는지는 그 자신조차 알지 못한다.\n기억이 있는 순간부터 평화로웠던 적이 없기에, 싸움도, 번민도 없는 곳을 원한다.\n브리아의 목숨을 구해 은인이 되었지만,\n기억이 없어 자신이 한 일이라 여기지 않는다.'
  },
  {
    id: 'owen',
    name: '오웬',
    job: 'striker',
    attribute: 'passion',
    grade: 4,
    illust: 'agents/오웬_B.png',
    icon: 'agents/오웬_A.webp',
    tagline: '약속을 지키려는 소년',
    description: '사용하는 창은 아버지에게서 물려받은 것이며,\n자세히 관찰한다면 언제나 보이지 않는 곳에서\n창술 수련에 매진하는 모습을 엿볼 수 있다.\n스스로 중심이 흔들리지 않기 위해서 자신을 한계까지 몰아붙이며 수련한다.'
  },
  {
    id: 'selena',
    name: '셀레나',
    job: 'ranger',
    attribute: 'passion',
    grade: 4,
    illust: 'agents/셀레나_B.png',
    icon: 'agents/셀레나_A.webp',
    tagline: '지나치게 조용한 저격수',
    description: '존재감이 없다는 장점을 살려 저격수 역할을 하고 있는데,\n그 능력이 출중해 간혹 모두가 셀레나의 저격 사실 자체를 잊고 있기도 한다.\n잊혀지면 잠시 기죽은 모습을 보이지만,\n그럼에도 누구보다 화이트 알테어를 위해 헌신한다.'
  },
  {
    id: 'beril',
    name: '베릴',
    job: 'ranger',
    attribute: 'justice',
    grade: 4,
    illust: 'agents/베릴_B.png',
    icon: 'agents/베릴_A.webp',
    tagline: '어른이 되고 싶은 천재 지휘관',
    description: '전설적인 군인인 할머니에게 물려받은 탁월한 전략 전술과 기민한 판단력으로,\n어린 나이에 지휘관의 자리에 올랐다. "멋진 군인"이나 "믿음직한 대장"이 되기 위해\n끊임없이 노력한다. 하지만 초코바를 좋아한다거나, 일이 어려워지면\n무력으로 해결하고자 하는 아이 같은 모습을 완벽히 숨기기는 쉽지 않다.'
  },
  {
    id: 'amir',
    name: '아미르',
    job: 'vanguard',
    attribute: 'order',
    grade: 4,
    illust: 'agents/아미르_B.png',
    icon: 'agents/아미르_A.webp',
    tagline: '특수사건수사부의 수사관',
    description: '약칭 특사부 소속으로 테라시온 내 여러 사건 등을 맡아\n수사하고 처리하는 일을 맡고 있다.\n규칙, 규율, 법도와 원리원칙을 중요시 여기는 성격으로 깔끔하게\n명령을 수행하는 것에 언제나 진심이다. 약간의 결벽증이 있다.'
  },
  {
    id: 'maribel',
    name: '마리벨',
    job: 'vanguard',
    attribute: 'passion',
    grade: 4,
    illust: 'agents/마리벨_B.png',
    icon: 'agents/마리벨_A.webp',
    tagline: '포용하는 방패',
    description: '늘상 멍하고 표정 변화가 그리 많지 않지만, 호불호가 명확하고,\n동료들을 위해서는 수단과 방법을 가리지 않는다.\n남들을 보살펴주는 걸 좋아하며, 힘들어 하거나\n고민하는 이에게는 망설임 없이 포옹한다.'
  },
  {
    id: 'rukas',
    name: '루카스',
    job: 'hunter',
    attribute: 'passion',
    grade: 4,
    illust: 'agents/루카스_B.png',
    icon: 'agents/루카스_A.webp',
    tagline: '화끈한 승부사',
    description: '루크의 쌍둥이 형. 본래 머리색은 루크와 같은 어두운 색이었으나,\n붉은 색으로 염색을 한 것이다.\n루크와는 반대로 유쾌하고 능글거리는 성격을 가지고 있다.\n여성 한정으로 다정한 면모를 보여 인기를 끄는 편이다.'
  },
  {
    id: 'nia',
    name: '니아',
    job: 'controller',
    attribute: 'instinct',
    grade: 4,
    illust: 'agents/니아_B.png',
    icon: 'agents/니아_A.webp',
    tagline: '자칭 우주 최강 록스타',
    description: '나이트메어호 내에서 홀로 개인 콘서트를 열거나 하면서\n조금씩 이름을 알리고 있다.\n자신만만하며 밝고 해맑은 성격으로, 호기심이 많아\n궁금한 것을 못 참으면 상대방에게 질문 공세를 날리기도 한다.'
  },
  {
    id: 'mika',
    name: '미카',
    job: 'controller',
    attribute: 'justice',
    grade: 4,
    illust: 'agents/미카_B.png',
    icon: 'agents/미카_A.webp',
    tagline: '동경하던 사람의 목표를 이어받은 소녀',
    description: '전투 같은 폭력적인 걸 싫어하지만, 동경하던 사람의 꿈을\n대신해 사람들을 지키려 전투원이 됐다.\n기본적으로는 올곧고 야무지며, 전투원 신분이지만\n학생이기도 하다며 틈날 때마다 짬짬이 공부할 정도로 성실한 성격.'
  },
  {
    id: 'trisa',
    name: '트리사',
    job: 'psionic',
    attribute: 'void',
    grade: 4,
    illust: 'agents/트리사_B.png',
    icon: 'agents/트리사_A.webp',
    tagline: '언제나 불운한 소녀',
    description: '나이트메어호의 요원으로, 자신의 과거에 대해 이야기하길 꺼린다.\n일생 불운에 시달렸고, 현재도 여전히 크고 작은 불행이\n이상할 정도로 찾아오곤 한다. 자신 때문에\n불운에 휘말리는 사람들에게 항상 죄책감을 가지고 있다.'
  }
];
