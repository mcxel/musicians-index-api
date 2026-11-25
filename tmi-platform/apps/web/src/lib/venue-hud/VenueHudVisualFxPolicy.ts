/**
 * VenueHudVisualFxPolicy — §19715–§19792
 *
 * One FX / BACKGROUND Venue HUD control → live video compositor toolbox.
 * Reuses LiveEffectRuntime + TmiFilterEngine + ChromaSegmentationRuntime.
 * NEW_CAMERA_EFFECT_ENGINE = NO.
 * Visual change never remounts camera/mic/WebRTC.
 */

import type { EraPresetId } from "@/lib/effects/TmiFilterEngine";
import type { BackgroundMode } from "@/lib/effects/LiveEffectRuntime";
import type { ChromaCutoutMethod } from "@/lib/venue/ChromaSegmentationRuntime";
import { resolveFlagVisual } from "@/lib/global/FlagAssetResolver";

export const VENUE_HUD_VISUAL_FX_POLICY_ID = "VENUE_HUD_VISUAL_FX_POLICY_v1" as const;

export const VENUE_HUD_VISUAL_FX_CONTROL = true as const;
export const BLACK_AND_WHITE_EFFECT = true as const;
export const RETRO_EFFECT = true as const;
export const SEVENTIES_EFFECT = true as const;
export const EIGHTIES_EFFECT = true as const; // mapped to neon_aura / camcorder — PARTIAL era label honesty
export const CUSTOM_IMAGE_BACKGROUND = true as const;
export const TMI_VENUE_BACKGROUND = true as const;
export const AUDIENCE_BACKGROUND = true as const;
export const SCREEN_SHARE_BACKGROUND = true as const; // policy surface; platform permission required

export const NEW_CAMERA_EFFECT_ENGINE = false as const;
export const VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA = 0 as const;
export const VISUAL_EFFECT_CHANGE_RECONNECTS_MIC = 0 as const;
export const BACKGROUND_SCREEN_SHARE_BYPASSES_PERMISSION = 0 as const;
export const VISUAL_EFFECT_FAILURE_KILLS_CAMERA = 0 as const;
export const VISUAL_EFFECT_CHANGES_SCORE = 0 as const;
export const VISUAL_EFFECT_CHANGES_VOTE_WEIGHT = 0 as const;

export const CANONICAL_CAMERA_EFFECT_AUTHORITY =
  "LiveEffectRuntime + TmiFilterEngine (CSS/GPU filters; ZERO RECONNECTION LAW)" as const;
export const CANONICAL_GREEN_SCREEN_AUTHORITY =
  "ChromaSegmentationRuntime CHROMA_KEY + VenueChromaCompositeLayer + ArenaEventShell chromaRuntime" as const;
export const CANONICAL_SEGMENTATION_AUTHORITY =
  "ChromaSegmentationRuntime AI_SUBJECT_CUTOUT — aiCutoutStatus UNBOUND until backend bound (GAP for AI)" as const;
export const CANONICAL_VIDEO_COMPOSITOR =
  "BACKGROUND → PERFORMER CUTOUT → OPTIONAL FRAME → FILTER → SHOW GRAPHICS → Program source" as const;
export const CANONICAL_BACKGROUND_MEDIA_AUTHORITY =
  "LiveEffectRuntime BackgroundMode PHOTO_BG | STAGE_3D | ERA_WORLD | MY_ROOM | BLUR — reuse media upload authority" as const;
export const CANONICAL_SCREEN_SHARE_AUTHORITY =
  "Browser/OS getDisplayMedia permission — CAMERA FOREGROUND + SHARE BACKGROUND mode (PARTIAL wiring)" as const;
export const CANONICAL_VISUAL_PRESET_AUTHORITY =
  "PARTIAL — LiveEffectRuntime state; SAVE STAGE LOOK not yet a durable preset store" as const;

export type VisualFxModeId =
  | "ORIGINAL"
  | "GREEN_SCREEN"
  | "SEGMENTATION"
  | "CUSTOM_IMAGE"
  | "CUSTOM_VIDEO"
  | "COUNTRY_FLAG"
  | "TMI_VENUE_BACKGROUND"
  | "AUDIENCE_BACKGROUND"
  | "SCREEN_SHARE_BACKGROUND"
  | "BLACK_AND_WHITE"
  | "SIXTIES"
  | "RETRO"
  | "SEVENTIES"
  | "EIGHTIES";

export type FxStatus = "PRESENT" | "PARTIAL" | "GAP";

