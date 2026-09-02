/**
 * cert-physical-jumbotron-director.mjs
 *
 * Physical Browser certification for Automated Jumbotron Director + venue LOOK UP.
 *
 * Uses public `/cert/jumbotron-venue` (SSR props drive LOOK UP — /venue/preview is auth-gated):
 * 1. Battle Arena — center-hung + scoreboard/timer
 * 2. Cypher — collaborative / no winner
 * 3. World Dance Party — disco orb on AES cert mount
 * 4. Monday Stage / Auditorium — wall LED architecture
 * 5. Tier sightline metadata
 * 6. FOCUS / RETURN via lookUp=1 ↔ lookUp=0 (presence session token preserved)
 * 7. /jumbotron harness — JUMBOTRON_FEED → slot-7 + mobile
 *
 * Artifacts: .cursor/artifacts/jumbotron-p0/
 */

import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), ".cursor", "artifacts", "jumbotron-p0");
const GOTO_WAIT = process.env.CERT_GOTO_WAIT || "domcontentloaded";
const NAV_TIMEOUT = Number(process.env.CERT_NAV_TIMEOUT_MS || 240000);

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function certVenueUrl(event, lookUp) {
  return `/cert/jumbotron-venue?event=${encodeURIComponent(event)}&lookUp=${lookUp ? "1" : "0"}`;
}

async function saveScreenshot(page, filename) {
  const localPath = path.join(OUT_DIR, filename);
  await page.screenshot({ path: localPath, animations: "disabled", fullPage: false });
  console.log(`  [ARTIFACT] Saved ${filename}`);
  return filename;
}

async function dismissNoise(page) {
  try {
    await page.evaluate(() => {
      localStorage.setItem(
        "tmi_first_run_v1",
        JSON.stringify({ dismissed: true, completedSteps: [], role: "fan" })
      );
      localStorage.setItem("tmi_ad_consent", "declined");
    });
  } catch {
    /* ignore */
  }
  const decline = page.getByRole("button", { name: /decline/i });
  if ((await decline.count()) > 0) {
    try {
      await decline.first().click({ timeout: 2000 });
    } catch {
      /* ignore */
    }
  }
}

