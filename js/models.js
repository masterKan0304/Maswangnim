import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ─────────────────────────────────────────────
//  로우폴리 지오메트리 헬퍼
// ─────────────────────────────────────────────
function hash3(x, y, z, seed) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 17.13) * 43758.5453;
  return h - Math.floor(h);
}

// 같은 위치의 정점은 같은 오프셋을 받으므로 면이 갈라지지 않음
export function jitter(geo, amt, seed = 1) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const kx = +x.toFixed(4), ky = +y.toFixed(4), kz = +z.toFixed(4);
    p.setXYZ(i,
      x + (hash3(kx, ky, kz, seed) - 0.5) * amt,
      y + (hash3(kx, ky, kz, seed + 1) - 0.5) * amt,
      z + (hash3(kx, ky, kz, seed + 2) - 0.5) * amt);
  }
  return geo;
}

// 면 단위 색 (약간의 명도 변화) → flat 로우폴리 룩
export function paint(geo, color, variance = 0.07) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const name of Object.keys(g.attributes)) if (name !== 'position') g.deleteAttribute(name);
  const c = new THREE.Color(color);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let f = 0; f < n; f += 3) {
    const v = 1 + (Math.random() - 0.5) * variance * 2;
    for (let k = 0; k < 3 && f + k < n; k++) {
      arr[(f + k) * 3] = c.r * v; arr[(f + k) * 3 + 1] = c.g * v; arr[(f + k) * 3 + 2] = c.b * v;
    }
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  g.computeVertexNormals();
  return g;
}

const at = (geo, x, y, z) => geo.translate(x, y, z);
export const merge = (list) => mergeGeometries(list, false);

// ─────────────────────────────────────────────
//  자연 경관
// ─────────────────────────────────────────────
export function pineTreeGeo() {
  return merge([
    paint(at(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6), 0, 0.45, 0), 0x7a5236),
    paint(jitter(at(new THREE.ConeGeometry(1.05, 1.3, 7), 0, 1.3, 0), 0.08, 3), 0x2f7d45),
    paint(jitter(at(new THREE.ConeGeometry(0.8, 1.15, 7), 0, 1.95, 0), 0.08, 5), 0x378c4c),
    paint(jitter(at(new THREE.ConeGeometry(0.52, 0.95, 7), 0, 2.6, 0), 0.06, 7), 0x43a057),
  ]);
}

export function roundTreeGeo(leaf = 0x5dbb4a, leaf2 = 0x4fa843, leaf3 = 0x6cc955, trunk = 0x7a5236) {
  return merge([
    paint(at(new THREE.CylinderGeometry(0.13, 0.2, 1.2, 6), 0, 0.6, 0), trunk),
    paint(jitter(at(new THREE.IcosahedronGeometry(0.95, 0), 0, 1.85, 0), 0.22, 11), leaf),
    paint(jitter(at(new THREE.IcosahedronGeometry(0.62, 0), 0.55, 1.45, 0.2), 0.16, 13), leaf2),
    paint(jitter(at(new THREE.IcosahedronGeometry(0.58, 0), -0.45, 1.55, -0.3), 0.16, 17), leaf3),
  ]);
}

export function bushGeo() {
  return merge([
    paint(jitter(at(new THREE.IcosahedronGeometry(0.45, 0), 0, 0.32, 0), 0.12, 21), 0x4ea443),
    paint(jitter(at(new THREE.IcosahedronGeometry(0.34, 0), 0.38, 0.24, 0.1), 0.1, 23), 0x5cb54c),
    paint(jitter(at(new THREE.IcosahedronGeometry(0.3, 0), -0.32, 0.22, -0.12), 0.1, 29), 0x45963c),
  ]);
}

export function rockGeo(seed = 1) {
  const g = new THREE.DodecahedronGeometry(0.6, 0);
  jitter(g, 0.28, seed);
  g.scale(1, 0.68, 1);
  g.translate(0, 0.25, 0);
  return paint(g, 0x8e9299, 0.1);
}

