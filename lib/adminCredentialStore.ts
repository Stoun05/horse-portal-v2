import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY = "atcylyk:admin:credentials:v1";
export type AdminRecord = { hash: string; salt: string; version: number };

export function storageConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
async function command(args: (string | number)[]): Promise<unknown> {
  if (!storageConfigured()) throw new Error("Admin credential database is not configured");
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN!}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
    signal: AbortSignal.timeout(4500),
  });
  if (!res.ok) throw new Error("Admin credential database unavailable");
  const data = await res.json() as { result?: unknown; error?: string };
  if (data.error) throw new Error("Admin credential database rejected request");
  return data.result;
}
export async function getAdminRecord(): Promise<AdminRecord | null> {
  const raw = await command(["GET", KEY]);
  if (raw === null) return null;
  if (typeof raw !== "string") throw new Error("Invalid credential record");
  const obj: unknown = JSON.parse(raw);
  if (!obj || typeof obj !== "object") throw new Error("Invalid credential record");
  const item = obj as Partial<AdminRecord>;
  if (typeof item.hash !== "string" || !/^[a-f0-9]{128}$/.test(item.hash) || typeof item.salt !== "string" || !/^[a-f0-9]{32}$/.test(item.salt) || typeof item.version !== "number" || !Number.isSafeInteger(item.version) || item.version < 0) throw new Error("Invalid credential record");
  return item as AdminRecord;
}
function derive(code: string, salt: string) {
  return scryptSync(code, Buffer.from(salt, "hex"), 64).toString("hex");
}
export function verifyHash(code: string, record: AdminRecord) {
  const actual = Buffer.from(derive(code, record.salt), "hex");
  const expected = Buffer.from(record.hash, "hex");
  return timingSafeEqual(actual, expected);
}
export function makeRecord(code: string, version: number): AdminRecord {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: derive(code, salt), version };
}
// Atomic compare-and-swap prevents two code changes from overwriting one another.
export async function replaceAdminRecord(previous: AdminRecord | null, next: AdminRecord): Promise<boolean> {
  const expected = previous ? JSON.stringify(previous) : "";
  const script = 'local cur=redis.call("GET",KEYS[1]); if (cur or "") ~= ARGV[1] then return 0 end; redis.call("SET",KEYS[1],ARGV[2]); return 1';
  return (await command(["EVAL", script, "1", KEY, expected, JSON.stringify(next)])) === 1;
}
