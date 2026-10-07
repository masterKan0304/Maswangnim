// ─────────────────────────────────────────────
//  직접 만든 스크롤: 휠은 부드럽게 미끄러지듯, 오른쪽에 얇은 스크롤 막대 (끌어서 이동 가능)
// ─────────────────────────────────────────────
import { STAGE } from './stage.js';

// inner: 스크롤할 요소. 감싸는 틀(.sc-wrap)과 막대(.sc-bar)를 만들어 붙임
export function smoothScroll(inner) {
  const wrap = document.createElement('div');
  wrap.className = 'sc-wrap';
  inner.parentNode.insertBefore(wrap, inner);
  wrap.appendChild(inner);
  inner.classList.add('sc-inner');
  const bar = document.createElement('div');
  bar.className = 'sc-bar';
  const thumb = document.createElement('div');
  thumb.className = 'sc-thumb';
  bar.appendChild(thumb);
  wrap.appendChild(bar);

  let target = 0, anim = false;
  const max = () => Math.max(0, inner.scrollHeight - inner.clientHeight);
  const clamp = (v) => Math.max(0, Math.min(max(), v));

  function update() {
    const m = max();
    bar.style.display = m > 1 ? '' : 'none';
    if (m <= 1) return;
    const H = inner.clientHeight;
    const h = Math.max(28, (H * H) / inner.scrollHeight);
    thumb.style.height = `${h}px`;
    thumb.style.transform = `translateY(${(inner.scrollTop / m) * (H - h)}px)`;
  }
  function step() {
    const d = target - inner.scrollTop;
    if (Math.abs(d) < 0.5) { inner.scrollTop = target; anim = false; update(); return; }
    inner.scrollTop += d * 0.22;
    update();
    requestAnimationFrame(step);
  }
  inner.addEventListener('wheel', (e) => {
    e.preventDefault();
    target = clamp((anim ? target : inner.scrollTop) + e.deltaY);
    if (!anim) { anim = true; requestAnimationFrame(step); }
  }, { passive: false });
  inner.addEventListener('scroll', () => { if (!anim) target = inner.scrollTop; update(); });

  // 막대 끌기
  thumb.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const y0 = e.clientY, top0 = inner.scrollTop;
    const H = inner.clientHeight, h = thumb.offsetHeight;
    thumb.classList.add('drag');
    const move = (ev) => {
      anim = false;
      inner.scrollTop = clamp(top0 + ((ev.clientY - y0) / STAGE.scale / Math.max(1, H - h)) * max());
      target = inner.scrollTop;
      update();
    };
    const up = () => { thumb.classList.remove('drag'); removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });

  if (window.ResizeObserver) new ResizeObserver(update).observe(inner);
  return {
    update,
    setTop(v) { anim = false; inner.scrollTop = target = clamp(v); update(); },
  };
}
