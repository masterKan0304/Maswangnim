// ─────────────────────────────────────────────
//  게르게르 전용 스킬: 할퀴기 / 꿈먹기 / 크루엘 버스트
//  (전방 = 이동 방향 / 멈춰 있으면 마지막으로 바라본 방향)
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { game } from './state.js';
import { STAT_UNIT as U, STATUS, PROJ_SPEED_UNIT as PS, PROJ_SIZE_UNIT as PZ } from './config.js';
import { sample } from './skills.js';
import { sfx } from './audio.js';
import { makeGlowSprite } from './effects.js';

const DEG = Math.PI / 180;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 공포 또는 악몽 상태
export const scared = (e) => e.fearT > 0 || e.nightmareT > 0;
// 가장 가까운 적 방향 (없으면 바라보던 방향) — 그쪽을 바라봄
function aimNearest(rt) {
  const p = rt.player;
  const e = rt.enemies.nearestN(p.pos.x, p.pos.z, 14, 1)[0];
  if (e) { const d = Math.hypot(e.x - p.pos.x, e.z - p.pos.z) || 1; p.aim.set((e.x - p.pos.x) / d, 0, (e.z - p.pos.z) / d); }
  const a = Math.atan2(p.aim.z, p.aim.x);
  return { a, dx: Math.cos(a), dz: Math.sin(a) };
}

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
  const { a, dx, dz } = aimNearest(rt);
  const cx = P.x + dx * R, cz = P.z + dz * R;
  const kbV = (sample(st.knockback) / U) * 7;   // 밀치기 거리 → 속도 (감쇠 7/s)
  sfx('dash');
  for (const e of rt.enemies.query(cx, cz, R + 2.2)) {
    if (!e.alive || Math.hypot(e.x - cx, e.z - cz) > R + e.r * 0.5) continue;
    const normal = !e.elite && !e.boss;
    const dealt = rt.deal(e, sk, st, { at: { x: cx, z: cz }, kx: normal ? dx * kbV : 0, kz: normal ? dz * kbV : 0 });
    if (sk.level >= 5 && dealt > 0 && e.alive) rt.enemies.addBleed(e, dealt * 0.5, 3, sk);
    rt.fx.particles.burst(e.x, 0.6, e.z, 5, [0xff2a3a, 0x1a0408], { speed: 2.5, size: 0.07, life: 0.3, up: 1.5 });
  }
  clawFx(rt.fx, P.x, P.z, a, R);
}

