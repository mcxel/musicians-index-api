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

export {
  WORLD_ENVELOPE_LAW,
  WORLD_COORDINATE_AUTHORITY,
  buildWorldAnchorsFromSpatial,
  proveOverheadEnvelope,
} from "@/lib/world/WorldEnvelopeContract";
export {
  WORLD_CAMERA_FABRIC,
  switchWorldCamera,
  firstThirdPersonPreservesSession,
} from "@/lib/world/WorldCameraFabric";
export {
  DEFAULT_WORLD_GROUNDING,
  buildIndoorCollisionSet,
  buildOutdoorCollisionSet,
} from "@/lib/world/WorldCollisionFabric";
export {
  WORLD_ADAPTATION_OWNER,
  buildWorldAdaptationLedger,
  summarizeWorldAdaptationLedger,
  harvestWorldAdaptationCounts,
  assembleIndoorWorld,
  assembleOutdoorWorld,
  degradeWorldForDevice,
  venueSkinChangePreservesSession,
  emptySeatsDoNotCreatePeople,
  bindSeatAvatarSameRig,
  classifyHarvestCandidate,
} from "@/lib/world/WorldAdaptationRegistry";

export {
  HARVEST_WORLD_PACKAGE_OWNER,
  runHarvestDerivedWorldAssemblyPass,
  buildHarvestProgressLedger,
  summarizeHarvestProgressLedger,
  listHarvestAssembledWorldPackages,
  getHarvestAssembledWorldPackage,
  harvestAssemblyFlatImageIsNotWorld,
  harvestAssemblyCreatesSecondWorldRuntime,
  harvestAssemblyPhysicalGreen,
} from "@/lib/world/HarvestWorldPackageAssembly";

export {
  HARVEST_WORLD_RUNTIME_BINDING_OWNER,
  listHarvestWorldPresentationOptions,
  isHarvestWorldSelectionId,
  resolveHarvestWorldPackage,
  certifyHarvestWorldRuntimeBindings,
  applyHarvestSelectionToGeneratorSkin,
  certifyHarvestWorldRuntimeBindingSample,
  ensureHarvestWorldRoute,
  harvestRuntimeBindingCreatesSecondWorldRuntime,
  harvestRuntimeBindingPhysicalGreen,
  harvestRuntimeBindingSellableByDefault,
} from "@/lib/world/HarvestWorldRuntimeBinding";

export {
  HARVEST_PLAYABLE_SESSION_OWNER,
  listHarvestWorldSelectorOptions,
  harvestPlayableEnterHref,
  harvestPlayableSelectorHref,
  harvestPlayableReturnHref,
  startHarvestPlayableSession,
  enterHarvestPlayableWorld,
  seatAvatarInHarvestWorld,
  switchHarvestPlayableCamera,
  presentHarvestMediaSurfaces,
  navigateHarvestPlayableWorld,
  returnFromHarvestPlayableWorld,
  runHarvestPlayableInteractionLadder,
  getHarvestPlayableSession,
  harvestPlayableCreatesSecondWorldRuntime,
  harvestPlayablePhysicalGreen,
  harvestPlayableSellable,
} from "@/lib/world/HarvestWorldPlayableSession";
