/**
 * CrossHubTransitionEngine
 * Tracks user navigation between hubs and fires transition events.
 * Enables smooth cross-hub state handoff — no dropped context on hub switch.
 */

export type HubTransitionType =
  | "fan_to_performer"
  | "performer_to_fan"
  | "fan_to_battle"
  | "fan_to_cypher"
  | "lobby_to_stage"
  | "stage_to_lobby"
  | "hub_to_magazine"
  | "magazine_to_hub"
  | "hub_to_venue"
  | "direct_link"
  | "back_navigation"
  | "world_map_jump";

export interface HubTransitionEvent {
  id: string;
  userId: string;
  fromHub: string;
  toHub: string;
  transitionType: HubTransitionType;
  context: Record<string, unknown>;
  timestamp: number;
}

export interface UserHubHistory {
  userId: string;
  currentHub: string;
  previousHub: string | null;
  history: string[];
  lastTransitionAt: number;
}

const MAX_HISTORY = 20;
const MAX_LOG = 1000;

const userHistory = new Map<string, UserHubHistory>();
const transitionLog: HubTransitionEvent[] = [];
const transitionListeners = new Map<string, Set<(e: HubTransitionEvent) => void>>();
let seq = 0;

function nextId(): string { return `hub-tx-${Date.now()}-${(seq++).toString(36)}`; }

function detectTransitionType(fromHub: string, toHub: string): HubTransitionType {
  if (fromHub.includes("fan") && toHub.includes("performer")) return "fan_to_performer";
  if (fromHub.includes("performer") && toHub.includes("fan")) return "performer_to_fan";
  if (fromHub.includes("battle")) return "fan_to_battle";
  if (fromHub.includes("cypher")) return "fan_to_cypher";
  if (toHub.includes("magazine")) return "hub_to_magazine";
  if (fromHub.includes("magazine")) return "magazine_to_hub";
  if (toHub.includes("venue")) return "hub_to_venue";
  if (toHub.includes("stage")) return "lobby_to_stage";
  if (fromHub.includes("stage")) return "stage_to_lobby";
  return "direct_link";
}

export function recordHubTransition(userId: string, toHub: string, context: Record<string, unknown> = {}): HubTransitionEvent {
  const current = userHistory.get(userId);
  const fromHub = current?.currentHub ?? "unknown";

  const history = current?.history ?? [];
  const newHistory = [...history, toHub].slice(-MAX_HISTORY);

  userHistory.set(userId, {
    userId,
    currentHub: toHub,
    previousHub: fromHub,
    history: newHistory,
    lastTransitionAt: Date.now(),
  });

  const event: HubTransitionEvent = {
    id: nextId(),
    userId,
    fromHub,
    toHub,
    transitionType: detectTransitionType(fromHub, toHub),
    context,
    timestamp: Date.now(),
  };

  transitionLog.unshift(event);
  if (transitionLog.length > MAX_LOG) transitionLog.pop();

  transitionListeners.get(userId)?.forEach(l => l(event));
  transitionListeners.get("*")?.forEach(l => l(event));

  return event;
}

export function getUserHubHistory(userId: string): UserHubHistory | null {
  return userHistory.get(userId) ?? null;
}

export function getCurrentHub(userId: string): string | null {
  return userHistory.get(userId)?.currentHub ?? null;
}

export function getPreviousHub(userId: string): string | null {
  return userHistory.get(userId)?.previousHub ?? null;
}

export function canGoBack(userId: string): boolean {
  const h = userHistory.get(userId);
  return h !== undefined && h.history.length >= 2;
}

export function onUserTransition(userId: string, listener: (e: HubTransitionEvent) => void): () => void {
  const key = userId;
  if (!transitionListeners.has(key)) transitionListeners.set(key, new Set());
  transitionListeners.get(key)!.add(listener);
  return () => transitionListeners.get(key)?.delete(listener);
}

export function onAnyTransition(listener: (e: HubTransitionEvent) => void): () => void {
  if (!transitionListeners.has("*")) transitionListeners.set("*", new Set());
  transitionListeners.get("*")!.add(listener);
  return () => transitionListeners.get("*")?.delete(listener);
}

export function getTransitionLog(limit = 100): HubTransitionEvent[] {
  return transitionLog.slice(0, limit);
}

export function getTransitionMetrics(): Record<HubTransitionType, number> {
  const counts = {} as Record<HubTransitionType, number>;
  for (const e of transitionLog) {
    counts[e.transitionType] = (counts[e.transitionType] ?? 0) + 1;
  }
  return counts;
}
