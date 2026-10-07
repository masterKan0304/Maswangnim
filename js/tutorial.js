// ─────────────────────────────────────────────
//  튜토리얼: 초원 맵에서 퀘스트를 하나씩 클리어하며 진행
//  (시간이 흐르지 않고, 적은 퀘스트에 맞춰서만 등장, 플레이어는 피해를 입지 않음)
// ─────────────────────────────────────────────
import * as THREE from 'three';
import { game, bump } from './state.js';
import { WORLD_HALF } from './config.js';
import { makeSentence, makeWord, makeFixed, isComplete } from './blocks.js';
import { describe } from './levelup.js';
import { sfx } from './audio.js';
import { toStageX, toStageY } from './stage.js';
import { keyOf } from './keys.js';

const ENEMY_HP = 11 / 10;   // 그린 슬라임 체력 10 → 11 (문장 장착 후 이파리 베기 6~12 + 5 로 한 번에 처치되도록)
const $ = (s) => document.querySelector(s);

export class Tutorial {
  // sys: { player, enemies, pickups, scene, fx, ui, onFinish() }
  constructor(sys) {
    this.sys = sys;
    this.idx = -1;
    this.kills = 0;
    this.hold = 0;
    this.doneT = -1;        // 완료 후 다음 퀘스트까지 남은 시간
    this.items = null;      // 퀘스트 3에서 떨어뜨린 아이템 { sentence, damage, projCount }
    this.arrows = [];       // 아이템 위 3D 화살표
    this.focusEls = new Set();
    this.uiArrows = [];     // 화면 UI 강조 화살표
    this.lu = null;         // 퀘스트 14: 'locked' | 'open'
    this.quests = this.buildQuests();
  }

