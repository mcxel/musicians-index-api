/**
 * ExperiencePresentationContract.ts — Registry of all experience presentation contracts
 * Single-screen guarantee baked into every entry.
 */

import {
  type CanonicalExperienceType,
  type ExperiencePresentationContract,
  type AccessibilityPresentationContract,
  ALL_CANONICAL_EXPERIENCE_TYPES,
  EXPERIENCE_CONTRACT_VERSION,
} from "./contracts/ExperienceContracts";
import type { PresentationLayout } from "./contracts/PresentationContracts";
import type { HostSuccessionPolicy } from "./contracts/LiveSessionContracts";
import { SurfaceComposer } from "./SurfaceComposer";

function a11y(
  reduced: PresentationLayout,
  allowFlash = false
): AccessibilityPresentationContract {
  return {
    reducedMotionLayout: reduced,
    highContrastOverlay: true,
    captionSafeZone: true,
    screenReaderLabels: {
      primary: "Primary stage",
      audience: "Audience presence",
      overlay: "Session overlays",
    },
    allowFlashEffects: allowFlash,
    suppressVoltronMorph: true,
  };
}

function contract(
  experienceType: CanonicalExperienceType,
  opts: {
    allowedLayouts: PresentationLayout[];
    defaultLayout: PresentationLayout;
    singleScreenFallbackLayout: PresentationLayout;
    voltronAllowed: boolean;
    focusPolicy: ExperiencePresentationContract["focusPolicy"];
    audiencePolicy: ExperiencePresentationContract["audiencePolicy"];
    judgePolicy: ExperiencePresentationContract["judgePolicy"];
    hostSuccessionPolicy: HostSuccessionPolicy;
    hostGracePeriodMs?: number;
    requiredFrameSlots: string[];
    optionalFrameSlots?: string[];
    entrance?: string;
    round?: string;
    finale?: string;
    allowFlash?: boolean;
  }
): ExperiencePresentationContract {
  return {
    experienceType,
    contractVersion: EXPERIENCE_CONTRACT_VERSION,
    allowedLayouts: opts.allowedLayouts,
    defaultLayout: opts.defaultLayout,
    singleScreenFallbackLayout: opts.singleScreenFallbackLayout,
    voltronAllowed: opts.voltronAllowed,
    focusPolicy: opts.focusPolicy,
    audiencePolicy: opts.audiencePolicy,
    judgePolicy: opts.judgePolicy,
    overlayPackId: `overlay.${experienceType.toLowerCase()}`,
    hostSuccessionPolicy: opts.hostSuccessionPolicy,
    hostGracePeriodMs: opts.hostGracePeriodMs ?? 30_000,
    entranceBehavior: opts.entrance ?? "fade_in_host",
    roundBehavior: opts.round ?? "none",
    finaleBehavior: opts.finale ?? "end_card",
    accessibility: a11y(opts.singleScreenFallbackLayout, opts.allowFlash),
    requiredFrameSlots: opts.requiredFrameSlots,
    optionalFrameSlots: opts.optionalFrameSlots ?? [],
  };
}

