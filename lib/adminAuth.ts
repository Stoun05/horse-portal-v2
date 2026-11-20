import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "atcylyk_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function configured() {
  return Boolean(process.env.ADMIN_ACCESS_CODE && process.env.ADMIN_ACCESS_CODE.length >= 16 && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

export function verifyAdminCode(code: string) {
  if (!configured()) return false;
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const expected = createHmac("sha256", secret).update(process.env.ADMIN_ACCESS_CODE!).digest();
  const actual = createHmac("sha256", secret).update(code).digest();
  return timingSafeEqual(expected, actual);
}

export function createAdminToken() {
  if (!configured()) throw new Error("Admin login not configured");
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp }), "utf8").toString("base64url");
  return { token: `${payload}.${sign(payload, process.env.ADMIN_SESSION_SECRET!)}`, maxAge: SESSION_SECONDS };
}

export function verifyAdminToken(token: string | undefined) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32 || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  try {
    const expected = Buffer.from(sign(parts[0], secret));
    const actual = Buffer.from(parts[1]);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
    const data: unknown = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (!data || typeof data !== "object") return false;
    const session = data as { role?: unknown; exp?: unknown };
    return session.role === "admin" && typeof session.exp === "number" && session.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
