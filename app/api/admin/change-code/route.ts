import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, configured, readAdminSession, verifyAdminCode } from "../../../../lib/adminAuth";
import { getAdminRecord, makeRecord, replaceAdminRecord, storageConfigured, verifyHash } from "../../../../lib/adminCredentialStore";

import { isTrustedAdminRequest } from "../../../../lib/adminRequestSecurity";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!isTrustedAdminRequest(request)) return NextResponse.json({ error: "Gadagan edilen sorag." }, { status: 403 });
  const session = readAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Admin giriş talap edilýär." }, { status: 401 });
  if (!storageConfigured()) return NextResponse.json({ error: "Kod çalyşmak üçin hemişelik Redis maglumat bazasyny birikdiriň." }, { status: 503 });
  if (!configured()) return NextResponse.json({ error: "Admin serwer sazlamalary ýok." }, { status: 503 });
  let data: unknown;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "Nädogry maglumat." }, { status: 400 }); }
  if (!data || typeof data !== "object") return NextResponse.json({ error: "Nädogry maglumat." }, { status: 400 });
  const { currentCode, newCode } = data as Record<string, unknown>;
  if (typeof currentCode !== "string" || typeof newCode !== "string" || newCode.length < 16 || newCode.length > 256 || currentCode.length > 1024 || currentCode === newCode) {
    return NextResponse.json({ error: "Täze kod tapawutly we azyndan 16 simwol bolmaly." }, { status: 400 });
  }
  try {
    const previous = await getAdminRecord();
    if (session.version !== (previous?.version ?? 0)) return NextResponse.json({ error: "Sessiya köneldi. Täzeden giriň." }, { status: 401 });
    const accepted = previous ? verifyHash(currentCode, previous) : verifyAdminCode(currentCode);
    if (!accepted) return NextResponse.json({ error: "Häzirki admin kody nädogry." }, { status: 401 });
    const next = makeRecord(newCode, (previous?.version ?? 0) + 1);
    if (!await replaceAdminRecord(previous, next)) return NextResponse.json({ error: "Maglumat üýtgedi. Täzeden synanyşyň." }, { status: 409 });
    const response = NextResponse.json({ ok: true, message: "Kod täzelendi. Täzeden giriň." }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ error: "Maglumat bazasy bilen baglanyşyk başartmady; kod üýtgedilmedi ýa-da netijesi tassyklanmady." }, { status: 503 });
  }
}
