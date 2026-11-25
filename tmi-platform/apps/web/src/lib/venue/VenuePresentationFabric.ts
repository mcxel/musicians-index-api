/**
 * VenuePresentationFabric — Phase 2 venue presentation plan (assembly glue).
 * ONE plan from existing authorities. Does NOT create a second Venue/Jumbotron/WebRTC engine.
 *
 * Order covered:
 * indoor/outdoor → HD performance panels → in-venue Jumbotron → full-body/group framing
 * → chroma entitlement+fallback → Battle dual → Cypher collaborative rows
 * → multi-performer composition → camera direction → seating/world integration.
 */

import {
  resolveEventVenueEnvironment,
  type EventVenueEnvironmentResolution,
  type VenueEnvironmentKind,
} from "@/lib/venues/EventVenueEnvironment";
import {
  resolveStagePresentationMode,
  shouldFallbackChromaToVideoPanel,
  type ChromaQualityState,
  type StagePerformerPresentationMode,
} from "@/lib/experience/TmiRealityGameWorldConvergence";
import { canUseChromaHero, type UserTier } from "@/lib/showmanship/AssetLockerPolicy";
import type { CertifiedVenuePackage } from "@/lib/venues/CertifiedVenuePackage";
import type { RoomType } from "@/lib/live/BroadcastDirectorEngine";
import type { BroadcastCompositionLayout } from "@/lib/experiencePresentation/types";
import {
  composeBattleProgram,
  type BattleProgramComposition,
} from "@/lib/experiencePresentation/composeBattleProgram";
import {
  composeCypherProgram,
  type CypherProgramComposition,
} from "@/lib/experiencePresentation/composeCypherProgram";
import {
  composeChallengeProgram,
  type ChallengeProgramComposition,
  type ChallengeObjectiveSnapshot,
} from "@/lib/experiencePresentation/composeChallengeProgram";
import {
  composeMondayNightStageProgram,
  type MondayNightStageProgramComposition,
  type MondayNightStageLifecyclePhase,
} from "@/lib/experiencePresentation/composeMondayNightStageProgram";
import {
  composeDancePartyProgram,
  type DancePartyProgramComposition,
  type DancePartyLifecyclePhase,
  type DancePartyScope,
} from "@/lib/experiencePresentation/composeDancePartyProgram";

export type VenuePanelCompositionKind =
  | "SINGLE_HD_PANEL"
  | "BATTLE_DUAL_MIXED"
  | "CYPHER_COLLABORATIVE_ROWS"
  | "MULTI_PERFORMER_STAGE"
  | "GROUP_FRAMING"
  | "CHALLENGE_FOCUS";

export type VenueFramingMode =
  | "FULL_BODY"
  | "GROUP"
  | "CLOSEUP"
  | "WIDE_STAGE"
  | "DJ_EQUIPMENT_WIDE";

export type VenueCameraCutProfile =
  | "BATTLE"
  | "CYPHER"
  | "CHALLENGE"
  | "FAN_LOBBY"
  | "DANCE_PARTY"
  | "PERFORMER_LIVE";

export type VenuePresentationFabricPlan = {
  roomId: string;
  eventType: string;
  environment: EventVenueEnvironmentResolution;
  hdPerformancePanel: {
    enabled: true;
    mode: StagePerformerPresentationMode;
    usesCanonicalWebRtc: true;
  };
  jumbotron: {
    mountAuthorized: boolean;
    bindProgram: boolean;
    physicalEnvironmentHint:
      | "INDOOR_ARENA"
      | "OUTDOOR_STADIUM"
      | "PROSCENIUM_THEATER"
      | "CLUB_SMALL_ROOM"
      | "WORLD_DANCE_PARTY";
  };
  framing: VenueFramingMode;
  chroma: {
    entitled: boolean;
    quality: ChromaQualityState;
    presentationMode: StagePerformerPresentationMode;
    fallbackToVideoPanel: boolean;
  };
  panelComposition: VenuePanelCompositionKind;
  broadcastLayout: BroadcastCompositionLayout;
  cameraProfile: VenueCameraCutProfile;
  broadcastDirectorRoomType: RoomType;
  seatingWorldIntegration: {
    audienceRuntimeBound: true;
    venueRuntimeBound: true;
    oneVenueRuntime: true;
  };
  multiPerformer: {
    enabled: boolean;
    maxConcurrentPanels: number;
  };
  persistenceNote: "FABRIC_PLAN_EPHEMERAL";
};

const USER_TIERS: readonly UserTier[] = [
  "free",
  "pro",
  "RUBY",
  "silver",
  "gold",
  "platinum",
  "diamond",
];

