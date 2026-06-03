# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contest.smoke.spec.ts >> Contest Public Routes >> GET /contest → loads without error
- Location: tests\e2e\contest.smoke.spec.ts:18:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/contest
Call log:
  - navigating to "http://localhost:3001/contest", waiting until "load"

```

# Test source

```ts
  1   | /**
  2   |  * contest.smoke.spec.ts
  3   |  * Repo: tests/e2e/contest.smoke.spec.ts
  4   |  * Purpose: Playwright smoke tests for the contest system
  5   |  *
  6   |  * Run: pnpm -s exec playwright test tests/e2e/contest.smoke.spec.ts --workers=1 --reporter=dot
  7   |  * REQUIREMENT: Web must be running on localhost:3001 and API on localhost:4000 first.
  8   |  */
  9   | 
  10  | import { test, expect } from '@playwright/test';
  11  | 
  12  | const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
  13  | const API_URL = process.env.TEST_API_URL || 'http://localhost:4000';
  14  | 
  15  | // ─── Public route smoke tests ─────────────────────────────────────────────────
  16  | 
  17  | test.describe('Contest Public Routes', () => {
  18  |   test('GET /contest → loads without error', async ({ page }) => {
> 19  |     const response = await page.goto(`${BASE_URL}/contest`);
      |                                 ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/contest
  20  |     expect(response?.status()).toBeLessThan(400);
  21  |     await expect(page).toHaveTitle(/Contest|Grand Platform|TMI/i);
  22  |   });
  23  | 
  24  |   test('GET /contest/rules → loads without error', async ({ page }) => {
  25  |     const response = await page.goto(`${BASE_URL}/contest/rules`);
  26  |     expect(response?.status()).toBeLessThan(400);
  27  |     await expect(page.locator('h1')).toBeVisible();
  28  |   });
  29  | 
  30  |   test('GET /contest/leaderboard → loads without error', async ({ page }) => {
  31  |     const response = await page.goto(`${BASE_URL}/contest/leaderboard`);
  32  |     expect(response?.status()).toBeLessThan(400);
  33  |   });
  34  | 
  35  |   test('GET /contest/sponsors → loads without error', async ({ page }) => {
  36  |     const response = await page.goto(`${BASE_URL}/contest/sponsors`);
  37  |     expect(response?.status()).toBeLessThan(400);
  38  |   });
  39  | 
  40  |   test('GET /contest/host → loads without error', async ({ page }) => {
  41  |     const response = await page.goto(`${BASE_URL}/contest/host`);
  42  |     expect(response?.status()).toBeLessThan(400);
  43  |   });
  44  | });
  45  | 
  46  | // ─── Admin route protection ───────────────────────────────────────────────────
  47  | 
  48  | test.describe('Contest Admin Route Protection', () => {
  49  |   test('GET /contest/admin → redirects unauthenticated user', async ({ page }) => {
  50  |     await page.goto(`${BASE_URL}/contest/admin`);
  51  |     // Should redirect to /auth if not logged in
  52  |     await expect(page).toHaveURL(/\/auth|\/login/i);
  53  |   });
  54  | 
  55  |   test('GET /contest/admin/contestants → redirects unauthenticated user', async ({ page }) => {
  56  |     await page.goto(`${BASE_URL}/contest/admin/contestants`);
  57  |     await expect(page).toHaveURL(/\/auth|\/login/i);
  58  |   });
  59  | 
  60  |   test('GET /contest/admin/sponsors → redirects unauthenticated user', async ({ page }) => {
  61  |     await page.goto(`${BASE_URL}/contest/admin/sponsors`);
  62  |     await expect(page).toHaveURL(/\/auth|\/login/i);
  63  |   });
  64  | });
  65  | 
  66  | // ─── API endpoint smoke tests ─────────────────────────────────────────────────
  67  | 
  68  | test.describe('Contest API Endpoints', () => {
  69  |   test('GET /api/contest/seasons/active → 200 or 404 (no 500)', async ({ request }) => {
  70  |     const response = await request.get(`${API_URL}/api/contest/seasons/active`);
  71  |     expect([200, 404]).toContain(response.status());
  72  |   });
  73  | 
  74  |   test('GET /api/contest/entries → 200', async ({ request }) => {
  75  |     const response = await request.get(`${API_URL}/api/contest/entries`);
  76  |     expect(response.status()).toBe(200);
  77  |   });
  78  | 
  79  |   test('GET /api/contest/sponsor-packages → 200 with array', async ({ request }) => {
  80  |     const response = await request.get(`${API_URL}/api/contest/sponsor-packages`);
  81  |     expect(response.status()).toBe(200);
  82  |     const body = await response.json();
  83  |     expect(Array.isArray(body)).toBe(true);
  84  |   });
  85  | 
  86  |   test('GET /api/contest/leaderboard → 200', async ({ request }) => {
  87  |     const response = await request.get(`${API_URL}/api/contest/leaderboard`);
  88  |     expect(response.status()).toBe(200);
  89  |   });
  90  | 
  91  |   test('GET /api/contest/host/scripts → 200 with scripts array', async ({ request }) => {
  92  |     const response = await request.get(`${API_URL}/api/contest/host/scripts`);
  93  |     expect(response.status()).toBe(200);
  94  |     const body = await response.json();
  95  |     expect(Array.isArray(body)).toBe(true);
  96  |     expect(body.length).toBeGreaterThan(0);
  97  |   });
  98  | 
  99  |   test('POST /api/contest/entries without auth → 401', async ({ request }) => {
  100 |     const response = await request.post(`${API_URL}/api/contest/entries`, {
  101 |       data: { artistId: 'test', category: 'singers' },
  102 |     });
  103 |     // Should reject without auth — 401 or 403
  104 |     expect([401, 403]).toContain(response.status());
  105 |   });
  106 | 
  107 |   test('GET /api/contest/admin/queue/contestants without auth → 401', async ({ request }) => {
  108 |     const response = await request.get(`${API_URL}/api/contest/admin/queue/contestants`);
  109 |     expect([401, 403]).toContain(response.status());
  110 |   });
  111 | });
  112 | 
  113 | // ─── August 8 season date rule ────────────────────────────────────────────────
  114 | 
  115 | test.describe('Contest Season Date Rule', () => {
  116 |   test('Active season registration date is August 8 (if season exists)', async ({ request }) => {
  117 |     const response = await request.get(`${API_URL}/api/contest/seasons/active`);
  118 |     if (response.status() === 200) {
  119 |       const body = await response.json();
```