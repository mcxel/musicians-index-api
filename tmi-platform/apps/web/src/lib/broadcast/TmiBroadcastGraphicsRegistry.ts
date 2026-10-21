/**
 * TmiBroadcastGraphicsRegistry — ORIGINAL TMI broadcast component/scene grammar.
 * Derived from EXTERNAL read-only video bases (C:\Users\Admin\Videos\tmi video bases).
 * REFERENCE != RUNTIME. No MP4 ingest. Extends BroadcastDirectorEngine / OverlayRuntime /
 * UniversalPlayableExperienceContract — NOT a second engine.
 *
 * Cypher law: collaborative by default — VS/winner/competitive vote components
 * are eligible for BATTLE/CHALLENGE/COMPETITIVE_CYPHER_VARIANT only.
 */

import type { TmiExperienceType } from "@/lib/experience/UniversalPlayableExperienceContract";

export const TMI_REFERENCE_VIDEO_ROOT_ENV = "TMI_REFERENCE_VIDEO_ROOT";
/** Dev-only hint — production MUST NOT require this path. */
export const TMI_REFERENCE_VIDEO_ROOT_DEV_HINT =
  "C:\\Users\\Admin\\Videos\\tmi video bases";

export type BroadcastComponentFamily =
  | "FRAME"
  | "NAMEPLATE"
  | "LOWER_THIRD"
  | "HEADER"
  | "SIDE_RAIL"
  | "PIP"
  | "TIMER"
  | "COUNTDOWN"
  | "VOTE"
  | "SCORE"
  | "RESULT"
  | "WINNER"
  | "REACTION"
  | "WAVEFORM"
  | "TRANSITION"
  | "CUTSCENE"
  | "INTRO"
  | "OUTRO"
  | "WORLD_MEDIA"
  | "HUD"
  | "SAFE_ZONE";

export type BroadcastLayoutId =
  | "SINGLE_FOCUS"
  | "DUAL_EQUAL"
  | "DUAL_VERSUS"
  | "PRIMARY_PLUS_PIP"
  | "PRIMARY_PLUS_SIDE_RAIL"
  | "PRIMARY_PLUS_AUDIENCE_RAIL"
  | "WORLD_WIDE"
  | "WORLD_PLUS_MEDIA_PANEL"
  | "WORLD_SOCIAL_CLUSTER"
  | "WORLD_PLAYLIST_STATION"
  | "QUEUE_FOCUS"
  | "RESULT_FOCUS"
  | "WINNER_FOCUS"
  | "INTRO_STAGE"
  | "OUTRO_STAGE"
  | "GAME_SHOW_HOST"
  | "CREATION_STUDIO";

export type BroadcastPanelAnchor =
  | "TOP_LEFT"
  | "TOP_CENTER"
  | "TOP_RIGHT"
  | "LEFT_RAIL"
  | "RIGHT_RAIL"
  | "LOWER_LEFT"
  | "LOWER_CENTER"
  | "LOWER_RIGHT"
  | "SUBJECT_LEFT"
  | "SUBJECT_RIGHT"
  | "SUBJECT_BELOW"
  | "SUBJECT_ABOVE"
  | "CENTER"
  | "PIP"
  | "FULLSCREEN";

export type BroadcastComponentId =
  | "TmiPerformerFrame"
  | "TmiParticipantFrame"
  | "TmiPerformerLowerThird"
  | "TmiNameplate"
  | "TmiLiveBadge"
  | "TmiExperienceHeader"
  | "TmiExperiencePhaseHeader"
  | "TmiParticipantRail"
  | "TmiAudienceCommunityWall"
  | "TmiSidecarPanel"
  | "TmiAttachedLowerPanel"
  | "TmiFloatingCallout"
  | "TmiParticipantPiP"
  | "TmiUpNextCard"
  | "TmiExperienceTimer"
  | "TmiExperienceCountdown"
  | "TmiVotePanel"
  | "TmiSplitResultBar"
  | "TmiScoreChip"
  | "TmiReactionStack"
  | "TmiWorldReactionField"
  | "TmiProgramWaveform"
  | "TmiVersusTransition"
  | "TmiEnergyOrbit"
  | "TmiEnergyDivider"
  | "TmiWinnerScene"
  | "TmiResultCard"
  | "TmiWorldMediaPanel"
  | "TmiWorldPlaylistStation"
  | "TmiJoinControlCluster"
  | "TmiExperienceCommandStrip";

