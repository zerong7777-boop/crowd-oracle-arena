import type { Server, Socket } from "socket.io";
import { getChallenge } from "../shared/challenges.js";
import type { PublicRoom } from "../shared/types.js";
import { judgeWithFallback } from "./judges/fallbackJudge.js";
import { judgeWithOpenAI } from "./judges/openaiJudge.js";
import type { createRoomStore } from "./roomStore.js";

type RoomStore = ReturnType<typeof createRoomStore>;

function emitRoom(io: Server, room: PublicRoom) {
  io.to(room.code).emit("room:updated", room);
}

function emitError(socket: Socket, message: string) {
  socket.emit("error", { message });
}

export function bindSocketServer(io: Server, store: RoomStore) {
  io.on("connection", (socket) => {
    socket.on("host:createRoom", async (...args: unknown[]) => {
      const ack = args.find((arg): arg is (room: PublicRoom) => void => typeof arg === "function");
      try {
        const room = store.createRoom();
        await socket.join(room.code);
        ack?.(room);
        emitRoom(io, room);
      } catch (error) {
        emitError(socket, error instanceof Error ? error.message : "创建房间失败");
      }
    });

    socket.on("room:attach", async (payload, ack) => {
      try {
        const roomCode = String(payload?.roomCode ?? "").toUpperCase();
        const room = store.attachToRoom(roomCode);
        await socket.join(room.code);
        socket.data.roomCode = room.code;
        ack?.(room);
        emitRoom(io, room);
      } catch (error) {
        emitError(socket, error instanceof Error ? error.message : "同步房间失败");
      }
    });

    socket.on("player:join", async (payload, ack) => {
      try {
        const roomCode = String(payload?.roomCode ?? "").toUpperCase();
        const nickname = String(payload?.nickname ?? "");
        const result = store.joinRoom(roomCode, nickname);
        socket.data.roomCode = roomCode;
        socket.data.playerId = result.player.id;
        await socket.join(roomCode);
        ack?.(result);
        emitRoom(io, result.room);
      } catch (error) {
        emitError(socket, error instanceof Error ? error.message : "加入房间失败");
      }
    });

    socket.on("host:startRound", (payload) => {
      try {
        const room = store.startRound(String(payload.roomCode), String(payload.challengeId));
        emitRoom(io, room);
      } catch (error) {
        emitError(socket, error instanceof Error ? error.message : "开始回合失败");
      }
    });

    socket.on("player:submitAnswer", (payload, ack) => {
      try {
        const room = store.submitAnswer(String(payload.roomCode), String(payload.playerId), String(payload.answer));
        ack?.({ ok: true });
        emitRoom(io, room);
      } catch (error) {
        const message = error instanceof Error ? error.message : "提交答案失败";
        ack?.({ ok: false, message });
        emitError(socket, message);
      }
    });

    socket.on("host:closeSubmissions", (payload) => {
      try {
        const room = store.closeSubmissions(String(payload.roomCode));
        emitRoom(io, room);
      } catch (error) {
        emitError(socket, error instanceof Error ? error.message : "停止提交失败");
      }
    });

    socket.on("host:judgeRound", async (payload) => {
      const roomCode = String(payload.roomCode);
      try {
        let room = store.getRoom(roomCode);
        io.to(room.code).emit("judging:started");
        const round = room.rounds.find((item) => item.id === room.activeRoundId);
        const challenge = room.activeChallengeId ? getChallenge(room.activeChallengeId) : undefined;
        if (!round || !challenge) throw new Error("当前没有可裁决的回合");

        const input = {
          challenge,
          players: Object.values(room.players).map((player) => ({ id: player.id, nickname: player.nickname })),
          submissions: Object.values(round.submissions)
        };

        let hostNotice: string | undefined;
        let result;
        try {
          result = await judgeWithOpenAI(input);
        } catch {
          result = judgeWithFallback(input);
          hostNotice = "OpenAI 裁决失败，已使用本地备用神谕。";
        }

        room = store.applyJudgments(roomCode, result, hostNotice);
        io.to(room.code).emit("judging:completed", room);
        emitRoom(io, room);
      } catch (error) {
        emitError(socket, error instanceof Error ? error.message : "神谕裁决失败");
      }
    });

    socket.on("host:revealNext", (payload) => {
      try {
        const room = store.revealNext(String(payload.roomCode));
        io.to(room.code).emit("reveal:advanced", room);
        emitRoom(io, room);
      } catch (error) {
        emitError(socket, error instanceof Error ? error.message : "揭晓下一条裁决失败");
      }
    });

    socket.on("host:showScoreboard", (payload) => {
      try {
        const room = store.showScoreboard(String(payload.roomCode));
        io.to(room.code).emit("scoreboard:updated", room);
        emitRoom(io, room);
      } catch (error) {
        emitError(socket, error instanceof Error ? error.message : "显示排行榜失败");
      }
    });

    socket.on("disconnect", () => {
      const roomCode = socket.data.roomCode;
      const playerId = socket.data.playerId;
      if (roomCode && playerId) {
        try {
          const room = store.setPlayerConnected(roomCode, playerId, false);
          emitRoom(io, room);
        } catch {
          // Ignore stale disconnects.
        }
      }
    });
  });
}
