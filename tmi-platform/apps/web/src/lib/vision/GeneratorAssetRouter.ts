/**
 * GeneratorAssetRouter — Stage E
 * Routes reconstructed, authority-bound nodes to their live generator targets:
 * Home 1-5, Magazine, Venue, Lobby, Orbit, Crown center, NFT, Ticket,
 * Performer card, Sponsor/ad, Avatar runtime, Motion portrait,
 * Billboard, Live room display.
 * Maintains routing manifests so generators can pull their assigned nodes.
 */

import { registerAsset, setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import { claimAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import type { ReconstructionNode } from "@/lib/vision/ReconstructionGraphBuilder";
import type { BindingResult } from "@/lib/vision/RuntimeAuthorityBinder";

export type GeneratorTarget =
  | "home-1" | "home-2" | "home-3" | "home-4" | "home-5"
  | "magazine-generator"
  | "venue-generator"
  | "lobby-generator"
  | "orbit-generator"
  | "crown-center"
  | "nft-generator"
  | "ticket-generator"
  | "performer-card"
  | "sponsor-generator"
  | "ad-generator"
  | "avatar-runtime"
  | "motion-portrait"
  | "billboard-system"
  | "live-room-display"
  | "hud-system"
  | "crowd-density"
  | "seat-population";

export type RoutingStatus = "pending" | "routed" | "consumed" | "rejected" | "stale";

export interface RoutingEntry {
  routeId: string;
  nodeId: string;
  assetId: string;
  sourceAssetId: string;
  target: GeneratorTarget;
  status: RoutingStatus;
  priority: number;
  routedAt: number;
  consumedAt: number | null;
  rejectionReason: string | null;
}

export interface RoutingManifest {
  manifestId: string;
  sourceAssetId: string;
  graphId: string;
  routes: RoutingEntry[];
  routedCount: number;
  pendingCount: number;
  rejectedCount: number;
  errors: string[];
  createdAt: number;
}

const ROUTER_PRIORITY = 2;
const ROUTER_TTL_MS = 15 * 60 * 1000;

const manifestLog = new Map<string, RoutingManifest>();
// per-target queues: target → routeIds in priority order
const targetQueues = new Map<GeneratorTarget, RoutingEntry[]>();
type RouterListener = (manifest: RoutingManifest) => void;
const routerListeners = new Set<RouterListener>();

function notify(manifest: RoutingManifest): void {
  routerListeners.forEach(l => l(manifest));
}

const TARGET_PRIORITY: Record<GeneratorTarget, number> = {
  "home-1":            10,
  "home-2":            10,
  "home-3":            9,
  "home-4":            9,
  "home-5":            8,
  "avatar-runtime":    10,
  "motion-portrait":   9,
  "performer-card":    8,
  "venue-generator":   8,
  "billboard-system":  7,
  "live-room-display": 7,
  "crown-center":      7,
  "magazine-generator":6,
  "sponsor-generator": 6,
  "ad-generator":      6,
  "lobby-generator":   5,
  "orbit-generator":   5,
  "nft-generator":     4,
  "ticket-generator":  4,
  "hud-system":        5,
  "crowd-density":     4,
  "seat-population":   3,
};

function routeNode(
  node: ReconstructionNode,
  target: GeneratorTarget,
  routeIndex: number
): RoutingEntry {
  const routeId = `route_${node.nodeId}_${target}_${routeIndex}`;

  registerAsset(`router_${routeId}`, "overlay", node.sourceAssetId, {
    generatorId: "GeneratorAssetRouter",
    motionCompatible: node.isAnimatable,
    metadata: { routeId, target, nodeId: node.nodeId, kind: node.kind },
    tags: ["route-entry", target, node.kind],
  });

  const claim = claimAuthority(`router_${routeId}`, "GeneratorAssetRouter", "generator", {
    exclusive: false,
    priority: ROUTER_PRIORITY,
    ttlMs: ROUTER_TTL_MS,
  });

  if (claim.granted) {
    setHydrationStatus(`router_${routeId}`, "hydrating");
    recordLineage(`router_${routeId}`, "runtime-reconstruction", "GeneratorAssetRouter", {
      parentAssetId: node.assetId,
      transforms: ["reconstruct"],
      reconstructable: node.reconstructionReady,
      metadata: { target, routeId, nodeKind: node.kind },
    });
    setHydrationStatus(`router_${routeId}`, "hydrated");
  }

  const entry: RoutingEntry = {
    routeId,
    nodeId: node.nodeId,
    assetId: node.assetId,
    sourceAssetId: node.sourceAssetId,
    target,
    status: claim.granted ? "routed" : "rejected",
    priority: TARGET_PRIORITY[target],
    routedAt: Date.now(),
    consumedAt: null,
    rejectionReason: claim.granted ? null : (claim.reason ?? "Authority denied"),
  };

  // Add to per-target queue
  if (claim.granted) {
    const queue = targetQueues.get(target) ?? [];
    queue.push(entry);
    queue.sort((a, b) => b.priority - a.priority);
    targetQueues.set(target, queue);
  }

  return entry;
}

export function routeGraph(
  nodes: ReconstructionNode[],
  bindingResult: BindingResult
): RoutingManifest {
  const manifestId = `manifest_${bindingResult.graphId}_${Date.now()}`;
  const routes: RoutingEntry[] = [];
  const errors: string[] = [];

  // Only route nodes that were successfully bound
  const boundNodeIds = new Set(bindingResult.boundNodes.map(n => n.nodeId));
  const eligibleNodes = nodes.filter(n => boundNodeIds.has(n.nodeId) && n.reconstructionReady);

  let routeIndex = 0;
  for (const node of eligibleNodes) {
    for (const target of node.generatorTargets as GeneratorTarget[]) {
      try {
        const entry = routeNode(node, target, routeIndex++);
        routes.push(entry);
      } catch (err) {
        errors.push(`node[${node.nodeId}]→${target}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }
  }

  const manifest: RoutingManifest = {
    manifestId,
    sourceAssetId: bindingResult.sourceAssetId,
    graphId: bindingResult.graphId,
    routes,
    routedCount: routes.filter(r => r.status === "routed").length,
    pendingCount: routes.filter(r => r.status === "pending").length,
    rejectedCount: routes.filter(r => r.status === "rejected").length,
    errors,
    createdAt: Date.now(),
  };

  manifestLog.set(manifestId, manifest);
  notify(manifest);
  return manifest;
}

export function consumeFromQueue(target: GeneratorTarget, count = 1): RoutingEntry[] {
  const queue = targetQueues.get(target) ?? [];
  const consumed = queue.splice(0, count);
  targetQueues.set(target, queue);

  for (const entry of consumed) {
    entry.status = "consumed";
    entry.consumedAt = Date.now();
  }
  return consumed;
}

export function peekQueue(target: GeneratorTarget): RoutingEntry[] {
  return targetQueues.get(target) ?? [];
}

export function getQueueDepths(): Record<GeneratorTarget, number> {
  const depths = {} as Record<GeneratorTarget, number>;
  for (const [target, queue] of targetQueues.entries()) {
    depths[target] = queue.length;
  }
  return depths;
}

export function markRouteStale(routeId: string): boolean {
  for (const manifest of manifestLog.values()) {
    const entry = manifest.routes.find(r => r.routeId === routeId);
    if (entry) {
      entry.status = "stale";
      return true;
    }
  }
  return false;
}

export function getRoutingManifest(manifestId: string): RoutingManifest | null {
  return manifestLog.get(manifestId) ?? null;
}

export function getManifestsByGraph(graphId: string): RoutingManifest[] {
  return [...manifestLog.values()].filter(m => m.graphId === graphId);
}

export function subscribeToRouter(listener: RouterListener): () => void {
  routerListeners.add(listener);
  return () => routerListeners.delete(listener);
}

export function getRouterStats(): {
  totalManifests: number;
  totalRoutes: number;
  routedCount: number;
  consumedCount: number;
  rejectedCount: number;
  staleCount: number;
  queueDepths: Record<GeneratorTarget, number>;
} {
  let totalRoutes = 0, routedCount = 0, consumedCount = 0, rejectedCount = 0, staleCount = 0;
  for (const m of manifestLog.values()) {
    totalRoutes += m.routes.length;
    routedCount += m.routedCount;
    rejectedCount += m.rejectedCount;
    consumedCount += m.routes.filter(r => r.status === "consumed").length;
    staleCount += m.routes.filter(r => r.status === "stale").length;
  }
  return {
    totalManifests: manifestLog.size,
    totalRoutes,
    routedCount,
    consumedCount,
    rejectedCount,
    staleCount,
    queueDepths: getQueueDepths(),
  };
}
