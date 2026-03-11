import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ROUTING_STATE_COOKIE,
  destinationFromRoutingState,
  verifyRoutingState,
} from "@/lib/routingState";

function redirectIfNeeded(request: NextRequest, targetPath: string) {
  if (request.nextUrl.pathname === targetPath) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL(targetPath, request.url));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = Boolean(request.cookies.get("phase11_session")?.value);
  const routingToken = request.cookies.get(ROUTING_STATE_COOKIE)?.value;
  const routingState = authenticated ? await verifyRoutingState(routingToken) : null;
  const destination = routingState ? destinationFromRoutingState(routingState) : "/dashboard";

  if (pathname.startsWith("/auth")) {
    if (authenticated) {
      return redirectIfNeeded(request, destination);
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const redirectUrl = new URL("/auth", request.url);
    const nextPath = `${pathname}${search}`;
    redirectUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/dashboard") {
    return redirectIfNeeded(request, destination);
  }

  const requiresAdmin = pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin");
  if (requiresAdmin && routingState?.role !== "admin") {
    return redirectIfNeeded(request, "/dashboard");
  }

  const isFanDashboard = pathname.startsWith("/dashboard/fan");
  const isArtistDashboard = pathname.startsWith("/dashboard/artist");

  if (routingState?.role === "fan" && isArtistDashboard) {
    return redirectIfNeeded(request, "/dashboard/fan");
  }

  if (routingState?.role === "artist" && isFanDashboard) {
    return redirectIfNeeded(request, "/dashboard/artist");
  }

  if (pathname.startsWith("/onboarding")) {
    if (routingState && destination.startsWith("/dashboard")) {
      return redirectIfNeeded(request, destination);
    }

    if (routingState && pathname === "/onboarding" && destination.startsWith("/onboarding/")) {
      return redirectIfNeeded(request, destination);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
