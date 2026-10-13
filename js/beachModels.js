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

// ── 만탄 / 마타 (참고 그림): 흰 털 몸통 + 짧고 굵은 흰 다리 4개, 머리부터 등까지 덮은 파란 가오리 망토,
//    망토는 등 뒤로 길게 이어져 치맛자락처럼 바닥에 끌림. 앞으로 둥글게 내려온 주둥이, 옆의 큰 은빛 눈 · 볼 홍조,
//    머리 위에서 앞으로 휘어진 더듬이 끝에 늘어진 노란 구근 (마타: 짧은 뿔, 짧은 자락) ──
export function createManta(baby = false) {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);
  const soft = (o) => new THREE.MeshStandardMaterial({ roughness: 0.55, ...o });
  const whiteMat = soft({ color: 0xf8fbff, roughness: 0.9 });
  const blueMat = soft({ color: 0x8fd2f2, roughness: 0.35 });
  const mk = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; };
  // 몸통 (가슴 쪽이 볼록한 흰 털)
  const body = mk(new THREE.SphereGeometry(0.5, 28, 20).scale(0.95, 0.8, 1.05), whiteMat);
  body.position.set(0, 0.42, 0);
  root.add(body);
  const chest = mk(new THREE.SphereGeometry(0.34, 24, 16).scale(1.1, 0.9, 0.8), whiteMat);
  chest.position.set(0, 0.32, 0.3);
  root.add(chest);
  // 짧고 굵은 다리 4개
  const legs = [];
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.27, 0.24, sz * 0.24);
    const leg = mk(new THREE.CapsuleGeometry(0.1, 0.14, 6, 12).translate(0, -0.12, 0), whiteMat);
    pivot.add(leg);
    root.add(pivot);
    legs.push(pivot);
  }
  // 가오리 망토: 머리 위를 덮는 둥근 덮개
  const head = mk(new THREE.SphereGeometry(0.5, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.55).scale(1, 0.85, 1.15), blueMat);
  head.position.set(0, 0.6, 0.08);
  head.rotation.x = 0.25;
  root.add(head);
  // 앞으로 둥글게 내려와 얼굴을 덮는 주둥이 (아래로 살짝 처짐)
  const snout = mk(new THREE.SphereGeometry(0.32, 26, 18).scale(1.25, 0.7, 1), blueMat);
  snout.position.set(0, 0.6, 0.42);
  snout.rotation.x = 0.35;
  root.add(snout);
  // 등 뒤로 길게 이어져 바닥에 끌리는 자락 (넓적하고 끝으로 갈수록 가늘게)
  const L = baby ? 0.55 : 1;
  const pts = [
    new THREE.Vector3(0, 0.86, 0.05), new THREE.Vector3(0, 0.82, -0.3), new THREE.Vector3(0, 0.6, -0.6),
    new THREE.Vector3(0.02, 0.22, -0.6 - 0.5 * L), new THREE.Vector3(0.1, 0.05, -0.6 - 1.0 * L), new THREE.Vector3(0.28, 0.03, -0.6 - 1.55 * L),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const SEG = 40, RAD = 14;
  const trainGeo = new THREE.TubeGeometry(curve, SEG, 1, RAD, false);
  const tp = trainGeo.attributes.position;
  for (let i = 0; i < tp.count; i++) {
    const t = Math.floor(i / (RAD + 1)) / SEG;
    const c = curve.getPoint(t);
    const w = 0.5 * (1 - t * 0.72);                 // 폭: 머리 쪽 넓게 → 끝 가늘게
    const th = 0.16 * (1 - t * 0.6);                // 두께
    const ox = tp.getX(i) - c.x, oy = tp.getY(i) - c.y, oz = tp.getZ(i) - c.z;
    // 단면을 넓적한 타원으로: 옆(x)은 넓게, 나머지는 얇게
    tp.setXYZ(i, c.x + ox * w, c.y + oy * th, c.z + oz * th);
  }
  trainGeo.computeVertexNormals();
  const train = mk(trainGeo, blueMat);
  root.add(train);
  // 큰 은빛 눈 (옆쪽, 망토 가장자리 아래) · 볼 홍조 · 흰 턱
  const pupils = [];
  for (const s of [-1, 1]) {
    const eye = mk(new THREE.SphereGeometry(0.13, 22, 16), soft({ color: 0xe9eef5, roughness: 0.12, metalness: 0.2 }));
    eye.position.set(s * 0.36, 0.56, 0.36);
    const pupil = mk(new THREE.SphereGeometry(0.075, 18, 12), soft({ color: 0x2e3444, roughness: 0.1 }));
    pupil.position.set(s * 0.42, 0.56, 0.42);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    hl.position.set(s * 0.43, 0.6, 0.47);
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8).scale(1.3, 0.6, 0.5), new THREE.MeshBasicMaterial({ color: 0xffb0c4, transparent: true, opacity: 0.85 }));
    blush.position.set(s * 0.33, 0.4, 0.46);
    root.add(eye, pupil, hl, blush);
    pupils.push(pupil);
  }
  // 더듬이
  let bulb = null;
  if (baby) {
    for (const s of [-1, 1]) {
      const horn = mk(new THREE.ConeGeometry(0.06, 0.2, 12).translate(0, 0.1, 0), blueMat);
      horn.position.set(s * 0.13, 0.98, 0.2); horn.rotation.set(0.4, 0, -s * 0.3);
      root.add(horn);
    }
  } else {
    const ac = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.98, 0.15), new THREE.Vector3(0, 1.32, 0.25), new THREE.Vector3(0, 1.42, 0.62), new THREE.Vector3(0, 1.2, 0.95)]);
    const ag = new THREE.TubeGeometry(ac, 24, 0.07, 10);
    const ap = ag.attributes.position;
    for (let i = 0; i < ap.count; i++) {   // 끝으로 갈수록 가늘게
      const t = Math.floor(i / 11) / 24, c = ac.getPoint(t), k = 1 - t * 0.6;
      ap.setXYZ(i, c.x + (ap.getX(i) - c.x) * k, c.y + (ap.getY(i) - c.y) * k, c.z + (ap.getZ(i) - c.z) * k);
    }
    ag.computeVertexNormals();
    root.add(mk(ag, blueMat));
    bulb = new THREE.Group();
    bulb.position.set(0, 1.08, 0.98);
    // 아래로 늘어진 물방울 모양 구근
    bulb.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12).scale(1, 1.3, 1).translate(0, -0.04, 0), new THREE.MeshStandardMaterial({ color: 0xfff3a8, emissive: 0xffd94a, emissiveIntensity: 1.3 })));
    bulb.add(glow(0xffe680, 0.65));
    root.add(bulb);
  }
  // 바닥 y=0, 몸통 · 머리 폭이 1 이 되도록 (자락 · 더듬이 제외)
  const box = new THREE.Box3().setFromObject(body).union(new THREE.Box3().setFromObject(head));
  const w = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
  root.scale.setScalar(1 / w);
  blueMat.userData.base = blueMat.color.getHex();
  return { group, root, legs, wings: [], train, bulb, body: { material: whiteMat }, blueMats: [blueMat], pupils, kind: 'manta' };
}
