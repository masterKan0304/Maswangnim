// ─────────────────────────────────────────────
//  만탄: 고유 패시브 '친수성' (수분 / 갈증) + 전용 스킬 (지느러미 휘두르기 · 첨벙첨벙 · 물대포)
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { game } from './state.js';
import { STAT_UNIT as U, PROJ_SPEED_UNIT as PS, PROJ_SIZE_UNIT as PZ, WORLD_HALF } from './config.js';
import { sample, sampleInt } from './skills.js';
import { sfx } from './audio.js';
import { makeGlowSprite } from './effects.js';

const DEG = Math.PI / 180;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const MOIST = { max: 100, drain: 1, zoneGain: 20, per10: { ocean: 0.05, guard: 0.02, speed: 0.03 }, thirst: { dmg: 1, speed: 0.5, haste: 40, hpLoss: 1 } };
export const isMantan = () => game.charId === 'mantan';
export const thirsty = (p) => isMantan() && !!p.thirst;
// 수분 10 당 단계 (갈증 중에는 0 으로 취급)
export const moistStep = (p) => (isMantan() && !p.thirst ? Math.floor((p.moist || 0) / 10) : 0);

// 해양 속성 지대 위에 있는지
function onOcean(rt) {
  const P = rt.player.pos;
  return rt.zones.some((z) => z.el === 'ocean' && Math.hypot(P.x - z.x, P.z - z.z) < z.r);
}

// 매 프레임: 수분 증감 · 갈증 · 화면 효과
export function updateMoisture(rt, dt) {
  const p = rt.player;
  const on = isMantan() && game.state === 'playing' && !game.demo;
  document.body.classList.toggle('thirst', on && !!p.thirst);
  if (!on) return;
  if (p.moist == null) p.moist = MOIST.max;
  const ocean = onOcean(rt);
  if (ocean) p.moist = Math.min(MOIST.max, p.moist + MOIST.zoneGain * dt);
  else if (!p.thirst) p.moist = Math.max(0, p.moist - MOIST.drain * dt);
  if (ocean && Math.random() < dt * 8) rt.fx.particles.emit(p.pos.x + rnd(-0.4, 0.4), 0.2, p.pos.z + rnd(-0.4, 0.4), 0, 1.6, 0, 0.5, 0.08, pick([0x8fd4ff, 0xe8f8ff]), 3);
  if (!p.thirst && p.moist <= 0) {
    p.thirst = true;   // 갈증: 광분
    rt.fx.ring(p.pos.x, p.pos.z, 2, 0xff3a4a, 0.6, 0.6);
    rt.fx.particles.burst(p.pos.x, 0.9, p.pos.z, 30, [0xff3a4a, 0x8a0a1a, 0xffffff], { speed: 4, size: 0.12, life: 0.6, up: 3 });
    if (game.sys.ui) game.sys.ui.toast('🩸 갈증! 만탄이 광분에 빠졌습니다…', 'boss');
    sfx('boss');
  } else if (p.thirst && p.moist >= MOIST.max) {
    p.thirst = false;   // 최대치까지 회복하면 해제
    rt.fx.ring(p.pos.x, p.pos.z, 2, 0x8fd4ff, 0.6, 0.6);
    if (game.sys.ui) game.sys.ui.toast('💧 갈증이 해소되었습니다.', '');
  }
  if (p.thirst) {
    // 매초 체력 1 감소
    p.thirstHpT = (p.thirstHpT || 0) + dt;
    if (p.thirstHpT >= 1) {
      p.thirstHpT -= 1;
      if (!game.debug.god) { p.hp -= MOIST.thirst.hpLoss; rt.fx.numbers.spawn(p.pos.x, 1.6, p.pos.z, MOIST.thirst.hpLoss, 'hurt'); if (p.hp <= 0) { p.hp = 0; game.sys.onPlayerDeath(); } }
    }
    if (Math.random() < dt * 10) rt.fx.particles.emit(p.pos.x + rnd(-0.4, 0.4), rnd(0.4, 1.2), p.pos.z + rnd(-0.4, 0.4), 0, 1.4, 0, 0.5, 0.08, pick([0xff3a4a, 0x8a0a1a]), -0.5);
  }
}

