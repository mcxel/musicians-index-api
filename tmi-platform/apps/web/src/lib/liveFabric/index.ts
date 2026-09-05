/**
 * liveFabric public barrel — foundation only; no legacy production imports.
 */

export { FABRIC_CONTRACT_VERSIONS, FOUNDATION_REQUIRED_VERSIONS } from "./contracts/ContractVersions";
export { SessionClock } from "./SessionClock";
export {
  LiveSessionKernel,
  LiveSessionTransitionError,
  VALID_TRANSITIONS,
} from "./LiveSessionKernel";
export { SessionMediaGraph } from "./SessionMediaGraph";
export { LiveFrameGraph } from "./LiveFrameGraph";
export { SurfaceComposer } from "./SurfaceComposer";
export { AdaptivePresentationDirector } from "./AdaptivePresentationDirector";
export {
  getExperiencePresentationContract,
  listExperiencePresentationContracts,
  certifySingleScreenForAllExperiences,
  ALL_CANONICAL_EXPERIENCE_TYPES,
  EXPERIENCE_CONTRACT_VERSION,
} from "./ExperiencePresentationContract";
export { LiveAudioDirector } from "./LiveAudioDirector";
export { LiveCapabilityPolicy } from "./LiveCapabilityPolicy";
export { LiveTransportRouter } from "./LiveTransportRouter";
export { LiveRecoveryDirector, RECOVERY_CODE_CATALOG } from "./LiveRecoveryDirector";
export { DeviceCapabilityDirector, MediaBudget, DEFAULT_MEDIA_BUDGET } from "./DeviceCapabilityDirector";
export { DistributionDirector } from "./DistributionDirector";
export { LiveFabricSimulationHarness } from "./LiveFabricSimulationHarness";
export { isObservatoryCommandAuthorized } from "./contracts/ObservatoryContracts";
export {
  DEFAULT_FAIL_CLOSED_RIGHTS,
  DEFAULT_PUBLIC_SOURCE_RIGHTS,
  DEFAULT_FAIL_CLOSED_PRIVACY,
  DEFAULT_PUBLIC_PRIVACY,
  isSourcePublishEligible,
} from "./contracts/MediaSourceContracts";
export type { CanonicalExperienceType } from "./contracts/ExperienceContracts";
export type { SessionReconcileResult } from "./contracts/LiveSessionContracts";
