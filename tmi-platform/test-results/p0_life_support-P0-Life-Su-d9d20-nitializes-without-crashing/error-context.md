# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: p0_life_support.spec.ts >> P0: Life Support Systems Verification >> P0-D & P0-E: WebRTC Self-View initializes without crashing
- Location: tests\e2e\p0_life_support.spec.ts:80:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - heading "The Musician's Index Magazine — Live music platform for artists, performers, and fans." [level=1] [ref=e2]
  - alert [ref=e3]
  - generic [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e9]: TMI BETA SEASON
      - generic [ref=e10]: You are a Founding Beta Member. Purchases & unlocks persist permanently.
    - generic [ref=e11]:
      - button "DETAILS" [ref=e12] [cursor=pointer]
      - button "Dismiss beta banner" [ref=e13] [cursor=pointer]: ×
  - link "BETA · WAVE 1" [ref=e14] [cursor=pointer]:
    - /url: /pricing
    - generic [ref=e16]: BETA · WAVE 1
  - banner "Global navigation" [ref=e17]:
    - link "TMI" [ref=e18] [cursor=pointer]:
      - /url: /home/1
    - navigation "Homepage tabs" [ref=e19]:
      - link "1" [ref=e20] [cursor=pointer]:
        - /url: /home/1
      - link "1-2" [ref=e21] [cursor=pointer]:
        - /url: /home/1-2
      - link "2" [ref=e22] [cursor=pointer]:
        - /url: /home/2
      - link "3" [ref=e23] [cursor=pointer]:
        - /url: /home/3
      - link "4" [ref=e24] [cursor=pointer]:
        - /url: /home/4
      - link "5" [ref=e25] [cursor=pointer]:
        - /url: /home/5
    - generic [ref=e26]:
      - link "Log In" [ref=e27] [cursor=pointer]:
        - /url: /auth
      - link "Sign Up" [ref=e28] [cursor=pointer]:
        - /url: /signup
  - generic [ref=e30]:
    - banner [ref=e31]:
      - heading "Broadcast Studio v1.0" [level=1] [ref=e33]
      - link "EXIT STUDIO" [ref=e34] [cursor=pointer]:
        - /url: /home/1
    - main [ref=e35]:
      - generic [ref=e37]:
        - generic [ref=e38]: Initializing Camera...
        - generic [ref=e40]: ● LIVE (SELF)
      - complementary [ref=e41]:
        - generic [ref=e42]:
          - heading "Audience Radar (Standby)" [level=3] [ref=e43]
          - generic [ref=e44]: Awaiting Socket Connection...
        - generic [ref=e45]:
          - heading "Revenue Monitor (Standby)" [level=3] [ref=e46]
          - generic [ref=e47]: Awaiting Stripe Connection...
  - button "TMI-OS" [ref=e49] [cursor=pointer]:
    - generic [ref=e50]: TMI-OS
  - button "Go Back" [ref=e51]:
    - img
  - button "Go Forward" [ref=e53]:
    - img
  - navigation "Global navigation" [ref=e55]:
    - button "SIGN IN" [ref=e56] [cursor=pointer]
    - button "🏠" [ref=e58] [cursor=pointer]
    - button "📰" [ref=e59] [cursor=pointer]
    - button "⚔️" [ref=e60] [cursor=pointer]
    - button "🎥" [ref=e61] [cursor=pointer]
    - button "🎤" [ref=e62] [cursor=pointer]
    - button "+ SUBMIT" [ref=e64] [cursor=pointer]
    - button "↺" [ref=e66] [cursor=pointer]
  - button "Voice Director — speak commands to the platform" [ref=e67] [cursor=pointer]:
    - img [ref=e68]
  - button "📡 BETA FEEDBACK" [ref=e72] [cursor=pointer]
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
  45 |     await expect(page).not.toHaveURL(/\/auth\?next=/);
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
> 95 |     expect(isPlaying).toBeTruthy();
     |                       ^ Error: expect(received).toBeTruthy()
  96 |   });
  97 | });
  98 | 
```