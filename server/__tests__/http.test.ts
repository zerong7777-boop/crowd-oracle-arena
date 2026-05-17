// @vitest-environment node

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import { createHttpApp } from "../http.js";

describe("createHttpApp", () => {
  it("serves the health endpoint without crashing", async () => {
    const app = createHttpApp();
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = (server.address() as AddressInfo).port;

    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      const body = await response.json();

      expect(response.ok).toBe(true);
      expect(body).toEqual({ ok: true, name: "crowd-oracle-arena" });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
