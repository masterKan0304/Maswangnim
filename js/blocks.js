import { SUBJECTS, SUBJECT_ORDER, CHANGES, DROP, unlockLevel } from './config.js';
import { game } from './state.js';

// ─────────────────────────────────────────────
//  블록 생성
// ─────────────────────────────────────────────
let _id = 1;
const uid = () => _id++;

export function weighted(table) {
  let total = 0;
  for (const k in table) total += table[k];
  let r = Math.random() * total;
  for (const k in table) { r -= table[k]; if (r <= 0) return k; }
  return Object.keys(table)[0];
}

export const makeWord = (key) => ({ id: uid(), kind: 'word', wtype: SUBJECTS[key] ? 'subject' : 'change', key });
export const makeFixed = (v) => ({ id: uid(), kind: 'number', ntype: 'fixed', v });
export const makeRange = (min, max) => ({ id: uid(), kind: 'number', ntype: 'range', min, max });
export const makePercent = (p) => ({ id: uid(), kind: 'number', ntype: 'percent', p });
export const makeOp = (op) => ({ id: uid(), kind: 'op', op, slots: [null, null] });

// SNC: [주체]-[수치]-[변화],  SSC: [주체]-[주체]-[변화]
// ZONE: 처치 시 [고정/랜덤 수치]초간 속성 지대,  INFUSE: 지대를 지난 투사체가 [수치]만큼 속성 피해 획득
// AMP: 장착된 다른 모든 문장의 효과가 [수치] [변화]
export const TEMPLATES = {
  SNC: ['subject', 'number', 'change'],
  SSC: ['subject', 'subject', 'change'],
  ZONE: ['numflat'],
  INFUSE: ['number'],
  AMP: ['number', 'change'],
};
export const TEMPLATE_INFO = {
  SNC: { label: '구현', rarity: 1 },
  SSC: { label: '구현', rarity: 1 },
  ZONE: { label: '지대 생성', rarity: 2 },
  INFUSE: { label: '지대 촉발', rarity: 2 },
  AMP: { label: '주도', rarity: 3 },
};
export const RARITY_NAME = { 1: '일반', 2: '희귀', 3: '전설' };

export function makeSentence(template, prefill = true) {
  const s = {
    id: uid(), kind: 'sentence', template,
    slots: TEMPLATES[template].map((type) => ({ type, block: null, locked: false })),
  };
  if (prefill) {
    for (const slot of s.slots) {
      if (Math.random() < DROP.prefillChance) {
        slot.block = randomForSlot(slot.type);
        slot.locked = true;
      }
    }
    // 백분율 전용 주체와 맞지 않는 값이 고정되어 나오지 않게
    const [a, b] = s.slots;
    if (s.template === 'SNC' && a.block && SUBJECTS[a.block.key].pctOnly && b.block && b.block.kind === 'number' && b.block.ntype !== 'percent') {
      b.block = makePercent(lowBiased(2, 18, 0.88) * 5);
    }
    if (s.template === 'SSC' && a.block && SUBJECTS[a.block.key].pctOnly && b.block && !SUBJECTS[b.block.key].pctType) {
      b.block = makeWord(PCT_SUBJECTS[Math.floor(Math.random() * PCT_SUBJECTS.length)]);
    }
  }
  return s;
}

// 문장의 i번째 칸에 블록 b 를 넣을 수 있는지 (유형 + 백분율 전용 규칙)
export function sentenceAccepts(s, i, b) {
  const sl = s.slots[i];
  if (sl.locked || !slotAccepts(sl.type, b)) return false;
  const pctOnly = (w) => w && SUBJECTS[w.key] && SUBJECTS[w.key].pctOnly;
  if (s.template === 'SNC') {
    const isPlainNum = (x) => x && x.kind === 'number' && x.ntype !== 'percent';
    if (i === 1 && pctOnly(s.slots[0].block) && isPlainNum(b)) return false;
    if (i === 0 && pctOnly(b) && isPlainNum(s.slots[1].block)) return false;
  }
  if (s.template === 'SSC') {
    // 백분율 값(치명타 확률 등)에는 고정/랜덤 값인 주체를 적용할 수 없음
    const pctType = (w) => w && SUBJECTS[w.key] && SUBJECTS[w.key].pctType;
    if (i === 1 && pctOnly(s.slots[0].block) && !pctType(b)) return false;
    if (i === 0 && pctOnly(b) && s.slots[1].block && !pctType(s.slots[1].block)) return false;
  }
  return true;
}

