import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const report = {
  coverToHome1: false,
  nextToHome2: false,
  keyToHome3: false,
  refreshKeepsHome3: false,
  dragToHome4: false,
  directHome1RestoresSavedPage: false,
  savedPageBeforeDirectHome1: null,
  savedPageAfterDirectHome1: null,
  finalUrl: null,
};

function urlEndsWith(path) {
  return page.url().endsWith(path);
}

try {
  await page.goto("http://localhost:3001/home/cover", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.click('button:has-text("Enter Magazine")');
  await page.waitForURL("**/home/1", { timeout: 8000 });
  report.coverToHome1 = urlEndsWith("/home/1");

  await page.click('button:has-text("Next")');
  await page.waitForURL("**/home/2", { timeout: 8000 });
  report.nextToHome2 = urlEndsWith("/home/2");
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  });
  await page.waitForURL("**/home/3", { timeout: 8000 });
  report.keyToHome3 = urlEndsWith("/home/3");
  await page.waitForTimeout(500);

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(".tmi-ready", { timeout: 5000 });
  report.refreshKeepsHome3 = urlEndsWith("/home/3");
  await page.waitForTimeout(500);

  const box = await page.locator(".mag-flip-page").boundingBox();
  if (!box) {
    throw new Error("mag-flip-page bounding box unavailable");
  }
  const startX = box.x + box.width * 0.72;
  const endX = box.x + box.width * 0.26;
  const y = box.y + box.height * 0.5;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 12 });
  await page.mouse.up();
  await page.waitForURL("**/home/4", { timeout: 8000 });
  report.dragToHome4 = urlEndsWith("/home/4");
  report.savedPageBeforeDirectHome1 = await page.evaluate(() => window.sessionStorage.getItem("tmi-magazine-page"));

  await page.goto("http://localhost:3001/home/1", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(".tmi-ready", { timeout: 5000 });
  try {
    await page.waitForURL("**/home/4", { timeout: 6000 });
  } catch {
    await page.waitForTimeout(2500);
  }
  report.savedPageAfterDirectHome1 = await page.evaluate(() => window.sessionStorage.getItem("tmi-magazine-page"));
  report.directHome1RestoresSavedPage = urlEndsWith("/home/4");

  report.finalUrl = page.url();
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.finalUrl = page.url();
  console.log(JSON.stringify({ ...report, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
