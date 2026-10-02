import { STAGE } from './stage.js';
import * as THREE from 'three';
import { game } from './state.js';
import { colorKey, blockLabel, OP_SYMBOL } from './blocks.js';

// ─────────────────────────────────────────────
//  드랍 아이템 이름표 (DOM)
//  - 서로 겹치지 않게 위/왼쪽/오른쪽/아래로 밀어서 배치
//  - 클릭하면 플레이어가 그 아이템까지 걸어가서 획득
// ─────────────────────────────────────────────
const _v = new THREE.Vector3();
const GAP = 3;

export class Labels {
  constructor(layer, camera) {
    this.layer = layer;
    this.camera = camera;
  }

  make(b) {
    const el = document.createElement('div');
    if (b.chest) {
      el.className = 'tag chest';
      el.textContent = '🎁 블록 상자';
    } else {
      const blk = b.block;
      el.className = `tag k-${colorKey(blk)}`;
      if (blk.kind === 'sentence') {
        // 문장: 칸마다 작은 이름표 (빈 칸은 테두리만, 채워진 칸은 바탕색)
        game.sys.ui.renderSentenceInto(el, blk, false);
      } else if (blk.kind === 'op') {
        for (let i = 0; i < 2; i++) {
          const n = blk.slots[i];
          const c = document.createElement('span');
          c.className = n ? 'chip filled k-number' : 'chip empty t-number';
          c.textContent = n ? blockLabel(n) : '[수치]';
          el.appendChild(c);
          if (i === 0) el.appendChild(document.createTextNode(` ${OP_SYMBOL[blk.op]} `));
        }
      } else {
        el.textContent = blockLabel(blk);
      }
      el._tip = () => game.sys.ui.blockTip(blk);
    }
    el._click = () => {
      game.sys.player.moveTarget = b;
      el.classList.add('picked');
    };
    el._item = b;
    this.layer.appendChild(el);
    b.label = el;
    b.lw = el.offsetWidth;
    b.lh = el.offsetHeight;
  }

  update() {
    const show = game.showLabels && ['playing', 'levelup', 'victory'].includes(game.state);
    this.layer.style.display = show ? '' : 'none';
    if (!show) return;
    const items = game.sys.pickups.blocks;
    const alive = new Set(items);
    for (const el of [...this.layer.children]) if (!alive.has(el._item)) el.remove();

    const W = STAGE.W, H = STAGE.H;
    const pl = game.sys.player.pos;
    const list = [];
    for (const b of items) {
      if (!b.label) this.make(b);
      // 떠다니는(위아래) 움직임은 무시하고 고정 높이 기준으로 배치 — 날아가는 중에는 실제 위치를 따라감
      const p = b.group.position;
      const landed = b.t >= b.fly;
      _v.set(landed ? b.x : p.x, landed ? 1.12 : p.y + 0.62, landed ? b.z : p.z).project(this.camera);
      const sx = ((_v.x + 1) / 2) * W, sy = ((1 - _v.y) / 2) * H;
      if (sx < -100 || sx > W + 100 || sy < -60 || sy > H + 60) { b.label.style.display = 'none'; continue; }
      b.label.style.display = '';
      list.push({ b, sx, sy, d: (p.x - pl.x) ** 2 + (p.z - pl.z) ** 2 });
    }
    // 플레이어에 가까운 아이템부터 원래 자리에 배치하고, 겹치는 것은 밀어냄
    list.sort((a, b) => a.d - b.d);
    const placed = [];
    const hit = (x, y, w, h) => placed.some((r) => x < r.x + r.w + GAP && x + w + GAP > r.x && y < r.y + r.h + GAP && y + h + GAP > r.y);
    for (const it of list) {
      const { b } = it;
      const w = b.lw, h = b.lh;
      const x0 = it.sx - w / 2, y0 = it.sy - h;
      let best = null;
      if (!hit(x0, y0, w, h)) best = [x0, y0];
      // 직전 프레임에 밀려났던 위치가 아직 비어 있으면 그대로 유지 (자리 바뀜 방지)
      else if (b.lOff && !hit(x0 + b.lOff[0], y0 + b.lOff[1], w, h)) best = [x0 + b.lOff[0], y0 + b.lOff[1]];
      // 세로는 이름표 높이만큼, 가로는 짧은 간격(최대 34px)씩 밀어 가며 가까운 빈자리를 찾음
      const stepX = Math.min(w / 2, 34) + GAP;
      for (let k = 1; !best && k <= 20; k++) {
        const sy = k * (h + GAP), sx = k * stepX;
        const cands = [[x0, y0 - sy], [x0 - sx, y0], [x0 + sx, y0], [x0, y0 + sy], [x0 - sx, y0 - sy], [x0 + sx, y0 - sy], [x0 - sx, y0 + sy], [x0 + sx, y0 + sy]];
        for (const [cx, cy] of cands) if (!hit(cx, cy, w, h)) { best = [cx, cy]; break; }
      }
      if (!best) best = [x0, y0];
      placed.push({ x: best[0], y: best[1], w, h });
      b.lOff = [best[0] - x0, best[1] - y0];
      b.label.style.transform = `translate(${best[0]}px, ${best[1]}px)`;
      b.label.classList.toggle('picked', b === game.sys.player.moveTarget);
    }
  }
}
