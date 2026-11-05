import { timingSafeEqual } from "node:crypto";

// Temporary single-token API access for first LAN tests.
// A dedicated multi-user login/roles system must replace this before production.
export function isAuthorized(request) {
  const configured = process.env.API_TOKEN;
  if (!configured || configured.length < 32) return false;
  const provided = request.headers.authorization;
  if (!provided?.startsWith("Bearer ")) return false;
  const token = provided.slice(7);
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(configured, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
