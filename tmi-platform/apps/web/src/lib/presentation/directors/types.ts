/**
 * Shared director types — placement intents + telemetry stubs.
 * Directors resolve package → intents. No fake VFX execution.
 */

import type { MonitorAnchorZoneId } from "../MonitorAnchorZones";
import type { PresentationLayerId } from "../LayerStack";
import type { ActiveShowPackageSnapshot } from "../ShowPackageDirector";

export type DirectorId =
  | "camera"
  | "overlay"
  | "underlay"
  | "motion"
  | "lighting"
  | "fx"
  | "sound"
  | "crowd"
  | "broadcast"
  | "monitor"
  | "accessibility"
  | "telemetry";

export interface PlacementIntent {
  directorId: DirectorId;
  at: number;
  anchorId?: MonitorAnchorZoneId;
  layer?: PresentationLayerId;
  surfaceId?: string;
  command?: string;
  caption?: string;
  /** Opaque meta — never invent scores */
  meta?: Record<string, unknown>;
}

export interface DirectorSnapshot {
  directorId: DirectorId;
  status: "IDLE" | "ACTIVE" | "STUB";
  lastIntent: PlacementIntent | null;
  notes?: string;
}

export type ShowPackageListener = (snapshot: ActiveShowPackageSnapshot) => void;

export function emitPlacementIntent(intent: PlacementIntent): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("tmi:presentation:placement_intent", { detail: intent })
    );
  } catch {
    /* SSR */
  }
}