  // ── 퀘스트 목록 ──
  buildQuests() {
    const { player, pickups, ui } = this.sys;
    const fireball = () => game.skills[0];   // 시작 스킬 (마솽: 이파리 베기)
    const sn = game.skills[0] ? game.skills[0].def.name : '스킬';
    const sent = () => this.items && this.items.sentence;
    return [
      { title: 'WASD 이동해 보기', hintFn: () => `${['up', 'left', 'down', 'right'].map(keyOf).join('')} 또는 방향키를 1.5초 동안 계속 눌러 이동하세요.`,
        progress: () => `${Math.min(1.5, this.hold).toFixed(1)} / 1.5초`,
        update: (dt) => { this.hold = player.moving ? this.hold + dt : 0; return this.hold >= 1.5; } },
      { title: 'Space 대시해 보기', hintFn: () => `${keyOf('dash')} 키를 눌러 이동 방향으로 대시하세요.`,
        update: () => player.dashT > 0 },
      { title: '적 처치해 보기', hint: `${sn}가 가장 가까운 적에게 자동으로 발사됩니다. 지금은 피해를 입지 않습니다.`,
        enter: () => this.spawnGroup(3), progress: () => `${this.kills} / 3`,
        update: () => this.kills >= 3 },
      { title: '떨어진 아이템 줍기', hint: '화살표가 가리키는 아이템 3개를 주우세요. 가까이 가거나 이름표를 클릭하면 줍습니다.',
        progress: () => `${3 - this.itemsOnGround().length} / 3`,
        update: () => this.itemsOnGround().length === 0 },
      { title: '인벤토리 열기', hintFn: () => `${keyOf('inv')} 키를 눌러 인벤토리를 여세요.`,
        focus: () => ['#btn-inv'], update: () => game.invOpen },
      { title: '문장 블록 편집하기', hint: '인벤토리의 문장 블록을 우클릭하세요.',
        focus: () => [this.tileOf(sent())],
        update: () => game.popups.some((p) => p.block === sent()) },
      { title: '빈 칸에 주체:피해량 넣기', hint: "인벤토리의 '피해량' 블록을 문장의 빈 주체 칸으로 끌어다 놓으세요.",
        focus: () => [this.tileOf(this.items.damage), this.slotOf(sent(), 0)],
        update: () => { const s = sent(); return s.slots[0].block && s.slots[0].block.key === 'damage' && isComplete(s); } },
      { title: '스킬 창 열기', hintFn: () => `${keyOf('skills')} 키를 눌러 스킬 창을 여세요.`,
        focus: () => ['#btn-skills'], update: () => game.skillsOpen },
      { title: `${sn}에 문장 장착하기`, hint: `완성한 문장 블록을 ${sn}의 빈 문장 칸으로 끌어다 놓으세요.`,
        focus: () => [this.tileOf(sent()), this.emptySkillSlot()],
        update: () => fireball().sentences.includes(sent()),
        exit: () => ui.setWindows(false, false, true) },
      { title: '적 처치해 보기', hint: `강해진 ${sn}는 적을 한 번에 처치합니다.`,
        enter: () => this.spawnGroup(3), progress: () => `${this.kills} / 3`,
        update: () => this.kills >= 3 },
      { title: '주체 블록 바꿔 보기', hint: '',
        enter: () => { ui.setWindows(true, true, true); this.step = 0; },
        hintFn: () => (this.step === 0
          ? `스킬 창에서 ${sn}에 장착된 문장 블록을 우클릭하세요.`
          : "인벤토리의 '투사체 개수' 블록을 문장의 '피해량' 칸으로 끌어다 놓아 교체하세요."),
        focus: () => (this.step === 0 ? [this.skillTileOf(sent())] : [this.tileOf(this.items.projCount), this.slotOf(sent(), 0)]),
        update: () => {
          if (this.step === 0 && game.popups.some((p) => p.block === sent())) this.step = 1;
          const b = sent().slots[0].block;
          return b && b.key === 'projCount';
        },
        exit: () => ui.setWindows(false, false, true) },
      { title: '개선된 스킬 체험해 보기', hint: `투사체가 늘어난 ${sn}로 적 5마리를 처치하세요.`,
        enter: () => { ui.setWindows(false, false, true); this.spawnGroup(5); }, progress: () => `${this.kills} / 5`,
        update: () => this.kills >= 5 },
      { title: '경험치를 모아 레벨업하기', hint: '적이 떨어뜨린 경험치를 모아 레벨 2가 되세요.',
        progress: () => `Lv.${game.level}`, update: () => game.level >= 2 },
      { title: '선택지 고르기', hint: '',
        enter: () => { game.rerolls = 1; this.lu = 'locked'; },
        hintFn: () => (this.lu === 'locked'
          ? '처음에는 스킬을 하나 더 얻는 것이 효율적입니다. 리롤을 눌러 선택지를 바꿔 보세요.'
          : '새 스킬 하나를 골라 보세요.'),
        focus: () => (this.lu === 'locked' ? ['#lu-reroll'] : []),
        update: () => this.lu === 'done' },
      { title: '적 처치해 보기', hint: '적 10마리를 모두 처치하면 튜토리얼이 끝납니다.',
        enter: () => { this.spawnGroup(5); this.spawnGroup(5); }, progress: () => `${this.kills} / 10`,
        update: () => this.kills >= 10 },
    ];
  }

  start() {
    // 퀘스트 패널
    const box = document.createElement('div');
    box.id = 'quest';
    box.innerHTML = '<div class="q-head"><span class="q-no"></span><span class="q-prog"></span></div><div class="q-title"></div><div class="q-hint"></div>';
    $('#stage').appendChild(box);   // 스킬 / 인벤토리 창보다 위에 보이도록
    this.box = box;
    this.next();
  }

  get quest() { return this.quests[this.idx]; }

  next() {
    if (this.quest && this.quest.exit) this.quest.exit();
    this.idx++;
    this.kills = 0;
    this.hold = 0;
    this.doneT = -1;
    if (this.idx >= this.quests.length) { this.finish(); return; }
    this.box.classList.remove('done');
    this.box.classList.remove('pop'); void this.box.offsetWidth; this.box.classList.add('pop');
    if (this.quest.enter) this.quest.enter();
    this.render();
  }

  finish() {
    this.box.classList.add('done');
    this.clearFocus();
    if (this.sys.onFinish) this.sys.onFinish();
  }

