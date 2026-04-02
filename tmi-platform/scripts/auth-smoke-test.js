#!/usr/bin/env node
'use strict';

/**
 * Stack A Auth Smoke Test
 * Tests: CSRF → register → login → session → logout → session (unauthenticated)
 */

const http = require('http');

const BASE = 'http://localhost:4000';
const EMAIL = `smoketest_${Date.now()}@tmi-test.com`;
const PASSWORD = 'SmokeTest123!';
const DOB = '1995-06-15'; // age ~29, not minor

let passed = 0;
let failed = 0;
const results = [];

function req(method, path, body, headers) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        ...headers,
      },
    };
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        let json;
        try { json = JSON.parse(data); } catch { json = data; }
        resolve({ status: res.statusCode, body: json, cookies, rawHeaders: res.headers });
      });
    });
    r.on('error', reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

function parseCookie(cookies, name) {
  for (const c of cookies) {
    const parts = c.split(';')[0].trim();
    const [k, v] = parts.split('=');
    if (k.trim() === name) return v;
  }
  return null;
}

function check(label, condition, detail) {
  if (condition) {
    passed++;
    results.push(`  ✅ PASS: ${label}`);
  } else {
    failed++;
    results.push(`  ❌ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
  }
}

async function run() {
  console.log('\n=== STACK A AUTH SMOKE TEST ===');
  console.log(`Email: ${EMAIL}\n`);

  // 1. GET /api/auth/session (unauthenticated)
  console.log('[1] GET /api/auth/session (unauthenticated)');
  const s0 = await req('GET', '/api/auth/session', null, {});
  check('session unauthenticated → 200', s0.status === 200, `got ${s0.status}`);
  check('session unauthenticated → authenticated:false', s0.body?.authenticated === false, JSON.stringify(s0.body));
  check('session unauthenticated → csrfToken present', !!s0.body?.csrfToken, JSON.stringify(s0.body));
  const csrfToken = s0.body?.csrfToken;
  const csrfCookie = parseCookie(s0.cookies, 'phase11_csrf') || csrfToken;

  // 2. POST /api/auth/register
  console.log('[2] POST /api/auth/register');
  const reg = await req('POST', '/api/auth/register', {
    email: EMAIL,
    password: PASSWORD,
    dateOfBirth: DOB,
    termsAccepted: true,
    originalityAccepted: true,
  }, {
    'x-csrf-token': csrfToken,
    'Cookie': `phase11_csrf=${csrfCookie}`,
  });
  check('register → 201', reg.status === 201, `got ${reg.status} body=${JSON.stringify(reg.body)}`);
  check('register → ok:true', reg.body?.ok === true, JSON.stringify(reg.body));
  check('register → user.email matches', reg.body?.user?.email === EMAIL.toLowerCase(), JSON.stringify(reg.body?.user));

  // 3. POST /api/auth/login
  console.log('[3] POST /api/auth/login');
  const login = await req('POST', '/api/auth/login', {
    email: EMAIL,
    password: PASSWORD,
  }, {
    'x-csrf-token': csrfToken,
    'Cookie': `phase11_csrf=${csrfCookie}`,
  });
  check('login → 200', login.status === 200, `got ${login.status} body=${JSON.stringify(login.body)}`);
  check('login → ok:true', login.body?.ok === true, JSON.stringify(login.body));
  check('login → authenticated:true', login.body?.authenticated === true, JSON.stringify(login.body));
  check('login → user.email matches', login.body?.user?.email === EMAIL.toLowerCase(), JSON.stringify(login.body?.user));
  const sessionCookie = parseCookie(login.cookies, 'phase11_session');
  const csrfAfterLogin = parseCookie(login.cookies, 'phase11_csrf') || csrfToken;
  check('login → session cookie set', !!sessionCookie, `cookies: ${JSON.stringify(login.cookies)}`);

  // 4. GET /api/auth/session (authenticated)
  console.log('[4] GET /api/auth/session (authenticated)');
  const s1 = await req('GET', '/api/auth/session', null, {
    'Cookie': `phase11_session=${sessionCookie}; phase11_csrf=${csrfAfterLogin}`,
  });
  check('session authenticated → 200', s1.status === 200, `got ${s1.status}`);
  check('session authenticated → authenticated:true', s1.body?.authenticated === true, JSON.stringify(s1.body));
  check('session authenticated → user.email matches', s1.body?.user?.email === EMAIL.toLowerCase(), JSON.stringify(s1.body?.user));
  const csrfFromSession = s1.body?.csrfToken || csrfAfterLogin;

  // 5. POST /api/auth/logout
  console.log('[5] POST /api/auth/logout');
  const logout = await req('POST', '/api/auth/logout', {}, {
    'x-csrf-token': csrfFromSession,
    'Cookie': `phase11_session=${sessionCookie}; phase11_csrf=${csrfFromSession}`,
  });
  check('logout → 200', logout.status === 200, `got ${logout.status} body=${JSON.stringify(logout.body)}`);
  check('logout → ok:true', logout.body?.ok === true, JSON.stringify(logout.body));
  check('logout → authenticated:false', logout.body?.authenticated === false, JSON.stringify(logout.body));

  // 6. GET /api/auth/session (after logout — should be unauthenticated)
  console.log('[6] GET /api/auth/session (after logout)');
  const s2 = await req('GET', '/api/auth/session', null, {
    'Cookie': `phase11_session=${sessionCookie}`,
  });
  check('session after logout → 200', s2.status === 200, `got ${s2.status}`);
  check('session after logout → authenticated:false', s2.body?.authenticated === false, JSON.stringify(s2.body));

  // 7. POST /api/auth/login with wrong password
  console.log('[7] POST /api/auth/login (wrong password)');
  const s3csrf = s2.body?.csrfToken || csrfFromSession;
  const s3csrfCookie = parseCookie(s2.cookies, 'phase11_csrf') || s3csrf;
  const badLogin = await req('POST', '/api/auth/login', {
    email: EMAIL,
    password: 'WrongPassword999!',
  }, {
    'x-csrf-token': s3csrf,
    'Cookie': `phase11_csrf=${s3csrfCookie}`,
  });
  check('bad login → 401', badLogin.status === 401, `got ${badLogin.status} body=${JSON.stringify(badLogin.body)}`);

  // 8. POST /api/auth/register (duplicate email)
  console.log('[8] POST /api/auth/register (duplicate email)');
  const dupReg = await req('POST', '/api/auth/register', {
    email: EMAIL,
    password: PASSWORD,
    dateOfBirth: DOB,
    termsAccepted: true,
    originalityAccepted: true,
  }, {
    'x-csrf-token': s3csrf,
    'Cookie': `phase11_csrf=${s3csrfCookie}`,
  });
  check('duplicate register → 409', dupReg.status === 409, `got ${dupReg.status} body=${JSON.stringify(dupReg.body)}`);

  // 9. CSRF bypass attempt — POST without CSRF token
  console.log('[9] POST /api/auth/login (no CSRF token)');
  const nocsrf = await req('POST', '/api/auth/login', {
    email: EMAIL,
    password: PASSWORD,
  }, {});
  check('no-CSRF login → 403', nocsrf.status === 403, `got ${nocsrf.status} body=${JSON.stringify(nocsrf.body)}`);

  // Summary
  console.log('\n=== RESULTS ===');
  results.forEach((r) => console.log(r));
  console.log(`\nTOTAL: ${passed + failed} | PASS: ${passed} | FAIL: ${failed}`);
  if (failed === 0) {
    console.log('\n✅ STACK A AUTH SMOKE TEST: ALL PASS');
  } else {
    console.log('\n❌ STACK A AUTH SMOKE TEST: FAILURES DETECTED');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
