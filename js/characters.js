// ─────────────────────────────────────────────
//  캐릭터: 고유 패시브 + 전용 스킬 8종 (숙련도에 따라 해금)
//  스테이지를 시작하면 전용 스킬 1번을 장착하고 시작함
// ─────────────────────────────────────────────
import { accountNeed } from './config.js';

export const CHARACTERS = {
  masang: {
    id: 'masang', name: '마솽', icon: 'sprout', color: '#7ed957',
    desc: '숲에서 태어난 새싹 정령입니다. 쓰러뜨린 적에게서 양분을 모아 전장에 꽃을 피우고, 피어난 꽃과 열매로 적을 몰아냅니다.',
    passive: {
      name: '개화', icon: 'flower',
      desc: '적을 처치하면 양분을 1 얻습니다. 양분이 5가 되면 주위(30 거리)의 무작위 위치에 꽃을 피웁니다. 적이 꽃에 닿으면 1초 뒤 주위(효과 범위 20)에 12~16의 피해를 줍니다.',
    },
    // 전용 스킬 8칸 (null = 아직 정해지지 않은 스킬)
    skills: ['leafCut', 'nature', 'fruit', 'pineWind', null, null, null, null],
    unlock: { leafCut: 1, nature: 1, fruit: 1, pineWind: 2 },   // 숙련도 해금 레벨
  },
};
export const CHARACTER_ORDER = ['masang'];
export const DEFAULT_CHARACTER = 'masang';

// 숙련도 필요 경험치 (계정 레벨과 같은 증가 방식)
export const masteryNeed = (lv) => accountNeed(lv);

export const ownerOf = (skillKey) => CHARACTER_ORDER.find((id) => CHARACTERS[id].skills.includes(skillKey)) || null;
export const masteryUnlock = (skillKey) => {
  const id = ownerOf(skillKey);
  return id ? CHARACTERS[id].unlock[skillKey] || 1 : 1;
};