export const VISUAL_FX_MODE_AUDIT: Record<
  VisualFxModeId,
  {
    status: FxStatus;
    authority: string;
    cameraRequired: true;
    segmentationChroma: string;
    backgroundSource: string;
    audioImpact: "NONE" | "OPTIONAL_SHARE_AUDIO";
    mobile: FxStatus;
  }
> = {
  ORIGINAL: {
    status: "PRESENT",
    authority: "TmiFilterEngine natural + LiveEffectRuntime MY_ROOM",
    cameraRequired: true,
    segmentationChroma: "none",
    backgroundSource: "none",
    audioImpact: "NONE",
    mobile: "PRESENT",
  },
  GREEN_SCREEN: {
    status: "PRESENT",
    authority: "ChromaSegmentationRuntime CHROMA_KEY",
    cameraRequired: true,
    segmentationChroma: "CHROMA_KEY",
    backgroundSource: "keyed replace",
    audioImpact: "NONE",
    mobile: "PARTIAL",
  },
  SEGMENTATION: {
    status: "GAP",
    authority: "AI_SUBJECT_CUTOUT unbound (aiCutoutStatus UNBOUND)",
    cameraRequired: true,
    segmentationChroma: "AI_SUBJECT_CUTOUT",
    backgroundSource: "cutout replace",
    audioImpact: "NONE",
    mobile: "GAP",
  },
  CUSTOM_IMAGE: {
    status: "PRESENT",
    authority: "LiveEffectRuntime PHOTO_BG",
    cameraRequired: true,
    segmentationChroma: "CHROMA_KEY or REAL_BACKGROUND",
    backgroundSource: "authorized image",
    audioImpact: "NONE",
    mobile: "PARTIAL",
  },
  CUSTOM_VIDEO: {
    status: "GAP",
    authority: "No proven video-loop background binding in LiveEffectRuntime",
    cameraRequired: true,
    segmentationChroma: "required for clean subject",
    backgroundSource: "video loop",
    audioImpact: "NONE",
    mobile: "GAP",
  },
  COUNTRY_FLAG: {
    status: "PARTIAL",
    authority: "FlagAssetResolver — verified graphic only; never stretch emoji fullscreen",
    cameraRequired: true,
    segmentationChroma: "CHROMA_KEY preferred",
    backgroundSource: "/flags/iso/{ISO}.svg when OWNER_VERIFIED|STANDARD_APPROVED",
    audioImpact: "NONE",
    mobile: "PARTIAL",
  },
  TMI_VENUE_BACKGROUND: {
    status: "PRESENT",
    authority: "LiveEffectRuntime STAGE_3D / ERA_WORLD + venue stage slug",
    cameraRequired: true,
    segmentationChroma: "CHROMA preferred",
    backgroundSource: "approved TMI venue asset",
    audioImpact: "NONE",
    mobile: "PARTIAL",
  },
  AUDIENCE_BACKGROUND: {
    status: "PARTIAL",
    authority: "Approved Audience/Venue view as background — not private Fan cameras",
    cameraRequired: true,
    segmentationChroma: "CHROMA preferred",
    backgroundSource: "Audience camera / venue crowd view",
    audioImpact: "NONE",
    mobile: "PARTIAL",
  },
  SCREEN_SHARE_BACKGROUND: {
    status: "PARTIAL",
    authority: "getDisplayMedia + compositor — CAMERA FOREGROUND / SHARE BACKGROUND",
    cameraRequired: true,
    segmentationChroma: "optional cutout",
    backgroundSource: "window/tab/screen (user choice)",
    audioImpact: "OPTIONAL_SHARE_AUDIO",
    mobile: "GAP",
  },
  BLACK_AND_WHITE: {
    status: "PRESENT",
    authority: "TmiFilterEngine noir_1950 (grayscale)",
    cameraRequired: true,
    segmentationChroma: "n/a",
    backgroundSource: "n/a",
    audioImpact: "NONE",
    mobile: "PRESENT",
  },
  SIXTIES: {
    status: "PARTIAL",
    authority: "No dedicated 1960s preset — maps camcorder_1990 (honest PARTIAL until dedicated preset)",
    cameraRequired: true,
    segmentationChroma: "n/a",
    backgroundSource: "n/a",
    audioImpact: "NONE",
    mobile: "PARTIAL",
  },
  RETRO: {
    status: "PRESENT",
    authority: "TmiFilterEngine camcorder_1990 / chromatic_glitch overlays",
    cameraRequired: true,
    segmentationChroma: "n/a",
    backgroundSource: "n/a",
    audioImpact: "NONE",
    mobile: "PRESENT",
  },
  SEVENTIES: {
    status: "PRESENT",
    authority: "TmiFilterEngine warm_1970",
    cameraRequired: true,
    segmentationChroma: "n/a",
    backgroundSource: "n/a",
    audioImpact: "NONE",
    mobile: "PRESENT",
  },
  EIGHTIES: {
    status: "PARTIAL",
    authority: "No dedicated '80s' preset id — map neon_aura / camcorder_1990 (honest PARTIAL)",
    cameraRequired: true,
    segmentationChroma: "n/a",
    backgroundSource: "n/a",
    audioImpact: "NONE",
    mobile: "PARTIAL",
  },
};

