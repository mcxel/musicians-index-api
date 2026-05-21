import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const checks = {
  sandboxWalletVisible: false,
  payoutsDisabled: false,
  noRealMoneyLanguage: false,
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${BASE}/admin/performer-maintenance`, { waitUntil: "networkidle", timeout: 20000 });
  const seat = await page.$('[data-testid^="blank-performer-seat-"]');
  if (seat) await seat.click();
  const wallet = await page.$('[data-testid="maintenance-sandbox-wallet"]');
  checks.sandboxWalletVisible = !!wallet;

  const text = wallet ? (await wallet.innerText()).toLowerCase() : "";
  checks.payoutsDisabled = text.includes("payouts=false");
  checks.noRealMoneyLanguage = text.includes("sandbox");
} catch {
  // noop
} finally {
  await browser.close();
}

console.log("\n-- Bot Wallet Separation Check --");
let fail = 0;
for (const [k, v] of Object.entries(checks)) {
  console.log(`  ${v ? "PASS" : "FAIL"} ${k}`);
  if (!v) fail++;
}
if (fail > 0) process.exit(1);
