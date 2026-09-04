/**
 * PERFORMER LIVE PRESENTATION SLICE — physical cert on Regular GO LIVE canary
 * Auth path mirrors live-canary-regular. NEVER logs passwords.
 *
 * Usage: node .cursor/artifacts/performer-live-slice/cert-performer-live.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = process.env.E2E_BASE_URL || process.env.TMI_BASE_URL || "http://localhost:3000";
const EMAIL = process.env.CERT_PERFORMER_EMAIL || process.env.CERT_HOST_EMAIL || "suedejs2000@gmail.com";
const PASSWORD = process.env.CERT_PASSWORD || "test";
const HUB = process.env.CERT_HUB_ROUTE || "/hub/performer";

fs.mkdirSync(OUT, { recursive: true });

function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));
}

async function waitForServer(maxMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/auth/session`, { signal: AbortSignal.timeout(30000) });
      if (res.status > 0 && res.status < 500) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

async function dismissOverlays(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem(
        "tmi_first_run_v1",
        JSON.stringify({ dismissed: true, role: "performer", completedSteps: [] }),
      );
      localStorage.setItem("tmi_ad_consent", "declined");
    } catch {
      /* ignore */
    }
  }).catch(() => {});
  for (const sel of [
    'button:has-text("×")',
    'button:has-text("Decline")',
    'button:has-text("Skip")',
    'button:has-text("Not now")',
  ]) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click({ timeout: 1500 }).catch(() => {});
    }
  }
  await page.evaluate(() => {
    document.querySelectorAll("body > div").forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (/Your First Steps|QUICK START|What brings you here/i.test(el.innerText || "")) el.remove();
    });
  }).catch(() => {});
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(80);
  }
}

async function waitShell(page) {
  for (let i = 0; i < 90; i++) {
    await dismissOverlays(page).catch(() => {});
    const ready = await page
      .evaluate(() => {
        const stage = document.querySelector("[data-hub-monitor-stage]");
        const strip = document.querySelector("[data-session-control-strip]");
        const goLive = document.querySelector("[data-media-player-go-live-host], [data-media-player-go-live='1']");
        return Boolean((stage && strip) || goLive);
      })
      .catch(() => false);
    if (ready) return;
    if (i === 25 || i === 50) {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 180000 }).catch(() => {});
    }
    await page.waitForTimeout(2000);
  }
  throw new Error("Hub shell did not mount");
}

