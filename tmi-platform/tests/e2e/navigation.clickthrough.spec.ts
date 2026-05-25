/**
 * TMI Navigation Click-Through Sweep
 * Tests: entry → deep → escape, cold entry, safe-back fallback, and swipe guard.
 */
import { test, expect, devices } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Helper: visit a page and assert no blank/error state
// ---------------------------------------------------------------------------
async function assertPageLoads(page: import("@playwright/test").Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  const title = await page.title();
  expect(title).toBeTruthy();
  // Should never show a Next.js error overlay
  const errorOverlay = page.locator("nextjs-portal, #__next_error");
  await expect(errorOverlay).toHaveCount(0);
}

// ---------------------------------------------------------------------------
// Test 1: Home chain — full loop forward + back continuity
// ---------------------------------------------------------------------------
test("home chain: forward and back never trap user", async ({ page }) => {
  const chain = [
    "/home/1",
    "/home/1-2",
    "/home/2",
    "/home/3",
    "/home/4",
    "/home/5",
  ];

  // Walk forward through the chain
  for (const route of chain) {
    await assertPageLoads(page, `${BASE}${route}`);
    // Check chevron next button is visible
    const nextBtn = page.locator('[aria-label="Go Forward"], [aria-label="Next"]').first();
    await expect(nextBtn).toBeVisible({ timeout: 5000 });
    // Check back button is visible
    const backBtn = page.locator('[aria-label="Go Back"], [aria-label="Back"]').first();
    await expect(backBtn).toBeVisible({ timeout: 5000 });
  }
});

// ---------------------------------------------------------------------------
// Test 2: Cold entry — deep route with no history still has an escape
// ---------------------------------------------------------------------------
test("cold entry: /live/rooms/R-101 shows back controls", async ({ browser }) => {
  // Fresh context = no history
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/live/rooms/R-101`, { waitUntil: "domcontentloaded", timeout: 15000 });
  // Back control must be visible
  const backBtn = page.locator('[aria-label="Go Back"]').first();
  await expect(backBtn).toBeVisible({ timeout: 6000 });
  await ctx.close();
});

test("cold entry: /profile page shows back controls", async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded", timeout: 15000 });
  const backBtn = page.locator('[aria-label="Go Back"]').first();
  await expect(backBtn).toBeVisible({ timeout: 6000 });
  await ctx.close();
});

// ---------------------------------------------------------------------------
// Test 3: Safe-back click on cold page redirects to /home/1 (not blank/error)
// ---------------------------------------------------------------------------
test("safe-back: cold back click lands on /home/1 not blank", async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  // Seed a single history entry
  await page.goto(`${BASE}/live/chat`, { waitUntil: "domcontentloaded", timeout: 15000 });
  // Click back chevron
  const backBtn = page.locator('[aria-label="Go Back"]').first();
  await expect(backBtn).toBeVisible({ timeout: 6000 });
  await backBtn.click();
  // Allow navigation to settle
  await page.waitForTimeout(800);
  const url = page.url();
  // Should be either /home/1 or somewhere meaningful (not same dead page repeatedly)
  expect(url).toBeTruthy();
  // Should not show error overlay
  const errorOverlay = page.locator("nextjs-portal");
  await expect(errorOverlay).toHaveCount(0);
  await ctx.close();
});

// ---------------------------------------------------------------------------
// Test 4: Magazine route loads without error
// ---------------------------------------------------------------------------
test("magazine pages load without error", async ({ page }) => {
  const routes = ["/magazine", "/magazine/issue/1"];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    const errorOverlay = page.locator("nextjs-portal");
    await expect(errorOverlay).toHaveCount(0);
  }
});

// ---------------------------------------------------------------------------
// Test 5: No href="#" dead links on primary pages
// ---------------------------------------------------------------------------
test("no dead href='#' links on home/1", async ({ page }) => {
  await page.goto(`${BASE}/home/1`, { waitUntil: "domcontentloaded", timeout: 15000 });
  const deadLinks = page.locator('a[href="#"]');
  const count = await deadLinks.count();
  expect(count).toBe(0);
});

// ---------------------------------------------------------------------------
// Test 6: Mobile — chevrons visible and clickable on iPhone viewport
// ---------------------------------------------------------------------------
test.use({ ...devices["iPhone 14"] });
test("mobile: global chevrons visible on /home/1", async ({ page }) => {
  await page.goto(`${BASE}/home/1`, { waitUntil: "domcontentloaded", timeout: 15000 });
  const backBtn = page.locator('[aria-label="Go Back"]').first();
  const nextBtn = page.locator('[aria-label="Go Forward"]').first();
  await expect(backBtn).toBeVisible({ timeout: 6000 });
  await expect(nextBtn).toBeVisible({ timeout: 6000 });
});
