import { ic } from './icons.js';
import * as THREE from 'three';
import { WORLD_HALF, STAT_UNIT as U, PROJ_SPEED_UNIT as PS, PROJ_SIZE_UNIT as PZ, STATUS, ELEMENT_DMG } from './config.js';
import { game, schedule } from './state.js';
import { getStats, computeStats, sample, sampleInt, avg, statusProb, maxStacks, areaFactor, ATTACK_SKILLS, enchantReq, triggerGoal, completeSentences } from './skills.js';
import { makeGlowSprite } from './effects.js';
import { jitter, createPlayer } from './models.js';
import { sfx } from './audio.js';

const DEG = Math.PI / 180;
const ELEMS = ['fire', 'ice', 'lightning'];
const ZONE_COLOR = { fire: 0xff6a1a, ice: 0x7fd8ff, lightning: 0xffe066 };

class Pool {
  constructor(scene, factory) { this.scene = scene; this.factory = factory; this.free = []; }
  get() {
    let m = this.free.pop();
    if (!m) { m = this.factory(); this.scene.add(m); }
    m.visible = true;
    return m;
  }
  put(m) { m.visible = false; this.free.push(m); }
}

// 투사체 개수에 따른 발사각: 0 → 좌20 → 우20 → 좌40 → 우40 ...
function spreadAngle(base, i) {
  if (i === 0) return base;
  const k = Math.ceil(i / 2);
  const sign = i % 2 === 1 ? -1 : 1;   // atan2(z,x) 기준 감소 방향 = 진행 방향의 왼쪽
  return base + sign * k * 20 * DEG;
}

// 점 (px,pz) 와 선분 a-b 사이 거리
function segDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

