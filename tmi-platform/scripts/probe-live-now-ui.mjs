import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000";
const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
  args: ["--no-sandbox"],
});
const ctx = await browser.newContext();
const page = await ctx.newPage();
const api = await ctx.request.get(`${BASE}/api/live/go`);
const apiJson = await api.json();
await page.goto(`${BASE}/home/3`, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForTimeout(10000);
const probe = await page.evaluate(async () => {
  let fetchResult = null;
  let fetchErr = null;
  try {
    const res = await fetch("/api/live/go", { cache: "no-store", credentials: "include" });
    fetchResult = { status: res.status, body: await res.json() };
  } catch (e) {
    fetchErr = String(e);
  }
  const els = Array.from(document.querySelectorAll("[data-testid='live-now-active-rooms']")).map((el) => ({
    text: (el.textContent || "").trim(),
    attr: el.getAttribute("data-active-room-count"),
  }));
  return { fetchResult, fetchErr, els, href: location.href };
});
console.log(JSON.stringify({ apiDirect: { count: apiJson.count, rooms: (apiJson.sessions || []).map((s) => s.roomId) }, probe }, null, 2));
await browser.close();
