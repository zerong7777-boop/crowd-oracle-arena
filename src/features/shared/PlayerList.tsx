import type { Player } from "../../../shared/types";

export function PlayerList({ players }: { players: Player[] }) {
  if (players.length === 0) return <p className="muted">还没有玩家入场。</p>;

  return (
    <div className="player-list">
      {players.map((player) => (
        <div className="player-row" key={player.id}>
          <span>{player.nickname}</span>
          <span className="muted">{player.connected ? "在线" : "离线"}</span>
        </div>
      ))}
    </div>
  );
}
