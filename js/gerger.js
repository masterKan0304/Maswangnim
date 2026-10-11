// ─────────────────────────────────────────────
//  게르게르 전용 스킬: 할퀴기 / 꿈먹기 / 크루엘 버스트
//  (전방 = 이동 방향 / 멈춰 있으면 마지막으로 바라본 방향)
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { game } from './state.js';
import { STAT_UNIT as U, STATUS } from './config.js';
import { sample } from './skills.js';
import { sfx } from './audio.js';
import { makeGlowSprite } from './effects.js';

const DEG = Math.PI / 180;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 공포 또는 악몽 상태
export const scared = (e) => e.fearT > 0 || e.nightmareT > 0;
const front = (p) => { const a = Math.atan2(p.aim.z, p.aim.x); return { a, dx: Math.cos(a), dz: Math.sin(a) }; };

function heal(rt, v) {
  const p = rt.player;
  if (p.hp >= p.maxHp) return;
  p.hp = Math.min(p.maxHp, p.hp + v);
  rt.fx.numbers.spawn(p.pos.x, 1.8, p.pos.z, `+${v}`, 'heal');
}

const SHARED = {};
const shared = (k, make) => SHARED[k] || (SHARED[k] = make());

// ── 할퀴기: 전방을 할퀴어 피해 + 일반 몬스터는 밀쳐냄 (5레벨: 출혈) ──
export function castClaw(rt, sk, st) {
  const p = rt.player, P = p.pos;
  const R = sample(st.area) / U / 2;
  const { a, dx, dz } = front(p);
  const cx = P.x + dx * R, cz = P.z + dz * R;
  const kbV = (sample(st.knockback) / U) * 7;   // 밀치기 거리 → 속도 (감쇠 7/s)
  sfx('dash');
  for (const e of rt.enemies.query(cx, cz, R + 2.2)) {
    if (!e.alive || Math.hypot(e.x - cx, e.z - cz) > R + e.r * 0.5) continue;
    const normal = !e.elite && !e.boss;
    const dealt = rt.deal(e, sk, st, { at: { x: cx, z: cz }, kx: normal ? dx * kbV : 0, kz: normal ? dz * kbV : 0 });
    if (sk.level >= 5 && dealt > 0 && e.alive) rt.enemies.addBleed(e, dealt * 0.5, 3, sk);
    rt.fx.particles.burst(e.x, 0.6, e.z, 5, [0xf0e4ff, 0xb48cff], { speed: 2.5, size: 0.07, life: 0.3, up: 1.5 });
  }
  clawFx(rt.fx, P.x, P.z, a, R);
}

// 발톱 세 줄기가 앞을 가르는 모습
function clawFx(fx, x, z, a, R) {
  for (let i = 0; i < 3; i++) {
    const r = R * (1.15 + i * 0.32);
    const geo = new THREE.RingGeometry(r - 0.05, r + 0.05, 20, 1, -55 * DEG, 110 * DEG).rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: i === 1 ? 0xffffff : 0xe2d0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, 0.55 + i * 0.12, z);
    m.rotation.y = -a;
    const delay = i * 0.12;
    fx.add([m], 0.32, (k) => {
      const t = Math.max(0, (k - delay) / (1 - delay));
      m.rotation.y = -a + (0.6 - t * 1.2) * 0.5;    // 옆으로 그어지듯 휙
      m.scale.setScalar(0.85 + t * 0.2);
      mat.opacity = t <= 0 ? 0 : (t < 0.2 ? t / 0.2 : (1 - t) / 0.8);
      if (k >= 1) geo.dispose();
    }, [mat]);
  }
  for (let i = 0; i < 14; i++) {
    const b = a + rnd(-0.9, 0.9), d = R * rnd(1, 1.9);
    fx.particles.emit(x + Math.cos(b) * d, rnd(0.4, 0.9), z + Math.sin(b) * d, Math.cos(b) * 2, rnd(0.5, 1.5), Math.sin(b) * 2, rnd(0.2, 0.35), rnd(0.05, 0.09), pick([0xffffff, 0xe2d0ff, 0x9a6bff]), 2);
  }
}

