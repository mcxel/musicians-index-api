#!/usr/bin/env node
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";

const result = {
  checks: {
    allocationExists: false,
    routesToBusinessCoffers: false,
    approvedAchievementTasksRender: false,
    unauthorizedSpendBlocked: false,
    ledgerLogsAction: false,
    overseerCanViewEntries: false,
    routeIntegrityZeroUnresolvedRefs: false,
  },
};

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto("http://localhost:3000/admin/big-ace", { waitUntil: "networkidle", timeout: 60000 });

  const allocationText = await page.getByTestId("big-ace-allocation").innerText();
  result.checks.allocationExists = /10%|Allocation policy/i.test(allocationText);

  await page.getByTestId("big-ace-init-allocation").click({ force: true });
  const ledgerTextAfterInit = await page.getByTestId("big-ace-ledger-entries").innerText();
  result.checks.routesToBusinessCoffers = /berntoutglobal-coffers|allocation|BigAceReinvestmentHold/i.test(ledgerTextAfterInit);

  const achievementsText = await page.getByTestId("big-ace-achievement-progress").innerText();
  result.checks.approvedAchievementTasksRender = /Improve system stability|Dispatch bots to test and report|Track route, feed, and control health/i.test(achievementsText);

  await page.getByTestId("big-ace-unauthorized-spend").click({ force: true });
  const actionLogText = await page.getByTestId("big-ace-finance-action-log").innerText();
  result.checks.unauthorizedSpendBlocked = /blocked|not approved|bypass|require/i.test(actionLogText);

  const ledgerText = await page.getByTestId("big-ace-ledger-entries").innerText();
  result.checks.ledgerLogsAction = /blocked|spend|allocation|actor/i.test(ledgerText);

  const policyStatus = await page.getByTestId("big-ace-policy-status").innerText();
  result.checks.overseerCanViewEntries = /visible to Marcel\/root|auditable/i.test(policyStatus);

  const routeIntegrity = spawnSync(process.execPath, ["scripts/check-route-integrity.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const routeOut = `${routeIntegrity.stdout ?? ""}${routeIntegrity.stderr ?? ""}`;
  result.checks.routeIntegrityZeroUnresolvedRefs = routeIntegrity.status === 0 && routeOut.includes("Unresolved refs: 0");

  console.log("=== Big Ace Reinvestment Proof ===");
  console.log(JSON.stringify(result, null, 2));

  const pass = Object.values(result.checks).every(Boolean);
  if (!pass) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
