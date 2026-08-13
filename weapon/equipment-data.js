// ============================================================
// 장비 정보 데이터 편집 파일
// ------------------------------------------------------------
// 아래 배열에 장비 항목을 하나씩 추가하면 덱 빌딩 박스의 "장비" 슬롯
// 선택 팝업에 자동으로 나타납니다.
//
// 각 장비 항목 설명:
//   name    : 장비 이름
//   type    : 장비 유형 — weapon(무기) / armor(갑옷) / accessory(장신구)
//             슬롯 배치 순서(무기 → 갑옷 → 장신구)와 능력치 이름이 이 값으로 정해집니다.
//   stat    : 능력치 수치 (숫자만 적으면 됩니다. 예: 90)
//             화면에는 유형에 따라 자동으로 이름이 붙습니다 — 무기: 공격력 / 갑옷: 방어력 / 장신구: 체력
//   tooltip : 장비 설명 텍스트 (예: '치명피해 + 20%')
//   source  : 획득처 텍스트 (예: '쌍성의 그림자')
//   grade   : 장비 등급 — blue(파랑) / yellow(노랑) / purple(보라)
//             purple 등급은 무기/갑옷/장신구 중 전체 덱에서 단 1개만 장착할 수 있습니다.
//   media   : 장비 이미지 경로 (예: 'weapon/ㅇㅇ.png')
// ============================================================

