/**
 * Level 1 runtime certification for YouthSocialGuard (product private-interact overlay).
 * Protected teens = 16–17. Adults = 18+. Self-declared DOB does not unlock teen access.
 * 18 must never share a private 1:1 lane with 16/17 unless the same verified FamilyAccount.
 */

import {
  canOneToOneSocial,
  canPrivateInteract,
  youthBandFromAgeYears,
  type YouthSocialSubject,
} from "../lib/trustSafety/YouthSocialGuard";
import { hasVerifiedFamilyRelationship } from "../lib/trustSafety/FamilyRelationshipPolicy";

function subject(
  userId: string,
  ageYears: number | null,
  familyAccountId: string | null = null,
  isBot = false,
  extras?: Partial<YouthSocialSubject>,
): YouthSocialSubject {
  return { userId, ageYears, familyAccountId, isBot, ...extras };
}

export function runYouthSocialGuardTest(): Record<string, boolean> {
  const age16 = subject("u16", 16);
  const age17 = subject("u17", 17);
  const age18 = subject("u18", 18);
  const age18b = subject("u18b", 18);
  const age19 = subject("u19", 19);
  const adult = subject("a40", 40);
  const unknown = subject("u0", null);
  const under = subject("kid", 15);
  const teen16Fam = subject("t16f", 16, "fam-1");
  const teen17Fam = subject("t17f", 17, "fam-1");
  const adult18Fam = subject("a18f", 18, "fam-1");
  const adult19Fam = subject("a19f", 19, "fam-1");
  const adultOtherFam = subject("a19x", 19, "fam-2");
  const bot = subject("welcome-bot-001", null, null, true);
  const selfDeclaredAdult = subject("sda", 35, null, false, { ageAssurance: "SELF_DECLARED" });
  const unverified = subject("uv", null, null, false, { ageAssurance: "UNVERIFIED" });
  const estimated = subject("est", 17, null, false, { ageAssurance: "AGE_ESTIMATED" });
  const failed = subject("fail", 22, null, false, { ageAssurance: "VERIFICATION_FAILED" });

  const peers16_17 = canPrivateInteract(age16, age17, "DM");
  const adult18vs16 = canPrivateInteract(age18, age16, "DM");
  const adult18vs17 = canPrivateInteract(age18, age17, "CALL");
  const adult18vs19 = canPrivateInteract(age18, age19, "CALL");
  const adult18vs18 = canPrivateInteract(age18, age18b, "PRIVATE_VIDEO");
  const adults = canPrivateInteract(age19, adult, "PRIVATE_VIDEO");
  const crossNoFamily = canPrivateInteract(age16, age19, "DM");
  const unknownDeny = canPrivateInteract(age16, unknown, "DM");
  const unknownBoth = canPrivateInteract(unknown, unknown, "SCREEN_SHARE");
  const underDeny = canPrivateInteract(under, age16, "DM");
  const family18vs16 = canPrivateInteract(adult18Fam, teen16Fam, "BREAKOUT_INVITE");
  const family18vs17 = canPrivateInteract(adult18Fam, teen17Fam, "DM");
  const family19vs16 = canPrivateInteract(adult19Fam, teen16Fam, "BREAKOUT_INVITE");
  const familyMismatch = canPrivateInteract(teen16Fam, adultOtherFam, "DM");
  const fakeEmptyFamily = canPrivateInteract(
    subject("y", 16, ""),
    subject("a", 18, ""),
    "DM",
  );
  const botYouth = canPrivateInteract(bot, age16, "DM");
  const botUnknown = canPrivateInteract(bot, unknown, "DM");
  const botAdult18 = canPrivateInteract(bot, age18, "DM");
  const selfDeclaredDoesNotUnlock = canPrivateInteract(selfDeclaredAdult, age16, "DM");
  const unverifiedFailClosed = canPrivateInteract(unverified, age16, "DM");
  const estimatedRestricts = canPrivateInteract(estimated, age16, "DM");
  const failedRestrictsTeen = canPrivateInteract(failed, age16, "PRIVATE_MONITOR_ROUTE");
  const aliasMatches = canOneToOneSocial(age16, age18);
  const emptyFamilyPolicy = !hasVerifiedFamilyRelationship(null, "fam-1");

  return {
    band_16_is_youth: youthBandFromAgeYears(16) === "YOUTH",
    band_17_is_youth: youthBandFromAgeYears(17) === "YOUTH",
    band_18_is_adult: youthBandFromAgeYears(18) === "ADULT",
    band_19_is_adult: youthBandFromAgeYears(19) === "ADULT",
    unknown_age_is_unknown_band: youthBandFromAgeYears(null) === "UNKNOWN",
    youth_peers_16_17_allowed: peers16_17.allowed && peers16_17.code === "YOUTH_PEERS",
    age_18_vs_16_denied_without_family: !adult18vs16.allowed && adult18vs16.code === "NO_FAMILY_LINK",
    age_18_vs_17_denied_without_family: !adult18vs17.allowed && adult18vs17.code === "NO_FAMILY_LINK",
    age_18_vs_19_allowed: adult18vs19.allowed && adult18vs19.code === "ADULT_PEERS",
    age_18_vs_18_allowed: adult18vs18.allowed && adult18vs18.code === "ADULT_PEERS",
    adult_peers_allowed: adults.allowed && adults.code === "ADULT_PEERS",
    youth_adult_denied_without_family: !crossNoFamily.allowed && crossNoFamily.blocked,
    unknown_age_fail_closed: !unknownDeny.allowed && unknownDeny.code === "UNKNOWN_AGE",
    unknown_both_fail_closed: !unknownBoth.allowed,
    under_16_denied: !underDeny.allowed && underDeny.code === "BELOW_PLATFORM",
    same_family_allows_18_vs_16: family18vs16.allowed && family18vs16.code === "SAME_FAMILY",
    same_family_allows_18_vs_17: family18vs17.allowed && family18vs17.code === "SAME_FAMILY",
    same_family_account_allows_cross_band: family19vs16.allowed && family19vs16.code === "SAME_FAMILY",
    different_family_ids_denied: !familyMismatch.allowed,
    empty_family_id_not_a_link: !fakeEmptyFamily.allowed && emptyFamilyPolicy,
    bot_cannot_one_to_one_youth: !botYouth.allowed && botYouth.code === "BOT_YOUTH",
    bot_cannot_one_to_one_unknown: !botUnknown.allowed,
    bot_may_one_to_one_known_adult_18: botAdult18.allowed,
    self_declared_adult_cannot_unlock_teen: !selfDeclaredDoesNotUnlock.allowed,
    unverified_fail_closed: !unverifiedFailClosed.allowed,
    age_estimated_restricts_teen_private: !estimatedRestricts.allowed && estimatedRestricts.code === "ASSURANCE_REQUIRED",
    verification_failed_restricts_teen_private: !failedRestrictsTeen.allowed,
    canOneToOneSocial_delegates_to_canPrivateInteract: !aliasMatches.allowed && aliasMatches.context === "DM",
    reasons_are_honest_blocked_labels: crossNoFamily.reason.startsWith("blocked:"),
    reasons_do_not_brand_predator: !crossNoFamily.reason.toLowerCase().includes("predator"),
    reasons_do_not_display_unverified_age: !selfDeclaredDoesNotUnlock.reason.includes("35"),
  };
}

export function youthSocialGuardAllPassed(): boolean {
  return Object.values(runYouthSocialGuardTest()).every(Boolean);
}
