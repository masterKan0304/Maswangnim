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
//  플레이어 (마크풍 1.5등신)
// ─────────────────────────────────────────────
const SKIN = '#f6cfae', SKIN2 = '#e8b58f', HAIR = '#6b4226', HAIR2 = '#553219', HAIR_HL = '#8c5c37';

function pixelTex(draw, size = 16) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const r = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  draw(r);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function headMaterials() {
  const front = pixelTex((r) => {
    r(0, 0, 16, 16, SKIN);
    r(0, 0, 16, 5, HAIR);
    r(3, 1, 4, 1, HAIR_HL); r(9, 2, 3, 1, HAIR_HL);
    // 앞머리
    r(0, 5, 4, 1, HAIR); r(6, 5, 3, 1, HAIR); r(11, 5, 5, 1, HAIR);
    r(0, 6, 2, 1, HAIR); r(7, 6, 1, 1, HAIR); r(13, 6, 3, 1, HAIR);
    // 옆머리
    r(0, 5, 2, 7, HAIR); r(14, 5, 2, 7, HAIR); r(0, 12, 1, 2, HAIR2); r(15, 12, 1, 2, HAIR2);
    // 눈
    r(4, 8, 2, 3, '#2a2140'); r(10, 8, 2, 3, '#2a2140');
    r(4, 8, 1, 1, '#ffffff'); r(10, 8, 1, 1, '#ffffff');
    r(5, 10, 1, 1, '#4b3a7a'); r(11, 10, 1, 1, '#4b3a7a');
    // 볼터치, 입
    r(2, 11, 2, 1, '#f4a0a0'); r(12, 11, 2, 1, '#f4a0a0');
    r(7, 12, 2, 1, '#b35d55');
  });
  const side = pixelTex((r) => {
    r(0, 0, 16, 16, SKIN);
    r(0, 0, 16, 9, HAIR);
    r(0, 9, 5, 5, HAIR); r(11, 9, 5, 5, HAIR);
    r(2, 2, 5, 1, HAIR_HL);
    r(7, 10, 2, 3, SKIN2);
  });
  const back = pixelTex((r) => {
    r(0, 0, 16, 16, HAIR);
    r(0, 14, 16, 2, SKIN);
    r(3, 3, 4, 1, HAIR_HL); r(9, 6, 4, 1, HAIR_HL);
    r(0, 12, 16, 2, HAIR2);
  });
  const top = pixelTex((r) => {
    r(0, 0, 16, 16, HAIR);
    r(3, 3, 5, 2, HAIR_HL); r(9, 9, 4, 2, HAIR_HL); r(6, 12, 3, 1, HAIR2);
  });
  const bottom = pixelTex((r) => r(0, 0, 16, 16, SKIN2));
  const m = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.85 });
  // +x, -x, +y, -y, +z(앞), -z(뒤)
  return [m(side), m(side), m(top), m(bottom), m(front), m(back)];
}

const box = (w, h, d, color) => new THREE.Mesh(
  new THREE.BoxGeometry(w, h, d),
  new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));

export function createPlayer() {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);

  const HEAD = 0.74, bodyH = 0.3, bodyW = 0.48, bodyD = 0.34, legH = 0.2, legW = 0.2, armH = 0.3, armW = 0.14;
  const ROBE = 0x4a6fe3, ROBE2 = 0x3a58bb, PANTS = 0x2e3558, SHOE = 0x3a2a1e;

  const mk = (m) => { m.castShadow = true; return m; };

  // 다리
  const legs = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.105, legH, 0);
    const leg = mk(box(legW, legH, legW, PANTS)); leg.position.y = -legH / 2 + 0.02;
    const shoe = mk(box(legW + 0.02, 0.07, legW + 0.05, SHOE)); shoe.position.set(0, -legH + 0.035, 0.02);
    pivot.add(leg, shoe);
    root.add(pivot);
    legs.push(pivot);
  }

  // 몸통
  const body = mk(box(bodyW, bodyH, bodyD, ROBE)); body.position.y = legH + bodyH / 2;
  const hem = mk(box(bodyW + 0.03, 0.07, bodyD + 0.03, ROBE2)); hem.position.y = legH + 0.035;
  const belt = mk(box(bodyW + 0.02, 0.045, bodyD + 0.02, 0x6b4a2b)); belt.position.y = legH + 0.1;
  const buckle = box(0.07, 0.05, 0.02, 0xffd45a); buckle.position.set(0, legH + 0.1, bodyD / 2 + 0.015);
  root.add(body, hem, belt, buckle);

  // 스카프
  const scarf = mk(box(bodyW + 0.06, 0.07, bodyD + 0.06, 0xe04848)); scarf.position.y = legH + bodyH - 0.01;
  const tail = mk(box(0.1, 0.16, 0.04, 0xe04848)); tail.position.set(0.1, legH + bodyH - 0.1, -bodyD / 2 - 0.04);
  root.add(scarf, tail);

  // 팔
  const arms = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * (bodyW / 2 + armW / 2), legH + bodyH - 0.02, 0);
    const sleeve = mk(box(armW, armH * 0.65, armW, ROBE)); sleeve.position.y = -armH * 0.325;
    const hand = mk(box(armW - 0.01, armH * 0.35, armW - 0.01, 0xf6cfae)); hand.position.y = -armH * 0.82;
    pivot.add(sleeve, hand);
    root.add(pivot);
    arms.push(pivot);
  }

  // 머리
  const headPivot = new THREE.Group();
  headPivot.position.y = legH + bodyH;
  const head = new THREE.Mesh(new THREE.BoxGeometry(HEAD, HEAD, HEAD), headMaterials());
  head.castShadow = true;
  head.position.y = HEAD / 2 - 0.01;
  // 더듬이 머리카락
  const ahoge = mk(box(0.06, 0.14, 0.06, 0x6b4226)); ahoge.position.set(0.05, HEAD + 0.05, 0.05); ahoge.rotation.z = -0.4;
  headPivot.add(head, ahoge);
  root.add(headPivot);

  const materials = [];
  group.traverse((o) => {
    if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => materials.push(m));
  });

  return { group, root, legs, arms, headPivot, materials };
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