function randomForSlot(type) {
  if (type === 'subject') return randomSubject();
  if (type === 'change') return randomChange();
  if (type === 'numflat') return Math.random() < 0.5 ? makeFixed(lowBiased(2, 8)) : makeRange(lowBiased(2, 4), lowBiased(5, 8));
  return randomNumber();
}

const WORD_SUBJECTS = SUBJECT_ORDER.filter((k) => !SUBJECTS[k].noWord);
const PCT_SUBJECTS = WORD_SUBJECTS.filter((k) => SUBJECTS[k].pctType);
export const randomSubject = () => makeWord(WORD_SUBJECTS[Math.floor(Math.random() * WORD_SUBJECTS.length)]);
export const randomChange = () => makeWord(weighted(DROP.changes));
// a~b 정수 중 하나. 클수록 가중치가 falloff 배씩 줄어듦
function lowBiased(a, b, falloff = DROP.numberFalloff) {
  const table = {};
  for (let v = a; v <= b; v++) table[v] = Math.pow(falloff, v - a);
  return +weighted(table);
}

export function randomNumber() {
  const t = weighted(DROP.numberTypes);
  if (t === 'fixed') return makeFixed(lowBiased(2, 8));
  if (t === 'range') {
    const min = lowBiased(2, 6);
    const max = lowBiased(Math.max(min + 1, 3), 10);
    return makeRange(min, max);
  }
  return makePercent(lowBiased(2, 18, 0.88) * 5); // 10% ~ 90%
}
export const randomOp = () => makeOp(weighted(DROP.ops));
// 계정 레벨로 아직 해금되지 않은 문장은 나오지 않음
export const templateUnlocked = (t) => game.accountLevel >= unlockLevel('templates', t);
export function randomSentence() {
  const table = {};
  for (const [t, w] of Object.entries(DROP.templates)) if (templateUnlocked(t)) table[t] = w;
  return makeSentence(weighted(table));
}

export function randomBlock() {
  const k = weighted(DROP.kinds);
  if (k === 'sentence') return randomSentence();
  if (k === 'number') return randomNumber();
  if (k === 'op') return randomOp();
  return Math.random() < DROP.subjectRatio ? randomSubject() : randomChange();
}

// ─────────────────────────────────────────────
//  라벨 / 조사
// ─────────────────────────────────────────────
export const OP_SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };
export const OP_NAME = { '+': '덧셈', '-': '뺄셈', '*': '곱셈', '/': '나눗셈' };
const DIGIT_BATCHIM = [true, true, false, true, false, false, true, true, true, false]; // 영 일 이 삼 사 오 육 칠 팔 구

export function hasBatchim(text) {
  const m = String(text).replace(/[\s)\]}.]+$/, '');
  const ch = m[m.length - 1];
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  if (ch >= '0' && ch <= '9') return DIGIT_BATCHIM[+ch];
  return false; // %, 영문 등
}

export function josa(text, withB, withoutB, empty) {
  if (text == null) return empty;
  return hasBatchim(text) ? withB : withoutB;
}

export function colorKey(b) { return b.kind === 'word' ? b.wtype : b.kind; }

export function numText(b) {
  if (!b) return null;
  if (b.kind === 'op') {
    const a = b.slots[0] ? numText(b.slots[0]) : '□';
    const c = b.slots[1] ? numText(b.slots[1]) : '□';
    return `(${a} ${OP_SYMBOL[b.op]} ${c})`;
  }
  if (b.ntype === 'fixed') return `${b.v}`;
  if (b.ntype === 'range') return `${b.min}~${b.max}`;
  return `${b.p}%`;
}

export function blockLabel(b) {
  if (b.kind === 'word') return (SUBJECTS[b.key] || CHANGES[b.key]).name;
  if (b.kind === 'sentence') return '문장';
  if (b.kind === 'op') return numText(b).slice(1, -1);
  return numText(b);
}

