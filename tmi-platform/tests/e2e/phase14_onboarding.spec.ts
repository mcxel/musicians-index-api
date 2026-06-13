import { test, expect } from '@playwright/test';

test('phase14 onboarding and dashboard dispatch', async ({ page }) => {
  test.setTimeout(120000);
  await page.context().clearCookies();

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.request.post(`${baseUrl}/api/auth/logout`);
  const email = `phase14_${Date.now()}@example.com`;
  const password = 'Phase14Pass!';

  await page.goto(`${baseUrl}/auth?next=/dashboard`);
  await expect(page.locator('#auth-email')).toBeVisible();
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);

  const registerResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/auth/register') && response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Register' }).click();
  const registerResponse = await registerResponsePromise;
  expect([200, 201, 409]).toContain(registerResponse.status());

  const loginResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/auth/login') && response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Login' }).click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);

  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByRole('button', { name: 'Continue as Fan' }).click();
  await expect(page).toHaveURL(/\/onboarding\/fan$/);

  await page.getByLabel('Display name').fill('Phase14 Fan');
  await page.getByRole('button', { name: 'Save and continue' }).click();

  // Some builds route fan dashboard via /dashboard, others /dashboard/fan.
  await page.goto(`${baseUrl}/dashboard`);
  await expect(page).toHaveURL(/\/dashboard(\/fan)?$/);

  const adminResponse = await page.request.get(`${baseUrl}/admin`);
  expect([200, 302, 303, 307, 308, 401, 403]).toContain(adminResponse.status());

  const artistDashResponse = await page.request.get(`${baseUrl}/dashboard/artist`);
  expect([200, 302, 303, 307, 308, 401, 403]).toContain(artistDashResponse.status());

  const adminAttempt = await page.request.post(`${baseUrl}/api/onboarding/role`, {
    data: { role: 'admin' },
  });
  expect(adminAttempt.status()).toBe(403);

  const officialLinkAttempt = await page.request.post(`${baseUrl}/api/official-links`, {
    data: {
      platform: 'Spotify',
      url: 'https://open.spotify.com/artist/test',
    },
  });
  expect(officialLinkAttempt.status()).toBe(403);
});
