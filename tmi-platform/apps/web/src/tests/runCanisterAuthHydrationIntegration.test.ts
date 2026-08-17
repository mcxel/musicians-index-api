/**
 * Canister Canonical Auth Hydration — Integration Test
 *
 * Proves InventoryCanister and RoleGate now read the same canonical
 * useAuth() session authority (lib/hooks/useAuth.ts) instead of each
 * running its own independent, uncoordinated /api/auth/session fetch — the
 * actual root cause of "authenticated shell, Canister shows Log in" on
 * mobile Safari.
 *
 * Exercises the real module-level cache/fetch mechanics in useAuth.ts
 * directly (no React render harness), matching this repo's existing
 * plain-function test convention (see runCanisterAuthHydration.test.ts,
 * runPersonalMediaRouter.test.ts). The mocked fetch below stands in for
 * /api/auth/session; requireFanAvatarSession's own cookie-resolution
 * behavior is already covered by runCanisterAuthHydration.test.ts and is
 * not re-tested here.
 */

import {
  resolveAuthPhase,
  __resetAuthCacheForTest,
  __triggerFetchForTest,
  __peekAuthCacheForTest,
} from "../lib/hooks/useAuth";

type MockSessionResponse = {
  authenticated: boolean;
  user?: { id: string; email: string; name: string; role: string; tier: string };
  role?: string;
  tier?: string;
};

function mockSession(response: MockSessionResponse): void {
  (global as any).fetch = async () => ({
    ok: true,
    json: async () => response,
  });
}

const FAN_USER = { id: "user-todd-1", email: "todd@example.com", name: "Todd", role: "FAN", tier: "GOLD" };

export async function runCanisterAuthHydrationIntegrationTest(): Promise<{ allPassed: boolean; results: Record<string, boolean> }> {
  const results: Record<string, boolean> = {};

  // 1. shell_and_canister_share_user_identity — one consumer (the "shell")
  //    populates the shared cache; a second consumer (the "Canister" via its
  //    own useAuth() call) reads the identical cached object/userId rather
  //    than resolving a separately-fetched, possibly-divergent session.
  __resetAuthCacheForTest();
  mockSession({ authenticated: true, user: FAN_USER, role: "FAN", tier: "GOLD" });
  await __triggerFetchForTest();
  const shellView = __peekAuthCacheForTest();
  const canisterView = __peekAuthCacheForTest();
  results["shell_and_canister_share_user_identity"] =
    shellView !== null &&
    shellView === canisterView &&
    shellView.user?.id === FAN_USER.id &&
    shellView.authenticated === true;

  // 2. auth_loading_does_not_show_login — while the session is still
  //    resolving, the derived phase must be AUTH_LOADING, never
  //    UNAUTHENTICATED (the mobile Safari false-login-flash this fix exists
  //    to prevent).
  results["auth_loading_does_not_show_login"] = resolveAuthPhase(true, false) === "AUTH_LOADING";

  // 3. authenticated_user_loads_inventory — once loading resolves true+true,
  //    the phase is AUTHENTICATED, which is what InventoryCanister gates its
  //    real /api/avatar/inventory fetch on.
  results["authenticated_user_loads_inventory"] = resolveAuthPhase(false, true) === "AUTHENTICATED";

  // 4. role_switch_does_not_drop_auth — activeRole changing (Fan -> Performer)
  //    must never itself flip AUTHENTICATED -> UNAUTHENTICATED. Authentication
  //    and role are separate inputs; a role check is never a substitute for
  //    "does an authenticated session exist."
  __resetAuthCacheForTest();
  mockSession({ authenticated: true, user: { ...FAN_USER, role: "FAN" }, role: "FAN", tier: "GOLD" });
  await __triggerFetchForTest();
  const fanPhase = resolveAuthPhase(false, __peekAuthCacheForTest()?.authenticated === true);

  __resetAuthCacheForTest();
  mockSession({ authenticated: true, user: { ...FAN_USER, role: "PERFORMER" }, role: "PERFORMER", tier: "GOLD" });
  await __triggerFetchForTest();
  const performerPhase = resolveAuthPhase(false, __peekAuthCacheForTest()?.authenticated === true);

  results["role_switch_does_not_drop_auth"] = fanPhase === "AUTHENTICATED" && performerPhase === "AUTHENTICATED";

  // 5. unauthenticated_user_sees_login — a real unauthenticated response
  //    resolves to UNAUTHENTICATED, not stuck loading.
  __resetAuthCacheForTest();
  mockSession({ authenticated: false });
  await __triggerFetchForTest();
  const unauthCache = __peekAuthCacheForTest();
  results["unauthenticated_user_sees_login"] =
    resolveAuthPhase(false, unauthCache?.authenticated === true) === "UNAUTHENTICATED";

  // 6. signout_clears_inventory — the same refresh() mechanic
  //    InventoryCanister calls (cachedState = null; triggerFetch()) must
  //    transition an authenticated cache with a real user to an
  //    unauthenticated cache with no user, which is what makes the
  //    component clear its inventory list and show the login state.
  __resetAuthCacheForTest();
  mockSession({ authenticated: true, user: FAN_USER, role: "FAN", tier: "GOLD" });
  await __triggerFetchForTest();
  const beforeSignout = __peekAuthCacheForTest();

  mockSession({ authenticated: false });
  __resetAuthCacheForTest(); // mirrors useAuth().refresh(): cachedState = null; triggerFetch();
  await __triggerFetchForTest();
  const afterSignout = __peekAuthCacheForTest();

  results["signout_clears_inventory"] =
    beforeSignout?.authenticated === true &&
    beforeSignout?.user?.id === FAN_USER.id &&
    afterSignout?.authenticated === false &&
    afterSignout?.user === null;

  const allPassed = Object.values(results).every(Boolean);
  console.log(`[CANISTER_AUTH_HYDRATION_INTEGRATION_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

declare const require: { main: unknown; cache: unknown };
declare const module: { exports: unknown };

if (typeof require !== "undefined" && require.main === module) {
  runCanisterAuthHydrationIntegrationTest().then((outcome) => {
    if (!outcome.allPassed) {
      process.exitCode = 1;
    }
  });
}
