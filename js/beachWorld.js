// ─────────────────────────────────────────────
//  해변 맵: 모래사장 + 조수 웅덩이 + (남 · 동쪽 울타리 너머) 바다, 야자수 · 바위 · 조개 · 불가사리 · 해초
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { WORLD_HALF } from './config.js';
import { paint, jitter, merge, rockGeo } from './models.js';

const H = WORLD_HALF;
const rand = (a, b) => a + Math.random() * (b - a);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// 야자수: 휘어 올라간 마디 줄기 + 늘어진 잎 + 코코넛
function palmGeo() {
  const parts = [];
  let x = 0, y = 0;
  const lean = rand(0.05, 0.12);
  for (let i = 0; i < 7; i++) {
    const r = 0.16 - i * 0.012, h = 0.42;
    parts.push(paint(new THREE.CylinderGeometry(r * 0.92, r, h, 7).translate(x, y + h / 2, 0), i % 2 ? 0x9a7148 : 0x8a6238, 0.05));
    parts.push(paint(new THREE.CylinderGeometry(r * 1.04, r * 1.04, 0.05, 7).translate(x, y + h - 0.02, 0), 0x6e4a2a, 0.04));
    y += h * 0.98; x += lean * (1 + i * 0.4);
  }
  const top = new THREE.Vector3(x, y, 0);
  const leafCols = [0x3f9a3a, 0x4fb04a, 0x5cbf52, 0x358a33];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + rand(-0.2, 0.2);
    const len = rand(1.3, 1.7);
    const leaf = new THREE.SphereGeometry(0.5, 8, 4).scale(len, 0.06, 0.32);
    leaf.translate(len * 0.5, 0, 0);
    leaf.rotateZ(-rand(0.35, 0.65));   // 아래로 늘어짐
    leaf.rotateY(a);
    leaf.translate(top.x, top.y + 0.05, top.z);
    parts.push(paint(leaf, leafCols[k % 4], 0.08));
  }
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    parts.push(paint(new THREE.SphereGeometry(0.11, 7, 5).translate(top.x + Math.cos(a) * 0.14, top.y - 0.12, top.z + Math.sin(a) * 0.14), 0x6a4a28, 0.06));
  }
  return merge(parts);
}

function shellGeo() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    const r = 0.09 * (1 - i * 0.2);
    parts.push(paint(new THREE.TorusGeometry(r, r * 0.6, 5, 8).rotateX(Math.PI / 2).translate(0, 0.04 + i * 0.035, i * 0.01), i % 2 ? 0xfbe0d0 : 0xf5c4b0, 0.05));
  }
  return merge(parts);
}

function starfishGeo() {
  const parts = [];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    parts.push(paint(new THREE.ConeGeometry(0.06, 0.22, 4).rotateZ(-Math.PI / 2).translate(0.11, 0.02, 0).scale(1, 0.4, 1).rotateY(a), 0xff8a4a, 0.08));
  }
  parts.push(paint(new THREE.SphereGeometry(0.06, 6, 4).scale(1, 0.4, 1), 0xff9a5a, 0.05));
  return merge(parts);
}

function driftwoodGeo() {
  return merge([
    paint(new THREE.CylinderGeometry(0.12, 0.15, 1.6, 6).rotateZ(Math.PI / 2).translate(0, 0.12, 0), 0xb89a78, 0.08),
    paint(new THREE.CylinderGeometry(0.05, 0.07, 0.6, 5).rotateZ(Math.PI / 2 - 0.6).translate(0.45, 0.25, 0.08), 0xa88a68, 0.06),
  ]);
}

function seaweedGeo() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    const h = rand(0.35, 0.6);
    parts.push(paint(new THREE.ConeGeometry(0.04, h, 3).translate(0, h / 2, 0).rotateZ(rand(-0.4, 0.4)).rotateX(rand(-0.4, 0.4)), i % 2 ? 0x8aa84a : 0x6f9a3a, 0.08));
  }
  return merge(parts);
}

// 웅덩이 / 바다 깊이 (0 = 모래, 1 = 가장 깊음)
export const BEACH_POOLS = [
  { x: -14, z: 10, r: 4.5 }, { x: 16, z: -12, r: 5 }, { x: 8, z: 18, r: 3.5 }, { x: -18, z: -16, r: 4 }, { x: 24, z: 22, r: 3.2 }, { x: -26, z: 24, r: 3.6 },
];
function waterDepth(x, z) {
  let d = smooth(H + 2, H + 12, Math.max(x, z));   // 남 · 동쪽 울타리 너머 바다
  for (const p of BEACH_POOLS) {
    const k = 1 - Math.hypot(x - p.x, z - p.z) / p.r;
    if (k > 0) d = Math.max(d, Math.min(1, k * 1.6) * 0.75);
  }
  return d;
}