// 발톱 세 줄기가 앞을 가르는 모습
function clawFx(fx, x, z, a, R) {
  for (let i = 0; i < 3; i++) {
    const r = R * (1.15 + i * 0.32);
    // 검은 궤적 위에 붉은 날 (붉은색 + 검은색)
    const geo = new THREE.RingGeometry(r - 0.075, r + 0.075, 20, 1, -55 * DEG, 110 * DEG).rotateX(-Math.PI / 2);
    const core = new THREE.RingGeometry(r - 0.028, r + 0.028, 20, 1, -52 * DEG, 104 * DEG).rotateX(-Math.PI / 2);
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x0c0408, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const redMat = new THREE.MeshBasicMaterial({ color: i === 1 ? 0xff3a3a : 0xe0142a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, darkMat), mc = new THREE.Mesh(core, redMat);
    mc.position.y = 0.012;
    const grp = new THREE.Group();
    grp.add(m, mc);
    grp.position.set(x, 0.55 + i * 0.12, z);
    grp.rotation.y = -a;
    const delay = i * 0.12;
    fx.add([grp], 0.32, (k) => {
      const t = Math.max(0, (k - delay) / (1 - delay));
      grp.rotation.y = -a + (0.6 - t * 1.2) * 0.5;    // 옆으로 그어지듯 휙
      grp.scale.setScalar(0.85 + t * 0.2);
      const o = t <= 0 ? 0 : (t < 0.2 ? t / 0.2 : (1 - t) / 0.8);
      darkMat.opacity = 0.75 * o; redMat.opacity = o;
      if (k >= 1) { geo.dispose(); core.dispose(); }
    }, [darkMat, redMat]);
  }
  for (let i = 0; i < 14; i++) {
    const b = a + rnd(-0.9, 0.9), d = R * rnd(1, 1.9);
    fx.particles.emit(x + Math.cos(b) * d, rnd(0.4, 0.9), z + Math.sin(b) * d, Math.cos(b) * 2, rnd(0.5, 1.5), Math.sin(b) * 2, rnd(0.2, 0.35), rnd(0.05, 0.09), pick([0xff2a3a, 0x1a0408, 0xc0142a]), 2);
  }
}

// ── 꿈먹기: 전방을 깨묾. 공포 · 악몽 상태면 추가 피해 후 상태 해제 (3레벨: 회복 / 5레벨: 해제 대신 초기화) ──
export function castDreamEat(rt, sk, st) {
  const p = rt.player, P = p.pos;
  const R = sample(st.area) / U / 2;
  const { a, dx, dz } = aimNearest(rt);
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
  const toothMat = new THREE.MeshBasicMaterial({ color: 0x6a1ad0, transparent: true, opacity: 1 });   // 짙은 보라 이빨
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
// 0.5초간 가장 가까운 적을 바라보며 꼬리 칼날을 세움 → 꼬리를 휘둘러 땅을 가르는 파동 3개(5레벨 5개)를 10도 간격으로 (관통)
const WINDUP = 0.5;
export function startCruel(rt, sk, st) {
  const p = rt.player;
  const { a } = aimNearest(rt);
  const n = Math.max(1, Math.round(sample(st.projCount)));
  p.lockMove = true; p.tailBlades = true;
  const bladeGeo = shared('bladeGeo', () => {
    const g = new THREE.ConeGeometry(0.2, 1, 4);   // 길이 1, 끝이 +Y (납작한 칼날)
    g.translate(0, 0.5, 0);
    g.scale(1, 1, 0.22);
    return g;
  });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1a0e28, emissive: 0x4a1a9a, emissiveIntensity: 0.4, roughness: 0.25, metalness: 0.6, flatShading: true, transparent: true, opacity: 1 });
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x8a4aff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
  const blades = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group();
    const edge = new THREE.Mesh(bladeGeo, edgeMat); edge.scale.set(1.35, 1.03, 1.6);
    const tip = makeGlowSprite(0x9a6bff, 0.6, 0.8); tip.position.y = 1;
    g.add(new THREE.Mesh(bladeGeo, bladeMat), edge, tip);
    g.userData = { tip };
    g.visible = false;
    rt.scene.add(g);
    blades.push(g);
  }
  sk.cruel = { t: 0, a, n, st, blades, bladeMat, edgeMat, fired: false };
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
  g.userData.tip.scale.set(0.6, 0.6 / len, 0.6);   // 끝의 빛은 늘어나지 않게
}

