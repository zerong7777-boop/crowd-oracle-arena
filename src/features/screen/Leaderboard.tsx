import type { Player } from "../../../shared/types";

export function Leaderboard({ players }: { players: Player[] }) {
  const ranked = [...players].sort((a, b) => b.scoreTotal - a.scoreTotal);
  return (
    <div className="leaderboard">
      {ranked.map((player, index) => (
        <div className="leaderboard-row" key={player.id}>
          <span>#{index + 1}</span>
          <strong>{player.nickname}</strong>
          <span>{player.scoreTotal} 分</span>
        </div>
      ))}
    </div>
  );
}
