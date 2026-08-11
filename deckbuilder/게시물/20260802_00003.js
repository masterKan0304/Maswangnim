// ============================================================
// 덱 빌딩 게시판 게시물 파일 (1개 파일 = 게시물 1개)
// ------------------------------------------------------------
// 파일명 규칙: {작성일 YYYYMMDD}_{5자리 순번}.js
//   같은 파일 안의 아래 값만 수정하면 게시물 내용이 바뀝니다.
//   title/agentIds(3명, agents-data.js의 id)/author/view/like/comment/date
// ============================================================

window.DECKBUILDER_POSTS = window.DECKBUILDER_POSTS || [];
window.DECKBUILDER_POSTS.push({
  title: "테네브리아 나인 유키 시너지 실험 결과 공유드립니다",
  agentIds: ["tenebria","nine","yuki"],
  author: "시너지연구소",
  view: 158,
  like: 12,
  comment: 2,
  date: "2026-08-02"
});
