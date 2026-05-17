// @vitest-environment node

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server } from "socket.io";
import { io as Client, type Socket as ClientSocket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRoomStore } from "../roomStore.js";
import { bindSocketServer } from "../socket.js";

describe("socket flow", () => {
  let io: Server;
  let url: string;
  const clients: ClientSocket[] = [];

  beforeEach(async () => {
    const httpServer = createServer();
    io = new Server(httpServer, { cors: { origin: "*" } });
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));
    const port = (httpServer.address() as AddressInfo).port;
    url = `http://localhost:${port}`;
    bindSocketServer(io, createRoomStore({ baseUrl: url }));
  });

  afterEach(async () => {
    for (const client of clients) client.close();
    clients.length = 0;
    await io.close();
  });

  async function connectClient() {
    const client = Client(url, { forceNew: true });
    clients.push(client);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Socket client did not connect to ${url}`)), 1200);
      client.on("connect", () => {
        clearTimeout(timer);
        resolve();
      });
      client.on("connect_error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
    return client;
  }

  it("creates a room and lets a player join", async () => {
    const host = await connectClient();
    const room = await host.emitWithAck("host:createRoom");
    expect(room.code).toMatch(/^[A-Z0-9]{4}$/);

    const player = await connectClient();
    const joined = await player.emitWithAck("player:join", { roomCode: room.code, nickname: "Ada" });
    expect(joined.player.nickname).toBe("Ada");
    expect(joined.room.players[joined.player.id].nickname).toBe("Ada");
  });

  it("acknowledges failed player joins", async () => {
    const player = await connectClient();
    const result = await player.timeout(200).emitWithAck("player:join", {
      roomCode: "ZZZZ",
      nickname: "Ada"
    });

    expect(result).toMatchObject({ ok: false, message: expect.stringContaining("找不到房间") });
  });

  it("lets screen clients attach to an existing room", async () => {
    const host = await connectClient();
    const room = await host.emitWithAck("host:createRoom");

    const screen = await connectClient();
    const attached = await screen.emitWithAck("room:attach", { roomCode: room.code });

    expect(attached.code).toBe(room.code);
    expect(attached.phase).toBe("lobby");
  });
});
