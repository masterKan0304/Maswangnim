import { ic, hydrateIcons } from './icons.js';
import { toggleDebug, initDebug } from './debug.js';
import * as THREE from 'three';
import { game, isPaused, updateTimers, bump, inventoryAdd } from './state.js';
import { OVERKILL, STAGE_TIME, WORLD_HALF, MAX_ENEMIES, DROP, ENEMY_TYPES, BOX, START_REROLLS, ELITE_TIMES, xpToNext, hpScale } from './config.js';
import { createWorld } from './world.js';
import { FX } from './effects.js';
import { EnemyManager } from './enemies.js';
import { Pickups } from './pickups.js';
import { Player } from './player.js';
import { SkillRuntime } from './combat.js';
import { createSkill } from './skills.js';
import { randomBlock, randomDistinctBlocks, blockSig } from './blocks.js';
import { UI } from './ui.js';
import { Labels } from './labels.js';
import { rollChoices } from './levelup.js';
import { updateDpsTable } from './dps.js';
import { input, updateAim } from './input.js';
import { STAGE, fitStage, onStageResize } from './stage.js';
import { initAudio, sfx, setSfxMuted } from './audio.js';
import { loadKeys, actionsFor, keyOf } from './keys.js';
import { profile, loadProfile, saveProfile, computeMods, renderSettings, addAccountXp, masteryOf, addMasteryXp } from './meta.js';
import { CHARACTERS, DEFAULT_CHARACTER, masteryNeed } from './characters.js';
import { Bloom } from './bloom.js';
import { Demo } from './demo.js';
import { Tutorial } from './tutorial.js';
import { EnemySkills } from './bossai.js';
import { initCodex, renderCodexPreview, codexPreviewActive, TEMPLATE_DESC } from './codex.js';
import { makeSentence, RARITY_NAME } from './blocks.js';
import { initMenu, showMenu, hideMenu, menuBack, setView } from './menu.js';
import { stageById, stageLabel, lastStartable } from './stages.js';
import { SKILL_DEFS } from './skills.js';
import { TEMPLATE_INFO } from './blocks.js';
import { accountNeed } from './config.js';

// 로딩 진행도 (맵 / 시스템 준비 → 첫 화면을 그린 뒤 사라짐)
const loadingAt = (p) => { const f = document.getElementById('ld-fill'); if (f) f.style.width = `${p}%`; };
loadingAt(35);
hydrateIcons();   // HTML 의 아이콘 자리 표시를 SVG 아이콘으로 교체
initDebug();

// ─────────────────────────────────────────────
//  렌더러 / 카메라 (아이소메트릭 직교 카메라)
// ─────────────────────────────────────────────
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const VIEW = 18;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
const CAM_OFF = new THREE.Vector3(30, 27, 30);
let zoom = 1;

