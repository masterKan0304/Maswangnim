// ─────────────────────────────────────────────
//  열매 맺기: 속성 열매의 모양 · 날아가는 이펙트 · 터지는 이펙트
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { makeGlowSprite, getGlowTexture } from './effects.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 공용 재질 / 지오메트리 (열매마다 새로 만들지 않음)
const SHARED = {};
const shared = (k, make) => SHARED[k] || (SHARED[k] = make());

// 후광 고리 텍스처 (광휘)
function haloTexture() {
  return shared('haloTex', () => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 30, 64, 64, 62);
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(0.55, 'rgba(255,255,255,0.95)');
    grd.addColorStop(0.7, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  });
}

// 열매 몸통 모양
export function fruitGeometry(el, fallback) {
  if (el === 'ocean') return new THREE.IcosahedronGeometry(0.24, 1);
  if (el === 'ice') return new THREE.IcosahedronGeometry(0.24, 0);
  if (el === 'earth') return new THREE.DodecahedronGeometry(0.24, 0);
  if (el === 'dark' || el === 'radiant') return new THREE.IcosahedronGeometry(0.25, 2);   // 동그랗게
  return fallback;
}

const tag = (o, name, data = {}) => { o.name = name; Object.assign(o.userData, data); return o; };

// 열매에 속성 장식을 붙임 (자식 오브젝트 — 열매와 함께 자라고 날아감)
export function decorateFruit(mesh, el) {
  if (el === 'fire') {
    mesh.add(tag(makeGlowSprite(0xff7a2e, 1.5, 0.75), 'glow', { pulse: 9 }));
  } else if (el === 'ocean') {
    const water = shared('waterMat', () => new THREE.MeshPhongMaterial({ color: 0x8fd4ff, emissive: 0x1a5a9a, emissiveIntensity: 0.4, shininess: 90, transparent: true, opacity: 0.38, depthWrite: false, flatShading: true }));
    mesh.add(tag(new THREE.Mesh(shared('waterGeo', () => new THREE.IcosahedronGeometry(0.36, 1)), water), 'water', { wobble: true }));
    mesh.add(tag(makeGlowSprite(0x3fa8ff, 1.1, 0.4), 'glow'));
  } else if (el === 'nature') {
    const leafMat = shared('leafMat', () => new THREE.MeshStandardMaterial({ color: 0x4fbf4a, roughness: 0.6, flatShading: true }));
    const leafGeo = shared('leafGeo', () => new THREE.SphereGeometry(0.1, 5, 3).scale(1.9, 0.3, 0.8));
    for (const s of [-1, 1]) {
      const lf = new THREE.Mesh(leafGeo, leafMat);
      lf.position.set(s * 0.12, 0.24, 0); lf.rotation.z = s * 0.5;
      mesh.add(tag(lf, 'leaf'));
    }
    mesh.add(tag(makeGlowSprite(0x7ed957, 1.1, 0.35), 'glow'));
  } else if (el === 'ice') {
    const frost = shared('frostMat', () => new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.45 }));
    mesh.add(tag(new THREE.Mesh(shared('frostGeo', () => new THREE.IcosahedronGeometry(0.31, 0)), frost), 'frost', { spin: 1.5 }));
    mesh.add(tag(makeGlowSprite(0xbdf2ff, 1.2, 0.45), 'glow'));
  } else if (el === 'earth') {
    // 단단한 껍질 조각이 붙어 있는 열매
    const shellMat = shared('shellMat', () => new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.95, flatShading: true }));
    const shellGeo = shared('shellGeo', () => new THREE.DodecahedronGeometry(0.1, 0).scale(1.4, 0.45, 1.2));
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 9; i++) {
      const n = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize();
      const pl = new THREE.Mesh(shellGeo, shellMat);
      pl.position.copy(n).multiplyScalar(0.22);
      pl.quaternion.setFromUnitVectors(up, n);
      pl.castShadow = true;
      mesh.add(tag(pl, 'shell'));
    }
  } else if (el === 'dark') {
    // 주위를 도는 검은 칼날 조각 + 보랏빛 기운
    const shardMat = shared('darkShardMat', () => new THREE.MeshBasicMaterial({ color: 0x9a6bff }));
    const shardGeo = shared('darkShardGeo', () => new THREE.ConeGeometry(0.045, 0.22, 4).rotateZ(Math.PI / 2));
    for (let i = 0; i < 3; i++) mesh.add(tag(new THREE.Mesh(shardGeo, shardMat), 'orbit', { a: (i / 3) * Math.PI * 2, r: 0.42, sp: 5, tilt: i * 0.7 }));
    mesh.add(tag(makeGlowSprite(0x7a3aff, 1.7, 0.7), 'glow', { pulse: 4 }));
    const veil = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: 0x14051f, transparent: true, opacity: 0.55, depthWrite: false }));
    veil.scale.setScalar(1.25);
    mesh.add(tag(veil, 'veil'));
  } else if (el === 'radiant') {
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), color: 0xffe680, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(1.05);
    mesh.add(tag(halo, 'halo', { pulse: 5 }));
    mesh.add(tag(makeGlowSprite(0xfff3b0, 1.8, 0.8), 'glow', { pulse: 7 }));
  }
}

