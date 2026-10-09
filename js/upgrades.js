// ─────────────────────────────────────────────
//  업그레이드 트리 (번호는 기획 그림의 순번)
//  kind: 'n' 일반 / 'b' 파란 노드 (비싼 업그레이드) / 'r' 빨간 노드 (같은 묶음의 파란 노드를 모두 얻으면 크리스탈 1개로 구매)
//  위치는 layout() 이 반듯한 도형으로 계산 / costs: 레벨별 골드 / crystal: 크리스탈 비용
// ─────────────────────────────────────────────
import { ic } from './icons.js';

// 효과 (레벨마다 적용) — m: 업그레이드 효과 모음, l: 레벨
const FX = {
  train:   { icon: 'dumbbell', desc: '스킬 피해 +10%, 체력 +5', fx: (m, l) => { m.dmgMul += 0.1 * l; m.maxHp += 5 * l; } },
  xp5:     { icon: 'book', desc: '경험치 획득량 +5%', fx: (m, l) => { m.xpMul += 0.05 * l; } },
  xp30:    { icon: 'arrowUp', desc: '경험치 획득량 +30%', fx: (m, l) => { m.xpMul += 0.3 * l; } },
  dice:    { icon: 'dice', desc: '리롤 횟수 +3', fx: (m, l) => { m.rerolls += 3 * l; } },
  reach:   { icon: 'magnet', desc: '아이템 획득 범위 +30%', fx: (m, l) => { m.pickupMul += 0.3 * l; } },
  startLv: { icon: 'leap', desc: '스테이지 시작 시 레벨 업 +2', fx: (m, l) => { m.startLevels += 2 * l; } },
  hp5:     { icon: 'heart', desc: '체력 +5%', fx: (m, l) => { m.maxHpPct += 0.05 * l; } },
  hp30:    { icon: 'heart', desc: '체력 +30%', fx: (m, l) => { m.maxHpPct += 0.3 * l; } },
  iframe:  { icon: 'shield', desc: '피격 후 무적 지속 시간 +50%', fx: (m, l) => { m.invulnMul += 0.5 * l; } },
  tough:   { icon: 'lock', desc: '받는 피해 감소 +10%', fx: (m, l) => { m.dmgTakenMinus += 0.1 * l; } },
  regen:   { icon: 'leaf', desc: '초당 체력 재생 +0.5', fx: (m, l) => { m.regenPerSec += 0.5 * l; } },
  swift:   { icon: 'boot', desc: '이동 속도 +20%, 대시 중 무적, 대시 스킬 가속 +50', fx: (m, l) => { m.speedMul += 0.2 * l; m.dashInvuln = true; m.dashHaste += 50 * l; } },
  dmg5:    { icon: 'fire', desc: '스킬 피해 +5%', fx: (m, l) => { m.dmgMul += 0.05 * l; } },
  dmg30:   { icon: 'fire', desc: '스킬 피해 +30%', fx: (m, l) => { m.dmgMul += 0.3 * l; } },
  proj15:  { icon: 'beam', desc: '투사체 속도 +15%, 투사체 스킬 피해 +15%', fx: (m, l) => { m.projSpeedMul += 0.15 * l; m.projDmg += 0.15 * l; } },
  wide:    { icon: 'swirl', desc: '효과 범위 +15%, 사거리 +10%', fx: (m, l) => { m.areaMul += 0.15 * l; m.rangeMul += 0.1 * l; } },
  pen:     { icon: 'bolt', desc: '저항 무시 +10%', fx: (m, l) => { m.penPct += 0.1 * l; } },
  ace:     { icon: 'meteor', desc: '투사체 속도 +15%, 투사체 속도의 25%만큼 추가 피해, 투사체 관통 횟수 +1', fx: (m, l) => { m.projSpeedMul += 0.15 * l; m.projSpeedDmg += 0.25 * l; m.pierceAdd += l; } },
  mana3:   { icon: 'crystal', desc: '최대 마나 +3', fx: (m, l) => { m.maxMana += 3 * l; } },
  mana20:  { icon: 'crystal', desc: '최대 마나 +20%', fx: (m, l) => { m.maxManaPct += 0.2 * l; } },
  haste15: { icon: 'wind', desc: '스킬 가속 +15', fx: (m, l) => { m.haste += 15 * l; } },
  mregen:  { icon: 'swirl', desc: '초당 마나 재생 +1', fx: (m, l) => { m.manaRegen += l; } },
  mconv:   { icon: 'prism', desc: '스킬 사용 시 소모한 마나 1당 그 스킬의 피해 +3%', fx: (m, l) => { m.manaToDmg += 0.03 * l; } },
  arcane:  { icon: 'orb', desc: '최대 마나 +20%, 초당 마나 재생 -50%, 현재 마나 5당 스킬 피해 +2%', fx: (m, l) => { m.maxManaPct += 0.2 * l; m.manaRegenMul -= 0.5; m.manaPower += 0.02 * l; } },
  gold3:   { icon: 'coin', desc: '골드 획득량 +3%', fx: (m, l) => { m.goldMul += 0.03 * l; } },
  gold10:  { icon: 'coin', desc: '골드 획득량 +10%', fx: (m, l) => { m.goldMul += 0.1 * l; } },
  recomb:  { icon: 'flask', desc: '재조합 시 25% 확률로 블록 획득량 +1', fx: (m, l) => { m.recombBonus += 0.25 * l; } },
  elite:   { icon: 'gift', desc: '정예 몬스터 처치 시 추가 아이템 +1', fx: (m, l) => { m.eliteDrops += l; } },
  drop3:   { icon: 'bag', desc: '아이템 획득률 +3%', fx: (m, l) => { m.dropMul += 0.03 * l; } },
  quick:   { icon: 'scroll', desc: '스테이지 시작 시 무작위 완성된 문장 블록 +5', fx: (m, l) => { m.startSentences += 5 * l; } },
  wealth:  { icon: 'coin', desc: '골드 획득량 +5%, 아이템 획득률 +5%', fx: (m, l) => { m.goldMul += 0.05 * l; m.dropMul += 0.05 * l; } },
  manaEff: { icon: 'lotus', desc: '최대 마나 +2%, 소모한 마나의 5%만큼 마나 회복', fx: (m, l) => { m.maxManaPct += 0.02 * l; m.manaRefund += 0.05 * l; } },
  areaUp:  { icon: 'snowcloud', desc: '스킬 피해 +5%, 효과 범위 +5%', fx: (m, l) => { m.dmgMul += 0.05 * l; m.areaMul += 0.05 * l; } },
  projUp:  { icon: 'beam', desc: '스킬 피해 +5%, 투사체 속도 +5%, 투사체 지속 시간 +5%', fx: (m, l) => { m.dmgMul += 0.05 * l; m.projSpeedMul += 0.05 * l; m.projLifeMul += 0.05 * l; } },
  hasteUp: { icon: 'wind', desc: '스킬 피해 +5%, 스킬 가속 +3', fx: (m, l) => { m.dmgMul += 0.05 * l; m.haste += 3 * l; } },
  survive: { icon: 'bandage', desc: '체력 +5, 적 10마리 처치마다 체력 1 회복', fx: (m, l) => { m.maxHp += 5 * l; m.killHeal += l; } },
  xpFast:  { icon: 'book', desc: '경험치 획득량 +5%, 레벨 업에 필요한 경험치 -2%', fx: (m, l) => { m.xpMul += 0.05 * l; m.xpNeedMinus += 0.02 * l; } },
};

