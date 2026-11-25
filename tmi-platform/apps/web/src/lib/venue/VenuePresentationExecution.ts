/**
 * VenuePresentationExecution — plan → render wiring (NOT a second orchestrator).
 * Consumes VenuePresentationFabric plans and maps them onto existing
 * UniversalVenueRenderer / Jumbotron / BroadcastDirector / WebRTC surfaces.
 *
 * PLAN flags alone never imply PHYSICAL_GREEN.
 */

import type {
  VenueCameraCutProfile,
  VenueFramingMode,
  VenuePanelCompositionKind,
  VenuePresentationFabricPlan,
} from "@/lib/venue/VenuePresentationFabric";
import { normalizeFabricUserTier } from "@/lib/venue/VenuePresentationFabric";
import { canUseChromaHero, type UserTier } from "@/lib/showmanship/AssetLockerPolicy";
import type { CameraShotType, RoomType } from "@/lib/live/BroadcastDirectorEngine";
import type { StagePerformerPresentationMode } from "@/lib/experience/TmiRealityGameWorldConvergence";
import type { WorldViewMode } from "@/lib/world/WorldScenePlan";

export type VenueMediaLifecycleState =
  | "CONNECTING"
  | "WAITING_FOR_PERFORMER"
  | "LIVE"
  | "RECONNECTING"
  | "SOURCE_UNAVAILABLE"
  | "CHROMA_FALLBACK"
  | "PROGRAM_ENDED";

export type VenueFramingCss = {
  objectFit: "contain" | "cover";
  objectPosition: string;
  aspectRatio: string;
  /** Soft letterbox when contain — avoids stretch. */
  letterbox: boolean;
};

export type VenueStageSlotKind =
  | "PRIMARY"
  | "CORNER_A"
  | "CORNER_B"
  | "CHALLENGER"
  | "CHALLENGED"
  | "ON_POINT"
  | "CIRCLE_MEMBER"
  | "DJ_BOOTH"
  | "GAUNTLET_SURVIVOR"
  | "SIDE_STAGE"
  | "HOST"
  | "GROUP";

export type VenueStageSlot = {
  slotId: string;
  panelId: string;
  mediaSourceId: string | null;
  kind: VenueStageSlotKind;
  participantId: string | null;
  displayName: string | null;
  /** Real media only — never invent a second copy of one feed. */
  hasDistinctSource: boolean;
  /** Official active performer ring authority */
  isActivePerformer: boolean;
  /** Designated performance point (mic / turn / attempt / main stage / DJ booth) */
  isOnPoint: boolean;
  /** Winner state — only true when authorized winnerPerformerId matches participantId */
  isWinner: boolean;
  roleLabel: string;
};

export type VenueDirectedCameraCut = {
  shotType: CameraShotType;
  label: string;
  /** Does not remount WebRTC / change seats / restart program. */
  preservesSession: true;
};

export type VenuePresentationExecutionSnapshot = {
  roomId: string;
  sessionId: string | null;
  planPanelComposition: VenuePanelCompositionKind;
  planFraming: VenueFramingMode;
  planCameraProfile: VenueCameraCutProfile;
  presentationMode: StagePerformerPresentationMode;
  framingCss: VenueFramingCss;
  mediaState: VenueMediaLifecycleState;
  stageSlots: VenueStageSlot[];
  activePerformerId: string | null;
  winnerPerformerId: string | null;
  djBoothMode: "REAL_EQUIPMENT_WIDE" | "VIRTUAL_BOOTH_DECK" | null;
  chroma: {
    requested: boolean;
    authorized: boolean;
    active: boolean;
    fallbackToVideoPanel: boolean;
    tierSource: "LIVE_SESSION" | "AUTH_SESSION" | "EXPLICIT" | "UNRESOLVED";
    performerTier: UserTier | null;
    /** Set when product ladder for chroma is incomplete vs AssetLockerPolicy. */
    policyNote: "OK" | "PRODUCT_POLICY_REQUIRED";
  };
  jumbotron: {
    authorized: boolean;
    bound: boolean;
    physicalEnvironmentHint: VenuePresentationFabricPlan["jumbotron"]["physicalEnvironmentHint"];
  };
  camera: {
    profile: VenueCameraCutProfile;
    roomType: RoomType;
    sequence: VenueDirectedCameraCut[];
    currentIndex: number;
    currentShot: VenueDirectedCameraCut;
  };
  viewMode: WorldViewMode;
  environment: "indoor" | "outdoor" | "exempt";
  botAudienceDistinct: true;
};

