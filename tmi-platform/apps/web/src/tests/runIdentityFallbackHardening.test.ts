/**
 * Identity Fallback Hardening Test Suite
 *
 * Covers the correction (Marcel Dickens, 2026-09-06) to
 * resolveActiveProfileIdentity's cookie-derived fallback: a successful DB
 * query that finds no account must NEVER produce a plausible authenticated
 * identity from cookies. ACCOUNT_FALLBACK is only legitimate for a verified
 * existing account on the current (pre-Rule-31) shared-identity schema, not
 * for an identity synthesized because account existence couldn't be
 * established.
 *
 * Verifies:
 *   1. existing_account_resolves_canonical_identity
 *   2. account_without_profile_split_is_legitimate_fallback (ACCOUNT_FALLBACK
 *      is correctly used for a real, found account -- the legitimate case)
 *   3. successful_query_missing_user_is_invalid_not_fallback (the core fix:
 *      not_found must never consult degradedSessionSource)
 *   4. deleted_account_stale_cookie_is_invalid_not_fallback
 *   5. db_unavailable_is_distinguishable_from_verified (status stays
 *      DB_UNAVAILABLE even when a degraded identity is returned -- never
 *      silently equivalent to RESOLVED)
 *   6. identity_source_is_always_server_session_userid (structural check:
 *      the route derives userId from the authenticated session only, never
 *      from a client-suppliable "viewed profile" parameter)
 */

import {
  decideIdentityLookupOutcome,
  type IdentityQueryOutcome,
} from "../lib/account/resolveActiveProfileIdentity";
import * as fs from "fs";
import * as path from "path";

export function runIdentityFallbackHardeningTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};

  // 1. Existing account -> canonical, verified identity
  const foundOutcome: IdentityQueryOutcome = {
    kind: "found",
    account: {
      id: "user-1",
      role: "FAN",
      activeRole: "FAN",
      displayName: "Real User",
      name: "Real User",
      userRoles: [{ role: "FAN" }],
      username: "realuser",
      avatarUrl: null,
    },
  };
  const resolved = decideIdentityLookupOutcome(foundOutcome);
  results["existing_account_resolves_canonical_identity"] =
    resolved.status === "RESOLVED" &&
    resolved.identity?.accountUserId === "user-1" &&
    resolved.identity?.publicDisplayName === "Real User";

  // 2. Real found account, no dedicated FanProfile/PerformerProfile row yet
  // -- ACCOUNT_FALLBACK is the LEGITIMATE profileKind here, precisely
  // because the account is verified, not because it's unverifiable.
  results["account_without_profile_split_is_legitimate_fallback"] =
    resolved.status === "RESOLVED" && resolved.identity?.profileKind === "ACCOUNT_FALLBACK";

  // 3. Successful query, no matching user -- must be INVALID_ACCOUNT with a
  // null identity, even though a plausible-looking degradedSessionSource is
  // supplied. This is the core bug being fixed: not_found must never
  // consult the fallback source.
  const notFoundOutcome: IdentityQueryOutcome = { kind: "not_found" };
  const invalid = decideIdentityLookupOutcome(notFoundOutcome, {
    id: "user-1",
    role: "FAN",
    displayName: "Should Never Appear",
    username: "ghostuser",
  });
  results["successful_query_missing_user_is_invalid_not_fallback"] =
    invalid.status === "INVALID_ACCOUNT" && invalid.identity === null;

  // 4. Deleted account + stale cookie -- same shape as (3), framed as the
  // real-world scenario the fix protects against.
  const deletedAccountFallback = decideIdentityLookupOutcome(
    { kind: "not_found" },
    {
      id: "deleted-user-42",
      role: "PERFORMER",
      activeRole: "PERFORMER",
      displayName: "Deleted Performer",
      name: "Deleted Performer",
      username: "deletedperformer",
      avatarUrl: "https://example.com/stale-avatar.jpg",
    },
  );
  results["deleted_account_stale_cookie_is_invalid_not_fallback"] =
    deletedAccountFallback.status === "INVALID_ACCOUNT" && deletedAccountFallback.identity === null;

  // 5. DB unavailable -- degraded identity allowed (existing resilience
  // policy, mirrors getTmiAuth()), but status must stay DB_UNAVAILABLE so
  // it is never indistinguishable from a verified RESOLVED identity.
  const dbErrorOutcome: IdentityQueryOutcome = { kind: "error" };
  const degraded = decideIdentityLookupOutcome(dbErrorOutcome, {
    id: "user-1",
    role: "FAN",
    displayName: "Cached Session Name",
  });
  results["db_unavailable_is_distinguishable_from_verified"] =
    degraded.status === "DB_UNAVAILABLE" &&
    (degraded.status as string) !== "RESOLVED" &&
    degraded.identity?.publicDisplayName === "Cached Session Name";

  // Also confirm DB_UNAVAILABLE with no fallback source at all returns no identity.
  const degradedNoSource = decideIdentityLookupOutcome(dbErrorOutcome);
  results["db_unavailable_without_source_returns_no_identity"] =
    degradedNoSource.status === "DB_UNAVAILABLE" && degradedNoSource.identity === null;

  // 6. Structural: GET /api/account/identity must derive the userId from
  // the authenticated server session only, never from a client-suppliable
  // "viewed profile" id/query param -- so a signed-in user viewing someone
  // else's public profile can never contaminate their own account-menu
  // identity.
  const routeSrc = fs.readFileSync(
    path.join(__dirname, "../app/api/account/identity/route.ts"),
    "utf8",
  );
  results["identity_source_is_always_server_session_userid"] =
    routeSrc.includes("getTmiAuth()") &&
    routeSrc.includes("resolveActiveProfileIdentity(auth.user.id") &&
    !routeSrc.includes("searchParams") &&
    !routeSrc.includes("req.nextUrl");

  const allPassed = Object.values(results).every(Boolean);

  console.log(
    `[IDENTITY_FALLBACK_HARDENING_TEST_ASSERT]`,
    JSON.stringify({ allPassed, results }, null, 2),
  );
  return { allPassed, results };
}

runIdentityFallbackHardeningTest();
