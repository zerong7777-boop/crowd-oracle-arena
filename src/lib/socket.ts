import { io } from "socket.io-client";

export const socket = io({
  autoConnect: false,
  transports: ["websocket", "polling"]
});

export function ensureSocketConnected() {
  if (!socket.connected) socket.connect();
  return socket;
}
