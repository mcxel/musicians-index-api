import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const result = {};

await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle", timeout: 20000 });

const adminState = await page.evaluate(() => {
  const text = document.body.innerText;
  const links = Array.from(document.querySelectorAll("a")).map((a) => ({
    text: (a.textContent || "").trim(),
    href: a.getAttribute("href") || "",
    rect: a.getBoundingClientRect(),
  }));

  const back = links.find((l) => l.text.includes("Back"));
  const cards = links.filter(
    (l) =>
      l.text.includes("Cypher Arena") ||
      l.text.includes("Dirty Dozens") ||
      l.text.includes("Leaderboard Core") ||
      l.text.includes("Homepage 1 Rotation") ||
      l.text.includes("Daily Lobby") ||
      l.text.includes("Headline Article")
  );

  const userMatches = [...text.matchAll(/users:\s*(\d+)/gi)].map((m) => Number(m[1]));

  return {
    hasOverseer: text.includes("OVERSEER DECK"),
    hasChain: text.includes("CHAIN COMMAND"),
    hasFeedExplorer: text.includes("LIVE FEED EXPLORER"),
    hasPhase: text.includes("phase:"),
    hasGenre: text.includes("active genre:"),
    hasFeatured: text.includes("featuredId:"),
    hasTimestamp: text.includes("timestamp:"),
    backVisible: !!back && back.rect.width > 0 && back.rect.height > 0,
    backInViewport: !!back && back.rect.top >= 0 && back.rect.top < window.innerHeight,
    liveCardCount: cards.length,
    users: userMatches.slice(0, 10),
    hasDisconnectedFallback: text.includes("Feed Disconnected") || text.includes("FALLBACK"),
  };
});

await page.waitForTimeout(3600);

const adminAfterTick = await page.evaluate(() => {
  const text = document.body.innerText;
  const userMatches = [...text.matchAll(/users:\s*(\d+)/gi)].map((m) => Number(m[1]));
  return { users: userMatches.slice(0, 10) };
});

result.admin = {
  ...adminState,
  usersChanged: JSON.stringify(adminState.users) !== JSON.stringify(adminAfterTick.users),
  usersAfter: adminAfterTick.users,
};

await page.goto("http://localhost:3000/admin/leaderboards", { waitUntil: "networkidle", timeout: 20000 });
const lb = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll("a")).map((a) => (a.textContent || "").trim());
  return {
    url: location.href,
    hasBackToAdmin: links.some((t) => t.includes("Admin Hub")),
  };
});
result.adminLeaderboards = lb;

await page.goto("http://localhost:3000/home/1", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(900);
const h1Link = await page.locator('a[href^="/artists/"]').first().getAttribute("href").catch(() => null);
if (h1Link) {
  await page.locator('a[href^="/artists/"]').first().click();
  await page.waitForURL(/\/artists\//, { timeout: 10000 });
}
result.home1Artist = { href: h1Link, pass: page.url().includes("/artists/") };

await page.goto("http://localhost:3000/home/5", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(900);
const h5Link = await page.locator('a[href^="/artists/"]').first().getAttribute("href").catch(() => null);
if (h5Link) {
  await page.locator('a[href^="/artists/"]').first().click();
  await page.waitForURL(/\/artists\//, { timeout: 10000 });
}
result.home5Artist = { href: h5Link, pass: page.url().includes("/artists/") };

console.log(JSON.stringify(result, null, 2));
await browser.close();
