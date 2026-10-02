import * as THREE from 'three';
import { WORLD_HALF } from './config.js';
import {
  paint, jitter, merge, pineTreeGeo, roundTreeGeo, bushGeo, rockGeo, mushroomGeo, stumpGeo,
  grassTuftGeo, flowerStemGeo, flowerHeadGeo,
} from './models.js';

// ─────────────────────────────────────────────
//  충돌용 장애물 (원형)
// ─────────────────────────────────────────────
const OCELL = 4;
export class Obstacles {
  constructor() { this.list = []; this.grid = new Map(); }
  key(cx, cz) { return (cx + 500) * 2048 + (cz + 500); }
  add(x, z, r) {
    const o = { x, z, r };
    this.list.push(o);
    const k = this.key(Math.floor(x / OCELL), Math.floor(z / OCELL));
    if (!this.grid.has(k)) this.grid.set(k, []);
    this.grid.get(k).push(o);
  }
  blocked(x, z, r) {
    for (const o of this.list) if ((o.x - x) ** 2 + (o.z - z) ** 2 < (o.r + r) ** 2) return true;
    return false;
  }
  resolve(ent, r) {
    const cx = Math.floor(ent.x / OCELL), cz = Math.floor(ent.z / OCELL);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const arr = this.grid.get(this.key(cx + dx, cz + dz));
      if (!arr) continue;
      for (const o of arr) {
        const ox = ent.x - o.x, oz = ent.z - o.z;
        const min = o.r + r;
        const d2 = ox * ox + oz * oz;
        if (d2 < min * min) {
          const d = Math.sqrt(d2);
          if (d < 1e-4) { ent.x += min; continue; }
          const push = min - d;
          ent.x += (ox / d) * push;
          ent.z += (oz / d) * push;
        }
      }
    }
  }
}

// ─────────────────────────────────────────────
//  월드 구성
// ─────────────────────────────────────────────
function noise(x, z) {
  return Math.sin(x * 0.11) * Math.cos(z * 0.09) + Math.sin((x + z) * 0.065) * 0.6 + Math.sin(x * 0.31 - z * 0.27) * 0.25;
}

