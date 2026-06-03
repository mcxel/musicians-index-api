# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: p0_life_support.spec.ts >> P0: Life Support Systems Verification >> P0-A: User can sign up, log in, and session persists across refresh
- Location: tests\e2e\p0_life_support.spec.ts:28:7

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/auth\?next=/
Received string: "http://localhost:3000/auth?next=/dashboard"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:3000/auth?next=/dashboard"

```

```yaml
- heading "The Musician's Index Magazine — Live music platform for artists, performers, and fans." [level=1]
- alert
- text: TMI BETA SEASON You are a Founding Beta Member. Purchases & unlocks persist permanently.
- button "DETAILS"
- button "Dismiss beta banner": ×
- link "BETA · WAVE 1":
  - /url: /pricing
- main:
  - text: THE MUSICIANS INDEX SIGN IN EMAIL ADDRESS
  - textbox "you@example.com"
  - text: PASSWORD
  - link "Forgot password?":
    - /url: /auth/forgot-password
  - textbox "Your password"
  - button "SIGN IN →"
  - text: OR
  - link "Continue with Google":
    - /url: /api/auth/google
    - img
    - text: Continue with Google
  - text: Don't have an account?
  - link "CREATE YOUR TMI ACCOUNT →":
    - /url: /signup
  - text: "Session: unauthenticated · CSRF: present"
- banner "Install TMI app":
  - text: INSTALL TMI Installable now. Play Store packaging coming.
  - button "OPEN GUIDE"
  - link "MORE":
    - /url: /app-status
  - button "Dismiss install banner for 7 days": NOT NOW
- button "TMI-OS"
- button "Go Back":
  - img
- button "Go Forward":
  - img
- navigation "Global navigation":
  - button "SIGN IN"
  - button "🏠"
  - button "📰"
  - button "⚔️"
  - button "🎥"
  - button "🎤"
  - button "+ SUBMIT"
  - button "↺"
- button "Voice Director — speak commands to the platform"
- button "📡 BETA FEEDBACK"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const EMAIL_SELECTORS = [
  4  |   '[data-testid="auth-email"]',
  5  |   '#auth-email',
  6  |   'input[name="email"]',
  7  |   'input[type="email"]',
  8  |   'input[autocomplete="email"]',
  9  | ].join(', ');
  10 | 
  11 | const PASSWORD_SELECTORS = [
  12 |   '[data-testid="auth-password"]',
  13 |   '#auth-password',
  14 |   'input[name="password"]',
  15 |   'input[type="password"]',
  16 |   'input[autocomplete="current-password"]',
  17 |   'input[autocomplete="new-password"]',
  18 | ].join(', ');
  19 | 
  20 | const SUBMIT_SELECTORS = [
  21 |   '[data-testid="auth-submit"]',
  22 |   '[data-testid="auth-register"]',
  23 |   '[data-testid="auth-login"]',
  24 |   'button[type="submit"]',
  25 | ].join(', ');
  26 | 
  27 | test.describe('P0: Life Support Systems Verification', () => {
  28 |   test('P0-A: User can sign up, log in, and session persists across refresh', async ({ page }) => {
  29 |     await page.goto('/auth?next=/dashboard');
  30 | 
  31 |     const testEmail = `p0_test_${Date.now()}@berntoutglobal.com`;
  32 | 
  33 |     const emailField = page.locator(EMAIL_SELECTORS).first();
  34 |     const passwordField = page.locator(PASSWORD_SELECTORS).first();
  35 |     const submitButton = page.locator(SUBMIT_SELECTORS).first();
  36 | 
  37 |     await emailField.waitFor({ state: 'visible', timeout: 15000 });
  38 |     await emailField.fill(testEmail);
  39 |     await passwordField.fill('TMI_LifeSupport_2026!');
  40 |     await submitButton.click();
  41 | 
  42 |     await expect(page).toHaveURL(/\/(home|dashboard|onboarding|auth)/);
  43 | 
  44 |     await page.reload();
> 45 |     await expect(page).not.toHaveURL(/\/auth\?next=/);
     |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  46 |   });
  47 | 
  48 |   test('P0-B: System health and database readiness check', async ({ request }) => {
  49 |     const healthCandidates = ['/api/healthz', '/api/system/runtime-check'];
  50 |     let healthStatus = 0;
  51 |     for (const path of healthCandidates) {
  52 |       const res = await request.get(path);
  53 |       if (res.ok()) {
  54 |         healthStatus = res.status();
  55 |         break;
  56 |       }
  57 |     }
  58 |     expect(healthStatus).toBeGreaterThan(0);
  59 | 
  60 |     const readyCandidates = ['/api/readyz', '/api/system/runtime-check'];
  61 |     let readyStatus = 0;
  62 |     for (const path of readyCandidates) {
  63 |       const res = await request.get(path);
  64 |       if (res.ok()) {
  65 |         readyStatus = res.status();
  66 |         break;
  67 |       }
  68 |     }
  69 |     expect(readyStatus).toBeGreaterThan(0);
  70 |   });
  71 | 
  72 |   test('P0-C: Stripe checkout session initializes securely', async ({ page }) => {
  73 |     const res = await page.request.post('/api/stripe/checkout', {
  74 |       data: { tier: 'fan_pro', priceId: 'price_test_123' },
  75 |     });
  76 | 
  77 |     expect([200, 303, 400, 401, 403, 501]).toContain(res.status());
  78 |   });
  79 | 
  80 |   test('P0-D & P0-E: WebRTC Self-View initializes without crashing', async ({ page }) => {
  81 |     await page.context().grantPermissions(['camera', 'microphone']);
  82 |     await page.goto('/home/live');
  83 | 
  84 |     const videoElement = page
  85 |       .locator(
  86 |         '[data-testid="self-view-monitor"], video.self-view-monitor, video[autoplay], video',
  87 |       )
  88 |       .first();
  89 | 
  90 |     await videoElement.waitFor({ state: 'attached', timeout: 10000 });
  91 | 
  92 |     const isPlaying = await videoElement.evaluate((video: HTMLVideoElement) => {
  93 |       return video.readyState >= 1;
  94 |     });
  95 |     expect(isPlaying).toBeTruthy();
  96 |   });
  97 | });
  98 | 
```