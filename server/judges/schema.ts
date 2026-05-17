import { z } from "zod";
import type { JudgeResult } from "./types.js";

export const rawJudgmentSchema = z.object({
  player_id: z.string().min(1),
  score: z.number().int().min(0).max(100),
  verdict_title: z.string().min(1).max(120),
  commentary: z.string().min(1).max(600),
  award: z.string().min(1).max(120),
  risk_flag: z.enum(["ok", "too_sensitive", "off_topic"]).default("ok")
});

export const rawJudgeResultSchema = z.object({
  round_summary: z.string().min(1).max(600),
  judgments: z.array(rawJudgmentSchema),
  champion_callout: z.string().min(1).max(360)
});

export function normalizeJudgeResult(raw: unknown, expectedPlayerIds: string[]): JudgeResult {
  const parsed = rawJudgeResultSchema.parse(raw);
  const expected = new Set(expectedPlayerIds);
  const seen = new Set<string>();

  const judgments = parsed.judgments.map((judgment) => {
    if (!expected.has(judgment.player_id)) {
      throw new Error(`Unexpected player_id in judge result: ${judgment.player_id}`);
    }
    if (seen.has(judgment.player_id)) {
      throw new Error(`Duplicate player_id in judge result: ${judgment.player_id}`);
    }
    seen.add(judgment.player_id);
    return {
      playerId: judgment.player_id,
      score: judgment.score,
      verdictTitle: judgment.verdict_title,
      commentary: judgment.commentary,
      award: judgment.award,
      riskFlag: judgment.risk_flag
    };
  });

  for (const playerId of expected) {
    if (!seen.has(playerId)) {
      throw new Error(`Missing player_id in judge result: ${playerId}`);
    }
  }

  return {
    roundSummary: parsed.round_summary,
    judgments,
    championCallout: parsed.champion_callout
  };
}
