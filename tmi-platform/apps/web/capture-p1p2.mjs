import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = "C:/Users/Admin/AppData/Local/Temp/tmi-screenshots";
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { slug: "home-1-v2",   url: "http://localhost:3000/home/1" },
  { slug: "home-1-2-v2", url: "http://localhost:3000/home/1-2" },
];

const browser = await chromium.launch({ headless: true });

for (const { slug, url } of ROUTES) {
  console.log(`[${slug}] opening ${url}...`);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", err => errors.push(err.message));
  try {
    await page.goto(url, { timeout: 45000, waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, `${slug}_full.png`), fullPage: true });
    console.log(`[${slug}] saved. errors: ${errors.length}`);
    if (errors.length) console.log(errors.join("\n"));
  } catch (e) { console.log(`[${slug}] error: ${e.message}`); }
  await ctx.close();
}

await browser.close();
