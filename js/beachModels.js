// ─────────────────────────────────────────────
//  해변 몬스터 모델: 꽃게 · 소라게 (인스턴스용 합친 지오메트리) / 마타 · 만탄 (개별 모델)
//  모두 바닥(y=0) 기준, 가로 폭이 약 1 이 되도록 맞춤 (게임에서는 반지름 × 2 배로 키움)
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { paint, merge } from './models.js';

// 지오메트리를 폭 1, 바닥 y=0 으로 맞춤
function fitUnit(geo, width = 1) {
  geo.computeBoundingBox();
  const b = geo.boundingBox;
  const w = Math.max(b.max.x - b.min.x, b.max.z - b.min.z);
  const k = width / w;
  geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  geo.scale(k, k, k);
  geo.computeVertexNormals();
  return geo;
}

// ── 꽃게: 넓적한 붉은 몸통, 앞쪽 큰 집게 둘, 눈자루, 옆으로 뻗은 다리 (+z 가 앞, 옆(±x)으로 걸음) ──
export function crabGeometry() {
  const RED = 0xe8503a, DARK = 0xb8382a, LIGHT = 0xff8a6a;
  const parts = [];
  parts.push(paint(new THREE.SphereGeometry(0.4, 10, 7).scale(1.35, 0.55, 0.95).translate(0, 0.3, 0), RED, 0.05));
  parts.push(paint(new THREE.SphereGeometry(0.3, 8, 5).scale(1.2, 0.3, 0.8).translate(0, 0.42, 0.02), LIGHT, 0.05));   // 등껍질 무늬
  // 눈자루 + 눈
  for (const s of [-1, 1]) {
    parts.push(paint(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 5).translate(s * 0.13, 0.55, 0.22), DARK, 0.03));
    parts.push(paint(new THREE.SphereGeometry(0.07, 7, 5).translate(s * 0.13, 0.68, 0.22), 0xffffff, 0.02));
    parts.push(paint(new THREE.SphereGeometry(0.038, 6, 4).translate(s * 0.13, 0.69, 0.27), 0x1a1a24, 0.02));
  }
  // 집게: 팔 + 큰 집게 (위 · 아래 날)
  for (const s of [-1, 1]) {
    parts.push(paint(new THREE.CylinderGeometry(0.05, 0.06, 0.32, 5).rotateZ(Math.PI / 2).rotateY(s * 0.6).translate(s * 0.5, 0.28, 0.25), DARK, 0.04));
    parts.push(paint(new THREE.SphereGeometry(0.15, 8, 6).scale(1, 0.8, 1.3).translate(s * 0.66, 0.3, 0.42), RED, 0.05));
    parts.push(paint(new THREE.ConeGeometry(0.06, 0.2, 5).rotateX(Math.PI / 2).translate(s * 0.62, 0.36, 0.62), DARK, 0.04));
    parts.push(paint(new THREE.ConeGeometry(0.05, 0.16, 5).rotateX(Math.PI / 2).translate(s * 0.7, 0.24, 0.6), DARK, 0.04));
  }
  // 다리 3쌍 (옆으로 꺾여 뻗음)
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const z = 0.12 - k * 0.2;
    parts.push(paint(new THREE.CylinderGeometry(0.03, 0.035, 0.36, 4).rotateZ(s * 1.05).translate(s * 0.62, 0.3, z), DARK, 0.04));
    parts.push(paint(new THREE.CylinderGeometry(0.02, 0.03, 0.3, 4).rotateZ(s * 0.35).translate(s * 0.86, 0.12, z), DARK, 0.04));
  }
  return fitUnit(merge(parts), 1);
}

