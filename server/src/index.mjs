import http from "node:http";
import { pool } from "./db.mjs";
import { isAuthorized } from "./auth.mjs";
import { listHorses } from "./horses.mjs";
import { host, port } from "./config.mjs";

// Initial deployment exposes health checks only. No horse or user records are public.
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.writeHead(405, { Allow: "GET" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  if (pathname === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", service: "atcylyk-local-server" }));
    return;
  }
  if (pathname === "/ready") {
    try {
      await pool.query("SELECT 1");
      res.writeHead(200);
      res.end(JSON.stringify({ status: "ready" }));
    } catch {
      res.writeHead(503);
      res.end(JSON.stringify({ status: "unavailable" }));
    }
    return;
  }
  if (pathname === "/api/horses") {
    if (!isAuthorized(req)) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    try {
      const result = await listHorses(new URL(req.url || "/", "http://localhost"));
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch {
      res.writeHead(503);
      res.end(JSON.stringify({ error: "Database unavailable" }));
    }
    return;
  }
  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});
server.listen(port, host, () => console.log(`Atçylyk local server listening on http://${host}:${port}`));
const shutdown = () => server.close(() => pool.end().then(() => process.exit(0)));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
