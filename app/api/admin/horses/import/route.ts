import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, readAdminSession } from "../../../../../lib/adminAuth";
import { getAdminRecord, storageConfigured } from "../../../../../lib/adminCredentialStore";
import { parseHorse, readHorses, replaceHorses } from "../../../../../lib/horseStore";
import { isTrustedAdminRequest } from "../../../../../lib/adminRequestSecurity";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isTrustedAdminRequest(request)) return NextResponse.json({ error: "Gadagan edilen sorag." }, { status: 403 });
  const session = readAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Admin rugsady talap edilýär." }, { status: 401 });
  if (!storageConfigured()) return NextResponse.json({ error: "Merkezi baza birikdirilmedik." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Faýl maglumatlary nädogry." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Nädogry format." }, { status: 400 });
  const payload = body as Record<string, unknown>;
  if (typeof payload.revision !== "number" || !Number.isSafeInteger(payload.revision) || payload.revision < 0 || !Array.isArray(payload.horses) || payload.horses.length > 1000) {
    return NextResponse.json({ error: "Import maglumatlary nädogry." }, { status: 400 });
  }
  const parsed = payload.horses.map(parseHorse);
  if (parsed.some(h => h === null)) return NextResponse.json({ error: "Bir ýa-da birnäçe at ýazgysy nädogry. Import ýatyryldy." }, { status: 400 });
  const incoming = parsed.filter((h): h is NonNullable<typeof h> => h !== null);
  const ids = incoming.map(h => h.id);
  const codes = incoming.map(h => h.code.trim().toLocaleLowerCase("tk"));
  if (new Set(ids).size !== ids.length || new Set(codes).size !== codes.length) {
    return NextResponse.json({ error: "Faýlda gaýtalanýan ID ýa-da pasport kody bar." }, { status: 400 });
  }
  try {
    const credentials = await getAdminRecord();
    if (session.version !== (credentials?.version ?? 0)) return NextResponse.json({ error: "Admin sessiýasy köneldi." }, { status: 401 });
    const current = await readHorses();
    if (current.revision !== payload.revision) return NextResponse.json({ error: "Merkezi katalog üýtgedi. Sahypany täzeläp täzeden synanyşyň." }, { status: 409 });
    const existingIds = new Set(current.horses.map(h => h.id));
    const existingCodes = new Set(current.horses.map(h => h.code.trim().toLocaleLowerCase("tk")));
    const newHorses = incoming.filter(h => !existingIds.has(h.id) && !existingCodes.has(h.code.trim().toLocaleLowerCase("tk")));
    const skipped = incoming.length - newHorses.length;
    if (newHorses.length === 0) return NextResponse.json({ ...current, imported: 0, skipped }, { headers: { "Cache-Control": "no-store" } });
    const next = { revision: current.revision + 1, horses: [...current.horses, ...newHorses] };
    if (!await replaceHorses(current, next)) return NextResponse.json({ error: "Katalog import wagty üýtgedi." }, { status: 409 });
    return NextResponse.json({ ...next, imported: newHorses.length, skipped }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Maglumat bazasy elýeterli däl. Import tassyklanmady." }, { status: 503 });
  }
}
