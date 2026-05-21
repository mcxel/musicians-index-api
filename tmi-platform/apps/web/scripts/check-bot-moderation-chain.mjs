#!/usr/bin/env node
import { chromium } from "playwright";

const result = {
  checks: {
    moderationEventLogged: false,
    escalatesToChain: false,
    legalFinancialGuardVisible: false,
  },
};

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto("http://localhost:3000/admin/big-ace", { waitUntil: "networkidle", timeout: 60000 });
  await page.getByTestId("big-ace-run-moderation-sim").click({ force: true });

  const moderationLog = await page.getByTestId("big-ace-moderation-log").innerText();
  result.checks.moderationEventLogged = /eventType|severity|requiresLegalReview|requiresFinancialApproval/i.test(moderationLog);
  result.checks.escalatesToChain = /marcel-root|big-ace|mc/i.test(moderationLog);

  await page.getByTestId("big-ace-unauthorized-override").click({ force: true });
  const status = await page.getByTestId("big-ace-dispatch-status").innerText();
  result.checks.legalFinancialGuardVisible = /cannot override|final authority|approval/i.test(status);

  console.log("=== Bot Moderation Chain Proof ===");
  console.log(JSON.stringify(result, null, 2));

  const pass = Object.values(result.checks).every(Boolean);
  if (!pass) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
