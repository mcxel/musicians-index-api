/**
 * ACGBR — Autonomous Cinematic & Generative Broadcast Runtime
 *
 * Architecture contracts + Challenge-first operational bridge.
 * Generation does not write live truth. Live path = certified templates +
 * deterministic seeds + HOT fallbacks. Neural lip-sync / unconstrained AI = OUT OF SCOPE.
 */

export const ACGBR_MODULE_VERSION = "2026.09.02.1";

export {
  ACGBR_CONTRACT_VERSION,
  ACGBR_FORBIDDEN_CHALLENGE_WRITES,
  AcgbrBoundaryViolation,
  assertAcgbrCannotWriteChallengeTruth,
  listAcgbrForbiddenChallengeWrites,
} from "./contracts/AcgbrLaws";
export type {
  AcgbrForbiddenChallengeWrite,
  AcgbrPacingMode,
  GenerationFoundryMode,
  IntroPackageMode,
} from "./contracts/AcgbrLaws";

export type {
  ChallengeSnapshot,
  ChallengeSnapshotObjective,
  ChallengeSnapshotParticipant,
  ChallengeSnapshotResult,
} from "./contracts/ChallengeSnapshot";
export { freezeChallengeSnapshot } from "./contracts/ChallengeSnapshot";

export type {
  CinematicGravity,
  ExperienceCinematicProfile,
  ExperienceDnaKind,
} from "./contracts/ExperienceCinematicProfile";
export { CHALLENGE_CINEMATIC_PROFILE_ID } from "./contracts/ExperienceCinematicProfile";

export type {
  CanonicalSceneGraph,
  CanonicalSceneNode,
  CanonicalSceneNodeId,
  ResultSceneBranch,
} from "./contracts/CanonicalSceneGraph";
export { CANONICAL_RESULT_BRANCHES } from "./contracts/CanonicalSceneGraph";

export {
  CanonicalPresentationTimeline,
  computeSceneSeed,
  scaleDurationMs,
} from "./contracts/CanonicalPresentationTimeline";
export type {
  PresentationReconnectCheckpoint,
  TimelineTick,
} from "./contracts/CanonicalPresentationTimeline";

export {
  resolvePresentationCapabilities,
} from "./contracts/PresentationCapabilityResolver";
export type {
  DeviceTier,
  ResolvedPresentationCapability,
  ShowrunnerIntent,
  WorldCapabilityFlags,
} from "./contracts/PresentationCapabilityResolver";

export {
  buildChallengeDialogueFacts,
  dialogueHasHallucinatedStake,
} from "./contracts/ChallengeDialogueFacts";
export type { ChallengeDialogueFacts } from "./contracts/ChallengeDialogueFacts";

export {
  CHALLENGE_CERTIFIED_TEMPLATE_REGISTRY,
  NEURAL_GENERATION_UNAVAILABLE,
  resolveChallengeTemplate,
} from "./contracts/GenerationFoundryContracts";
export type {
  CertifiedProceduralTemplate,
  CertifiedProceduralTemplateId,
  NeuralGenerationSurfaceStub,
} from "./contracts/GenerationFoundryContracts";

export {
  ChallengeCinematicProfile,
  assertChallengeDnaNotBattle,
  assertChallengeDnaNotCypher,
  assertChallengeDnaNotGauntlet,
} from "./challenge/ChallengeCinematicProfile";

export {
  ChallengeSceneGraph,
  getChallengeSceneNode,
  resolveChallengeResultBranch,
} from "./challenge/ChallengeSceneGraph";

export {
  adaptChallengeResultForPresentation,
  resultFinalizedDoesNotImplyPayout,
} from "./challenge/ChallengeResultPresentationAdapter";
export type { ChallengeResultPresentationView } from "./challenge/ChallengeResultPresentationAdapter";

export {
  applyChallengeJumbotronFacePlan,
  assertFourDistinctFaceRoles,
  challengeFaceRoleAccent,
  planChallengeJumbotronFaces,
  resolveChallengeAcgbrFacePlanForMount,
  TMI_CHALLENGE_ACGBR_FACES_HOOK,
} from "./challenge/ChallengeJumbotronFacePlan";
export type {
  ChallengeAcgbrFacesHookHost,
  ChallengeFaceAssignment,
} from "./challenge/ChallengeJumbotronFacePlan";

export {
  ChallengeAcgbrBridge,
  readChallengeSnapshot,
} from "./challenge/ChallengeAcgbrBridge";
export type { ChallengeAcgbrRuntimeState } from "./challenge/ChallengeAcgbrBridge";