// 16:9 고정: 내부 해상도는 1920x1080 기준, 실제 표시 크기에 맞춰 픽셀 비율만 조절
function resize() {
  renderer.setPixelRatio(Math.min(2, devicePixelRatio * STAGE.scale));
  renderer.setSize(STAGE.W, STAGE.H, false);
  const a = STAGE.W / STAGE.H;
  camera.left = (-VIEW * a) / 2; camera.right = (VIEW * a) / 2;
  camera.top = VIEW / 2; camera.bottom = -VIEW / 2;
  // 메인 화면: 오른쪽 70% 영역의 가운데가 화면 중심이 되도록 옮겨 그림
  if (document.body.classList.contains('in-menu')) camera.setViewOffset(STAGE.W, STAGE.H, -STAGE.W * 0.15, 0, STAGE.W, STAGE.H);
  else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
onStageResize(resize);
fitStage();
addEventListener('wheel', (e) => {
  if (e.target !== canvas) return;
  zoom = THREE.MathUtils.clamp(zoom * (e.deltaY > 0 ? 0.92 : 1.08), 0.7, 1.5);
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
}, { passive: true });

// ─────────────────────────────────────────────
//  시스템 생성
// ─────────────────────────────────────────────
const world = createWorld(scene);
loadingAt(65);
const fx = new FX(scene, camera, document.getElementById('dmg-layer'));
const enemies = new EnemyManager(scene, fx);
const pickups = new Pickups(scene, fx);
const player = new Player(scene, fx);
const skillsRt = new SkillRuntime(scene, fx, enemies, player);
const enemySkills = new EnemySkills(scene, fx, enemies, player);
const bloom = new Bloom(scene, fx, enemies, player, skillsRt);   // 마솽 패시브: 개화 / 열매
const ui = new UI();
const labels = new Labels(document.getElementById('label-layer'), camera);
loadingAt(85);

game.sys = {
  scene, camera, fx, enemies, pickups, player, skillsRt, ui, world, enemySkills, bloom,
  hpMul: () => hpScale(game.time),
  dropBlocks(blocks, x, z, { requireExit = false, minD = 0.6, maxD = 1.6 } = {}) {
    blocks.forEach((b, i) => {
      const a = (i / blocks.length) * Math.PI * 2 + Math.random() * 0.8;
      const d = minD + Math.random() * (maxD - minD);
      const tx = THREE.MathUtils.clamp(x + Math.cos(a) * d, -WORLD_HALF, WORLD_HALF);
      const tz = THREE.MathUtils.clamp(z + Math.sin(a) * d, -WORLD_HALF, WORLD_HALF);
      pickups.addBlock(b, tx, tz, { fromX: x, fromZ: z, requireExit });
    });
  },
  onPlayerDeath() {
    if (game.state !== 'playing') return;
    game.state = 'over';
    fx.particles.burst(player.pos.x, 0.8, player.pos.z, 40, [0xf6cfae, 0x4a6fe3, 0xe04848], { speed: 5, size: 0.18, life: 1 });
    player.model.group.visible = false;
    setTimeout(() => showEndScreen('dead'), 900);
  },
};

// 적 처치 → 경험치 / 블록 드랍
enemies.onKill = (e, src, st) => {
  if (game.demo) {   // 메인 화면 미리보기: 경험치 보석만 떨어뜨림 (블록/상자/승리 없음)
    skillsRt.onKill(e, src, st);
    bloom.onKill(e);
    if (e.boss || e.elite) fx.explosion(e.x, e.z, e.boss ? 4 : 2.5, e.boss ? 0xb07cff : 0x3f8cff);
    if (!game.showcase) pickups.addGem(e.x, e.z, e.T.xp);   // 도감 미리보기에서는 경험치 없음
    return;
  }
  game.kills++;
  skillsRt.onKill(e, src, st);
  bloom.onKill(e);   // 개화: 처치 → 양분
  if (game.tutorial) { game.tutorial.onKill(e); return; }   // 튜토리얼: 드랍 / 경험치는 퀘스트가 정함
  if (e.noDrop) return;   // 보스 기술로 소환된 적: 아이템 / 경험치 없음
  if (e.boss) {
    fx.explosion(e.x, e.z, 4, 0xb07cff);
    if (!e.debugSpawn) startVictory();   // 디버그로 만든 보스는 처치해도 게임이 끝나지 않음
    return;
  }
  if (e.elite) {
    // 중간 보스: 블록 상자 1개 + 무작위 블록 2~4개 + 경험치 2배
    pickups.addGem(e.x, e.z, e.T.xp * 2);
    pickups.addChest(e.x, e.z);
    game.sys.dropBlocks(Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => randomBlock()), e.x, e.z, { minD: 1.2, maxD: 2.6 });
    fx.explosion(e.x, e.z, 2.5, 0x3f8cff);
    sfx('bigkill');
    return;
  }
  pickups.addGem(e.x, e.z, e.T.xp);
  // 블록 상자: 1% 에서 시작, 처치할 때마다 (체력 10당 1%) 곱연산으로 증가, 드랍되면 초기화
  if (Math.random() < game.boxChance) {
    pickups.addChest(e.x, e.z);
    game.boxChance = BOX.baseChance;
  } else {
    game.boxChance *= 1 + BOX.growPer10Hp * (e.maxHp / 10);
  }
  if (Math.random() < DROP.chance * game.mods.dropMul) game.sys.dropBlocks([randomBlock()], e.x, e.z, { minD: 0.3, maxD: 1.0 });
};

function addXp(v) {
  v *= game.mods.xpMul;
  game.totalXp += v;
  if (game.state === 'victory') return;   // 보스 처치 후에는 레벨업 없이 골드용으로만 집계
  skillsRt.onXp(v);
  game.xp += v;
  if (game.debug.noLevelUp) { game.xp = Math.min(game.xp, xpToNext(game.level) - 0.01); return; }   // 디버그: 레벨업 막기
  while (game.xp >= xpToNext(game.level)) {
    game.xp -= xpToNext(game.level);
    game.level++;
    game.pendingLevels++;
  }
}

// ─────────────────────────────────────────────
//  적 생성 디렉터
// ─────────────────────────────────────────────
let spawnAcc = 0;
let nextWave = 60;
const _v = new THREE.Vector3();

function offscreenSpot() {
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = 18 + Math.random() * 14;
    const x = player.pos.x + Math.cos(a) * d, z = player.pos.z + Math.sin(a) * d;
    if (Math.abs(x) > WORLD_HALF - 0.5 || Math.abs(z) > WORLD_HALF - 0.5) continue;
    _v.set(x, 0.5, z).project(camera);
    if (Math.abs(_v.x) > 1.08 || Math.abs(_v.y) > 1.12) return { x, z };
  }
  return null;
}

function pickType(t) {
  const w = { green: 1 };
  if (t > 45) w.yellow = Math.min(0.7, (t - 45) / 180);
  if (t > 150) w.red = Math.min(0.5, (t - 150) / 300);
  let total = 0;
  for (const k in w) total += w[k];
  let r = Math.random() * total;
  for (const k in w) { r -= w[k]; if (r <= 0) return k; }
  return 'green';
}

