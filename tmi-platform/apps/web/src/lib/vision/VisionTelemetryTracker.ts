/**
 * VisionTelemetryTracker — Stage F
 * Tracks all failure modes and drift conditions in the Phase 7 pipeline:
 * failed decomposition, authority mismatch, missing lineage, broken masks,
 * invalid reconstruction, hydration drift, overlay desync, stale runtime assets,
 * duplicate ownership, reconstruction corruption, generator timeout,
 * unresolved render fragments.
 * All incidents are stored, queryable, and emit subscriber notifications.
 */

export type TelemetryEventKind =
  | "decomposition-failed"
  | "authority-mismatch"
  | "missing-lineage"
  | "broken-mask"
  | "invalid-reconstruction"
  | "hydration-drift"
  | "overlay-desync"
  | "stale-runtime-asset"
  | "duplicate-ownership"
  | "reconstruction-corruption"
  | "generator-timeout"
  | "unresolved-render-fragment"
  | "binding-failed"
  | "routing-rejected"
  | "layer-isolation-gap"
  | "validation-fail";

export type TelemetrySeverity = "info" | "warning" | "error" | "critical";

export interface TelemetryEvent {
  eventId: string;
  kind: TelemetryEventKind;
  severity: TelemetrySeverity;
  assetId: string | null;
  sourceAssetId: string | null;
  pipelineStage: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "unknown";
  message: string;
  metadata: Record<string, unknown>;
  resolvedAt: number | null;
  recordedAt: number;
}

export interface TelemetrySummary {
  total: number;
  byKind: Partial<Record<TelemetryEventKind, number>>;
  bySeverity: Record<TelemetrySeverity, number>;
  byStage: Partial<Record<string, number>>;
  unresolved: number;
  criticalCount: number;
  recentErrors: TelemetryEvent[];
}

const MAX_EVENTS = 2_000;
const RECENT_WINDOW_MS = 5 * 60 * 1000;

const eventLog: TelemetryEvent[] = [];
let eventCounter = 0;

type TelemetryListener = (event: TelemetryEvent) => void;
const telemetryListeners = new Set<TelemetryListener>();

function notify(event: TelemetryEvent): void {
  telemetryListeners.forEach(l => l(event));
}

function purge(): void {
  if (eventLog.length < MAX_EVENTS) return;
  // evict oldest resolved events first
  const resolvedIdx = eventLog.findIndex(e => e.resolvedAt !== null);
  if (resolvedIdx !== -1) eventLog.splice(resolvedIdx, 1);
  else eventLog.shift();
}

const KIND_SEVERITY: Record<TelemetryEventKind, TelemetrySeverity> = {
  "decomposition-failed":       "error",
  "authority-mismatch":         "critical",
  "missing-lineage":            "warning",
  "broken-mask":                "error",
  "invalid-reconstruction":     "error",
  "hydration-drift":            "warning",
  "overlay-desync":             "warning",
  "stale-runtime-asset":        "info",
  "duplicate-ownership":        "critical",
  "reconstruction-corruption":  "critical",
  "generator-timeout":          "error",
  "unresolved-render-fragment": "error",
  "binding-failed":             "error",
  "routing-rejected":           "warning",
  "layer-isolation-gap":        "warning",
  "validation-fail":            "error",
};

const KIND_STAGE: Record<TelemetryEventKind, TelemetryEvent["pipelineStage"]> = {
  "decomposition-failed":       "B",
  "authority-mismatch":         "D",
  "missing-lineage":            "B",
  "broken-mask":                "B",
  "invalid-reconstruction":     "C",
  "hydration-drift":            "D",
  "overlay-desync":             "E",
  "stale-runtime-asset":        "D",
  "duplicate-ownership":        "D",
  "reconstruction-corruption":  "C",
  "generator-timeout":          "E",
  "unresolved-render-fragment": "E",
  "binding-failed":             "D",
  "routing-rejected":           "E",
  "layer-isolation-gap":        "B",
  "validation-fail":            "G",
};

export function recordEvent(
  kind: TelemetryEventKind,
  message: string,
  opts: {
    assetId?: string;
    sourceAssetId?: string;
    metadata?: Record<string, unknown>;
    severityOverride?: TelemetrySeverity;
    stageOverride?: TelemetryEvent["pipelineStage"];
  } = {}
): TelemetryEvent {
  purge();

  const eventId = `tel_${kind}_${++eventCounter}_${Date.now()}`;
  const event: TelemetryEvent = {
    eventId,
    kind,
    severity: opts.severityOverride ?? KIND_SEVERITY[kind],
    assetId: opts.assetId ?? null,
    sourceAssetId: opts.sourceAssetId ?? null,
    pipelineStage: opts.stageOverride ?? KIND_STAGE[kind],
    message,
    metadata: opts.metadata ?? {},
    resolvedAt: null,
    recordedAt: Date.now(),
  };

  eventLog.push(event);
  notify(event);
  return event;
}

export function resolveEvent(eventId: string): TelemetryEvent | null {
  const event = eventLog.find(e => e.eventId === eventId);
  if (!event) return null;
  event.resolvedAt = Date.now();
  return event;
}

export function resolveByAsset(assetId: string): number {
  let count = 0;
  for (const event of eventLog) {
    if (event.assetId === assetId && event.resolvedAt === null) {
      event.resolvedAt = Date.now();
      count++;
    }
  }
  return count;
}

