// ─────────────────────────────────────────────
//  몬스터 게르게르: 밤이 시작될 때 일정 확률로 나타나 1분 동안 플레이어를 사냥
//  (처치하면 정예 보상 + 처음 처치 시 캐릭터 해금, 해금 후에는 나타나지 않음)
//  기술: 할퀴기 · 크루엘 버스트 · 출혈 유발 · 블랙 사바스 · 드리우는 밤
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { game } from './state.js';
import { WORLD_HALF, STAT_UNIT as U } from './config.js';
import { sfx } from './audio.js';
import { makeGlowSprite } from './effects.js';
import { clawFx, scarMark, smokePuff } from './gerger.js';

const DEG = Math.PI / 180;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const HUNT = {
  time: 60,                 // 사냥 시간 (초)
  chance: 0.1, chanceUp: 0.05,
  claw: { cd: 3, windup: 0.5, range: 1.5, mul: 1 },
  cruel: { cd: 12, range: 80 / U, mul: 1.5, speed: 20, life: 0.8 },
  sabbath: { cd: 12, range: 80 / U, mul: 1.5, speed: 4, life: 6, width: 2 },
  share: 3,                 // 크루엘 버스트 ↔ 블랙 사바스 공유 쿨타임
  nightHits: 3,             // 강력한 공격 3회 적중 → 드리우는 밤
  nightMul: 2,
  fear: 1.5,                // 플레이어 공포 (조작 불가 · 도망)
};

export class GergerHunter {
  // sys: { scene, fx, enemies, player, ui, isOwned(), unlock() }
  constructor(sys) {
    this.sys = sys;
    this.misses = 0;
    this.waves = [];      // 크루엘 버스트 칼날 파동
    this.sabs = [];       // 블랙 사바스 파동
    this.wall = null;     // 드리우는 밤 어둠의 벽
  }

  // 밤이 시작될 때: 10% (나타나지 않은 밤마다 +5%p)
  onNight() {
    if (this.sys.isOwned() || this.active()) return;
    const ch = HUNT.chance + HUNT.chanceUp * this.misses;
    if (Math.random() < ch) { this.misses = 0; this.spawn(); } else this.misses++;
  }

  active() { return this.sys.enemies.list.find((e) => e.alive && e.hunter); }

  spawn() {
    const { enemies, player, fx, ui } = this.sys;
    const a = Math.random() * Math.PI * 2;
    const x = THREE.MathUtils.clamp(player.pos.x + Math.cos(a) * 12, -WORLD_HALF + 2, WORLD_HALF - 2);
    const z = THREE.MathUtils.clamp(player.pos.z + Math.sin(a) * 12, -WORLD_HALF + 2, WORLD_HALF - 2);
    const e = enemies.spawn('gergerE', x, z, 1);
    e.hunter = { t: HUNT.time, claw: 1, cruel: 3, sab: 6, wind: 0, act: null, hits: 0, walk: 0 };
    for (let k = 0; k < 6; k++) smokePuff(fx, x + rnd(-1, 1), z + rnd(-1, 1), rnd(1.2, 2), 1);
    fx.ring(x, z, 2.5, 0x9a3aff, 0.8);
    if (ui) ui.toast('🐾 어둠 속에서 게르게르가 나타났다! (1분 안에 처치하세요)', 'boss');
    sfx('elite'); sfx('boss');
    return e;
  }

