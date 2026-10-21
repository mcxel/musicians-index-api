/**
 * runMobileGpsMonitorSwap.test.ts — CONVERGENCE-ADDENDUM-2026-09-24-J (K revision)
 * SOURCE / AUTOMATED structural proofs — not PHYSICAL_GREEN.
 */

import * as fs from "fs";
import * as path from "path";
import {
  useMobileGpsMonitorLayoutStore,
  isGpsDrawerVisible,
  shouldReplaceMonitor2Slot,
  resolveDrawerPlacement,
  isGpsLeftSwipe,
} from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";

const root = path.join(__dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

describe("GPS Command Bed entry and independent monitor presentation", () => {
  beforeEach(() => {
    useMobileGpsMonitorLayoutStore.getState().reset();
  });

  it("GPS-gesture: only decisive horizontal left swipes dismiss the rail", () => {
    expect(isGpsLeftSwipe(-80, 10)).toBe(true);
    expect(isGpsLeftSwipe(-80, 0)).toBe(true);
    expect(isGpsLeftSwipe(-20, -70)).toBe(false);
    expect(isGpsLeftSwipe(-50, -40)).toBe(false);
    expect(isGpsLeftSwipe(90, 4)).toBe(false);
    expect(isGpsLeftSwipe(-63, 0)).toBe(false);
  });

  it("GPS-01: opening GPS places its drawer below both monitors", () => {
    useMobileGpsMonitorLayoutStore.getState().openGpsDrawer();
    expect(useMobileGpsMonitorLayoutStore.getState().layout).toBe("DUAL_MONITORS_DRAWER_BELOW");
    expect(isGpsDrawerVisible("DUAL_MONITORS_DRAWER_BELOW")).toBe(true);
    expect(shouldReplaceMonitor2Slot("DUAL_MONITORS_DRAWER_BELOW")).toBe(false);
  });

  it("GPS-02: restore-monitor action leaves an already independent dual layout unchanged", () => {
    useMobileGpsMonitorLayoutStore.getState().openGpsDrawer();
    useMobileGpsMonitorLayoutStore.getState().restoreMonitor2();
    expect(useMobileGpsMonitorLayoutStore.getState().layout).toBe("DUAL_MONITORS_DRAWER_BELOW");
    expect(shouldReplaceMonitor2Slot("DUAL_MONITORS_DRAWER_BELOW")).toBe(false);
    expect(isGpsDrawerVisible("DUAL_MONITORS_DRAWER_BELOW")).toBe(true);
  });

  it("GPS-02b: Monitor Back restores Monitor 2 without closing the GPS drawer", () => {
    useMobileGpsMonitorLayoutStore.setState({ layout: "DRAWER_REPLACES_MONITOR_2" });
    useMobileGpsMonitorLayoutStore.getState().restoreMonitor2();
    expect(useMobileGpsMonitorLayoutStore.getState().layout).toBe("DUAL_MONITORS_DRAWER_BELOW");
    expect(isGpsDrawerVisible(useMobileGpsMonitorLayoutStore.getState().layout)).toBe(true);
  });

  it("GPS-03: toggle closes the drawer from its below-monitors state", () => {
    useMobileGpsMonitorLayoutStore.getState().openGpsDrawer();
    useMobileGpsMonitorLayoutStore.getState().toggleGpsDrawer();
    expect(useMobileGpsMonitorLayoutStore.getState().layout).toBe("DUAL_MONITORS_CLOSED");
  });

  it("GPS-04: Command Bed header mounts the compact 44px GPS above the monitors", () => {
    const stack = read("components/commandCenter/CommandCenterMediaStack.tsx");
    const bar = read("components/commandCenter/HubMobileQuickActionBar.tsx");
    expect(stack).toMatch(/data-testid="hub-mobile-action-gps"/);
    expect(stack).toMatch(/!enableGpsControls \?/);
    expect(stack).toMatch(/flex: "0 0 44px"/);
    expect(stack).toMatch(/width: 44/);
    expect(stack).toMatch(/height: 44/);
    expect(stack).toMatch(/minWidth: 44/);
    expect(stack).toMatch(/minHeight: 44/);
    expect(stack).toMatch(/toggleGpsDrawer/);
    expect(bar).not.toMatch(/id: "gps"/);
  });

  it("GPS-05: Shell retains compatibility for the legacy replacement layout", () => {
    const shell = read("components/commandCenter/CommandCenterShell.tsx");
    expect(shell).toMatch(/HubMobileGpsNavDrawer/);
    expect(shell).toMatch(/shouldReplaceMonitor2Slot/);
    expect(shell).toMatch(/gpsReplacesMonitor2/);
    expect(shell).toMatch(/hub-gps-monitor-back|MONITOR BACK|HubMobileGpsNavDrawer/);
  });

  it("GPS-06: GpsNavDrawer retains legacy Monitor Back and role-aware nav tiles", () => {
    const drawer = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");
    expect(drawer).toMatch(/hub-gps-monitor-back/);
    expect(drawer).toMatch(/MONITOR BACK/);
    expect(drawer).toMatch(/restoreMonitor2/);
    expect(drawer).toMatch(/centers\.map/);
    expect(drawer).toMatch(/data-testid="hub-gps-operating-centers"/);
    expect(drawer).toMatch(/data-gps-center-id=\{center\.id\}/);
    expect(drawer).toMatch(/onOpenPanel\(center\.primaryModule\)/);
    expect(drawer).not.toMatch(/center\.id === "commercial"[^\n]*commerce_center/);
  });

  it("GPS-PUBLICS: PUBLICS is distinct from YOUR PAGE and opens the shared profile discovery route", () => {
    const drawer = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");
    expect(drawer).toMatch(/\{ id: "publics", label: "PUBLICS", kind: "publics" \}/);
    expect(drawer).toMatch(/item\.kind === "social" && item\.socialTab/);
    expect(drawer).toMatch(/socialTab: "people"/);
    expect(drawer).toMatch(/: "\/profiles"/);
    expect(drawer).not.toMatch(/"\/friends"/);
    expect(drawer).toMatch(/window\.location\.assign\(dest\)/);
    expect(drawer).not.toMatch(/router\.push\("\/profiles"\)/);
    expect(drawer).toMatch(/\{ id: "your-page", label: "YOUR PAGE", kind: "your-page" \}/);
    expect(drawer).toMatch(/if \(item\.kind === "your-page"\)/);
    const desktopNav = read("components/commandCenter/CommandCenterTopNav.tsx");
    expect(desktopNav).toMatch(/\{ label: "PUBLICS", href: "\/profiles" \}/);
    expect(desktopNav).not.toMatch(/\{ label: "PROFILES", href: "\/profiles" \}/);
    expect(desktopNav).toMatch(/NAV_LINKS\.map/);
  });

  it("GPS-07: Hub Command Bed has a distinct GPS group after Cast and before Mix", () => {
    const stack = read("components/commandCenter/CommandCenterMediaStack.tsx");
    const commandGroup = stack.indexOf('data-tmi-command-controls-group="1"');
    const castGroup = stack.indexOf('data-tmi-cast-controls-group="1"');
    const gpsGroup = stack.indexOf('data-tmi-gps-controls-group="1"');
    const mixGroup = stack.indexOf('data-tmi-mix-controls-group="1"');
    expect(commandGroup).toBeGreaterThan(-1);
    expect(castGroup).toBeGreaterThan(commandGroup);
    expect(gpsGroup).toBeGreaterThan(castGroup);
    expect(mixGroup).toBeGreaterThan(gpsGroup);
    expect(stack).toMatch(/enableGpsControls\s*=\s*false/);
    expect(stack).toMatch(/testId: "tmi-command-gps"/);
    expect(stack).toMatch(/toggleGpsDrawer/);
  });

  it("GPS-08: Hub GPS has a persistent shell recall button and one side drawer without restacking monitors", () => {
    const shell = read("components/commandCenter/CommandCenterShell.tsx");
    const drawer = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");
    expect(shell).toMatch(/const gpsDrawerVisible = isGpsDrawerVisible\(gpsLayout\)/);
    expect(shell).toMatch(/data-testid="hub-gps-recall"/);
    expect(shell).toMatch(/aria-expanded=\{gpsDrawerVisible\}/);
    expect(shell).toMatch(/onClick=\{toggleGpsDrawer\}/);
    expect(shell).toMatch(/position: "fixed"/);
    expect(shell).not.toMatch(/getState\(\)\.openGpsDrawer\(\);\s*\}, \[\]\)/);
    expect(shell).toMatch(/enableGpsControls/);
    expect(shell).toMatch(/monitorLayoutForStack[\s\S]*?gpsReplacesMonitor2/);
    expect(shell).toMatch(/placement="overlay"/);
    expect(shell).not.toMatch(/hub-gps-menu-anchor/);
    expect(shell.match(/<HubMobileGpsNavDrawer/g)).toHaveLength(1);
    expect(drawer).toMatch(/createPortal/);
    expect(drawer).toMatch(/position: "fixed"/);
    expect(drawer).toMatch(/data-gps-overlay-root=\{placement === "overlay" \? "shell" : undefined\}/);
    expect(drawer).toMatch(/data-gps-side=\{placement === "overlay" \? "right" : undefined\}/);
  });

  it("GPS-09: drawer placement follows Monitor 2 occupancy, not the rail button", () => {
    expect(resolveDrawerPlacement({
      m2ExplicitlyActivated: false,
      m2HasActivePresentation: false,
      m2HasProtectedSession: false,
    })).toBe("monitor-2-slot");
    expect(resolveDrawerPlacement({
      m2ExplicitlyActivated: true,
      m2HasActivePresentation: false,
      m2HasProtectedSession: false,
    })).toBe("below-monitor-2");
    expect(resolveDrawerPlacement({
      m2ExplicitlyActivated: false,
      m2HasActivePresentation: true,
      m2HasProtectedSession: false,
    })).toBe("below-monitor-2");
    expect(resolveDrawerPlacement({
      m2ExplicitlyActivated: false,
      m2HasActivePresentation: false,
      m2HasProtectedSession: true,
    })).toBe("below-monitor-2");
    const shell = read("components/commandCenter/CommandCenterShell.tsx");
    expect(shell).toMatch(/resolveDrawerPlacement/);
    expect(shell).toMatch(/yieldSecondaryMonitor=\{gpsDrawerDocked && drawerPlacement === "monitor-2-slot"\}/);
    const rail = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");
    expect(rail).toMatch(/setDrawerDock\("under-b"\)/);
    expect(rail).not.toMatch(/midY >= split/);
  });

  it("GPS-10: mobile panels dock under the monitors and same-module reselect closes", () => {
    const shell = read("components/commandCenter/CommandCenterShell.tsx");
    const rail = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");
    expect(shell).toMatch(/if \(isMobile\) setDrawerDock\("under-b"\)/);
    expect(shell).toMatch(/isCanonicalWorkspaceActive\(id\)/);
    expect(shell).toMatch(/data-hub-mobile-ad-rail="1"/);
    expect(shell.match(/data-hub-mobile-ad-rail="1"/g)).toHaveLength(1);
    expect(shell.indexOf("data-hub-mobile-ad-rail=\"1\"")).toBeGreaterThan(shell.indexOf("<CommandCenterMediaStack"));
    expect(rail).toMatch(/isGpsLeftSwipe\(deltaX, deltaY\)/);
    expect(rail).toMatch(/closeGpsDrawer\(\)/);
    expect(rail).toMatch(/setRailScrollTop\(node\.scrollTop\)/);
    expect(rail).toMatch(/item\.id === "articles"/);
    expect(rail).toMatch(/touchAction: "pan-y"/);
    expect(rail).toMatch(/isGpsReleaseDestinationVisible/);
    expect(rail).not.toMatch(/label: "LIVE ROOMS"/);
    expect(rail).toMatch(/label: "ARTICLES"/);
    expect(shell.match(/data-hub-mobile-ad-rail="1"/g)).toHaveLength(1);
  });

  it("GPS-M2: the M2 action restores its yielded slot by closing the drawer", () => {
    const monitorStack = read("components/monitors/CanonicalDualMonitorStack.tsx");
    const mediaStack = read("components/commandCenter/CommandCenterMediaStack.tsx");
    const shell = read("components/commandCenter/CommandCenterShell.tsx");
    expect(monitorStack).toMatch(/yieldSecondaryMonitor && underMonitorSlot\) onRestoreMonitor2\?\./);
    expect(mediaStack).toMatch(/onRestoreMonitor2=\{onRestoreMonitor2\}/);
    expect(shell).toMatch(/onRestoreMonitor2=\{\(\) => \{/);
    expect(shell).toMatch(/setDrawerDock\(null\)/);
    expect(shell).toMatch(/closeSurface\("DRAWER"\)/);
  });

  it("PWA-SW: worker keeps Range bypass and skipWaiting APIs valid", () => {
    const worker = fs.readFileSync(path.join(root, "../public/sw.js"), "utf8");
    expect(worker).toMatch(/request\.headers\.has\('range'\)/);
    expect(worker).toMatch(/self\.skipWaiting\(\)/);
    expect(worker).not.toMatch(/skipwaiting\(/);
  });
});
