import { useMemo, useState } from "react";
import { CHALLENGES } from "../../../shared/challenges";
import { Button } from "../../components/Button";
import { Panel } from "../../components/Panel";
import { PlayerList } from "../shared/PlayerList";
import { PlayGuide } from "../shared/PlayGuide";
import { useRoomSocket } from "../shared/useRoomSocket";

export function HostPage() {
  const { room, setRoom, error, socket } = useRoomSocket();
  const [challengeId, setChallengeId] = useState(CHALLENGES[0].id);
  const players = useMemo(() => Object.values(room?.players ?? {}), [room]);
  const screenUrl = room ? `/screen/${room.code}` : "";

  async function createRoom() {
    const created = await socket.emitWithAck("host:createRoom", {});
    setRoom(created);
  }

  return (
    <main className="page-shell host-grid">
      <Panel>
        <p className="eyebrow">主持台</p>
        <h1>众声神谕竞技场</h1>
        {!room ? (
          <Button onClick={createRoom}>创建房间</Button>
        ) : (
          <div className="stack">
            <h2>房间 {room.code}</h2>
            <p className="muted">加入链接：{room.joinUrl}</p>
            <a className="secondary-link" href={screenUrl} target="_blank" rel="noreferrer">
              打开大屏页
            </a>
            {room.hostNotice ? <p className="error">{room.hostNotice}</p> : null}
          </div>
        )}
        {error ? <p className="error">{error}</p> : null}
      </Panel>

      {room ? (
        <>
          <Panel>
            <h2>审判控制</h2>
            <label htmlFor="challenge">
              题目
              <select id="challenge" value={challengeId} onChange={(event) => setChallengeId(event.target.value)}>
                {CHALLENGES.map((challenge) => (
                  <option value={challenge.id} key={challenge.id}>
                    {challenge.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="action-row">
              <Button onClick={() => socket.emit("host:startRound", { roomCode: room.code, challengeId })}>
                开始本轮
              </Button>
              <Button variant="secondary" onClick={() => socket.emit("host:closeSubmissions", { roomCode: room.code })}>
                停止提交
              </Button>
              <Button onClick={() => socket.emit("host:judgeRound", { roomCode: room.code })}>神谕裁决</Button>
              <Button variant="secondary" onClick={() => socket.emit("host:revealNext", { roomCode: room.code })}>
                揭晓下一个
              </Button>
              <Button variant="secondary" onClick={() => socket.emit("host:showScoreboard", { roomCode: room.code })}>
                显示排行榜
              </Button>
            </div>
          </Panel>
          <Panel>
            <h2>玩家</h2>
            <PlayerList players={players} />
          </Panel>
          <Panel>
            <PlayGuide compact />
          </Panel>
        </>
      ) : null}
    </main>
  );
}
