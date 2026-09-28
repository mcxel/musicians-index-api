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

  it("opens and closes the canonical GPS drawer", () => {
    useMobileGpsMonitorLayoutStore.getState().toggleGpsDrawer();
    expect(isGpsDrawerVisible(useMobileGpsMonitorLayoutStore.getState().layout)).toBe(true);
    useMobileGpsMonitorLayoutStore.getState().toggleGpsDrawer();
    expect(isGpsDrawerVisible(useMobileGpsMonitorLayoutStore.getState().layout)).toBe(false);
  });

  it("puts GPS in the mobile header and keeps the desktop role label", () => {
    const shell = read("components/commandCenter/CommandCenterShell.tsx");
    expect(shell).toContain('data-testid="hub-header-gps"');
    expect(shell).toContain("HubMobileGpsNavDrawer");
    expect(shell).toContain("toggleGpsDrawer()");
    const at = shell.indexOf('data-testid="hub-header-gps"');
    const around = shell.slice(Math.max(0, at - 500), at);
    expect(around).toContain("isMobile ? (");
    expect(around).not.toContain("COMMAND CENTER");
    expect(shell).toContain("COMMAND CENTER");
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
});