  update(dt) {
    const e = this.active();
    this.updateWaves(dt);
    this.updateSabs(dt);
    this.updateWall(dt);
    if (!e) return;
    const h = e.hunter, { player, fx } = this.sys, P = player.pos;
    h.t -= dt;
    if (h.t <= 0) { this.vanish(e); return; }
    for (const k of ['claw', 'cruel', 'sab']) if (h[k] > 0) h[k] -= dt;
    const dx = P.x - e.x, dz = P.z - e.z, dist = Math.hypot(dx, dz) || 1;
    const low = e.hp / e.maxHp < 0.3;
    // 공포 · 악몽 · 기절 · 속박 중에는 일반 이동 규칙 (기술도 멈춤)
    const ctl = e.fearT > 0 || e.nightmareT > 0 || e.stunT > 0 || e.rootT > 0;
    e.hold = !ctl;
    if (ctl) { h.act = null; e.redGlow = 0; return; }
    // 진행 중인 기술 (힘 모으기)
    if (h.act) {
      h.wind -= dt;
      e.rot = Math.atan2(dx, dz);
      e.redGlow = h.act === 'claw' ? 1 : 0;
      if (h.act !== 'claw' && Math.random() < 0.6) fx.particles.emit(e.x + rnd(-0.4, 0.4), rnd(0.3, 1.4), e.z + rnd(-0.4, 0.4), 0, 1.5, 0, 0.4, 0.1, pick([0x14051f, 0x9a3aff]), -1);
      if (h.wind <= 0) { const act = h.act; h.act = null; e.redGlow = 0; this.fire(e, act, dx / dist, dz / dist); }
      return;
    }
    // 기술 선택
    if (!low && h.claw <= 0 && dist < HUNT.claw.range) { h.act = 'claw'; h.wind = HUNT.claw.windup; sfx('warn'); return; }
    if (dist < HUNT.cruel.range) {
      if (h.cruel <= 0 && (dist > 2.5 || low)) { h.act = 'cruel'; h.wind = 0.5; sfx('boss'); return; }
      if (h.sab <= 0 && (dist > 2.5 || low)) { h.act = 'sab'; h.wind = 0.4; sfx('frost'); return; }
    }
    // 이동: 사냥하듯 (모든 기술이 쿨타임이면 거리를 벌리고, 하나라도 1초 이하가 되면 거리를 좁힘)
    // 체력 30% 미만: 할퀴기를 쓰지 않고 멀리서 원거리 기술만 (플레이어가 다가오면 피함)
    let want;
    if (low) want = dist < 6.5 ? -1 : dist > 9 ? 1 : 0.35;
    else {
      const ready = Math.min(h.claw, h.cruel, h.sab) <= 1;
      want = ready ? 1 : dist < 7.5 ? -1 : 0.3;
    }
    const side = want === 0.35 || want === 0.3 ? 1 : 0;   // 거리 유지 중이면 옆으로 맴돎
    let mx = (dx / dist) * want, mz = (dz / dist) * want;
    if (side) { mx += (-dz / dist) * 0.8; mz += (dx / dist) * 0.8; }
    const ml = Math.hypot(mx, mz) || 1;
    const sp = e.speed * (e.chillT > 0 ? 0.7 : 1);
    e.x += (mx / ml) * sp * dt; e.z += (mz / ml) * sp * dt;
    const obs = game.sys.world && game.sys.world.obstacles;
    if (obs) obs.resolve(e, e.r * 0.6);
    e.x = THREE.MathUtils.clamp(e.x, -WORLD_HALF + 1, WORLD_HALF - 1);
    e.z = THREE.MathUtils.clamp(e.z, -WORLD_HALF + 1, WORLD_HALF - 1);
    e.rot = Math.atan2(mx, mz);
    h.walk += dt * 12;
    if (e.model && e.model.legs) {
      const s = Math.sin(h.walk);
      e.model.legs[0].rotation.x = s * 0.6; e.model.legs[3].rotation.x = s * 0.6;
      e.model.legs[1].rotation.x = -s * 0.6; e.model.legs[2].rotation.x = -s * 0.6;
      if (e.model.tail) e.model.tail.rotation.z = Math.sin(h.walk * 0.7) * 0.4;
    }
  }