// 강력한 공격: 몸 주위로 뿜어지는 검은 연기 (사악한 기운)
function updateSmoke(rt, dt) {
  const p = rt.player;
  if (!(p.smokeT > 0)) return;
  p.smokeT -= dt;
  const P = p.pos, k = Math.min(1, p.smokeT / 0.4);
  for (let q = 0; q < 5; q++) {
    const b = Math.random() * Math.PI * 2, d = rnd(0.25, 0.65);
    rt.fx.particles.emit(P.x + Math.cos(b) * d, rnd(0.1, 0.9), P.z + Math.sin(b) * d, Math.cos(b) * rnd(0.3, 1.1), rnd(1.2, 2.6), Math.sin(b) * rnd(0.3, 1.1), rnd(0.5, 0.9), rnd(0.12, 0.24) * (0.5 + 0.5 * k), pick([0x050208, 0x0e0616, 0x1a0a2a, 0x2a1040]), -1.2);
  }
  // 뭉게뭉게 피어오르는 연기 덩어리
  if (Math.random() < dt * 14) {
    const mat = new THREE.SpriteMaterial({ map: shared('smokeTex', () => makeGlowSprite(0x000000, 1, 1).material.map), color: 0x0a0412, transparent: true, opacity: 0, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    const b = Math.random() * Math.PI * 2, d = rnd(0.2, 0.5), x = P.x + Math.cos(b) * d, z = P.z + Math.sin(b) * d, s0 = rnd(0.6, 1), vy = rnd(1, 1.8);
    rt.fx.add([sp], 0.9, (t) => {
      sp.position.set(x + Math.cos(b) * t * 0.5, 0.4 + t * vy, z + Math.sin(b) * t * 0.5);
      sp.scale.setScalar(s0 * (1 + t * 1.3));
      mat.opacity = (t < 0.15 ? t / 0.15 : (1 - t) / 0.85) * 0.75;
    }, [mat]);
  }
}

export function updateCruels(rt, dt) {
  updateSmoke(rt, dt);
  for (const sk of [...rt.cruels]) {
    const c = sk.cruel;
    if (!c) { rt.cruels = rt.cruels.filter((x) => x !== sk); continue; }
    const p = rt.player, P = p.pos;
    c.t += dt;
    // 바라보는 방향 고정 (가장 가까운 적)
    p.aim.set(Math.cos(c.a), 0, Math.sin(c.a));
    const tailX = P.x - Math.sin(p.facing) * 0.42, tailZ = P.z - Math.cos(p.facing) * 0.42, tailY = 1.1;
    if (c.t < WINDUP) {
      // 꼬리 끝이 칼날로 갈라져 뒤쪽 위로 펼쳐짐 + 어둠이 모여듦
      const k = c.t / WINDUP, grow = Math.min(1, k / 0.6);
      c.blades.forEach((g, i) => {
        g.visible = true;
        const fan = (i - (c.n - 1) / 2) * (c.n > 3 ? 0.4 : 0.55) * grow;
        const ang = c.a + Math.PI + fan, len = 0.25 + 1.1 * grow;
        placeBlade(g, tailX, tailY, tailZ, tailX + Math.cos(ang) * len * 0.6, tailY + len * 0.8, tailZ + Math.sin(ang) * len * 0.6);
      });
      c.bladeMat.emissiveIntensity = 0.4 + k * 1.1;
      c.edgeMat.opacity = 0.35 + k * 0.4;
      for (let q = 0; q < 4; q++) {
        const b = Math.random() * Math.PI * 2, d = rnd(1.5, 3.5);
        const sx = P.x + Math.cos(b) * d, sz = P.z + Math.sin(b) * d, sy = rnd(0.2, 1.6);
        rt.fx.particles.emit(sx, sy, sz, (tailX - sx) * 2.4, (tailY + 0.5 - sy) * 2.4, (tailZ - sz) * 2.4, 0.4, rnd(0.07, 0.12), pick([0x14051f, 0x3a1a5a, 0x7a3aff, 0xd9a8ff]), 0);
      }
      continue;
    }
    // 꼬리를 앞으로 휘둘러 내리침 (0.14초) → 파동 발사
    const k = Math.min(1, (c.t - WINDUP) / 0.14), e = k * k;
    c.blades.forEach((g, i) => {
      const ai = c.a + (i - (c.n - 1) / 2) * 10 * DEG;
      const back = c.a + Math.PI;
      // 뒤쪽 위 → 앞쪽 바닥으로 크게 원을 그리며
      const sw = back + (ai - back + (ai - back > Math.PI ? -2 * Math.PI : ai - back < -Math.PI ? 2 * Math.PI : 0)) * e;
      const len = 1.35 + e * 0.6;
      placeBlade(g, tailX, tailY, tailZ, tailX + Math.cos(sw) * len, tailY + (1 - e) * 1.1 - e * 1.05, tailZ + Math.sin(sw) * len);
    });
    if (k >= 1 && !c.fired) {
      c.fired = true;
      fireWaves(rt, sk, c);
    }
    if (c.t > WINDUP + 0.14) {
      const f = Math.min(1, (c.t - WINDUP - 0.14) / 0.25);
      c.bladeMat.opacity = 1 - f; c.edgeMat.opacity = 0.75 * (1 - f);
      c.blades.forEach((g) => { g.userData.tip.material.opacity = 0.8 * (1 - f); });
      if (f >= 1) endCruel(rt, sk);
    }
  }
  updateWaves(rt, dt);
}

// 땅을 가르는 파동: 관통, 지나간 자리에 川 자 자국
function fireWaves(rt, sk, c) {
  const P = rt.player.pos, st = c.st;
  const speed = sample(st.projSpeed) * PS, life = sample(st.projDuration);
  const size = sample(st.projSize) / PZ;   // 투사체 크기 (기본 20 = 1배) → 파동 · 자국 너비
  for (let i = 0; i < c.n; i++) {
    const ai = c.a + (i - (c.n - 1) / 2) * 10 * DEG;
    const crest = new THREE.Group();
    const shardMat = new THREE.MeshStandardMaterial({ color: 0x241536, emissive: 0x6a2aff, emissiveIntensity: 0.9, flatShading: true, transparent: true, opacity: 1 });
    const shardGeo = shared('crestGeo', () => new THREE.ConeGeometry(0.11, 0.7, 4).translate(0, 0.35, 0));
    for (let k = 0; k < 5; k++) {
      const m = new THREE.Mesh(shardGeo, shardMat);
      m.position.set(0, 0, (k - 2) * 0.17);
      m.rotation.set(rnd(-0.3, 0.3), 0, -0.5 + rnd(-0.2, 0.2));   // 앞으로 기운 바위 · 칼날 조각
      m.scale.setScalar(k === 2 ? 1.3 : rnd(0.7, 1));
      crest.add(m);
    }
    const glow = makeGlowSprite(0x9a6bff, 1.6, 0.8); glow.position.y = 0.4;
    crest.add(glow);
    crest.rotation.y = -ai;
    crest.scale.set(1, 1, size);
    crest.position.set(P.x, 0, P.z);
    rt.scene.add(crest);
    const scar = scarMark(rt.fx, P.x, P.z, ai, speed * life, life, size);
    rt.gwaves.push({ sk, st, x: P.x, z: P.z, x0: P.x, z0: P.z, dx: Math.cos(ai), dz: Math.sin(ai), speed, life, size, t: 0, hit: new Set(), crest, shardMat, glow, scar });
  }
  rt.fx.ring(P.x, P.z, 1.4, 0xd9a8ff, 0.35);
  rt.fx.ring(P.x, P.z, 2.4, 0x7a3aff, 0.45);
  rt.fx.particles.burst(P.x, 0.4, P.z, 30, [0x14051f, 0x3a1a5a, 0x9a6bff, 0xffffff], { speed: 4, size: 0.12, life: 0.5, up: 3, grav: 6 });
  game.shake = Math.max(game.shake || 0, 0.28);
  sfx('explode'); sfx('crackle');
}

function updateWaves(rt, dt) {
  const list = rt.gwaves;
  for (let i = list.length - 1; i >= 0; i--) {
    const w = list[i];
    w.t += dt;
    w.x += w.dx * w.speed * dt; w.z += w.dz * w.speed * dt;
    w.crest.position.set(w.x, 0, w.z);
    w.crest.position.y = Math.sin(w.t * 40) * 0.04;
    // 지나간 자리: 흙 · 어둠이 솟구침
    for (let q = 0; q < 4; q++) rt.fx.particles.emit(w.x + rnd(-0.3, 0.3) * w.size, 0.1, w.z + rnd(-0.3, 0.3) * w.size, rnd(-1, 1), rnd(2.5, 5), rnd(-1, 1), rnd(0.35, 0.6), rnd(0.07, 0.14), pick([0x2a0a3a, 0x5a4a6a, 0x7a3aff, 0xd9a8ff]), 12);
    // 관통하며 닿은 적마다 한 번씩
    for (const e of rt.enemies.query(w.x, w.z, 2.6)) {
      if (!e.alive || w.hit.has(e) || Math.hypot(e.x - w.x, e.z - w.z) > 0.55 * w.size + e.r * 0.7) continue;
      w.hit.add(e);
      const bonus = w.sk.level >= 3 && scared(e) ? 1.5 : 1;
      const dealt = rt.deal(e, w.sk, w.st, { at: { x: w.x, z: w.z }, mul: bonus, kx: w.dx * 3, kz: w.dz * 3 });
      if (dealt > 0 && e.alive) rt.enemies.addBleed(e, dealt * 0.5, 3, w.sk);
      rt.fx.particles.burst(e.x, 0.6, e.z, 8, [0xff4a6a, 0x9a6bff, 0x2a0a3a], { speed: 3, size: 0.1, life: 0.4, up: 2.5 });
    }
    const fade = Math.min(1, (w.life - w.t) / 0.15);
    w.shardMat.opacity = fade; w.glow.material.opacity = 0.8 * fade;
    if (w.t >= w.life) {
      rt.scene.remove(w.crest);
      w.shardMat.dispose(); w.glow.material.dispose();
      list.splice(i, 1);
    }
  }
}

// 川 자 자국: 나란한 세 줄의 긁힌 자국 (어둡게 패인 자국 + 보랏빛) — growT 동안 파동을 따라 그어짐
// 1초부터 사라지기 시작해 0.5초 뒤 완전히 사라짐 / size: 투사체 크기 배율 (자국 너비)
const SCAR_HOLD = 1, SCAR_FADE = 0.5;
function scarMark(fx, x, z, a, L, growT, size = 1) {
  const life = Math.max(growT, SCAR_HOLD) + SCAR_FADE;
  const geo = shared('scarGeo', () => new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0).rotateX(-Math.PI / 2));
  const darkMat = new THREE.MeshBasicMaterial({ color: 0x12081c, transparent: true, opacity: 0.85, depthWrite: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xb48cff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const objs = [];
  const nx = -Math.sin(a), nz = Math.cos(a);   // 옆 방향
  for (const off0 of [-0.17, 0, 0.17]) {
    const off = off0 * size;
    const len = L * rnd(0.92, 1), w = (off0 === 0 ? 0.075 : 0.06) * size;
    const start = rnd(0.2, 0.5);
    for (const [mat, ww, y] of [[darkMat, w, 0.045], [glowMat, w * 0.45, 0.05]]) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x + nx * off + Math.cos(a) * start, y, z + nz * off + Math.sin(a) * start);
      m.rotation.y = -a;
      m.scale.set(0.01, 1, ww);
      m.userData.len = len - start;
      objs.push(m);
    }
  }
  fx.add(objs, life, (k) => {
    const grow = Math.min(1, (k * life) / growT);
    for (const m of objs) m.scale.x = Math.max(0.01, m.userData.len * grow);
    const t = k * life, hold = Math.max(growT, SCAR_HOLD);
    const fade = t < hold ? 1 : Math.max(0, 1 - (t - hold) / SCAR_FADE);
    glowMat.opacity = 0.9 * fade * Math.max(0.3, 1 - Math.max(0, t - growT) / 0.6);
    darkMat.opacity = 0.85 * fade;
  }, [darkMat, glowMat]);
}

function endCruel(rt, sk) {
  const c = sk.cruel;
  if (!c) return;
  for (const g of c.blades) { rt.scene.remove(g); g.userData.tip.material.dispose(); }
  c.bladeMat.dispose(); c.edgeMat.dispose();
  sk.cruel = null;
  rt.cruels = rt.cruels.filter((x) => x !== sk);
  const p = rt.player;
  p.lockMove = false; p.tailBlades = false;
}

export function clearCruels(rt) {
  for (const sk of [...(rt.cruels || [])]) endCruel(rt, sk);
  for (const w of rt.gwaves || []) { rt.scene.remove(w.crest); w.shardMat.dispose(); w.glow.material.dispose(); }
  if (rt.gwaves) rt.gwaves.length = 0;
}
