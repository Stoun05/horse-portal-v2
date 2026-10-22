import { randomBytes, createHash } from "node:crypto";
import { pool } from "./db.mjs";
import { hashPassword } from "./passwords.mjs";
import { mayManageUsers } from "./user-management.mjs";

const TOKEN_TTL_MINUTES = 15;
export const tokenDigest = (token) => createHash("sha256").update(token).digest("hex");
export function validSetupToken(token) {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}
export function validNewPassword(password) {
  return typeof password === "string" && password.length >= 12 &&
    Buffer.byteLength(password, "utf8") <= 1024;
}

// An administrator can authorize password setup, but never chooses or sees the password.
// Treat the returned one-use token as sensitive: hand it directly to the employee.
export async function issuePasswordSetup(actor, userId) {
  if (!mayManageUsers(actor)) return { status: 403 };
  if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) return { status: 400 };
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query("SELECT id FROM portal_users WHERE id=$1 FOR UPDATE", [userId]);
    if (found.rowCount !== 1) { await client.query("ROLLBACK"); return { status: 404 }; }
    await client.query("DELETE FROM password_setup_tokens WHERE user_id=$1", [userId]);
    const token = randomBytes(32).toString("hex");
    await client.query(
      "INSERT INTO password_setup_tokens(token_hash,user_id,expires_at) VALUES($1,$2,now()+($3::integer * interval '1 minute'))",
      [tokenDigest(token), userId, TOKEN_TTL_MINUTES]
    );
    await client.query("COMMIT");
    return { status: 201, token, expiresInMinutes: TOKEN_TTL_MINUTES };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export async function redeemPasswordSetup(token, newPassword) {
  if (!validSetupToken(token) || !validNewPassword(newPassword)) return { status: 400 };
  // Hash before acquiring a DB transaction to minimize lock time.
  const passwordHash = await hashPassword(newPassword);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query(
      "SELECT user_id FROM password_setup_tokens WHERE token_hash=$1 AND expires_at>now() FOR UPDATE",
      [tokenDigest(token)]
    );
    if (found.rowCount !== 1) { await client.query("ROLLBACK"); return { status: 400 }; }
    const userId = found.rows[0].user_id;
    await client.query("UPDATE portal_users SET password_hash=$1, active=true WHERE id=$2", [passwordHash, userId]);
    await client.query("DELETE FROM password_setup_tokens WHERE user_id=$1", [userId]);
    await client.query("DELETE FROM portal_sessions WHERE user_id=$1", [userId]);
    await client.query("COMMIT");
    return { status: 200, success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}
