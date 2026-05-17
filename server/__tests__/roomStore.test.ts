import { describe, expect, it } from "vitest";
import { createRoomStore } from "../roomStore.js";

describe("roomStore", () => {
  it("creates a lobby room with a short code", () => {
    const store = createRoomStore({ baseUrl: "http://localhost:3000" });
    const room = store.createRoom();

    expect(room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(room.phase).toBe("lobby");
    expect(room.joinUrl).toBe(`http://localhost:3000/join/${room.code}`);
  });

  it("joins players and auto-suffixes duplicate nicknames", () => {
    const store = createRoomStore({ baseUrl: "http://localhost:3000" });
    const room = store.createRoom();
    const first = store.joinRoom(room.code, "Nova");
    const second = store.joinRoom(room.code, "Nova");

    expect(first.player.nickname).toBe("Nova");
    expect(second.player.nickname).toBe("Nova 2");
    expect(Object.keys(second.room.players)).toHaveLength(2);
  });

  it("runs a complete round state transition", () => {
    const store = createRoomStore({ baseUrl: "http://localhost:3000" });
    const room = store.createRoom();
    const joined = store.joinRoom(room.code, "Ada");

    let updated = store.startRound(room.code, "save-the-village");
    expect(updated.phase).toBe("submissions");
    expect(updated.activeRoundId).toBeTruthy();

    updated = store.submitAnswer(room.code, joined.player.id, "Spare us and I will teach your statue to sing.");
    const round = updated.rounds[0];
    expect(round.submissions[joined.player.id].answer).toContain("Spare us");

    updated = store.closeSubmissions(room.code);
    expect(updated.rounds[0].status).toBe("closed");

    updated = store.applyJudgments(room.code, {
      roundSummary: "The Oracle enjoyed the musical threat.",
      championCallout: "Ada made stone tremble.",
      judgments: [
        {
          playerId: joined.player.id,
          score: 88,
          verdictTitle: "Statue Whisperer",
          commentary: "A strangely practical offer.",
          award: "Best Civic Bribe",
          riskFlag: "ok"
        }
      ]
    });
    expect(updated.phase).toBe("reveal");
    expect(updated.revealIndex).toBe(1);
    expect(updated.players[joined.player.id].scoreTotal).toBe(88);

    updated = store.revealNext(room.code);
    expect(updated.revealIndex).toBe(1);

    updated = store.showScoreboard(room.code);
    expect(updated.phase).toBe("scoreboard");
  });

  it("rejects empty or overlong submissions", () => {
    const store = createRoomStore({ baseUrl: "http://localhost:3000" });
    const room = store.createRoom();
    const { player } = store.joinRoom(room.code, "Ada");
    store.startRound(room.code, "save-the-village");

    expect(() => store.submitAnswer(room.code, player.id, "")).toThrow("答案不能为空");
    expect(() => store.submitAnswer(room.code, player.id, "x".repeat(241))).toThrow(
      "答案不能超过 240 个字符"
    );
  });
});