export function mushroomGeo() {
  return merge([
    paint(at(new THREE.CylinderGeometry(0.05, 0.07, 0.22, 6), 0, 0.11, 0), 0xf3ead8),
    paint(at(new THREE.SphereGeometry(0.17, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2), 0, 0.2, 0), 0xde4b41),
    paint(at(new THREE.BoxGeometry(0.04, 0.02, 0.04), 0.07, 0.34, 0.05), 0xffffff, 0),
    paint(at(new THREE.BoxGeometry(0.04, 0.02, 0.04), -0.06, 0.33, -0.06), 0xffffff, 0),
  ]);
}

export function stumpGeo() {
  return merge([
    paint(jitter(new THREE.CylinderGeometry(0.32, 0.4, 0.35, 7).translate(0, 0.175, 0), 0.04, 31), 0x7a5236),
    paint(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 7).translate(0, 0.36, 0), 0xd9b37c),
  ]);
}

export function grassTuftGeo() {
  const blades = [];
  const cols = [0x5fae3f, 0x6dbb46, 0x7cc653, 0x58a33a];
  for (let i = 0; i < 5; i++) {
    const h = 0.22 + Math.random() * 0.18;
    const g = new THREE.ConeGeometry(0.045, h, 3);
    g.translate(0, h / 2, 0);
    g.rotateZ((Math.random() - 0.5) * 0.7);
    g.rotateX((Math.random() - 0.5) * 0.7);
    g.translate((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2);
    blades.push(paint(g, cols[i % cols.length], 0.05));
  }
  return merge(blades);
}

export function flowerStemGeo() {
  return merge([
    paint(new THREE.CylinderGeometry(0.012, 0.015, 0.28, 3).translate(0, 0.14, 0), 0x4f9a36),
    paint(new THREE.BoxGeometry(0.08, 0.01, 0.04).rotateY(0.6).translate(0.03, 0.08, 0), 0x5fae3f),
  ]);
}

export function flowerHeadGeo() {
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    petals.push(paint(new THREE.IcosahedronGeometry(0.045, 0).scale(1, 0.5, 1).translate(Math.cos(a) * 0.05, 0.29, Math.sin(a) * 0.05), 0xffffff, 0.04));
  }
  petals.push(paint(new THREE.IcosahedronGeometry(0.035, 0).translate(0, 0.3, 0), 0xffe070, 0));
  return merge(petals);
}

// ─────────────────────────────────────────────
//  플레이어: 머리 위에 새싹 잎이 난 동글동글한 초록 몸통 + 짧은 팔다리
// ─────────────────────────────────────────────
const BODY = 0x6fcf5a, BODY_DARK = 0x58b546, BODY_LIGHT = 0x8fe070, LEAF = 0x5cc048, LEAF_DARK = 0x449a35;

// 아래로 갈수록 살짝 퍼지는 물방울형 몸통
function sproutBodyGeo() {
  const g = new THREE.SphereGeometry(0.5, 16, 12);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = (0.5 - y) / 1.0;                 // 위 0 → 아래 1
    const widen = 0.9 + t * 0.22;
    x *= widen; z *= widen * 0.92;
    y *= 1.08;
    if (y < -0.38) y = -0.38 - (y + 0.38) * 0.3; // 바닥을 조금 평평하게
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  // 위쪽은 밝게, 아래쪽은 어둡게 (면 단위 색)
  const ng = g.toNonIndexed();
  const pos = ng.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const top = new THREE.Color(BODY_LIGHT), mid = new THREE.Color(BODY), low = new THREE.Color(BODY_DARK), c = new THREE.Color();
  for (let f = 0; f < pos.count; f += 3) {
    const y = (pos.getY(f) + pos.getY(f + 1) + pos.getY(f + 2)) / 3;
    if (y > 0.15) c.copy(mid).lerp(top, Math.min(1, (y - 0.15) / 0.35));
    else c.copy(mid).lerp(low, Math.min(1, (0.15 - y) / 0.5));
    const v = 1 + (Math.random() - 0.5) * 0.06;
    for (let k = 0; k < 3; k++) { cols[(f + k) * 3] = c.r * v; cols[(f + k) * 3 + 1] = c.g * v; cols[(f + k) * 3 + 2] = c.b * v; }
  }
  ng.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  ng.computeVertexNormals();
  return ng;
}

