import { STAGE } from './stage.js';
import * as THREE from 'three';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);

let glowTex = null;
export function getGlowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.65)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

export function makeGlowSprite(color, scale = 1, opacity = 1) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: getGlowTexture(), color, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  sp.scale.setScalar(scale);
  return sp;
}

// ─────────────────────────────────────────────
//  파티클 (인스턴스 큐브)
// ─────────────────────────────────────────────
class Particles {
  constructor(scene, cap = 5000) {
    this.cap = cap; this.n = 0;
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), cap);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    scene.add(this.mesh);
    this.pos = new Float32Array(cap * 3);
    this.vel = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 3);
    this.life = new Float32Array(cap);
    this.max = new Float32Array(cap);
    this.size = new Float32Array(cap);
    this.grav = new Float32Array(cap);
    this.rot = new Float32Array(cap);
  }
  emit(x, y, z, vx, vy, vz, life, size, color, grav = 9) {
    if (this.n >= this.cap) return;
    const i = this.n++;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.life[i] = life; this.max[i] = life; this.size[i] = size; this.grav[i] = grav;
    this.rot[i] = Math.random() * 6;
    _c.set(color);
    this.col[i * 3] = _c.r; this.col[i * 3 + 1] = _c.g; this.col[i * 3 + 2] = _c.b;
  }
  burst(x, y, z, count, colors, { speed = 4, size = 0.12, life = 0.5, up = 3, grav = 9 } = {}) {
    for (let k = 0; k < count; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random() * 0.6);
      const col = Array.isArray(colors) ? colors[k % colors.length] : colors;
      this.emit(x, y, z, Math.cos(a) * sp, up * (0.5 + Math.random()), Math.sin(a) * sp,
        life * (0.6 + Math.random() * 0.6), size * (0.6 + Math.random() * 0.8), col, grav);
    }
  }
  copy(from, to) {
    for (let k = 0; k < 3; k++) {
      this.pos[to * 3 + k] = this.pos[from * 3 + k];
      this.vel[to * 3 + k] = this.vel[from * 3 + k];
      this.col[to * 3 + k] = this.col[from * 3 + k];
    }
    this.life[to] = this.life[from]; this.max[to] = this.max[from];
    this.size[to] = this.size[from]; this.grav[to] = this.grav[from]; this.rot[to] = this.rot[from];
  }
  update(dt) {
    let i = 0;
    while (i < this.n) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.copy(this.n - 1, i); this.n--; continue; }
      const j = i * 3;
      this.vel[j + 1] -= this.grav[i] * dt;
      this.pos[j] += this.vel[j] * dt;
      this.pos[j + 1] += this.vel[j + 1] * dt;
      this.pos[j + 2] += this.vel[j + 2] * dt;
      if (this.pos[j + 1] < 0.02) {
        this.pos[j + 1] = 0.02;
        this.vel[j + 1] *= -0.35; this.vel[j] *= 0.6; this.vel[j + 2] *= 0.6;
      }
      this.rot[i] += dt * 6;
      i++;
    }
  }
  render() {
    for (let i = 0; i < this.n; i++) {
      const k = this.life[i] / this.max[i];
      const s = this.size[i] * (0.25 + 0.75 * k);
      _e.set(this.rot[i], this.rot[i] * 0.7, 0);
      _q.setFromEuler(_e);
      _p.set(this.pos[i * 3], this.pos[i * 3 + 1], this.pos[i * 3 + 2]);
      _s.set(s, s, s);
      _m.compose(_p, _q, _s);
      this.mesh.setMatrixAt(i, _m);
      _c.setRGB(this.col[i * 3], this.col[i * 3 + 1], this.col[i * 3 + 2]);
      this.mesh.setColorAt(i, _c);
    }
    this.mesh.count = this.n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}

// ─────────────────────────────────────────────
//  데미지 숫자 (DOM)
// ─────────────────────────────────────────────
class DamageNumbers {
  constructor(layer, camera) {
    this.camera = camera;
    this.pool = [];
    this.active = [];
    for (let i = 0; i < 110; i++) {
      const el = document.createElement('div');
      el.className = 'dmg';
      el.style.display = 'none';
      layer.appendChild(el);
      this.pool.push({ el, x: 0, y: 0, z: 0, t: 0 });
    }
  }
  // at: { x, z, stack } — 같은 공격의 여러 속성 피해를 한 자리에 쌓음 (stack 1 이상은 75% 크기로 위에 쌓임)
  spawn(x, y, z, text, cls = '', at = null) {
    let d = this.pool.pop();
    if (!d) d = this.active.shift();
    d.el.className = 'dmg ' + cls;
    d.el.textContent = text;
    if (at) { d.x = at.x; d.z = at.z; d.stack = at.stack || 0; }
    else { d.x = x + (Math.random() - 0.5) * 0.5; d.z = z + (Math.random() - 0.5) * 0.3; d.stack = 0; }
    d.y = y; d.t = 0;
    d.el.style.display = 'block';
    this.active.push(d);
  }
  update(dt) {
    const w = STAGE.W, h = STAGE.H;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const d = this.active[i];
      d.t += dt;
      if (d.t > 0.8) {
        d.el.style.display = 'none';
        this.active.splice(i, 1);
        this.pool.push(d);
        continue;
      }
      _p.set(d.x, d.y + d.t * 1.3, d.z).project(this.camera);
      const sx = (_p.x + 1) / 2 * w, sy = (1 - _p.y) / 2 * h;
      const pop = d.t < 0.1 ? 1 + (0.1 - d.t) * 5 : 1;
      const sub = d.stack > 0 ? 0.75 : 1, lift = d.stack > 0 ? 26 + (d.stack - 1) * 20 : 0;   // 추가 속성 피해: 75% 크기로 위에 쌓임
      d.el.style.transform = `translate(${sx}px, ${sy - lift}px) translate(-50%, -50%) scale(${pop * sub})`;
      d.el.style.opacity = d.t > 0.55 ? (0.8 - d.t) / 0.25 : 1;
    }
  }
}

