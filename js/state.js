import { INV_W, INV_H, START_REROLLS, PAUSE_ON_MENU } from './config.js';

// 전역 게임 상태 (모든 시스템이 공유)
export const game = {
  state: 'start',        // start | playing | levelup | over | clear
  time: 0,
  kills: 0,
  level: 1,
  xp: 0,
  rerolls: START_REROLLS,
  inventory: new Array(INV_W * INV_H).fill(null),
  skills: [],
  popups: [],
  recomb: [null, null, null],
  buffs: [],
  totalXp: 0,            // 이번 전투에서 얻은 경험치 합계 (= 골드)
  elite: null,
  eliteIdx: 0,
  victoryT: 0,
  // 업그레이드 효과 (meta.computeMods 로 덮어씀)
  mods: { maxHp: 0, regenMinus: 0, regenAmount: 0, invuln: 0, speedMul: 1, dashCd: 0, dashDistMul: 1, startBlocks: 0,
    maxMana: 0, manaRegen: 0, dmgMul: 1, statusAdd: 0, manaCostMinus: 0, xpMul: 1, dropMul: 1, rerolls: 0, pickupMul: 1, goldMul: 1 },
  debug: { unlockSlots: false, noLevelUp: false, god: false },   // F8 디버그 모드
  debugOpen: false,
  showLabels: true,      // Z: 드랍 아이템 이름표 표시
  autoPickup: true,      // X: 경험치 외 아이템 자동 획득
  version: 0,            // 블록/스킬 구성이 바뀔 때마다 증가 → 스탯 캐시 무효화
  invOpen: false,
  skillsOpen: false,
  menuOpen: false,
  pendingLevels: 0,
  pendingBoxes: 0,
  boxChance: 0.01,
  bossSpawned: false,
  boss: null,
  timers: [],
  sys: {},
};

export function bump() { game.version++; }

export function isPaused() {
  if (game.state === 'victory') return false;
  if (game.state !== 'playing') return true;
  if (game.menuOpen || game.debugOpen) return true;
  if (PAUSE_ON_MENU && (game.invOpen || game.skillsOpen)) return true;
  return false;
}

export function schedule(delay, fn) { game.timers.push({ t: delay, fn }); }

export function updateTimers(dt) {
  const list = game.timers;
  for (let i = list.length - 1; i >= 0; i--) {
    const tm = list[i];
    tm.t -= dt;
    if (tm.t <= 0) { list.splice(i, 1); tm.fn(); }
  }
}

export function inventoryAdd(block) {
  const i = game.inventory.indexOf(null);
  if (i < 0) return false;
  game.inventory[i] = block;
  bump();
  return true;
}
