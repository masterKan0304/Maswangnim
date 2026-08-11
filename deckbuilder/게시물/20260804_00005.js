// ============================================================
// 덱 빌딩 게시판 게시물 파일 (1개 파일 = 게시물 1개)
// ------------------------------------------------------------
// 파일명 규칙: {작성일 YYYYMMDD}_{5자리 순번}.js
//   같은 파일 안의 아래 값만 수정하면 게시물 내용이 바뀝니다.
//   title/agentIds(3명, agents-data.js의 id)/author/view/like/comment/date
// ============================================================

window.DECKBUILDER_POSTS = window.DECKBUILDER_POSTS || [];
window.DECKBUILDER_POSTS.push({
  title: "힐데 린 마그나 만능 조합, 아무 데나 넣어도 무난함",
  agentIds: ["hilde","rin","magna"],
  author: "만능조합러",
  view: 730,
  like: 64,
  comment: 11,
  date: "2026-08-04"
});
