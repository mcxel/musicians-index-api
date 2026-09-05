export {
  WorldDirector,
  buildWorldScenePlan,
  type LiveSessionWorldContext,
} from "@/lib/world/AutonomousWorldDirector";
export {
  WORLD_DIRECTOR_CERT_STATUS,
  WORLD_DIRECTOR_GAPS,
  worldScenePlanToRenderProps,
  canonicalizeWorldViewMode,
  type WorldScenePlan,
  type WorldSceneRenderProps,
  type WorldDirectorCertStatus,
  type WorldScenePlanSource,
  type WorldViewMode,
  type WorldViewModeCanonical,
  type VenueSpatialMap,
  type SpatialZoneFt,
  type SpatialRectFt,
} from "@/lib/world/WorldScenePlan";
export {
  WORLD_GENERATOR_REGISTRY,
  runViewModeGenerator,
  runSpatialMapGenerator,
  type WorldGeneratorId,
  type WorldGeneratorContext,
} from "@/lib/world/WorldGeneratorRegistry";
export { useWorldScenePlanStore } from "@/lib/world/worldScenePlanStore";
/** Game Runtime Constitution — device quality + budgets (InteractionCommandBus stays under lib/runtime). */
export {
  GAME_RUNTIME_CORE_LAW,
  GAME_RUNTIME_SYSTEM_REGISTRY,
  GAME_RUNTIME_PERFORMANCE_BUDGETS,
  summarizeGameRuntimeStatuses,
  type DeviceQualityTier,
  type DegradedMode,
} from "@/lib/runtime/GameRuntimeConstitution";
export {
  resolveDeviceQuality,
  getDeviceQualityTier,
  getLodPolicyHint,
} from "@/lib/runtime/DeviceQualityGovernor";
