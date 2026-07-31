/**
 * Presentation Framework — television / production layer (certifiable foundation).
 *
 * Reuses spatial PresentationDirector + BroadcastDirectorEngine for camera profiles.
 * New this pass: MonitorAnchorZones, ScreenSurfaceRegistry, LayerStack,
 * semantic events, ShowPackageDirector, Battle Presentation Pack v1.
 */

export * from "./MonitorAnchorZones";
export * from "./LayerStack";
export * from "./ScreenSurfaceRegistry";
export * from "./PresentationEvents";
export * from "./ShowPackageDirector";
export * from "./packs/BattlePresentationPackV1";

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
