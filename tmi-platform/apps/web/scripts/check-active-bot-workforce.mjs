import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const checks = {
  botOperationsWallRenders: false,
  maintenanceMonitorRenders: false,
  blankSeatBotsVisible: false,
  botLabelsVisible: false,
  botActivityVisible: false,
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/admin/bot-operations`, { waitUntil: "networkidle", timeout: 20000 });
  checks.botOperationsWallRenders = !!(await page.$('[data-testid="bot-operations-wall"]'));
  checks.botLabelsVisible = (await page.$$('[data-testid^="bot-label-"]')).length > 0;

  await page.goto(`${BASE}/admin/performer-maintenance`, { waitUntil: "networkidle", timeout: 20000 });
  checks.maintenanceMonitorRenders = !!(await page.$('[data-testid="performer-maintenance-bot-monitor"]'));
  checks.blankSeatBotsVisible = (await page.$$('[data-testid^="blank-performer-seat-"]')).length > 0;
  checks.botActivityVisible = !!(await page.$('[data-testid="maintenance-error-log"]'));
} catch {
  // noop
} finally {
  await browser.close();
}

console.log("\n-- Active Bot Workforce Check --");
let fail = 0;
for (const [k, v] of Object.entries(checks)) {
  console.log(`  ${v ? "PASS" : "FAIL"} ${k}`);
  if (!v) fail++;
}
if (fail > 0) process.exit(1);
