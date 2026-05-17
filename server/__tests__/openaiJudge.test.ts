import { describe, expect, it } from "vitest";
import { CHALLENGES } from "../../shared/challenges.js";
import {
  getOpenAIClientOptions,
  getOpenAIModel,
  judgeWithOpenAI,
  normalizeChatCompletionContent,
  ORACLE_SYSTEM_PROMPT,
  shouldUseChatCompletions
} from "../judges/openaiJudge.js";

describe("judgeWithOpenAI", () => {
  it("fails clearly when OPENAI_API_KEY is missing", async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    await expect(
      judgeWithOpenAI({
        challenge: CHALLENGES[0],
        players: [{ id: "p1", nickname: "Ada" }],
        submissions: [{ playerId: "p1", answer: "Spare us with a song.", submittedAt: 1 }]
      })
    ).rejects.toThrow("OPENAI_API_KEY is not configured");

    process.env.OPENAI_API_KEY = previous;
  });

  it("uses an OpenAI-compatible base URL when configured", () => {
    const options = getOpenAIClientOptions("test-key", "https://zxai.work/v1");

    expect(options).toEqual({
      apiKey: "test-key",
      baseURL: "https://zxai.work/v1"
    });
  });

  it("uses chat completions for OpenAI-compatible endpoints", () => {
    expect(shouldUseChatCompletions("https://zxai.work/v1")).toBe(true);
    expect(shouldUseChatCompletions(undefined)).toBe(false);
  });

  it("defaults to a compatible model when a custom base URL is configured", () => {
    expect(getOpenAIModel("https://zxai.work/v1")).toBe("gpt-5.2");
    expect(getOpenAIModel(undefined)).toBe("gpt-4.1-mini");
  });

  it("instructs the oracle to recognize hidden references before roasting", () => {
    expect(ORACLE_SYSTEM_PROMPT).toContain("先识梗");
    expect(ORACLE_SYSTEM_PROMPT).toContain("绑定题目设定");
    expect(ORACLE_SYSTEM_PROMPT).toContain("成人抽象嘴臭");
    expect(ORACLE_SYSTEM_PROMPT).toContain("不要只抓单个字做廉价联想");
    expect(ORACLE_SYSTEM_PROMPT).toContain("不攻击现实身份");
  });

  it("normalizes JSON returned by chat completions", () => {
    const result = normalizeChatCompletionContent(
      JSON.stringify({
        round_summary: "神谕完成裁决。",
        champion_callout: "Ron 扭动了命运。",
        judgments: [
          {
            player_id: "p1",
            score: 86,
            verdict_title: "年会护村者",
            commentary: "这个条件荒诞但有预算感。",
            award: "最佳离谱公关奖",
            risk_flag: "ok"
          }
        ]
      }),
      ["p1"]
    );

    expect(result.judgments[0].score).toBe(86);
    expect(result.championCallout).toContain("Ron");
  });
});