export type BroadcastComponentDef = {
  componentId: BroadcastComponentId;
  family: BroadcastComponentFamily;
  purpose: string;
  /** Experiences that may mount this presentation component. */
  experiences: ReadonlyArray<TmiExperienceType | "CREATION_CENTER" | "ALL">;
  /** Competitive-only: must not appear on collaborative Cypher. */
  competitiveOnly: boolean;
  authorityDependency: string;
  desktopAnchors: ReadonlyArray<BroadcastPanelAnchor>;
  mobileAnchors: ReadonlyArray<BroadcastPanelAnchor>;
  publicProgramEligible: boolean;
  status: "SOURCE_COMPLETE" | "SOURCE_READY" | "PHYSICAL_PENDING";
};

export const TMI_BROADCAST_COMPONENTS: BroadcastComponentDef[] = [
  {
    componentId: "TmiPerformerFrame",
    family: "FRAME",
    purpose: "Neon/glass performer video frame — SINGLE/DUAL/PIP/FOCUS",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "UniversalMonitorViewportContract + live transport",
    desktopAnchors: ["CENTER", "SUBJECT_LEFT", "SUBJECT_RIGHT", "PIP"],
    mobileAnchors: ["CENTER", "PIP"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiPerformerLowerThird",
    family: "LOWER_THIRD",
    purpose: "Identity + turn/timer/Now Playing — never covers face",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "session identity + experience state",
    desktopAnchors: ["SUBJECT_BELOW", "LOWER_CENTER"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiNameplate",
    family: "NAMEPLATE",
    purpose: "Compact identity for dual/PiP/queue",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "session identity",
    desktopAnchors: ["SUBJECT_ABOVE", "SUBJECT_BELOW"],
    mobileAnchors: ["SUBJECT_BELOW"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiLiveBadge",
    family: "HUD",
    purpose: "LIVE/CONNECTING/RECONNECTING/ENDED — canonical publication only",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "GlobalLiveSessionRegistry / live transport health",
    desktopAnchors: ["TOP_LEFT", "SUBJECT_ABOVE"],
    mobileAnchors: ["TOP_LEFT"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiExperienceHeader",
    family: "HEADER",
    purpose: "Show/event title banner (MNS, Cypher, Battle name, etc.)",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "experience director / show identity",
    desktopAnchors: ["TOP_CENTER"],
    mobileAnchors: ["TOP_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiExperiencePhaseHeader",
    family: "HEADER",
    purpose: "PREPARING/INTRO/PERFORMANCE/TURN/ROUND/INTERMISSION/RESULT/OUTRO",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "experience phase state",
    desktopAnchors: ["TOP_CENTER"],
    mobileAnchors: ["TOP_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiParticipantRail",
    family: "SIDE_RAIL",
    purpose: "ACTIVE/UP NEXT/WAITING queue rail",
    experiences: ["CYPHER", "GAUNTLET", "GAME_SHOW", "BATTLE", "CHALLENGE", "MONDAY_NIGHT_STAGE"],
    competitiveOnly: false,
    authorityDependency: "room queue / matchmaking",
    desktopAnchors: ["LEFT_RAIL", "RIGHT_RAIL"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiAudienceCommunityWall",
    family: "SIDE_RAIL",
    purpose: "Dense participant/audience mosaic — human truth + labeled bots",
    experiences: ["CYPHER", "GAME_SHOW", "MONDAY_NIGHT_STAGE", "LIVE_SHOW", "LOUNGE"],
    competitiveOnly: false,
    authorityDependency: "presence + BOT≠HUMAN",
    desktopAnchors: ["LEFT_RAIL", "RIGHT_RAIL"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiUpNextCard",
    family: "PIP",
    purpose: "UP NEXT card — collaborative Cypher naming (not NEXT COMPETITOR)",
    experiences: ["CYPHER", "GAUNTLET", "GAME_SHOW", "MONDAY_NIGHT_STAGE", "LOUNGE"],
    competitiveOnly: false,
    authorityDependency: "queue",
    desktopAnchors: ["RIGHT_RAIL", "SUBJECT_RIGHT", "PIP"],
    mobileAnchors: ["LOWER_RIGHT", "PIP"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiParticipantPiP",
    family: "PIP",
    purpose: "Opponent/up-next/host/DJ PiP inside composition (≠ Monitor B)",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "composition director",
    desktopAnchors: ["PIP", "LOWER_LEFT", "LOWER_RIGHT"],
    mobileAnchors: ["PIP"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiExperienceCountdown",
    family: "COUNTDOWN",
    purpose: "Large center countdown — NOT for Regular Go Live",
    experiences: ["BATTLE", "CHALLENGE", "CYPHER", "GAME_SHOW", "MONDAY_NIGHT_STAGE", "WORLD_DANCE_PARTY"],
    competitiveOnly: false,
    authorityDependency: "scheduled round/turn timing",
    desktopAnchors: ["CENTER"],
    mobileAnchors: ["CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiVersusTransition",
    family: "TRANSITION",
    purpose: "Cinematic VS — competitive experiences only",
    experiences: ["BATTLE", "CHALLENGE", "DIRTY_DOZENS", "DANCE_OFF", "JOKE_OFF"],
    competitiveOnly: true,
    authorityDependency: "Battle/Challenge authority",
    desktopAnchors: ["FULLSCREEN", "CENTER"],
    mobileAnchors: ["FULLSCREEN"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiEnergyOrbit",
    family: "TRANSITION",
    purpose: "Presentation-only energy rings around frames",
    experiences: ["BATTLE", "CHALLENGE", "CYPHER", "GAME_SHOW"],
    competitiveOnly: false,
    authorityDependency: "presentation director",
    desktopAnchors: ["CENTER"],
    mobileAnchors: ["CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiEnergyDivider",
    family: "TRANSITION",
    purpose: "Lightning/energy split — VS/round/result sparingly",
    experiences: ["BATTLE", "CHALLENGE"],
    competitiveOnly: true,
    authorityDependency: "presentation director",
    desktopAnchors: ["CENTER"],
    mobileAnchors: ["CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiProgramWaveform",
    family: "WAVEFORM",
    purpose: "REAL audio analysis only — no fake waveform",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "canonical audio / Origami analysis",
    desktopAnchors: ["LOWER_CENTER"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiVotePanel",
    family: "VOTE",
    purpose: "Vote UI — experiences with canonical voting only",
    experiences: ["BATTLE", "CHALLENGE", "DIRTY_DOZENS", "DANCE_OFF", "JOKE_OFF", "GAME_SHOW"],
    competitiveOnly: true,
    authorityDependency: "vote/scoring authority",
    desktopAnchors: ["SUBJECT_LEFT", "SUBJECT_RIGHT", "LOWER_CENTER"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiSplitResultBar",
    family: "SCORE",
    purpose: "Cyan/magenta split totals — never collaborative Cypher",
    experiences: ["BATTLE", "CHALLENGE"],
    competitiveOnly: true,
    authorityDependency: "score/vote authority",
    desktopAnchors: ["LOWER_CENTER", "TOP_CENTER"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiScoreChip",
    family: "SCORE",
    purpose: "Compact score — only when experience scores",
    experiences: ["BATTLE", "CHALLENGE", "GAME_SHOW", "GAUNTLET"],
    competitiveOnly: true,
    authorityDependency: "score authority",
    desktopAnchors: ["TOP_RIGHT", "SUBJECT_ABOVE"],
    mobileAnchors: ["TOP_RIGHT"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiWinnerScene",
    family: "WINNER",
    purpose: "Gold winner composition — canonical result only; NOT default Cypher",
    experiences: ["BATTLE", "CHALLENGE", "GAME_SHOW", "DIRTY_DOZENS", "DANCE_OFF", "JOKE_OFF"],
    competitiveOnly: true,
    authorityDependency: "result authority",
    desktopAnchors: ["FULLSCREEN", "CENTER"],
    mobileAnchors: ["FULLSCREEN"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiResultCard",
    family: "RESULT",
    purpose: "Factual result/stat sidecar — no fabricated scores",
    experiences: ["BATTLE", "CHALLENGE", "GAME_SHOW"],
    competitiveOnly: true,
    authorityDependency: "result authority",
    desktopAnchors: ["RIGHT_RAIL", "SUBJECT_RIGHT"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiReactionStack",
    family: "REACTION",
    purpose: "Real reactions beside performer — aggregate under load",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "reaction events",
    desktopAnchors: ["SUBJECT_LEFT", "SUBJECT_RIGHT"],
    mobileAnchors: ["SUBJECT_RIGHT"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiWorldReactionField",
    family: "REACTION",
    purpose: "World-space reaction bubbles near avatars/media stations",
    experiences: ["LOUNGE", "WORLD_DANCE_PARTY", "FAN_LOBBY"],
    competitiveOnly: false,
    authorityDependency: "reaction + world presence",
    desktopAnchors: ["CENTER"],
    mobileAnchors: ["CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiWorldMediaPanel",
    family: "WORLD_MEDIA",
    purpose: "In-world glass media card (≠ Monitor A/B)",
    experiences: ["LOUNGE", "WORLD_DANCE_PARTY", "FAN_LOBBY"],
    competitiveOnly: false,
    authorityDependency: "canonical media/program source",
    desktopAnchors: ["CENTER"],
    mobileAnchors: ["CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiWorldPlaylistStation",
    family: "WORLD_MEDIA",
    purpose: "Central playlist station in lounge world",
    experiences: ["LOUNGE", "LISTENING_PARTY"],
    competitiveOnly: false,
    authorityDependency: "playlist/media authority",
    desktopAnchors: ["CENTER"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiJoinControlCluster",
    family: "HUD",
    purpose: "JOIN wired to capability + LobbyEntryFlow — never decorative",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "admission + LobbyEntryFlow",
    desktopAnchors: ["LOWER_CENTER", "LOWER_RIGHT"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: false,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiExperienceCommandStrip",
    family: "HUD",
    purpose: "Bottom command/action strip — auto-hide with world-first law",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "HUD / venue tools",
    desktopAnchors: ["LOWER_CENTER"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: false,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiSidecarPanel",
    family: "SIDE_RAIL",
    purpose: "Info card beside performer — subject-safe",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "experience state",
    desktopAnchors: ["SUBJECT_LEFT", "SUBJECT_RIGHT", "RIGHT_RAIL"],
    mobileAnchors: ["LOWER_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiAttachedLowerPanel",
    family: "LOWER_THIRD",
    purpose: "Panel visually attached to performer frame",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "experience state",
    desktopAnchors: ["SUBJECT_BELOW"],
    mobileAnchors: ["SUBJECT_BELOW"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiFloatingCallout",
    family: "HUD",
    purpose: "Transient tip/milestone/up-next callout",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "real events only",
    desktopAnchors: ["SUBJECT_LEFT", "SUBJECT_RIGHT", "TOP_CENTER"],
    mobileAnchors: ["TOP_CENTER"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
  {
    componentId: "TmiExperienceTimer",
    family: "TIMER",
    purpose: "Turn/round/show timer — server timing truth",
    experiences: ["ALL"],
    competitiveOnly: false,
    authorityDependency: "canonical timer",
    desktopAnchors: ["TOP_RIGHT", "SUBJECT_ABOVE"],
    mobileAnchors: ["TOP_RIGHT"],
    publicProgramEligible: true,
    status: "SOURCE_COMPLETE",
  },
];

export type SceneTrigger =
  | "SESSION_READY"
  | "ROUND_START"
  | "TURN_START"
  | "TURN_END"
  | "QUEUE_ADVANCE"
  | "PARTICIPANT_JOIN"
  | "PARTICIPANT_READY"
  | "VOTE_OPEN"
  | "VOTE_CLOSE"
  | "RESULT_READY"
  | "REAL_TIP"
  | "REAL_MILESTONE"
  | "MEDIA_CHANGE"
  | "SESSION_END";

export type BroadcastSceneDef = {
  sceneId: string;
  experiences: ReadonlyArray<TmiExperienceType>;
  trigger: SceneTrigger;
  layout: BroadcastLayoutId;
  components: ReadonlyArray<BroadcastComponentId>;
  competitiveOnly: boolean;
  disconnectTransport: false;
  status: "SOURCE_COMPLETE" | "PHYSICAL_PENDING";
};

export const TMI_BROADCAST_SCENES: BroadcastSceneDef[] = [
  // Battle
  { sceneId: "BATTLE_ESTABLISHING", experiences: ["BATTLE"], trigger: "SESSION_READY", layout: "WORLD_WIDE", components: ["TmiExperienceHeader", "TmiLiveBadge"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "BATTLE_DUAL", experiences: ["BATTLE"], trigger: "PARTICIPANT_READY", layout: "DUAL_EQUAL", components: ["TmiPerformerFrame", "TmiNameplate", "TmiLiveBadge"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "BATTLE_VERSUS", experiences: ["BATTLE"], trigger: "ROUND_START", layout: "DUAL_VERSUS", components: ["TmiVersusTransition", "TmiEnergyOrbit", "TmiEnergyDivider"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "BATTLE_A_ACTIVE", experiences: ["BATTLE"], trigger: "TURN_START", layout: "PRIMARY_PLUS_PIP", components: ["TmiPerformerFrame", "TmiParticipantPiP", "TmiProgramWaveform", "TmiPerformerLowerThird"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "BATTLE_VOTE_OPEN", experiences: ["BATTLE"], trigger: "VOTE_OPEN", layout: "PRIMARY_PLUS_PIP", components: ["TmiVotePanel", "TmiSplitResultBar"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "BATTLE_WINNER", experiences: ["BATTLE"], trigger: "RESULT_READY", layout: "WINNER_FOCUS", components: ["TmiWinnerScene", "TmiResultCard"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  // Challenge
  { sceneId: "CHALLENGE_DUAL", experiences: ["CHALLENGE"], trigger: "PARTICIPANT_READY", layout: "DUAL_EQUAL", components: ["TmiPerformerFrame", "TmiExperienceHeader", "TmiLiveBadge"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "CHALLENGE_ACTIVE", experiences: ["CHALLENGE"], trigger: "TURN_START", layout: "PRIMARY_PLUS_PIP", components: ["TmiPerformerFrame", "TmiParticipantPiP", "TmiProgramWaveform", "TmiReactionStack", "TmiExperienceTimer"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "CHALLENGE_WINNER", experiences: ["CHALLENGE"], trigger: "RESULT_READY", layout: "WINNER_FOCUS", components: ["TmiWinnerScene", "TmiResultCard"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  // Cypher — collaborative
  { sceneId: "CYPHER_WORLD_WIDE", experiences: ["CYPHER"], trigger: "SESSION_READY", layout: "WORLD_WIDE", components: ["TmiExperienceHeader", "TmiExperiencePhaseHeader"], competitiveOnly: false, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "CYPHER_COUNTDOWN", experiences: ["CYPHER"], trigger: "ROUND_START", layout: "INTRO_STAGE", components: ["TmiExperienceCountdown"], competitiveOnly: false, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "CYPHER_ACTIVE", experiences: ["CYPHER"], trigger: "TURN_START", layout: "PRIMARY_PLUS_SIDE_RAIL", components: ["TmiPerformerFrame", "TmiParticipantRail", "TmiUpNextCard", "TmiPerformerLowerThird", "TmiProgramWaveform", "TmiReactionStack"], competitiveOnly: false, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "CYPHER_QUEUE_ADVANCE", experiences: ["CYPHER"], trigger: "QUEUE_ADVANCE", layout: "QUEUE_FOCUS", components: ["TmiUpNextCard", "TmiParticipantRail"], competitiveOnly: false, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "CYPHER_OUTRO", experiences: ["CYPHER"], trigger: "SESSION_END", layout: "OUTRO_STAGE", components: ["TmiExperienceHeader", "TmiParticipantRail"], competitiveOnly: false, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  // Playlist Lounge
  { sceneId: "PLAYLIST_LOUNGE_ENTER", experiences: ["LOUNGE", "LISTENING_PARTY"], trigger: "SESSION_READY", layout: "WORLD_WIDE", components: ["TmiWorldPlaylistStation", "TmiWorldMediaPanel"], competitiveOnly: false, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "PLAYLIST_LOUNGE_MEDIA_FOCUS", experiences: ["LOUNGE", "LISTENING_PARTY"], trigger: "MEDIA_CHANGE", layout: "WORLD_PLAYLIST_STATION", components: ["TmiWorldPlaylistStation", "TmiWorldMediaPanel", "TmiWorldReactionField"], competitiveOnly: false, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  // WDP
  { sceneId: "WDP_WORLD", experiences: ["WORLD_DANCE_PARTY"], trigger: "SESSION_READY", layout: "WORLD_SOCIAL_CLUSTER", components: ["TmiWorldMediaPanel", "TmiLiveBadge"], competitiveOnly: false, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  // MNS
  { sceneId: "MNS_STAGE", experiences: ["MONDAY_NIGHT_STAGE"], trigger: "SESSION_READY", layout: "WORLD_PLUS_MEDIA_PANEL", components: ["TmiPerformerFrame", "TmiExperienceHeader", "TmiLiveBadge"], competitiveOnly: false, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  // Game show
  { sceneId: "GAME_SHOW_HOST", experiences: ["GAME_SHOW"], trigger: "SESSION_READY", layout: "GAME_SHOW_HOST", components: ["TmiExperienceHeader", "TmiScoreChip", "TmiExperienceTimer", "TmiAudienceCommunityWall"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },

  // Game Show — fast living show (1-vs-crowd spatial principle; original TMI pacing)
  { sceneId: "GAME_SHOW_INTRO", experiences: ["GAME_SHOW"], trigger: "SESSION_READY", layout: "INTRO_STAGE", components: ["TmiExperienceHeader", "TmiAudienceCommunityWall", "TmiLiveBadge"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "GAME_SHOW_QUESTION", experiences: ["GAME_SHOW"], trigger: "ROUND_START", layout: "WORLD_PLUS_MEDIA_PANEL", components: ["TmiExperienceHeader", "TmiExperienceTimer", "TmiScoreChip"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "GAME_SHOW_ANSWER_LOCK", experiences: ["GAME_SHOW"], trigger: "VOTE_CLOSE", layout: "PRIMARY_PLUS_SIDE_RAIL", components: ["TmiScoreChip", "TmiFloatingCallout"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "GAME_SHOW_REVEAL", experiences: ["GAME_SHOW"], trigger: "RESULT_READY", layout: "RESULT_FOCUS", components: ["TmiResultCard", "TmiReactionStack"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
  { sceneId: "GAME_SHOW_FINAL", experiences: ["GAME_SHOW"], trigger: "SESSION_END", layout: "WINNER_FOCUS", components: ["TmiWinnerScene", "TmiResultCard"], competitiveOnly: true, disconnectTransport: false, status: "SOURCE_COMPLETE" },
];

/** Collaborative Cypher must never resolve competitive-only components. */
export function componentAllowedForExperience(
  component: BroadcastComponentDef,
  experience: TmiExperienceType,
  variantCompetitive = false,
): boolean {
  if (component.competitiveOnly) {
    if (experience === "CYPHER") return variantCompetitive;
    if (experience === "LOUNGE" || experience === "FAN_LOBBY" || experience === "WORLD_DANCE_PARTY" || experience === "LISTENING_PARTY") {
      return false;
    }
  }
  if (component.experiences.includes("ALL")) return true;
  return (component.experiences as ReadonlyArray<string>).includes(experience);
}

export function scenesForTrigger(
  experience: TmiExperienceType,
  trigger: SceneTrigger,
  variantCompetitive = false,
): BroadcastSceneDef[] {
  return TMI_BROADCAST_SCENES.filter((s) => {
    if (!s.experiences.includes(experience)) return false;
    if (s.trigger !== trigger) return false;
    if (s.competitiveOnly && experience === "CYPHER" && !variantCompetitive) return false;
    return true;
  });
}

/**
 * Bounded automated scene director — selects APPROVED scenes from real triggers.
 * Observe→Recommend→Approve learning is OUTSIDE this runtime (no silent self-modify).
 */
export function resolveApprovedScene(input: {
  experience: TmiExperienceType;
  trigger: SceneTrigger;
  variantCompetitive?: boolean;
}): BroadcastSceneDef | null {
  const hits = scenesForTrigger(input.experience, input.trigger, input.variantCompetitive);
  return hits[0] ?? null;
}

export const TmiBroadcastGraphicsRegistry = {
  components: TMI_BROADCAST_COMPONENTS,
  scenes: TMI_BROADCAST_SCENES,
  layouts: [
    "SINGLE_FOCUS",
    "DUAL_EQUAL",
    "DUAL_VERSUS",
    "PRIMARY_PLUS_PIP",
    "PRIMARY_PLUS_SIDE_RAIL",
    "WORLD_WIDE",
    "WORLD_PLAYLIST_STATION",
    "WINNER_FOCUS",
  ] as const,
  componentAllowedForExperience,
  scenesForTrigger,
  resolveApprovedScene,
};


