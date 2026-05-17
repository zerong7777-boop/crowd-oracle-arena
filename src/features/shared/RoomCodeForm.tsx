import { FormEvent, useEffect, useState } from "react";
import { Button } from "../../components/Button";

export function RoomCodeForm({
  presetRoomCode,
  onSubmit
}: {
  presetRoomCode?: string;
  onSubmit: (roomCode: string, nickname: string) => void;
}) {
  const [roomCode, setRoomCode] = useState(presetRoomCode ?? "");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (presetRoomCode) setRoomCode(presetRoomCode);
  }, [presetRoomCode]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(roomCode.trim().toUpperCase(), nickname.trim());
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label htmlFor="room-code">
        房间号
        <input id="room-code" value={roomCode} onChange={(event) => setRoomCode(event.target.value)} maxLength={4} />
      </label>
      <label htmlFor="nickname">
        昵称
        <input id="nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={24} />
      </label>
      <Button type="submit">进入竞技场</Button>
    </form>
  );
}
