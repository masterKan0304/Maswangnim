import * as THREE from 'three';
import { ENEMY_TYPES, WORLD_HALF, STATUS } from './config.js';
import { slimeBodyGeometry, slimeFaceGeometry, createKingSlime, createEliteSlime } from './models.js';
import { game } from './state.js';
import { sfx } from './audio.js';

const MAX = 460;
const CELL = 2;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);
const WHITE = new THREE.Color(0xffffff);
const TINT = { burn: new THREE.Color(0xff5a14), chill: new THREE.Color(0x9fe6ff), shock: new THREE.Color(0xfff06a) };
const ELEM_NUM = { fire: 'fire', ice: 'ice', lightning: 'elec' };
const key = (cx, cz) => (cx + 1000) * 4096 + (cz + 1000);

export class EnemyManager {
  constructor(scene, fx) {
    this.scene = scene;
    this.fx = fx;
    this.list = [];
    this.grid = new Map();
    this.onKill = null;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0.0, flatShading: true });
    this.body = new THREE.InstancedMesh(slimeBodyGeometry(), bodyMat, MAX);
    this.body.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    this.body.castShadow = true;
    this.body.frustumCulled = false;
    this.body.count = 0;
    this.face = new THREE.InstancedMesh(slimeFaceGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true }), MAX);
    this.face.frustumCulled = false;
    this.face.count = 0;
    scene.add(this.body, this.face);
  }

  spawn(type, x, z, hpMul = 1) {
    const T = ENEMY_TYPES[type];
    const e = {
      type, T, x, z,
      hp: T.hp * hpMul, maxHp: T.hp * hpMul,
      r: T.radius, speed: T.speed * (0.9 + Math.random() * 0.2), dmg: T.dmg,
      phase: Math.random(), flash: 0, rot: 0, kx: 0, kz: 0,
      alive: true, boss: type === 'boss', color: new THREE.Color(T.color),
      y: 0, sy: 1, sxz: 1, spawnT: 0,
      burnT: 0, burnDmg: 0, burnTick: 0, chillT: 0, shockT: 0,
    };
    e.elite = type === 'elite';
    if (e.boss || e.elite) {
      e.model = e.boss ? createKingSlime() : createEliteSlime();
      this.scene.add(e.model.group);
      e.summonT = 5;
    }
    this.list.push(e);
    return e;
  }

  buildGrid() {
    this.grid.clear();
    for (const e of this.list) {
      const k = key(Math.floor(e.x / CELL), Math.floor(e.z / CELL));
      let a = this.grid.get(k);
      if (!a) { a = []; this.grid.set(k, a); }
      a.push(e);
    }
  }

  query(x, z, r, out = []) {
    const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL);
    const z0 = Math.floor((z - r) / CELL), z1 = Math.floor((z + r) / CELL);
    for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
      const a = this.grid.get(key(cx, cz));
      if (a) for (const e of a) if (e.alive) out.push(e);
    }
    return out;
  }

  nearestN(x, z, range, n) {
    const c = [];
    for (const e of this.list) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - x, e.z - z) - e.r * 0.5;
      if (d <= range) c.push([d, e]);
    }
    c.sort((a, b) => a[0] - b[0]);
    return c.slice(0, n).map((v) => v[1]);
  }

  anyInRange(x, z, range) {
    for (const e of this.list) if (e.alive && Math.hypot(e.x - x, e.z - z) - e.r * 0.5 <= range) return true;
    return false;
  }

  randomInRange(x, z, range, exclude) {
    const c = this.query(x, z, range + 2).filter((e) => !exclude.has(e) && Math.hypot(e.x - x, e.z - z) - e.r * 0.5 <= range);
    return c.length ? c[Math.floor(Math.random() * c.length)] : null;
  }

  // element: 'fire' | 'ice' | 'lightning', status: 상태이상 부여 확률(0~1). 상태이상을 먼저 부여한 뒤 피해 적용
  // pen: 저항 무시 { pct(0~1), flat }, crit: 치명타 여부, src/st: 피해를 준 스킬 (처치 시 효과용)
  // (dot: 지속 피해는 상태이상을 부여하지 않음)
  damage(e, amount, { kx = 0, kz = 0, color, element = null, status = 0, dot = false, pen = null, crit = false, src = null, st = null } = {}) {
    if (!e.alive) return;
    if (element && !dot && Math.random() < status) this.applyStatus(e, element, amount, src, st);
    // 속성 저항: 피해 × 100 / (100 + 저항). 저항 무시로 음수가 되면 그만큼 더 받음
    if (element) {
      let res = e.T.res || 0;
      if (pen) res = res * (1 - Math.min(1, pen.pct)) - pen.flat;
      amount *= res >= 0 ? 100 / (100 + res) : 2 - 100 / (100 - res);
    }
    if (e.shockT > 0) amount *= 1 + STATUS.shockAmp;
    if (element === 'fire' && e.fireVuln) amount *= 1 + e.fireVuln;   // 화염 방사 5레벨 취약
    if (!color && element) color = ELEM_NUM[element];
    amount *= game.mods.dmgMul;   // 업그레이드: 모든 피해 증가
    e.hp -= amount;
    e.flash = 0.12;
    const kb = e.boss ? 0.1 : e.elite ? 0.3 : 1;
    e.kx += kx * kb; e.kz += kz * kb;
    this.fx.numbers.spawn(e.x, 0.9 + e.r * 1.4, e.z, crit ? `${Math.floor(amount)}!` : Math.floor(amount), (color || '') + (crit ? ' crit' : ''));
    if (!dot) sfx('hit');
    if (e.hp <= 0) {
      e.alive = false;
      sfx('kill');
      this.fx.particles.burst(e.x, 0.4, e.z, e.boss ? 60 : e.elite ? 30 : 12, [e.T.color, 0xffffff, e.T.color], { speed: e.boss ? 8 : e.elite ? 5 : 3.5, size: e.boss ? 0.35 : e.elite ? 0.24 : 0.16, life: 0.6, up: 4 });
      this.fx.splat(e.x, e.z, e.T.color, e.r);
      if (e.model) this.scene.remove(e.model.group);
      if (this.onKill) this.onKill(e, src, st);
    }
  }

  applyStatus(e, element, amount, src = null, st = null) {
    if (element === 'fire') {
      e.burnSrc = src; e.burnSt = st;
      e.burnT = STATUS.duration;
      e.burnDmg = Math.max(1, amount * (0.1 + Math.random() * 0.1));
      if (e.burnTick <= 0) e.burnTick = STATUS.burnTick;
    } else if (element === 'ice') {
      if (e.chillT <= 0) this.fx.particles.burst(e.x, 0.5, e.z, 6, [0xd8f8ff, 0x9fe6ff], { speed: 1.5, size: 0.07, life: 0.4, up: 1.5 });
      e.chillT = STATUS.duration;
    } else if (element === 'lightning') {
      e.shockT = STATUS.duration;
    }
  }

  updateStatus(e, dt) {
    if (e.burnT > 0) {
      e.burnT -= dt;
      e.burnTick -= dt;
      if (Math.random() < dt * 10) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r, 0.3 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r,
        0, 1.2, 0, 0.4, 0.1, Math.random() < 0.5 ? 0xff7a2a : 0xffc04a, -2);
      if (e.burnTick <= 0) {
        e.burnTick += STATUS.burnTick;
        this.damage(e, e.burnDmg, { element: 'fire', dot: true, color: 'burn', src: e.burnSrc, st: e.burnSt });
      }
      if (e.burnT <= 0) e.burnTick = 0;
    }
    if (e.chillT > 0) e.chillT -= dt;
    if (e.shockT > 0) {
      e.shockT -= dt;
      if (Math.random() < dt * 6) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r * 1.5, 0.4 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r * 1.5,
        (Math.random() - 0.5) * 3, 2, (Math.random() - 0.5) * 3, 0.15, 0.06, 0xfff6a8, 0);
    }
  }

  update(dt, player, obstacles) {
    // 죽은 적 제거 (in-place)
    let w = 0;
    for (let i = 0; i < this.list.length; i++) if (this.list[i].alive) this.list[w++] = this.list[i];
    this.list.length = w;
    this.buildGrid();

    const px = player.pos.x, pz = player.pos.z;
    const lim = WORLD_HALF;
    for (const e of this.list) {
      e.spawnT += dt;
      let dx = px - e.x, dz = pz - e.z;
      const dist = Math.hypot(dx, dz) || 1;
      dx /= dist; dz /= dist;

      // 통통 튀는 이동
      e.phase += dt * (e.boss ? 0.75 : 1.6);
      const p = e.phase % 1;
      const air = p < 0.6;
      const mv = e.speed * (air ? 1.4 : 0.3) * (e.chillT > 0 ? 1 - STATUS.slow : 1);
      let vx = dx * mv, vz = dz * mv;

      // 분리 (겹침 방지)
      const cx = Math.floor(e.x / CELL), cz = Math.floor(e.z / CELL);
      for (let ox = -1; ox <= 1; ox++) for (let oz = -1; oz <= 1; oz++) {
        const a = this.grid.get(key(cx + ox, cz + oz));
        if (!a) continue;
        for (const o of a) {
          if (o === e) continue;
          const sx = e.x - o.x, sz = e.z - o.z;
          const rr = (e.r + o.r) * 0.85;
          const d2 = sx * sx + sz * sz;
          if (d2 < rr * rr && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const push = ((rr - d) / rr) * (o.boss ? 9 : 4);
            vx += (sx / d) * push; vz += (sz / d) * push;
          }
        }
      }
      e.x += (vx + e.kx) * dt;
      e.z += (vz + e.kz) * dt;
      const decay = Math.exp(-7 * dt);
      e.kx *= decay; e.kz *= decay;
      if (!e.boss) obstacles.resolve(e, e.r * 0.75);
      e.x = Math.max(-lim, Math.min(lim, e.x));
      e.z = Math.max(-lim, Math.min(lim, e.z));

      // 회전 (부드럽게)
      const target = Math.atan2(dx, dz);
      let diff = target - e.rot;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      e.rot += diff * Math.min(1, dt * 8);

      // 스쿼시 & 스트레치
      if (air) {
        const k = Math.sin((p / 0.6) * Math.PI);
        e.y = k * (e.boss ? 0.8 : 0.35);
        e.sy = 1 + 0.14 * k;
      } else {
        const k = Math.sin(((p - 0.6) / 0.4) * Math.PI);
        e.y = 0;
        e.sy = 1 - 0.22 * k;
      }
      e.sxz = 1 / Math.sqrt(e.sy);
      if (e.flash > 0) e.flash -= dt;
      this.updateStatus(e, dt);
      if (!e.alive) continue;

      // 접촉 피해
      if (Math.hypot(px - e.x, pz - e.z) < e.r * 0.9 + player.radius) player.takeDamage(e.dmg);

      // 보스: 주기적으로 슬라임 소환
      if (e.boss) {
        e.summonT -= dt;
        if (e.summonT <= 0) {
          e.summonT = 6;
          for (let i = 0; i < 5; i++) {
            const a = Math.random() * Math.PI * 2;
            this.spawn(Math.random() < 0.3 ? 'yellow' : 'green', e.x + Math.cos(a) * 3, e.z + Math.sin(a) * 3, game.sys.hpMul());
          }
          this.fx.ring(e.x, e.z, 4, 0xb07cff, 0.6);
        }
      }
    }
  }

  // 상태이상 색 표시
  tint(e, out, t = 0) {
    out.copy(e.color);
    if (e.chillT > 0) out.lerp(TINT.chill, 0.5);
    if (e.burnT > 0) out.lerp(TINT.burn, 0.3 + 0.15 * Math.sin(t * 20 + e.phase * 10));
    if (e.shockT > 0 && Math.sin(t * 30 + e.phase * 20) > 0.3) out.lerp(TINT.shock, 0.5);
    return out;
  }

  render(t = 0) {
    let n = 0;
    for (const e of this.list) {
      if (!e.alive) continue;
      const grow = Math.min(1, e.spawnT / 0.25);
      const s = e.r * 2 * grow;
      if (e.model) {
        const g = e.model.group;
        g.position.set(e.x, e.y, e.z);
        g.rotation.y = e.rot;
        g.scale.set(s * e.sxz, s * e.sy, s * e.sxz);
        this.tint(e, _c, t);
        e.model.body.material.color.copy(_c);
        e.model.body.material.emissive.setRGB(e.flash > 0 ? 0.5 : 0, e.flash > 0 ? 0.5 : 0, e.flash > 0 ? 0.5 : 0);
        continue;
      }
      _p.set(e.x, e.y, e.z);
      _q.setFromAxisAngle(UP, e.rot);
      _s.set(s * e.sxz, s * e.sy, s * e.sxz);
      _m.compose(_p, _q, _s);
      this.body.setMatrixAt(n, _m);
      this.face.setMatrixAt(n, _m);
      this.tint(e, _c, t);
      if (e.flash > 0) _c.lerp(WHITE, 0.75);
      this.body.setColorAt(n, _c);
      n++;
      if (n >= MAX) break;
    }
    this.body.count = n;
    this.face.count = n;
    this.body.instanceMatrix.needsUpdate = true;
    this.face.instanceMatrix.needsUpdate = true;
    this.body.instanceColor.needsUpdate = true;
  }
}
