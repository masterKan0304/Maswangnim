var GITHUB_OWNER = 'masterKan0304';
var GITHUB_REPO = 'Maswangnim';
var GITHUB_BRANCH = 'main';
var GITHUB_API = 'https://api.github.com';

function jsStringLiteral(s) {
  return JSON.stringify(String(s == null ? '' : s));
}

function buildPostFileContent(post) {
  var rowsJs = post.rows.map(function (r) {
    return '    {\n' +
      '      agentId: ' + jsStringLiteral(r.agentId) + ',\n' +
      '      cards: ' + JSON.stringify(r.cards) + ',\n' +
      '      partnerId: ' + (r.partnerId ? jsStringLiteral(r.partnerId) : 'null') + ',\n' +
      '      equipment: ' + JSON.stringify(r.equipment) + ',\n' +
      '      removePt: ' + (Number(r.removePt) || 0) + ',\n' +
      '      duplicatePt: ' + (Number(r.duplicatePt) || 0) + ',\n' +
      '      removeCount: ' + (Number(r.removeCount) || 0) + ',\n' +
      '      duplicateCount: ' + (Number(r.duplicateCount) || 0) + '\n' +
      '    }';
  }).join(',\n');
  return '// ============================================================\n' +
    '// 덱 빌딩 게시판 게시물 파일 (1개 파일 = 게시물 1개)\n' +
    '// 글쓰기 화면에서 작성한 내용이 자동 저장된 파일입니다.\n' +
    '// view/like/comment 숫자는 필요하면 직접 수정해도 됩니다.\n' +
    '// ============================================================\n\n' +
    'window.DECKBUILDER_POSTS = window.DECKBUILDER_POSTS || [];\n' +
    'window.DECKBUILDER_POSTS.push({\n' +
    '  id: ' + jsStringLiteral(post.id) + ',\n' +
    '  title: ' + jsStringLiteral(post.title) + ',\n' +
    '  content: ' + jsStringLiteral(post.content) + ',\n' +
    '  agentIds: ' + JSON.stringify(post.agentIds) + ',\n' +
    '  rows: [\n' + rowsJs + '\n  ],\n' +
    '  author: ' + jsStringLiteral(post.author) + ',\n' +
    '  view: 0,\n' +
    '  like: 0,\n' +
    '  comment: 0,\n' +
    '  date: ' + jsStringLiteral(post.date) + '\n' +
    '});\n';
}

function insertScriptLineAfterMarker(text, srcPrefix, newLine) {
  var lines = text.split('\n');
  var markerIdx = -1;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('새 게시물 파일을 deckbuilder/게시물/') !== -1) { markerIdx = i; break; }
  }
  if (markerIdx === -1) return text.replace(/\n$/, '') + '\n' + newLine + '\n';
  var insertAt = markerIdx + 1;
  while (insertAt < lines.length && lines[insertAt].indexOf(srcPrefix) === 0) insertAt++;
  lines.splice(insertAt, 0, newLine);
  return lines.join('\n');
}

function encodeGhPath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function ghRequest(path, options) {
  var headers = Object.assign({
    Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }, (options && options.headers) || {});
  return fetch(GITHUB_API + path, Object.assign({}, options, { headers: headers })).then(function (res) {
    return res.text().then(function (text) {
      var json = null;
      try { json = text ? JSON.parse(text) : null; } catch (e) {}
      if (!res.ok) {
        var err = new Error('GitHub API error ' + res.status + ': ' + (json && json.message ? json.message : text));
        err.status = res.status;
        throw err;
      }
      return json;
    });
  });
}

function getFile(path) {
  return ghRequest('/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + encodeGhPath(path) + '?ref=' + GITHUB_BRANCH)
    .catch(function (e) {
      if (e.status === 404) return null;
      throw e;
    });
}

function putFile(path, content, message, sha) {
  var body = {
    message: message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: GITHUB_BRANCH
  };
  if (sha) body.sha = sha;
  return ghRequest('/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + encodeGhPath(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

function validatePost(post) {
  if (!post || typeof post !== 'object') return '요청 형식이 올바르지 않습니다.';
  if (!post.id || typeof post.id !== 'string' || !/^[0-9]{8}_[0-9]{5}$/.test(post.id)) return '잘못된 게시물 ID입니다.';
  if (!post.title || typeof post.title !== 'string') return '제목이 없습니다.';
  if (!post.content || typeof post.content !== 'string') return '내용이 없습니다.';
  if (!Array.isArray(post.agentIds) || post.agentIds.length === 0) return '전투원이 없습니다.';
  if (!Array.isArray(post.rows) || post.rows.length === 0) return '덱 데이터가 없습니다.';
  if (!post.author || typeof post.author !== 'string') return '작성자 정보가 없습니다.';
  if (!post.date || typeof post.date !== 'string') return '날짜 정보가 없습니다.';
  return null;
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  if (!process.env.GITHUB_TOKEN) {
    res.status(500).json({ ok: false, error: '서버에 GITHUB_TOKEN이 설정되어 있지 않습니다.' });
    return;
  }

  var post = req.body;
  if (typeof post === 'string') {
    try { post = JSON.parse(post); } catch (e) { post = null; }
  }

  var validationError = validatePost(post);
  if (validationError) {
    res.status(400).json({ ok: false, error: validationError });
    return;
  }

  var fileContent = buildPostFileContent(post);
  var postPath = 'deckbuilder/게시물/' + post.id + '.js';
  var boardPath = 'deckbuilder/index.html';
  var detailPath = 'deckbuilder/post/index.html';
  var homePath = 'index.html';

  putFile(postPath, fileContent, '게시물 추가: ' + post.title)
    .then(function () {
      return getFile(boardPath);
    })
    .then(function (boardFile) {
      if (!boardFile) return null;
      var boardText = Buffer.from(boardFile.content, 'base64').toString('utf8');
      var boardScriptLine = '<script src="게시물/' + post.id + '.js"></script>';
      var boardUpdated = insertScriptLineAfterMarker(boardText, '<script src="게시물/', boardScriptLine);
      if (boardUpdated === boardText) return null;
      return putFile(boardPath, boardUpdated, '게시판에 게시물 등록: ' + post.title, boardFile.sha);
    })
    .then(function () {
      return getFile(detailPath);
    })
    .then(function (detailFile) {
      if (!detailFile) return null;
      var detailText = Buffer.from(detailFile.content, 'base64').toString('utf8');
      var detailScriptLine = '<script src="../게시물/' + post.id + '.js"></script>';
      var detailUpdated = insertScriptLineAfterMarker(detailText, '<script src="../게시물/', detailScriptLine);
      if (detailUpdated === detailText) return null;
      return putFile(detailPath, detailUpdated, '게시물 상세 페이지 등록: ' + post.title, detailFile.sha);
    })
    .then(function () {
      return getFile(homePath);
    })
    .then(function (homeFile) {
      if (!homeFile) return null;
      var homeText = Buffer.from(homeFile.content, 'base64').toString('utf8');
      var homeScriptLine = '<script src="deckbuilder/게시물/' + post.id + '.js"></script>';
      var homeUpdated = insertScriptLineAfterMarker(homeText, '<script src="deckbuilder/게시물/', homeScriptLine);
      if (homeUpdated === homeText) return null;
      return putFile(homePath, homeUpdated, '메인 페이지에 게시물 등록: ' + post.title, homeFile.sha);
    })
    .then(function () {
      res.status(200).json({ ok: true, id: post.id });
    })
    .catch(function (err) {
      res.status(500).json({ ok: false, error: err.message || String(err) });
    });
};
