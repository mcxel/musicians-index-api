# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contest.smoke.spec.ts >> Contest UI Components >> Contest home shows category grid
- Location: tests\e2e\contest.smoke.spec.ts:133:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/contest
Call log:
  - navigating to "http://localhost:3001/contest", waiting until "load"

```

# Test source

```ts
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
  120 |       if (body?.registrationStartDate) {
  121 |         const d = new Date(body.registrationStartDate);
  122 |         expect(d.getMonth()).toBe(7); // 7 = August (0-indexed)
  123 |         expect(d.getDate()).toBe(8);
  124 |       }
  125 |     }
  126 |     // If no active season, test passes — date rule enforced at season creation
  127 |   });
  128 | });
  129 | 
  130 | // ─── Component smoke (visual check) ──────────────────────────────────────────
  131 | 
  132 | test.describe('Contest UI Components', () => {
  133 |   test('Contest home shows category grid', async ({ page }) => {
> 134 |     await page.goto(`${BASE_URL}/contest`);
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/contest
  135 |     // At least one category card should be visible
  136 |     // Adjust selector to match your actual DOM
  137 |     const categories = await page.locator('[class*="category-card"], [data-testid="category-card"]').count();
  138 |     // If categories are loaded via server, at least 1 should render
  139 |     // This is a soft check — 0 is acceptable if data hasn't loaded yet
  140 |     expect(categories).toBeGreaterThanOrEqual(0);
  141 |   });
  142 | 
  143 |   test('Contest rules page has rule sections', async ({ page }) => {
  144 |     await page.goto(`${BASE_URL}/contest/rules`);
  145 |     // Should have at least heading content
  146 |     const h2 = page.locator('h2');
  147 |     await expect(h2.first()).toBeVisible({ timeout: 10000 });
  148 |     const headings = await h2.count();
  149 |     expect(headings).toBeGreaterThan(0);
  150 |   });
  151 | });
  152 | 
```