// ── 꿈먹기: 전방을 깨묾. 공포 · 악몽 상태면 추가 피해 후 상태 해제 (3레벨: 회복 / 5레벨: 해제 대신 초기화) ──
export function castDreamEat(rt, sk, st) {
  const p = rt.player, P = p.pos;
  const R = sample(st.area) / U / 2;
  const { a, dx, dz } = front(p);
  const cx = P.x + dx * R, cz = P.z + dz * R;
  sfx('crackle');
  let ate = false;
  for (const e of rt.enemies.query(cx, cz, R + 2.2)) {
    if (!e.alive || Math.hypot(e.x - cx, e.z - cz) > R + e.r * 0.5) continue;
    const was = scared(e);
    rt.deal(e, sk, st, { at: { x: cx, z: cz }, mul: was ? 1 + sample(st.bonusDmg) / 100 : 1 });
    if (!was) continue;
    ate = true;
    if (sk.level >= 3) heal(rt, e.alive ? 1 : 4);
    if (!e.alive) continue;
    if (sk.level >= 5) {
      // 해제하지 않고 지속 시간 초기화
      if (e.fearT > 0) e.fearT = STATUS.duration * (e.boss || e.elite ? STATUS.fearBossMul : 1);
      if (e.nightmareT > 0) e.nightmareT = e.nightmareMax || STATUS.duration;
    } else {
      if (e.fearT > 0) { e.fearT = 0; e.fearImmune = STATUS.fearImmune; e.fearZone = null; }
      e.nightmareT = 0;
    }
    // 빨아들인 악몽 (적 → 게르게르)
    for (let k = 0; k < 8; k++) rt.fx.particles.emit(e.x + rnd(-0.3, 0.3), rnd(0.4, 1), e.z + rnd(-0.3, 0.3), (P.x - e.x) * 2.2, rnd(0.5, 1.5), (P.z - e.z) * 2.2, 0.45, rnd(0.07, 0.12), pick([0x9a6bff, 0x2a0a3a, 0xd9a8ff]), 0);
  }
  biteFx(rt.fx, cx, cz, a, R, ate);
}

// 위아래 송곳니가 맞물리는 모습
function biteFx(fx, x, z, a, R, ate) {
  const toothGeo = shared('toothGeo', () => new THREE.ConeGeometry(0.07, 0.3, 4));
  const toothMat = new THREE.MeshBasicMaterial({ color: 0xfff6ff, transparent: true, opacity: 1 });
  const s = Math.max(0.7, R * 0.75);
  const up = new THREE.Group(), lo = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const t = (i / 5 - 0.5) * 1.6;   // 옆으로 늘어선 이빨 (살짝 휘어짐)
    const px = Math.sin(t) * s, pz = Math.cos(t) * s * 0.35 - s * 0.2;
    const u = new THREE.Mesh(toothGeo, toothMat); u.position.set(pz, 0, px); u.rotation.x = Math.PI; up.add(u);   // 아래를 향함
    const l = new THREE.Mesh(toothGeo, toothMat); l.position.set(pz, 0, px); lo.add(l);
  }
  for (const g of [up, lo]) { g.rotation.y = -a; g.scale.setScalar(Math.max(1, s)); }
  const maw = makeGlowSprite(0x6a2aff, s * 3, 0.0);
  maw.position.set(x, 0.6, z);
  const dark = new THREE.Sprite(new THREE.SpriteMaterial({ map: maw.material.map, color: 0x14051f, transparent: true, opacity: 0, depthWrite: false }));
  dark.position.set(x, 0.58, z); dark.scale.setScalar(s * 2.2);
  fx.add([dark, maw, up, lo], 0.42, (k) => {
    const c = Math.min(1, k / 0.35);                 // 다무는 정도
    const e = c * c;
    up.position.set(x, 0.6 + (1 - e) * 0.75 * s + 0.16, z);
    lo.position.set(x, 0.6 - (1 - e) * 0.55 * s - 0.16, z);
    const fade = k < 0.6 ? 1 : (1 - k) / 0.4;
    toothMat.opacity = fade;
    dark.material.opacity = 0.55 * fade;
    maw.material.opacity = (k > 0.3 ? 0.9 : 0.4) * fade;
  }, [toothMat, dark.material, maw.material]);
  setTimeout(() => {
    fx.particles.burst(x, 0.6, z, ate ? 34 : 18, [0x9a6bff, 0xd9a8ff, 0x2a0a3a, 0xffffff], { speed: 3 + R, size: 0.1, life: 0.45, up: 2.5, grav: 3 });
    fx.ring(x, z, R, 0x9a6bff, 0.35);
  }, 130);
}

