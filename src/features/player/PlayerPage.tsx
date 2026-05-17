import { FormEvent, useEffect, useState } from "react";
import { getChallenge } from "../../../shared/challenges";
import { Button } from "../../components/Button";
import { Panel } from "../../components/Panel";
import { getPathRoomCode } from "../../lib/routes";
import { useRoomSocket } from "../shared/useRoomSocket";

export function PlayerPage() {
  const roomCode = getPathRoomCode(window.location.pathname);
  const playerId = window.sessionStorage.getItem("oraclePlayerId");
  const nickname = window.sessionStorage.getItem("oracleNickname");
  const { room, error, socket } = useRoomSocket(roomCode);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const challenge = room?.activeChallengeId ? getChallenge(room.activeChallengeId) : undefined;

  useEffect(() => {
    setAnswer("");
    setSubmitted(false);
  }, [room?.activeRoundId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!roomCode || !playerId) return;
    const result = await socket.emitWithAck("player:submitAnswer", { roomCode, playerId, answer });
    if (result?.ok) setSubmitted(true);
  }

  return (
    <main className="page-shell narrow-shell">
      <Panel>
        <p className="eyebrow">参赛者 {nickname ?? ""}</p>
        <h1>{challenge?.title ?? "等待神谕降临"}</h1>
        <p>{challenge?.setup ?? "主持人还没有开始审判题。"}</p>
        {challenge ? <p className="muted">{challenge.instruction}</p> : null}
        <form className="stack" onSubmit={submit}>
          <textarea
            aria-label="答案"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            maxLength={240}
            disabled={!challenge || submitted}
            placeholder="写下你的申辩、诡计或离谱妙答..."
          />
          <Button type="submit" disabled={!challenge || submitted}>
            {submitted ? "已提交" : "提交答案"}
          </Button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </Panel>
    </main>
  );
}