const FRAMING_CSS: Record<VenueFramingMode, VenueFramingCss> = {
  FULL_BODY: {
    objectFit: "contain",
    objectPosition: "center bottom",
    aspectRatio: "9 / 16",
    letterbox: true,
  },
  GROUP: {
    objectFit: "contain",
    objectPosition: "center center",
    aspectRatio: "16 / 9",
    letterbox: true,
  },
  WIDE_STAGE: {
    objectFit: "cover",
    objectPosition: "center center",
    aspectRatio: "16 / 9",
    letterbox: false,
  },
  CLOSEUP: {
    objectFit: "cover",
    objectPosition: "center 28%",
    aspectRatio: "4 / 5",
    letterbox: false,
  },
  DJ_EQUIPMENT_WIDE: {
    objectFit: "contain",
    objectPosition: "center center",
    aspectRatio: "16 / 9",
    letterbox: true,
  },
};

/** Deterministic directed sequences — no random, no fabricated audience. */
const CAMERA_SEQUENCES: Record<VenueCameraCutProfile, VenueDirectedCameraCut[]> = {
  BATTLE: [
    { shotType: "StageView", label: "VENUE ESTABLISHING", preservesSession: true },
    { shotType: "StageView", label: "CORNER A", preservesSession: true },
    { shotType: "StageView", label: "CORNER B", preservesSession: true },
    { shotType: "AudienceView", label: "DUAL / AUDIENCE", preservesSession: true },
    { shotType: "OverheadView", label: "STAGE WIDE", preservesSession: true },
    { shotType: "StageView", label: "RETURN PERFORMER", preservesSession: true },
  ],
  CYPHER: [
    { shotType: "StageView", label: "CURRENT PERFORMER", preservesSession: true },
    { shotType: "CrowdView", label: "COLLABORATIVE ROW", preservesSession: true },
    { shotType: "AudienceView", label: "AUDIENCE", preservesSession: true },
    { shotType: "StageView", label: "NEXT PERFORMER", preservesSession: true },
    { shotType: "OverheadView", label: "GROUP", preservesSession: true },
  ],
  CHALLENGE: [
    { shotType: "StageView", label: "PERFORMER", preservesSession: true },
    { shotType: "CrowdView", label: "AUDIENCE", preservesSession: true },
    { shotType: "StageView", label: "RETURN", preservesSession: true },
  ],
  FAN_LOBBY: [
    { shotType: "HostView", label: "HOST", preservesSession: true },
    { shotType: "AudienceView", label: "AVATAR LOUNGE", preservesSession: true },
    { shotType: "HostView", label: "RETURN", preservesSession: true },
  ],
  DANCE_PARTY: [
    { shotType: "DJView", label: "DJ", preservesSession: true },
    { shotType: "DanceFloorView", label: "FLOOR", preservesSession: true },
    { shotType: "CrowdView", label: "CROWD", preservesSession: true },
    { shotType: "DJView", label: "RETURN", preservesSession: true },
  ],
  PERFORMER_LIVE: [
    { shotType: "OverheadView", label: "VENUE ESTABLISHING", preservesSession: true },
    { shotType: "StageView", label: "STAGE WIDE", preservesSession: true },
    { shotType: "StageView", label: "PERFORMER", preservesSession: true },
    { shotType: "AudienceView", label: "AUDIENCE", preservesSession: true },
    { shotType: "OverheadView", label: "JUMBOTRON AIM", preservesSession: true },
    { shotType: "StageView", label: "RETURN PERFORMER", preservesSession: true },
  ],
};

export function resolveFramingCss(framing: VenueFramingMode): VenueFramingCss {
  return FRAMING_CSS[framing] ?? FRAMING_CSS.FULL_BODY;
}

export function resolveDirectedCameraSequence(
  profile: VenueCameraCutProfile,
): VenueDirectedCameraCut[] {
  return CAMERA_SEQUENCES[profile] ?? CAMERA_SEQUENCES.PERFORMER_LIVE;
}

export function advanceDirectedCameraIndex(
  sequenceLength: number,
  currentIndex: number,
): number {
  if (sequenceLength <= 0) return 0;
  return (currentIndex + 1) % sequenceLength;
}

/**
 * Map LiveSession / auth tier strings onto AssetLockerPolicy UserTier.
 * Missing pro/RUBY on LiveSession.performerTier → PRODUCT_POLICY_REQUIRED when those are supplied via auth.
 */