  fire(e, act, ux, uz) {
    const { fx } = this.sys, h = e.hunter;
    const a = Math.atan2(uz, ux);
    if (act === 'claw') {
      h.claw = HUNT.claw.cd;
      clawFx(fx, e.x, e.z, a, 1);
      sfx('dash');
      const P = this.sys.player.pos;
      const ox = P.x - e.x, oz = P.z - e.z, d = Math.hypot(ox, oz) || 1;
      if (d < HUNT.claw.range + 0.6 && (ox * ux + oz * uz) / d > 0.2) this.hitPlayer(e, e.dmg * HUNT.claw.mul, true, false);
    } else if (act === 'cruel') {
      h.cruel = HUNT.cruel.cd; h.sab = Math.max(h.sab, HUNT.share);
      const cast = { hit: false };
      for (let i = 0; i < 3; i++) this.addWave(e, a + (i - 1) * 10 * DEG, cast);
      fx.ring(e.x, e.z, 1.6, 0x9a6bff, 0.4);
      game.shake = Math.max(game.shake || 0, 0.15);
      sfx('explode');
    } else if (act === 'sab') {
      h.sab = HUNT.sabbath.cd; h.cruel = Math.max(h.cruel, HUNT.share);
      this.addSab(e, a);
      sfx('crackle');
    }
  }

  // 플레이어 피해 (bleed: 출혈 유발 — 준 피해의 50% 를 3초에 걸쳐 / power: 강력한 공격 → 드리우는 밤 누적)
  hitPlayer(e, dmg, bleed, power) {
    const p = this.sys.player;
    const before = p.hp;
    p.takeDamage(dmg, bleed && !power ? null : 'dark');
    const dealt = before - p.hp;
    if (bleed && dealt > 0 && p.addBleed) p.addBleed(dealt * 0.5, 3);
    if (power && dealt > 0 && e && e.alive && e.hunter) {
      e.hunter.hits++;
      if (e.hunter.hits >= HUNT.nightHits) { e.hunter.hits = 0; this.startWall(e); }
    }
  }

