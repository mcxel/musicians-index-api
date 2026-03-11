import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('phase13.5 browser flows', async ({ page }) => {
  const baseUrl = 'http://localhost:3001';
  const email = `phase135_${Date.now()}@example.com`;
  const password = 'Phase135Pass!';
  const results: Array<Record<string, string>> = [];

  const push = (name: string) => results.push({ name, url: page.url() });

  await page.goto(`${baseUrl}/auth?next=/dashboard`);
  push('open_auth_initial');
  await expect(page).toHaveURL(/\/auth\?next=\/dashboard$/);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText(/Registration succeeded\.|User already exists\./)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
  push('register');

  const loginResponsePromise = page.waitForResponse((response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Login' }).click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);
  await expect(page).toHaveURL(/\/onboarding$/);
  push('login_redirect');

  const cookiesAfterLogin = await page.context().cookies(baseUrl);
  const cookieNamesAfterLogin = cookiesAfterLogin.map((cookie) => cookie.name);
  expect(cookieNamesAfterLogin).toContain('phase11_session');

  await page.reload();
  await expect(page).toHaveURL(/\/onboarding$/);
  push('refresh_session_restore');

  await page.goto(`${baseUrl}/dashboard`);
  await expect(page).toHaveURL(/\/onboarding$/);
  push('direct_protected_while_authed');

  await page.goto(`${baseUrl}/auth`);
  await expect(page).toHaveURL(/\/onboarding$/);
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
