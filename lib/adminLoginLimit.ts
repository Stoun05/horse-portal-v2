import { createHash } from "node:crypto";
import { storageConfigured } from "./adminCredentialStore";

type LimitResult = { limited: boolean; retryAfter: number };
const WINDOW_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 8;

/** Distributed per-IP login limiter. Returns blocked if Redis is unavailable after configuration. */
export async function checkAdminLoginLimit(ip: string): Promise<LimitResult> {
  if (!storageConfigured()) return { limited: false, retryAfter: 0 };
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const digest = createHash("sha256").update(ip || "unknown").digest("hex").slice(0, 32);
  const key = `atcylyk:admin:login-limit:${digest}`;
  const script = [
    "local n=redis.call('INCR',KEYS[1])",
    "if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end",
    "local ttl=redis.call('TTL',KEYS[1])",
    "return {n,ttl}",
  ].join("; ");
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["EVAL", script, "1", key, WINDOW_SECONDS]),
    cache: "no-store",
    signal: AbortSignal.timeout(4500),
  });
  if (!response.ok) throw new Error("Login limiter unavailable");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object") throw new Error("Login limiter response invalid");
  const parsed = body as { result?: unknown; error?: unknown };
  if (parsed.error || !Array.isArray(parsed.result) || parsed.result.length !== 2) throw new Error("Login limiter response invalid");
  const [attempts, seconds] = parsed.result;
  if (typeof attempts !== "number" || typeof seconds !== "number") throw new Error("Login limiter response invalid");
  return { limited: attempts > MAX_ATTEMPTS, retryAfter: Math.max(1, seconds) };
}