  render() {
    const q = this.quest;
    if (!q) return;
    this.box.querySelector('.q-no').textContent = `퀘스트 ${this.idx + 1} / ${this.quests.length}`;
    this.box.querySelector('.q-prog').textContent = this.doneT >= 0 ? '완료!' : q.progress ? q.progress() : '';
    this.box.querySelector('.q-title').textContent = q.title;
    this.box.querySelector('.q-hint').textContent = q.hintFn ? q.hintFn() : q.hint;
    const lh = $('#lu-hint');
    if (lh) { lh.textContent = this.idx === 13 && game.state === 'levelup' ? (q.hintFn ? q.hintFn() : '') : ''; lh.classList.toggle('hidden', !lh.textContent); }
  }

  update(dt) {
    const q = this.quest;
    if (!q) return;
    if (this.doneT >= 0) {
      this.doneT -= dt;
      if (this.doneT < 0) this.next();
    } else if (q.update(dt)) {
      this.doneT = 2;   // 완료 표시 후 약 2초 뒤 다음 퀘스트
      sfx('select');
      this.box.classList.add('done');
    }
    this.render();
    this.updateArrows(dt);
    this.updateFocus();
  }

  // ── 적 ──
  spawnGroup(n) {
    const { player, enemies, fx } = this.sys;
    const a = Math.random() * Math.PI * 2, d = 9 + Math.random() * 3;
    const cx = THREE.MathUtils.clamp(player.pos.x + Math.cos(a) * d, -WORLD_HALF + 3, WORLD_HALF - 3);
    const cz = THREE.MathUtils.clamp(player.pos.z + Math.sin(a) * d, -WORLD_HALF + 3, WORLD_HALF - 3);
    for (let i = 0; i < n; i++) {
      const b = Math.random() * Math.PI * 2, r = Math.random() * 1.6;
      const e = enemies.spawn('green', cx + Math.cos(b) * r, cz + Math.sin(b) * r, ENEMY_HP);
      e.tut = this.idx;
    }
    fx.ring(cx, cz, 2.5, 0x2fe07c, 0.6);
  }

  // 튜토리얼 적 처치 (main 의 onKill 에서 호출) — 드랍 / 경험치는 퀘스트에 따라 다름
  onKill(e) {
    const { pickups } = this.sys;
    if (e.tut !== this.idx || this.doneT >= 0) return;
    this.kills++;
    if (this.idx === 2 && this.kills === 3) {
      // 마지막 적: [주체 빈칸] 5, 증가 문장 + 주체:피해량 + 주체:투사체 개수
      const s = makeSentence('SNC', false);
      s.slots[1].block = makeFixed(5); s.slots[1].locked = true;
      s.slots[2].block = makeWord('inc'); s.slots[2].locked = true;
      this.items = { sentence: s, damage: makeWord('damage'), projCount: makeWord('projCount') };
      const list = [s, this.items.damage, this.items.projCount];
      list.forEach((b, i) => {
        const ang = (i / 3) * Math.PI * 2;
        pickups.addBlock(b, e.x + Math.cos(ang) * 1.3, e.z + Math.sin(ang) * 1.3, { fromX: e.x, fromZ: e.z });
      });
      bump();
    }
    // 퀘스트 12 / 15: 경험치 (퀘스트 12 는 1씩)
    if (this.idx === 11) pickups.addGem(e.x, e.z, 1);
    if (this.idx === 14) pickups.addGem(e.x, e.z, e.T.xp);
  }

  itemsOnGround() {
    if (!this.items) return [];
    const blocks = this.sys.pickups.blocks;
    return blocks.filter((p) => p.block === this.items.sentence || p.block === this.items.damage || p.block === this.items.projCount);
  }

  // ── 제한 ──
  canDrag(b, loc) {
    if (!this.items) return true;
    // 투사체 개수 블록은 퀘스트 11 전까지 사용할 수 없음
    if (b === this.items.projCount && this.idx < 10) return false;
    // 퀘스트 11: 스킬에 장착된 문장 블록은 해제할 수 없음
    if (b === this.items.sentence && loc.t === 'skill' && this.idx >= 10) return false;
    return true;
  }

  filterWindows(inv, skills) {
    if (this.idx === 7 || this.idx === 8) skills = true;    // 스킬 창 열기 ~ 장착: 스킬 창을 닫을 수 없음
    if (this.idx === 10) { inv = true; skills = true; }       // 주체 블록 바꾸기: 두 창 모두 유지
    return [inv, skills];
  }

