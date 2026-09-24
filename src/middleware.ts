import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";

/**
 * Gates the admin area.
 *
 * Runs on the edge, so it only verifies the signed session JWT — no database
 * and no bcrypt here. This is the single choke point for /admin; individual
 * pages don't repeat the check.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authenticated = await verifySessionToken(token);

  // Already signed in and hitting the login page: send them onward.
  if (pathname === "/admin/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const login = new URL("/admin/login", request.url);
    // Preserve where they were heading so login can bounce them back.
    if (pathname !== "/admin") {
      login.searchParams.set("next", `${pathname}${search}`);
    }
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  // Everything under /admin except the login page itself, which the handler
  // above special-cases.
  matcher: ["/admin/:path*"],
};