// ── 크루엘 버스트 ──
// 1초간 떠올라 무적 → 꼬리가 칼날 3개(5레벨: 5개)로 갈라져 전방을 내리침 → 川 자 자국 + 출혈 → 착지
const RISE = 1.0, STRIKE = 0.16, LAND = 0.45;
export function startCruel(rt, sk, st) {
  const p = rt.player;
  const { a } = front(p);
  const n = sk.level >= 5 ? 5 : 3;
  const L = sample(st.area) / U;
  p.lockMove = true; p.castInvuln = true; p.tailBlades = true;
  const bladeGeo = shared('bladeGeo', () => {
    const g = new THREE.ConeGeometry(0.16, 1, 4);   // 길이 1, 끝이 +Y
    g.translate(0, 0.5, 0);
    g.scale(1, 1, 0.3);
    return g;
  });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x241536, emissive: 0x7a3aff, emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.4, flatShading: true, transparent: true, opacity: 1 });
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xd9a8ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const blades = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(bladeGeo, bladeMat);
    const edge = new THREE.Mesh(bladeGeo, edgeMat); edge.scale.set(1.5, 1.02, 1.5);
    const tip = makeGlowSprite(0xb48cff, 0.9, 0.9); tip.position.y = 1;
    g.add(core, edge, tip);
    g.userData = { tip, core };
    g.visible = false;
    rt.scene.add(g);
    blades.push(g);
  }
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x9a6bff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const charge = new THREE.Mesh(shared('chargeGeo', () => new THREE.RingGeometry(0.85, 1, 48).rotateX(-Math.PI / 2)), ringMat);
  rt.scene.add(charge);
  sk.cruel = { t: 0, a, n, L, st, blades, bladeMat, edgeMat, charge, ringMat, x: p.pos.x, z: p.pos.z, struck: false };
  rt.cruels.push(sk);
  sfx('boss');
}

const _v = new THREE.Vector3();
// 칼날 하나를 base → tip 사이에 놓음
function placeBlade(g, bx, by, bz, tx, ty, tz) {
  const len = Math.hypot(tx - bx, ty - by, tz - bz) || 0.001;
  g.position.set(bx, by, bz);
  _v.set(tx - bx, ty - by, tz - bz).normalize();
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _v);
  g.scale.set(1, len, 1);
  g.userData.tip.scale.set(0.9, 0.9 / len, 0.9);   // 끝의 빛은 늘어나지 않게
}

