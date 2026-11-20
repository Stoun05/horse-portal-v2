import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "../../../../lib/adminAuth";

import { isTrustedAdminRequest } from "../../../../lib/adminRequestSecurity";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!isTrustedAdminRequest(request)) return NextResponse.json({ error: "Gadagan edilen sorag." }, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