  // ── 크루엘 버스트: 칼날 파동 3개 (플레이어는 한 번만 맞음) ──
  addWave(e, a, cast) {
    const { scene, fx } = this.sys;
    const crest = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x241536, emissive: 0x6a2aff, emissiveIntensity: 0.9, flatShading: true, transparent: true, opacity: 1 });
    for (let k = 0; k < 5; k++) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.7, 4).translate(0, 0.35, 0), mat);
      m.position.set(0, 0, (k - 2) * 0.17); m.rotation.set(0, 0, -0.5); m.scale.setScalar(k === 2 ? 1.3 : 0.85);
      crest.add(m);
    }
    crest.rotation.y = -a;
    crest.position.set(e.x, 0, e.z);
    scene.add(crest);
    scarMark(fx, e.x, e.z, a, HUNT.cruel.speed * HUNT.cruel.life, HUNT.cruel.life, 1);
    this.waves.push({ e, x: e.x, z: e.z, dx: Math.cos(a), dz: Math.sin(a), t: 0, crest, mat, cast });
  }

  updateWaves(dt) {
    const P = this.sys.player.pos;
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i];
      w.t += dt;
      w.x += w.dx * HUNT.cruel.speed * dt; w.z += w.dz * HUNT.cruel.speed * dt;
      w.crest.position.set(w.x, 0, w.z);
      if (Math.random() < 0.8) this.sys.fx.particles.emit(w.x, 0.1, w.z, rnd(-1, 1), rnd(2, 4), rnd(-1, 1), 0.4, 0.1, pick([0x2a0a3a, 0x7a3aff]), 12);
      if (!w.cast.hit && Math.hypot(P.x - w.x, P.z - w.z) < 0.75) {
        w.cast.hit = true;   // 칼날 여러 개에 동시에 맞아도 한 번만
        this.hitPlayer(w.e, w.e.dmg * HUNT.cruel.mul, true, true);
      }
      if (w.t >= HUNT.cruel.life) { this.sys.scene.remove(w.crest); w.mat.dispose(); this.waves.splice(i, 1); }
    }
  }

  // ── 블랙 사바스: 스멀스멀 나아가는 어둠의 벽 ──
  addSab(e, a) {
    const { scene } = this.sys;
    const g = new THREE.Group();
    const mats = [];
    for (let k = 0; k < 4; k++) {
      const m = new THREE.MeshBasicMaterial({ color: k === 0 ? 0x14051f : 0x0a0414, transparent: true, opacity: 0.78 - k * 0.15, depthWrite: false, side: THREE.DoubleSide });
      const wm = new THREE.Mesh(new THREE.PlaneGeometry(HUNT.sabbath.width * 1.15, 2.2 - k * 0.35).translate(0, (2.2 - k * 0.35) / 2, 0), m);
      wm.position.z = -k * 0.45;
      g.add(wm); mats.push(m);
    }
    const crestMat = new THREE.MeshBasicMaterial({ color: 0xb060ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const crest = new THREE.Mesh(new THREE.PlaneGeometry(HUNT.sabbath.width * 1.2, 0.3), crestMat);
    crest.position.y = 2.2;
    g.add(crest); mats.push(crestMat);
    g.position.set(e.x, 0, e.z);
    g.rotation.y = Math.atan2(Math.cos(a), Math.sin(a));
    scene.add(g);
    this.sabs.push({ e, x: e.x, z: e.z, dx: Math.cos(a), dz: Math.sin(a), t: 0, g, mats, hit: false });
  }

  updateSabs(dt) {
    const P = this.sys.player.pos;
    for (let i = this.sabs.length - 1; i >= 0; i--) {
      const w = this.sabs[i];
      w.t += dt;
      w.x += w.dx * HUNT.sabbath.speed * dt; w.z += w.dz * HUNT.sabbath.speed * dt;
      w.g.position.set(w.x, 0, w.z);
      w.g.children.forEach((c, k) => { if (k < 4) c.scale.y = 1 + 0.08 * Math.sin(w.t * 5 + k); });
      const fade = Math.min(1, (HUNT.sabbath.life - w.t) / 0.5);
      w.mats.forEach((m, k) => { m.opacity = (k < 4 ? 0.78 - k * 0.15 : 0.6) * fade; });
      if (Math.random() < 0.9) { const s = rnd(-1, 1) * HUNT.sabbath.width / 2; this.sys.fx.particles.emit(w.x - w.dz * s, rnd(0.5, 2), w.z + w.dx * s, w.dx * 2, rnd(0.5, 1.5), w.dz * 2, 0.5, 0.12, pick([0x07020c, 0x3a1a5a, 0x9a3aff]), 2); }
      if (!w.hit) {
        const ox = P.x - w.x, oz = P.z - w.z;
        if (Math.abs(ox * w.dx + oz * w.dz) < 0.7 && Math.abs(-ox * w.dz + oz * w.dx) < HUNT.sabbath.width / 2 + 0.4) { w.hit = true; this.hitPlayer(w.e, w.e.dmg * HUNT.sabbath.mul, false, true); }
      }
      if (w.t >= HUNT.sabbath.life) { this.sys.scene.remove(w.g); w.mats.forEach((m) => m.dispose()); this.sabs.splice(i, 1); }
    }
  }

  // ── 드리우는 밤: 밤이 짙어지고 피할 수 없는 어둠의 파도 → 확정 공포 ──
  startWall(e) {
    if (this.wall) return;
    const { scene } = this.sys;
    const H = WORLD_HALF, L = H * 2 + 4;
    const axis = Math.random() < 0.5 ? 'x' : 'z', dir = Math.random() < 0.5 ? 1 : -1;
    const wall = new THREE.Group();
    const mats = [];
    for (let i = 0; i < 5; i++) {
      const m = new THREE.MeshBasicMaterial({ color: 0x0a0414, transparent: true, opacity: 0.5 - i * 0.08, depthWrite: false, side: THREE.DoubleSide });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(L, 3.6 - i * 0.4).translate(0, (3.6 - i * 0.4) / 2, 0), m);
      p.position.z = -i * 0.7;
      wall.add(p); mats.push(m);
    }
    const edge = new THREE.MeshBasicMaterial({ color: 0x9a3aff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const band = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.7).rotateX(-Math.PI / 2), edge); band.position.y = 0.07;
    wall.add(band); mats.push(edge);
    if (axis === 'x') wall.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; else wall.rotation.y = dir > 0 ? 0 : Math.PI;
    scene.add(wall);
    this.wall = { e, t: 0, axis, dir, from: -dir * (H + 1), to: dir * (H + 1), wall, mats, hit: false };
    game.nightDark = 1.2;   // 밤이 더 깊어짐
    game.shake = Math.max(game.shake || 0, 0.3);
    sfx('boss'); sfx('explode');
  }

  updateWall(dt) {
    const w = this.wall;
    if (!w) return;
    w.t += dt;
    const P = this.sys.player.pos;
    const pos = w.from + (w.to - w.from) * Math.min(1, w.t);
    if (w.axis === 'x') w.wall.position.set(pos, 0, 0); else w.wall.position.set(0, 0, pos);
    for (let q = 0; q < 8; q++) {
      const along = (w.axis === 'x' ? P.z : P.x) + rnd(-14, 14);
      const x = w.axis === 'x' ? pos : along, z = w.axis === 'x' ? along : pos;
      this.sys.fx.particles.emit(x, rnd(0.1, 3), z, w.axis === 'x' ? w.dir * rnd(2, 6) : 0, rnd(0.5, 2), w.axis === 'z' ? w.dir * rnd(2, 6) : 0, rnd(0.4, 0.7), rnd(0.12, 0.25), pick([0x07020c, 0x2a0a3a, 0x7a3aff]), 0);
    }
    // 피할 수 없음: 파도가 플레이어를 지나는 순간 (무적이어도) 피해 + 공포
    const c = w.axis === 'x' ? P.x : P.z;
    if (!w.hit && (pos - c) * w.dir >= 0) {
      w.hit = true;
      const p = this.sys.player;
      p.invuln = 0;
      const dmg = (w.e ? w.e.dmg : 12) * HUNT.nightMul;
      p.takeDamage(dmg, 'dark');
      if (p.setFear) p.setFear(HUNT.fear, w.e && w.e.alive ? w.e : null);
    }
    if (w.t >= 1) {
      this.sys.scene.remove(w.wall);
      w.mats.forEach((m) => m.dispose());
      this.wall = null;
      game.nightDark = 0;
    }
  }

  // 시간 만료: 어둠 속으로 사라짐 (처치 실패)
  vanish(e) {
    const { fx, scene, ui } = this.sys;
    for (let k = 0; k < 8; k++) smokePuff(fx, e.x + rnd(-1, 1), e.z + rnd(-1, 1), rnd(1.2, 2.2), 1.2);
    fx.particles.burst(e.x, 0.8, e.z, 30, [0x07020c, 0x3a1a5a, 0x9a3aff], { speed: 3, size: 0.14, life: 0.7, up: 2 });
    e.alive = false;
    if (e.model) scene.remove(e.model.group);
    if (ui) ui.toast('🐾 게르게르가 어둠 속으로 사라졌습니다…', 'warn');
  }

  clear() {
    for (const w of this.waves) { this.sys.scene.remove(w.crest); w.mat.dispose(); }
    for (const w of this.sabs) { this.sys.scene.remove(w.g); w.mats.forEach((m) => m.dispose()); }
    if (this.wall) { this.sys.scene.remove(this.wall.wall); this.wall.mats.forEach((m) => m.dispose()); }
    this.waves = []; this.sabs = []; this.wall = null;
  }
}
