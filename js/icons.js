// ─────────────────────────────────────────────
//  직접 그린 SVG 아이콘 (이모지 대신 — 환경에 따라 흑백으로 나오는 문제 방지)
//  ic('fire') → <svg class="ic">...</svg>,  HTML 의 <i data-ic="book"></i> 는 hydrateIcons() 로 교체
// ─────────────────────────────────────────────
const S = (d, c, w = 2) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

const ICONS = {
  // 마솽 전용
  leafblade: '<path d="M3 20C5 10 12 4 21 3c-1 9-7 16-18 17z" fill="#5cc85a"/><path d="M3 20C8 15 13 10 19 5" stroke="#2f8a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M8 15l-1.5-3M11 12l-0.5-3.5M14 9.5l1-3M9.5 13.5l3 .8M12.5 10.5l3 .3" stroke="#a8ec8f" stroke-width="1.1" stroke-linecap="round"/>',
  nature: '<circle cx="12" cy="12" r="9.5" fill="#2f8a3a" opacity=".25"/><path d="M12 21c0-6 0-9 0-12" stroke="#6b4a2a" stroke-width="2" stroke-linecap="round"/><path d="M12 11C8 11 5 8 5 4c4 0 7 3 7 7z" fill="#7ed957"/><path d="M12 13c4 0 7-3 7-7-4 0-7 3-7 7z" fill="#4fbf4a"/><circle cx="5" cy="17" r="1.6" fill="#b8f5a0"/><circle cx="19" cy="17" r="1.6" fill="#b8f5a0"/><circle cx="12" cy="3" r="1.3" fill="#b8f5a0"/>',
  fruit: '<path d="M12 6c-1-2-1-3.5 0-4.5" stroke="#6b4a2a" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M12 5.5c2-2.5 5-2.5 7-1-2 2.5-4.5 2.5-7 1z" fill="#5cc85a"/><circle cx="12" cy="14" r="7.5" fill="#ff5a6e"/><circle cx="9.3" cy="11.3" r="2.2" fill="#ffc2ca"/><circle cx="14.5" cy="17" r="1" fill="#c8323f"/>',
  flower: '<g fill="#ff9ec4"><circle cx="12" cy="6" r="3.6"/><circle cx="17.7" cy="10.2" r="3.6"/><circle cx="15.5" cy="16.9" r="3.6"/><circle cx="8.5" cy="16.9" r="3.6"/><circle cx="6.3" cy="10.2" r="3.6"/></g><circle cx="12" cy="11.8" r="3.2" fill="#ffd45a"/><circle cx="11" cy="10.8" r="1" fill="#fff3b0"/>',
  sprout: '<path d="M12 22v-9" stroke="#3f8f3a" stroke-width="2.2" stroke-linecap="round"/><path d="M12 13C7 13 3.5 9.5 3.5 5 8.5 5 12 8.5 12 13z" fill="#7ed957"/><path d="M12 11c0-4.5 3.5-8 8.5-8 0 4.5-3.5 8-8.5 8z" fill="#4fbf4a"/><ellipse cx="12" cy="21.5" rx="5" ry="1.5" fill="#6b4a2a" opacity=".5"/>',
  roots: '<path d="M3 20c3-1 4-4 6-6s5-2 6-5 1-5 4-6" stroke="#7a5a2a" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M6 21c2-3 5-3 7-5s2-5 5-6" stroke="#5a8a2a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M9 14c-2-1-3 0-4-1M15 9c1-2 3-2 4-2M12 17c1 1 3 1 3 3" stroke="#7ed957" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="19" cy="3.6" r="1.6" fill="#7ed957"/>',
  doll: '<circle cx="12" cy="6.5" r="4" fill="#e6c26a"/><path d="M8 11h8l2 9H6z" fill="#d9a94a"/><path d="M4 12l4 1M20 12l-4 1" stroke="#d9a94a" stroke-width="2.4" stroke-linecap="round"/><path d="M9 20l-1 2.5M15 20l1 2.5" stroke="#c4923a" stroke-width="2" stroke-linecap="round"/><path d="M8 15h8M8.5 17.5h7" stroke="#a87a2a" stroke-width="1" /><circle cx="10.6" cy="6.3" r=".7" fill="#4a3018"/><circle cx="13.4" cy="6.3" r=".7" fill="#4a3018"/><path d="M10 2.5c1-1.5 3-1.5 4 0" stroke="#7ed957" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  honey: '<path d="M12 4c-1-1.5-1-2.5 0-3" stroke="#6b4a2a" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M12 3.5c2-2 4.5-2 6-.5-2 2-4 2-6 .5z" fill="#5cc85a"/><circle cx="12" cy="13" r="8" fill="#ffb52e"/><path d="M6 12c2 1 4-1 6 0s4 2 6 0" stroke="#ffd98a" stroke-width="1.6" fill="none"/><path d="M8 17c1 2 1 4 0 5M15 18c0 2 1 3 2 4" stroke="#ffb52e" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="9" cy="9.5" r="1.8" fill="#fff0c0"/>',
  worldtree: '<circle cx="12" cy="10" r="9" fill="#ffe680" opacity=".25"/><path d="M12 22v-8" stroke="#7a5a2a" stroke-width="2.4" stroke-linecap="round"/><path d="M12 15c-2-1-4-1-5 1M12 17c2-1 4-1 5 1" stroke="#7a5a2a" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="12" cy="8" r="5.5" fill="#4fbf4a"/><circle cx="8" cy="10.5" r="3.5" fill="#7ed957"/><circle cx="16" cy="10.5" r="3.5" fill="#7ed957"/><circle cx="12" cy="7" r="1.6" fill="#fff3a0"/><circle cx="9" cy="4" r=".9" fill="#fff3a0"/><circle cx="16.5" cy="5" r=".9" fill="#fff3a0"/>',
  wave: '<path d="M2 14c3-4 6-4 9 0s6 4 9 0" stroke="#3fa8ff" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M2 19c3-3 6-3 9 0s6 3 9 0" stroke="#8fd0ff" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="16" cy="6" r="2.5" fill="#bfe6ff"/><circle cx="9" cy="8" r="1.5" fill="#bfe6ff"/>',
  rock: '<path d="M3 19l3-8 5-4 6 2 4 7-2 4z" fill="#a8774a"/><path d="M6 11l5-4 2 5-4 3z" fill="#c8925a"/><path d="M13 12l4-3 4 7-6 1z" fill="#8a5f38"/>',
  moon: '<path d="M15 3a9 9 0 1 0 6 13 7 7 0 1 1-6-13z" fill="#9a6bff"/><circle cx="17" cy="7" r="1" fill="#e0d0ff"/><circle cx="20" cy="11" r=".7" fill="#e0d0ff"/>',
  sun: '<circle cx="12" cy="12" r="5" fill="#ffe680"/>' + S('M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1', '#ffd23a', 2),
  poison: '<path d="M12 2c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12z" fill="#6fd36a"/><circle cx="10" cy="14" r="2" fill="#c8ffb0"/><circle cx="14" cy="17" r="1.2" fill="#c8ffb0"/>',
  stun: '<path d="M12 3l1.6 3.4 3.6.4-2.7 2.5.8 3.6L12 11.1 8.7 12.9l.8-3.6L6.8 6.8l3.6-.4z" fill="#ffe066"/><ellipse cx="12" cy="17" rx="8" ry="3" stroke="#ffd23a" stroke-width="1.6" fill="none"/><circle cx="5" cy="16" r="1.2" fill="#fff3a0"/><circle cx="19" cy="18" r="1.2" fill="#fff3a0"/>',
  // 스킬
  fire: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 1 4 2 4 0-3-1-6 1-9z" fill="#ff6a1a"/><path d="M12 11c1 2 3 3 3 6a3 3 0 0 1-6 0c0-2 1-3 2-4 0 1 1 2 1 2 0-2-1-3 0-4z" fill="#ffd34a"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="#3f8ed6"/><path d="M12 4.2l6 2.3V11c0 3.9-2.6 7-6 8.7z" fill="#8fd8ff"/><path d="M12 8v8M8 12h8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>',
  bolt: '<path d="M13.5 2L4 14h6.5l-1.5 8L19 10h-6.5z" fill="#ffd93a" stroke="#c48a00" stroke-width="1" stroke-linejoin="round"/>',
  snowflake: S('M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7', '#9fe6ff', 2) + S('M9 3.8l3 2.2 3-2.2M9 20.2l3-2.2 3 2.2M4.1 10.6l3.2-.3-1.1-3M19.9 13.4l-3.2.3 1.1 3M4.1 13.4l3.2.3-1.1 3M19.9 10.6l-3.2-.3 1.1-3', '#dff6ff', 1.5),
  magnet: '<path d="M5 3h4v9a3 3 0 0 0 6 0V3h4v9a7 7 0 0 1-14 0z" fill="#e84a5f"/><path d="M5 3h4v4H5zM15 3h4v4h-4z" fill="#dfe4ee"/>',
  meteor: '<path d="M2 4l9 6-2.5 2.5z" fill="#ffb347" opacity=".75"/><path d="M5 2l8 8-2 2z" fill="#ff7a2e" opacity=".85"/><circle cx="15" cy="15" r="6.2" fill="#6a3a24"/><circle cx="15" cy="15" r="6.2" fill="none" stroke="#ff7a2e" stroke-width="1.5"/><circle cx="13.3" cy="13.6" r="1.7" fill="#ffb347"/><circle cx="17.2" cy="16.8" r="1.2" fill="#ffb347"/>',
  snowcloud: '<path d="M7 15a4 4 0 0 1 .5-8A5 5 0 0 1 17 6a4 4 0 0 1 0 9z" fill="#e4f6ff"/><g fill="#7fd8ff"><circle cx="8" cy="19" r="1.5"/><circle cx="12" cy="21.2" r="1.5"/><circle cx="16" cy="19" r="1.5"/></g>',
  storm: '<path d="M7 13a4 4 0 0 1 .5-8A5 5 0 0 1 17 4a4 4 0 0 1 0 9z" fill="#9aa4c0"/><path d="M13.5 11l-4.5 6.5h3.2L11 23l5.5-7.5h-3.3l1.3-4.5z" fill="#ffd93a"/>',
  snowball: '<circle cx="12" cy="12.5" r="8.5" fill="#f2fbff"/><path d="M12 4a8.5 8.5 0 0 1 0 17 6 6 0 0 0 0-17z" fill="#cdeeff"/><circle cx="9" cy="9.5" r="2.2" fill="#fff"/><circle cx="14.5" cy="15" r="1.2" fill="#b0dcf5"/>',
  beam: '<path d="M19 1h-3.5L8 17h3.5z" fill="#fff6a0" opacity=".85"/><path d="M17.2 1h1L10.3 17h-1z" fill="#fff"/><ellipse cx="10" cy="18.5" rx="7" ry="2.8" fill="#ffe066" opacity=".55"/>' + S('M4 17l-2-2M16 17.5l3-2M10 21.5V23', '#ffd93a', 1.5),
  sparkle: '<path d="M11 2l2.2 7.8L21 12l-7.8 2.2L11 22l-2.2-7.8L1 12l7.8-2.2z" fill="#ffd45a"/><path d="M19.5 1.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="#fff3b0"/>',
  skull: '<path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5 3 6v4.5h10V16c1.5-1 3-3 3-6a8 8 0 0 0-8-8z" fill="#ecdcff"/><circle cx="8.8" cy="11" r="2.3" fill="#3a2350"/><circle cx="15.2" cy="11" r="2.3" fill="#3a2350"/><path d="M11 15.5h2l-1-2z" fill="#3a2350"/>' + S('M10 20.5v-2.2M14 20.5v-2.2', '#3a2350', 1.3),
  flamewave: '<path d="M3 21c2-1 3-4 2-8 3 2 4 5 4 8z" fill="#ff8a2a"/><path d="M8 21.5c1-3 1-7-1-12.5 4 2 7 7.5 6 12.5z" fill="#ff5a14"/><path d="M14 21.5c0-4 2-8 6.5-10.5-1 4 1 7.5 0 10.5z" fill="#ffb347"/><path d="M10.4 21.5c0-2 0-4-1-6 2 1 3.5 3.5 3 6z" fill="#ffe08a"/>',
  // 레벨업 / 아이템
  puzzle: '<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H4v-4a2 2 0 1 0 0-4z" fill="#9d6bff"/><path d="M6 10h3" stroke="#d8c8ff" stroke-width="1.4" stroke-linecap="round"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1.5" fill="#e8a91f"/><rect x="2" y="6" width="20" height="4" rx="1" fill="#ffd45a"/><rect x="10.5" y="6" width="3" height="15" fill="#e84a5f"/><path d="M12 6c-2-4.5-6.5-3-5 0zM12 6c2-4.5 6.5-3 5 0z" fill="#e84a5f"/>',
  // UI
  book: '<path d="M4 3h11a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3z" fill="#4a7fe8"/><path d="M7 18h11v3H7a1.5 1.5 0 0 1 0-3z" fill="#e8eefc"/><rect x="8" y="7" width="7" height="1.6" rx=".8" fill="#cfe0ff"/><rect x="8" y="10" width="5" height="1.6" rx=".8" fill="#cfe0ff"/>',
  bag: S('M8 7a4 4 0 0 1 8 0', '#8a5a2c', 2) + '<rect x="4" y="6.5" width="16" height="14.5" rx="3" fill="#c07a3a"/><rect x="7" y="12" width="10" height="6" rx="1.5" fill="#a0602a"/><rect x="11" y="11" width="2" height="3" rx=".6" fill="#ffd45a"/>',
  flask: '<path d="M9 2h6v2h-1v5l5 9a2 2 0 0 1-1.8 3H6.8A2 2 0 0 1 5 18l5-9V4H9z" fill="#ebe8ff"/><path d="M7.2 15h9.6l1.4 2.8a1 1 0 0 1-.9 1.6H6.7a1 1 0 0 1-.9-1.6z" fill="#b08cff"/><circle cx="11" cy="12" r="1" fill="#b08cff"/><circle cx="13.5" cy="10" r=".7" fill="#b08cff"/>',
  arrowUp: '<path d="M12 3l8.5 9H15v9H9v-9H3.5z" fill="#ffd45a"/><path d="M12 3l8.5 9H15" fill="#ffe89a"/>',
  gear: '<path d="M10.3 2h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9L2 13.7v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8z" fill="#c3c9e0"/><circle cx="12" cy="12" r="3.5" fill="#2a2f4a"/>',
  flag: S('M5 2v20', '#d8dde8', 2) + '<path d="M6 3h12.5l-3 4 3 4H6z" fill="#ffffff"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4" fill="#ffffff"/><g fill="#3a3f5c"><circle cx="8" cy="8" r="1.7"/><circle cx="16" cy="8" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="8" cy="16" r="1.7"/><circle cx="16" cy="16" r="1.7"/></g>',
  coin: '<circle cx="12" cy="12" r="9.5" fill="#ffc83a"/><circle cx="12" cy="12" r="6.8" fill="#ffd96a" stroke="#e8a20f" stroke-width="1.5"/><path d="M10 8.5l2-1.5v10" stroke="#b07a00" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  wind: S('M3 8h11a3 3 0 1 0-3-3M3 12h15.5a3 3 0 1 1-3 3M3 16h7', '#bfe6ff', 2.2),
  pause: '<rect x="6" y="4" width="4" height="16" rx="1.2" fill="#ffffff"/><rect x="14" y="4" width="4" height="16" rx="1.2" fill="#ffffff"/>',
  lock: S('M8 10V7a4 4 0 0 1 8 0v3', '#d8dde8', 2.2) + '<rect x="5" y="10" width="14" height="11" rx="2" fill="#ffd45a"/><rect x="11" y="13" width="2" height="4.5" rx="1" fill="#8a6a10"/>',
  speaker: '<path d="M3 9h4l5-4v14l-5-4H3z" fill="#d8dde8"/>' + S('M15 8.5a5 5 0 0 1 0 7M17.8 5.5a9 9 0 0 1 0 13', '#d8dde8', 2),
  gamepad: '<path d="M7 7h10a5 5 0 0 1 4.8 6.3l-1 3.5a2.5 2.5 0 0 1-4.3.9L15 16H9l-1.5 1.7a2.5 2.5 0 0 1-4.3-.9l-1-3.5A5 5 0 0 1 7 7z" fill="#c3c9e0"/>' + S('M7 10v4M5 12h4', '#2a2f4a', 1.7) + '<circle cx="16" cy="11" r="1.3" fill="#e84a5f"/><circle cx="18.3" cy="13.3" r="1.3" fill="#4aa8e8"/>',
  scroll: '<path d="M6 3h12v15a3 3 0 0 1-3 3H6z" fill="#f2e4c4"/><path d="M4 18h11a3 3 0 0 0 3 3H7a3 3 0 0 1-3-3z" fill="#d8c08a"/>' + S('M9 8h6M9 11h6M9 14h4', '#9d6bff', 1.6),
  calc: '<rect x="4" y="2" width="16" height="20" rx="2.5" fill="#ff4f7b"/><rect x="6.5" y="4.5" width="11" height="4" rx="1" fill="#ffe1ea"/>' + S('M7.5 13.5h3M9 12v3M13.5 13.5h3M7.5 18.5h3M14 17l2.5 2.5M16.5 17L14 19.5', '#ffffff', 1.5),
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="#ffd45a"/><path d="M5 19h14v2H5z" fill="#e8a91f"/><circle cx="12" cy="14" r="1.7" fill="#e23b5a"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9z" fill="#3f8cff"/><path d="M2 9h20M8 3l4 18 4-18" stroke="#a8d4ff" stroke-width="1" fill="none"/>',
  warn: '<path d="M12 2.5l10 18.5H2z" fill="#ffb84a"/><rect x="11" y="8.5" width="2" height="7" rx="1" fill="#3a2400"/><circle cx="12" cy="18" r="1.2" fill="#3a2400"/>',
  bug: '<ellipse cx="12" cy="14" rx="6" ry="7" fill="#7fe0a0"/><circle cx="12" cy="6.5" r="3" fill="#5ac080"/><path d="M12 8v13" stroke="#2a6a40" stroke-width="1.3"/>' + S('M6 11l-3-2M6 15H2.5M6.5 19l-3 2M18 11l3-2M18 15h3.5M17.5 19l3 2', '#5ac080', 1.6),
  // 업그레이드
  dumbbell: '<rect x="2" y="9" width="3" height="6" rx="1" fill="#8a90a8"/><rect x="5" y="6.5" width="3.2" height="11" rx="1" fill="#c3c9e0"/><rect x="8" y="11" width="8" height="2" fill="#e0e4ee"/><rect x="15.8" y="6.5" width="3.2" height="11" rx="1" fill="#c3c9e0"/><rect x="19" y="9" width="3" height="6" rx="1" fill="#8a90a8"/>',
  heart: '<path d="M12 21l-8.3-8.3a5.2 5.2 0 0 1 8.3-6.3 5.2 5.2 0 0 1 8.3 6.3z" fill="#ff5a6e"/><path d="M7.5 8.5a2.5 2.5 0 0 1 3 0" stroke="#ffc0c8" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  leaf: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z" fill="#6fcf5a"/>' + S('M5 19L15 9', '#3f9a35', 1.6),
  bandage: '<g transform="rotate(-40 12 12)"><rect x="2.5" y="8" width="19" height="8" rx="4" fill="#f2d8c0"/><rect x="9.5" y="8" width="5" height="8" fill="#ffb0a0"/></g><circle cx="11" cy="12" r=".6" fill="#c08070"/><circle cx="13" cy="12" r=".6" fill="#c08070"/>',
  boot: '<path d="M6 3h6v9l7 3a3 3 0 0 1 2 3v1.5H4V12z" fill="#5fb8ff"/><path d="M4 18.5h17V21H4z" fill="#2a2f4a"/>',
  leap: S('M5 13l7-6 7 6M5 19.5l7-6 7 6', '#7fe0a0', 2.6),
  crystal: '<path d="M12 2l6.5 7.5L12 22 5.5 9.5z" fill="#4a7fe8"/><path d="M12 2l6.5 7.5h-13z" fill="#8fb4ff"/>',
  swirl: S('M12 12a2 2 0 1 1 2-2 4 4 0 1 1-4-4 6 6 0 1 1-6 6 8 8 0 0 1 8-8', '#7fb8ff', 2),
  orb: '<circle cx="12" cy="10.5" r="7.5" fill="#9d6bff"/><circle cx="9.5" cy="8" r="2.2" fill="#e8d8ff"/><path d="M6.5 19h11l-1 3h-9z" fill="#c07a3a"/>',
  prism: '<path d="M10 3.5l7.5 14H2.5z" fill="#e8f4ff" opacity=".9"/>' + S('M13 12.5l9-2.5', '#ff5a6e', 1.6) + S('M13 13.5l9 0.5', '#ffd93a', 1.6) + S('M13 14.5l9 3.5', '#4aa8e8', 1.6),
  lotus: '<path d="M12 3.5c2.2 3.2 2.2 7.5 0 11.5-2.2-4-2.2-8.3 0-11.5z" fill="#ffb0d0"/><path d="M12 15c-2-3.2-6.2-5.2-9.5-4.2 1 4.2 5.3 5.4 9.5 4.2zM12 15c2-3.2 6.2-5.2 9.5-4.2-1 4.2-5.3 5.4-9.5 4.2z" fill="#ff8ac0"/>' + S('M5 19.5h14', '#7fd8a0', 2),
  hand: '<circle cx="14" cy="6.5" r="3.5" fill="#7fd8ff"/><path d="M2 14c3 0 5.5 1 7 2h5a1.5 1.5 0 0 1 0 3h-4 7.5l3.5-3a1.6 1.6 0 0 1 2.2 2.2L18.5 23H8l-6-2.5z" fill="#f6cfae"/>',
};

export function ic(name, cls = '') {
  const b = ICONS[name];
  return b ? `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${b}</svg>` : '';
}

// HTML 안의 <i data-ic="이름"></i> 를 아이콘으로 바꿈
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-ic]').forEach((e) => { e.outerHTML = ic(e.dataset.ic); });
}
