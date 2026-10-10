// ─────────────────────────────────────────────
//  마솽 고유 패시브 "개화": 처치 → 양분, 양분 5 → 주위에 꽃
//  꽃에 적이 닿으면 1초 뒤 터짐 / "열매 맺기": 매 N번째 꽃에서 열매가 자라 적이 많은 곳으로 던져짐
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { RingMesh } from './effects.js';
import { game } from './state.js';
import { STAT_UNIT as U, PROJ_SPEED_UNIT as PS, WORLD_HALF } from './config.js';
import { getStats, sample, sampleInt, seedFlowerCount, fruitNeed, FRUIT_PEN_TIME } from './skills.js';
import { sfx } from './audio.js';
import { ic } from './icons.js';
import { CHARACTERS } from './characters.js';
import { fruitGeometry, decorateFruit, tickFruit, burstFruit } from './fruitfx.js';

const NEED = 5;            // 꽃 하나에 필요한 양분
const RANGE = 30 / U;      // 꽃이 피는 거리 (30)
const AREA = 20;           // 꽃 폭발 효과 범위 (지름)
const DMG = [12, 16];
const MAX_FLOWERS = 24;
const FRUIT_COLORS = {
  none: [0xff5a6e, 0xffc2ca], fire: [0xff7a2e, 0xffd27a], ice: [0x7fd8ff, 0xe0f8ff], nature: [0x5fd34a, 0xc8f5b0],
  ocean: [0x3fa8ff, 0xc0e4ff], earth: [0xb07a40, 0xe8c89a], dark: [0x7a4ad0, 0xc8a8ff], radiant: [0xffe066, 0xfffae0],
};
const FRUIT_ZONE_TIME = 3;   // 속성 열매가 터진 뒤 남는 이펙트(덩굴 · 안개 · 돌) 시간
const FRUIT_ELEMS = ['fire', 'ice', 'nature', 'ocean', 'earth', 'dark', 'radiant'];   // 열매 맺기 3레벨: 7가지 속성 중 무작위

export class Bloom {
  constructor(scene, fx, enemies, player, skillsRt) {
    Object.assign(this, { scene, fx, enemies, player, skillsRt });
    this.flowers = [];
    this.fruits = [];        // 자라는 중 / 날아가는 중
    this.waves = [];         // 세계수의 씨앗 파동
    this.nutrients = 0;
    this.count = 0;          // 지금까지 핀 꽃 수 (열매 주기)
    // 피해량 표에 '개화' 줄로 기록되는 피해 출처 (꽃 폭발)
    const pv = CHARACTERS.masang.passive;
    this.src = { key: 'bloom', def: { name: pv.name, icon: ic(pv.icon), color: '#ff9ec4', base: { damage: 1 } }, dmgTotal: 0 };
    // 꽃 모양 (공용 지오메트리 / 재질)
    this.geo = {
      stem: new THREE.CylinderGeometry(0.035, 0.05, 0.5, 5).translate(0, 0.25, 0),
      petal: new THREE.SphereGeometry(0.16, 6, 4).scale(1, 0.35, 1.6),
      core: new THREE.SphereGeometry(0.1, 6, 4),
      leaf: new THREE.SphereGeometry(0.12, 5, 3).scale(1.8, 0.3, 0.8),
      fruit: new THREE.IcosahedronGeometry(0.22, 1),
    };
    this.mat = {
      stem: new THREE.MeshStandardMaterial({ color: 0x3f9a3a, roughness: 0.8, flatShading: true }),
      petal: new THREE.MeshStandardMaterial({ color: 0xff9ec4, emissive: 0x5a1a34, emissiveIntensity: 0.25, roughness: 0.6, flatShading: true }),
      core: new THREE.MeshStandardMaterial({ color: 0xffd45a, emissive: 0x6a4a00, emissiveIntensity: 0.4, flatShading: true }),
    };
  }

