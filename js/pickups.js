import * as THREE from 'three';
import { PLAYER, BLOCK_COLORS } from './config.js';
import { game, inventoryAdd } from './state.js';
import { colorKey } from './blocks.js';
import { sfx } from './audio.js';

const GEM_CAP = 900;
const GEM_COLORS = { 1: 0x4fd0ff, 3: 0xa07bff, 6: 0xff5fa2 };
const LETTER = { sentence: '문', subject: '주', change: '변', number: '수', op: '연' };
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Euler();

const texCache = {};
function blockTexture(k) {
  if (texCache[k]) return texCache[k];
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = BLOCK_COLORS[k];
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(0, 56, 64, 8); g.fillRect(56, 0, 8, 64);
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.fillRect(0, 0, 64, 6); g.fillRect(0, 0, 6, 64);
  g.fillStyle = '#fff';
  g.font = 'bold 34px "Noto Sans KR", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(LETTER[k], 32, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache[k] = t;
  return t;
}

export class Pickups {
  constructor(scene, fx) {
    this.scene = scene;
    this.fx = fx;
    this.gems = [];
    this.blocks = [];
    this.gemMesh = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(0.17, 0),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1, emissive: 0x505050, flatShading: true }),
      GEM_CAP);
    this.gemMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(GEM_CAP * 3), 3);
    this.gemMesh.frustumCulled = false;
    this.gemMesh.castShadow = true;
    this.gemMesh.count = 0;
    scene.add(this.gemMesh);
    this.boxGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    this.beamGeo = new THREE.CylinderGeometry(0.04, 0.14, 2.6, 8, 1, true);
    this.mats = {};
    this.fullToastT = 0;
  }

  addGem(x, z, v) {
    if (this.gems.length >= GEM_CAP) { this.gems[Math.floor(Math.random() * this.gems.length)].v += v; return; }
    this.gems.push({ x, z, v, mag: false, sp: 0, ph: Math.random() * 6, color: new THREE.Color(GEM_COLORS[v] || 0xffd24a) });
  }

  getMats(k) {
    if (!this.mats[k]) {
      const col = new THREE.Color(BLOCK_COLORS[k]);
      this.mats[k] = {
        box: new THREE.MeshStandardMaterial({ map: blockTexture(k), roughness: 0.5, emissive: col, emissiveIntensity: 0.25 }),
        beam: new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      };
    }
    return this.mats[k];
  }

  addBlock(block, x, z, { fromX = x, fromZ = z, requireExit = false } = {}) {
    const k = colorKey(block);
    const mats = this.getMats(k);
    const group = new THREE.Group();
    const box = new THREE.Mesh(this.boxGeo, mats.box);
    box.castShadow = true;
    const beam = new THREE.Mesh(this.beamGeo, mats.beam);
    beam.position.y = 1.2;
    group.add(box, beam);
    group.position.set(fromX, 0.5, fromZ);
    this.scene.add(group);
    this.blocks.push({ block, x, z, fx: fromX, fz: fromZ, t: 0, fly: 0.45, requireExit, exited: false, mag: false, sp: 0, group, box, ph: Math.random() * 6 });
  }

  // 블록 상자: 획득하면 블록 3개 중 1개 선택 창이 열림
  addChest(x, z) {
    if (!this.chestParts) {
      const wood = new THREE.MeshStandardMaterial({ color: 0x9a5f2c, roughness: 0.7, flatShading: true });
      const gold = new THREE.MeshStandardMaterial({ color: 0xffd45a, metalness: 0.6, roughness: 0.3, emissive: 0x6a4a00, emissiveIntensity: 0.4 });
      const beam = new THREE.MeshBasicMaterial({ color: 0xffd45a, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      this.chestParts = { wood, gold, beam, base: new THREE.BoxGeometry(0.62, 0.36, 0.44), lid: new THREE.BoxGeometry(0.64, 0.16, 0.46), band: new THREE.BoxGeometry(0.1, 0.54, 0.48), lock: new THREE.BoxGeometry(0.12, 0.14, 0.06) };
    }
    const P = this.chestParts;
    const group = new THREE.Group();
    const box = new THREE.Group();
    const base = new THREE.Mesh(P.base, P.wood); base.position.y = -0.05;
    const lid = new THREE.Mesh(P.lid, P.wood); lid.position.y = 0.21;
    const b1 = new THREE.Mesh(P.band, P.gold); b1.position.set(-0.2, 0.02, 0);
    const b2 = new THREE.Mesh(P.band, P.gold); b2.position.set(0.2, 0.02, 0);
    const lock = new THREE.Mesh(P.lock, P.gold); lock.position.set(0, 0.1, 0.24);
    for (const m of [base, lid]) m.castShadow = true;
    box.add(base, lid, b1, b2, lock);
    const beam = new THREE.Mesh(this.beamGeo, P.beam);
    beam.position.y = 1.2;
    beam.scale.set(1.6, 1.2, 1.6);
    group.add(box, beam);
    group.position.set(x, 0.5, z);
    this.scene.add(group);
    this.blocks.push({ chest: true, block: null, x, z, fx: x, fz: z, t: 0, fly: 0.3, requireExit: false, exited: false, mag: false, sp: 0, group, box, ph: Math.random() * 6 });
    this.fx.ring(x, z, 1.2, 0xffd45a, 0.6);
  }

  update(dt, player, onXp) {
    const px = player.pos.x, pz = player.pos.z;
    // 경험치
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      const dx = px - g.x, dz = pz - g.z;
      const d = Math.hypot(dx, dz) || 0.001;
      if (!g.mag && d < PLAYER.gemMagnet * game.mods.pickupMul) g.mag = true;
      if (g.mag) {
        g.sp += dt * 28;
        const step = Math.min(d, (4 + g.sp) * dt);
        g.x += (dx / d) * step; g.z += (dz / d) * step;
      }
      if (d < 0.45) {
        onXp(g.v);
        sfx('gem');
        this.fx.particles.burst(g.x, 0.5, g.z, 3, g.color.getHex(), { speed: 1.5, size: 0.06, life: 0.25, up: 2 });
        this.gems[i] = this.gems[this.gems.length - 1];
        this.gems.pop();
      }
    }
    // 블록 / 상자
    this.fullToastT -= dt;
    const target = player.moveTarget;
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const b = this.blocks[i];
      b.t += dt;
      if (b.t < b.fly) continue;
      const dx = px - b.x, dz = pz - b.z;
      const d = Math.hypot(dx, dz) || 0.001;
      // 이름표 클릭으로 지정한 아이템: 가까이 가면 언제든 획득
      if (b === target) {
        if (d < 0.7) { player.moveTarget = null; this.collect(i, true); }
        continue;
      }
      if (!game.autoPickup) { b.mag = false; b.pulled = false; continue; }   // 자동 획득 꺼짐: 근접/자석 획득 없음
      if (b.requireExit && !b.exited) { if (d > 2.4) b.exited = true; else continue; }
      if (!b.mag && (d < PLAYER.blockMagnet * game.mods.pickupMul || b.pulled)) {
        b.pulled = false;
        if (b.chest || game.inventory.includes(null)) b.mag = true;
        else if (this.fullToastT <= 0) { this.fullToastT = 3; game.sys.ui.toast('인벤토리가 가득 찼습니다!', 'warn'); }
      }
      if (b.mag) {
        b.sp += dt * 20;
        const step = Math.min(d, (3 + b.sp) * dt);
        b.x += (dx / d) * step; b.z += (dz / d) * step;
        if (d < 0.5 && !this.collect(i, false)) { b.mag = false; b.sp = 0; }
      }
    }
    if (target && !this.blocks.includes(target)) player.moveTarget = null;
  }

  // i 번째 드랍 아이템 획득. 성공하면 true
  collect(i, manual) {
    const b = this.blocks[i];
    if (b.chest) {
      this.scene.remove(b.group);
      this.fx.particles.burst(b.x, 0.6, b.z, 16, [0xffd45a, 0xffffff, 0x9a5f2c], { speed: 3, size: 0.1, life: 0.45, up: 3.5 });
      this.blocks.splice(i, 1);
      game.pendingBoxes++;
      sfx('chest');
      return true;
    }
    if (!inventoryAdd(b.block)) {
      if (manual) game.sys.ui.toast('인벤토리가 가득 찼습니다!', 'warn');
      return false;
    }
    this.scene.remove(b.group);
    this.fx.particles.burst(b.x, 0.6, b.z, 8, BLOCK_COLORS[colorKey(b.block)], { speed: 2.5, size: 0.09, life: 0.35, up: 3 });
    this.blocks.splice(i, 1);
    game.sys.ui.onPickup(b.block);
    sfx('block');
    return true;
  }

  render(time) {
    for (let i = 0; i < this.gems.length; i++) {
      const g = this.gems[i];
      _e.set(0, time * 2 + g.ph, 0);
      _q.setFromEuler(_e);
      _p.set(g.x, 0.35 + Math.sin(time * 3 + g.ph) * 0.08, g.z);
      const sc = g.v >= 6 ? 1.35 : g.v >= 3 ? 1.15 : 1;
      _s.set(sc, sc * 1.3, sc);
      _m.compose(_p, _q, _s);
      this.gemMesh.setMatrixAt(i, _m);
      this.gemMesh.setColorAt(i, g.color);
    }
    this.gemMesh.count = this.gems.length;
    this.gemMesh.instanceMatrix.needsUpdate = true;
    if (this.gemMesh.instanceColor) this.gemMesh.instanceColor.needsUpdate = true;

    for (const b of this.blocks) {
      if (b.t < b.fly) {
        const k = b.t / b.fly;
        b.group.position.set(b.fx + (b.x - b.fx) * k, 0.5 + Math.sin(k * Math.PI) * 1.3, b.fz + (b.z - b.fz) * k);
      } else {
        b.group.position.set(b.x, 0.5 + Math.sin(time * 3 + b.ph) * 0.1, b.z);
      }
      b.box.rotation.y = time * (b.chest ? 0.8 : 1.5) + b.ph;
      b.box.rotation.x = b.chest ? 0 : 0.35;
    }
  }
}
