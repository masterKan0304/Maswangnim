// ============================================================
// 덱 빌딩 게시판 게시물 파일 (1개 파일 = 게시물 1개)
// ------------------------------------------------------------
// 파일명 규칙: {작성일 YYYYMMDD}_{5자리 순번}.js
//   같은 파일 안의 아래 값만 수정하면 게시물 내용이 바뀝니다.
//   title/agentIds(3명, agents-data.js의 id)/author/view/like/comment/date
// ============================================================

window.DECKBUILDER_POSTS = window.DECKBUILDER_POSTS || [];
window.DECKBUILDER_POSTS.push({
  title: "하루 베로니카 오를레아 조합으로 주간 던전 클리어 했습니다",
  agentIds: ["haru","veronica","orlea"],
  author: "던전클리어러",
  view: 990,
  like: 80,
  comment: 16,
  date: "2026-08-01"
});