export function normalizeFabricUserTier(raw: string | null | undefined): UserTier {
  if (!raw) return "free";
  const s = raw.trim();
  if (s.toUpperCase() === "RUBY") return "RUBY";
  const lower = s.toLowerCase();
  const hit = USER_TIERS.find((t) => t === lower || t === s);
  return hit ?? "free";
}

function mapEventToCamera(eventType: string): {
  profile: VenueCameraCutProfile;
  roomType: RoomType;
} {
  const t = eventType.toLowerCase();
  if (t.includes("battle") || t.includes("gauntlet")) {
    return { profile: "BATTLE", roomType: "BATTLE" };
  }
  if (t.includes("cypher") || t.includes("cipher")) {
    return { profile: "CYPHER", roomType: "CYPHER" };
  }
  if (t.includes("challenge")) {
    return { profile: "CHALLENGE", roomType: "CHALLENGE" };
  }
  if (t.includes("dance")) {
    return { profile: "DANCE_PARTY", roomType: "DANCE_PARTY" };
  }
  if (t.includes("lobby") || t.includes("lounge")) {
    return { profile: "FAN_LOBBY", roomType: "FAN_LOBBY" };
  }
  return { profile: "PERFORMER_LIVE", roomType: "PERFORMER_LIVE" };
}

function mapPhysicalEnv(
  env: VenueEnvironmentKind | null,
  eventType: string,
): VenuePresentationFabricPlan["jumbotron"]["physicalEnvironmentHint"] {
  const t = eventType.toLowerCase();
  if (t.includes("dance")) return "WORLD_DANCE_PARTY";
  if (t.includes("monday") || t.includes("theater")) return "PROSCENIUM_THEATER";
  if (t.includes("lounge") || t.includes("lobby")) return "CLUB_SMALL_ROOM";
  if (env === "outdoor") return "OUTDOOR_STADIUM";
  return "INDOOR_ARENA";
}

function resolvePanelComposition(
  eventType: string,
  participantCount: number,
): {
  kind: VenuePanelCompositionKind;
  layout: BroadcastCompositionLayout;
  multi: boolean;
  maxPanels: number;
} {
  const t = eventType.toLowerCase();
  if (t.includes("battle") || t.includes("gauntlet")) {
    return {
      kind: "BATTLE_DUAL_MIXED",
      layout: participantCount >= 2 ? "DUAL" : "A_DOMINANT",
      multi: true,
      maxPanels: 2,
    };
  }
  if (t.includes("cypher") || t.includes("cipher")) {
    return {
      kind: "CYPHER_COLLABORATIVE_ROWS",
      layout: "CIRCLE_FOCUS",
      multi: true,
      maxPanels: Math.max(4, participantCount || 4),
    };
  }
  if (t.includes("challenge")) {
    return {
      kind: "CHALLENGE_FOCUS",
      layout: "A_DOMINANT",
      multi: participantCount >= 2,
      maxPanels: participantCount >= 2 ? 2 : 1,
    };
  }
  if (participantCount >= 3) {
    return {
      kind: "MULTI_PERFORMER_STAGE",
      layout: "SPLIT",
      multi: true,
      maxPanels: Math.min(participantCount, 6),
    };
  }
  if (participantCount === 2) {
    return { kind: "GROUP_FRAMING", layout: "SPLIT", multi: true, maxPanels: 2 };
  }
  return { kind: "SINGLE_HD_PANEL", layout: "HOST_CLOSE", multi: false, maxPanels: 1 };
}

function resolveFraming(
  eventType: string,
  panelKind: VenuePanelCompositionKind,
  djEquipmentView?: boolean,
): VenueFramingMode {
  if (djEquipmentView) return "DJ_EQUIPMENT_WIDE";
  if (panelKind === "GROUP_FRAMING" || panelKind === "MULTI_PERFORMER_STAGE") return "GROUP";
  if (panelKind === "CYPHER_COLLABORATIVE_ROWS") return "WIDE_STAGE";
  if (panelKind === "BATTLE_DUAL_MIXED") return "FULL_BODY";
  const t = eventType.toLowerCase();
  if (t.includes("dance")) return "FULL_BODY";
  return "FULL_BODY";
}

