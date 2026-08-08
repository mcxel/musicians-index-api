/**
 * TMI Adaptive World Runtime (AWR) — shared types.
 * Governs presentation cost only; never authoritative platform truth.
 */

export type AwrQualityContractId = "LIVE_LOBBY_WALL";

export type ExperienceQualityTier = "minimal" | "economy" | "balanced" | "rich";

export type DevicePresentationTier = "low" | "medium" | "high";

export interface DeviceCapabilitySnapshot {
  tier: DevicePresentationTier;
  hardwareConcurrency: number;
  /** null when unavailable (Safari / privacy). */
  deviceMemoryGb: number | null;
  prefersReducedMotion: boolean;
  screenWidth: number;
  screenHeight: number;
  measuredAt: number;
}

export interface FrameBudgetSample {
  deltaMs: number;
  timestamp: number;
}

export interface PerformanceGovernorSnapshot {
  presentationTier: ExperienceQualityTier;
  stressScore: number;
  /** null until FrameBudgetScheduler has real samples (Rule 20). */
  estimatedFps: number | null;
  averageFrameMs: number | null;
  sampleCount: number;
}

export interface RenderHealthSnapshot {
  contractId: AwrQualityContractId;
  /** idle = no consumer mounted; collecting = warming; ready = has samples */
  telemetryState: "idle" | "collecting" | "ready";
  estimatedFps: number | null;
  averageFrameMs: number | null;
  presentationTier: ExperienceQualityTier;
  deviceTier: DevicePresentationTier;
  notes: string;
}
