/**
 * FeedLatencyBalancer
 * Monitors per-feed latency and reorders/reweights video feeds to minimize viewer lag.
 */

export interface FeedLatencyRecord {
  feedId: string;
  latencyMs: number;
  jitterMs: number;
  bufferMs: number;
  lastMeasuredAt: number;
  health: "optimal" | "acceptable" | "degraded" | "critical";
}

export interface LatencyBalancerState {
  feeds: FeedLatencyRecord[];
  preferredFeedId: string | null;
  reorderCount: number;
  lastReorderAt: number | null;
}

const balancerStates = new Map<string, LatencyBalancerState>();
type BalancerListener = (state: LatencyBalancerState) => void;
const balancerListeners = new Map<string, Set<BalancerListener>>();

function healthFromLatency(latencyMs: number): FeedLatencyRecord["health"] {
  if (latencyMs < 300) return "optimal";
  if (latencyMs < 800) return "acceptable";
  if (latencyMs < 2000) return "degraded";
  return "critical";
}

function notify(sessionId: string, state: LatencyBalancerState): void {
  balancerListeners.get(sessionId)?.forEach(l => l(state));
}

export function initLatencyBalancer(sessionId: string, feedIds: string[]): LatencyBalancerState {
  const feeds: FeedLatencyRecord[] = feedIds.map(feedId => ({
    feedId, latencyMs: 0, jitterMs: 0, bufferMs: 500, lastMeasuredAt: 0, health: "optimal",
  }));
  const state: LatencyBalancerState = { feeds, preferredFeedId: feedIds[0] ?? null, reorderCount: 0, lastReorderAt: null };
  balancerStates.set(sessionId, state);
  return state;
}

export function reportFeedLatency(sessionId: string, feedId: string, latencyMs: number, jitterMs = 0, bufferMs = 500): LatencyBalancerState {
  const current = balancerStates.get(sessionId);
  if (!current) return initLatencyBalancer(sessionId, [feedId]);

  const updated = current.feeds.map(f =>
    f.feedId === feedId
      ? { ...f, latencyMs, jitterMs, bufferMs, lastMeasuredAt: Date.now(), health: healthFromLatency(latencyMs) }
      : f
  );

  const sorted = [...updated].sort((a, b) => a.latencyMs - b.latencyMs);
  const newPreferred = sorted[0]?.feedId ?? current.preferredFeedId;
  const didReorder = newPreferred !== current.preferredFeedId;

  const state: LatencyBalancerState = {
    feeds: updated,
    preferredFeedId: newPreferred,
    reorderCount: didReorder ? current.reorderCount + 1 : current.reorderCount,
    lastReorderAt: didReorder ? Date.now() : current.lastReorderAt,
  };
  balancerStates.set(sessionId, state);
  notify(sessionId, state);
  return state;
}

export function getLatencyBalancer(sessionId: string): LatencyBalancerState | null {
  return balancerStates.get(sessionId) ?? null;
}

export function subscribeToLatencyBalancer(sessionId: string, listener: BalancerListener): () => void {
  if (!balancerListeners.has(sessionId)) balancerListeners.set(sessionId, new Set());
  balancerListeners.get(sessionId)!.add(listener);
  const current = balancerStates.get(sessionId);
  if (current) listener(current);
  return () => balancerListeners.get(sessionId)?.delete(listener);
}
