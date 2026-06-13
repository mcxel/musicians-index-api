import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected role paths — redirect to /auth if no session cookies
const PROTECTED_PREFIXES = [
  "/fan/",
  "/performer/",
  "/artist/",
  "/profile/",
  "/beats/locker",
  "/tickets/",
  // Role-specific sections
  "/venue/",
  "/promoter/",
  "/sponsor/",
  "/advertiser/",
  // Dashboards
  "/dashboard/",
  // Contest admin — requires auth
  "/contest/admin",
  // Go live — requires account
  "/go-live",
  // Billing — must be authenticated before touching payment flows
  "/settings/billing",
  "/settings/account",
  "/settings/payout",
  "/settings/privacy",
  // Role hubs — require role assignment
  "/hub/",
  // Messages + NFT vault — account required
  "/messages",
  "/nft/mint",
  "/beat-vault/upload",
  "/beats/submit",
];

const ADMIN_EMAILS_DEFAULT = "berntmusic33@gmail.com,bigace@berntoutglobal.com";

function buildAuthRedirect(req: NextRequest, pathname: string) {
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/auth";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionId    = req.cookies.get("tmi_session_id")?.value;
  const sessionToken = req.cookies.get("tmi_session")?.value;

  // Auth page guard — redirect authenticated users away from /auth
  if (pathname === "/auth" && sessionId && sessionToken) {
    const role = (req.cookies.get("tmi_role")?.value ?? "").toLowerCase();
    const lastWorkspace = req.cookies.get("tmi_last_workspace")?.value;
    const nextParam = req.nextUrl.searchParams.get("next");

    let defaultPath = "/onboarding";

    switch (role) {
      case "admin":
      case "staff":
        defaultPath = "/admin"; break;
      case "artist":
        defaultPath = "/dashboard/artist"; break;
      case "fan":
        defaultPath = "/dashboard/fan"; break;
      case "sponsor":
        defaultPath = "/dashboard/sponsor"; break;
      case "advertiser":
        defaultPath = "/dashboard/advertiser"; break;
      case "performer":
        defaultPath = "/dashboard/performer"; break;
      case "venue":
        defaultPath = "/dashboard/venue"; break;
      case "promoter":
        defaultPath = "/dashboard/promoter"; break;
      case "writer":
        defaultPath = "/dashboard/writer"; break;
      default:
        defaultPath = "/onboarding"; break;
    }

    const target = nextParam || (lastWorkspace && lastWorkspace.startsWith('/') ? lastWorkspace : defaultPath);
    return NextResponse.redirect(new URL(target, req.url));
  }

  // Admin guard — authentication + role check
  if (pathname.startsWith("/admin")) {
    if (!sessionId || !sessionToken) {
      return buildAuthRedirect(req, pathname);
    }
    const role  = (req.cookies.get("tmi_role")?.value ?? "").toLowerCase();
    const email = (req.cookies.get("tmi_user_email")?.value ?? "").toLowerCase();
    const adminEmails = (process.env.ADMIN_EMAILS ?? ADMIN_EMAILS_DEFAULT)
      .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (role !== "admin" && role !== "staff" && !adminEmails.includes(email)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  if (!sessionId || !sessionToken) {
    return buildAuthRedirect(req, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth",
    "/fan/:path*",
    "/performer/:path*",
    "/artist/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/beats/locker/:path*",
    "/tickets/:path*",
    "/venue/:path*",
    "/promoter/:path*",
    "/sponsor/:path*",
    "/advertiser/:path*",
    "/dashboard/:path*",
    "/contest/admin",
    "/contest/admin/:path*",
    "/go-live",
    "/go-live/:path*",
    "/settings/billing/:path*",
    "/settings/billing",
    "/settings/account/:path*",
    "/settings/payout/:path*",
    "/settings/privacy/:path*",
    "/hub/:path*",
    "/messages",
    "/nft/mint",
    "/beat-vault/upload",
    "/beats/submit",
  ],
};