export function resolveVenuePresentationFabric(input: {
  roomId: string;
  eventType: string;
  venueEnvironment?: VenueEnvironmentKind | null;
  venueSkinId?: string | null;
  specialYearlyOutdoor?: boolean;
  performerTier?: UserTier | string | null;
  chromaQuality?: ChromaQualityState;
  participantCount?: number;
  certifiedPackage?: CertifiedVenuePackage | null;
  djEquipmentView?: boolean;
}): VenuePresentationFabricPlan {
  const kindForEnv =
    input.eventType === "monday-stage" ? "monday-night-stage" : input.eventType;
  const environment = resolveEventVenueEnvironment({
    kind: kindForEnv,
    environment: input.venueEnvironment,
    skinId: input.venueSkinId,
    specialYearlyOutdoor: input.specialYearlyOutdoor,
  });

  const tier = normalizeFabricUserTier(
    typeof input.performerTier === "string" ? input.performerTier : input.performerTier ?? "free",
  );
  const entitled = canUseChromaHero(tier);
  const quality: ChromaQualityState = input.chromaQuality ?? "STANDARD_VIDEO_FALLBACK";
  const presentationMode = resolveStagePresentationMode({
    chromaEnabled: entitled,
    chromaQuality: quality,
    performerRequiresRealVideo: true,
  });
  const camera = mapEventToCamera(input.eventType);
  const participants = Math.max(0, input.participantCount ?? 0);
  const panel = resolvePanelComposition(input.eventType, participants);
  const pkg = input.certifiedPackage;
  const mountJumbotron = Boolean(
    pkg?.capabilities?.HAS_JUMBOTRON && pkg?.jumbotronMount,
  );

  return {
    roomId: input.roomId,
    eventType: input.eventType,
    environment,
    hdPerformancePanel: {
      enabled: true,
      mode: presentationMode,
      usesCanonicalWebRtc: true,
    },
    jumbotron: {
      mountAuthorized: mountJumbotron,
      bindProgram: mountJumbotron,
      physicalEnvironmentHint: mapPhysicalEnv(environment.environment, input.eventType),
    },
    framing: resolveFraming(input.eventType, panel.kind, input.djEquipmentView),
    chroma: {
      entitled,
      quality,
      presentationMode,
      fallbackToVideoPanel: !entitled || shouldFallbackChromaToVideoPanel(quality),
    },
    panelComposition: panel.kind,
    broadcastLayout: panel.layout,
    cameraProfile: camera.profile,
    broadcastDirectorRoomType: camera.roomType,
    seatingWorldIntegration: {
      audienceRuntimeBound: true,
      venueRuntimeBound: true,
      oneVenueRuntime: true,
    },
    multiPerformer: {
      enabled: panel.multi,
      maxConcurrentPanels: panel.maxPanels,
    },
    persistenceNote: "FABRIC_PLAN_EPHEMERAL",
  };
}

/**
 * World vs Mini Dance Party scope resolution (Rule 21). An explicit caller
 * value always wins. Otherwise the canonical eventType string already
 * distinguishes them elsewhere in this codebase (EventVenueEnvironment.ts,
 * /api/live/go/route.ts: "mini-dance-party" vs "world-dance-party") — only
 * an eventType that actually says "mini" resolves to MINI. Any other dance
 * eventType, and any unrecognized/invalid scope, stays WORLD: the unsafe
 * failure mode here would be defaulting to MINI and letting an unauthorized
 * human DJ through, so the default must stay WORLD, never MINI.
 */
export function resolveDancePartyScope(
  eventType: string,
  explicit?: DancePartyScope | null,
): DancePartyScope {
  if (explicit === "MINI" || explicit === "WORLD") return explicit;
  return eventType.toLowerCase().includes("mini") ? "MINI" : "WORLD";
}

export type VenueProgramBindResult =
  | { kind: "BATTLE"; composition: BattleProgramComposition }
  | { kind: "CYPHER"; composition: CypherProgramComposition }
  | { kind: "CHALLENGE"; composition: ChallengeProgramComposition }
  | { kind: "MONDAY_NIGHT_STAGE"; composition: MondayNightStageProgramComposition }
  | { kind: "DANCE_PARTY"; composition: DancePartyProgramComposition }
  | { kind: "NONE" };

/**
 * Bind Battle dual / Cypher collaborative / Challenge / Monday Night Stage / Dance Party PROGRAM when real participants exist.
 * Never invents competitors — omit corners/circle rather than fabricate.
 */
