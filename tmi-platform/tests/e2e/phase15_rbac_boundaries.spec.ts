import { test, expect } from '@playwright/test';

test('phase15 minimal artist boundaries', async ({ page }) => {
  test.setTimeout(120000);
  await page.context().clearCookies();

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  await page.request.post(`${baseUrl}/api/auth/logout`);
  const email = `phase15_artist_${Date.now()}@example.com`;
  const password = 'Phase15ArtistPass!';

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
  await page.getByRole('button', { name: 'Continue as Artist' }).click();
  await expect(page).toHaveURL(/\/onboarding\/artist$/);

  await page.getByLabel('Artist name').fill('Phase15 Artist');
  await page.getByLabel('Short bio').fill('RBAC boundary artist test user.');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/dashboard\/artist$/);

  await page.goto(`${baseUrl}/dashboard`);
  await expect(page).toHaveURL(/\/dashboard\/artist$/);

  await page.goto(`${baseUrl}/dashboard/fan`);
  await expect(page).not.toHaveURL(/\/dashboard\/fan/);

  await page.goto(`${baseUrl}/admin`);
  await expect(page).not.toHaveURL(/\/admin/);
});
