import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('phase13.5 browser flows', async ({ page }) => {
  test.setTimeout(120000);
  await page.context().clearCookies();

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
  await page.request.post(`${baseUrl}/api/auth/logout`);

  const email = `phase135_${Date.now()}@example.com`;
  const password = 'Phase135Pass!';
  const results: Array<Record<string, string>> = [];

  const push = (name: string) => results.push({ name, url: page.url() });

  // Authed fan landing after signup+provision: login always goes /dashboard → role hub
  // (onboarding enforcer gate is disabled in middleware).
  const authedFanUrl = /\/hub\/fan(?:\/)?(?:\?.*)?$/;

  // Registration lives on /signup (not a Register button on /auth)
  await page.goto(`${baseUrl}/signup?role=fan`);
  await page.locator('input[type="email"]').first().waitFor({ state: 'visible', timeout: 15000 });

  await page.locator('input[type="text"]').first().fill('Phase135 Fan');
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
  const provisionResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/auth/provision') && response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: /CREATE FAN ACCOUNT/i }).click();
  const registerResponse = await registerResponsePromise;
  const registerStatus = registerResponse.status();
  expect([201, 409]).toContain(registerStatus);

  if (registerStatus === 201) {
    const provisionResponse = await provisionResponsePromise;
    expect(provisionResponse.status()).toBe(201);
  } else {
    void provisionResponsePromise.catch(() => undefined);
  }
  push('register');

  // Ensure a clean login path — signup may leave a session after provision
  await page.context().clearCookies();
  await page.request.post(`${baseUrl}/api/auth/logout`);

  await page.goto(`${baseUrl}/auth?next=/dashboard`);
  push('open_auth_initial');
  await expect(page).toHaveURL(/\/auth\?next=\/dashboard$/);
  await page.locator('input[type="email"]').first().waitFor({ state: 'visible', timeout: 15000 });

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();

  const loginResponsePromise = page.waitForResponse((response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Login' }).click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);
  await expect(page).toHaveURL(authedFanUrl, { timeout: 15000 });
  push('login_redirect');

  const cookiesAfterLogin = await page.context().cookies(baseUrl);
  const cookieNamesAfterLogin = cookiesAfterLogin.map((cookie) => cookie.name);
  expect(cookieNamesAfterLogin).toContain('tmi_session_id');

  await page.reload();
  await expect(page).toHaveURL(authedFanUrl, { timeout: 15000 });
  push('refresh_session_restore');

  await page.goto(`${baseUrl}/dashboard`);
  await expect(page).toHaveURL(authedFanUrl, { timeout: 15000 });
  push('direct_protected_while_authed');

  await page.goto(`${baseUrl}/auth`);
  await expect(page).toHaveURL(authedFanUrl, { timeout: 15000 });
  push('auth_when_authed');

  await page.goto(`${baseUrl}/`);
  const signOutButton = page.locator('button[title="Sign Out"]');
  if (await signOutButton.count()) {
    await signOutButton.first().click();
    await expect(page).toHaveURL(/\/$/);
    push('logout');
  } else {
    const logoutStatus = await page.evaluate(async () => {
      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
      const session = await sessionRes.json() as { csrfToken?: string | null };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session.csrfToken) {
        headers['X-CSRF-Token'] = session.csrfToken;
      }
      const logoutRes = await fetch('/api/auth/logout', {
        method: 'POST',
        headers,
        body: '{}',
      });
      return logoutRes.status;
    });
    expect(logoutStatus).toBe(200);
    push('logout_api_fallback');
  }

  await page.goto(`${baseUrl}/dashboard`);
  await expect(page).toHaveURL(/\/auth\?next=%2Fdashboard$/);
  push('protected_after_logout');

  await page.goto(`${baseUrl}/admin`);
  await expect(page).toHaveURL(/\/auth\?next=%2Fadmin$/);
  push('admin_after_logout');

  fs.writeFileSync('.tmp-phase13_5-browser-results.json', JSON.stringify({ ok: true, email, steps: results }, null, 2));
  expect(results.length).toBeGreaterThan(0);
});
