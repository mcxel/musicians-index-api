/**
 * experiencePresentation — production presentation packs + venue world contracts.
 * Isolated scaffold (liveFabric pattern). Presentation composes upward on Regular GO LIVE
 * without minting a second LiveSession / WebRTC / player runtime.
 *
 * Laws: Cypher collaborative; Lounges/Performer Lobby = panels not avatars;
 * Battle VS vs Challenge contract; MNS ≠ Regular GO LIVE;
 * PresentationEventBus never fabricates crowds; green/debug ≠ experienceCert PASS.
 */

export const EXPERIENCE_PRESENTATION_MODULE_VERSION = "2026.09.02.3";

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
  FORBIDDEN_CONCERT_COMPOSITIONS,
  FORBIDDEN_DANCE_PARTY_COMPOSITIONS,
  FORBIDDEN_FAN_LOBBY_COMPOSITIONS,
  FORBIDDEN_GAME_SHOW_COMPOSITIONS,
  FORBIDDEN_LOUNGE_COMPOSITIONS,
  FORBIDDEN_MNS_COMPOSITIONS,
  FORBIDDEN_RELEASE_COMPOSITIONS,
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

export type {
  BattleProgramComposition,
  BattleCornerParticipant,
  BattleScoreboard,
} from "./composeBattleProgram";
export {
  PROGRAM_BATTLE_COMPOSITE,
  ISO_CORNER_A,
  ISO_CORNER_B,
  composeBattleProgram,
  getActiveBattleProgram,
  clearBattleProgram,
  isBattleProgramProductionSurface,
  hasRealDualOccupancy,
} from "./composeBattleProgram";

export type {
  ChallengeProgramComposition,
  ChallengeParticipant,
  ChallengeObjectiveSnapshot,
  ChallengeAuthorizedResult,
} from "./composeChallengeProgram";
export {
  PROGRAM_CHALLENGE_PRIMARY,
  ISO_CHALLENGER,
  ISO_CHALLENGED,
  ISO_CONTRACT_CARD,
  composeChallengeProgram,
  getActiveChallengeProgram,
  clearChallengeProgram,
  isChallengeProgramProductionSurface,
  isChallengeVsFree,
  mapChallengePhaseToComposition,
} from "./composeChallengeProgram";

export type {
  CypherProgramComposition,
  CypherCircleParticipant,
  CypherLifecyclePhase,
} from "./composeCypherProgram";
export {
  PROGRAM_CYPHER_FOCUS,
  ISO_ACTIVE_MIC,
  ISO_NEXT_UP,
  ISO_CIRCLE_WIDE,
  composeCypherProgram,
  getActiveCypherProgram,
  clearCypherProgram,
  isCypherProgramProductionSurface,
  isCypherVsFree,
  mapCypherPhaseToComposition,
} from "./composeCypherProgram";

export type {
  ConcertProgramComposition,
  ConcertHeadliner,
  ConcertSetlistTrack,
  ConcertScope,
  ConcertLifecyclePhase,
} from "./composeConcertProgram";
export {
  PROGRAM_CONCERT_STAGE,
  PROGRAM_WORLD_CONCERT,
  ISO_STAGE,
  ISO_AUDIENCE_WIDE,
  ISO_SETLIST,
  composeConcertProgram,
  getActiveConcertProgram,
  clearConcertProgram,
  isConcertProgramProductionSurface,
  isConcertVsFree,
  mapConcertPhaseToComposition,
} from "./composeConcertProgram";

export type {
  DancePartyProgramComposition,
  DancePartyDj,
  DancePartyTrack,
  DancePartyScope,
  DancePartyLifecyclePhase,
} from "./composeDancePartyProgram";
export {
  PROGRAM_WDP_COMPOSITE,
  ISO_DJ,
  ISO_DANCE_FLOOR,
  ISO_CROWD,
  ISO_TRACK_QUEUE,
  composeDancePartyProgram,
  getActiveDancePartyProgram,
  clearDancePartyProgram,
  isDancePartyProgramProductionSurface,
  isDancePartyVsFree,
  mapDancePartyPhaseToComposition,
} from "./composeDancePartyProgram";

