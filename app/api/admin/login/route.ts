import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, configured, createAdminToken, verifyAdminCode } from "../../../../lib/adminAuth";
import { getAdminRecord, storageConfigured, verifyHash } from "../../../../lib/adminCredentialStore";
import { checkAdminLoginLimit } from "../../../../lib/adminLoginLimit";

import { isTrustedAdminRequest } from "../../../../lib/adminRequestSecurity";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!isTrustedAdminRequest(request)) return NextResponse.json({ error: "Gadagan edilen sorag." }, { status: 403 });
  if (!configured()) return NextResponse.json({ error: "Admin giriş kody entek sazlanmady." }, { status: 503 });
  let data: unknown;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "Nädogry maglumat." }, { status: 400 }); }
  if (!data || typeof data !== "object") return NextResponse.json({ error: "Nädogry maglumat." }, { status: 400 });
  const { code } = data as Record<string, unknown>;
  try {
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limiter = await checkAdminLoginLimit(ip);
    if (limiter.limited) return NextResponse.json({ error: "Giriş synanyşyklarynyň çägi doldy. Soňrak synanyşyň." }, { status: 429, headers: { "Retry-After": String(limiter.retryAfter), "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Giriş gorag hyzmaty elýeterli däl." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (typeof code !== "string" || code.length > 1024) return NextResponse.json({ error: "Admin kody nädogry." }, { status: 401 });
  try {
    const record = storageConfigured() ? await getAdminRecord() : null;
    const valid = record ? verifyHash(code, record) : verifyAdminCode(code);
    if (!valid) return NextResponse.json({ error: "Admin kody nädogry." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const { token, maxAge } = createAdminToken(record?.version ?? 0);
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge });
    return response;
  } catch {
    return NextResponse.json({ error: "Admin maglumat bazasy wagtlaýyn elýeterli däl." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
