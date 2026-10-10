// ─────────────────────────────────────────────
//  둥근 그림자: 플레이어 · 적 · 투사체 등 발밑에 부드러운 그림자 (높이 뜰수록 작고 옅어 보임)
// ─────────────────────────────────────────────
import * as THREE from 'three';

const MAX = 1600;

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.75)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const _m = new THREE.Matrix4();

export class BlobShadows {
  constructor(scene) {
    const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    this.mat = new THREE.MeshBasicMaterial({ map: shadowTexture(), color: 0x1a2a10, transparent: true, opacity: 0.38, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.mesh = new THREE.InstancedMesh(geo, this.mat, MAX);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
    this.mesh.count = 0;
    scene.add(this.mesh);
    this.n = 0;
  }

  begin() { this.n = 0; }

  // r: 물체 반지름, h: 바닥에서의 높이 (높을수록 그림자가 작아짐)
  add(x, z, r, h = 0) {
    if (this.n >= MAX || !(r > 0)) return;
    const s = r * 2.1 * Math.max(0.35, 1 / (1 + Math.max(0, h) * 0.45));
    _m.makeScale(s, 1, s).setPosition(x, 0.06, z);
    this.mesh.setMatrixAt(this.n++, _m);
  }

  end() {
    this.mesh.count = this.n;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
