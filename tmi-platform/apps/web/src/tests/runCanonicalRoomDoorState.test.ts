import { resolveCanonicalRoomDoorState } from "@/lib/live/roomDoorState";

describe("canonical Lobby-to-room door state", () => {
  it("defaults absent and explicitly closed rooms to CLOSED", () => {
    expect(resolveCanonicalRoomDoorState({})).toBe("CLOSED");
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "CLOSED" })).toBe("CLOSED");
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "ARCHIVED" })).toBe("CLOSED");
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "LIVE", persistedRoomSessionActive: false })).toBe("CLOSED");
  });

  it("reflects an owner-opened or scheduled room as OPEN, never LIVE", () => {
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "OPEN" })).toBe("OPEN");
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "PRESHOW" })).toBe("OPEN");
    expect(resolveCanonicalRoomDoorState({ runtimeRoomStatus: "scheduled" })).toBe("OPEN");
    expect(resolveCanonicalRoomDoorState({ permanentAnchor: true })).toBe("OPEN");
  });

  it("requires an active session for LIVE and closes again after it ends", () => {
    expect(resolveCanonicalRoomDoorState({ activeLiveSessionStage: "live", persistedRoomStatus: "LIVE" })).toBe("LIVE");
    expect(resolveCanonicalRoomDoorState({ activeLiveSessionStage: "live", persistedRoomStatus: "CLOSED" })).toBe("LIVE");
    expect(resolveCanonicalRoomDoorState({ activeLiveSessionStage: "intermission", persistedRoomStatus: "CLOSED" })).toBe("LIVE");
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "LIVE", persistedRoomSessionActive: true })).toBe("LIVE");
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "CLOSED", persistedRoomSessionActive: true })).toBe("LIVE");
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "CLOSED", persistedRoomSessionActive: false })).toBe("CLOSED");
    expect(resolveCanonicalRoomDoorState({ activeLiveSessionStage: "ended" })).toBe("CLOSED");
  });

  it("does not let a runtime cache claim a broadcast or override persisted CLOSED state", () => {
    expect(resolveCanonicalRoomDoorState({ runtimeRoomStatus: "live" })).toBe("OPEN");
    expect(resolveCanonicalRoomDoorState({ runtimeRoomStatus: "live", permanentAnchor: true })).toBe("OPEN");
    expect(resolveCanonicalRoomDoorState({ persistedRoomStatus: "CLOSED", runtimeRoomStatus: "live", permanentAnchor: true })).toBe("CLOSED");
  });
});