import * as THREE from 'three';
import { PLAYER, WORLD_HALF, DASH } from './config.js';
import { createPlayer } from './models.js';
import { game } from './state.js';
import { getStats, sample } from './skills.js';
import { makeGlowSprite } from './effects.js';
import { sfx } from './audio.js';

// 아이소메트릭 화면 기준 이동 방향
const DIR_UP = new THREE.Vector3(-1, 0, -1).normalize();
const DIR_RIGHT = new THREE.Vector3(1, 0, -1).normalize();

export class Player {
  constructor(scene, fx) {
    this.fx = fx;
    this.model = createPlayer();
    scene.add(this.model.group);
    this.pos = this.model.group.position;
    this.radius = PLAYER.radius;
    this.maxHp = PLAYER.maxHp;
    this.hp = PLAYER.maxHp;
    this.maxMana = PLAYER.maxMana;
    this.mana = PLAYER.maxMana;
    this.shield = 0; this.shieldMax = 1; this.shieldT = 0;
    this.invuln = 0;
    this.regenT = 0;
    this.aim = new THREE.Vector3(0, 0, 1);
    this.facing = 0;
    this.walk = 0;
    this.moving = false;
    this.hurtT = 0;
    this.castT = 0;
    this.castColor = new THREE.Color(0xffffff);
    this.moveDir = new THREE.Vector3(0, 0, 1);
    this.moveTarget = null;   // 이름표 클릭으로 지정한 드랍 아이템
    this.dashCd = 0;
    this.dashT = 0;
    this.dashDir = new THREE.Vector3();
    this.ghostT = 0;

    // 보호막 구체
    this.bubbleMat = new THREE.MeshBasicMaterial({ color: 0x7fd8ff, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending });
    this.bubbleWire = new THREE.MeshBasicMaterial({ color: 0xbfeeff, wireframe: true, transparent: true, opacity: 0.35, depthWrite: false });
    this.bubble = new THREE.Group();
    this.bubble.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 1), this.bubbleMat));
    this.bubble.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.97, 1), this.bubbleWire));
    this.bubble.position.y = 0.6;
    this.bubble.visible = false;
    scene.add(this.bubble);

    // 냉기 보호막 스택 오브 (최대 4)
    this.orbs = [];
    const orbGeo = new THREE.IcosahedronGeometry(0.08, 0);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xaaf0ff });
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(orbGeo, orbMat));
      g.add(makeGlowSprite(0x6fd3ff, 0.55, 0.9));
      g.visible = false;
      scene.add(g);
      this.orbs.push(g);
    }

    // 조준 표시 (발밑 화살표)
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.25); arrowShape.lineTo(0.18, -0.05); arrowShape.lineTo(0, 0.03); arrowShape.lineTo(-0.18, -0.05); arrowShape.closePath();
    this.arrow = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }));
    this.arrow.rotation.x = -Math.PI / 2;
    scene.add(this.arrow);
  }

  update(dt, input, obstacles) {
    // 이동
    const mv = new THREE.Vector3();
    const k = input.keys;   // WASD 또는 방향키
    if (k.has('KeyW') || k.has('ArrowUp')) mv.add(DIR_UP);
    if (k.has('KeyS') || k.has('ArrowDown')) mv.sub(DIR_UP);
    if (k.has('KeyD') || k.has('ArrowRight')) mv.add(DIR_RIGHT);
    if (k.has('KeyA') || k.has('ArrowLeft')) mv.sub(DIR_RIGHT);
    // 이름표 클릭: 지정한 아이템까지 자동 이동 (직접 이동하면 취소)
    if (mv.lengthSq() > 0) this.moveTarget = null;
    else if (this.moveTarget) {
      const t = this.moveTarget;
      const tx = t.x - this.pos.x, tz = t.z - this.pos.z;
      if (Math.hypot(tx, tz) > 0.3) mv.set(tx, 0, tz);
    }
    this.moving = mv.lengthSq() > 0;
    if (this.moving) {
      mv.normalize();
      this.moveDir.copy(mv);
      mv.multiplyScalar(PLAYER.speed * game.mods.speedMul * dt);
      this.pos.x += mv.x; this.pos.z += mv.z;
    }
    // 대시
    if (this.dashCd > 0) this.dashCd -= dt;
    if (this.dashT > 0) {
      const step = Math.min(this.dashT, dt) * ((DASH.distance * game.mods.dashDistMul) / DASH.duration);
      this.pos.x += this.dashDir.x * step;
      this.pos.z += this.dashDir.z * step;
      this.dashT -= dt;
      this.ghostT -= dt;
      if (this.ghostT <= 0) { this.ghostT = 0.028; this.spawnGhost(); }
    }
    obstacles.resolve(this.pos, 0.4);
    this.pos.x = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, this.pos.x));
    this.pos.z = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, this.pos.z));

    // 시선: 이동 방향 (멈추면 마지막 이동 방향 유지)
    if (this.moving) this.aim.copy(this.moveDir);
    const target = Math.atan2(this.aim.x, this.aim.z);
    let diff = target - this.facing;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    this.facing += diff * Math.min(1, dt * 16);

    // 상태
    if (this.invuln > 0) this.invuln -= dt;
    if (this.shieldT > 0) { this.shieldT -= dt; if (this.shieldT <= 0) this.shield = 0; }
    this.regenT += dt;
    const regenEvery = Math.max(1, PLAYER.regenInterval - game.mods.regenMinus);
    const regenAmt = PLAYER.regenAmount + game.mods.regenAmount;
    if (this.regenT >= regenEvery) {
      this.regenT -= regenEvery;
      if (this.hp < this.maxHp) {
        this.hp = Math.min(this.maxHp, this.hp + regenAmt);
        this.fx.numbers.spawn(this.pos.x, 1.6, this.pos.z, `+${regenAmt}`, 'heal');
      }
    }
    this.mana = Math.min(this.maxMana, this.mana + (PLAYER.manaRegen + game.mods.manaRegen) * dt);
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.castT > 0) this.castT -= dt;
    if (this.moving) this.walk += dt * 11;
  }

  tryDash() {
    if (this.dashCd > 0 || this.dashT > 0) return false;
    this.dashDir.copy(this.moving ? this.moveDir : this.aim).setY(0).normalize();
    this.dashT = DASH.duration;
    this.dashCd = this.dashCooldown();
    sfx('dash');
    this.ghostT = 0;
    this.fx.particles.burst(this.pos.x, 0.15, this.pos.z, 10, [0xffffff, 0xd9f2ff, 0xb9c7a0], { speed: 2.2, size: 0.1, life: 0.35, up: 1.2 });
    return true;
  }

  // 대시 잔상: 현재 자세를 복제해 반투명하게 남기고 서서히 사라지게
  spawnGhost() {
    const g = this.model.group.clone(true);
    const mat = new THREE.MeshBasicMaterial({ color: 0x7fb8ff, transparent: true, opacity: 0.38, depthWrite: false });
    g.traverse((o) => { if (o.isMesh) { o.material = mat; o.castShadow = false; } });
    g.visible = true;
    this.fx.add([g], 0.32, (k) => { mat.opacity = 0.38 * (1 - k); }, [mat]);
  }

  // 보호막 추가 (효과 부여 등): 양은 더하고 지속 시간은 더 긴 쪽
  addShield(amount, duration) {
    if (this.shield <= 0) this.shieldMax = 0;
    this.shield += amount;
    this.shieldT = Math.max(this.shieldT, duration);
    this.shieldMax = Math.max(this.shieldMax, this.shield);
  }

  dashCooldown() { return Math.max(0.5, DASH.cooldown + game.mods.dashCd); }

  // 업그레이드 적용 (게임 시작 시)
  applyMods(m) {
    this.maxHp = PLAYER.maxHp + m.maxHp;
    this.hp = this.maxHp;
    this.maxMana = PLAYER.maxMana + m.maxMana;
    this.mana = this.maxMana;
  }

  castPulse(color) { this.castT = 0.25; this.castColor.set(color); }

  takeDamage(amount) {
    if (this.invuln > 0 || game.state !== 'playing' || game.debug.god) return;
    this.invuln = PLAYER.invuln + game.mods.invuln;
    const bar = game.skills.find((s) => s.key === 'frostBarrier');
    if (bar && this.shield <= 0 && bar.stacks > 0) {
      bar.stacks--;
      const st = getStats(bar);
      this.shield = sample(st.shield);
      this.shieldMax = Math.max(1, this.shield);
      this.shieldT = sample(st.duration);
      this.fx.ring(this.pos.x, this.pos.z, 1.6, 0x6fd3ff, 0.4, 0.6);
      sfx('shield');
      game.sys.skillsRt.frostNova(bar);
    }
    let dmg = amount;
    if (this.shield > 0) {
      const a = Math.min(this.shield, dmg);
      this.shield -= a;
      dmg -= a;
      this.fx.numbers.spawn(this.pos.x, 1.7, this.pos.z, Math.floor(a), 'shield');
      if (this.shield <= 0) { this.shieldT = 0; this.fx.particles.burst(this.pos.x, 0.8, this.pos.z, 14, [0xbfeeff, 0x6fd3ff], { speed: 3, size: 0.08, life: 0.4 }); }
    }
    if (dmg > 0) {
      this.hp -= dmg;
      this.hurtT = 0.25;
      sfx('hurt');
      this.fx.numbers.spawn(this.pos.x, 1.7, this.pos.z, Math.floor(dmg), 'hurt');
      game.sys.ui.hurtFlash();
    }
    if (this.hp <= 0) { this.hp = 0; game.sys.onPlayerDeath(); }
  }

  render(time) {
    const m = this.model;
    const g = m.group;
    g.rotation.y = this.facing;
    // 걷기 애니메이션
    const sw = this.moving ? Math.sin(this.walk) : 0;
    const k = this.moving ? 1 : 0;
    m.legs[0].rotation.x = sw * 0.7;
    m.legs[1].rotation.x = -sw * 0.7;
    m.arms[0].rotation.x = -sw * 0.6;
    m.arms[1].rotation.x = sw * 0.6;
    m.root.position.y = k * Math.abs(Math.sin(this.walk)) * 0.06 + (1 - k) * Math.sin(time * 2.2) * 0.012;
    m.headPivot.rotation.z = this.moving ? Math.sin(this.walk) * 0.18 : Math.sin(time * 1.6) * 0.1;   // 새싹 잎 살랑살랑
    // 시전 모션: 오른팔 앞으로
    if (this.castT > 0) {
      const c = Math.sin((this.castT / 0.25) * Math.PI);
      m.arms[1].rotation.x = -1.6 * c;
    }
    // 피격 / 시전 발광
    const hurt = this.hurtT > 0 ? this.hurtT / 0.25 : 0;
    for (const mat of m.materials) {
      if (!mat.emissive) continue;
      if (hurt > 0) mat.emissive.setRGB(hurt * 0.8, 0, 0);
      else if (this.castT > 0) mat.emissive.copy(this.castColor).multiplyScalar(0.15 * (this.castT / 0.25));
      else mat.emissive.setRGB(0, 0, 0);
    }
    g.visible = !(this.invuln > 0 && this.hurtT <= 0 && Math.floor(time * 20) % 2 === 0 && this.invuln < PLAYER.invuln - 0.25);

    // 보호막
    this.bubble.visible = this.shield > 0;
    if (this.bubble.visible) {
      this.bubble.position.set(this.pos.x, 0.6, this.pos.z);
      this.bubble.rotation.y = time * 0.6;
      const pulse = 0.14 + Math.sin(time * 6) * 0.04;
      this.bubbleMat.opacity = pulse * (0.5 + 0.5 * Math.min(1, this.shield / this.shieldMax));
    }
    const bar = game.skills.find((s) => s.key === 'frostBarrier');
    const stacks = bar ? bar.stacks : 0;
    this.orbs.forEach((o, i) => {
      o.visible = i < stacks;
      // 몸통 높이에서 플레이어 주위를 공전 (살짝 기울어진 궤도)
      const a = time * 2.6 + (i / Math.max(1, stacks)) * Math.PI * 2;
      o.position.set(this.pos.x + Math.cos(a) * 0.72, 0.5 + Math.sin(a * 1) * 0.12, this.pos.z + Math.sin(a) * 0.72);
    });

    this.arrow.position.set(this.pos.x + this.aim.x * 0.95, 0.04, this.pos.z + this.aim.z * 0.95);
    this.arrow.rotation.z = Math.atan2(-this.aim.x, -this.aim.z);
  }
}
