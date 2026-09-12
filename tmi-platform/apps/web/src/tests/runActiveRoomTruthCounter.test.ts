/**
 * Target 4 — Active room truth counter (unit lifecycle).
 * Runtime browser N→N+1→N remains a separate acceptance gate.
 */

import {
  registerLiveSession,
  endLiveSession,
  getActiveSessions,
  getActiveRoomTruthCount,
  getSeedSessions,
  getAllSessions,
} from "../lib/broadcast/globalLiveSessionStore";
import { formatLiveNowActiveRoomsLabel } from "../lib/broadcast/activeRoomTruth";

function runActiveRoomTruthCounterTest() {
  const results: Record<string, boolean> = {};
  const stamp = Date.now();
  const hostA = `t4-host-a-${stamp}@tmi.test`;
  const hostB = `t4-host-b-${stamp}@tmi.test`;
  const hostDup = `t4-host-dup-${stamp}@tmi.test`;
  const hostPrivate = `t4-host-private-${stamp}@tmi.test`;
  const roomA = `t4-room-a-${stamp}`;
  const roomDup = `t4-room-dup-${stamp}`;
  const roomPrivate = `t4-room-private-${stamp}`;

  const baseline = getActiveRoomTruthCount();
  results["baseline_is_number"] = typeof baseline === "number" && baseline >= 0;

  registerLiveSession({
    userId: hostA,
    displayName: "T4 Host A",
    title: "T4 Public Room",
    category: "live",
    roomId: roomA,
    privacy: "PUBLIC",
  });

  const afterCreate = getActiveRoomTruthCount();
  results["create_increments_truth_by_one"] = afterCreate === baseline + 1;
  results["created_room_in_active_registry"] = getActiveSessions().some((s) => s.roomId === roomA);

  // Duplicate roomId (second host same room) must not double-count
  registerLiveSession({
    userId: hostDup,
    displayName: "T4 Host Dup",
    title: "T4 Duplicate RoomId",
    category: "live",
    roomId: roomA,
    privacy: "PUBLIC",
  });
  results["duplicate_roomId_does_not_double_count"] =
    getActiveRoomTruthCount() === baseline + 1;

  // INVITE_ONLY follows DiscoveryPublisher visibility — not in public LIVE NOW count
  registerLiveSession({
    userId: hostPrivate,
    displayName: "T4 Private Host",
    title: "T4 Invite Only",
    category: "live",
    roomId: roomPrivate,
    privacy: "INVITE_ONLY",
  });
  results["invite_only_excluded_from_truth_count"] =
    getActiveRoomTruthCount() === baseline + 1;
  results["invite_only_still_in_raw_active"] = getActiveSessions().some(
    (s) => s.roomId === roomPrivate,
  );

  // Second distinct public room increments
  registerLiveSession({
    userId: hostB,
    displayName: "T4 Host B",
    title: "T4 Second Room",
    category: "live",
    roomId: roomDup,
    privacy: "PUBLIC",
  });
  results["second_public_room_increments"] =
    getActiveRoomTruthCount() === baseline + 2;

  // Seeds must never be part of truth count path (getAllSessions includes seeds; truth does not)
  const seedLen = getSeedSessions().length;
  const allLen = getAllSessions().length;
  const truthNow = getActiveRoomTruthCount();
  results["truth_count_ignores_seed_inflation"] =
    truthNow <= getActiveSessions().filter((s) => s.privacy !== "INVITE_ONLY").length &&
    (seedLen === 0 || allLen >= getActiveSessions().length);

  results["label_format"] =
    formatLiveNowActiveRoomsLabel(truthNow) === `LIVE NOW — ${truthNow} ACTIVE ROOMS`;

  // End lifecycle → truth returns toward baseline (private + dups cleaned)
  endLiveSession(hostA);
  endLiveSession(hostDup);
  endLiveSession(hostPrivate);
  endLiveSession(hostB);

  const afterEnd = getActiveRoomTruthCount();
  results["end_returns_to_baseline"] = afterEnd === baseline;
  results["ended_rooms_absent_from_active"] =
    !getActiveSessions().some((s) =>
      [roomA, roomDup, roomPrivate].includes(s.roomId),
    );

  // Refresh/reconnect must not invent rows — re-read truth equals afterEnd
  results["reread_does_not_inflate"] = getActiveRoomTruthCount() === afterEnd;

  const allPassed = Object.values(results).every(Boolean);
  console.log("[ACTIVE_ROOM_TRUTH_COUNTER_TEST_ASSERT]", { allPassed, results, baseline, afterCreate, afterEnd });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[ACTIVE_ROOM_TRUTH_COUNTER_TEST] FAILED: ${failed.join(", ")}`);
  }
}

describe("Active Room Truth Counter", () => {
  it("tracks exact N -> N+1 -> N lifecycle on registry", () => {
    runActiveRoomTruthCounterTest();
  });
});
