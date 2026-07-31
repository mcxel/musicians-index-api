/**
 * Phase 5.1 — Presentation Director Contracts & Shared Types.
 * Every director implements PresentationDirectorService and receives PresentationCommand envelopes.
 * Preserves full runtime isolation, safe-zones, telemetry, and cancellation capabilities.
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

export type CommandPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

export interface PresentationCommand<TPayload = unknown> {
  commandId: string;
  runtimeId: string;
  venueId?: string;
  packageId?: string;
  correlationId: string;
  director:
    | "CAMERA"
    | "OVERLAY"
    | "UNDERLAY"
    | "MOTION"
    | "LIGHTING"
    | "FX"
    | "SOUND"
    | "CROWD"
    | "BROADCAST"
    | "MONITOR"
    | "ACCESSIBILITY"
    | "TELEMETRY";
  action: string;
  payload: TPayload;
  priority: CommandPriority;
  requestedAt: string;
}

export interface DirectorValidationResult {
  valid: boolean;
  reason?: string;
  code?: string;
}

export interface UserAccessibilityProfile {
  reducedMotion: boolean;
  highContrast: boolean;
  closedCaptions: boolean;
  textScale: number;
  colorSafePalette: boolean;
  screenReaderEnabled: boolean;
}

export interface DeviceCapabilityProfile {
  tier: "low" | "medium" | "high" | "ultra";
  maxParticleEmitters: number;
  supportsWebGL2: boolean;
  supportsSpatialAudio: boolean;
  screenWidth: number;
  screenHeight: number;
  touchInput: boolean;
}

export interface PresentationContext {
  runtimeId: string;
  venueId?: string;
  accessibilityProfile?: UserAccessibilityProfile;
  deviceCapabilityProfile?: DeviceCapabilityProfile;
  activePackageId?: string;
  registeredAnchors: string[];
  registeredMonitorSurfaces: string[];
  cancellationSignal?: AbortSignal;
}

export interface PlacementIntent {
  directorId: DirectorId;
  at: number;
  anchorId?: MonitorAnchorZoneId;
  layer?: PresentationLayerId;
  surfaceId?: string;
  command?: string;
  caption?: string;
  meta?: Record<string, unknown>;
}

export interface DirectorSnapshot {
  directorId: DirectorId;
  status: "IDLE" | "ACTIVE" | "STUB" | "ERROR";
  lastIntent: PlacementIntent | null;
  activeCommandsCount?: number;
  notes?: string;
}

export interface PresentationDirectorService<
  TCommand extends PresentationCommand = PresentationCommand,
  TResult = void
> {
  readonly id: DirectorId;
  validate(command: TCommand): DirectorValidationResult;
  execute(command: TCommand, context: PresentationContext): Promise<TResult>;
  cancel(commandId: string, reason: string): Promise<void>;
  getSnapshot(runtimeId?: string): DirectorSnapshot;
  reset(runtimeId?: string): Promise<void>;
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