function spawnEnemy(type) {
  const s = offscreenSpot();
  if (!s) return;
  enemies.spawn(type || pickType(game.time), s.x, s.z, hpScale(game.time));
}

// 오버킬 시간: 맵의 적(보스 기술로 소환된 적 제외)이 30 이하면 줄고, 90 이상이면 늘어남 (최대 3분)
function updateOverkill(dt) {
  if (game.time >= STAGE_TIME) { game.timeMul = 1; return; }   // 보스 등장 후에는 가속 없음
  let n = 0;
  for (const e of enemies.list) if (e.alive && !e.noDrop) n++;
  if (n <= OVERKILL.low) game.overkill = Math.max(0, game.overkill - dt);
  else if (n >= OVERKILL.high) game.overkill = Math.min(OVERKILL.max, game.overkill + dt);
  game.timeMul = game.overkill <= 0 ? OVERKILL.mul2 : game.overkill <= OVERKILL.fast ? OVERKILL.mul1 : 1;
}

function director(dt) {
  const t = game.time;
  const rate = t < STAGE_TIME ? 0.8 + (t / STAGE_TIME) * 5.4 : 2.2;
  spawnAcc += rate * dt;
  while (spawnAcc >= 1) {
    spawnAcc -= 1;
    if (enemies.list.length < MAX_ENEMIES) spawnEnemy();
  }
  // 매 분 웨이브: 플레이어를 둘러싸는 원형 무리
  if (t >= nextWave && t < STAGE_TIME) {
    nextWave += 60;
    const n = 14 + Math.floor(t / 60) * 3;
    const type = t < 180 ? 'green' : t < 360 ? 'yellow' : 'red';
    for (let i = 0; i < n && enemies.list.length < MAX_ENEMIES; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = THREE.MathUtils.clamp(player.pos.x + Math.cos(a) * 17, -WORLD_HALF, WORLD_HALF);
      const z = THREE.MathUtils.clamp(player.pos.z + Math.sin(a) * 17, -WORLD_HALF, WORLD_HALF);
      enemies.spawn(type, x, z, hpScale(t));
    }
    ui.toast(`${ic('warn')} 슬라임 무리가 몰려옵니다!`, 'warn');
  }
  // 중간 보스 (2/4/6/8분)
  if (game.eliteIdx < ELITE_TIMES.length && t >= ELITE_TIMES[game.eliteIdx]) {
    game.eliteIdx++;
    const a = Math.random() * Math.PI * 2;
    const x = THREE.MathUtils.clamp(player.pos.x + Math.cos(a) * 14, -WORLD_HALF + 2, WORLD_HALF - 2);
    const z = THREE.MathUtils.clamp(player.pos.z + Math.sin(a) * 14, -WORLD_HALF + 2, WORLD_HALF - 2);
    game.elite = enemies.spawn('elite', x, z, hpScale(t));
    fx.ring(x, z, 3, 0x3f8cff, 0.8);
    ui.toast(`${ic('gem')} 정예 슬라임이 나타났다!`, 'boss');
    sfx('elite');
  }
  // 보스
  if (t >= STAGE_TIME && !game.bossSpawned) {
    game.bossSpawned = true;
    const a = Math.atan2(player.aim.z, player.aim.x);
    const x = THREE.MathUtils.clamp(player.pos.x + Math.cos(a) * 12, -WORLD_HALF + 3, WORLD_HALF - 3);
    const z = THREE.MathUtils.clamp(player.pos.z + Math.sin(a) * 12, -WORLD_HALF + 3, WORLD_HALF - 3);
    game.boss = enemies.spawn('boss', x, z, 1);
    fx.ring(x, z, 6, 0xb07cff, 1.0);
    ui.toast(`${ic('crown')} 킹 슬라임이 나타났다!`, 'boss');
    sfx('boss');
  }
}

// ─────────────────────────────────────────────
//  레벨업
// ─────────────────────────────────────────────
let currentChoices = null;
function openLevelUp() {
  game.state = 'levelup';
  blockPickMode = 'level';
  currentChoices = (game.tutorial && game.tutorial.levelChoices()) || rollChoices();
  ui.showLevelUp(currentChoices, pickChoice, reroll);
}
function finishLevelUp() {
  game.pendingLevels--;
  ui.hideLevelUp();
  game.state = 'playing';
  ui.refresh();
}
function pickChoice(c) {
  if (game.tutorial && !game.tutorial.onPick(c)) return;   // 튜토리얼: 리롤 전에는 고를 수 없음
  if (c.type === 'pickBlock') { openBlockPick(); return; }
  c.apply();
  finishLevelUp();
}
function reroll() {
  if (game.rerolls <= 0) return;
  game.rerolls--;
  sfx('reroll');
  currentChoices = (game.tutorial && game.tutorial.reroll()) || rollChoices(new Set(currentChoices.map((c) => c.id)));
  ui.showLevelUp(currentChoices, pickChoice, reroll);
}

