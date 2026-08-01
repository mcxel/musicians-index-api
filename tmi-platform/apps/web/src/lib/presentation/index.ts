/**
 * Presentation Framework — television / production layer.
 *
 * Foundation (CERTIFIED): MonitorAnchorZones, ScreenSurfaceRegistry, LayerStack,
 * semantic events, ShowPackageDirector, Battle Presentation Pack v1.
 * Phase 5.1 (TESTING): director scaffolds, Cypher/Challenge packs, overlay library,
 * runtime compatibility matrix.
 */

export * from "./MonitorAnchorZones";
export * from "./LayerStack";
export * from "./ScreenSurfaceRegistry";
export * from "./PresentationEvents";
export * from "./ShowPackageDirector";
export * from "./ShowPackTypes";
export * from "./ShowPackCatalog";
export * from "./OverlayLibrary";
export * from "./RuntimeCompatibilityMatrix";
export * from "./packs/BattlePresentationPackV1";
export * from "./packs/CypherPresentationPackV1";
export * from "./packs/ChallengePresentationPackV1";
export * from "./directors";

export { default as PresentationDirector } from "./PresentationDirector";
export type {
  SpatialAnchorId,
  OverlayType,
  PresentationOverlay,
  CameraDirectorCommand,
} from "./PresentationDirector";

export { default as PresentationStateMachine } from "./PresentationStateMachine";
export type { PresentationState } from "./PresentationStateMachine";

export {
  PRESENTATION_PACKAGE_REGISTRY,
  type PresentationPackage,
  type TimelineAction,
} from "./PresentationPackageRegistry";

export { default as PresentationTimelineEngine } from "./PresentationTimelineEngine";
export { default as PresentationEventBridge } from "./PresentationEventBridge";
export { default as PresentationScheduler } from "./PresentationScheduler";

export {
  executeCurtainTransition,
  resolveCurtainAdCampaign,
  getCanonicalTimerSnapshot,
  addIntermissionTime,
  performPreflightResumeCheck,
  type CurtainState,
  type IntermissionType,
  type CurtainControlRequest,
  type CurtainRuntimeContext,
  type CurtainTransitionResult,
} from "./CurtainRuntimeManager";