/** Filter ↔ EraPresetId mapping for HUD. */
export const FILTER_TO_PRESET: Partial<Record<VisualFxModeId, EraPresetId>> = {
  ORIGINAL: "natural",
  BLACK_AND_WHITE: "noir_1950",
  SIXTIES: "camcorder_1990",
  SEVENTIES: "warm_1970",
  RETRO: "camcorder_1990",
  EIGHTIES: "neon_aura",
};

export type BackgroundSourceKind =
  | "NONE"
  | "CHROMA_KEY"
  | "IMAGE"
  | "VIDEO"
  | "COUNTRY_FLAG"
  | "TMI_VENUE"
  | "AUDIENCE_VIEW"
  | "SCREEN_SHARE";

type VisualFxSession = {
  sessionId: string;
  performerId: string;
  filterMode: VisualFxModeId;
  backgroundKind: BackgroundSourceKind;
  backgroundAssetId: string | null;
  shareAudio: boolean;
  cameraConnected: true;
  micConnected: true;
  webrtcIntact: true;
};

const sessions = new Map<string, VisualFxSession>();

function key(sessionId: string, performerId: string) {
  return `${sessionId}:${performerId}`;
}

function ensure(sessionId: string, performerId: string): VisualFxSession {
  const k = key(sessionId, performerId);
  let s = sessions.get(k);
  if (!s) {
    s = {
      sessionId,
      performerId,
      filterMode: "ORIGINAL",
      backgroundKind: "NONE",
      backgroundAssetId: null,
      shareAudio: false,
      cameraConnected: true,
      micConnected: true,
      webrtcIntact: true,
    };
    sessions.set(k, s);
  }
  return s;
}

export function resolveBackgroundMode(kind: BackgroundSourceKind): BackgroundMode {
  switch (kind) {
    case "IMAGE":
    case "COUNTRY_FLAG":
      return "PHOTO_BG";
    case "TMI_VENUE":
    case "AUDIENCE_VIEW":
      return "STAGE_3D";
    case "NONE":
      return "MY_ROOM";
    default:
      return "MY_ROOM";
  }
}

/**
 * Country flag as virtual background — only when FlagAssetResolver has a real graphic.
 * Never stretch emoji into a fullscreen background.
 */
export function resolveCountryFlagBackground(countryCode: string | null | undefined): {
  ok: boolean;
  reason: string;
  imageUrl: string | null;
  countryCode: string | null;
} {
  if (!countryCode?.trim()) {
    return { ok: false, reason: "NO_COUNTRY_SELECTED", imageUrl: null, countryCode: null };
  }
  const visual = resolveFlagVisual(countryCode);
  if (!visual) {
    return { ok: false, reason: "UNKNOWN_COUNTRY", imageUrl: null, countryCode: null };
  }
  if (
    !visual.imageUrl ||
    visual.assetStatus === "EMOJI_FALLBACK" ||
    visual.assetStatus === "CDN_TWEMOJI" ||
    visual.assetStatus === "MISSING"
  ) {
    return {
      ok: false,
      reason: "FLAG_GRAPHIC_UNAVAILABLE",
      imageUrl: null,
      countryCode: visual.countryCode,
    };
  }
  return {
    ok: true,
    reason: "FLAG_GRAPHIC_READY",
    imageUrl: visual.imageUrl,
    countryCode: visual.countryCode,
  };
}

export function resolveCutoutMethod(kind: BackgroundSourceKind): ChromaCutoutMethod {
  if (kind === "CHROMA_KEY") return "CHROMA_KEY";
  if (kind === "NONE") return "REAL_BACKGROUND";
  return "CHROMA_KEY";
}

