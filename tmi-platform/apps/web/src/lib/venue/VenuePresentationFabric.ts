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

export type VenuePanelCompositionKind =
  | "SINGLE_HD_PANEL"
  | "BATTLE_DUAL_MIXED"
  | "CYPHER_COLLABORATIVE_ROWS"
  | "MULTI_PERFORMER_STAGE"
  | "GROUP_FRAMING"
  | "CHALLENGE_FOCUS";

export type VenueFramingMode = "FULL_BODY" | "GROUP" | "CLOSEUP" | "WIDE_STAGE";

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
    return { kind: "CHALLENGE_FOCUS", layout: "A_DOMINANT", multi: false, maxPanels: 1 };
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
): VenueFramingMode {
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
    framing: resolveFraming(input.eventType, panel.kind),
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

export type VenueProgramBindResult =
  | { kind: "BATTLE"; composition: BattleProgramComposition }
  | { kind: "CYPHER"; composition: CypherProgramComposition }
  | { kind: "NONE" };

/**
 * Bind Battle dual / Cypher collaborative PROGRAM when real participants exist.
 * Never invents competitors — omit corners/circle rather than fabricate.
 */
export function applyVenuePresentationPrograms(input: {
  plan: VenuePresentationFabricPlan;
  sessionId?: string;
  battleId?: string;
  cypherId?: string;
  cornerA?: { id: string; displayName?: string | null } | null;
  cornerB?: { id: string; displayName?: string | null } | null;
  circle?: Array<{ id: string; displayName?: string | null }> | null;
  activeMicId?: string | null;
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

  return { kind: "NONE" };
}
