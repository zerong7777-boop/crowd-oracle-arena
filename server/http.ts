import express from "express";
import path from "node:path";

export function createHttpApp() {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, name: "crowd-oracle-arena" });
  });

  const distPath = path.resolve(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  return app;
}
