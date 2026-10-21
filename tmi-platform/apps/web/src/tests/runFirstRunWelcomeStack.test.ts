import fs from "fs";
import path from "path";

const root = path.join(__dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

/**
 * The welcome dismiss lives in RoleWelcomeBriefing (z-index 9450).
 * The quick-start checklist used to paint over it at z-index 9999, so a normal
 * tap on "Not now" hit <h2>Your First Steps</h2>. This test locks the repair:
 * the checklist stays under that dialog and under the hub GPS chrome, and its
 * own close control is not underneath the heading.
 */
describe("first-run welcome stacking", () => {
  test("checklist does not paint over the welcome dismiss or the hub GPS chrome", () => {
    const overlay = read("components/onboarding/FirstRunExperienceOverlay.tsx");
    const welcome = read("components/welcome/RoleWelcomeBriefing.tsx");
    const shell = read("components/commandCenter/CommandCenterShell.tsx");
    const drawer = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");

    const firstRunZ = Number(overlay.match(/const FIRST_RUN_Z = (\d+);/)?.[1]);
    const welcomeZ = Number(welcome.match(/zIndex:\s*(\d+)/)?.[1]);
    const recallBlock = shell.slice(shell.indexOf('data-testid="hub-gps-recall"'));
    const recallZ = Number(recallBlock.match(/zIndex:\s*(\d+)/)?.[1]);
    const drawerZ = Number(
      drawer.slice(drawer.indexOf('data-testid="hub-mobile-gps-drawer"')).match(/zIndex:\s*(\d+)/)?.[1],
    );

    expect(firstRunZ).toBe(9340);
    expect(welcomeZ).toBe(9450);
    expect(recallZ).toBe(9350);
    expect(drawerZ).toBe(9360);
    expect(firstRunZ).toBeLessThan(welcomeZ);
    expect(firstRunZ).toBeLessThan(recallZ);
    expect(firstRunZ).toBeLessThan(drawerZ);
    expect(overlay).not.toContain("zIndex: 9999");
    expect(overlay).toContain("zIndex: FIRST_RUN_Z");
    expect(overlay).toContain("pointerEvents: compactViewport ? 'none' : 'auto'");
    // The checklist card itself keeps pointer events unless it is yielding to
    // the open GPS drawer (compact + data-gps-rail-open) — see the dedicated
    // interaction-ownership test below.
    expect(overlay).toContain("pointerEvents: compactViewport && gpsRailOpen ? 'none' : 'auto'");
  });

  test("close control sits above the heading and keeps a practical touch target", () => {
    const overlay = read("components/onboarding/FirstRunExperienceOverlay.tsx");
    const closeAt = overlay.indexOf('aria-label="Close"');
    const headingAt = overlay.indexOf("Your First Steps");
    const closeBlock = overlay.slice(closeAt, headingAt);

    expect(closeAt).toBeGreaterThan(-1);
    expect(headingAt).toBeGreaterThan(closeAt);
    expect(closeBlock).toContain("minWidth: 44");
    expect(closeBlock).toContain("minHeight: 44");
    expect(closeBlock).not.toContain("position: 'absolute'");
    expect(closeBlock).toContain("zIndex: 2");

    const headingLine = overlay.split("\n").find((line) => line.includes("Your First Steps"));
    expect(headingLine).toBeTruthy();
    expect(headingLine).not.toContain("zIndex");
    expect(overlay).toContain("explore on my own");
    expect(overlay).toContain("safe-area-inset-top");
    expect(overlay).toContain("safe-area-inset-bottom");
  });

  test("checklist yields taps to the open GPS drawer on compact screens", () => {
    const overlay = read("components/onboarding/FirstRunExperienceOverlay.tsx");
    const drawer = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");

    // The drawer must publish its open state on <html> so overlays can yield.
    expect(drawer).toContain('data-gps-rail-open');
    // The checklist must track that signal and yield pointer events while open.
    expect(overlay).toContain("GPS_RAIL_OPEN_SELECTOR");
    expect(overlay).toContain("pointerEvents: compactViewport && gpsRailOpen ? 'none' : 'auto'");
  });

  test("GPS group labels never intercept destination taps", () => {
    const drawer = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");
    // Group labels are pure text; they must be pointer-transparent so a label
    // rect overlapping a destination tile cannot swallow the tap.
    const labelMatches = drawer.match(/letterSpacing: "0\.14em"[\s\S]{0,160}?pointerEvents: "none"/);
    expect(labelMatches).toBeTruthy();
  });
});