// 잎사귀 한 장 (끝이 뾰족한 납작한 타원)
function leafGeo() {
  const g = new THREE.SphereGeometry(0.5, 8, 6);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = (y + 0.5);                          // 0(밑동) → 1(끝)
    const w = Math.sin(Math.min(1, t) * Math.PI) * (1 - t * 0.35);
    p.setXYZ(i, x * w * 0.36, y, z * w * 0.1 + Math.sin(t * Math.PI) * 0.04);
  }
  g.translate(0, 0.5, 0);
  return paint(g, LEAF, 0.05);
}

export function createPlayer() {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);
  const std = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.65, flatShading: true, ...opts });
  const bodyMat = std({ vertexColors: true });
  const limbMat = std({ color: BODY_DARK });
  const mk = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; };

  // 다리 (짧고 뭉툭)
  const legs = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.2, 0.2, 0.02);
    const leg = mk(new THREE.SphereGeometry(0.13, 8, 6).scale(1, 1.15, 1.1), limbMat);
    leg.position.y = -0.1;
    pivot.add(leg);
    root.add(pivot);
    legs.push(pivot);
  }

  // 몸통
  const body = mk(sproutBodyGeo(), bodyMat);
  body.position.y = 0.66;
  root.add(body);

  // 팔 (몸통 옆 작은 혹)
  const arms = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.5, 0.58, 0.04);
    const arm = mk(new THREE.SphereGeometry(0.11, 8, 6).scale(1, 1.3, 1), limbMat);
    arm.position.set(sx * 0.03, -0.1, 0);
    pivot.add(arm);
    root.add(pivot);
    arms.push(pivot);
  }

  // 얼굴: 작은 점 눈 + 세로로 긴 빨간 입
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1d1b2a });
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 5), eyeMat);
    eye.position.set(sx * 0.17, 0.8, 0.43);
    root.add(eye);
  }
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6).scale(0.85, 1.6, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xd9452e, emissive: 0x5a1208, roughness: 0.5 }));
  mouth.position.set(0.02, 0.66, 0.47);
  mouth.rotation.z = 0.1;
  root.add(mouth);

  // 머리 위 새싹 (잎 두 장) — headPivot 으로 살랑살랑 흔들림
  const headPivot = new THREE.Group();
  headPivot.position.y = 1.18;
  const stem = mk(paint(new THREE.CylinderGeometry(0.025, 0.04, 0.14, 5).translate(0, 0.07, 0), LEAF_DARK, 0), std({ vertexColors: true }));
  const leafMat = std({ vertexColors: true, side: THREE.DoubleSide });
  const leafA = mk(leafGeo(), leafMat);
  leafA.position.set(0, 0.1, 0);
  leafA.scale.setScalar(0.62);
  leafA.rotation.set(0.2, 0.4, 0.75);
  const leafB = mk(leafGeo(), leafMat);
  leafB.position.set(0, 0.12, 0);
  leafB.scale.setScalar(0.74);
  leafB.rotation.set(-0.15, -0.3, -0.55);
  headPivot.add(stem, leafA, leafB);
  root.add(headPivot);

  const materials = [];
  group.traverse((o) => {
    if (o.isMesh && o.material.emissive) materials.push(o.material);
  });
  return { group, root, legs, arms, headPivot, materials: [...new Set(materials)] };
}

