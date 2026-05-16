/**
 * RuntimeAuthorityBinder — Stage D
 * Binds every reconstructed graph node to:
 *   ownership ID, runtime authority ID, hydration state, sync state,
 *   recovery policy, retry policy, stale policy,
 *   overlay authority, media authority, render authority.
 * After binding, authorityBound = true on the node.
 */

import { claimAuthority, revokeAuthority } from "@/lib/registry/AssetAuthorityLedger";
import { setHydrationStatus } from "@/lib/registry/RuntimeAssetRegistry";
import type { ReconstructionNode, ReconstructionGraph } from "@/lib/vision/ReconstructionGraphBuilder";

export type AuthorityScope = "overlay" | "media" | "render" | "full";

export type RecoveryPolicy = "auto-retry" | "manual-reset" | "ignore" | "escalate";
export type StalePolicy    = "evict" | "refresh" | "freeze" | "hold";
export type SyncState      = "live" | "cached" | "stale" | "recovering" | "offline";

export interface NodeAuthority {
  nodeId: string;
  assetId: string;
  ownerId: string;
  runtimeAuthorityId: string;
  scope: AuthorityScope;
  syncState: SyncState;
  recoveryPolicy: RecoveryPolicy;
  retryLimit: number;
  retryCount: number;
  stalePolicy: StalePolicy;
  staleTtlMs: number;
  overlayAuthority: boolean;
  mediaAuthority: boolean;
  renderAuthority: boolean;
  boundAt: number;
  lastSyncAt: number | null;
  expiresAt: number | null;
}

export interface BindingResult {
  bindingId: string;
  graphId: string;
  sourceAssetId: string;
  boundNodes: NodeAuthority[];
  failedNodeIds: string[];
  totalBound: number;
  overlayAuthorityCount: number;
  renderAuthorityCount: number;
  errors: string[];
  boundAt: number;
}

const BINDER_PRIORITY = 5;
const BINDER_TTL_MS = 10 * 60 * 1000;
const DEFAULT_STALE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_RETRY_LIMIT = 3;

const bindingLog = new Map<string, BindingResult>();
const nodeAuthorityMap = new Map<string, NodeAuthority>();
type BindingListener = (result: BindingResult) => void;
const bindingListeners = new Set<BindingListener>();

function notify(result: BindingResult): void {
  bindingListeners.forEach(l => l(result));
}

function scopeFromKind(kind: ReconstructionNode["kind"]): AuthorityScope {
  if (kind === "overlay-fragment" || kind === "hud-fragment" || kind === "sponsor-panel") return "overlay";
  if (kind === "motion-portrait-layer" || kind === "crowd-segment") return "media";
  if (kind === "billboard-surface") return "render";
  return "full";
}

function recoveryPolicyFromKind(kind: ReconstructionNode["kind"]): RecoveryPolicy {
  if (kind === "facial-layer" || kind === "avatar-part" || kind === "host-segment") return "auto-retry";
  if (kind === "sponsor-panel" || kind === "billboard-surface") return "escalate";
  if (kind === "environment-chunk" || kind === "stage-geometry") return "manual-reset";
  return "ignore";
}

function stalePolicyFromKind(kind: ReconstructionNode["kind"]): StalePolicy {
  if (kind === "motion-portrait-layer" || kind === "facial-layer") return "refresh";
  if (kind === "overlay-fragment" || kind === "hud-fragment") return "evict";
  if (kind === "environment-chunk" || kind === "stage-geometry") return "hold";
  return "freeze";
}

function bindNode(
  node: ReconstructionNode,
  ownerId: string,
  runtimeAuthorityId: string
): NodeAuthority | null {
  const scope = scopeFromKind(node.kind);

  const claim = claimAuthority(node.assetId, runtimeAuthorityId, "generator", {
    exclusive: scope === "render" || scope === "full",
    priority: BINDER_PRIORITY,
    ttlMs: BINDER_TTL_MS,
  });

  if (!claim.granted) return null;

  setHydrationStatus(node.assetId, "hydrating");

  const authority: NodeAuthority = {
    nodeId: node.nodeId,
    assetId: node.assetId,
    ownerId,
    runtimeAuthorityId,
    scope,
    syncState: "live",
    recoveryPolicy: recoveryPolicyFromKind(node.kind),
    retryLimit: DEFAULT_RETRY_LIMIT,
    retryCount: 0,
    stalePolicy: stalePolicyFromKind(node.kind),
    staleTtlMs: DEFAULT_STALE_TTL_MS,
    overlayAuthority: scope === "overlay" || scope === "full",
    mediaAuthority: scope === "media" || scope === "full",
    renderAuthority: scope === "render" || scope === "full",
    boundAt: Date.now(),
    lastSyncAt: Date.now(),
    expiresAt: Date.now() + BINDER_TTL_MS,
  };

  setHydrationStatus(node.assetId, "hydrated");
  nodeAuthorityMap.set(node.nodeId, authority);
  return authority;
}

