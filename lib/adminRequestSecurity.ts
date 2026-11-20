import type { NextRequest } from "next/server";

/**
 * Enforce same-origin on state-changing admin requests.
 * Reverse proxies (including Render) can expose a public Host while
 * request.nextUrl.origin points at the internal service origin.
 */
export function isTrustedAdminRequest(request: NextRequest): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser clients must still authenticate.

  try {
    const source = new URL(origin);
    if (source.protocol !== "https:" && source.hostname !== "localhost" && source.hostname !== "127.0.0.1") return false;
    const host = request.headers.get("host");
    if (!host) return source.origin === request.nextUrl.origin;
    const expected = new URL(`${source.protocol}//${host}`);
    return source.origin === expected.origin;
  } catch {
    return false;
  }
}
