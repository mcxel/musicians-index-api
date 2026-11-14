/**
 * Canonical role-choice authority (Authentication ≠ role selection).
 *
 * ONE persisted source of truth on User:
 *   User.onboardingState === NO_ROLE_SELECTED  → role choice NOT completed
 *   User.onboardingState !== NO_ROLE_SELECTED  → explicit role choice completed
 *     (set by email register with roles[], /api/onboarding/role, or recovery Keep Fan / Add Performer)
 *
 * Do NOT duplicate this flag on UserProfile / FanProfile / ArtistProfile.
 * Rule 31 dual FanProfile/PerformerProfile remains target architecture;
 * companion provisioning uses UserRole + /api/account/companion-profile.
 */

export const ROLE_CHOICE_AUTHORITY_FIELD =
  "User.onboardingState" as const;

export type RoleChoiceOnboardingState =
  | "NO_ROLE_SELECTED"
  | "INCOMPLETE"
  | "COMPLETE";

const CREATOR_ROLES = new Set(["PERFORMER", "ARTIST", "BAND"]);

/** UserStore/OAuth sha256 hex — distinct from bcrypt email register hashes. */
export function isUserStoreSha256PasswordHash(
  passwordHash: string | null | undefined,
): boolean {
  return typeof passwordHash === "string" && /^[a-f0-9]{64}$/i.test(passwordHash);
}

export function isBcryptPasswordHash(
  passwordHash: string | null | undefined,
): boolean {
  return typeof passwordHash === "string" && /^\$2[aby]?\$/.test(passwordHash);
}

/**
 * Explicit role choice is complete when onboardingState has left NO_ROLE_SELECTED.
 * That transition only happens via register(with roles), /api/onboarding/role,
 * or role-choice recovery (Keep Fan / Add Performer).
 */
export function isRoleChoiceCompleted(
  onboardingState: string | null | undefined,
): boolean {
  const state = (onboardingState ?? "NO_ROLE_SELECTED").toUpperCase();
  return state !== "NO_ROLE_SELECTED";
}

/**
 * Deterministic eligibility for the Google auto-FAN recovery modal.
 * Do NOT prompt every Fan. Do NOT guess from role alone.
 *
 * ALL must hold:
 * 1. Primary role is FAN
 * 2. No PERFORMER/ARTIST/BAND companion owned yet
 * 3. onboardingState is still NO_ROLE_SELECTED (never explicit choice)
 * 4. Google auth origin proven by Account.provider=google OR
 *    UserStore sha256 passwordHash (legacy Google OAuth path before Account rows)
 */
export function isGoogleAutoAssignedFanRecoveryEligible(input: {
  role: string;
  onboardingState: string | null | undefined;
  passwordHash: string | null | undefined;
  hasGoogleAccount: boolean;
  ownedRoles: string[];
}): boolean {
  const primary = (input.role ?? "").toUpperCase();
  if (primary !== "FAN") return false;

  if (isRoleChoiceCompleted(input.onboardingState)) return false;

  const owned = new Set(
    (input.ownedRoles ?? []).map((r) => r.toUpperCase()).filter(Boolean),
  );
  owned.add(primary);
  for (const creator of CREATOR_ROLES) {
    if (owned.has(creator)) return false;
  }

  const googleOrigin =
    input.hasGoogleAccount === true ||
    (isUserStoreSha256PasswordHash(input.passwordHash) &&
      !isBcryptPasswordHash(input.passwordHash));

  return googleOrigin;
}

export function needsFreshRoleChoicePage(input: {
  role: string;
  onboardingState: string | null | undefined;
}): boolean {
  const role = (input.role ?? "").toUpperCase();
  if (role === "USER" || role === "") return true;
  return !isRoleChoiceCompleted(input.onboardingState) && role === "USER";
}

export const ROLE_CHOICE_RECOVERY_PROMPT =
  "Did TMI create a Fan side for you when you intended to be a Performer?";
