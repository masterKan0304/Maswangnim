import * as THREE from 'three';
import { WORLD_HALF, STAT_UNIT as U, PROJ_SPEED_UNIT as PS, STATUS, ELEMENT_DMG } from './config.js';
import { game, schedule } from './state.js';
import { getStats, computeStats, sample, sampleInt, avg, statusProb, maxStacks, areaFactor, ATTACK_SKILLS, enchantReq, triggerGoal, completeSentences } from './skills.js';
import { makeGlowSprite } from './effects.js';
import { jitter } from './models.js';
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
    const cm = crit ? sample(st.critDamage) / 100 : 1;
    const pen = { pct: avg(st.penPct), flat: sample(st.penetration) };
    const mul = o.mul ?? 1;
    const main = (o.base ?? sample(st.damage)) * mul;
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
      // 다른 속성의 추가 피해: 상태이상 발생율 절반
      if (v > 0 && e.alive) this.enemies.damage(e, v * cm, { ...common, element: x, status: x === el ? 0 : sp * 0.5 });
    }
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
    this.updateZones(dt);
    this.updateProjectiles(dt);
    this.updateIceballs(dt);
    this.updateSnowballs(dt);
    this.updateBeams(dt);
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
    const need = { chainLightning: sample(st.range) / U, snowfall: sample(st.range) / U, flamethrower: manual ? 0 : (sample(st.area) / U) * 1.3, lightningBeam: manual ? 0 : 14 }[sk.key];
    if (need && !this.enemies.anyInRange(p.x, p.z, need)) {
      if (manual) game.sys.ui.toast('사거리 안에 적이 없습니다', 'warn');
      return false;
    }
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

  execute(sk, st) {
    if (sk.key === 'fireball') this.castFireball(sk, st);
    else if (sk.key === 'chainLightning') this.castLightning(sk, st);
    else if (sk.key === 'iceball') { this.castIceball(sk, st); if (sk.level >= 5) this.castIceball(sk, st); }
    else if (sk.key === 'magnet') this.castMagnet(st);
    else if (sk.key === 'flamethrower') this.startFlame(sk, st);
    else if (sk.key === 'snowfall') this.castSnowfall(sk, st);
    else if (sk.key === 'lightningBeam') this.castBeam(sk, st);
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
        this.scene.remove(f.mesh, f.glow);
        f.geo.dispose(); f.mat.dispose(); f.coreGeo.dispose(); f.coreMat.dispose(); f.glow.material.dispose();
        sk.flame = null;
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
      this.addZone(e.x, e.z, src.def.element, sample(st.zone), sample(st.zoneArea) / U / 2, avg(st.damage));
    }
    const tk = game.skills.find((s) => s.key === 'triggerKill');
    if (tk) {
      tk.stacks = Math.min(99999, tk.stacks + e.maxHp * 0.2);
      const goal = triggerGoal(tk);
      if (goal > 0 && tk.stacks >= goal) {
        tk.stacks -= goal;
        const tst = getStats(tk);
        const dur = sample(tst.duration);
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
        const gen = () => ({ size: sample(ast.projSize) / U, speed: sample(ast.projSpeed) * PS, life: sample(ast.duration), pierce: sampleInt(ast.pierce) });
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
  addZone(x, z, el, time, r, burnBase) {
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
    this.zones.push({ x, z, el, t: time, max: time, r, tick: 0, burnBase, disc, ring, mats: [mat, ringMat], age: 0 });
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
          if (e.alive && Math.hypot(e.x - zn.x, e.z - zn.z) < zn.r + e.r * 0.5) this.enemies.applyStatus(e, zn.el, zn.burnBase);
        }
      }
      if (zn.t <= 0) this.removeZone(i);
    }
  }

  // ── 파이어볼 ──────────────────────────
  castFireball(sk, st) {
    sfx('fire');
    const p = this.player;
    const base = Math.atan2(p.aim.z, p.aim.x);
    const n = sampleInt(st.projCount);
    // 스탯 단위 → 월드 단위 (연쇄로 다시 생성될 때도 같은 방식으로 새로 뽑음)
    const gen = () => ({ size: sample(st.projSize) / U, speed: sample(st.projSpeed) * PS, life: sample(st.duration), pierce: sampleInt(st.pierce), area: sample(st.area) / U });
    for (let i = 0; i < n; i++) {
      const a = spreadAngle(base, i);
      const dx = Math.cos(a), dz = Math.sin(a);
      this.spawnProj({
        kind: 'fire', sk, ...gen(), gen, x: p.pos.x + dx * 0.45, z: p.pos.z + dz * 0.45, y: 0.62,
        dx, dz, st, chains: sampleInt(st.chains), split: sk.level >= 5, areaFactor: areaFactor(sk),
      });
    }
  }

  // 연쇄 번개: 투사체 개수 = 처음 뻗는 번개 줄기 수, 투사체 크기 = 굵기, 투사체 속도 = 연쇄 속도
  castLightning(sk, st) {
    const p = this.player.pos;
    const range = sample(st.range) / U;
    const lineDmg = sk.level >= 5;
    const firsts = this.enemies.nearestN(p.x, p.z, range, sampleInt(st.projCount));
    const width = Math.max(0.05, sample(st.projSize) / U);
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
            this.deal(e, ib.sk, st, { base: sample(ib.contact), statusRatio: ib.sk.def.contactChanceRatio });
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
        const gen = () => ({ size: sample(st.projSize) / U, speed: sample(st.projSpeed) * PS, life: sample(st.projDuration), pierce: sampleInt(st.pierce) });
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
  spawnProj(o) {
    const mesh = o.kind === 'fire' ? this.firePool.get() : this.icePool.get();
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
            // 연쇄: 1회 소모해 가장 가까운 다른 적을 향해 투사체를 새로 생성 (유도 아님)
            if (p.chainsLeft > 0 && this.chainProj(p)) { p.dead = true; break; }
            if (p.pierceLeft > 0) {
              p.pierceLeft--;
              p.pierceFlash = 0.15;
              this.fx.ring(p.x, p.z, Math.max(0.4, p.size * 1.2), p.kind === 'fire' ? 0xffe08a : 0xd8f8ff, 0.25, p.y);
            } else { p.dead = true; break; }
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
        (p.kind === 'fire' ? this.firePool : this.icePool).put(p.mesh);
        this.projs[i] = this.projs[this.projs.length - 1];
        this.projs.pop();
      }
    }
  }

  // 연쇄: 그 스킬의 투사체를 맞은 자리에서 새로 생성 (크기/속도/지속 시간/관통을 새로 적용, 개수는 1개)
  chainProj(p) {
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
      kind: p.kind, sk: p.sk, st: p.st, gen: p.gen, y: p.y, dmgMul: p.dmgMul,
      split: p.split, areaFactor: p.areaFactor, explodeOnExpire: p.explodeOnExpire,
      ...fresh, x: p.x, z: p.z, dx: (best.x - p.x) / d, dz: (best.z - p.z) / d,
      chains: p.chainsLeft - 1, hit: new Set(p.hit),
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
      this.deal(e, p.sk, p.st, { mul: p.dmgMul, kx: p.dx * 1.5, kz: p.dz * 1.5, infuse: p.infused });
      this.fx.particles.burst(p.x, p.y, p.z, 4, [0xd8f8ff, 0x9fe6ff], { speed: 2, size: 0.06, life: 0.25, up: 1.5 });
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
  dropSnowball(sk, st, x, z, chainsLeft, dur = 0.5) {
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
    this.snowballs.push({ sk, st, x, z, radius, size, chainsLeft, t: 0, dur, ball, mark, mat, markMat, from, embed: -1 });
  }

  // 눈덩이 충격: 강하게 튀는 파편 + 피어오르는 안개 + 범위 피해 / 밀쳐내기
  snowImpact(s) {
    sfx('explode'); sfx('frost');
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
        s.ball.position.set(s.x + (Math.random() - 0.5) * shake * 2, s.size * 0.35, s.z + (Math.random() - 0.5) * shake * 2);
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
      if (s.chainsLeft > 0) this.dropSnowball(s.sk, s.st, s.x, s.z, s.chainsLeft - 1, 0.25);
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
    const UP = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), mid = new THREE.Vector3();
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.age += dt; b.t -= dt;
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
