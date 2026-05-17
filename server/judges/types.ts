import type { Challenge, Judgment, Submission } from "../../shared/types.js";

export type JudgeInput = {
  challenge: Challenge;
  submissions: Submission[];
  players: Array<{ id: string; nickname: string }>;
};

export type JudgeResult = {
  roundSummary: string;
  judgments: Judgment[];
  championCallout: string;
};
