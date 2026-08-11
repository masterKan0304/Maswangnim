// ============================================================
// 덱 빌딩 게시판 게시물 데이터 편집 파일
// ------------------------------------------------------------
// 게시물을 추가/수정하려면 아래 목록에 { ... } 항목을 추가/편집하면 됩니다.
// 최신 글이 위로 오도록 나열 순서대로 보여집니다 (최신순 정렬 기준).
//
// 각 항목의 항목 설명:
//   id        : 게시물 고유 값 (숫자, 중복 금지)
//   title     : 게시물 제목 (길면 한 줄로 잘리고 ...으로 표시됩니다)
//   agentIds  : 소개할 전투원 3명의 id 배열 (agents/agents-data.js의 id 참고)
//   author    : 작성자 닉네임
//   view      : 조회수
//   like      : 좋아요 수
//   comment   : 댓글 수
//   date      : 작성일 (YYYY-MM-DD)
// ============================================================

window.DECKBUILDER_POSTS = [
  { id: 15, title: '힐데 / 페이 / 테네브리아 조합으로 이번 시즌 최고 승률 찍어봤습니다 (feat. 상세 빌드 가이드)', agentIds: ['hilde', 'pei', 'tenebria'], author: '알겅하자', view: 3200, like: 410, comment: 88, date: '2026-08-10' },
  { id: 14, title: '아델하이트 나인 치즈루 방어 특화 덱, 대균열에서도 안 죽어요', agentIds: ['Adelheid', 'nine', 'chizuru'], author: '186803', view: 850, like: 62, comment: 14, date: '2026-08-10' },
  { id: 13, title: '리타 티페라 나르쟈 조합 추천, 초반부터 후반까지 무난한 픽', agentIds: ['rita', 'tiphera', 'narja'], author: '깐딩s', view: 1560, like: 203, comment: 45, date: '2026-08-09' },
  { id: 12, title: '유키 하루 레노아 스피드런 덱 공유합니다', agentIds: ['yuki', 'haru', 'renoa'], author: '더겐소년', view: 420, like: 31, comment: 5, date: '2026-08-09' },
  { id: 11, title: '베로니카 루크 휴고 조합 써보신 분?', agentIds: ['veronica', 'ruke', 'hugo'], author: '소대장따까리', view: 99, like: 8, comment: 1, date: '2026-08-08' },
  { id: 10, title: '오를레아 린 메이린 콤보 데미지 미쳤습니다', agentIds: ['orlea', 'rin', 'meilin'], author: '방주지기', view: 2100, like: 340, comment: 67, date: '2026-08-08' },
  { id: 9, title: '칼리페 마그나 카일론 화이트 알테어 트리오 덱', agentIds: ['khaliphe', 'magna', 'kayron'], author: '화이트알테어팬', view: 610, like: 55, comment: 9, date: '2026-08-07' },
  { id: 8, title: '오웬 셀레나 베릴 4성 조합으로 5성 못지않은 딜 뽑는 법', agentIds: ['owen', 'selena', 'beril'], author: '초코바수집가', view: 1340, like: 120, comment: 22, date: '2026-08-07' },
  { id: 7, title: '아미르 마리벨 루카스 안정성 최고 조합', agentIds: ['amir', 'maribel', 'rukas'], author: '우주최강록스타', view: 275, like: 19, comment: 3, date: '2026-08-06' },
  { id: 6, title: '니아 미카 트리사 저격 카운터 픽', agentIds: ['nia', 'mika', 'trisa'], author: '트리사수호대', view: 4300, like: 512, comment: 130, date: '2026-08-05' },
  { id: 5, title: '힐데 린 마그나 만능 조합, 아무 데나 넣어도 무난함', agentIds: ['hilde', 'rin', 'magna'], author: '만능조합러', view: 730, like: 64, comment: 11, date: '2026-08-04' },
  { id: 4, title: '페이 세레니엘 디아나 방주수호 컨셉 덱 만들어봤어요', agentIds: ['pei', 'sereniel', 'diana'], author: '별빛돌보미', view: 1890, like: 210, comment: 38, date: '2026-08-03' },
  { id: 3, title: '테네브리아 나인 유키 시너지 실험 결과 공유드립니다', agentIds: ['tenebria', 'nine', 'yuki'], author: '시너지연구소', view: 158, like: 12, comment: 2, date: '2026-08-02' },
  { id: 2, title: '하루 베로니카 오를레아 조합으로 주간 던전 클리어 했습니다', agentIds: ['haru', 'veronica', 'orlea'], author: '던전클리어러', view: 990, like: 80, comment: 16, date: '2026-08-01' },
  { id: 1, title: '칼리페 오웬 니아 뉴비 추천 조합 정리해봤어요', agentIds: ['khaliphe', 'owen', 'nia'], author: '뉴비가이드', view: 2650, like: 300, comment: 54, date: '2026-07-30' }
];