// ─────────────────────────────────────────────
//  이펙트 매니저
// ─────────────────────────────────────────────
// 범위 고리: 크기(월드 배율)에 맞춰 안쪽 반지름을 바꿔 둘레 두께가 거의 일정하게 유지됨
const ringCache = new Map();
function ringGeoFor(ratio) {
  const key = Math.max(1, Math.min(56, Math.round(ratio * 400)));
  let g = ringCache.get(key);
  if (!g) { g = new THREE.RingGeometry(1 - key / 400, 1, 56); ringCache.set(key, g); }
  return g;
}
export class RingMesh extends THREE.Mesh {
  constructor(mat) { super(ringGeoFor(0.14), mat); }
  updateMatrixWorld(force) {
    super.updateMatrixWorld(force);
    const e = this.matrixWorld.elements;
    const s = Math.hypot(e[0], e[1], e[2]);
    const t = Math.min(0.24, 0.14 + 0.01 * Math.max(0, s - 1));   // 둘레 두께 (월드 단위)
    this.geometry = ringGeoFor(s > 1 ? t / s : 0.14);
  }
}

export class FX {
  constructor(scene, camera, layer) {
    this.scene = scene;
    this.particles = new Particles(scene);
    this.numbers = new DamageNumbers(layer, camera);
    this.items = [];
    this.sphereGeo = new THREE.IcosahedronGeometry(1, 1);
    this.ringGeo = new THREE.RingGeometry(0.86, 1, 28);
    this.circleGeo = new THREE.CircleGeometry(1, 10);
    this.cylGeo = new THREE.CylinderGeometry(1, 1, 1, 5, 1);
  }

  add(objs, life, update, mats = []) {
    for (const o of objs) this.scene.add(o);
    this.items.push({ objs, life, t: 0, update, mats });
  }

