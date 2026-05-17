export type RoomPhase =
  | "lobby"
  | "challenge"
  | "submissions"
  | "judging"
  | "reveal"
  | "scoreboard";

export type RiskFlag = "ok" | "too_sensitive" | "off_topic";

export type Player = {
  id: string;
  nickname: string;
  connected: boolean;
  scoreTotal: number;
  joinedAt: number;
};

export type Challenge = {
  id: string;
  title: string;
  setup: string;
  instruction: string;
  rubric: string;
  tone: string;
};

export type Submission = {
  playerId: string;
  answer: string;
  submittedAt: number;
};

export type Judgment = {
  playerId: string;
  score: number;
  verdictTitle: string;
  commentary: string;
  award: string;
  riskFlag: RiskFlag;
};

export type Round = {
  id: string;
  challengeId: string;
  submissions: Record<string, Submission>;
  judgments: Record<string, Judgment>;
  status: "open" | "closed" | "judged";
  roundSummary?: string;
  championCallout?: string;
};

export type Room = {
  code: string;
  phase: RoomPhase;
  createdAt: number;
  activeChallengeId?: string;
  activeRoundId?: string;
  players: Record<string, Player>;
  rounds: Round[];
  revealIndex: number;
  hostNotice?: string;
};

export type PublicRoom = Room & {
  joinUrl: string;
};

export type JudgmentResult = {
  roundSummary: string;
  judgments: Judgment[];
  championCallout: string;
};