export function bindGraph(
  graph: ReconstructionGraph,
  ownerId: string,
  runtimeAuthorityId: string
): BindingResult {
  const bindingId = `binding_${graph.graphId}_${Date.now()}`;
  const boundNodes: NodeAuthority[] = [];
  const failedNodeIds: string[] = [];
  const errors: string[] = [];

  for (const node of graph.nodes) {
    try {
      const authority = bindNode(node, ownerId, runtimeAuthorityId);
      if (authority) {
        boundNodes.push(authority);
      } else {
        failedNodeIds.push(node.nodeId);
      }
    } catch (err) {
      errors.push(`node[${node.nodeId}]: ${err instanceof Error ? err.message : "unknown"}`);
      failedNodeIds.push(node.nodeId);
    }
  }

  const result: BindingResult = {
    bindingId,
    graphId: graph.graphId,
    sourceAssetId: graph.sourceAssetId,
    boundNodes,
    failedNodeIds,
    totalBound: boundNodes.length,
    overlayAuthorityCount: boundNodes.filter(n => n.overlayAuthority).length,
    renderAuthorityCount: boundNodes.filter(n => n.renderAuthority).length,
    errors,
    boundAt: Date.now(),
  };

  bindingLog.set(bindingId, result);
  notify(result);
  return result;
}

export function updateSyncState(nodeId: string, state: SyncState): NodeAuthority | null {
  const authority = nodeAuthorityMap.get(nodeId);
  if (!authority) return null;
  const updated: NodeAuthority = { ...authority, syncState: state, lastSyncAt: Date.now() };
  nodeAuthorityMap.set(nodeId, updated);
  return updated;
}

export function recordRetry(nodeId: string): NodeAuthority | null {
  const authority = nodeAuthorityMap.get(nodeId);
  if (!authority) return null;
  const updated: NodeAuthority = {
    ...authority,
    retryCount: authority.retryCount + 1,
    syncState: "recovering",
  };
  nodeAuthorityMap.set(nodeId, updated);
  return updated;
}

export function releaseNodeAuthority(nodeId: string): boolean {
  const authority = nodeAuthorityMap.get(nodeId);
  if (!authority) return false;
  revokeAuthority(authority.assetId, authority.runtimeAuthorityId);
  setHydrationStatus(authority.assetId, "evicted");
  nodeAuthorityMap.delete(nodeId);
  return true;
}

export function getNodeAuthority(nodeId: string): NodeAuthority | null {
  return nodeAuthorityMap.get(nodeId) ?? null;
}

export function getBindingResult(bindingId: string): BindingResult | null {
  return bindingLog.get(bindingId) ?? null;
}

export function getBindingsByGraph(graphId: string): BindingResult[] {
  return [...bindingLog.values()].filter(b => b.graphId === graphId);
}

export function getStaleAuthorities(thresholdMs: number = DEFAULT_STALE_TTL_MS): NodeAuthority[] {
  const now = Date.now();
  return [...nodeAuthorityMap.values()].filter(
    a => a.lastSyncAt !== null && now - a.lastSyncAt > thresholdMs
  );
}

export function subscribeToBinding(listener: BindingListener): () => void {
  bindingListeners.add(listener);
  return () => bindingListeners.delete(listener);
}

export function getBinderStats(): {
  totalBindings: number;
  totalBoundNodes: number;
  totalFailed: number;
  staleCount: number;
  recoveringCount: number;
} {
  const staleCount = getStaleAuthorities().length;
  const recoveringCount = [...nodeAuthorityMap.values()].filter(a => a.syncState === "recovering").length;
  let totalBoundNodes = 0, totalFailed = 0;
  for (const b of bindingLog.values()) {
    totalBoundNodes += b.totalBound;
    totalFailed += b.failedNodeIds.length;
  }
  return { totalBindings: bindingLog.size, totalBoundNodes, totalFailed, staleCount, recoveringCount };
}