// 스킬 피해 배율: 수분 10 당 해양 피해 +5% / 갈증 중 +100%
export function mantanDmgMul(p, sk) {
  if (!isMantan()) return 1;
  if (p.thirst) return 1 + MOIST.thirst.dmg;
  return sk.def.element === 'ocean' ? 1 + MOIST.per10.ocean * moistStep(p) : 1;
}
// 이동 속도 배율: 수분 10 당 +3% / 갈증 중 +50%
export const mantanSpeedMul = (p) => (!isMantan() ? 1 : p.thirst ? 1 + MOIST.thirst.speed : 1 + MOIST.per10.speed * moistStep(p));
// 받는 피해 배율: 수분 10 당 -2% (갈증 중 0%)
export const mantanGuard = (p) => (!isMantan() || p.thirst ? 1 : 1 - MOIST.per10.guard * moistStep(p));
// 스킬 가속 (갈증 +40): 쿨타임 감소 속도
export const mantanCdRate = (p) => (thirsty(p) ? (100 + MOIST.thirst.haste) / 100 : 1);

// 적중 시 (갈증: 지느러미 · 가시 · 첨벙첨벙 칼날 → 출혈)
export function mantanOnHit(rt, e, sk, dealt) {
  if (!thirsty(rt.player) || !(dealt > 0) || !e.alive) return;
  if (sk.key === 'finSwing' || sk.key === 'splash') rt.enemies.addBleed(e, dealt * 0.5, 3, sk);
}

const nearestDir = (rt) => {
  const p = rt.player, e = rt.enemies.nearestN(p.pos.x, p.pos.z, 16, 1)[0];
  if (e) { const d = Math.hypot(e.x - p.pos.x, e.z - p.pos.z) || 1; p.aim.set((e.x - p.pos.x) / d, 0, (e.z - p.pos.z) / d); }
  return Math.atan2(p.aim.z, p.aim.x);
};

// ── 지느러미 휘두르기: 가장 가까운 적 쪽으로 휘둘러 피해 + 밀쳐냄 (갈증: 밀치지 않고 출혈) / 5레벨: 매 3번째 공격에 가시 3개 ──
export function castFin(rt, sk, st) {
  const p = rt.player, P = p.pos;
  const a = nearestDir(rt), dx = Math.cos(a), dz = Math.sin(a);
  const R = sample(st.area) / U / 2;
  const cx = P.x + dx * R * 0.8, cz = P.z + dz * R * 0.8;
  const kb = p.thirst ? 0 : (sample(st.knockback) / U) * 7;
  for (const e of rt.enemies.query(cx, cz, R + 2.2)) {
    if (!e.alive || Math.hypot(e.x - cx, e.z - cz) > R + e.r * 0.5) continue;
    const normal = !e.boss && !e.elite;
    rt.deal(e, sk, st, { at: { x: cx, z: cz }, kx: normal ? dx * kb : 0, kz: normal ? dz * kb : 0 });
  }
  finFx(rt.fx, P.x, P.z, a, R, p.thirst);
  sfx('dash');
  if (sk.level >= 5) {
    sk.finN = (sk.finN || 0) + 1;
    if (sk.finN % 3 === 0) {
      // 가시 투사체 (능력치: 투사체 피해량 · 크기 · 개수 · 지속 시간 / 문장 · 연쇄 · 관통 적용)
      const n = sampleInt(st.projCount);
      const sst = { ...st, damage: st.projDamage };
      for (let i = 0; i < n; i++) {
        const b = a + (i - (n - 1) / 2) * 18 * DEG;
        rt.spawnProj({ kind: 'ice', sk, size: sample(st.projSize) / PZ, speed: sample(st.projSpeed) * PS, life: sample(st.projDuration), pierce: sampleInt(st.pierce), x: P.x + Math.cos(b) * 0.5, z: P.z + Math.sin(b) * 0.5, y: 0.6, dx: Math.cos(b), dz: Math.sin(b), st: sst, chains: sampleInt(st.chains) });
      }
      sfx('iceShot');
    }
  }
}

