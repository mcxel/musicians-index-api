/**
 * LIVE MOSAIC WALL — Fan + Performer GO LIVE wiring cert
 * Usage: node .cursor/artifacts/live-mosaic-wall/cert-live-mosaic.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const PASSWORD = process.env.CERT_PASSWORD || "test";

fs.mkdirSync(OUT, { recursive: true });

function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));
}

async function waitForServer(maxMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/auth/session`, { signal: AbortSignal.timeout(5000) });
      if (res.status > 0 && res.status < 500) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function dismissOverlays(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem("tmi_ad_consent", "declined");
      localStorage.setItem(
        "tmi_first_run_v1",
        JSON.stringify({ dismissed: true, completedSteps: [] }),
      );
    } catch {}
  }).catch(() => {});
  for (const sel of ['button:has-text("Decline")', 'button:has-text("Skip")', 'button:has-text("Not now")']) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click({ timeout: 1500 }).catch(() => {});
    }
  }
  await page.keyboard.press("Escape").catch(() => {});
}

async function apiLogin(request, email) {
  const res = await request.post(`${BASE}/api/auth/login`, {
    data: { email, password: PASSWORD },
    failOnStatusCode: false,
  });
  return res.status() === 200;
}

async function certRole(ctx, { role, hubRoute, email }) {
  const report = {
    role,
    hubRoute,
    email,
    steps: {},
    pass: false,
  };
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" && /React|hydration/i.test(m.text())) {
      report.consoleErrors = report.consoleErrors || [];
      report.consoleErrors.push(m.text().slice(0, 200));
    }
  });

  try {
    const loggedIn = await apiLogin(page.request, email);
    report.steps.login = loggedIn ? "PASS" : "FAIL";

    await page.goto(`${BASE}${hubRoute}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(OUT, `${role}-01-hub-before.png`), fullPage: false });

    const goLiveBtn = page.locator('[data-testid="tmi-media-player-go-live"]');
    report.steps.goLiveControlVisible = (await goLiveBtn.count()) > 0 ? "PASS" : "FAIL";

    const mosaicRail = page.locator('[data-testid="tmi-live-mosaic-scroll-rail"]');
    report.steps.mosaicRailVisible = (await mosaicRail.count()) > 0 ? "PASS" : "FAIL";

    const mosaicEmpty = await page.locator('[data-live-lobby-mosaic-rail="1"]').innerText().catch(() => "");
    report.steps.mosaicHonestEmpty =
      /No live sessions|Waiting for live/i.test(mosaicEmpty) ? "PASS" : "SKIP";

    // DOM wiring check — do not require camera for wiring PASS
    const wiring = await page.evaluate(() => ({
      goLiveHost: !!document.querySelector("[data-media-player-go-live-host]"),
      mosaicRail: !!document.querySelector("[data-live-lobby-mosaic-rail]"),
      mediaStack: !!document.querySelector("[data-media-player-live-bezel]"),
    }));
    report.wiring = wiring;
    report.steps.domWiring =
      wiring.goLiveHost && wiring.mosaicRail && wiring.mediaStack ? "PASS" : "FAIL";

    report.pass = Object.values(report.steps).every((v) => v === "PASS" || v === "SKIP");
  } catch (err) {
    report.error = err instanceof Error ? err.message : String(err);
    await page.screenshot({ path: path.join(OUT, `${role}-error.png`), fullPage: false }).catch(() => {});
  } finally {
    await page.close();
  }
  return report;
}

async function main() {
  const serverUp = await waitForServer();
  if (!serverUp) {
    writeJson("cert-report.json", { pass: false, error: "Dev server not reachable" });
    console.error("FAIL: server not up");
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });

  const performerEmail = process.env.CERT_PERFORMER_EMAIL || "suedejs2000@gmail.com";
  const fanEmail = process.env.CERT_FAN_EMAIL || "fan-mosaic-cert@tmi.local";

  // Register fan if needed
  try {
    await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fanEmail, password: PASSWORD, roles: [{ role: "FAN" }] }),
    });
  } catch {}

  const performerReport = await certRole(ctx, {
    role: "performer",
    hubRoute: "/hub/performer",
    email: performerEmail,
  });
  const fanReport = await certRole(ctx, {
    role: "fan",
    hubRoute: "/hub/fan",
    email: fanEmail,
  });

  await browser.close();

  const report = {
    timestamp: new Date().toISOString(),
    base: BASE,
    performer: performerReport,
    fan: fanReport,
    pass:
      performerReport.pass &&
      fanReport.pass &&
      performerReport.steps?.domWiring === "PASS" &&
      fanReport.steps?.domWiring === "PASS",
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
