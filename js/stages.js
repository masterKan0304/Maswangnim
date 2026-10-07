// ─────────────────────────────────────────────
//  스테이지 목록 (앞 스테이지를 클리어해야 다음 스테이지가 열림)
//  map: 사용하는 맵 / ready: 플레이 가능 여부 (준비 중인 스테이지는 false)
//  reward: 첫 클리어 보상 (중복 획득 불가)
// ─────────────────────────────────────────────
export const STAGES = [
  { id: 0, name: '튜토리얼', no: 'TUTORIAL', map: 'meadow', icon: 'book', ready: true, colors: ['#b8a4ff', '#5b44c9'], tutorial: true,
    desc: '초원에서 퀘스트를 하나씩 따라 하며 기본 조작과 블록 사용법을 배웁니다.',
    time: '제한 없음', clear: '모든 퀘스트 완료 시 클리어', reward: { gold: 2000 } },
  { id: 1, name: '초원', no: 'STAGE 1', map: 'meadow', icon: 'leaf', ready: true, colors: ['#8fd35c', '#3f8f3a'],
    desc: '푸른 초원에서 몰려오는 슬라임을 버티고 킹 슬라임을 쓰러뜨리세요.',
    time: '10분', clear: '보스 처치 시 클리어', reward: { gold: 5000 } },
  { id: 2, name: '설원', no: 'STAGE 2', map: 'snowfield', icon: 'snowflake', ready: false, colors: ['#d8f2ff', '#6fa8d8'],
    desc: '얼어붙은 설원입니다. 준비 중인 스테이지입니다.',
    time: '10분', clear: '보스 처치 시 클리어', reward: { gold: 8000 } },
  { id: 3, name: '화산', no: 'STAGE 3', map: 'volcano', icon: 'fire', ready: false, colors: ['#ff9a5a', '#a8321e'],
    desc: '용암이 흐르는 화산입니다. 준비 중인 스테이지입니다.',
    time: '10분', clear: '보스 처치 시 클리어', reward: { gold: 12000 } },
];

// 맵 (미리보기 화면에서 맵들을 오가며 보여 줌)
export const MAPS = {
  meadow: { name: '초원' },
};

export const stageById = (id) => STAGES.find((s) => s.id === id) || STAGES[0];
export const stageLabel = (st) => (st.tutorial ? st.name : `스테이지 ${st.id} · ${st.name}`);
// 튜토리얼과 스테이지 1 은 처음부터 열려 있음
export const isStageUnlocked = (id, cleared) => id <= 1 || cleared.includes(id - 1);
export const isStartable = (st, cleared) => st.ready && isStageUnlocked(st.id, cleared);
// 지금 시작할 수 있는 마지막 스테이지
export const lastStartable = (cleared) => [...STAGES].reverse().find((s) => isStartable(s, cleared)) || STAGES[0];
// 미리보기에 쓸 수 있는 맵 (플레이 가능한 스테이지의 맵)
export const previewStages = () => STAGES.filter((s) => s.ready && !s.tutorial && MAPS[s.map]);