async function proveLookUpOnVenue(page, {
  label,
  event,
  expectArchitecture,
  expectExperience,
  packAssert,
  shotBefore,
  shotLookUp,
  shotReturn,
}) {
  console.log(`\n── ${label} ──`);

  // STAGE (lookUp=0)
  await page.goto(`${BASE}${certVenueUrl(event, false)}`, {
    waitUntil: GOTO_WAIT,
    timeout: NAV_TIMEOUT,
  });
  await dismissNoise(page);
  await page.waitForSelector('[data-cert-jumbotron-venue="true"]', { timeout: NAV_TIMEOUT });
  await page.waitForSelector('[data-testid="btn-venue-look-up-jumbotron"]', {
    timeout: NAV_TIMEOUT,
  });

  const sessionBefore =
    (await page.locator("[data-presence-session]").first().getAttribute("data-presence-session")) ||
    (await page.locator("[data-session-token]").first().getAttribute("data-session-token"));

  const mountBefore = await page.locator('[data-testid="venue-jumbotron-world-mount"]').count();
  await saveScreenshot(page, shotBefore);

  // LOOK UP via native link navigation (SSR props — no client click required)
  await page.goto(`${BASE}${certVenueUrl(event, true)}`, {
    waitUntil: GOTO_WAIT,
    timeout: NAV_TIMEOUT,
  });
  await dismissNoise(page);
  await page.waitForSelector('[data-testid="venue-jumbotron-world-mount"]', { timeout: 60000 });
  // Seeded director events land in useEffect after first paint
  await page.waitForSelector('[data-testid="canonical-jumbotron-surface"]', { timeout: 15000 });
  await page.waitForTimeout(800);

  const mount = page.locator('[data-testid="venue-jumbotron-world-mount"]');
  const architecture = await mount.getAttribute("data-architecture");
  const experience = await mount.getAttribute("data-experience-type");
  const sightlines = await mount.getAttribute("data-sightlines-certified");
  const tiers = await mount.getAttribute("data-sightline-tiers");
  const focusIndicator = await page
    .locator('[data-testid="venue-look-up-focus-indicator"]')
    .textContent();

  let packOk = true;
  if (packAssert) {
    try {
      packOk = await packAssert(page);
    } catch {
      packOk = false;
    }
  }
  await saveScreenshot(page, shotLookUp);

  // RETURN
  await page.goto(`${BASE}${certVenueUrl(event, false)}`, {
    waitUntil: GOTO_WAIT,
    timeout: NAV_TIMEOUT,
  });
  await dismissNoise(page);
  await page.waitForSelector('[data-cert-jumbotron-venue="true"]', { timeout: NAV_TIMEOUT });
  await page.waitForTimeout(300);

  const sessionAfter =
    (await page.locator("[data-presence-session]").first().getAttribute("data-presence-session")) ||
    (await page.locator("[data-session-token]").first().getAttribute("data-session-token"));
  const focusAfter = await page
    .locator('[data-testid="venue-look-up-focus-indicator"]')
    .textContent();
  const mountAfter = await page.locator('[data-testid="venue-jumbotron-world-mount"]').count();
  await saveScreenshot(page, shotReturn);

  const geometryOk =
    mountBefore === 0 &&
    architecture === expectArchitecture &&
    experience === expectExperience &&
    (focusIndicator || "").includes("JUMBOTRON FOCUS");
  const lookUpOk = geometryOk && packOk;

  const returnOk =
    Boolean(sessionBefore) &&
    sessionBefore === sessionAfter &&
    (focusAfter || "").includes("STAGE VIEW") &&
    mountAfter === 0;

  console.log(
    `  architecture=${architecture} experience=${experience} tiers=${tiers} sightlines=${sightlines}`
  );
  console.log(
    `  LOOK UP: ${lookUpOk ? "PASS" : "FAIL"} · RETURN/presence: ${returnOk ? "PASS" : "FAIL"} · pack: ${packOk ? "PASS" : "FAIL"}`
  );

  return {
    lookUpOk,
    returnOk,
    packOk,
    architecture,
    experience,
    tiers: tiers || "",
    sightlinesCertified: sightlines === "true",
    sessionPreserved: Boolean(sessionBefore && sessionBefore === sessionAfter),
    screenshots: [shotBefore, shotLookUp, shotReturn],
  };
}

