import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const result = {
  checks: {},
  clickPasses: [],
};

const readEventCount = async () => {
  return page.evaluate(() => {
    const match = document.body.innerText.match(/event bus logs:\s*(\d+)/i);
    return match ? Number(match[1]) : null;
  });
};

await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle", timeout: 30000 });

result.checks.adminLoads = await page.evaluate(() => document.body.innerText.includes("ADMINISTRATION HUB"));
result.checks.chainVisible = await page.evaluate(() => document.body.innerText.includes("CHAIN COMMAND"));

const clickTargets = [
  { label: "Chain Command", sectionId: "chain-command", route: "/admin/chain-command" },
  { label: "Security Sentinel Wall", sectionId: "security", route: "/admin/security" },
  { label: "Account Linker", sectionId: "integrations", route: "/admin/integrations" },
  { label: "Money & Billing", sectionId: "billing", route: "/admin/billing" },
  { label: "Unified Inbox", sectionId: "inbox", route: "/admin/inbox" },
  { label: "Live Feed Explorer", sectionId: "live-feed", route: "/admin/live-feed" },
  { label: "Artist Analytics & Revenue", sectionId: "artist-analytics", route: "/admin/artist-analytics" },
  { label: "Magazine Analytics", sectionId: "magazine-analytics", route: "/admin/magazine-analytics" },
  { label: "Bot Roster & Summon", sectionId: "bots", route: "/admin/bots" },
];

for (const target of clickTargets) {
  const beforeCount = await readEventCount();
  const button = page.locator(`button[data-section-id="${target.sectionId}"]`).first();
  const exists = (await button.count()) > 0;

  if (!exists) {
    result.clickPasses.push({ label: target.label, found: false, preview: null, opened: false, historyBack: false, historyForward: false });
    continue;
  }

  await button.click();
  await page.waitForURL(new RegExp(`\/admin\?monitor=${target.sectionId}`), { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(180);
  const afterCount = await readEventCount();

  const iframeSrc = await page.locator('iframe[title^="Admin preview"]').first().getAttribute("src");
  const previewHasParam = typeof iframeSrc === "string" && iframeSrc.includes("preview=1") && iframeSrc.includes(target.route);
  const hubUrl = page.url();
  const querySelected = hubUrl.includes(`monitor=${target.sectionId}`);

  await page.getByRole("button", { name: /open full view/i }).first().click();
  await page.waitForURL(new RegExp(target.route.replaceAll("/", "\\/")), { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(160);

  const openedUrl = page.url();
  const opened = openedUrl.includes(target.route);

  await page.goBack({ waitUntil: "domcontentloaded", timeout: 8000 }).catch(() => null);
  await page.waitForTimeout(150);
  const backUrl = page.url();
  const historyBack = backUrl.includes(`/admin?monitor=${target.sectionId}`);

  await page.goForward({ waitUntil: "domcontentloaded", timeout: 8000 }).catch(() => null);
  await page.waitForTimeout(150);
  const fwdUrl = page.url();
  const historyForward = fwdUrl === openedUrl;

  await page.goBack({ waitUntil: "domcontentloaded", timeout: 8000 }).catch(() => null);
  await page.waitForTimeout(150);

  result.clickPasses.push({
    label: target.label,
    found: true,
    beforeCount,
    afterCount,
    querySelected,
    preview: iframeSrc,
    previewHasParam,
    opened,
    openedUrl,
    historyBack,
    historyForward,
  });
}

result.checks.previewChanges = result.clickPasses.some((item) => item.found && typeof item.preview === "string" && item.preview.includes("/admin/"));
result.checks.queryStateUpdates = result.clickPasses.filter((item) => item.found).every((item) => item.querySelected);
result.checks.fullViewNavigates = result.clickPasses.filter((item) => item.found).every((item) => item.opened);
result.checks.historyWorks = result.clickPasses.filter((item) => item.found).every((item) => item.historyBack && item.historyForward);
result.checks.eventCounterMovesOnClick = result.clickPasses
  .filter((item) => item.found && typeof item.beforeCount === "number" && typeof item.afterCount === "number")
  .some((item) => item.afterCount > item.beforeCount);

await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle", timeout: 30000 });
const eventCount = await readEventCount();
result.checks.eventCounterPresent = typeof eventCount === "number";
result.checks.eventCounterPositive = typeof eventCount === "number" ? eventCount > 0 : false;
result.eventCount = eventCount;

console.log(JSON.stringify(result, null, 2));
await browser.close();
