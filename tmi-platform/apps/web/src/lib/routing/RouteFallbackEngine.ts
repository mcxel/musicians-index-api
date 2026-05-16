export type FallbackReason =
  | "404" | "auth-required" | "role-blocked" | "feature-disabled"
  | "maintenance" | "slug-not-found" | "region-blocked";

export interface FallbackResolution {
  originalRoute: string;
  resolvedRoute: string;
  reason: FallbackReason;
  message: string;
  requiresAuth: boolean;
  resolvedAt: string;
}

const ROLE_FALLBACKS: Record<string, string> = {
  fan:        "/fan/dashboard",
  artist:     "/artists/dashboard",
  performer:  "/performers/dashboard",
  producer:   "/beat-lab",
  writer:     "/writers/dashboard",
  venue:      "/venues/dashboard",
  sponsor:    "/sponsors/dashboard",
  advertiser: "/advertisers/dashboard",
  admin:      "/admin",
};

const REASON_FALLBACKS: Record<FallbackReason, string> = {
  "404":               "/",
  "auth-required":     "/signin",
  "role-blocked":      "/",
  "feature-disabled":  "/",
  "maintenance":       "/",
  "slug-not-found":    "/artists",
  "region-blocked":    "/",
};

const log: FallbackResolution[] = [];

export function resolveFallback(
  originalRoute: string,
  reason: FallbackReason,
  userRole?: string,
): FallbackResolution {
  let resolvedRoute = REASON_FALLBACKS[reason];
  let message = `Route ${originalRoute} unavailable: ${reason}`;

  if (reason === "role-blocked" && userRole) {
    resolvedRoute = ROLE_FALLBACKS[userRole] ?? "/";
    message = `Access restricted for role ${userRole}. Redirecting to your hub.`;
  }

  if (reason === "auth-required") {
    message = "Sign in required to access this page.";
  }

  const resolution: FallbackResolution = {
    originalRoute,
    resolvedRoute,
    reason,
    message,
    requiresAuth: reason === "auth-required",
    resolvedAt: new Date().toISOString(),
  };

  log.unshift(resolution);
  return resolution;
}

export function getFallbackLog(limit = 50): FallbackResolution[] {
  return log.slice(0, limit);
}

export function getRoleFallback(role: string): string {
  return ROLE_FALLBACKS[role] ?? "/";
}

export function getDefaultFallback(reason: FallbackReason): string {
  return REASON_FALLBACKS[reason];
}
