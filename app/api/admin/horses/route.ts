import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, readAdminSession } from "../../../../lib/adminAuth";
import { getAdminRecord, storageConfigured } from "../../../../lib/adminCredentialStore";
import { parseHorse, readHorses, replaceHorses } from "../../../../lib/horseStore";
import { isTrustedAdminRequest } from "../../../../lib/adminRequestSecurity";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!isTrustedAdminRequest(request)) return NextResponse.json({ error: "Gadagan edilen sorag." }, { status: 403 });
  const session = readAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Admin rugsady talap edilýär." }, { status: 401 });
  if (!storageConfigured()) return NextResponse.json({ error: "Maglumat bazasy birikdirilmedi." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Nädogry maglumat." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Nädogry maglumat." }, { status: 400 });
  const data = body as Record<string, unknown>;
  if (!Number.isSafeInteger(data.revision) || typeof data.revision !== "number" || data.revision < 0) return NextResponse.json({ error: "Katalog wersiýasy nädogry." }, { status: 400 });
  if (data.action !== "upsert" && data.action !== "delete") return NextResponse.json({ error: "Amal nädogry." }, { status: 400 });
  const horse = data.action === "upsert" ? parseHorse(data.horse) : null;
  if (data.action === "upsert" && !horse) return NextResponse.json({ error: "At maglumatlary nädogry." }, { status: 400 });
  const horseId = data.action === "delete" ? data.id : horse?.id;
  if (typeof horseId !== "string" || horseId.length < 1 || horseId.length > 300) return NextResponse.json({ error: "At ID nädogry." }, { status: 400 });

  try {
    const credentials = await getAdminRecord();
    if (session.version !== (credentials?.version ?? 0)) return NextResponse.json({ error: "Sessiya köneldi." }, { status: 401 });
    const current = await readHorses();
    if (current.revision !== data.revision) return NextResponse.json({ error: "Katalog başga ýerde üýtgedildi. Täzeläp synanyşyň." }, { status: 409 });
    const exists = current.horses.some(h => h.id === horseId);
    if (data.action === "delete" && !exists) return NextResponse.json({ error: "At tapylmady." }, { status: 404 });
    const horses = data.action === "delete" ? current.horses.filter(h => h.id !== horseId)
      : exists ? current.horses.map(h => h.id === horseId ? horse! : h) : [horse!, ...current.horses];
    const next = { revision: current.revision + 1, horses };
    if (!await replaceHorses(current, next)) return NextResponse.json({ error: "Katalog şol wagt üýtgedildi. Gaýtadan synanyşyň." }, { status: 409 });
    return NextResponse.json(next, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Maglumat bazasy bilen baglanyşyk başartmady." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