export function updateCruels(rt, dt) {
  for (const sk of [...rt.cruels]) {
    const c = sk.cruel;
    if (!c) { rt.cruels = rt.cruels.filter((x) => x !== sk); continue; }
    const p = rt.player, P = p.pos;
    c.t += dt;
    const t = c.t;
    const spread = (i) => c.a + (i - (c.n - 1) / 2) * 10 * DEG;   // 발사각 10도 차
    // 꼬리 끝 (월드)
    const tailX = P.x - Math.sin(p.facing) * 0.62, tailZ = P.z - Math.cos(p.facing) * 0.62;
    if (t < RISE) {
      // 떠오름 + 꼬리가 칼날로 갈라짐
      const k = t / RISE, e = 1 - (1 - k) ** 3;
      p.lift = 1.3 * e;
      const ty = 1.7 + p.lift;
      c.blades.forEach((g, i) => {
        if (k < 0.2) { g.visible = false; return; }
        g.visible = true;
        const grow = Math.min(1, (k - 0.2) / 0.5);
        const fan = (i - (c.n - 1) / 2) * 0.32 * grow;
        const ang = c.a + Math.PI + fan;   // 뒤쪽 위로 펼쳐짐
        const len = 0.3 + 1.5 * grow;
        placeBlade(g, tailX, ty, tailZ, tailX + Math.cos(ang) * len * 0.45, ty + len * 0.9, tailZ + Math.sin(ang) * len * 0.45);
      });
      c.bladeMat.emissiveIntensity = 0.6 + k * 1.6;
      // 어둠이 빨려 들어옴
      for (let q = 0; q < 6; q++) {
        const b = Math.random() * Math.PI * 2, d = rnd(2, 4.5);
        const sx = P.x + Math.cos(b) * d, sz = P.z + Math.sin(b) * d, sy = rnd(0.2, 2);
        rt.fx.particles.emit(sx, sy, sz, (P.x - sx) * 2.4, (1.6 + p.lift - sy) * 2.4, (P.z - sz) * 2.4, 0.4, rnd(0.07, 0.13), pick([0x14051f, 0x3a1a5a, 0x7a3aff, 0xd9a8ff]), 0);
      }
      c.charge.position.set(P.x, 0.07, P.z);
      c.charge.scale.setScalar(2.6 - 1.6 * e);
      c.ringMat.opacity = 0.75 * Math.min(1, k * 2);
      if (k > 0.85 && !c.flash) { c.flash = true; rt.fx.ring(P.x, P.z, 1.2, 0xd9a8ff, 0.3, 1.6 + p.lift); sfx('frost'); }
    } else if (t < RISE + STRIKE) {
      // 내리침: 칼날이 위에서 앞으로 휘어 내려와 땅에 박힘
      const k = (t - RISE) / STRIKE, e = k * k;
      c.ringMat.opacity = 0;
      const by = 0.9 + p.lift;
      c.blades.forEach((g, i) => {
        g.visible = true;
        const ai = spread(i);
        const reach = c.L * (0.25 + 0.75 * e);
        const tx = P.x + Math.cos(ai) * reach, tz = P.z + Math.sin(ai) * reach;
        const ty = (1 - e) * (c.L * 0.55) + 0.05;
        placeBlade(g, P.x, by, P.z, tx, ty, tz);
        // 칼날 궤적의 잔광
        for (let q = 0; q < 4; q++) {
          const f = Math.random();
          rt.fx.particles.emit(P.x + (tx - P.x) * f, by + (ty - by) * f, P.z + (tz - P.z) * f, 0, 0, 0, 0.3, rnd(0.08, 0.16), pick([0x9a6bff, 0xd9a8ff, 0x2a0a3a]), 0);
        }
      });
      c.bladeMat.emissiveIntensity = 2.4;
    } else {
      if (!c.struck) { c.struck = true; strike(rt, sk, c); }
      // 착지
      const k = Math.min(1, (t - RISE - STRIKE) / LAND);
      p.lift = 1.3 * (1 - k) * (1 - k) * 0.8;
      const fade = 1 - k;
      c.bladeMat.opacity = fade; c.edgeMat.opacity = 0.55 * fade;
      c.blades.forEach((g) => { g.userData.tip.material.opacity = 0.9 * fade; });
      if (k >= 1) endCruel(rt, sk);
    }
  }
}

