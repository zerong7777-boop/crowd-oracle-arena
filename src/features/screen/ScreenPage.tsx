import { useMemo } from "react";
import { getChallenge } from "../../../shared/challenges";
import { Panel } from "../../components/Panel";
import { getPathRoomCode } from "../../lib/routes";
import { PlayerList } from "../shared/PlayerList";
import { useRoomSocket } from "../shared/useRoomSocket";
import { Leaderboard } from "./Leaderboard";
import { OracleCard } from "./OracleCard";

export function ScreenPage() {
  const roomCode = getPathRoomCode(window.location.pathname);
  const { room } = useRoomSocket(roomCode);
  const players = useMemo(() => Object.values(room?.players ?? {}), [room]);
  const round = room?.rounds.find((item) => item.id === room.activeRoundId);
  const challenge = room?.activeChallengeId ? getChallenge(room.activeChallengeId) : undefined;
  const revealedJudgments = round ? Object.values(round.judgments).slice(0, room?.revealIndex ?? 0) : [];

  return (
    <main className="page-shell screen-shell">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Crowd Oracle Arena</p>
          <h1>{challenge?.title ?? "等待开庭"}</h1>
        </div>
        <div className="room-code">{room?.code ?? roomCode}</div>
      </header>

      {!room ? (
        <Panel>
          <h2>正在等待房间同步...</h2>
        </Panel>
      ) : null}

      {room?.phase === "lobby" ? (
        <Panel className="center-panel">
          <h2>打开链接加入：{room.joinUrl}</h2>
          <PlayerList players={players} />
        </Panel>
      ) : null}

      {room && ["submissions", "judging"].includes(room.phase) ? (
        <Panel className="center-panel">
          <h2>{challenge?.setup}</h2>
          <p className="muted">{challenge?.instruction}</p>
          <p>
            已提交 {Object.keys(round?.submissions ?? {}).length} / {players.length} 份答案
          </p>
        </Panel>
      ) : null}

      {room?.phase === "reveal" ? (
        <section className="reveal-grid">
          {revealedJudgments.map((judgment) => {
            const submission = round?.submissions[judgment.playerId];
            const player = room.players[judgment.playerId];
            return submission && player ? (
              <OracleCard
                key={judgment.playerId}
                nickname={player.nickname}
                submission={submission}
                judgment={judgment}
              />
            ) : null;
          })}
        </section>
      ) : null}

      {room?.phase === "scoreboard" ? (
        <Panel className="center-panel">
          <h2>神谕排行榜</h2>
          <Leaderboard players={players} />
        </Panel>
      ) : null}
    </main>
  );
}
