/**
 * ConcertReadinessEngine
 * Tracks pre-show checklist state for the performer.
 * Gates the go-live trigger until all critical checks pass.
 */

export type ReadinessCheck =
  | "audio_check"
  | "video_check"
  | "lighting_check"
  | "setlist_loaded"
  | "mic_hot"
  | "stream_key_active"
  | "backup_stream_ready"
  | "crowd_feed_enabled"
  | "merch_store_open"
  | "tip_jar_active";

export type CheckStatus = "pending" | "pass" | "fail" | "skipped";

export interface ReadinessItem {
  check: ReadinessCheck;
  status: CheckStatus;
  checkedAt: number | null;
  notes: string | null;
  critical: boolean;
}

export interface ConcertReadinessState {
  roomId: string;
  performerId: string;
  items: ReadinessItem[];
  overallReady: boolean;
  criticalBlockers: ReadinessCheck[];
  readinessScore: number;    // 0-100
  checkedAt: number | null;
}

const CRITICAL_CHECKS: ReadinessCheck[] = ["audio_check", "video_check", "mic_hot", "stream_key_active"];

const readinessStates = new Map<string, ConcertReadinessState>();
type ReadinessListener = (state: ConcertReadinessState) => void;
const readinessListeners = new Map<string, Set<ReadinessListener>>();

function defaultItems(): ReadinessItem[] {
  const allChecks: ReadinessCheck[] = [
    "audio_check", "video_check", "lighting_check", "setlist_loaded",
    "mic_hot", "stream_key_active", "backup_stream_ready",
    "crowd_feed_enabled", "merch_store_open", "tip_jar_active",
  ];
  return allChecks.map(check => ({
    check, status: "pending", checkedAt: null, notes: null,
    critical: CRITICAL_CHECKS.includes(check),
  }));
}

function computeScore(items: ReadinessItem[]): number {
  const passed = items.filter(i => i.status === "pass" || i.status === "skipped").length;
  return Math.round((passed / items.length) * 100);
}

function computeBlockers(items: ReadinessItem[]): ReadinessCheck[] {
  return items.filter(i => i.critical && i.status !== "pass").map(i => i.check);
}

function notify(roomId: string, state: ConcertReadinessState): void {
  readinessListeners.get(roomId)?.forEach(l => l(state));
}

export function initConcertReadiness(roomId: string, performerId: string): ConcertReadinessState {
  const items = defaultItems();
  const state: ConcertReadinessState = {
    roomId, performerId, items, overallReady: false,
    criticalBlockers: CRITICAL_CHECKS, readinessScore: 0, checkedAt: null,
  };
  readinessStates.set(roomId, state);
  return state;
}

export function updateCheck(roomId: string, check: ReadinessCheck, status: CheckStatus, notes?: string): ConcertReadinessState {
  const current = readinessStates.get(roomId);
  if (!current) return initConcertReadiness(roomId, "");

  const items = current.items.map(i =>
    i.check === check ? { ...i, status, checkedAt: Date.now(), notes: notes ?? null } : i
  );
  const criticalBlockers = computeBlockers(items);
  const readinessScore = computeScore(items);
  const overallReady = criticalBlockers.length === 0;

  const updated: ConcertReadinessState = {
    ...current, items, criticalBlockers, readinessScore, overallReady, checkedAt: Date.now(),
  };
  readinessStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function runAllChecks(roomId: string, results: Partial<Record<ReadinessCheck, CheckStatus>>): ConcertReadinessState {
  let state = readinessStates.get(roomId);
  if (!state) state = initConcertReadiness(roomId, "");

  const items = state.items.map(i => ({
    ...i,
    status: results[i.check] ?? i.status,
    checkedAt: results[i.check] ? Date.now() : i.checkedAt,
  }));
  const criticalBlockers = computeBlockers(items);
  const readinessScore = computeScore(items);
  const overallReady = criticalBlockers.length === 0;
  const updated: ConcertReadinessState = {
    ...state, items, criticalBlockers, readinessScore, overallReady, checkedAt: Date.now(),
  };
  readinessStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function getConcertReadiness(roomId: string): ConcertReadinessState | null {
  return readinessStates.get(roomId) ?? null;
}

export function subscribeToConcertReadiness(roomId: string, listener: ReadinessListener): () => void {
  if (!readinessListeners.has(roomId)) readinessListeners.set(roomId, new Set());
  readinessListeners.get(roomId)!.add(listener);
  const current = readinessStates.get(roomId);
  if (current) listener(current);
  return () => readinessListeners.get(roomId)?.delete(listener);
}
