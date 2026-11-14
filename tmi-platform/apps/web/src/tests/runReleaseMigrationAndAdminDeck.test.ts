import fs from "fs";
import path from "path";
import {
  CANONICAL_RELEASE_MANIFEST,
  compareReleases,
  isReleaseSupported,
  parseReleaseNumber,
  type TmiReleaseManifest,
} from "@/lib/system/TmiReleaseMigrationAuthority";

function readSrc(relPath: string): string {
  const absPath = path.resolve(__dirname, "..", relPath);
  return fs.readFileSync(absPath, "utf8");
}

describe("TMI Automatic Release Migration Authority (Game-Style Update Law)", () => {
  test("MIGRATE-01: Canonical release manifest fields exist and are well-typed", () => {
    expect(typeof CANONICAL_RELEASE_MANIFEST.releaseId).toBe("string");
    expect(typeof CANONICAL_RELEASE_MANIFEST.minimumSupportedClientRelease).toBe("string");
    expect(typeof CANONICAL_RELEASE_MANIFEST.uiSchemaVersion).toBe("number");
    expect(typeof CANONICAL_RELEASE_MANIFEST.cacheSchemaVersion).toBe("number");
    expect(typeof CANONICAL_RELEASE_MANIFEST.requiresReauthentication).toBe("boolean");
    expect(CANONICAL_RELEASE_MANIFEST.uiSchemaVersion).toBeGreaterThanOrEqual(1);
    expect(CANONICAL_RELEASE_MANIFEST.cacheSchemaVersion).toBeGreaterThanOrEqual(6);
  });

  test("MIGRATE-02: Release version number parser extracts numeric release tokens", () => {
    expect(parseReleaseNumber("R42")).toBe(42);
    expect(parseReleaseNumber("R37")).toBe(37);
    expect(parseReleaseNumber("v6")).toBe(6);
    expect(parseReleaseNumber("R2026.09.20-M1")).toBe(2026);
    expect(parseReleaseNumber("unknown")).toBe(0);
    expect(parseReleaseNumber(null)).toBe(0);
  });

  test("MIGRATE-03: compareReleases evaluates relative release progression", () => {
    expect(compareReleases("R42", "R40")).toBeGreaterThan(0);
    expect(compareReleases("R37", "R40")).toBeLessThan(0);
    expect(compareReleases("R42", "R42")).toBe(0);
    expect(compareReleases("R37", "R42")).toBeLessThan(0);
  });

  test("MIGRATE-04: isReleaseSupported correctly identifies obsolete vs compatible clients", () => {
    const testManifest: TmiReleaseManifest = {
      releaseId: "R42",
      minimumSupportedClientRelease: "R40",
      uiSchemaVersion: 2,
      cacheSchemaVersion: 6,
      requiresReauthentication: true,
      publishedAt: "2026-09-20T18:00:00Z",
    };

    expect(isReleaseSupported("R42", testManifest)).toBe(true);
    expect(isReleaseSupported("R41", testManifest)).toBe(true);
    expect(isReleaseSupported("R40", testManifest)).toBe(true);
    expect(isReleaseSupported("R39", testManifest)).toBe(false);
    expect(isReleaseSupported("R37", testManifest)).toBe(false);
    expect(isReleaseSupported(null, testManifest)).toBe(false);
    expect(isReleaseSupported("unknown", testManifest)).toBe(false);
  });

  test("MIGRATE-05: Major release reauthentication policy is configurable per release", () => {
    const minorManifest: TmiReleaseManifest = {
      releaseId: "R43",
      minimumSupportedClientRelease: "R40",
      uiSchemaVersion: 2,
      cacheSchemaVersion: 6,
      requiresReauthentication: false, // minor deployment preserves session
      publishedAt: "2026-09-20T18:00:00Z",
    };
    expect(minorManifest.requiresReauthentication).toBe(false);

    // Current major transition has reauthentication intentionally enabled
    expect(CANONICAL_RELEASE_MANIFEST.requiresReauthentication).toBe(true);
  });

  test("MIGRATE-06: /api/release/manifest and /api/version expose canonical release manifest", () => {
    const manifestRouteSrc = readSrc("app/api/release/manifest/route.ts");
    expect(manifestRouteSrc).toContain("CANONICAL_RELEASE_MANIFEST");
    expect(manifestRouteSrc).toContain("Cache-Control");
    expect(manifestRouteSrc).toContain("no-store");

    const versionRouteSrc = readSrc("app/api/version/route.ts");
    expect(versionRouteSrc).toContain("releaseManifest: CANONICAL_RELEASE_MANIFEST");
  });

  test("MIGRATE-07: DeploymentAutoUpdate integrates release handshake on mount and visibility change", () => {
    const autoUpdateSrc = readSrc("components/system/DeploymentAutoUpdate.tsx");
    expect(autoUpdateSrc).toContain("isReleaseSupported");
    expect(autoUpdateSrc).toContain("executeReleaseMigration");
    expect(autoUpdateSrc).toContain("releaseManifest");
    expect(autoUpdateSrc).toContain("isSafeToUpdate");
  });

  test("MIGRATE-08: layout.tsx stamps release meta tag and body data attribute", () => {
    const layoutSrc = readSrc("app/layout.tsx");
    expect(layoutSrc).toContain('meta name="tmi-release-id"');
    expect(layoutSrc).toContain("data-tmi-release=");
    expect(layoutSrc).toContain("CANONICAL_RELEASE_MANIFEST.releaseId");
  });
});

