import { useState } from "react";
import { Panel } from "../../components/Panel";
import { getPathRoomCode } from "../../lib/routes";
import { ensureSocketConnected } from "../../lib/socket";
import { RoomCodeForm } from "../shared/RoomCodeForm";

export function JoinPage() {
  const [error, setError] = useState<string>();
  const presetRoomCode = getPathRoomCode(window.location.pathname);

  async function join(roomCode: string, nickname: string) {
    try {
      const socket = ensureSocketConnected();
      const result = await socket.emitWithAck("player:join", {
        roomCode: roomCode || presetRoomCode,
        nickname
      });
      if (result?.player && result?.room) {
        window.sessionStorage.setItem("oraclePlayerId", result.player.id);
        window.sessionStorage.setItem("oracleNickname", result.player.nickname);
        window.location.href = `/play/${result.room.code}`;
        return;
      }
      setError("无法加入这个房间。");
    } catch {
      setError("无法加入这个房间。");
    }
  }

  return (
    <main className="page-shell narrow-shell">
      <Panel>
        <p className="eyebrow">加入审判</p>
        <h1>进入竞技场</h1>
        <RoomCodeForm presetRoomCode={presetRoomCode} onSubmit={join} />
        {presetRoomCode ? <p className="muted">已填入房间号：{presetRoomCode}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </Panel>
    </main>
  );
}
