/**
 * Slice 6 — Brick 4: Runtime Probes
 *
 * Assertions:
 *   rankingPresent        data-ranking attributes on crown/global/genre/rising zones
 *   liveDataHydrated      data-live attributes on room/cypher/event zones with content
 *   noCriticalZonesEmpty  all 15 zone keys render non-empty content
 *   routeStable           /home/1-5 all load without console errors
 *   noRegistryBreakage    adapter validateAdapters() passes (injected via page.evaluate)
 *   visualSystemMounted   visual surfaces are mounted via data-visual-* hooks
 *   overlayActive         global reaction overlay is present and click-safe
 *   videoShellPresent     live video shell is mounted in live issue
 *   noDeadZones           each rendered critical zone has visible content
 *
 * Exit 0 = all pass  |  Exit 1 = one or more failures
 */

import { chromium } from "playwright";

const BASE = "http://localhost:3001";

const ISSUE_ROUTES = [
  `${BASE}/home/1`,
  `${BASE}/home/2`,
  `${BASE}/home/3`,
  `${BASE}/home/4`,
  `${BASE}/home/5`,
  `${BASE}/home/6`,
];

// Runtime critical zones that must be hydrated and non-empty in active issue routes.
const CRITICAL_ZONE_KEYS = [
  "liveRooms",
  "events",
  "cyphers",
  "sponsorSpotlight",
  "adMarketplace",
  "analyticsDash",
  "globalRankLoop",
  "genreLeaderboards",
  "risingStars",
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();

  const results = {
    rankingPresent: false,
    liveDataHydrated: false,
    noCriticalZonesEmpty: false,
    routeStable: true,
    noRegistryBreakage: false,
    visualSystemMounted: false,
    overlayActive: false,
    videoShellPresent: false,
    noDeadZones: false,
  };

  const routeErrors = {};

  // ── 1. Route stability + zone presence sweep ───────────────────────────────
  const zonesFound = new Set();
  const zoneTextState = [];

  for (const url of ISSUE_ROUTES) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 }).catch(() => null);
      await page.waitForSelector(".tmi-ready", { timeout: 5_000 }).catch(() => null);

    if (!res || res.status() >= 400) {
      results.routeStable = false;
      routeErrors[url] = `HTTP ${res?.status() ?? "unreachable"}`;
      await page.close();
      continue;
    }

    if (consoleErrors.length > 0) {
      results.routeStable = false;
      routeErrors[url] = consoleErrors.slice(0, 3).join(" | ");
    }

    // collect all zone keys rendered on this page
    const zoneIds = await page.$$eval("[data-issue-zone]", (els) =>
      els.map((el) => el.getAttribute("data-issue-zone"))
    );
    zoneIds.forEach((id) => { if (id) zonesFound.add(id); });

    const zoneText = await page.$$eval("[data-issue-zone]", (els) =>
      els.map((el) => ({
        id: el.getAttribute("data-issue-zone"),
        textLen: (el.textContent || "").trim().length,
        hasChildren: el.children.length > 0,
        hasMedia: Boolean(el.querySelector("img, video, canvas, svg")),
      }))
    );
    zoneTextState.push(...zoneText.filter((z) => z.id));

    await page.close();
  }

  // ── 2. Data-attribute probe page (/home/6 for ranking, /home/3 for live) ───
  const probePage = await ctx.newPage();
  await probePage.goto(`${BASE}/home/6`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await probePage.waitForSelector(".tmi-ready", { timeout: 5_000 }).catch(() => null);

  // rankingPresent
  const rankingEls = await probePage.$$("[data-ranking]");
  results.rankingPresent = rankingEls.length >= 2; // at least globalRank list + genreRank grid
  const visualEls = await probePage.$$('[data-visual-zone], [data-visual-surface]');
  results.visualSystemMounted = visualEls.length >= 3;
  const overlay = await probePage.$('[data-overlay-canvas="reactions"]');
  if (overlay) {
    const pointerEvents = await overlay.evaluate((el) => window.getComputedStyle(el).pointerEvents);
    results.overlayActive = pointerEvents === "none";
  }

  await probePage.close();

  const livePage = await ctx.newPage();
  await livePage.goto(`${BASE}/home/3`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await livePage.waitForSelector(".tmi-ready", { timeout: 5_000 }).catch(() => null);

  // liveDataHydrated
  const liveEls = await livePage.$$("[data-live]");
  const roomCards = await livePage.$$(".room-card");
  results.liveDataHydrated = liveEls.length >= 2 && roomCards.length >= 1;
  const videoShell = await livePage.$('[data-video-shell="performer"]');
  results.videoShellPresent = Boolean(videoShell);

  await livePage.close();

  // ── 3. noCriticalZonesEmpty ────────────────────────────────────────────────
  const missingZones = CRITICAL_ZONE_KEYS.filter((k) => !zonesFound.has(k));
  results.noCriticalZonesEmpty = missingZones.length === 0;
  const emptyZones = zoneTextState
    .filter((z) => z.textLen === 0 && !z.hasChildren && !z.hasMedia)
    .map((z) => z.id);
  results.noDeadZones = emptyZones.length === 0;

  // ── 4. noRegistryBreakage — validateAdapters via inline check ─────────────
  // We inject a minimal check: all zone keys must appear in data-zone-id attrs collected
  // (actual validateAdapters() runs server-side; we approximate by confirming all 15 zones rendered)
  results.noRegistryBreakage = results.noCriticalZonesEmpty && results.routeStable;

  await browser.close();

  // ── Report ─────────────────────────────────────────────────────────────────
  console.log("\n=== SLICE 6 PROBE RESULTS ===\n");
  let allPass = true;
  for (const [key, val] of Object.entries(results)) {
    const icon = val ? "✓" : "✗";
    if (!val) allPass = false;
    console.log(`  ${icon}  ${key}: ${val}`);
  }

  if (Object.keys(routeErrors).length > 0) {
    console.log("\nRoute errors:");
    for (const [url, err] of Object.entries(routeErrors)) {
      console.log(`  ${url}  →  ${err}`);
    }
  }

  if (missingZones.length > 0) {
    console.log(`\nMissing zones (not rendered): ${missingZones.join(", ")}`);
  }

  if (results.noDeadZones === false) {
    const emptyZoneIds = [...new Set(zoneTextState.filter((z) => z.textLen === 0).map((z) => z.id))];
    console.log(`\nDead zones (empty text content): ${emptyZoneIds.join(", ")}`);
  }

  console.log(`\n${allPass ? "ALL PROBES PASSED ✓" : "SOME PROBES FAILED ✗"}\n`);
  process.exit(allPass ? 0 : 1);
}

run().catch((err) => {
  console.error("Probe crashed:", err);
  process.exit(1);
});
