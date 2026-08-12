/**
 * Mobile Viewport Audit — Gate C + Gate E
 *
 * Run against local dev:
 *   npx playwright test mobile-audit --project=chromium
 *
 * Run against deployed URL:
 *   E2E_BASE_URL=https://themusiciansindex.com npx playwright test mobile-audit --project=chromium
 *
 * Auth (optional — enables dashboard tests):
 *   E2E_TEST_EMAIL=... E2E_TEST_PASSWORD=... npx playwright test mobile-audit --project=chromium
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Viewport targets ────────────────────────────────────────────────────────
const VIEWPORTS = [
  { name: "360p", width: 360, height: 800 },
  { name: "390p", width: 390, height: 844 },
  { name: "430p", width: 430, height: 932 },
];

// ─── DOM measurement helpers ──────────────────────────────────────────────────
interface ViewportMetrics {
  innerWidth: number;
  clientWidth: number;
  scrollWidth: number;
  bodyScrollWidth: number;
  matchMediaMobile: boolean;
  devicePixelRatio: number;
  href: string;
  buildSha: string;
}

interface OverflowOffender {
  tag: string;
  id: string;
  cls: string;
  left: number;
  right: number;
  width: number;
  scrollW: number;
  clientW: number;
}

async function getViewportMetrics(page: Page): Promise<ViewportMetrics> {
  return page.evaluate(() => ({
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    matchMediaMobile: window.matchMedia("(max-width: 767px)").matches,
    devicePixelRatio: window.devicePixelRatio,
    href: window.location.href,
    buildSha: document.body.dataset.buildSha ?? "not-set",
  }));
}

async function findOverflowOffenders(page: Page): Promise<OverflowOffender[]> {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const offenders: {
      tag: string; id: string; cls: string;
      left: number; right: number; width: number; scrollW: number; clientW: number;
    }[] = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      const htmlEl = el as HTMLElement;
      const scrollW = htmlEl.scrollWidth ?? 0;
      const clientW = htmlEl.clientWidth ?? 0;
      if (r.right > vw + 2 || r.left < -2 || scrollW > clientW + 2) {
        offenders.push({
          tag: el.tagName,
          id: el.id || "-",
          cls: (el.className?.toString?.() ?? "").slice(0, 80),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          scrollW,
          clientW,
        });
      }
    });
    return offenders.slice(0, 30);
  });
}

// ─── Gate E: Deployment identity ─────────────────────────────────────────────
test("Gate E — deployment identity visible in DOM", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("load"); // networkidle never resolves on pages with websockets/polling

  // Read build SHA from body data attribute
  const sha = await page.evaluate(() => document.body.dataset.buildSha ?? "not-set");
  console.log(`\n[GATE E] Deployed build SHA: ${sha}`);

  // Also read from /api/version
  const versionRes = await page.request.get("/api/version");
  if (versionRes.ok()) {
    const versionData = await versionRes.json() as {
      sha?: string; env?: string; branch?: string; deployedAt?: string
    };
    console.log(`[GATE E] /api/version:`, JSON.stringify(versionData));
    // Record the sha for comparison with git log
    console.log(`[GATE E] Expected latest commit: run 'git rev-parse --short HEAD' to compare`);
  }

  // Non-blocking: just record, don't fail on SHA mismatch
  expect(sha).not.toBe("not-set");
});

// ─── Gate C: Mobile overflow audit ───────────────────────────────────────────
for (const vp of VIEWPORTS) {
  test(`Gate C — no horizontal overflow at ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const metrics = await getViewportMetrics(page);
    console.log(`\n[GATE C / ${vp.name}]`, JSON.stringify(metrics, null, 2));

    // Check matchMedia reports mobile correctly
    expect(metrics.matchMediaMobile).toBe(true);

    // Core assertion: no horizontal scroll
    const scrollWidthExcess = metrics.scrollWidth - metrics.innerWidth;
    if (scrollWidthExcess > 2) {
      const offenders = await findOverflowOffenders(page);
      console.log(`[GATE C / ${vp.name}] FAIL — overflow offenders:`, JSON.stringify(offenders, null, 2));
    }
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
  });
}

// ─── Gate C: TopNav nav-link visibility on mobile ────────────────────────────
for (const vp of VIEWPORTS) {
  test(`Gate C — TopNav primary nav hidden at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Nav links should not be visible on mobile
    const navLinksVisible = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("nav a, nav button"));
      return links
        .filter((el) => {
          const text = el.textContent?.trim() ?? "";
          return (
            ["HOME", "DISCOVER", "LIVE NOW", "MAGAZINE", "MARKETPLACE", "ARENA"].some(
              (label) => text.includes(label)
            )
          );
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return {
            text: el.textContent?.trim(),
            visible:
              r.width > 0 &&
              r.height > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden",
            display: style.display,
            rect: { w: Math.round(r.width), h: Math.round(r.height) },
          };
        });
    });

    console.log(`\n[GATE C / ${vp.name}] Nav links:`, JSON.stringify(navLinksVisible, null, 2));

    const visibleLinks = navLinksVisible.filter((l) => l.visible);
    if (visibleLinks.length > 0) {
      console.log(
        `[GATE C / ${vp.name}] FAIL — ${visibleLinks.length} primary nav link(s) visible on mobile:`,
        visibleLinks.map((l) => l.text).join(", ")
      );
    }
    expect(visibleLinks.length).toBe(0);
  });
}

// ─── Gate A+B: Dashboard overflow audit (requires auth via env vars) ──────────
test("Gate A+B — dashboard overflow + role isolation (skips if no test credentials)", async ({
  page,
}) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    test.skip();
    return;
  }

  // Log in
  await page.goto("/auth");
  await page.waitForLoadState("networkidle");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|hub)/, { timeout: 15_000 });

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    // Navigate to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // allow React hydration

    const metrics = await getViewportMetrics(page);
    console.log(`\n[GATE A+B / ${vp.name}] dashboard`, JSON.stringify(metrics, null, 2));

    const scrollWidthExcess = metrics.scrollWidth - metrics.innerWidth;
    if (scrollWidthExcess > 2) {
      const offenders = await findOverflowOffenders(page);
      console.log(`[GATE A+B / ${vp.name}] Overflow offenders:`, JSON.stringify(offenders, null, 2));
    }
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);

    // Check for unsolicited navigation (Todd's bug)
    const finalUrl = page.url();
    expect(finalUrl).toContain("/dashboard");

    // Wait 12 seconds to catch any delayed redirects
    const startUrl = page.url();
    await page.waitForTimeout(12_000);
    const afterWaitUrl = page.url();
    if (startUrl !== afterWaitUrl) {
      console.log(`[GATE A / ${vp.name}] UNSOLICITED NAVIGATION DETECTED: ${startUrl} → ${afterWaitUrl}`);
    }
    expect(page.url()).toBe(startUrl);
  }
});
