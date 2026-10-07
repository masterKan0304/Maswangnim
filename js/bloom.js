// ─────────────────────────────────────────────
//  마솽 고유 패시브 "개화": 처치 → 양분, 양분 5 → 주위에 꽃
//  꽃에 적이 닿으면 1초 뒤 터짐 / "열매 맺기": 매 N번째 꽃에서 열매가 자라 적이 많은 곳으로 던져짐
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { game } from './state.js';
import { STAT_UNIT as U, PROJ_SPEED_UNIT as PS, WORLD_HALF } from './config.js';
import { getStats, sample, sampleInt } from './skills.js';
import { sfx } from './audio.js';

const NEED = 5;            // 꽃 하나에 필요한 양분
const RANGE = 30 / U;      // 꽃이 피는 거리 (30)
const AREA = 20;           // 꽃 폭발 효과 범위 (지름)
const DMG = [12, 16];
const MAX_FLOWERS = 24;
const FRUIT_COLORS = { none: [0xff5a6e, 0xffc2ca], fire: [0xff7a2e, 0xffd27a], ice: [0x7fd8ff, 0xe0f8ff], lightning: [0xffe066, 0xfff8c0] };

export class Bloom {
  constructor(scene, fx, enemies, player, skillsRt) {
    Object.assign(this, { scene, fx, enemies, player, skillsRt });
    this.flowers = [];
    this.fruits = [];        // 자라는 중 / 날아가는 중
    this.nutrients = 0;
    this.count = 0;          // 지금까지 핀 꽃 수 (열매 주기)
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
      const goal = seed.level >= 3 ? 70 : 100;
      if (seed.stacks >= goal) { seed.stacks -= goal; this.seedBurst(seed); }
    }
  }

  // 세계수의 씨앗: 범위 안 모든 적에게 피해, 맞은 적 하나당 양분 2 (5레벨: 그 자리에 꽃)
  seedBurst(sk) {
    const st = getStats(sk);
    const p = this.player.pos;
    const R = sample(st.area) / U / 2;
    const hit = [];
    for (const e of this.enemies.query(p.x, p.z, R + 2.2)) {
      if (!e.alive || Math.hypot(e.x - p.x, e.z - p.z) > R + e.r * 0.5) continue;
      this.skillsRt.deal(e, sk, st);
      hit.push({ x: e.x, z: e.z });
      this.fx.particles.burst(e.x, 0.5, e.z, 6, [0xffe680, 0x7ed957], { speed: 2, size: 0.1, life: 0.5, up: 3 });
    }
    // 세계수 연출: 플레이어 자리에서 솟는 빛 기둥 + 퍼지는 고리
    for (let k = 0; k < 40; k++) {
      const a = Math.random() * Math.PI * 2, d = Math.random() * 0.8;
      this.fx.particles.emit(p.x + Math.cos(a) * d, 0.2 + Math.random(), p.z + Math.sin(a) * d, Math.cos(a) * 0.6, 5 + Math.random() * 4, Math.sin(a) * 0.6, 1, 0.16, Math.random() < 0.5 ? 0xffe680 : 0x7ed957, -2);
    }
    this.fx.ring(p.x, p.z, R, 0xffe680, 0.8);
    this.fx.ring(p.x, p.z, R * 0.66, 0x7ed957, 0.65);
    this.fx.ring(p.x, p.z, R * 0.33, 0xffffff, 0.5);
    sfx('explode');
    if (!game.demo) sfx('levelup');
    if (hit.length) this.addNutrient(hit.length * 2, true);
    if (sk.level >= 5) for (const h of hit.slice(0, 12)) this.spawnFlower(h);
  }

  // ── 꽃 ──
  // at: 정해진 자리에 피움 (도감 미리보기용)
  spawnFlower(at = null) {
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
    const f = { x, z, mesh: g, head, age: 0, armT: -1, ry: Math.random() * 6 };
    this.flowers.push(f);
    if (this.flowers.length > MAX_FLOWERS) this.removeFlower(this.flowers[0]);
    this.fx.particles.burst(x, 0.4, z, 10, [0xff9ec4, 0xffd0e4, 0x8ff07a], { speed: 1.6, size: 0.08, life: 0.5, up: 2.5 });
    sfx('gem');
    this.count++;
    // 열매 맺기: 매 5번째 꽃 (5레벨: 3번째)
    const fs = game.skills.find((s) => s.key === 'fruit');
    if (fs && this.count % (fs.level >= 5 ? 3 : 5) === 0) this.growFruit(f, fs);
    return f;
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
      this.enemies.damage(e, amt, { color: 'bloom', kx: ((e.x - f.x) / (d || 1)) * 3, kz: ((e.z - f.z) / (d || 1)) * 3 });
    }
    this.fx.ring(f.x, f.z, r, 0xff9ec4, 0.5);
    this.fx.ring(f.x, f.z, r * 0.6, 0xffffff, 0.35);
    this.fx.particles.burst(f.x, 0.5, f.z, 26 + Math.round(mul * 6), [0xff9ec4, 0xffd0e4, 0xffffff, 0x8ff07a], { speed: 3 + r * 1.5, size: 0.12, life: 0.6, up: 3.5 });
    sfx('explode');
  }

  // ── 열매 ──
  growFruit(f, sk) {
    const st = getStats(sk);
    const el = sk.level >= 3 ? ['fire', 'ice', 'lightning'][Math.floor(Math.random() * 3)] : 'none';
    const [c1, c2] = FRUIT_COLORS[el];
    const mat = new THREE.MeshStandardMaterial({ color: c1, emissive: c1, emissiveIntensity: 0.25, roughness: 0.4, flatShading: true });
    const mesh = new THREE.Mesh(el === 'lightning' ? new THREE.OctahedronGeometry(0.24, 0) : el === 'ice' ? new THREE.IcosahedronGeometry(0.24, 0) : this.geo.fruit, mat);
    mesh.castShadow = true;
    mesh.position.set(f.x, 0.6, f.z);
    mesh.scale.setScalar(0.01);
    this.scene.add(mesh);
    this.fruits.push({ phase: 'grow', t: 0, x: f.x, z: f.z, mesh, mat, sk, st, el, c2, extra: sampleInt(st.projCount) - 1 });
  }

  // 적이 가장 많은 곳 (보스가 있으면 보스)
  pickTarget(x, z) {
    let boss = null, best = null, bestN = -1;
    const list = this.enemies.list;
    for (const e of list) if (e.alive && e.boss) boss = e;
    if (boss) return { x: boss.x, z: boss.z };
    const step = Math.max(1, Math.floor(list.length / 60));
    for (let i = 0; i < list.length; i += step) {
      const e = list[i];
      if (!e.alive || Math.hypot(e.x - x, e.z - z) > 16) continue;
      const n = this.enemies.query(e.x, e.z, 2.6).length;
      if (n > bestN) { bestN = n; best = e; }
    }
    return best ? { x: best.x, z: best.z } : null;
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
    this.fx.ring(fr.tx, fr.tz, r, col, 0.5);
    this.fx.particles.burst(fr.tx, 0.4, fr.tz, 24, [col, fr.c2, 0xffffff], { speed: 4 + r, size: 0.13, life: 0.55, up: 4 });
    this.scene.remove(fr.mesh); fr.mat.dispose();
    sfx('explode');
  }

  update(dt) {
    // 꽃: 자라남 / 적이 닿으면 1초 뒤 폭발
    for (const f of [...this.flowers]) {
      f.age += dt;
      const grow = Math.min(1, f.age / 0.35);
      let s = grow * (1 + 0.15 * Math.sin(Math.min(1, f.age / 0.35) * Math.PI));
      if (f.armT < 0) {
        for (const e of this.enemies.query(f.x, f.z, 1.6)) {
          if (e.alive && Math.hypot(e.x - f.x, e.z - f.z) < e.r + 0.35) { f.armT = 1; if (!game.demo) sfx('select'); break; }
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
        if (k < 1) continue;
        const tgt = this.pickTarget(fr.x, fr.z);
        this.fruits = this.fruits.filter((x) => x !== fr);
        if (!tgt) { this.scene.remove(fr.mesh); fr.mat.dispose(); continue; }
        this.fruits.push(this.throwFruit(fr, tgt.x, tgt.z, fr.mesh));
        // 투사체 개수가 늘어나면 나머지는 목표 주위 20 범위 안 무작위 위치로
        for (let i = 0; i < fr.extra; i++) {
          const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (20 / U / 2);
          const m2 = new THREE.Mesh(fr.mesh.geometry, fr.mat.clone());
          m2.castShadow = true; m2.position.copy(fr.mesh.position); m2.scale.copy(fr.mesh.scale);
          this.scene.add(m2);
          this.fruits.push(this.throwFruit(fr, tgt.x + Math.cos(a) * d, tgt.z + Math.sin(a) * d, m2));
        }
        sfx('fire');
        continue;
      }
      const k = Math.min(1, fr.t / fr.dur);
      fr.mesh.position.set(fr.fx0 + (fr.tx - fr.fx0) * k, 0.95 + Math.sin(k * Math.PI) * 2.6 - 0.6 * k, fr.fz0 + (fr.tz - fr.fz0) * k);
      fr.mesh.rotation.x += dt * 8; fr.mesh.rotation.z += dt * 5;
      if (Math.random() < 0.5) this.fx.particles.emit(fr.mesh.position.x, fr.mesh.position.y, fr.mesh.position.z, 0, 0.3, 0, 0.3, 0.08, fr.c2, -0.5);
      if (k >= 1) { this.fruits = this.fruits.filter((x) => x !== fr); this.land(fr); }
    }
  }

  clear() {
    for (const f of this.flowers) this.scene.remove(f.mesh);
    for (const fr of this.fruits) { this.scene.remove(fr.mesh); fr.mat.dispose(); }
    this.flowers = []; this.fruits = [];
    this.nutrients = 0; this.count = 0;
  }
}