window.EQUIPMENT_DATA = [
   {
     name: '갑각충의 뿔',
     type: 'weapon',
     stat: 90,
     tooltip: '치명피해 + 20%',
     source: '쌍성의 그림자',
     grade: 'purple',
     media: 'weapon/갑각충의뿔.webp'
   },
   {
     name: '광휘로운 보주',
     type: 'weapon',
     stat: 90,
     tooltip: '실드 보유 대상에게 피해량 25% 증가',
     source: '도래된 혼돈',
     grade: 'purple',
     media: 'weapon/광휘로운보주.webp'
   },
   {
     name: '대악과 소악 쌍수검',
     type: 'weapon',
     stat: 90,
     tooltip: '격파 상태인 대상에게 피해량 30% 증가',
     source: '쌍성의 그림자',
     grade: 'purple',
     media: 'weapon/대악과소악쌍수검.webp'
   },
   {
     name: '레피돌라의 채찍',
     type: 'weapon',
     stat: 90,
     tooltip: '비용 1 이하인 공격 카드의 피해량 25% 증가',
     source: '쌍성의 그림자',
     grade: 'purple',
     media: 'weapon/레피돌라의채찍.webp'
   },
   {
     name: '변이의 권능',
     type: 'weapon',
     stat: 90,
     tooltip: '행동 전인 대상에게 피해량 25% 증가',
     source: '푸른 항아리',
     grade: 'purple',
     media: 'weapon/변이의권능.webp'
   },
   {
     name: '삼킨 자의 공허',
     type: 'weapon',
     stat: 90,
     tooltip: '카드 소멸 시 다음 사용하는 카드의 피해량 35% 증가 (최대 1회 중첩)',
     source: '안개의 도시',
     grade: 'purple',
     media: 'weapon/삼킨자의공허.webp'
   },
   {
     name: '안개 낀 수정구',
     type: 'weapon',
     stat: 90,
     tooltip: '비용 0 인 공격 카드의 피해량 40% 증가',
     source: '안개의 도시',
     grade: 'purple',
     media: 'weapon/안개낀수정구.webp'
   },
   {
     name: '어둠 손아귀의 손톱',
     type: 'weapon',
     stat: 90,
     tooltip: '전체 공격의 피해량 25% 증가',
     source: '푸른 항아리',
     grade: 'purple',
     media: 'weapon/어둠손아귀의손톱.webp'
   },
   {
     name: '영겁의 가지',
     type: 'weapon',
     stat: 90,
     tooltip: '치유 혹은 회복 시 회복량의 50%만큼 모든 적 고정 피해',
     source: '심판의 늪',
     grade: 'purple',
     media: 'weapon/영겁의가지.webp'
   },
   {
     name: '완전한 포르미카의 창',
     type: 'weapon',
     stat: 90,
     tooltip: '적 수만큼 피해량 7% 증가\n전체 공격의 피해량 10% 증가',
     source: '쌍성의 그림자',
     grade: 'purple',
     media: 'weapon/완전한포르미카의창.webp'
   },
   {
     name: '찬란한 영겁의 불꽃',
     type: 'weapon',
     stat: 90,
     tooltip: '비용 2 이상인 소멸 카드 피해량 40% 증가',
     source: '타오르는 생명',
     grade: 'purple',
     media: 'weapon/찬란한영겁의불꽃.webp'
   },
   {
     name: '키메르나이트',
     type: 'weapon',
     stat: 90,
     tooltip: '능력으로 드로우 시 1턴간 자신의 공격 카드 피해량 35% 증가 (턴당 1회)',
     source: '제 0 연구소',
     grade: 'purple',
     media: 'weapon/키메르나이트.webp'
   },
   {
     name: '혼돈의 지적',
     type: 'weapon',
     stat: 90,
     tooltip: '공격력 +18%\n격파 시 아군 스트레스 1 감소',
     source: '세넥투스 처치',
     grade: 'purple',
     media: 'weapon/혼돈의지적.webp'
   },
   {
     name: '혼돈의 촉수',
     type: 'weapon',
     stat: 90,
     tooltip: '아군 공격력 +8%\n처치 시 스트레스가 높은 전투원 스트레스 2 감소',
     source: '세넥투스 처치',
     grade: 'purple',
     media: 'weapon/혼세의촉수.webp'
   },
   {
     name: '갈구하는 왼손',
     type: 'weapon',
     stat: 82,
     tooltip: '충격파 상태인 대상에게 피해량 30% 증가',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/갈구하는왼손.webp'
   },
   {
     name: '계시의 나팔',
     type: 'weapon',
     stat: 82,
     tooltip: '카드로 드로우 시 1턴간 피해량 +20% (턴당 2회)',
     source: '도래된 혼돈',
     grade: 'yellow',
     media: 'weapon/계시의나팔.webp'
   },
   {
     name: '광기의 식도',
     type: 'weapon',
     stat: 82,
     tooltip: '고통 상태인 대상에게 피해량 20% 증가',
     source: [ '푸른 항아리', '쌍성의 그림자', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/광기의식도.webp'
   },
   {
     name: '교단의 지휘봉',
     type: 'weapon',
     stat: 82,
     tooltip: '카드를 생성할 때마다 1턴간 피해량 +20% (턴당 2회)',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/교단의지휘봉.webp'
   },
   {
     name: '그림자를 속인 단검',
     type: 'weapon',
     stat: 82,
     tooltip: '치명피해 +12%',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/그림자를속인단검.webp'
   },
   {
     name: '나락충의 이빨',
     type: 'weapon',
     stat: 82,
     tooltip: '치명타 시 대상에게 50% 확률로 고통 1',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/나락충의이빨.webp'
   },
   {
     name: '노래하는 검',
     type: 'weapon',
     stat: 82,
     tooltip: '공격력 +15%\n실드 보유 대상에게 피해를 줄 시 대상에게 응징 1',
     source: '도래된 혼돈',
     grade: 'yellow',
     media: 'weapon/노래하는검.webp'
   },
   {
     name: '레플리카 코어',
     type: 'weapon',
     stat: 82,
     tooltip: '능력으로 자신의 공격 카드 드로우 시 그 카드 1턴간 피해량 +50%',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/레플리카코어.webp'
   },
   {
     name: '룬 랜스',
     type: 'weapon',
     stat: 82,
     tooltip: '행동 포인트 5 이상 사용 시 피해량, 실드 획득량, 치유량 +25% (전투당 1회)',
     source: '도래된 혼돈',
     grade: 'yellow',
     media: 'weapon/룬랜스.webp'
   },
   {
     name: '먹힌 자의 꿈',
     type: 'weapon',
     stat: 82,
     tooltip: '카드 소멸 시 다음 사용하는 카드의 피해량 25% 증가 (최대 1회 중첩)',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/먹힌자의꿈.webp'
   },
   {
     name: '변이 파동 증폭기',
     type: 'weapon',
     stat: 82,
     tooltip: '상태이상, 저주 카드 드로우 시 1턴간 피해량 +12%',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/변이파동증폭기.webp'
   },
   {
     name: '변이한 발톱',
     type: 'weapon',
     stat: 82,
     tooltip: '상태이상, 저주 카드 드로우 시 1턴간 피해량 +15%',
     source: [ '푸른 항아리', '안개의 도시' ],
     grade: 'yellow',
     media: 'weapon/변이한발톱.webp'
   },
   {
     name: '변종 포식체 돌기',
     type: 'weapon',
     stat: 82,
     tooltip: '핸드의 카드가 4장 이상일 시 피해량 30% 증가',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/변종포식체돌기.webp'
   },
   {
     name: '보라 나비의 채찍',
     type: 'weapon',
     stat: 82,
     tooltip: '비용 1 이하인 공격 카드의 피해량 20% 증가',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/보라나비의채찍.webp'
   },
   {
     name: '부서진 포르미카의 창',
     type: 'weapon',
     stat: 82,
     tooltip: '적 수만큼 피해량 6% 증가',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/부서진포르미카의창.webp'
   },
   {
     name: '불발된 플라즈마 봄버',
     type: 'weapon',
     stat: 82,
     tooltip: '카드 소멸 시 무작위 적 고정 피해 40%',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/불발된플라즈마봄버.webp'
   },
   {
     name: '붉은 검',
     type: 'weapon',
     stat: 82,
     tooltip: '타게팅 공격 카드로 피해를 준 대상에게 고통 3 (턴당 1회)',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/붉은검.webp'
   },
   {
     name: '블러드 자이언트 클로',
     type: 'weapon',
     stat: 82,
     tooltip: '격파 시 대상에게 고정 피해 150%',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/블러드자이언트클로.webp'
   },
   {
     name: '비웃는 단도',
     type: 'weapon',
     stat: 82,
     tooltip: '적 처치 시 모든 적 취약 2',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/비웃는단도.webp'
   },
   {
     name: '생명의 꽃',
     type: 'weapon',
     stat: 82,
     tooltip: '최대 체력인 상태라면 피해량 +50%',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/생명의꽃.webp'
   },
   {
     name: '시산혈해',
     type: 'weapon',
     stat: 82,
     tooltip: '공격 카드의 피해량 25% 증가 (턴당 1회)',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/시산혈해.webp'
   },
   {
     name: '신목의 가지',
     type: 'weapon',
     stat: 82,
     tooltip: '치유 혹은 회복 시 치유량의 35%만큼 모든 적 고정 피해',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/신목의가지.webp'
   },
   {
     name: '악목의 가지',
     type: 'weapon',
     stat: 82,
     tooltip: '치유 혹은 회복 시 회복량의 50%만큼 무작위 적 고정 피해',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/악목의가지.webp'
   },
   {
     name: '에리식톤의 파멸',
     type: 'weapon',
     stat: 82,
     tooltip: '공격 카드 사용 시 5% 확률로 타격 1회 추가',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/에리식톤의파멸.webp'
   },
   {
     name: '자연의 적의',
     type: 'weapon',
     stat: 82,
     tooltip: '처치 시 모든 적 고정 피해 200%',
     source: [ '푸른 항아리', '안개의 도시' ],
     grade: 'yellow',
     media: 'weapon/자연의적의.webp'
   },
   {
     name: '잠의 열쇠',
     type: 'weapon',
     stat: 82,
     tooltip: '공격 카드 피해량 +40%, 공격 카드의 대상 수가 2 이상일 시 대상 수만큼 피해량 -10% (최대 -30%)',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/잠의열쇠.webp'
   },
   {
     name: '전격의 기병창',
     type: 'weapon',
     stat: 82,
     tooltip: '실드 보유 대상에게 피해를 줄 시 다음 사용하는 공격 카드의 피해량 +100%',
     source: [ '심판의 늪', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/전격의기병창.webp'
   },
   {
     name: '정화의 불꽃',
     type: 'weapon',
     stat: 82,
     tooltip: '카드 소멸 시 무작위 적에게 응징 1 (턴당 2회)',
     source: '도래된 혼돈',
     grade: 'yellow',
     media: 'weapon/정화의불꽃.webp'
   },
   {
     name: '제2의 수단',
     type: 'weapon',
     stat: 82,
     tooltip: '추가 공격 피해량 +35%',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/제2의수단.webp'
   },
   {
     name: '제례용 단도',
     type: 'weapon',
     stat: 82,
     tooltip: '적 처치 시 공격 카드의 피해량 +25% (최대 2회)',
     source: '푸른 항아리',
     grade: 'yellow',
     media: 'weapon/제례용단도.webp'
   },
   {
     name: '창백한 영겁의 불꽃',
     type: 'weapon',
     stat: 82,
     tooltip: '카드 소멸 시 1턴간 아군 피해량 10% 증가 (턴당 1회)',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/창백한영겁의불꽃.webp'
   },
   {
     name: '처형자의 칼날',
     type: 'weapon',
     stat: 82,
     tooltip: '최대 체력의 50% 이하인 대상에게 피해량 35% 증가',
     source: '푸른 항아리',
     grade: 'yellow',
     media: 'weapon/처형자의칼날.webp'
   },
   {
     name: '투쟁의 하프',
     type: 'weapon',
     stat: 82,
     tooltip: '1턴간 아군 카드로 피해, 실드, 치유 모두 발동 시 1턴간 아군 피해량 15% 증가',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/투쟁의하프.webp'
   },
   {
     name: '해를 떨어트린 활',
     type: 'weapon',
     stat: 82,
     tooltip: '비용이 2 이상인 공격 카드의 피해량 30% 증가 (턴당 1회)',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/해를떨어트린활.webp'
   },
   {
     name: '호수에 비친 검',
     type: 'weapon',
     stat: 82,
     tooltip: '핸드의 카드가 6장 이상일 시 피해량 25% 증가',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/호수에비친검.webp'
   },
   {
     name: '흐릿한 가시',
     type: 'weapon',
     stat: 82,
     tooltip: '1턴간 아군이 피해를 입히지 않았다면 다음 턴 시작 시 1턴간 피해량 50% 증가',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/흐릿한가시.webp'
   },
   {
     name: 'RFS-17',
     type: 'weapon',
     stat: 82,
     tooltip: '비용 0인 공격 카드의 치명확률 +10%',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/RFS17.webp'
   },
   {
     name: 'W-52 도파민 주입기',
     type: 'weapon',
     stat: 82,
     tooltip: '능력으로 드로우 시 1턴간 피해량 20% 증가 (턴당 2회)',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/도파민주입기.webp'
   },
   {
     name: '가스트로노미콘',
     type: 'weapon',
     stat: 74,
     tooltip: '비용 2 이상인 공격 카드 사용 시 대상에게 고통 3',
     source: '상점',
     grade: 'blue',
     media: 'weapon/가스트로노미콘.webp'
   },
   {
     name: '거물 사냥꾼',
     type: 'weapon',
     stat: 74,
     tooltip: '전투당 처음 사용하는 공격 카드의 강인도 피해 100% 증가',
     source: '상점',
     grade: 'blue',
     media: 'weapon/거물사냥꾼.webp'
   },
   {
     name: '과전류 충격기',
     type: 'weapon',
     stat: 74,
     tooltip: '능력으로 드로우 시 무작위 적 고정 피해 50%',
     source: '제 0 연구소',
     grade: 'blue',
     media: 'weapon/과전류충격기.webp'
   },
   {
     name: '꺼진 용기의 팔',
     type: 'weapon',
     stat: 74,
     tooltip: '1턴간 공격 카드 발동하지 않고 턴 종료 시 로켓 펀치 1장 생성',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/꺼진용기의팔.webp'
   },
   {
     name: '꺾인 의지의 작살통',
     type: 'weapon',
     stat: 74,
     tooltip: '홀수 턴마다 꿰뚫기 1장 생성',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/꺾인의지의작살통.webp'
   },
   {
     name: '명령: 108호',
     type: 'weapon',
     stat: 74,
     tooltip: '공격 카드의 피해량 40% 증가 (전투당 1회)',
     source: '상점',
     grade: 'blue',
     media: 'weapon/명령108호.webp'
   },
   {
     name: '무딘 뼈 칼',
     type: 'weapon',
     stat: 74,
     tooltip: '공격력 10%, 치명확률 -5%',
     source: '푸른 항아리',
     grade: 'blue',
     media: 'weapon/무딘뼈칼.webp'
   },
   {
     name: '버그 킬러',
     type: 'weapon',
     stat: 74,
     tooltip: '공격 카드 사용 시 대상에게 고통 1 (턴당 1회)\n인베이더 전투라면 고통 2 추가',
     source: '쌍성의 그림자',
     grade: 'blue',
     media: 'weapon/버그킬러.webp'
   },
   {
     name: '부러진 황금 깃펜',
     type: 'weapon',
     stat: 74,
     tooltip: '능력으로 연결 카드를 버릴 시 1턴간 피해량 20% 증가 (턴당 1회)',
     source: '허상의 극장',
     grade: 'blue',
     media: 'weapon/부러진황금깃펜.webp'
   },
   {
     name: '뼈절단기',
     type: 'weapon',
     stat: 74,
     tooltip: '약화 상태인 대상 타격 시 피해량 +30%',
     source: '상점',
     grade: 'blue',
     media: 'weapon/뼈절단기.webp'
   },
   {
     name: '섬광탄',
     type: 'weapon',
     stat: 74,
     tooltip: '전투 시작 시 무작위 적 약화 3',
     source: '상점',
     grade: 'blue',
     media: 'weapon/섬광탄.webp'
   },
   {
     name: '스틸러의 단도',
     type: 'weapon',
     stat: 74,
     tooltip: '처치 시 5~10 크레딧 획득 (전투당 1회)',
     source: '푸른 항아리',
     grade: 'blue',
     media: 'weapon/스틸러의단도.webp'
   },
   {
     name: '심판의 검',
     type: 'weapon',
     stat: 74,
     tooltip: '카드 소멸 시 1턴간 피해량 10% 증가 (턴당 1회)',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/심판의검.webp'
   },
   {
     name: '잠식된 건틀릿',
     type: 'weapon',
     stat: 74,
     tooltip: '추가 공격 시 1턴간 치명확률 2% 증가 (턴당 5회)',
     source: '허상의 극장',
     grade: 'blue',
     media: 'weapon/잠식된건틀릿.webp'
   },
   {
     name: '저문 생명의 꽃',
     type: 'weapon',
     stat: 74,
     tooltip: '최대 체력인 상태라면 피해량 +40%',
     source: '심판의 늪',
     grade: 'blue',
     media: 'weapon/저문생명의꽃.webp'
   },
   {
     name: '진노의 횃불',
     type: 'weapon',
     stat: 74,
     tooltip: '전투 시작 시 무작위 적 표식 2',
     source: '상점',
     grade: 'blue',
     media: 'weapon/진노의횃불.webp'
   },
   {
     name: '천년목',
     type: 'weapon',
     stat: 74,
     tooltip: '비용 3 이상인 카드 발동 시 무작위 적 취약 1',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/천년목.webp'
   },
   {
     name: '흑요석 검',
     type: 'weapon',
     stat: 74,
     tooltip: '피해량 12% 증가',
     source: '상점',
     grade: 'blue',
     media: 'weapon/흑요석검.webp'
   },
   {
     name: 'M85 군용 수류탄',
     type: 'weapon',
     stat: 74,
     tooltip: '강화 카드 사용 시 모든 적 고정 피해 150%',
     source: '상점',
     grade: 'blue',
     media: 'weapon/군용수류탄.webp'
   },
   {
     name: '괴이의 껍질',
     type: 'armor',
     stat: 34,
     tooltip: '스트레스 증가 시 50% 확률로 1 적게 증가',
     source: '세넥투스 처치',
     grade: 'purple',
     media: 'weapon/괴이의껍질.webp'
   },
   {
     name: '군체의 날개',
     type: 'armor',
     stat: 34,
     tooltip: '전투 시작 시 면역 2',
     source: '쌍성의 그림자',
     grade: 'purple',
     media: 'weapon/군체의날개.webp'
   },
   {
     name: '별빛 서린 망토',
     type: 'armor',
     stat: 34,
     tooltip: '받는 피해량 10% 감소 (턴당 1회)',
     source: '심판의 늪',
     grade: 'purple',
     media: 'weapon/별빛서린망토.webp'
   },
   {
     name: '불꽃의 가면',
     type: 'armor',
     stat: 34,
     tooltip: '취약 대상에게 피해량 35% 증가',
     source: '심판의 늪',
     grade: 'purple',
     media: 'weapon/불꽃의가면.webp'
   },
   {
     name: '야성의 털가죽 망토',
     type: 'armor',
     stat: 34,
     tooltip: '턴 시작 시 반격 1',
     source: '푸른 항아리',
     grade: 'purple',
     media: 'weapon/야성의털가죽망토.webp'
   },
   {
     name: '용맹의 팔찌',
     type: 'armor',
     stat: 34,
     tooltip: '아군 투기장 카드 피해량 20% 증가\n전투 시작 시 잊혀진 검 1장 생성',
     source: '타오르는 생명',
     grade: 'purple',
     media: 'weapon/용맹의팔찌.webp'
   },
   {
     name: '재앙의 성포',
     type: 'armor',
     stat: 34,
     tooltip: '모든 전투원 붕괴 회복에 필요한 카드 수 1장 감소',
     source: '세넥투스 처치',
     grade: 'purple',
     media: 'weapon/재앙의성포.webp'
   },
   {
     name: '축성된 광륜',
     type: 'armor',
     stat: 34,
     tooltip: '실드 획득량 25% 증가',
     source: '도래된 혼돈',
     grade: 'purple',
     media: 'weapon/축성된광륜.webp'
   },
   {
     name: '켄트리스 키틴 갑주',
     type: 'armor',
     stat: 34,
     tooltip: '아군 실드 획득량 15% 증가',
     source: '푸른 항아리',
     grade: 'purple',
     media: 'weapon/켄트리스키틴갑주.webp'
   },
   {
     name: '태고의 규율',
     type: 'armor',
     stat: 34,
     tooltip: '전투 시작 시 면역 2',
     source: '도래된 혼돈',
     grade: 'purple',
     media: 'weapon/태고의규율.webp'
   },
   {
     name: '텅 빈 공허의 파편',
     type: 'armor',
     stat: 34,
     tooltip: '전투 시작 시 3장까지 버리기, 그 수만큼 드로우',
     source: '안개의 도시',
     grade: 'purple',
     media: 'weapon/텅빈공허의파편.webp'
   },
   {
     name: '가녀린 쇄골',
     type: 'armor',
     stat: 31,
     tooltip: '턴 시작 시 아군 페르소나 카드가 핸드에 있다면 아군 스트레스 2 감소',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/가녀린쇄골.webp'
   },
   {
     name: '감정의 가면',
     type: 'armor',
     stat: 31,
     tooltip: '피격 시 공격자에게 공명 2 (턴당 3회)',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/감정의가면.webp'
   },
   {
     name: '강박의 사슬',
     type: 'armor',
     stat: 31,
     tooltip: '공격 카드 사용 시 체력 감소 1%, 고정 실드 60%',
     source: [ '푸른 항아리', '쌍성의 그림자', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/강박의사슬.webp'
   },
   {
     name: '강습 부츠',
     type: 'armor',
     stat: 31,
     tooltip: '2번째 턴 시작 시 고정 실드 200%',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/강습부츠.webp'
   },
   {
     name: '게걸스러운 연미복',
     type: 'armor',
     stat: 31,
     tooltip: '피해를 받은 다음 턴 시작 시 고정 실드 80%',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/게걸스러운연미복.webp'
   },
   {
     name: '고문 도구 상자',
     type: 'armor',
     stat: 31,
     tooltip: '턴 시작 시 모든 적 행동 카운트 3 증가',
     source: [ '푸른 항아리', '쌍성의 그림자', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/고문도구상자.webp'
   },
   {
     name: '구름을 걸은 구두',
     type: 'armor',
     stat: 31,
     tooltip: '아군이 격파 시 고정 실드 40%',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/구름을걸은구두.webp'
   },
   {
     name: '그릇이 될 자',
     type: 'armor',
     stat: 31,
     tooltip: '3번째 턴 시작 시 고정 실드 250%',
     source: '푸른 항아리',
     grade: 'yellow',
     media: 'weapon/그릇이될자.webp'
   },
   {
     name: '뒤틀린 규율',
     type: 'armor',
     stat: 31,
     tooltip: '행동 포인트 10 이상 사용 시 면역 2 (전투당 1회)',
     source: '도래된 혼돈',
     grade: 'yellow',
     media: 'weapon/뒤틀린규율.webp'
   },
   {
     name: '로켓 장식 망토',
     type: 'armor',
     stat: 31,
     tooltip: '전투 시작 시 피해 감소 1, 드로우 1',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/로켓장식망토.webp'
   },
   {
     name: '망각의 로브',
     type: 'armor',
     stat: 31,
     tooltip: '소멸 카드로 실드 획득 시 1턴간 피해량 20% 증가 (턴당 1회)',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/망각의로브.webp'
   },
   {
     name: '바인로드의 가면',
     type: 'armor',
     stat: 31,
     tooltip: '아군 능력으로 소멸 카드 드로우 시 고정 실드 80% (턴당 2회)',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/바인로드의가면.webp'
   },
   {
     name: '밤나비의 춤',
     type: 'armor',
     stat: 31,
     tooltip: '격파 시 고정 실드 60%',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/밤나비의춤.webp'
   },
   {
     name: '보강형 전투 강화복',
     type: 'armor',
     stat: 31,
     tooltip: '턴 종료 시 실드가 없다면 고정 실드 60%',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/보강형전투강화복.webp'
   },
   {
     name: '불멸의 비늘',
     type: 'armor',
     stat: 31,
     tooltip: '능력으로 반격 획득 시 반격 1 추가',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/불멸의비늘.webp'
   },
   {
     name: '빛의 날개',
     type: 'armor',
     stat: 31,
     tooltip: '에고 포인트 3 이하라면 치명타 시 에고 포인트 0.2 획득',
     source: [ '심판의 늪', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/빛의날개.webp'
   },
   {
     name: '사이오닉 전투 강화복',
     type: 'armor',
     stat: 31,
     tooltip: '카드 소멸 시 고정 실드 30%',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/사이오닉전투강화복.webp'
   },
   {
     name: '승자의 월계관',
     type: 'armor',
     stat: 31,
     tooltip: '반격 피해량 40% 증가',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/승자의월계관.webp'
   },
   {
     name: '식물형 의체',
     type: 'armor',
     stat: 31,
     tooltip: '실드 획득 시 1턴간 다음 발동하는 공격 카드 1장의 피해량 20% 증가 (턴당 2회)',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/식물형의체.webp'
   },
   {
     name: '악몽의 머리핀',
     type: 'armor',
     stat: 31,
     tooltip: '단일 공격 카드 사용 시 대상의 행동 포인트 2 증가 (턴당 1회)',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/악몽의머리핀.webp'
   },
   {
     name: '요정왕의 관',
     type: 'armor',
     stat: 31,
     tooltip: '치명확률 +6%',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/요정왕의관.webp'
   },
   {
     name: '울브즈 베인의 등뼈',
     type: 'armor',
     stat: 31,
     tooltip: '치명타 시 고정 실드 10%',
     source: [ '푸른 항아리', '안개의 도시' ],
     grade: 'yellow',
     media: 'weapon/울브즈베인의등뼈.webp'
   },
   {
     name: '으깨진 천사의 날개깃',
     type: 'armor',
     stat: 31,
     tooltip: '아군의 연결 카드 사용 시, 모든 적 행동 카운트 2 증가 (턴당 1회)',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/으깨진천사의날개깃.webp'
   },
   {
     name: '이해할 수 없는 성물',
     type: 'armor',
     stat: 31,
     tooltip: '능력으로 안식 카드를 버릴 때마다 고정 실드 80% (턴당 2회)',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/이해할수없는성물.webp'
   },
   {
     name: '자라나는 갑각',
     type: 'armor',
     stat: 31,
     tooltip: '턴 시작 시 고정 실드 40%',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/자라나는갑각.webp'
   },
   {
     name: '자유의 날개',
     type: 'armor',
     stat: 31,
     tooltip: '피격 시 피해량 10% 증가 (최대 3회 중첩)',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/자유의날개.webp'
   },
   {
     name: '재생형 늑골',
     type: 'armor',
     stat: 31,
     tooltip: '최대 체력 +12%',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/재생형늑골.webp'
   },
   {
     name: '저주 받은 인형',
     type: 'armor',
     stat: 31,
     tooltip: '턴 시작 시 핸드의 상태이상, 저주 카드 수만큼 치유 60%',
     source: [ '푸른 항아리', '쌍성의 그림자', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/저주받은인형.webp'
   },
   {
     name: '주시하는 방패',
     type: 'armor',
     stat: 31,
     tooltip: '피해를 받을 시 공격자에게 표식 1',
     source: [ '푸른 항아리', '안개의 도시' ],
     grade: 'yellow',
     media: 'weapon/주시하는방패.webp'
   },
   {
     name: '천사의 고리',
     type: 'armor',
     stat: 31,
     tooltip: '강화 카드 사용 시 1턴간 피해량 +30%',
     source: [ '심판의 늪', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/천사의고리.webp'
   },
   {
     name: 'M.S.S 스코프',
     type: 'armor',
     stat: 31,
     tooltip: '1턴간 해로운 효과를 부여했다면 턴 종료 시 고정 실드 80%',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/스코프.webp'
   },
   {
     name: '강습 건틀렛',
     type: 'armor',
     stat: 28,
     tooltip: '전투 시작 시 반격 3',
     source: '상점',
     grade: 'blue',
     media: 'weapon/강습건틀렛.webp'
   },
   {
     name: '검투사의 헬멧',
     type: 'armor',
     stat: 28,
     tooltip: '전투 시작 시 피해 감소 2',
     source: '상점',
     grade: 'blue',
     media: 'weapon/검투사의헬멧.webp'
   },
   {
     name: '결사의 권갑',
     type: 'armor',
     stat: 28,
     tooltip: '카오스 교단 전투 시작 시 피해량 +20%, 피해 감소 1',
     source: '푸른 항아리',
     grade: 'blue',
     media: 'weapon/결사의권갑.webp'
   },
   {
     name: '뇌파 차단 헬멧',
     type: 'armor',
     stat: 28,
     tooltip: '능력으로 드로우 시 고정 실드 40%',
     source: '제 0 연구소',
     grade: 'blue',
     media: 'weapon/뇌파차단헬멧.webp'
   },
   {
     name: '덩굴 위장막',
     type: 'armor',
     stat: 28,
     tooltip: '턴 시작 시 체력이 30% 이하면 회피 1 (전투당 2회)',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/덩굴위장막.webp'
   },
   {
     name: '마음의 망토',
     type: 'armor',
     stat: 28,
     tooltip: '아군이 능력으로 카드를 버릴 시 피해 감소 1 (턴당 1회)',
     source: '허상의 극장',
     grade: 'blue',
     media: 'weapon/마음의망토.webp'
   },
   {
     name: '무성한 해초 갑옷',
     type: 'armor',
     stat: 28,
     tooltip: '실드 획득 시 고정 실드 30%',
     source: '상점',
     grade: 'blue',
     media: 'weapon/무성한해초갑옷.webp'
   },
   {
     name: '불완전 갑각',
     type: 'armor',
     stat: 28,
     tooltip: '턴 종료 시 핸드의 카드 3장 이상이라면 고정 실드 140%',
     source: '제 0 연구소',
     grade: 'blue',
     media: 'weapon/불완전갑각.webp'
   },
   {
     name: '빛나는 리라',
     type: 'armor',
     stat: 28,
     tooltip: '턴 시작 시 아군 소멸 카드가 핸드에 있다면 고정 실드 60%',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/빛나는리라.webp'
   },
   {
     name: '빛바랜 희생의 방패',
     type: 'armor',
     stat: 28,
     tooltip: '피해를 완전히 막으면 다음 턴 시작 시 방패 폭발 1장 생성',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/빛바랜희생의방패.webp'
   },
   {
     name: '생존자의 후드',
     type: 'armor',
     stat: 28,
     tooltip: '전투 시작 시 고정 실드 140%',
     source: '상점',
     grade: 'blue',
     media: 'weapon/생존자의후드.webp'
   },
   {
     name: '악령의 가면',
     type: 'armor',
     stat: 28,
     tooltip: '피해를 받은 다음 턴 시작 시 고정 실드 60%',
     source: '심판의 늪',
     grade: 'blue',
     media: 'weapon/악령의가면.webp'
   },
   {
     name: '오염된 헬멧',
     type: 'armor',
     stat: 28,
     tooltip: '최대 체력 +6%, 방어력 +12%',
     source: '안개의 도시',
     grade: 'blue',
     media: 'weapon/오염된헬멧.webp'
   },
   {
     name: '이끼 갑옷',
     type: 'armor',
     stat: 28,
     tooltip: '1턴간 아군 공격 카드 발동하지 않고 턴 종료 시 고정 실드 100%',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/이끼갑옷.webp'
   },
   {
     name: '척후병의 군화',
     type: 'armor',
     stat: 28,
     tooltip: '처치 시 고정 실드 60%',
     source: '상점',
     grade: 'blue',
     media: 'weapon/척후병의군화.webp'
   },
   {
     name: '타이탄 전투 강화복',
     type: 'armor',
     stat: 28,
     tooltip: '피해를 받을 시 최대 체력의 2% 회복 (턴당 1회)',
     source: '상점',
     grade: 'blue',
     media: 'weapon/타이탄전투강화복.webp'
   },
   {
     name: '표준형 방독면',
     type: 'armor',
     stat: 28,
     tooltip: '전투 시작 시 면역 1',
     source: '상점',
     grade: 'blue',
     media: 'weapon/표준형방독면.webp'
   },
   {
     name: '플루이더의 갑각',
     type: 'armor',
     stat: 28,
     tooltip: '피해를 받은 다음 턴 시작 시 고정 실드 60%',
     source: '쌍성의 그림자',
     grade: 'blue',
     media: 'weapon/플루이더의갑각.webp'
   },
   {
     name: '고동치는 알',
     type: 'accessory',
     stat: 91,
     tooltip: '공격력 +15%, 최대 체력 +10%',
     source: '쌍성의 그림자',
     grade: 'purple',
     media: 'weapon/고동치는알.webp'
   },
   {
     name: '글루미 프라임의 눈',
     type: 'accessory',
     stat: 91,
     tooltip: '실드 획득량 +40%',
     source: '푸른 항아리',
     grade: 'purple',
     media: 'weapon/글루미프라임의눈.webp'
   },
   {
     name: '금지된 성서',
     type: 'accessory',
     stat: 91,
     tooltip: '4번째 턴 시작 시 모든 적 고정 피해 550%',
     source: '푸른 항아리',
     grade: 'purple',
     media: 'weapon/금지된성서.webp'
   },
   {
     name: '난수의 구체',
     type: 'accessory',
     stat: 91,
     tooltip: '전투 시작 시 행동 포인트 1 획득, 드로우 1',
     source: '세넥투스 처치',
     grade: 'purple',
     media: 'weapon/난수의구체.webp'
   },
   {
     name: '동면하는 씨앗',
     type: 'accessory',
     stat: 91,
     tooltip: '실드 획득 시 고정 실드 100% (턴당 1회)',
     source: '심판의 늪',
     grade: 'purple',
     media: 'weapon/동면하는씨앗.webp'
   },
   {
     name: '벽화에서 뜯어낸 눈동자',
     type: 'accessory',
     stat: 91,
     tooltip: '턴 시작 시핸드의 아군 페르소나 카드 수만큼 1턴간 자신의 피해량 20% 증가',
     source: '허상의 극장',
     grade: 'purple',
     media: 'weapon/벽화에서뜯어낸눈동자.webp'
   },
   {
     name: '심록의 굴레',
     type: 'accessory',
     stat: 91,
     tooltip: '공격력 +12%, 방어력 +12%',
     source: '심판의 늪',
     grade: 'purple',
     media: 'weapon/심록의굴레.webp'
   },
   {
     name: '징벌자의 눈',
     type: 'accessory',
     stat: 91,
     tooltip: '적이 혼자라면 피해량 30% 증가',
     source: '도래된 혼돈',
     grade: 'purple',
     media: 'weapon/징벌자의눈.webp'
   },
   {
     name: '착란의 다이스',
     type: 'accessory',
     stat: 91,
     tooltip: '전투 종료 시 체력이 50% 미만이라면 최대 체력의 8% 회복, 전투 종료 시 체력이 50% 이상이라면 스트레스가 높은 전투원 스트레스 5 감소',
     source: '세넥투스 처치',
     grade: 'purple',
     media: 'weapon/착란의다이스.webp'
   },
   {
     name: '타락 코어',
     type: 'accessory',
     stat: 91,
     tooltip: '방어력 +15%, 실드 20% 보존',
     source: '도래된 혼돈',
     grade: 'purple',
     media: 'weapon/타락코어.webp'
   },
   {
     name: '탐식의 눈',
     type: 'accessory',
     stat: 91,
     tooltip: '피해량 +40%, 턴 종료 시 30% 확률로 핸드의 카드 1장 소멸',
     source: '안개의 도시',
     grade: 'purple',
     media: 'weapon/탐식의눈.webp'
   },
   {
     name: '해방된 정수',
     type: 'accessory',
     stat: 91,
     tooltip: '턴 시작 시 핸드의 무작위 소멸 카드 1장 1턴간 비용 감소 1',
     source: '타오르는 생명',
     grade: 'purple',
     media: 'weapon/해방된정수.webp'
   },
   {
     name: '허무의 계시록',
     type: 'accessory',
     stat: 91,
     tooltip: '공격 카드 사용 시 고정 실드 20% (턴당 10회)',
     source: '안개의 도시',
     grade: 'purple',
     media: 'weapon/허무의계시록.webp'
   },
   {
     name: '혼돈의 주사위',
     type: 'accessory',
     stat: 91,
     tooltip: '턴 종료 시 무작위 적들에게 고정 피해 40% × 2 ~ 6, 아군에게 고정 피해 200% 중 무작위 1개의 효과 발동',
     source: [ '푸른 항아리', '쌍성의 그림자', '허상의 극장' ],
     grade: 'purple',
     media: 'weapon/혼돈의주사위.webp'
   },
   {
     name: '검투사의 증표',
     type: 'accessory',
     stat: 83,
     tooltip: '카드로 실드 3회 획득 시 모든 적 고정 피해 100%',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/검투사의증표.webp'
   },
   {
     name: '격노 물약',
     type: 'accessory',
     stat: 83,
     tooltip: '공격 카드 4회 발동 시 다음 발동하는 공격 카드 피해량 40% 증가',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/격노물약.webp'
   },
   {
     name: '고대 영혼의 부름',
     type: 'accessory',
     stat: 83,
     tooltip: '치명타 시 치유 10%',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/고대영혼의부름.webp'
   },
   {
     name: '교단의 증표',
     type: 'accessory',
     stat: 83,
     tooltip: '카오스 교단 전투 시 방어력 +15%',
     source: '푸른 항아리',
     grade: 'yellow',
     media: 'weapon/교단의증표.webp'
   },
   {
     name: '그레이 구',
     type: 'accessory',
     stat: 83,
     tooltip: '전투 시작 시 피해 감소 3',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/그레이구.webp'
   },
   {
     name: '금기의 근원',
     type: 'accessory',
     stat: 83,
     tooltip: '피격 시 공격자에게 취약, 약화, 손상 중 무작위 1개 부여 (턴당 3회)',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/금기의근원.webp'
   },
   {
     name: '꺼져서는 안 되는 등불',
     type: 'accessory',
     stat: 83,
     tooltip: '실드 보유하고 턴 시작 시 고정 실드 80%',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/꺼져서는안되는등불.webp'
   },
   {
     name: '납빛 성수',
     type: 'accessory',
     stat: 83,
     tooltip: '격파 시 대상에게 손상 2',
     source: [ '심판의 늪', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/납빛성수.webp'
   },
   {
     name: '눈 없는 것들의 눈동자',
     type: 'accessory',
     stat: 83,
     tooltip: '기본 공격 카드의 피해량 40% 증가',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/눈없는것들의눈동자.webp'
   },
   {
     name: '들불 품은 뼈 가락지',
     type: 'accessory',
     stat: 83,
     tooltip: '강화 카드 사용 시 1턴간 피해량 +30%',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/들불품은뼈가락지.webp'
   },
   {
     name: '레피돌라의 날개',
     type: 'accessory',
     stat: 83,
     tooltip: '전투 시작 시 회피 1',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/레피돌라의날개.webp'
   },
   {
     name: '망혼의 꽃',
     type: 'accessory',
     stat: 83,
     tooltip: '턴마다 두 번째 공격 카드부터 피해량 20% 증가',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/망혼의꽃.webp'
   },
   {
     name: '미치광이의 예술작품',
     type: 'accessory',
     stat: 83,
     tooltip: '엘리트 전투 시작 시 피해량 +50%',
     source: '푸른 항아리',
     grade: 'yellow',
     media: 'weapon/미치광이의예술작품.webp'
   },
   {
     name: '미확인 회복 앰플',
     type: 'accessory',
     stat: 83,
     tooltip: '아군이 금기 카드 사용 시 최대 체력의 3% 회복, 고정 실드 80%',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/미확인회복앰플.webp'
   },
   {
     name: '발광 버섯',
     type: 'accessory',
     stat: 83,
     tooltip: '6번째 생성된 공격 카드 1턴간 포자증식 효과 2배',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/발광버섯.webp'
   },
   {
     name: '보석의 심장',
     type: 'accessory',
     stat: 83,
     tooltip: 'X 가 X+1 로 적용',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/보석의심장.webp'
   },
   {
     name: '붉은 혈석',
     type: 'accessory',
     stat: 83,
     tooltip: '공격 카드 사용 시 준 피해량의 9% 만큼 회복 (턴당 1회)',
     source: '푸른 항아리',
     grade: 'yellow',
     media: 'weapon/붉은혈석.webp'
   },
   {
     name: '비아데우스 원자로',
     type: 'accessory',
     stat: 83,
     tooltip: '강화 카드 사용 시 피해 감소 1',
     source: [ '심판의 늪', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/비아데우스원자로.webp'
   },
   {
     name: '빛나는 세계수의 줄기',
     type: 'accessory',
     stat: 83,
     tooltip: '치유량 25% 증가',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/빛나는세계수의줄기.webp'
   },
   {
     name: '선천적 포식자',
     type: 'accessory',
     stat: 83,
     tooltip: '격파 시 다음 사용하는 공격 카드 1장의 피해량 +100%',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/선천적포식자.webp'
   },
   {
     name: '성가를 부르는 입술',
     type: 'accessory',
     stat: 83,
     tooltip: '능력으로 카드를 버릴 시, 모든 적 공명 1 (턴당 3회)',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/성가를부르는입술.webp'
   },
   {
     name: '세계수의 잎',
     type: 'accessory',
     stat: 83,
     tooltip: '비용 2 이상의 카드 3장 사용 시 저장 1',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/세계수의잎.webp'
   },
   {
     name: '수호 코어',
     type: 'accessory',
     stat: 83,
     tooltip: '행동 예고가 공격인 적이 있을 시 고정 실드 60% (턴당 1회)',
     source: '도래된 혼돈',
     grade: 'yellow',
     media: 'weapon/수호코어.webp'
   },
   {
     name: '심록의 낮',
     type: 'accessory',
     stat: 83,
     tooltip: '홀수 턴에 공격력 +8%, 방어력 +12%',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/심록의낮.webp'
   },
   {
     name: '심록의 밤',
     type: 'accessory',
     stat: 83,
     tooltip: '짝수 턴에 공격력 +12%, 방어력 +8%',
     source: '심판의 늪',
     grade: 'yellow',
     media: 'weapon/심록의밤.webp'
   },
   {
     name: '양자 포집기',
     type: 'accessory',
     stat: 83,
     tooltip: '아군이 강화 카드 사용 시 1턴간 피해량, 실드 획득량, 치유량 20% 증가',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/양자포집기.webp'
   },
   {
     name: '여신의 물방울',
     type: 'accessory',
     stat: 83,
     tooltip: '전투 시작 시 저장 1',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/여신의물방울.webp'
   },
   {
     name: '우수 개체의 증표',
     type: 'accessory',
     stat: 83,
     tooltip: '피해량 +30%\n받는 스트레스 0 으로 변경 (전투당 1회)',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/우수개체의증표.webp'
   },
   {
     name: '이단의 비석',
     type: 'accessory',
     stat: 83,
     tooltip: '아군이 능력으로 카드를 3장 버릴 때마다 무작위 적 취약, 표식 중 무작위 1개 부여 (턴당 5회)',
     source: '허상의 극장',
     grade: 'yellow',
     media: 'weapon/이단의비석.webp'
   },
   {
     name: '자연의 선물',
     type: 'accessory',
     stat: 83,
     tooltip: '턴 종료 시 치유 40%',
     source: [ '푸른 항아리', '안개의 도시' ],
     grade: 'yellow',
     media: 'weapon/자연의선물.webp'
   },
   {
     name: '전투용 북',
     type: 'accessory',
     stat: 83,
     tooltip: '스킬 카드 5장 생성 시 다음 발동하는 아군 카드 피해량 20% 증가 (최대 1 중첩)',
     source: '타오르는 생명',
     grade: 'yellow',
     media: 'weapon/전투용북.webp'
   },
   {
     name: '차원의 큐브',
     type: 'accessory',
     stat: 83,
     tooltip: '카드를 버릴 시 1턴간 피해량 +15% (최대 3 중첩)',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/차원의큐브.webp'
   },
   {
     name: '초전도 단백질',
     type: 'accessory',
     stat: 83,
     tooltip: '전투 시작 시 핸드의 카드 1장 1턴간 비용 0 으로 변경',
     source: '제 0 연구소',
     grade: 'yellow',
     media: 'weapon/초전도단백질.webp'
   },
   {
     name: '침식 코어',
     type: 'accessory',
     stat: 83,
     tooltip: '공격을 실드로 완벽하게 막으면 모든 적 손상 1 (턴당 1회)',
     source: '도래된 혼돈',
     grade: 'yellow',
     media: 'weapon/침식코어.webp'
   },
   {
     name: '카오스 성서',
     type: 'accessory',
     stat: 83,
     tooltip: '4번째 턴 시작 시 모든 적 고정 피해 400%',
     source: '푸른 항아리',
     grade: 'yellow',
     media: 'weapon/카오스성서.webp'
   },
   {
     name: '키락의 핵',
     type: 'accessory',
     stat: 83,
     tooltip: '턴 시작 시 최대 체력의 40% 미만이면 최대 체력의 5% 회복',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/키락의핵.webp'
   },
   {
     name: '파괴의 달',
     type: 'accessory',
     stat: 83,
     tooltip: '전투 시작 시 모든 적 고정 피해 200%',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/파괴의달.webp'
   },
   {
     name: '팔라시아의 구슬',
     type: 'accessory',
     stat: 83,
     tooltip: '카드로 취약 부여 시 대상에게 약화 1',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/팔라시아의구슬.webp'
   },
   {
     name: '포식하는 군체',
     type: 'accessory',
     stat: 83,
     tooltip: '피해를 받을 시 공격자에게 고통 4',
     source: '쌍성의 그림자',
     grade: 'yellow',
     media: 'weapon/포식하는군체.webp'
   },
   {
     name: '풍화하지 않는 돌',
     type: 'accessory',
     stat: 83,
     tooltip: '턴 시작 시 적 수만큼 고정 실드 25%',
     source: [ '푸른 항아리', '안개의 도시' ],
     grade: 'yellow',
     media: 'weapon/풍화하지않는돌.webp'
   },
   {
     name: '피 묻은 펜던트',
     type: 'accessory',
     stat: 83,
     tooltip: '복제됨 카드 사용 시 1턴간 모든 적의 행동 카운트 감소하지 않음 (전투당 1회)',
     source: [ '푸른 항아리', '쌍성의 그림자', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/피묻은펜던트.webp'
   },
   {
     name: '황금 심장',
     type: 'accessory',
     stat: 83,
     tooltip: '전투 종료 시 체력이 50% 이하라면 최대 체력의 8% 회복',
     source: '상점',
     grade: 'yellow',
     media: 'weapon/황금심장.webp'
   },
   {
     name: '황금률',
     type: 'accessory',
     stat: 83,
     tooltip: '피해량 +20%, 실드 획득량 +20%',
     source: [ '심판의 늪', '도래된 혼돈', '허상의 극장' ],
     grade: 'yellow',
     media: 'weapon/황금률.webp'
   },
   {
     name: 'M.S.S 데이터 패드 SE',
     type: 'accessory',
     stat: 83,
     tooltip: '니힐럼 전투 시작 시 모든 적 취약 3',
     source: '안개의 도시',
     grade: 'yellow',
     media: 'weapon/데이터패드.webp'
   },
   {
     name: '공허한 혈석',
     type: 'accessory',
     stat: 75,
     tooltip: '공격 카드 사용 시 준 피해량의 6% 만큼 회복 (턴당 1회)',
     source: '푸른 항아리',
     grade: 'blue',
     media: 'weapon/공허한혈석.webp'
   },
   {
     name: '과잉 면역 호르몬',
     type: 'accessory',
     stat: 75,
     tooltip: '능력으로 드로우 시 1턴간 실드 획득량 +25% (턴당 2회)',
     source: '제 0 연구소',
     grade: 'blue',
     media: 'weapon/과잉면역호르몬.webp'
   },
   {
     name: '관리자 신분증',
     type: 'accessory',
     stat: 75,
     tooltip: '전투 시작 시 회피 1',
     source: '제 0 연구소',
     grade: 'blue',
     media: 'weapon/관리자신분증.webp'
   },
   {
     name: '구급 키트',
     type: 'accessory',
     stat: 75,
     tooltip: '전투 종료 시 최대 체력의 5% 회복',
     source: '쌍성의 그림자',
     grade: 'blue',
     media: 'weapon/구급키트.webp'
   },
   {
     name: '금빛 종',
     type: 'accessory',
     stat: 75,
     tooltip: '전투 시작 시 무작위 아군 스트레스 3 감소',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/금빛종.webp'
   },
   {
     name: '낡은 영광 충전기',
     type: 'accessory',
     stat: 75,
     tooltip: '행동 포인트 1 이상인 채로 턴 종료하면 다음 턴 시작 시 충전된 일격 1장 생성',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/낡은영광충전기.webp'
   },
   {
     name: '누군가의 편지',
     type: 'accessory',
     stat: 75,
     tooltip: '턴 종료 시 아군 페르소나 카드가 핸드에 있다면 무작위 적 고정 피해 150%',
     source: '허상의 극장',
     grade: 'blue',
     media: 'weapon/누군가의편지.webp'
   },
   {
     name: '다면 평행우주 연결체',
     type: 'accessory',
     stat: 75,
     tooltip: '턴 시작 시 핸드의 무작위 주도 카드 1장 발동',
     source: '상점',
     grade: 'blue',
     media: 'weapon/다면평행우주연결체.webp'
   },
   {
     name: '룬 코드',
     type: 'accessory',
     stat: 75,
     tooltip: '턴 종료 시 보존된 카드가 있다면 고정 실드 60%',
     source: '도래된 혼돈',
     grade: 'blue',
     media: 'weapon/룬코드.webp'
   },
   {
     name: '마력이 담긴 사파이어',
     type: 'accessory',
     stat: 75,
     tooltip: '전투 시작 시 개전 카드가 핸드에 있다면 모든 적 강인도 피해 1',
     source: '상점',
     grade: 'blue',
     media: 'weapon/마력이담긴사파이어.webp'
   },
   {
     name: '무너진 명예 발사기',
     type: 'accessory',
     stat: 75,
     tooltip: '짝수 턴마다 묵직한 타격 1장 생성',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/무너진명예발사기.webp'
   },
   {
     name: '밀렵꾼의 패스파인더',
     type: 'accessory',
     stat: 75,
     tooltip: '세크레드 전투 시 피해량 +25%, 모든 적 취약 2',
     source: '심판의 늪',
     grade: 'blue',
     media: 'weapon/밀렵꾼의패스파인더.webp'
   },
   {
     name: '비명의 복음서',
     type: 'accessory',
     stat: 75,
     tooltip: '적들의 행동 카운트 증가 시 1턴간 피해량 +30% (턴당 1회)',
     source: '허상의 극장',
     grade: 'blue',
     media: 'weapon/비명의복음서.webp'
   },
   {
     name: '비정형 큐브',
     type: 'accessory',
     stat: 75,
     tooltip: '피해량 +25%',
     source: '상점',
     grade: 'blue',
     media: 'weapon/비정형큐브.webp'
   },
   {
     name: '빛을 잃은 줄기',
     type: 'accessory',
     stat: 75,
     tooltip: '치유량 15% 증가',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/빛을잃은줄기.webp'
   },
   {
     name: '소환된 빛덩어리',
     type: 'accessory',
     stat: 75,
     tooltip: '3번째 생성된 공격 카드 1턴간 피해량 30% 증가',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/소환된빛덩어리.webp'
   },
   {
     name: '숲의 클로버',
     type: 'accessory',
     stat: 75,
     tooltip: '카드로 회복 시 1턴간 아군 공격력 +10% (최대 1회 중첩)',
     source: '심판의 늪',
     grade: 'blue',
     media: 'weapon/숲의클로버.webp'
   },
   {
     name: '시간조율기',
     type: 'accessory',
     stat: 75,
     tooltip: '장착한 전투원 번뜩임 발동',
     source: '상점',
     grade: 'blue',
     media: 'weapon/시간조율기.webp'
   },
   {
     name: '식물 인형',
     type: 'accessory',
     stat: 75,
     tooltip: '스킬 카드 4장 소멸 시 무작위 아군 스트레스 1 감소',
     source: '타오르는 생명',
     grade: 'blue',
     media: 'weapon/식물인형.webp'
   },
   {
     name: '신경 해킹 모듈',
     type: 'accessory',
     stat: 75,
     tooltip: '아군이 금기 카드 사용 시 피해량 +20%, 실드 획득량 +20% (전투당 2회)',
     source: '제 0 연구소',
     grade: 'blue',
     media: 'weapon/신경해킹모듈.webp'
   },
   {
     name: '입교의 증표',
     type: 'accessory',
     stat: 75,
     tooltip: '카오스 교단 전투 시 방어력 +10%',
     source: '푸른 항아리',
     grade: 'blue',
     media: 'weapon/입교의증표.webp'
   },
   {
     name: '절대영도의 사면체',
     type: 'accessory',
     stat: 75,
     tooltip: '전투 시작 시 실드 획득량 +20%',
     source: '상점',
     grade: 'blue',
     media: 'weapon/절대영도의사면체.webp'
   },
   {
     name: '짝을 잃은 결혼 반지',
     type: 'accessory',
     stat: 75,
     tooltip: '턴 시작 시 핸드의 무작위 아군 안식 카드 1장 버리기',
     source: '허상의 극장',
     grade: 'blue',
     media: 'weapon/짝을잃은결혼반지.webp'
   },
   {
     name: '허기진 자의 배',
     type: 'accessory',
     stat: 75,
     tooltip: '카드 소멸 시 피해량 +25%, 최대 체력의 5% 회복 (전투당 1회)',
     source: '안개의 도시',
     grade: 'blue',
     media: 'weapon/허기진자의배.webp'
   },
   {
     name: '혼의 구슬',
     type: 'accessory',
     stat: 75,
     tooltip: '카드 소멸 시 모든 적 강인도 피해 1 (전투당 1회)',
     source: '안개의 도시',
     grade: 'blue',
     media: 'weapon/혼의구슬.webp'
   },
   {
     name: 'M.S.S 데이터 패드',
     type: 'accessory',
     stat: 75,
     tooltip: '니힐럼 전투 시작 시 모든 적 취약 2',
     source: '안개의 도시',
     grade: 'blue',
     media: 'weapon/데이터패드2.webp'
   },
];