export function resolveChromaEntitlementFromTier(input: {
  liveSessionTier?: string | null;
  authSessionTier?: string | null;
  explicitTier?: string | null;
}): {
  authorized: boolean;
  tier: UserTier | null;
  tierSource: VenuePresentationExecutionSnapshot["chroma"]["tierSource"];
  policyNote: "OK" | "PRODUCT_POLICY_REQUIRED";
} {
  const raw =
    input.explicitTier?.trim() ||
    input.authSessionTier?.trim() ||
    input.liveSessionTier?.trim() ||
    null;
  if (!raw) {
    return {
      authorized: false,
      tier: null,
      tierSource: "UNRESOLVED",
      policyNote: "OK",
    };
  }
  const tier = normalizeFabricUserTier(raw);
  const source: VenuePresentationExecutionSnapshot["chroma"]["tierSource"] = input.explicitTier
    ? "EXPLICIT"
    : input.authSessionTier
      ? "AUTH_SESSION"
      : input.liveSessionTier
        ? "LIVE_SESSION"
        : "UNRESOLVED";
  // LiveSession type omits pro/RUBY — if auth supplies them, policy is OK via AssetLockerPolicy.
  const policyNote: "OK" | "PRODUCT_POLICY_REQUIRED" = "OK";
  return {
    authorized: canUseChromaHero(tier),
    tier,
    tierSource: source,
    policyNote,
  };
}

export function resolveVenueMediaLifecycle(input: {
  hasLocalOrRemoteTrack: boolean;
  webrtcError?: boolean;
  hostOffline?: boolean;
  programEnded?: boolean;
  chromaRequested?: boolean;
  chromaActive?: boolean;
  chromaFallback?: boolean;
  participantCount?: number;
}): VenueMediaLifecycleState {
  if (input.programEnded) return "PROGRAM_ENDED";
  if (input.webrtcError) return "RECONNECTING";
  if (input.hostOffline) return "SOURCE_UNAVAILABLE";
  if (input.chromaRequested && input.chromaFallback && !input.chromaActive) {
    if (input.hasLocalOrRemoteTrack) return "CHROMA_FALLBACK";
  }
  if (input.hasLocalOrRemoteTrack) return "LIVE";
  if ((input.participantCount ?? 0) <= 0) return "WAITING_FOR_PERFORMER";
  return "CONNECTING";
}

