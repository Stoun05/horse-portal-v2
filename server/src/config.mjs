import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Tiny .env loader, for local deployment without additional dependencies.
try {
  const data = readFileSync(resolve(import.meta.dirname, "..", ".env"), "utf8");
  for (const line of data.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(trimmed);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
export const host = process.env.HOST || "127.0.0.1";
export const port = Number(process.env.PORT || 4100);
export const databaseUrl = process.env.DATABASE_URL;
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
