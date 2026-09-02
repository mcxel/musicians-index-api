/**
 * Presentation pack stubs — DNA enums + semantic flags.
 */

import type { ExperiencePresentationPack } from "../ExperiencePresentationDirector";
import type { ExperiencePackId } from "../types";

function baseRoute(
  experienceKey: string,
  packId: ExperiencePackId,
  routes: string[],
  presence: ExperiencePresentationPack["presenceModel"],
  opts: Partial<ExperiencePresentationPack["routeCapability"]> = {}
): ExperiencePresentationPack["routeCapability"] {
  return {
    experienceKey,
    routes,
    packId,
    presenceModel: presence,
    requiresUniversalPlayer: true,
    requiresJumbotron: false,
    requiresQueue: false,
    requiresGameEngine: false,
    logicCert: "PARTIAL",
    architectureCert: "PARTIAL",
    experienceCert: "OPEN",
    blockExperienceCertOnDebugSurface: true,
    ...opts,
  };
}

export const BattlePack: ExperiencePresentationPack = {
  packId: "Battle",
  signatureDna: "VS corners A/B — adversarial symmetry, score, winner from engine",
  presenceModel: "STAGE_LIVE_PLUS_AVATAR_AUDIENCE",
  allowedCompositions: ["DUAL", "A_DOMINANT", "B_DOMINANT", "PIP", "SPLIT"],
  forbiddenCompositions: ["OBJECTIVE_FOCUS", "CIRCLE_FOCUS", "GAME_BOARD"],
  requiredPrimitives: ["LiveVideoPanel", "IdentityPanel", "EnergyArc", "ScoreCard", "TimerRing"],
  optionalPrimitives: ["ReactionEmitter", "LowerThird", "QueueRail"],
  allowsVsLayout: true,
  allowsWinnerFinale: true,
  allowsEliminationFinale: true,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("battle", "Battle", ["/battles", "/battles/arena"], "STAGE_LIVE_PLUS_AVATAR_AUDIENCE", {
    requiresJumbotron: true,
    requiresQueue: true,
  }),
};

