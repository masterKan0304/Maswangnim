// ============================================================
// 덱 빌딩 게시판 게시물 파일 (1개 파일 = 게시물 1개)
// 글쓰기 화면에서 작성한 내용이 자동 저장된 파일입니다.
// view/like/comment 숫자는 필요하면 직접 수정해도 됩니다.
// ============================================================

window.DECKBUILDER_POSTS = window.DECKBUILDER_POSTS || [];
window.DECKBUILDER_POSTS.push({
  "id": "20260813_13905",
  "title": "디아나 / 리타 / 티페라 3인 밸런스 조합",
  "content": "세 전투원의 장점을 골고루 살려본 밸런스형 3인 덱입니다.\n한 명에게 몰아주기보다 셋이 골고루 역할을 나눠가지도록\n구성했어요. 장비도 한 자리 정도만 채워서\n포인트 여유를 남겨뒀습니다.",
  "agentIds": [
    "diana",
    "rita",
    "tiphera"
  ],
  "rows": [
    {
      "agentId": "diana",
      "cards": [
        {
          "key": "a:교란 사격",
          "name": "교란 사격",
          "cost": 1,
          "type": "attack",
          "grade": "gray",
          "media": "../../cards/디아나/attack.webp",
          "tooltip": "피해 100%",
          "egoAttr": "passion",
          "source": "agent",
          "agentId": "diana",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        },
        {
          "key": "a:교란 사격",
          "name": "교란 사격",
          "cost": 1,
          "type": "attack",
          "grade": "gray",
          "media": "../../cards/디아나/attack.webp",
          "tooltip": "피해 100%",
          "egoAttr": "passion",
          "source": "agent",
          "agentId": "diana",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        },
        {
          "key": "a:보호해줘",
          "name": "보호해줘",
          "cost": 1,
          "type": "skill",
          "grade": "gray",
          "media": "../../cards/디아나/skill.webp",
          "tooltip": "치유 100%",
          "egoAttr": "passion",
          "source": "agent",
          "agentId": "diana",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        },
        {
          "key": "a:마음을 담아서!",
          "name": "마음을 담아서!",
          "cost": 1,
          "type": "attack",
          "grade": "blue",
          "media": "../../cards/디아나/blue1.webp",
          "tooltip": "[ 안식 ]\n피해 100%\n\"하트 브레이커\" 2장 생성",
          "egoAttr": "passion",
          "source": "agent",
          "agentId": "diana",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null,
          "plusCard": "하트 브레이커"
        }
      ],
      "partnerId": null,
      "equipment": {
        "weapon": null,
        "armor": null,
        "accessory": null
      }
    },
    {
      "agentId": "rita",
      "cards": [
        {
          "key": "a:시간 가속",
          "name": "시간 가속",
          "cost": 3,
          "type": "attack",
          "grade": "gray",
          "media": "../../cards/리타/attack.webp",
          "tooltip": "피해 350%",
          "egoAttr": "justice",
          "source": "agent",
          "agentId": "rita",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        },
        {
          "key": "a:시간 가속",
          "name": "시간 가속",
          "cost": 3,
          "type": "attack",
          "grade": "gray",
          "media": "../../cards/리타/attack.webp",
          "tooltip": "피해 350%",
          "egoAttr": "justice",
          "source": "agent",
          "agentId": "rita",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        },
        {
          "key": "a:되감기",
          "name": "되감기",
          "cost": 1,
          "type": "skill",
          "grade": "gray",
          "media": "../../cards/리타/skill.webp",
          "tooltip": "치유 100%",
          "egoAttr": "justice",
          "source": "agent",
          "agentId": "rita",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        },
        {
          "key": "a:기록자",
          "name": "기록자",
          "cost": 1,
          "type": "upgrade",
          "grade": "blue",
          "media": "../../cards/리타/blue1.webp",
          "tooltip": "[ 유일 / 개전 ]\n카드 발동 시 그 카드 비용만큼 시간 기록 1",
          "egoAttr": "justice",
          "source": "agent",
          "agentId": "rita",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        }
      ],
      "partnerId": "anteia",
      "equipment": {
        "weapon": null,
        "armor": null,
        "accessory": null
      }
    },
    {
      "agentId": "tiphera",
      "cards": [
        {
          "key": "a:물질 분해",
          "name": "물질 분해",
          "cost": 1,
          "type": "attack",
          "grade": "gray",
          "media": "../../cards/티페라/attack.webp",
          "tooltip": "방어 기반 피해 100%",
          "egoAttr": "order",
          "source": "agent",
          "agentId": "tiphera",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        },
        {
          "key": "a:장벽 전개",
          "name": "장벽 전개",
          "cost": 1,
          "type": "skill",
          "grade": "gray",
          "media": "../../cards/리타/skill.webp",
          "tooltip": "치유 100%",
          "egoAttr": "order",
          "source": "agent",
          "agentId": "tiphera",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        },
        {
          "key": "a:장벽 전개",
          "name": "장벽 전개",
          "cost": 1,
          "type": "skill",
          "grade": "gray",
          "media": "../../cards/리타/skill.webp",
          "tooltip": "치유 100%",
          "egoAttr": "order",
          "source": "agent",
          "agentId": "tiphera",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null
        },
        {
          "key": "a:퀀텀 시드",
          "name": "퀀텀 시드",
          "cost": 0,
          "type": "skill",
          "grade": "blue",
          "media": "../../cards/티페라/blue1.webp",
          "tooltip": "치유 100%\n뽑을 카드에 창조 카드 2장 생성\n그 중 1장 드로우",
          "egoAttr": "order",
          "source": "agent",
          "agentId": "tiphera",
          "job": null,
          "fixedAwaken": null,
          "commonAwaken": null,
          "newAwaken": null,
          "personaSlot1": null,
          "personaSlot2": null,
          "plusCard": [
            "창조 : ○",
            "창조 : △",
            "창조 : □"
          ]
        }
      ],
      "partnerId": null,
      "equipment": {
        "weapon": {
          "name": "처형자의 칼날",
          "refine": null,
          "hammer": null,
          "imprint": null
        },
        "armor": null,
        "accessory": null
      }
    }
  ],
  "author": "S004469642074",
  "view": 2464,
  "like": 596,
  "comment": 197,
  "date": "2026-08-13"
});