export function getEvents(filter?: {
  kind?: TelemetryEventKind;
  severity?: TelemetrySeverity;
  stage?: TelemetryEvent["pipelineStage"];
  unresolved?: boolean;
  limit?: number;
}): TelemetryEvent[] {
  let results = [...eventLog];

  if (filter?.kind) results = results.filter(e => e.kind === filter.kind);
  if (filter?.severity) results = results.filter(e => e.severity === filter.severity);
  if (filter?.stage) results = results.filter(e => e.pipelineStage === filter.stage);
  if (filter?.unresolved) results = results.filter(e => e.resolvedAt === null);

  results.sort((a, b) => b.recordedAt - a.recordedAt);
  return filter?.limit ? results.slice(0, filter.limit) : results;
}

export function getCriticalEvents(): TelemetryEvent[] {
  return getEvents({ severity: "critical", unresolved: true });
}

export function getEventsByAsset(assetId: string): TelemetryEvent[] {
  return eventLog.filter(e => e.assetId === assetId || e.sourceAssetId === assetId);
}

export function getTelemetrySummary(): TelemetrySummary {
  const byKind: Partial<Record<TelemetryEventKind, number>> = {};
  const bySeverity: Record<TelemetrySeverity, number> = { info: 0, warning: 0, error: 0, critical: 0 };
  const byStage: Partial<Record<string, number>> = {};
  let unresolved = 0, criticalCount = 0;

  for (const e of eventLog) {
    byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
    bySeverity[e.severity]++;
    byStage[e.pipelineStage] = (byStage[e.pipelineStage] ?? 0) + 1;
    if (e.resolvedAt === null) unresolved++;
    if (e.severity === "critical") criticalCount++;
  }

  const now = Date.now();
  const recentErrors = eventLog
    .filter(e => e.severity === "error" || e.severity === "critical")
    .filter(e => now - e.recordedAt < RECENT_WINDOW_MS)
    .sort((a, b) => b.recordedAt - a.recordedAt)
    .slice(0, 20);

  return { total: eventLog.length, byKind, bySeverity, byStage, unresolved, criticalCount, recentErrors };
}

// Convenience emitters for each failure mode
export const tel = {
  decompositionFailed: (assetId: string, reason: string) =>
    recordEvent("decomposition-failed", reason, { assetId }),

  authorityMismatch: (assetId: string, expected: string, actual: string) =>
    recordEvent("authority-mismatch", `Expected ${expected}, got ${actual}`, { assetId, metadata: { expected, actual } }),

  missingLineage: (assetId: string) =>
    recordEvent("missing-lineage", `No lineage record for asset ${assetId}`, { assetId }),

  brokenMask: (assetId: string, artifactId: string) =>
    recordEvent("broken-mask", `Mask artifact ${artifactId} failed validation`, { assetId, metadata: { artifactId } }),

  invalidReconstruction: (assetId: string, reason: string) =>
    recordEvent("invalid-reconstruction", reason, { assetId }),

  hydrationDrift: (assetId: string, expected: string, actual: string) =>
    recordEvent("hydration-drift", `Expected ${expected}, got ${actual}`, { assetId, metadata: { expected, actual } }),

  overlayDesync: (assetId: string, target: string) =>
    recordEvent("overlay-desync", `Overlay ${assetId} desynced from ${target}`, { assetId, metadata: { target } }),

  staleAsset: (assetId: string, ageSec: number) =>
    recordEvent("stale-runtime-asset", `Asset stale for ${ageSec}s`, { assetId, metadata: { ageSec } }),

  duplicateOwnership: (assetId: string, owner1: string, owner2: string) =>
    recordEvent("duplicate-ownership", `Duplicate owners: ${owner1} vs ${owner2}`, { assetId, metadata: { owner1, owner2 } }),

  reconstructionCorruption: (assetId: string, nodeId: string) =>
    recordEvent("reconstruction-corruption", `Node ${nodeId} corrupt`, { assetId, metadata: { nodeId } }),

  generatorTimeout: (assetId: string, generator: string, elapsedMs: number) =>
    recordEvent("generator-timeout", `${generator} timed out after ${elapsedMs}ms`, { assetId, metadata: { generator, elapsedMs } }),

  unresolvedFragment: (assetId: string, fragmentId: string) =>
    recordEvent("unresolved-render-fragment", `Fragment ${fragmentId} unresolved`, { assetId, metadata: { fragmentId } }),

  bindingFailed: (nodeId: string, reason: string) =>
    recordEvent("binding-failed", reason, { metadata: { nodeId } }),

  routingRejected: (nodeId: string, target: string, reason: string) =>
    recordEvent("routing-rejected", `${nodeId}→${target}: ${reason}`, { metadata: { nodeId, target } }),

  layerGap: (sourceAssetId: string, category: string) =>
    recordEvent("layer-isolation-gap", `No layer isolated for category ${category}`, { sourceAssetId, metadata: { category } }),

  validationFail: (assetId: string, check: string) =>
    recordEvent("validation-fail", `Failed check: ${check}`, { assetId, metadata: { check } }),
};

export function subscribeToTelemetry(listener: TelemetryListener): () => void {
  telemetryListeners.add(listener);
  return () => telemetryListeners.delete(listener);
}
