// ─────────────────────────────────────────────
//  도감 미리보기 장면: 플레이어와 적을 고정된 자리에 두고 스킬만 계속 보여 줌
//  (맵 가운데의 장애물 없는 공터에서 진행)
// ─────────────────────────────────────────────
import { game, bump } from './state.js';
import { createSkill, getStats, triggerGoal, sample } from './skills.js';
import { makeSentence, makeWord, makeFixed } from './blocks.js';

export const SC_CENTER = { x: 0, z: 0 };
const PX = -3.4;   // 플레이어 자리 (공터 왼쪽)
const PV = 0.9;    // 플레이어를 화면에서 조금 아래로
// 장면 좌표 (u: 화면 오른쪽, v: 화면 아래쪽) → 월드 좌표 (아이소메트릭 카메라 기준)
const R2 = Math.SQRT1_2;
const W = (u, v) => ({ x: (u + v) * R2, z: (v - u) * R2 });

// 적 배치 (플레이어 오른쪽)
const CLUSTER = [[1.2, 0], [1.9, 0.75], [1.9, -0.75]];
const BEHIND = [[3.5, 0], [4.1, 1.1], [4.1, -1.1]];
const ARC = (n, r = 2.6) => Array.from({ length: n }, (_, i) => {
  const a = -0.9 + (1.8 * i) / Math.max(1, n - 1);
  return [PX + 1 + Math.cos(a) * r * 1.4, Math.sin(a) * r];
});
const RING = (n, r, cx = 0, cz = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cz + Math.sin((i / n) * Math.PI * 2) * r]);

// 스킬별 장면: 적 배치 / 체력 / 함께 쓰는 스킬 / 상태이상 부여 등 (lv: 보고 있는 레벨)
const SKILL_SCENES = {
  fireball: (lv) => ({ slots: lv >= 5 ? [...CLUSTER, ...BEHIND] : CLUSTER, hp: 2.2 }),
  chainLightning: (lv) => ({ slots: ARC(lv >= 3 ? 7 : 4), hp: 2.5 }),
  iceball: (lv) => ({ slots: RING(lv >= 5 ? 8 : 6, 2.2, 0.6, 0), hp: 3, iceballAt: [0.6, 0] }),
  flamethrower: (lv) => ({ slots: lv >= 3 ? [[PX + 1.6, 0], [PX + 2.6, 0.6], [PX + 2.6, -0.6], [PX + 3.8, 0], [PX + 4.6, 0.7]] : [[PX + 1.6, 0], [PX + 2.6, 0.6], [PX + 2.6, -0.6], [PX + 3.5, 0]], hp: 4 }),
  snowfall: () => ({ slots: RING(5, 0.9, 0.8, 0), type: 'yellow', hp: 1.2, pullBack: 0.6 }),
  lightningBeam: (lv) => ({ slots: lv >= 3 ? [[0, 1.6], [1.4, 0.4], [2.6, -1.2], [3.6, 0.8]] : [[-1.2, 0], [0.3, 0], [1.8, 0], [3.3, 0]], hp: 4 }),
  frostBarrier: () => ({ slots: RING(6, 1.5, PX, 0), hp: 3, pullBack: 1.2, special: 'barrier' }),
  magnet: () => ({ slots: [], special: 'magnet' }),
  fireAura: () => ({ slots: [...CLUSTER, ...BEHIND], hp: 0.9, companion: 'fireball', status: 'burn' }),
  frostAura: () => ({ slots: [...CLUSTER, ...BEHIND], hp: 0.9, companion: 'fireball', status: 'chill' }),
  lightningAura: () => ({ slots: [...CLUSTER, ...BEHIND, [0.5, 2], [0.5, -2]], hp: 0.9, companion: 'fireball', status: 'shock' }),
  enchant: () => ({ slots: [], special: 'enchant' }),
  triggerKill: () => ({ slots: [...CLUSTER, ...BEHIND], hp: 0.9, companion: 'fireball', special: 'trigger' }),
};

export class Showcase {
  constructor(sys) {
    this.sys = sys;   // { player, enemies, pickups, skillsRt, scene, enemySkills }
    this.cfg = null;
  }

  clearWorld() {
    const { enemies, pickups, skillsRt, scene, enemySkills } = this.sys;
    for (const e of enemies.list) { if (!e.alive) continue; e.alive = false; if (e.model) scene.remove(e.model.group); }
    pickups.gems.length = 0;
    skillsRt.clearAll();
    if (enemySkills) enemySkills.clear();
    skillsRt.iceballAt = null;
    game.showcase = false;
    game.skills.length = 0;
    game.buffs.length = 0;
  }

  // cfg: { kind: 'skill', key, level } | { kind: 'enemy', type }
  set(cfg) {
    const { player } = this.sys;
    this.cfg = cfg;
    this.clearWorld();
    game.showcase = true;   // 미리보기에서 처치한 적은 경험치를 떨어뜨리지 않음
    this.t = 0;
    this.slots = [];
    game.debug.god = true;   // 마나 소모 없음
    game.time = 60;
    player.kx = player.kz = 0;
    player.moveTarget = null;
    player.shield = 0;
    player.hidden = cfg.kind !== 'skill';   // 적 미리보기에는 플레이어 없음
    if (cfg.kind === 'skill') this.setSkill(cfg.key, cfg.level);
    else this.setEnemy(cfg.type);
  }

