// ============================================================
// 덱 빌딩 게시판 게시물 파일 (1개 파일 = 게시물 1개)
// 글쓰기 화면에서 작성한 내용이 자동 저장된 파일입니다.
// view/like/comment 숫자는 필요하면 직접 수정해도 됩니다.
// ============================================================

window.DECKBUILDER_POSTS = window.DECKBUILDER_POSTS || [];
window.DECKBUILDER_POSTS.push({
  id: "20260815_72452",
  title: "페이 + 레노아 덱 / 무난하게 굴리기 좋은",
  content: ".",
  agentIds: ["pei","renoa","veronica"],
  rows: [
    {
      agentId: "pei",
      cards: [{"key":"a:구마의 형세","name":"구마의 형세","cost":1,"type":"upgrade","grade":"blue","media":"../../cards/페이/blue1.webp","tooltip":"[ 개전 / 유일 ]\n능력으로 드로우 시 강림 1\n뽑을 카드에 \"염무곡\" 8장 생성","egoAttr":"void","source":"agent","plusCard":"염무곡","agentId":"pei","job":null,"fixedAwaken":{"cost":1,"type":"upgrade","tooltip":"[ 개전 / 유일 ]\n능력으로 드로우 시 강림 1\n뽑을 카드에 \"염무곡\" \\7\\장 생성\n|염무 발동 시 대상에게 추가 공격 100%|","plusCard":"염무곡"},"commonAwaken":null,"newAwaken":{"tooltip":"자신의 카드 드로우 1","origIdx":12},"personaSlot1":null,"personaSlot2":null},{"key":"a:독무","name":"독무","cost":0,"type":"skill","grade":"blue","media":"../../cards/페이/blue2.webp","tooltip":"드로우 2\n드로우한 카드 중 비용이 1 이상인 카드 모두 버리기","egoAttr":"void","source":"agent","agentId":"pei","job":null,"fixedAwaken":{"cost":0,"type":"skill","tooltip":"드로우 \\1\\\n|비용이 2 이하인 자신의 카드 드로우 시 그 카드 발동하고 드로우 2|","plusCard":null},"commonAwaken":null,"newAwaken":{"tooltip":"행동 포인트 1 획득","origIdx":8},"personaSlot1":null,"personaSlot2":null},{"key":"a:독무","name":"독무","cost":0,"type":"skill","grade":"blue","media":"../../cards/페이/blue2.webp","tooltip":"드로우 2\n드로우한 카드 중 비용이 1 이상인 카드 모두 버리기","egoAttr":"void","source":"agent","agentId":"pei","job":null,"fixedAwaken":{"cost":0,"type":"skill","tooltip":"[ 복제됨 ]\n드로우 \\1\\\n|비용이 2 이하인 자신의 카드 드로우 시 그 카드 발동하고 드로우 2|","plusCard":null},"commonAwaken":null,"newAwaken":{"tooltip":"행동 포인트 1 획득","origIdx":8},"personaSlot1":null,"personaSlot2":null,"isDuplicate":true},{"key":"a:독무","name":"독무","cost":0,"type":"skill","grade":"blue","media":"../../cards/페이/blue2.webp","tooltip":"드로우 2\n드로우한 카드 중 비용이 1 이상인 카드 모두 버리기","egoAttr":"void","source":"agent","agentId":"pei","job":null,"fixedAwaken":{"cost":0,"type":"skill","tooltip":"[ 복제됨 ]\n드로우 \\1\\\n|비용이 2 이하인 자신의 카드 드로우 시 그 카드 발동하고 드로우 2|","plusCard":null},"commonAwaken":null,"newAwaken":{"tooltip":"행동 포인트 1 획득","origIdx":8},"personaSlot1":null,"personaSlot2":null,"isDuplicate":true},{"key":"a:밤새 내리는 비","name":"밤새 내리는 비","cost":0,"type":"skill","grade":"blue","media":"../../cards/페이/blue3.webp","tooltip":"염무 1\n연속 : \"염무곡\" 1장 드로우","egoAttr":"void","source":"agent","plusCard":"염무곡","agentId":"pei","job":null,"fixedAwaken":{"cost":0,"type":"skill","tooltip":"염무 1\n연속 : |다음 X를 X+2로 적용|","plusCard":null},"commonAwaken":null,"newAwaken":{"tooltip":"자신의 카드 드로우 1","origIdx":12},"personaSlot1":null,"personaSlot2":null},{"key":"a:혼염무","name":"혼염무","cost":"X","type":"attack","grade":"yellow","media":"../../cards/페이/yellow.webp","tooltip":"피해 100% × X+1\n드로우 X","egoAttr":"void","source":"agent","agentId":"pei","job":null,"fixedAwaken":{"cost":"X","type":"skill","tooltip":"드로우 X\n|염무 X × 2|\n|강림 X|","plusCard":null},"commonAwaken":null,"newAwaken":{"tooltip":"행동 포인트 1 획득","origIdx":8},"personaSlot1":null,"personaSlot2":null}],
      partnerId: "ruixiang",
      equipment: {"weapon":{"name":"레플리카 코어","refine":null,"hammer":null,"imprint":null},"armor":{"name":"뇌파 차단 헬멧","refine":null,"hammer":null,"imprint":null},"accessory":{"name":"보석의 심장","refine":null,"hammer":null,"imprint":null}},
      removePt: 80,
      duplicatePt: 40,
      removeCount: 4,
      duplicateCount: 3
    },
    {
      agentId: "renoa",
      cards: [{"key":"a:비탄의 메아리","name":"비탄의 메아리","cost":1,"type":"attack","grade":"blue","media":"../../cards/레노아/blue1.webp","tooltip":"피해 140%\n\"진혼의 탄환\" 1장 생성","egoAttr":"void","source":"agent","plusCard":"진혼의 탄환","agentId":"renoa","job":null,"fixedAwaken":{"cost":1,"type":"skill","tooltip":"\"진혼의 탄환\" |3|장 생성","plusCard":"진혼의 탄환"},"commonAwaken":null,"newAwaken":{"tooltip":"이 카드의 비용 1 감소","origIdx":9},"personaSlot1":null,"personaSlot2":null},{"key":"a:칠흑의 송시","name":"칠흑의 송시","cost":1,"type":"attack","grade":"blue","media":"../../cards/레노아/blue3.webp","tooltip":"피해 50% × 3\n핸드의 \"진혼의 탄환\" 수만큼 피해량 +20%","egoAttr":"void","source":"agent","plusCard":"진혼의 탄환","agentId":"renoa","job":null,"fixedAwaken":{"cost":1,"type":"skill","tooltip":"|뽑을 카드와 버린 카드에서 \"진혼의 탄환\" 3장까지 핸드로 이동|","plusCard":"진혼의 탄환"},"commonAwaken":null,"newAwaken":{"tooltip":"이 카드의 비용 1 감소","origIdx":9},"personaSlot1":null,"personaSlot2":null},{"key":"a:칠흑의 송시","name":"칠흑의 송시","cost":1,"type":"attack","grade":"blue","media":"../../cards/레노아/blue3.webp","tooltip":"피해 50% × 3\n핸드의 \"진혼의 탄환\" 수만큼 피해량 +20%","egoAttr":"void","source":"agent","plusCard":"진혼의 탄환","agentId":"renoa","job":null,"fixedAwaken":{"cost":1,"type":"skill","tooltip":"[ 복제됨 ]\n|뽑을 카드와 버린 카드에서 \"진혼의 탄환\" 3장까지 핸드로 이동|","plusCard":"진혼의 탄환"},"commonAwaken":null,"newAwaken":{"tooltip":"이 카드의 비용 1 감소","origIdx":9},"personaSlot1":null,"personaSlot2":null,"isDuplicate":true},{"key":"a:운명을 삼킨 꽃","name":"운명을 삼킨 꽃","cost":0,"type":"skill","grade":"yellow","media":"../../cards/레노아/yellow.webp","tooltip":"핸드의 카드 2장까지 버리기\n그 수만큼 \"진혼의 탄환\" 생성","egoAttr":"void","source":"agent","plusCard":"진혼의 탄환","agentId":"renoa","job":null,"fixedAwaken":{"cost":1,"type":"skill","tooltip":"|드로우 2|\n|핸드에 진혼의 탄환이 있다면 드로우 1 추가|","plusCard":"진혼의 탄환"},"commonAwaken":null,"newAwaken":{"tooltip":"이 카드의 비용 1 감소","origIdx":9},"personaSlot1":null,"personaSlot2":null},{"key":"a:운명을 삼킨 꽃","name":"운명을 삼킨 꽃","cost":0,"type":"skill","grade":"yellow","media":"../../cards/레노아/yellow.webp","tooltip":"핸드의 카드 2장까지 버리기\n그 수만큼 \"진혼의 탄환\" 생성","egoAttr":"void","source":"agent","plusCard":"진혼의 탄환","agentId":"renoa","job":null,"fixedAwaken":{"cost":1,"type":"skill","tooltip":"[ 복제됨 ]\n|드로우 2|\n|핸드에 진혼의 탄환이 있다면 드로우 1 추가|","plusCard":"진혼의 탄환"},"commonAwaken":null,"newAwaken":{"tooltip":"이 카드의 비용 1 감소","origIdx":9},"personaSlot1":null,"personaSlot2":null,"isDuplicate":true},{"key":"a:결사의 일격","name":"결사의 일격","cost":1,"type":"attack","grade":"purple","media":"../../cards/레노아/purple.webp","tooltip":"[ 보존 ]\n피해 150%\n\"진혼의 탄환\" 모두 버리기, 그 수만큼 피해량 +50%","egoAttr":"void","source":"agent","plusCard":"진혼의 탄환","agentId":"renoa","job":null,"fixedAwaken":null,"commonAwaken":null,"newAwaken":null,"personaSlot1":null,"personaSlot2":null}],
      partnerId: "yuri",
      equipment: {"weapon":{"name":"W-52 도파민 주입기","refine":null,"hammer":null,"imprint":null},"armor":{"name":"로켓 장식 망토","refine":null,"hammer":null,"imprint":null},"accessory":{"name":"난수의 구체","refine":null,"hammer":null,"imprint":null}},
      removePt: 80,
      duplicatePt: 0,
      removeCount: 4,
      duplicateCount: 2
    },
    {
      agentId: "veronica",
      cards: [{"key":"a:발사 준비","name":"발사 준비","cost":1,"type":"upgrade","grade":"blue","media":"../../cards/베로니카/blue1.webp","tooltip":"[ 유일 / 개전 ]\n\"발리스타\" 1장 생성\n턴 시작 시 \"발리스타\" 1장 생성","egoAttr":"passion","source":"agent","plusCard":"발리스타","agentId":"veronica","job":null,"fixedAwaken":{"cost":1,"type":"upgrade","tooltip":"[ 유일 / 개전 ]\n|\"강화 발리스타\"| 1장 생성\n턴 시작 시 |\"강화 발리스타\"| 1장 생성","plusCard":"강화 발리스타"},"commonAwaken":null,"newAwaken":null,"personaSlot1":null,"personaSlot2":null},{"key":"a:숨돌리기","name":"숨돌리기","cost":1,"type":"skill","grade":"blue","media":"../../cards/베로니카/blue2.webp","tooltip":"실드 100%\n다른 전투원의 카드 드로우 2","egoAttr":"passion","source":"agent","agentId":"veronica","job":null,"fixedAwaken":{"cost":0,"type":"skill","tooltip":"다른 전투원의 카드 드로우 2","plusCard":null},"commonAwaken":null,"newAwaken":{"tooltip":"행동 포인트 1 획득","origIdx":8},"personaSlot1":null,"personaSlot2":null},{"key":"a:숨돌리기","name":"숨돌리기","cost":1,"type":"skill","grade":"blue","media":"../../cards/베로니카/blue2.webp","tooltip":"실드 100%\n다른 전투원의 카드 드로우 2","egoAttr":"passion","source":"agent","agentId":"veronica","job":null,"fixedAwaken":{"cost":0,"type":"skill","tooltip":"[ 복제됨 ]\n다른 전투원의 카드 드로우 2","plusCard":null},"commonAwaken":null,"newAwaken":{"tooltip":"행동 포인트 1 획득","origIdx":8},"personaSlot1":null,"personaSlot2":null,"isDuplicate":true},{"key":"a:숨돌리기","name":"숨돌리기","cost":1,"type":"skill","grade":"blue","media":"../../cards/베로니카/blue2.webp","tooltip":"실드 100%\n다른 전투원의 카드 드로우 2","egoAttr":"passion","source":"agent","agentId":"veronica","job":null,"fixedAwaken":{"cost":0,"type":"skill","tooltip":"[ 복제됨 ]\n다른 전투원의 카드 드로우 2","plusCard":null},"commonAwaken":null,"newAwaken":{"tooltip":"행동 포인트 1 획득","origIdx":8},"personaSlot1":null,"personaSlot2":null,"isDuplicate":true},{"key":"a:코왈스키 경","name":"코왈스키 경","cost":1,"type":"skill","grade":"yellow","media":"../../cards/베로니카/yellow.webp","tooltip":"핸드의 발리스타 1장 선택, 발동 시까지 피해량 +100%\n드로우 1","egoAttr":"passion","source":"agent","agentId":"veronica","job":null,"fixedAwaken":{"cost":1,"type":"skill","tooltip":"핸드의 발리스타 1장 선택, 발동 시까지 피해량 +|150|%\n드로우 |2|","plusCard":null},"commonAwaken":null,"newAwaken":{"tooltip":"이 카드의 비용 1 감소","origIdx":9},"personaSlot1":null,"personaSlot2":null}],
      partnerId: "daisy",
      equipment: {"weapon":{"name":"W-52 도파민 주입기","refine":null,"hammer":null,"imprint":null},"armor":{"name":"로켓 장식 망토","refine":null,"hammer":null,"imprint":null},"accessory":{"name":"난수의 구체","refine":null,"hammer":null,"imprint":null}},
      removePt: 100,
      duplicatePt: 0,
      removeCount: 5,
      duplicateCount: 2
    }
  ],
  author: "S039790582535",
  view: 0,
  like: 0,
  comment: 0,
  date: "2026-08-15"
});
