import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = "C:/Users/Admin/AppData/Local/Temp/tmi-screenshots";
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { slug: "home-1",   url: "http://localhost:3000/home/1" },
  { slug: "home-1-2", url: "http://localhost:3000/home/1-2" },
  { slug: "home-2",   url: "http://localhost:3000/home/2" },
  { slug: "home-3",   url: "http://localhost:3000/home/3" },
  { slug: "home-4",   url: "http://localhost:3000/home/4" },
  { slug: "home-5",   url: "http://localhost:3000/home/5" },
];

const browser = await chromium.launch({ headless: true });

for (const { slug, url } of ROUTES) {
  console.log(`[${slug}] opening ${url}...`);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  const networkFails = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => errors.push(`[PAGEERROR] ${err.message}`));
  page.on("requestfailed", (req) => networkFails.push(`[FAIL] ${req.url()} — ${req.failure()?.errorText}`));

  try {
    await page.goto(url, { timeout: 45000, waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, `${slug}_full.png`), fullPage: true });
    console.log(`[${slug}] screenshot saved`);
  } catch (e) {
    errors.push(`[GOTO ERROR] ${e.message}`);
    console.log(`[${slug}] navigation error: ${e.message}`);
  }

  fs.writeFileSync(path.join(OUT, `${slug}_console.txt`), errors.length ? errors.join("\n") : "CLEAN — no errors or warnings");
  fs.writeFileSync(path.join(OUT, `${slug}_network.txt`), networkFails.length ? networkFails.join("\n") : "CLEAN — no failed requests");

  await ctx.close();
}

await browser.close();
console.log("All captures done. Output:", OUT);
