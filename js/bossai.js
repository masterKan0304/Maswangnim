// ─────────────────────────────────────────────
//  정예 / 보스 기술 (스테이지 1)
//  정예: 힘 모으기 → 플레이어 위치로 도약 (경고 장판)
//  킹 슬라임: 튕기는 점액 (튕길 때마다 소환) / 제자리 3번 점프 (주위 밀쳐내기 + 소환)
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { RingMesh } from './effects.js';
import { game } from './state.js';
import { ENEMY_SKILLS, STAT_UNIT as U, WORLD_HALF, STATUS } from './config.js';
import { sfx } from './audio.js';

const LEAP = ENEMY_SKILLS.eliteLeap, SPIT = ENEMY_SKILLS.bossSpit, STOMP = ENEMY_SKILLS.bossStomp;
const clampW = (v) => Math.max(-WORLD_HALF + 1, Math.min(WORLD_HALF - 1, v));

export class EnemySkills {
  constructor(scene, fx, enemies, player) {
    this.scene = scene; this.fx = fx; this.enemies = enemies; this.player = player;
    this.balls = [];
    this.marks = [];
    this.ballGeo = new THREE.IcosahedronGeometry(0.55, 1);
  }

  // 기술 속도 배율 (도감 미리보기에서는 더 자주 보여 줌)
  // 기술 속도 (탈진: 30% 느려짐)
  rate(e) { return (e.skillRate || 1) * (e.exhaustT > 0 ? 1 - STATUS.exhaust : 1); }

  update(dt) {
    for (const e of this.enemies.list) {
      if (!e.alive) continue;
      if (e.elite) this.elite(e, dt);
      else if (e.boss) this.boss(e, dt);
    }
    this.updateBalls(dt);
    this.updateMarks(dt);
  }