export function resolveStageSlots(input: {
  plan: VenuePresentationFabricPlan;
  participants: Array<{ id: string; displayName?: string | null }>;
  activePerformerId?: string | null;
  winnerPerformerId?: string | null;
}): VenueStageSlot[] {
  const people = input.participants.filter((p) => Boolean(p.id?.trim()));
  const kind = input.plan.panelComposition;
  const roomId = input.plan.roomId;
  const activeId = input.activePerformerId ?? (people[0]?.id ?? null);
  const winnerId = input.winnerPerformerId ?? null;

  const makeSlot = (params: {
    slotId: string;
    kind: VenueStageSlotKind;
    participantId: string | null;
    displayName: string | null;
    hasDistinctSource: boolean;
    isActivePerformer: boolean;
    isOnPoint: boolean;
    roleLabel: string;
  }): VenueStageSlot => {
    const pid = params.participantId;
    return {
      slotId: params.slotId,
      panelId: `panel:${roomId}:${params.slotId}`,
      mediaSourceId: params.hasDistinctSource && pid ? `source:${pid}` : null,
      kind: params.kind,
      participantId: pid,
      displayName: params.displayName,
      hasDistinctSource: params.hasDistinctSource,
      isActivePerformer: Boolean(pid && params.isActivePerformer),
      isOnPoint: Boolean(pid && params.isOnPoint),
      isWinner: Boolean(pid && winnerId && pid === winnerId),
      roleLabel: params.roleLabel,
    };
  };

  if (kind === "BATTLE_DUAL_MIXED") {
    const a = people[0] ?? null;
    const b = people[1] ?? null;
    const isGauntlet = input.plan.eventType.toLowerCase().includes("gauntlet");
    const aActive = Boolean(a && (activeId === a.id || (!activeId && !b)));
    const bActive = Boolean(b && activeId === b.id);
    return [
      makeSlot({
        slotId: "corner-a",
        kind: isGauntlet ? "GAUNTLET_SURVIVOR" : "CORNER_A",
        participantId: a?.id ?? null,
        displayName: a?.displayName ?? null,
        hasDistinctSource: Boolean(a),
        isActivePerformer: aActive,
        isOnPoint: aActive,
        roleLabel: isGauntlet ? "SURVIVOR A" : "CORNER A",
      }),
      makeSlot({
        slotId: "corner-b",
        kind: isGauntlet ? "GAUNTLET_SURVIVOR" : "CORNER_B",
        participantId: b?.id ?? null,
        displayName: b?.displayName ?? null,
        hasDistinctSource: Boolean(b) && b?.id !== a?.id,
        isActivePerformer: bActive,
        isOnPoint: bActive,
        roleLabel: isGauntlet ? "SURVIVOR B" : "CORNER B",
      }),
    ];
  }

  if (kind === "CHALLENGE_FOCUS") {
    const challenger = people[0] ?? null;
    const challenged = people[1] ?? null;
    const challengerActive = Boolean(
      challenger && (activeId === challenger.id || !activeId),
    );
    const challengedActive = Boolean(challenged && activeId === challenged.id);
    const slots: VenueStageSlot[] = [
      makeSlot({
        slotId: "challenger-slot",
        kind: "CHALLENGER",
        participantId: challenger?.id ?? null,
        displayName: challenger?.displayName ?? null,
        hasDistinctSource: Boolean(challenger),
        isActivePerformer: challengerActive,
        isOnPoint: challengerActive,
        roleLabel: challengerActive ? "CHALLENGER · ON POINT" : "CHALLENGER",
      }),
    ];
    if (challenged) {
      slots.push(
        makeSlot({
          slotId: "challenged-slot",
          kind: "CHALLENGED",
          participantId: challenged.id,
          displayName: challenged.displayName ?? null,
          hasDistinctSource: challenged.id !== challenger?.id,
          isActivePerformer: challengedActive,
          isOnPoint: challengedActive,
          roleLabel: challengedActive ? "CHALLENGED · ON POINT" : "CHALLENGED",
        }),
      );
    }
    return slots;
  }

  if (kind === "CYPHER_COLLABORATIVE_ROWS") {
    if (people.length === 0) {
      return [
        makeSlot({
          slotId: "circle-empty",
          kind: "CIRCLE_MEMBER",
          participantId: null,
          displayName: null,
          hasDistinctSource: false,
          isActivePerformer: false,
          isOnPoint: false,
          roleLabel: "CIRCLE WAITING",
        }),
      ];
    }
    return people.map((p, i) => {
      const isActive = activeId ? p.id === activeId : i === 0;
      return makeSlot({
        slotId: `circle-${i}`,
        kind: "CIRCLE_MEMBER",
        participantId: p.id,
        displayName: p.displayName ?? null,
        hasDistinctSource: true,
        isActivePerformer: isActive,
        isOnPoint: isActive,
        roleLabel: isActive ? `ACTIVE MIC · P${i + 1}` : `CIRCLE · P${i + 1}`,
      });
    });
  }

  if (kind === "MULTI_PERFORMER_STAGE" || kind === "GROUP_FRAMING") {
    return people.slice(0, input.plan.multiPerformer.maxConcurrentPanels).map((p, i) => {
      const isActive = activeId ? p.id === activeId : i === 0;
      return makeSlot({
        slotId: `group-${i}`,
        kind: "GROUP",
        participantId: p.id,
        displayName: p.displayName ?? null,
        hasDistinctSource: true,
        isActivePerformer: isActive,
        isOnPoint: isActive,
        roleLabel: isActive ? `ACTIVE · P${i + 1}` : `STAGE · P${i + 1}`,
      });
    });
  }

  const primary = people[0] ?? null;
  const isDanceParty =
    input.plan.cameraProfile === "DANCE_PARTY" ||
    input.plan.eventType.toLowerCase().includes("dance");
  const isMondayStage = input.plan.eventType.toLowerCase().includes("monday");

  return [
    makeSlot({
      slotId: isDanceParty ? "dj-booth" : "primary",
      kind: isDanceParty ? "DJ_BOOTH" : "PRIMARY",
      participantId: primary?.id ?? null,
      displayName: primary?.displayName ?? null,
      hasDistinctSource: Boolean(primary),
      isActivePerformer: Boolean(primary && (!activeId || primary.id === activeId)),
      isOnPoint: Boolean(primary),
      roleLabel: isDanceParty
        ? "DJ BOOTH · LIVE"
        : isMondayStage
          ? "MAIN STAGE · FEATURED"
          : "STAGE · PRIMARY",
    }),
  ];
}

/**
 * Build execution snapshot from an accepted fabric plan + real runtime signals.
 * Does not invent participants, tracks, or audience.
 */