// 블록 선택 획득: 무작위 블록 3개 중 하나 선택 (리롤 시 직전 블록과 같은 유형+값은 제외)
let blockChoices = [];
let blockPickMode = 'level';   // 'level' | 'box'
function openBlockPick(exclude = new Set()) {
  blockChoices = randomDistinctBlocks(3, exclude);
  ui.showBlockPick(blockChoices, pickBlock, rerollBlocks, blockPickMode === 'box' ? `${ic('gift')} 블록 상자` : '블록 선택');
}
function pickBlock(b) {
  if (!inventoryAdd(b)) game.sys.dropBlocks([b], player.pos.x, player.pos.z, { minD: 1.5, maxD: 2.5 });
  ui.onPickup(b);
  if (blockPickMode === 'box') {
    game.pendingBoxes--;
    ui.hideLevelUp();
    game.state = 'playing';
    ui.refresh();
  } else finishLevelUp();
}
function openBox() {
  game.state = 'levelup';
  blockPickMode = 'box';
  openBlockPick();
}
function rerollBlocks() {
  if (game.rerolls <= 0) return;
  game.rerolls--;
  sfx('reroll');
  openBlockPick(new Set(blockChoices.map(blockSig)));
}

// ─────────────────────────────────────────────
//  입력 (단축키)
// ─────────────────────────────────────────────
input.onKey = (e) => {
  const acts = actionsFor(e.code);
  const has = (a) => acts.includes(a);
  // 선택지 고르는 중: 스킬 창 / 인벤토리 창만 열어서 볼 수 있음 (읽기 전용)
  if (game.state === 'levelup') {
    if (has('both')) { const open = !(game.invOpen && game.skillsOpen); ui.setWindows(open, open); }
    else if (has('inv')) ui.setWindows(!game.invOpen, game.skillsOpen);
    else if (has('skills')) ui.setWindows(game.invOpen, !game.skillsOpen);
    else if (e.code === 'Escape' && (game.invOpen || game.skillsOpen)) ui.setWindows(false, false);
    return;
  }
  if (game.state === 'start') { if (e.code === 'Escape') menuBack(); return; }
  if (game.state !== 'playing') return;
  if (e.code === 'F8') { e.preventDefault(); toggleDebug(); return; }
  if (e.code === 'Escape') {
    if (!$id('settings').classList.contains('hidden')) { closeOverlay('settings'); return; }   // 설정 창부터 닫음
    if (game.debugOpen) toggleDebug(false);
    else if (game.popups.length) ui.closeTopPopup();
    else if (game.invOpen || game.skillsOpen) ui.setWindows(false, false);
    else togglePause();
    return;
  }
  // 같은 키가 여러 조작에 할당되어 있으면 모두 실행
  for (const a of acts) {
    if (a === 'dash') { if (!isPaused()) player.tryDash(); }
    else if (a === 'inv') ui.setWindows(!game.invOpen, game.skillsOpen);
    else if (a === 'skills') ui.setWindows(game.invOpen, !game.skillsOpen);
    else if (a === 'both') { const open = !(game.invOpen && game.skillsOpen); ui.setWindows(open, open); }
    else if (a === 'labels') {
      game.showLabels = !game.showLabels;
      sfx(game.showLabels ? 'toggleOn' : 'toggleOff');
      profile.settings.labels = game.showLabels; saveProfile();
      ui.updateToggles();
      ui.toast(`이름표 ${game.showLabels ? '표시' : '숨김'}`);
    } else if (a === 'pickup') {
      game.autoPickup = !game.autoPickup;
      sfx(game.autoPickup ? 'toggleOn' : 'toggleOff');
      profile.settings.autoPickup = game.autoPickup; saveProfile();
      ui.updateToggles();
      ui.toast(game.autoPickup ? '아이템 자동 획득 ON' : '아이템 자동 획득 OFF — 이름표를 클릭해 획득');
    } else if (/^skill\d+$/.test(a) && !isPaused()) {
      const sk = game.skills[+a.slice(5) - 1];
      if (sk && !sk.def.passive) skillsRt.tryCast(sk, true);
    }
  }
};

// 조작키가 바뀌면 화면의 키 표시도 바꿈
function refreshKeyLabels() {
  document.querySelector('#btn-skills kbd').textContent = keyOf('skills');
  document.querySelector('#btn-inv kbd').textContent = keyOf('inv');
  document.getElementById('help').textContent = `${['up', 'left', 'down', 'right'].map(keyOf).join('')} 이동 · ${keyOf('dash')} 대시 · ${keyOf('skill1')}~${keyOf('skill10')} 스킬 · ${keyOf('skills')} 스킬 창 · ${keyOf('inv')} 인벤토리 · ${keyOf('labels')} 이름표 · ${keyOf('pickup')} 자동 획득 · 휠 줌`;
  ui.updateToggles();
  ui.sbSlots.forEach((s, i) => { s.querySelector('.sb-key').textContent = keyOf(`skill${i + 1}`); });
  ui.refresh();
}

