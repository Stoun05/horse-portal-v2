import type { Horse } from "./horses";
import { initialHorses } from "./horses";
import { storageConfigured } from "./adminCredentialStore";

const KEY = "atcylyk:catalog:horses:v1";
export type HorseCollection = { revision: number; horses: Horse[] };

async function redis(args: (string | number)[]): Promise<unknown> {
  if (!storageConfigured()) throw new Error("Horse database is not configured");
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN!}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Horse database unavailable");
  const data = await response.json() as { result?: unknown; error?: string };
  if (data.error) throw new Error("Horse database error");
  return data.result;
}

export async function readHorses(): Promise<HorseCollection> {
  const raw = await redis(["GET", KEY]);
  if (raw === null) return { revision: 0, horses: initialHorses };
  if (typeof raw !== "string") throw new Error("Invalid horse data");
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid horse data");
  const document = parsed as Partial<HorseCollection>;
  if (!Number.isSafeInteger(document.revision) || typeof document.revision !== "number" || document.revision < 1 || !Array.isArray(document.horses) || document.horses.length > 10000) {
    throw new Error("Invalid horse data");
  }
  return { revision: document.revision, horses: document.horses };
}

export function parseHorse(raw: unknown): Horse | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const h = raw as Record<string, unknown>;
  const required = ["id", "name", "breed", "sex", "color", "code"];
  if (required.some(k => typeof h[k] !== "string" || (h[k] as string).trim().length === 0 || (h[k] as string).length > 300)) return null;
  if (typeof h.year !== "number" || !Number.isSafeInteger(h.year) || h.year < 1800 || h.year > 2200 || typeof h.champion !== "boolean") return null;
  const optionals = ["image", "lineage", "father", "mother", "bodyMeasurements", "breedingValue", "horseClass", "description"];
  if (optionals.some(k => h[k] !== undefined && (typeof h[k] !== "string" || (h[k] as string).length > 5000))) return null;
  if (h.sourceSide !== undefined && h.sourceSide !== "Gündogar" && h.sourceSide !== "Günbatar") return null;
  if (h.sourceNumber !== undefined && (typeof h.sourceNumber !== "number" || !Number.isInteger(h.sourceNumber) || h.sourceNumber < 1 || h.sourceNumber > 10000)) return null;
  return Object.fromEntries([...required, "year", "champion", ...optionals, "sourceSide", "sourceNumber"].filter(k => h[k] !== undefined).map(k => [k, h[k]])) as Horse;
}

/** Atomic replace, ensuring parallel editors cannot silently overwrite one another. */
export async function replaceHorses(previous: HorseCollection, next: HorseCollection): Promise<boolean> {
  const nextJson = JSON.stringify(next);
  if (nextJson.length > 2_000_000) throw new Error("Catalog is too large");
  const script = [
    "local cur=redis.call('GET',KEYS[1])",
    "local rev=0",
    "if cur then rev=cjson.decode(cur).revision end",
    "if tonumber(rev)~=tonumber(ARGV[1]) then return 0 end",
    "redis.call('SET',KEYS[1],ARGV[2])",
    "return 1",
  ].join("; ");
  return await redis(["EVAL", script, "1", KEY, previous.revision, nextJson]) === 1;
}