// 꼬리를 휘두르듯: 휘두르는 끝을 따라 초승달 궤적이 차례로 생기고 뒤쪽부터 옅어짐 (바깥 물빛 + 안쪽 흰 줄기 + 물방울)
function finFx(fx, x, z, a, R, thirst) {
  const outer = thirst ? 0xff3a4a : 0x46b8e6, inner = thirst ? 0xffc0c8 : 0xe8f8ff;
  const SEG = 14, SWEEP = 150 * DEG, DUR = 0.2;
  const start = a - SWEEP / 2;
  for (let i = 0; i < SEG; i++) {
    const t = i / (SEG - 1);
    const th = start + SWEEP * t;
    const w = 0.25 + 0.75 * Math.sin(t * Math.PI);           // 가운데가 가장 두껍게 (초승달)
    const r0 = R * (0.55 + 0.1 * (1 - w)), r1 = R * (0.75 + 0.3 * w);
    for (const [col, k0, k1, op, y] of [[outer, 0, 1, 0.75, 0.42], [inner, 0.35, 0.75, 0.9, 0.45]]) {
      const ra = r0 + (r1 - r0) * k0, rb = r0 + (r1 - r0) * k1;
      const geo = new THREE.RingGeometry(ra, rb, 3, 1, -(th + (SWEEP / SEG) * 0.6), (SWEEP / SEG) * 1.2).rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y + Math.sin(t * Math.PI) * 0.15, z);
      const appear = t * DUR, life = 0.32;
      fx.add([m], appear + life, (k) => {
        const tt = k * (appear + life) - appear;
        mat.opacity = tt < 0 ? 0 : op * Math.pow(Math.max(0, 1 - tt / life), 1.5);
        if (k >= 1) geo.dispose();
      }, [mat]);
    }
  }
  // 휘두르는 끝을 따라 튀는 물방울
  for (let i = 0; i < 26; i++) {
    const t = Math.random(), b2 = start + SWEEP * t, d = R * rnd(0.85, 1.15);
    const tang = b2 + Math.PI / 2;
    fx.particles.emit(x + Math.cos(b2) * d, rnd(0.3, 0.7), z + Math.sin(b2) * d, Math.cos(tang) * 3 + Math.cos(b2) * 1.5, rnd(1.5, 3.5), Math.sin(tang) * 3 + Math.sin(b2) * 1.5, rnd(0.35, 0.6), rnd(0.06, 0.12), thirst ? pick([0xff3a4a, 0x8a0a1a, 0xffc0c8]) : pick([0x8fd4ff, 0xe8f8ff, 0x46b8e6, 0xffffff]), 12);
  }
}

// ── 첨벙첨벙: 지속 시간 동안 1.5초(5레벨 1초)마다 뛰어올라 첨벙 (해양 지대 위: 범위 · 밀치기 +50%, 3레벨: 해양 지대 4초)
//    갈증: 뛰지 않고 0.5초간 주위를 칼날 폭풍처럼 베어 0.1초마다 피해 30% + 출혈 (밀치지 않음) ──
export function startSplash(rt, sk, st) {
  sk.splash = { st, t: 0, dur: sample(st.duration), next: 0, storm: 0, stormTick: 0 };
  rt.splashes.push(sk);
}

export function updateSplashes(rt, dt) {
  const p = rt.player, P = p.pos;
  for (const sk of [...rt.splashes]) {
    const s = sk.splash;
    if (!s) { rt.splashes = rt.splashes.filter((x) => x !== sk); continue; }
    s.t += dt; s.next -= dt;
    const every = sk.level >= 5 ? 1 : 1.5;
    if (s.next <= 0 && s.t < s.dur) {
      s.next += every;
      if (p.thirst) { s.storm = 0.5; s.stormTick = 0; stormFx(rt, s); }
      else { s.hop = 0.35; jumpSplash(rt); }   // 뛰어오름 (물방울이 튐)
    }
    // 첨벙: 착지 순간 피해
    if (s.hop > 0) {
      s.hop -= dt;
      p.lift = Math.sin(Math.max(0, 1 - s.hop / 0.35) * Math.PI) * 0.6;
      if (s.hop <= 0) { p.lift = 0; splashHit(rt, sk, s.st); }
    }
    // 칼날 폭풍 (갈증)
    if (s.storm > 0) {
      s.storm -= dt; s.stormTick -= dt;
      if (s.stormTick <= 0) {
        s.stormTick += 0.1;
        const R = sample(s.st.area) / U / 2;
        for (const e of rt.enemies.query(P.x, P.z, R + 2.2)) {
          if (!e.alive || Math.hypot(e.x - P.x, e.z - P.z) > R + e.r * 0.5) continue;
          rt.deal(e, sk, s.st, { mul: 0.3, at: { x: P.x, z: P.z } });
        }
      }
    }
    if (s.t >= s.dur && !(s.hop > 0) && !(s.storm > 0)) {
      sk.splash = null; p.lift = 0;
      sk.cd = sample(s.st.cooldown); sk.cdMax = sk.cd;   // 끝난 뒤 쿨타임
    }
  }
}

