import { test, expect } from '@playwright/test';

test('phase17.3 stale routing state recovers via onboarding root', async ({ page }) => {
  test.setTimeout(120000);
  await page.context().clearCookies();

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  await page.request.post(`${baseUrl}/api/auth/logout`);

  const email = `phase173_${Date.now()}@example.com`;
  const password = 'Phase173Pass!';

  await page.goto(`${baseUrl}/auth?next=/dashboard`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText(/Registration succeeded\.|User already exists\./)).toBeVisible();

  const loginResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/auth/login') && response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Login' }).click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);
  await expect(page).toHaveURL(/\/onboarding$/);

  const cookiesAfterLogin = await page.context().cookies(baseUrl);
  const cookieNames = cookiesAfterLogin.map((cookie) => cookie.name);
  expect(cookieNames).toContain('phase11_session');

  await page.context().addCookies([
    {
      name: 'phase14_routing',
      value: 'invalid.stale.routing.state',
      url: baseUrl,
    },
  ]);

  await page.goto(`${baseUrl}/onboarding/fan`);
  await expect(page).toHaveURL(/\/onboarding$/);
});
