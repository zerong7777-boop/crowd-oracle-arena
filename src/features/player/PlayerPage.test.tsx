import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicRoom } from "../../../shared/types";
import { PlayerPage } from "./PlayerPage";

const emitWithAck = vi.fn();
let currentRoom: PublicRoom;

vi.mock("../shared/useRoomSocket", () => ({
  useRoomSocket: () => ({
    room: currentRoom,
    error: undefined,
    socket: { emitWithAck }
  })
}));

function makeRoom(activeRoundId: string): PublicRoom {
  return {
    code: "ABCD",
    phase: "submissions",
    createdAt: 1,
    activeChallengeId: "save-the-village",
    activeRoundId,
    players: {
      p1: {
        id: "p1",
        nickname: "Ada",
        connected: true,
        scoreTotal: 0,
        joinedAt: 1
      }
    },
    rounds: [
      {
        id: activeRoundId,
        challengeId: "save-the-village",
        submissions: {},
        judgments: {},
        status: "open"
      }
    ],
    revealIndex: 0,
    joinUrl: "http://localhost/join/ABCD"
  };
}

beforeEach(() => {
  window.history.pushState({}, "", "/play/ABCD");
  window.sessionStorage.setItem("oraclePlayerId", "p1");
  window.sessionStorage.setItem("oracleNickname", "Ada");
  currentRoom = makeRoom("round-1");
  emitWithAck.mockResolvedValue({ ok: true });
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  emitWithAck.mockReset();
});

describe("PlayerPage", () => {
  it("re-enables answer entry when the host starts a new round", async () => {
    const { rerender } = render(<PlayerPage />);
    const answer = screen.getByRole("textbox");
    const submit = screen.getByRole("button");

    fireEvent.change(answer, { target: { value: "Spare the village." } });
    fireEvent.click(submit);

    expect(await screen.findByRole("button", { name: "已提交" })).toBeDisabled();
    expect(answer).toBeDisabled();

    currentRoom = makeRoom("round-2");
    rerender(<PlayerPage />);

    expect(screen.getByRole("textbox")).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "提交答案" })).not.toBeDisabled();
  });
});
