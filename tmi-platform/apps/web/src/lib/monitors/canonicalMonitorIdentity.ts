/**
 * Canonical logical monitor identity — Phase 1.
 *
 * WORKSPACE → LOGICAL MONITOR (M1–M8) → COMPOSITION → INTERNAL CELL (1–8) → RESOURCE
 *
 * MonitorSplitMode in CanonicalDualMonitorStack is cell geometry inside one monitor.
 * It is a different namespace. M8 is not cell 8. M1 may still split into 8 cells.
 *
 * Glass still mounts M1 and M2. M3–M8 are addresses only.
 * This file is not a monitor manager and does not render bezels.
 */

export const CANONICAL_MONITOR_IDS = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"] as const;

export type CanonicalMonitorId = (typeof CANONICAL_MONITOR_IDS)[number];

/** Phase 1 presented pair. Not the address-space capacity. */
export const DEFAULT_RENDERED_MONITORS = ["M1", "M2"] as const;

export const SUPPORTED_RUNTIME_MONITORS = DEFAULT_RENDERED_MONITORS;

export type Phase1PresentedMonitorId = (typeof DEFAULT_RENDERED_MONITORS)[number];

export const CANONICAL_MONITOR_CAPACITY = CANONICAL_MONITOR_IDS.length;

/** Cell split capacity inside one monitor. Independent of CANONICAL_MONITOR_CAPACITY. */
export const INTERNAL_CELL_SPLIT_CAPACITY = 8 as const;

export type InternalCellSplit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const CELL_SPLITS: readonly InternalCellSplit[] = [1, 2, 3, 4, 5, 6, 7, 8];

export function isCanonicalMonitorId(value: unknown): value is CanonicalMonitorId {
  return typeof value === "string" && (CANONICAL_MONITOR_IDS as readonly string[]).includes(value);
}

export function isPhase1PresentedMonitor(id: CanonicalMonitorId): id is Phase1PresentedMonitorId {
  return (SUPPORTED_RUNTIME_MONITORS as readonly string[]).includes(id);
}

/** M3–M8 stay addressable and are refused for presentation. */
export function presentedMonitorOrRefuse(id: CanonicalMonitorId): Phase1PresentedMonitorId | null {
  return isPhase1PresentedMonitor(id) ? id : null;
}

export function isInternalCellSplit(value: unknown): value is InternalCellSplit {
  return typeof value === "number" && (CELL_SPLITS as readonly number[]).includes(value);
}

/**
 * A logical monitor may host the existing 1–8 cell engine.
 * The cell number is not a monitor id.
 */
export function monitorMayHostCellSplit(monitorId: CanonicalMonitorId, split: InternalCellSplit): boolean {
  return isCanonicalMonitorId(monitorId) && isInternalCellSplit(split);
}

export type LegacyMixMonitorToken = "MONITOR_1" | "MONITOR_2";
export type LegacyMediaViewportToken = "A" | "B";
export type LegacyChromeMonitorToken = "mon-a" | "mon-b";
export type LegacyBezelIndex = 0 | 1;

export function canonicalMonitorFromMixMonitor(id: LegacyMixMonitorToken): Phase1PresentedMonitorId {
  return id === "MONITOR_1" ? "M1" : "M2";
}

export function mixMonitorFromCanonical(id: CanonicalMonitorId): LegacyMixMonitorToken | null {
  if (id === "M1") return "MONITOR_1";
  if (id === "M2") return "MONITOR_2";
  return null;
}

export function canonicalMonitorFromMediaViewport(id: LegacyMediaViewportToken): Phase1PresentedMonitorId {
  return id === "A" ? "M1" : "M2";
}

export function canonicalMonitorFromChromeId(id: LegacyChromeMonitorToken): Phase1PresentedMonitorId {
  return id === "mon-a" ? "M1" : "M2";
}

/** Bezel slot 0/1 only. A bare string "0" or "1" is not this adapter. */
export function canonicalMonitorFromBezelIndex(index: LegacyBezelIndex): Phase1PresentedMonitorId {
  return index === 0 ? "M1" : "M2";
}

/**
 * Explicit workspace-monitor aliases.
 * "primary" / "secondary" and numeric strings are not monitors.
 * Bezel indexes go through canonicalMonitorFromBezelIndex.
 */
const WORKSPACE_MONITOR_ALIASES: Record<string, Phase1PresentedMonitorId> = {
  MONITOR_1: "M1",
  MONITOR_2: "M2",
  A: "M1",
  B: "M2",
  "mon-a": "M1",
  "mon-b": "M2",
};

export function canonicalMonitorFromWorkspaceAlias(token: string): Phase1PresentedMonitorId | null {
  if (token === "primary" || token === "secondary" || token === "0" || token === "1") return null;
  return WORKSPACE_MONITOR_ALIASES[token] ?? null;
}
