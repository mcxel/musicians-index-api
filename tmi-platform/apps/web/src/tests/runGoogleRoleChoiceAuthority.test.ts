/**
 * Google / email role-choice authority certification (pure + source guards).
 * Authority: User.onboardingState (NO_ROLE_SELECTED = choice not completed).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  isGoogleAutoAssignedFanRecoveryEligible,
  isRoleChoiceCompleted,
  isUserStoreSha256PasswordHash,
  isBcryptPasswordHash,
  needsFreshRoleChoicePage,
  ROLE_CHOICE_AUTHORITY_FIELD,
  ROLE_CHOICE_RECOVERY_PROMPT,
} from "../lib/auth/roleChoiceAuthority";

function readSrc(rel: string): string {
  return readFileSync(join(__dirname, "..", rel), "utf8");
}

export function runGoogleRoleChoiceAuthorityTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};

  results["authority_field_is_user_onboarding_state"] =
    ROLE_CHOICE_AUTHORITY_FIELD === "User.onboardingState";

  results["role_choice_completed_false_for_no_role_selected"] =
    isRoleChoiceCompleted("NO_ROLE_SELECTED") === false;

  results["role_choice_completed_true_for_incomplete"] =
    isRoleChoiceCompleted("INCOMPLETE") === true;

  results["role_choice_completed_true_for_complete"] =
    isRoleChoiceCompleted("COMPLETE") === true;

  results["fresh_choice_page_for_user_role"] = needsFreshRoleChoicePage({
    role: "user",
    onboardingState: "NO_ROLE_SELECTED",
  });

  results["no_fresh_choice_page_for_explicit_fan"] =
    needsFreshRoleChoicePage({
      role: "fan",
      onboardingState: "INCOMPLETE",
    }) === false;

  // Eligibility — must NOT prompt every Fan
  results["email_fan_not_eligible"] =
    isGoogleAutoAssignedFanRecoveryEligible({
      role: "FAN",
      onboardingState: "NO_ROLE_SELECTED",
      passwordHash: "$2a$10$abcdefghijklmnopqrstuv",
      hasGoogleAccount: false,
      ownedRoles: ["FAN"],
    }) === false;

  results["google_account_fan_no_choice_eligible"] =
    isGoogleAutoAssignedFanRecoveryEligible({
      role: "FAN",
      onboardingState: "NO_ROLE_SELECTED",
      passwordHash: null,
      hasGoogleAccount: true,
      ownedRoles: ["FAN"],
    }) === true;

  results["google_sha256_legacy_fan_eligible"] =
    isGoogleAutoAssignedFanRecoveryEligible({
      role: "FAN",
      onboardingState: "NO_ROLE_SELECTED",
      passwordHash: "a".repeat(64),
      hasGoogleAccount: false,
      ownedRoles: ["FAN"],
    }) === true;

  results["google_fan_with_performer_not_eligible"] =
    isGoogleAutoAssignedFanRecoveryEligible({
      role: "FAN",
      onboardingState: "NO_ROLE_SELECTED",
      passwordHash: "a".repeat(64),
      hasGoogleAccount: true,
      ownedRoles: ["FAN", "PERFORMER"],
    }) === false;

  results["google_fan_choice_completed_not_eligible"] =
    isGoogleAutoAssignedFanRecoveryEligible({
      role: "FAN",
      onboardingState: "INCOMPLETE",
      passwordHash: "a".repeat(64),
      hasGoogleAccount: true,
      ownedRoles: ["FAN"],
    }) === false;

  results["performer_role_alone_not_eligible"] =
    isGoogleAutoAssignedFanRecoveryEligible({
      role: "PERFORMER",
      onboardingState: "NO_ROLE_SELECTED",
      passwordHash: "a".repeat(64),
      hasGoogleAccount: true,
      ownedRoles: ["PERFORMER"],
    }) === false;

  results["hash_helpers"] =
    isUserStoreSha256PasswordHash("ab".repeat(32)) &&
    isBcryptPasswordHash("$2b$10$xxxxxxxx") &&
    !isBcryptPasswordHash("ab".repeat(32));

  results["recovery_prompt_wording"] =
    ROLE_CHOICE_RECOVERY_PROMPT.includes(
      "Did TMI create a Fan side for you when you intended to be a Performer?",
    );

  // Source guards — Google no longer auto-FAN; email requires roles
  const googleCb = readSrc("app/api/auth/google/callback/route.ts");
  results["google_callback_no_silent_fan_default"] =
    !googleCb.includes("hardcoded?.role ?? 'fan'") &&
    googleCb.includes("hardcoded?.role ?? 'user'") &&
    googleCb.includes("onboardingState: 'NO_ROLE_SELECTED'") &&
    googleCb.includes("provider: 'google'");

  results["google_callback_uses_role_choice_authority"] =
    googleCb.includes("needsFreshRoleChoicePage");

  const registerSrc = readSrc("app/api/auth/register/route.ts");
  results["email_register_requires_roles"] =
    registerSrc.includes("ROLE_REQUIRED") &&
    registerSrc.includes("Choose a role before creating your account.") &&
    !registerSrc.includes("platformRoles.push('fan')");

  results["email_register_sets_onboarding_incomplete"] =
    registerSrc.includes("onboardingState: 'INCOMPLETE'");

  const onboardingRole = readSrc("app/api/onboarding/role/route.ts");
  results["onboarding_role_marks_incomplete"] =
    onboardingRole.includes('onboardingState: "INCOMPLETE"') &&
    onboardingRole.includes("userRole.upsert");

  const recoveryRoute = readSrc("app/api/account/role-choice-recovery/route.ts");
  results["recovery_keep_fan_and_add_performer"] =
    recoveryRoute.includes("KEEP_FAN") &&
    recoveryRoute.includes("ADD_PERFORMER") &&
    recoveryRoute.includes("isGoogleAutoAssignedFanRecoveryEligible");

  const layoutSrc = readSrc("app/layout.tsx");
  results["recovery_modal_mounted_in_layout"] =
    layoutSrc.includes("GoogleRoleChoiceRecoveryModal");

  const allPassed = Object.values(results).every(Boolean);
  return { allPassed, results };
}

if (require.main === module) {
  const { allPassed, results } = runGoogleRoleChoiceAuthorityTest();
  console.log(JSON.stringify({ allPassed, results }, null, 2));
  process.exit(allPassed ? 0 : 1);
}
