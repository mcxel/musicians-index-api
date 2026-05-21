#!/usr/bin/env node
import { chromium } from "playwright";

const result = {
  checks: {
    privateFeedBlocked: false,
    publicLiveFeedOpens: false,
    feedAccessLogged: false,
    privacyStateBadgesVisible: false,
  },
};

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto("http://localhost:3000/admin/big-ace", { waitUntil: "networkidle", timeout: 60000 });

  const cardsText = await page.getByTestId("big-ace-feed-cards").innerText();
  result.checks.privacyStateBadgesVisible =
    cardsText.includes("PUBLIC LIVE") &&
    cardsText.includes("MODERATED LIVE") &&
    cardsText.includes("PRIVATE BLOCKED");

  await page.getByTestId("big-ace-open-private-feed").click({ force: true });
  const privateStatus = await page.getByTestId("big-ace-feed-status").innerText();
  result.checks.privateFeedBlocked = /PRIVATE BLOCKED|blocked/i.test(privateStatus);

  await page.getByTestId("big-ace-open-public-feed").click({ force: true });
  const publicStatus = await page.getByTestId("big-ace-feed-status").innerText();
  result.checks.publicLiveFeedOpens = /PUBLIC LIVE|MODERATED LIVE|granted/i.test(publicStatus);

  const feedLog = await page.getByTestId("big-ace-feed-access-log").innerText();
  result.checks.feedAccessLogged = /feedId|allowed|state/i.test(feedLog);

  console.log("=== Live Feed Privacy Proof ===");
  console.log(JSON.stringify(result, null, 2));

  const pass = Object.values(result.checks).every(Boolean);
  if (!pass) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