export function applyVenuePresentationPrograms(input: {
  plan: VenuePresentationFabricPlan;
  sessionId?: string;
  battleId?: string;
  cypherId?: string;
  challengeId?: string;
  showId?: string;
  partyId?: string;
  cornerA?: { id: string; displayName?: string | null } | null;
  cornerB?: { id: string; displayName?: string | null } | null;
  challenger?: { id: string; displayName?: string | null } | null;
  challenged?: { id: string; displayName?: string | null } | null;
  objective?: ChallengeObjectiveSnapshot | null;
  circle?: Array<{ id: string; displayName?: string | null }> | null;
  activeMicId?: string | null;
  featured?: { id: string; displayName?: string | null } | null;
  whosNext?: { id: string; displayName?: string | null } | null;
  mnsLifecyclePhase?: MondayNightStageLifecyclePhase;
  dj?: { id: string; displayName?: string | null; isBot?: boolean } | null;
  dancePhase?: DancePartyLifecyclePhase;
  /**
   * World vs Mini Dance Party (Rule 21). Pass this explicitly when the caller
   * already knows it (e.g. the session's isMini flag from /api/live/go).
   * When omitted, derived from plan.eventType — only an eventType containing
   * "mini" (e.g. "mini-dance-party") resolves to MINI; every other dance
   * eventType ("dance-party", "world-dance-party") stays WORLD, matching
   * composeDancePartyProgram's own safe default. Never defaults to MINI.
   */
  partyScope?: DancePartyScope;
}): VenueProgramBindResult {
  const { plan } = input;
  const sessionId = input.sessionId ?? `session:${plan.roomId}`;
  const bindJumbotron = plan.jumbotron.bindProgram;

  if (plan.panelComposition === "BATTLE_DUAL_MIXED") {
    const composition = composeBattleProgram({
      sessionId,
      battleId: input.battleId ?? `battle:${plan.roomId}`,
      roomId: plan.roomId,
      cornerA: input.cornerA ?? null,
      cornerB: input.cornerB ?? null,
      composition: plan.broadcastLayout === "DUAL" ? "DUAL" : undefined,
      bindJumbotron,
    });
    return { kind: "BATTLE", composition };
  }

  if (plan.panelComposition === "CYPHER_COLLABORATIVE_ROWS") {
    const composition = composeCypherProgram({
      sessionId,
      cypherId: input.cypherId ?? `cypher:${plan.roomId}`,
      roomId: plan.roomId,
      circle: input.circle ?? null,
      activeMicId: input.activeMicId ?? null,
      composition: "CIRCLE_FOCUS",
      bindJumbotron,
    });
    return { kind: "CYPHER", composition };
  }

  if (plan.panelComposition === "CHALLENGE_FOCUS") {
    const defaultObjective: ChallengeObjectiveSnapshot = input.objective ?? {
      objectiveId: `obj:${plan.roomId}`,
      objective: "Complete the stated challenge objective",
      category: "OPEN WORK",
      timeLimitSec: 60,
      attemptCount: 1,
      judgingPolicy: "MEASURABLE_RESULT",
      realStakeOrReward: "NONE",
      qualificationRules: ["Real attempt only"],
    };
    const composition = composeChallengeProgram({
      sessionId,
      challengeId: input.challengeId ?? `challenge:${plan.roomId}`,
      roomId: plan.roomId,
      objective: defaultObjective,
      challenger: input.challenger ?? input.cornerA ?? null,
      challenged: input.challenged ?? input.cornerB ?? null,
      bindJumbotron,
    });
    return { kind: "CHALLENGE", composition };
  }

  const eventLower = plan.eventType.toLowerCase();
  if (eventLower.includes("monday")) {
    const feat = input.featured ?? input.cornerA ?? null;
    const next = input.whosNext ?? input.cornerB ?? null;
    const composition = composeMondayNightStageProgram({
      sessionId,
      showId: input.showId ?? `mns:${plan.roomId}`,
      roomId: plan.roomId,
      featuredId: feat?.id ?? null,
      featuredDisplayName: feat?.displayName ?? null,
      whosNextId: next?.id ?? null,
      whosNextDisplayName: next?.displayName ?? null,
      lifecyclePhase: input.mnsLifecyclePhase,
      bindJumbotron,
    });
    return { kind: "MONDAY_NIGHT_STAGE", composition };
  }

  if (plan.cameraProfile === "DANCE_PARTY" || eventLower.includes("dance")) {
    const dj = input.dj ?? input.cornerA ?? null;
    const scope = resolveDancePartyScope(plan.eventType, input.partyScope);
    const composition = composeDancePartyProgram({
      sessionId,
      partyId: input.partyId ?? `wdp:${plan.roomId}`,
      roomId: plan.roomId,
      scope,
      djId: dj?.id ?? null,
      djDisplayName: dj?.displayName ?? null,
      djIsBot: input.dj ? (input.dj.isBot ?? true) : true,
      lifecyclePhase: input.dancePhase,
      bindJumbotron,
    });
    return { kind: "DANCE_PARTY", composition };
  }

  return { kind: "NONE" };
}
