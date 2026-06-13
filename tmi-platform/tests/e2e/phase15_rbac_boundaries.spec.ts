import { test, expect } from '@playwright/test';

test('phase15 minimal artist boundaries', async ({ page }) => {
  test.setTimeout(120000);
  await page.context().clearCookies();

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.request.post(`${baseUrl}/api/auth/logout`);
  const email = `phase15_artist_${Date.now()}@example.com`;
  const password = 'Phase15ArtistPass!';

  await page.goto(`${baseUrl}/auth?next=/dashboard`);
  await expect(page.locator('#auth-email')).toBeVisible();

  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);

  const registerResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/auth/register') && response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Register' }).click();
  const registerResponse = await registerResponsePromise;
  const registerStatus = registerResponse.status();
  expect([200, 201, 409]).toContain(registerStatus);

  if (registerStatus !== 201) {
    // 409 = user already exists — need to log in explicitly
    const loginResponsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Login' }).click();
    const loginResponse = await loginResponsePromise;
    expect(loginResponse.status()).toBe(200);
  }

  await expect(page).toHaveURL(/\/onboarding$/);

  // Wait for session-check fetch to complete before role buttons are rendered
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  const artistContinueButton = page.getByRole('button', { name: /Continue as Artist|Artist/i });
  const artistNameField = page.getByLabel('Artist name');

  // Some builds route to /onboarding/artist, others render artist form directly on /onboarding.
  if (await artistContinueButton.first().isVisible({ timeout: 8000 }).catch(() => false)) {
    await artistContinueButton.first().click();
    await expect(page).toHaveURL(/\/onboarding(\/artist)?$/, { timeout: 15000 });
  } else {
    // Fallback: navigate directly to artist onboarding if button never appeared
    await page.goto(`${baseUrl}/onboarding/artist`);
  }

  await expect(artistNameField).toBeVisible({ timeout: 15000 });
  await artistNameField.fill('Phase15 Artist');
  await page.getByLabel('Short bio').fill('RBAC boundary artist test user.');
  await page.getByRole('button', { name: 'Save and continue' }).click();

  // Some builds do not auto-redirect after artist profile save.
  await page.goto(`${baseUrl}/dashboard`);
  await expect(page).toHaveURL(/\/dashboard(\/artist)?$/);

  // Middleware may redirect unauthorized routes — use 'commit' to avoid ERR_ABORTED on redirects
  await page.goto(`${baseUrl}/dashboard/fan`, { waitUntil: 'commit' }).catch(() => {});
  await expect(page).not.toHaveURL(/\/dashboard\/fan/);

  await page.goto(`${baseUrl}/admin`, { waitUntil: 'commit' }).catch(() => {});
  await expect(page).not.toHaveURL(/\/admin/);
});