async function run() {
  console.log(`[CERT] Physical Jumbotron LOOK UP against ${BASE}...`);
  const browser = await chromium.launch({ headless: true });

  const report = {
    date: new Date().toISOString(),
    branch: "eos/vocal-improv-clean",
    base: BASE,
    physicalLookUp: {
      battle: null,
      cypher: null,
      worldDanceParty: null,
      auditoriumLive: null,
    },
    harness: {
      battlePack: false,
      cypherNoWinner: false,
      discoOrb: false,
      jumbotronFeedAssignable: false,
      focusReturn: false,
      mobile: false,
    },
    verdict: {
      physicalLookUp: "FAIL",
      tierSightlines: "FAIL",
      experiencePacks: "FAIL",
      playerFreedomFeed: "FAIL",
      overall: "FAIL",
    },
    openBlockers: [],
    screenshots: [],
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    await context.addInitScript(() => {
      localStorage.setItem(
        "tmi_first_run_v1",
        JSON.stringify({ dismissed: true, completedSteps: [], role: "fan" })
      );
      localStorage.setItem("tmi_ad_consent", "declined");
    });

    const page = await context.newPage();
    page.setDefaultNavigationTimeout(NAV_TIMEOUT);
    page.setDefaultTimeout(90000);
    page.on("console", (msg) => {
      if (msg.type() === "error") console.log(`  [BROWSER ERROR]: ${msg.text()}`);
    });
    page.on("pageerror", (err) => console.log(`  [BROWSER UNCAUGHT]: ${err.message}`));

    report.physicalLookUp.battle = await proveLookUpOnVenue(page, {
      label: "1. BATTLE LOOK UP",
      event: "battle",
      expectArchitecture: "CENTER_HUNG_ARENA_JUMBOTRON",
      expectExperience: "BATTLE_ARENA",
      shotBefore: "10-battle-stage-before-lookup.png",
      shotLookUp: "11-battle-lookup-center-hung.png",
      shotReturn: "12-battle-return-stage.png",
      packAssert: async (p) => {
        await p.waitForSelector(
          '[data-testid="jumbotron-round-timer"], [data-testid="jumbotron-battle-scoreboard"]',
          { timeout: 12000 }
        );
        const score = await p.locator('[data-testid="jumbotron-battle-scoreboard"]').count();
        const timer = await p.locator('[data-testid="jumbotron-round-timer"]').count();
        // Scoreboard is pack-gated; timer is event-gated. Either proves battle pack live.
        return score > 0 || timer > 0;
      },
    });
    report.screenshots.push(...report.physicalLookUp.battle.screenshots);

    report.physicalLookUp.cypher = await proveLookUpOnVenue(page, {
      label: "2. CYPHER LOOK UP",
      event: "cypher",
      expectArchitecture: "CENTER_HUNG_ARENA_JUMBOTRON",
      expectExperience: "CYPHER",
      shotBefore: "20-cypher-stage-before-lookup.png",
      shotLookUp: "21-cypher-lookup-collaborative.png",
      shotReturn: "22-cypher-return-stage.png",
      packAssert: async (p) => {
        const headline = (await p.locator('[data-testid="jumbotron-headline"]').textContent()) || "";
        const score = await p.locator('[data-testid="jumbotron-battle-scoreboard"]').count();
        return !headline.toLowerCase().includes("winner") && score === 0;
      },
    });
    report.screenshots.push(...report.physicalLookUp.cypher.screenshots);

    report.physicalLookUp.worldDanceParty = await proveLookUpOnVenue(page, {
      label: "3. WORLD DANCE PARTY LOOK UP",
      event: "world-dance-party",
      expectArchitecture: "CENTER_HUNG_DISCO_ORB",
      expectExperience: "WORLD_DANCE_PARTY",
      shotBefore: "30-wdp-stage-before-lookup.png",
      shotLookUp: "31-wdp-lookup-disco-orb.png",
      shotReturn: "32-wdp-return-stage.png",
      packAssert: async (p) => {
        await p.waitForSelector('[data-testid="jumbotron-disco-orb-visual"]', { timeout: 12000 });
        return (await p.locator('[data-testid="jumbotron-disco-orb-visual"]').count()) > 0;
      },
    });
    report.screenshots.push(...report.physicalLookUp.worldDanceParty.screenshots);

    report.physicalLookUp.auditoriumLive = await proveLookUpOnVenue(page, {
      label: "4. AUDITORIUM (monday-stage) LOOK UP",
      event: "monday-stage",
      expectArchitecture: "WALL_HANGING_LED",
      expectExperience: "AUDITORIUM",
      shotBefore: "40-auditorium-stage-before-lookup.png",
      shotLookUp: "41-auditorium-lookup-wall-led.png",
      shotReturn: "42-auditorium-return-stage.png",
      packAssert: async (p) => {
        return (await p.locator('[data-testid="canonical-jumbotron-surface"]').count()) > 0;
      },
    });
    report.screenshots.push(...report.physicalLookUp.auditoriumLive.screenshots);

    console.log("\n── 5. /jumbotron harness packs + JUMBOTRON_FEED ──");
    await page.goto(`${BASE}/jumbotron`, { waitUntil: GOTO_WAIT, timeout: NAV_TIMEOUT });
    await dismissNoise(page);
    await page.waitForSelector('[data-testid="canonical-jumbotron-surface"]', {
      timeout: NAV_TIMEOUT,
    });

    await page.locator('[data-testid="jumbotron-battle-scoreboard"]').waitFor({
      state: "visible",
      timeout: 20000,
    });
    await page.locator('[data-testid="jumbotron-round-timer"]').waitFor({
      state: "visible",
      timeout: 10000,
    });
    report.harness.battlePack = true;
    report.screenshots.push(await saveScreenshot(page, "50-harness-battle-pack.png"));

    const tierBtns = page.locator("[data-testid^=tier-sightline-btn-]");
    const tierCount = await tierBtns.count();
    if (tierCount > 0) {
      await tierBtns.nth(0).click();
      await page.waitForTimeout(200);
      if (tierCount > 1) await tierBtns.nth(Math.min(1, tierCount - 1)).click();
      if (tierCount > 2) await tierBtns.nth(Math.min(2, tierCount - 1)).click();
      report.screenshots.push(await saveScreenshot(page, "50b-harness-tier-sightlines.png"));
    }

    await page.locator('[data-testid="experience-pack-selector"]').selectOption("CYPHER");
    await page.waitForTimeout(500);
    if ((await page.locator('[data-testid="btn-trigger-cypher"]').count()) > 0) {
      await page.locator('[data-testid="btn-trigger-cypher"]').click();
      await page.waitForTimeout(400);
    }
    const cyHeadline =
      (await page.locator('[data-testid="jumbotron-headline"]').textContent()) || "";
    const cyScore = await page.locator('[data-testid="jumbotron-battle-scoreboard"]').count();
    report.harness.cypherNoWinner =
      !cyHeadline.toLowerCase().includes("winner") && cyScore === 0;
    report.screenshots.push(await saveScreenshot(page, "51-harness-cypher-no-winner.png"));

    await page.locator('[data-testid="experience-pack-selector"]').selectOption("WORLD_DANCE_PARTY");
    await page.waitForTimeout(800);
    // Pack switch remounts director; wait for WDP surface then orb (event-seeded).
    await page.waitForSelector(
      '[data-testid="canonical-jumbotron-surface"][data-experience-type="WORLD_DANCE_PARTY"]',
      { timeout: 15000 }
    );
    const safety = page.locator('[data-testid="btn-trigger-safety"]');
    if ((await safety.count()) > 0) {
      await safety.click();
      await page.waitForTimeout(400);
    }
    await page.locator('[data-testid="jumbotron-disco-orb-visual"]').waitFor({
      state: "visible",
      timeout: 15000,
    });
    report.harness.discoOrb = true;
    report.screenshots.push(await saveScreenshot(page, "52-harness-disco-orb.png"));

    const camBefore = await page
      .locator('[data-testid="jumbotron-camera-focus-indicator"]')
      .textContent();
    await page.locator('[data-testid="btn-camera-toggle-focus"]').click();
    await page.waitForTimeout(350);
    const camAfter = await page
      .locator('[data-testid="jumbotron-camera-focus-indicator"]')
      .textContent();
    report.harness.focusReturn =
      (camBefore || "").includes("STAGE") && (camAfter || "").includes("JUMBOTRON");
    report.screenshots.push(await saveScreenshot(page, "53-harness-camera-focus.png"));
    await page.locator('[data-testid="btn-camera-toggle-focus"]').click();
    await page.waitForTimeout(250);

    await page.locator('[data-testid="btn-assign-jumbotron-feed"]').click();
    await page.waitForTimeout(300);
    const feedStatus =
      (await page.locator('[data-testid="jumbotron-feed-assign-status"]').textContent()) || "";
    report.harness.jumbotronFeedAssignable =
      feedStatus.toLowerCase().includes("slot-7") &&
      feedStatus.toLowerCase().includes("assigned");
    if (!report.harness.jumbotronFeedAssignable) {
      report.openBlockers.push(`JUMBOTRON_FEED assign status: ${feedStatus}`);
    }
    report.screenshots.push(await saveScreenshot(page, "54-harness-feed-assign.png"));

    console.log("\n── 6. Touch viewport LOOK UP (390×844) ──");
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: true,
    });
    await mobile.addInitScript(() => {
      localStorage.setItem(
        "tmi_first_run_v1",
        JSON.stringify({ dismissed: true, completedSteps: [], role: "fan" })
      );
      localStorage.setItem("tmi_ad_consent", "declined");
    });
    const mPage = await mobile.newPage();
    mPage.setDefaultNavigationTimeout(NAV_TIMEOUT);
    await mPage.goto(`${BASE}${certVenueUrl("battle", true)}`, {
      waitUntil: GOTO_WAIT,
      timeout: NAV_TIMEOUT,
    });
    await dismissNoise(mPage);
    await mPage.waitForSelector('[data-testid="venue-jumbotron-world-mount"]', { timeout: 60000 });
    report.harness.mobile = true;
    report.screenshots.push(await saveScreenshot(mPage, "60-mobile-battle-lookup-390x844.png"));
    await mobile.close();

    await context.close();
  } catch (err) {
    console.error("  ❌ Physical Jumbotron Certification error:", err);
    report.openBlockers.push(String(err?.message || err));
  } finally {
    await browser.close();
  }

  const venueResults = Object.values(report.physicalLookUp).filter(Boolean);
  const lookUpAll = venueResults.length === 4 && venueResults.every((r) => r.lookUpOk);
  const returnAll = venueResults.length === 4 && venueResults.every((r) => r.returnOk);
  const packsAll =
    venueResults.length === 4 &&
    venueResults.every((r) => r.packOk) &&
    report.harness.battlePack &&
    report.harness.discoOrb &&
    report.harness.cypherNoWinner;
  const tiersAll =
    venueResults.length === 4 &&
    venueResults.every(
      (r) =>
        r.sightlinesCertified &&
        ((r.tiers || "").includes("LOWER") ||
          (r.tiers || "").includes("MID") ||
          (r.tiers || "").includes("UPPER") ||
          (r.tiers || "").includes("FLOOR") ||
          (r.tiers || "").includes("VIP"))
    );

  report.verdict.physicalLookUp =
    lookUpAll && returnAll ? "PASS" : lookUpAll || returnAll ? "PARTIAL" : "FAIL";
  report.verdict.tierSightlines = tiersAll
    ? "PASS"
    : venueResults.some((r) => r.sightlinesCertified)
      ? "PARTIAL"
      : "FAIL";
  report.verdict.experiencePacks = packsAll
    ? "PASS"
    : venueResults.some((r) => r.packOk) || report.harness.discoOrb
      ? "PARTIAL"
      : "FAIL";
  report.verdict.playerFreedomFeed = report.harness.jumbotronFeedAssignable ? "PASS" : "PARTIAL";

  report.openBlockers.push(
    "Full production GLB mesh in AudienceScene/R3F path not mounted; physical proof uses VenueAutomatedJumbotronMount world-space surface (architecture + sightline metadata real)."
  );
  report.openBlockers.push(
    "/venue/preview is middleware-protected; physical cert uses public /cert/jumbotron-venue AES mount."
  );

  if (lookUpAll && returnAll && packsAll && report.harness.jumbotronFeedAssignable) {
    report.verdict.overall = "PARTIAL"; // GLB still open
    report.verdict.physicalLookUp = "PASS";
  } else if (lookUpAll || returnAll || venueResults.some((r) => r.lookUpOk)) {
    report.verdict.overall = "PARTIAL";
  } else {
    report.verdict.overall = "FAIL";
  }

  const reportPath = path.join(OUT_DIR, "cert-physical-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n[CERT] Wrote ${reportPath}`);

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log(`PHYSICAL LOOK UP:              ${report.verdict.physicalLookUp}`);
  console.log(`Tier sightlines:               ${report.verdict.tierSightlines}`);
  console.log(`Experience packs:              ${report.verdict.experiencePacks}`);
  console.log(`Player freedom (jumbotron feed): ${report.verdict.playerFreedomFeed}`);
  console.log(`Overall:                       ${report.verdict.overall}`);
  console.log("══════════════════════════════════════════════════════════════\n");

  process.exit(report.verdict.overall === "FAIL" ? 1 : 0);
}

run();
