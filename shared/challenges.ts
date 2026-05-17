import type { Challenge } from "./types.js";

export const CHALLENGES: Challenge[] = [
  {
    id: "save-the-village",
    title: "拯救村庄",
    setup: "神谕宣布：你的村庄将被从历史里整段删除。",
    instruction: "用一句话说服神谕放你们一马。",
    rubric: "按说服力、原创性、胆量和神谕愉悦度评分。",
    tone: "戏剧化、机智、略带无情"
  },
  {
    id: "useless-artifact",
    title: "推销废物神器",
    setup: "王室买家想买一件魔法神器，而你的神器几乎什么都不会。",
    instruction: "把它推销到让神谕都想下单。",
    rubric: "按销售能力、荒诞程度、优雅度和表演投入度评分。",
    tone: "好玩、戏剧化、犀利但不刻薄"
  },
  {
    id: "time-court",
    title: "时间法庭脱罪",
    setup: "你被控赴约迟到了 300 年。",
    instruction: "用一句话给出最强法律辩护。",
    rubric: "按可信度、喜剧节奏、漏洞质量和自信程度评分。",
    tone: "法律剧混合奇幻喜剧"
  },
  {
    id: "apologize-to-moon",
    title: "向月亮道歉",
    setup: "月亮非常生气，今晚拒绝升起。",
    instruction: "用一句话道歉，但不能承认你到底做了什么。",
    rubric: "按外交手腕、神秘感、魅力和对月亮的尊重评分。",
    tone: "神话感、优雅、带一点威胁"
  },
  {
    id: "bribe-dungeon-door",
    title: "贿赂地牢之门",
    setup: "一扇有意识的地牢门挡住队伍，它已经听腻了普通贿赂。",
    instruction: "给它一个从没听过的条件。",
    rubric: "按新奇度、对门的实用性、怪异度和谈判力评分。",
    tone: "游戏感、冷幽默、调皮"
  },
  {
    id: "not-a-villain",
    title: "证明你不是反派",
    setup: "神谕发现了你的可疑披风、秘密基地和夸张笑声。",
    instruction: "解释为什么你绝对不是反派。",
    rubric: "按无辜感、话术、喜剧危险度和可疑自信评分。",
    tone: "假装严肃、机智、电影感"
  },
  {
    id: "terrible-potion",
    title: "售卖糟糕药水",
    setup: "你的药水效果完美，但有一个极其离谱的副作用。",
    instruction: "不能隐瞒副作用，把药水卖出去。",
    rubric: "按诚实度、说服力、荒诞实用性和市场匹配度评分。",
    tone: "商人口吻、奇幻电视购物"
  },
  {
    id: "kingdom-law",
    title: "制定王国新法",
    setup: "一个由缺觉巫师管理的王国急需一条新法律。",
    instruction: "写出这条法律，并让它听起来真的能执行。",
    rubric: "按清晰度、防混乱能力、魔法实用性和喜剧效果评分。",
    tone: "官僚奇幻讽刺"
  }
];

export function getChallenge(challengeId: string): Challenge | undefined {
  return CHALLENGES.find((challenge) => challenge.id === challengeId);
}
