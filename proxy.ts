import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "./lib/adminAuth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const loginPage = pathname === "/admin/login" || pathname === "/admin/login/";
  const publicAdminApi = pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  if (loginPage || publicAdminApi) return NextResponse.next();

  if (!verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Admin rugsady talap edilýär." }, {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
