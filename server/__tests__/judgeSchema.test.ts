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
});
