/**
 * IntelligentModuleGrowth
 * Tracks module usage and promotes/demotes hub modules based on engagement signals.
 * Modules that get high engagement rise in prominence; low-engagement modules shrink.
 */

export type GrowthTier = "featured" | "visible" | "compact" | "hidden";

export interface ModuleEngagementRecord {
  moduleId: string;
  label: string;
  clicks: number;
  impressions: number;
  dwellMs: number;
  tier: GrowthTier;
  lastInteractedAt: number | null;
  score: number;
}

export interface ModuleGrowthState {
  hubId: string;
  modules: ModuleEngagementRecord[];
  lastEvaluatedAt: number | null;
  evaluationCount: number;
}

const MAX_FEATURED = 2;
const MAX_VISIBLE = 6;

const growthStates = new Map<string, ModuleGrowthState>();
type GrowthListener = (state: ModuleGrowthState) => void;
const growthListeners = new Map<string, Set<GrowthListener>>();

function computeScore(record: ModuleEngagementRecord): number {
  const ctr = record.impressions > 0 ? record.clicks / record.impressions : 0;
  const recency = record.lastInteractedAt ? Math.max(0, 1 - (Date.now() - record.lastInteractedAt) / (7 * 24 * 60 * 60 * 1000)) : 0;
  const dwellBonus = Math.min(1, record.dwellMs / 30_000);
  return Math.round(ctr * 50 + recency * 30 + dwellBonus * 20);
}

function assignTiers(modules: ModuleEngagementRecord[]): ModuleEngagementRecord[] {
  const sorted = [...modules].sort((a, b) => b.score - a.score);
  return sorted.map((m, i) => ({
    ...m,
    tier: i < MAX_FEATURED ? "featured" : i < MAX_FEATURED + MAX_VISIBLE ? "visible" : i < MAX_FEATURED + MAX_VISIBLE + 4 ? "compact" : "hidden",
  }));
}

function notify(hubId: string, state: ModuleGrowthState): void {
  growthListeners.get(hubId)?.forEach(l => l(state));
}

export function initModuleGrowth(hubId: string, moduleIds: Array<{ moduleId: string; label: string }>): ModuleGrowthState {
  const modules: ModuleEngagementRecord[] = moduleIds.map((m, i) => ({
    ...m, clicks: 0, impressions: 0, dwellMs: 0,
    tier: i < MAX_FEATURED ? "featured" : i < MAX_FEATURED + MAX_VISIBLE ? "visible" : "compact",
    lastInteractedAt: null, score: 50 - i * 5,
  }));
  const state: ModuleGrowthState = { hubId, modules, lastEvaluatedAt: null, evaluationCount: 0 };
  growthStates.set(hubId, state);
  return state;
}

export function recordModuleClick(hubId: string, moduleId: string): ModuleGrowthState {
  const current = growthStates.get(hubId);
  if (!current) return initModuleGrowth(hubId, []);

  const modules = current.modules.map(m =>
    m.moduleId === moduleId ? { ...m, clicks: m.clicks + 1, lastInteractedAt: Date.now() } : m
  );
  const scored = modules.map(m => ({ ...m, score: computeScore(m) }));
  const tiered = assignTiers(scored);

  const updated = { ...current, modules: tiered };
  growthStates.set(hubId, updated);
  notify(hubId, updated);
  return updated;
}

export function recordModuleImpression(hubId: string, moduleId: string): ModuleGrowthState {
  const current = growthStates.get(hubId);
  if (!current) return initModuleGrowth(hubId, []);

  const modules = current.modules.map(m => m.moduleId === moduleId ? { ...m, impressions: m.impressions + 1 } : m);
  const updated = { ...current, modules };
  growthStates.set(hubId, updated);
  return updated;
}

export function recordModuleDwell(hubId: string, moduleId: string, dwellMs: number): ModuleGrowthState {
  const current = growthStates.get(hubId);
  if (!current) return initModuleGrowth(hubId, []);

  const modules = current.modules.map(m => m.moduleId === moduleId ? { ...m, dwellMs: m.dwellMs + dwellMs } : m);
  const updated = { ...current, modules };
  growthStates.set(hubId, updated);
  return updated;
}

export function evaluateAndRebalance(hubId: string): ModuleGrowthState {
  const current = growthStates.get(hubId);
  if (!current) return initModuleGrowth(hubId, []);

  const scored = current.modules.map(m => ({ ...m, score: computeScore(m) }));
  const tiered = assignTiers(scored);

  const updated: ModuleGrowthState = {
    ...current, modules: tiered, lastEvaluatedAt: Date.now(), evaluationCount: current.evaluationCount + 1,
  };
  growthStates.set(hubId, updated);
  notify(hubId, updated);
  return updated;
}

export function getVisibleModules(hubId: string): ModuleEngagementRecord[] {
  const state = growthStates.get(hubId);
  return (state?.modules ?? []).filter(m => m.tier !== "hidden");
}

export function getModuleGrowth(hubId: string): ModuleGrowthState | null {
  return growthStates.get(hubId) ?? null;
}

export function subscribeToModuleGrowth(hubId: string, listener: GrowthListener): () => void {
  if (!growthListeners.has(hubId)) growthListeners.set(hubId, new Set());
  growthListeners.get(hubId)!.add(listener);
  const current = growthStates.get(hubId);
  if (current) listener(current);
  return () => growthListeners.get(hubId)?.delete(listener);
}