// ── 소라게: 나선형 소라 껍데기에 꽃게 다리 · 집게 · 눈자루가 삐져나옴 ──
export function hermitGeometry() {
  const SHELL = [0xf3d2b0, 0xe6b48a, 0xfbe4cc, 0xd99a74], RED = 0xe8503a, DARK = 0xb8382a;
  const parts = [];
  // 나선 껍데기: 위로 갈수록 작아지며 비틀린 고리들
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const r = 0.42 * (1 - t * 0.78);
    parts.push(paint(new THREE.TorusGeometry(r, r * 0.55, 6, 12).rotateX(Math.PI / 2).rotateY(i * 0.9).translate(Math.sin(i * 0.9) * 0.05, 0.3 + t * 0.62, -0.08 + Math.cos(i * 0.9) * 0.05), SHELL[i % 4], 0.05));
  }
  parts.push(paint(new THREE.ConeGeometry(0.08, 0.2, 6).translate(0, 1.02, -0.08), SHELL[0], 0.04));
  // 입구에서 삐져나온 몸 · 눈 · 집게 · 다리
  parts.push(paint(new THREE.SphereGeometry(0.22, 8, 6).scale(1.1, 0.7, 0.8).translate(0, 0.24, 0.3), RED, 0.05));
  for (const s of [-1, 1]) {
    parts.push(paint(new THREE.CylinderGeometry(0.03, 0.035, 0.2, 5).translate(s * 0.09, 0.4, 0.4), DARK, 0.03));
    parts.push(paint(new THREE.SphereGeometry(0.06, 7, 5).translate(s * 0.09, 0.52, 0.42), 0xffffff, 0.02));
    parts.push(paint(new THREE.SphereGeometry(0.032, 6, 4).translate(s * 0.09, 0.53, 0.47), 0x1a1a24, 0.02));
    parts.push(paint(new THREE.SphereGeometry(0.12, 8, 6).scale(1, 0.8, 1.3).translate(s * 0.24, 0.2, 0.5), RED, 0.05));
    for (let k = 0; k < 2; k++) parts.push(paint(new THREE.CylinderGeometry(0.03, 0.035, 0.34, 4).rotateZ(s * 1.0).translate(s * 0.34, 0.14, 0.32 - k * 0.16), DARK, 0.04));
  }
  return fitUnit(merge(parts), 1);
}

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, flatShading: true, ...o });

// 부드러운 빛
function glow(color, scale) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 32, 32);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  sp.scale.setScalar(scale);
  return sp;
}

