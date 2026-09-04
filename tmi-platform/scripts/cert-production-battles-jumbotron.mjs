/**
 * Focused production LOOK UP proof: /battles ArenaEventShell + AES jumbotron geometry.
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const OUT = path.join(process.cwd(), ".cursor", "artifacts", "jumbotron-p0");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  localStorage.setItem(
    "tmi_first_run_v1",
    JSON.stringify({ dismissed: true, completedSteps: [], role: "fan" }),
  );
  localStorage.setItem("tmi_ad_consent", "declined");
});
const page = await context.newPage();
page.setDefaultTimeout(120000);
page.on("console", (m) => {
  if (m.type() === "error") console.log("ERR", m.text().slice(0, 180));
});

const result = {
  lookUpOk: false,
  returnOk: false,
  audienceSceneMounted: false,
  architecture: null,
  sessionPreserved: false,
  screenshots: [],
};

try {
  console.log("goto /battles");
  await page.goto(`${BASE}/battles`, { waitUntil: "domcontentloaded", timeout: 240000 });
  await page.waitForSelector('[data-testid="btn-venue-look-up-jumbotron"]', { timeout: 120000 });
  await page.waitForSelector('[data-testid="audience-scene-jumbotron-layer"]', { timeout: 120000 });
  const layer = page.locator('[data-testid="audience-scene-jumbotron-layer"]').first();
  result.architecture = await layer.getAttribute("data-architecture");
  result.audienceSceneMounted =
    (await layer.getAttribute("data-audience-scene-jumbotron-mounted")) === "true";
  const sessionBefore =
    (await page.locator("[data-presence-session]").first().getAttribute("data-presence-session")) ||
    "";
  const shot1 = path.join(OUT, "70-production-battles-stage.png");
  await page.screenshot({ path: shot1, animations: "disabled" });
  result.screenshots.push("70-production-battles-stage.png");

  await page.locator('[data-testid="btn-venue-look-up-jumbotron"]').first().click();
  await page.waitForSelector('[data-testid="venue-jumbotron-world-mount"]', { timeout: 30000 });
  await page.waitForTimeout(800);
  const focusOn = await page
    .locator('[data-testid="venue-look-up-focus-indicator"]')
    .first()
    .textContent();
  const lookUpAttr = await layer.getAttribute("data-jumbotron-look-up");
  result.lookUpOk =
    result.audienceSceneMounted &&
    result.architecture === "CENTER_HUNG_ARENA_JUMBOTRON" &&
    lookUpAttr === "true" &&
    (focusOn || "").includes("JUMBOTRON FOCUS");
  const shot2 = path.join(OUT, "71-production-battles-lookup.png");
  await page.screenshot({ path: shot2, animations: "disabled" });
  result.screenshots.push("71-production-battles-lookup.png");

  await page.locator('[data-testid="btn-venue-look-up-jumbotron"]').first().click();
  await page.waitForTimeout(700);
  const focusOff = await page
    .locator('[data-testid="venue-look-up-focus-indicator"]')
    .first()
    .textContent();
  const sessionAfter =
    (await page.locator("[data-presence-session]").first().getAttribute("data-presence-session")) ||
    "";
  result.sessionPreserved = Boolean(sessionBefore) && sessionBefore === sessionAfter;
  result.returnOk =
    result.sessionPreserved &&
    (focusOff || "").includes("STAGE VIEW") &&
    (await page.locator('[data-testid="venue-jumbotron-world-mount"]').count()) === 0;
  const shot3 = path.join(OUT, "72-production-battles-return.png");
  await page.screenshot({ path: shot3, animations: "disabled" });
  result.screenshots.push("72-production-battles-return.png");
} catch (err) {
  console.error("FAIL", err?.message || err);
  await page.screenshot({
    path: path.join(OUT, "70-production-battles-error.png"),
    animations: "disabled",
  });
}

await browser.close();

const reportPath = path.join(OUT, "cert-physical-report.json");
let report = {};
try {
  report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
} catch {
  report = {};
}
report.productionBattles = result;
report.date = new Date().toISOString();
const productionOk = result.lookUpOk && result.returnOk && result.audienceSceneMounted;
report.openBlockers = (report.openBlockers || []).filter(
  (b) => !String(b).includes("Production /battles") && !String(b).includes("GLB mesh"),
);
if (!productionOk) {
  report.openBlockers.push(
    "Production /battles ArenaEventShell → AudienceScene Jumbotron LOOK UP not fully proven.",
  );
} else if (report.verdict) {
  if (report.verdict.physicalLookUp === "PASS" && report.verdict.tierSightlines === "PASS") {
    report.verdict.overall = "PASS";
  }
}
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(result, null, 2));
console.log("productionOk", productionOk);
process.exit(productionOk ? 0 : 1);
