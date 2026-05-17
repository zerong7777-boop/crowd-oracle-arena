import { nanoid } from "nanoid";
import { CHALLENGES, getChallenge } from "../shared/challenges.js";
import type { JudgmentResult, Player, PublicRoom, Room } from "../shared/types.js";

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type RoomStoreOptions = {
  baseUrl: string;
};

export type JoinResult = {
  room: PublicRoom;
  player: Player;
};

export function createRoomStore(options: RoomStoreOptions) {
  const rooms = new Map<string, Room>();

  function toPublicRoom(room: Room): PublicRoom {
    return {
      ...structuredClone(room),
      joinUrl: `${options.baseUrl}/join/${room.code}`
    };
  }

  function requireRoom(code: string): Room {
    const room = rooms.get(code.toUpperCase());
    if (!room) throw new Error(`找不到房间：${code}`);
    return room;
  }

  function generateRoomCode(): string {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      let code = "";
      for (let i = 0; i < 4; i += 1) {
        code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
      }
      if (!rooms.has(code)) return code;
    }
    throw new Error("Unable to generate unique room code");
  }

  function uniqueNickname(room: Room, nickname: string): string {
    const clean = nickname.trim().slice(0, 24) || "玩家";
    const existing = new Set(Object.values(room.players).map((player) => player.nickname));
    if (!existing.has(clean)) return clean;
    for (let i = 2; i < 100; i += 1) {
      const candidate = `${clean} ${i}`;
      if (!existing.has(candidate)) return candidate;
    }
    return `${clean} ${nanoid(3)}`;
  }

  return {
    createRoom(): PublicRoom {
      const code = generateRoomCode();
      const room: Room = {
        code,
        phase: "lobby",
        createdAt: Date.now(),
        players: {},
        rounds: [],
        revealIndex: 0
      };
      rooms.set(code, room);
      return toPublicRoom(room);
    },

    getRoom(code: string): PublicRoom {
      return toPublicRoom(requireRoom(code));
    },

    listChallenges() {
      return CHALLENGES;
    },

    attachToRoom(code: string): PublicRoom {
      return toPublicRoom(requireRoom(code));
    },

    joinRoom(code: string, nickname: string): JoinResult {
      const room = requireRoom(code);
      const player: Player = {
        id: nanoid(10),
        nickname: uniqueNickname(room, nickname),
        connected: true,
        scoreTotal: 0,
        joinedAt: Date.now()
      };
      room.players[player.id] = player;
      return { room: toPublicRoom(room), player };
    },

    setPlayerConnected(code: string, playerId: string, connected: boolean): PublicRoom {
      const room = requireRoom(code);
      const player = room.players[playerId];
      if (player) player.connected = connected;
      return toPublicRoom(room);
    },

    startRound(code: string, challengeId: string): PublicRoom {
      const room = requireRoom(code);
      const challenge = getChallenge(challengeId);
      if (!challenge) throw new Error(`未知题目：${challengeId}`);
      const round = {
        id: nanoid(10),
        challengeId,
        submissions: {},
        judgments: {},
        status: "open" as const
      };
      room.rounds.push(round);
      room.phase = "submissions";
      room.activeChallengeId = challengeId;
      room.activeRoundId = round.id;
      room.revealIndex = 0;
      room.hostNotice = undefined;
      return toPublicRoom(room);
    },

    submitAnswer(code: string, playerId: string, answer: string): PublicRoom {
      const room = requireRoom(code);
      if (room.phase !== "submissions") throw new Error("Submissions are not open");
      const round = room.rounds.find((item) => item.id === room.activeRoundId);
      if (!round || round.status !== "open") throw new Error("当前没有开放提交的回合");
      const clean = answer.trim();
      if (!clean) throw new Error("答案不能为空");
      if (clean.length > 240) throw new Error("答案不能超过 240 个字符");
      if (!room.players[playerId]) throw new Error("找不到玩家");
      round.submissions[playerId] = { playerId, answer: clean, submittedAt: Date.now() };
      return toPublicRoom(room);
    },

    closeSubmissions(code: string): PublicRoom {
      const room = requireRoom(code);
      const round = room.rounds.find((item) => item.id === room.activeRoundId);
      if (!round) throw new Error("当前没有进行中的回合");
      round.status = "closed";
      room.phase = "judging";
      return toPublicRoom(room);
    },

    applyJudgments(code: string, result: JudgmentResult, hostNotice?: string): PublicRoom {
      const room = requireRoom(code);
      const round = room.rounds.find((item) => item.id === room.activeRoundId);
      if (!round) throw new Error("当前没有进行中的回合");
      round.status = "judged";
      round.roundSummary = result.roundSummary;
      round.championCallout = result.championCallout;
      round.judgments = {};
      for (const judgment of result.judgments) {
        round.judgments[judgment.playerId] = judgment;
        const player = room.players[judgment.playerId];
        if (player) player.scoreTotal += judgment.score;
      }
      room.phase = "reveal";
      room.revealIndex = Math.min(1, result.judgments.length);
      room.hostNotice = hostNotice;
      return toPublicRoom(room);
    },

    revealNext(code: string): PublicRoom {
      const room = requireRoom(code);
      const round = room.rounds.find((item) => item.id === room.activeRoundId);
      const count = round ? Object.keys(round.judgments).length : 0;
      room.revealIndex = Math.min(room.revealIndex + 1, count);
      return toPublicRoom(room);
    },

    showScoreboard(code: string): PublicRoom {
      const room = requireRoom(code);
      room.phase = "scoreboard";
      return toPublicRoom(room);
    }
  };
}
