import { test, expect, type APIRequestContext } from '@playwright/test';

type SessionPayload = {
  csrfToken?: string | null;
};

async function getCsrfToken(api: APIRequestContext, baseUrl: string): Promise<string> {
  const sessionRes = await api.get(`${baseUrl}/api/auth/session`);
  expect(sessionRes.status()).toBe(200);
  const session = (await sessionRes.json()) as SessionPayload;
  expect(session.csrfToken).toBeTruthy();
  return session.csrfToken as string;
}

async function authPost(api: APIRequestContext, baseUrl: string, path: string, data: unknown) {
  const csrfToken = await getCsrfToken(api, baseUrl);
  return api.post(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    data,
  });
}

async function csrfPost(api: APIRequestContext, baseUrl: string, path: string, data: unknown) {
  const csrfToken = await getCsrfToken(api, baseUrl);
  return api.post(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    data,
  });
}

async function csrfPatch(api: APIRequestContext, baseUrl: string, path: string, data: unknown) {
  const csrfToken = await getCsrfToken(api, baseUrl);
  return api.patch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    data,
  });
}

async function registerAndLogin(api: APIRequestContext, baseUrl: string, email: string, password: string) {
  const registerRes = await authPost(api, baseUrl, '/api/auth/register', { email, password });
  expect(registerRes.ok()).toBeTruthy();

  const loginRes = await authPost(api, baseUrl, '/api/auth/login', { email, password });
  expect(loginRes.status()).toBe(200);
}

test('phase15.4 API guards: onboarding role rejects admin', async ({ request }) => {
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  const api = request;

  const email = `phase154_admin_${Date.now()}@example.com`;
  await registerAndLogin(api, baseUrl, email, 'Phase154Pass!');

  const roleRes = await csrfPost(api, baseUrl, '/api/onboarding/role', { role: 'admin' });
  expect(roleRes.status()).toBe(403);
});

test('phase15.4 API guards: official-links rejects unauthorized fan user', async ({ request }) => {
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  const api = request;

  const email = `phase154_fan_${Date.now()}@example.com`;
  await registerAndLogin(api, baseUrl, email, 'Phase154Pass!');

  const linksRes = await csrfPost(api, baseUrl, '/api/official-links', {
    platform: 'Spotify',
    url: 'https://open.spotify.com/artist/test-fan',
  });
  expect(linksRes.status()).toBe(403);
});

test('phase15.4 API guards: official-links rejects incomplete artist onboarding', async ({ request }) => {
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  const api = request;

  const email = `phase154_artist_${Date.now()}@example.com`;
  await registerAndLogin(api, baseUrl, email, 'Phase154Pass!');

  const roleRes = await csrfPost(api, baseUrl, '/api/onboarding/role', { role: 'artist' });
  expect(roleRes.status()).toBe(200);

  const linksRes = await csrfPost(api, baseUrl, '/api/official-links', {
    platform: 'Spotify',
    url: 'https://open.spotify.com/artist/test-artist',
  });
  expect(linksRes.status()).toBe(403);
});

test('phase15.4 API guards: users/me blocks fan bio mutation', async ({ request }) => {
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  const api = request;

  const email = `phase154_bio_${Date.now()}@example.com`;
  await registerAndLogin(api, baseUrl, email, 'Phase154Pass!');

  const patchRes = await csrfPatch(api, baseUrl, '/api/users/me', {
    bio: 'Fan user should not be able to set artist bio.',
  });
  expect(patchRes.status()).toBe(403);
});

test('phase15.4 API happy path: fan can update profile name', async ({ request }) => {
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  const api = request;

  const email = `phase154_happy_fan_${Date.now()}@example.com`;
  await registerAndLogin(api, baseUrl, email, 'Phase154Pass!');

  const patchRes = await csrfPatch(api, baseUrl, '/api/users/me', { name: 'Happy Fan' });

  expect(patchRes.status()).toBe(200);
});

test('phase15.4 API happy path: artist can update bio', async ({ request }) => {
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';
  const api = request;

  const email = `phase154_happy_artist_${Date.now()}@example.com`;
  await registerAndLogin(api, baseUrl, email, 'Phase154Pass!');

  const roleRes = await csrfPost(api, baseUrl, '/api/onboarding/role', { role: 'artist' });
  expect(roleRes.status()).toBe(200);

  const patchRes = await csrfPatch(api, baseUrl, '/api/users/me', {
    name: 'Happy Artist',
    bio: 'Artist bio allowed for artist role.',
  });

  expect(patchRes.status()).toBe(200);
});