function togglePause() {
  game.menuOpen = !game.menuOpen;
  document.getElementById('pause').classList.toggle('hidden', !game.menuOpen);
  sfx(game.menuOpen ? 'open' : 'close');
}
// 클릭한 버튼에 포커스가 남아 Space(대시)로 다시 눌리는 것 방지
document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('button'); if (b) { b.blur(); sfx('click'); } });
// 브라우저 정책상 첫 입력 이후에 사운드 시작
for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => initAudio());
document.getElementById('btn-resume').addEventListener('click', togglePause);
document.getElementById('btn-recomb').addEventListener('click', () => {
  if (game.tutorial) { ui.toast('튜토리얼에서는 재조합을 사용할 수 없습니다', 'warn'); sfx('error'); return; }
  ui.openRecomb();
});
// 스킬 / 인벤토리 창: 위쪽 머리 부분을 끌어서 옮길 수 있음
for (const win of [document.getElementById('win-skills'), document.getElementById('win-inv')]) {
  const head = win.querySelector('.win-head');
  head.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('button')) return;
    e.preventDefault();
    const x0 = e.clientX, y0 = e.clientY, l0 = win.offsetLeft, t0 = win.offsetTop;
    head.classList.add('moving');
    const move = (ev) => {
      const l = Math.max(0, Math.min(STAGE.W - win.offsetWidth, l0 + (ev.clientX - x0) / STAGE.scale));
      const t = Math.max(0, Math.min(STAGE.H - 60, t0 + (ev.clientY - y0) / STAGE.scale));
      win.style.left = `${l}px`; win.style.top = `${t}px`; win.style.right = 'auto';
    };
    const up = () => { head.classList.remove('moving'); removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });
}
document.getElementById('btn-inv').addEventListener('click', () => ui.setWindows(!game.invOpen, game.skillsOpen));
document.getElementById('btn-skills').addEventListener('click', () => ui.setWindows(game.invOpen, !game.skillsOpen));
document.querySelectorAll('.win-close').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.win === 'inv') ui.setWindows(false, game.skillsOpen);
  else ui.setWindows(game.invOpen, false);
}));

// ─────────────────────────────────────────────
//  메인 메뉴 / 업그레이드 / 설정 / 종료 화면
// ─────────────────────────────────────────────
const $id = (id) => document.getElementById(id);
function refreshMenuGold() { $id('menu-gold').textContent = Math.floor(profile.gold).toLocaleString(); }

function applySettingsToGame() {
  game.showLabels = profile.settings.labels;
  game.autoPickup = profile.settings.autoPickup;
  ui.updateToggles();
}

function openOverlay(id) { $id(id).classList.remove('hidden'); sfx('open'); }
function closeOverlay(id) { $id(id).classList.add('hidden'); ui.hideTip(); sfx('close'); }
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closeOverlay(b.dataset.close)));

function openSettings() { openOverlay('settings'); renderSettings(applySettingsToGame, refreshKeyLabels); }
$id('btn-pause-settings').addEventListener('click', openSettings);
$id('btn-giveup').addEventListener('click', () => {
  if (game.state !== 'playing') return;
  game.menuOpen = false;
  $id('pause').classList.add('hidden');
  ui.setWindows(false, false);
  game.state = 'over';
  showEndScreen('giveup');
});

// 메인 화면에서 시작: 미리보기로 바뀐 게임 상태를 깨끗이 비우기 위해 페이지를 새로 불러온 뒤 바로 시작
const AUTOSTART = 'bc-autostart';
function requestStart(stageId) {
  sfx('start');
  // 로딩 화면을 먼저 덮은 뒤 새로 불러옴
  const ld = document.createElement('div');
  ld.id = 'loading';
  ld.innerHTML = '<div class="ld-box"><div class="ld-text">로딩 중...</div><div class="ld-bar"><i id="ld-fill"></i></div></div>';
  $id('stage').appendChild(ld);
  setTimeout(() => { sessionStorage.setItem(AUTOSTART, String(stageId)); location.reload(); }, 120);
}

