import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

console.log("before", await page.locator("iframe").first().getAttribute("src"), page.url());
console.log("buttons", await page.locator('button[data-clickable="true"]').count());

await page.locator('button[data-clickable="true"]').first().click();
await page.waitForTimeout(1200);

console.log("after", await page.locator("iframe").first().getAttribute("src"), page.url());

await browser.close();
