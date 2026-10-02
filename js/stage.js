// ─────────────────────────────────────────────
//  16:9 고정 스테이지 (기준 해상도 1920x1080, UI 배율 130%)
//  게임 화면과 모든 UI 를 #stage 안에 두고, 창 크기에 맞춰 통째로 확대/축소 (남는 영역은 검은 여백)
// ─────────────────────────────────────────────
// UI 를 1.3배 크게 보이도록 논리 크기는 1920/1.3 x 1080/1.3 (렌더링 해상도는 실제 화면 픽셀에 맞춤)
export const UI_SCALE = 1.3;
export const STAGE = { W: Math.round(1920 / UI_SCALE), H: Math.round(1080 / UI_SCALE), scale: 1, left: 0, top: 0 };

const listeners = [];
export function onStageResize(fn) { listeners.push(fn); }

export function fitStage() {
  const el = document.getElementById('stage');
  const s = Math.min(innerWidth / STAGE.W, innerHeight / STAGE.H);
  STAGE.scale = s;
  STAGE.left = (innerWidth - STAGE.W * s) / 2;
  STAGE.top = (innerHeight - STAGE.H * s) / 2;
  el.style.transform = `translate(${STAGE.left}px, ${STAGE.top}px) scale(${s})`;
  for (const fn of listeners) fn(STAGE);
}

// 브라우저 좌표 → 스테이지 좌표
export const toStageX = (cx) => (cx - STAGE.left) / STAGE.scale;
export const toStageY = (cy) => (cy - STAGE.top) / STAGE.scale;
export function stageRect(r) {
  return {
    left: toStageX(r.left), top: toStageY(r.top), right: toStageX(r.right), bottom: toStageY(r.bottom),
    width: r.width / STAGE.scale, height: r.height / STAGE.scale,
  };
}

addEventListener('resize', fitStage);
