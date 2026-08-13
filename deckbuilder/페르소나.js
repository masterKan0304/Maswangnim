// ============================================================
// 페르소나 카드 각인(빛/어둠) 데이터 파일
// ------------------------------------------------------------
// 각 항목 설명:
//   type        : 'light' (빛) / 'dark' (어둠)
//   tooltip     : 각인 장착 시 카드에 추가되는 툴팁 본문
//   cardTypes   : null(공격/스킬 모두) / ['attack'] / ['skill'] — 이 각인이 어떤 타입의 페르소나 카드에 뜨는지
//   jobs        : null(모든 직업) / ['striker', ...] — 이 각인이 뜨는 직업 목록
//   jobsExclude : null / ['controller'] — "OO 제외 모두" 전용, 지정 시 jobs는 null
//   costDelta   : 장착 시 카드 비용에 더해지는 값
//   keywordAdds : [{ tag:'신속', value:null }, { tag:'소멸', value:2 }] — 카드 상단 [ ] 키워드에 병합되는 값
//   duplicable  : true면 같은 각인을 슬롯1/슬롯2에 동시에 장착 가능 ("중복 가능")
//   footnotes   : 각인 선택 그리드에서 툴팁 아래 작게(회색) 표시되는 원문 그대로의 부가 텍스트 목록
// ============================================================

