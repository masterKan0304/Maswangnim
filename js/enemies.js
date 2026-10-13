import * as THREE from 'three';
import { ENEMY_TYPES, WORLD_HALF, STATUS, elemMul } from './config.js';
import { slimeBodyGeometry, slimeFaceGeometry, createKingSlime, createEliteSlime, createGerger } from './models.js';
import { game } from './state.js';
import { recordDamage } from './dps.js';
import { crabGeometry, hermitGeometry, createManta } from './beachModels.js';
import { beachGait } from './beachAI.js';
import { sfx } from './audio.js';

const MAX = 460;
const CELL = 2;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);
const WHITE = new THREE.Color(0xffffff);
const _eu = new THREE.Euler();
const TINT = {
  burn: new THREE.Color(0xff5a14), chill: new THREE.Color(0x9fe6ff), root: new THREE.Color(0x6a8a2a),
  poison: new THREE.Color(0x5fd34a), exhaust: new THREE.Color(0x4a6a9a), stun: new THREE.Color(0xffe066), fear: new THREE.Color(0x5a2a9a), night: new THREE.Color(0x07020c), cons: new THREE.Color(0xffe680),
};
const ELEM_NUM = { fire: 'fire', ice: 'ice', nature: 'nature', ocean: 'ocean', earth: 'earth', dark: 'dark', radiant: 'radiant' };
const key = (cx, cz) => (cx + 1000) * 4096 + (cz + 1000);

