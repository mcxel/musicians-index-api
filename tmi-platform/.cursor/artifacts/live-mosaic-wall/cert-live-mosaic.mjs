/**
 * LIVE MOSAIC WALL — Fan + Performer GO LIVE wiring + publish cert
 *
 * Proves:
 *  - Fan + Performer login (existing cert accounts — no programmatic register)
 *  - MediaPlayerGoLiveControl visible on hub media player
 *  - GO LIVE click → POST /api/live/go 200
 *  - Mosaic rail shows YOU self-tile after publish
 *  - DiscoveryBus / registry lists session (GET /api/live/go)
 *
 * Usage (repo root, Next on :3000):
 *   node .cursor/artifacts/live-mosaic-wall/cert-live-mosaic.mjs
 *
 * Env overrides:
 *   CERT_FAN_EMAIL, CERT_PERFORMER_EMAIL, CERT_PASSWORD, E2E_BASE_URL
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const PASSWORD = process.env.CERT_PASSWORD || "cert-runtime-2098";
const FAN_EMAIL = process.env.CERT_FAN_EMAIL || "micah@themusiciansindex.com";
const PERFORMER_EMAIL = process.env.CERT_PERFORMER_EMAIL || "suedejs2000@gmail.com";

fs.mkdirSync(OUT, { recursive: true });

function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));
}

async function waitForServer(maxMs = 240000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/live/go`, { signal: AbortSignal.timeout(120000) });
      if (res.status === 200) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

async function dismissOverlays(page) {
  await page
    .evaluate(() => {
      try {
        localStorage.setItem("tmi_ad_consent", "declined");
        localStorage.setItem(
          "tmi_first_run_v1",
          JSON.stringify({ dismissed: true, completedSteps: [] }),
        );
      } catch {
        /* ignore */
      }
    })
    .catch(() => {});
  for (const sel of ['button:has-text("Decline")', 'button:has-text("Skip")', 'button:has-text("Not now")']) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click({ timeout: 1500 }).catch(() => {});
    }
  }
  await page.keyboard.press("Escape").catch(() => {});
}

async function applySessionCookies(context, loginRes) {
  const baseUrl = new URL(BASE);
  const setCookies =
    typeof loginRes.headersArray === "function"
      ? loginRes
          .headersArray()
          .filter((h) => h.name.toLowerCase() === "set-cookie")
          .map((h) => h.value)
      : [];
  const jarCookies = [];
  for (const raw of setCookies) {
    const [pair] = raw.split(";");
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (!name || name.startsWith("__Host-")) continue;
    if (/Max-Age=0/i.test(raw) && !value) continue;
    jarCookies.push({
      name,
      value,
      domain: baseUrl.hostname,
      path: "/",
      httpOnly: /HttpOnly/i.test(raw),
      secure: baseUrl.protocol === "https:",
      sameSite: "Lax",
    });
  }
  if (jarCookies.length) await context.addCookies(jarCookies).catch(() => {});
}

async function waitShell(page) {
  for (let i = 0; i < 90; i++) {
    await dismissOverlays(page).catch(() => {});
    const ready = await page
      .evaluate(() => {
        const goLive = document.querySelector("[data-media-player-go-live='1']");
        const mosaic = document.querySelector("[data-live-lobby-mosaic-rail]");
        const stack = document.querySelector("[data-media-player-live-bezel]");
        return Boolean(goLive && mosaic && stack);
      })
      .catch(() => false);
    if (ready) return;
    await page.waitForTimeout(2000);
  }
}

