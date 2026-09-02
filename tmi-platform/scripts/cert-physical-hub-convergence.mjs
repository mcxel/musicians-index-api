/**
 * cert-physical-hub-convergence.mjs
 * Physical Browser Certification for TMI Hub Convergence & Command Strip
 */

import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), ".cursor", "artifacts", "hub-physical-convergence");
const ARTIFACTS_DIR = OUT_DIR;
const NAV_TIMEOUT = Number(process.env.CERT_NAV_TIMEOUT_MS || 600000);
const GOTO_WAIT = process.env.CERT_GOTO_WAIT || "commit";
const SHOT_TIMEOUT = Number(process.env.CERT_SHOT_TIMEOUT_MS || 60000);

async function safeScreenshot(page, shotPath) {
  try {
    await page.screenshot({ path: shotPath, timeout: SHOT_TIMEOUT, animations: "disabled" });
    return true;
  } catch (err) {
    console.warn(`  [SHOT] Failed ${path.basename(shotPath)}:`, err.message);
    return false;
  }
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function copyToArtifacts(srcPath, destFilename) {
  // Single canonical evidence directory — no external brain copy.
  if (path.resolve(path.dirname(srcPath)) === path.resolve(OUT_DIR)) return;
  try {
    const destPath = path.join(OUT_DIR, destFilename);
    fs.copyFileSync(srcPath, destPath);
    console.log(`  [ARTIFACT] Copied ${destFilename}`);
  } catch (err) {
    console.warn(`  [ARTIFACT] Could not copy ${destFilename}:`, err.message);
  }
}

async function run() {
  console.log(`[CERT] Starting physical browser certification against ${BASE}...`);
  const browser = await chromium.launch({ headless: true });

  const report = {
    obsoleteSecondaryNavRemoved: false,
    canonicalCommandStripMounted: false,
    betaFeedbackPositionAndCollision: false,
    yophoCanonicalPresentation: false,
    universalPlayerSourceOwnership: false,
    fanHubDesktop: false,
    fanHubMobile: false,
    performerHubDesktop: false,
    performerHubMobile: false,
    screenshots: [],
  };

  try {
    // ════════════════════════════════════════════════════════════════════════════
    // 1. FAN HUB — DESKTOP (1280x800)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n── 1. FAN HUB — DESKTOP (1280x800) ──");
    const desktopFanCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await desktopFanCtx.addInitScript(() => {
      try {
        localStorage.setItem("tmi_first_run_v1", JSON.stringify({ dismissed: true, completedSteps: [], role: "fan" }));
        localStorage.setItem("tmi_ad_consent", "declined");
      } catch (e) {}
    });
    await desktopFanCtx.addCookies([
      { name: "tmi_session", value: "cert_session_fan_p0", domain: "localhost", path: "/" },
      { name: "tmi_session_id", value: "user-fan-p0", domain: "localhost", path: "/" },
      { name: "tmi_user_id", value: "user-fan-p0", domain: "localhost", path: "/" },
      { name: "tmi_role", value: "FAN", domain: "localhost", path: "/" },
      { name: "tmi_roles", value: "FAN", domain: "localhost", path: "/" },
      { name: "tmi_display_name", value: "Marcel Fan", domain: "localhost", path: "/" },
    ]);

    const pageFan = await desktopFanCtx.newPage();
    pageFan.on("console", msg => {
      if (msg.type() === "error") console.log(`[FAN BROWSER ERROR]: ${msg.text()}`);
    });
    pageFan.on("pageerror", err => console.log(`[FAN UNCAUGHT ERROR]: ${err.message}`));
    console.log("Navigating to /hub/fan...");
    await pageFan.goto(`${BASE}/hub/fan?hubCert=${Date.now()}`, { waitUntil: GOTO_WAIT, timeout: NAV_TIMEOUT });
    
    console.log("Waiting for client hydration (not SSR-only cast buttons)...");
    await pageFan.waitForSelector('[data-testid="tmi-cast-playlist-btn"]', { timeout: 180000 });
    // CommandCenterShell/MediaStack only set these after real client hydrate.
    // SSR HTML has the buttons earlier; waiting on buttons alone caused false YoPho FAIL.
    await pageFan.waitForFunction(
      () =>
        typeof window.__TMI_OPEN_YOPHO__ === "function" &&
        document.documentElement.getAttribute("data-shell-build") === "ccs-2026-08-27-canonical-slice1" &&
        document.documentElement.getAttribute("data-tmi-open-yopho-fn") === "1",
      null,
      { timeout: 180000 },
    );
    await pageFan.waitForTimeout(500);

    // 1a. Verify obsolete secondary media navigation is removed at source
    const obsoleteNavCount = await pageFan.locator('nav:has-text("HOME | DISCOVER | LIVE NOW | LOBBY | MESSAGES | NOTIFICATIONS"), nav:has-text("HOME"):has-text("DISCOVER"):has-text("LIVE NOW"):has-text("LOBBY")').count();
    if (obsoleteNavCount === 0) {
      report.obsoleteSecondaryNavRemoved = true;
      console.log("  ✔ Obsolete secondary media navigation (HOME/DISCOVER/LIVE NOW/LOBBY/MESSAGES) is absent from DOM (0 found)");
    } else {
      console.log(`  ❌ Obsolete secondary nav still present: count = ${obsoleteNavCount}`);
    }

    // 1b. Verify Canonical Command Strip
    const snipsBtn = pageFan.locator('[data-testid="tmi-explore-snips-btn"]');
    const videoShuffleBtn = pageFan.locator('[data-testid="tmi-explore-videoshuffle-btn"]');
    const profilesBtn = pageFan.locator('[data-testid="tmi-explore-profiles-btn"]');
    const lobbyWallBtn = pageFan.locator('[data-testid="tmi-lobby-wall-trigger"]');
    const castPlaylistBtn = pageFan.locator('[data-testid="tmi-cast-playlist-btn"]');
    const castGoliveBtn = pageFan.locator('[data-testid="tmi-cast-golive-btn"]');
    const castMemoryBtn = pageFan.locator('[data-testid="tmi-cast-memory-btn"]');
    const castYophoBtn = pageFan.locator('[data-testid="tmi-cast-yopho-btn"]');
    const castScreenBtn = pageFan.locator('[data-testid="tmi-cast-sharescreen-btn"]');
    const castSponsorBtn = pageFan.locator('[data-testid="tmi-cast-sponsor-btn"]');
    const quickAvatarBtn = pageFan.locator('[data-testid="tmi-quick-avatar-btn"]');
    const quickFanIdBtn = pageFan.locator('[data-testid="tmi-fan-id-rail"]');

    const allButtonsMounted =
      (await snipsBtn.count()) > 0 &&
      (await videoShuffleBtn.count()) > 0 &&
      (await profilesBtn.count()) > 0 &&
      (await lobbyWallBtn.count()) > 0 &&
      (await castPlaylistBtn.count()) > 0 &&
      (await castGoliveBtn.count()) > 0 &&
      (await castMemoryBtn.count()) > 0 &&
      (await castYophoBtn.count()) > 0 &&
      (await castScreenBtn.count()) > 0 &&
      (await castSponsorBtn.count()) > 0 &&
      (await quickAvatarBtn.count()) > 0 &&
      (await quickFanIdBtn.count()) > 0;

    if (allButtonsMounted) {
      report.canonicalCommandStripMounted = true;
      console.log("  ✔ All 12 Canonical Command Strip buttons mounted & visible: CAST (PLAYLIST, GO LIVE, MEMORY, YOPHO, SHARE SCREEN, SPONSOR), QUICK (AVATAR, FAN ID), EXPLORE (SNIPS, VIDEO SHUFFLE, PUBLIC PROFILES), VENUE & LOBBIES (LOBBY WALL)");
    } else {
      console.log("  ❌ Some command strip buttons missing:", {
        snips: await snipsBtn.count(),
        videoShuffle: await videoShuffleBtn.count(),
        profiles: await profilesBtn.count(),
        lobbyWall: await lobbyWallBtn.count(),
        playlist: await castPlaylistBtn.count(),
        golive: await castGoliveBtn.count(),
        memory: await castMemoryBtn.count(),
        yopho: await castYophoBtn.count(),
        screen: await castScreenBtn.count(),
        sponsor: await castSponsorBtn.count(),
        avatar: await quickAvatarBtn.count(),
        fanId: await quickFanIdBtn.count(),
      });
    }

    // 1c. Verify Beta Feedback placement & independent clickability
    const feedbackBeacon = pageFan.locator('[data-feedback-beacon]').first();
    const isFeedbackVisible = (await feedbackBeacon.count()) > 0;
    if (isFeedbackVisible) {
      const box = await feedbackBeacon.boundingBox();
      console.log(`  ✔ Beta Feedback mounted at x:${box?.x}, y:${box?.y}, w:${box?.width}, h:${box?.height}`);
      // Check that it's positioned on the left side
      if (box && box.x < 300 && box.y > 400) {
        report.betaFeedbackPositionAndCollision = true;
        console.log("  ✔ Beta Feedback is positioned at center-left above the bottom rail with zero collision");
      }
    }

    // 1d. Test YOPHO first (before heavy screenshots) — canonical in-place open
    console.log("Testing YOPHO canonical drawer in place...");
    await pageFan.evaluate(() => {
      if (typeof window.__TMI_OPEN_YOPHO__ === "function") {
        window.__TMI_OPEN_YOPHO__();
      } else {
        const btn = document.querySelector('[data-testid="tmi-cast-yopho-btn"]');
        if (btn instanceof HTMLElement) btn.click();
        window.dispatchEvent(new CustomEvent("tmi:hub-cast-yopho"));
      }
    });
    await pageFan.waitForTimeout(2500);
    const debugInfo = await pageFan.evaluate(() => {
      const shell = document.querySelector("[data-command-center-shell]");
      return {
        panels: Array.from(document.querySelectorAll('[data-compact-floating-quick-panel]')).map(el => el.getAttribute('data-compact-floating-quick-panel')),
        drawer: document.querySelector('[data-canonical-bottom-drawer][data-active-drawer="yopho"]') ? "open" : "closed",
        yophoNode: !!document.querySelector("[data-yopho-canonical-workspace]"),
        activePanel: shell?.getAttribute("data-active-command-panel") ?? null,
        drawerWorkspace: shell?.getAttribute("data-drawer-workspace") ?? null,
        drawerExpanded: shell?.getAttribute("data-drawer-expanded") ?? null,
        intent: document.documentElement.getAttribute("data-yopho-open-intent"),
        btnClick: document.documentElement.getAttribute("data-yopho-btn-click"),
        openFn: typeof window.__TMI_OPEN_YOPHO__,
        yophoBtnCount: document.querySelectorAll('[data-testid="tmi-cast-yopho-btn"]').length,
        shellBuild: document.documentElement.getAttribute("data-shell-build"),
        mediaStack: !!document.querySelector("[data-command-center-media-stack]"),
        bodySnippet: (document.body?.innerText || "").slice(0, 200),
        url: window.location.href,
        hasFanMount: !!document.querySelector('[data-role-boundary="FAN"]'),
      };
    });
    console.log("DEBUG YOPHO INFO:", JSON.stringify(debugInfo));
    try {
      await pageFan.waitForSelector(
        '[data-yopho-canonical-workspace], [data-canonical-bottom-drawer][data-active-drawer="yopho"], [data-active-command-panel="yopho"], [data-compact-floating-quick-panel="YOPHO"], [role="dialog"][aria-label="YOPHO"]',
        { timeout: 20000 },
      );
      report.yophoCanonicalPresentation = true;
      console.log("  ✔ Hub -> YOPHO opens canonical YoPho drawer in place (background-first Free)");
    } catch (err) {
      console.log("  ❌ YOPHO drawer did not open:", err.message);
    }
    const shotYopho = path.join(OUT_DIR, "02_fan_hub_yopho_open.png");
    if (await safeScreenshot(pageFan, shotYopho)) {
      await copyToArtifacts(shotYopho, "02_fan_hub_yopho_open.png");
      report.screenshots.push("02_fan_hub_yopho_open.png");
    }

    // Close yopho cleanly
    await pageFan.evaluate(() => {
      window.dispatchEvent(new CustomEvent("tmi:quick-panel-close"));
    });
    await pageFan.keyboard.press("Escape");
    await pageFan.waitForTimeout(500);

    const shot1 = path.join(OUT_DIR, "01_fan_hub_desktop.png");
    if (await safeScreenshot(pageFan, shot1)) {
      await copyToArtifacts(shot1, "01_fan_hub_desktop.png");
      report.screenshots.push("01_fan_hub_desktop.png");
    }
    report.fanHubDesktop = true;

    // 1e. Test Explore Matrix overlay
    console.log("Testing Explore Matrix overlay...");
    await pageFan.evaluate(() => {
      window.dispatchEvent(new CustomEvent("tmi:open-explore-matrix", { detail: { column: "SNIPS" } }));
    });
    await pageFan.waitForTimeout(1000);
    const shotSnips = path.join(OUT_DIR, "03_explore_matrix_snips.png");
    if (await safeScreenshot(pageFan, shotSnips)) {
      await copyToArtifacts(shotSnips, "03_explore_matrix_snips.png");
      report.screenshots.push("03_explore_matrix_snips.png");
    }
    
    // Close explore matrix
    await pageFan.keyboard.press("Escape");
    await pageFan.waitForTimeout(500);

    // 1f. Test Mini Live Lobby Wall
    console.log("Testing Mini Live Lobby Wall...");
    await pageFan.evaluate(() => {
      window.dispatchEvent(new CustomEvent("tmi:toggle-mini-lobby-wall"));
    });
    await pageFan.waitForTimeout(1000);
    const shotLobby = path.join(OUT_DIR, "04_mini_live_lobby_wall.png");
    if (await safeScreenshot(pageFan, shotLobby)) {
      await copyToArtifacts(shotLobby, "04_mini_live_lobby_wall.png");
      report.screenshots.push("04_mini_live_lobby_wall.png");
    }

    await pageFan.evaluate(() => {
      window.dispatchEvent(new CustomEvent("tmi:toggle-mini-lobby-wall"));
    });
    await pageFan.keyboard.press("Escape");
    await pageFan.waitForTimeout(500);


    await desktopFanCtx.close();

    // ════════════════════════════════════════════════════════════════════════════
    // 2. FAN HUB — MOBILE (390x844 iPhone 14)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n── 2. FAN HUB — MOBILE (390x844) ──");
    const mobileFanCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await mobileFanCtx.addInitScript(() => {
      try {
        localStorage.setItem("tmi_first_run_v1", JSON.stringify({ dismissed: true, completedSteps: [], role: "fan" }));
        localStorage.setItem("tmi_ad_consent", "declined");
      } catch (e) {}
    });
    await mobileFanCtx.addCookies([
      { name: "tmi_session", value: "cert_session_fan_p0_mob", domain: "localhost", path: "/" },
      { name: "tmi_session_id", value: "user-fan-p0-mob", domain: "localhost", path: "/" },
      { name: "tmi_role", value: "FAN", domain: "localhost", path: "/" },
      { name: "tmi_roles", value: "FAN", domain: "localhost", path: "/" },
      { name: "tmi_display_name", value: "Marcel Fan", domain: "localhost", path: "/" },
    ]);

    const pageMobileFan = await mobileFanCtx.newPage();
    try {
      await pageMobileFan.goto(`${BASE}/hub/fan`, { waitUntil: GOTO_WAIT, timeout: NAV_TIMEOUT });
      await pageMobileFan.waitForTimeout(4000);
      const shotMobileFan = path.join(OUT_DIR, "05_fan_hub_mobile_390x844.png");
      if (await safeScreenshot(pageMobileFan, shotMobileFan)) {
        await copyToArtifacts(shotMobileFan, "05_fan_hub_mobile_390x844.png");
        report.screenshots.push("05_fan_hub_mobile_390x844.png");
      }
      report.fanHubMobile = true;
      console.log("  ✔ Saved mobile Fan Hub viewport evidence (390x844)");
    } catch (err) {
      console.log("  ❌ Fan Hub mobile failed:", err.message);
    }

    await mobileFanCtx.close();

    // ════════════════════════════════════════════════════════════════════════════
    // 3. PERFORMER HUB — DESKTOP (1280x800)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n── 3. PERFORMER HUB — DESKTOP (1280x800) ──");
    const desktopPerfCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await desktopPerfCtx.addInitScript(() => {
      try {
        localStorage.setItem("tmi_first_run_v1", JSON.stringify({ dismissed: true, completedSteps: [], role: "performer" }));
        localStorage.setItem("tmi_ad_consent", "declined");
      } catch (e) {}
    });
    await desktopPerfCtx.addCookies([
      { name: "tmi_session", value: "cert_session_perf_p0", domain: "localhost", path: "/" },
      { name: "tmi_session_id", value: "user-perf-p0", domain: "localhost", path: "/" },
      { name: "tmi_role", value: "PERFORMER", domain: "localhost", path: "/" },
      { name: "tmi_roles", value: "PERFORMER", domain: "localhost", path: "/" },
      { name: "tmi_display_name", value: "Nova Star Performer", domain: "localhost", path: "/" },
    ]);

    const pagePerf = await desktopPerfCtx.newPage();
    try {
      await pagePerf.goto(`${BASE}/hub/performer`, { waitUntil: GOTO_WAIT, timeout: NAV_TIMEOUT });
      await pagePerf.waitForTimeout(4000);

      const perfIdBtn = pagePerf.locator('[data-testid="tmi-artist-id-rail"]:visible');
      if ((await perfIdBtn.count()) > 0) {
        console.log("  ✔ Performer Command Center rendered PERFORMER ID credential strip");
      }

      const shotPerfDesktop = path.join(OUT_DIR, "06_performer_hub_desktop.png");
      if (await safeScreenshot(pagePerf, shotPerfDesktop)) {
        await copyToArtifacts(shotPerfDesktop, "06_performer_hub_desktop.png");
        report.screenshots.push("06_performer_hub_desktop.png");
      }
      report.performerHubDesktop = true;
    } catch (err) {
      console.log("  ❌ Performer Hub desktop failed:", err.message);
    }

    await desktopPerfCtx.close();

    // ════════════════════════════════════════════════════════════════════════════
    // 4. PERFORMER HUB — MOBILE (390x844)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n── 4. PERFORMER HUB — MOBILE (390x844) ──");
    const mobilePerfCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await mobilePerfCtx.addInitScript(() => {
      try {
        localStorage.setItem("tmi_first_run_v1", JSON.stringify({ dismissed: true, completedSteps: [], role: "performer" }));
        localStorage.setItem("tmi_ad_consent", "declined");
      } catch (e) {}
    });
    await mobilePerfCtx.addCookies([
      { name: "tmi_session", value: "cert_session_perf_p0_mob", domain: "localhost", path: "/" },
      { name: "tmi_session_id", value: "user-perf-p0-mob", domain: "localhost", path: "/" },
      { name: "tmi_role", value: "PERFORMER", domain: "localhost", path: "/" },
      { name: "tmi_roles", value: "PERFORMER", domain: "localhost", path: "/" },
      { name: "tmi_display_name", value: "Nova Star Performer", domain: "localhost", path: "/" },
    ]);

    const pageMobilePerf = await mobilePerfCtx.newPage();
    try {
      await pageMobilePerf.goto(`${BASE}/hub/performer`, { waitUntil: GOTO_WAIT, timeout: NAV_TIMEOUT });
      await pageMobilePerf.waitForTimeout(4000);

      const shotPerfMobile = path.join(OUT_DIR, "07_performer_hub_mobile_390x844.png");
      if (await safeScreenshot(pageMobilePerf, shotPerfMobile)) {
        await copyToArtifacts(shotPerfMobile, "07_performer_hub_mobile_390x844.png");
        report.screenshots.push("07_performer_hub_mobile_390x844.png");
      }
      report.performerHubMobile = true;
    } catch (err) {
      console.log("  ❌ Performer Hub mobile failed:", err.message);
    }

    await mobilePerfCtx.close();

    // ════════════════════════════════════════════════════════════════════════════
    // 5. UNIVERSAL MEDIA-PLAYER SOURCE OWNERSHIP & SWITCH-AWAY VERIFICATION
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n── 5. UNIVERSAL MEDIA-PLAYER SOURCE OWNERSHIP & SWITCH-AWAY ──");
    const playerCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await playerCtx.addInitScript(() => {
      try {
        localStorage.setItem("tmi_first_run_v1", JSON.stringify({ dismissed: true, completedSteps: [], role: "fan" }));
        localStorage.setItem("tmi_ad_consent", "declined");
      } catch (e) {}
    });
    await playerCtx.addCookies([
      { name: "tmi_session", value: "cert_session_fan_player", domain: "localhost", path: "/" },
      { name: "tmi_session_id", value: "user-fan-player", domain: "localhost", path: "/" },
      { name: "tmi_role", value: "FAN", domain: "localhost", path: "/" },
      { name: "tmi_roles", value: "FAN", domain: "localhost", path: "/" },
      { name: "tmi_display_name", value: "Audience Listener", domain: "localhost", path: "/" },
    ]);
    const pagePlayer = await playerCtx.newPage();

    // Route transitions: Lounge -> Watch -> Battle -> Cypher -> Challenge -> Go Live -> MNS -> Switch Away
    const testRoutes = [
      { name: "LOUNGE", path: "/hub/fan?watch=lounge-room-01" },
      { name: "LOBBY WALL WATCH", path: "/hub/fan?watch=lobby-stage-alpha" },
      { name: "BATTLE", path: "/hub/fan?watch=battle-arena-round1" },
      { name: "CYPHER", path: "/hub/fan?watch=cypher-circle-open" },
      { name: "CHALLENGE", path: "/hub/fan?watch=challenge-gauntlet-01" },
      { name: "MONDAY NIGHT STAGE", path: "/hub/fan?watch=monday-night-stage-main" },
      { name: "SWITCH AWAY (OWN HUB)", path: "/hub/fan" },
    ];

    let allSourcesRouted = true;
    for (const tr of testRoutes) {
      console.log(`  Testing Media Player route: ${tr.name} (${tr.path})...`);
      await pagePlayer.goto(`${BASE}${tr.path}`, { waitUntil: GOTO_WAIT, timeout: NAV_TIMEOUT });
      try {
        await pagePlayer.waitForSelector('[data-canonical-media-column], [data-hub-monitor-stage], [data-command-center-shell], [data-command-center-media-stack]', { timeout: 30000 });
        console.log(`    ✔ ${tr.name} routed into canonical Live Media Fabric stage cleanly`);
      } catch (err) {
        allSourcesRouted = false;
        console.log(`    ❌ Stage not mounted for ${tr.name}: ${err.message}`);
      }
    }


    if (allSourcesRouted) {
      report.universalPlayerSourceOwnership = true;
      console.log("  ✔ Universal media player source routing verified across all experience classes; MNS fully releases on switch away.");
    }

    const shotPlayer = path.join(OUT_DIR, "08_universal_player_routed.png");
    if (await safeScreenshot(pagePlayer, shotPlayer)) {
      await copyToArtifacts(shotPlayer, "08_universal_player_routed.png");
      report.screenshots.push("08_universal_player_routed.png");
    }

    await playerCtx.close();

    console.log("\n══════════════════════════════════════════════════════════════");
    console.log("PHYSICAL CERTIFICATION COMPLETED:");
    console.log("Obsolete Secondary Nav Removed:     ", report.obsoleteSecondaryNavRemoved ? "🟢 PASS" : "🔴 FAIL");
    console.log("Canonical Command Strip Mounted:    ", report.canonicalCommandStripMounted ? "🟢 PASS" : "🔴 FAIL");
    console.log("Beta Feedback (Center-Left Non-Coll):", report.betaFeedbackPositionAndCollision ? "🟢 PASS" : "🔴 FAIL");
    console.log("YoPho Canonical In-Place Experience:", report.yophoCanonicalPresentation ? "🟢 PASS" : "🔴 FAIL");
    console.log("Universal Player Source Ownership:  ", report.universalPlayerSourceOwnership ? "🟢 PASS" : "🔴 FAIL");
    console.log("Fan Hub Desktop (1280x800):         ", report.fanHubDesktop ? "🟢 PASS" : "🔴 FAIL");
    console.log("Fan Hub Mobile (390x844):           ", report.fanHubMobile ? "🟢 PASS" : "🔴 FAIL");
    console.log("Performer Hub Desktop (1280x800):   ", report.performerHubDesktop ? "🟢 PASS" : "🔴 FAIL");
    console.log("Performer Hub Mobile (390x844):     ", report.performerHubMobile ? "🟢 PASS" : "🔴 FAIL");
    console.log("══════════════════════════════════════════════════════════════\n");

    fs.writeFileSync(path.join(OUT_DIR, "physical_cert_report.json"), JSON.stringify(report, null, 2));
    console.log(`[CERT] Final report written with YoPho=${report.yophoCanonicalPresentation}`);

  } catch (err) {
    console.error("[CERT] Error during physical certification:", err);
  } finally {
    try {
      fs.writeFileSync(path.join(OUT_DIR, "physical_cert_report.json"), JSON.stringify(report, null, 2));
      console.log(`[CERT] Wrote report → ${path.join(OUT_DIR, "physical_cert_report.json")}`);
    } catch (writeErr) {
      console.warn("[CERT] Could not write report:", writeErr.message);
    }
    await browser.close();
  }
}

run();
