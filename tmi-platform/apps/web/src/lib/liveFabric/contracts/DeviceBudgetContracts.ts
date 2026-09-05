/**
 * DeviceBudgetContracts.ts — Device Capabilities & Media Resource Budgets
 *
 * Law 11
 */

export interface DeviceCapabilityProfile {
  cameraCount: number;
  micCount: number;
  supportsScreenShare: boolean;
  gpuTier: "LOW" | "MEDIUM" | "HIGH";
  displayCount: number;
  isTouch: boolean;
  hasController: boolean;
  supportsPiP: boolean;
  supportsCast: boolean;
  bandwidthTier: "LOW" | "MEDIUM" | "HIGH";
  memoryPressureTier: "NORMAL" | "MODERATE" | "CRITICAL";
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface MediaBudget {
  maxVideoDecoders: number;
  maxLiveSources: number;
  maxRenderedAvatars: number;
  maxVenueLOD: "LOW" | "MEDIUM" | "HIGH";
  maxOverlayComplexity: "MINIMAL" | "STANDARD" | "RICH";
  maxResolution: "720p" | "1080p" | "4k";
  maxFPS: 30 | 60;
  allowVoltron3D: boolean;
}

export function computeMediaBudget(profile: DeviceCapabilityProfile): MediaBudget {
  if (profile.gpuTier === "LOW" || profile.memoryPressureTier === "CRITICAL" || profile.bandwidthTier === "LOW") {
    return {
      maxVideoDecoders: 2,
      maxLiveSources: 4,
      maxRenderedAvatars: 10,
      maxVenueLOD: "LOW",
      maxOverlayComplexity: "MINIMAL",
      maxResolution: "720p",
      maxFPS: 30,
      allowVoltron3D: false,
    };
  }

  if (profile.gpuTier === "MEDIUM" || profile.memoryPressureTier === "MODERATE" || profile.bandwidthTier === "MEDIUM") {
    return {
      maxVideoDecoders: 4,
      maxLiveSources: 8,
      maxRenderedAvatars: 50,
      maxVenueLOD: "MEDIUM",
      maxOverlayComplexity: "STANDARD",
      maxResolution: "1080p",
      maxFPS: 30,
      allowVoltron3D: true,
    };
  }

  return {
    maxVideoDecoders: 8,
    maxLiveSources: 16,
    maxRenderedAvatars: 200,
    maxVenueLOD: "HIGH",
    maxOverlayComplexity: "RICH",
    maxResolution: "1080p",
    maxFPS: 60,
    allowVoltron3D: true,
  };
}