  // ── 경고 장판 ──
  addMark(x, z, r, owner) {
    const fill = new THREE.MeshBasicMaterial({ color: 0xff3b4a, transparent: true, opacity: 0.18, depthWrite: false });
    const edge = new THREE.MeshBasicMaterial({ color: 0xff5a66, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
    const disc = new THREE.Mesh(this.fx.circleGeo, fill);
    const ring = new RingMesh(edge);
    const grow = new THREE.Mesh(this.fx.circleGeo, fill.clone());
    grow.material.opacity = 0.3;
    for (const m of [disc, ring, grow]) { m.rotation.x = -Math.PI / 2; m.position.set(x, 0.05, z); }
    disc.scale.setScalar(r); ring.scale.setScalar(r); grow.scale.setScalar(0.01);
    this.scene.add(disc, ring, grow);
    const mk = { x, z, r, owner, disc, ring, grow, k: 0, age: 0 };
    this.marks.push(mk);
    return mk;
  }

  removeMark(mk) {
    this.scene.remove(mk.disc, mk.ring, mk.grow);
    mk.disc.material.dispose(); mk.ring.material.dispose(); mk.grow.material.dispose();
    this.marks = this.marks.filter((m) => m !== mk);
  }

  updateMarks(dt) {
    for (const mk of [...this.marks]) {
      if (mk.owner && !mk.owner.alive) { this.removeMark(mk); continue; }
      mk.age += dt;
      mk.grow.scale.setScalar(Math.max(0.01, mk.r * mk.k));   // 착지까지 남은 시간만큼 안쪽이 차오름
      mk.ring.material.opacity = 0.6 + 0.35 * Math.sin(mk.age * 14);
    }
  }

  // 범위 안 플레이어: 피해 + 범위 밖으로 밀어냄 / 일반 적: 밀어내기만
  impact(x, z, r, dmg, color, element = 'nature') {
    const p = this.player.pos;
    const dx = p.x - x, dz = p.z - z, d = Math.hypot(dx, dz);
    if (d < r + this.player.radius) {
      this.player.takeDamage(dmg, element);
      const nx = d > 0.01 ? dx / d : 1, nz = d > 0.01 ? dz / d : 0;
      const v = (r - d + 0.9) * 6;   // 밀려나는 거리 ≈ v / 6
      this.player.push(nx * v, nz * v);
    }
    for (const o of this.enemies.query(x, z, r + 1)) {
      if (o.boss || o.elite || !o.alive) continue;
      const ex = o.x - x, ez = o.z - z, ed = Math.hypot(ex, ez);
      if (ed > r) continue;
      const v = (r - ed + 0.6) * 7;
      o.kx += (ed > 0.01 ? ex / ed : 1) * v; o.kz += (ed > 0.01 ? ez / ed : 0) * v;
    }
    this.fx.ring(x, z, r, color, 0.5);
    this.fx.particles.burst(x, 0.3, z, 30, [color, 0xffffff, color], { speed: 3 + r * 2, size: 0.18, life: 0.6, up: 4 });
    sfx('explode');
  }

  // 소환: 아이템 / 경험치 없음 (미리보기에서는 3초 뒤 사라짐)
  summon(type, x, z, vx = 0, vz = 0) {
    const e = this.enemies.spawn(type, clampW(x), clampW(z), game.sys.hpMul());
    e.noDrop = true;
    e.kx = vx; e.kz = vz;
    if (game.demo) e.ttl = 3;
    return e;
  }

  // ── 정예: 힘 모으기 → 도약 ──
  elite(e, dt) {
    const s = e.sk || (e.sk = { cd: LEAP.every, phase: 'idle', t: 0 });
    if (e.stunT > 0 && s.phase !== 'leap') return;   // 기절: 기술 멈춤 (도약 중에는 착지까지)
    if (e.exhaustT > 0) dt *= 1 - STATUS.exhaust;    // 탈진: 기술 진행도 느려짐
    if (s.phase === 'idle') {
      s.cd -= dt * this.rate(e);
      if (s.cd <= 0) { s.phase = 'charge'; s.t = 0; e.hold = true; s.bx = e.x; s.bz = e.z; }
      return;
    }
    const p = this.player.pos;
    if (s.phase === 'charge') {
      s.t += dt;
      const k = Math.min(1, s.t / LEAP.charge);
      // 웅크리며 떨림 + 푸른 기운이 모임
      e.x = s.bx + (Math.random() - 0.5) * 0.12 * k; e.z = s.bz + (Math.random() - 0.5) * 0.12 * k;
      e.y = 0; e.sy = 1 - 0.3 * k; e.sxz = 1 / Math.sqrt(e.sy);
      e.rot = Math.atan2(p.x - e.x, p.z - e.z);
      if (Math.random() < 0.6) {
        const a = Math.random() * Math.PI * 2, d = e.r * 2.2;
        this.fx.particles.emit(e.x + Math.cos(a) * d, 0.3, e.z + Math.sin(a) * d, -Math.cos(a) * d * 2, 1.2, -Math.sin(a) * d * 2, 0.45, 0.12, 0x7fb8ff, 0);
      }
      if (s.t >= LEAP.charge) {
        // 플레이어 위치를 향해 최대 거리까지
        const dx = p.x - s.bx, dz = p.z - s.bz, d = Math.hypot(dx, dz) || 1;
        const reach = Math.min(d, LEAP.range / U);
        s.fx = s.bx; s.fz = s.bz;
        s.tx = clampW(s.bx + (dx / d) * reach); s.tz = clampW(s.bz + (dz / d) * reach);
        s.mark = this.addMark(s.tx, s.tz, LEAP.area / U / 2, e);
        s.phase = 'leap'; s.t = 0;
        e.x = s.bx; e.z = s.bz;
        sfx('dash');
      }
      return;
    }
    if (s.phase === 'leap') {
      s.t += dt;
      const k = Math.min(1, s.t / LEAP.leap);
      e.x = s.fx + (s.tx - s.fx) * k; e.z = s.fz + (s.tz - s.fz) * k;
      e.y = Math.sin(k * Math.PI) * 5;
      e.sy = 1 + 0.15 * Math.sin(k * Math.PI); e.sxz = 1 / Math.sqrt(e.sy);
      if (s.mark) s.mark.k = k;
      if (k >= 1) {
        e.y = 0; e.sy = 1; e.sxz = 1;
        if (s.mark) this.removeMark(s.mark);
        s.mark = null;
        this.impact(s.tx, s.tz, LEAP.area / U / 2, e.dmg * LEAP.dmgMul, 0x3f8cff);
        s.phase = 'idle'; s.cd = LEAP.every; e.hold = false;
      }
    }
  }

  // ── 킹 슬라임 ──
  boss(e, dt) {
    const s = e.sk || (e.sk = { spitCd: SPIT.every, stompCd: STOMP.every, phase: 'idle', t: 0 });
    if (e.stunT > 0) return;                         // 기절: 기술 멈춤
    if (e.exhaustT > 0) dt *= 1 - STATUS.exhaust;    // 탈진: 기술 진행도 느려짐
    const p = this.player.pos;
    if (s.phase === 'idle') {
      s.spitCd -= dt * this.rate(e);
      s.stompCd -= dt * this.rate(e);
      if (s.stompCd <= 0) { s.phase = 'stomp'; s.t = 0; s.jumps = 0; e.hold = true; s.bx = e.x; s.bz = e.z; }
      else if (s.spitCd <= 0) { s.phase = 'spit'; s.t = 0; e.hold = true; s.bx = e.x; s.bz = e.z; }
      return;
    }
    if (s.phase === 'spit') {
      // 1초간 부풀며 힘을 모은 뒤 점액을 뱉음
      s.t += dt;
      const k = Math.min(1, s.t / SPIT.charge);
      e.x = s.bx; e.z = s.bz; e.y = 0;
      e.sy = 1 + 0.2 * k; e.sxz = 1 + 0.1 * k;
      e.rot = Math.atan2(p.x - e.x, p.z - e.z);
      e.flash = Math.sin(s.t * 30) > 0.5 ? 0.05 : 0;
      if (s.t >= SPIT.charge) {
        const dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz) || 1;
        this.spawnBall(e, e.x + (dx / d) * e.r, e.z + (dz / d) * e.r);
        e.sy = 1; e.sxz = 1; e.hold = false;
        s.phase = 'idle'; s.spitCd = SPIT.every;
        sfx('frost');
      }
      return;
    }
    if (s.phase === 'stomp') {
      // 3초간 제자리에서 3번 점프
      s.t += dt;
      const per = STOMP.time / STOMP.jumps;
      const local = (s.t % per) / per;
      e.x = s.bx; e.z = s.bz;
      e.y = Math.sin(local * Math.PI) * 3;
      e.sy = 1 + 0.2 * Math.sin(local * Math.PI) - (local > 0.9 ? 0.25 : 0); e.sxz = 1 / Math.sqrt(e.sy);
      const landed = Math.floor(s.t / per);
      if (landed > s.jumps) {
        s.jumps = landed;
        e.y = 0;
        const r = STOMP.area / U / 2;
        this.impact(e.x, e.z, r, e.dmg, 0xb07cff);
        // 일반 몬스터 6마리를 바깥으로 튀어나오게 소환
        for (let i = 0; i < STOMP.spawn; i++) {
          const a = Math.random() * Math.PI * 2;
          const roll = Math.random();
          const type = roll < 0.5 ? 'green' : roll < 0.85 ? 'yellow' : 'red';
          this.summon(type, e.x + Math.cos(a) * e.r, e.z + Math.sin(a) * e.r, Math.cos(a) * 14, Math.sin(a) * 14);
        }
      }
      if (s.t >= STOMP.time) {
        e.y = 0; e.sy = 1; e.sxz = 1; e.hold = false;
        s.phase = 'idle'; s.stompCd = STOMP.every; s.spitCd = Math.max(s.spitCd, 1.5);
      }
    }
  }

  // ── 튕기는 점액 ──
  spawnBall(owner, x, z) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xb07cff, emissive: 0x5a2aa0, emissiveIntensity: 0.4, roughness: 0.4, flatShading: true, transparent: true, opacity: 0.92 });
    const mesh = new THREE.Mesh(this.ballGeo, mat);
    mesh.castShadow = true;
    this.scene.add(mesh);
    const b = { owner, mesh, mat, x, z, bounce: 0, dmg: owner.dmg };
    this.balls.push(b);
    this.nextHop(b);
  }

  nextHop(b) {
    const p = this.player.pos;
    const dx = p.x - b.x, dz = p.z - b.z, d = Math.hypot(dx, dz) || 1;
    const hop = Math.min(d, SPIT.hop / U);
    b.fx = b.x; b.fz = b.z;
    b.tx = clampW(b.x + (dx / d) * hop); b.tz = clampW(b.z + (dz / d) * hop);
    b.t = 0;
    b.mark = this.addMark(b.tx, b.tz, SPIT.area / U / 2, null);
  }

  updateBalls(dt) {
    for (const b of [...this.balls]) {
      b.t += dt;
      const k = Math.min(1, b.t / SPIT.hopTime);
      b.x = b.fx + (b.tx - b.fx) * k; b.z = b.fz + (b.tz - b.fz) * k;
      b.mesh.position.set(b.x, 0.5 + Math.sin(k * Math.PI) * 2.6, b.z);
      const sq = 1 + 0.25 * Math.sin(k * Math.PI);
      b.mesh.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
      b.mesh.rotation.y += dt * 4;
      if (b.mark) b.mark.k = k;
      if (k < 1) continue;
      // 튕김: 범위 피해 + 밀어냄 + 소환 (마지막은 3배)
      if (b.mark) this.removeMark(b.mark);
      b.mark = null;
      b.bounce++;
      this.impact(b.x, b.z, SPIT.area / U / 2, b.dmg, 0xb07cff);
      const mul = b.bounce >= SPIT.bounces ? SPIT.lastMul : 1;
      for (const [type, n] of Object.entries(SPIT.spawn)) {
        for (let i = 0; i < n * mul; i++) {
          const a = Math.random() * Math.PI * 2;
          this.summon(type, b.x + Math.cos(a) * 0.8, b.z + Math.sin(a) * 0.8, Math.cos(a) * 6, Math.sin(a) * 6);
        }
      }
      if (b.bounce >= SPIT.bounces) {
        this.scene.remove(b.mesh); b.mat.dispose();
        this.balls = this.balls.filter((x) => x !== b);
      } else this.nextHop(b);
    }
  }

  // 모든 기술 연출 정리 (미리보기 장면 전환 등)
  clear() {
    for (const b of this.balls) { this.scene.remove(b.mesh); b.mat.dispose(); }
    this.balls = [];
    for (const mk of [...this.marks]) this.removeMark(mk);
  }
}
