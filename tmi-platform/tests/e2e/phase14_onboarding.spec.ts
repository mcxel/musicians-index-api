import { test, expect } from '@playwright/test';

test('phase14 onboarding and dashboard dispatch', async ({ page }) => {
  test.setTimeout(120000);
  await page.context().clearCookies();

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  await page.request.post(`${baseUrl}/api/auth/logout`);
  const email = `phase14_${Date.now()}@example.com`;
  const password = 'Phase14Pass!';

  await page.goto(`${baseUrl}/auth?next=/dashboard`);
  await expect(page.locator('#auth-email')).toBeVisible();
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);

  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText(/Registration succeeded\.|User already exists\./)).toBeVisible();

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
  await expect(page).toHaveURL(/\/dashboard\/fan$/);

  await page.goto(`${baseUrl}/dashboard`);
  await expect(page).toHaveURL(/\/dashboard\/fan$/);

  await page.goto(`${baseUrl}/admin`);
  await expect(page).not.toHaveURL(/\/admin/);

  await page.goto(`${baseUrl}/dashboard/artist`);
  await expect(page).not.toHaveURL(/\/dashboard\/artist/);

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