const REGISTRY: Record<CanonicalExperienceType, ExperiencePresentationContract> = {
  REGULAR_GO_LIVE: contract("REGULAR_GO_LIVE", {
    allowedLayouts: ["FLAT", "RECTANGLE", "PIP", "HYBRID", "MOBILE", "FOCUS"],
    defaultLayout: "FLAT",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "HOST_ONLY",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "END_SESSION",
    requiredFrameSlots: ["PRIMARY", "SELF", "AUDIENCE"],
    optionalFrameSlots: ["SECONDARY", "COMMERCE", "OVERLAY"],
  }),
  FAN_SOCIAL_LIVE: contract("FAN_SOCIAL_LIVE", {
    allowedLayouts: ["FLAT", "GRID", "PIP", "MOBILE"],
    defaultLayout: "GRID",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "SPEAKER_ACTIVE",
    audiencePolicy: "GRID_TILES",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "GRACE_PERIOD",
    requiredFrameSlots: ["PRIMARY", "AUDIENCE", "SELF"],
  }),
  FAN_LOBBY: contract("FAN_LOBBY", {
    allowedLayouts: ["FLAT", "GRID", "MOBILE"],
    defaultLayout: "GRID",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "SPEAKER_ACTIVE",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "AUDIENCE"],
  }),
  PERFORMER_LOBBY: contract("PERFORMER_LOBBY", {
    allowedLayouts: ["FLAT", "PIP", "HYBRID", "MOBILE"],
    defaultLayout: "HYBRID",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "HOST_ONLY",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "GRACE_PERIOD",
    requiredFrameSlots: ["PRIMARY", "SELF", "AUDIENCE"],
  }),
  BATTLE: contract("BATTLE", {
    allowedLayouts: ["SPLIT", "VOLTRON", "PIP", "MULTI_MONITOR", "MOBILE", "FLAT"],
    defaultLayout: "SPLIT",
    singleScreenFallbackLayout: "SPLIT",
    voltronAllowed: true,
    focusPolicy: "ROUND_BASED",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "FRAME_SLOT",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "OPPONENT", "AUDIENCE"],
    optionalFrameSlots: ["JUDGE", "SELF", "OVERLAY"],
    round: "vs_round_clock",
    finale: "winner_takeover",
    allowFlash: true,
  }),
  CYPHER: contract("CYPHER", {
    allowedLayouts: ["GRID", "FOCUS", "VOLTRON", "MOBILE", "FLAT"],
    defaultLayout: "GRID",
    singleScreenFallbackLayout: "FOCUS",
    voltronAllowed: true,
    focusPolicy: "SPEAKER_ACTIVE",
    audiencePolicy: "REACTIONS_ONLY",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "TRANSFER_TO_COHOST",
    requiredFrameSlots: ["PRIMARY", "GUEST", "AUDIENCE"],
    round: "pass_the_mic",
  }),
  CHALLENGE: contract("CHALLENGE", {
    allowedLayouts: ["FOCUS", "PIP", "FLAT", "MOBILE"],
    defaultLayout: "FOCUS",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "ROUND_BASED",
    audiencePolicy: "REACTIONS_ONLY",
    judgePolicy: "CARD_OVERLAY",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "CONTEXT", "AUDIENCE"],
  }),
  GAUNTLET: contract("GAUNTLET", {
    allowedLayouts: ["FOCUS", "SPLIT", "FLAT", "MOBILE"],
    defaultLayout: "FOCUS",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "ROUND_BASED",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "FRAME_SLOT",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "OPPONENT", "JUDGE"],
  }),
  DIRTY_DOZENS: contract("DIRTY_DOZENS", {
    allowedLayouts: ["SPLIT", "VOLTRON", "FLAT", "MOBILE"],
    defaultLayout: "SPLIT",
    singleScreenFallbackLayout: "SPLIT",
    voltronAllowed: true,
    focusPolicy: "ROUND_BASED",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "CARD_OVERLAY",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "OPPONENT", "AUDIENCE"],
    allowFlash: true,
  }),
  DANCE_OFF: contract("DANCE_OFF", {
    allowedLayouts: ["SPLIT", "VOLTRON", "GRID", "FLAT", "MOBILE"],
    defaultLayout: "SPLIT",
    singleScreenFallbackLayout: "SPLIT",
    voltronAllowed: true,
    focusPolicy: "ROUND_BASED",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "FRAME_SLOT",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "OPPONENT", "DJ", "AUDIENCE"],
  }),
  JOKE_OFF: contract("JOKE_OFF", {
    allowedLayouts: ["SPLIT", "FOCUS", "FLAT", "MOBILE"],
    defaultLayout: "SPLIT",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "ROUND_BASED",
    audiencePolicy: "REACTIONS_ONLY",
    judgePolicy: "CARD_OVERLAY",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "OPPONENT", "AUDIENCE"],
  }),
  WORLD_DANCE_PARTY: contract("WORLD_DANCE_PARTY", {
    allowedLayouts: ["HYBRID", "VOLTRON", "GRID", "FLAT", "MOBILE", "MULTI_MONITOR"],
    defaultLayout: "HYBRID",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: true,
    focusPolicy: "PRODUCER_DIRECTED",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "DJ", "AUDIENCE"],
    optionalFrameSlots: ["SECONDARY", "OVERLAY"],
  }),
  MONDAY_NIGHT_STAGE: contract("MONDAY_NIGHT_STAGE", {
    allowedLayouts: ["HYBRID", "FOCUS", "PIP", "FLAT", "MOBILE", "MULTI_MONITOR"],
    defaultLayout: "HYBRID",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "PRODUCER_DIRECTED",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "FRAME_SLOT",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "AUDIENCE", "CONTEXT"],
  }),
  MINI_CONCERT: contract("MINI_CONCERT", {
    allowedLayouts: ["FLAT", "PIP", "HYBRID", "MOBILE"],
    defaultLayout: "FLAT",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "HOST_ONLY",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "END_SESSION",
    requiredFrameSlots: ["PRIMARY", "AUDIENCE", "COMMERCE"],
  }),
  WORLD_CONCERT: contract("WORLD_CONCERT", {
    allowedLayouts: ["HYBRID", "MULTI_MONITOR", "PIP", "FLAT", "MOBILE"],
    defaultLayout: "HYBRID",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "PRODUCER_DIRECTED",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "SECONDARY", "AUDIENCE"],
  }),
  WORLD_RELEASE: contract("WORLD_RELEASE", {
    allowedLayouts: ["FLAT", "PIP", "HYBRID", "MOBILE"],
    defaultLayout: "FLAT",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "HOST_ONLY",
    audiencePolicy: "REACTIONS_ONLY",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "END_SESSION",
    requiredFrameSlots: ["PRIMARY", "CONTEXT", "COMMERCE"],
  }),
  LISTENING_PARTY: contract("LISTENING_PARTY", {
    allowedLayouts: ["FLAT", "GRID", "PIP", "MOBILE"],
    defaultLayout: "FLAT",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "HOST_ONLY",
    audiencePolicy: "GRID_TILES",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "GRACE_PERIOD",
    requiredFrameSlots: ["PRIMARY", "AUDIENCE", "CONTEXT"],
  }),
  WATCH_PARTY: contract("WATCH_PARTY", {
    allowedLayouts: ["PIP", "FLAT", "GRID", "MOBILE"],
    defaultLayout: "PIP",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "SPEAKER_ACTIVE",
    audiencePolicy: "GRID_TILES",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "TRANSFER_TO_COHOST",
    requiredFrameSlots: ["PRIMARY", "AUDIENCE", "SELF"],
  }),
  REHEARSAL: contract("REHEARSAL", {
    allowedLayouts: ["FLAT", "SPLIT", "PIP", "MOBILE"],
    defaultLayout: "FLAT",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "HOST_ONLY",
    audiencePolicy: "HIDDEN",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "END_SESSION",
    requiredFrameSlots: ["PRIMARY", "SELF"],
  }),
  GAME_SHOW: contract("GAME_SHOW", {
    allowedLayouts: ["HYBRID", "GRID", "VOLTRON", "FLAT", "MOBILE", "MULTI_MONITOR"],
    defaultLayout: "HYBRID",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: true,
    focusPolicy: "PRODUCER_DIRECTED",
    audiencePolicy: "AVATAR_WALL",
    judgePolicy: "FRAME_SLOT",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "GUEST", "CONTEXT", "AUDIENCE"],
    allowFlash: true,
  }),
  INTERVIEW: contract("INTERVIEW", {
    allowedLayouts: ["SPLIT", "PIP", "FLAT", "MOBILE"],
    defaultLayout: "SPLIT",
    singleScreenFallbackLayout: "SPLIT",
    voltronAllowed: false,
    focusPolicy: "SPEAKER_ACTIVE",
    audiencePolicy: "REACTIONS_ONLY",
    judgePolicy: "NONE",
    hostSuccessionPolicy: "END_SESSION",
    requiredFrameSlots: ["PRIMARY", "GUEST"],
  }),
  AUDITION: contract("AUDITION", {
    allowedLayouts: ["FOCUS", "FLAT", "PIP", "MOBILE"],
    defaultLayout: "FOCUS",
    singleScreenFallbackLayout: "FLAT",
    voltronAllowed: false,
    focusPolicy: "HOST_ONLY",
    audiencePolicy: "HIDDEN",
    judgePolicy: "FRAME_SLOT",
    hostSuccessionPolicy: "TRANSFER_TO_SYSTEM_HOST",
    requiredFrameSlots: ["PRIMARY", "JUDGE", "SELF"],
  }),
};

