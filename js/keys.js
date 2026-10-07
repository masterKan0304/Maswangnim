// ─────────────────────────────────────────────
//  조작키 설정 (설정 > 조작에서 바꿀 수 있고 브라우저에 저장됨)
//  같은 키를 여러 조작에 넣어도 모두 동작함 (설정 화면에서 빨갛게 표시)
// ─────────────────────────────────────────────
export const KEY_ACTIONS = [
  ['up', '위로 이동', 'KeyW'],
  ['down', '아래로 이동', 'KeyS'],
  ['left', '왼쪽으로 이동', 'KeyA'],
  ['right', '오른쪽으로 이동', 'KeyD'],
  ['dash', '대시', 'Space'],
  ['skills', '스킬 창', 'KeyQ'],
  ['inv', '인벤토리 창', 'KeyE'],
  ['both', '스킬 및 인벤토리 창', 'Tab'],
  ['labels', '아이템 이름표 표시', 'KeyZ'],
  ['pickup', '아이템 자동 획득', 'KeyX'],
  ...Array.from({ length: 10 }, (_, i) => [`skill${i + 1}`, `스킬 ${i + 1} 수동 사용`, `Digit${(i + 1) % 10}`]),
];
export const DEFAULT_KEYS = Object.fromEntries(KEY_ACTIONS.map(([a, , c]) => [a, c]));

// 현재 할당 (action → code)
export const KB = { ...DEFAULT_KEYS };

export function loadKeys(saved) {
  Object.assign(KB, DEFAULT_KEYS, saved || {});
}

// 이 키로 실행되는 조작들
export function actionsFor(code) {
  const out = [];
  for (const a in KB) if (KB[a] === code) out.push(a);
  return out;
}
export const isBound = (code) => Object.values(KB).includes(code);

// 방향키: 다른 조작에 할당되지 않았다면 기본으로도 이동에 쓰임
const ARROWS = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
export function movePressed(keys, dir) {
  if (keys.has(KB[dir])) return true;
  const ar = ARROWS[dir];
  return keys.has(ar) && !isBound(ar);
}

// 할당할 수 있는 키: 알파벳, Space, 숫자, `, Shift, Ctrl, Alt, , . / ; ' [ ] - =, 방향키
const ALLOWED = new Set(['Space', 'Backquote', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight',
  'Comma', 'Period', 'Slash', 'Semicolon', 'Quote', 'BracketLeft', 'BracketRight', 'Minus', 'Equal',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
export const isAllowedKey = (code) => /^Key[A-Z]$/.test(code) || /^Digit[0-9]$/.test(code) || ALLOWED.has(code);

const NAMES = {
  Space: 'Space', Tab: 'Tab', Backquote: '`', Comma: ',', Period: '.', Slash: '/', Semicolon: ';', Quote: "'",
  BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '=',
  ShiftLeft: 'L Shift', ShiftRight: 'R Shift', ControlLeft: 'L Ctrl', ControlRight: 'R Ctrl', AltLeft: 'L Alt', AltRight: 'R Alt',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
};
export function keyName(code) {
  if (!code) return '-';
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  return NAMES[code] || code;
}
export const keyOf = (action) => keyName(KB[action]);

// 두 개 이상의 조작에 할당된 키
export function duplicateCodes() {
  const count = {};
  for (const c of Object.values(KB)) count[c] = (count[c] || 0) + 1;
  return new Set(Object.keys(count).filter((c) => count[c] > 1));
}
