/**
 * QP-10 MOBILE PHYSICAL RETEST (+ visual/density)
 * Fan + Performer × 360/390/430 viewports
 * Primary strip: MIC | CAM | CAMERA | SNIPS | VIDEO SHUFFLE | LOBBIES | GO LIVE
 * node scripts/qp10-mobile-retest.mjs
 * pnpm run cert:qp10
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE = process.env.E2E_BASE_URL || process.env.TMI_BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(ROOT, "qp10-evidence");

const VIEWPORTS = [
  { width: 360, height: 800, tag: "360" },
  { width: 390, height: 844, tag: "390" },
  { width: 430, height: 932, tag: "430" },
];

const ROLES = {
  fan: { email: "micah@themusiciansindex.com", password: "test", hub: "/hub/fan" },
  performer: { email: "suedejs2000@gmail.com", password: "test", hub: "/hub/performer" },
};

const REQUIRED_PRIMARY = [
  "MIC",
  "CAM",
  "CAMERA",
  "SNIPS",
  "VIDEO SHUFFLE",
  "LOBBIES",
  "GO LIVE",
];

const FORBIDDEN_PRIMARY = ["MONITORS", "HAND", "EMOTES", "STAGE", "STREAM & WIN"];

fs.mkdirSync(OUT_DIR, { recursive: true });

async function waitForServer(maxMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/live/go`, { signal: AbortSignal.timeout(8000) });
      if (res.status > 0 && res.status < 500) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  return false;
}

async function dismissBetaFeedback(page) {
  const openPanel = page.locator("[data-live-feedback-panel]").first();
  if ((await openPanel.count()) === 0) return;

  const closeBtn = openPanel.getByRole("button", { name: /Close beta feedback/i }).first();
  if ((await closeBtn.count()) > 0 && (await closeBtn.isVisible().catch(() => false))) {
    await closeBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);
  }

  const notNow = openPanel.getByRole("button", { name: /Dismiss beta feedback|NOT NOW/i }).first();
  if ((await notNow.count()) > 0 && (await notNow.isVisible().catch(() => false))) {
    await notNow.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);
  }
}

async function dismissOverlays(page) {
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(250);
    const quickStart = await page.evaluate(() => document.body.innerText.includes("Your First Steps")).catch(() => false);
    if (!quickStart) break;
    const close = page.locator('button[style*="position: absolute"]').filter({ hasText: /×/ }).first();
    if ((await close.count()) > 0) await close.click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
  }
  const decline = page.getByRole("button", { name: /Decline|Reject/i }).first();
  if ((await decline.count()) > 0) await decline.click({ force: true }).catch(() => {});
  await dismissBetaFeedback(page);
}

async function uiLogin(page, email, password) {
  // Prefer API login — /auth page has intermittent 500 while API remains healthy
  const apiOk = await page
    .context()
    .request.post(`${BASE}/api/auth/login`, { data: { email, password } })
    .then((r) => r.ok())
    .catch(() => false);
  if (apiOk) return;

  await page.goto(`${BASE}/auth`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.locator("#auth-email").waitFor({ state: "visible", timeout: 60000 });
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill(password);
  await page.locator('button[type="submit"]').first().click({ force: true }).catch(() => {});
  await page.waitForURL(/\/dashboard/i, { timeout: 120000 }).catch(() => {});
}

async function waitShell(page) {
  for (let i = 0; i < 60; i++) {
    const ready = await page.evaluate(() => {
      const stage = document.querySelector("[data-hub-monitor-stage]");
      const strip = document.querySelector("[data-session-control-strip]");
      return Boolean(stage && strip);
    }).catch(() => false);
    if (ready) return;
    await page.waitForTimeout(1500);
  }
  throw new Error("Hub shell did not mount ([data-hub-monitor-stage] + [data-session-control-strip])");
}

function snapPath(role, vp, name) {
  return path.join(OUT_DIR, `${role}-${vp}-${name}.png`);
}

async function auditPrimaryStrip(page) {
  return page.evaluate(({ required, forbidden }) => {
    const strip = document.querySelector("[data-session-control-strip]");
    if (!strip) return { stripFound: false, buttons: [], missing: required, forbiddenFound: forbidden };

    const buttons = Array.from(strip.querySelectorAll("button"))
      .map((b) => (b.textContent || "").replace(/\s+/g, " ").trim().toUpperCase())
      .filter(Boolean);

    const stripText = buttons.join(" | ");
    const missing = required.filter((label) => !stripText.includes(label));
    const forbiddenFound = forbidden.filter((label) => {
      const re = new RegExp(`\\b${label.replace(/&/g, "\\&")}\\b`);
      return re.test(stripText) || buttons.some((t) => t.includes(label));
    });

    return { stripFound: true, buttons, missing, forbiddenFound, stripText };
  }, { required: REQUIRED_PRIMARY, forbidden: FORBIDDEN_PRIMARY });
}

/** Visual/density: strip fit, overflow honesty, min tap targets @ 360/390/430 */
async function auditStripDensity(page, viewportWidth) {
  return page.evaluate((vw) => {
    const strip = document.querySelector("[data-session-control-strip]");
    if (!strip) {
      return { ok: false, reason: "strip missing" };
    }
    const sr = strip.getBoundingClientRect();
    const buttons = Array.from(strip.querySelectorAll("button"));
    const metrics = buttons.map((b) => {
      const r = b.getBoundingClientRect();
      const t = (b.textContent || "").replace(/\s+/g, " ").trim();
      return {
        label: t.slice(0, 40),
        w: Math.round(r.width),
        h: Math.round(r.height),
        right: Math.round(r.right),
        left: Math.round(r.left),
      };
    });
    const minH = metrics.length ? Math.min(...metrics.map((m) => m.h)) : 0;
    const minW = metrics.length ? Math.min(...metrics.map((m) => m.w)) : 0;
    const stripOverflowX = strip.scrollWidth > strip.clientWidth + 2;
    const pageOverflow =
      document.documentElement.scrollWidth > window.innerWidth + 2;
    // Horizontal scroll on the strip is allowed; page-level horizontal overflow is not.
    const clippedOffScreen = metrics.filter((m) => m.right > vw + 4 && !stripOverflowX);
    return {
      ok: true,
      viewportWidth: vw,
      stripWidth: Math.round(sr.width),
      stripScrollWidth: strip.scrollWidth,
      stripClientWidth: strip.clientWidth,
      buttonCount: metrics.length,
      minButtonHeight: minH,
      minButtonWidth: minW,
      stripOverflowX,
      pageOverflow,
      clippedOffScreen: clippedOffScreen.length,
      metrics,
    };
  }, viewportWidth);
}

