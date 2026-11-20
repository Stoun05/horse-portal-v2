import type { NextRequest } from "next/server";

/**
 * Reject browser requests originating from a different site.
 * Browsers include Origin for same-origin fetch POST requests.
 * No Origin is allowed for non-browser clients; these still require
 * the signed session (for protected operations) or the admin code.
 */
export function isTrustedAdminRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return request.headers.get("sec-fetch-site") !== "cross-site";
  }
  try {
    const submitted = new URL(origin);
    return submitted.origin === request.nextUrl.origin &&
      request.headers.get("sec-fetch-site") !== "cross-site";
  } catch {
    return false;
  }
}