  setSkill(key, level) {
    const { player } = this.sys;
    const p0 = W(PX, PV);
    player.pos.set(p0.x, 0, p0.z);
    player.aim.set(R2, 0, -R2);   // 화면 오른쪽
    player.facing = Math.atan2(R2, -R2);
    const scn = SKILL_SCENES[key](level);
    this.scn = scn;
    if (scn.iceballAt) this.sys.skillsRt.iceballAt = W(...scn.iceballAt);   // 아이스볼은 적 무리 가운데에 고정
    if (scn.companion) {
      const c = createSkill(scn.companion);
      game.skills.push(c);
    }
    const sk = createSkill(key);
    sk.level = level;
    if (scn.special === 'trigger') {
      // 문장: 투사체 개수 + 3 증가 → 발동하면 파이어볼이 여러 개로 나감
      const s = makeSentence('SNC', false);
      s.slots[0].block = makeWord('projCount'); s.slots[1].block = makeFixed(3); s.slots[2].block = makeWord('inc');
      sk.sentences[0] = s;
    }
    game.skills.push(sk);
    this.sk = sk;
    bump();
    this.slots = scn.slots.map(([u, v]) => ({ ...W(u, v), e: null, wait: 0.2 + Math.random() * 0.3 }));
  }

  // 적 장면: 플레이어 없이 화면 오른쪽 아래로 계속 이동 (보이지 않는 공격 목표가 그 방향 앞에 있음)
  setEnemy(type) {
    const { player, enemies } = this.sys;
    this.enemyType = type;
    this.lead = type === 'boss' ? 7 : type === 'elite' ? 9 : 3;
    const e = enemies.spawn(type, -28, 0, 1);
    e.skillRate = 2.2;   // 기술을 더 자주 보여 줌
    this.enemy = e;
    player.pos.set(e.x + this.lead, 0, 0);
    this.snap = true;
  }

  // 미리보기 카메라가 바라볼 곳 (적 미리보기는 적을 따라감)
  focus() {
    if (this.cfg && this.cfg.kind === 'enemy' && this.enemy && this.enemy.alive) return { x: this.enemy.x + 1, z: this.enemy.z };
    return SC_CENTER;
  }

  update(dt) {
    if (!this.cfg) return;
    this.t += dt;
    const { player, enemies, pickups, skillsRt } = this.sys;
    if (this.cfg.kind === 'enemy') {
      const e = this.enemy;
      if (!e.alive) { this.setEnemy(this.enemyType); return; }
      e.hp = e.maxHp;
      // 기술을 쓰는 중이 아니면 목표는 항상 진행 방향(화면 오른쪽 아래) 앞쪽
      if (!e.hold) player.pos.set(e.x + this.lead, 0, e.z * 0.9);
      // 맵 끝에 가까워지면 출발점으로 되돌림 (소환된 적도 함께)
      if (e.x > 26 && !e.hold) {
        const dx = -54;
        for (const o of enemies.list) if (o.alive) o.x += dx;
        player.pos.x += dx;
        this.sys.enemySkills.clear();
        this.snap = true;
      }
      return;
    }
    // 스킬 장면: 고정된 자리의 적이 죽으면 잠시 뒤 같은 자리에 다시 생김
    const p0 = W(PX, PV);
    player.pos.set(p0.x, 0, p0.z);
    const scn = this.scn;
    for (const s of this.slots) {
      if (s.e && s.e.alive) {
        const e = s.e;
        e.speed = 0;
        // 밀려난 적은 천천히 제자리로
        const back = scn.pullBack || 0.4;
        e.x += (s.x - e.x) * Math.min(1, dt * back);
        e.z += (s.z - e.z) * Math.min(1, dt * back);
        if (scn.status === 'burn') e.burnT = Math.max(e.burnT, 1);
        if (scn.status === 'chill') e.chillT = Math.max(e.chillT, 1);
        if (scn.status === 'shock') e.shockT = Math.max(e.shockT, 1);
        continue;
      }
      if (s.e) { s.e = null; s.wait = 1.1; }
      s.wait -= dt;
      if (s.wait <= 0) {
        const e = enemies.spawn(scn.type || 'green', s.x, s.z, scn.hp || 2);
        e.speed = 0;
        s.e = e;
      }
    }
    const sk = this.sk;
    if (scn.special === 'barrier') {
      // 일정 시간마다 '피격' → 스택 소모, 보호막 + 냉기 폭발
      this.hitT = (this.hitT ?? 1.2) - dt;
      if (this.hitT <= 0) {
        this.hitT = 2.6;
        const st = getStats(sk);
        player.shield = sample(st.shield); player.shieldMax = Math.max(1, player.shield); player.shieldT = sample(st.duration);
        this.sys.fx.ring(player.pos.x, player.pos.z, 1.6, 0x6fd3ff, 0.4, 0.6);
        skillsRt.frostNova(sk);
      }
    }
    if (scn.special === 'magnet' || scn.special === 'enchant') {
      // 경험치 보석을 주위에 뿌림 (자석: 멀리 / 효과 부여: 가까이)
      this.gemT = (this.gemT ?? 0) - dt;
      if (this.gemT <= 0) {
        this.gemT = scn.special === 'magnet' ? 3.5 : 0.6;
        const n = scn.special === 'magnet' ? 14 : 3;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, d = scn.special === 'magnet' ? 3 + Math.random() * 3 : 1.6 + Math.random();
          const g = W(PX + 2 + Math.cos(a) * d, Math.sin(a) * d * 0.6);
          pickups.addGem(g.x, g.z, 3);
        }
        if (scn.special === 'magnet') sk.cd = 0.4;   // 뿌린 직후 끌어당김
      }
    }
    if (scn.special === 'trigger') {
      // 중첩을 빠르게 채워 발동 장면을 자주 보여 줌
      const goal = triggerGoal(sk);
      if (goal > 0 && !game.buffs.some((b) => b.key === 'triggerKill')) sk.stacks = Math.max(sk.stacks, goal * 0.9);
    }
  }
}
