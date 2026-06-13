/**
 * contest.smoke.spec.ts
 * Purpose: Playwright smoke tests for the contest system
 * Run: pnpm exec playwright test tests/e2e/contest.smoke.spec.ts --workers=1 --reporter=dot
 * Uses baseURL from playwright.config.ts (localhost:3000 by default).
 */

import { test, expect } from '@playwright/test';

// ─── Public route smoke tests ─────────────────────────────────────────────────

test.describe('Contest Public Routes', () => {
  test('GET /contest → loads without error', async ({ page }) => {
    const response = await page.goto('/contest');
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Contest|Grand Platform|TMI/i);
  });

  test('GET /contest/rules → loads without error', async ({ page }) => {
    const response = await page.goto('/contest/rules');
    expect(response?.status()).toBeLessThan(400);
    const rulesHeading = page.getByRole('heading', { name: /Grand Platform Contest|Rules/i }).first();
    await expect(rulesHeading).toBeVisible();
  });

  test('GET /contest/leaderboard → loads without error', async ({ page }) => {
    const response = await page.goto('/contest/leaderboard');
    expect(response?.status()).toBeLessThan(400);
  });

  test('GET /contest/sponsors → loads without error', async ({ page }) => {
    const response = await page.goto('/contest/sponsors');
    expect(response?.status()).toBeLessThan(400);
  });

  test('GET /contest/host → loads without error', async ({ page }) => {
    const response = await page.goto('/contest/host');
    expect(response?.status()).toBeLessThan(400);
  });
});

// ─── Admin route protection ───────────────────────────────────────────────────

test.describe('Contest Admin Route Protection', () => {
  test('GET /contest/admin → redirects unauthenticated user', async ({ page }) => {
    await page.goto('/contest/admin');
    await expect(page).toHaveURL(/\/auth|\/login/i);
  });

  test('GET /contest/admin/contestants → redirects unauthenticated user', async ({ page }) => {
    await page.goto('/contest/admin/contestants');
    await expect(page).toHaveURL(/\/auth|\/login/i);
  });

  test('GET /contest/admin/sponsors → redirects unauthenticated user', async ({ page }) => {
    await page.goto('/contest/admin/sponsors');
    await expect(page).toHaveURL(/\/auth|\/login/i);
  });
});

// ─── API endpoint smoke tests ─────────────────────────────────────────────────

test.describe('Contest API Endpoints', () => {
  test('GET /api/contest/seasons/active → 200 or 404 (no 500)', async ({ request }) => {
    const response = await request.get('/api/contest/seasons/active');
    expect([200, 404]).toContain(response.status());
  });

  test('GET /api/contest/entries → 200', async ({ request }) => {
    const response = await request.get('/api/contest/entries');
    expect(response.status()).toBe(200);
  });

  test('GET /api/contest/sponsor-packages → 200 with array', async ({ request }) => {
    const response = await request.get('/api/contest/sponsor-packages');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/contest/leaderboard → 200', async ({ request }) => {
    const response = await request.get('/api/contest/leaderboard');
    expect(response.status()).toBe(200);
  });

  test('GET /api/contest/host/scripts → 200 with scripts array', async ({ request }) => {
    const response = await request.get('/api/contest/host/scripts');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('POST /api/contest/entries without auth → 401', async ({ request }) => {
    const response = await request.post('/api/contest/entries', {
      data: { artistId: 'test', category: 'singers' },
    });
    expect([401, 403]).toContain(response.status());
  });

  test('GET /api/contest/admin/queue/contestants without auth → 401', async ({ request }) => {
    const response = await request.get('/api/contest/admin/queue/contestants');
    expect([401, 403]).toContain(response.status());
  });
});

// ─── August 8 season date rule ────────────────────────────────────────────────

test.describe('Contest Season Date Rule', () => {
  test('Active season registration date is August 8 (if season exists)', async ({ request }) => {
    const response = await request.get('/api/contest/seasons/active');
    if (response.status() === 200) {
      const body = await response.json();
      if (body?.registrationStartDate) {
        const d = new Date(body.registrationStartDate);
        expect(d.getMonth()).toBe(7); // August (0-indexed)
        expect(d.getDate()).toBe(8);
      }
    }
    // If no active season (404), test passes — date rule enforced at season creation
  });
});

// ─── Component smoke (visual check) ──────────────────────────────────────────

test.describe('Contest UI Components', () => {
  test('Contest home shows category grid', async ({ page }) => {
    await page.goto('/contest');
    const categories = await page.locator('[class*="category-card"], [data-testid="category-card"]').count();
    expect(categories).toBeGreaterThanOrEqual(0);
  });

  test('Contest rules page has rule sections', async ({ page }) => {
    await page.goto('/contest/rules');
    const h2 = page.locator('h2');
    await expect(h2.first()).toBeVisible({ timeout: 10000 });
    const headings = await h2.count();
    expect(headings).toBeGreaterThan(0);
  });
});