/** Apply filter — presentation only; never remount. */
export function applyVisualFilter(input: {
  sessionId: string;
  performerId: string;
  mode: VisualFxModeId;
}): {
  ok: boolean;
  presetId: EraPresetId | null;
  status: FxStatus;
  VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0;
  VISUAL_EFFECT_CHANGE_RECONNECTS_MIC: 0;
  VISUAL_EFFECT_CHANGES_SCORE: 0;
  VISUAL_EFFECT_CHANGES_VOTE_WEIGHT: 0;
} {
  const audit = VISUAL_FX_MODE_AUDIT[input.mode];
  if (audit.status === "GAP" && ["SEGMENTATION", "CUSTOM_VIDEO"].includes(input.mode)) {
    return {
      ok: false,
      presetId: null,
      status: "GAP",
      VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0,
      VISUAL_EFFECT_CHANGE_RECONNECTS_MIC: 0,
      VISUAL_EFFECT_CHANGES_SCORE: 0,
      VISUAL_EFFECT_CHANGES_VOTE_WEIGHT: 0,
    };
  }
  const s = ensure(input.sessionId, input.performerId);
  s.filterMode = input.mode;
  return {
    ok: true,
    presetId: FILTER_TO_PRESET[input.mode] ?? null,
    status: audit.status,
    VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0,
    VISUAL_EFFECT_CHANGE_RECONNECTS_MIC: 0,
    VISUAL_EFFECT_CHANGES_SCORE: 0,
    VISUAL_EFFECT_CHANGES_VOTE_WEIGHT: 0,
  };
}

export function applyBackground(input: {
  sessionId: string;
  performerId: string;
  kind: BackgroundSourceKind;
  assetId?: string | null;
  osPermissionGranted?: boolean;
}): {
  ok: boolean;
  reason: string;
  liveEffectBackgroundMode: BackgroundMode;
  cutout: ChromaCutoutMethod;
  BACKGROUND_SCREEN_SHARE_BYPASSES_PERMISSION: 0;
  VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0;
  doesNotMoveWorldPosition: true;
} {
  if (input.kind === "SCREEN_SHARE" && input.osPermissionGranted !== true) {
    return {
      ok: false,
      reason: "OS_PERMISSION_REQUIRED",
      liveEffectBackgroundMode: "MY_ROOM",
      cutout: "REAL_BACKGROUND",
      BACKGROUND_SCREEN_SHARE_BYPASSES_PERMISSION: 0,
      VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0,
      doesNotMoveWorldPosition: true,
    };
  }
  if (input.kind === "VIDEO" && VISUAL_FX_MODE_AUDIT.CUSTOM_VIDEO.status === "GAP") {
    return {
      ok: false,
      reason: "CUSTOM_VIDEO_GAP",
      liveEffectBackgroundMode: "MY_ROOM",
      cutout: "REAL_BACKGROUND",
      BACKGROUND_SCREEN_SHARE_BYPASSES_PERMISSION: 0,
      VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0,
      doesNotMoveWorldPosition: true,
    };
  }
  if (input.kind === "COUNTRY_FLAG") {
    const flag = resolveCountryFlagBackground(input.assetId);
    if (!flag.ok || !flag.imageUrl) {
      return {
        ok: false,
        reason: flag.reason,
        liveEffectBackgroundMode: "MY_ROOM",
        cutout: "REAL_BACKGROUND",
        BACKGROUND_SCREEN_SHARE_BYPASSES_PERMISSION: 0,
        VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0,
        doesNotMoveWorldPosition: true,
      };
    }
  }
  const s = ensure(input.sessionId, input.performerId);
  s.backgroundKind = input.kind;
  s.backgroundAssetId = input.assetId ?? null;
  return {
    ok: true,
    reason: "APPLIED",
    liveEffectBackgroundMode: resolveBackgroundMode(input.kind),
    cutout: resolveCutoutMethod(input.kind),
    BACKGROUND_SCREEN_SHARE_BYPASSES_PERMISSION: 0,
    VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA: 0,
    doesNotMoveWorldPosition: true,
  };
}

export function resetVisuals(sessionId: string, performerId: string): {
  ok: true;
  VISUAL_EFFECT_FAILURE_KILLS_CAMERA: 0;
} {
  const s = ensure(sessionId, performerId);
  s.filterMode = "ORIGINAL";
  s.backgroundKind = "NONE";
  s.backgroundAssetId = null;
  s.shareAudio = false;
  return { ok: true, VISUAL_EFFECT_FAILURE_KILLS_CAMERA: 0 };
}

export function failVisualEffectSafely(sessionId: string, performerId: string): {
  fallback: "ORIGINAL";
  VISUAL_EFFECT_FAILURE_KILLS_CAMERA: 0;
  cameraAlive: true;
} {
  resetVisuals(sessionId, performerId);
  return { fallback: "ORIGINAL", VISUAL_EFFECT_FAILURE_KILLS_CAMERA: 0, cameraAlive: true };
}