// ── 만탄 / 마타: 동글동글한 흰 털 몸통 + 머리를 덮은 파란 가오리 두건 (큰 눈 · 볼 홍조),
//    뒤로 흘러내리는 가오리 꼬리, 머리 위 더듬이 (만탄: 앞으로 굽어 끝에 빛나는 구근 / 마타: 짧은 뿔) ──
export function createManta(baby = false) {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);
  const whiteMat = std({ color: 0xf8fbff, roughness: 0.9, flatShading: false });
  const blueMat = std({ color: 0x8fd2f2, roughness: 0.4, flatShading: false });
  const blueDeep = std({ color: 0x6bbde8, roughness: 0.45, flatShading: false });
  const mk = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; };
  // 몸통: 동그란 털 뭉치 (아래쪽에 몽글몽글한 털 + 짧은 발)
  const body = mk(new THREE.SphereGeometry(0.5, 24, 18).scale(1.05, 0.82, 1), whiteMat);
  body.position.set(0, 0.45, -0.02);
  root.add(body);
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    const tuft = mk(new THREE.SphereGeometry(0.15, 12, 9), whiteMat);
    tuft.position.set(Math.cos(a) * 0.42, 0.16, Math.sin(a) * 0.4);
    root.add(tuft);
  }
  const legs = [];
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.26, 0.14, sz * 0.24);
    const foot = mk(new THREE.SphereGeometry(0.11, 12, 9).scale(1, 0.75, 1.15).translate(0, -0.06, 0.02), whiteMat);
    pivot.add(foot);
    root.add(pivot);
    legs.push(pivot);
  }
  // 가오리 두건: 몸 위를 둥글게 덮고 앞쪽은 얼굴 위로 살짝 내려옴
  const hood = mk(new THREE.SphereGeometry(0.53, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.52).scale(1.1, 0.95, 1.12), blueMat);
  hood.position.set(0, 0.52, 0.04);
  hood.rotation.x = 0.22;
  root.add(hood);
  // 앞으로 둥글게 나온 가오리 주둥이
  const snout = mk(new THREE.SphereGeometry(0.3, 20, 14).scale(1.45, 0.62, 0.9), blueMat);
  snout.position.set(0, 0.64, 0.36);
  root.add(snout);
  // 양옆의 작은 가오리 지느러미
  const wings = [];
  for (const s of [-1, 1]) {
    const fin = mk(new THREE.SphereGeometry(0.3, 16, 10).scale(1, 0.14, 0.7), blueDeep);
    fin.position.set(s * 0.55, 0.62, -0.02);
    fin.rotation.z = s * 0.35;
    root.add(fin);
    wings.push(fin);
  }
  // 큰 눈 (반짝임 두 개) · 작은 입 · 볼 홍조
  for (const s of [-1, 1]) {
    const eye = mk(new THREE.SphereGeometry(0.135, 20, 14), std({ color: 0xffffff, roughness: 0.15, flatShading: false }));
    eye.position.set(s * 0.25, 0.66, 0.5);
    const iris = mk(new THREE.SphereGeometry(0.1, 18, 12), std({ color: 0x3a4660, roughness: 0.1, flatShading: false }));
    iris.position.set(s * 0.26, 0.655, 0.57);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    hl.position.set(s * 0.23, 0.7, 0.655);
    const hl2 = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    hl2.position.set(s * 0.29, 0.63, 0.66);
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8).scale(1.4, 0.65, 0.4), new THREE.MeshBasicMaterial({ color: 0xffa8bf, transparent: true, opacity: 0.85 }));
    blush.position.set(s * 0.36, 0.5, 0.5);
    root.add(eye, iris, hl, hl2, blush);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI).rotateZ(Math.PI), new THREE.MeshBasicMaterial({ color: 0x4a5a78 }));
  mouth.position.set(0, 0.5, 0.6);
  root.add(mouth);
  // 뒤로 흘러내리는 가오리 꼬리 (끝으로 갈수록 가늘게)
  const tailPts = baby
    ? [new THREE.Vector3(0, 0.78, -0.35), new THREE.Vector3(0.08, 0.66, -0.62), new THREE.Vector3(0.2, 0.5, -0.78)]
    : [new THREE.Vector3(0, 0.82, -0.35), new THREE.Vector3(0.1, 0.72, -0.75), new THREE.Vector3(0.32, 0.52, -1.05), new THREE.Vector3(0.6, 0.38, -1.2)];
  const tailCurve = new THREE.CatmullRomCurve3(tailPts);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 20, baby ? 0.09 : 0.12, 10);
  const tp = tailGeo.attributes.position, radial = 11;
  for (let i = 0; i < tp.count; i++) {
    const seg = Math.floor(i / radial) / 20;
    const c = tailCurve.getPoint(Math.min(1, seg));
    const k = 1 - seg * 0.85;
    tp.setXYZ(i, c.x + (tp.getX(i) - c.x) * k, c.y + (tp.getY(i) - c.y) * k * 0.55, c.z + (tp.getZ(i) - c.z) * k);   // 납작하게
  }
  tailGeo.computeVertexNormals();
  root.add(mk(tailGeo, blueMat));
  // 더듬이
  let bulb = null;
  if (baby) {
    for (const s of [-1, 1]) {   // 짧은 뿔처럼 솟은 더듬이
      const horn = mk(new THREE.ConeGeometry(0.055, 0.18, 10).translate(0, 0.09, 0), blueDeep);
      horn.position.set(s * 0.12, 0.98, 0.12); horn.rotation.set(0.35, 0, -s * 0.3);
      root.add(horn);
    }
  } else {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.97, 0.05), new THREE.Vector3(0, 1.32, 0.1), new THREE.Vector3(0, 1.45, 0.38), new THREE.Vector3(0, 1.32, 0.64)]);
    root.add(mk(new THREE.TubeGeometry(curve, 20, 0.032, 8), blueDeep));
    bulb = new THREE.Group();
    bulb.position.set(0, 1.26, 0.68);
    bulb.add(new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10).scale(0.9, 1.2, 0.9), new THREE.MeshStandardMaterial({ color: 0xfff6b0, emissive: 0xffd94a, emissiveIntensity: 1.3 })));
    bulb.add(glow(0xffe680, 0.6));
    root.add(bulb);
  }
  // 바닥 y=0, 몸통 폭이 1 이 되도록 (꼬리 · 더듬이 제외)
  const box = new THREE.Box3().setFromObject(body).union(new THREE.Box3().setFromObject(hood));
  const w = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
  root.scale.setScalar(1 / w);
  root.position.y = 0;
  return { group, root, legs, wings, bulb, body: { material: whiteMat }, kind: 'manta' };
}