function jumpSplash(rt) {
  const P = rt.player.pos;
  rt.fx.particles.burst(P.x, 0.15, P.z, 45, [0x46b8e6, 0x8fd4ff, 0xe8f8ff, 0xffffff], { speed: 3.5, size: 0.1, life: 0.7, up: 5, grav: 14 });
  for (let i = 0; i < 20; i++) { const a = Math.random() * Math.PI * 2; rt.fx.particles.emit(P.x + Math.cos(a) * 0.4, 0.1, P.z + Math.sin(a) * 0.4, Math.cos(a) * 2.5, rnd(3, 5), Math.sin(a) * 2.5, rnd(0.5, 0.8), rnd(0.07, 0.12), pick([0x8fd4ff, 0xffffff]), 14); }
}

function splashHit(rt, sk, st) {
  const P = rt.player.pos;
  const ocean = onOcean(rt);
  const mul = ocean ? 1.5 : 1;   // 해양 지대 위: 범위 · 밀치기 +50%
  const R = (sample(st.area) / U / 2) * mul;
  const kb = (sample(st.knockback) / U) * 7 * mul;
  for (const e of rt.enemies.query(P.x, P.z, R + 2.2)) {
    if (!e.alive) continue;
    const d = Math.hypot(e.x - P.x, e.z - P.z);
    if (d > R + e.r * 0.5) continue;
    const normal = !e.boss && !e.elite;
    rt.deal(e, sk, st, { at: { x: P.x, z: P.z }, kx: normal ? ((e.x - P.x) / (d || 1)) * kb : 0, kz: normal ? ((e.z - P.z) / (d || 1)) * kb : 0 });
  }
  if (sk.level >= 3) rt.addZone(P.x, P.z, 'ocean', 4, R, 0, sk, st);   // 3레벨: 해양 지대 4초
  rt.fx.ring(P.x, P.z, R, 0x46b8e6, 0.5); rt.fx.ring(P.x, P.z, R * 0.6, 0xe8f8ff, 0.4);
  rt.fx.particles.burst(P.x, 0.2, P.z, 110, [0x46b8e6, 0x8fd4ff, 0xe8f8ff, 0xffffff], { speed: 2 + R * 1.8, size: 0.12, life: 0.9, up: 7, grav: 14 });
  for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2, v = rnd(2.5, 4) + R; rt.fx.particles.emit(P.x + Math.cos(a) * 0.5, 0.15, P.z + Math.sin(a) * 0.5, Math.cos(a) * v, rnd(4, 7), Math.sin(a) * v, rnd(0.6, 0.9), rnd(0.08, 0.14), pick([0x8fd4ff, 0xffffff, 0x46b8e6]), 14); }   // 왕관 모양 물보라
  rt.fx.splat(P.x, P.z, 0x46b8e6, R * 0.6);
  sfx('iceball');
}

// 칼날 폭풍 (갈증): 주위를 빙글빙글 베는 붉은 칼날
function stormFx(rt, s) {
  const P = rt.player.pos, R = sample(s.st.area) / U / 2;
  const mat = new THREE.MeshBasicMaterial({ color: 0xff3a4a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const dark = new THREE.MeshBasicMaterial({ color: 0x1a0408, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide });
  const objs = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.RingGeometry(R * (0.5 + i * 0.13), R * (0.56 + i * 0.13), 20, 1, 0, 100 * DEG).rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, i % 2 ? dark : mat);
    m.userData = { a0: i * 1.6, sp: 22 + i * 4, y: 0.3 + i * 0.15, g };
    objs.push(m);
  }
  rt.fx.add(objs, 0.5, (k) => {
    const P2 = rt.player.pos;
    for (const m of objs) { m.position.set(P2.x, m.userData.y, P2.z); m.rotation.y = m.userData.a0 + k * m.userData.sp * 0.5; }
    mat.opacity = 0.9 * (1 - k); dark.opacity = 0.7 * (1 - k);
    if (k >= 1) objs.forEach((m) => m.userData.g.dispose());
  }, [mat, dark]);
  sfx('dash');
}

