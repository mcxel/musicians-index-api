import { resolveLobbyDestination } from "../lib/lobby/DestinationResolver";
import {
  registerLiveSession,
  endLiveSession,
  getActiveSessions,
} from "../lib/broadcast/globalLiveSessionStore";

function runUniversalLiveLobbyTest() {
  const results: Record<string, boolean> = {};

  // 1. DestinationResolver — exact room routing for all room kinds
  const loungeDest = resolveLobbyDestination({
    roomId: "lounge-vip-001",
    kind: "lounge",
  });
  results["lounge_destination_is_exact"] =
    loungeDest.href === "/live/rooms/lounge-vip-001?mode=lounge" &&
    loungeDest.via === "kind-route";

  const battleDest = resolveLobbyDestination({
    roomId: "battle-main-001",
    kind: "battle",
  });
  results["battle_destination_is_exact"] =
    battleDest.href === "/rooms/battle/battle-main-001" &&
    battleDest.via === "kind-route";

  const gauntletDest = resolveLobbyDestination({
    roomId: "gauntlet-001",
    kind: "gauntlet",
  });
  results["gauntlet_destination_is_exact"] =
    gauntletDest.href === "/rooms/battle/gauntlet/gauntlet-001" &&
    gauntletDest.via === "kind-route";

  const explicitHrefDest = resolveLobbyDestination({
    roomId: "custom-001",
    kind: "lounge",
    href: "/rooms/lounges/custom-lounge-001",
  });
  results["explicit_href_bypasses_kind_route"] =
    explicitHrefDest.href === "/rooms/lounges/custom-lounge-001" &&
    explicitHrefDest.via === "explicit-href";

  // 2. GlobalLiveSessionRegistry — active room & lounge session management
  const testSessionId = "test_lounge_host_99";
  registerLiveSession({
    userId: testSessionId,
    displayName: "DJ Jazzy Jay",
    title: "Late Night Playlist Lounge",
    category: "live",
    roomId: "lounge-playlist-999",
  });

  const activeSessions = getActiveSessions();
  const foundLounge = activeSessions.find((s) => s.userId === testSessionId);

  results["lounge_registered_in_live_store"] = foundLounge !== undefined;
  results["lounge_category_correct"] = foundLounge?.category === "live";
  results["lounge_room_id_correct"] = foundLounge?.roomId === "lounge-playlist-999";

  // Teardown test session
  endLiveSession(testSessionId);
  const activeAfterEnd = getActiveSessions();
  results["lounge_session_cleared_on_end"] =
    activeAfterEnd.find((s) => s.userId === testSessionId) === undefined;

  const allPassed = Object.values(results).every(Boolean);

  console.log("[UNIVERSAL_LIVE_LOBBY_TEST_ASSERT]", { allPassed, results });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[UNIVERSAL_LIVE_LOBBY_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runUniversalLiveLobbyTest();
