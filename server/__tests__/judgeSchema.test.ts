import { describe, expect, it } from "vitest";
import { normalizeJudgeResult } from "../judges/schema.js";

describe("normalizeJudgeResult", () => {
  it("normalizes valid snake_case model output", () => {
    const result = normalizeJudgeResult(
      {
        round_summary: "The Oracle was entertained.",
        judgments: [
          {
            player_id: "p1",
            score: 91,
            verdict_title: "Golden Nonsense",
            commentary: "Absurd, but delivered with heroic confidence.",
            award: "Most Dangerous Confidence",
            risk_flag: "ok"
          }
        ],
        champion_callout: "p1 bent fate without breaking eye contact."
      },
      ["p1"]
    );

    expect(result.judgments[0]).toMatchObject({
      playerId: "p1",
      score: 91,
      verdictTitle: "Golden Nonsense"
    });
  });

  it("rejects missing players", () => {
    expect(() =>
      normalizeJudgeResult(
        {
          round_summary: "Incomplete.",
          judgments: [],
          champion_callout: "No champion."
        },
        ["p1"]
      )
    ).toThrow("Missing player_id");
  });

  it("rejects invented players", () => {
    expect(() =>
      normalizeJudgeResult(
        {
          round_summary: "Suspicious.",
          judgments: [
            {
              player_id: "invented",
              score: 44,
              verdict_title: "Ghost",
              commentary: "No such contender.",
              award: "Phantom",
              risk_flag: "ok"
            }
          ],
          champion_callout: "None."
        },
        ["p1"]
      )
    ).toThrow("Unexpected player_id");
  });

  it("rejects out-of-range scores", () => {
    expect(() =>
      normalizeJudgeResult(
        {
          round_summary: "Too much.",
          judgments: [
            {
              player_id: "p1",
              score: 101,
              verdict_title: "Impossible",
              commentary: "This should fail.",
              award: "Too High",
              risk_flag: "ok"
            }
          ],
          champion_callout: "No champion."
        },
        ["p1"]
      )
    ).toThrow();
  });

  it("accepts longer roast commentary from the oracle", () => {
    const commentary =
      "这套辩护不是证明自己无辜，是把可疑披风、阴暗基地和傻笑全塞进一个海底老英雄壳子里硬洗。最离谱的是它还真有点成立，因为海超人本来就是那种看着像精神状态年久失修、但阵营确实偏正义的怪东西。神谕看完只能说：反派味没洗干净，英雄证倒是从海水里泡出来了。你这不是清白，你这是把犯罪嫌疑包装成儿童频道退休返聘，荒唐到让人想报警，报警理由还得写“此人正义得太可疑”。披风、傻笑、秘密基地三个雷点一个没解释，硬靠一个童年英雄梗把案底糊过去，这操作烂得很有想象力，也正因为太烂，反而不像标准反派会交的作业。";

    expect(commentary.length).toBeGreaterThan(240);

    const result = normalizeJudgeResult(
      {
        round_summary: "神谕完成裁决。",
        judgments: [
          {
            player_id: "p1",
            score: 88,
            verdict_title: "反派没抓到，海底老登先浮上来了",
            commentary,
            award: "最佳年久失修英雄证",
            risk_flag: "ok"
          }
        ],
        champion_callout: "Ron 把反派嫌疑洗成了海底老英雄事故。"
      },
      ["p1"]
    );

    expect(result.judgments[0].commentary).toBe(commentary);
  });
});
