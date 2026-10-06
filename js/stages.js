// ─────────────────────────────────────────────
//  스테이지 목록 (앞 스테이지를 클리어해야 다음 스테이지가 열림)
//  map: 사용하는 맵 / ready: 플레이 가능 여부 (준비 중인 스테이지는 false)
// ─────────────────────────────────────────────
export const STAGES = [
  { id: 1, name: '초원', map: 'meadow', icon: 'leaf', ready: true, colors: ['#8fd35c', '#3f8f3a'],
    desc: '푸른 초원에서 몰려오는 슬라임을 10분 동안 버티고 킹 슬라임을 쓰러뜨리세요.' },
  { id: 2, name: '설원', map: 'snowfield', icon: 'snowflake', ready: false, colors: ['#d8f2ff', '#6fa8d8'],
    desc: '얼어붙은 설원입니다. 준비 중인 스테이지입니다.' },
  { id: 3, name: '화산', map: 'volcano', icon: 'fire', ready: false, colors: ['#ff9a5a', '#a8321e'],
    desc: '용암이 흐르는 화산입니다. 준비 중인 스테이지입니다.' },
];

// 맵 (미리보기 화면에서 맵들을 오가며 보여 줌)
export const MAPS = {
  meadow: { name: '초원' },
};

export const stageById = (id) => STAGES.find((s) => s.id === id) || STAGES[0];
export const isStageUnlocked = (id, cleared) => id === 1 || cleared.includes(id - 1);
// 미리보기에 쓸 수 있는 맵 (플레이 가능한 스테이지의 맵)
export const previewStages = () => STAGES.filter((s) => s.ready && MAPS[s.map]);