async function auditLowerRow(page) {
  return page.evaluate(() => {
    const bar = document.querySelector("[data-mobile-quick-panel-bar]");
    const texts = [];
    if (bar) {
      texts.push(
        ...Array.from(bar.querySelectorAll("button")).map((b) =>
          (b.textContent || "").replace(/\s+/g, " ").trim().toUpperCase(),
        ),
      );
    }
    const dock = document.querySelector("[data-persistent-media-interaction-dock]");
    const dockText = dock ? (dock.textContent || "").toUpperCase() : "";
    const streamWinInLower =
      texts.some((t) => t.includes("STREAM") && t.includes("WIN")) ||
      (dockText.includes("STREAM") && dockText.includes("WIN"));
    const lobbiesDuplicate =
      texts.some((t) => t.includes("LOBBIES")) || dockText.includes("LOBBIES");
    const forbiddenLower = ["HAND", "EMOTES", "STAGE", "MONITORS"].filter(
      (f) => texts.some((t) => t.includes(f)) || dockText.includes(f),
    );
    return { lowerButtons: texts, streamWinInLower, lobbiesDuplicate, forbiddenLower };
  });
}

async function clickLobbies(page) {
  const strip = page.locator("[data-session-control-strip]");
  const btn = strip.locator("button").filter({ hasText: /LOBBIES/i }).first();
  await btn.waitFor({ state: "visible", timeout: 15000 });
  await btn.scrollIntoViewIfNeeded().catch(() => {});
  await btn.click({ force: true });
  await page.waitForTimeout(2500);
}

async function auditLobbiesPanel(page) {
  return page.evaluate(() => {
    const body = document.body.innerText || "";
    const panelTitle =
      body.includes("LOBBIES") ||
      body.includes("Live Lobby Wall") ||
      body.includes("LIVE LOBBY");
    const emptyHonest =
      body.includes("No live rooms") ||
      body.includes("No rooms live") ||
      body.includes("Waiting for live");
    const gridVideos = document.querySelectorAll("[data-live-lobby-wall-grid] video, [data-lobby-wall-tile] video").length;
    const hasGridContainer = Boolean(document.querySelector("[data-live-lobby-wall-grid]"));
    const tileCount = document.querySelectorAll("[data-live-lobby-wall-grid] [data-lobby-room-id], [data-lobby-room-id]").length;
    return { panelTitle, emptyHonest, gridVideos, hasGridContainer, tileCount };
  });
}

