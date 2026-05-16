import { listPlatformConnections } from "@/lib/core/tmiPlatformConnectionRegistry";

export type TmiBackRouteIssue = {
  systemId: string;
  route: string;
  reason: string;
};

export function enforceGlobalBackRouteLaw(): TmiBackRouteIssue[] {
  return listPlatformConnections()
    .filter((entry) => !entry.backRoute || entry.backRoute.trim().length === 0)
    .map((entry) => ({
      systemId: entry.systemId,
      route: entry.route,
      reason: "missing-back-route",
    }));
}