  active() { return game.charId === 'masang'; }

  onKill() { if (this.active()) this.addNutrient(1); }

  // fromSeed: 세계수의 씨앗으로 얻은 양분 (중첩을 쌓지 않음)
  addNutrient(n, fromSeed = false) {
    if (!this.active()) return;
    this.nutrients += n;
    while (this.nutrients >= NEED) { this.nutrients -= NEED; this.spawnFlower(); }
    const seed = !fromSeed && game.skills.find((s) => s.key === 'worldSeed');
    if (seed) {
      seed.stacks += n;
      const goal = 100;
      if (seed.stacks >= goal) { seed.stacks -= goal; this.seedBurst(seed); }
    }
  }

  // 세계수의 씨앗: 마솽을 중심으로 고리가 퍼져 나가며 가장자리를 따라 꽃이 고르게 핌 (1초 뒤 저절로 터짐, 5레벨: 닿은 적의 자리에도 꽃)
  seedBurst(sk) {
    const st = getStats(sk);
    const p = this.player.pos;
    const R = sample(st.area) / U / 2;
    const mk = (color, opacity, geo = this.fx.ringGeo) => {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const m = geo === this.fx.ringGeo ? new RingMesh(mat) : new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(p.x, 0.07, p.z);
      this.scene.add(m);
      return m;
    };
    // 파동 고리 3겹 (금빛 · 초록 · 흰빛) + 바닥에 번지는 빛
    const rings = [mk(0xffe680, 0.95), mk(0x7ed957, 0.8), mk(0xffffff, 0.6)];
    const glow = mk(0xfff3a0, 0.35, this.fx.circleGeo);
    // 고리가 퍼지는 시간은 일정 → 효과 범위가 넓을수록 빠르게 퍼짐
    this.waves.push({ sk, st, x: p.x, z: p.z, R, t: 0, dur: 1.8, n: seedFlowerCount(sk), born: 0, hit: new Set(), rings, glow });
    // 가운데에서 솟는 빛 기둥
    for (let k = 0; k < 70; k++) {
      const a = Math.random() * Math.PI * 2, d = Math.random() * 0.9;
      this.fx.particles.emit(p.x + Math.cos(a) * d, 0.2 + Math.random(), p.z + Math.sin(a) * d, Math.cos(a) * 0.5, 6 + Math.random() * 6, Math.sin(a) * 0.5, 1.2, 0.14 + Math.random() * 0.12,
        [0xffe680, 0x7ed957, 0xffffff, 0xff9ec4][k % 4], -1.5);
    }
    this.fx.ring(p.x, p.z, 2.2, 0xffffff, 0.5);
    sfx('explode');
    if (!game.demo) { sfx('levelup'); sfx('boss'); }
  }

