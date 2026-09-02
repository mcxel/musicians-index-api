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
  "ARMS_UP",
  "DEEP_SIT",
  "DANCE_RANGE_TEST",
  "PROP_GRIP_TEST",
] as const;

export type AvatarPreviewAction = (typeof AVATAR_PREVIEW_ACTIONS)[number];

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
  "ARMS_UP",
  "DEEP_SIT",
  "DANCE_RANGE_TEST",
  "PROP_GRIP_TEST",
] as const;

export const AVATAR_FIT_VALIDATION_ACTIONS = [
  "SOCKET_FIT",
  "SEAT_FIT",
  "DANCE_CLEARANCE",
  "PROP_GRIP",
  "COLLISION",
  "LOD",
] as const;

export type AvatarFitValidationAction = (typeof AVATAR_FIT_VALIDATION_ACTIONS)[number];
