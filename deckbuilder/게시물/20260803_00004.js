// ============================================================
// 덱 빌딩 게시판 게시물 파일 (1개 파일 = 게시물 1개)
// ------------------------------------------------------------
// 파일명 규칙: {작성일 YYYYMMDD}_{5자리 순번}.js
//   같은 파일 안의 아래 값만 수정하면 게시물 내용이 바뀝니다.
//   title/agentIds(3명, agents-data.js의 id)/author/view/like/comment/date
// ============================================================

window.DECKBUILDER_POSTS = window.DECKBUILDER_POSTS || [];
window.DECKBUILDER_POSTS.push({
  title: "페이 세레니엘 디아나 방주수호 컨셉 덱 만들어봤어요",
  agentIds: ["pei","sereniel","diana"],
  author: "별빛돌보미",
  view: 1890,
  like: 210,
  comment: 38,
  date: "2026-08-03"
});
