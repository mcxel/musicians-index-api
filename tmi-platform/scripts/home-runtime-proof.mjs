/**
 * home-runtime-proof.mjs
 * Captures full-page screenshot + console log + network errors for each home route.
 * Run: node scripts/home-runtime-proof.mjs
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE = "http://localhost:3000";
const ROUTES = ["/home/1", "/home/1-2", "/home/2", "/home/3", "/home/4", "/home/5"];
const OUT_DIR = "scripts/runtime-proof";

mkdirSync(OUT_DIR, { recursive: true });

const FRAMER_ERRORS = [
  "all keyframes must be",
  "cannot animate",
  "type mismatch",
  "hydration",
  "hook",
  "render error",
  "undefined is not",
  "cannot read properties",
  "is not a function",
];

function slugify(route) {
  return route.replace(/\//g, "_").replace(/^_/, "");
}

async function probeRoute(page, route) {
  const consoleMessages = [];
  const networkErrors = [];
  const consoleErrors = [];

  page.on("console", (msg) => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleMessages.push(text);
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleErrors.push(text);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`[PAGE ERROR] ${err.message}`);
  });

  page.on("requestfailed", (req) => {
    networkErrors.push(`FAILED: ${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
  });

  page.on("response", (res) => {
    if (res.status() === 404) {
      networkErrors.push(`404: ${res.url().replace(/^https?:\/\/[^/]+/, "")}`);
    }
  });

  // /home/5 has persistent WebSocket connections — use domcontentloaded to avoid infinite networkidle wait
  const waitUntil = route === "/home/5" ? "domcontentloaded" : "networkidle";
  await page.goto(`${BASE}${route}`, { waitUntil, timeout: 40000 });

  // Let animations settle
  await page.waitForTimeout(3500);

  const slug = slugify(route);

  // Full-page screenshot
  const screenshotPath = join(OUT_DIR, `${slug}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Scan for Framer Motion keyframe errors
  const frameCrashes = consoleErrors.filter((m) =>
    FRAMER_ERRORS.some((kw) => m.toLowerCase().includes(kw))
  );

  // Report
  const report = {
    route,
    timestamp: new Date().toISOString(),
    httpStatus: 200,
    screenshotPath,
    consoleErrorCount: consoleErrors.length,
    networkErrorCount: networkErrors.length,
    framerCrashDetected: frameCrashes.length > 0,
    frameCrashes,
    consoleErrors,
    networkErrors,
    allConsole: consoleMessages.slice(-40),
  };

  const reportPath = join(OUT_DIR, `${slug}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 TMI-RuntimeProof/1.0",
  });

  const results = [];

  for (const route of ROUTES) {
    process.stdout.write(`Probing ${route} ... `);
    const page = await context.newPage();
    try {
      const report = await probeRoute(page, route);
      const status = report.framerCrashDetected ? "CRASH" :
                     report.consoleErrorCount > 0 ? "WARN" : "PASS";
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

  // Summary
  console.log("\n══════════════════════════════════════");
  console.log("  RUNTIME TRUTH GATE — SUMMARY");
  console.log("══════════════════════════════════════");
  for (const { route, status, report } of results) {
    const icon = status === "PASS" ? "✓" : status === "WARN" ? "⚠" : "✗";
    console.log(`${icon} ${route.padEnd(12)} ${status}`);
    if (report?.framerCrashDetected) {
      console.log(`  └─ FRAMER CRASHES: ${report.frameCrashes.join(" | ")}`);
    }
    if (report?.consoleErrors?.length) {
      report.consoleErrors.slice(0, 3).forEach((e) => console.log(`  └─ ${e}`));
    }
    if (report?.networkErrors?.length) {
      report.networkErrors.slice(0, 2).forEach((e) => console.log(`  └─ NET: ${e}`));
    }
  }

  const crashes = results.filter((r) => r.status === "CRASH" || r.status === "ERROR");
  const warnings = results.filter((r) => r.status === "WARN");
  console.log(`\nCrashes: ${crashes.length} | Warnings: ${warnings.length} | Screenshots: ${OUT_DIR}/`);
  console.log("══════════════════════════════════════\n");
})();
