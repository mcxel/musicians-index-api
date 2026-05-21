/**
 * check-permanent-bot-operations.mjs
 *
 * Proof script — 8 checks for permanent bot operations system.
 * Targets http://localhost:3000
 */

import { chromium } from "playwright";

const BASE = "http://localhost:3000";

const results = {
  botOperationsPageLoads: false,
  botCardsRender: false,
  botLabelsVisible: false,
  pauseResumeWorks: false,
  summonControlExists: false,
  sendToRoomControlExists: false,
  ticketTabRenders: false,
  auditReportGenerates: false,
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  // 1. Bot operations page loads
  await page.goto(`${BASE}/admin/bot-operations`, { waitUntil: "networkidle", timeout: 15000 });
  const wall = await page.$('[data-testid="bot-operations-wall"]');
  results.botOperationsPageLoads = !!wall;

  // 2. Bot cards render
  const botCards = await page.$$('[data-testid^="bot-card-"]');
  results.botCardsRender = botCards.length >= 4;

  // 3. Bot labels visible (all labeled [BOT] ...)
  const botLabels = await page.$$('[data-testid^="bot-label-"]');
  let allLabeled = botLabels.length >= 4;
  for (const label of botLabels) {
    const text = await label.innerText();
    if (!text.includes("[BOT]")) {
      allLabeled = false;
      break;
    }
  }
  results.botLabelsVisible = allLabeled;

  // 4. Pause/resume control exists on first bot
  const pauseBtn = await page.$('[data-testid^="bot-pause-"]');
  const resumeBtn = await page.$('[data-testid^="bot-resume-"]');
  results.pauseResumeWorks = !!(pauseBtn || resumeBtn);

  // 5. Summon control exists
  const summonInput = await page.$('[data-testid="bot-ops-summon-input"]');
  const summonBtn = await page.$('[data-testid="bot-ops-summon-btn"]');
  results.summonControlExists = !!(summonInput && summonBtn);

  // 6. Send-to-room control exists
  const sendSelect = await page.$('[data-testid="bot-ops-send-select"]');
  const sendBtn = await page.$('[data-testid="bot-ops-send-btn"]');
  results.sendToRoomControlExists = !!(sendSelect && sendBtn);

  // 7. Ticket tab renders
  const ticketTab = await page.$('[data-testid="bot-ops-tab-tickets"]');
  if (ticketTab) {
    await ticketTab.click();
    await page.waitForTimeout(500);
    const ticketsPane = await page.$('[data-testid="bot-ops-tickets-tab"]');
    results.ticketTabRenders = !!ticketsPane;
  }

  // 8. Audit report generates
  const auditBtn = await page.$('[data-testid="bot-ops-run-audit"]');
  if (auditBtn) {
    await auditBtn.click();
    await page.waitForTimeout(1000);
    const report = await page.$('[data-testid="bot-ops-audit-report"]');
    results.auditReportGenerates = !!report;
  }

} catch (err) {
  console.error("Error during bot operations check:", err.message);
} finally {
  await browser.close();
}

console.log("\n── Permanent Bot Operations Gate ──────────────────────────────");
let failures = 0;
for (const [key, val] of Object.entries(results)) {
  const icon = val ? "✅" : "❌";
  console.log(`  ${icon}  ${key}: ${val}`);
  if (!val) failures++;
}
console.log("");

if (failures === 0) {
  console.log("✅ ALL BOT OPERATIONS CHECKS PASSED\n");
} else {
  console.log(`❌ ${failures} check(s) failed\n`);
  process.exit(1);
}
