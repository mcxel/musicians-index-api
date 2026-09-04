import { test, expect } from '@playwright/test';

test('phase17.3 stale routing state recovers via onboarding root', async ({ page }) => {
  test.setTimeout(120000);
  await page.context().clearCookies();

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.request.post(`${baseUrl}/api/auth/logout`);

  const email = `phase173_${Date.now()}@example.com`;
  const password = 'Phase173Pass!';

  // Registration lives on /signup (not a Register button on /auth)
  await page.goto(`${baseUrl}/signup?role=fan`);
  await page.locator('input[type="email"]').first().waitFor({ state: 'visible', timeout: 15000 });

  await page.locator('input[type="text"]').first().fill('Phase173 Fan');
  await page.locator('input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('input[type="date"]').first().fill('1990-01-15');

  const policyBoxes = page.locator('input[type="checkbox"]');
  const policyCount = await policyBoxes.count();
  for (let i = 0; i < policyCount; i++) {
    await policyBoxes.nth(i).check();
  }

  const registerResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/auth/register') && response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: /CREATE FAN ACCOUNT/i }).click();
  const registerResponse = await registerResponsePromise;
  const registerStatus = registerResponse.status();
  expect([201, 409]).toContain(registerStatus);

  if (registerStatus !== 201) {
    // 409 = user already exists — log in explicitly on /auth
    await page.goto(`${baseUrl}/auth`);
    await page.locator('input[type="email"]').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);

    const loginResponsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Login' }).click();
    const loginResponse = await loginResponsePromise;
    expect(loginResponse.status()).toBe(200);
  }

  const cookiesAfterAuth = await page.context().cookies(baseUrl);
  const cookieNames = cookiesAfterAuth.map((cookie) => cookie.name);
  expect(cookieNames).toContain('tmi_session_id');

  // Reach onboarding root before injecting stale routing state
  await page.goto(`${baseUrl}/onboarding`);
  await expect(page).toHaveURL(/\/onboarding/);

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
