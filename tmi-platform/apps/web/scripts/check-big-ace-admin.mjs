#!/usr/bin/env node
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";

const result = {
  checks: {
    pageLoads: false,
    panelsRender: false,
    dispatchTaskWorks: false,
    moderationLogVisible: false,
    approvalChainBlocksUnauthorizedAction: false,
    routeIntegrityZeroUnresolvedRefs: false,
  },
};

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto("http://localhost:3000/admin/big-ace", { waitUntil: "networkidle", timeout: 60000 });
  result.checks.pageLoads = /\/admin\/big-ace/.test(page.url());

  const titleCount = await page.getByTestId("big-ace-title").count();
  const panelCount = await page.locator("text=System Brain Map").count();
  result.checks.panelsRender = titleCount > 0 && panelCount > 0;

  await page.getByTestId("big-ace-dispatch-test-bot").click({ force: true });
  const dispatchStatus = await page.getByTestId("big-ace-dispatch-status").innerText();
  result.checks.dispatchTaskWorks = /allowed|approval|governance|Action/i.test(dispatchStatus);

  await page.getByTestId("big-ace-run-moderation-sim").click({ force: true });
  const moderationLogText = await page.getByTestId("big-ace-moderation-log").innerText();
  result.checks.moderationLogVisible = /scam|payout-abuse|unsafe|impersonation|rule-violation/i.test(moderationLogText);

  await page.getByTestId("big-ace-unauthorized-override").click({ force: true });
  const blockedText = await page.getByTestId("big-ace-dispatch-status").innerText();
  result.checks.approvalChainBlocksUnauthorizedAction = /cannot override|final authority|require/i.test(blockedText);

  const routeIntegrity = spawnSync(process.execPath, ["scripts/check-route-integrity.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const routeOut = `${routeIntegrity.stdout ?? ""}${routeIntegrity.stderr ?? ""}`;
  result.checks.routeIntegrityZeroUnresolvedRefs = routeIntegrity.status === 0 && routeOut.includes("Unresolved refs: 0");

  console.log("=== Big Ace Admin Proof ===");
  console.log(JSON.stringify(result, null, 2));

  const pass = Object.values(result.checks).every(Boolean);
  if (!pass) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