const G3a = [300, 350, 400], G3b = [400, 500, 600], G3c = [500, 650, 800], G1 = [1500];
// [번호, 이름, 효과, 종류, 비용, (그림 좌표 — 참고용)]
const RAW = [
  [1, '기초 훈련', 'train', 'n', [200, 300, 400], 484, 545],
  [2, '경험치 증가', 'xp5', 'n', G3a, 383, 545], [3, '경험치 증가', 'xp5', 'n', G3a, 295, 545],
  [4, '빠른 경험', 'xp30', 'b', G1, 205, 538], [6, '더 많은 주사위', 'dice', 'b', G1, 75, 545], [8, '자력 확장', 'reach', 'b', G1, 145, 428],
  [5, '경험치 증가', 'xp5', 'n', G3b, 140, 545], [7, '경험치 증가', 'xp5', 'n', G3b, 102, 488], [9, '경험치 증가', 'xp5', 'n', G3b, 182, 462],
  [10, '빠른 출발', 'startLv', 'r', 'c', 140, 495],
  [11, '체력 증가', 'hp5', 'n', G3a, 405, 480], [12, '체력 증가', 'hp5', 'n', G3a, 328, 420],
  [13, '체력 증폭', 'hp30', 'b', G1, 255, 378], [15, '무적 지속', 'iframe', 'b', G1, 140, 297], [17, '단단함', 'tough', 'b', G1, 225, 207], [19, '재생력', 'regen', 'b', G1, 342, 272],
  [14, '체력 증가', 'hp5', 'n', G3b, 192, 345], [16, '체력 증가', 'hp5', 'n', G3b, 182, 250], [18, '체력 증가', 'hp5', 'n', G3b, 285, 232], [20, '체력 증가', 'hp5', 'n', G3b, 300, 333],
  [21, '재빠른 움직임', 'swift', 'r', 'c', 240, 285],
  [22, '피해 증가', 'dmg5', 'n', G3a, 484, 452], [23, '피해 증가', 'dmg5', 'n', G3a, 484, 360],
  [24, '피해 증폭', 'dmg30', 'b', G1, 484, 272], [26, '투사체 강화', 'proj15', 'b', G1, 386, 186], [28, '넓은 공격', 'wide', 'b', G1, 484, 100], [30, '저항 관통', 'pen', 'b', G1, 582, 186],
  [25, '피해 증폭', 'dmg5', 'n', G3b, 418, 246], [27, '피해 증폭', 'dmg5', 'n', G3b, 418, 126], [29, '피해 증폭', 'dmg5', 'n', G3b, 550, 126], [31, '피해 증폭', 'dmg5', 'n', G3b, 550, 246],
  [32, '비장의 한 발', 'ace', 'r', 'c', 484, 186],
  [33, '마나 증가', 'mana3', 'n', G3a, 555, 476], [34, '마나 증가', 'mana3', 'n', G3a, 630, 408],
  [35, '마나 증폭', 'mana20', 'b', G1, 705, 372], [37, '스킬 순환', 'haste15', 'b', G1, 612, 272], [39, '마나 재생', 'mregen', 'b', G1, 718, 185], [41, '마나 전환', 'mconv', 'b', G1, 818, 275],
  [36, '마나 증가', 'mana3', 'n', G3b, 652, 322], [38, '마나 증가', 'mana3', 'n', G3b, 660, 228], [40, '마나 증가', 'mana3', 'n', G3b, 768, 228], [42, '마나 증가', 'mana3', 'n', G3b, 765, 322],
  [43, '마나 비전', 'arcane', 'r', 'c', 716, 268],
  [45, '골드 증가', 'gold3', 'n', G3a, 588, 545], [46, '골드 증가', 'gold3', 'n', G3a, 672, 540],
  [47, '골드 증폭', 'gold10', 'b', G1, 762, 522], [49, '재조합 활용', 'recomb', 'b', G1, 818, 405], [51, '보상 증폭', 'elite', 'b', G1, 885, 518],
  [48, '획득량 증가', 'drop3', 'n', G3b, 790, 462], [50, '획득량 증가', 'drop3', 'n', G3b, 852, 462], [52, '획득량 증가', 'drop3', 'n', G3b, 825, 532],
  [53, '빠른 시작', 'quick', 'r', 'c', 822, 482],
  [54, '재물', 'wealth', 'n', G3c, 940, 437], [55, '재물', 'wealth', 'n', G3c, 925, 302],
  [56, '마나 효율', 'manaEff', 'n', G3c, 862, 180], [57, '마나 효율', 'manaEff', 'n', G3c, 742, 64],
  [58, '범위 강화', 'areaUp', 'n', G3c, 612, 26], [59, '투사체 강화', 'projUp', 'n', G3c, 484, 12], [60, '스킬 가속 강화', 'hasteUp', 'n', G3c, 356, 26],
  [61, '생존력 증가', 'survive', 'n', G3c, 222, 64], [62, '생존력 증가', 'survive', 'n', G3c, 104, 180],
  [63, '빠른 경험', 'xpFast', 'n', G3c, 40, 302], [64, '빠른 경험', 'xpFast', 'n', G3c, 26, 437],
];
// ── 배치: 그림의 구조를 반듯한 도형으로 다시 계산 (1번이 원점, 위쪽이 -y) ──
// 왼쪽부터 삼각형 > 사각형(마름모) > 원 > 사각형 > 삼각형, 바깥은 반원
function layout() {
  const P = {};
  const mid = (a, b) => ({ x: (P[a].x + P[b].x) / 2, y: (P[a].y + P[b].y) / 2 });
  const path = (from, to, ids) => ids.forEach((id, i) => {
    const t = (i + 1) / (ids.length + 1);
    P[id] = { x: P[from].x + (P[to].x - P[from].x) * t, y: P[from].y + (P[to].y - P[from].y) * t };
  });
  P[1] = { x: 0, y: 0 };
  // 삼각형 (밑변이 바닥에 놓인 정삼각형) — 왼쪽: 4 오른쪽 아래, 6 왼쪽 아래, 8 위 / 오른쪽은 대칭
  const S = 430, H = S * Math.sqrt(3) / 2, TX = 600;
  P[4] = { x: -TX, y: 0 }; P[6] = { x: -TX - S, y: 0 }; P[8] = { x: -TX - S / 2, y: -H };
  P[47] = { x: TX, y: 0 }; P[51] = { x: TX + S, y: 0 }; P[49] = { x: TX + S / 2, y: -H };
  P[10] = { x: -TX - S / 2, y: -H / 3 }; P[53] = { x: TX + S / 2, y: -H / 3 };
  Object.assign(P, { 5: mid(4, 6), 7: mid(6, 8), 9: mid(8, 4), 52: mid(51, 47), 48: mid(47, 49), 50: mid(49, 51) });
  // 마름모 (꼭짓점이 위/아래/좌/우) — 아래 꼭짓점이 1번에서 140° / 40° 방향, 거리 600
  const RD = 205;
  const dia = (cx, cy, [b, l, t, r], red, [bl, tl, tr, br]) => {
    P[b] = { x: cx, y: cy + RD }; P[l] = { x: cx - RD, y: cy }; P[t] = { x: cx, y: cy - RD }; P[r] = { x: cx + RD, y: cy };
    P[red] = { x: cx, y: cy };
    P[bl] = mid(b, l); P[tl] = mid(l, t); P[tr] = mid(t, r); P[br] = mid(r, b);
  };
  const ex = 600 * Math.cos(40 * Math.PI / 180), ey = 600 * Math.sin(40 * Math.PI / 180);
  dia(-ex, -ey - RD, [13, 15, 17, 19], 21, [14, 16, 18, 20]);
  dia(ex, -ey - RD, [35, 37, 39, 41], 43, [36, 38, 40, 42]);
  // 원 (위쪽 가운데)
  const DC = 810, RC = 205, cy = -DC;
  P[24] = { x: 0, y: cy + RC }; P[26] = { x: -RC, y: cy }; P[28] = { x: 0, y: cy - RC }; P[30] = { x: RC, y: cy }; P[32] = { x: 0, y: cy };
  const d45 = RC * Math.SQRT1_2;
  P[25] = { x: -d45, y: cy + d45 }; P[27] = { x: -d45, y: cy - d45 }; P[29] = { x: d45, y: cy - d45 }; P[31] = { x: d45, y: cy + d45 };
  // 1번에서 각 묶음으로 가는 길 (노드 2개씩 같은 간격)
  path(1, 4, [2, 3]); path(1, 13, [11, 12]); path(1, 24, [22, 23]); path(1, 35, [33, 34]); path(1, 47, [45, 46]);
  // 바깥 반원: 64(왼쪽) → 54(오른쪽), 같은 각도 간격
  const RA = 1150, arc = [64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54];
  arc.forEach((id, i) => {
    const ang = (170 - i * 16) * Math.PI / 180;
    P[id] = { x: Math.cos(ang) * RA, y: -Math.sin(ang) * RA };
  });
  return P;
}
const POS = layout();
export const NODES = RAW.map(([no, name, eff, kind, cost]) => ({
  id: `u${no}`, no, name, eff, kind, ...FX[eff], iconHtml: ic(FX[eff].icon),
  costs: cost === 'c' ? null : cost, crystal: cost === 'c' ? 1 : 0, max: cost === 'c' ? 1 : cost.length,
  x: Math.round(POS[no].x), y: Math.round(POS[no].y),
}));
export const NODE = Object.fromEntries(NODES.map((n) => [n.id, n]));

