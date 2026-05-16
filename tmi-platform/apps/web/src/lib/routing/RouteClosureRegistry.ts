export type RouteClosureStatus = "open" | "closed" | "redirect" | "stub" | "dead-end";

export interface RouteClosureRecord {
  route: string;
  status: RouteClosureStatus;
  fallbackRoute?: string;
  returnRoute?: string;
  nextAction?: string;
  closedAt?: string;
  lastVerifiedAt: string;
  reason?: string;
}

const registry = new Map<string, RouteClosureRecord>();

function now() { return new Date().toISOString(); }

export function registerRoute(
  route: string,
  status: RouteClosureStatus,
  opts: { fallbackRoute?: string; returnRoute?: string; nextAction?: string; reason?: string } = {},
): RouteClosureRecord {
  const record: RouteClosureRecord = {
    route,
    status,
    fallbackRoute: opts.fallbackRoute,
    returnRoute: opts.returnRoute,
    nextAction: opts.nextAction,
    closedAt: status === "closed" || status === "dead-end" ? now() : undefined,
    lastVerifiedAt: now(),
    reason: opts.reason,
  };
  registry.set(route, record);
  return record;
}

export function getRouteStatus(route: string): RouteClosureRecord | null {
  return registry.get(route) ?? null;
}

export function markRouteClosed(route: string, fallbackRoute: string, reason?: string): RouteClosureRecord {
  return registerRoute(route, "closed", { fallbackRoute, reason });
}

export function markRouteOpen(route: string, returnRoute?: string): RouteClosureRecord {
  const existing = registry.get(route);
  return registerRoute(route, "open", { returnRoute: returnRoute ?? existing?.returnRoute });
}

export function markDeadEnd(route: string, fallbackRoute: string, reason: string): RouteClosureRecord {
  return registerRoute(route, "dead-end", { fallbackRoute, reason });
}

export function getDeadEnds(): RouteClosureRecord[] {
  return [...registry.values()].filter((r) => r.status === "dead-end");
}

export function getOpenRoutes(): RouteClosureRecord[] {
  return [...registry.values()].filter((r) => r.status === "open");
}

export function resolveRoute(route: string): string {
  const record = registry.get(route);
  if (!record || record.status === "open") return route;
  return record.fallbackRoute ?? "/";
}

export function getAllRoutes(): RouteClosureRecord[] {
  return [...registry.values()];
}
