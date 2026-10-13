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

// ── 만탄 / 마타 (스케치: 옆 · 앞 · 위): 흰 몸통 위로 파란 가오리 망토를 뒤집어쓴 모습
//    망토는 머리 꼭대기에서 둥글게 시작해 옆과 뒤로 넓게 퍼지며 바닥까지 내려오고 (뒤쪽은 길게 끌림, 위에서 보면 부채꼴)
//    앞쪽 가장자리는 얼굴 위까지만 내려와 송곳니처럼 뾰족뾰족, 망토 앞에 큰 눈 두 개, 아래로 흰 얼굴 · 짧은 다리
//    머리 꼭대기에서 앞으로 휘어진 더듬이 끝에 늘어진 노란 구근 (마타: 짧은 뿔, 짧은 망토)
export function createManta(baby = false) {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);
  const soft = (o) => new THREE.MeshStandardMaterial({ roughness: 0.55, ...o });
  const whiteMat = soft({ color: 0xf8fbff, roughness: 0.9 });
  const blueMat = soft({ color: 0x8fd2f2, roughness: 0.4, side: THREE.DoubleSide });
  const mk = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; };
  // 몸통 · 흰 얼굴
  const body = mk(new THREE.SphereGeometry(0.42, 24, 18).scale(1, 0.85, 1), whiteMat);
  body.position.set(0, 0.36, -0.02);
  root.add(body);
  const face = mk(new THREE.SphereGeometry(0.3, 22, 16).scale(1.15, 0.85, 0.7), whiteMat);
  face.position.set(0, 0.34, 0.24);
  root.add(face);
  // 짧은 다리 (둥근 발)
  const legs = [];
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.2, 0.2, sz * 0.2);
    pivot.add(mk(new THREE.CapsuleGeometry(0.075, 0.1, 6, 10).translate(0, -0.1, 0), whiteMat));
    pivot.add(mk(new THREE.SphereGeometry(0.085, 12, 9).scale(1.1, 0.7, 1.2).translate(0, -0.2, 0.02), whiteMat));
    root.add(pivot);
    legs.push(pivot);
  }
  // 가오리 망토
  const TOP = 1.06, FRONT_EDGE = 0.44;
  const back = baby ? 0.75 : 1.35, spread = baby ? 0.25 : 0.4;
  const cloakPoint = (a, t) => {
    const f = Math.max(0, Math.cos(a)), b = Math.max(0, -Math.cos(a)), side = Math.abs(Math.sin(a));
    const bottom = FRONT_EDGE * Math.pow(f, 1.4);          // 앞은 얼굴 위까지, 옆 · 뒤는 바닥까지
    const y = TOP - (TOP - bottom) * Math.pow(t, 1.25);
    const R = 0.1 + 0.58 * Math.sqrt(t);                    // 둥근 머리 → 넓은 자락
    const xf = 1 + t * (spread * side + 0.45 * b);          // 옆 · 뒤로 넓게 (위에서 보면 부채꼴)
    const zf = 1 + t * back * b;                            // 뒤로 길게 끌림
    return new THREE.Vector3(Math.sin(a) * R * xf, y, Math.cos(a) * R * zf);
  };
  const RADS = 48, ROWS = 18;
  const cg = new THREE.CylinderGeometry(1, 1, 1, RADS, ROWS, true);
  const cp = cg.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    const row = Math.floor(i / (RADS + 1)), col = i % (RADS + 1);
    const t = row / ROWS;
    const a = (col / RADS) * Math.PI * 2;
    const v = cloakPoint(a, Math.max(0.0001, t));
    if (row === ROWS && Math.cos(a) > 0.35 && col % 3 === 0) v.y -= 0.08;   // 앞쪽 가장자리: 송곳니처럼 뾰족뾰족
    cp.setXYZ(i, v.x, v.y, v.z);
  }
  cg.computeVertexNormals();
  const train = mk(cg, blueMat);
  root.add(train);
  const cap = mk(new THREE.SphereGeometry(0.11, 14, 10).scale(1, 0.6, 1), blueMat);
  cap.position.set(0, TOP - 0.01, 0);
  root.add(cap);
  // 망토 앞의 큰 눈 두 개 · 볼 홍조
  const pupils = [];
  for (const s of [-1, 1]) {
    const a = s * 0.42, t = 0.62;
    const pt = cloakPoint(a, t);
    const n = new THREE.Vector3(Math.sin(a), 0.15, Math.cos(a)).normalize();
    const eye = mk(new THREE.SphereGeometry(0.1, 20, 14).scale(1, 1.1, 0.6), soft({ color: 0xffffff, roughness: 0.15 }));
    eye.position.copy(pt).addScaledVector(n, 0.02);
    eye.lookAt(eye.position.clone().add(n));
    const pupil = mk(new THREE.SphereGeometry(0.06, 16, 12).scale(1, 1.15, 0.6), soft({ color: 0x2e3444, roughness: 0.1 }));
    pupil.position.copy(pt).addScaledVector(n, 0.075);
    pupil.lookAt(pupil.position.clone().add(n));
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    hl.position.copy(pt).addScaledVector(n, 0.11).add(new THREE.Vector3(-0.02 * s, 0.03, 0));
    root.add(eye, pupil, hl);
    pupils.push(pupil);
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8).scale(1.3, 0.6, 0.5), new THREE.MeshBasicMaterial({ color: 0xffb0c4, transparent: true, opacity: 0.85 }));
    blush.position.set(s * 0.22, 0.33, 0.44);
    root.add(blush);
  }
  // 더듬이
  let bulb = null;
  if (baby) {
    for (const s of [-1, 1]) {
      const horn = mk(new THREE.ConeGeometry(0.05, 0.16, 12).translate(0, 0.08, 0), blueMat);
      horn.position.set(s * 0.08, TOP - 0.05, 0.02); horn.rotation.set(0.3, 0, -s * 0.35);
      root.add(horn);
    }
  } else {
    const ac = new THREE.CatmullRomCurve3([new THREE.Vector3(0, TOP - 0.02, 0), new THREE.Vector3(0, TOP + 0.32, -0.04), new THREE.Vector3(0, TOP + 0.45, 0.25), new THREE.Vector3(0, TOP + 0.3, 0.52)]);
    const ag = new THREE.TubeGeometry(ac, 24, 0.06, 10);
    const ap = ag.attributes.position;
    for (let i = 0; i < ap.count; i++) {
      const t = Math.floor(i / 11) / 24, c = ac.getPoint(t), k = 1 - t * 0.6;
      ap.setXYZ(i, c.x + (ap.getX(i) - c.x) * k, c.y + (ap.getY(i) - c.y) * k, c.z + (ap.getZ(i) - c.z) * k);
    }
    ag.computeVertexNormals();
    root.add(mk(ag, blueMat));
    bulb = new THREE.Group();
    bulb.position.set(0, TOP + 0.2, 0.56);
    bulb.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12).scale(1, 1.3, 1).translate(0, -0.03, 0), new THREE.MeshStandardMaterial({ color: 0xfff3a8, emissive: 0xffd94a, emissiveIntensity: 1.3 })));
    bulb.add(glow(0xffe680, 0.6));
    root.add(bulb);
  }
  // 바닥 y=0, 망토 폭이 약 1.15 가 되도록
  const box = new THREE.Box3().setFromObject(train);
  root.scale.setScalar(1.15 / (box.max.x - box.min.x));
  blueMat.userData.base = blueMat.color.getHex();
  return { group, root, legs, wings: [], train, bulb, body: { material: whiteMat }, blueMats: [blueMat], pupils, kind: 'manta' };
}