// grp 에 해변을 만들어 넣음 / obstacles 에 충돌체 추가
export function buildBeach(grp, obstacles, { instanced, makeSway, noise }) {
  // 바닥: 모래 (젖은 모래 → 물속 모래)
  const SIZE = 240, SEG = 120;
  const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  g.rotateX(-Math.PI / 2);
  jitter(g, 0.1, 37);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const dune = smooth(H + 2, H + 14, Math.max(-x, -z)) * 0.6;   // 북 · 서쪽 너머는 모래 언덕
    pos.setY(i, pos.getY(i) * 0.35 - 0.02 - waterDepth(x, z) * 0.75 + dune);
  }
  const ground = g.toNonIndexed();
  ground.deleteAttribute('uv');
  const gp = ground.attributes.position;
  const cols = new Float32Array(gp.count * 3);
  const sandA = new THREE.Color(0xf3dfa6), sandB = new THREE.Color(0xe9d090), wet = new THREE.Color(0xcdb27a), under = new THREE.Color(0x9cc4b8), tmp = new THREE.Color();
  for (let f = 0; f < gp.count; f += 3) {
    const cx = (gp.getX(f) + gp.getX(f + 1) + gp.getX(f + 2)) / 3;
    const cz = (gp.getZ(f) + gp.getZ(f + 1) + gp.getZ(f + 2)) / 3;
    const n = noise(cx, cz);
    tmp.copy(sandA).lerp(sandB, THREE.MathUtils.clamp(n * 0.5 + 0.5, 0, 1));
    const wd = waterDepth(cx, cz);
    if (wd > 0) tmp.lerp(wd > 0.25 ? under : wet, Math.min(1, wd * 3));
    else if (waterDepth(cx + 1.2, cz) > 0 || waterDepth(cx, cz + 1.2) > 0 || waterDepth(cx - 1.2, cz) > 0 || waterDepth(cx, cz - 1.2) > 0) tmp.lerp(wet, 0.55);   // 물가: 젖은 모래
    const v = 1 + (Math.random() - 0.5) * 0.06;
    for (let k = 0; k < 3; k++) { cols[(f + k) * 3] = tmp.r * v; cols[(f + k) * 3 + 1] = tmp.g * v; cols[(f + k) * 3 + 2] = tmp.b * v; }
  }
  ground.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  ground.computeVertexNormals();
  const groundMesh = new THREE.Mesh(ground, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
  groundMesh.receiveShadow = true;
  grp.add(groundMesh);

  // 물 (반투명 · 살짝 일렁임)
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x46b8e6, transparent: true, opacity: 0.68, roughness: 0.15, metalness: 0.1, emissive: 0x0a3a5a, emissiveIntensity: 0.25 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE, 1, 1).rotateX(-Math.PI / 2), waterMat);
  water.position.y = -0.12;
  water.receiveShadow = true;
  grp.add(water);
  // 물가의 흰 거품 (웅덩이 테두리)
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false });
  for (const p of BEACH_POOLS) {
    const foam = new THREE.Mesh(new THREE.RingGeometry(p.r * 0.62, p.r * 0.7, 40).rotateX(-Math.PI / 2), foamMat);
    foam.position.set(p.x, -0.1, p.z);
    grp.add(foam);
  }

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 });
  const placed = [];
  const free = (x, z, gap) => !placed.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < (gap + p.gap) ** 2) && waterDepth(x, z) <= 0;
  function spot(minCenter, gap, outer) {
    for (let t = 0; t < 30; t++) {
      let x, z;
      if (outer) {   // 북 · 서쪽 울타리 너머 (바다 쪽 제외)
        const side = Math.random() < 0.5;
        const along = rand(-H - 16, H + 4), depth = -rand(H + 1.5, H + 16);
        [x, z] = side ? [along, depth] : [depth, along];
      } else { x = rand(-H + 2, H - 2); z = rand(-H + 2, H - 2); }
      if (Math.hypot(x, z) < minCenter || !free(x, z, gap)) continue;
      placed.push({ x, z, gap });
      return { x, z };
    }
    return null;
  }

  // 야자수
  const palmKinds = [palmGeo(), palmGeo(), palmGeo()].map((geo) => ({ geo, list: [] }));
  for (let i = 0; i < 40; i++) {
    const s = spot(8, 1.6, false); if (!s) continue;
    const sc = rand(0.85, 1.25);
    palmKinds[i % 3].list.push({ x: s.x, z: s.z, s: sc, ry: rand(0, 6.28) });
    obstacles.add(s.x, s.z, 0.25 * sc);
  }
  for (let i = 0; i < 260; i++) {
    const s = spot(0, 1.2, true); if (!s) continue;
    palmKinds[i % 3].list.push({ x: s.x, z: s.z, s: rand(0.9, 1.4), ry: rand(0, 6.28) });
  }
  for (const k of palmKinds) grp.add(instanced(k.geo, mat, k.list, { cast: true }));

  // 바위 (모래빛 회색)
  const rocks = [[], []];
  const rockGeos = [rockGeo(21), rockGeo(33)].map((geo) => { const c = geo.attributes.color; for (let i = 0; i < c.count; i++) c.setXYZ(i, c.getX(i) * 1.05, c.getY(i) * 1.0, c.getZ(i) * 0.92); return geo; });
  for (let i = 0; i < 45; i++) {
    const s = spot(6, 1, false); if (!s) continue;
    const sc = rand(0.5, 1.5);
    rocks[i % 2].push({ x: s.x, z: s.z, s: sc, ry: rand(0, 6.28) });
    if (sc > 0.8) obstacles.add(s.x, s.z, 0.5 * sc);
  }
  // 웅덩이 안의 작은 바위 (충돌 없음)
  for (const p of BEACH_POOLS) for (let k = 0; k < 3; k++) {
    const a = rand(0, 6.28), d = rand(0.3, 0.6) * p.r;
    rocks[k % 2].push({ x: p.x + Math.cos(a) * d, z: p.z + Math.sin(a) * d, y: -0.35, s: rand(0.4, 0.8), ry: rand(0, 6.28) });
  }
  rockGeos.forEach((geo, i) => grp.add(instanced(geo, mat, rocks[i], { cast: true })));

  // 떠밀려 온 나무
  const woods = [];
  for (let i = 0; i < 12; i++) { const s = spot(6, 1.2, false); if (!s) continue; woods.push({ x: s.x, z: s.z, s: rand(0.8, 1.2), ry: rand(0, 6.28) }); obstacles.add(s.x, s.z, 0.35); }
  grp.add(instanced(driftwoodGeo(), mat, woods, { cast: true }));

  // 조개 · 불가사리 (충돌 없음)
  const shells = [], stars = [];
  for (let i = 0; i < 150; i++) {
    const x = rand(-H, H), z = rand(-H, H);
    if (waterDepth(x, z) > 0.3) continue;
    (Math.random() < 0.6 ? shells : stars).push({ x, z, y: 0.01, s: rand(0.8, 1.5), ry: rand(0, 6.28) });
  }
  grp.add(instanced(shellGeo(), mat, shells, { cast: true }));
  grp.add(instanced(starfishGeo(), mat, stars));

  // 해초 (웅덩이 안) · 해안 풀 (흔들림)
  const sway = makeSway();
  const weeds = [];
  for (const p of BEACH_POOLS) for (let k = 0; k < 14; k++) { const a = rand(0, 6.28), d = Math.sqrt(Math.random()) * p.r * 0.55; weeds.push({ x: p.x + Math.cos(a) * d, z: p.z + Math.sin(a) * d, y: -0.4, s: rand(0.8, 1.3), ry: rand(0, 6.28) }); }
  grp.add(instanced(seaweedGeo(), sway, weeds));
  const grassGeo = (() => {
    const parts = [];
    for (let i = 0; i < 5; i++) { const h = rand(0.3, 0.5); parts.push(paint(new THREE.ConeGeometry(0.035, h, 3).translate(0, h / 2, 0).rotateZ(rand(-0.6, 0.6)).rotateX(rand(-0.5, 0.5)), i % 2 ? 0x9aae5a : 0xb2bf6a, 0.08)); }
    return merge(parts);
  })();
  const grass = [];
  for (let i = 0; i < 1600; i++) {
    const x = rand(-H - 12, H + 12), z = rand(-H - 12, H + 12);
    if (waterDepth(x, z) > 0) continue;
    const dune = Math.max(-x, -z) > H - 6;   // 북 · 서쪽 모래 언덕 쪽에 많이
    if (!dune && Math.random() < 0.82) continue;
    grass.push({ x, z, s: rand(0.7, 1.3), ry: rand(0, 6.28) });
  }
  grp.add(instanced(grassGeo, sway, grass));

  return { water, waterMat };
}
