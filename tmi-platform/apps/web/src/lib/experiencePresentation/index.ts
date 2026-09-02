/**
 * experiencePresentation — production presentation packs + venue world contracts.
 * Isolated scaffold (liveFabric pattern). Presentation composes upward on Regular GO LIVE
 * without minting a second LiveSession / WebRTC / player runtime.
 *
 * Laws: Cypher collaborative; Lounges/Performer Lobby = panels not avatars;
 * Battle VS vs Challenge contract; MNS ≠ Regular GO LIVE;
 * PresentationEventBus never fabricates crowds; green/debug ≠ experienceCert PASS.
 */

export const EXPERIENCE_PRESENTATION_MODULE_VERSION = "2026.09.02.1";

export type {
  PresenceModel,
  ExperiencePackId,
  BroadcastCompositionLayout,
  PresentationPrimitiveKind,
  RouteCapabilityContract,
  CertLaneStatus,
  ExperienceCertEvidence,
} from "./types";

export {
  FORBIDDEN_CYPHER_COMPOSITIONS,
  VS_COMPOSITIONS,
  OBJECTIVE_COMPOSITIONS,
} from "./types";

export type { ExperiencePresentationPack, ExperiencePresentationDirector } from "./ExperiencePresentationDirector";
export {
  getPresentationPack,
  listPresentationPacks,
  assertPackAllowsComposition,
  createPresentationDirector,
} from "./ExperiencePresentationDirector";

export type {
  AuthoritativeDomainEventType,
  PresentationSpectacleEvent,
  FabricatedCrowdEvent,
} from "./PresentationEventBus";
export { PresentationEventBus, isFabricatedCrowdEvent } from "./PresentationEventBus";

export type {
  ExperienceSourceKind,
  ExperienceSourceRecord,
  ExperienceDisplayTarget,
} from "./ExperienceSourceRegistry";
export { ExperienceSourceRegistry } from "./ExperienceSourceRegistry";

export type { ParticipantQueueDirector, QueueParticipant } from "./ParticipantQueueDirector";
export { createParticipantQueueDirector } from "./ParticipantQueueDirector";

export type {
  GameShowEngine,
  GameShowContestant,
  GameShowRound,
  GameShowTurn,
  PrizeLedgerEntry,
} from "./GameShowEngine";
export { createGameShowEngineStub } from "./GameShowEngine";

export type {
  WorldInteractableKind,
  WorldInteractable,
  WorldInteractionRegistry,
} from "./WorldInteractionRegistry";
export { createWorldInteractionRegistry } from "./WorldInteractionRegistry";

export type { VenueOccupant, VenueOccupancyDirector } from "./VenueOccupancyDirector";
export { createVenueOccupancyDirector, assertNoFakeOccupancy } from "./VenueOccupancyDirector";

export {
  canMarkExperienceCertPass,
  isGreenOrDebugSurface,
} from "./CertificationGuards";

export type { PerformerLiveProgramComposition } from "./composePerformerLiveProgram";
export {
  PROGRAM_PERFORMER_CAMERA,
  FABRIC_PERFORMER_CAM,
  composePerformerLiveProgram,
  getActivePerformerLiveProgram,
  clearPerformerLiveProgram,
  isPerformerLiveProgramProductionSurface,
} from "./composePerformerLiveProgram";

export { PerformerLivePack } from "./packs";
