/**
 * beat-economy-proof.mjs
 * Route smoke test for Beat Economy Layer.
 * Run: node scripts/beat-economy-proof.mjs
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE = "http://localhost:3000";
const ROUTES = ["/beats", "/beats/submit", "/beats/marketplace", "/beats/generator", "/producers/demo"];
const OUT_DIR = "scripts/runtime-proof/beat-economy";

mkdirSync(OUT_DIR, { recursive: true });

const CRASH_KEYWORDS = [
  "all keyframes must be", "cannot animate", "type mismatch", "hydration",
  "render error", "undefined is not", "cannot read properties", "is not a function",
  "unexpected token", "syntaxerror",
];

function slugify(route) {
  return route.replace(/\//g, "_").replace(/^_/, "");
}

async function probeRoute(page, route) {
  const consoleErrors = [];
  const networkErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleErrors.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => consoleErrors.push(`[PAGE ERROR] ${err.message}`));
  page.on("requestfailed", (req) => networkErrors.push(`FAILED: ${req.method()} ${req.url()} — ${req.failure()?.errorText}`));
  page.on("response", (res) => {
    if (res.status() === 404) networkErrors.push(`404: ${res.url().replace(/^https?:\/\/[^/]+/, "")}`);
  });

  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 40000 });
  await page.waitForTimeout(2500);

  const slug = slugify(route);
  const screenshotPath = join(OUT_DIR, `${slug}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const crashes = consoleErrors.filter((m) => CRASH_KEYWORDS.some((kw) => m.toLowerCase().includes(kw)));

  const report = {
    route,
    timestamp: new Date().toISOString(),
    screenshotPath,
    consoleErrorCount: consoleErrors.length,
    networkErrorCount: networkErrors.length,
    crashDetected: crashes.length > 0,
    crashes,
    consoleErrors,
    networkErrors,
  };

  writeFileSync(join(OUT_DIR, `${slug}.json`), JSON.stringify(report, null, 2));
  return report;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];

  for (const route of ROUTES) {
    process.stdout.write(`Probing ${route} ... `);
    const page = await context.newPage();
    try {
      const report = await probeRoute(page, route);
      const status = report.crashDetected ? "CRASH" : report.consoleErrorCount > 0 ? "WARN" : "PASS";
      console.log(status);
      results.push({ route, status, report });
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      results.push({ route, status: "ERROR", error: e.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log("\n══════════════════════════════════════");
  console.log("  BEAT ECONOMY PROOF — SUMMARY");
  console.log("══════════════════════════════════════");
  for (const { route, status, report } of results) {
    const icon = status === "PASS" ? "✓" : status === "WARN" ? "⚠" : "✗";
    console.log(`${icon} ${route.padEnd(24)} ${status}`);
    if (report?.crashes?.length) report.crashes.slice(0, 2).forEach((e) => console.log(`  └─ ${e}`));
    if (report?.consoleErrors?.length) report.consoleErrors.slice(0, 2).forEach((e) => console.log(`  └─ ${e}`));
    if (report?.networkErrors?.length) report.networkErrors.slice(0, 2).forEach((e) => console.log(`  └─ NET: ${e}`));
  }

  const crashes = results.filter((r) => r.status === "CRASH" || r.status === "ERROR");
  const warnings = results.filter((r) => r.status === "WARN");
  console.log(`\nCrashes: ${crashes.length} | Warnings: ${warnings.length} | Screenshots: ${OUT_DIR}/`);
  console.log("══════════════════════════════════════\n");
})();