// 매 프레임: 장식 움직임 + 파티클 (flying: 날아가는 중)
export function tickFruit(fr, dt, flying, fx) {
  const m = fr.mesh, el = fr.el, t = fr.t;
  if (el === 'none') return;
  for (const c of m.children) {
    const u = c.userData;
    if (u.pulse && c.isSprite) c.material.opacity = Math.min(1, 0.55 + 0.25 * Math.sin(t * u.pulse));
    if (u.spin) c.rotation.y += dt * u.spin;
    if (u.wobble) c.scale.set(1 + 0.06 * Math.sin(t * 7), 1 + 0.06 * Math.sin(t * 7 + 2), 1 + 0.06 * Math.sin(t * 7 + 4));
    if (u.r) { u.a += dt * u.sp; c.position.set(Math.cos(u.a) * u.r, Math.sin(u.a * 1.3 + u.tilt) * 0.12, Math.sin(u.a) * u.r); c.rotation.y = -u.a; }
  }
  const p = m.position, s = Math.max(0.3, m.scale.x);
  const n = (rate) => { const k = rate * dt; return Math.floor(k) + (Math.random() < k % 1 ? 1 : 0); };
  const jit = (a) => (Math.random() - 0.5) * a * s;
  if (el === 'fire') {
    // 타오르는 불꽃 + 날아갈 때 불꽃 꼬리
    for (let i = n(flying ? 70 : 26); i--;) fx.particles.emit(p.x + jit(0.4), p.y + jit(0.3), p.z + jit(0.4), jit(0.6), rnd(1, 2.2), jit(0.6), rnd(0.3, 0.55), rnd(0.06, 0.13) * s, pick([0xff5a14, 0xff9a3a, 0xffd27a]), -2.5);
    if (flying) for (let i = n(40); i--;) fx.particles.emit(p.x + jit(0.2), p.y + jit(0.2), p.z + jit(0.2), 0, 0.3, 0, rnd(0.25, 0.45), rnd(0.12, 0.2) * s, pick([0xff7a2e, 0xffc56b, 0xffe9b0]), -0.5);
  } else if (el === 'ocean') {
    if (!flying) { for (let i = n(5); i--;) fx.particles.emit(p.x + jit(0.4), p.y - 0.2 * s, p.z + jit(0.4), 0, -0.5, 0, 0.5, 0.06, pick([0x8fd4ff, 0xe0f4ff]), 9); }
    else for (let i = n(55); i--;) { const a = Math.random() * Math.PI * 2, v = rnd(1, 2.6); fx.particles.emit(p.x, p.y, p.z, Math.cos(a) * v, rnd(0.5, 2), Math.sin(a) * v, rnd(0.35, 0.6), rnd(0.05, 0.1) * s, pick([0x3fa8ff, 0x8fd4ff, 0xe8f8ff]), 12); }
  } else if (el === 'nature') {
    for (let i = n(flying ? 30 : 6); i--;) {
      const petal = Math.random() < 0.5;
      fx.particles.emit(p.x + jit(0.5), p.y + jit(0.4), p.z + jit(0.5), jit(1.6), rnd(-0.2, 0.8), jit(1.6), rnd(0.8, 1.3), (petal ? rnd(0.07, 0.1) : rnd(0.08, 0.12)) * s, petal ? pick([0xffb7d5, 0xffd0e4, 0xff9ec4]) : pick([0x5cc85a, 0x8fe07a, 0x3f9a3a]), 1.4);
    }
  } else if (el === 'ice') {
    for (let i = n(flying ? 24 : 6); i--;) fx.particles.emit(p.x + jit(0.4), p.y + jit(0.4), p.z + jit(0.4), jit(2.4), rnd(0.2, 1.5), jit(2.4), rnd(0.25, 0.45), rnd(0.04, 0.08) * s, pick([0xffffff, 0xd8f8ff, 0x9fe6ff]), 6);   // 얼음 파편
    for (let i = n(flying ? 26 : 10); i--;) fx.particles.emit(p.x + jit(0.6), p.y + jit(0.3), p.z + jit(0.6), jit(0.3), rnd(0.1, 0.4), jit(0.3), rnd(0.6, 1), rnd(0.12, 0.2) * s, pick([0xeef8ff, 0xd8ecf5]), -0.3);   // 서리 안개
  } else if (el === 'earth') {
    if (flying) {
      // 묵직한 궤적 + 흩날리는 껍질 조각
      for (let i = n(60); i--;) fx.particles.emit(p.x + jit(0.15), p.y + jit(0.15), p.z + jit(0.15), 0, 0, 0, rnd(0.35, 0.55), rnd(0.13, 0.2) * s, pick([0x8a6a44, 0x6a4a2a, 0xa88a60]), 0);
      for (let i = n(14); i--;) fx.particles.emit(p.x, p.y, p.z, jit(3), rnd(0, 1.5), jit(3), rnd(0.5, 0.8), rnd(0.07, 0.12) * s, pick([0x5a3a1e, 0x6a4a2a]), 12);
    } else for (let i = n(3); i--;) fx.particles.emit(p.x + jit(0.4), p.y - 0.2 * s, p.z + jit(0.4), 0, -0.3, 0, 0.5, 0.05, 0x8a6a44, 9);
  } else if (el === 'dark') {
    for (let i = n(flying ? 50 : 16); i--;) fx.particles.emit(p.x + jit(0.5), p.y + jit(0.4), p.z + jit(0.5), jit(0.8), rnd(0.4, 1.4), jit(0.8), rnd(0.4, 0.8), rnd(0.07, 0.15) * s, pick([0x1a0a2a, 0x3a1a5a, 0x7a3aff, 0xb48cff]), -1);
    if (flying) for (let i = n(30); i--;) fx.particles.emit(p.x + jit(0.2), p.y + jit(0.2), p.z + jit(0.2), 0, 0, 0, rnd(0.3, 0.5), rnd(0.12, 0.22) * s, pick([0x14051f, 0x2a0a3a, 0x5a2a9a]), 0);
  } else if (el === 'radiant') {
    for (let i = n(flying ? 60 : 18); i--;) { const a = Math.random() * Math.PI * 2, b = rnd(-0.6, 0.9), v = rnd(1.2, 3); fx.particles.emit(p.x, p.y, p.z, Math.cos(a) * Math.cos(b) * v, Math.sin(b) * v, Math.sin(a) * Math.cos(b) * v, rnd(0.3, 0.6), rnd(0.05, 0.1) * s, pick([0xffffff, 0xfff3b0, 0xffe066]), 0); }
    if (flying) for (let i = n(36); i--;) fx.particles.emit(p.x + jit(0.15), p.y + jit(0.15), p.z + jit(0.15), 0, 0.2, 0, rnd(0.35, 0.6), rnd(0.12, 0.2) * s, pick([0xfff8d8, 0xffe680]), -0.3);
  }
}

