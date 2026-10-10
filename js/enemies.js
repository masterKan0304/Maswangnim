import * as THREE from 'three';
import { ENEMY_TYPES, WORLD_HALF, STATUS, elemMul } from './config.js';
import { slimeBodyGeometry, slimeFaceGeometry, createKingSlime, createEliteSlime } from './models.js';
import { game } from './state.js';
import { recordDamage } from './dps.js';
import { sfx } from './audio.js';

const MAX = 460;
const CELL = 2;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);
const WHITE = new THREE.Color(0xffffff);
const TINT = {
  burn: new THREE.Color(0xff5a14), chill: new THREE.Color(0x9fe6ff), root: new THREE.Color(0x6a8a2a),
  poison: new THREE.Color(0x5fd34a), exhaust: new THREE.Color(0x4a6a9a), stun: new THREE.Color(0xffe066), fear: new THREE.Color(0x5a2a9a), cons: new THREE.Color(0xffe680),
};
const ELEM_NUM = { fire: 'fire', ice: 'ice', nature: 'nature', ocean: 'ocean', earth: 'earth', dark: 'dark', radiant: 'radiant' };
const key = (cx, cz) => (cx + 1000) * 4096 + (cz + 1000);

export class EnemyManager {
  constructor(scene, fx) {
    this.scene = scene;
    this.fx = fx;
    this.list = [];
    this.lures = [];   // 적을 끌어들이는 대상 (짚 인형) { x, z, r, radius, dead, hit(e) }
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
      burnT: 0, burnDmg: 0, burnTick: 0, chillT: 0, shockT: 0, rootT: 0,
      poisonT: 0, poisonTick: 0, exhaustT: 0, stunT: 0, fearT: 0, fearImmune: 0, consT: 0, consAcc: 0, element: T.element || null,
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

  // element: 'fire' | 'ice' | 'nature' | 'ocean' | 'earth' | 'dark' | 'radiant', status: 상태이상 부여 확률(0~1). 상태이상을 먼저 부여한 뒤 피해 적용
  // pen: 저항 무시 { pct(0~1), flat }, crit: 치명타 여부, src/st: 피해를 준 스킬 (처치 시 효과용)
  // (dot: 지속 피해는 상태이상을 부여하지 않음)
  // raw: 공포 추가 피해 / 축성 폭발처럼 다른 효과에서 나온 피해 (다시 공포 · 축성에 쌓이지 않음)
  damage(e, amount, { kx = 0, kz = 0, color, element = null, status = 0, dot = false, pen = null, crit = false, src = null, st = null, raw = false } = {}) {
    if (!e.alive) return;
    // 같은 속성끼리는 상태이상을 걸 수 없음
    if (element && !dot && element !== e.element && Math.random() < status) this.applyStatus(e, element, amount, src, st);
    // 속성 저항: 피해 × 100 / (100 + 저항). 저항 무시로 음수가 되면 그만큼 더 받음
    if (element) {
      let res = e.T.res || 0;
      if (pen) res = res * (1 - Math.min(1, pen.pct)) - pen.flat;
      amount *= res >= 0 ? 100 / (100 + res) : 2 - 100 / (100 - res);
    }
    amount *= elemMul(e.element, element);   // 속성 상성: 약점 25% 더 / 저항 25% 덜
    if (element === 'fire' && e.fireVuln) amount *= 1 + e.fireVuln;   // 화염 방사 5레벨 취약
    if (!color && element) color = ELEM_NUM[element];
    if (!src) amount *= game.mods.dmgMul;   // 스킬이 아닌 피해(꽃 등)만 여기서 — 스킬 피해는 능력치에 이미 반영
    amount = amount > 0 ? Math.max(1, Math.round(amount)) : 0;   // 실제 피해는 소수점 반올림 (최소 1)
    // 공포: 받는 피해의 20% 를 칠흑 피해로 더 받음 / 축성: 받는 피해를 쌓아 둠
    const fearExtra = !raw && e.fearT > 0 && amount > 0 ? Math.max(1, Math.round(amount * STATUS.fearExtra)) : 0;
    if (!raw && e.consT > 0) e.consAcc += amount + fearExtra;
    recordDamage(src, amount + fearExtra);    // DPS 표 기록
    e.hp -= amount + fearExtra;
    if (fearExtra) this.fx.numbers.spawn(e.x + 0.35, 1.3 + e.r * 1.4, e.z, fearExtra, 'dark');
    e.flash = 0.12;
    const kb = e.boss ? 0.1 : e.elite ? 0.3 : 1;
    e.kx += kx * kb; e.kz += kz * kb;
    this.fx.numbers.spawn(e.x, 0.9 + e.r * 1.4, e.z, crit ? `${amount}!` : amount, (color || '') + (crit ? ' crit' : ''));
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
    } else if (element === 'nature') {
      // 중독: 3초간 1초마다 최대 체력의 일정 비율
      e.poisonSrc = src; e.poisonSt = st;
      if (e.poisonT <= 0) e.poisonTick = STATUS.poisonTick;
      e.poisonT = STATUS.duration;
    } else if (element === 'ocean') {
      e.exhaustT = STATUS.duration;                 // 탈진
    } else if (element === 'earth') {
      const mul = e.boss ? STATUS.stunMul.boss : e.elite ? STATUS.stunMul.elite : 1;
      e.stunT = Math.max(e.stunT, STATUS.stun * mul);   // 기절
    } else if (element === 'dark') {
      // 공포: 풀린 뒤 3초간은 다시 걸리지 않음
      if (e.fearT <= 0 && e.fearImmune <= 0) e.fearT = STATUS.duration * (e.boss || e.elite ? STATUS.fearBossMul : 1);
    } else if (element === 'radiant') {
      // 축성 중 다시 걸리면 쌓인 피해의 100% 를 바로 주고 새로 축성
      if (e.consT > 0 && e.consAcc > 0) this.consBurst(e, STATUS.consecrateRe);
      e.consSrc = src; e.consSt = st;
      e.consT = STATUS.duration; e.consAcc = 0;
    }
  }

