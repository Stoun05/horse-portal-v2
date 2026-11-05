import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password) {
  if (typeof password !== "string" || password.length < 12 || Buffer.byteLength(password, "utf8") > 1024)
    throw new Error("Password must be 12–1024 bytes");
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, OPTIONS);
  return `scrypt-v1:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof password !== "string" || typeof encoded !== "string") return false;
  const parts = encoded.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt-v1" || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{128}$/.test(parts[2]))
    return false;
  if (Buffer.byteLength(password, "utf8") > 1024) return false;
  const expected = Buffer.from(parts[2], "hex");
  const actual = await scrypt(password, Buffer.from(parts[1], "hex"), KEY_LENGTH, OPTIONS);
  return timingSafeEqual(expected, actual);
}
