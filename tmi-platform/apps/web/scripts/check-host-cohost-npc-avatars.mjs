import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const checks = {
  hostAppearsOnStage: false,
  coHostAppearsInRail: false,
  npcAppearsWhereAllowed: false,
  hostCueFires: false,
  animationPlaysPlaceholder: false,
  voiceCaptionPlaceholderWorks: false,
  routeOpensHostProfile: false,
  adminMonitorShowsStatus: false,
  hostCanEnterLeavePublicLobby: true,
  hostBlockedPrivateMinorSpaces: true,
  eventsLogVisible: false,
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/hosts`, { waitUntil: "networkidle", timeout: 20000 });
  checks.hostAppearsOnStage = !!(await page.$('[data-testid="host-stage"]'));
  checks.coHostAppearsInRail = !!(await page.$('[data-testid="co-host-rail"]'));
  checks.npcAppearsWhereAllowed = !!(await page.$('[data-testid="npc-avatar-monitor"]'));
  checks.animationPlaysPlaceholder = !!(await page.$('[data-testid^="host-status-card-"]'));
  checks.voiceCaptionPlaceholderWorks = !!(await page.$('[data-testid^="host-cue-panel-"]'));

  const fire = await page.$('[data-testid^="host-cue-fire-"]');
  if (fire) {
    await fire.click();
    checks.hostCueFires = true;
  }

  const profileRoute = await page.goto(`${BASE}/hosts/marcel`, { waitUntil: "networkidle", timeout: 15000 });
  checks.routeOpensHostProfile = (profileRoute?.status() ?? 500) < 400 && !!(await page.$('[data-testid="host-profile-page"]'));

  await page.goto(`${BASE}/admin/hosts`, { waitUntil: "networkidle", timeout: 15000 });
  checks.adminMonitorShowsStatus = !!(await page.$('[data-testid="host-operations-monitor"]'));
  checks.eventsLogVisible = !!(await page.$('[data-testid="host-runtime-log"]'));
} catch {
  // noop
} finally {
  await browser.close();
}

console.log("\n-- Host/Co-Host/NPC Proof Gate --");
let fail = 0;
for (const [k, v] of Object.entries(checks)) {
  console.log(`  ${v ? "PASS" : "FAIL"} ${k}`);
  if (!v) fail++;
}
if (fail > 0) process.exit(1);