// 내리친 순간: 각 칼날 자리의 적에게 피해 + 출혈, 川 자 자국
function strike(rt, sk, c) {
  const P = rt.player.pos, st = c.st;
  const W = 0.35;   // 칼날 판정 두께 (월드)
  for (let i = 0; i < c.n; i++) {
    const ai = c.a + (i - (c.n - 1) / 2) * 10 * DEG;
    const dx = Math.cos(ai), dz = Math.sin(ai);
    const mx = P.x + dx * c.L / 2, mz = P.z + dz * c.L / 2;
    for (const e of rt.enemies.query(mx, mz, c.L / 2 + 2.2)) {
      if (!e.alive) continue;
      const ox = e.x - P.x, oz = e.z - P.z;
      const along = ox * dx + oz * dz;
      if (along < -e.r || along > c.L + e.r) continue;
      if (Math.abs(ox * dz - oz * dx) > W + e.r * 0.6) continue;   // 칼날마다 따로 판정 (여러 칼날에 동시에 맞을 수 있음)
      const bonus = sk.level >= 3 && (e.fearT > 0 || e.nightmareT > 0) ? 1.5 : 1;
      const dealt = rt.deal(e, sk, st, { at: { x: P.x + dx * along, z: P.z + dz * along }, mul: bonus });
      if (dealt > 0 && e.alive) rt.enemies.addBleed(e, dealt * 0.5, 3, sk);
      rt.fx.particles.burst(e.x, 0.6, e.z, 8, [0xff4a6a, 0x9a6bff, 0x2a0a3a], { speed: 3, size: 0.1, life: 0.4, up: 2.5 });
    }
    scarMark(rt.fx, P.x, P.z, ai, c.L);
    // 칼날을 따라 튀는 파편 · 어둠
    for (let q = 0; q < 26; q++) {
      const f = Math.random() * c.L;
      rt.fx.particles.emit(P.x + dx * f, 0.1, P.z + dz * f, rnd(-1.5, 1.5) - dz * rnd(-2, 2), rnd(2, 5), rnd(-1.5, 1.5) + dx * rnd(-2, 2), rnd(0.4, 0.7), rnd(0.08, 0.15), pick([0x2a0a3a, 0x7a3aff, 0xd9a8ff, 0x5a4a6a]), 12);
    }
  }
  rt.fx.ring(P.x, P.z, 1.6, 0xd9a8ff, 0.4);
  rt.fx.ring(P.x, P.z, 3, 0x7a3aff, 0.55);
  rt.fx.particles.burst(P.x, 0.4, P.z, 40, [0x14051f, 0x3a1a5a, 0x9a6bff, 0xffffff], { speed: 5, size: 0.13, life: 0.6, up: 4, grav: 6 });
  game.shake = Math.max(game.shake || 0, 0.35);
  sfx('explode'); sfx('crackle');
}

// 川 자 자국: 칼날마다 나란한 세 줄의 긁힌 자국 (어둡게 패인 자국 + 보랏빛)
function scarMark(fx, x, z, a, L) {
  const geo = shared('scarGeo', () => new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0).rotateX(-Math.PI / 2));
  const darkMat = new THREE.MeshBasicMaterial({ color: 0x12081c, transparent: true, opacity: 0.85, depthWrite: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xb48cff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const objs = [];
  const nx = -Math.sin(a), nz = Math.cos(a);   // 옆 방향
  for (const off of [-0.17, 0, 0.17]) {
    const len = L * rnd(0.85, 1), w = off === 0 ? 0.075 : 0.06;
    const start = rnd(0.2, 0.6);
    for (const [mat, ww, y] of [[darkMat, w, 0.045], [glowMat, w * 0.45, 0.05]]) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x + nx * off + Math.cos(a) * start, y, z + nz * off + Math.sin(a) * start);
      m.rotation.y = -a;
      m.scale.set(0.01, 1, ww);
      m.userData.len = len - start;
      objs.push(m);
    }
  }
  fx.add(objs, 3.2, (k) => {
    const grow = Math.min(1, k * 3.2 / 0.12);   // 순식간에 그어짐
    for (const m of objs) m.scale.x = Math.max(0.01, m.userData.len * grow);
    glowMat.opacity = 0.9 * Math.max(0, 1 - k * 2.2);
    darkMat.opacity = 0.85 * (k > 0.7 ? (1 - k) / 0.3 : 1);
  }, [darkMat, glowMat]);
}

function endCruel(rt, sk) {
  const c = sk.cruel;
  if (!c) return;
  for (const g of c.blades) rt.scene.remove(g);
  rt.scene.remove(c.charge);
  c.bladeMat.dispose(); c.edgeMat.dispose(); c.ringMat.dispose();
  for (const g of c.blades) g.userData.tip.material.dispose();
  sk.cruel = null;
  rt.cruels = rt.cruels.filter((x) => x !== sk);
  const p = rt.player;
  p.lift = 0; p.lockMove = false; p.castInvuln = false; p.tailBlades = false;
}

export function clearCruels(rt) { for (const sk of [...(rt.cruels || [])]) endCruel(rt, sk); }