// ── 물대포: 지속 시간 동안 물을 머금고 (이동 속도 감소, 매초 수분 10 추가 소모) → 물방울 발사 → 적중 시 폭발 ──
export function startCannon(rt, sk, st) {
  const p = rt.player;
  const dur = Math.min(10, sample(st.duration));
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 14), new THREE.MeshPhongMaterial({ color: 0x8fd4ff, emissive: 0x1a5a9a, emissiveIntensity: 0.4, shininess: 100, transparent: true, opacity: 0.6, depthWrite: false }));
  rt.scene.add(bubble);
  sk.cannon = { st, t: 0, dur, extra: 0, acc: 0, bubble };
  rt.cannons.push(sk);
  sfx('iceball');
}

export function updateCannons(rt, dt) {
  const p = rt.player, P = p.pos;
  p.cannonSlow = 0;
  for (const sk of [...rt.cannons]) {
    const c = sk.cannon;
    if (!c) { rt.cannons = rt.cannons.filter((x) => x !== sk); continue; }
    c.t += dt;
    // 매초 수분 10 을 1 씩 나눠 더 소모 (갈증 중에는 소모 없음)
    if (!p.thirst && isMantan()) {
      c.acc += dt * 10;
      while (c.acc >= 1 && p.moist > 0) { c.acc -= 1; p.moist = Math.max(0, p.moist - 1); c.extra++; }
    }
    // 이동 속도: 20% + 추가 소모 1 당 1% (최대 40%) / 3레벨: 감소 없음
    if (sk.level < 3) p.cannonSlow = Math.max(p.cannonSlow, Math.min(0.4, 0.2 + c.extra * 0.01));
    // 입 앞의 물방울이 점점 커짐
    const a = Math.atan2(p.aim.z, p.aim.x);
    const sz = (sample(c.st.projSize) / PZ) * (1 + c.extra * 0.02) * Math.min(1, c.t / 0.4);
    c.bubble.position.set(P.x + Math.cos(a) * (0.55 + sz * 0.4), 0.7, P.z + Math.sin(a) * (0.55 + sz * 0.4));
    c.bubble.scale.setScalar(Math.max(0.05, sz * 0.5));
    if (Math.random() < 0.6) rt.fx.particles.emit(c.bubble.position.x + rnd(-1, 1) * 1.2, rnd(0.2, 1.4), c.bubble.position.z + rnd(-1, 1) * 1.2, 0, 0, 0, 0.3, 0.06, 0x8fd4ff, 0);
    if (c.t >= c.dur) {
      rt.scene.remove(c.bubble); c.bubble.geometry.dispose(); c.bubble.material.dispose();
      fireCannon(rt, sk, c);
      sk.cannon = null;
      sk.cd = sample(c.st.cooldown); sk.cdMax = sk.cd;
    }
  }
  updateBubbles(rt, dt);
}

function fireCannon(rt, sk, c) {
  const P = rt.player.pos;
  const a = nearestDir(rt);
  const st = c.st, x = c.extra;
  const shot = {
    dmgMul: 1 + x * 0.05, size: (sample(st.projSize) / PZ) * (1 + x * 0.02), area: (sample(st.area) / U / 2) * (1 + x * 0.04),
    speed: sample(st.projSpeed) * PS * Math.max(0.5, 1 - x * 0.02),
  };
  const n = sampleInt(st.projCount);
  for (let i = 0; i < n; i++) {
    const b = a + (i - (n - 1) / 2) * 15 * DEG;
    addBubble(rt, sk, st, P.x + Math.cos(b) * 0.6, P.z + Math.sin(b) * 0.6, b, shot.size, shot.speed, shot.area, shot.dmgMul, sampleInt(st.pierce), sampleInt(st.chains), sample(st.projDuration), false);
  }
  sfx('iceShot');
}

function addBubble(rt, sk, st, x, z, a, size, speed, area, dmgMul, pierce, chains, life, child) {
  const mat = new THREE.MeshPhongMaterial({ color: 0x8fd4ff, emissive: 0x1a5a9a, emissiveIntensity: 0.4, shininess: 100, transparent: true, opacity: 0.65, depthWrite: false });
  const m = new THREE.Mesh(rt.bubbleGeo || (rt.bubbleGeo = new THREE.SphereGeometry(0.5, 18, 14)), mat);
  const hl = makeGlowSprite(0xffffff, 0.35, 0.7);
  m.add(hl); hl.position.set(-0.18, 0.2, 0.2);
  rt.scene.add(m);
  rt.bubbles.push({ sk, st, x, z, dx: Math.cos(a), dz: Math.sin(a), size, speed, area, dmgMul, pierce, chains, life, t: 0, m, mat, hl, hit: new Set(), child });
}

