import { DiscoveryBus } from "@/lib/discovery/DiscoveryBus";
import { liveSessionToDiscoveryRecord, publishLiveRoom } from "@/lib/discovery/DiscoveryPublisher";
import { resolveCanonicalRoomDoorState } from "@/lib/live/roomDoorState";
import { closeLiveRoom, createLiveRoom } from "@/lib/live/LiveRoomEngine";
import { endLiveSession, getSessionByRoomId, registerLiveSession, updateStageState } from "@/lib/broadcast/globalLiveSessionStore";
import { getRoomPopulation, injectSyntheticAudience } from "@/lib/rooms/RoomPopulationEngine";
import { resolveLobbyDestination } from "@/lib/lobby/DestinationResolver";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";

function publishInput(roomId: string) {
  return {
    roomId,
    title: `Room ${roomId}`,
    hostName: "Real Host",
    hostUserId: "host-live-test",
    category: "battle",
    joinRoute: `/rooms/battle/${roomId}`,
  };
}

describe("closed room and Lobby truth", () => {
  beforeEach(() => DiscoveryBus.clear());
  afterEach(() => {
    endLiveSession("host-live-test");
    DiscoveryBus.clear();
  });

  it("keeps a registered OPEN room discoverable and exactly routed without LIVE claims", () => {
    const room = createLiveRoom({ roomType: "battle", title: "Open Door", hostUserId: "host-open-test" });
    const record = publishLiveRoom(publishInput(room.roomId));

    expect(record?.roomState).toBe("OPEN");
    expect(record?.isLive).toBe(false);
    expect(record?.categories).not.toContain("live_now");
    expect(DiscoveryBus.getVisible().map((item) => item.id)).toContain(record?.id);
    expect(resolveLobbyDestination({ roomId: room.roomId, kind: "battle" }).href).toBe(`/rooms/battle/${room.roomId}`);

    closeLiveRoom(room.roomId);
    publishLiveRoom(publishInput(room.roomId));
    expect(DiscoveryBus.getVisible().some((item) => item.roomId === room.roomId)).toBe(false);
  });

  it("shows LIVE only for the canonical active broadcast session and removes it at session end", () => {
    const roomId = `active-live-${Date.now()}`;
    registerLiveSession({
      userId: "host-live-test",
      displayName: "Real Host",
      title: "Real Session",
      category: "battle",
      roomId,
      privacy: "PUBLIC",
    });

    const live = publishLiveRoom(publishInput(roomId));
    expect(live?.roomState).toBe("LIVE");
    expect(live?.isLive).toBe(true);
    expect(live?.categories).toContain("live_now");
    expect(DiscoveryBus.getVisible().some((item) => item.roomId === roomId && item.isLive)).toBe(true);
    const watch = resolveInstantJoin(live!, { role: "FAN" });
    expect(watch.room.watchOnly).toBe(true);
    expect(watch.room.claimFanSeat).toBe(false);
    expect(watch.room.participationEntryMode).toBe("SPECTATOR");
    expect(watch.href).toContain(`/live/rooms/${encodeURIComponent(roomId)}?mode=watch&from=live-lobby-wall`);
    expect(liveSessionToDiscoveryRecord(getSessionByRoomId(roomId)!)?.joinRoute).toBe(
      `/live/rooms/${encodeURIComponent(roomId)}?mode=watch&from=live-lobby-wall`,
    );

    updateStageState("host-live-test", "intermission");
    const intermission = publishLiveRoom(publishInput(roomId));
    expect(intermission?.roomState).toBe("LIVE");

    endLiveSession("host-live-test");
    const ended = publishLiveRoom(publishInput(roomId));
    expect(ended?.roomState).toBe("CLOSED");
    expect(DiscoveryBus.getVisible().some((item) => item.roomId === roomId)).toBe(false);
  });

  it("keeps persistent anchor rooms OPEN rather than falsely LIVE", () => {
    const anchor = publishLiveRoom({ ...publishInput(`anchor-test-${Date.now()}`), isAnchor: true });
    expect(anchor?.roomState).toBe("OPEN");
    expect(anchor?.isLive).toBe(false);
  });

  it("defaults room population to empty and cannot inject synthetic spectators", () => {
    const before = getRoomPopulation("battle-arena");
    injectSyntheticAudience("battle-arena", 5);
    const after = getRoomPopulation("battle-arena");
    expect(before.audienceCount).toBe(0);
    expect(after.audienceCount).toBe(0);
    expect(after.performerCount).toBe(0);
    expect(after.hostCount).toBe(0);
    expect(after.sponsorCount).toBe(0);
  });

  it("fails closed by default and prevents a stale room runtime from overriding persisted CLOSED", () => {
    expect(resolveCanonicalRoomDoorState({})).toBe("CLOSED");
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "CLOSED", runtimeRoomStatus: "live" })).toBe("CLOSED");
  });
});