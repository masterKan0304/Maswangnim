// ─────────────────────────────────────────────
//  해변 몬스터 움직임
//  crab: 옆으로만 걸음 (플레이어가 옆에 없으면 공중으로 뛰어 90도 몸을 비틂, 0.75초)
//  hermit: 평소엔 느리게 / 8초마다 몸을 뒤집고 회전하며 돌진 (최대 속도 5, 최소 1.5초, 앞에 플레이어가 없으면 0.5초에 걸쳐 급감속)
//  walk: 통통 튀지 않고 꾸준히 걸어옴 (마타 · 만탄)
//  반환: { dx, dz, speed(실제 속도), keepRot, y, tilt, spin }
// ─────────────────────────────────────────────
const TURN = 0.75;
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export function beachGait(e, dt, dx, dz, dist) {
  const ai = e.T.ai;
  if (ai === 'crab') return crab(e, dt, dx, dz);
  if (ai === 'hermit') return hermit(e, dt, dx, dz, dist);
  if (ai === 'walk') return { dx, dz, speed: e.speed, y: 0 };
  return null;
}

function crab(e, dt, dx, dz) {
  if (e.turnT > 0) {
    e.turnT -= dt;
    const k = 1 - Math.max(0, e.turnT) / TURN, ease = k * k * (3 - 2 * k);
    e.rot = e.turnFrom + angDiff(e.turnFrom, e.turnTo) * ease;
    return { dx: 0, dz: 0, speed: 0, keepRot: true, y: Math.sin(k * Math.PI) * 0.45 * e.r * 2 };   // 공중으로 뛰며 몸을 비틂
  }
  // 몸의 옆(로컬 +x) 방향
  const sx = Math.cos(e.rot), sz = -Math.sin(e.rot);
  const align = dx * sx + dz * sz;
  if (Math.abs(align) < 0.55) {
    const base = Math.atan2(-dz, dx), alt = base + Math.PI;   // 옆 방향이 플레이어를 향하는 두 가지 자세 중 가까운 쪽
    e.turnFrom = e.rot;
    e.turnTo = Math.abs(angDiff(e.rot, base)) < Math.abs(angDiff(e.rot, alt)) ? base : alt;
    e.turnT = TURN;
    return { dx: 0, dz: 0, speed: 0, keepRot: true, y: 0 };
  }
  const sg = Math.sign(align);
  e.walkT = (e.walkT || 0) + dt * 14;
  return { dx: sx * sg, dz: sz * sg, speed: e.speed, keepRot: true, y: Math.abs(Math.sin(e.walkT)) * 0.03 };
}

function hermit(e, dt, dx, dz, dist) {
  const d = e.dash;
  if (d) {
    d.t += dt;
    const ahead = d.dx * dx + d.dz * dz > 0.6;   // 진행 방향 앞에 플레이어가 있는지
    if (d.t > 1.5 && !ahead && !d.brakeT) { d.brakeT = 0.5; d.v0 = d.v; }
    if (d.brakeT) {
      d.brakeT = Math.max(0, d.brakeT - dt);
      d.v = 1 + (d.v0 - 1) * (d.brakeT / 0.5);
      if (d.brakeT <= 0) { e.dash = null; e.dashCd = 8; e.dashing = false; return { dx, dz, speed: e.speed, y: 0 }; }   // 원래대로 → 8초 쿨타임
    } else d.v = Math.min(5, d.v + dt * 6);   // 최대 5 까지 가속
    if (d.t > 4) d.brakeT = d.brakeT || 0.5;
    e.spin = (e.spin || 0) + d.v * dt * 4.5;   // 속도에 비례한 회전
    e.dashing = d.v > 1.5;
    return { dx: d.dx, dz: d.dz, speed: d.v, keepRot: true, y: e.r * 2.3, tilt: Math.PI, spin: e.spin };   // 뒤집힌 채 (껍데기가 아래)
  }
  e.dashCd = (e.dashCd ?? 3 + Math.random() * 5) - dt;
  if (e.dashCd <= 0 && dist < 14) {
    e.dash = { dx, dz, t: 0, v: 1, brakeT: 0 };
    e.rot = Math.atan2(dx, dz);
  }
  return { dx, dz, speed: e.speed, y: 0 };
}
