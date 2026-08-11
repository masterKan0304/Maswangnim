// ============================================================
// 덱 빌딩 게시판 게시물 파일 (1개 파일 = 게시물 1개)
// ------------------------------------------------------------
// 파일명 규칙: {작성일 YYYYMMDD}_{5자리 순번}.js
//   같은 파일 안의 아래 값만 수정하면 게시물 내용이 바뀝니다.
//   title/agentIds(3명, agents-data.js의 id)/author/view/like/comment/date
// ============================================================

window.DECKBUILDER_POSTS = window.DECKBUILDER_POSTS || [];
window.DECKBUILDER_POSTS.push({
  title: "힐데 / 페이 / 테네브리아 조합으로 이번 시즌 최고 승률 찍어봤습니다 (feat. 상세 빌드 가이드)",
  agentIds: ["hilde","pei","tenebria"],
  author: "알겅하자",
  view: 3200,
  like: 410,
  comment: 88,
  date: "2026-08-10"
});