function updateBubbles(rt, dt) {
  for (let i = rt.bubbles.length - 1; i >= 0; i--) {
    const b = rt.bubbles[i];
    b.t += dt;
    b.x += b.dx * b.speed * dt; b.z += b.dz * b.speed * dt;
    b.m.position.set(b.x, 0.3 + b.size * 0.5, b.z);
    b.m.scale.setScalar(b.size * (1 + 0.05 * Math.sin(b.t * 12)));
    if (Math.random() < 0.7) rt.fx.particles.emit(b.x + rnd(-0.3, 0.3) * b.size, b.size * 0.5, b.z + rnd(-0.3, 0.3) * b.size, -b.dx, rnd(0.5, 1.5), -b.dz, 0.4, 0.07, pick([0x8fd4ff, 0xe8f8ff]), 9);
    let remove = b.t >= b.life || Math.abs(b.x) > WORLD_HALF + 2 || Math.abs(b.z) > WORLD_HALF + 2;
    if (!remove) {
      const t = rt.enemies.query(b.x, b.z, b.size + 2).find((e) => e.alive && !b.hit.has(e) && Math.hypot(e.x - b.x, e.z - b.z) < b.size * 0.5 + e.r);
      if (t) {
        b.hit.add(t);
        explode(rt, b, t);
        // 5레벨: 무작위 방향으로 반쪽짜리 물방울 3개
        if (b.sk.level >= 5 && !b.child) for (let k = 0; k < 3; k++) addBubble(rt, b.sk, b.st, b.x, b.z, Math.random() * Math.PI * 2, b.size * 0.5, b.speed, b.area * 0.5, b.dmgMul * 0.5, 0, 0, 1.2, true);
        // 관통 · 연쇄: 할 때마다 피해 · 크기 · 범위 20% 감소
        if (b.pierce > 0) { b.pierce--; b.size *= 0.8; b.area *= 0.8; b.dmgMul *= 0.8; }
        else if (b.chains > 0) {
          b.chains--; b.size *= 0.8; b.area *= 0.8; b.dmgMul *= 0.8;
          const n = rt.enemies.nearestN(b.x, b.z, 10, 6).find((e) => e.alive && !b.hit.has(e));
          if (n) { const d = Math.hypot(n.x - b.x, n.z - b.z) || 1; b.dx = (n.x - b.x) / d; b.dz = (n.z - b.z) / d; b.t = 0; } else remove = true;
        } else remove = true;
      }
    }
    if (remove) { rt.scene.remove(b.m); b.mat.dispose(); b.hl.material.dispose(); rt.bubbles.splice(i, 1); }
  }
}

function explode(rt, b, t) {
  const R = b.area;
  for (const e of rt.enemies.query(t.x, t.z, R + 2.2)) {
    if (!e.alive) continue;
    const d = Math.hypot(e.x - t.x, e.z - t.z);
    if (d > R + e.r * 0.5) continue;
    const normal = !e.boss && !e.elite, kb = (2 + R) * 3;
    rt.deal(e, b.sk, b.st, { mul: b.dmgMul, at: { x: t.x, z: t.z }, kx: normal ? ((e.x - t.x) / (d || 1)) * kb : 0, kz: normal ? ((e.z - t.z) / (d || 1)) * kb : 0 });
  }
  rt.fx.ring(t.x, t.z, R, 0x46b8e6, 0.5); rt.fx.ring(t.x, t.z, R * 0.6, 0xffffff, 0.4);
  rt.fx.particles.burst(t.x, 0.4, t.z, 40 + Math.round(R * 10), [0x46b8e6, 0x8fd4ff, 0xe8f8ff, 0xffffff], { speed: 2.5 + R * 1.6, size: 0.12, life: 0.8, up: 6, grav: 14 });
  rt.fx.splat(t.x, t.z, 0x46b8e6, R * 0.6);
  sfx('explode');
}

export function clearMantan(rt) {
  for (const sk of rt.cannons || []) if (sk.cannon) { rt.scene.remove(sk.cannon.bubble); sk.cannon = null; }
  for (const b of rt.bubbles || []) { rt.scene.remove(b.m); b.mat.dispose(); }
  for (const sk of rt.splashes || []) sk.splash = null;
  rt.cannons = []; rt.bubbles = []; rt.splashes = [];
}
