import { chromium } from "playwright";

const expectedZones = {
  "/home/1": ["hero", "editorial", "ranking"],
  "/home/2": ["genres", "playlists", "discovery"],
  "/home/3": ["liveRooms", "events", "cypher"],
  "/home/4": ["ads", "sponsors", "placements"],
  "/home/5": ["globalRank", "genreRank", "rising"],
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function snapshotState() {
  return page.evaluate(() => {
    const root = document.querySelector("[data-homev2='active']");
    const theme = root?.getAttribute("data-theme") ?? null;
    const slug = root?.getAttribute("data-issue-slug") ?? null;
    const zoneMap = document.querySelector("[data-zone-map]")?.getAttribute("data-zone-map") ?? null;
    const zones = Array.from(document.querySelectorAll("[data-issue-zone]")).map((el) => el.getAttribute("data-issue-zone"));
    return { theme, slug, zoneMap, zones };
  });
}

const report = {
  uniquePageVisuals: false,
  zoneMapSwitching: false,
  contentRegistryWorking: false,
  themeSwitching: false,
  pagerStillStable: false,
  pages: {},
};

try {
  await page.goto("http://localhost:3001/home/cover", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.click('button:has-text("Enter Magazine")');
  await page.waitForURL("**/home/1", { timeout: 10000 });
  await page.waitForSelector(".tmi-ready", { timeout: 5000 });

  report.pages["/home/1"] = await snapshotState();

  await page.click('button:has-text("Next")');
  await page.waitForURL("**/home/2", { timeout: 10000 });
  await page.waitForTimeout(450);
  report.pages["/home/2"] = await snapshotState();

  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  });
  await page.waitForURL("**/home/3", { timeout: 10000 });
  await page.waitForTimeout(450);
  report.pages["/home/3"] = await snapshotState();

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
  await page.waitForURL("**/home/4", { timeout: 10000 });
  await page.waitForTimeout(450);
  report.pages["/home/4"] = await snapshotState();

  await page.click('button:has-text("Next")');
  await page.waitForURL("**/home/5", { timeout: 10000 });
  await page.waitForTimeout(450);
  report.pages["/home/5"] = await snapshotState();

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(".tmi-ready", { timeout: 5000 });
  const refreshOk = page.url().endsWith("/home/5");
  await page.goto("http://localhost:3001/home/1", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(".tmi-ready", { timeout: 5000 });
  await page.waitForURL("**/home/5", { timeout: 8000 });
  const directEntryRestoreOk = page.url().endsWith("/home/5");
  report.pagerStillStable = refreshOk && directEntryRestoreOk;

  const snapshots = Object.values(report.pages);
  const themeSet = new Set(snapshots.map((s) => s.theme));
  const zoneMapSet = new Set(snapshots.map((s) => s.zoneMap));
  const identitySet = new Set(snapshots.map((s) => `${s.theme}|${s.slug}|${(s.zones || []).join(",")}`));

  report.themeSwitching = themeSet.size === 5;
  report.zoneMapSwitching = zoneMapSet.size === 5;
  report.uniquePageVisuals = identitySet.size === 5;

  report.contentRegistryWorking = Object.entries(expectedZones).every(([route, expected]) => {
    const actual = report.pages[route]?.zones ?? [];
    return expected.every((zone) => actual.includes(zone));
  });

  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.log(
    JSON.stringify(
      {
        ...report,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
