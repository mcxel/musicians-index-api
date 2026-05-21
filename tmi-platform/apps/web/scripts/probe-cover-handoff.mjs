import path from "node:path";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const outDir = path.resolve(process.cwd(), ".tmp", "cover-probe");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const timeline = [];
const mark = (label) => timeline.push({ label, ms: Date.now() });

try {
  await page.goto("http://localhost:3001/home/cover", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector('button:has-text("Enter Magazine")', { timeout: 10000 });

  await page.screenshot({ path: path.join(outDir, "01_cover_before.png"), fullPage: true });

  mark("click_start");
  await page.click('button:has-text("Enter Magazine")');

  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(outDir, "02_after_120ms.png"), fullPage: true });

  await page.waitForTimeout(140);
  await page.screenshot({ path: path.join(outDir, "03_after_260ms.png"), fullPage: true });

  let routeChangedAt = null;
  try {
    await page.waitForURL("**/home/1", { timeout: 2000 });
    routeChangedAt = Date.now();
  } catch {
    routeChangedAt = null;
  }

  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, "04_after_460ms.png"), fullPage: true });

  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "05_after_760ms.png"), fullPage: true });

  const clickStart = timeline.find((t) => t.label === "click_start")?.ms ?? Date.now();
  const url = page.url();

  const report = {
    finalUrl: url,
    routeChangedMs: routeChangedAt ? routeChangedAt - clickStart : null,
    screenshots: [
      "01_cover_before.png",
      "02_after_120ms.png",
      "03_after_260ms.png",
      "04_after_460ms.png",
      "05_after_760ms.png",
    ],
    outDir,
  };

  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
