import { NextResponse } from "next/server";
import { readHorses } from "../../../lib/horseStore";
import { storageConfigured } from "../../../lib/adminCredentialStore";

export const runtime = "nodejs";
export async function GET() {
  if (!storageConfigured()) {
    return NextResponse.json({ error: "Merkezi katalog entek birikdirilmedi." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const catalog = await readHorses();
    return NextResponse.json(catalog, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Atlar bazasy wagtlaýyn elýeterli däl." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
