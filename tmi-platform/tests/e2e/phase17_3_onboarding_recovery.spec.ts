import { test, expect } from '@playwright/test';

test('phase17.3 stale routing state recovers via onboarding root', async ({ page }) => {
  test.setTimeout(120000);
  await page.context().clearCookies();

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.request.post(`${baseUrl}/api/auth/logout`);

  const email = `phase173_${Date.now()}@example.com`;
  const password = 'Phase173Pass!';

  await page.goto(`${baseUrl}/signup`);
  await page.getByPlaceholder('Your name or username').fill('Phase 17.3 Fan');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('8+ characters').fill(password);
  await page.locator('input[type="date"]').fill('1990-01-01');

  await page.getByLabel(/Terms of Service/).check();
  await page.getByLabel(/Privacy Policy/).check();
  await page.getByLabel(/Community Guidelines/).check();
  await page.getByLabel(/Messaging Conduct/).check();
  await page.getByLabel(/Liability & Rules Acknowledgment/).check();

  const [registerResponse, provisionResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/auth/register') && response.request().method() === 'POST'
    ),
    page.waitForResponse((response) =>
      response.url().includes('/api/auth/provision') && response.request().method() === 'POST'
    ),
    page.getByRole('button', { name: /CREATE FAN ACCOUNT/ }).click(),
  ]);
  expect(registerResponse.status()).toBe(201);

  expect(provisionResponse.status()).toBe(201);

  await page.getByRole('button', { name: /FINISH SETTING UP YOUR PROFILE/ }).click();
  await expect(page).toHaveURL(/\/onboarding\/fan$/);

  const cookiesAfterLogin = await page.context().cookies(baseUrl);
  const cookieNames = cookiesAfterLogin.map((cookie) => cookie.name);
  expect(cookieNames).toContain('tmi_session_id');

  await page.context().addCookies([
    {
      name: 'phase14_routing',
      value: 'invalid.stale.routing.state',
      url: baseUrl,
    },
  ]);

  await page.goto(`${baseUrl}/onboarding/fan`);
  await expect(page).toHaveURL(/\/onboarding(\/fan)?$/);
});
