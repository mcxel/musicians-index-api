import { test, expect } from '@playwright/test';

test('phase15.5 artist onboarding and admin boundary', async ({ page }) => {
  test.setTimeout(120000);

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  const email = `phase155_artist_${Date.now()}@example.com`;
  const password = 'Phase155Pass!';

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

  await page.getByLabel('Artist name').fill('Phase15.5 Artist');
  await page.getByLabel('Short bio').fill('Artist path validation for Phase 15.5.');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/dashboard\/artist$/);

  await page.goto(`${baseUrl}/admin`);
  await expect(page).not.toHaveURL(/\/admin/);
});
