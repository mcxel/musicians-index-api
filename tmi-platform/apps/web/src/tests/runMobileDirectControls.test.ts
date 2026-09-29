import * as fs from "fs";
import * as path from "path";
import {
  isGpsDrawerVisible,
  useMobileGpsMonitorLayoutStore,
} from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";

const root = path.join(__dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

describe("mobile GPS header and direct controls", () => {
  beforeEach(() => {
    useMobileGpsMonitorLayoutStore.getState().reset();
  });

  it("opens the GPS rail in the secondary slot and closes it again", () => {
    useMobileGpsMonitorLayoutStore.getState().toggleGpsDrawer();
    expect(useMobileGpsMonitorLayoutStore.getState().layout).toBe("DRAWER_REPLACES_MONITOR_2");
    expect(isGpsDrawerVisible(useMobileGpsMonitorLayoutStore.getState().layout)).toBe(true);
    useMobileGpsMonitorLayoutStore.getState().toggleGpsDrawer();
    expect(useMobileGpsMonitorLayoutStore.getState().layout).toBe("DUAL_MONITORS_CLOSED");
  });

  it("puts GPS in the mobile header and keeps the desktop role label", () => {
    const shell = read("components/commandCenter/CommandCenterShell.tsx");
    expect(shell).toContain('data-testid="hub-header-gps"');
    expect(shell).toContain("HubMobileGpsNavDrawer");
    expect(shell).toContain("toggleGpsDrawer()");
    expect(shell).not.toContain("hub-gps-menu-anchor");
    expect(shell).not.toContain("scrollIntoView");
    const at = shell.indexOf('data-testid="hub-header-gps"');
    const around = shell.slice(Math.max(0, at - 500), at);
    expect(around).toContain("isMobile ? (");
    expect(around).not.toContain("COMMAND CENTER");
    expect(shell).toContain("COMMAND CENTER");
  });

  it("uses a compact thumb rail and does not route lobby to the billboard page", () => {
    const rail = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");
    expect(rail).toContain('data-testid="hub-gps-rail"');
    expect(rail).toContain('workspace: "lobby"');
    expect(rail).toContain('workspace: "live-destinations"');
    expect(rail).toContain("presentCanonicalWorkspace");
    expect(rail).not.toContain("MAIN MENU");
    expect(rail).not.toContain("router.push");
    expect(rail).not.toContain("/live/rooms");
    expect(rail).not.toContain("hub-gps-tool-");
    expect(rail).toContain("🧱");
    expect(rail).toContain('data-testid="hub-gps-slider"');
    expect(rail).toContain("clamp(118px, 34vw, 142px)");
    expect(rail).toContain("left: 8");
    expect(rail).toContain("Tap for direct view");
    expect(rail).not.toContain("/live/rooms");
  });

  it("replaces the mobile command bed with compact direct controls", () => {
    const stack = read("components/commandCenter/CommandCenterMediaStack.tsx");
    expect(stack).toContain('data-tmi-direct-controls="1"');
    expect(stack).toContain("compactHubLayout ? mobileDirectControls : toolbar");
    expect(stack).toContain('testId: "tmi-direct-golive"');
    expect(stack).toContain('testId: "tmi-direct-m1"');
    expect(stack).toContain('testId: "tmi-direct-m2"');
    expect(stack).toContain('testId: "tmi-direct-promote"');
    expect(stack).toContain('testId: "tmi-direct-objects"');
    expect(stack).toContain("<CompactAudioMixer />");
    const direct = stack.slice(stack.indexOf("const mobileDirectControls"), stack.indexOf("const toolbar"));
    expect(direct).not.toContain("EXPAND BED");
    expect(direct).not.toContain("COMMAND BED");
    expect(direct).not.toContain("FAN COMMAND CENTER");
  });

  it("keeps friends and lobby totals on real authorities", () => {
    const friends = read("components/widgets/FriendsWidget.tsx");
    const friendsPage = read("app/friends/page.tsx");
    const feed = read("app/fan/feed/page.tsx");
    const rooms = read("app/live/rooms/page.tsx");
    const grid = read("components/live/LiveLobbyWallGrid.tsx");
    expect(friends).toContain("/api/friends");
    expect(friends).toContain("relationshipStatus !== \"accepted\"");
    expect(friends).toContain("No friends yet.");
    expect(friends).not.toContain("SEED_FRIENDS");
    expect(friends).not.toContain("Nova Fan");
    expect(friendsPage).not.toContain("INITIAL_FRIENDS");
    expect(friendsPage).not.toContain("DJ Kenzo");
    expect(feed).not.toContain("SEED_FRIENDS");
    expect(feed).not.toContain("Wavetek");
    expect(rooms).not.toContain("Wavetek vs Krypt");
    expect(rooms).not.toContain("setInterval");
    expect(rooms).toContain("useDiscoveryBus");
    expect(grid).toContain('aspectRatio: "16 / 9"');
    expect(grid).toContain('gridColumn: "span 2"');
    expect(grid).not.toContain("21 / 9");
    expect(grid).not.toContain("gridAutoRows: '110px'");
  });
});