window.PERSONA_IMPRINTS = [
  // ---- 빛 ----
  {
    type: 'light',
    tooltip: '빛의 가호 1',
    cardTypes: null,
    jobs: ['striker', 'vanguard'],
    jobsExclude: null,
    costDelta: 1,
    keywordAdds: [{ tag: '소멸', value: 2 }],
    duplicable: false,
    footnotes: ['비용 +1', '소멸 2 부여']
  },
  {
    type: 'light',
    tooltip: '행동 카운트가 1인 대상이 있을 시 이 카드 비용 2 감소',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: ['controller'],
    costDelta: 1,
    keywordAdds: [{ tag: '신속', value: null }],
    duplicable: false,
    footnotes: ['비용 +1', '신속 부여']
  },
  {
    type: 'light',
    tooltip: '반격의 파동 2, 빛의 각인 수만큼 추가 획득',
    cardTypes: ['skill'],
    jobs: ['vanguard'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '빛의 각인 수만큼 실드 획득량 20% 증가',
    cardTypes: ['skill'],
    jobs: ['striker', 'vanguard'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '빛의 각인 수만큼 반격 1',
    cardTypes: ['skill'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '빛의 각인 수만큼 무작위 적들에게 표식 1',
    cardTypes: ['attack'],
    jobs: ['ranger', 'hunter'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '빛의 각인 수만큼 1턴간 공격 카드 피해량 +15%',
    cardTypes: ['attack'],
    jobs: ['vanguard', 'controller'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [{ tag: '신속', value: null }],
    duplicable: false,
    footnotes: ['신속 부여']
  },
  {
    type: 'light',
    tooltip: '감응 : 사용 시까지 비용 1 감소',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '빛의 각인 수만큼 모든 적 고통 1',
    cardTypes: ['skill'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '이 카드로 격파 시 비용 1 감소',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '빛의 각인 수만큼 피해량 +30%',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '감응 : 비용이 0~2로 변경됨',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [{ tag: '신속', value: null }],
    duplicable: false,
    footnotes: ['신속 부여']
  },
  {
    type: 'light',
    tooltip: '행동 카운트 수만큼 1턴간 사기 1 감소 (최대 5)',
    cardTypes: ['attack'],
    jobs: ['ranger', 'hunter', 'controller'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [{ tag: '소멸', value: null }],
    duplicable: false,
    footnotes: ['소멸 부여']
  },
  {
    type: 'light',
    tooltip: '빛의 각인 5 : 자신에게 취약 3, 드로우 3',
    cardTypes: ['skill'],
    jobs: ['ranger', 'hunter', 'controller'],
    jobsExclude: null,
    costDelta: 1,
    keywordAdds: [{ tag: '소멸', value: null }],
    duplicable: false,
    footnotes: ['비용 +1', '소멸 부여']
  },
  {
    type: 'light',
    tooltip: '빛의 각인 수만큼 빛의 축복 1',
    cardTypes: ['skill'],
    jobs: ['ranger', 'controller'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [{ tag: '보존', value: null }],
    duplicable: false,
    footnotes: ['보존 부여']
  },
  {
    type: 'light',
    tooltip: '빛의 각인 3 : 적 전체의 행동 카운트 3 증가',
    cardTypes: ['skill'],
    jobs: ['controller'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '빛의 각인 4 : 1턴간 자신의 소멸 카드의 피해량 +40%',
    cardTypes: ['attack'],
    jobs: ['ranger', 'controller'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'light',
    tooltip: '신속 카드 드로우 2',
    cardTypes: ['skill'],
    jobs: ['ranger', 'hunter'],
    jobsExclude: null,
    costDelta: 1,
    keywordAdds: [],
    duplicable: false,
    footnotes: ['비용 +1']
  },
  {
    type: 'light',
    tooltip: '빛의 각인 수만큼 무작위 적에게 표식 1',
    cardTypes: ['attack'],
    jobs: ['ranger', 'hunter'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },

  // ---- 어둠 ----
  {
    type: 'dark',
    tooltip: '어둠의 각인 수만큼 피해량 +30%',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '1턴간 자신의 공격 카드 피해량 30% 증가',
    cardTypes: ['skill'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '버려질 시 이 카드 발동',
    cardTypes: ['skill'],
    jobs: null,
    jobsExclude: null,
    costDelta: 1,
    keywordAdds: [],
    duplicable: false,
    footnotes: ['비용 +1']
  },
  {
    type: 'dark',
    tooltip: '대상이 공명 상태일 시 타격 2회 추가',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '버린 카드에서 자신의 공격 카드 1장 선택, 그 카드 핸드로 이동',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [{ tag: '보존', value: null }],
    duplicable: false,
    footnotes: ['보존 부여']
  },
  {
    type: 'dark',
    tooltip: '어둠의 각인 5 : 모든 공격 카드 버리기, 타격 2회 추가',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 2,
    keywordAdds: [{ tag: '보존', value: null }],
    duplicable: false,
    footnotes: ['비용 +2', '보존 부여']
  },
  {
    type: 'dark',
    tooltip: '어둠의 각인 4 : 1턴간 자신의 안식 카드 피해량 +40%',
    cardTypes: null,
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '버려질 시 이 카드 사용 시까지 비용 1 감소',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [{ tag: '신속', value: null }],
    duplicable: false,
    footnotes: ['신속 부여']
  },
  {
    type: 'dark',
    tooltip: '이번 턴에 카드가 버려질 시 어둠의 각인 수만큼 피해량 +50%',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '이 카드의 비용이 0일 시 피해량 200% 증가',
    cardTypes: ['attack'],
    jobs: null,
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '어둠의 각인 3 : 핸드의 카드 1장 선택 발동',
    cardTypes: ['skill'],
    jobs: ['hunter'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [{ tag: '소멸', value: null }],
    duplicable: false,
    footnotes: ['소멸 부여']
  },
  {
    type: 'dark',
    tooltip: '어둠의 각인 5 : 타격 2회 추가',
    cardTypes: ['attack'],
    jobs: ['striker'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [{ tag: '소멸', value: 2 }],
    duplicable: false,
    footnotes: ['소멸 2 부여']
  },
  {
    type: 'dark',
    tooltip: '어둠의 각인 5 : 모든 페르소나 카드 핸드로 이동',
    cardTypes: ['skill'],
    jobs: ['ranger', 'hunter', 'controller'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [{ tag: '소멸', value: 2 }],
    duplicable: false,
    footnotes: ['소멸 2 부여']
  },
  {
    type: 'dark',
    tooltip: '어둠의 각인 수만큼 무작위 안식 카드 버리기',
    cardTypes: ['skill'],
    jobs: ['ranger', 'hunter', 'controller'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '어둠의 각인 수만큼 공명 1',
    cardTypes: ['attack'],
    jobs: ['hunter', 'controller'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '공격 카드 드로우 시 어둠의 각인 수만큼 적 전체 공명 1',
    cardTypes: ['skill'],
    jobs: ['ranger'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '어둠의 각인 수만큼 적 전체 고통 1',
    cardTypes: null,
    jobs: ['controller'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '버린 카드가 7장 이상일 시 피해량 100% 증가',
    cardTypes: ['attack'],
    jobs: ['striker', 'ranger', 'hunter'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: false,
    footnotes: []
  },
  {
    type: 'dark',
    tooltip: '버린 카드의 어둠의 각인 수만큼 과부하 생성, 그 수만큼 피해량 +50%',
    cardTypes: ['attack'],
    jobs: ['psionic'],
    jobsExclude: null,
    costDelta: 0,
    keywordAdds: [],
    duplicable: true,
    footnotes: ['중복 가능']
  }
];
