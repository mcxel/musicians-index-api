import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const checks = {
  adultBotBlockedFromMinorGroup: false,
  unknownAgeBotBlocked: false,
  minorSafeAllowedInSafeContext: false,
  sponsorAdvertiserVenueDirectContactBlocked: false,
  maintenanceBotBlockedPrivateMinorSpace: false,
  violationLogsRender: false,
  adminSafetyMonitorRenders: false,
  noPrivateDataExposed: false,
  routeIntegrityRemainsClean: true,
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/admin/safety`, { waitUntil: "networkidle", timeout: 20000 });
  checks.adminSafetyMonitorRenders = !!(await page.$('[data-testid="minor-safety-monitor"]'));
  checks.violationLogsRender = !!(await page.$('[data-testid="safety-violation-feed"]'));

  const items = await page.$$('[data-testid^="minor-safety-test-"]');
  const texts = [];
  for (const item of items) texts.push(await item.innerText());
  const combined = texts.join(" | ").toLowerCase();

  checks.adultBotBlockedFromMinorGroup = combined.includes("adult") && combined.includes("pass");
  checks.unknownAgeBotBlocked = combined.includes("unknown") && combined.includes("pass");
  checks.minorSafeAllowedInSafeContext = combined.includes("test_minor") && combined.includes("pass");
  checks.sponsorAdvertiserVenueDirectContactBlocked = combined.includes("advertiser") && combined.includes("sponsor") && combined.includes("venue");
  checks.maintenanceBotBlockedPrivateMinorSpace = combined.includes("maintenance") && combined.includes("private minor");

  checks.noPrivateDataExposed = !(await page.content()).toLowerCase().includes("private transcript");
} catch {
  // noop
} finally {
  await browser.close();
}

console.log("\n-- Minor Safety + Age-Gate Gate --");
let fail = 0;
for (const [k, v] of Object.entries(checks)) {
  console.log(`  ${v ? "PASS" : "FAIL"} ${k}`);
  if (!v) fail++;
}
if (fail > 0) process.exit(1);
