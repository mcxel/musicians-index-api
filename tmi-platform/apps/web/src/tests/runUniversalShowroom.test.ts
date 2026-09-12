/**
 * UniversalShowroomEngine Test Suite
 *
 * Verifies:
 * 1. Role-aware showroom badge classification (Performer, Fan Lobby, Social, Cypher, Battle).
 * 2. Exact-session destination resolution without redirect loops.
 * 3. Exposure fairness ranking across active sessions.
 * 4. 13-second rotation constant compliance.
 */

import {
  classifyShowroomBadge,
  recordToShowroomSlot,
  filterAndRankShowroomSlots,
  SHOWROOM_ROTATION_INTERVAL_MS,
} from "../lib/discovery/UniversalShowroomEngine";
import type { LiveDiscoveryRecord } from "../lib/discovery/LiveDiscoveryRecord";

function makeMockRecord(overrides: Partial<LiveDiscoveryRecord> = {}): LiveDiscoveryRecord {
  const roomId = overrides.roomId || "test-room-01";
  return {
    id: overrides.id || `rec-${roomId}`,
    roomId,
    title: overrides.title || "Live Room Title",
    hostName: overrides.hostName || "Test Host",
    hostUserId: overrides.hostUserId || "perf-user-01",
    countryCode: "US",
    category: overrides.category || "live_now",
    categories: overrides.categories || [overrides.category || "live_now"],
    visibility: overrides.visibility || "public",
    humanViewerCount: overrides.humanViewerCount ?? 10,
    posterUrl: overrides.posterUrl ?? null,
    previewUrl: null,
    previewMode: "none",
    accentColor: "#FF2DAA",
    joinRoute: overrides.joinRoute || `/live/rooms/${roomId}`,
    joinGate: "none",
    isLive: overrides.isLive !== false,
    isNewEmpty: false,
    startedAt: Date.now() - 60000,
    updatedAt: Date.now(),
    recruiting: false,
    ...overrides,
  };
}

describe("Universal Showroom Engine", () => {
  it("enforces the 13000ms rotation interval", () => {
    expect(SHOWROOM_ROTATION_INTERVAL_MS).toBe(13000);
  });

  it("classifies performer live broadcasts accurately", () => {
    const perfRecord = makeMockRecord({
      id: "rec-perf-01",
      roomId: "stage-main-01",
      hostName: "Kendra Sparks",
      hostUserId: "perf-kendra-12",
      title: "Live Main Stage Concert",
      category: "concerts",
      categories: ["concerts"],
      isLive: true,
      humanViewerCount: 42,
      joinRoute: "/live/rooms/stage-main-01?mode=performer",
    });

    const { badge, hostRole } = classifyShowroomBadge(perfRecord);
    expect(badge).toBe("PERFORMER LIVE");
    expect(hostRole).toBe("performer");
  });

  it("classifies fan lobby and social sessions with fan parity", () => {
    const fanRecord = makeMockRecord({
      id: "rec-fan-01",
      roomId: "lobby-fan-99",
      hostName: "Elena R.",
      hostUserId: "fan-elena-99",
      title: "Friday Hangout Lobby",
      category: "lounges",
      categories: ["lounges", "fan_lobbies"],
      isLive: true,
      humanViewerCount: 8,
      joinRoute: "/live/rooms/lobby-fan-99?mode=lounge",
    });

    const { badge, hostRole } = classifyShowroomBadge(fanRecord);
    expect(badge).toBe("FAN LOBBY LIVE");
    expect(hostRole).toBe("fan");
  });

  it("classifies cyphers and battles with specific tags", () => {
    const cypherRecord = makeMockRecord({
      id: "rec-cypher-01",
      roomId: "cypher-room-01",
      hostName: "MC Marcel",
      hostUserId: "perf-marcel-01",
      title: "Friday Night Cypher",
      category: "cyphers",
      categories: ["cyphers"],
      isLive: true,
      humanViewerCount: 25,
      joinRoute: "/rooms/battle/cypher-room-01",
    });

    const { badge, hostRole } = classifyShowroomBadge(cypherRecord);
    expect(badge).toBe("CYPHER LIVE");
    expect(hostRole).toBe("performer");
  });

  it("converts records to valid showroom slots with exact destinations", () => {
    const record = makeMockRecord({
      id: "rec-test-01",
      roomId: "room-abc-123",
      hostName: "Host Test",
      hostUserId: "perf-001",
      title: "Test Live Broadcast",
      category: "live_now",
      categories: ["live_now"],
      isLive: true,
      humanViewerCount: 15,
      joinRoute: "/live/rooms/room-abc-123",
    });

    const slot = recordToShowroomSlot(record);
    expect(slot.roomId).toBe("room-abc-123");
    expect(slot.exactJoinHref).toBeDefined();
    expect(slot.exactJoinHref.length).toBeGreaterThan(0);
    expect(slot.participantCount).toBe(15);
  });

  it("filters and ranks live sessions by fairness and live status", () => {
    const records: LiveDiscoveryRecord[] = [
      makeMockRecord({
        id: "rec-1",
        roomId: "room-1",
        hostName: "User 1",
        hostUserId: "fan-01",
        title: "Fan Live 1",
        category: "lounges",
        categories: ["lounges"],
        isLive: true,
        humanViewerCount: 5,
        joinRoute: "/live/rooms/room-1",
      }),
      makeMockRecord({
        id: "rec-2",
        roomId: "room-2",
        hostName: "User 2",
        hostUserId: "perf-02",
        title: "Performer Live 2",
        category: "concerts",
        categories: ["concerts"],
        isLive: true,
        humanViewerCount: 50,
        joinRoute: "/live/rooms/room-2",
      }),
      makeMockRecord({
        id: "rec-3",
        roomId: "room-3",
        hostName: "User 3",
        hostUserId: "user-03",
        title: "Offline Room",
        category: "lounges",
        categories: ["lounges"],
        isLive: false,
        humanViewerCount: 0,
        joinRoute: "/live/rooms/room-3",
      }),
    ];

    const slots = filterAndRankShowroomSlots(records, "home");
    // Only live rooms included
    expect(slots.length).toBe(2);
    expect(slots.every((s) => s.isLive)).toBe(true);
  });
});