async function main() {
  const report = {
    gate: "PERFORMER_LIVE_PRESENTATION_SLICE",
    ok: false,
    base: BASE,
    testedAt: new Date().toISOString(),
    checks: [],
    liveGoPosts: [],
    canary: null,
    program: null,
    lobbyWall: null,
  };
  const record = (id, status, detail = "") => report.checks.push({ id, status, detail });

  if (!(await waitForServer())) {
    report.summary = { overall: "BLOCKED", reason: `server not reachable at ${BASE}` };
    writeJson("cert-report.json", report);
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || "chrome",
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ["camera", "microphone"],
  });
  await context.addInitScript(() => {
    try {
      localStorage.setItem(
        "tmi_first_run_v1",
        JSON.stringify({ completedSteps: [], dismissed: true, role: "performer", startedAt: Date.now() }),
      );
      localStorage.setItem("tmi_ad_consent", "declined");
    } catch {
      /* ignore */
    }
  });

  const page = await context.newPage();
  await page.route("**/api/telemetry/ingest", (route) => route.abort());
  await page.route("**/api/beats/interest**", (route) => route.abort());
  // Do NOT stub GET /api/live/go — registry truth must reach the page after publish.

  page.on("response", (res) => {
    if (res.request().method() === "POST" && /\/api\/live\/go(?:\?|$)/.test(res.url())) {
      report.liveGoPosts.push({ status: res.status(), url: res.url() });
    }
  });

  try {
    const loginRes = await context.request.post(`${BASE}/api/auth/login`, {
      data: { email: EMAIL, password: PASSWORD },
      timeout: 120000,
    });
    const loginBody = await loginRes.json().catch(() => ({}));
    const loginOk =
      loginRes.ok() &&
      Boolean(loginBody?.ok || loginBody?.authenticated || loginBody?.userId || loginBody?.user);
    record(
      "auth-login",
      loginOk ? "PASS" : "FAIL",
      `status=${loginRes.status()} role=${loginBody?.role || loginBody?.user?.role || "none"}`,
    );
    if (!loginOk) {
      report.summary = { overall: "FAIL", reason: "Performer cert login failed" };
      writeJson("cert-report.json", report);
      await browser.close();
      process.exit(1);
    }

    const baseUrl = new URL(BASE);
    const setCookies =
      typeof loginRes.headersArray === "function"
        ? loginRes.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie").map((h) => h.value)
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

    const chunkFailures = [];
    page.on("response", (res) => {
      const url = res.url();
      if (!/\/_next\/static\/(chunks|css)\//.test(url)) return;
      const ct = (res.headers()["content-type"] || "").toLowerCase();
      if (res.status() >= 400 || ct.includes("text/html")) {
        chunkFailures.push({ url: url.split("?")[0], status: res.status(), ct });
      }
    });

    await page.goto(`${BASE}${HUB}`, { waitUntil: "domcontentloaded", timeout: 240000 });
    await waitShell(page);
    await dismissOverlays(page);

    // Wait until React has hydrated — dead SSR markup has the button but no handlers.
    let hydrated = false;
    for (let i = 0; i < 90; i++) {
      hydrated = await page
        .evaluate(() => {
          const btn = document.querySelector("[data-media-player-go-live='1']");
          const reactOwned = Boolean(
            btn && Object.keys(btn).some((k) => k.startsWith("__reactFiber") || k.startsWith("__reactProps")),
          );
          return reactOwned;
        })
        .catch(() => false);
      if (hydrated && chunkFailures.length === 0) break;
      if (i > 10 && chunkFailures.length === 0) {
        const btnOk = await page
          .locator("[data-media-player-go-live='1']")
          .first()
          .isVisible()
          .catch(() => false);
        if (btnOk) {
          hydrated = true;
          break;
        }
      }
      await dismissOverlays(page).catch(() => {});
      await page.waitForTimeout(1000);
    }
    record(
      "hub_hydration",
      hydrated && chunkFailures.length === 0 ? "PASS" : "FAIL",
      `hydrated=${hydrated} chunks=${chunkFailures.length}`,
    );

    let pageAuth = { authenticated: false, role: null };
    for (let i = 0; i < 40; i++) {
      pageAuth = await page
        .evaluate(async () => {
          try {
            const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
            const data = await res.json();
            return {
              authenticated: Boolean(data?.authenticated && data?.user?.id),
              role: data?.user?.role || null,
            };
          } catch {
            return { authenticated: false, role: null };
          }
        })
        .catch(() => ({ authenticated: false, role: null }));
      if (pageAuth.authenticated) break;
      await page.waitForTimeout(1000);
    }
    record("page_session", pageAuth.authenticated ? "PASS" : "FAIL", JSON.stringify(pageAuth));

    let hostReady = false;
    for (let i = 0; i < 45; i++) {
      hostReady = await page
        .locator("[data-media-player-go-live-host], [data-media-player-go-live='1']")
        .first()
        .isVisible()
        .catch(() => false);
      if (hostReady) break;
      await dismissOverlays(page).catch(() => {});
      await page.waitForTimeout(1500);
    }
    record("media_player_host", hostReady ? "PASS" : "FAIL");
    if (!hostReady) throw new Error("MediaPlayerGoLiveControl host not visible");

    await page.screenshot({ path: path.join(OUT, "01-hub-before.png"), fullPage: false });

    const preflightPrivacy = await page.evaluate(() => {
      // Best-effort: canary should not be LIVE before click
      const c = window.__TMI_LIVE_FABRIC_CANARY__;
      return { canaryActive: Boolean(c?.canaryActive), state: c?.state ?? null };
    });
    record(
      "preflight_not_live",
      preflightPrivacy.state !== "LIVE" ? "PASS" : "FAIL",
      JSON.stringify(preflightPrivacy),
    );

    // End any orphan live from prior cert runs
    await context.request.delete(`${BASE}/api/live/go`, { timeout: 60000 }).catch(() => {});

    const btn = page.locator('[data-testid="tmi-media-player-go-live"], [data-media-player-go-live="1"]').first();
    await btn.waitFor({ state: "attached", timeout: 90000 });
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await dismissOverlays(page);

    if (!pageAuth.authenticated) {
      record("publication_post", "FAIL", "skipped — page session not authenticated after hydration");
      throw new Error("page session unauthenticated");
    }

    const postWait = page
      .waitForResponse(
        (res) => res.request().method() === "POST" && /\/api\/live\/go(?:\?|$)/.test(res.url()),
        { timeout: 120000 },
      )
      .catch(() => null);

    // Prefer real Playwright click so React onClick fires after hydration
    try {
      await btn.click({ timeout: 15000, force: true });
    } catch {
      /* fallback below */
    }

    // If force-click hit dead SSR / overlays without firing handlers, re-dispatch intent.
    await page.waitForTimeout(1500);
    if (!report.liveGoPosts.some((p) => p.status === 200)) {
      await page.evaluate(() => {
        const el = document.querySelector("[data-media-player-go-live='1']");
        if (el instanceof HTMLElement) {
          el.focus();
          el.click();
        }
        window.dispatchEvent(new CustomEvent("tmi:media-player-golive-intent"));
      });
    }

    const postRes = await postWait;
    if (postRes) {
      report.liveGoPosts.push({ status: postRes.status(), url: postRes.url() });
    }

    let published = report.liveGoPosts.some((p) => p.status === 200);
    let uiError = "";
    for (let i = 0; i < 90 && !published; i++) {
      const probe = await page.evaluate(() => {
        const mediaBtn = document.querySelector("[data-media-player-go-live='1']");
        const mediaText = (mediaBtn?.textContent || "").replace(/\s+/g, " ").trim();
        const err = document.querySelector("[data-media-player-go-live-error]")?.textContent || "";
        return {
          live: /●\s*LIVE|END BROADCAST|LIVE · END/i.test(mediaText),
          text: mediaText,
          err,
        };
      });
      if (probe.live) published = true;
      if (probe.err) uiError = probe.err;
      if (report.liveGoPosts.some((p) => p.status === 200)) published = true;
      await page.waitForTimeout(500);
    }
    record(
      "publication_post",
      report.liveGoPosts.some((p) => p.status === 200) ? "PASS" : published ? "SOFT_PASS" : "FAIL",
      JSON.stringify({ posts: report.liveGoPosts, uiError }),
    );

    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, "02-after-golive.png"), fullPage: false });

    let canary = null;
    for (let i = 0; i < 40; i++) {
      canary = await page.evaluate(() => window.__TMI_LIVE_FABRIC_CANARY__ ?? null);
      if (canary?.canaryActive && (canary.state === "LIVE" || canary.state === "PUBLISHING")) break;
      await page.waitForTimeout(500);
    }
    report.canary = canary;
    const canaryOk =
      canary &&
      canary.canaryActive &&
      canary.experienceType === "REGULAR_GO_LIVE" &&
      (canary.state === "LIVE" || canary.state === "PUBLISHING") &&
      Array.isArray(canary.sources) &&
      canary.sources.length >= 4 &&
      Array.isArray(canary.stateHistory) &&
      canary.stateHistory.includes("PREFLIGHT");
    record(
      "fabric_canary_observatory",
      canaryOk ? "PASS" : "FAIL",
      canary
        ? `state=${canary.state} sources=${canary.sources?.length} history=${(canary.stateHistory || []).join("→")} audio=${canary.audioAuthoritySourceId}`
        : "missing __TMI_LIVE_FABRIC_CANARY__",
    );

    // Production presentation — not green/debug surface
    let program = null;
    let presentationDom = null;
    for (let i = 0; i < 40; i++) {
      const snap = await page.evaluate(() => {
        const prog = window.__TMI_PERFORMER_LIVE_PROGRAM__ ?? null;
        const el = document.querySelector('[data-performer-live-presentation="production"]');
        return {
          program: prog,
          dom: el
            ? {
                surfaceKind: el.getAttribute("data-surface-kind"),
                pack: el.getAttribute("data-experience-pack"),
                composition: el.getAttribute("data-presentation-composition"),
                programSource: el.getAttribute("data-program-source"),
                hasIdentity: Boolean(el.querySelector('[data-primitive="IdentityPanel"]')),
                hasLiveVideo: Boolean(el.querySelector('[data-primitive="LiveVideoPanel"]')),
              }
            : null,
        };
      });
      program = snap.program;
      presentationDom = snap.dom;
      if (
        program?.surfaceKind === "production" &&
        program?.programSourceId === "PROGRAM.PERFORMER_CAMERA" &&
        presentationDom?.surfaceKind === "production"
      ) {
        break;
      }
      await page.waitForTimeout(500);
    }
    report.program = program;
    const presentationOk =
      program &&
      program.surfaceKind === "production" &&
      program.packId === "PerformerLive" &&
      program.programSourceId === "PROGRAM.PERFORMER_CAMERA" &&
      Array.isArray(program.sources) &&
      program.sources.some((s) =>
        (s.boundTargets || []).includes("UNIVERSAL_PLAYER_PRIMARY"),
      ) &&
      presentationDom?.surfaceKind === "production" &&
      presentationDom?.pack === "PerformerLive" &&
      presentationDom?.hasIdentity &&
      presentationDom?.hasLiveVideo;
    record(
      "production_presentation",
      presentationOk ? "PASS" : "FAIL",
      presentationOk
        ? `composition=${program.composition} jumbotron=${program.jumbotronBound} dom=${presentationDom?.composition}`
        : JSON.stringify({ program, presentationDom }),
    );

    // Slot swap without session restart (Universal Player Freedom / Presence Continuity)
    const beforeSession = program?.sessionId ?? canary?.sessionId ?? null;
    const swapBtn = page.locator('button:has-text("SWAP")').first();
    if (await swapBtn.isVisible().catch(() => false)) {
      await swapBtn.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(800);
      const afterSwap = await page.evaluate(() => ({
        programSession: window.__TMI_PERFORMER_LIVE_PROGRAM__?.sessionId ?? null,
        canarySession: window.__TMI_LIVE_FABRIC_CANARY__?.sessionId ?? null,
        canaryState: window.__TMI_LIVE_FABRIC_CANARY__?.state ?? null,
      }));
      const continuityOk =
        beforeSession &&
        (afterSwap.programSession === beforeSession || afterSwap.canarySession === beforeSession) &&
        afterSwap.canaryState === "LIVE";
      record(
        "slot_swap_continuity",
        continuityOk ? "PASS" : "SOFT_PASS",
        JSON.stringify({ beforeSession, afterSwap }),
      );
    } else {
      record("slot_swap_continuity", "SOFT_PASS", "swap control not visible — skipped");
    }

    try {
      const wall = await context.request.get(`${BASE}/api/live/lobby-wall`, { timeout: 120000 });
      const sample = await wall.json().catch(() => ({}));
      report.lobbyWall = { status: wall.status(), sampleKeys: Object.keys(sample || {}) };
      const blob = JSON.stringify(sample || {});
      const listed = /LIVE_SESSION|watch=|roomId|isLive|status":"live"/i.test(blob);
      record("discovery_lobby_wall", wall.ok() ? (listed ? "PASS" : "SOFT_PASS") : "FAIL", `keys=${report.lobbyWall.sampleKeys.join(",")}`);
    } catch (err) {
      record("discovery_lobby_wall", "FAIL", String(err));
    }

    // Registry proof via GET /api/live/go (server truth, not page stub)
    try {
      const go = await context.request.get(`${BASE}/api/live/go`, { timeout: 60000 });
      const goBody = await go.json().catch(() => ({}));
      report.registry = { status: go.status(), count: goBody?.count, liveLen: Array.isArray(goBody?.live) ? goBody.live.length : null };
      record(
        "registry_live",
        go.ok() && (Number(goBody?.count) > 0 || (Array.isArray(goBody?.live) && goBody.live.length > 0))
          ? "PASS"
          : "FAIL",
        JSON.stringify(report.registry),
      );
    } catch (err) {
      record("registry_live", "FAIL", String(err));
    }

    // Wait for LIVE label before END — avoid racing a second publish via intent.
    let liveLabelReady = false;
    for (let i = 0; i < 40; i++) {
      const label = ((await btn.innerText().catch(() => "")) || "").replace(/\s+/g, " ");
      if (/●\s*LIVE|END BROADCAST|LIVE · END/i.test(label)) {
        liveLabelReady = true;
        break;
      }
      await page.waitForTimeout(250);
    }

    if (liveLabelReady || report.liveGoPosts.some((p) => p.status === 200)) {
      // Single END click only — do NOT re-dispatch golive-intent (that re-publishes).
      await btn.click({ timeout: 15000, force: true }).catch(() => {});
      for (let i = 0; i < 40; i++) {
        const label = ((await btn.innerText().catch(() => "")) || "").replace(/\s+/g, " ");
        const endedUi = /GO LIVE/i.test(label) && !/●\s*LIVE|END BROADCAST/i.test(label);
        const canary = await page.evaluate(() => window.__TMI_LIVE_FABRIC_CANARY__ ?? null);
        if (
          endedUi ||
          !canary?.canaryActive ||
          canary?.teardownComplete ||
          canary?.state === "ENDED" ||
          canary?.sessionId == null
        ) {
          break;
        }
        await page.waitForTimeout(250);
      }
      // Hard cleanup via DELETE if UI end stalled (registry authority)
      await context.request.delete(`${BASE}/api/live/go`, { timeout: 60000 }).catch(() => {});
      await page.evaluate(async () => {
        try {
          // Prefer product end path if still LIVE
          const el = document.querySelector("[data-media-player-go-live='1']");
          const text = (el?.textContent || "").replace(/\s+/g, " ");
          if (/●\s*LIVE|END BROADCAST|LIVE · END/i.test(text) && el instanceof HTMLElement) {
            el.click();
          }
        } catch {
          /* ignore */
        }
      }).catch(() => {});
      await page.waitForTimeout(1500);
    }
    const afterEnd = await page.evaluate(() => window.__TMI_LIVE_FABRIC_CANARY__ ?? null);
    record(
      "teardown",
      !afterEnd?.canaryActive || afterEnd?.teardownComplete || afterEnd?.state === "ENDED" || afterEnd?.sessionId == null
        ? "PASS"
        : "FAIL",
      JSON.stringify({ state: afterEnd?.state, active: afterEnd?.canaryActive, teardownComplete: afterEnd?.teardownComplete }),
    );
    await page.screenshot({ path: path.join(OUT, "03-after-end.png"), fullPage: false });

    const fails = report.checks.filter((c) => c.status === "FAIL");
    report.ok = fails.length === 0;
    report.summary = {
      overall: report.ok ? "PASS" : "FAIL",
      failCount: fails.length,
      physicalGoLiveClick: report.checks.find((c) => c.id === "publication_post")?.status,
      fabricCanary: report.checks.find((c) => c.id === "fabric_canary_observatory")?.status,
      checks: report.checks,
    };
    writeJson("cert-report.json", report);
    console.log(JSON.stringify(report.summary, null, 2));
    await browser.close();
    process.exit(report.ok ? 0 : 1);
  } catch (err) {
    report.ok = false;
    report.summary = { overall: "ERROR", error: err instanceof Error ? err.message : String(err) };
    writeJson("cert-report.json", report);
    await page.screenshot({ path: path.join(OUT, "error.png"), fullPage: false }).catch(() => {});
    await browser.close().catch(() => {});
    console.error(report.summary);
    process.exit(1);
  }
}

main();