function startGame(stageId = 1) {
  sfx('start');
  demo.stop();
  hideMenu();
  setSfxMuted(false);
  resize();
  game.stage = stageId;
  game.accountLevel = profile.accountLevel;
  const tut = stageById(stageId).tutorial;
  game.charId = tut ? 'masang' : (CHARACTERS[profile.character] ? profile.character : DEFAULT_CHARACTER);   // 튜토리얼은 마솽
  game.masteryLevel = masteryOf(game.charId).lv;
  game.mods = computeMods(tut);   // 튜토리얼: 업그레이드 효과 없음
  player.applyMods(game.mods);
  game.rerolls = tut ? 1 : START_REROLLS + game.mods.rerolls;   // 튜토리얼: 리롤 1회
  const startSkill = CHARACTERS[game.charId].skills[0];   // 모든 캐릭터는 전용 스킬 1번을 장착하고 시작
  game.skills.push(createSkill(startSkill));
  bump();
  game.state = 'playing';
  if (game.mods.startBlocks > 0 && !stageById(stageId).tutorial) {
    game.sys.dropBlocks(Array.from({ length: game.mods.startBlocks }, () => randomBlock()), player.pos.x, player.pos.z, { minD: 1.8, maxD: 3 });
  }
  ui.refresh();
  if (stageById(stageId).tutorial) {
    game.tutorial = new Tutorial({ player, enemies, pickups, scene, fx, ui, onFinish: () => startVictory() });
    game.tutorial.start();
  } else ui.toast(`${SKILL_DEFS[startSkill].icon} ${SKILL_DEFS[startSkill].name} 장착! 가장 가까운 적에게 자동으로 공격합니다`);
}

// 보스 처치: 남은 적 정리 → 맵의 경험치를 모두 빠르게 끌어와 획득 → 종료 화면
function startVictory() {
  game.state = 'victory';
  game.victoryT = 0;
  ui.setWindows(false, false);
  for (const e of enemies.list) {
    if (!e.alive || e.boss) continue;
    e.alive = false;
    fx.particles.burst(e.x, 0.4, e.z, 8, [e.T.color, 0xffffff], { speed: 3, size: 0.14, life: 0.5, up: 3 });
    if (e.model) scene.remove(e.model.group);
  }
  for (const g of pickups.gems) { g.mag = true; g.sp = 40; }
  ui.toast(game.tutorial ? `${ic('crown')} 튜토리얼 완료! 경험치를 모으는 중...` : `${ic('crown')} 킹 슬라임 처치! 경험치를 모으는 중...`, 'boss');
  sfx('victory');
}

