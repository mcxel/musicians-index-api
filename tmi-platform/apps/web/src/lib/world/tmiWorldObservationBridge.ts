import { listWorldNodes } from "@/lib/world/tmiWorldConnectionRegistry";
import { listWorldRoutes } from "@/lib/world/tmiWorldRouteRegistry";
import { listWorldCapabilities } from "@/lib/world/tmiWorldCapabilityRegistry";

export type TmiWorldObservationSnapshot = {
  nodeCount: number;
  routeCount: number;
  capabilityCount: number;
  lockedNodes: number;
  lockedRoutes: number;
  needsSetupCapabilities: number;
};

export function getWorldObservationSnapshot(): TmiWorldObservationSnapshot {
  const nodes = listWorldNodes();
  const routes = listWorldRoutes();
  const capabilities = listWorldCapabilities();

  return {
    nodeCount: nodes.length,
    routeCount: routes.length,
    capabilityCount: capabilities.length,
    lockedNodes: nodes.filter((n) => n.locked).length,
    lockedRoutes: routes.filter((r) => r.locked).length,
    needsSetupCapabilities: capabilities.filter((c) => c.status === "needs-setup").length,
  };
}
