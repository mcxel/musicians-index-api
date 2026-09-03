/**
 * Preview + fit-validation action enums (Preview Parity Law).
 * Preview may only request actions production Fan environments can execute.
 */

export const AVATAR_PREVIEW_ACTIONS = [
  "IDLE",
  "WALK",
  "SIT",
  "WAVE",
  "SMILE",
  "HYPE",
  /** Production dance clip path (motion package) — same family as Fan Lobby play. */
  "DANCE",
  /** Generic emote alias → production WAVE path (never a preview-only clip). */
  "EMOTE",
  "ARMS_UP",
  "DEEP_SIT",
  "DANCE_RANGE_TEST",
  "PROP_GRIP_TEST",
] as const;

export type AvatarPreviewAction = (typeof AVATAR_PREVIEW_ACTIONS)[number];

/** Core Phase 1 suite required on both Full Studio and Quick Avatar. */
export const PHASE1_MOTION_SUITE: readonly AvatarPreviewAction[] = [
  "IDLE",
  "WALK",
  "DANCE",
  "EMOTE",
] as const;

/** Procedural poses already used in Fan Lobby / AudienceScene (safe without motion package). */
export const PRODUCTION_PROCEDURAL_ACTIONS: readonly AvatarPreviewAction[] = [
  "IDLE",
  "WALK",
  "SIT",
] as const;

/** Require certified facial morphs on the bound Foundry GLB. */
export const FACIAL_PREVIEW_ACTIONS: readonly AvatarPreviewAction[] = ["SMILE"] as const;

/** Require AvatarMotionPackage/1.0 certified on the bound GLB. */
export const MOTION_PACKAGE_PREVIEW_ACTIONS: readonly AvatarPreviewAction[] = [
  "WAVE",
  "HYPE",
  "DANCE",
  "EMOTE",
  "ARMS_UP",
  "DEEP_SIT",
  "DANCE_RANGE_TEST",
  "PROP_GRIP_TEST",
] as const;

/**
 * Map preview aliases onto the production motion path family.
 * EMOTE → WAVE; DANCE stays DANCE (motion package). No preview-only clips.
 */
export function resolveProductionMotionPath(
  action: AvatarPreviewAction,
): AvatarPreviewAction {
  if (action === "EMOTE") return "WAVE";
  return action;
}

export const AVATAR_FIT_VALIDATION_ACTIONS = [
  "SOCKET_FIT",
  "SEAT_FIT",
  "DANCE_CLEARANCE",
  "PROP_GRIP",
  "COLLISION",
  "LOD",
] as const;

export type AvatarFitValidationAction = (typeof AVATAR_FIT_VALIDATION_ACTIONS)[number];