const OPEN_VIEW = 'bc-open-view';
function showEndScreen(kind) {
  const s = $id('screen');
  const t = game.time;
  const st = stageById(game.stage);
  const gold = Math.floor(game.totalXp * game.mods.goldMul);
  profile.gold += gold;
  // 첫 클리어 보상 (한 번만) + 다음 스테이지 열림
  let rewardHtml = '';
  let rewardGold = 0;
  if (kind === 'clear') {
    if (!profile.cleared.includes(game.stage)) {
      profile.cleared.push(game.stage);
      profile.gold += st.reward.gold;
      rewardGold = st.reward.gold;
      rewardHtml = `<div class="end-reward">${ic('crown')} 첫 클리어 보상 · ${ic('coin')} <b>+${st.reward.gold.toLocaleString()}</b> 골드</div>`;
    }
    profile.stage = lastStartable(profile.cleared).id;   // 시작할 수 있는 마지막 스테이지를 자동 선택
  }
  const xpGain = Math.floor(game.totalXp);
  // 계정 경험치 = 이번에 얻은 골드(경험치 환산 + 첫 클리어 보상)의 25%, 숙련도 = 그 계정 경험치의 75%
  const clearBonus = kind === 'clear' ? 1.5 : 1;   // 클리어 시 계정 경험치 / 숙련도 +50%
  const acctGain = Math.floor((gold + rewardGold) * 0.25 * clearBonus);
  const masteryGain = Math.floor(acctGain * 0.75);
  const acc = addAccountXp(acctGain);
  const mas = addMasteryXp(game.charId, masteryGain);
  saveProfile();
  const chName = CHARACTERS[game.charId].name;
  const mm = masteryOf(game.charId), mneed = masteryNeed(mm.lv);
  const need = accountNeed(profile.accountLevel);
  const unlockNames = [...mas.unlocked.map((k) => SKILL_DEFS[k].name), ...acc.unlocked.skills.map((k) => SKILL_DEFS[k].name), ...acc.unlocked.templates.map((k) => `문장:${TEMPLATE_INFO[k].label}`)];
  const acctHtml = `<div class="end-acct">
      <div class="ea-head"><span>계정 Lv.<b>${profile.accountLevel}</b></span><span>계정 경험치 <b>+${acctGain.toLocaleString()}</b>${clearBonus > 1 ? ' <i class="ea-bonus">클리어 보너스 +50%</i>' : ''}</span></div>
      <div class="acct-bar"><i style="width:${Math.min(100, (profile.accountXp / need) * 100)}%"></i></div>
      <div class="ea-xp">${Math.floor(profile.accountXp).toLocaleString()} / ${need.toLocaleString()}</div>
      ${acc.to > acc.from ? `<div class="ea-up">계정 레벨 업! Lv.${acc.from} → Lv.${acc.to}</div>` : ''}
      <div class="ea-head ea-mastery"><span>${chName} 숙련도 Lv.<b>${mm.lv}</b></span><span>숙련도 경험치 <b>+${masteryGain.toLocaleString()}</b></span></div>
      <div class="acct-bar mastery"><i style="width:${Math.min(100, (mm.xp / mneed) * 100)}%"></i></div>
      <div class="ea-xp">${Math.floor(mm.xp).toLocaleString()} / ${mneed.toLocaleString()}</div>
      ${mas.to > mas.from ? `<div class="ea-up">${chName} 숙련도 업! Lv.${mas.from} → Lv.${mas.to}</div>` : ''}
      ${unlockNames.length ? '<div class="ea-unlock"><div class="eu-title">새로 해금</div><div class="eu-list"></div></div>' : ''}
    </div>`;
  const T = {
    clear:  ['STAGE CLEAR!', 'win', st.tutorial ? '튜토리얼을 모두 마쳤습니다!' : '보스를 쓰러뜨렸습니다!'],
    dead:   ['GAME OVER', 'lose', '슬라임에게 당했습니다...'],
    giveup: ['GAME OVER', 'lose', '전투를 포기했습니다.'],
  }[kind];
  if (kind !== 'clear') sfx('defeat');
  const summary = st.tutorial
    ? `${stageLabel(st)} · 처치 <b>${game.kills}</b>`
    : `${stageLabel(st)} · 생존 시간 <b>${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}</b> · 레벨 <b>${game.level}</b> · 처치 <b>${game.kills}</b>`;
  s.innerHTML = `<div class="screen-box ui-zone end-box">
    <div class="title ${T[1]}">${T[0]}</div>
    <div class="sub">${T[2]}</div>
    <div class="result">${summary}</div>
    ${rewardHtml}
    <div class="end-gold">획득한 경험치 <b>${xpGain.toLocaleString()}</b>${game.mods.goldMul > 1 ? ` (골드 보너스 +${Math.round((game.mods.goldMul - 1) * 100)}%)` : ''}<br>
      → ${ic('coin')} <b>${gold.toLocaleString()}</b> 골드로 환산되었습니다 · 보유 골드 <b>${Math.floor(profile.gold).toLocaleString()}</b></div>
    ${acctHtml}
    <button class="big-btn" id="btn-main">${kind === 'clear' ? '스테이지 완료' : '메인으로'}</button></div>`;
  // 새로 해금된 스킬 / 문장: 아이콘을 가로로 나열 (마우스를 올리면 정보)
  const list = s.querySelector('.eu-list');
  if (list) {
    for (const k of [...mas.unlocked, ...acc.unlocked.skills]) {
      const d = SKILL_DEFS[k];
      const it = document.createElement('div');
      it.className = 'eu-item';
      it.innerHTML = `<div class="eu-ic" style="--c:${d.color}">${d.icon}</div><div class="eu-name">${d.name}</div>`;
      it._tip = () => `<div class="tip-title">${d.icon} ${d.name}</div><div>${d.short}</div><div class="kw-list">${d.keywords.map((w) => `<span class="kw">${w}</span>`).join('')}</div>`;
      list.appendChild(it);
    }
    for (const t of acc.unlocked.templates) {
      const inf = TEMPLATE_INFO[t];
      const it = document.createElement('div');
      it.className = 'eu-item';
      const ic2 = document.createElement('div');
      ic2.className = 'eu-ic tilebox';
      ic2.appendChild(ui.makeTile(makeSentence(t, false)));
      it.appendChild(ic2);
      it.insertAdjacentHTML('beforeend', `<div class="eu-name">문장:${inf.label}</div>`);
      it._tip = () => `<div class="tip-title">문장 블록 · ${inf.label} <span class="tip-dim">${RARITY_NAME[inf.rarity]}</span></div><div>${TEMPLATE_DESC[t]}</div>`;
      list.appendChild(it);
    }
    // 휠로 가로 스크롤
    list.addEventListener('wheel', (e) => { if (list.scrollWidth > list.clientWidth) { e.preventDefault(); list.scrollLeft += e.deltaY; } }, { passive: false });
  }
  s.classList.remove('hidden');
  $id('btn-main').addEventListener('click', () => {
    if (kind === 'clear') sessionStorage.setItem(OPEN_VIEW, 'stage');   // 스테이지 선택 화면으로 돌아감
    location.reload();
  });
}

// ─────────────────────────────────────────────
//  메인 루프
// ─────────────────────────────────────────────
const clock = new THREE.Clock();
let realTime = 0;
let animTime = 0;   // 연출용 시간 — 일시정지 중에는 멈춤 (시작 화면에서는 흐름)
const camTarget = new THREE.Vector3();

function frame() {
  requestAnimationFrame(frame);
  tick(Math.min(0.05, clock.getDelta()));
}