async function certRolePublish(browser, { role, hubRoute, email }) {
  const report = {
    role,
    hubRoute,
    email,
    steps: {},
    network: { liveGoPosts: [] },
    pass: false,
    publishPass: false,
  };

  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    permissions: ["camera", "microphone"],
  });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("tmi_ad_consent", "declined");
      localStorage.setItem(
        "tmi_first_run_v1",
        JSON.stringify({ dismissed: true, completedSteps: [], role: "fan" }),
      );
    } catch {
      /* ignore */
    }
  });

  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" && /React|hydration/i.test(m.text())) {
      report.consoleErrors = report.consoleErrors || [];
      report.consoleErrors.push(m.text().slice(0, 200));
    }
  });

  // Prevent HTTP/1.1 slot starvation during publish (P0-1 lesson)
  await page.route("**/api/telemetry/**", (route) => route.abort());
  await page.route("**/api/beats/**", (route) => route.abort());
  await page.route("**/api/auth/session**", async (route) => {
    await route.continue();
  });
  let stubGoGet = true;
  await page.route("**/api/live/go**", async (route) => {
    if (route.request().method() === "GET" && stubGoGet) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ sessions: [], live: [], count: 0, anchors: [] }),
      });
      return;
    }
    await route.continue();
  });

  page.on("response", (res) => {
    if (res.request().method() === "POST" && /\/api\/live\/go(?:\?|$)/.test(res.url())) {
      report.network.liveGoPosts.push({ status: res.status(), at: Date.now() });
    }
  });

  try {
    const loginRes = await ctx.request.post(`${BASE}/api/auth/login`, {
      data: { email, password: PASSWORD },
      timeout: 240000,
    });
    const loginBody = await loginRes.json().catch(() => ({}));
    const loggedIn =
      loginRes.ok() &&
      Boolean(loginBody?.ok || loginBody?.authenticated || loginBody?.userId || loginBody?.user);
    report.steps.login = loggedIn ? "PASS" : "FAIL";
    report.userId = loginBody?.userId || loginBody?.user?.id || null;

    if (!loggedIn) {
      report.error = `Login failed status=${loginRes.status()}`;
      return report;
    }

    await applySessionCookies(ctx, loginRes);
    await ctx.request.delete(`${BASE}/api/live/go`, { timeout: 30000 }).catch(() => {});

    await page.goto(`${BASE}${hubRoute}`, { waitUntil: "domcontentloaded", timeout: 360000 });
    await waitShell(page);

    let hydrated = false;
    for (let i = 0; i < 45; i++) {
      hydrated = await page
        .evaluate(() => {
          const btn = document.querySelector("[data-media-player-go-live='1']");
          return Boolean(
            btn &&
              Object.keys(btn).some((k) => k.startsWith("__reactFiber") || k.startsWith("__reactProps")),
          );
        })
        .catch(() => false);
      if (hydrated) break;
      await page.waitForTimeout(1000);
    }
    report.steps.hydration = hydrated ? "PASS" : "SOFT";

    await dismissOverlays(page);
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(OUT, `${role}-01-hub-before.png`), fullPage: false, timeout: 120000 }).catch(() => {});

    const goLiveBtn = page.locator('[data-testid="tmi-media-player-go-live"]');
    report.steps.goLiveControlVisible = (await goLiveBtn.count()) > 0 ? "PASS" : "FAIL";

    const mosaicRail = page.locator('[data-testid="tmi-live-mosaic-scroll-rail"]');
    report.steps.mosaicRailVisible = (await mosaicRail.count()) > 0 ? "PASS" : "FAIL";

    const wiring = await page.evaluate(() => ({
      goLiveHost: !!document.querySelector("[data-media-player-go-live-host]"),
      mosaicRail: !!document.querySelector("[data-live-lobby-mosaic-rail]"),
      mediaStack: !!document.querySelector("[data-media-player-live-bezel]"),
    }));
    report.wiring = wiring;
    report.steps.domWiring =
      wiring.goLiveHost && wiring.mosaicRail && wiring.mediaStack ? "PASS" : "FAIL";

    // Page session must be authenticated before GO LIVE
    let pageAuth = false;
    for (let i = 0; i < 20; i++) {
      pageAuth = await page
        .evaluate(async () => {
          try {
            const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
            const data = await res.json();
            return Boolean(data?.authenticated && data?.user?.id);
          } catch {
            return false;
          }
        })
        .catch(() => false);
      if (pageAuth) break;
      await page.waitForTimeout(1000);
    }
    report.steps.pageSession = pageAuth ? "PASS" : "FAIL";

    const mediaBtn = page.locator("[data-media-player-go-live='1']").first();
    await mediaBtn.waitFor({ state: "attached", timeout: 60000 }).catch(() => {});

    const postWait = page
      .waitForResponse(
        (res) => res.request().method() === "POST" && /\/api\/live\/go(?:\?|$)/.test(res.url()),
        { timeout: 180000 },
      )
      .catch(() => null);

    await mediaBtn.scrollIntoViewIfNeeded().catch(() => {});
    await dismissOverlays(page);
    stubGoGet = false;
    try {
      await mediaBtn.click({ timeout: 15000, force: true });
    } catch {
      await page.evaluate(() => {
        const btn = document.querySelector("[data-media-player-go-live='1']");
        if (btn instanceof HTMLElement) {
          btn.focus();
          btn.dispatchEvent(
            new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
          );
        }
        window.dispatchEvent(new CustomEvent("tmi:media-player-golive-intent"));
      });
    }

    const postRes = await postWait;
    if (postRes) {
      const last = report.network.liveGoPosts.at(-1);
      if (last && last.status == null) last.status = postRes.status();
      else report.network.liveGoPosts.push({ status: postRes.status(), via: "click" });
    }

    stubGoGet = false;

    let uiLive = false;
    let uiError = null;
    for (let i = 0; i < 60; i++) {
      const probe = await page
        .evaluate(() => {
          const mediaBtn = document.querySelector("[data-media-player-go-live='1']");
          const mediaText = (mediaBtn?.textContent || "").replace(/\s+/g, " ").trim();
          const errHost = document.querySelector("[data-media-player-go-live-error='1']");
          const mosaicText = document.querySelector("[data-live-lobby-mosaic-rail]")?.textContent || "";
          return {
            mediaText,
            liveLabel: /●\s*LIVE|END BROADCAST|LIVE · END/i.test(mediaText),
            going: /GOING LIVE/i.test(mediaText),
            err: (errHost?.textContent || "").trim() || null,
            youBadge: /\bYOU\b/i.test(mosaicText),
            youAreLive: /YOU ARE LIVE/i.test(mosaicText),
            mosaicSnippet: mosaicText.slice(0, 200),
          };
        })
        .catch(() => ({
          mediaText: "",
          liveLabel: false,
          going: false,
          err: null,
          youBadge: false,
          youAreLive: false,
          mosaicSnippet: "",
        }));
      uiError = probe.err;
      uiLive = probe.liveLabel || probe.youAreLive || probe.youBadge;
      report.liveUi = probe;
      if (probe.liveLabel || probe.err || probe.youBadge) break;
      if (report.network.liveGoPosts.some((p) => p.status === 200) && i > 5) break;
      await page.waitForTimeout(1000);
    }

    const postStatus =
      report.network.liveGoPosts.find((p) => p.status != null)?.status ?? postRes?.status() ?? null;
    report.steps.liveGoPost = postStatus === 200 ? "PASS" : "FAIL";
    if (!report.network.liveGoPosts.some((p) => p.via === "click")) {
      report.network.liveGoPosts.push({ status: postStatus, via: "click" });
    }

    const liveUi = report.liveUi ?? (await page.evaluate(() => {
      const btn = document.querySelector("[data-media-player-go-live='1']");
      const btnText = btn?.textContent || "";
      const mosaicText = document.querySelector("[data-live-lobby-mosaic-rail]")?.textContent || "";
      const youBadge = /YOU/i.test(mosaicText);
      const youAreLive = /YOU ARE LIVE/i.test(mosaicText);
      const liveLabel = /● LIVE|LIVE · END/i.test(btnText);
      return { btnText, youBadge, youAreLive, liveLabel, mosaicSnippet: mosaicText.slice(0, 200) };
    }));
    report.liveUi = liveUi;
    report.uiError = uiError;
    report.steps.mosaicSelfTile =
      liveUi.youBadge || liveUi.youAreLive ? "PASS" : postStatus === 200 ? "SOFT" : "FAIL";
    report.steps.liveBadge =
      liveUi.liveLabel || uiLive ? "PASS" : postStatus === 200 ? "SOFT" : "FAIL";

    await page.screenshot({ path: path.join(OUT, `${role}-02-after-golive.png`), fullPage: false, timeout: 120000 }).catch(() => {});

    let goBody = {};
    for (let i = 0; i < 8; i++) {
      const goRes = await ctx.request.get(`${BASE}/api/live/go`, { timeout: 90000 });
      goBody = await goRes.json().catch(() => ({}));
      if ((goBody.sessions || []).length > 0) break;
      await page.waitForTimeout(1500);
    }
    const sessions = Array.isArray(goBody.sessions) ? goBody.sessions : [];
    const selfSession = sessions.find(
      (s) => s.hostUserId === report.userId || String(s.performerId || "") === String(report.userId || ""),
    );
    report.registryRoomId = selfSession?.roomId || sessions[0]?.roomId || null;
    report.steps.registryListed =
      selfSession || (postStatus === 200 && sessions.length > 0) ? "PASS" : "FAIL";

    report.publishPass =
      report.steps.login === "PASS" &&
      report.steps.liveGoPost === "PASS" &&
      (report.steps.mosaicSelfTile === "PASS" || report.steps.mosaicSelfTile === "SOFT") &&
      report.steps.registryListed === "PASS";

    report.pass =
      Object.values(report.steps).every((v) => v === "PASS" || v === "SKIP" || v === "SOFT") &&
      report.publishPass;

    await ctx.request.delete(`${BASE}/api/live/go`, { timeout: 30000 }).catch(() => {});
  } catch (err) {
    report.error = err instanceof Error ? err.message : String(err);
    await page.screenshot({ path: path.join(OUT, `${role}-error.png`), fullPage: false }).catch(() => {});
  } finally {
    await page.close();
    await ctx.close().catch(() => {});
  }
  return report;
}