/** Stacking: filter + one background source. Two background kinds exclusive. */
export function resolveEffectStack(input: {
  filter: VisualFxModeId;
  background: BackgroundSourceKind;
}): {
  allowed: boolean;
  VISUAL_EFFECT_STACKING: "PARTIAL";
  reason: string;
} {
  const bgModes: BackgroundSourceKind[] = [
    "CHROMA_KEY",
    "IMAGE",
    "VIDEO",
    "COUNTRY_FLAG",
    "TMI_VENUE",
    "AUDIENCE_VIEW",
    "SCREEN_SHARE",
  ];
  // Single background source only
  void bgModes;
  if (input.background === "VIDEO") {
    return { allowed: false, VISUAL_EFFECT_STACKING: "PARTIAL", reason: "CUSTOM_VIDEO_GAP" };
  }
  return {
    allowed: true,
    VISUAL_EFFECT_STACKING: "PARTIAL",
    reason: "FILTER_PLUS_ONE_BACKGROUND",
  };
}

export function visualFxHudMatrix(): Array<{
  experience: string;
  fxButton: true;
  background: boolean;
  filters: boolean;
  screenShareBackground: boolean;
  restriction: string;
}> {
  return [
    { experience: "BATTLE", fxButton: true, background: true, filters: true, screenShareBackground: true, restriction: "none unless game rule" },
    { experience: "CHALLENGE", fxButton: true, background: true, filters: true, screenShareBackground: true, restriction: "none unless game rule" },
    { experience: "CYPHER", fxButton: true, background: true, filters: true, screenShareBackground: true, restriction: "none" },
    { experience: "MNS", fxButton: true, background: true, filters: true, screenShareBackground: true, restriction: "none" },
    { experience: "MONTHLY_IDOL", fxButton: true, background: true, filters: true, screenShareBackground: false, restriction: "clean vocal camera preferred" },
    { experience: "DIRTY_DOZENS", fxButton: true, background: true, filters: true, screenShareBackground: true, restriction: "none" },
    { experience: "WDP_DJ", fxButton: true, background: true, filters: true, screenShareBackground: true, restriction: "DJ cam only" },
    { experience: "GAME_SHOW", fxButton: true, background: true, filters: true, screenShareBackground: false, restriction: "may disable if hides game content" },
    { experience: "LOUNGE", fxButton: true, background: true, filters: true, screenShareBackground: true, restriction: "optional" },
  ];
}

export function venueHudVisualFxBoundaryLocks() {
  return {
    VENUE_HUD_VISUAL_FX_CONTROL,
    BLACK_AND_WHITE_EFFECT,
    RETRO_EFFECT,
    SEVENTIES_EFFECT,
    EIGHTIES_EFFECT,
    CUSTOM_IMAGE_BACKGROUND,
    TMI_VENUE_BACKGROUND,
    AUDIENCE_BACKGROUND,
    SCREEN_SHARE_BACKGROUND,
    NEW_CAMERA_EFFECT_ENGINE,
    VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA,
    VISUAL_EFFECT_CHANGE_RECONNECTS_MIC,
    BACKGROUND_SCREEN_SHARE_BYPASSES_PERMISSION,
    VISUAL_EFFECT_FAILURE_KILLS_CAMERA,
    VISUAL_EFFECT_CHANGES_SCORE,
    VISUAL_EFFECT_CHANGES_VOTE_WEIGHT,
    CANONICAL_CAMERA_EFFECT_AUTHORITY,
    CANONICAL_GREEN_SCREEN_AUTHORITY,
    CANONICAL_SEGMENTATION_AUTHORITY,
    CANONICAL_VIDEO_COMPOSITOR,
    CANONICAL_BACKGROUND_MEDIA_AUTHORITY,
    CANONICAL_SCREEN_SHARE_AUTHORITY,
    CANONICAL_VISUAL_PRESET_AUTHORITY,
    SEGMENTATION: VISUAL_FX_MODE_AUDIT.SEGMENTATION.status,
    CUSTOM_VIDEO_BACKGROUND: VISUAL_FX_MODE_AUDIT.CUSTOM_VIDEO.status,
    SCREEN_SHARE_AUDIO: "PARTIAL" as const,
    SAVE_STAGE_LOOK: "GAP" as const,
    VISUAL_EFFECT_STACKING: "PARTIAL" as const,
  };
}

export function resetVenueHudVisualFxForTests(): void {
  sessions.clear();
}
