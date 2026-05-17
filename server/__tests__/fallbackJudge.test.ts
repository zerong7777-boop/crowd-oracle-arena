import { describe, expect, it } from "vitest";
import { CHALLENGES } from "../../shared/challenges.js";
import { judgeWithFallback } from "../judges/fallbackJudge.js";

describe("judgeWithFallback", () => {
  it("returns one judgment per submission", () => {
    const result = judgeWithFallback({
      challenge: CHALLENGES[0],
      players: [
        { id: "p1", nickname: "Ada" },
        { id: "p2", nickname: "Lin" }
      ],
      submissions: [
        { playerId: "p1", answer: "Spare us and I will teach your statue to sing.", submittedAt: 1 },
        { playerId: "p2", answer: "Erase us and you will have to do the paperwork.", submittedAt: 2 }
      ]
    });

    expect(result.judgments).toHaveLength(2);
    expect(result.judgments.map((item) => item.playerId).sort()).toEqual(["p1", "p2"]);
    expect(result.judgments[0].score).toBeGreaterThanOrEqual(0);
    expect(result.judgments[0].score).toBeLessThanOrEqual(100);
  });

  it("is deterministic for the same input", () => {
    const input = {
      challenge: CHALLENGES[0],
      players: [{ id: "p1", nickname: "Ada" }],
      submissions: [{ playerId: "p1", answer: "A bold answer!", submittedAt: 1 }]
    };

    expect(judgeWithFallback(input)).toEqual(judgeWithFallback(input));
  });
});