function instanced(geo, mat, transforms, { cast = false, receive = true, colors = null } = {}) {
  const mesh = new THREE.InstancedMesh(geo, mat, transforms.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler();
  transforms.forEach((t, i) => {
    e.set(t.rx || 0, t.ry || 0, t.rz || 0);
    q.setFromEuler(e);
    p.set(t.x, t.y || 0, t.z);
    s.set(t.s * (t.sx || 1), t.s * (t.sy || 1), t.s * (t.sz || 1));
    m.compose(p, q, s);
    mesh.setMatrixAt(i, m);
    if (colors) mesh.setColorAt(i, colors[i]);
  });
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function createWorld(scene) {
  const obstacles = new Obstacles();
  const timeU = { value: 0 };

  scene.background = new THREE.Color(0xa6dcf5);
  scene.fog = new THREE.Fog(0xa6dcf5, 62, 110);

  // 조명
  const hemi = new THREE.HemisphereLight(0xdff1ff, 0x5b7d3a, 1.15);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d2, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -28; sc.right = 28; sc.top = 28; sc.bottom = -28; sc.near = 1; sc.far = 80;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const SUN_OFF = new THREE.Vector3(14, 26, 8);

  // 바닥 (정점 노이즈 + 면 단위 색)
  const SIZE = 240, SEG = 120;
  const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  g.rotateX(-Math.PI / 2);
  jitter(g, 0.12, 91);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) * 0.4 - 0.02);
  const ground = g.toNonIndexed();
  ground.deleteAttribute('uv');
  const gp = ground.attributes.position;
  const cols = new Float32Array(gp.count * 3);
  const cA = new THREE.Color(0x6cbf4a), cB = new THREE.Color(0x8fd35c), cC = new THREE.Color(0x5aa83f), cDirt = new THREE.Color(0xb49a66), tmp = new THREE.Color();
  for (let f = 0; f < gp.count; f += 3) {
    const cx = (gp.getX(f) + gp.getX(f + 1) + gp.getX(f + 2)) / 3;
    const cz = (gp.getZ(f) + gp.getZ(f + 1) + gp.getZ(f + 2)) / 3;
    const n = noise(cx, cz);
    tmp.copy(cA).lerp(cB, THREE.MathUtils.clamp(n * 0.5 + 0.5, 0, 1));
    if (n < -0.9) tmp.lerp(cC, 0.6);
    const dirt = Math.sin(cx * 0.05 + 1.3) * Math.sin(cz * 0.047 - 0.4);
    if (dirt > 0.82) tmp.lerp(cDirt, 0.55);
    const v = 1 + (Math.random() - 0.5) * 0.08;
    for (let k = 0; k < 3; k++) { cols[(f + k) * 3] = tmp.r * v; cols[(f + k) * 3 + 1] = tmp.g * v; cols[(f + k) * 3 + 2] = tmp.b * v; }
  }
  ground.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  ground.computeVertexNormals();
  const groundMesh = new THREE.Mesh(ground, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // 경계 표시 (낮은 울타리 대신 꽃길 느낌의 흙 테두리는 생략, 나무 숲으로 감쌈)
  const leafMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 });

  const rand = (a, b) => a + Math.random() * (b - a);
  const placed = [];
  function freeSpot(minCenter, minGap, inner, outer) {
    for (let tries = 0; tries < 30; tries++) {
      let x, z;
      if (outer) {
        // 경계 바깥 숲 영역
        const side = Math.floor(Math.random() * 4);
        const along = rand(-WORLD_HALF - 16, WORLD_HALF + 16);
        const depth = rand(WORLD_HALF + 1.5, WORLD_HALF + 16);
        [x, z] = side === 0 ? [along, depth] : side === 1 ? [along, -depth] : side === 2 ? [depth, along] : [-depth, along];
      } else {
        x = rand(-inner, inner); z = rand(-inner, inner);
      }
      if (Math.hypot(x, z) < minCenter) continue;
      if (placed.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < (minGap + p.gap) ** 2)) continue;
      return { x, z };
    }
    return null;
  }

  // 나무
  const treeKinds = [
    { geo: pineTreeGeo(), list: [] },
    { geo: roundTreeGeo(), list: [] },
    { geo: roundTreeGeo(0xe8a23a, 0xd9822f, 0xf0b84a), list: [] },
    { geo: roundTreeGeo(0x9fcf4f, 0x8cc043, 0xb2da5e, 0xe9e2d2), list: [] },
  ];
  const addTree = (outer) => {
    const spot = freeSpot(outer ? 0 : 8, outer ? 1.2 : 2.2, WORLD_HALF - 2, outer);
    if (!spot) return;
    const r = Math.random();
    const kind = r < 0.42 ? 0 : r < 0.78 ? 1 : r < 0.88 ? 2 : 3;
    const s = rand(0.85, 1.35) * (outer ? 1.15 : 1);
    treeKinds[kind].list.push({ x: spot.x, z: spot.z, s, ry: rand(0, Math.PI * 2) });
    placed.push({ x: spot.x, z: spot.z, gap: 1 });
    if (!outer) obstacles.add(spot.x, spot.z, 0.35 * s);
  };
  for (let i = 0; i < 85; i++) addTree(false);
  for (let i = 0; i < 520; i++) addTree(true);
  for (const k of treeKinds) scene.add(instanced(k.geo, leafMat, k.list, { cast: true }));

  // 바위
  const rockKinds = [rockGeo(3), rockGeo(8), rockGeo(15)];
  const rockLists = [[], [], []];
  for (let i = 0; i < 55; i++) {
    const spot = freeSpot(6, 1.2, WORLD_HALF - 2, false);
    if (!spot) continue;
    const s = rand(0.5, 1.6);
    rockLists[i % 3].push({ x: spot.x, z: spot.z, s, ry: rand(0, 6.28) });
    placed.push({ x: spot.x, z: spot.z, gap: 0.6 * s });
    if (s > 0.8) obstacles.add(spot.x, spot.z, 0.5 * s);
  }
  rockKinds.forEach((geo, i) => scene.add(instanced(geo, leafMat, rockLists[i], { cast: true })));

  // 그루터기
  const stumps = [];
  for (let i = 0; i < 16; i++) {
    const spot = freeSpot(6, 1, WORLD_HALF - 2, false);
    if (!spot) continue;
    stumps.push({ x: spot.x, z: spot.z, s: rand(0.8, 1.2), ry: rand(0, 6.28) });
    placed.push({ x: spot.x, z: spot.z, gap: 0.4 });
    obstacles.add(spot.x, spot.z, 0.35);
  }
  scene.add(instanced(stumpGeo(), leafMat, stumps, { cast: true }));

  // 덤불 (충돌 없음)
  const bushes = [];
  for (let i = 0; i < 110; i++) {
    const x = rand(-WORLD_HALF - 6, WORLD_HALF + 6), z = rand(-WORLD_HALF - 6, WORLD_HALF + 6);
    if (Math.hypot(x, z) < 4) continue;
    bushes.push({ x, z, s: rand(0.7, 1.4), ry: rand(0, 6.28) });
  }
  scene.add(instanced(bushGeo(), leafMat, bushes, { cast: true }));

  // 버섯 (군락)
  const mush = [];
  for (let c = 0; c < 22; c++) {
    const cx = rand(-WORLD_HALF, WORLD_HALF), cz = rand(-WORLD_HALF, WORLD_HALF);
    const n = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) mush.push({ x: cx + rand(-0.6, 0.6), z: cz + rand(-0.6, 0.6), s: rand(0.6, 1.3), ry: rand(0, 6.28) });
  }
  scene.add(instanced(mushroomGeo(), leafMat, mush, { cast: true }));

  // 경계 울타리 (플레이 영역 끝)
  {
    const F = WORLD_HALF + 0.55;
    const side = F * 2;
    const n = Math.ceil(side / 2);
    const L = side / n;
    const seg = merge([
      paint(new THREE.BoxGeometry(0.18, 0.95, 0.18).translate(0, 0.475, 0), 0x94643a, 0.06),
      paint(new THREE.ConeGeometry(0.15, 0.18, 4).rotateY(Math.PI / 4).translate(0, 1.04, 0), 0x7a4f2b, 0.04),
      paint(new THREE.BoxGeometry(L, 0.1, 0.07).translate(L / 2, 0.36, 0), 0xb5804c, 0.08),
      paint(new THREE.BoxGeometry(L, 0.1, 0.07).translate(L / 2, 0.7, 0), 0xb5804c, 0.08),
    ]);
    const list = [];
    for (let i = 0; i < n; i++) {
      const t = -F + i * L;
      list.push({ x: t, z: -F, s: 1, ry: 0 });            // 북쪽: +x 방향
      list.push({ x: F, z: t, s: 1, ry: -Math.PI / 2 });  // 동쪽: +z 방향
      list.push({ x: -t, z: F, s: 1, ry: Math.PI });      // 남쪽: -x 방향
      list.push({ x: -F, z: -t, s: 1, ry: Math.PI / 2 }); // 서쪽: -z 방향
    }
    scene.add(instanced(seg, leafMat, list, { cast: true }));
  }

  // 흔들리는 풀 / 꽃 (바람 셰이더)
  const swayMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 });
  swayMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = timeU;
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float h = max(position.y, 0.0);
        transformed.x += sin(uTime * 1.9 + wp.x * 0.35 + wp.z * 0.21) * 0.22 * h;
        transformed.z += cos(uTime * 1.4 + wp.x * 0.17) * 0.12 * h;
      #endif`);
  };
  const grass = [];
  for (let i = 0; i < 6500; i++) {
    const x = rand(-WORLD_HALF - 10, WORLD_HALF + 10), z = rand(-WORLD_HALF - 10, WORLD_HALF + 10);
    const n = noise(x, z);
    if (n < -0.5 && Math.random() < 0.6) continue;
    grass.push({ x, z, s: rand(0.7, 1.4), ry: rand(0, 6.28) });
  }
  scene.add(instanced(grassTuftGeo(), swayMat, grass));

  const flowers = [], fcolors = [];
  const palette = [0xff6b8a, 0xffd34f, 0xffffff, 0xb58cff, 0x6fc4ff, 0xff9a4a];
  for (let c = 0; c < 70; c++) {
    const cx = rand(-WORLD_HALF, WORLD_HALF), cz = rand(-WORLD_HALF, WORLD_HALF);
    const col = new THREE.Color(palette[c % palette.length]);
    const n = 4 + Math.floor(Math.random() * 8);
    for (let i = 0; i < n; i++) {
      flowers.push({ x: cx + rand(-1.5, 1.5), z: cz + rand(-1.5, 1.5), s: rand(0.8, 1.3), ry: rand(0, 6.28) });
      fcolors.push(col);
    }
  }
  scene.add(instanced(flowerStemGeo(), swayMat, flowers));
  const headMat = swayMat.clone();
  headMat.onBeforeCompile = swayMat.onBeforeCompile;
  scene.add(instanced(flowerHeadGeo(), headMat, flowers, { colors: fcolors }));

  // 구름: 아이소 시점에선 본체가 바닥 위 바위처럼 보이므로 그림자만 드리움
  const cloudGeo = paint(jitter(new THREE.IcosahedronGeometry(1, 0), 0.3, 5), 0xffffff, 0.04);
  const cloudMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  const clouds = [];
  for (let i = 0; i < 14; i++) {
    const grp = new THREE.Group();
    const n = 3 + Math.floor(Math.random() * 3);
    for (let k = 0; k < n; k++) {
      const m = new THREE.Mesh(cloudGeo, cloudMat);
      m.position.set(k * 1.3 - n * 0.6, rand(-0.2, 0.3), rand(-0.5, 0.5));
      m.scale.setScalar(rand(0.9, 1.6));
      m.castShadow = true;
      grp.add(m);
    }
    grp.position.set(rand(-80, 80), rand(13, 16), rand(-80, 80));
    grp.userData.speed = rand(0.4, 0.9);
    clouds.push(grp);
    scene.add(grp);
  }

  function update(t, playerPos, dt) {
    timeU.value = t;
    sun.position.copy(playerPos).add(SUN_OFF);
    sun.target.position.copy(playerPos);
    for (const c of clouds) {
      c.position.x += c.userData.speed * dt;
      if (c.position.x > 90) c.position.x = -90;
    }
  }

  return { obstacles, update };
}
