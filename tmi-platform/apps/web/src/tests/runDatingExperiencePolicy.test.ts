/**
 * Level 1 runtime certification for DatingExperiencePolicy.
 * Dating is 21+ with accepted age assurance (VERIFIED_ADULT).
 * 16/17/18/20 deny. Unknown deny. SELF_DECLARED birthday is not verified.
 * Separate from YouthSocialGuard 18+ private-DM bands.
 */

import {
  canAccessDatingExperience,
  canJoinDatingExperience,
  DATING_EXPERIENCE_MANIFEST,
  datingExperienceMayLaunch,
  isDatingExperience,
  type DatingExperienceSubject,
} from "../lib/trustSafety/DatingExperiencePolicy";

function subject(
  userId: string,
  ageYears: number | null,
  extras?: Partial<DatingExperienceSubject>,
): DatingExperienceSubject {
  return {
    userId,
    ageYears,
    accountSafetyState: "active",
    ...extras,
  };
}

const COMPLETE_DATING_ROOM = {
  ...DATING_EXPERIENCE_MANIFEST,
  slug: "date-lounge",
  id: "date-lounge",
};

export function runDatingExperiencePolicyTest(): Record<string, boolean> {
  const age16 = canAccessDatingExperience(subject("u16", 16, { ageAssurance: "VERIFIED_TEEN" }));
  const age17 = canAccessDatingExperience(subject("u17", 17, { ageAssurance: "SELF_DECLARED" }));
  const age18 = canAccessDatingExperience(subject("u18", 18, { ageAssurance: "VERIFIED_ADULT" }));
  const age20 = canAccessDatingExperience(subject("u20", 20, { ageAssurance: "VERIFIED_ADULT" }));
  const age21Verified = canAccessDatingExperience(
    subject("u21", 21, { ageAssurance: "VERIFIED_ADULT" }),
  );
  const age21SelfDeclared = canAccessDatingExperience(
    subject("u21s", 21, { ageAssurance: "SELF_DECLARED" }),
  );
  const unknown = canAccessDatingExperience(subject("u0", null, { ageAssurance: "UNVERIFIED" }));
  const missingSafety = canAccessDatingExperience({
    userId: "u21x",
    ageYears: 21,
    ageAssurance: "VERIFIED_ADULT",
  });
  const banned = canAccessDatingExperience(
    subject("uban", 30, { ageAssurance: "VERIFIED_ADULT", accountSafetyState: "banned" }),
  );
  const contradictory = canAccessDatingExperience(
    subject("ucon", 21, { ageAssurance: "VERIFIED_TEEN" }),
  );
  const battleNotDating = isDatingExperience({ type: "BATTLE", title: "Priority battle matchmaking" });
  const dateLounge = isDatingExperience({ slug: "date-lounge" });
  const launchIncomplete = datingExperienceMayLaunch({
    experienceClass: "DATING",
    slug: "date-lounge",
  });
  const launchComplete = datingExperienceMayLaunch(COMPLETE_DATING_ROOM);
  const join16 = canJoinDatingExperience(subject("j16", 16), COMPLETE_DATING_ROOM);
  const join21 = canJoinDatingExperience(
    subject("j21", 21, { ageAssurance: "VERIFIED_ADULT" }),
    COMPLETE_DATING_ROOM,
  );
  const passThroughBattle = canJoinDatingExperience(subject("b16", 16), {
    type: "BATTLE",
    slug: "monday-night-stage",
  });

  return {
    age_16_denied: !age16.allowed && age16.code === "UNDER_DATING_AGE",
    age_17_denied: !age17.allowed && age17.code === "UNDER_DATING_AGE",
    age_18_denied: !age18.allowed && age18.code === "UNDER_DATING_AGE",
    age_20_denied: !age20.allowed && age20.code === "UNDER_DATING_AGE",
    age_21_verified_allowed: age21Verified.allowed && age21Verified.code === "DATING_ELIGIBLE",
    age_21_self_declared_denied:
      !age21SelfDeclared.allowed && age21SelfDeclared.code === "ASSURANCE_REQUIRED",
    unknown_age_fail_closed: !unknown.allowed && unknown.code === "UNKNOWN_AGE",
    missing_account_safety_fail_closed: !missingSafety.allowed && missingSafety.code === "ACCOUNT_RESTRICTED",
    banned_account_denied: !banned.allowed && banned.code === "ACCOUNT_RESTRICTED",
    contradictory_age_denied: !contradictory.allowed && contradictory.code === "CONTRADICTORY_AGE",
    battle_matchmaking_is_not_dating: battleNotDating === false,
    date_lounge_is_dating: dateLounge === true,
    dating_room_cannot_launch_without_manifest: !launchIncomplete.allowed && launchIncomplete.code === "MANIFEST_INCOMPLETE",
    dating_manifest_complete_may_launch: launchComplete.allowed,
    join_16_denied: !join16.allowed,
    join_21_verified_allowed: join21.allowed,
    join_date_lounge_slug_still_age_gates: !canJoinDatingExperience(subject("s16", 16), "date-lounge").allowed,
    non_dating_room_passthrough: passThroughBattle.allowed && passThroughBattle.code === "NOT_DATING",
    reasons_are_honest_blocked_labels: age18.reason.startsWith("blocked:"),
    reasons_do_not_display_unverified_age: !age21SelfDeclared.reason.includes("21"),
    no_fake_21_plus_badge_on_deny: !age20.reason.toLowerCase().includes("verified 21"),
  };
}

export function datingExperiencePolicyAllPassed(): boolean {
  return Object.values(runDatingExperiencePolicyTest()).every(Boolean);
}
