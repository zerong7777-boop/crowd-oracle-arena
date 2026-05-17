import { useEffect, useState } from "react";
import type { PublicRoom } from "../../../shared/types";
import { ensureSocketConnected, socket } from "../../lib/socket";

export function useRoomSocket(roomCode?: string) {
  const [room, setRoom] = useState<PublicRoom | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const activeSocket = ensureSocketConnected();

    function onRoomUpdated(nextRoom: PublicRoom) {
      setRoom(nextRoom);
    }

    function onError(payload: { message: string }) {
      setError(payload.message);
    }

    activeSocket.on("room:updated", onRoomUpdated);
    activeSocket.on("error", onError);

    if (roomCode) {
      activeSocket
        .emitWithAck("room:attach", { roomCode })
        .then((attachedRoom: PublicRoom) => setRoom(attachedRoom))
        .catch(() => setError("Could not attach to that room."));
    }

    return () => {
      activeSocket.off("room:updated", onRoomUpdated);
      activeSocket.off("error", onError);
    };
  }, [roomCode]);

  return { room, setRoom, error, setError, socket: ensureSocketConnected() };
}