export class EnemyManager {
  constructor(scene, fx) {
    this.scene = scene;
    this.fx = fx;
    this.list = [];
    this.lures = [];   // 적을 끌어들이는 대상 (짚 인형) { x, z, r, radius, dead, hit(e) }
    this.clock = 0;    // 악의 (2초 피해 누적) 기준 시간
    this.grid = new Map();
    this.onKill = null;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0.0, flatShading: true });
    this.body = new THREE.InstancedMesh(slimeBodyGeometry(), bodyMat, MAX);
    this.body.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    this.body.castShadow = true;
    this.body.frustumCulled = false;
    this.body.count = 0;
    this.face = new THREE.InstancedMesh(slimeFaceGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true }), MAX);
    this.face.frustumCulled = false;
    this.face.count = 0;
    scene.add(this.body, this.face);
    // 해변 몬스터 (꽃게 · 소라게): 색이 칠해진 한 덩어리 모양을 인스턴스로
    this.kinds = {};
    for (const [k, geo] of [['crab', crabGeometry()], ['hermit', hermitGeometry()]]) {
      const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, flatShading: true }), MAX);
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
      m.castShadow = true; m.frustumCulled = false; m.count = 0;
      scene.add(m);
      geo.computeBoundingBox();
      this.kinds[k] = m;
    }
  }

  spawn(type, x, z, hpMul = 1) {
    const T = ENEMY_TYPES[type];
    const e = {
      type, T, x, z,
      hp: T.hp * hpMul, maxHp: T.hp * hpMul,
      r: T.radius, speed: T.speed * (0.9 + Math.random() * 0.2), dmg: T.dmg,
      phase: Math.random(), flash: 0, rot: 0, kx: 0, kz: 0,
      alive: true, boss: type === 'boss' || !!T.boss, color: new THREE.Color(T.color),
      y: 0, sy: 1, sxz: 1, spawnT: 0,
      burnT: 0, burnDmg: 0, burnTick: 0, chillT: 0, shockT: 0, rootT: 0,
      poisonT: 0, poisonTick: 0, exhaustT: 0, stunT: 0, fearT: 0, fearImmune: 0, consT: 0, consAcc: 0, resDown: 0, resDownT: 0, fearZone: null, fearZoneT: 0, consZoneT: 0, bleeds: null, malice: null, nightmareT: 0, charmT: 0, element: T.element || null,
    };
    e.elite = type === 'elite' || type === 'gergerE';   // 몬스터 게르게르: 정예와 같은 대우 (보상 · 상태이상 시간)
    if (T.model === 'mata' || T.model === 'mantan') {
      e.model = createManta(T.model === 'mata');
      this.scene.add(e.model.group);
    } else if (type === 'gergerE') {
      e.model = createGerger();
      e.model.group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      this.scene.add(e.model.group);
    } else if (type === 'boss' || type === 'elite') {
      e.model = type === 'boss' ? createKingSlime() : createEliteSlime();
      this.scene.add(e.model.group);
      e.summonT = 5;
    }
    this.list.push(e);
    return e;
  }

  buildGrid() {
    this.grid.clear();
    for (const e of this.list) {
      const k = key(Math.floor(e.x / CELL), Math.floor(e.z / CELL));
      let a = this.grid.get(k);
      if (!a) { a = []; this.grid.set(k, a); }
      a.push(e);
    }
  }

  query(x, z, r, out = []) {
    const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL);
    const z0 = Math.floor((z - r) / CELL), z1 = Math.floor((z + r) / CELL);
    for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
      const a = this.grid.get(key(cx, cz));
      if (a) for (const e of a) if (e.alive) out.push(e);
    }
    return out;
  }

  nearestN(x, z, range, n) {
    const c = [];
    for (const e of this.list) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - x, e.z - z) - e.r * 0.5;
      if (d <= range) c.push([d, e]);
    }
    c.sort((a, b) => a[0] - b[0]);
    return c.slice(0, n).map((v) => v[1]);
  }

  anyInRange(x, z, range) {
    for (const e of this.list) if (e.alive && Math.hypot(e.x - x, e.z - z) - e.r * 0.5 <= range) return true;
    return false;
  }

  randomInRange(x, z, range, exclude) {
    const c = this.query(x, z, range + 2).filter((e) => !exclude.has(e) && Math.hypot(e.x - x, e.z - z) - e.r * 0.5 <= range);
    return c.length ? c[Math.floor(Math.random() * c.length)] : null;
  }

  // element: 'fire' | 'ice' | 'nature' | 'ocean' | 'earth' | 'dark' | 'radiant', status: 상태이상 부여 확률(0~1). 상태이상을 먼저 부여한 뒤 피해 적용
  // pen: 저항 무시 { pct(0~1), flat }, crit: 치명타 여부, src/st: 피해를 준 스킬 (처치 시 효과용)
  // (dot: 지속 피해는 상태이상을 부여하지 않음)
  // raw: 공포 추가 피해 / 축성 폭발처럼 다른 효과에서 나온 피해 (다시 공포 · 축성에 쌓이지 않음)
  damage(e, amount, { kx = 0, kz = 0, color, element = null, status = 0, dot = false, pen = null, crit = false, src = null, st = null, raw = false, numAt = null } = {}) {
    if (!e.alive) return 0;
    // 같은 속성끼리는 상태이상을 걸 수 없음
    if (element && !dot && element !== e.element && Math.random() < status && this.applyStatus(e, element, amount, src, st) !== false) this.statusHit = true;   // 지대 생성 문장용
    // 속성 저항: 피해 × 100 / (100 + 저항). 저항 무시로 음수가 되면 그만큼 더 받음
    if (element) {
      let res = (e.T.res || 0) + ((e.T.resEl && e.T.resEl[element]) || 0);   // 속성별 추가 저항 (마타 · 만탄: 해양)
      if (e.resDownT > 0) res -= e.resDown || 0;   // 대지 지대: 모든 저항 감소
      if (pen) res = res * (1 - Math.min(1, pen.pct)) - pen.flat;
      amount *= res >= 0 ? 100 / (100 + res) : 2 - 100 / (100 - res);
    }
    amount *= elemMul(e.element, element);   // 속성 상성: 약점 25% 더 / 저항 25% 덜
    if (element === 'fire' && e.fireVuln) amount *= 1 + e.fireVuln;   // 화염 방사 5레벨 취약
    if (!color && element) color = ELEM_NUM[element];
    if (!src) amount *= game.mods.dmgMul;   // 스킬이 아닌 피해(꽃 등)만 여기서 — 스킬 피해는 능력치에 이미 반영
    amount = amount > 0 ? Math.max(1, Math.round(amount)) : 0;   // 실제 피해는 소수점 반올림 (최소 1)
    // 공포: 받는 피해의 20% 를 칠흑 피해로 더 받음 / 축성: 받는 피해를 쌓아 둠
    const fearExtra = !raw && (e.fearT > 0 || e.nightmareT > 0) && amount > 0 ? Math.max(1, Math.round(amount * (e.nightmareT > 0 ? STATUS.nightmareExtra : STATUS.fearExtra) * (e.charmT > 0 ? 2 : 1))) : 0;   // 현혹: 2배   // 공포 20% / 악몽 50%
    if (!raw && e.consT > 0) e.consAcc += amount + fearExtra;
    recordDamage(src, amount + fearExtra);    // DPS 표 기록
    e.hp -= amount + fearExtra;
    if (fearExtra) this.fx.numbers.spawn(e.x + 0.35, 1.3 + e.r * 1.4, e.z, fearExtra, 'dark');
    e.flash = 0.12;
    const kb = e.boss ? 0.1 : e.elite ? 0.3 : 1;
    e.kx += kx * kb; e.kz += kz * kb;
    this.fx.numbers.spawn(e.x, 0.9 + e.r * 1.4, e.z, crit ? `${amount}!` : amount, (color || '') + (crit ? ' crit' : ''), numAt);
    if (!dot) sfx('hit');
    if (e.hp <= 0) {
      e.alive = false;
      sfx('kill');
      this.fx.particles.burst(e.x, 0.4, e.z, e.boss ? 60 : e.elite ? 30 : 12, [e.T.color, 0xffffff, e.T.color], { speed: e.boss ? 8 : e.elite ? 5 : 3.5, size: e.boss ? 0.35 : e.elite ? 0.24 : 0.16, life: 0.6, up: 4 });
      this.fx.splat(e.x, e.z, e.T.color, e.r);
      if (e.model) this.scene.remove(e.model.group);
      // 게르게르 '악의': 공포 · 악몽 상태인 적을 처치하면 어둠 게이지 +2
      if (game.charId === 'gerger' && (e.fearT > 0 || e.nightmareT > 0) && game.sys.player && game.sys.player.addGauge) game.sys.player.addGauge(2);
      if (this.onKill) this.onKill(e, src, st);
    } else if (game.charId === 'gerger' && amount > 0) this.malice(e, amount + fearExtra);
    return amount + fearExtra;
  }

  // 게르게르 '악의': 2초 안에 최대 체력의 50% 피해 → 공포
  malice(e, v) {
    const w = e.malice || (e.malice = []);
    w.push(this.clock, v);
    while (w.length && w[0] < this.clock - 2) w.splice(0, 2);
    let sum = 0;
    for (let i = 1; i < w.length; i += 2) sum += w[i];
    if (sum < e.maxHp * 0.5) return;
    w.length = 0;
    if (e.element === 'dark' || e.fearT > 0 || e.nightmareT > 0) return;
    if (this.applyStatus(e, 'dark', 0) === false) return;
    this.fx.particles.burst(e.x, 0.8 + e.r, e.z, 14, [0x14051f, 0x7a3aff, 0xd9a8ff], { speed: 2.5, size: 0.1, life: 0.5, up: 3 });
    this.fx.ring(e.x, e.z, e.r * 1.5, 0x9a6bff, 0.4);
  }

  // 악몽: 공포 중에 공포가 다시 걸리면 (또는 암흑의 눈 3레벨) — 3초간 제자리에 멈춤 (정예 · 보스는 60% 감속),
  // 받는 피해의 50% 를 칠흑 피해로 더 받음. 악몽 중에는 갱신되지 않고, 풀리면 공포 면역 3초
  nightmare(e, t = STATUS.duration) {
    if (!e.alive || e.element === 'dark' || e.nightmareT > 0 || e.fearImmune > 0) return false;
    e.fearT = 0; e.fearZone = null;
    e.nightmareT = t;
    e.nightmareMax = t;
    this.fx.particles.burst(e.x, 0.8 + e.r, e.z, 16, [0x07020c, 0x3a1a5a, 0xc040ff], { speed: 2.2, size: 0.12, life: 0.55, up: 2.5 });
    return true;
  }

  // 출혈: total 만큼의 피해를 dur 초에 걸쳐 0.2초마다 (모든 저항 무시 고정 피해)
  addBleed(e, total, dur, src = null) {
    if (!(total > 0) || !e.alive) return;
    const b = e.bleeds || (e.bleeds = []);
    if (b.length >= 40) b.shift();
    b.push({ left: total, per: total * 0.2 / dur, t: 0.2, src });
  }

  applyStatus(e, element, amount, src = null, st = null) {
    if (element === 'fire') {
      e.burnSrc = src; e.burnSt = st;
      e.burnT = STATUS.duration;
      e.burnDmg = Math.max(1, amount * (0.1 + Math.random() * 0.1));
      if (e.burnTick <= 0) e.burnTick = STATUS.burnTick;
    } else if (element === 'ice') {
      if (e.chillT <= 0) this.fx.particles.burst(e.x, 0.5, e.z, 6, [0xd8f8ff, 0x9fe6ff], { speed: 1.5, size: 0.07, life: 0.4, up: 1.5 });
      e.chillT = STATUS.duration;
    } else if (element === 'nature') {
      // 중독: 3초간 1초마다 최대 체력의 일정 비율
      e.poisonSrc = src; e.poisonSt = st;
      if (e.poisonT <= 0) e.poisonTick = STATUS.poisonTick;
      e.poisonT = STATUS.duration;
    } else if (element === 'ocean') {
      e.exhaustT = STATUS.duration;                 // 탈진
    } else if (element === 'earth') {
      const mul = e.boss ? STATUS.stunMul.boss : e.elite ? STATUS.stunMul.elite : 1;
      e.stunT = Math.max(e.stunT, STATUS.stun * mul);   // 기절
    } else if (element === 'dark') {
      // 공포: 풀린 뒤 3초간은 다시 걸리지 않음
      if (e.nightmareT > 0 || e.fearImmune > 0) return false;   // 악몽 중 (갱신 없음) / 면역
      if (e.fearT > 0) return this.nightmare(e);                 // 공포 중에 다시 공포 → 악몽
      e.fearT = STATUS.duration * (e.boss || e.elite ? STATUS.fearBossMul : 1);
    } else if (element === 'radiant') {
      // 축성 중 다시 걸리면 쌓인 피해의 100% 를 바로 주고 새로 축성
      // (광휘 지대 안: 100% 를 주되 쌓인 피해는 그대로 — 계속 누적)
      if (e.consT > 0 && e.consZoneT > 0) { this.consBurst(e, STATUS.consecrateRe, true); return; }
      if (e.consT > 0 && e.consAcc > 0) this.consBurst(e, STATUS.consecrateRe);
      e.consSrc = src; e.consSt = st;
      e.consT = STATUS.duration; e.consAcc = 0;
    }
  }

  // 지대 안에 있는 동안 상태이상 유지 (대지: 모든 저항 감소 / 칠흑: 공포 + 지대 안에 갇힘 / 광휘: 축성 유지)
  holdStatus(e, zn) {
    if (zn.el === 'earth') {
      // 대지 지대: 기절 대신 모든 저항 감소 (지대를 만든 공격 피해의 50%, 여러 지대가 겹치면 가장 큰 값)
      const v = Math.round((zn.burnBase || 0) * 0.5);
      if (!(e.resDownT > 0) || v > (e.resDown || 0)) e.resDown = v;
      e.resDownT = 0.45;
    }
    else if (zn.el === 'dark') {
      e.fearT = Math.max(e.fearT, 0.5); e.fearImmune = 0;
      if (!e.elite && !e.boss) { e.fearZone = zn; e.fearZoneT = 0.45; }   // 정예 · 보스는 지대를 벗어날 수 있음
    } else if (zn.el === 'radiant') {
      if (e.consT <= 0) { e.consT = STATUS.duration; e.consAcc = 0; e.consSrc = zn.src; e.consSt = zn.st; }
      e.consT = Math.max(e.consT, 0.5);
      e.consZoneT = 0.45;
    }
  }

  // 축성 폭발: 쌓인 피해의 일정 비율을 광휘 피해로
  consBurst(e, ratio, keep = false) {
    const v = e.consAcc * ratio;
    if (!keep) e.consAcc = 0;
    if (v <= 0 || !e.alive) return;
    this.fx.particles.burst(e.x, 0.6 + e.r, e.z, 14, [0xffe680, 0xffffff, 0xfff3b0], { speed: 3, size: 0.12, life: 0.5, up: 4 });
    this.fx.ring(e.x, e.z, e.r * 1.6, 0xffe680, 0.4);
    this.damage(e, v, { element: 'radiant', dot: true, raw: true, color: 'radiant', src: e.consSrc, st: e.consSt });
  }

  updateStatus(e, dt) {
    if (e.rootT > 0) e.rootT -= dt;
    if (e.fearZoneT > 0) { e.fearZoneT -= dt; if (e.fearZoneT <= 0) e.fearZone = null; }
    if (e.bleeds && e.bleeds.length) {
      for (let i = e.bleeds.length - 1; i >= 0; i--) {
        const b = e.bleeds[i];
        b.t -= dt;
        if (b.t > 0) continue;
        b.t += 0.2;
        const v = Math.min(b.per, b.left);
        b.left -= v;
        if (b.left <= 1e-6) e.bleeds.splice(i, 1);
        this.damage(e, v, { dot: true, color: 'bleed', src: b.src });   // 속성 없음 → 저항 무시
        if (!e.alive) return;
      }
      // 핏방울: 튀어 올랐다가 중력에 떨어짐 + 바닥에 핏자국
      if (Math.random() < dt * 16) {
        const a = Math.random() * Math.PI * 2, v = 0.6 + Math.random() * 1.2;
        this.fx.particles.emit(e.x + Math.cos(a) * e.r * 0.4, 0.4 + Math.random() * e.r, e.z + Math.sin(a) * e.r * 0.4, Math.cos(a) * v, 1 + Math.random() * 1.6, Math.sin(a) * v, 0.55 + Math.random() * 0.3, 0.06 + Math.random() * 0.06, Math.random() < 0.6 ? 0xd0203a : 0x8a0a1a, 14);
      }
      if (Math.random() < dt * 3.5) this.fx.splat(e.x + (Math.random() - 0.5) * e.r * 1.4, e.z + (Math.random() - 0.5) * e.r * 1.4, Math.random() < 0.5 ? 0x9a0a1a : 0x6a0410, 0.12 + Math.random() * 0.16);
    }
    if (e.consZoneT > 0) e.consZoneT -= dt;
    if (e.charmT > 0) e.charmT -= dt;
    if (e.resDownT > 0) { e.resDownT -= dt; if (e.resDownT <= 0) e.resDown = 0; }
    if (e.poisonT > 0) {
      e.poisonT -= dt; e.poisonTick -= dt;
      if (Math.random() < dt * 6) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r, 0.4 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r, 0, 0.9, 0, 0.5, 0.08, Math.random() < 0.5 ? 0x6fd36a : 0xb8f5a0, -0.5);
      if (e.poisonTick <= 0) {
        e.poisonTick += STATUS.poisonTick;
        const pct = e.boss ? STATUS.poisonPct.boss : e.elite ? STATUS.poisonPct.elite : STATUS.poisonPct.normal;
        this.damage(e, e.maxHp * pct, { element: 'nature', dot: true, color: 'poison', src: e.poisonSrc, st: e.poisonSt });
        if (!e.alive) return;
      }
    }
    if (e.exhaustT > 0) e.exhaustT -= dt;
    if (e.stunT > 0) {
      e.stunT -= dt;
      if (Math.random() < dt * 8) { const a = Math.random() * Math.PI * 2; this.fx.particles.emit(e.x + Math.cos(a) * e.r * 0.7, 0.6 + e.r * 1.6, e.z + Math.sin(a) * e.r * 0.7, -Math.sin(a) * 1.5, 0.2, Math.cos(a) * 1.5, 0.35, 0.08, 0xffe066, 0); }
    }
    if (e.nightmareT > 0) {
      e.nightmareT -= dt;
      if (e.nightmareT <= 0) e.fearImmune = STATUS.fearImmune;   // 악몽이 풀리면 공포 면역
      if (Math.random() < dt * 7) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r, 0.6 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r, 0, 0.9, 0, 0.6, 0.1, Math.random() < 0.5 ? 0x14051f : 0xc040ff, -0.6);
    }
    if (e.fearT > 0) {
      e.fearT -= dt;
      if (e.fearT <= 0) e.fearImmune = STATUS.fearImmune;
      if (Math.random() < dt * 6) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r, 0.5 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r, 0, 1, 0, 0.5, 0.09, Math.random() < 0.5 ? 0x5a2a9a : 0x9a6bff, -0.8);
    } else if (e.fearImmune > 0) e.fearImmune -= dt;
    if (e.consT > 0) {
      e.consT -= dt;
      if (Math.random() < dt * 5) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r, 0.5 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r, 0, 0.8, 0, 0.5, 0.07, 0xffe680, -0.5);
      if (e.consT <= 0) { this.consBurst(e, STATUS.consecrate); if (!e.alive) return; }
    }
    if (e.burnT > 0) {
      e.burnT -= dt;
      e.burnTick -= dt;
      if (Math.random() < dt * 10) this.fx.particles.emit(e.x + (Math.random() - 0.5) * e.r, 0.3 + Math.random() * e.r, e.z + (Math.random() - 0.5) * e.r,
        0, 1.2, 0, 0.4, 0.1, Math.random() < 0.5 ? 0xff7a2a : 0xffc04a, -2);
      if (e.burnTick <= 0) {
        e.burnTick += STATUS.burnTick;
        this.damage(e, e.burnDmg, { element: 'fire', dot: true, color: 'burn', src: e.burnSrc, st: e.burnSt });
      }
      if (e.burnT <= 0) e.burnTick = 0;
    }
    if (e.chillT > 0) e.chillT -= dt;
  }

  update(dt, player, obstacles) {
    this.clock = (this.clock || 0) + dt;
    // 죽은 적 제거 (in-place)
    let w = 0;
    for (let i = 0; i < this.list.length; i++) if (this.list[i].alive) this.list[w++] = this.list[i];
    this.list.length = w;
    this.buildGrid();

    const px = player.pos.x, pz = player.pos.z;
    const lim = WORLD_HALF;
    for (const e of this.list) {
      e.spawnT += dt;
      // 미리보기에서 소환된 적: 잠시 뒤 스르륵 사라짐
      if (e.ttl != null) { e.ttl -= dt; if (e.ttl <= 0) { e.alive = false; continue; } }
      // 보스 기술 중 (힘 모으기 / 도약 / 점프): 위치와 모양은 기술이 직접 정함
      if (e.hold) {
        if (e.flash > 0) e.flash -= dt;
        e.kx = 0; e.kz = 0;
        this.updateStatus(e, dt);
        continue;
      }
      // 유인 (짚 인형): 범위 안에 있으면 인형을 쫓음
      let tx = px, tz = pz, lure = null;
      for (const l of this.lures) {
        if (l.dead || Math.hypot(l.x - e.x, l.z - e.z) > l.r) continue;
        if (!lure || Math.hypot(l.x - e.x, l.z - e.z) < Math.hypot(lure.x - e.x, lure.z - e.z)) lure = l;
      }
      if (lure) { tx = lure.x; tz = lure.z; }
      let dx = tx - e.x, dz = tz - e.z;
      const dist = Math.hypot(dx, dz) || 1;
      dx /= dist; dz /= dist;
      if (e.fearT > 0 && e.fearZone) {
        // 칠흑 지대 안의 공포: 지대 안을 이리저리 방황
        if (e.wanderA == null || Math.random() < dt * 1.5) e.wanderA = Math.random() * Math.PI * 2;
        dx = Math.cos(e.wanderA); dz = Math.sin(e.wanderA);
      } else if ((e.fearT > 0 || e.nightmareT > 0) && !(e.charmT > 0)) { dx = -dx; dz = -dz; }   // 공포: 플레이어에게서 정반대로 달아남 (악몽: 일반은 멈춤, 정예 · 보스는 느리게 달아남)

      // 해변 몬스터: 각자의 걸음 (꽃게 옆걸음 · 소라게 돌진 · 마타/만탄 걷기)
      const gait = e.T.ai && !(e.fearT > 0 && e.T.ai === 'hermit' && !e.dash) ? beachGait(e, dt, dx, dz, dist) : null;
      if (gait) { dx = gait.dx; dz = gait.dz; }
      // 돌진하는 소라게 주위의 회오리
      if (e.dash && e.dash.ph === 'dash' && Math.random() < 0.9) {
        for (let q = 0; q < 2; q++) {
          const a = Math.random() * Math.PI * 2, rr = e.r * (1 + Math.random() * 0.8), h = Math.random() * e.r * 2;
          this.fx.particles.emit(e.x + Math.cos(a) * rr, 0.1 + h, e.z + Math.sin(a) * rr, -Math.sin(a) * 5 * rr, 1.2 + Math.random(), Math.cos(a) * 5 * rr, 0.35, 0.06 + Math.random() * 0.05, Math.random() < 0.5 ? 0xf2dca0 : 0xe8f6ff, 0.5);
        }
        if (Math.random() < 0.25) this.fx.ring(e.x, e.z, e.r * 1.5, 0xe8f6ff, 0.3, 0.2 + Math.random() * 0.5);
      }
      // 통통 튀는 이동
      e.phase += dt * (e.boss ? 0.75 : 1.6);
      const p = e.phase % 1;
      const air = p < 0.6;
      const charmed = e.charmT > 0 && (e.fearT > 0 || e.nightmareT > 0);   // 현혹: 달아나거나 멈추지 않고 플레이어에게 서서히 다가옴
      const nmStop = e.nightmareT > 0 && !e.elite && !e.boss && !charmed;   // 악몽: 제자리에 멈춤
      const mv = e.rootT > 0 || e.stunT > 0 || nmStop ? 0 : (gait ? gait.speed : e.speed * (air ? 1.4 : 0.3)) * (e.chillT > 0 ? 1 - STATUS.slow : 1) * (charmed ? 0.35 : e.nightmareT > 0 ? 1 - STATUS.nightmareSlow : e.fearT > 0 ? 1 - STATUS.fearSlow : 1);   // 속박 / 기절: 멈춤, 공포: 30% 느림
      let vx = dx * mv, vz = dz * mv;

      // 분리 (겹침 방지)
      const cx = Math.floor(e.x / CELL), cz = Math.floor(e.z / CELL);
      for (let ox = -1; ox <= 1; ox++) for (let oz = -1; oz <= 1; oz++) {
        const a = this.grid.get(key(cx + ox, cz + oz));
        if (!a) continue;
        for (const o of a) {
          if (o === e) continue;
          const sx = e.x - o.x, sz = e.z - o.z;
          const rr = (e.r + o.r) * 0.85;
          const d2 = sx * sx + sz * sz;
          if (d2 < rr * rr && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const push = ((rr - d) / rr) * (o.boss ? 9 : 4);
            vx += (sx / d) * push; vz += (sz / d) * push;
          }
        }
      }
      e.x += (vx + e.kx) * dt;
      e.z += (vz + e.kz) * dt;
      const decay = Math.exp(-7 * dt);
      e.kx *= decay; e.kz *= decay;
      if (!e.boss) obstacles.resolve(e, e.r * 0.75);
      // 칠흑 지대에 갇힘: 가장자리에 닿으면 안쪽으로 돌아섬
      if (e.fearZone && e.fearT > 0) {
        const zn = e.fearZone, ox = e.x - zn.x, oz = e.z - zn.z, d = Math.hypot(ox, oz), lim2 = Math.max(0.3, zn.r - e.r * 0.4);
        if (d > lim2) { e.x = zn.x + (ox / d) * lim2; e.z = zn.z + (oz / d) * lim2; e.wanderA = Math.atan2(-oz, -ox) + (Math.random() - 0.5) * 1.6; }
      }
      e.x = Math.max(-lim, Math.min(lim, e.x));
      e.z = Math.max(-lim, Math.min(lim, e.z));

      // 회전 (부드럽게) — 꽃게 · 돌진 중인 소라게는 스스로 정함
      if (!(gait && gait.keepRot) && (dx || dz)) {
        const target = Math.atan2(dx, dz);
        let diff = target - e.rot;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        e.rot += diff * Math.min(1, dt * 8);
      }
      e.tilt = gait && gait.tilt ? gait.tilt : 0;
      e.spinY = gait && gait.spin ? gait.spin : 0;

      // 스쿼시 & 스트레치 (해변 몬스터는 튀지 않음)
      if (gait) {
        e.y = gait.y || 0; e.sy = 1;
      } else if (air) {
        const k = Math.sin((p / 0.6) * Math.PI);
        e.y = k * (e.boss ? 0.8 : 0.35);
        e.sy = 1 + 0.14 * k;
      } else {
        const k = Math.sin(((p - 0.6) / 0.4) * Math.PI);
        e.y = 0;
        e.sy = 1 - 0.22 * k;
      }
      e.sxz = 1 / Math.sqrt(e.sy);
      if (e.flash > 0) e.flash -= dt;
      this.updateStatus(e, dt);
      if (!e.alive) continue;

      // 접촉 피해
      if (e.stunT > 0 || charmed) { /* 기절 · 현혹: 부딪혀도 피해 없음 */ }
      else if (lure) { if (Math.hypot(lure.x - e.x, lure.z - e.z) < e.r * 0.9 + lure.radius) lure.hit(e); }   // 인형이 공격을 대신 받음
      else if (Math.hypot(px - e.x, pz - e.z) < e.r * 0.9 + player.radius) player.takeDamage(e.dmg * (e.dashing ? 1.5 : 1), e.element);   // 소라게 돌진: 150%

    }
  }

  // 상태이상 색 표시
  tint(e, out, t = 0) {
    out.copy(e.color);
    if (e.chillT > 0) out.lerp(TINT.chill, 0.5);
    if (e.burnT > 0) out.lerp(TINT.burn, 0.3 + 0.15 * Math.sin(t * 20 + e.phase * 10));
    if (e.poisonT > 0) out.lerp(TINT.poison, 0.35 + 0.1 * Math.sin(t * 6 + e.phase * 10));
    if (e.exhaustT > 0) out.lerp(TINT.exhaust, 0.4);
    if (e.stunT > 0 && Math.sin(t * 24 + e.phase * 20) > 0) out.lerp(TINT.stun, 0.45);
    if (e.fearT > 0) out.lerp(TINT.fear, 0.5);
    if (e.nightmareT > 0) { out.lerp(TINT.fear, 0.6); out.lerp(TINT.night, 0.35 + 0.35 * Math.sin(t * 5 + e.phase * 10)); }   // 악몽: 보라 + 검정이 일렁임
    if (e.consT > 0) out.lerp(TINT.cons, 0.25 + 0.2 * Math.sin(t * 10 + e.phase * 10));
    if (e.rootT > 0) out.lerp(TINT.root, 0.45);
    return out;
  }

  render(t = 0) {
    let n = 0;
    const kn = { crab: 0, hermit: 0 };
    for (const e of this.list) {
      if (!e.alive) continue;
      const mk = e.T.mesh;
      if (mk) {
        // 꽃게 · 소라게 (색이 칠해진 모양 × 상태이상 색)
        const grow = Math.min(1, e.spawnT / 0.25) * (e.ttl != null ? Math.min(1, e.ttl / 0.5) : 1);
        const s = e.r * 2 * grow;
        // 뒤집힌 소라게: 소라 끝이 땅에 살짝 파묻히도록 (모양 높이만큼만 띄움)
        const full = this.kinds[mk].geometry.boundingBox.max.y * s * 0.86;
        _p.set(e.x, e.tilt ? full * (1 - Math.cos(e.tilt)) / 2 + Math.sin(e.tilt) * 0.3 * s : e.y, e.z);   // 뒤집는 중: 살짝 튀어 오르며 돌아감
        _q.setFromEuler(_eu.set(e.tilt || 0, e.rot + (e.spinY || 0), 0, 'YXZ'));
        _s.set(s, s, s);
        _m.compose(_p, _q, _s);
        const im = this.kinds[mk], i = kn[mk]++;
        im.setMatrixAt(i, _m);
        _c.copy(e.color); const base = e.color; e.color = WHITE; this.tint(e, _c, t); e.color = base;   // 흰색에서 시작한 상태이상 색
        if (e.flash > 0) _c.lerp(WHITE, 0.6).multiplyScalar(1.6);
        im.setColorAt(i, _c);
        continue;
      }
      const grow = Math.min(1, e.spawnT / 0.25) * (e.ttl != null ? Math.min(1, e.ttl / 0.5) : 1);
      const s = e.r * 2 * grow;
      if (e.model) {
        const g = e.model.group;
        g.position.set(e.x, e.y, e.z);
        g.rotation.y = e.rot;
        g.scale.set(s * e.sxz, s * e.sy, s * e.sxz);
        this.tint(e, _c, t);
        e.model.body.material.color.copy(_c);
        e.model.body.material.emissive.setRGB(e.flash > 0 ? 0.5 : 0, e.flash > 0 ? 0.5 : 0, e.flash > 0 ? 0.5 : 0);
        if (e.redGlow > 0) e.model.body.material.emissive.setRGB(0.55 + 0.25 * Math.sin(t * 30), 0, 0);   // 공격 직전: 붉게 (위험)
        if (e.model.blueMats) for (const bm of e.model.blueMats) bm.color.setHex(bm.userData.base).multiply(_c);   // 파란 망토도 상태이상 색
        if (e.model.kind === 'manta') {
          const w = Math.sin(t * 7 + e.phase * 10);
          e.model.legs.forEach((l, i) => { l.rotation.x = (i === 0 || i === 3 ? w : -w) * 0.45; });
          e.model.wings.forEach((wg, i) => { wg.rotation.z = (i ? 1 : -1) * (0.22 + 0.12 * Math.sin(t * 3 + e.phase * 6)); });
          if (e.model.bulb) e.model.bulb.scale.setScalar(1 + 0.12 * Math.sin(t * 4));
          if (e.model.train) e.model.train.rotation.y = Math.sin(t * 2 + e.phase * 6) * 0.07;   // 끌리는 꼬리 자락이 살랑
        }
        continue;
      }
      _p.set(e.x, e.y, e.z);
      _q.setFromAxisAngle(UP, e.rot);
      _s.set(s * e.sxz, s * e.sy, s * e.sxz);
      _m.compose(_p, _q, _s);
      this.body.setMatrixAt(n, _m);
      this.face.setMatrixAt(n, _m);
      this.tint(e, _c, t);
      if (e.flash > 0) _c.lerp(WHITE, 0.75);
      this.body.setColorAt(n, _c);
      n++;
      if (n >= MAX) break;
    }
    for (const k of Object.keys(this.kinds)) {
      const im = this.kinds[k];
      im.count = kn[k];
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
    this.body.count = n;
    this.face.count = n;
    this.body.instanceMatrix.needsUpdate = true;
    this.face.instanceMatrix.needsUpdate = true;
    this.body.instanceColor.needsUpdate = true;
  }
}