function tick(dt, draw = true) {
  realTime += dt;
  const paused = isPaused() && game.state !== 'start';
  const adt = paused ? 0 : dt;
  animTime += adt;
  updateAim(camera);

  if (game.state === 'victory') {
    // 타이머 정지, 적 생성/레벨업 없음 — 경험치만 빠르게 끌어와 획득
    player.update(dt, input, world.obstacles);
    enemies.update(dt, player, world.obstacles);
    for (const g of pickups.gems) { g.mag = true; g.sp = Math.max(g.sp, 40); }
    pickups.update(dt, player, addXp);
    updateTimers(dt);
    fx.update(dt);
    game.victoryT += dt;
    if (pickups.gems.length === 0 && game.victoryT > 1.2) { game.state = 'clear'; showEndScreen('clear'); }
  } else if (game.state === 'start' && demo.active) {
    // 메인 화면 미리보기: 자동 조작 캐릭터로 실제 전투를 돌림
    demo.update(dt);
    player.update(dt, demo.input, world.obstacles);
    enemies.update(dt, player, world.obstacles);
    enemySkills.update(dt);
    bloom.update(dt);
    skillsRt.update(dt);
    pickups.update(dt, player, (v) => skillsRt.onXp(v));   // 도감 미리보기(효과 부여)용
    updateTimers(dt);
    fx.update(dt);
  } else if (!isPaused()) {
    if (!game.tutorial) {
      updateOverkill(dt);
      game.time += dt * game.timeMul;      // 오버킬로 가속되면 스테이지 시간과
      director(dt * game.timeMul);         // 적 생성 주기도 함께 빨라짐
    }
    player.update(dt, input, world.obstacles);
    enemies.update(dt, player, world.obstacles);
    enemySkills.update(dt);
    bloom.update(dt);
    skillsRt.update(dt);
    pickups.update(dt, player, addXp);
    updateTimers(dt);
    fx.update(dt);
  } else if (game.state === 'playing' || game.state === 'levelup') {
    player.update(0, { keys: new Set(), ground: input.ground }, world.obstacles);
  }

  // 튜토리얼 퀘스트 (창을 연 상태에서도 진행)
  if (game.tutorial && (game.state === 'playing' || game.state === 'levelup')) game.tutorial.update(dt);

  if (game.state === 'playing' && !game.invOpen && !game.skillsOpen && !game.menuOpen) {
    if (game.pendingLevels > 0 && (!game.tutorial || game.tutorial.allowLevelUp())) openLevelUp();
    else if (game.pendingBoxes > 0) openBox();
  }

  // 카메라 추적
  camTarget.lerp(player.pos, 1 - Math.exp(-dt * 8));
  camera.position.copy(camTarget).add(CAM_OFF);
  camera.lookAt(camTarget);

  if (!draw) return;
  world.update(animTime, player.pos, adt);
  enemies.render(animTime);
  pickups.render(animTime);
  labels.update();
  player.render(animTime);
  fx.render(adt);
  if (game.state !== 'start') { ui.updateHUD(); updateDpsTable(adt); }
  ui.setPausedView(game.state === 'playing' && isPaused());
  document.body.classList.toggle('ui-readonly', game.state === 'levelup');
  if (!codexPreviewActive()) renderer.render(scene, camera);   // 도감 미리보기 중에는 가려진 메인 화면을 그리지 않음
  renderCodexPreview();   // 도감 미리보기 영상 (같은 장면을 도감 전용 카메라로)
}

camTarget.copy(player.pos);
loadProfile();
loadKeys(profile.settings.keys);
game.accountLevel = profile.accountLevel;
game.mods = computeMods();
applySettingsToGame();
refreshMenuGold();
ui.refresh();
refreshKeyLabels();

const demo = new Demo({
  player, enemies, pickups, skillsRt, scene, fx, enemySkills, bloom, cutEl: $id('preview-cut'),
  onTeleport: (p) => camTarget.copy(p),
});
initCodex({ demo, scene, ui });
initMenu({ onStart: requestStart, refreshGold: refreshMenuGold, applySettings: applySettingsToGame, keysChanged: refreshKeyLabels, hideTip: () => ui.hideTip() });
const auto = sessionStorage.getItem(AUTOSTART);
sessionStorage.removeItem(AUTOSTART);
if (auto) {
  // 시작 버튼으로 새로 불러온 경우: 바로 게임 시작 (암전에서 밝아짐)
  startGame(stageById(+auto).id);
} else {
  showMenu();
  setSfxMuted(true);
  resize();
  demo.start();
  // 결과 화면에서 '스테이지 완료'로 돌아온 경우: 스테이지 선택 화면을 엶
  if (sessionStorage.getItem(OPEN_VIEW) === 'stage') setView('stage');
  sessionStorage.removeItem(OPEN_VIEW);
}
// 디버그용 핸들
window.__game = game;
window.__tick = (n = 1, dt = 1 / 60, draw = true) => { for (let i = 0; i < n; i++) tick(dt, draw || i === n - 1); };
window.__input = input;
// 첫 화면을 미리 한 번 그려 둔 뒤 로딩 화면을 걷음 (셰이더 준비 시간 포함)
loadingAt(100);
renderer.compile(scene, camera);
renderer.render(scene, camera);
setTimeout(() => {
  const ld = document.getElementById('loading');
  ld.classList.add('done');
  setTimeout(() => ld.remove(), 450);
}, 220);
frame();