export type {
  MondayNightStageProgramComposition,
  MondayNightStageHost,
  MondayNightStagePerformer,
  MondayNightStageScope,
  MondayNightStageLifecyclePhase,
} from "./composeMondayNightStageProgram";
export {
  PROGRAM_MNS_SHOW,
  ISO_HOST,
  ISO_FEATURED,
  ISO_WHOS_NEXT,
  ISO_AUDIENCE,
  ISO_SPONSOR,
  composeMondayNightStageProgram,
  getActiveMondayNightStageProgram,
  clearMondayNightStageProgram,
  isMondayNightStageProgramProductionSurface,
  isMondayNightStageVsFree,
  mapMondayNightStagePhaseToComposition,
} from "./composeMondayNightStageProgram";

export type {
  ReleaseProgramComposition,
  ReleaseArtist,
  ReleaseMedia,
  ReleaseMerchCta,
  ReleaseScope,
  ReleaseLifecyclePhase,
} from "./composeReleaseProgram";
export {
  PROGRAM_WORLD_RELEASE,
  PROGRAM_RELEASE_PREMIERE,
  ISO_PREMIERE,
  ISO_ARTIST,
  ISO_COUNTDOWN,
  ISO_MERCH,
  composeReleaseProgram,
  getActiveReleaseProgram,
  clearReleaseProgram,
  isReleaseProgramProductionSurface,
  isReleaseVsFree,
  mapReleasePhaseToComposition,
} from "./composeReleaseProgram";

export type {
  GameShowProgramComposition,
  GameShowHost,
  GameShowContestantSnapshot,
  GameShowBoardSnapshot,
  GameShowPrizeSnapshot,
  GameShowFormatId,
  GameShowScope,
  GameShowLifecyclePhase,
} from "./composeGameShowProgram";
export {
  PROGRAM_GAME_SHOW,
  ISO_GAME_HOST,
  ISO_GAME_CONTESTANT,
  ISO_GAME_BOARD,
  ISO_GAME_AUDIENCE,
  ISO_GAME_PRIZE,
  composeGameShowProgram,
  getActiveGameShowProgram,
  clearGameShowProgram,
  isGameShowProgramProductionSurface,
  isGameShowVsFree,
  mapGameShowPhaseToComposition,
} from "./composeGameShowProgram";

export type {
  FanLobbyProgramComposition,
  FanLobbyHostSnapshot,
  FanLobbyLifecyclePhase,
} from "./composeFanLobbyProgram";
export {
  PROGRAM_FAN_LOBBY,
  ISO_SELF_AVATAR,
  ISO_FRIENDS,
  ISO_LOBBY_WALL,
  ISO_LOBBY_PLAYLIST,
  composeFanLobbyProgram,
  getActiveFanLobbyProgram,
  clearFanLobbyProgram,
  isFanLobbyProgramProductionSurface,
  isFanLobbyVsFree,
  mapFanLobbyPhaseToComposition,
} from "./composeFanLobbyProgram";

export type {
  LoungeProgramComposition,
  LoungeMode,
  LoungeLifecyclePhase,
} from "./composeLoungeProgram";
export {
  PROGRAM_LOUNGE,
  PROGRAM_PLAYLIST_LOUNGE,
  ISO_SELF_PANEL,
  ISO_ROOM_WIDE,
  ISO_LOUNGE_PLAYLIST,
  composeLoungeProgram,
  getActiveLoungeProgram,
  clearLoungeProgram,
  isLoungeProgramProductionSurface,
  isLoungeVsFree,
  mapLoungePhaseToComposition,
} from "./composeLoungeProgram";

export {
  PerformerLivePack,
  BattlePack,
  ChallengePack,
  CypherPack,
  ConcertPack,
  WorldConcertPack,
  WorldReleasePack,
  DancePartyPack,
  MondayNightStagePack,
  GameShowPack,
  LoungePack,
  FanLivePack,
} from "./packs";
