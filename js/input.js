import * as THREE from 'three';

export const input = {
  keys: new Set(),
  ndc: new THREE.Vector2(),
  ground: new THREE.Vector3(0, 0, 1),
  onKey: null,
};

const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6);

addEventListener('keydown', (e) => {
  // 입력창(디버그 숫자 입력 등)에 타이핑할 때는 게임 단축키를 무시 (F8/Esc 제외)
  if (e.target && e.target.tagName === 'INPUT' && e.target.type !== 'range' && e.code !== 'F8' && e.code !== 'Escape') return;
  if (e.code === 'Tab' || e.code === 'Space' || e.code === 'F8') e.preventDefault();
  if (!e.repeat && input.onKey) input.onKey(e);
  input.keys.add(e.code);
});
addEventListener('keyup', (e) => input.keys.delete(e.code));
addEventListener('blur', () => input.keys.clear());
// 캔버스(16:9 스테이지) 기준 마우스 위치
addEventListener('pointermove', (e) => {
  const c = document.getElementById('c');
  const r = c.getBoundingClientRect();
  input.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
});

export function updateAim(camera) {
  raycaster.setFromCamera(input.ndc, camera);
  const hit = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(plane, hit)) input.ground.copy(hit);
}
