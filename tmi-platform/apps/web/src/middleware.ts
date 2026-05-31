import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected role paths — redirect to /auth if no session cookies
const PROTECTED_PREFIXES = [
  "/fan/",
  "/performer/",
  "/artist/",
  "/admin/",
  "/profile/",
  "/beats/locker",
  "/tickets/",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const sessionId    = req.cookies.get("tmi_session_id")?.value;
  const sessionToken = req.cookies.get("tmi_session")?.value;

  if (!sessionId || !sessionToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/fan/:path*",
    "/performer/:path*",
    "/artist/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/beats/locker/:path*",
    "/tickets/:path*",
  ],
};
