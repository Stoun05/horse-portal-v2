import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, readAdminSession } from "./lib/adminAuth";
import { getAdminRecord, storageConfigured } from "./lib/adminCredentialStore";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const loginPage = pathname === "/admin/login" || pathname === "/admin/login/";
  // Next.js trailingSlash redirects and POST requests may arrive with a terminal slash.
  // Normalize just the admin API path before checking the login/logout exception.
  const adminApiPath = pathname.replace(/\/+$/, "") || "/";
  const publicAdminApi = adminApiPath === "/api/admin/login" || adminApiPath === "/api/admin/logout";
  if (loginPage || publicAdminApi) return NextResponse.next();
  const session = readAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  let allowed = Boolean(session);
  if (allowed && storageConfigured()) {
    try {
      const record = await getAdminRecord();
      allowed = session!.version === (record?.version ?? 0);
    } catch {
      return NextResponse.json({ error: "Admin maglumat bazasy wagtlaýyn elýeterli däl." }, { status: 503 });
    }
  }
  if (!allowed) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Admin rugsady talap edilýär." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