// 오래 남는 안개 (냉기 / 칠흑)
function lingerMist(fx, x, z, r, color, life, additive = false) {
  for (let i = 0; i < 10; i++) {
    const mat = new THREE.SpriteMaterial({ map: getGlowTexture(), color, transparent: true, opacity: 0, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
    const sp = new THREE.Sprite(mat);
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * r * 0.8;
    const y = rnd(0.2, 0.7), s0 = r * rnd(0.6, 1), drift = rnd(-0.3, 0.3);
    const L = life * rnd(0.85, 1.1);
    fx.add([sp], L, (k) => {
      sp.position.set(x + Math.cos(a + k * drift) * d, y + k * 0.3, z + Math.sin(a + k * drift) * d);
      sp.scale.setScalar(s0 * (1 + k * 0.4));
      mat.opacity = (k < 0.1 ? k / 0.1 : k > 0.75 ? (1 - k) / 0.25 : 1) * 0.6;
    }, [mat]);
  }
}

// 터질 때 (x, z: 위치, r: 효과 범위 반지름, life: 지대 지속 시간)
export function burstFruit(el, x, z, r, fx, life = 3) {
  if (el === 'fire') {
    fx.explosion(x, z, r, 0xff6a1a);
    fx.particles.burst(x, 0.5, z, 60, [0xff5a14, 0xff9a3a, 0xffd27a, 0xfff1b0], { speed: 3 + r * 1.8, size: 0.14, life: 0.7, up: 5, grav: 6 });
    fx.ring(x, z, r, 0xff7a2e, 0.5);
  } else if (el === 'ocean') {
    // 첨벙: 위로 크게 튀는 물방울 + 왕관 모양 물보라
    fx.particles.burst(x, 0.3, z, 90, [0x3fa8ff, 0x8fd4ff, 0xe8f8ff, 0xffffff], { speed: 2.5 + r * 1.4, size: 0.11, life: 1, up: 7, grav: 14 });
    for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2, v = rnd(2.5, 4) + r; fx.particles.emit(x + Math.cos(a) * 0.4, 0.2, z + Math.sin(a) * 0.4, Math.cos(a) * v, rnd(4, 6.5), Math.sin(a) * v, rnd(0.6, 0.9), rnd(0.08, 0.14), pick([0x8fd4ff, 0xffffff]), 14); }
    fx.ring(x, z, r, 0x3fa8ff, 0.55); fx.ring(x, z, r * 0.6, 0xe8f8ff, 0.45);
    fx.splat(x, z, 0x3fa8ff, r * 0.7);
  } else if (el === 'nature') {
    // 흩날리는 바람 + 바닥에 일궈지는 덩굴
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2, v = rnd(2, 4) + r;
      const petal = Math.random() < 0.4;
      fx.particles.emit(x + Math.cos(a) * 0.3, rnd(0.2, 0.8), z + Math.sin(a) * 0.3, Math.cos(a) * v - Math.sin(a) * 3, rnd(1, 3), Math.sin(a) * v + Math.cos(a) * 3, rnd(0.7, 1.1), rnd(0.08, 0.13), petal ? pick([0xffb7d5, 0xffd0e4]) : pick([0x5cc85a, 0x8fe07a, 0xe8fff4]), 2);
    }
    fx.ring(x, z, r, 0x7ed957, 0.5); fx.ring(x, z, r * 0.7, 0xe8fff4, 0.4);
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x3f9a3a, roughness: 0.8, flatShading: true, transparent: true, opacity: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x7ed957, roughness: 0.6, flatShading: true, transparent: true, opacity: 1 });
    const leafGeo = shared('vineLeafGeo', () => new THREE.SphereGeometry(0.08, 5, 3).scale(1.8, 0.35, 0.8));
    const objs = [];
    for (let i = 0; i < 7; i++) {
      const R = rnd(0.35, Math.max(0.5, r * 0.45));
      const g = new THREE.Group();
      const vine = new THREE.Mesh(new THREE.TorusGeometry(R, 0.05, 4, 14, rnd(1.6, 3.2)), vineMat);
      vine.rotation.x = -Math.PI / 2;
      g.add(vine);
      for (let k = 0; k < 3; k++) { const a = rnd(0, 2.5); const lf = new THREE.Mesh(leafGeo, leafMat); lf.position.set(Math.cos(a) * R, 0.05, -Math.sin(a) * R); lf.rotation.y = a; g.add(lf); }
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * r * 0.55;
      g.position.set(x + Math.cos(a) * d, 0.04, z + Math.sin(a) * d);
      g.rotation.y = Math.random() * Math.PI * 2;
      g.userData.geo = vine.geometry;
      objs.push(g);
    }
    fx.add(objs, life, (k) => {
      const grow = Math.min(1, k * life / 0.35);
      for (const g of objs) g.scale.setScalar(grow);
      const fade = k > 0.8 ? (1 - k) / 0.2 : 1;
      vineMat.opacity = fade; leafMat.opacity = fade;
      if (k >= 0.999) for (const g of objs) g.userData.geo.dispose();
    }, [vineMat, leafMat]);
  } else if (el === 'ice') {
    // 크게 튀는 얼음 파편 + 남는 안개
    fx.particles.burst(x, 0.5, z, 55, [0xffffff, 0xd8f8ff, 0x9fe6ff, 0x7fd8ff], { speed: 3.5 + r * 1.8, size: 0.2, life: 0.8, up: 5, grav: 12 });
    fx.particles.burst(x, 0.4, z, 30, [0xffffff, 0xbdf2ff], { speed: 2 + r, size: 0.1, life: 0.6, up: 3, grav: 8 });
    fx.ring(x, z, r, 0x9fe6ff, 0.5); fx.ring(x, z, r * 0.6, 0xffffff, 0.4);
    fx.mist(x, z, r * 0.6, 0xeef8ff);
    lingerMist(fx, x, z, r, 0xe8f6ff, life);
  } else if (el === 'earth') {
    // 바닥에 처박히는 돌 조각 + 사방으로 튀는 파편
    fx.particles.burst(x, 0.4, z, 70, [0x8a6a44, 0x6a4a2a, 0xa88a60, 0x5a5048], { speed: 3 + r * 1.6, size: 0.16, life: 0.8, up: 6, grav: 16 });
    fx.ring(x, z, r, 0xc8925a, 0.5);
    fx.splat(x, z, 0x4a3420, r * 0.6);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.95, flatShading: true, transparent: true, opacity: 1 });
    const rockGeo = shared('rockGeo', () => new THREE.DodecahedronGeometry(0.16, 0));
    const rocks = [];
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(rockGeo, rockMat);
      m.castShadow = true;
      const a = Math.random() * Math.PI * 2, d = rnd(0.3, 1) * r;
      m.userData = { tx: x + Math.cos(a) * d, tz: z + Math.sin(a) * d, h: rnd(1, 2.4), s: rnd(0.6, 1.5), rx: rnd(-6, 6), rz: rnd(-6, 6), tl: rnd(0.25, 0.4) };
      m.scale.setScalar(m.userData.s);
      rocks.push(m);
    }
    fx.add(rocks, life, (k) => {
      const tt = k * life;
      for (const m of rocks) {
        const u = m.userData, f = Math.min(1, tt / u.tl);
        if (f < 1) {
          m.position.set(x + (u.tx - x) * f, u.h * Math.sin(f * Math.PI) * (1 - f * 0.3) + 0.1, z + (u.tz - z) * f);
          m.rotation.set(u.rx * tt, 0, u.rz * tt);
        } else {
          if (!u.landed) { u.landed = true; fx.particles.burst(u.tx, 0.1, u.tz, 5, [0x8a6a44, 0x5a3a1e], { speed: 1.5, size: 0.07, life: 0.4, up: 2 }); }
          m.position.set(u.tx, 0.06 - Math.min(0.12, (tt - u.tl) * 0.4) * u.s, u.tz);   // 땅에 박힘
        }
      }
      rockMat.opacity = k > 0.85 ? (1 - k) / 0.15 : 1;
    }, [rockMat]);
  } else if (el === 'dark') {
    // 검보랏빛 폭발 + 휘몰아치는 칼날 + 남는 어둠 안개
    fx.explosion(x, z, r * 0.8, 0x6a2aff);
    lingerMist(fx, x, z, r, 0x1a0628, life);
    lingerMist(fx, x, z, r * 0.7, 0x5a2a9a, life * 0.6, true);
    fx.particles.burst(x, 0.6, z, 70, [0x14051f, 0x3a1a5a, 0x7a3aff, 0xb48cff, 0xffffff], { speed: 3 + r * 1.6, size: 0.13, life: 0.8, up: 4, grav: 3 });
    fx.ring(x, z, r, 0x9a6bff, 0.6); fx.ring(x, z, r * 0.55, 0x2a0a3a, 0.5);
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0xc8a8ff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const bladeGeo = shared('bladeGeo', () => { const g = new THREE.ConeGeometry(0.09, 1, 3); g.rotateZ(-Math.PI / 2); return g; });
    const blades = [];
    for (let i = 0; i < 10; i++) {
      const b = new THREE.Mesh(bladeGeo, bladeMat);
      b.userData = { a: (i / 10) * Math.PI * 2, y: rnd(0.3, 1.1), len: rnd(0.7, 1.2) * Math.max(0.6, r * 0.35) };
      blades.push(b);
    }
    fx.add(blades, 0.75, (k) => {
      const e = 1 - (1 - k) ** 2;
      for (const b of blades) {
        const u = b.userData, a = u.a + e * Math.PI * 3, d = r * (0.15 + 0.85 * e);
        b.position.set(x + Math.cos(a) * d, u.y, z + Math.sin(a) * d);
        b.rotation.set(0, -a - Math.PI / 2, 0);   // 도는 방향으로 날을 세움
        b.scale.set(u.len, 1, 1);
      }
      bladeMat.opacity = 1 - k;
    }, [bladeMat]);
  } else if (el === 'radiant') {
    // 신성한 폭발: 빛 기둥 + 퍼지는 빛살 + 섬광
    const flash = makeGlowSprite(0xfff3b0, 1, 1);
    flash.position.set(x, 0.8, z);
    const pillarMat = new THREE.MeshBasicMaterial({ color: 0xffe680, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const pillar = new THREE.Mesh(fx.cylGeo, pillarMat);
    const rayMat = new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const rayGeo = shared('rayGeo', () => new THREE.PlaneGeometry(1, 0.16).translate(0.5, 0, 0).rotateX(-Math.PI / 2));
    const rays = [];
    for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(rayGeo, rayMat); m.position.set(x, 0.08, z); m.rotation.y = (i / 12) * Math.PI * 2 + rnd(-0.1, 0.1); m.userData.l = rnd(0.8, 1.2); rays.push(m); }
    fx.add([flash, pillar, ...rays], 0.8, (k) => {
      const e = 1 - (1 - k) ** 3;
      flash.scale.setScalar(r * (0.6 + 2.2 * e)); flash.material.opacity = 1 - k;
      pillar.position.set(x, 4, z); pillar.scale.set(r * 0.35 * (1 - k * 0.6), 8, r * 0.35 * (1 - k * 0.6)); pillarMat.opacity = 0.8 * (1 - k);
      for (const m of rays) m.scale.set(r * 1.3 * e * m.userData.l, 1, 1 + k);
      rayMat.opacity = 0.9 * (1 - k);
    }, [flash.material, pillarMat, rayMat]);
    fx.ring(x, z, r, 0xffe680, 0.6); fx.ring(x, z, r * 0.7, 0xffffff, 0.5); fx.ring(x, z, r * 1.15, 0xfff3b0, 0.7);
    fx.particles.burst(x, 0.6, z, 80, [0xffffff, 0xfff3b0, 0xffe066, 0xffd27a], { speed: 3 + r * 1.8, size: 0.11, life: 0.9, up: 6, grav: 2 });
    for (let i = 0; i < 40; i++) fx.particles.emit(x + rnd(-0.4, 0.4), 0.3, z + rnd(-0.4, 0.4), rnd(-0.4, 0.4), rnd(6, 11), rnd(-0.4, 0.4), rnd(0.6, 1), rnd(0.08, 0.14), pick([0xffffff, 0xffe680]), -1);
  }
}
