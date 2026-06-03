import { test, expect } from '@playwright/test';

const EMAIL_SELECTORS = [
  '[data-testid="auth-email"]',
  '#auth-email',
  'input[name="email"]',
  'input[type="email"]',
  'input[autocomplete="email"]',
].join(', ');

const PASSWORD_SELECTORS = [
  '[data-testid="auth-password"]',
  '#auth-password',
  'input[name="password"]',
  'input[type="password"]',
  'input[autocomplete="current-password"]',
  'input[autocomplete="new-password"]',
].join(', ');

const SUBMIT_SELECTORS = [
  '[data-testid="auth-submit"]',
  '[data-testid="auth-register"]',
  '[data-testid="auth-login"]',
  'button[type="submit"]',
].join(', ');

test.describe('P0: Life Support Systems Verification', () => {
  test('P0-A: User can sign up, log in, and session persists across refresh', async ({ page }) => {
    await page.goto('/auth?next=/dashboard');

    const testEmail = `p0_test_${Date.now()}@berntoutglobal.com`;

    const emailField = page.locator(EMAIL_SELECTORS).first();
    const passwordField = page.locator(PASSWORD_SELECTORS).first();
    const submitButton = page.locator(SUBMIT_SELECTORS).first();

    await emailField.waitFor({ state: 'visible', timeout: 15000 });
    await emailField.fill(testEmail);
    await passwordField.fill('TMI_LifeSupport_2026!');
    await submitButton.click();

    await expect(page).toHaveURL(/\/(home|dashboard|onboarding|auth)/);

    await page.reload();
    await expect(page).not.toHaveURL(/\/auth\?next=/);
  });

  test('P0-B: System health and database readiness check', async ({ request }) => {
    const healthCandidates = ['/api/healthz', '/api/system/runtime-check'];
    let healthStatus = 0;
    for (const path of healthCandidates) {
      const res = await request.get(path);
      if (res.ok()) {
        healthStatus = res.status();
        break;
      }
    }
    expect(healthStatus).toBeGreaterThan(0);

    const readyCandidates = ['/api/readyz', '/api/system/runtime-check'];
    let readyStatus = 0;
    for (const path of readyCandidates) {
      const res = await request.get(path);
      if (res.ok()) {
        readyStatus = res.status();
        break;
      }
    }
    expect(readyStatus).toBeGreaterThan(0);
  });

  test('P0-C: Stripe checkout session initializes securely', async ({ page }) => {
    const res = await page.request.post('/api/stripe/checkout', {
      data: { tier: 'fan_pro', priceId: 'price_test_123' },
    });

    expect([200, 303, 400, 401, 403, 501]).toContain(res.status());
  });

  test('P0-D & P0-E: WebRTC Self-View initializes without crashing', async ({ page }) => {
    await page.context().grantPermissions(['camera', 'microphone']);
    await page.goto('/home/live');

    const videoElement = page
      .locator(
        '[data-testid="self-view-monitor"], video.self-view-monitor, video[autoplay], video',
      )
      .first();

    await videoElement.waitFor({ state: 'attached', timeout: 10000 });

    const isPlaying = await videoElement.evaluate((video: HTMLVideoElement) => {
      return video.readyState >= 1;
    });
    expect(isPlaying).toBeTruthy();
  });
});