export function getExperiencePresentationContract(
  experienceType: CanonicalExperienceType | string
): ExperiencePresentationContract {
  const c = REGISTRY[experienceType as CanonicalExperienceType];
  if (!c) {
    throw new Error(`Unknown experience type: ${experienceType}`);
  }
  return { ...c, accessibility: { ...c.accessibility }, allowedLayouts: [...c.allowedLayouts] };
}

export function listExperiencePresentationContracts(): ExperiencePresentationContract[] {
  return ALL_CANONICAL_EXPERIENCE_TYPES.map((t) => getExperiencePresentationContract(t));
}

/** Cert helper — every experience has a valid one-display composition. */
export function certifySingleScreenForAllExperiences(): {
  ok: boolean;
  certified: boolean;
  totalExperiences: number;
  failedExperiences: string[];
  failures: string[];
} {
  const failures: string[] = [];
  for (const t of ALL_CANONICAL_EXPERIENCE_TYPES) {
    const c = getExperiencePresentationContract(t);
    if (!c.singleScreenFallbackLayout) {
      failures.push(`${t}: missing singleScreenFallbackLayout`);
      continue;
    }
    if (
      c.singleScreenFallbackLayout === "MULTI_MONITOR" ||
      c.singleScreenFallbackLayout === "VOLTRON"
    ) {
      failures.push(`${t}: single-screen fallback cannot be MULTI_MONITOR/VOLTRON`);
    }
    if (!c.allowedLayouts.includes(c.singleScreenFallbackLayout)) {
      failures.push(`${t}: fallback not in allowedLayouts`);
    }
    const spec = SurfaceComposer.buildSingleScreenSpec(
      t,
      c.singleScreenFallbackLayout,
      null
    );
    if (!spec.framePlacement.PRIMARY) {
      failures.push(`${t}: single-screen spec missing PRIMARY`);
    }
  }
  const ok = failures.length === 0;
  return {
    ok,
    certified: ok,
    totalExperiences: ALL_CANONICAL_EXPERIENCE_TYPES.length,
    failedExperiences: failures,
    failures,
  };
}

export { ALL_CANONICAL_EXPERIENCE_TYPES, EXPERIENCE_CONTRACT_VERSION };