export function kindName(b) {
  if (b.kind === 'sentence') return '문장 블록';
  if (b.kind === 'word') return b.wtype === 'subject' ? '단어 블록 · 주체' : '단어 블록 · 변화';
  if (b.kind === 'op') return `연산 블록 · ${OP_NAME[b.op]}`;
  return { fixed: '수치 블록 · 고정값', range: '수치 블록 · 랜덤값', percent: '수치 블록 · 백분율' }[b.ntype];
}

// ─────────────────────────────────────────────
//  값 평가 — 모든 값은 {min, max, pct} 구간
// ─────────────────────────────────────────────
export function evalNumber(b) {
  if (!b) return null;
  if (b.kind === 'number') {
    if (b.ntype === 'fixed') return { min: b.v, max: b.v, pct: false };
    if (b.ntype === 'range') return { min: b.min, max: b.max, pct: false };
    return { min: b.p / 100, max: b.p / 100, pct: true };
  }
  if (b.kind === 'op') {
    const a = evalNumber(b.slots[0]);
    const c = evalNumber(b.slots[1]);
    if (!a || !c) return null;
    // 성분별 연산 (3~5 × 2 = 6~10). 백분율끼리면 결과도 백분율, 섞이면 백분율은 소수(0.4)로 취급
    let lo, hi;
    switch (b.op) {
      case '+': lo = a.min + c.min; hi = a.max + c.max; break;
      case '-': lo = a.min - c.min; hi = a.max - c.max; break;
      case '*': lo = a.min * c.min; hi = a.max * c.max; break;
      case '/': lo = a.min / c.min; hi = a.max / c.max; break;
    }
    return { min: Math.min(lo, hi), max: Math.max(lo, hi), pct: a.pct && c.pct };
  }
  return null;
}

export function fmtValue(v) {
  if (!v) return '?';
  const f = (x) => (v.pct ? `${+(x * 100).toFixed(1)}%` : `${+x.toFixed(2)}`);
  return v.min === v.max ? f(v.min) : `${f(v.min)}~${f(v.max)}`;
}

export function slotAccepts(type, b) {
  if (!b) return false;
  if (type === 'subject') return b.kind === 'word' && b.wtype === 'subject';
  if (type === 'change') return b.kind === 'word' && b.wtype === 'change';
  if (type === 'number') return b.kind === 'number' || b.kind === 'op';
  if (type === 'numflat') return (b.kind === 'number' && b.ntype !== 'percent') || b.kind === 'op';
  if (type === 'opnum') return b.kind === 'number';
  return false;
}

export function isComplete(s) {
  if (!s || s.kind !== 'sentence') return false;
  for (const sl of s.slots) {
    if (!sl.block) return false;
    if ((sl.type === 'number' || sl.type === 'numflat') && !evalNumber(sl.block)) return false;
  }
  return true;
}

export function missingCount(s) {
  let n = 0;
  for (const sl of s.slots) {
    if (!sl.block) n++;
    else if (sl.block.kind === 'op') n += sl.block.slots.filter((x) => !x).length;
  }
  return n;
}

// ─────────────────────────────────────────────
//  문장 조립 (조사 자동 처리)
// ─────────────────────────────────────────────
export const PLACEHOLDER = { subject: '단어:주체', number: '수치', numflat: '수치', change: '단어:변화' };

export function slotChipLabel(s, i) {
  const slot = s.slots[i];
  const b = slot.block;
  if (!b) return null;
  if (slot.type === 'change') return CHANGES[b.key].verb;
  if (slot.type === 'subject') return SUBJECTS[b.key].name;
  let t = blockLabel(b);
  const ev = evalNumber(b);
  const isPct = ev ? ev.pct : b.kind === 'number' && b.ntype === 'percent';
  let unit = '';
  if (s.template === 'SNC') {
    const subj = s.slots[0].block;
    if (subj && SUBJECTS[subj.key].sentenceUnit) unit = SUBJECTS[subj.key].sentenceUnit;
  } else if (s.template === 'ZONE') unit = '초';
  if (unit && !isPct) t = (b.kind === 'op' ? `(${t})` : t) + unit;
  return t;
}