  allowLevelUp() { return this.idx >= 13; }

  // ── 퀘스트 14: 레벨업 선택지 ──
  levelChoices() {
    if (this.idx !== 13 || this.lu === 'done') return null;
    const fb = game.skills[0];
    this.lu = 'locked';
    return [describe({ type: 'level', sk: fb }), describe({ type: 'slot', sk: fb }), describe({ type: 'pickBlock' })];
  }

  reroll() {
    if (this.idx !== 13 || this.lu !== 'locked') return null;
    this.lu = 'open';
    return ['snowfall', 'chainLightning', 'iceball'].map((key) => describe({ type: 'skill', key }));
  }

  // 선택지 클릭: 리롤 전에는 고를 수 없음
  onPick(c) {
    if (this.idx !== 13 || this.lu === 'done') return true;
    if (this.lu === 'locked') {
      sfx('error');
      this.sys.ui.toast('먼저 리롤을 눌러 보세요', 'warn');
      return false;
    }
    this.lu = 'done';
    return true;
  }

  // ── 강조 표시 ──
  tileOf(b) { return b ? `#win-inv [data-bid="${b.id}"]` : null; }
  skillTileOf(b) { return b ? `#win-skills [data-bid="${b.id}"]` : null; }
  slotOf(s, i) { return s ? `#popups [data-slot="${s.id}:${i}"]` : null; }
  emptySkillSlot() {
    const fb = game.skills[0];
    const idx = fb.sentences.findIndex((x, i) => !x && i < fb.maxSlots);
    if (idx < 0) return null;
    const cards = document.querySelectorAll('#win-skills .skill-card');
    const card = cards[game.skills.indexOf(fb)];
    return card ? card.querySelectorAll('.sq')[idx] : null;
  }

  updateFocus() {
    const q = this.quest;
    const want = new Set();
    if (q && q.focus && this.doneT < 0) {
      for (const f of q.focus()) {
        if (!f) continue;
        const el = typeof f === 'string' ? document.querySelector(f) : f;
        if (el && el.offsetParent !== null) want.add(el);
      }
    }
    for (const el of this.focusEls) if (!want.has(el)) el.classList.remove('tut-focus');
    for (const el of want) el.classList.add('tut-focus');
    this.focusEls = want;
    // 강조된 요소 위에 아래를 가리키는 화살표
    const list = [...want];
    while (this.uiArrows.length < list.length) {
      const a = document.createElement('div');
      a.className = 'tut-arrow';
      a.textContent = '▼';
      document.getElementById('stage').appendChild(a);
      this.uiArrows.push(a);
    }
    this.uiArrows.forEach((a, i) => {
      const el = list[i];
      if (!el) { a.style.display = 'none'; return; }
      const r = el.getBoundingClientRect();
      a.style.display = '';
      a.style.left = `${toStageX(r.left + r.width / 2)}px`;
      a.style.top = `${toStageY(r.top)}px`;
    });
  }

  clearFocus() {
    for (const el of this.focusEls) el.classList.remove('tut-focus');
    this.focusEls.clear();
    this.uiArrows.forEach((a) => { a.style.display = 'none'; });
  }

  // 줍기 대상 위에 3D 화살표
  updateArrows(dt) {
    // 퀘스트 4: 떨어진 아이템 / 퀘스트 13: 경험치 보석
    const show = this.doneT >= 0 ? [] : this.idx === 3 ? this.itemsOnGround() : this.idx === 12 ? this.sys.pickups.gems.slice(0, 6) : [];
    const { scene } = this.sys;
    while (this.arrows.length < show.length) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: 0xffd45a }));
      m.rotation.x = Math.PI;   // 아래를 가리킴
      scene.add(m);
      this.arrows.push(m);
    }
    this.t = (this.t || 0) + dt;
    this.arrows.forEach((m, i) => {
      const it = show[i];
      m.visible = !!it;
      if (it) { m.position.set(it.x, 1.6 + Math.sin(this.t * 5 + i) * 0.18, it.z); m.rotation.y = this.t * 2; }
    });
  }
}