  updateWaves(dt) {
    for (const w of [...this.waves]) {
      w.t += dt;
      const k = Math.min(1, w.t / w.dur);
      const ease = 1 - Math.pow(1 - k, 1.6);   // 처음엔 빠르게, 끝으로 갈수록 천천히
      const r = Math.max(0.1, w.R * ease);
      const fade = 1 - Math.max(0, (k - 0.75) / 0.25);
      w.rings[0].scale.setScalar(r); w.rings[0].material.opacity = 0.95 * fade;
      w.rings[1].scale.setScalar(Math.max(0.1, r * 0.93)); w.rings[1].material.opacity = 0.75 * fade;
      w.rings[2].scale.setScalar(Math.max(0.1, r * 0.82)); w.rings[2].material.opacity = 0.5 * fade;
      w.glow.scale.setScalar(r); w.glow.material.opacity = 0.28 * fade * (1 - k * 0.5);
      // 파동 앞쪽에서 꽃잎 · 잎사귀 · 금빛 가루가 흩날림
      const n = Math.round(8 + r * 2);
      for (let q = 0; q < n; q++) {
        const a = Math.random() * Math.PI * 2;
        const roll = Math.random();
        const col = roll < 0.35 ? (Math.random() < 0.5 ? 0xff9ec4 : 0xffd0e4) : roll < 0.7 ? (Math.random() < 0.5 ? 0x7ed957 : 0x4fbf4a) : 0xffe680;
        this.fx.particles.emit(w.x + Math.cos(a) * r, 0.15 + Math.random() * 0.4, w.z + Math.sin(a) * r, Math.cos(a) * 3, 2 + Math.random() * 3, Math.sin(a) * 3,
          0.6 + Math.random() * 0.5, roll < 0.7 ? 0.11 + Math.random() * 0.06 : 0.07, col, 1.2);
      }
      // 고리의 가장자리를 따라 꽃이 고르게 핌 (퍼지는 시간 동안 같은 간격으로)
      const obs = game.sys.world && game.sys.world.obstacles;
      while (w.born < w.n && w.t >= ((w.born + 0.5) / w.n) * w.dur) {
        w.born++;
        let x = w.x, z = w.z;
        for (let tries = 0; tries < 6; tries++) {
          const a = Math.random() * Math.PI * 2;
          x = Math.max(-WORLD_HALF + 1, Math.min(WORLD_HALF - 1, w.x + Math.cos(a) * r));
          z = Math.max(-WORLD_HALF + 1, Math.min(WORLD_HALF - 1, w.z + Math.sin(a) * r));
          if (!obs || !obs.blocked(x, z, 0.4)) break;
        }
        this.spawnFlower({ x, z }, true);
      }
      // 5레벨: 고리가 닿은 적의 자리에 꽃 (고리는 피해를 주지 않음)
      if (w.sk.level >= 5) {
        for (const e of this.enemies.query(w.x, w.z, r + 2.2)) {
          if (!e.alive || w.hit.has(e) || w.hit.size >= 40) continue;
          if (Math.hypot(e.x - w.x, e.z - w.z) > r + e.r * 0.5) continue;
          w.hit.add(e);
          this.spawnFlower({ x: e.x, z: e.z }, true);
        }
      }
      if (k >= 1) {
        for (const m of [...w.rings, w.glow]) { this.scene.remove(m); m.material.dispose(); }
        this.waves = this.waves.filter((x) => x !== w);
      }
    }
  }

