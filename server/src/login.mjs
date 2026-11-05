import { pool } from "./db.mjs";
import { verifyPassword } from "./passwords.mjs";
import { createSession } from "./sessions.mjs";

export async function login(username, password) {
  if (typeof username !== "string" || typeof password !== "string" ||
      username.length < 1 || username.length > 100 || password.length > 1024) return null;
  const { rows } = await pool.query(
    "SELECT id, username, role, password_hash FROM portal_users WHERE username=$1 AND active=true LIMIT 1",
    [username]
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) return null;
  const session = await createSession(user.id);
  return { ...session, user: { id: user.id, username: user.username, role: user.role } };
}
