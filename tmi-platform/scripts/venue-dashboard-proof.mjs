/**
 * venue-dashboard-proof.mjs
 * Route smoke test for Venue + Dashboard + Dance Party system.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE = "http://localhost:3000";
const ROUTES = [
  "/live/lobby",
  "/rooms/live/demo",
  "/venues/demo/auditorium",
  "/fan/dashboard",
  "/artists/demo/live",
  "/dance-party",
  "/dance-party/live",
  "/dance-party/submit",
];
const OUT_DIR = "scripts/runtime-proof/venue-dashboard";
mkdirSync(OUT_DIR, { recursive: true });

const CRASH_KW = ["all keyframes must be","cannot animate","hydration","render error","undefined is not","cannot read properties","is not a function","syntaxerror"];

function slugify(route) { return route.replace(/\//g, "_").replace(/^_/, ""); }

async function probe(page, route) {
  const errors = []; const net404 = [];
  page.on("console", msg => { if (msg.type() === "error") errors.push(`[ERR] ${msg.text()}`); });
  page.on("pageerror", err => errors.push(`[PAGE] ${err.message}`));
  page.on("requestfailed", req => net404.push(`FAIL: ${req.url()}`));
  page.on("response", res => { if (res.status() === 404) net404.push(`404: ${res.url().replace(/^https?:\/\/[^/]+/, "")}`); });

  const waitUntil = ["/live/lobby", "/rooms/live/demo"].includes(route) ? "domcontentloaded" : "networkidle";
  await page.goto(`${BASE}${route}`, { waitUntil, timeout: 40000 });
  await page.waitForTimeout(2000);
  const ss = join(OUT_DIR, `${slugify(route)}.png`);
  await page.screenshot({ path: ss, fullPage: true });
  const crashes = errors.filter(m => CRASH_KW.some(kw => m.toLowerCase().includes(kw)));
  writeFileSync(join(OUT_DIR, `${slugify(route)}.json`), JSON.stringify({ route, errors, net404, crashes }, null, 2));
  return { errors, net404, crashes };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];

  for (const route of ROUTES) {
    process.stdout.write(`Probing ${route} ... `);
    const page = await ctx.newPage();
    try {
      const r = await probe(page, route);
      const status = r.crashes.length > 0 ? "CRASH" : r.errors.length > 0 ? "WARN" : "PASS";
      console.log(status);
      results.push({ route, status, ...r });
    } catch(e) {
      console.log(`ERROR: ${e.message}`);
      results.push({ route, status: "ERROR", error: e.message });
    } finally { await page.close(); }
  }

  await browser.close();
  console.log("\n══════════════════════════════════════");
  console.log("  VENUE + DASHBOARD PROOF — SUMMARY");
  console.log("══════════════════════════════════════");
  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : r.status === "WARN" ? "⚠" : "✗";
    console.log(`${icon} ${r.route.padEnd(28)} ${r.status}`);
    if (r.crashes?.length) r.crashes.slice(0,2).forEach(e => console.log(`  └─ ${e}`));
    if (r.errors?.length) r.errors.slice(0,2).forEach(e => console.log(`  └─ ${e}`));
    if (r.net404?.length) r.net404.slice(0,2).forEach(e => console.log(`  └─ NET: ${e}`));
  }
  const crashes = results.filter(r => r.status === "CRASH" || r.status === "ERROR");
  const warns = results.filter(r => r.status === "WARN");
  console.log(`\nCrashes: ${crashes.length} | Warnings: ${warns.length} | Screenshots: ${OUT_DIR}/`);
  console.log("══════════════════════════════════════\n");
})();
