import http from "node:http";
import { Server } from "socket.io";
import { createHttpApp } from "./http.js";
import { createRoomStore } from "./roomStore.js";
import { bindSocketServer } from "./socket.js";

const port = Number(process.env.PORT || 3000);
const app = createHttpApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const baseUrl = process.env.PUBLIC_URL || `http://localhost:${port}`;
bindSocketServer(io, createRoomStore({ baseUrl }));

server.listen(port, () => {
  console.log(`Crowd Oracle Arena listening on ${baseUrl}`);
});