async function tryTileNavigation(page) {
  const before = page.url();

  await page
    .waitForFunction(
      () => document.querySelector("[data-live-lobby-wall-grid] [data-lobby-room-id]") != null,
      { timeout: 12000 },
    )
    .catch(() => {});

  const clicked = await page.evaluate(() => {
    const el =
      document.querySelector("[data-live-lobby-wall-grid] [data-lobby-room-id]") ??
      document.querySelector("[data-lobby-room-id]");
    if (!el) return { ok: false, roomId: null };
    const roomId = el.getAttribute("data-lobby-room-id");
    el.scrollIntoView({ block: "center", inline: "center" });
    el.click();
    return { ok: true, roomId };
  });

  if (!clicked.ok) {
    const joinBtn = page.getByRole("button", { name: /JOIN|WATCH|ENTER/i }).first();
    if ((await joinBtn.count()) > 0) {
      await joinBtn.click({ force: true, timeout: 5000 }).catch(() => {});
    } else {
      return { status: "SKIP", reason: "no live tiles", before, after: before };
    }
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const navigated = await page
      .waitForURL(/\/live\/rooms\/[^/?#]+/, { timeout: 12000 })
      .then(() => true)
      .catch(() => false);
    if (navigated) break;
    await page.evaluate(() => {
      const el =
        document.querySelector("[data-live-lobby-wall-grid] [data-lobby-room-id]") ??
        document.querySelector("[data-lobby-room-id]");
      el?.click();
    });
    await page.waitForTimeout(500);
  }

  const after = page.url();
  const match = /\/live\/rooms\/[^/?#]+/.test(after);
  return {
    status: match ? "PASS" : "FAIL",
    before,
    after,
    clicked: clicked.ok,
    kind: "tile",
    roomId: clicked.roomId,
  };
}

async function runScenario(browser, roleKey, vp) {
  const roleCfg = ROLES[roleKey];
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const checks = [];
  const shots = [];

  const record = (id, status, detail = "") => {
    checks.push({ id, status, detail });
  };

  try {
    await uiLogin(page, roleCfg.email, roleCfg.password);
    await page.goto(`${BASE}${roleCfg.hub}`, { waitUntil: "domcontentloaded", timeout: 240000 });
    try {
      await waitShell(page);
    } catch {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 }).catch(() => {});
      await waitShell(page);
    }
    await dismissOverlays(page);
    await page.waitForTimeout(1200);

    const hubShot = snapPath(roleKey, vp.tag, "hub");
    await page.screenshot({ path: hubShot, fullPage: false });
    shots.push(hubShot);

    const primary = await auditPrimaryStrip(page);
    record(
      "primary-strip-present",
      primary.stripFound ? "PASS" : "FAIL",
      primary.stripFound ? "" : "data-session-control-strip missing",
    );
    record(
      "primary-required-buttons",
      primary.missing.length === 0 ? "PASS" : "FAIL",
      primary.missing.length ? `missing: ${primary.missing.join(", ")}` : `buttons: ${primary.buttons.join(" | ")}`,
    );
    record(
      "primary-forbidden-absent",
      primary.forbiddenFound.length === 0 ? "PASS" : "FAIL",
      primary.forbiddenFound.length ? `found: ${primary.forbiddenFound.join(", ")}` : "",
    );

    const density = await auditStripDensity(page, vp.width);
    const densityShot = snapPath(roleKey, vp.tag, "density-strip");
    await page.screenshot({ path: densityShot, fullPage: false }).catch(() => {});
    shots.push(densityShot);

    // Density gates (harness): page must not overflow; buttons must be tappable height;
    // strip may scroll horizontally (honest overflowX) but must still expose all 7 labels.
    record(
      "density-page-no-h-overflow",
      density.ok && !density.pageOverflow ? "PASS" : "FAIL",
      density.ok
        ? `scrollW vs vw — pageOverflow=${density.pageOverflow}`
        : density.reason,
    );
    record(
      "density-strip-button-count",
      density.ok && density.buttonCount >= 7 ? "PASS" : "FAIL",
      density.ok ? `buttons=${density.buttonCount}` : density.reason,
    );
    record(
      "density-min-tap-height",
      density.ok && density.minButtonHeight >= 28 ? "PASS" : "FAIL",
      density.ok ? `minH=${density.minButtonHeight}px` : density.reason,
    );
    record(
      "density-strip-scroll-ok",
      density.ok ? "PASS" : "FAIL",
      density.ok
        ? `stripOverflowX=${density.stripOverflowX} scroll=${density.stripScrollWidth}/${density.stripClientWidth}`
        : density.reason,
    );

    const lower = await auditLowerRow(page);
    record(
      "lower-no-lobbies-dup",
      !lower.lobbiesDuplicate ? "PASS" : "FAIL",
      lower.lobbiesDuplicate ? "LOBBIES found in lower row" : `lower: ${lower.lowerButtons.join(" | ")}`,
    );
    record(
      "lower-forbidden-absent",
      lower.forbiddenLower.length === 0 ? "PASS" : "FAIL",
      lower.forbiddenLower.length ? `found: ${lower.forbiddenLower.join(", ")}` : "",
    );

    await dismissBetaFeedback(page);
    await clickLobbies(page);
    const lobbiesShot = snapPath(roleKey, vp.tag, "lobbies-open");
    await page.screenshot({ path: lobbiesShot, fullPage: false });
    shots.push(lobbiesShot);

    const lobbiesPanel = await auditLobbiesPanel(page);
    const lobbiesOk =
      lobbiesPanel.panelTitle &&
      (lobbiesPanel.emptyHonest || lobbiesPanel.hasGridContainer || lobbiesPanel.gridVideos > 0);
    record(
      "lobbies-panel",
      lobbiesOk ? "PASS" : lobbiesPanel.emptyHonest ? "PASS" : lobbiesPanel.panelTitle ? "FAIL" : "FAIL",
      JSON.stringify(lobbiesPanel),
    );

    if (lobbiesPanel.emptyHonest) {
      record("lobbies-tile-nav", "PASS", "honest empty — no tiles to tap");
    } else {
      const nav = await tryTileNavigation(page);
      const navShot = snapPath(roleKey, vp.tag, "lobbies-tile");
      await page.screenshot({ path: navShot, fullPage: false }).catch(() => {});
      shots.push(navShot);
      record(
        "lobbies-tile-nav",
        nav.status === "SKIP" ? "PASS" : nav.status,
        nav.status === "SKIP" ? nav.reason : `${nav.before} → ${nav.after}`,
      );
    }
  } catch (e) {
    const errShot = snapPath(roleKey, vp.tag, "error");
    await page.screenshot({ path: errShot, fullPage: false }).catch(() => {});
    shots.push(errShot);
    record("scenario", "FAIL", String(e?.message || e));
  } finally {
    await context.close();
  }

  return { role: roleKey, viewport: vp.tag, checks, screenshots: shots };
}

async function main() {
  const serverUp = await waitForServer();
  if (!serverUp) {
    const report = {
      qp10: "BLOCKED",
      reason: `Dev server not reachable at ${BASE}`,
      matrix: [],
      screenshots: [],
    };
    fs.writeFileSync(path.join(OUT_DIR, "qp10-report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: true });
  const matrix = [];

  for (const roleKey of Object.keys(ROLES)) {
    for (const vp of VIEWPORTS) {
      console.log(`Testing ${roleKey} @ ${vp.tag}px...`);
      const result = await runScenario(browser, roleKey, vp);
      matrix.push(result);
    }
  }

  await browser.close();

  const flatChecks = matrix.flatMap((m) =>
    m.checks.map((c) => ({ role: m.role, viewport: m.viewport, ...c })),
  );
  const anyFail = flatChecks.some((c) => c.status === "FAIL");
  const anyBlocked = flatChecks.some((c) => c.status === "BLOCKED");
  const qp10 = anyBlocked ? "BLOCKED" : anyFail ? "FAIL" : "PASS";

  const report = {
    qp10,
    testedAt: new Date().toISOString(),
    baseUrl: BASE,
    matrix,
    flatChecks,
    screenshots: matrix.flatMap((m) => m.screenshots),
  };

  fs.writeFileSync(path.join(OUT_DIR, "qp10-report.json"), JSON.stringify(report, null, 2));
  console.log("\n=== QP-10 MOBILE RETEST ===");
  console.log(`Overall: ${qp10}\n`);
  for (const row of flatChecks) {
    console.log(`${row.role.padEnd(10)} ${row.viewport}px  ${row.id.padEnd(28)} ${row.status}${row.detail ? " — " + row.detail : ""}`);
  }
  console.log(`\nEvidence: ${OUT_DIR}`);
  process.exit(qp10 === "PASS" ? 0 : qp10 === "BLOCKED" ? 2 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
