import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GitTreeEntry = { path: string; type: string };
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;

export async function GET() {
  try {
    // Public repository. This endpoint reads file names, not private user media.
    const response = await fetch(
      "https://api.github.com/repos/Stoun05/horse-portal-v2/git/trees/main?recursive=1",
      { headers: { Accept: "application/vnd.github+json" }, next: { revalidate: 120 } }
    );
    if (!response.ok) {
      return NextResponse.json({ items: [], error: "GitHub media sanawyny alyp bolmady" }, { status: 502 });
    }
    const payload = (await response.json()) as { tree?: GitTreeEntry[]; truncated?: boolean };
    if (payload.truncated) {
      return NextResponse.json({ items: [], error: "GitHub media sanawy doly däl" }, { status: 502 });
    }
    const items = (payload.tree ?? [])
      .filter((item) => item.type === "blob" && item.path.startsWith("public/horses/"))
      .flatMap((item) => {
        const relative = item.path.slice("public/horses/".length);
        const parts = relative.split("/");
        const filename = parts[parts.length - 1];
        const kind = IMAGE_EXT.test(filename) ? "image" : VIDEO_EXT.test(filename) ? "video" : null;
        if (!kind) return [];
        // /horses/horse-slug/photos/name.webp or /videos/name.mp4.
        // Legacy files such as /horses/akyol.webp are also supported.
        const slug = parts.length === 1 ? filename.replace(/\.[^.]+$/, "").toLowerCase() : parts[0].toLowerCase();
        if (parts.length !== 1 && !(parts.length === 3 && (parts[1] === "photos" || parts[1] === "videos"))) return [];
        if (parts.length === 3 && ((parts[1] === "photos" && kind !== "image") || (parts[1] === "videos" && kind !== "video"))) return [];
        return [{
          id: "github:" + item.path,
          slug,
          kind,
          title: filename.replace(/\.[^.]+$/, ""),
          fileName: filename,
          url: "/horses/" + relative.split("/").map(encodeURIComponent).join("/"),
        }];
      });
    return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ items: [], error: "GitHub bilen baglanyşykda näsazlyk" }, { status: 502 });
  }
}
