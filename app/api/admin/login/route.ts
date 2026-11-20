import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, configured, createAdminToken, verifyAdminCode } from "../../../../lib/adminAuth";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!configured()) return NextResponse.json({ error: "Admin giriş sazlamalary entek goýulmady." }, { status: 503 });
  let data: unknown;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "Nädogry maglumat." }, { status: 400 }); }
  if (!data || typeof data !== "object") return NextResponse.json({ error: "Nädogry maglumat." }, { status: 400 });
  const { code } = data as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || email.length > 320 || password.length > 1024 || !verifyAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Admin kody nädogry." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const { token, maxAge } = createAdminToken();
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge });
  return response;
}