// ─────────────────────────────────────────────
//  슬라임
// ─────────────────────────────────────────────
export function slimeBodyGeometry() {
  const g = new THREE.SphereGeometry(0.5, 12, 9);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    y *= 0.82;
    if (y < -0.22) {
      const k = -0.22 - y;
      y = -0.22 - k * 0.25;
      x *= 1 + k * 0.7; z *= 1 + k * 0.7;
    }
    p.setXYZ(i, x, y, z);
  }
  g.computeBoundingBox();
  g.translate(0, -g.boundingBox.min.y, 0);
  g.computeVertexNormals();
  return g;
}

export function slimeFaceGeometry() {
  const D = 0x1d1b2a, W = 0xffffff;
  return merge([
    paint(new THREE.BoxGeometry(0.09, 0.15, 0.05).translate(-0.13, 0.4, 0.46), D, 0),
    paint(new THREE.BoxGeometry(0.09, 0.15, 0.05).translate(0.13, 0.4, 0.46), D, 0),
    paint(new THREE.BoxGeometry(0.035, 0.045, 0.02).translate(-0.145, 0.44, 0.49), W, 0),
    paint(new THREE.BoxGeometry(0.035, 0.045, 0.02).translate(0.115, 0.44, 0.49), W, 0),
    paint(new THREE.BoxGeometry(0.08, 0.025, 0.03).translate(0, 0.3, 0.465), D, 0),
    paint(new THREE.IcosahedronGeometry(0.07, 0).scale(1.2, 0.55, 1).translate(-0.2, 0.6, 0.22), W, 0),
    paint(new THREE.IcosahedronGeometry(0.035, 0).scale(1, 0.6, 1).translate(-0.08, 0.66, 0.2), W, 0),
  ]);
}

export function createKingSlime() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(slimeBodyGeometry(),
    new THREE.MeshStandardMaterial({ color: 0x9b5cf0, roughness: 0.3, flatShading: true }));
  body.castShadow = true;
  const face = new THREE.Mesh(slimeFaceGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true }));
  const crownParts = [paint(new THREE.CylinderGeometry(0.2, 0.22, 0.09, 8, 1, true).translate(0, 0.045, 0), 0xf5c542, 0.05)];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    crownParts.push(paint(new THREE.ConeGeometry(0.05, 0.12, 4).translate(Math.cos(a) * 0.19, 0.15, Math.sin(a) * 0.19), 0xf5c542, 0.05));
    crownParts.push(paint(new THREE.IcosahedronGeometry(0.028, 0).translate(Math.cos(a) * 0.215, 0.05, Math.sin(a) * 0.215), i % 2 ? 0xe23b5a : 0x3bc3e2, 0));
  }
  const crown = new THREE.Mesh(merge(crownParts),
    new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.6, roughness: 0.3, flatShading: true, side: THREE.DoubleSide }));
  crown.position.y = 0.72;
  crown.rotation.z = 0.12;
  crown.castShadow = true;
  group.add(body, face, crown);
  return { group, body, materials: [body.material] };
}

// 정예 슬라임 (중간 보스): 파란 몸통 + 뿔 + 화난 눈썹
export function createEliteSlime() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(slimeBodyGeometry(),
    new THREE.MeshStandardMaterial({ color: 0x3f8cff, roughness: 0.3, flatShading: true }));
  body.castShadow = true;
  const face = new THREE.Mesh(slimeFaceGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true }));
  const parts = [];
  for (const sx of [-1, 1]) {
    parts.push(paint(new THREE.ConeGeometry(0.07, 0.24, 5).rotateZ(-sx * 0.45).translate(sx * 0.2, 0.78, 0.05), 0xf2ead8, 0.05));
    parts.push(paint(new THREE.BoxGeometry(0.13, 0.03, 0.03).rotateZ(sx * 0.45).translate(sx * 0.13, 0.5, 0.465), 0x1d1b2a, 0));
  }
  const deco = new THREE.Mesh(merge(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, flatShading: true }));
  deco.castShadow = true;
  group.add(body, face, deco);
  return { group, body, materials: [body.material] };
}