  update(dt) {
    this.particles.update(dt);
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.t += dt;
      const k = Math.min(1, it.t / it.life);
      it.update(k, it);
      if (it.t >= it.life) {
        for (const o of it.objs) this.scene.remove(o);
        for (const m of it.mats) m.dispose();
        this.items.splice(i, 1);
      }
    }
  }

  render(dt) {
    this.particles.render();
    this.numbers.update(dt);
  }

  explosion(x, z, radius, color = 0xff9a3a) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    const core = new THREE.MeshBasicMaterial({ color: 0xfff1b0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffc56b, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const m = new THREE.Mesh(this.sphereGeo, mat); m.position.set(x, 0.35, z);
    const c = new THREE.Mesh(this.sphereGeo, core); c.position.set(x, 0.35, z);
    const ring = new RingMesh(ringMat); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.06, z);
    const scorch = new THREE.MeshBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.35, depthWrite: false });
    const sc = new THREE.Mesh(this.circleGeo, scorch); sc.rotation.x = -Math.PI / 2; sc.position.set(x, 0.03, z); sc.scale.setScalar(radius * 0.8);
    this.add([m, c, ring, sc], 0.4, (k) => {
      const e = 1 - (1 - k) ** 3;
      m.scale.setScalar(radius * (0.35 + 0.65 * e));
      c.scale.setScalar(radius * 0.55 * (1 - k));
      mat.opacity = 0.8 * (1 - k);
      core.opacity = 0.9 * (1 - k);
      ring.scale.setScalar(radius * (0.6 + 0.6 * e));
      ringMat.opacity = 0.9 * (1 - k);
      scorch.opacity = 0.35 * (1 - k * k);
    }, [mat, core, ringMat, scorch]);
    this.particles.burst(x, 0.4, z, 10 + Math.min(20, radius * 6), [0xffb347, 0xff6a1a, 0xffe08a, 0xff4a1a], { speed: 3 + radius * 2, size: 0.14, life: 0.45, up: 3.5 });
    this.particles.burst(x, 0.3, z, 4, [0x5a5048, 0x7a6e62], { speed: 1.5, size: 0.2, life: 0.6, up: 2.5, grav: -1 });
  }

  lightning(a, b, width = 0.2) {
    const pts = [];
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const dist = Math.hypot(dx, dy, dz);
    const segs = Math.max(3, Math.ceil(dist / 0.5));
    const px = -dz / (Math.hypot(dx, dz) || 1), pz = dx / (Math.hypot(dx, dz) || 1);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const off = i > 0 && i < segs ? (Math.random() - 0.5) * 0.6 : 0;
      pts.push(new THREE.Vector3(a.x + dx * t + px * off, a.y + dy * t + (i > 0 && i < segs ? (Math.random() - 0.5) * 0.4 : 0), a.z + dz * t + pz * off));
    }
    const glow = new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    const core = new THREE.MeshBasicMaterial({ color: 0xf2fbff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
    const objs = [];
    const dir = new THREE.Vector3();
    for (let i = 0; i < pts.length - 1; i++) {
      dir.subVectors(pts[i + 1], pts[i]);
      const len = dir.length();
      dir.normalize();
      const mid = pts[i].clone().add(pts[i + 1]).multiplyScalar(0.5);
      for (const [mat, w] of [[glow, width * 0.5], [core, width * 0.18]]) {
        const s = new THREE.Mesh(this.cylGeo, mat);
        s.position.copy(mid);
        s.quaternion.setFromUnitVectors(UP, dir);
        s.scale.set(w, len, w);
        objs.push(s);
      }
    }
    const flash = makeGlowSprite(0x8fdcff, 1.6 * Math.max(1, width / 0.2));
    flash.position.set(b.x, b.y, b.z);
    objs.push(flash);
    this.add(objs, 0.22, (k) => {
      const f = k < 0.5 ? 1 : (1 - k) * 2;
      glow.opacity = 0.55 * f;
      core.opacity = f * (Math.random() < 0.2 ? 0.4 : 1);
      flash.material.opacity = 1 - k;
    }, [glow, core, flash.material]);
    this.particles.burst(b.x, b.y, b.z, 6, [0xbfeeff, 0x66ccff, 0xffffff], { speed: 3, size: 0.07, life: 0.3, up: 2 });
  }

  ring(x, z, radius, color, life = 0.5, y = 0.06) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const r = new RingMesh(mat);
    r.rotation.x = -Math.PI / 2; r.position.set(x, y, z);
    // 범위가 크면 둘레만으로는 알아보기 어려워 안쪽을 옅게 채움
    const fillA = Math.min(0.22, Math.max(0, (radius - 2.5) * 0.035));
    if (fillA > 0) {
      const fm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: fillA, blending: THREE.AdditiveBlending, depthWrite: false });
      const f = new THREE.Mesh(this.circleGeo, fm);
      f.rotation.x = -Math.PI / 2; f.position.set(x, y - 0.01, z);
      this.add([r, f], life, (k) => { const s = radius * (0.3 + 0.7 * k); r.scale.setScalar(s); f.scale.setScalar(s); mat.opacity = 0.8 * (1 - k); fm.opacity = fillA * (1 - k); }, [mat, fm]);
      return;
    }
    this.add([r], life, (k) => { r.scale.setScalar(radius * (0.3 + 0.7 * k)); mat.opacity = 0.8 * (1 - k); }, [mat]);
  }

  // 폭발하듯 피어오르는 안개 (부드러운 반투명 구름 여러 장이 퍼지며 사라짐)
  mist(x, z, radius, color = 0xeef8ff) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const mat = new THREE.SpriteMaterial({ map: getGlowTexture(), color, transparent: true, opacity: 0, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const v = radius * (0.9 + Math.random() * 0.8);
      const y0 = 0.25 + Math.random() * 0.4;
      sp.position.set(x, y0, z);
      const s0 = radius * (0.6 + Math.random() * 0.4);
      this.add([sp], 1.1 + Math.random() * 0.4, (k) => {
        const e = 1 - (1 - k) ** 2;
        sp.position.set(x + Math.cos(a) * v * e, y0 + e * 0.6, z + Math.sin(a) * v * e);
        sp.scale.setScalar(s0 * (1 + e * 1.4));
        mat.opacity = (k < 0.15 ? k / 0.15 : (1 - k) / 0.85) * 0.75;
      }, [mat]);
    }
  }

  splat(x, z, color, radius) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false });
    const s = new THREE.Mesh(this.circleGeo, mat);
    s.rotation.x = -Math.PI / 2; s.rotation.z = Math.random() * 6; s.position.set(x, 0.025 + Math.random() * 0.01, z);
    s.scale.set(radius * 1.5, radius * 1.1, 1);
    this.add([s], 1.4, (k) => { mat.opacity = 0.55 * (1 - k); }, [mat]);
  }
}
