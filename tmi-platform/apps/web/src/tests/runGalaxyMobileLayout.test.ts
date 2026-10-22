import fs from "fs";
import path from "path";

const root = path.join(__dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

/**
 * Galaxy physical-cert regression contract (2026-10-21).
 * Physical Galaxy screenshots exposed failures that the testid-presence sweep
 * never caught: monitors crushed to a 277px strip, GPS opening on the right,
 * a giant gray Command Bed wrapping the controls. These tests lock the repair
 * so the layout contract is asserted, not just element existence.
 */
describe("galaxy mobile layout contract", () => {
  test("phone monitors are not width-capped by the viewport height budget", () => {
    const stack = read("components/monitors/CanonicalDualMonitorStack.tsx");
    // The height-budget width cap must be skipped on phone so monitors keep
    // full content width at 16:9 and scroll vertically.
    expect(stack).toContain("if (isPhone)");
    expect(stack).toMatch(/isPhone[\s\S]{0,200}setHeightBudgetMaxWidth/);
  });

  test("Command Bed chassis box and collapse toggle are removed", () => {
    const media = read("components/commandCenter/CommandCenterMediaStack.tsx");
    expect(media).not.toContain("COMMAND BED");
    expect(media).not.toContain("EXPAND BED");
    expect(media).not.toContain("HIDE (MIRROR)");
    expect(media).not.toContain("controlBedCollapsed");
    expect(media).not.toContain("data-tmi-polished-control-bed");
    // Direct controls surface replaces the bed.
    expect(media).toContain('data-tmi-direct-controls="1"');
  });

  test("COMMAND order: RECORD directly below GO LIVE; USER ID + NOTE share one row", () => {
    const media = read("components/commandCenter/CommandCenterMediaStack.tsx");
    const golive = media.indexOf('tmi-top-cluster-golive');
    const record = media.indexOf('tmi-top-cluster-record');
    const userid = media.indexOf('tmi-top-cluster-user-id');
    const note = media.indexOf('tmi-top-cluster-note');
    expect(golive).toBeGreaterThan(-1);
    expect(record).toBeGreaterThan(golive);          // RECORD below GO LIVE
    expect(userid).toBeGreaterThan(record);
    expect(note).toBeGreaterThan(userid);            // NOTE after USER ID
    // USER ID and NOTE in the same flex row wrapper.
    const rowSlice = media.slice(media.lastIndexOf('{/* Row: USER ID + NOTE', userid), media.indexOf('{/* Row: EDIT PROFILE', userid));
    expect(rowSlice).toContain('tmi-top-cluster-user-id');
    expect(rowSlice).toContain('tmi-top-cluster-note');
  });

  test("NOTE opens the canonical Notes workspace (no duplicate authority)", () => {
    const media = read("components/commandCenter/CommandCenterMediaStack.tsx");
    expect(media).toContain('openNotesWorkspace("notes", "half")');
    expect(media).not.toContain("Notes2");
    expect(media).not.toContain("note-modal");
  });

  test("CAST exposed set = OPEN CAST / SHARE SCREEN / PROMOTE / TELEPROMPTER; SHARE LINK removed", () => {
    const media = read("components/commandCenter/CommandCenterMediaStack.tsx");
    expect(media).toContain('tmi-top-cluster-open-cast');
    expect(media).toContain('tmi-top-cluster-sharescreen');
    expect(media).toContain('tmi-top-cluster-promote');
    expect(media).toContain('tmi-top-cluster-teleprompter');
    // SHARE LINK must not be an exposed main Cast control (exact id, not the
    // 'tmi-top-cluster-sharescreen' substring).
    expect(media).not.toContain('tmi-top-cluster-share"');
    expect(media).not.toContain("testId: \"tmi-top-cluster-share\"");
    // TELEPROMPTER is honestly gated (blocked), never faked.
    expect(media).toContain('data-teleprompter-state="blocked"');
    expect(media).toContain('disabled');
  });

  test("GPS docks RIGHT (owner-locked), separate, and the trigger clears the avatar", () => {
    const drawer = read("components/commandCenter/HubMobileGpsNavDrawer.tsx");
    const shell = read("components/commandCenter/CommandCenterShell.tsx");
    expect(drawer).toContain('data-gps-side={placement === "overlay" ? "right"');
    expect(drawer).toContain('right: "max(8px, env(safe-area-inset-right))"');
    const recallBlock = shell.slice(shell.indexOf('data-testid="hub-gps-recall"'));
    expect(recallBlock).toContain('right: "max(10px, env(safe-area-inset-right))"');
  });

  test("GO LIVE / CAST / SHARE handlers preserved as direct controls", () => {
    const media = read("components/commandCenter/CommandCenterMediaStack.tsx");
    expect(media).toContain("presentInstantGoLiveInPlace");
    expect(media).toContain("presentCanonicalWorkspace(\"live-destinations\"");
    expect(media).toContain("cycleSharePress");
    expect(media).toContain("setPromoteOpen");
  });

  test("empty sponsor inventory collapses instead of reserving dead canvas", () => {
    const rail = read("components/monetization/AdRail.tsx");
    expect(rail).toContain("reservesCanvas");
    expect(rail).toMatch(/minHeight\s*=\s*reservesCanvas\s*\?\s*RESERVE_MIN_HEIGHT\[reserve\]\s*:\s*0/);
  });

  test("welcome overlay never mounts for unauthenticated public visitors", () => {
    const overlay = read("components/onboarding/FirstRunExperienceOverlay.tsx");
    // Visibility is gated behind a confirmed-authenticated account.
    expect(overlay).toContain("authenticated");
    expect(overlay).toMatch(/if \(!cancelled && authenticated\) setVisible\(true\)/);
    // The unauthenticated fall-through must NOT call setVisible(true).
    expect(overlay).not.toMatch(/if \(!cancelled\) setVisible\(true\)/);
  });
});