  // ── 꽃 ──
  // at: 정해진 자리에 피움 / seed: 세계수의 씨앗 꽃 (1초 뒤 저절로 터짐, 개수 제한에는 포함되지 않지만 열매 맺기 주기에는 포함)
  spawnFlower(at = null, seed = false) {
    const p = this.player.pos;
    const obs = game.sys.world && game.sys.world.obstacles;
    let x = p.x, z = p.z;
    if (at) { x = at.x; z = at.z; }
    else for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2, d = 1.2 + Math.random() * (RANGE - 1.2);
      x = Math.max(-WORLD_HALF + 1, Math.min(WORLD_HALF - 1, p.x + Math.cos(a) * d));
      z = Math.max(-WORLD_HALF + 1, Math.min(WORLD_HALF - 1, p.z + Math.sin(a) * d));
      if (!obs || !obs.blocked(x, z, 0.5)) break;
    }
    const g = new THREE.Group();
    g.add(new THREE.Mesh(this.geo.stem, this.mat.stem));
    const head = new THREE.Group();
    head.position.y = 0.52;
    for (let k = 0; k < 5; k++) {
      const pt = new THREE.Mesh(this.geo.petal, this.mat.petal);
      const a = (k / 5) * Math.PI * 2;
      pt.position.set(Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16);
      pt.rotation.y = -a + Math.PI / 2;
      head.add(pt);
    }
    head.add(new THREE.Mesh(this.geo.core, this.mat.core));
    g.add(head);
    for (const s of [-1, 1]) {
      const lf = new THREE.Mesh(this.geo.leaf, this.mat.stem);
      lf.position.set(s * 0.12, 0.16, 0); lf.rotation.z = s * 0.4;
      g.add(lf);
    }
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    g.position.set(x, 0, z);
    g.scale.setScalar(0.01);
    this.scene.add(g);
    const f = { x, z, mesh: g, head, age: 0, armT: seed ? 1 : -1, ry: Math.random() * 6, seed };
    this.flowers.push(f);
    this.fx.particles.burst(x, 0.4, z, seed ? 6 : 10, [0xff9ec4, 0xffd0e4, 0x8ff07a], { speed: 1.6, size: 0.08, life: 0.5, up: 2.5 });
    if (seed) this.quietSfx('gem');
    else {
      const normal = this.flowers.filter((x) => !x.seed);
      if (normal.length > (game.demo ? 10 : MAX_FLOWERS)) this.removeFlower(normal[0]);   // 미리보기에서는 최대 10개
      sfx('gem');
    }
    this.count++;
    // 열매 맺기: 꽃이 필 때마다 중첩 +1, 필요한 꽃 수에 도달하면 그만큼 소모해 열매
    // (열매가 자랄 때마다 3초간 필요한 꽃 수 +2, 중첩됨 — 세계수의 씨앗으로 열매가 너무 많이 생기지 않게)
    const fs = game.skills.find((s) => s.key === 'fruit');
    if (fs) {
      fs.stacks++;
      const need = fruitNeed(fs);
      if (fs.stacks >= need) {
        fs.stacks -= need;
        (fs.fruitPen || (fs.fruitPen = [])).push(FRUIT_PEN_TIME);
        this.growFruit(f, fs);
      }
    }
    return f;
  }

  // 한꺼번에 많이 피고 터질 때 소리가 겹치지 않게
  quietSfx(name) {
    const now = performance.now();
    this._sfxT = this._sfxT || {};
    if (now - (this._sfxT[name] || 0) < 70) return;
    this._sfxT[name] = now;
    sfx(name);
  }

  removeFlower(f) {
    this.scene.remove(f.mesh);
    this.flowers = this.flowers.filter((x) => x !== f);
  }

  // 꽃 폭발 (mul: 솔바람이 터뜨리면 범위와 피해 1.5배)
  explode(f, mul = 1) {
    if (!this.flowers.includes(f)) return;
    this.removeFlower(f);
    const r = (AREA / U / 2) * mul;
    for (const e of this.enemies.query(f.x, f.z, r + 2.2)) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - f.x, e.z - f.z);
      if (d > r + e.r * 0.6) continue;
      const amt = (DMG[0] + Math.random() * (DMG[1] - DMG[0])) * mul;
      this.enemies.damage(e, amt * (game.mods.dmgMul || 1), { color: 'bloom', src: this.src, kx: ((e.x - f.x) / (d || 1)) * 3, kz: ((e.z - f.z) / (d || 1)) * 3 });
    }
    this.fx.ring(f.x, f.z, r, 0xff9ec4, 0.5);
    this.fx.ring(f.x, f.z, r * 0.6, 0xffffff, 0.35);
    this.fx.particles.burst(f.x, 0.5, f.z, (f.seed ? 14 : 26) + Math.round(mul * 6), [0xff9ec4, 0xffd0e4, 0xffffff, 0x8ff07a], { speed: 3 + r * 1.5, size: 0.12, life: 0.6, up: 3.5 });
    this.quietSfx('explode');
  }

  // ── 열매 ──
  growFruit(f, sk) {
    const st = getStats(sk);
    const el = sk.level >= 3 ? FRUIT_ELEMS[Math.floor(Math.random() * FRUIT_ELEMS.length)] : 'none';
    const [c1, c2] = FRUIT_COLORS[el];
    const mat = new THREE.MeshStandardMaterial({ color: c1, emissive: c1, emissiveIntensity: el === 'earth' ? 0.05 : el === 'dark' ? 0.5 : 0.25, roughness: el === 'earth' ? 0.95 : 0.4, flatShading: true });
    const mesh = new THREE.Mesh(fruitGeometry(el, this.geo.fruit), mat);
    mesh.castShadow = true;
    decorateFruit(mesh, el);   // 속성 열매 장식 (불꽃 · 물 막 · 잎 · 서리 · 껍질 · 칼날 · 후광)
    mesh.position.set(f.x, 0.6, f.z);
    mesh.scale.setScalar(0.01);
    this.scene.add(mesh);
    this.fruits.push({ phase: 'grow', t: 0, x: f.x, z: f.z, mesh, mat, sk, st, el, c2, extra: sampleInt(st.projCount) - 1 });
  }

  // 열매 기준 가장 가까운 적 (16 거리 안)
  pickTarget(x, z) {
    const e = this.enemies.nearestN(x, z, 16, 1)[0];
    return e ? { x: e.x, z: e.z } : null;
  }

  throwFruit(fr, tx, tz, mesh) {
    const speed = sample(fr.st.projSpeed) * PS;
    const d = Math.hypot(tx - fr.x, tz - fr.z);
    return { phase: 'fly', t: 0, dur: Math.max(0.35, d / speed), fx0: fr.x, fz0: fr.z, tx, tz, mesh, mat: mesh.material, sk: fr.sk, st: fr.st, el: fr.el, c2: fr.c2 };
  }

  land(fr) {
    const r = sample(fr.st.area) / U / 2;
    const infuse = fr.el !== 'none' ? { [fr.el]: { min: 0.4, max: 0.4, pct: true } } : null;   // 3레벨: 속성 추가 피해 40%
    for (const e of this.enemies.query(fr.tx, fr.tz, r + 2.2)) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - fr.tx, e.z - fr.tz);
      if (d > r + e.r * 0.6) continue;
      const push = (r - d + 1) * 6;   // 중심에서 바깥으로 밀쳐냄
      this.skillsRt.deal(e, fr.sk, fr.st, { kx: ((e.x - fr.tx) / (d || 1)) * push, kz: ((e.z - fr.tz) / (d || 1)) * push, infuse, infuseStatus: 0.5 });
    }
    const col = fr.mat.color.getHex();
    if (fr.el === 'none') {
      this.fx.ring(fr.tx, fr.tz, r, col, 0.5);
      this.fx.particles.burst(fr.tx, 0.4, fr.tz, 24, [col, fr.c2, 0xffffff], { speed: 4 + r, size: 0.13, life: 0.55, up: 4 });
    } else {
      burstFruit(fr.el, fr.tx, fr.tz, r, this.fx, FRUIT_ZONE_TIME);   // 속성 폭발 이펙트 (덩굴 · 안개 등이 잠시 남음)
    }
    this.scene.remove(fr.mesh); fr.mat.dispose();
    fr.mesh.traverse((c) => { if (c.isSprite && c !== fr.mesh) c.material.dispose(); });
    sfx('explode');
  }

  update(dt) {
    this.updateWaves(dt);
    // 열매 맺기: 필요한 꽃 수 증가가 3초 뒤 하나씩 풀림
    const fs = game.skills.find((s) => s.key === 'fruit');
    if (fs && fs.fruitPen && fs.fruitPen.length) {
      for (let i = fs.fruitPen.length - 1; i >= 0; i--) { fs.fruitPen[i] -= dt; if (fs.fruitPen[i] <= 0) fs.fruitPen.splice(i, 1); }
    }
    // 꽃: 자라남 / 적이 닿으면 1초 뒤 폭발
    for (const f of [...this.flowers]) {
      f.age += dt;
      const grow = Math.min(1, f.age / 0.35);
      let s = grow * (1 + 0.15 * Math.sin(Math.min(1, f.age / 0.35) * Math.PI));
      if (f.armT < 0) {
        for (const e of this.enemies.query(f.x, f.z, 1.6)) {
          if (e.alive && Math.hypot(e.x - f.x, e.z - f.z) < e.r + 0.35) { f.armT = 1; if (!game.demo) this.quietSfx('select'); break; }
        }
      } else {
        f.armT -= dt;
        s *= 1 + 0.25 * Math.abs(Math.sin(f.armT * 14));   // 터지기 직전 두근두근
        if (f.armT <= 0) { this.explode(f, 1); continue; }
      }
      f.mesh.scale.setScalar(s);
      f.head.rotation.y = f.ry + f.age * 0.6;
    }
    // 열매: 꽃 위에서 자란 뒤 던져짐
    for (const fr of [...this.fruits]) {
      fr.t += dt;
      if (fr.phase === 'grow') {
        const k = Math.min(1, fr.t / 0.7);
        fr.mesh.scale.setScalar(k * 1.2);
        fr.mesh.position.y = 0.6 + k * 0.35;
        fr.mesh.rotation.y += dt * 3;
        if (k < 1) { tickFruit(fr, dt, false, this.fx); continue; }
        // 다 자란 열매: 범위 안에 적이 없으면 꽃 위에서 기다림 (살랑살랑 흔들리며)
        fr.mesh.position.y = 0.95 + Math.sin(fr.t * 3) * 0.06;
        tickFruit(fr, dt, false, this.fx);
        fr.waitT = (fr.waitT || 0) - dt;
        if (fr.waitT > 0) continue;
        fr.waitT = 0.2;
        const tgt = this.pickTarget(fr.x, fr.z);
        if (!tgt) continue;
        this.fruits = this.fruits.filter((x) => x !== fr);
        this.fruits.push(this.throwFruit(fr, tgt.x, tgt.z, fr.mesh));
        // 투사체 개수가 늘어나면 나머지는 목표 주위 20 범위 안 무작위 위치로
        for (let i = 0; i < fr.extra; i++) {
          const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (20 / U / 2);
          const m2 = fr.mesh.clone(true);
          m2.material = fr.mat.clone();
          m2.castShadow = true;
          m2.traverse((c) => { if (c.isSprite) c.material = c.material.clone(); });   // 깜빡임은 열매마다 따로
          this.scene.add(m2);
          this.fruits.push(this.throwFruit(fr, tgt.x + Math.cos(a) * d, tgt.z + Math.sin(a) * d, m2));
        }
        sfx('fire');
        continue;
      }
      const k = Math.min(1, fr.t / fr.dur);
      fr.mesh.position.set(fr.fx0 + (fr.tx - fr.fx0) * k, 0.95 + Math.sin(k * Math.PI) * 2.6 - 0.6 * k, fr.fz0 + (fr.tz - fr.fz0) * k);
      fr.mesh.rotation.x += dt * 8; fr.mesh.rotation.z += dt * 5;
      if (fr.el === 'none') { if (Math.random() < 0.5) this.fx.particles.emit(fr.mesh.position.x, fr.mesh.position.y, fr.mesh.position.z, 0, 0.3, 0, 0.3, 0.08, fr.c2, -0.5); }
      else tickFruit(fr, dt, true, this.fx);
      if (k >= 1) { this.fruits = this.fruits.filter((x) => x !== fr); this.land(fr); }
    }
  }

  clear() {
    for (const f of this.flowers) this.scene.remove(f.mesh);
    for (const fr of this.fruits) { this.scene.remove(fr.mesh); fr.mat.dispose(); }
    for (const w of this.waves) for (const m of [...w.rings, w.glow]) { this.scene.remove(m); m.material.dispose(); }
    this.flowers = []; this.fruits = []; this.waves = [];
    this.nutrients = 0; this.count = 0;
    this.src.dmgTotal = 0;
  }
}
