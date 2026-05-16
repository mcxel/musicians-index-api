/**
 * RuntimeMutationEngine
 * Applies live mutations to hub module configs at runtime without page reload.
 * Supports feature flags, A/B variants, and emergency overrides.
 */

export type MutationType = "feature_flag" | "layout_variant" | "content_swap" | "emergency_override" | "ab_test";

export interface RuntimeMutation {
  id: string;
  type: MutationType;
  target: string;     // module name, component key, or page section
  value: unknown;
  priority: 1 | 2 | 3 | 4 | 5;   // 5 = highest
  appliedAt: number;
  expiresAt: number | null;
  author: string;
}

export interface MutationState {
  hubId: string;
  activeMutations: RuntimeMutation[];
  mutationLog: RuntimeMutation[];
  lastMutatedAt: number | null;
}

const MAX_LOG = 100;
const MAX_ACTIVE = 50;

const mutationStates = new Map<string, MutationState>();
type MutationListener = (state: MutationState) => void;
const mutationListeners = new Map<string, Set<MutationListener>>();

function notify(hubId: string, state: MutationState): void {
  mutationListeners.get(hubId)?.forEach(l => l(state));
}

function purgeExpired(mutations: RuntimeMutation[]): RuntimeMutation[] {
  const now = Date.now();
  return mutations.filter(m => m.expiresAt === null || m.expiresAt > now);
}

export function initRuntimeMutations(hubId: string): MutationState {
  const state: MutationState = { hubId, activeMutations: [], mutationLog: [], lastMutatedAt: null };
  mutationStates.set(hubId, state);
  return state;
}

export function applyMutation(hubId: string, mutation: Omit<RuntimeMutation, "id" | "appliedAt">): MutationState {
  const current = mutationStates.get(hubId) ?? initRuntimeMutations(hubId);

  const full: RuntimeMutation = { ...mutation, id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, appliedAt: Date.now() };

  const active = purgeExpired([...current.activeMutations, full])
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_ACTIVE);

  const log = [full, ...current.mutationLog].slice(0, MAX_LOG);

  const updated: MutationState = { ...current, activeMutations: active, mutationLog: log, lastMutatedAt: Date.now() };
  mutationStates.set(hubId, updated);
  notify(hubId, updated);
  return updated;
}

export function revokeMutation(hubId: string, mutationId: string): MutationState {
  const current = mutationStates.get(hubId) ?? initRuntimeMutations(hubId);
  const active = current.activeMutations.filter(m => m.id !== mutationId);
  const updated = { ...current, activeMutations: active };
  mutationStates.set(hubId, updated);
  notify(hubId, updated);
  return updated;
}

export function getMutationValue<T>(hubId: string, target: string, fallback: T): T {
  const current = mutationStates.get(hubId);
  if (!current) return fallback;

  const active = purgeExpired(current.activeMutations);
  const match = active.find(m => m.target === target);
  return match ? (match.value as T) : fallback;
}

export function getRuntimeMutations(hubId: string): MutationState | null {
  return mutationStates.get(hubId) ?? null;
}

export function subscribeToMutations(hubId: string, listener: MutationListener): () => void {
  if (!mutationListeners.has(hubId)) mutationListeners.set(hubId, new Set());
  mutationListeners.get(hubId)!.add(listener);
  const current = mutationStates.get(hubId);
  if (current) listener(current);
  return () => mutationListeners.get(hubId)?.delete(listener);
}