// 연결선 (어느 한쪽을 얻으면 다른 쪽을 살 수 있음)
const E = [
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 4], [7, 64],
  [1, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19], [19, 20], [20, 13], [16, 62],
  [1, 22], [22, 23], [23, 24], [24, 25], [25, 26], [26, 27], [27, 28], [28, 29], [29, 30], [30, 31], [31, 24], [28, 59],
  [1, 33], [33, 34], [34, 35], [35, 36], [36, 37], [37, 38], [38, 39], [39, 40], [40, 41], [41, 42], [42, 35], [40, 56],
  [1, 45], [45, 46], [46, 47], [47, 48], [48, 49], [49, 50], [50, 51], [51, 52], [52, 47], [50, 54],
  [64, 63], [63, 62], [62, 61], [61, 60], [60, 59], [59, 58], [58, 57], [57, 56], [56, 55], [55, 54],
];
export const EDGES = E.map(([a, b]) => [`u${a}`, `u${b}`]);
// 빨간 노드: 묶음 안의 파란 노드를 모두 얻어야 함
export const CLUSTERS = { u10: ['u4', 'u6', 'u8'], u21: ['u13', 'u15', 'u17', 'u19'], u32: ['u24', 'u26', 'u28', 'u30'], u43: ['u35', 'u37', 'u39', 'u41'], u53: ['u47', 'u49', 'u51'] };
export const ROOT = 'u1';