export class SkillRuntime {
  constructor(scene, fx, enemies, player) {
    this.scene = scene; this.fx = fx; this.enemies = enemies; this.player = player;
    this.projs = [];
    this.iceballs = [];
    this.casts = [];
    this.zones = [];
    this.snowballs = [];
    this.beams = [];
    this.flames = [];   // 불길을 뿜는 중인 스킬 (목록에서 빠진 스킬의 불길도 끝까지 관리)
    this.winds = [];    // 솔바람
    this.vines = [];    // 속박된 적을 감싼 덩굴
    this.dolls = [];    // 짚 인형
    this.honeys = [];   // 꿀을 모으는 중인 스킬

    // 파이어볼: 울퉁불퉁한 검붉은 돌 + 틈 사이로 비치는 용암 핵 (뜨거운 운석)
    const rockGeo = jitter(new THREE.DodecahedronGeometry(0.5, 0), 0.32, 41);
    const lavaGeo = new THREE.IcosahedronGeometry(0.43, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a2c20, emissive: 0x8a2a08, emissiveIntensity: 0.55, roughness: 0.85, flatShading: true });
    const lavaMat = new THREE.MeshBasicMaterial({ color: 0xffa43a });
    this.firePool = new Pool(scene, () => {
      const g = new THREE.Group();
      const rock = new THREE.Group();
      rock.add(new THREE.Mesh(lavaGeo, lavaMat));
      const r = new THREE.Mesh(rockGeo, rockMat);
      r.castShadow = true;
      rock.add(r);
      g.add(rock);
      g.userData.shell = rock;
      g.add(makeGlowSprite(0xff6a1a, 1.5, 0.45));
      return g;
    });
    const iceGeo = new THREE.OctahedronGeometry(0.5, 0).scale(0.8, 0.8, 2.2);
    const iceMat = new THREE.MeshBasicMaterial({ color: 0xd8f8ff });
    this.icePool = new Pool(scene, () => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(iceGeo, iceMat));
      g.add(makeGlowSprite(0x7fdcff, 2.2, 0.6));
      return g;
    });
    // 이파리: 납작하고 길쭉한 잎사귀
    const leafGeo = new THREE.OctahedronGeometry(0.5, 0).scale(0.55, 0.14, 1.5);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5cc85a, emissive: 0x1f6a22, emissiveIntensity: 0.5, roughness: 0.5, flatShading: true });
    this.leafPool = new Pool(scene, () => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(leafGeo, leafMat);
      m.castShadow = true;
      g.add(m);
      g.userData.shell = m;
      g.add(makeGlowSprite(0x8ff07a, 1.4, 0.45));
      return g;
    });
    // 뿌리: 세로로 선 고리(반쯤 땅에 묻힌 뿌리)들이 차례로 솟았다 들어가며 나아감
    const rootRingGeo = new THREE.TorusGeometry(0.62, 0.15, 6, 16);
    const rootMats = [0x7a5a2a, 0x6a4a22, 0x8a6a34].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true }));
    const vineLeafGeo = new THREE.SphereGeometry(0.22, 5, 3).scale(1.6, 0.3, 0.8);
    const vineLeafMat = new THREE.MeshStandardMaterial({ color: 0x7ed957, roughness: 0.7, flatShading: true });
    this.rootPool = new Pool(scene, () => {
      const g = new THREE.Group();   // 보이지 않는 머리 (뿌리 모습은 트레일로)
      g.userData.shell = g;
      return g;
    });
    // 뿌리 트레일 고리 (재사용)
    this.trailPool = new Pool(scene, () => {
      const r = new THREE.Mesh(rootRingGeo, rootMats[Math.floor(Math.random() * 3)]);
      r.castShadow = true;
      if (Math.random() < 0.5) {
        const lf = new THREE.Mesh(vineLeafGeo, vineLeafMat);
        lf.position.set(0, 0.7, 0); lf.rotation.z = 0.5;
        r.add(lf);
      }
      return r;
    });
    this.rootTrail = [];
    this.vineGeo = new THREE.TorusGeometry(1, 0.12, 5, 14);
    this.vineMat = new THREE.MeshStandardMaterial({ color: 0x6a8a2a, roughness: 0.8, flatShading: true });
    // 솔바람: 수평으로 도는 바람 고리
    this.windRingGeo = new THREE.TorusGeometry(1, 0.08, 6, 28);
    this.windDiscGeo = new THREE.CircleGeometry(1, 24);
    this.windFunnelGeo = new THREE.CylinderGeometry(1.05, 0.28, 1.9, 18, 1, true).translate(0, 0.95, 0);
    this.iceballGeo = new THREE.IcosahedronGeometry(0.5, 0);
    this.shardGeo = new THREE.OctahedronGeometry(0.09, 0).scale(1, 2, 1);
    this.snowGeo = jitter(new THREE.IcosahedronGeometry(0.5, 1), 0.08, 77);
  }

  // ─────────────────────────────────────────
  //  피해 처리: 치명타 → 주 속성 피해 → 추가 속성 피해 (저항 / 저항 무시 / 상태이상)
  //  o.base: 기본 피해 (기본값 = 스킬 피해량 표본), o.mul: 배율, o.statusRatio: 상태이상 확률 배율
  //  o.infuse: 지대에서 얻은 속성 피해 { fire: {min,max,pct}, ... }
  // ─────────────────────────────────────────
  deal(e, sk, st, o = {}) {
    if (!e.alive) return;
    const el = sk.def.element;
    const crit = Math.random() * 100 < sample(st.critChance);
    const cm = crit ? 1 + sample(st.critDamage) / 100 : 1;   // 치명타 피해량 100% → 피해 2배
    const m = game.mods;
    const pen = { pct: avg(st.penPct) + (m.penPct || 0), flat: sample(st.penetration) };
    let mul = o.mul ?? 1;
    if (m.manaPower) mul *= 1 + m.manaPower * Math.floor(this.player.mana / 5);                    // 마나 비전: 현재 마나 5당
    if (st.manaDmg) mul *= st.manaDmg;                                                               // 마나 전환: 이번 시전에 쓴 마나만큼
    const main = (o.base ?? sample(st.damage)) * mul;   // 스킬 피해 업그레이드는 능력치(st.damage)에 이미 들어 있음
    const sp = statusProb(st, o.statusRatio ?? 1);
    const common = { pen, crit, src: sk, st };
    const critAdd = crit && st.critFlat ? sample(st.critFlat) : 0;   // 치명타: 피해 × 배율 + 추가 피해
    this.enemies.damage(e, main * cm + critAdd, { ...common, element: el, status: sp, kx: o.kx || 0, kz: o.kz || 0 });
    for (const x of ELEMS) {
      let v = 0;
      const k = ELEMENT_DMG[x];
      if (x !== el && st[k].max > 0) v += sample(st[k]) * mul;
      const inf = o.infuse && o.infuse[x];
      if (inf) v += inf.pct ? main * sample(inf) : sample(inf) * mul;
      // 다른 속성의 추가 피해: 상태이상 발생율 절반 (o.infuseStatus 가 있으면 그 확률)
      const stat = x === el ? 0 : inf && o.infuseStatus != null ? o.infuseStatus : sp * 0.5;
      if (v > 0 && e.alive) this.enemies.damage(e, v * cm, { ...common, element: x, status: stat });
    }
  }

  // ── 시전 ─────────────────────────────
  update(dt) {
    for (const sk of game.skills) {
      if (sk.def.passive) { if (sk.key === 'frostBarrier') this.updateBarrier(sk, dt); continue; }
      if (sk.flame || sk.honey) continue;           // 화염 방사 / 꿀 모으는 중: 끝난 뒤에 쿨타임 시작
      if (sk.cd > 0) sk.cd -= dt;
      if (sk.cd <= 0 && sk.auto) this.tryCast(sk, false);
    }
    // 버프 (발동 : 처치)
    for (let i = game.buffs.length - 1; i >= 0; i--) {
      const b = game.buffs[i];
      b.t -= dt;
      if (b.t <= 0) game.buffs.splice(i, 1);
    }
    this.updateFlames(dt);
    for (let i = this.casts.length - 1; i >= 0; i--) {
      const c = this.casts[i];
      c.t -= dt;
      if (c.t <= 0) { this.casts.splice(i, 1); this.execute(c.sk, c.st); }
    }
    this.updateZones(dt);
    this.updateProjectiles(dt);
    this.updateIceballs(dt);
    this.updateSnowballs(dt);
    this.updateBeams(dt);
    this.updateWinds(dt);
    this.updateVines(dt);
    this.updateRootTrail(dt);
    this.updateDolls(dt);
    this.updateHoneys(dt);
  }

  updateBarrier(sk, dt) {
    const st = getStats(sk);
    if (!sk.stackNeed) sk.stackNeed = sample(st.cooldown);
    if (sk.stacks >= maxStacks(sk)) { sk.stackTimer = 0; return; }
    sk.stackTimer += dt;
    if (sk.stackTimer >= sk.stackNeed) {
      sk.stacks++;
      sk.stackTimer = 0;
      sk.stackNeed = sample(st.cooldown);
    }
  }

  tryCast(sk, manual) {
    if (sk.def.passive || sk.flame || sk.honey) return false;
    if (sk.cd > 0) return false;
    let st = getStats(sk);
    const p = this.player.pos;
    const need = { roots: manual ? 0 : 20, strawDoll: manual ? 0 : 10, honeyBomb: manual ? 0 : 3, leafCut: manual ? 0 : 20, pineWind: manual ? 0 : 20, nature: manual ? 0 : sample(st.area) / U / 2, fireball: manual ? 0 : 20, chainLightning: sample(st.range) / U, snowfall: sample(st.range) / U, flamethrower: manual ? 0 : (sample(st.area) / U) * 1.3, lightningBeam: manual ? 0 : 14 }[sk.key];
    if (need && !this.enemies.anyInRange(p.x, p.z, need)) {
      if (manual) game.sys.ui.toast('사거리 안에 적이 없습니다', 'warn');
      return false;
    }
    // 마나
    const cost = game.debug.god ? 0 : Math.max(0, sample(st.manaCost) - game.mods.manaCostMinus);
    if (this.player.mana < cost) {
      if (manual) { game.sys.ui.toast('마나가 부족합니다', 'warn'); sfx('error'); }
      return false;
    }
    this.player.mana -= cost;
    if (cost > 0 && game.mods.manaRefund) this.player.mana = Math.min(this.player.maxMana, this.player.mana + cost * game.mods.manaRefund);   // 마나 효율
    if (cost > 0 && game.mods.manaToDmg) st = { ...st, manaDmg: 1 + game.mods.manaToDmg * cost };    // 마나 전환: 쓴 마나 1당 +3%
    // 발동 : 처치 버프 — 다음 공격 스킬에 문장 효과 추가 적용
    if (ATTACK_SKILLS.includes(sk.key)) {
      const bi = game.buffs.findIndex((b) => b.key === 'triggerKill');
      if (bi >= 0) {
        const b = game.buffs[bi];
        st = computeStats(sk, b.sentences, b.scale).stats;
        b.charges--;
        if (b.charges <= 0) game.buffs.splice(bi, 1);
        this.fx.ring(p.x, p.z, 1.4, 0xc07cff, 0.45, 0.6);
        this.fx.particles.burst(p.x, 1.0, p.z, 14, [0xc07cff, 0xe9d4ff], { speed: 2.5, size: 0.08, life: 0.4, up: 2 });
      }
    }
    const castTime = (sk.def.castTime || 0) / Math.max(0.1, sample(st.castSpeed));
    sk.cd = sample(st.cooldown) + castTime;
    sk.cdMax = sk.cd;
    this.casts.push({ sk, t: castTime, st });
    this.player.castPulse(sk.def.color);
    return true;
  }

  execute(sk, st) {
    if (sk.key === 'fireball') this.castFireball(sk, st);
    else if (sk.key === 'chainLightning') this.castLightning(sk, st);
    else if (sk.key === 'iceball') { this.castIceball(sk, st); if (sk.level >= 5) this.castIceball(sk, st); }
    else if (sk.key === 'magnet') this.castMagnet(st);
    else if (sk.key === 'flamethrower') this.startFlame(sk, st);
    else if (sk.key === 'snowfall') this.castSnowfall(sk, st);
    else if (sk.key === 'lightningBeam') this.castBeam(sk, st);
    else if (sk.key === 'leafCut') this.castLeaf(sk, st);
    else if (sk.key === 'nature') this.castNature(sk, st);
    else if (sk.key === 'pineWind') this.castWind(sk, st);
    else if (sk.key === 'roots') this.castRoots(sk, st);
    else if (sk.key === 'strawDoll') this.castDolls(sk, st);
    else if (sk.key === 'honeyBomb') this.startHoney(sk, st);
  }

  // ── 옭아매는 뿌리 ──
  castRoots(sk, st) {
    sfx('magnet');
    const p = this.player;
    const near = this.enemies.nearestN(p.pos.x, p.pos.z, 30, 1)[0];
    const base = near ? Math.atan2(near.z - p.pos.z, near.x - p.pos.x) : Math.atan2(p.aim.z, p.aim.x);
    const n = sampleInt(st.projCount);
    const gen = () => ({ size: sample(st.projSize) / PZ, speed: sample(st.projSpeed) * PS, life: sample(st.duration), pierce: sampleInt(st.pierce) });
    for (let i = 0; i < n; i++) {
      const a = spreadAngle(base, i);
      this.spawnRoot(sk, st, gen, p.pos.x + Math.cos(a) * 0.4, p.pos.z + Math.sin(a) * 0.4, Math.cos(a), Math.sin(a), { chains: sampleInt(st.chains), primary: true, homeTarget: near || null });
    }
  }

  spawnRoot(sk, st, gen, x, z, dx, dz, o = {}) {
    return this.spawnProj({
      kind: 'root', sk, ...gen(), gen, x, z, y: 0.22, dx, dz, st, root: true,
      home: sk.level >= 3, tracking: sk.level >= 3, ...o,
    });
  }

  // 관통할 때: 뿌리 5레벨 — 처음 발사된 뿌리가 처음 관통하면 뿌리 3개가 더 뻗어 나감 (관통 횟수 물려받음)
  onPierce(p, e) {
    if (p.kind !== 'root' || !p.primary || p.split5 || p.sk.level < 5) return;
    p.split5 = true;
    const base = Math.atan2(p.dz, p.dx);
    for (const off of [-50, 50, 180]) {
      const a = base + off * DEG;
      this.spawnRoot(p.sk, p.st, () => ({ ...p.gen(), pierce: p.pierce }), p.x, p.z, Math.cos(a), Math.sin(a), { hit: new Set([e]), primary: false, homeTarget: null });
    }
    this.fx.ring(p.x, p.z, 0.9, 0x7ed957, 0.3);
  }

  updateRootTrail(dt) {
    for (let i = this.rootTrail.length - 1; i >= 0; i--) {
      const tr = this.rootTrail[i];
      tr.t += dt;
      const k = tr.t / tr.life;
      if (k >= 1) { this.trailPool.put(tr.mesh); this.rootTrail.splice(i, 1); continue; }
      const up = Math.sin(k * Math.PI);   // 솟았다가 들어감
      tr.mesh.position.y = -0.32 + up * 0.32;
      tr.mesh.scale.setScalar(tr.s * (0.7 + 0.35 * up));
    }
  }

  // 속박: 덩굴이 적을 감쌈
  bind(e, t) {
    e.rootT = Math.max(e.rootT, t);
    let v = this.vines.find((x) => x.e === e);
    if (!v) {
      const mesh = new THREE.Mesh(this.vineGeo, this.vineMat);
      mesh.rotation.x = Math.PI / 2;
      this.scene.add(mesh);
      v = { e, mesh };
      this.vines.push(v);
    }
  }

  updateVines(dt) {
    for (let i = this.vines.length - 1; i >= 0; i--) {
      const v = this.vines[i], e = v.e;
      if (!e.alive || e.rootT <= 0) { this.scene.remove(v.mesh); this.vines.splice(i, 1); continue; }
      const k = Math.min(1, e.rootT / 0.3);
      v.mesh.position.set(e.x, 0.15 + e.r * 0.3, e.z);
      v.mesh.scale.set(e.r * 1.05, e.r * 1.05, e.r * 1.05 * k);
      v.mesh.rotation.z += dt * 1.5;
    }
  }

  // ── 짚 인형: 적을 끌어들여 대신 맞고, 시간이 지나거나 부서지면 폭발 ──
  castDolls(sk, st) {
    sfx('block');
    const n = sk.level >= 5 ? 2 : 1;
    const p = this.player.pos;
    const obs = game.sys.world && game.sys.world.obstacles;
    const range = sample(st.range) / U;
    for (let i = 0; i < n; i++) {
      let x = p.x, z = p.z;
      // 미리보기: 끌어들이는 모습이 잘 보이도록 적 근처에 세움
      const near = game.demo ? this.enemies.nearestN(p.x, p.z, range, 6) : [];
      if (near.length) {
        const e = near[Math.floor(Math.random() * near.length)];
        const a = Math.random() * Math.PI * 2;
        this.spawnDoll(sk, st, e.x + Math.cos(a) * 1.4, e.z + Math.sin(a) * 1.4);
        continue;
      }
      for (let k = 0; k < 12; k++) {
        const a = Math.random() * Math.PI * 2, d = 1.5 + Math.random() * (range - 1.5);
        x = Math.max(-WORLD_HALF + 1, Math.min(WORLD_HALF - 1, p.x + Math.cos(a) * d));
        z = Math.max(-WORLD_HALF + 1, Math.min(WORLD_HALF - 1, p.z + Math.sin(a) * d));
        if (!obs || !obs.blocked(x, z, 0.5)) break;
      }
      this.spawnDoll(sk, st, x, z);
    }
  }

  spawnDoll(sk, st, x, z) {
    // 마솽 모양을 지푸라기 색으로 칠한 인형 (크기 75%)
    const model = createPlayer();
    model.group.traverse((m) => {
      if (!m.isMesh || !m.material || m.material.map) return;
      m.material = m.material.clone();
      m.material.vertexColors = false;
      m.material.color = new THREE.Color(Math.random() < 0.5 ? 0xd9b25a : 0xc9a048);
      m.material.needsUpdate = true;
    });
    model.group.position.set(x, 0, z);
    model.group.scale.setScalar(0.01);
    this.scene.add(model.group);
    const pl = this.player;
    const doll = {
      sk, st, x, z, model, t: sample(st.duration), age: 0, maxHp: pl.maxHp * sk.def.hpRatio, hp: pl.maxHp * sk.def.hpRatio,
      r: sk.def.lureArea / U / 2, radius: 0.35, dead: false, flash: 0, hitCd: new Map(), flee: sk.level >= 3,
      hit: (e) => {
        if (doll.dead || (doll.hitCd.get(e) || 0) > doll.age) return;
        doll.hitCd.set(e, doll.age + 0.5);
        doll.hp -= e.dmg;
        doll.flash = 0.15;
        this.fx.particles.burst(doll.x, 0.6, doll.z, 5, [0xe6c26a, 0xc9a048], { speed: 2, size: 0.07, life: 0.35, up: 2 });
        this.fx.numbers.spawn(doll.x, 1.3, doll.z, Math.floor(e.dmg), 'hurt');
      },
    };
    this.dolls.push(doll);
    this.enemies.lures.push(doll);
    this.fx.particles.burst(x, 0.4, z, 14, [0xe6c26a, 0xffe7a8, 0x7ed957], { speed: 2.5, size: 0.1, life: 0.5, up: 3 });
    this.fx.ring(x, z, doll.r, 0xe6c26a, 0.5);
  }

  updateDolls(dt) {
    const obs = game.sys.world && game.sys.world.obstacles;
    for (let i = this.dolls.length - 1; i >= 0; i--) {
      const d = this.dolls[i];
      d.age += dt; d.t -= dt;
      // 3레벨: 적들로부터 도망 (이동 속도 2)
      if (d.flee) {
        let ax = 0, az = 0;
        for (const e of this.enemies.query(d.x, d.z, 4)) {
          const dx = d.x - e.x, dz = d.z - e.z, dd = Math.hypot(dx, dz) || 0.01;
          ax += dx / dd / dd; az += dz / dd / dd;
        }
        const l = Math.hypot(ax, az);
        if (l > 0.01) {
          d.x += (ax / l) * 2 * dt; d.z += (az / l) * 2 * dt;
          if (obs) obs.resolve(d, 0.35);
          d.x = Math.max(-WORLD_HALF + 1, Math.min(WORLD_HALF - 1, d.x));
          d.z = Math.max(-WORLD_HALF + 1, Math.min(WORLD_HALF - 1, d.z));
          d.model.group.rotation.y = Math.atan2(ax, az);
        }
      }
      const g = d.model.group;
      const grow = Math.min(1, d.age / 0.25);
      const wob = d.flash > 0 ? 1 + d.flash * 1.2 : 1;
      g.scale.setScalar(0.75 * grow * wob);
      g.position.set(d.x, Math.abs(Math.sin(d.age * (d.flee ? 12 : 3))) * (d.flee ? 0.12 : 0.03), d.z);
      if (d.flash > 0) d.flash -= dt;
      if (d.t <= 0 || d.hp <= 0) this.explodeDoll(i);
    }
  }

  explodeDoll(i) {
    const d = this.dolls[i];
    d.dead = true;
    this.enemies.lures = this.enemies.lures.filter((l) => l !== d);
    this.scene.remove(d.model.group);
    this.dolls.splice(i, 1);
    const R = sample(d.st.area) / U / 2;
    for (const e of this.enemies.query(d.x, d.z, R + 2.2)) {
      if (!e.alive) continue;
      const dist = Math.hypot(e.x - d.x, e.z - d.z);
      if (dist > R + e.r * 0.6) continue;
      const push = (R - dist + 1) * 5;
      this.deal(e, d.sk, d.st, { kx: ((e.x - d.x) / (dist || 1)) * push, kz: ((e.z - d.z) / (dist || 1)) * push });
    }
    this.fx.ring(d.x, d.z, R, 0xffd27a, 0.5);
    this.fx.explosion(d.x, d.z, R * 0.8, 0xffb347);
    this.fx.particles.burst(d.x, 0.6, d.z, 34, [0xe6c26a, 0xc9a048, 0xffe7a8, 0x7ed957], { speed: 5 + R, size: 0.12, life: 0.7, up: 5 });
    sfx('explode');
  }

  // ── 꿀열매 폭탄: 지속 시간 동안 머리 위 열매에 꿀을 모은 뒤 터뜨림 ──
  startHoney(sk, st) {
    if (sk.honey) this.endHoney(sk, false);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffb52e, emissive: 0x8a4a00, emissiveIntensity: 0.35, roughness: 0.3, flatShading: true });
    const fruit = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), mat);
    fruit.castShadow = true;
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffc94a, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(this.fx.ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    const discMat = new THREE.MeshBasicMaterial({ color: 0xffc94a, transparent: true, opacity: 0.1, depthWrite: false });
    const disc = new THREE.Mesh(this.fx.circleGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    this.scene.add(fruit, ring, disc);
    sk.honey = {
      st, t: sample(st.duration), dur: 0, ticks: 0, tick: 0.25, max: sample(st.duration) / 0.25,
      dmg: sample(st.damage), area: sample(st.area), heal: sk.def.heal, fruit, ring, disc, mats: [mat, ringMat, discMat],
    };
    this.honeys.push(sk);
    sfx('gem');
  }

  updateHoneys(dt) {
    const p = this.player;
    let slow = 0;
    for (const sk of [...this.honeys]) {
      const h = sk.honey;
      if (!h) { this.honeys = this.honeys.filter((x) => x !== sk); continue; }
      h.t -= dt; h.dur += dt; h.tick -= dt;
      while (h.tick <= 0) {
        h.tick += 0.25;
        h.ticks++;
        const d = sk.def;
        h.dmg += d.tickDmg[0] + Math.random() * (d.tickDmg[1] - d.tickDmg[0]);
        h.area += d.tickArea;
        h.heal += d.tickHeal;
        if (Math.random() < 0.8) this.fx.particles.emit(p.pos.x, 1.7, p.pos.z, (Math.random() - 0.5) * 1.5, 1, (Math.random() - 0.5) * 1.5, 0.5, 0.08, 0xffd27a, -2);
      }
      const k = Math.min(1, h.ticks / Math.max(1, h.max));   // 열매 크기 (0~1)
      h.k = k;
      // 주위에서 꿀 방울이 열매로 빨려 들어감
      for (let q = 0; q < 2; q++) {
        if (Math.random() > 0.75) continue;
        const a = Math.random() * Math.PI * 2, d = 1.4 + Math.random() * (1.2 + k * 2);
        const sx = p.pos.x + Math.cos(a) * d, sz = p.pos.z + Math.sin(a) * d, sy = 0.3 + Math.random() * 1.2;
        const ty = 1.5 + k * 0.45, life = 0.45;
        this.fx.particles.emit(sx, sy, sz, (p.pos.x - sx) / life, (ty - sy) / life, (p.pos.z - sz) / life, life, 0.07 + k * 0.05, Math.random() < 0.6 ? 0xffb52e : 0xffd98a, 0);
      }
      slow = Math.max(slow, (0.2 + 0.3 * k) * (sk.level >= 3 ? 0.5 : 1));   // 커질수록 느려짐 (3레벨: 절반)
      h.fruit.position.set(p.pos.x, 1.45 + k * 0.45, p.pos.z);
      h.fruit.scale.setScalar(0.6 + k * 1.6 + Math.sin(h.dur * 14) * 0.04);
      h.fruit.rotation.y += dt * 2;
      const R = h.area / U / 2;   // 터질 때의 범위 미리 보기
      h.ring.position.set(p.pos.x, 0.05, p.pos.z); h.ring.scale.setScalar(R);
      h.disc.position.set(p.pos.x, 0.04, p.pos.z); h.disc.scale.setScalar(R);
      h.mats[1].opacity = 0.45 + 0.25 * Math.sin(h.dur * 10);
      if (h.t <= 0) this.endHoney(sk, true);
    }
    p.slow = slow;
  }

  // 대시하면 모으던 열매를 바로 터뜨림
  onDash() {
    for (const sk of [...this.honeys]) if (sk.honey) this.endHoney(sk, true);
  }

  endHoney(sk, burst) {
    const h = sk.honey;
    if (!h) return;
    sk.honey = null;
    this.honeys = this.honeys.filter((x) => x !== sk);
    this.scene.remove(h.fruit, h.ring, h.disc);
    h.mats.forEach((m) => m.dispose());
    h.fruit.geometry.dispose();
    this.player.slow = 0;
    sk.cd = sample(h.st.cooldown);   // 터뜨린 뒤 쿨타임 시작
    sk.cdMax = sk.cd;
    if (!burst) return;
    const p = this.player.pos;
    const bonus = sk.level >= 5 ? 1 + Math.min(1, 0.1 * h.dur) : 1;   // 5레벨: 모은 시간 1초마다 +10% (최대 100%)
    const R = h.area / U / 2;
    for (const e of this.enemies.query(p.x, p.z, R + 2.2)) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - p.x, e.z - p.z);
      if (d > R + e.r * 0.6) continue;
      const push = (R - d + 1) * 6;
      this.deal(e, sk, h.st, { base: h.dmg * bonus, kx: ((e.x - p.x) / (d || 1)) * push, kz: ((e.z - p.z) / (d || 1)) * push });
    }
    const heal = Math.round(h.heal * bonus * 10) / 10;
    if (this.player.hp < this.player.maxHp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      this.fx.numbers.spawn(p.x, 1.8, p.z, `+${heal}`, 'heal');
    }
    this.fx.ring(p.x, p.z, R, 0xffc94a, 0.55);
    this.fx.ring(p.x, p.z, R * 0.6, 0xffffff, 0.4);
    // 열매 크기에 비례해 꿀이 더 많이, 더 크게, 더 멀리 튐
    const k = h.k || 0;
    this.fx.particles.burst(p.x, 1.6, p.z, Math.round(24 + k * 70), [0xffb52e, 0xffd27a, 0xfff0c0, 0xe8901a], { speed: 3 + R * 1.4 + k * 4, size: 0.1 + k * 0.16, life: 0.7 + k * 0.4, up: 4 + k * 3, grav: 10 });
    this.fx.particles.burst(p.x, 0.3, p.z, Math.round(10 + k * 30), [0xffb52e, 0xe8901a], { speed: 2 + R + k * 2, size: 0.14 + k * 0.12, life: 1 + k * 0.5, up: 1 });
    sfx('explode');
  }

  // ── 이파리 베기 ──
  castLeaf(sk, st) {
    sfx('iceShot');
    const p = this.player;
    const near = this.enemies.nearestN(p.pos.x, p.pos.z, 30, 1)[0];
    const base = near ? Math.atan2(near.z - p.pos.z, near.x - p.pos.x) : Math.atan2(p.aim.z, p.aim.x);
    const n = sampleInt(st.projCount);
    const gen = () => ({ size: sample(st.projSize) / PZ, speed: sample(st.projSpeed) * PS, life: sample(st.duration), pierce: sampleInt(st.pierce) });
    for (let i = 0; i < n; i++) {
      // 여러 개면 처음에는 부채꼴로 벌어져 나감 (유도는 날아가며 점점 대상 쪽으로 휨)
      const a = n > 1 ? base + (i - (n - 1) / 2) * 32 * DEG : base;
      const dx = Math.cos(a), dz = Math.sin(a);
      this.spawnProj({
        kind: 'leaf', sk, ...gen(), gen, x: p.pos.x + dx * 0.4, z: p.pos.z + dz * 0.4, y: 0.6, dx, dz, st,
        chains: sampleInt(st.chains), home: sk.level >= 3, homeTarget: near || null,
      });
    }
  }

  // ── 자연화: 범위 안 적 하나당 양분 (5레벨 2), 이 스킬로 얻은 양분 10마다 체력 회복 ──
  castNature(sk, st) {
    const p = this.player.pos;
    const R = sample(st.area) / U / 2;
    const per = sk.level >= 5 ? 2 : 1;
    let gain = 0;
    for (const e of this.enemies.query(p.x, p.z, R + 2.2)) {
      if (!e.alive || Math.hypot(e.x - p.x, e.z - p.z) > R + e.r * 0.5) continue;
      gain += per;
      // 적에게서 플레이어 쪽으로 빨려 오는 생기
      for (let k = 0; k < 3; k++) {
        const dx = p.x - e.x, dz = p.z - e.z;
        this.fx.particles.emit(e.x + (Math.random() - 0.5) * 0.4, 0.5, e.z + (Math.random() - 0.5) * 0.4, dx * 1.6, 1.2, dz * 1.6, 0.6, 0.1, k % 2 ? 0x7ed957 : 0xc8f5a8, -1);
      }
    }
    this.fx.ring(p.x, p.z, R, 0x7ed957, 0.55);
    this.fx.ring(p.x, p.z, R * 0.6, 0xc8f5a8, 0.45);
    sfx('magnet');
    if (!gain) return;
    if (game.sys.bloom) game.sys.bloom.addNutrient(gain);
    sk.natureAcc = (sk.natureAcc || 0) + gain;
    let heal = 0;
    while (sk.natureAcc >= 10) { sk.natureAcc -= 10; heal += sk.def.heal; }
    if (heal > 0 && this.player.hp < this.player.maxHp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      this.fx.numbers.spawn(p.x, 1.6, p.z, `+${heal}`, 'heal');
    }
  }

  // ── 솔바람: 적을 관통하고 지형에 튕김, 꽃에 닿으면 꽃이 강하게 터짐 ──
  castWind(sk, st) {
    sfx('dash');
    const p = this.player;
    const near = this.enemies.nearestN(p.pos.x, p.pos.z, 30, 1)[0];
    const base = near ? Math.atan2(near.z - p.pos.z, near.x - p.pos.x) : Math.atan2(p.aim.z, p.aim.x);
    const n = sampleInt(st.projCount);
    for (let i = 0; i < n; i++) {
      const a = spreadAngle(base, i);
      this.spawnWind(sk, st, p.pos.x + Math.cos(a) * 0.5, p.pos.z + Math.sin(a) * 0.5, Math.cos(a), Math.sin(a), sampleInt(st.chains));
    }
  }

  spawnWind(sk, st, x, z, dx, dz, chains) {
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd8fff0, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    const discMat = new THREE.MeshBasicMaterial({ color: 0x9fe8c0, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    // 회오리: 위로 갈수록 넓어지는 고리들 + 깔때기 모양의 바람막
    const g = new THREE.Group();
    const rings = [];
    for (let k = 0; k < 5; k++) {
      const r = new THREE.Mesh(this.windRingGeo, ringMat);
      r.rotation.x = Math.PI / 2;
      const t = k / 4;
      r.position.y = t * 1.9;
      r.scale.setScalar(0.32 + t * 0.75);
      r.userData.spin = (k % 2 ? -1 : 1) * (7 + k * 2);
      rings.push(r);
      g.add(r);
    }
    const funnel = new THREE.Mesh(this.windFunnelGeo, discMat);
    g.add(funnel);
    const disc = new THREE.Mesh(this.windDiscGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.scale.setScalar(0.5);
    g.add(disc);
    this.scene.add(g);
    const r1 = rings[0], r2 = rings[1];
    const w = {
      sk, st, x, z, dx, dz, r: sample(st.projSize) / PZ / 2, speed: sample(st.projSpeed) * PS, life: sample(st.duration), age: 0,
      mul: 1, boosts: 0, petals: false, chains, inside: new Set(), mesh: g, r1, r2, rings, funnel, mats: [ringMat, discMat],
    };
    this.winds.push(w);
    return w;
  }

  removeWind(i) {
    const w = this.winds[i];
    this.scene.remove(w.mesh);
    w.mats.forEach((m) => m.dispose());
    this.winds.splice(i, 1);
  }

  updateWinds(dt) {
    const obs = game.sys.world && game.sys.world.obstacles;
    const bloom = game.sys.bloom;
    for (let i = this.winds.length - 1; i >= 0; i--) {
      const w = this.winds[i];
      w.age += dt;
      w.x += w.dx * w.speed * dt; w.z += w.dz * w.speed * dt;
      // 맵 끝 / 장애물에 튕김
      const lim = WORLD_HALF - w.r * 0.5;
      if (Math.abs(w.x) > lim) { w.dx = -w.dx; w.x = Math.sign(w.x) * lim; }
      if (Math.abs(w.z) > lim) { w.dz = -w.dz; w.z = Math.sign(w.z) * lim; }
      if (obs) {
        for (const o of obs.list) {
          const ox = w.x - o.x, oz = w.z - o.z, d = Math.hypot(ox, oz), min = o.r + w.r * 0.45;
          if (d < min && d > 1e-4) {
            const nx = ox / d, nz = oz / d, dot = w.dx * nx + w.dz * nz;
            if (dot < 0) { w.dx -= 2 * dot * nx; w.dz -= 2 * dot * nz; }
            w.x = o.x + nx * min; w.z = o.z + nz * min;
          }
        }
      }
      // 관통 피해: 겹쳐 있는 동안 한 번, 빠져나갔다가 다시 지나가면 또 피해
      const now = new Set();
      for (const e of this.enemies.query(w.x, w.z, w.r + 2.2)) {
        if (!e.alive || Math.hypot(e.x - w.x, e.z - w.z) > w.r + e.r * 0.8) continue;
        now.add(e);
        if (!w.inside.has(e)) this.deal(e, w.sk, w.st, { mul: w.mul, kx: w.dx * 2, kz: w.dz * 2 });
      }
      w.inside = now;
      // 꽃에 닿으면 꽃이 바로 강하게 터짐 (5레벨: 솔바람이 최대 3회까지 강해짐)
      if (bloom) {
        for (const f of [...bloom.flowers]) {
          if (Math.hypot(f.x - w.x, f.z - w.z) > w.r + 0.5) continue;
          bloom.explode(f, 1.5);
          if (w.sk.level >= 5 && w.boosts < 3) { w.boosts++; w.mul *= 1.2; w.r *= 1.2; w.speed *= 1.2; w.petals = true; }
        }
      }
      // 모습
      const fade = Math.min(1, (w.life - w.age) / 0.4) * Math.min(1, w.age / 0.12);
      w.mats[0].opacity = 0.7 * fade; w.mats[1].opacity = 0.22 * fade;
      w.mesh.position.set(w.x, 0.05, w.z);
      w.mesh.scale.set(w.r, Math.max(0.9, w.r * 1.1), w.r);
      for (const r of w.rings) {
        r.rotation.z += dt * r.userData.spin;
        r.position.x = Math.sin(w.age * 9 + r.position.y * 2) * 0.08;   // 살짝 흔들리는 회오리
      }
      w.funnel.rotation.y -= dt * 10;
      // 나선을 그리며 위로 솟는 잎 / 꽃잎
      for (let k = 0; k < 2; k++) {
        if (Math.random() > 0.85) continue;
        const a = Math.random() * Math.PI * 2, h = Math.random();
        const rr = w.r * (0.35 + h * 0.75);
        const petal = w.petals && Math.random() < 0.6;
        this.fx.particles.emit(w.x + Math.cos(a) * rr, 0.1 + h * 1.7 * w.mesh.scale.y, w.z + Math.sin(a) * rr, -Math.sin(a) * 4 * rr, 1.8, Math.cos(a) * 4 * rr, 0.5,
          petal ? 0.11 : 0.07, petal ? (Math.random() < 0.5 ? 0xff9ec4 : 0xffd0e4) : (Math.random() < 0.5 ? 0x9fe8c0 : 0xe8fff4), 0.4);
      }
      if (w.age >= w.life) {
        // 연쇄: 사라진 자리에서 가장 가까운 적을 향해 새 솔바람
        if (w.chains > 0) {
          const t = this.enemies.nearestN(w.x, w.z, 12, 1)[0];
          if (t) {
            const d = Math.hypot(t.x - w.x, t.z - w.z) || 1;
            this.spawnWind(w.sk, w.st, w.x, w.z, (t.x - w.x) / d, (t.z - w.z) / d, w.chains - 1);
            this.fx.ring(w.x, w.z, 0.8, 0xd8fff0, 0.3);
          }
        }
        this.removeWind(i);
      }
    }
  }

  // ── 효과 부여: 경험치 획득 ──────────────
  onXp(v) {
    const sk = game.skills.find((s) => s.key === 'enchant');
    if (!sk) return;
    sk.xpAcc = (sk.xpAcc || 0) + v;
    const req = enchantReq(sk);
    let guard = 0;
    while (sk.xpAcc >= req && guard++ < 20) {
      sk.xpAcc -= req;
      const first = Math.floor(Math.random() * 3);
      this.enchantEffect(sk, first);
      if (sk.level >= 5) this.enchantEffect(sk, (first + 1 + Math.floor(Math.random() * 2)) % 3);
    }
  }

  enchantEffect(sk, kind) {
    const st = getStats(sk);
    const pl = this.player;
    const m = sk.level >= 3 ? 1.5 : 1;
    const p = pl.pos;
    if (kind === 0) {
      const amt = sample(st.shield);
      pl.addShield(amt, sample(st.duration));
      this.fx.numbers.spawn(p.x, 1.8, p.z, `+${Math.floor(amt)}`, 'shield');
      this.fx.ring(p.x, p.z, 1.1, 0x6fd3ff, 0.35, 0.6);
    } else if (kind === 1) {
      const amt = sk.def.mana * m;
      pl.mana = Math.min(pl.maxMana, pl.mana + amt);
      this.fx.numbers.spawn(p.x, 1.8, p.z, `+${+amt.toFixed(1)}`, 'mana');
      this.fx.particles.burst(p.x, 0.8, p.z, 8, [0x5a8dff, 0xaac4ff], { speed: 1.5, size: 0.07, life: 0.4, up: 2.5, grav: -1 });
    } else {
      const amt = sk.def.heal * m;
      pl.hp = Math.min(pl.maxHp, pl.hp + amt);
      this.fx.numbers.spawn(p.x, 1.8, p.z, `+${+amt.toFixed(1)}`, 'heal');
      this.fx.particles.burst(p.x, 0.8, p.z, 8, [0x6ff0a0, 0xd0ffe0], { speed: 1.5, size: 0.07, life: 0.4, up: 2.5, grav: -1 });
    }
  }

  // ── 화염 방사 ─────────────────────────
  startFlame(sk, st) {
    if (sk.flame) this.endFlame(sk);   // 이전 불길이 남지 않도록
    const p = this.player.pos;
    const R = sample(st.area) / U;
    const near = this.enemies.nearestN(p.x, p.z, R * 3, 1)[0];
    const ang = near ? Math.atan2(near.z - p.z, near.x - p.x) : Math.atan2(this.player.aim.z, this.player.aim.x);
    const half = ((sk.level >= 3 ? 150 : 90) / 2) * DEG;
    const geo = new THREE.CircleGeometry(1, 24, -half, half * 2).rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(R);
    // 안쪽의 밝은 불길 + 분사구 불빛
    const coreGeo = new THREE.CircleGeometry(1, 20, -half * 0.55, half * 1.1).rotateX(-Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffd36a, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.scale.setScalar(0.7);   // 부모(바깥 불길)가 이미 길이 R 로 확대되어 있으므로 비율만
    core.position.y = 0.02;
    mesh.add(core);
    const glow = makeGlowSprite(0xff8a2a, 1.8, 0.9);
    this.scene.add(mesh, glow);
    sk.flame = { t: sample(st.duration), st, R, half, ang, tick: 0, mesh, geo, mat, core, coreGeo, coreMat, glow };
    this.flames.push(sk);
  }

  // 진행 중인 모든 스킬 연출 제거 (도감 미리보기 장면 초기화)
  clearAll() {
    for (const p of this.projs) this.poolOf(p.kind).put(p.mesh);
    while (this.winds.length) this.removeWind(0);
    for (const tr of this.rootTrail) this.trailPool.put(tr.mesh);
    this.rootTrail.length = 0;
    for (const v of this.vines) this.scene.remove(v.mesh);
    this.vines.length = 0;
    for (const d of this.dolls) { d.dead = true; this.scene.remove(d.model.group); }
    this.dolls.length = 0;
    this.enemies.lures.length = 0;
    for (const sk of [...this.honeys]) this.endHoney(sk, false);
    this.projs.length = 0;
    for (const ib of this.iceballs) { this.scene.remove(ib.group, ib.ring); ib.mats.forEach((m) => m.dispose()); }
    this.iceballs.length = 0;
    while (this.snowballs.length) this.removeSnowball(0);
    while (this.beams.length) this.removeBeam(0);
    while (this.zones.length) this.removeZone(0);
    while (this.flames.length) this.endFlame(this.flames[0]);
    this.casts.length = 0;
  }

  // 화염 방사 불길 제거
  endFlame(sk) {
    const f = sk.flame;
    if (!f) return;
    this.scene.remove(f.mesh, f.glow);
    f.geo.dispose(); f.mat.dispose(); f.coreGeo.dispose(); f.coreMat.dispose(); f.glow.material.dispose();
    sk.flame = null;
    this.flames = this.flames.filter((x) => x !== sk);
  }

  updateFlames(dt) {
    for (const sk of [...this.flames]) {
      const f = sk.flame;
      if (!f) continue;
      const p = this.player.pos;
      // 가장 가까운 적을 향해 초당 60° 회전
      const near = this.enemies.nearestN(p.x, p.z, f.R * 3, 1)[0];
      if (near) {
        const target = Math.atan2(near.z - p.z, near.x - p.x);
        const diff = Math.atan2(Math.sin(target - f.ang), Math.cos(target - f.ang));
        const maxTurn = sk.def.turnSpeed * DEG * dt;
        f.ang += Math.max(-maxTurn, Math.min(maxTurn, diff));
      }
      f.mesh.position.set(p.x, 0.35, p.z);
      f.mesh.rotation.y = -f.ang;
      const flick = Math.random();
      f.mat.opacity = 0.2 + flick * 0.15;
      f.coreMat.opacity = 0.25 + Math.random() * 0.2;
      f.core.scale.setScalar(0.6 + Math.random() * 0.15);
      const nx = p.x + Math.cos(f.ang) * 0.45, nz = p.z + Math.sin(f.ang) * 0.45;
      f.glow.position.set(nx, 0.55, nz);
      f.glow.scale.setScalar(1.4 + flick * 0.8);
      // 거세게 뿜어지는 불길: 중심의 하얀/노란 불꽃 → 바깥의 주황/빨간 불꽃 → 끝부분 연기
      const life = 0.34;
      for (let k = 0; k < 26; k++) {
        const r = Math.random();
        const spread = r < 0.35 ? 0.35 : r < 0.8 ? 0.75 : 1.0;
        const a = f.ang + (Math.random() * 2 - 1) * f.half * spread;
        const sp = (f.R / life) * (0.75 + Math.random() * 0.45);
        const col = r < 0.35 ? (Math.random() < 0.5 ? 0xfff2c0 : 0xffe08a) : r < 0.8 ? (Math.random() < 0.5 ? 0xffb347 : 0xff8a2a) : (Math.random() < 0.5 ? 0xff5a14 : 0xe8380a);
        const size = (r < 0.35 ? 0.1 : 0.16) + Math.random() * 0.14;
        this.fx.particles.emit(nx + (Math.random() - 0.5) * 0.15, 0.4 + Math.random() * 0.2, nz + (Math.random() - 0.5) * 0.15,
          Math.cos(a) * sp, 0.3 + Math.random() * 1.4, Math.sin(a) * sp, life * (0.7 + Math.random() * 0.5), size, col, -2);
      }
      if (Math.random() < 0.6) {
        const a = f.ang + (Math.random() * 2 - 1) * f.half * 0.8;
        const dist = f.R * (0.85 + Math.random() * 0.2);
        this.fx.particles.emit(p.x + Math.cos(a) * dist, 0.7, p.z + Math.sin(a) * dist, Math.cos(a) * 1.0, 1.4 + Math.random(), Math.sin(a) * 1.0, 0.5, 0.12 + Math.random() * 0.08, Math.random() < 0.5 ? 0x8a7a70 : 0xa89888, -1.2);
      }
      // 0.25초마다 피해
      f.tick -= dt;
      if (f.tick <= 0) {
        f.tick += sk.def.tick;
        sfx('flame');
        for (const e of this.enemies.query(p.x, p.z, f.R + 2.2)) {
          if (!e.alive) continue;
          const d = Math.hypot(e.x - p.x, e.z - p.z);
          if (d > f.R + e.r * 0.5) continue;
          const ea = Math.atan2(e.z - p.z, e.x - p.x);
          const da = Math.abs(Math.atan2(Math.sin(ea - f.ang), Math.cos(ea - f.ang)));
          if (d > 0.3 && da > f.half + Math.asin(Math.min(1, e.r / d))) continue;
          this.deal(e, sk, f.st);
          // 5레벨: 화염 피해 취약 +5% (최대 50%)
          if (sk.level >= 5 && e.alive) e.fireVuln = Math.min(0.5, (e.fireVuln || 0) + 0.05);
        }
      }
      f.t -= dt;
      if (f.t <= 0) {
        this.endFlame(sk);
        sk.cd = sample(f.st.cooldown);
        sk.cdMax = sk.cd;
      }
    }
  }

  // 자석: 반경 안의 경험치/블록/상자(직접 버린 블록 제외)를 끌어당김
  castMagnet(st) {
    sfx('magnet');
    const p = this.player.pos;
    const r = sample(st.range) / U;
    const pk = game.sys.pickups;
    for (const g of pk.gems) if (Math.hypot(g.x - p.x, g.z - p.z) <= r) g.mag = true;
    for (const b of pk.blocks) {
      if (b.requireExit || b.t < b.fly) continue;
      if (Math.hypot(b.x - p.x, b.z - p.z) <= r) b.pulled = true;
    }
    this.fx.ring(p.x, p.z, r, 0xff6b8a, 0.5);
    this.fx.ring(p.x, p.z, r * 0.6, 0xffb0c0, 0.4);
  }

  // 냉기 보호막: 보호막 획득 시 주위 냉기 피해 (5레벨: 효과 범위의 70% 만큼 밀쳐내기)
  frostNova(sk) {
    sfx('frost');
    const st = getStats(sk);
    const p = this.player.pos;
    const area = sample(st.area) / U;
    const radius = area / 2;
    const push = sk.level >= 5 ? area * 0.7 * 7 : 3;   // 넉백 속도 (감쇠 7/s → 이동 거리 ≈ 속도/7)
    this.fx.ring(p.x, p.z, Math.max(0.5, radius), 0x9fe6ff, 0.45);
    this.fx.particles.burst(p.x, 0.5, p.z, 24, [0xd8f8ff, 0x9fe6ff, 0xffffff], { speed: 2 + radius * 3, size: 0.1, life: 0.4, up: 1.5 });
    for (const e of this.enemies.query(p.x, p.z, radius + 2.2)) {
      const d = Math.hypot(e.x - p.x, e.z - p.z);
      if (e.alive && d <= radius + e.r) {
        this.deal(e, sk, st, { kx: ((e.x - p.x) / (d || 1)) * push, kz: ((e.z - p.z) / (d || 1)) * push });
      }
    }
  }

  // ── 적 처치 시 (지대 / 발동 : 처치 / 화염·냉기·번개의 기운) ──
  onKill(e, src, st) {
    // 처치한 스킬에 '지대' 문장이 있으면 속성 지대를 남김
    if (src && st && st.zone && st.zone.max > 0 && src.def.element) {
      this.addZone(e.x, e.z, src.def.element, sample(st.zone), sample(st.zoneArea) / U / 2, avg(st.damage), src, st);
    }
    const tk = game.skills.find((s) => s.key === 'triggerKill');
    const goal = tk ? triggerGoal(tk) : 0;
    // 완성된 문장이 장착되어 목표치가 정해진 상태에서만 중첩이 쌓임
    if (tk && goal > 0) {
      tk.stacks = Math.min(99999, tk.stacks + e.maxHp * 0.2);
      if (tk.stacks >= goal) {
        tk.stacks -= goal;
        const tst = getStats(tk);
        const dur = sample(tst.duration);
        const buff = { key: 'triggerKill', icon: ic('skull'), name: '발동 : 처치', color: tk.def.color, t: dur, max: dur,
          charges: tk.level >= 5 ? 3 : 1, sentences: completeSentences(tk), scale: tk.level >= 3 ? 1.2 : 1 };
        const old = game.buffs.findIndex((b) => b.key === 'triggerKill');
        if (old >= 0) game.buffs[old] = buff; else game.buffs.push(buff);
        const p = this.player.pos;
        this.fx.ring(p.x, p.z, 1.6, 0xc07cff, 0.5, 0.6);
        game.sys.ui.toast(`${ic('skull')} 발동 : 처치 — 다음 공격 스킬 강화!`, 'pick');
        if (!game.demo) sfx('levelup');   // 미리보기에서는 소리 없음
      }
    }
    if (e.burnT > 0) {
      const sk = game.skills.find((s) => s.key === 'fireAura');
      if (sk) {
        const ast = getStats(sk);
        const radius = sample(ast.area) / U / 2;
        // 5레벨: 남은 화상 피해 (틱 피해 × 남은 틱 수) 를 폭발 피해에 추가
        const bonus = sk.level >= 5 ? e.burnDmg * Math.ceil(e.burnT / STATUS.burnTick - 1e-6) : 0;
        const x = e.x, z = e.z;
        this.fx.explosion(x, z, Math.max(0.3, radius), 0xff5a2a);
        sfx('explode');
        for (const t of this.enemies.query(x, z, radius + 2.2)) {
          const d = Math.hypot(t.x - x, t.z - z);
          if (t.alive && d <= radius + t.r * 0.7) {
            this.deal(t, sk, ast, { base: sample(ast.damage) + bonus, kx: ((t.x - x) / (d || 1)) * 3, kz: ((t.z - z) / (d || 1)) * 3 });
          }
        }
      }
    }
    if (e.chillT > 0) {
      const sk = game.skills.find((s) => s.key === 'frostAura');
      if (sk) {
        const ast = getStats(sk);
        const n = sampleInt(ast.projCount);
        const gen = () => ({ size: sample(ast.projSize) / PZ, speed: sample(ast.projSpeed) * PS, life: sample(ast.duration), pierce: sampleInt(ast.pierce) });
        const a0 = Math.random() * Math.PI * 2;
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / n) * Math.PI * 2;
          const dx = Math.cos(a), dz = Math.sin(a);
          this.spawnProj({ kind: 'ice', sk, ...gen(), gen, x: e.x + dx * e.r, z: e.z + dz * e.r, y: 0.6, dx, dz, st: ast, ignore: e, chains: sampleInt(ast.chains) });
        }
      }
    }
    if (e.shockT > 0) {
      const sk = game.skills.find((s) => s.key === 'lightningAura');
      if (sk) this.thunder(sk, e);
    }
  }

  // 번개의 기운: 처치된 적 주변 무작위 적에게 낙뢰 (한 대상에 하나씩, 연쇄 없음)
  thunder(sk, from) {
    const st = getStats(sk);
    const range = sample(st.range) / U;
    const n = sampleInt(st.projCount);
    const cands = this.enemies.query(from.x, from.z, range + 2).filter((t) => t.alive && t !== from && Math.hypot(t.x - from.x, t.z - from.z) <= range);
    for (let i = 0; i < n && cands.length; i++) {
      const t = cands.splice(Math.floor(Math.random() * cands.length), 1)[0];
      schedule(0.05 * i, () => {
        if (!t.alive) return;
        this.fx.lightning({ x: t.x + 1.2, y: 9, z: t.z - 1.2 }, { x: t.x, y: 0.2, z: t.z }, 0.35);
        this.fx.ring(t.x, t.z, 1.0, 0xffe066, 0.3);
        sfx('zap');
        this.deal(t, sk, st, { mul: sk.level >= 5 && t.shockT > 0 ? 1.5 : 1 });
      });
    }
  }

  // ── 속성 지대 ─────────────────────────
  addZone(x, z, el, time, r, burnBase, src = null, st = null) {
    if (time <= 0 || r <= 0) return;
    if (this.zones.length >= 40) this.removeZone(0);
    const mat = new THREE.MeshBasicMaterial({ color: ZONE_COLOR[el], transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
    const disc = new THREE.Mesh(this.fx.circleGeo, mat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(x, 0.04, z);
    disc.scale.setScalar(r);
    const ringMat = new THREE.MeshBasicMaterial({ color: ZONE_COLOR[el], transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(this.fx.ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.05, z);
    ring.scale.setScalar(r);
    this.scene.add(disc, ring);
    this.zones.push({ x, z, el, t: time, max: time, r, tick: 0, burnBase, src, st, disc, ring, mats: [mat, ringMat], age: 0 });
  }

  removeZone(i) {
    const zn = this.zones[i];
    this.scene.remove(zn.disc, zn.ring);
    zn.mats.forEach((m) => m.dispose());
    this.zones.splice(i, 1);
  }

  updateZones(dt) {
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const zn = this.zones[i];
      zn.t -= dt; zn.age += dt;
      const fade = Math.min(1, zn.t / 0.5) * Math.min(1, zn.age / 0.25);
      zn.mats[0].opacity = 0.22 * fade + Math.sin(zn.age * 6) * 0.04 * fade;
      zn.mats[1].opacity = 0.7 * fade;
      if (Math.random() < dt * 8 * zn.r) {
        const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * zn.r;
        this.fx.particles.emit(zn.x + Math.cos(a) * d, 0.1, zn.z + Math.sin(a) * d, 0, 1.2, 0, 0.5, 0.08, ZONE_COLOR[zn.el], -1);
      }
      // 지대 위의 적에게는 해당 속성 상태이상이 확정으로 걸림
      zn.tick -= dt;
      if (zn.tick <= 0) {
        zn.tick = 0.3;
        for (const e of this.enemies.query(zn.x, zn.z, zn.r + 2.2)) {
          if (e.alive && Math.hypot(e.x - zn.x, e.z - zn.z) < zn.r + e.r * 0.5) this.enemies.applyStatus(e, zn.el, zn.burnBase, zn.src, zn.st);
        }
      }
      if (zn.t <= 0) this.removeZone(i);
    }
  }

  // ── 파이어볼 ──────────────────────────
  castFireball(sk, st) {
    sfx('fire');
    const p = this.player;
    // 가장 가까운 적을 향해 발사 (적이 없으면 바라보는 방향)
    const near = this.enemies.nearestN(p.pos.x, p.pos.z, 30, 1)[0];
    const base = near ? Math.atan2(near.z - p.pos.z, near.x - p.pos.x) : Math.atan2(p.aim.z, p.aim.x);
    const n = sampleInt(st.projCount);
    // 스탯 단위 → 월드 단위 (연쇄로 다시 생성될 때도 같은 방식으로 새로 뽑음)
    const gen = () => ({ size: sample(st.projSize) / PZ, speed: sample(st.projSpeed) * PS, life: sample(st.duration), pierce: sampleInt(st.pierce), area: sample(st.area) / U });
    for (let i = 0; i < n; i++) {
      const a = spreadAngle(base, i);
      const dx = Math.cos(a), dz = Math.sin(a);
      this.spawnProj({
        kind: 'fire', sk, ...gen(), gen, x: p.pos.x + dx * 0.45, z: p.pos.z + dz * 0.45, y: 0.62,
        dx, dz, st, chains: sampleInt(st.chains), split: sk.level >= 5, areaFactor: areaFactor(sk) * PZ / U,   // 실제 크기 기준 배율 (6 / 9)
      });
    }
  }

  // 연쇄 번개: 투사체 개수 = 처음 뻗는 번개 줄기 수, 투사체 크기 = 굵기, 투사체 속도 = 연쇄 속도
  castLightning(sk, st) {
    const p = this.player.pos;
    const range = sample(st.range) / U;
    const lineDmg = sk.level >= 5;
    const firsts = this.enemies.nearestN(p.x, p.z, range, sampleInt(st.projCount));
    const width = Math.max(0.05, sample(st.projSize) / PZ);
    const step = 0.07 * (6 / Math.max(0.1, sample(st.projSpeed)));
    for (const first of firsts) {
      const hit = new Set();
      const lineHit = new Set();
      let from = { x: p.x, y: 1.0, z: p.z };
      let target = first;
      let delay = 0;
      const chains = sampleInt(st.chains);
      for (let c = 0; c <= chains && target; c++) {
        const tgt = target;
        const f = from;
        const to = { x: tgt.x, y: 0.45 + tgt.r * 0.6, z: tgt.z };
        hit.add(tgt);
        schedule(delay, () => {
          const end = tgt.alive ? { x: tgt.x, y: to.y, z: tgt.z } : to;
          this.fx.lightning(f, end, width);
          sfx('zap');
          if (tgt.alive) this.deal(tgt, sk, st);
          // 5레벨: 번개 줄기에 닿은 적도 피해 (줄기 굵기만큼 판정)
          if (lineDmg) {
            const mx = (f.x + end.x) / 2, mz = (f.z + end.z) / 2;
            const half = Math.hypot(end.x - f.x, end.z - f.z) / 2;
            for (const e of this.enemies.query(mx, mz, half + 2.2)) {
              if (!e.alive || hit.has(e) || lineHit.has(e)) continue;
              if (segDist(e.x, e.z, f.x, f.z, end.x, end.z) < e.r + width / 2 + 0.05) {
                lineHit.add(e);
                this.deal(e, sk, st);
              }
            }
          }
        });
        from = to;
        target = this.enemies.randomInRange(tgt.x, tgt.z, range, hit);
        delay += step;
      }
    }
  }

  // ── 아이스볼 ──────────────────────────
  castIceball(sk, st) {
    sfx('iceball');
    const p = this.player.pos;
    const range = sample(st.range) / U;
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * range;
    let x = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, p.x + Math.cos(a) * r));
    let z = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, p.z + Math.sin(a) * r));
    // 도감 미리보기: 적 무리 가운데에 고정 (두 번째 아이스볼은 살짝 옆)
    if (this.iceballAt) {
      const n = this.iceballs.filter((ib) => ib.t > 0).length % 2;
      x = this.iceballAt.x + (n ? 0.9 : 0); z = this.iceballAt.z - (n ? 0.9 : 0);
    }
    const size = sample(st.area) / (sk.def.areaUnit || U);
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xb8efff, emissive: 0x2a8fc0, emissiveIntensity: 0.7, roughness: 0.15, flatShading: true, transparent: true, opacity: 0.92 });
    const core = new THREE.Mesh(this.iceballGeo, mat);
    core.castShadow = true;
    group.add(core);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.4 });
    group.add(new THREE.Mesh(this.iceballGeo, wireMat));
    const glow = makeGlowSprite(0x7fdcff, 2.4, 0.7);
    group.add(glow);
    const shardMat = new THREE.MeshBasicMaterial({ color: 0xe8fbff });
    const shards = [];
    for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(this.shardGeo, shardMat); group.add(s); shards.push(s); }
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x9fe6ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(this.fx.ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.05, z);
    this.scene.add(group, ring);
    group.position.set(x, 0.75, z);
    // 접촉 피해: 기본 1~2 × (최종 피해량 / 1레벨 기본 피해량) — 레벨과 문장 효과가 함께 반영
    const ratio = avg(st.damage) / avg({ min: sk.def.base.damage[0], max: sk.def.base.damage[1] });
    const contact = { min: sk.def.contactDamage[0] * ratio, max: sk.def.contactDamage[1] * ratio };
    const dur = sample(st.duration);
    this.iceballs.push({
      x, z, t: dur, dur, st, sk, size, fire: 0, tick: 0, angIdx: 0, age: 0,
      step: sk.level >= 3 ? 30 : 36, backShot: sk.level >= 3,
      group, core, glow, shards, ring, mats: [mat, wireMat, shardMat, ringMat, glow.material], contact,
    });
    this.fx.particles.burst(x, 0.5, z, 12, [0xd8f8ff, 0x9fe6ff], { speed: 3, size: 0.1, life: 0.4 });
  }

  updateIceballs(dt) {
    for (let i = this.iceballs.length - 1; i >= 0; i--) {
      const ib = this.iceballs[i];
      ib.t -= dt;
      ib.age += dt;
      const st = ib.st;
      const radius = ib.size / 2;

      // 접촉 피해 (0.2초 고정 주기, 상태이상 확률은 발생율의 2/3)
      ib.tick -= dt;
      if (ib.tick <= 0) {
        ib.tick += ib.sk.def.tick;
        for (const e of this.enemies.query(ib.x, ib.z, radius + 2.2)) {
          if (e.alive && Math.hypot(e.x - ib.x, e.z - ib.z) < radius + e.r) {
            this.deal(e, ib.sk, st, { base: sample(ib.contact) * (game.mods.dmgMul || 1), statusRatio: ib.sk.def.contactChanceRatio });
          }
        }
      }
      // 투사체 발사 (3레벨: 30°씩 + 반대 방향 추가)
      ib.fire -= dt;
      let guard = 0;
      while (ib.fire <= 0 && guard++ < 30) {
        ib.fire += ib.sk.def.fireInterval / Math.max(0.1, sample(st.castSpeed));
        const base = ib.angIdx * ib.step * DEG;
        ib.angIdx++;
        const n = sampleInt(st.projCount);
        const gen = () => ({ size: sample(st.projSize) / PZ, speed: sample(st.projSpeed) * PS, life: sample(st.projDuration), pierce: sampleInt(st.pierce) });
        const dirs = ib.backShot ? [base, base + Math.PI] : [base];
        for (const b of dirs) {
          for (let k = 0; k < n; k++) {
            const a = spreadAngle(b, k);
            const dx = Math.cos(a), dz = Math.sin(a);
            sfx('iceShot');
            this.spawnProj({ kind: 'ice', sk: ib.sk, ...gen(), gen, x: ib.x + dx * radius, z: ib.z + dz * radius, y: 0.7, dx, dz, st, chains: sampleInt(st.chains) });
          }
        }
      }
      // 연출
      const pop = Math.min(1, ib.age / 0.2);
      const fade = ib.t < 0.4 ? Math.max(0, ib.t / 0.4) : 1;
      const s = ib.size * pop * (0.6 + 0.4 * fade);
      ib.group.scale.setScalar(s);
      ib.group.position.y = 0.75 + Math.sin(ib.age * 3) * 0.08;
      ib.core.rotation.set(ib.age * 1.3, ib.age * 2, 0);
      ib.shards.forEach((sh, k) => {
        const a = ib.age * 3 + (k / 4) * Math.PI * 2;
        sh.position.set(Math.cos(a) * 0.9, Math.sin(ib.age * 4 + k) * 0.2, Math.sin(a) * 0.9);
        sh.rotation.y = -a;
      });
      ib.ring.scale.setScalar(radius * pop);
      if (ib.t <= 0) {
        this.fx.particles.burst(ib.x, 0.7, ib.z, 18, [0xd8f8ff, 0x9fe6ff, 0xffffff], { speed: 4, size: 0.12, life: 0.5 });
        this.scene.remove(ib.group, ib.ring);
        ib.mats.forEach((m) => m.dispose());
        this.iceballs.splice(i, 1);
      }
    }
  }

  // ── 투사체 공통 ───────────────────────
  poolOf(kind) { return kind === 'fire' ? this.firePool : kind === 'leaf' ? this.leafPool : kind === 'root' ? this.rootPool : this.icePool; }

  spawnProj(o) {
    const mesh = this.poolOf(o.kind).get();
    Object.assign(o, {
      mesh, age: 0, hit: o.hit || new Set(o.ignore ? [o.ignore] : []), pierceLeft: o.pierce, chainsLeft: o.chains || 0,
      pierceFlash: 0, dead: false, infused: null,
    });
    if (o.dmgMul == null) o.dmgMul = 1;
    mesh.scale.setScalar(o.size);
    mesh.position.set(o.x, o.y, o.z);
    mesh.rotation.set(0, Math.atan2(o.dx, o.dz), 0);
    this.projs.push(o);
    return o;
  }

  updateProjectiles(dt) {
    const lim = WORLD_HALF + 12;
    for (let i = this.projs.length - 1; i >= 0; i--) {
      const p = this.projs[i];
      if (p.home) {
        let t = p.homeTarget;
        if (!t || !t.alive || p.hit.has(t)) {
          t = null;
          let bd = 15 * 15;
          for (const c of this.enemies.query(p.x, p.z, 15)) {
            if (!c.alive || p.hit.has(c)) continue;
            const d2 = (c.x - p.x) ** 2 + (c.z - p.z) ** 2;
            if (d2 < bd) { bd = d2; t = c; }
          }
          p.homeTarget = t;
        }
        if (t) {
          const want = Math.atan2(t.z - p.z, t.x - p.x), cur = Math.atan2(p.dz, p.dx);
          const diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
          // 뿌리: 매우 빠르게 바로 꺾임 / 이파리: 멀 때는 천천히, 가까워질수록 급격히 빠르게 회전
          const dist = Math.hypot(t.x - p.x, t.z - p.z);
          const near = Math.max(0, 1 - dist / 9);
          const turn = (p.kind === 'root' ? 60 : 1.2 + 26 * near * near * near) * dt;
          const a = cur + Math.max(-turn, Math.min(turn, diff));
          p.dx = Math.cos(a); p.dz = Math.sin(a);
        }
      }
      const total = p.speed * dt;
      const subs = Math.max(1, Math.ceil(total / 0.3));
      const step = total / subs;
      for (let s = 0; s < subs && !p.dead; s++) {
        p.x += p.dx * step; p.z += p.dz * step;
        const cands = this.enemies.query(p.x, p.z, p.size / 2 + 2.2);
        for (const e of cands) {
          if (!e.alive || p.hit.has(e)) continue;
          if (Math.hypot(e.x - p.x, e.z - p.z) < p.size / 2 + e.r) {
            p.hit.add(e);
            this.onProjHit(p, e);
            if (p.pierceLeft > 0) {
              // 관통: 연쇄가 남아 있으면 1회 써서 다른 적을 향하는 투사체 1개를 새로 만듦 (연쇄 0, 관통은 그대로)
              if (p.chainsLeft > 0 && this.chainProj(p, true)) p.chainsLeft--;
              p.pierceLeft--;
              if (this.onPierce) this.onPierce(p, e);
              p.pierceFlash = 0.15;
              this.fx.ring(p.x, p.z, Math.max(0.4, p.size * 1.2), p.kind === 'fire' ? 0xffe08a : p.kind === 'leaf' ? 0xb8f5a0 : 0xd8f8ff, 0.25, p.y);
            } else {
              // 관통이 끝난 마지막 적중: 연쇄가 남아 있으면 그 자리에서 다음 적을 향해 이어짐
              if (p.chainsLeft > 0) this.chainProj(p);
              p.dead = true; break;
            }
          }
        }
      }
      // 지대 흡수: 투사체가 속성 지대 위를 지나면 그 속성 피해를 얻음
      if (p.st.infuse && this.zones.length && !p.dead) {
        for (const zn of this.zones) {
          if (Math.hypot(p.x - zn.x, p.z - zn.z) < zn.r) {
            if (!p.infused) p.infused = {};
            if (!p.infused[zn.el]) { p.infused[zn.el] = p.st.infuse; this.fx.ring(p.x, p.z, 0.6, ZONE_COLOR[zn.el], 0.25, p.y); }
          }
        }
      }
      if (p.infused) {
        for (const el in p.infused) {
          if (Math.random() < 0.7) this.fx.particles.emit(p.x + (Math.random() - 0.5) * p.size, p.y + (Math.random() - 0.5) * p.size, p.z + (Math.random() - 0.5) * p.size, 0, 0.5, 0, 0.25, Math.max(0.06, p.size * 0.3), ZONE_COLOR[el], 0);
        }
      }
      p.age += dt;
      if (p.age >= p.life && !p.dead) {
        p.dead = true;
        if (p.explodeOnExpire) this.onProjHit(p, null);
        else if (p.kind === 'fire') this.fx.particles.burst(p.x, p.y, p.z, 5, [0xff9a3a, 0x5a5048], { speed: 1.2, size: 0.1, life: 0.3, up: 1.5 });
      }
      if (Math.abs(p.x) > lim || Math.abs(p.z) > lim) p.dead = true;

      p.mesh.position.set(p.x, p.y, p.z);
      if (p.kind === 'root') {
        // 지나간 자리마다 뿌리 고리가 땅에서 솟았다가 다시 들어감 (진행 방향을 따라 세로로)
        p.trailAcc = (p.trailAcc || 0) + p.speed * dt;
        while (p.trailAcc >= 0.42) {
          p.trailAcc -= 0.42;
          const r = this.trailPool.get();
          r.position.set(p.x, -0.3, p.z);
          r.rotation.set(0, Math.atan2(p.dx, p.dz) + Math.PI / 2, (Math.random() - 0.5) * 0.3);
          this.rootTrail.push({ mesh: r, t: 0, life: 0.6, s: Math.max(0.45, p.size) });
        }
        if (Math.random() < 0.8) this.fx.particles.emit(p.x, 0.05, p.z, (Math.random() - 0.5) * 1.5, 1, (Math.random() - 0.5) * 1.5, 0.45, 0.08, Math.random() < 0.6 ? 0x8a6a3a : 0x5a4020, -3);
      }
      if (p.kind === 'leaf') {
        // 진행 방향을 바라보며 빙글빙글
        p.mesh.rotation.set(0, Math.atan2(p.dx, p.dz), 0);
        p.mesh.userData.shell.rotation.z += dt * 18;
        if (Math.random() < 0.4) this.fx.particles.emit(p.x, p.y, p.z, -p.dx * 0.8, 0.3, -p.dz * 0.8, 0.3, 0.07, 0x9fe68a, -0.5);
      }
      if (p.pierceFlash > 0) { p.pierceFlash -= dt; p.mesh.scale.setScalar(p.size * (1 + p.pierceFlash * 4)); }
      if (p.kind === 'fire') {
        const sh = p.mesh.userData.shell;
        sh.rotation.x += dt * 6; sh.rotation.z += dt * 4;
        const c = [0xffb347, 0xff6a1a, 0xffe08a, 0xff4a10][Math.floor(Math.random() * 4)];
        this.fx.particles.emit(p.x - p.dx * p.size * 0.4 + (Math.random() - 0.5) * p.size * 0.4, p.y, p.z - p.dz * p.size * 0.4 + (Math.random() - 0.5) * p.size * 0.4,
          -p.dx * 1.2, 0.4 + Math.random() * 0.6, -p.dz * 1.2, 0.28, p.size * 0.4, c, -1.5);
        if (Math.random() < 0.35) {
          this.fx.particles.emit(p.x - p.dx * p.size * 0.6, p.y + 0.05, p.z - p.dz * p.size * 0.6,
            -p.dx * 0.5, 0.8, -p.dz * 0.5, 0.45, p.size * 0.35, Math.random() < 0.5 ? 0x4a3a32 : 0x6a5a50, -1);
        }
      }
      if (p.dead) {
        this.poolOf(p.kind).put(p.mesh);
        this.projs[i] = this.projs[this.projs.length - 1];
        this.projs.pop();
      }
    }
  }

  // 연쇄: 그 스킬의 투사체를 맞은 자리에서 새로 생성 (크기/속도/지속 시간/관통을 새로 적용, 개수는 1개)
  // fromPierce: 관통하며 만든 투사체 (연쇄 0, 관통 횟수 그대로 물려받음)
  chainProj(p, fromPierce = false) {
    let best = null, bd = 12 * 12;
    for (const t of this.enemies.query(p.x, p.z, 12)) {
      if (!t.alive || p.hit.has(t)) continue;
      const d2 = (t.x - p.x) ** 2 + (t.z - p.z) ** 2;
      if (d2 < bd) { bd = d2; best = t; }
    }
    if (!best) return false;
    const d = Math.sqrt(bd) || 1;
    const fresh = p.gen ? p.gen() : { size: p.size, speed: p.speed, life: p.life, pierce: p.pierce, area: p.area };
    this.spawnProj({
      kind: p.kind, sk: p.sk, st: p.st, gen: p.gen, y: p.y, dmgMul: p.dmgMul, home: p.home,
      split: p.split, areaFactor: p.areaFactor, explodeOnExpire: p.explodeOnExpire,
      ...fresh, x: p.x, z: p.z, dx: (best.x - p.x) / d, dz: (best.z - p.z) / d,
      ...(fromPierce ? { pierce: p.pierce } : {}),
      chains: fromPierce ? 0 : p.chainsLeft - 1, hit: new Set(p.hit), root: p.root, tracking: p.tracking,
    });
    this.fx.ring(p.x, p.z, Math.max(0.4, p.size * 1.3), 0xfff06a, 0.25, p.y);
    return true;
  }

  onProjHit(p, e) {
    if (p.kind === 'fire') {
      const radius = p.area / 2;
      sfx('explode');
      this.fx.explosion(p.x, p.z, Math.max(0.3, radius));
      for (const t of this.enemies.query(p.x, p.z, radius + 2.2)) {
        if (!t.alive) continue;
        const d = Math.hypot(t.x - p.x, t.z - p.z);
        if (d <= radius + t.r * 0.7 || t === e) {
          const nx = (t.x - p.x) / (d || 1), nz = (t.z - p.z) / (d || 1);
          this.deal(t, p.sk, p.st, { mul: p.dmgMul, kx: nx * 4, kz: nz * 4, infuse: p.infused });
        }
      }
      // 5레벨: 진행 방향으로 작은 투사체 3개 (작은 투사체는 다시 튀지 않음)
      // 크기 40% · 속도 97.5% · 지속 25% · 피해 40% · 폭발 범위 = 크기 × 5 (문장 효과 비율 유지)
      if (p.split) {
        const base = Math.atan2(p.dz, p.dx);
        const parentGen = p.gen, factor = p.areaFactor;
        const gen = () => {
          const g = parentGen();
          return { size: g.size * 0.4, speed: g.speed * 0.975, life: g.life * 0.25, pierce: g.pierce, area: g.area * 0.4 * (5 / factor) };
        };
        for (const off of [-25, 0, 25]) {
          const a = base + off * DEG;
          const dx = Math.cos(a), dz = Math.sin(a);
          this.spawnProj({
            kind: 'fire', sk: p.sk, ...gen(), gen, x: p.x + dx * 0.2, z: p.z + dz * 0.2, y: p.y, dx, dz,
            st: p.st, dmgMul: p.dmgMul * 0.4, split: false, ignore: e, chains: p.chainsLeft, explodeOnExpire: true,
          });
        }
      }
    } else {
      this.deal(e, p.sk, p.st, { mul: p.dmgMul, kx: p.kind === 'root' ? 0 : p.dx * 1.5, kz: p.kind === 'root' ? 0 : p.dz * 1.5, infuse: p.infused });
      if (p.kind === 'root' && e.alive && !e.elite && !e.boss) this.bind(e, p.sk.def.rootTime);
      const cols = p.kind === 'leaf' ? [0x8ff07a, 0x4fbf4a] : p.kind === 'root' ? [0x8a6a3a, 0x7ed957] : [0xd8f8ff, 0x9fe6ff];
      this.fx.particles.burst(p.x, p.y, p.z, 4, cols, { speed: 2, size: 0.06, life: 0.25, up: 1.5 });
    }
  }

  // ── 낙석: 체력이 가장 높은 적에게 비스듬히 떨어지는 눈덩이 ──
  castSnowfall(sk, st) {
    const p = this.player.pos;
    const range = sample(st.range) / U;
    let target = null;
    for (const e of this.enemies.list) {
      if (!e.alive || Math.hypot(e.x - p.x, e.z - p.z) > range) continue;
      if (!target || e.hp > target.hp) target = e;
    }
    if (!target) return;
    this.dropSnowball(sk, st, target.x, target.z, sampleInt(st.chains));
  }

  // dur: 떨어지는 시간 (처음 0.5초, 연쇄로 다시 떨어질 때는 0.25초)
  // origin: 처음 떨어진 위치 (연쇄 시 그 주변 효과 범위의 20% 안 무작위 위치에 떨어짐)
  dropSnowball(sk, st, x, z, chainsLeft, dur = 0.5, origin = null) {
    const radius = sample(st.area) / U / 2;
    const mat = new THREE.MeshStandardMaterial({ color: 0xf2fbff, emissive: 0x5aa8d8, emissiveIntensity: 0.25, roughness: 0.6, flatShading: true, transparent: true, opacity: 0.3 });
    const ball = new THREE.Mesh(this.snowGeo, mat);
    ball.castShadow = true;
    const size = radius * 0.9;   // 효과 범위에 비례하는 눈덩이 크기
    ball.scale.setScalar(size);
    const markMat = new THREE.MeshBasicMaterial({ color: 0x9fe6ff, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
    const mark = new THREE.Mesh(this.fx.ringGeo, markMat);
    mark.rotation.x = -Math.PI / 2;
    mark.position.set(x, 0.05, z);
    mark.scale.setScalar(radius);
    this.scene.add(ball, mark);
    // 하늘 비스듬한 위치에서 출발
    const from = new THREE.Vector3(x - 4, 9 + size, z + 3);
    this.snowballs.push({ sk, st, x, z, radius, size, chainsLeft, t: 0, dur, ball, mark, mat, markMat, from, embed: -1, origin: origin || { x, z } });
  }

  // 눈덩이 충격: 강하게 튀는 파편 + 피어오르는 안개 + 범위 피해 / 밀쳐내기
  snowImpact(s) {
    sfx('snowCrunch');
    const r = s.radius;
    this.fx.ring(s.x, s.z, r, 0xd8f8ff, 0.45);
    this.fx.ring(s.x, s.z, r * 1.3, 0xffffff, 0.6);
    this.fx.particles.burst(s.x, 0.5, s.z, 46, [0xffffff, 0xeefaff, 0xd8f8ff], { speed: 6 + r * 4, size: 0.26, life: 0.9, up: 7, grav: 14 });
    this.fx.particles.burst(s.x, 0.3, s.z, 26, [0x9fe6ff, 0xffffff], { speed: 9 + r * 3, size: 0.1, life: 0.5, up: 3 });
    this.fx.mist(s.x, s.z, r);
    for (const e of this.enemies.query(s.x, s.z, r + 2.2)) {
      const d = Math.hypot(e.x - s.x, e.z - s.z);
      if (!e.alive || d > r + e.r * 0.7) continue;
      const push = Math.max(0, r * 0.75 - d) * 7 + 2;
      this.deal(e, s.sk, s.st, { kx: ((e.x - s.x) / (d || 1)) * push, kz: ((e.z - s.z) / (d || 1)) * push });
    }
  }

  updateSnowballs(dt) {
    for (let i = this.snowballs.length - 1; i >= 0; i--) {
      const s = this.snowballs[i];
      s.t += dt;
      // 5레벨: 바닥에 박힌 눈덩이가 부풀고 떨리며 빛나다가 폭발
      if (s.embed >= 0) {
        s.embed += dt;
        const k = Math.min(1, s.embed / 0.75);
        const shake = 0.04 * s.size * k;
        // 떨어진 직후 빠르게 파고들어 절반 정도가 땅에 묻힘 (구 중심이 지면 높이)
        const sink = Math.min(1, s.embed / 0.08);
        s.ball.position.set(s.x + (Math.random() - 0.5) * shake * 2, s.size * 0.4 * (1 - sink), s.z + (Math.random() - 0.5) * shake * 2);
        s.ball.scale.setScalar(s.size * (1 + 0.18 * k + Math.sin(s.embed * 40) * 0.04 * k));
        s.mat.emissiveIntensity = 0.25 + 1.6 * k * k;
        s.markMat.opacity = 0.3 + 0.5 * k * (0.5 + 0.5 * Math.sin(s.embed * 30));
        if (Math.random() < 0.5 + k) this.fx.particles.emit(s.x + (Math.random() - 0.5) * s.size, s.size * 0.6, s.z + (Math.random() - 0.5) * s.size, 0, 1.2, 0, 0.4, 0.08, 0xd8f8ff, -1);
        if (k < 1) continue;
        this.snowImpact(s);
        this.removeSnowball(i);
        continue;
      }
      const k = Math.min(1, s.t / s.dur);
      const e2 = k * k;                                      // 점점 빨라지며 떨어짐
      s.ball.position.set(s.from.x + (s.x - s.from.x) * e2, s.from.y + (s.size * 0.8 - s.from.y) * e2, s.from.z + (s.z - s.from.z) * e2);
      s.ball.rotation.x += dt * 5; s.ball.rotation.z += dt * 3;
      s.mat.opacity = 0.3 + 0.7 * k;                         // 화면을 가리지 않게 처음엔 투명하다가 선명해짐
      s.markMat.opacity = 0.5 * k;
      if (Math.random() < 0.6) this.fx.particles.emit(s.ball.position.x, s.ball.position.y, s.ball.position.z, 0, 0.5, 0, 0.35, s.size * 0.25, 0xe8fbff, -0.5);
      if (k < 1) continue;
      this.snowImpact(s);
      // 연쇄: 같은 자리에 0.25초 간격으로 다시 떨어짐
      if (s.chainsLeft > 0) {
        const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * s.radius * 2 * 0.2;
        this.dropSnowball(s.sk, s.st, s.origin.x + Math.cos(a) * d, s.origin.z + Math.sin(a) * d, s.chainsLeft - 1, 0.25, s.origin);
      }
      if (s.sk.level >= 5) { s.embed = 0; s.mat.opacity = 1; continue; }
      this.removeSnowball(i);
    }
  }

  removeSnowball(i) {
    const s = this.snowballs[i];
    this.scene.remove(s.ball, s.mark);
    s.mat.dispose(); s.markMat.dispose();
    this.snowballs.splice(i, 1);
  }

  // ── 번개 광선: 하늘에서 비스듬히 내리꽂히며 앞으로 나아감 ──
  // 3레벨: 대상을 추적 (광선마다 서로 다른 대상) / 5레벨: 추적 대상을 맞힐 때마다 작은 번개 5개
  pickUntracked(x, z, radius, exclude = null) {
    let best = null, bd = Infinity;
    for (const e of this.enemies.query(x, z, radius)) {
      if (!e.alive || e === exclude || this.beams.some((b) => b.target === e)) continue;
      const d = Math.hypot(e.x - x, e.z - z);
      if (d < bd && d <= radius) { bd = d; best = e; }
    }
    return best;
  }

  castBeam(sk, st) {
    const p = this.player.pos;
    const track = sk.level >= 3;
    const near = track ? this.pickUntracked(p.x, p.z, 30) || this.enemies.nearestN(p.x, p.z, 30, 1)[0] : this.enemies.nearestN(p.x, p.z, 30, 1)[0];
    const ang = near ? Math.atan2(near.z - p.z, near.x - p.x) : Math.atan2(this.player.aim.z, this.player.aim.x);
    this.spawnBeam(sk, st, p.x + Math.cos(ang) * 1.0, p.z + Math.sin(ang) * 1.0, ang, sampleInt(st.chains), track ? near : null);
    sfx('zap');
  }

  spawnBeam(sk, st, x, z, ang, chains, target = null) {
    const r = sample(st.area) / U / 2;
    const SEG = 12;
    // 지지직거리는 번개 줄기: 위로 갈수록 투명해지도록 마디마다 재질을 따로 둠
    const segs = [];
    for (let i = 0; i < SEG; i++) {
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xffe866, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const glow = new THREE.Mesh(this.fx.cylGeo, glowMat), core = new THREE.Mesh(this.fx.cylGeo, coreMat);
      this.scene.add(glow, core);
      segs.push({ glow, core, glowMat, coreMat, a: i / SEG });
    }
    const footMat = new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false });
    const foot = new THREE.Mesh(this.fx.circleGeo, footMat);
    foot.rotation.x = -Math.PI / 2;
    foot.scale.setScalar(r);
    const light = makeGlowSprite(0xfff27a, r * 1.6, 0.35);
    this.scene.add(foot, light);
    const mats = [footMat, light.material];
    segs.forEach((g) => mats.push(g.glowMat, g.coreMat));
    this.beams.push({
      sk, st, x, z, dx: Math.cos(ang), dz: Math.sin(ang), speed: sample(st.projSpeed) * PS, r,
      t: sample(st.duration), tick: 0, chains, hit: new Set(), segs, foot, light, mats, age: 0,
      pts: null, jitterT: 0, sparkT: 0, target,
    });
  }

  removeBeam(i) {
    const b = this.beams[i];
    for (const g of b.segs) this.scene.remove(g.glow, g.core);
    this.scene.remove(b.foot, b.light);
    b.mats.forEach((m) => m.dispose());
    this.beams.splice(i, 1);
  }

  updateBeams(dt) {
    if (this.beams.length) sfx('crackle');
    const UP = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), mid = new THREE.Vector3();
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.age += dt; b.t -= dt;
      // 추적 대상이 처치되면, 다른 줄기가 추적하지 않는 가까운 적을 새 대상으로 삼음
      if (b.target && !b.target.alive && b.sk.level >= 3) {
        b.target = null;
        b.target = this.pickUntracked(b.x, b.z, 30);
      }
      // 추적: 대상이 살아 있으면 계속 그쪽으로 방향을 바꿈
      if (b.target && b.target.alive) {
        const tx = b.target.x - b.x, tz = b.target.z - b.z, d = Math.hypot(tx, tz);
        if (d > 0.05) { b.dx = tx / d; b.dz = tz / d; }
        if (d < b.speed * dt) { b.x = b.target.x; b.z = b.target.z; } else { b.x += b.dx * b.speed * dt; b.z += b.dz * b.speed * dt; }
      } else {
        b.x += b.dx * b.speed * dt; b.z += b.dz * b.speed * dt;
      }
      const fade = Math.min(1, b.t / 0.3) * Math.min(1, b.age / 0.15);
      // 번개 줄기 모양을 계속 다시 그려 지지직거리게
      b.jitterT -= dt;
      if (!b.pts || b.jitterT <= 0) {
        b.jitterT = 0.05;
        const top = new THREE.Vector3(b.x - 3, 10, b.z + 2.5), bot = new THREE.Vector3(b.x, 0, b.z);
        const n = b.segs.length;
        b.pts = [];
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          const p = top.clone().lerp(bot, t);
          if (k > 0 && k < n) { p.x += (Math.random() - 0.5) * 0.7; p.z += (Math.random() - 0.5) * 0.7; p.y += (Math.random() - 0.5) * 0.3; }
          b.pts.push(p);
        }
        b.flick = 0.75 + Math.random() * 0.5;
      } else {
        // 줄기가 광선 위치를 따라가도록 (모양은 유지)
        const ox = b.x - b.pts[b.pts.length - 1].x, oz = b.z - b.pts[b.pts.length - 1].z;
        for (const p of b.pts) { p.x += ox; p.z += oz; }
      }
      b.segs.forEach((g, k) => {
        const a = b.pts[k], c = b.pts[k + 1];
        dir.subVectors(c, a);
        const len = dir.length();
        dir.normalize();
        mid.addVectors(a, c).multiplyScalar(0.5);
        const lowness = (k + 1) / b.segs.length;               // 아래일수록 1 → 위로 갈수록 투명
        const alpha = fade * Math.pow(lowness, 1.6);
        for (const [m, w, mat, base] of [[g.glow, b.r * 0.3 * b.flick, g.glowMat, 0.45], [g.core, b.r * 0.09 * b.flick, g.coreMat, 0.95]]) {
          m.position.copy(mid);
          m.quaternion.setFromUnitVectors(UP, dir);
          m.scale.set(w, len, w);
          mat.opacity = base * alpha;
        }
      });
      b.foot.position.set(b.x, 0.05, b.z);
      b.light.position.set(b.x, 0.3, b.z);
      b.mats[0].opacity = 0.16 * fade * (0.8 + Math.random() * 0.4);
      b.mats[1].opacity = 0.35 * fade;
      // 바닥에 튀는 작은 번개
      b.sparkT -= dt;
      if (b.sparkT <= 0 && fade > 0.5) {
        b.sparkT = 0.07;
        const a = Math.random() * Math.PI * 2, d = b.r * (0.6 + Math.random() * 0.9);
        this.fx.lightning({ x: b.x, y: 0.15, z: b.z }, { x: b.x + Math.cos(a) * d, y: 0.05, z: b.z + Math.sin(a) * d }, 0.06);
      }
      if (Math.random() < 0.7) this.fx.particles.emit(b.x + (Math.random() - 0.5) * b.r, 0.1, b.z + (Math.random() - 0.5) * b.r, (Math.random() - 0.5) * 5, 2 + Math.random() * 3, (Math.random() - 0.5) * 5, 0.25, 0.06, Math.random() < 0.5 ? 0xffffff : 0xfff06a, 8);
      // 0.25초마다 광선에 닿은 적에게 피해
      b.tick -= dt;
      if (b.tick <= 0) {
        b.tick += b.sk.def.tick;
        for (const e of this.enemies.query(b.x, b.z, b.r + 2.2)) {
          if (!e.alive || Math.hypot(e.x - b.x, e.z - b.z) > b.r + e.r) continue;
          const first = !b.hit.has(e);
          b.hit.add(e);
          this.deal(e, b.sk, b.st);
          // 5레벨: 추적 대상을 맞힐 때마다 작은 번개 5개
          if (b.target === e && b.sk.level >= 5) this.miniBolts(b, e);
          // 연쇄: 적에게 처음 닿을 때마다 그 자리에서 가까운 적을 향해 광선 하나 더 (새 광선은 연쇄 없음)
          if (first && b.chains > 0) {
            const track = b.sk.level >= 3;
            const next = track ? this.pickUntracked(e.x, e.z, 10, e) : this.enemies.query(e.x, e.z, 10).filter((t) => t.alive && !b.hit.has(t))
              .sort((p, q) => Math.hypot(p.x - e.x, p.z - e.z) - Math.hypot(q.x - e.x, q.z - e.z))[0];
            if (next) {
              b.chains--;
              this.spawnBeam(b.sk, b.st, e.x, e.z, Math.atan2(next.z - e.z, next.x - e.x), 0, track ? next : null);
            }
          }
        }
      }
      if (b.t <= 0 || Math.abs(b.x) > WORLD_HALF + 4 || Math.abs(b.z) > WORLD_HALF + 4) this.removeBeam(i);
    }
  }

  // 번개 광선 5레벨: 주변 적들에게 작은 번개 5개 (기본 피해의 25%, 연쇄 가능)
  miniBolts(b, from) {
    const range = 6;
    const pool = this.enemies.query(from.x, from.z, range + 2).filter((t) => t.alive && t !== from && Math.hypot(t.x - from.x, t.z - from.z) <= range);
    const chains = sampleInt(b.st.chains);
    for (let n = 0; n < 5 && pool.length; n++) {
      let tgt = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      const hit = new Set([from]);
      let src = { x: from.x, y: 0.6, z: from.z };
      for (let c = 0, delay = 0; c <= chains && tgt; c++, delay += 0.06) {
        const t = tgt, f = src;
        hit.add(t);
        schedule(delay, () => {
          if (!t.alive) return;
          this.fx.lightning(f, { x: t.x, y: 0.4, z: t.z }, 0.08);
          this.deal(t, b.sk, b.st, { mul: 0.25 });
        });
        src = { x: t.x, y: 0.4, z: t.z };
        tgt = this.enemies.randomInRange(t.x, t.z, range, hit);
      }
    }
  }
}
