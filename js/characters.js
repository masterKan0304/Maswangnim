// ─────────────────────────────────────────────
//  캐릭터: 고유 패시브 + 전용 스킬 8종 (숙련도에 따라 해금)
//  스테이지를 시작하면 전용 스킬 1번을 장착하고 시작함
// ─────────────────────────────────────────────
import { accountNeed } from './config.js';

export const CHARACTERS = {
  masang: {
    id: 'masang', name: '마솽', icon: 'sprout', color: '#7ed957', element: 'nature',
    desc: '숲에서 태어난 새싹 정령입니다. 쓰러뜨린 적에게서 양분을 모아 전장에 꽃을 피우고, 피어난 꽃과 열매로 적을 몰아냅니다.',
    passive: {
      name: '개화', icon: 'flower',
      desc: '적을 처치하면 양분을 1 얻습니다. 양분이 5가 되면 주위(30 거리)의 무작위 위치에 꽃을 피웁니다. 적이 꽃에 닿으면 1초 뒤 주위(효과 범위 20)에 12~16의 피해를 줍니다.',
    },
    // 전용 스킬 8칸 (null = 아직 정해지지 않은 스킬)
    skills: ['leafCut', 'nature', 'fruit', 'pineWind', 'roots', 'strawDoll', 'honeyBomb', 'worldSeed'],
    unlock: { leafCut: 1, nature: 1, fruit: 1, pineWind: 2, roots: 3, strawDoll: 4, honeyBomb: 5, worldSeed: 6 },   // 숙련도 해금 레벨
  },
  gerger: {
    id: 'gerger', name: '게르게르', icon: 'paw', color: '#9a6bff', element: 'dark', sub: '어둠의 사냥개',
    speedMul: 1.2,      // 기본 이동 속도 120%
    noMana: true,       // 마나 대신 어둠 게이지
    night: true,        // 스테이지가 밤이 됨
    unlockReq: { accountLevel: 5, gold: 10000 },
    desc: '어둠 속에서 적들을 추적하는 사냥개입니다. 고요한 밤 속에서 적들을 공포에 빠트리고 기습하여 재빠르게 다수의 적들을 사냥하고 강적을 교란합니다.',
    traits: ['기본 이동 속도 120%', '마나 대신 어둠 게이지 (최대 100, 0에서 시작) · 마나 관련 효과를 받지 않음', '이 캐릭터로 입장하면 스테이지가 밤이 됨'],
    passive: {
      name: '악의', icon: 'malice',
      desc: '2초 안에 적의 최대 체력의 50%만큼 피해를 주면 그 적을 공포 상태로 만듭니다. 공포 상태인 적을 처치하면 어둠 게이지를 2 얻습니다. 일부 스킬은 어둠 게이지를 사용하며, 소모한 어둠 게이지 1당 4초 동안 이동 속도가 1%, 스킬 피해가 2% 증가합니다.',
    },
    skills: ['claw', 'dreamEat', 'cruelBurst', 'darkEye', 'ambush', 'bleedInduce', 'blackSabbath', 'nightFall'],
    unlock: { claw: 1, dreamEat: 1, cruelBurst: 1, darkEye: 2, ambush: 3, bleedInduce: 4, blackSabbath: 5, nightFall: 6 },
  },
};
export const CHARACTER_ORDER = ['masang', 'gerger'];
export const DEFAULT_CHARACTER = 'masang';

// 숙련도 필요 경험치 (계정 레벨과 같은 증가 방식)
export const masteryNeed = (lv) => accountNeed(lv);

export const ownerOf = (skillKey) => CHARACTER_ORDER.find((id) => CHARACTERS[id].skills.includes(skillKey)) || null;
export const masteryUnlock = (skillKey) => {
  const id = ownerOf(skillKey);
  return id ? CHARACTERS[id].unlock[skillKey] || 1 : 1;
};