describe("TMI Bounded Mobile Admin Physical Repair", () => {
  test("ADMIN-DECK-01: Sticky bottom dock contains exact sequence [ ADMIN ] [ navigation/control ] [ B ] [ other controls ]", () => {
    const flightDeckSrc = readSrc("components/admin/OverseerFlightDeck.tsx");

    // Must have dock-bottom row
    expect(flightDeckSrc).toContain('data-row="dock-bottom"');

    // Sequence checks
    const dockStartIndex = flightDeckSrc.indexOf('data-row="dock-bottom"');
    const adminIndex = flightDeckSrc.indexOf("UniversalCommandController", dockStartIndex);
    const navIndex = flightDeckSrc.indexOf('title="Toggle left rail"', dockStartIndex);
    const bIndex = flightDeckSrc.indexOf('data-testid="tmi-dock-canonical-account-b"', dockStartIndex);
    const exitIndex = flightDeckSrc.indexOf('title="Exit"', dockStartIndex);

    expect(dockStartIndex).toBeGreaterThan(-1);
    expect(adminIndex).toBeGreaterThan(dockStartIndex);
    expect(navIndex).toBeGreaterThan(adminIndex);
    expect(bIndex).toBeGreaterThan(navIndex);
    expect(exitIndex).toBeGreaterThan(bIndex);
  });

  test("ADMIN-DECK-02: Canonical B account button mounts UniversalAccountIdentityControl", () => {
    const flightDeckSrc = readSrc("components/admin/OverseerFlightDeck.tsx");
    expect(flightDeckSrc).toContain(
      '<UniversalAccountIdentityControl compact={isMobile} fallbackDisplayName="Berntout" />',
    );
  });

  test("ADMIN-DECK-03: UniversalAccountIdentityControl & UniversalAccountDropdown support upward anchoring", () => {
    const identityCtrlSrc = readSrc("components/account/UniversalAccountIdentityControl.tsx");
    expect(identityCtrlSrc).toContain("isBottomDock");
    expect(identityCtrlSrc).toContain("anchorBottom={panelPos.bottom}");

    const dropdownSrc = readSrc("components/account/UniversalAccountDropdown.tsx");
    expect(dropdownSrc).toContain("anchorBottom?: number;");
    expect(dropdownSrc).toContain("anchorBottom !== undefined ? { bottom: anchorBottom");
  });

  test("ADMIN-DECK-04: Mobile touch target sizes enforce >=44px and safe-area inset protection", () => {
    const flightDeckSrc = readSrc("components/admin/OverseerFlightDeck.tsx");
    expect(flightDeckSrc).toContain("minWidth: 44");
    expect(flightDeckSrc).toContain("minHeight: 44");
    expect(flightDeckSrc).toContain('touchAction: "manipulation"');
    expect(flightDeckSrc).toContain("env(safe-area-inset-bottom");
    expect(flightDeckSrc).toContain("zIndex: 150");
  });

  test("ADMIN-DECK-05: OBS VIDEO in ObservatoryVideoCallPanel floats above the bottom dock", () => {
    const obsCallSrc = readSrc("components/admin/ObservatoryVideoCallPanel.tsx");
    expect(obsCallSrc).toContain('bottom: isMobile ? "calc(74px + env(safe-area-inset-bottom, 14px))"');
  });

  test("ADMIN-DECK-06: All 9 Founder/CEO cyan capability controls are present in ribbon and dispatch real commands", () => {
    const workspaceMgrSrc = readSrc("components/admin/overseer/workspace/WorkspaceManager.tsx");

    const expectedLabels = [
      "FOUNDER OVERRIDE",
      "ALL EXECUTIVE",
      "REVENUE MANAGE",
      "SECURITY MANAGE",
      "AUTOMATION MANAGE",
      "MEDIA MANAGE",
      "QUEUE MANAGE",
      "DEPLOYMENT MANAGE",
      "MUSIC MANAGE",
    ];

    for (const label of expectedLabels) {
      expect(workspaceMgrSrc).toContain(label);
    }
    expect(workspaceMgrSrc).toContain("livingOsCommandBus.dispatch");
    expect(workspaceMgrSrc).toContain("DRAWER_OPENED");
  });

  test("ADMIN-DECK-07: All 9 Founder/CEO permissions are wired to real canonical authorities in OverseerFlightDeck", () => {
    const flightDeckSrc = readSrc("components/admin/OverseerFlightDeck.tsx");

    expect(flightDeckSrc).toContain('requiredPermission === "ai.executive"');
    expect(flightDeckSrc).toContain("setBotIntelOpen(true)");

    expect(flightDeckSrc).toContain('requiredPermission === "queue.manage"');
    expect(flightDeckSrc).toContain('"/admin/visual-queue"');

    expect(flightDeckSrc).toContain('requiredPermission === "deployment.manage"');
    expect(flightDeckSrc).toContain('"/admin/runtime-check"');

    expect(flightDeckSrc).toContain('requiredPermission === "music.manage"');
    expect(flightDeckSrc).toContain('"/admin/submission-locker"');

    // Panel permissions
    const configsSrc = readSrc("components/admin/overseer/workspace/WorkspaceConfigs.ts");
    expect(configsSrc).toContain('requiredPermission: "founder.override"');
    expect(configsSrc).toContain('requiredPermission: "media.manage"');
    expect(configsSrc).toContain('requiredPermission: "revenue.manage"');
    expect(configsSrc).toContain('requiredPermission: "security.manage"');
    expect(configsSrc).toContain('requiredPermission: "automation.manage"');
  });
});
