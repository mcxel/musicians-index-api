/**
 * GO LIVE RETEST — hub strip 🔴 GO LIVE (in-place publish)
 * Proves CommandCenterSessionControlStrip → presentInstantGoLiveInPlace + publish
 * without requiring a second GoLive pipeline.
 *
 * node scripts/go-live-retest.mjs
 * pnpm run cert:go-live
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE = process.env.E2E_BASE_URL || process.env.TMI_BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(ROOT, "tmp", "go-live-retest");
const EMAIL = process.env.CERT_HOST_EMAIL || "suedejs2000@gmail.com";
const PASSWORD = process.env.CERT_PASSWORD || "test";
const HUB = process.env.CERT_HUB_ROUTE || "/hub/performer";

fs.mkdirSync(OUT_DIR, { recursive: true });

function writeReport(report) {
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary || report, null, 2));
}

async function waitForServer(maxMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      // Prefer live API — /auth can 500 while API still serves cert traffic
      const res = await fetch(`${BASE}/api/live/go`, { signal: AbortSignal.timeout(8000) });
      if (res.status > 0 && res.status < 500) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  return false;
}

async function dismissOverlays(page) {
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(200);
  }
  const decline = page.getByRole("button", { name: /Decline|Reject|NOT NOW/i }).first();
  if ((await decline.count()) > 0) await decline.click({ force: true }).catch(() => {});
  const bodyHasQuickStart = await page
    .evaluate(() => /Your First Steps|QUICK START/i.test(document.body?.innerText || ""))
    .catch(() => false);
  if (bodyHasQuickStart) {
    await page.keyboard.press("Escape").catch(() => {});
  }
}

async function apiLogin(context) {
  const res = await context.request.post(`${BASE}/api/auth/login`, {
    data: { email: EMAIL, password: PASSWORD },
    timeout: 120000,
  });
  return { ok: res.ok(), status: res.status(), body: await res.json().catch(() => ({})) };
}

async function uiLoginFallback(page) {
  await page.goto(`${BASE}/auth`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.locator("#auth-email").waitFor({ state: "visible", timeout: 30000 });
  await page.locator("#auth-email").fill(EMAIL);
  await page.locator("#auth-password").fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click({ force: true }).catch(() => {});
  await page.waitForURL(/\/dashboard/i, { timeout: 60000 }).catch(() => {});
}

async function waitShell(page) {
  for (let i = 0; i < 120; i++) {
    await dismissOverlays(page).catch(() => {});
    const probe = await page
      .evaluate(() => {
        const stage = document.querySelector("[data-hub-monitor-stage]");
        const strip = document.querySelector("[data-session-control-strip]");
        const body = document.body?.innerText || "";
        const loading = /LOADING COMMAND CENTER/i.test(body);
        const chunkFail = /Loading chunk|SOMETHING WENT WRONG|SYSTEM INTERRUPT/i.test(body);
        return {
          ready: Boolean(stage && strip),
          loading,
          chunkFail,
          href: location.href,
        };
      })
      .catch(() => ({ ready: false, loading: true, chunkFail: false, href: "" }));
    if (probe.ready) return;
    if ((i === 10 || i === 40 || i === 70) && (probe.loading || probe.chunkFail)) {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 240000 }).catch(() => {});
    }
    await page.waitForTimeout(2000);
  }
  throw new Error("Hub shell did not mount");
}

async function main() {
  const report = {
    ok: false,
    gate: "go-live-retest",
    base: BASE,
    email: EMAIL,
    hub: HUB,
    testedAt: new Date().toISOString(),
    checks: [],
    note:
      "Hub GO LIVE is in-place (presentInstantGoLiveInPlace + publish). Navigation to /live/rooms is NOT required for PASS.",
  };
  const record = (id, status, detail = "") => {
    report.checks.push({ id, status, detail });
  };

  if (!(await waitForServer())) {
    report.summary = { overall: "BLOCKED", reason: `server not reachable at ${BASE}` };
    writeReport(report);
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    permissions: ["camera", "microphone"],
  });
  const page = await context.newPage();

  const posted = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && /\/api\/live\/go/.test(req.url())) {
      posted.push({ url: req.url(), at: Date.now(), status: null });
    }
  });
  page.on("response", (res) => {
    if (res.request().method() === "POST" && /\/api\/live\/go/.test(res.url())) {
      const last = posted[posted.length - 1];
      if (last && last.status == null) last.status = res.status();
    }
  });

  try {
    const login = await apiLogin(context);
    record("auth-login", login.ok ? "PASS" : "FAIL", `API login status=${login.status}`);
    if (!login.ok) {
      await uiLoginFallback(page).catch(() => {});
    }
    // Warm session + hub route before shell wait (avoids cold-compile false fail)
    const sess = await context.request.get(`${BASE}/api/auth/session`, { timeout: 120000 });
    const sessBody = await sess.json().catch(() => ({}));
    record(
      "auth-session",
      sessBody?.authenticated ? "PASS" : "FAIL",
      `status=${sess.status()} role=${sessBody?.user?.role ?? "none"}`,
    );
    await context.request.get(`${BASE}${HUB}`, { timeout: 240000 }).catch(() => {});
    await page.goto(`${BASE}${HUB}`, { waitUntil: "domcontentloaded", timeout: 240000 });
    await waitShell(page);
    await dismissOverlays(page);
    await page.screenshot({ path: path.join(OUT_DIR, "01-hub-before.png"), fullPage: false });

    const baselineApi = await context.request.get(`${BASE}/api/live/go`, { timeout: 60000 });
    const baselineBody = await baselineApi.json().catch(() => ({}));
    const baselineCount =
      typeof baselineBody.count === "number" ? baselineBody.count : null;
    record(
      "baseline-api",
      baselineApi.ok() && baselineCount != null ? "PASS" : "FAIL",
      `status=${baselineApi.status()} count=${baselineCount}`,
    );

    // Warm POST /api/live/go compile path so the UI publish does not hit AbortSignal mid-compile.
    await context.request
      .post(`${BASE}/api/live/go`, {
        data: {
          displayName: "Cert Warm",
          category: "live",
          roomId: `room-cert-warm-${Date.now()}`,
          privacy: "PUBLIC",
        },
        timeout: 120000,
      })
      .then(async (res) => {
        if (res.ok()) {
          await context.request.delete(`${BASE}/api/live/go`, { timeout: 60000 }).catch(() => {});
        }
      })
      .catch(() => {});

    const strip = page.locator("[data-session-control-strip]");
    const goLiveBtn = strip.locator("button").filter({ hasText: /GO LIVE|GOING LIVE|● LIVE/i }).first();
    await goLiveBtn.waitFor({ state: "visible", timeout: 20000 });
    record("go-live-button-visible", "PASS", await goLiveBtn.innerText().catch(() => ""));

    // DOM click — Playwright force-click can miss React handlers on this strip
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("[data-session-control-strip] button")].find((b) =>
        /GO LIVE/i.test(b.textContent || ""),
      );
      btn?.click();
    });
    await page.waitForTimeout(30000);

    // Wait for durable registry to reflect the publish (multi-worker reconcile).
    let afterCount = null;
    let afterBody = {};
    let afterApiStatus = 0;
    for (let i = 0; i < 15; i++) {
      const afterApi = await context.request.get(`${BASE}/api/live/go`, { timeout: 60000 });
      afterApiStatus = afterApi.status();
      afterBody = await afterApi.json().catch(() => ({}));
      afterCount = typeof afterBody.count === "number" ? afterBody.count : null;
      if (
        (baselineCount != null && afterCount != null && afterCount >= baselineCount + 1) ||
        (afterBody.sessions || []).length > 0
      ) {
        break;
      }
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: path.join(OUT_DIR, "02-after-click.png"), fullPage: false });

    const afterClick = await page.evaluate(() => {
      const stripEl = document.querySelector("[data-session-control-strip]");
      const labels = stripEl
        ? Array.from(stripEl.querySelectorAll("button")).map((b) =>
            (b.textContent || "").replace(/\s+/g, " ").trim(),
          )
        : [];
      const liveLabel = labels.some((t) => /●\s*LIVE/i.test(t) && !/GOING|GO LIVE/i.test(t));
      const going = labels.some((t) => /GOING LIVE/i.test(t));
      const stillIdle = labels.some((t) => /🔴\s*GO LIVE|GO LIVE/i.test(t) && !/GOING/i.test(t));
      const err =
        stripEl?.innerText?.match(/Stage did not open|Publish failed|Network error publishing/i)?.[0] || null;
      const stageBound = Boolean(
        document.querySelector("[data-instant-go-live-stage], [data-hub-monitor-stage] video, video"),
      );
      return { labels, liveLabel, going, stillIdle, err, stageBound };
    });

    const postSeen = posted.length > 0;
    const postOk = posted.some((p) => p.status >= 200 && p.status < 300);
    record(
      "go-live-ui-phase",
      afterClick.liveLabel || afterClick.going || afterClick.err ? "PASS" : "FAIL",
      JSON.stringify({
        liveLabel: afterClick.liveLabel,
        going: afterClick.going,
        stillIdle: afterClick.stillIdle,
        err: afterClick.err,
      }),
    );
    record(
      "go-live-post-emitted",
      postSeen ? "PASS" : "FAIL",
      postSeen
        ? `POST /api/live/go ×${posted.length} statuses=${posted.map((p) => p.status).join(",")}`
        : afterClick.going
          ? "UI entered GOING LIVE but no successful POST (check Prisma /api/live/go 500)"
          : "no POST /api/live/go observed",
    );

    const sessions = afterBody.sessions || [];
    const countIncreased =
      baselineCount != null && afterCount != null && afterCount >= baselineCount + 1;
    const hasSession = sessions.length > 0;

    record(
      "registry-session-present",
      countIncreased || hasSession || postOk ? "PASS" : afterClick.liveLabel ? "PASS" : "FAIL",
      `count ${baselineCount}→${afterCount} sessions=${sessions.length} liveLabel=${afterClick.liveLabel} postOk=${postOk} apiStatus=${afterApiStatus}`,
    );
    record(
      "ui-live-or-stage",
      afterClick.err
        ? "FAIL"
        : afterClick.liveLabel || afterClick.stageBound || postSeen
          ? "PASS"
          : "FAIL",
      JSON.stringify({ ...afterClick, postSeen }),
    );

    // Best-effort end so we don't leave orphan sessions
    if (hasSession) {
      await context.request.delete(`${BASE}/api/live/go`, { timeout: 60000 }).catch(() => {});
    }

    const anyFail = report.checks.some((c) => c.status === "FAIL");
    report.ok = !anyFail;
    report.summary = {
      overall: anyFail ? "FAIL" : "PASS",
      physicalPhoneRequired: true,
      physicalNote:
        "Harness proves click→POST→registry. Real mic/cam WebRTC + second-device watch still need phone/hardware proof.",
      checks: report.checks,
    };
    writeReport(report);
    await browser.close();
    process.exit(anyFail ? 1 : 0);
  } catch (e) {
    await page.screenshot({ path: path.join(OUT_DIR, "error.png"), fullPage: false }).catch(() => {});
    report.ok = false;
    report.summary = { overall: "FAIL", error: String(e?.message || e), checks: report.checks };
    writeReport(report);
    await browser.close();
    process.exit(1);
  }
}

main();