export const ChallengePack: ExperiencePresentationPack = {
  packId: "Challenge",
  signatureDna: "Contract/objective central — not corner VS",
  presenceModel: "STAGE_LIVE_PLUS_AVATAR_AUDIENCE",
  allowedCompositions: ["OBJECTIVE_FOCUS", "HOST_CLOSE", "PIP", "SPLIT"],
  forbiddenCompositions: ["DUAL", "A_DOMINANT", "B_DOMINANT", "CIRCLE_FOCUS"],
  requiredPrimitives: ["LiveVideoPanel", "ChallengeContract", "TimerRing", "ResultCard"],
  optionalPrimitives: ["IdentityPanel", "ReactionEmitter", "QueueRail"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: true,
  isRegularGoLive: false,
  routeCapability: baseRoute("challenge", "Challenge", ["/challenges"], "STAGE_LIVE_PLUS_AVATAR_AUDIENCE", {
    requiresQueue: true,
  }),
};

export const CypherPack: ExperiencePresentationPack = {
  packId: "Cypher",
  signatureDna: "Collaborative circle + mic handoff — NO VS/winner/elimination",
  presenceModel: "STAGE_LIVE_PLUS_AVATAR_AUDIENCE",
  allowedCompositions: ["CIRCLE_FOCUS", "HOST_CLOSE", "PIP"],
  forbiddenCompositions: ["DUAL", "A_DOMINANT", "B_DOMINANT", "OBJECTIVE_FOCUS", "GAME_BOARD"],
  requiredPrimitives: ["LiveVideoPanel", "CypherCircle", "MicHandoff", "IdentityPanel"],
  optionalPrimitives: ["EnergyArc", "ReactionEmitter", "AudioVisualizer", "QueueRail"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("cypher", "Cypher", ["/cypher"], "STAGE_LIVE_PLUS_AVATAR_AUDIENCE", {
    requiresJumbotron: true,
    requiresQueue: true,
  }),
};

export const GauntletPack: ExperiencePresentationPack = {
  packId: "Gauntlet",
  signatureDna: "Sequential trials + progress — elimination only if engine authorizes",
  presenceModel: "STAGE_LIVE_PLUS_AVATAR_AUDIENCE",
  allowedCompositions: ["OBJECTIVE_FOCUS", "A_DOMINANT", "SPLIT", "PIP"],
  forbiddenCompositions: ["CIRCLE_FOCUS", "GAME_BOARD"],
  requiredPrimitives: ["LiveVideoPanel", "TimerRing", "ResultCard", "QueueRail"],
  optionalPrimitives: ["ScoreCard", "EnergyArc", "IdentityPanel"],
  allowsVsLayout: true,
  allowsWinnerFinale: true,
  allowsEliminationFinale: true,
  prefersChallengeContract: true,
  isRegularGoLive: false,
  routeCapability: baseRoute("gauntlet", "Gauntlet", ["/gauntlet"], "STAGE_LIVE_PLUS_AVATAR_AUDIENCE", {
    requiresQueue: true,
    logicCert: "OPEN",
    architectureCert: "OPEN",
  }),
};

export const LiveCollaborationPack: ExperiencePresentationPack = {
  packId: "LiveCollaboration",
  signatureDna: "Multi-guest collab — no winner",
  presenceModel: "MIXED_SOCIAL",
  allowedCompositions: ["SPLIT", "PIP", "HOST_CLOSE", "DUAL"],
  forbiddenCompositions: ["GAME_BOARD", "OBJECTIVE_FOCUS"],
  requiredPrimitives: ["LiveVideoPanel", "IdentityPanel"],
  optionalPrimitives: ["MicHandoff", "AudioVisualizer", "ReactionEmitter"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("live_collab", "LiveCollaboration", ["/live/collab"], "MIXED_SOCIAL"),
};

export const ConcertPack: ExperiencePresentationPack = {
  packId: "Concert",
  signatureDna: "Mini concert — stage-forward + commerce",
  presenceModel: "STAGE_LIVE_PLUS_AVATAR_AUDIENCE",
  allowedCompositions: ["STAGE_WIDE", "HOST_CLOSE", "PIP"],
  forbiddenCompositions: ["DUAL", "GAME_BOARD", "CIRCLE_FOCUS"],
  requiredPrimitives: ["LiveVideoPanel", "IdentityPanel", "LowerThird"],
  optionalPrimitives: ["QueueRail", "ReactionEmitter", "AudioVisualizer"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("concert", "Concert", ["/concerts/mini"], "STAGE_LIVE_PLUS_AVATAR_AUDIENCE", {
    logicCert: "OPEN",
    architectureCert: "OPEN",
  }),
};

export const WorldConcertPack: ExperiencePresentationPack = {
  packId: "WorldConcert",
  signatureDna: "World concert — producer-directed multi-cam stadium",
  presenceModel: "STAGE_LIVE_PLUS_AVATAR_AUDIENCE",
  allowedCompositions: ["STAGE_WIDE", "HOST_CLOSE", "PIP", "SPLIT"],
  forbiddenCompositions: ["CIRCLE_FOCUS", "GAME_BOARD"],
  requiredPrimitives: ["LiveVideoPanel", "IdentityPanel", "LowerThird", "ReactionEmitter"],
  optionalPrimitives: ["QueueRail", "AudioVisualizer"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("world_concert", "WorldConcert", ["/concerts/world"], "STAGE_LIVE_PLUS_AVATAR_AUDIENCE", {
    requiresJumbotron: true,
    architectureCert: "OPEN",
  }),
};

export const WorldReleasePack: ExperiencePresentationPack = {
  packId: "WorldRelease",
  signatureDna: "Premiere drop + countdown",
  presenceModel: "GRID_TILES",
  allowedCompositions: ["STAGE_WIDE", "HOST_CLOSE", "PIP"],
  forbiddenCompositions: ["DUAL", "CIRCLE_FOCUS", "GAME_BOARD"],
  requiredPrimitives: ["LiveVideoPanel", "TimerRing", "IdentityPanel"],
  optionalPrimitives: ["LowerThird", "ReactionEmitter"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("world_release", "WorldRelease", ["/releases/world"], "GRID_TILES", {
    logicCert: "OPEN",
    architectureCert: "OPEN",
  }),
};

export const DancePartyPack: ExperiencePresentationPack = {
  packId: "DanceParty",
  signatureDna: "DJ + dance floor — fan avatars authorized",
  presenceModel: "FAN_AVATARS",
  allowedCompositions: ["FLOOR_WIDE", "HOST_CLOSE", "PIP", "SPLIT"],
  forbiddenCompositions: ["OBJECTIVE_FOCUS", "GAME_BOARD"],
  requiredPrimitives: ["LiveVideoPanel", "AudioVisualizer", "ReactionEmitter"],
  optionalPrimitives: ["IdentityPanel", "LowerThird", "QueueRail"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("world_dance_party", "DanceParty", ["/dance/world"], "FAN_AVATARS"),
};

export const LoungePack: ExperiencePresentationPack = {
  packId: "Lounge",
  signatureDna: "WebRTC free-roam panels — NO avatars",
  presenceModel: "WEBRTC_PANELS",
  allowedCompositions: ["HOST_CLOSE", "PIP", "SPLIT"],
  forbiddenCompositions: ["DUAL", "GAME_BOARD", "FLOOR_WIDE"],
  requiredPrimitives: ["LiveVideoPanel", "IdentityPanel"],
  optionalPrimitives: ["AudioVisualizer", "QueueRail"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("lounge", "Lounge", ["/lounges"], "WEBRTC_PANELS", {
    requiresUniversalPlayer: false,
  }),
};

export const MondayNightStagePack: ExperiencePresentationPack = {
  packId: "MondayNightStage",
  signatureDna: "Flagship broadcast show — NOT Regular GO LIVE",
  presenceModel: "STAGE_LIVE_PLUS_AVATAR_AUDIENCE",
  allowedCompositions: ["HOST_CLOSE", "STAGE_WIDE", "PIP", "SPLIT"],
  forbiddenCompositions: ["CIRCLE_FOCUS"],
  requiredPrimitives: ["LiveVideoPanel", "IdentityPanel", "LowerThird", "QueueRail"],
  optionalPrimitives: ["TimerRing", "ReactionEmitter", "GameBoard"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("monday_night_stage", "MondayNightStage", ["/monday-night-stage"], "STAGE_LIVE_PLUS_AVATAR_AUDIENCE", {
    requiresJumbotron: true,
    requiresQueue: true,
    architectureCert: "OPEN",
  }),
};

export const GameShowPack: ExperiencePresentationPack = {
  packId: "GameShow",
  signatureDna: "Host + board + turn + prize ledger (Deal or Feud class)",
  presenceModel: "STAGE_LIVE_PLUS_AVATAR_AUDIENCE",
  allowedCompositions: ["GAME_BOARD", "HOST_CLOSE", "SPLIT", "PIP"],
  forbiddenCompositions: ["CIRCLE_FOCUS", "FLOOR_WIDE"],
  requiredPrimitives: ["LiveVideoPanel", "GameBoard", "TimerRing", "PrizeLedgerView", "IdentityPanel"],
  optionalPrimitives: ["QueueRail", "ReactionEmitter", "ScoreCard"],
  allowsVsLayout: false,
  allowsWinnerFinale: true,
  allowsEliminationFinale: true,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("game_show", "GameShow", ["/game-shows/deal-or-feud"], "STAGE_LIVE_PLUS_AVATAR_AUDIENCE", {
    requiresGameEngine: true,
    requiresQueue: true,
    logicCert: "OPEN",
    architectureCert: "OPEN",
  }),
};

export const FanLivePack: ExperiencePresentationPack = {
  packId: "FanLive",
  signatureDna: "Social hangout gravity — not championship stage",
  presenceModel: "MIXED_SOCIAL",
  allowedCompositions: ["PIP", "SPLIT", "HOST_CLOSE"],
  forbiddenCompositions: ["GAME_BOARD", "OBJECTIVE_FOCUS", "DUAL"],
  requiredPrimitives: ["LiveVideoPanel", "IdentityPanel"],
  optionalPrimitives: ["ReactionEmitter", "AudioVisualizer"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: false,
  routeCapability: baseRoute("fan_live", "FanLive", ["/hub/fan"], "MIXED_SOCIAL"),
};

export const PerformerLivePack: ExperiencePresentationPack = {
  packId: "PerformerLive",
  signatureDna: "Regular GO LIVE host-first — canary path; ≠ Monday Night Stage",
  presenceModel: "STAGE_LIVE_PLUS_AVATAR_AUDIENCE",
  allowedCompositions: ["HOST_CLOSE", "STAGE_WIDE", "PIP"],
  forbiddenCompositions: ["GAME_BOARD", "CIRCLE_FOCUS", "DUAL"],
  requiredPrimitives: ["LiveVideoPanel", "IdentityPanel"],
  optionalPrimitives: ["LowerThird", "ReactionEmitter", "AudioVisualizer"],
  allowsVsLayout: false,
  allowsWinnerFinale: false,
  allowsEliminationFinale: false,
  prefersChallengeContract: false,
  isRegularGoLive: true,
  routeCapability: baseRoute("performer_live", "PerformerLive", ["/hub/performer"], "STAGE_LIVE_PLUS_AVATAR_AUDIENCE", {
    requiresJumbotron: true,
    logicCert: "PARTIAL",
    architectureCert: "DONE",
    // experienceCert stays OPEN until production physical cert (green/debug cannot PASS).
    experienceCert: "OPEN",
  }),
};

export const ALL_PACKS: Record<ExperiencePackId, ExperiencePresentationPack> = {
  Battle: BattlePack,
  Challenge: ChallengePack,
  Cypher: CypherPack,
  Gauntlet: GauntletPack,
  LiveCollaboration: LiveCollaborationPack,
  Concert: ConcertPack,
  WorldConcert: WorldConcertPack,
  WorldRelease: WorldReleasePack,
  DanceParty: DancePartyPack,
  Lounge: LoungePack,
  MondayNightStage: MondayNightStagePack,
  GameShow: GameShowPack,
  FanLive: FanLivePack,
  PerformerLive: PerformerLivePack,
};