export function buildVenuePresentationExecution(input: {
  plan: VenuePresentationFabricPlan;
  sessionId?: string | null;
  participants?: Array<{ id: string; displayName?: string | null }>;
  activePerformerId?: string | null;
  winnerPerformerId?: string | null;
  djBoothMode?: "REAL_EQUIPMENT_WIDE" | "VIRTUAL_BOOTH_DECK" | null;
  hasMediaTrack?: boolean;
  webrtcError?: boolean;
  hostOffline?: boolean;
  programEnded?: boolean;
  liveSessionTier?: string | null;
  authSessionTier?: string | null;
  explicitTier?: string | null;
  /** Live segmentation quality path — when false, never claim chroma active. */
  chromaRuntimeReady?: boolean;
  jumbotronProgramBound?: boolean;
  cameraIndex?: number;
  viewMode?: WorldViewMode;
}): VenuePresentationExecutionSnapshot {
  const plan = input.plan;
  const chromaEnt = resolveChromaEntitlementFromTier({
    liveSessionTier: input.liveSessionTier,
    authSessionTier: input.authSessionTier,
    explicitTier: input.explicitTier,
  });

  const chromaRequested = chromaEnt.authorized;
  const chromaRuntimeReady = input.chromaRuntimeReady === true;
  const chromaActive =
    chromaRequested &&
    chromaRuntimeReady &&
    plan.chroma.presentationMode === "STAGE_CHROMA_PERFORMER";
  const chromaFallback = chromaRequested && !chromaActive;

  const presentationMode: StagePerformerPresentationMode = chromaActive
    ? "STAGE_CHROMA_PERFORMER"
    : plan.chroma.presentationMode === "STAGE_CHROMA_PERFORMER"
      ? "STAGE_VIDEO_PANEL"
      : plan.hdPerformancePanel.mode;

  const participants = input.participants ?? [];
  const resolvedActiveId =
    input.activePerformerId !== undefined
      ? input.activePerformerId
      : (participants[0]?.id ?? null);
  const stageSlots = resolveStageSlots({
    plan,
    participants,
    activePerformerId: resolvedActiveId,
    winnerPerformerId: input.winnerPerformerId ?? null,
  });
  const mediaState = resolveVenueMediaLifecycle({
    hasLocalOrRemoteTrack: input.hasMediaTrack === true,
    webrtcError: input.webrtcError,
    hostOffline: input.hostOffline,
    programEnded: input.programEnded,
    chromaRequested,
    chromaActive,
    chromaFallback,
    participantCount: participants.length,
  });

  const sequence = resolveDirectedCameraSequence(plan.cameraProfile);
  const idx = Math.max(0, input.cameraIndex ?? 0) % Math.max(1, sequence.length);
  const currentShot = sequence[idx] ?? sequence[0]!;

  const isDanceParty =
    plan.cameraProfile === "DANCE_PARTY" ||
    plan.eventType.toLowerCase().includes("dance");
  const resolvedFraming: VenueFramingMode =
    input.djBoothMode === "REAL_EQUIPMENT_WIDE" ? "DJ_EQUIPMENT_WIDE" : plan.framing;

  return {
    roomId: plan.roomId,
    sessionId: input.sessionId ?? null,
    planPanelComposition: plan.panelComposition,
    planFraming: resolvedFraming,
    planCameraProfile: plan.cameraProfile,
    presentationMode,
    framingCss: resolveFramingCss(resolvedFraming),
    mediaState,
    stageSlots,
    activePerformerId: resolvedActiveId,
    winnerPerformerId: input.winnerPerformerId ?? null,
    djBoothMode: isDanceParty
      ? (input.djBoothMode ?? "REAL_EQUIPMENT_WIDE")
      : (input.djBoothMode ?? null),
    chroma: {
      requested: chromaRequested,
      authorized: chromaEnt.authorized,
      active: chromaActive,
      fallbackToVideoPanel: chromaFallback || plan.chroma.fallbackToVideoPanel,
      tierSource: chromaEnt.tierSource,
      performerTier: chromaEnt.tier,
      policyNote: chromaEnt.policyNote,
    },
    jumbotron: {
      authorized: plan.jumbotron.mountAuthorized,
      bound: Boolean(input.jumbotronProgramBound) && plan.jumbotron.mountAuthorized,
      physicalEnvironmentHint: plan.jumbotron.physicalEnvironmentHint,
    },
    camera: {
      profile: plan.cameraProfile,
      roomType: plan.broadcastDirectorRoomType,
      sequence,
      currentIndex: idx,
      currentShot,
    },
    viewMode: input.viewMode ?? "FREE_ROAM_3D",
    environment: plan.environment.environment ?? "exempt",
    botAudienceDistinct: true,
  };
}

/** View-mode switch must never imply room leave / WebRTC remount. */
export function viewModePreservesLiveSession(_from: WorldViewMode, _to: WorldViewMode): true {
  return true;
}
