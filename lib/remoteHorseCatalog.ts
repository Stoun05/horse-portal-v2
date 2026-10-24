/* Optional, read-only server catalog adapter.
 * Never writes to localStorage or replaces an existing horse collection.
 * Call only after login, with a token kept in memory by the caller.
 */
import type { Horse } from "./horses";

export type RemoteHorseResult =
  | { ok: true; horses: Horse[] }
  | { ok: false; reason: "unauthorized" | "forbidden" | "unavailable" | "invalid-data" };

export async function fetchRemoteHorseCatalog(
  serverBaseUrl: string,
  token: string,
  signal?: AbortSignal,
): Promise<RemoteHorseResult> {
  if (!/^https?:\/\//.test(serverBaseUrl) || !/^[a-f0-9]{64}$/.test(token)) {
    return { ok: false, reason: "invalid-data" };
  }
  try {
    const url = new URL("/api/horses?limit=100", serverBaseUrl);
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal,
    });
    if (response.status === 401) return { ok: false, reason: "unauthorized" };
    if (response.status === 403) return { ok: false, reason: "forbidden" };
    if (!response.ok) return { ok: false, reason: "unavailable" };
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("horses" in body) || !Array.isArray(body.horses)) {
      return { ok: false, reason: "invalid-data" };
    }
    const horses: Horse[] = [];
    for (const record of body.horses) {
      if (!record || typeof record !== "object" || typeof record.id !== "string" ||
          !record.data || typeof record.data !== "object" || Array.isArray(record.data) ||
          typeof record.data.name !== "string") {
        return { ok: false, reason: "invalid-data" };
      }
      horses.push({ ...record.data, id: record.id } as Horse);
    }
    return { ok: true, horses };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
