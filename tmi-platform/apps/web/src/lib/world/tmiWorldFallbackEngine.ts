import { getWorldRoute } from "@/lib/world/tmiWorldRouteRegistry";

export type TmiWorldFallbackResult = {
  allowed: boolean;
  resolvedRoute: string;
  reason?: string;
};

export function resolveWorldRouteWithFallback(route: string, fallbackRoute = "/world"): TmiWorldFallbackResult {
  const found = getWorldRoute(route);
  if (!found) {
    return {
      allowed: false,
      resolvedRoute: fallbackRoute,
      reason: "missing-world-route",
    };
  }

  if (found.locked) {
    return {
      allowed: false,
      resolvedRoute: found.backRoute || fallbackRoute,
      reason: found.lockReason || "world-locked",
    };
  }

  return {
    allowed: true,
    resolvedRoute: found.route,
  };
}
