import { createHash, randomBytes } from "node:crypto";
import { pool } from "./db.mjs";

const SESSION_SECONDS = 8 * 60 * 60;
export function digestToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
export function bearerToken(req) {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || "");
  return match?.[1] || null;
}
export async function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  await pool.query(
    "INSERT INTO portal_sessions (token_hash,user_id,expires_at) VALUES ($1,$2,now()+($3::integer * interval '1 second'))",
    [digestToken(token), userId, SESSION_SECONDS]
  );
  return { token, expiresIn: SESSION_SECONDS };
}
export async function getSessionUser(req) {
  const token = bearerToken(req);
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.role FROM portal_sessions s
     JOIN portal_users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND u.active = true`,
    [digestToken(token)]
  );
  return rows[0] || null;
}
export async function revokeSession(req) {
  const token = bearerToken(req);
  if (!token) return;
  await pool.query("DELETE FROM portal_sessions WHERE token_hash=$1", [digestToken(token)]);
}
