import {
  resolveSessionDisplayName,
  getCanonicalInitials,
  resolveAccountIdentity,
} from "../lib/auth/resolveSessionIdentity";
import { computeAuthoritativeTier } from "../lib/auth/resolveAuthoritativeTier";

function runProfileIdentityTest() {
  const results: Record<string, boolean> = {};

  // 1. Founder / Admin Marcel resolves to "Marcel Dickens" and initial "M"
  const marcelName = resolveSessionDisplayName({ email: "berntmusic33@gmail.com" });
  results["marcel_resolves_marcel_dickens"] = marcelName === "Marcel Dickens";
  results["marcel_initial_is_m"] = getCanonicalInitials(marcelName) === "M";

  // 2. Justin resolves to "Justin King" and initial "J"
  const justinName = resolveSessionDisplayName({ email: "justin@themusiciansindex.com" });
  results["justin_resolves_justin_king"] = justinName === "Justin King";
  results["justin_initial_is_j"] = getCanonicalInitials(justinName) === "J";

  // 3. BJM resolves to "Jay Paul Sanchez" and initial "J"
  const bjmName = resolveSessionDisplayName({ email: "bjmtherapper1@gmail.com" });
  results["bjm_resolves_jay_paul_sanchez"] = bjmName === "Jay Paul Sanchez";

  // 4. Marcel handle ("berntmusic33") is NEVER leaked as display name for another account
  const leakedHandleCheck = resolveSessionDisplayName({
    email: "otherperson@example.com",
    dbDisplayName: "berntmusic33",
  });
  results["marcel_handle_blocked_for_other_accounts"] = leakedHandleCheck !== "berntmusic33";

  // 5. Account A -> Account B isolation (name, avatarUrl, initials, tier)
  const accountA = resolveAccountIdentity({
    userId: "usr_aaaaa",
    email: "alice@example.com",
    displayName: "Alice Vance",
    avatarUrl: "https://cdn.example.com/alice.jpg",
  });
  const tierA = computeAuthoritativeTier("alice@example.com", "FREE");

  const accountB = resolveAccountIdentity({
    userId: "usr_bbbbb",
    email: "bob@example.com",
    displayName: "Bob Smith",
    avatarUrl: null,
  });
  const tierB = computeAuthoritativeTier("bob@example.com", "DIAMOND");

  results["account_a_name_correct"] = accountA.displayName === "Alice Vance";
  results["account_a_avatar_correct"] = accountA.avatarUrl === "https://cdn.example.com/alice.jpg";
  results["account_a_initial_correct"] = accountA.initials === "A";
  results["account_a_tier_correct"] = tierA.tier === "FREE";

  results["account_b_name_correct"] = accountB.displayName === "Bob Smith";
  results["account_b_avatar_null_fallback"] = accountB.avatarUrl === null;
  results["account_b_initial_correct"] = accountB.initials === "B";
  results["account_b_tier_correct"] = tierB.tier === "DIAMOND";

  // 6. Cross-account leakage check: Account A properties must not exist on Account B
  results["no_leak_a_name_to_b"] = accountB.displayName !== accountA.displayName;
  results["no_leak_a_avatar_to_b"] = accountB.avatarUrl !== accountA.avatarUrl;
  results["no_leak_a_initial_to_b"] = accountB.initials !== accountA.initials;
  results["no_leak_a_tier_to_b"] = tierB.tier !== tierA.tier;

  const allPassed = Object.values(results).every(Boolean);

  console.log("[PROFILE_IDENTITY_TEST_ASSERT]", { allPassed, results });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[PROFILE_IDENTITY_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runProfileIdentityTest();
