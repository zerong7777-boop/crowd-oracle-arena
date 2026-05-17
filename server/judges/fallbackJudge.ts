import type { Judgment } from "../../shared/types.js";
import type { JudgeInput, JudgeResult } from "./types.js";

const VERDICTS = [
  "命运轻微倾斜",
  "神谕眨了两次眼",
  "危险地有说服力",
  "光荣的文字漏洞",
  "可疑但很难反驳"
];

const AWARDS = [
  "最危险自信奖",
  "最佳外交尝试奖",
  "神谕轻微愉悦奖",
  "混乱但动人奖",
  "确实是一句话奖"
];

function hashText(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function scoreAnswer(answer: string, playerId: string): number {
  const lengthScore = Math.min(answer.length, 160) * 0.25;
  const punctuationScore = /[!?]/.test(answer) ? 7 : 0;
  const commaScore = answer.includes(",") ? 4 : 0;
  const seedScore = hashText(`${playerId}:${answer}`) % 28;
  return Math.max(0, Math.min(100, Math.round(38 + lengthScore + punctuationScore + commaScore + seedScore)));
}

export function judgeWithFallback(input: JudgeInput): JudgeResult {
  const judgments: Judgment[] = input.submissions.map((submission, index) => {
    const player = input.players.find((item) => item.id === submission.playerId);
    const score = scoreAnswer(submission.answer, submission.playerId);
    return {
      playerId: submission.playerId,
      score,
      verdictTitle: VERDICTS[(score + index) % VERDICTS.length],
      commentary: `${player?.nickname ?? "这位参赛者"} 的申辩让神谕至少愿意假装认真考虑。`,
      award: AWARDS[(hashText(submission.answer) + index) % AWARDS.length],
      riskFlag: "ok"
    };
  });

  const champion = [...judgments].sort((a, b) => b.score - a.score)[0];
  const championName = input.players.find((player) => player.id === champion?.playerId)?.nickname ?? "无人";

  return {
    roundSummary: `神谕已审判 ${judgments.length} 份答案，本轮题目是「${input.challenge.title}」。`,
    judgments,
    championCallout: `${championName} 目前最能扭动命运。`
  };
}
