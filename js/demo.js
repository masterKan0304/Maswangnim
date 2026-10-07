// ─────────────────────────────────────────────
//  메인 화면 미리보기: 여러 맵/스킬 조합의 짧은 전투 장면을 교차 편집해서 보여 줌
//  (실제 게임 시스템을 그대로 돌림 — 게임 시작 시 페이지를 새로 불러와 초기화)
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { game, bump } from './state.js';
import { WORLD_HALF } from './config.js';
import { createSkill } from './skills.js';
import { previewStages } from './stages.js';
import { Showcase } from './showcase.js';

const CLIP = 5.5;        // 장면 하나의 길이 (초)
const FADE = 0.28;       // 장면 전환 암전 시간 (초)
const POOL = ['fireball', 'chainLightning', 'iceball', 'flamethrower', 'snowfall', 'lightningBeam', 'fireAura', 'frostAura', 'lightningAura'];
const DIR_UP = new THREE.Vector3(-1, 0, -1).normalize();
const DIR_RIGHT = new THREE.Vector3(1, 0, -1).normalize();

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export class Demo {
  // sys: { player, enemies, pickups, skillsRt, scene, fx, onTeleport(pos), onCaption(stage), cutEl }
  constructor(sys) {
    this.sys = sys;
    this.input = { keys: new Set(), virtual: new Set(), vdir: new THREE.Vector3(), ground: new THREE.Vector3() };
    this.t = 0;
    this.fadeT = 0;
    this.spawnAcc = 0;
    this.wander = Math.random() * Math.PI * 2;
    this.active = false;
  }

  start() {
    this.active = true;
    game.demo = true;
    this.cut();
  }

  stop() {
    this.active = false;
    game.demo = false;
  }

  // 도감 미리보기: cfg 가 있으면 고정 장면, null 이면 다시 교차 편집 미리보기로
  setShowcase(cfg) {
    if (cfg) {
      if (!this.showcase) this.showcase = new Showcase(this.sys);
      this.mode = 'showcase';
      this.input.virtual.clear();
      this.input.vdir.set(0, 0, 0);
      this.showcase.set(cfg);
      return;
    }
    if (this.mode !== 'showcase') return;
    this.mode = 'demo';
    game.debug.god = false;
    this.sys.player.hidden = false;
    this.showcase.clearWorld();
    this.cut();
  }

  // 새 장면: 맵 / 위치 / 스킬 조합 / 적 무리를 새로 정함
  cut() {
    const { player, enemies, pickups, skillsRt, scene } = this.sys;
    this.t = 0;
    this.stage = pick(previewStages());   // 맵이 늘어나면 여기서 오가며 보여 줌
    if (this.sys.onCaption) this.sys.onCaption(this.stage);
    // 이전 장면 정리
    for (const e of enemies.list) {
      if (!e.alive) continue;
      e.alive = false;
      if (e.model) scene.remove(e.model.group);
    }
    pickups.gems.length = 0;
    if (this.sys.enemySkills) this.sys.enemySkills.clear();
    skillsRt.clearAll();   // 이전 장면의 투사체 / 불길 / 대기 중인 시전까지 정리
    game.skills.length = 0;
    game.buffs.length = 0;
    // 위치
    const R = WORLD_HALF - 14;
    player.pos.set(rand(-R, R), 0, rand(-R, R));
    player.moveTarget = null;
    player.shield = 0;
    if (this.sys.onTeleport) this.sys.onTeleport(player.pos);
    // 스킬 조합 (2~4개, 레벨 다양하게)
    const keys = [...POOL].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3));
    if (!keys.some((k) => !['fireAura', 'frostAura', 'lightningAura'].includes(k))) keys.push('fireball');
    for (const k of keys) {
      const sk = createSkill(k);
      sk.level = Math.min(5, 1 + Math.floor(Math.random() * 3) + Math.floor(Math.random() * 3));
      sk.cd = Math.random() * 0.6;
      game.skills.push(sk);
    }
    bump();
    // 진행 시간 (적 종류 / 체력 배율에 영향)
    game.time = rand(40, 480);
    // 처음부터 화면에 적 무리가 있도록
    const n = 26 + Math.floor(Math.random() * 30);
    for (let i = 0; i < n; i++) this.spawnAround(rand(5, 15));
    const roll = Math.random();
    if (roll < 0.22) this.spawnAround(rand(7, 10), 'elite');
    else if (roll < 0.3) this.spawnAround(rand(8, 11), 'boss');
  }

  spawnAround(d, type = null) {
    const { player, enemies } = this.sys;
    const a = Math.random() * Math.PI * 2;
    const x = THREE.MathUtils.clamp(player.pos.x + Math.cos(a) * d, -WORLD_HALF + 1, WORLD_HALF - 1);
    const z = THREE.MathUtils.clamp(player.pos.z + Math.sin(a) * d, -WORLD_HALF + 1, WORLD_HALF - 1);
    const t = game.time;
    if (!type) {
      const r = Math.random();
      type = t > 200 && r < 0.25 ? 'red' : t > 90 && r < 0.6 ? 'yellow' : 'green';
    }
    const hpMul = type === 'boss' ? 0.3 : type === 'elite' ? 0.5 : 0.8;
    enemies.spawn(type, x, z, hpMul);
  }

  // 플레이어 자동 조작: 실제로 플레이하듯 여러 방향으로 방향을 바꾸며 돌아다님 (적은 피하지 않고 뚫고 지나감)
  steer(dt) {
    const { player } = this.sys;
    const p = player.pos;
    this.legT = (this.legT ?? 0) - dt;
    if (this.legT <= 0) {
      // 다음 구간: 새 목표 방향 / 회전 속도 / 길이 (가끔은 크게 돌아 원을 그리거나 잠깐 멈춤)
      const r = Math.random();
      this.mode = r < 0.12 ? 'stop' : r < 0.32 ? 'circle' : 'go';
      this.legT = this.mode === 'stop' ? 0.25 + Math.random() * 0.4 : this.mode === 'circle' ? 1.2 + Math.random() * 1.2 : 0.7 + Math.random() * 1.3;
      this.target = this.wander + (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 2.2);   // 35° ~ 160° 꺾기
      this.turnRate = 2.5 + Math.random() * 2.5;
      this.circleDir = Math.random() < 0.5 ? -1 : 1;
    }
    // 맵 가장자리에 가까우면 안쪽을 목표로
    const edge = WORLD_HALF - 10;
    if (Math.abs(p.x) > edge || Math.abs(p.z) > edge) { this.target = Math.atan2(-p.z, -p.x); if (this.mode === 'stop') this.mode = 'go'; }
    if (this.mode === 'circle') this.wander += this.circleDir * 1.6 * dt;
    else {
      const diff = Math.atan2(Math.sin(this.target - this.wander), Math.cos(this.target - this.wander));
      this.wander += Math.sign(diff) * Math.min(Math.abs(diff), this.turnRate * dt);
    }
    this.input.virtual.clear();
    if (this.mode === 'stop') this.input.vdir.set(0, 0, 0);
    else this.input.vdir.set(Math.cos(this.wander), 0, Math.sin(this.wander));
    if (this.mode !== 'stop' && Math.random() < dt * 0.3) player.tryDash();
  }

  update(dt) {
    if (!this.active) return;
    if (this.mode === 'showcase') { this.showcase.update(dt); return; }
    this.t += dt;
    this.steer(dt);
    // 적이 계속 몰려옴
    this.spawnAcc += dt * 7;
    while (this.spawnAcc >= 1) {
      this.spawnAcc -= 1;
      if (this.sys.enemies.list.length < 140) this.spawnAround(rand(14, 18));
    }
    // 장면 전환: 끝나기 직전에 암전 → 새 장면 → 밝아짐
    const el = this.sys.cutEl;
    if (this.t >= CLIP - FADE && this.fadeT === 0) { this.fadeT = 1e-6; if (el) el.classList.add('on'); }
    if (this.t >= CLIP) {
      this.cut();
      this.fadeT = 0;
      if (el) setTimeout(() => el.classList.remove('on'), 60);
    }
  }
}
