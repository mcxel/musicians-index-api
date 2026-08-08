/**
 * TMI Adaptive World Runtime (AWR) — presentation-cost platform layer.
 */

export type {
  AwrQualityContractId,
  DeviceCapabilitySnapshot,
  ExperienceQualityTier,
  PerformanceGovernorSnapshot,
  RenderHealthSnapshot,
} from "./types";

export {
  LIVE_LOBBY_WALL_CONTRACT_ID,
  LIVE_LOBBY_WALL_NON_DEGRADABLE_P0,
} from "./qualityContracts/LIVE_LOBBY_WALL";

export { profileDeviceCapability } from "./DeviceCapabilityProfiler";
export { getPerformanceGovernorSnapshot } from "./PerformanceGovernor";
export {
  getWebRTCSubscriptionGovernor,
  type WebRtcTilePolicy,
} from "./WebRTCSubscriptionGovernor";
export {
  getAdaptiveWorldRuntime,
  getTMIAdaptiveExperienceRuntime,
  TMIAdaptiveExperienceRuntime,
} from "./TMIAdaptiveExperienceRuntime";
export { useAdaptiveWorldRuntime } from "./useAdaptiveWorldRuntime";
export { getRenderHealthSnapshot, registerAwrConsumer } from "./RuntimeTelemetry";
export {
  getGovernedIdleFallbackPolicy,
  mayDecodeLobbyPreviewUrl,
  type GovernedIdleFallbackPolicy,
} from "./IdleFallbackGovernor";

/** Module map placeholders — inherit presentation tier until dedicated engines land. */
export { getPerformanceGovernorSnapshot as getAvatarRenderGovernorHint } from "./PerformanceGovernor";
export { getPerformanceGovernorSnapshot as getMonitorRenderGovernorHint } from "./PerformanceGovernor";
