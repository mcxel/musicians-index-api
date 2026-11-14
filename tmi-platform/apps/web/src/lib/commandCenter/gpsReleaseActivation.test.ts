import {
  gpsDestinationById,
  gpsDestinationHref,
  gpsDestinationState,
  gpsReleaseInventory,
  heldReleaseForCenter,
  isGpsReleaseDestinationVisible,
} from "./gpsReleaseAllowlist";
import { useMobileGpsMonitorLayoutStore } from "./mobileGpsMonitorLayoutStore";

describe("GPS §33 release activation", () => {
  beforeEach(() => {
    useMobileGpsMonitorLayoutStore.getState().reset();
  });

  it("exposes VENUES as a LIVE GPS destination to /rooms", () => {
    expect(gpsDestinationState("venues")).toBe("LIVE");
    expect(gpsDestinationHref("venues")).toBe("/rooms");
    expect(isGpsReleaseDestinationVisible("venues")).toBe(true);
  });

  it("labels Lobby Wall exactly and keeps it LIVE for instant drawer open", () => {
    expect(gpsDestinationById("lobby")?.label).toBe("LOBBY WALL");
    expect(gpsDestinationState("lobby")).toBe("LIVE");
  });

  it("activates built commerce and media destinations that previously said Coming Soon", () => {
    for (const id of [
      "store",
      "booking",
      "commerce",
      "media",
      "memory-wall",
      "inventory",
      "avatar",
      "camera",
      "go-live",
      "upgrade",
      "notifications",
      "promote",
    ]) {
      expect(gpsDestinationState(id)).toBe("LIVE");
    }
  });

  it("keeps unfinished friends and avatar-live held", () => {
    expect(gpsDestinationState("friends")).toBe("COMING_SOON");
    expect(gpsDestinationState("avatar-live")).toBe("COMING_SOON");
    expect(gpsDestinationState("videos")).toBe("COMING_SOON");
  });

  it("does not hold operating centers whose destinations are LIVE", () => {
    expect(heldReleaseForCenter("commerce_center")).toBeNull();
    expect(heldReleaseForCenter("booking")).toBeNull();
    expect(heldReleaseForCenter("media")).toBeNull();
  });

  it("openRailMode opens GPS and OC as distinct modes without stacking", () => {
    const store = useMobileGpsMonitorLayoutStore.getState();
    store.openRailMode("gps");
    expect(useMobileGpsMonitorLayoutStore.getState().layout).not.toBe("DUAL_MONITORS_CLOSED");
    expect(useMobileGpsMonitorLayoutStore.getState().railMode).toBe("gps");
    store.openRailMode("oc");
    expect(useMobileGpsMonitorLayoutStore.getState().railMode).toBe("oc");
    expect(useMobileGpsMonitorLayoutStore.getState().layout).not.toBe("DUAL_MONITORS_CLOSED");
    store.openRailMode("oc");
    expect(useMobileGpsMonitorLayoutStore.getState().layout).toBe("DUAL_MONITORS_CLOSED");
  });

  it("reports activation inventory for the release receipt", () => {
    const inv = gpsReleaseInventory();
    expect(inv.live).toBeGreaterThanOrEqual(25);
    expect(inv.comingSoonIds).toEqual(expect.arrayContaining(["friends", "avatar-live", "videos"]));
    expect(gpsDestinationById("venues")?.label).toBe("VENUES");
  });
});
