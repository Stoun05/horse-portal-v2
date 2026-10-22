import { randomUUID, randomBytes, createHash } from "node:crypto";
import { pool } from "./db.mjs";
import { hashPassword } from "./passwords.mjs";
import { ROLES, can } from "./permissions.mjs";

export function validateUsername(value) {
  return typeof value === "string" && /^[a-zA-Z0-9._-]{3,64}$/.test(value);
}
export function validateRole(value) { return ROLES.includes(value); }
export function mayManageUsers(actor) { return Boolean(actor && can(actor.role, "users:manage")); }

export async function listUsers(actor) {
  if (!mayManageUsers(actor)) return null;
  const { rows } = await pool.query("SELECT id,username,role,active,created_at FROM portal_users ORDER BY username");
  return rows;
}
export async function addUser(actor, { username, role } = {}) {
  if (!mayManageUsers(actor)) return { status: 403 };
  if (!validateUsername(username) || !validateRole(role)) return { status: 400 };
  // No password is chosen by the administrator. Employee sets their own via one-use token.
  const id = randomUUID();
  const randomPlaceholder = await hashPassword(randomBytes(32).toString("hex"));
  try {
    await pool.query("INSERT INTO portal_users(id,username,password_hash,role,active) VALUES($1,$2,$3,$4,false)",
      [id, username, randomPlaceholder, role]);
    return { status: 201, id, username, role, active: false };
  } catch (error) {
    if (error.code === "23505") return { status: 409 };
    throw error;
  }
}
export function hashSetupToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