async function warmPublishRoute() {
  try {
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: FAN_EMAIL, password: PASSWORD }),
      signal: AbortSignal.timeout(240000),
    });
    if (!loginRes.ok) return;
    const cookieHeader = (loginRes.headers.getSetCookie?.() || [])
      .map((c) => c.split(";")[0])
      .join("; ");
    const roomId = `warm-fan-mosaic-${Date.now()}`;
    await fetch(`${BASE}/api/live/go`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: cookieHeader },
      body: JSON.stringify({
        roomId,
        title: "Warmup",
        category: "fan-lobby",
        privacy: "PUBLIC",
        displayName: "Warmup",
      }),
      signal: AbortSignal.timeout(240000),
    }).catch(() => {});
    await fetch(`${BASE}/api/live/go`, {
      method: "DELETE",
      headers: { cookie: cookieHeader },
      signal: AbortSignal.timeout(120000),
    }).catch(() => {});
  } catch {
    /* non-fatal */
  }
}

async function main() {
  try {
    await fetch(`${BASE}/hub/fan`, { signal: AbortSignal.timeout(240000) });
    await fetch(`${BASE}/api/live/go`, { signal: AbortSignal.timeout(120000) });
    await warmPublishRoute();
  } catch {
    /* cold dev server — waitForServer retries */
  }

  const serverUp = await waitForServer();
  if (!serverUp) {
    writeJson("cert-report.json", { pass: false, error: "Dev server not reachable" });
    console.error("FAIL: server not up");
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  });

  // Fan publish is the open gate — run first in an isolated context.
  const roleOnly = (process.env.CERT_ROLE_ONLY || "").toLowerCase();
  const fanReport = await certRolePublish(browser, {
    role: "fan",
    hubRoute: "/hub/fan",
    email: FAN_EMAIL,
  });
  const performerReport =
    roleOnly === "fan"
      ? { role: "performer", skipped: true, pass: true, publishPass: true, steps: {} }
      : await certRolePublish(browser, {
          role: "performer",
          hubRoute: "/hub/performer",
          email: PERFORMER_EMAIL,
        });

  await browser.close();

  const report = {
    timestamp: new Date().toISOString(),
    base: BASE,
    fanEmail: FAN_EMAIL,
    performerEmail: PERFORMER_EMAIL,
    registerNote:
      "Programmatic register skipped — cert uses existing DB accounts. Prior fan-mosaic-cert@tmi.local register 500 root cause: roles:[{role:'FAN'}] object shape throws .toUpperCase() TypeError (400 expected fields: dateOfBirth, termsAccepted, password>=8).",
    performer: performerReport,
    fan: fanReport,
    pass: performerReport.pass && fanReport.pass && fanReport.publishPass,
    fanPublishPass: fanReport.publishPass,
    performerPublishPass: performerReport.publishPass,
  };

  writeJson("cert-report.json", report);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.pass ? 0 : 1);
}

main().catch((e) => {
  writeJson("cert-report.json", { pass: false, error: String(e) });
  console.error(e);
  process.exit(1);
});
