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

// ── 만탄 / 마타: 흰 털 몸통에 짧은 네 다리, 머리는 가오리 모양 (파란 망토처럼 덮음), 큰 눈 · 볼 홍조,
//    몸 뒤로 뻗은 가오리 날개, 머리 위 더듬이 (만탄: 끝에 빛나는 구근 / 마타: 짧은 뿔) ──
export function createManta(baby = false) {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);
  const whiteMat = std({ color: 0xf6f9ff, roughness: 0.85 });
  const blueMat = std({ color: 0x7cc6ee, roughness: 0.45 });
  const blueDark = std({ color: 0x4fa2d6, roughness: 0.5 });
  const mk = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; };
  // 몸통 (흰 털)
  const body = mk(new THREE.SphereGeometry(0.5, 14, 10).scale(1.05, 0.78, 1.15), whiteMat);
  body.position.set(0, 0.5, -0.05);
  root.add(body);
  for (let k = 0; k < 6; k++) {   // 털 뭉치
    const tuft = mk(new THREE.SphereGeometry(0.16, 7, 5), whiteMat);
    const a = (k / 6) * Math.PI * 2;
    tuft.position.set(Math.cos(a) * 0.42, 0.28 + (k % 2) * 0.08, Math.sin(a) * 0.45);
    root.add(tuft);
  }
  // 다리
  const legs = [];
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const leg = mk(new THREE.CylinderGeometry(0.1, 0.12, 0.28, 7).translate(0, -0.14, 0), whiteMat);
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.3, 0.26, -0.05 + sz * 0.28);
    pivot.add(leg);
    root.add(pivot);
    legs.push(pivot);
  }
  // 가오리 머리: 몸 앞 위를 덮는 넓적한 파란 망토 (가운데가 볼록, 앞쪽 끝이 둥글게)
  const capeGeo = new THREE.SphereGeometry(0.5, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55).scale(1.25, 0.55, 1.1);
  const cape = mk(capeGeo, blueMat);
  cape.position.set(0, 0.72, 0.12);
  cape.rotation.x = 0.18;
  root.add(cape);
  // 가오리 입 (주둥이 아래 선) 과 볼 홍조
  const mouth = mk(new THREE.TorusGeometry(0.12, 0.018, 4, 10, Math.PI).rotateZ(Math.PI), std({ color: 0x3a4a6a }));
  mouth.position.set(0, 0.6, 0.62);
  root.add(mouth);
  // 큰 눈 (옆쪽)
  for (const s of [-1, 1]) {
    const eyeW = mk(new THREE.SphereGeometry(0.13, 12, 9), std({ color: 0xffffff, roughness: 0.2 }));
    eyeW.position.set(s * 0.36, 0.8, 0.42);
    const pupil = mk(new THREE.SphereGeometry(0.085, 10, 8), std({ color: 0x26324a, roughness: 0.15 }));
    pupil.position.set(s * 0.4, 0.8, 0.5);
    const hl = mk(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    hl.position.set(s * 0.39, 0.84, 0.57);
    const blush = mk(new THREE.SphereGeometry(0.07, 8, 6).scale(1.3, 0.6, 0.4), new THREE.MeshBasicMaterial({ color: 0xffb2c4, transparent: true, opacity: 0.8 }));
    blush.position.set(s * 0.33, 0.62, 0.55);
    root.add(eyeW, pupil, hl, blush);
  }
  // 몸 뒤로 뻗은 가오리 날개 (꼬리처럼 길게)
  // (모양을 바닥면에 그린 뒤 눕힘: 위쪽(+y) 이 몸 뒤쪽(-z) 으로)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, -0.1); wingShape.quadraticCurveTo(0.5, 0, 0.95, 0.55); wingShape.quadraticCurveTo(0.45, 0.45, 0, 0.35);
  const wingGeo = new THREE.ShapeGeometry(wingShape, 8).rotateX(-Math.PI / 2);
  const wingMat = std({ color: 0x7cc6ee, side: THREE.DoubleSide, roughness: 0.45 });
  const wings = [];
  for (const s of [-1, 1]) {
    const w = mk(wingGeo, wingMat);
    const k = baby ? 0.7 : 1.2;
    w.position.set(s * 0.3, 0.72, -0.15);
    w.scale.set(s * k, 1, k);
    w.rotation.z = s * 0.22;   // 살짝 들림
    root.add(w);
    wings.push(w);
  }
  const tail = mk(new THREE.ConeGeometry(0.08, baby ? 0.6 : 1.3, 6).rotateX(-Math.PI / 2 - 0.2).translate(0, 0, -(baby ? 0.3 : 0.65)), blueDark);
  tail.position.set(0, 0.62, -0.5);
  root.add(tail);
  // 더듬이
  let bulb = null;
  if (baby) {
    for (const s of [-1, 1]) {   // 짧은 뿔
      const horn = mk(new THREE.ConeGeometry(0.06, 0.2, 6), blueDark);
      horn.position.set(s * 0.14, 1.02, 0.1); horn.rotation.z = -s * 0.25;
      root.add(horn);
    }
  } else {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.95, 0), new THREE.Vector3(0, 1.35, 0.05), new THREE.Vector3(0, 1.55, 0.35), new THREE.Vector3(0, 1.45, 0.7)]);
    root.add(mk(new THREE.TubeGeometry(curve, 16, 0.04, 6), blueMat));
    bulb = new THREE.Group();
    bulb.position.set(0, 1.42, 0.74);
    bulb.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8).scale(1, 1.25, 1), new THREE.MeshStandardMaterial({ color: 0xfff1a0, emissive: 0xffd94a, emissiveIntensity: 1.2 })));
    bulb.add(glow(0xffe680, 0.7));
    root.add(bulb);
  }
  // 바닥 y=0, 폭 약 1 로 맞춤 (날개 · 꼬리 포함)
  const box = new THREE.Box3().setFromObject(root);
  const w = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
  root.scale.setScalar(1 / w);
  root.position.y = -box.min.y / w;
  return { group, root, legs, wings, bulb, body: { material: whiteMat }, kind: 'manta' };
}
