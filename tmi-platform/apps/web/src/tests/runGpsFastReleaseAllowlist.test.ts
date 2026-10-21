import fs from "fs";
import path from "path";
import {
  gpsDestinationState,
  isGpsReleaseDestinationVisible,
} from "@/lib/commandCenter/gpsReleaseAllowlist";

const root = path.join(__dirname, "..");

describe("GPS fast release allowlist", () => {
  test("keeps live destinations active and parks unfinished ones as coming soon", () => {
    expect(gpsDestinationState("your-page")).toBe("LIVE");
    expect(gpsDestinationState("messages")).toBe("COMING_SOON");
    expect(gpsDestinationState("community")).toBe("COMING_SOON");
    expect(gpsDestinationState("friends")).toBe("COMING_SOON");
    expect(gpsDestinationState("lobby")).toBe("LIVE");
    expect(gpsDestinationState("submissions")).toBe("COMING_SOON");
    expect(gpsDestinationState("avatar")).toBe("COMING_SOON");
    expect(gpsDestinationState("welcome")).toBe("HIDDEN");
    expect(gpsDestinationState("gps-guide")).toBe("LIVE");
    expect(isGpsReleaseDestinationVisible("gps-guide")).toBe(true);
    expect(isGpsReleaseDestinationVisible("welcome")).toBe(false);
    const drawer = fs.readFileSync(
      path.join(root, "components/commandCenter/HubMobileGpsNavDrawer.tsx"),
      "utf8",
    );
    expect(drawer).toContain("isGpsReleaseDestinationVisible(item.id)");
    expect(drawer).toContain('data-testid="gps-coming-soon"');
    expect(drawer).toContain("GOT IT");
    expect(drawer).toContain('data-testid="gps-guide"');
    expect(drawer).toContain('id: "gps-guide"');
    expect(drawer).not.toContain('id: "welcome"');
    expect(drawer).not.toContain('"/friends"');
    const studio = fs.readFileSync(path.join(root, "components/profile/YourPageStudio.tsx"), "utf8");
    expect(studio).toContain('data-testid="studio-save"');
    expect(studio).not.toContain('data-testid="studio-publish"');
    const welcome = fs.readFileSync(path.join(root, "components/welcome/RoleWelcomeBriefing.tsx"), "utf8");
    expect(welcome).toContain("Welcome to your stage");
    expect(welcome).toContain("Welcome to the experience");
    expect(welcome).toContain("You&apos;re early. That&apos;s the point. Welcome to the build.");
    expect(welcome).toContain("Everything you need. One place.");
    expect(welcome).toContain('data-testid="tmi-welcome-truth"');
    expect(welcome).not.toContain("hub-gps-rail-welcome");
  });

  test("Coming Soon destinations return before invoking social loaders", () => {
    const drawer = fs.readFileSync(
      path.join(root, "components/commandCenter/HubMobileGpsNavDrawer.tsx"),
      "utf8",
    );
    const releaseGate = drawer.indexOf('if (!release || release.state !== "LIVE") {');
    const socialLoader = drawer.indexOf("onOpenSocial?.(item.socialTab);");

    expect(releaseGate).toBeGreaterThan(-1);
    expect(socialLoader).toBeGreaterThan(releaseGate);
    expect(drawer.slice(releaseGate, socialLoader)).toMatch(/setSoonId\(item\.id\);\s*return;/);
    const rail = fs.readFileSync(
      path.join(root, "components/commandCenter/HubCommunicationsRail.tsx"),
      "utf8",
    );
    expect(rail).toContain('gpsDestinationState("messages") === "LIVE"');
    expect(rail).toContain('gpsDestinationState("community") === "LIVE"');
    expect(rail).toContain("ReleaseHeldNote");
    const bar = fs.readFileSync(
      path.join(root, "components/commandCenter/HubMobileQuickActionBar.tsx"),
      "utf8",
    );
    expect(bar).toContain("onOpenCommunications(commsTab)");
    expect(bar).not.toContain('if ((id === "messages" || id === "community") && gpsDestinationState(id) !== "LIVE")');
  });
});
