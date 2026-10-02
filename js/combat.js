import * as THREE from 'three';
import { WORLD_HALF, STAT_UNIT as U, PROJ_SPEED_UNIT as PS, STATUS } from './config.js';
import { game, schedule } from './state.js';
import { getStats, computeStats, sample, sampleInt, avg, statusProb, maxStacks, areaFactor, ATTACK_SKILLS, enchantReq, triggerGoal, completeSentences } from './skills.js';
import { makeGlowSprite } from './effects.js';
import { jitter, paint } from './models.js';
import { sfx } from './audio.js';

const DEG = Math.PI / 180;

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
    this.iceballGeo = new THREE.IcosahedronGeometry(0.5, 0);
    this.shardGeo = new THREE.OctahedronGeometry(0.09, 0).scale(1, 2, 1);
  }

  // ── 시전 ─────────────────────────────
  update(dt) {
    for (const sk of game.skills) {
      if (sk.def.passive) { if (sk.key === 'frostBarrier') this.updateBarrier(sk, dt); continue; }
      if (sk.flame) continue;                       // 화염 방사 중: 끝난 뒤에 쿨타임 시작
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
    this.updateProjectiles(dt);
    this.updateIceballs(dt);
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
    if (sk.def.passive || sk.flame) return false;
    if (sk.cd > 0) return false;
    let st = getStats(sk);
    const p = this.player.pos;
    if (sk.key === 'chainLightning' && !this.enemies.anyInRange(p.x, p.z, sample(st.range) / U)) {
      if (manual) game.sys.ui.toast('사거리 내에 적이 없습니다', 'warn');
      return false;
    }
    if (sk.key === 'flamethrower' && !manual && !this.enemies.anyInRange(p.x, p.z, (sample(st.area) / U) * 1.3)) return false;
    // 마나
    const cost = Math.max(0, sample(st.manaCost) - game.mods.manaCostMinus);
    if (this.player.mana < cost) {
      if (manual) { game.sys.ui.toast('마나가 부족합니다', 'warn'); sfx('error'); }
      return false;
    }
    this.player.mana -= cost;
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
  }

  updateFlames(dt) {
    for (const sk of game.skills) {
      const f = sk.flame;
      if (!f) continue;
      const p = this.player.pos;
      // 가장 가까운 적을 향해 초당 60° 회전
      const near = this.enemies.nearestN(p.x, p.z, f.R * 3, 1)[0];
      if (near) {
        const target = Math.atan2(near.z - p.z, near.x - p.x);
        let diff = Math.atan2(Math.sin(target - f.ang), Math.cos(target - f.ang));
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
        const spread = r < 0.35 ? 0.35 : r < 0.8 ? 0.75 : 1.0;          // 중심일수록 좁게
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
          const da = Math.abs(Math.atan2(Math.sin(Math.atan2(e.z - p.z, e.x - p.x) - f.ang), Math.cos(Math.atan2(e.z - p.z, e.x - p.x) - f.ang)));
          if (d > 0.3 && da > f.half + Math.asin(Math.min(1, e.r / d))) continue;
          this.enemies.damage(e, sample(f.st.damage), { element: 'fire', status: statusProb(f.st) });
          // 5레벨: 화염 피해 취약 +5% (최대 50%)
          if (sk.level >= 5 && e.alive) e.fireVuln = Math.min(0.5, (e.fireVuln || 0) + 0.05);
        }
      }
      f.t -= dt;
      if (f.t <= 0) {
        this.scene.remove(f.mesh, f.glow);
        f.geo.dispose(); f.mat.dispose(); f.coreGeo.dispose(); f.coreMat.dispose(); f.glow.material.dispose();
        sk.flame = null;
        sk.cd = sample(f.st.cooldown);
        sk.cdMax = sk.cd;
      }
    }
  }

  execute(sk, st) {
    if (sk.key === 'fireball') this.castFireball(sk, st);
    else if (sk.key === 'chainLightning') this.castLightning(sk, st);
    else if (sk.key === 'iceball') { this.castIceball(sk, st); if (sk.level >= 5) this.castIceball(sk, st); }
    else if (sk.key === 'magnet') this.castMagnet(st);
    else if (sk.key === 'flamethrower') this.startFlame(sk, st);
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
        this.enemies.damage(e, sample(st.damage), {
          element: 'ice', status: statusProb(st),
          kx: ((e.x - p.x) / (d || 1)) * push, kz: ((e.z - p.z) / (d || 1)) * push,
        });
      }
    }
  }

  // 적 처치 시 패시브 (발동 : 처치 / 화염의 기운 / 냉기의 기운)
  onKill(e) {
    const tk = game.skills.find((s) => s.key === 'triggerKill');
    if (tk) {
      tk.stacks = Math.min(99999, tk.stacks + e.maxHp * 0.2);
      const goal = triggerGoal(tk);
      if (goal > 0 && tk.stacks >= goal) {
        tk.stacks -= goal;
        const st = getStats(tk);
        const dur = sample(st.duration);
        const buff = { key: 'triggerKill', icon: '💀', name: '발동 : 처치', color: tk.def.color, t: dur, max: dur,
          charges: tk.level >= 5 ? 3 : 1, sentences: completeSentences(tk), scale: tk.level >= 3 ? 1.2 : 1 };
        const old = game.buffs.findIndex((b) => b.key === 'triggerKill');
        if (old >= 0) game.buffs[old] = buff; else game.buffs.push(buff);
        const p = this.player.pos;
        this.fx.ring(p.x, p.z, 1.6, 0xc07cff, 0.5, 0.6);
        game.sys.ui.toast('💀 발동 : 처치 — 다음 공격 스킬 강화!', 'pick');
        sfx('levelup');
      }
    }
    if (e.burnT > 0) {
      const sk = game.skills.find((s) => s.key === 'fireAura');
      if (sk) {
        const st = getStats(sk);
        const radius = sample(st.area) / U / 2;
        // 5레벨: 남은 화상 피해 (틱 피해 × 남은 틱 수) 를 폭발 피해에 추가
        const bonus = sk.level >= 5 ? e.burnDmg * Math.ceil(e.burnT / STATUS.burnTick - 1e-6) : 0;
        const x = e.x, z = e.z;
        this.fx.explosion(x, z, Math.max(0.3, radius), 0xff5a2a);
        sfx('explode');
        for (const t of this.enemies.query(x, z, radius + 2.2)) {
          const d = Math.hypot(t.x - x, t.z - z);
          if (t.alive && d <= radius + t.r * 0.7) {
            this.enemies.damage(t, sample(st.damage) + bonus, {
              element: 'fire', status: statusProb(st), kx: ((t.x - x) / (d || 1)) * 3, kz: ((t.z - z) / (d || 1)) * 3,
            });
          }
        }
      }
    }
    if (e.chillT > 0) {
      const sk = game.skills.find((s) => s.key === 'frostAura');
      if (sk) {
        const st = getStats(sk);
        const n = sampleInt(st.projCount);
        const size = sample(st.projSize) / U, speed = sample(st.projSpeed) * PS, life = sample(st.duration), pierce = sampleInt(st.pierce);
        const a0 = Math.random() * Math.PI * 2;
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / n) * Math.PI * 2;
          const dx = Math.cos(a), dz = Math.sin(a);
          this.spawnProj({ kind: 'ice', element: 'ice', x: e.x + dx * e.r, z: e.z + dz * e.r, y: 0.6, dx, dz, speed, size, life, pierce, st, status: statusProb(st), ignore: e, chains: sampleInt(st.chains) });
        }
      }
    }
  }

  castFireball(sk, st) {
    sfx('fire');
    const p = this.player;
    const base = Math.atan2(p.aim.z, p.aim.x);
    const n = sampleInt(st.projCount);
    // 스탯 단위 → 월드 단위
    const size = sample(st.projSize) / U, speed = sample(st.projSpeed) * PS, life = sample(st.duration);
    const pierce = sampleInt(st.pierce), area = sample(st.area) / U;
    for (let i = 0; i < n; i++) {
      const a = spreadAngle(base, i);
      const dx = Math.cos(a), dz = Math.sin(a);
      this.spawnProj({
        kind: 'fire', element: 'fire', x: p.pos.x + dx * 0.45, z: p.pos.z + dz * 0.45, y: 0.62,
        dx, dz, speed, size, life, pierce, area, st, status: statusProb(st), chains: sampleInt(st.chains),
        split: sk.level >= 5, areaFactor: areaFactor(sk),
      });
    }
  }

  // 연쇄 번개: 투사체 개수 = 처음 뻗는 번개 줄기 수, 투사체 크기 = 굵기, 투사체 속도 = 연쇄 속도
  castLightning(sk, st) {
    const p = this.player.pos;
    const range = sample(st.range) / U;
    const lineDmg = sk.level >= 5;
    const firsts = this.enemies.nearestN(p.x, p.z, range, sampleInt(st.projCount));
    const width = Math.max(0.05, sample(st.projSize) / U);            // 기본 1 → 0.2
    const step = 0.07 * (6 / Math.max(0.1, sample(st.projSpeed)));   // 기본 6 → 0.07초 간격
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
          if (tgt.alive) this.enemies.damage(tgt, sample(st.damage), { element: 'lightning', status: statusProb(st) });
          // 5레벨: 번개 줄기에 닿은 적도 피해 (줄기 굵기만큼 판정)
          if (lineDmg) {
            const mx = (f.x + end.x) / 2, mz = (f.z + end.z) / 2;
            const half = Math.hypot(end.x - f.x, end.z - f.z) / 2;
            for (const e of this.enemies.query(mx, mz, half + 2.2)) {
              if (!e.alive || hit.has(e) || lineHit.has(e)) continue;
              if (segDist(e.x, e.z, f.x, f.z, end.x, end.z) < e.r + width / 2 + 0.05) {
                lineHit.add(e);
                this.enemies.damage(e, sample(st.damage), { element: 'lightning', status: statusProb(st) });
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

  castIceball(sk, st) {
    sfx('iceball');
    const p = this.player.pos;
    const range = sample(st.range) / U;
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * range;
    const x = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, p.x + Math.cos(a) * r));
    const z = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, p.z + Math.sin(a) * r));
    const size = sample(st.area) / U;
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

  spawnProj(o) {
    const mesh = o.kind === 'fire' ? this.firePool.get() : this.icePool.get();
    Object.assign(o, { mesh, age: 0, hit: new Set(o.ignore ? [o.ignore] : []), pierceLeft: o.pierce, chainsLeft: o.chains || 0, pierceFlash: 0, dead: false });
    if (o.dmgMul == null) o.dmgMul = 1;
    mesh.scale.setScalar(o.size);
    mesh.position.set(o.x, o.y, o.z);
    mesh.rotation.set(0, Math.atan2(o.dx, o.dz), 0);
    this.projs.push(o);
  }

  // ── 투사체 (투사체 지속 시간 동안 유지) ──
  updateProjectiles(dt) {
    const lim = WORLD_HALF + 12;
    for (let i = this.projs.length - 1; i >= 0; i--) {
      const p = this.projs[i];
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
            // 연쇄: 1회 소모해 가장 가까운 다른 적을 향해 다시 발사 (유도 아님)
            if (p.chainsLeft > 0 && this.redirect(p)) break;
            if (p.pierceLeft > 0) {
              p.pierceLeft--;
              p.pierceFlash = 0.15;
              this.fx.ring(p.x, p.z, Math.max(0.4, p.size * 1.2), p.kind === 'fire' ? 0xffe08a : 0xd8f8ff, 0.25, p.y);
            } else { p.dead = true; break; }
          }
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
      if (p.pierceFlash > 0) { p.pierceFlash -= dt; p.mesh.scale.setScalar(p.size * (1 + p.pierceFlash * 4)); }
      if (p.kind === 'fire') {
        const sh = p.mesh.userData.shell;
        sh.rotation.x += dt * 6; sh.rotation.z += dt * 4;
        // 불꽃 + 연기 꼬리
        const c = [0xffb347, 0xff6a1a, 0xffe08a, 0xff4a10][Math.floor(Math.random() * 4)];
        this.fx.particles.emit(p.x - p.dx * p.size * 0.4 + (Math.random() - 0.5) * p.size * 0.4, p.y, p.z - p.dz * p.size * 0.4 + (Math.random() - 0.5) * p.size * 0.4,
          -p.dx * 1.2, 0.4 + Math.random() * 0.6, -p.dz * 1.2, 0.28, p.size * 0.4, c, -1.5);
        if (Math.random() < 0.35) {
          this.fx.particles.emit(p.x - p.dx * p.size * 0.6, p.y + 0.05, p.z - p.dz * p.size * 0.6,
            -p.dx * 0.5, 0.8, -p.dz * 0.5, 0.45, p.size * 0.35, Math.random() < 0.5 ? 0x4a3a32 : 0x6a5a50, -1);
        }
      }
      if (p.dead) {
        (p.kind === 'fire' ? this.firePool : this.icePool).put(p.mesh);
        this.projs[i] = this.projs[this.projs.length - 1];
        this.projs.pop();
      }
    }
  }

  redirect(p) {
    let best = null, bd = 12 * 12;
    for (const t of this.enemies.query(p.x, p.z, 12)) {
      if (!t.alive || p.hit.has(t)) continue;
      const d2 = (t.x - p.x) ** 2 + (t.z - p.z) ** 2;
      if (d2 < bd) { bd = d2; best = t; }
    }
    if (!best) return false;
    const d = Math.sqrt(bd) || 1;
    p.dx = (best.x - p.x) / d; p.dz = (best.z - p.z) / d;
    p.chainsLeft--;
    p.age = 0;
    p.mesh.rotation.set(0, Math.atan2(p.dx, p.dz), 0);
    this.fx.ring(p.x, p.z, Math.max(0.4, p.size * 1.3), 0xfff06a, 0.25, p.y);
    return true;
  }

  onProjHit(p, e) {
    if (p.kind === 'fire') {
      const radius = p.area / 2;
      sfx('explode');
      this.fx.explosion(p.x, p.z, Math.max(0.3, radius));
      const cands = this.enemies.query(p.x, p.z, radius + 2.2);
      for (const t of cands) {
        if (!t.alive) continue;
        const d = Math.hypot(t.x - p.x, t.z - p.z);
        if (d <= radius + t.r * 0.7 || t === e) {
          const nx = (t.x - p.x) / (d || 1), nz = (t.z - p.z) / (d || 1);
          this.enemies.damage(t, sample(p.st.damage) * p.dmgMul, { kx: nx * 4, kz: nz * 4, element: p.element, status: p.status });
        }
      }
      // 5레벨: 진행 방향으로 작은 투사체 3개 (작은 투사체는 다시 튀지 않음)
      // 크기 40% · 속도 75% · 지속 25% · 피해 40% · 폭발 범위 = 크기 × 5 (문장 효과 비율 유지)
      if (p.split) {
        const base = Math.atan2(p.dz, p.dx);
        for (const off of [-25, 0, 25]) {
          const a = base + off * DEG;
          const dx = Math.cos(a), dz = Math.sin(a);
          this.spawnProj({
            kind: 'fire', element: 'fire', x: p.x + dx * 0.2, z: p.z + dz * 0.2, y: p.y, dx, dz,
            speed: p.speed * 0.75 * 1.3, size: p.size * 0.4, life: p.life * 0.25, pierce: p.pierce,
            area: p.area * 0.4 * (5 / p.areaFactor), st: p.st, status: p.status, dmgMul: p.dmgMul * 0.4, split: false, ignore: e,
            chains: p.chainsLeft,
            explodeOnExpire: true,
          });
        }
      }
    } else {
      this.enemies.damage(e, sample(p.st.damage) * p.dmgMul, { kx: p.dx * 1.5, kz: p.dz * 1.5, element: p.element, status: p.status });
      this.fx.particles.burst(p.x, p.y, p.z, 4, [0xd8f8ff, 0x9fe6ff], { speed: 2, size: 0.06, life: 0.25, up: 1.5 });
    }
  }

  // ── 아이스볼 ──────────────────────────
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
            this.enemies.damage(e, sample(ib.contact), { element: 'ice', status: statusProb(st, ib.sk.def.contactChanceRatio) });
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
        const size = sample(st.projSize) / U, speed = sample(st.projSpeed) * PS, pierce = sampleInt(st.pierce), life = sample(st.projDuration);
        const dirs = ib.backShot ? [base, base + Math.PI] : [base];
        for (const b of dirs) {
          for (let k = 0; k < n; k++) {
            const a = spreadAngle(b, k);
            const dx = Math.cos(a), dz = Math.sin(a);
            sfx('iceShot');
            this.spawnProj({ kind: 'ice', element: 'ice', x: ib.x + dx * radius, z: ib.z + dz * radius, y: 0.7, dx, dz, speed, size, life, pierce, st, status: statusProb(st), chains: sampleInt(st.chains) });
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
}