// [{slot:i} | {text}] 배열
export function sentenceParts(s) {
  if (s.template === 'ZONE') {
    return [{ text: '적 처치 시 ' }, { slot: 0 }, { text: (s.slots[0].block ? '' : '초') + '간 스킬 속성에 따른 지대를 남깁니다.' }];
  }
  if (s.template === 'INFUSE') {
    return [{ text: '투사체가 속성 지대 위를 지나면 ' }, { slot: 0 }, { text: '만큼 그 속성 피해를 얻습니다.' }];
  }
  if (s.template === 'AMP') {
    const L = slotChipLabel(s, 0);
    const set = s.slots[1].block && s.slots[1].block.key === 'set';
    return [{ text: '다른 모든 문장의 수치 블록의 효과가 ' }, { slot: 0 }, { text: set ? josa(L, '과', '와', '와/과') + ' ' : ' ' }, { slot: 1 }, { text: '.' }];
  }
  const L0 = slotChipLabel(s, 0);
  const L1 = slotChipLabel(s, 1);
  const chg = s.slots[2].block ? s.slots[2].block.key : null;
  const parts = [{ slot: 0 }, { text: josa(L0, '이', '가', '이/가') + ' ' }, { slot: 1 }];
  if (chg === 'set') parts.push({ text: josa(L1, '과', '와', '와/과') + ' ' });
  else if (s.template === 'SSC') parts.push({ text: '만큼 ' });
  else parts.push({ text: ' ' });
  parts.push({ slot: 2 }, { text: '.' });
  return parts;
}

export function sentenceText(s) {
  return sentenceParts(s)
    .map((p) => (p.text != null ? p.text : slotChipLabel(s, p.slot) ?? `[${PLACEHOLDER[s.slots[p.slot].type]}]`))
    .join('');
}

// 블록을 버릴 때 해체 — 고정(locked)이 아닌 모든 내부 블록을 분리해 배열로 반환
export function dismantle(b) {
  const out = [b];
  if (b.kind === 'sentence') {
    for (const sl of b.slots) {
      if (sl.block && !sl.locked) { out.push(...dismantle(sl.block)); sl.block = null; }
    }
  } else if (b.kind === 'op') {
    for (let i = 0; i < 2; i++) {
      if (b.slots[i]) { out.push(...dismantle(b.slots[i])); b.slots[i] = null; }
    }
  }
  return out;
}

// ─────────────────────────────────────────────
//  블록 동일성 (유형 + 값) — 재조합 / 선택지 리롤 중복 방지용
// ─────────────────────────────────────────────
export function blockSig(b) {
  if (!b) return '_';
  if (b.kind === 'word') return `w:${b.key}`;
  if (b.kind === 'op') return `o:${b.op}`;
  if (b.kind === 'number') {
    if (b.ntype === 'fixed') return `n:f:${b.v}`;
    if (b.ntype === 'range') return `n:r:${b.min}-${b.max}`;
    return `n:p:${b.p}`;
  }
  return `s:${b.template}:${b.slots.map((sl) => (sl.locked ? blockSig(sl.block) : '_')).join(',')}`;
}

const TYPE_GEN = {
  sentence: randomSentence,
  subject: randomSubject,
  change: randomChange,
  number: randomNumber,
  op: randomOp,
};

// 유형(colorKey)이 같은 무작위 블록. exclude 에 있는 시그니처는 가능한 한 피함
export function randomOfType(type, exclude = new Set()) {
  let b = null;
  for (let i = 0; i < 200; i++) {
    b = TYPE_GEN[type]();
    if (!exclude.has(blockSig(b))) return b;
  }
  return b;   // 가능한 조합이 모두 제외된 경우 (예: 변화 블록 3종을 모두 넣은 경우)
}

// 서로 다르고, exclude 와도 겹치지 않는 무작위 블록 n개
export function randomDistinctBlocks(n, exclude = new Set()) {
  const out = [];
  const seen = new Set(exclude);
  for (let i = 0; i < 300 && out.length < n; i++) {
    const b = randomBlock();
    const sig = blockSig(b);
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(b);
  }
  return out;
}