  // 축성 폭발: 쌓인 피해의 일정 비율을 광휘 피해로
  consBurst(e, ratio) {
    const v = e.consAcc * ratio;
    e.consAcc = 0;
    if (v <= 0 || !e.alive) return;
    this.fx.particles.burst(e.x, 0.6 + e.r, e.z, 14, [0xffe680, 0xffffff, 0xfff3b0], { speed: 3, size: 0.12, life: 0.5, up: 4 });
    this.fx.ring(e.x, e.z, e.r * 1.6, 0xffe680, 0.4);
    this.damage(e, v, { element: 'radiant', dot: true, raw: true, color: 'radiant', src: e.consSrc, st: e.consSt });
  }

  updateStatus(e, dt) {
    if (e.rootT > 0) e.rootT -= dt;
    if (e.poisonT > 0) {
      e.poisonT -= dt; e.poisonTick -= dt;
      if (Math.random() < dt * 6) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r, 0.4 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r, 0, 0.9, 0, 0.5, 0.08, Math.random() < 0.5 ? 0x6fd36a : 0xb8f5a0, -0.5);
      if (e.poisonTick <= 0) {
        e.poisonTick += STATUS.poisonTick;
        const pct = e.boss ? STATUS.poisonPct.boss : e.elite ? STATUS.poisonPct.elite : STATUS.poisonPct.normal;
        this.damage(e, e.maxHp * pct, { element: 'nature', dot: true, color: 'poison', src: e.poisonSrc, st: e.poisonSt });
        if (!e.alive) return;
      }
    }
    if (e.exhaustT > 0) e.exhaustT -= dt;
    if (e.stunT > 0) {
      e.stunT -= dt;
      if (Math.random() < dt * 8) { const a = Math.random() * Math.PI * 2; this.fx.particles.emit(e.x + Math.cos(a) * e.r * 0.7, 0.6 + e.r * 1.6, e.z + Math.sin(a) * e.r * 0.7, -Math.sin(a) * 1.5, 0.2, Math.cos(a) * 1.5, 0.35, 0.08, 0xffe066, 0); }
    }
    if (e.fearT > 0) {
      e.fearT -= dt;
      if (e.fearT <= 0) e.fearImmune = STATUS.fearImmune;
      if (Math.random() < dt * 6) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r, 0.5 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r, 0, 1, 0, 0.5, 0.09, Math.random() < 0.5 ? 0x5a2a9a : 0x9a6bff, -0.8);
    } else if (e.fearImmune > 0) e.fearImmune -= dt;
    if (e.consT > 0) {
      e.consT -= dt;
      if (Math.random() < dt * 5) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r, 0.5 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r, 0, 0.8, 0, 0.5, 0.07, 0xffe680, -0.5);
      if (e.consT <= 0) { this.consBurst(e, STATUS.consecrate); if (!e.alive) return; }
    }
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
      // 미리보기에서 소환된 적: 잠시 뒤 스르륵 사라짐
      if (e.ttl != null) { e.ttl -= dt; if (e.ttl <= 0) { e.alive = false; continue; } }
      // 보스 기술 중 (힘 모으기 / 도약 / 점프): 위치와 모양은 기술이 직접 정함
      if (e.hold) {
        if (e.flash > 0) e.flash -= dt;
        e.kx = 0; e.kz = 0;
        this.updateStatus(e, dt);
        continue;
      }
      // 유인 (짚 인형): 범위 안에 있으면 인형을 쫓음
      let tx = px, tz = pz, lure = null;
      for (const l of this.lures) {
        if (l.dead || Math.hypot(l.x - e.x, l.z - e.z) > l.r) continue;
        if (!lure || Math.hypot(l.x - e.x, l.z - e.z) < Math.hypot(lure.x - e.x, lure.z - e.z)) lure = l;
      }
      if (lure) { tx = lure.x; tz = lure.z; }
      let dx = tx - e.x, dz = tz - e.z;
      const dist = Math.hypot(dx, dz) || 1;
      dx /= dist; dz /= dist;
      if (e.fearT > 0) { dx = -dx; dz = -dz; }   // 공포: 플레이어에게서 정반대로 달아남

      // 통통 튀는 이동
      e.phase += dt * (e.boss ? 0.75 : 1.6);
      const p = e.phase % 1;
      const air = p < 0.6;
      const mv = e.rootT > 0 || e.stunT > 0 ? 0 : e.speed * (air ? 1.4 : 0.3) * (e.chillT > 0 ? 1 - STATUS.slow : 1) * (e.fearT > 0 ? 1 - STATUS.fearSlow : 1);   // 속박 / 기절: 멈춤, 공포: 30% 느림
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
      if (e.stunT > 0) { /* 기절: 부딪혀도 피해 없음 */ }
      else if (lure) { if (Math.hypot(lure.x - e.x, lure.z - e.z) < e.r * 0.9 + lure.radius) lure.hit(e); }   // 인형이 공격을 대신 받음
      else if (Math.hypot(px - e.x, pz - e.z) < e.r * 0.9 + player.radius) player.takeDamage(e.dmg, e.element);

    }
  }

  // 상태이상 색 표시
  tint(e, out, t = 0) {
    out.copy(e.color);
    if (e.chillT > 0) out.lerp(TINT.chill, 0.5);
    if (e.burnT > 0) out.lerp(TINT.burn, 0.3 + 0.15 * Math.sin(t * 20 + e.phase * 10));
    if (e.poisonT > 0) out.lerp(TINT.poison, 0.35 + 0.1 * Math.sin(t * 6 + e.phase * 10));
    if (e.exhaustT > 0) out.lerp(TINT.exhaust, 0.4);
    if (e.stunT > 0 && Math.sin(t * 24 + e.phase * 20) > 0) out.lerp(TINT.stun, 0.45);
    if (e.fearT > 0) out.lerp(TINT.fear, 0.5);
    if (e.consT > 0) out.lerp(TINT.cons, 0.25 + 0.2 * Math.sin(t * 10 + e.phase * 10));
    if (e.rootT > 0) out.lerp(TINT.root, 0.45);
    return out;
  }

  render(t = 0) {
    let n = 0;
    for (const e of this.list) {
      if (!e.alive) continue;
      const grow = Math.min(1, e.spawnT / 0.25) * (e.ttl != null ? Math.min(1, e.ttl / 0.5) : 1);
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