const NEIGHBORS = {};
for (const [a, b] of EDGES) { (NEIGHBORS[a] ||= []).push(b); (NEIGHBORS[b] ||= []).push(a); }
export const neighborsOf = (id) => NEIGHBORS[id] || [];

// 업그레이드 효과 모음 (기본값)
export function emptyMods() {
  return {
    dmgMul: 1, maxHp: 0, maxHpPct: 0, maxHpMul: 1, xpMul: 1, rerolls: 0, pickupMul: 1, startLevels: 0,
    invulnMul: 0, dmgTakenMinus: 0, regenPerSec: 0, speedMul: 1, dashInvuln: false, dashHaste: 0,
    projSpeedMul: 1, projDmg: 0, areaMul: 1, rangeMul: 1, penPct: 0, projSpeedDmg: 0, pierceAdd: 0,
    maxMana: 0, maxManaPct: 0, haste: 0, manaRegen: 0, manaRegenMul: 0, manaToDmg: 0, manaPower: 0,
    goldMul: 1, recombBonus: 0, eliteDrops: 0, dropMul: 1, startSentences: 0, manaRefund: 0, projLifeMul: 1, killHeal: 0, xpNeedMinus: 0,
    // 이전 효과 (다른 곳에서 쓰는 기본값)
    baseDmgMul: 1, regenMinus: 0, regenAmount: 0, invuln: 0, dashCd: 0, dashDistMul: 1, startBlocks: 0, statusAdd: 0, manaCostMinus: 0,
  };
}

// 이전 업그레이드 트리에서 쓴 골드 (새 트리로 바뀌면 모두 돌려줌)
export const OLD_COST = { core: 20, vital: 25, regen: 40, guard: 35, heal: 360, iframe: 360, vigor: 480, swift: 25, blink: 40, leap: 35, prepared: 70, vessel: 25, flow: 35, power: 40, element: 60, focus: 60, study: 25, collector: 35, foresight: 45, reach: 40, greed: 60 };
