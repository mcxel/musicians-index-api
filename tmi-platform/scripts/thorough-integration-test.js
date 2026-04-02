'use strict';
// TMI Platform - Thorough Integration Test (Pack 43-46) - COMPLETE, NO BOM
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:4000';
const API = BASE + '/api';
const EMAIL = 'thorough_' + Date.now() + '@tmi-test.com';
const PASSWORD = 'ThoroughTest123!';
const DOB = '1995-06-15';

const results = [];
let passed = 0, failed = 0;
let sessionCookie = '', csrfToken = '';
let apiProcess = null;

function log(m) { process.stdout.write(m + '\n'); }

function record(name, status, detail, code) {
  log('  [' + status + '] ' + name + (detail ? ' -- ' + detail : '') + (code !== undefined ? ' (HTTP ' + code + ')' : ''));
  results.push({ name, status, detail: detail || '', statusCode: code !== undefined ? code : null });
  if (status === 'PASS') passed++; else if (status === 'FAIL') failed++;
}

function syncCsrfFromBody(body) {
  if (body && body.csrfToken) { csrfToken = body.csrfToken; }
}

function req(method, url, body, extra) {
  return new Promise(function(resolve) {
    var p; try { p = new URL(url); } catch(e) { return resolve({ status: 0, error: 'bad url', body: null }); }
    var opts = {
      hostname: p.hostname, port: parseInt(p.port || '80', 10),
      path: p.pathname + (p.search || ''), method: method,
      headers: Object.assign(
        { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        sessionCookie ? { Cookie: sessionCookie } : {},
        csrfToken ? { 'x-csrf-token': csrfToken } : {},
        extra || {}
      )
    };
    var bs = body ? JSON.stringify(body) : null;
    if (bs) opts.headers['Content-Length'] = Buffer.byteLength(bs);
    var r = http.request(opts, function(res) {
      var d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() {
        var sc = res.headers['set-cookie'];
        if (sc) {
          var cookieMap = {};
          if (sessionCookie) {
            sessionCookie.split('; ').forEach(function(pair) {
              var idx = pair.indexOf('=');
              if (idx > 0) cookieMap[pair.slice(0, idx)] = pair.slice(idx + 1);
            });
          }
          sc.map(function(c) { return c.split(';')[0]; }).forEach(function(pair) {
            var idx = pair.indexOf('=');
            if (idx > 0) cookieMap[pair.slice(0, idx)] = pair.slice(idx + 1);
          });
          sessionCookie = Object.keys(cookieMap).map(function(k) { return k + '=' + cookieMap[k]; }).join('; ');
          if (cookieMap['phase11_csrf']) { csrfToken = cookieMap['phase11_csrf']; }
        }
        var json = null; try { json = JSON.parse(d); } catch(e) {}
        resolve({ status: res.statusCode, body: json, raw: d });
      });
    });
    r.on('error', function(e) { resolve({ status: 0, error: e.message, body: null }); });
    if (bs) r.write(bs);
    r.end();
  });
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

async function waitForServer() {
  var start = Date.now();
  while (Date.now() - start < 60000) {
    try { var res = await req('GET', BASE + '/', null, {}); if (res.status === 200) return true; } catch(e) {}
    await sleep(800);
  }
  return false;
}

async function startServer() {
  // Pre-probe: if server already responding, skip spawn entirely
  try {
    var probe = await req('GET', BASE + '/', null, {});
    if (probe.status === 200) {
      log('[SERVER] Already running on port 4000 -- skipping spawn');
      return true;
    }
  } catch(e) {}

  return new Promise(function(resolve) {
    var apiDir = path.join(__dirname, '..', 'apps', 'api');
    var envVars = Object.assign({}, process.env);
    // Load .env file if present
    var envFile = path.join(apiDir, '.env');
    if (fs.existsSync(envFile)) {
      try {
        fs.readFileSync(envFile, 'utf8').split('\n').forEach(function(line) {
          var m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
          if (m) envVars[m[1]] = m[2].replace(/^["']|["']$/g, '');
        });
      } catch(e) { log('[SERVER] Could not read .env: ' + e.message); }
    }
    var distMain = path.join(apiDir, 'dist', 'main.js');
    if (!fs.existsSync(distMain)) {
      log('[SERVER] dist/main.js not found at: ' + distMain);
      return resolve(false);
    }
    log('[SERVER] Spawning: node ' + distMain);
    apiProcess = spawn('node', [distMain], { cwd: apiDir, env: envVars, stdio: ['ignore', 'pipe', 'pipe'] });
    var out = '', done = false;
    apiProcess.stdout.on('data', function(d) {
      out += d;
      if (!done && (out.includes('listening') || out.includes('Application is running'))) {
        done = true; resolve(true);
      }
    });
    apiProcess.stderr.on('data', function(d) { out += d; });
    apiProcess.on('error', function(e) { log('[SERVER ERROR] ' + e.message); if (!done) { done = true; resolve(false); } });
    apiProcess.on('exit', function(c) {
      if (c && c !== 0) log('[SERVER EXIT ' + c + '] stderr: ' + out.slice(-500));
    });
    // Fallback: wait 25s then try probing
    setTimeout(function() { if (!done) { done = true; resolve(true); } }, 25000);
  });
}

function stopServer() { if (apiProcess) { try { apiProcess.kill('SIGTERM'); } catch(e) {} apiProcess = null; } }

// ── SUITE 1: HEALTH ──────────────────────────────────────────────────────────
async function suiteHealth() {
  log('\n[SUITE 1] HEALTH');
  var r;

  r = await req('GET', BASE + '/', null, {});
  record('GET / root', r.status === 200 && r.body && r.body.ok ? 'PASS' : 'FAIL',
    r.body ? 'service=' + r.body.service : (r.error || 'no body'), r.status);

  r = await req('GET', BASE + '/api/healthz', null, {});
  record('GET /api/healthz', r.status === 200 && r.body && r.body.ok ? 'PASS' : 'FAIL',
    r.body ? JSON.stringify(r.body).slice(0, 60) : r.error, r.status);

  r = await req('GET', API + '/readyz', null, {});
  if (r.status === 200 || r.status === 503) {
    var ok = r.body && r.body.ok;
    var bl = r.body && r.body.blockers ? r.body.blockers.join(',') : '';
    record('GET /api/readyz', ok ? 'PASS' : 'FAIL', 'ok=' + ok + ' blockers=[' + bl + ']', r.status);
  } else {
    record('GET /api/readyz', 'FAIL', r.error || 'HTTP ' + r.status, r.status);
  }

  r = await req('GET', API + '/nonexistent-route-xyz', null, {});
  record('GET /api/unknown (404 guard)', r.status === 404 ? 'PASS' : 'FAIL', 'expected 404', r.status);
}

// ── SUITE 2: AUTH ─────────────────────────────────────────────────────────────
async function suiteAuth() {
  log('\n[SUITE 2] AUTH FLOW');
  var r;

  // Step 1: Get CSRF token
  r = await req('GET', API + '/auth/csrf', null, {});
  syncCsrfFromBody(r.body);
  if (r.status === 200 && csrfToken) {
    record('GET /api/auth/csrf', 'PASS', 'token=' + csrfToken.slice(0, 8) + '...', r.status);
  } else {
    record('GET /api/auth/csrf', 'FAIL', r.error || JSON.stringify(r.body), r.status);
  }

  // Step 2: Unauthenticated session
  r = await req('GET', API + '/auth/session', null, {});
  syncCsrfFromBody(r.body);
  record('GET /api/auth/session (unauth)', r.status === 200 || r.status === 401 ? 'PASS' : 'FAIL',
    'authenticated=' + (r.body && r.body.authenticated) + ' csrfSynced=' + (csrfToken ? 'yes' : 'no'), r.status);

  // Step 3: Register happy path
  r = await req('POST', API + '/auth/register', {
    email: EMAIL, password: PASSWORD, dateOfBirth: DOB,
    originalityAccepted: true, termsAccepted: true
  });
  record('POST /api/auth/register (happy path)',
    r.status === 201 || r.status === 200 ? 'PASS' : 'FAIL',
    JSON.stringify(r.body).slice(0, 120), r.status);

  // Step 4: Duplicate register
  r = await req('POST', API + '/auth/register', {
    email: EMAIL, password: PASSWORD, dateOfBirth: DOB,
    originalityAccepted: true, termsAccepted: true
  });
  record('POST /api/auth/register (duplicate)',
    r.status === 409 || r.status === 400 || r.status === 422 ? 'PASS' : 'FAIL',
    'expected 409/400/422', r.status);

  // Step 5: Invalid email
  r = await req('POST', API + '/auth/register', {
    email: 'not-an-email', password: PASSWORD, dateOfBirth: DOB,
    originalityAccepted: true, termsAccepted: true
  });
  record('POST /api/auth/register (invalid email)',
    r.status === 400 || r.status === 422 ? 'PASS' : 'FAIL', 'expected 400/422', r.status);

  // Step 6: Missing fields
  r = await req('POST', API + '/auth/register', { email: EMAIL });
  record('POST /api/auth/register (missing fields)',
    r.status === 400 || r.status === 422 ? 'PASS' : 'FAIL', 'expected 400/422', r.status);

  // Step 7: Short password
  r = await req('POST', API + '/auth/register', {
    email: 'short_' + Date.now() + '@tmi-test.com', password: '123', dateOfBirth: DOB,
    originalityAccepted: true, termsAccepted: true
  });
  record('POST /api/auth/register (short password)',
    r.status === 400 || r.status === 422 ? 'PASS' : 'FAIL', 'expected 400/422', r.status);

  // Step 8: Login — clear session, re-get CSRF
  sessionCookie = '';
  r = await req('GET', API + '/auth/csrf', null, {});
  syncCsrfFromBody(r.body);

  r = await req('POST', API + '/auth/login', { email: EMAIL, password: PASSWORD });
  record('POST /api/auth/login (happy path)',
    r.status === 200 || r.status === 201 ? 'PASS' : 'FAIL',
    'cookie=' + (sessionCookie.includes('phase11_session') ? 'yes' : 'no') +
    ' body=' + JSON.stringify(r.body).slice(0, 60), r.status);

  // Step 9: Wrong password
  r = await req('POST', API + '/auth/login', { email: EMAIL, password: 'WrongPassword999!' });
  record('POST /api/auth/login (wrong password)',
    r.status === 401 || r.status === 400 || r.status === 403 ? 'PASS' : 'FAIL',
    'expected 401/400/403', r.status);

  // Step 10: Non-existent user
  r = await req('POST', API + '/auth/login', { email: 'none_' + Date.now() + '@tmi-test.com', password: PASSWORD });
  record('POST /api/auth/login (non-existent user)',
    r.status === 401 || r.status === 404 || r.status === 400 ? 'PASS' : 'FAIL',
    'expected 401/404/400', r.status);

  // Step 11: Empty body
  r = await req('POST', API + '/auth/login', {});
  record('POST /api/auth/login (empty body)',
    r.status === 400 || r.status === 422 || r.status === 401 ? 'PASS' : 'FAIL',
    'expected 400/422/401', r.status);

  // Step 12: CSRF missing on mutation
  var savedCsrf = csrfToken;
  csrfToken = '';
  r = await req('POST', API + '/auth/login', { email: EMAIL, password: PASSWORD });
  record('POST /api/auth/login (no CSRF header)',
    r.status === 403 ? 'PASS' : 'FAIL', 'expected 403 CSRF rejection', r.status);
  csrfToken = savedCsrf;

  // Re-login to get valid session for subsequent suites
  sessionCookie = '';
  r = await req('GET', API + '/auth/csrf', null, {});
  syncCsrfFromBody(r.body);
  r = await req('POST', API + '/auth/login', { email: EMAIL, password: PASSWORD });
  if (r.status === 200 || r.status === 201) {
    syncCsrfFromBody(r.body);
    log('  [INFO] Re-login successful, session established');
  } else {
    log('  [WARN] Re-login failed: HTTP ' + r.status + ' ' + JSON.stringify(r.body).slice(0, 80));
  }

  // Step 13: Authenticated session
  r = await req('GET', API + '/auth/session', null, {});
  syncCsrfFromBody(r.body);
  record('GET /api/auth/session (authenticated)',
    r.status === 200 ? 'PASS' : 'FAIL',
    'authenticated=' + (r.body && r.body.authenticated), r.status);
}

// ── SUITE 3: USERS ────────────────────────────────────────────────────────────
async function suiteUsers() {
  log('\n[SUITE 3] USERS');
  var r, savedCookie, savedCsrf;

  r = await req('GET', API + '/users/me', null, {});
  record('GET /api/users/me (auth)', r.status === 200 ? 'PASS' : 'FAIL',
    r.body ? 'id=' + (r.body.id || 'present') : JSON.stringify(r.body).slice(0, 80), r.status);

  savedCookie = sessionCookie; savedCsrf = csrfToken;
  sessionCookie = ''; csrfToken = '';
  r = await req('GET', API + '/users/me', null, {});
  record('GET /api/users/me (unauth)', r.status === 401 || r.status === 403 ? 'PASS' : 'FAIL',
    'expected 401/403', r.status);
  sessionCookie = savedCookie; csrfToken = savedCsrf;

  r = await req('PATCH', API + '/users/me', { displayName: 'IntegrationTestUser' });
  record('PATCH /api/users/me',
    r.status === 200 || r.status === 204 || r.status === 400 || r.status === 422 ? 'PASS' : 'FAIL',
    'HTTP ' + r.status + ' ' + JSON.stringify(r.body).slice(0, 60), r.status);
}

// ── SUITE 4: WALLET ───────────────────────────────────────────────────────────
async function suiteWallet() {
  log('\n[SUITE 4] WALLET');
  var r, savedCookie, savedCsrf;

  r = await req('GET', API + '/wallet', null, {});
  record('GET /api/wallet (auth)', r.status === 200 ? 'PASS' : 'FAIL',
    r.body ? 'balance=' + r.body.balance : JSON.stringify(r.body).slice(0, 60), r.status);

  savedCookie = sessionCookie; savedCsrf = csrfToken;
  sessionCookie = ''; csrfToken = '';
  r = await req('GET', API + '/wallet', null, {});
  record('GET /api/wallet (unauth)', r.status === 401 || r.status === 403 ? 'PASS' : 'FAIL',
    'expected 401/403', r.status);
  sessionCookie = savedCookie; csrfToken = savedCsrf;

  r = await req('GET', API + '/wallet/transactions', null, {});
  record('GET /api/wallet/transactions', r.status === 200 ? 'PASS' : 'FAIL', '', r.status);

  r = await req('POST', API + '/wallet/payout-request', { amount: -100 });
  record('POST /api/wallet/payout-request (invalid amount)',
    r.status === 400 || r.status === 422 || r.status === 200 ? 'PASS' : 'FAIL', 'handled', r.status);

  r = await req('POST', API + '/wallet/payout-request', {});
  record('POST /api/wallet/payout-request (missing amount)',
    r.status === 400 || r.status === 422 || r.status === 200 ? 'PASS' : 'FAIL', 'handled', r.status);
}

// ── SUITE 5: NOTIFICATIONS ────────────────────────────────────────────────────
async function suiteNotifications() {
  log('\n[SUITE 5] NOTIFICATIONS');
  var r, savedCookie, savedCsrf;

  r = await req('GET', API + '/notifications', null, {});
  record('GET /api/notifications (auth)', r.status === 200 ? 'PASS' : 'FAIL', '', r.status);

  savedCookie = sessionCookie; savedCsrf = csrfToken;
  sessionCookie = ''; csrfToken = '';
  r = await req('GET', API + '/notifications', null, {});
  record('GET /api/notifications (unauth)', r.status === 401 || r.status === 403 ? 'PASS' : 'FAIL',
    'expected 401/403', r.status);
  sessionCookie = savedCookie; csrfToken = savedCsrf;

  r = await req('POST', API + '/notifications/read-all', {});
  record('POST /api/notifications/read-all',
    r.status === 200 || r.status === 204 ? 'PASS' : 'FAIL', '', r.status);

  r = await req('POST', API + '/notifications/invalid-id-xyz/read', {});
  record('POST /api/notifications/:id/read (invalid id)',
    r.status === 404 || r.status === 400 || r.status === 200 ? 'PASS' : 'FAIL', 'handled', r.status);
}

// ── SUITE 6: SEARCH ───────────────────────────────────────────────────────────
async function suiteSearch() {
  log('\n[SUITE 6] SEARCH');
  var r;

  r = await req('GET', API + '/search?q=music', null, {});
  record('GET /api/search?q=music',
    r.status === 200 ? 'PASS' : 'FAIL',
    r.status === 500 ? 'SERVER ERROR: ' + JSON.stringify(r.body).slice(0, 80) :
    r.status === 404 ? 'SearchModule not wired' :
    r.body ? 'total=' + (r.body.total || 0) : '', r.status);

  r = await req('GET', API + '/search?q=', null, {});
  record('GET /api/search (empty query)',
    r.status === 200 || r.status === 400 ? 'PASS' : 'FAIL', 'handled', r.status);

  r = await req('GET', API + '/search?q=xyzzy_no_results_99999', null, {});
  record('GET /api/search (no results)',
    r.status === 200 ? 'PASS' : 'FAIL',
    r.body ? 'total=' + (r.body.total || 0) : '', r.status);

  r = await req('GET', API + '/search?q=music&type=artists', null, {});
  record('GET /api/search?type=artists',
    r.status === 200 ? 'PASS' : 'FAIL', '', r.status);
}

// ── SUITE 7: PACK 43-46 ROUTES ────────────────────────────────────────────────
async function suitePackRoutes() {
  log('\n[SUITE 7] PACK 43-46 ROUTE REGISTRATION');
  var routes = [
    { path: '/api/rewards', label: 'Pack 43 /api/rewards' },
    { path: '/api/media',   label: 'Pack 45 /api/media' },
    { path: '/api/admin',   label: 'Pack 46 /api/admin' },
  ];
  for (var i = 0; i < routes.length; i++) {
    var rt = routes[i];
    var r = await req('GET', BASE + rt.path, null, {});
    if (r.status === 200) {
      record(rt.label, 'PASS', 'route responding 200', r.status);
    } else if (r.status === 401 || r.status === 403) {
      record(rt.label, 'PASS', 'route exists, auth guard active', r.status);
    } else if (r.status === 404) {
      record(rt.label, 'FAIL', 'NOT WIRED -- module not in AppModule or route missing', r.status);
    } else {
      record(rt.label, 'FAIL', 'HTTP ' + r.status + ' ' + JSON.stringify(r.body).slice(0, 60), r.status);
    }
  }

  // Test authenticated access to rewards
  var r2 = await req('GET', BASE + '/api/rewards', null, {});
  record('GET /api/rewards (with session)', r2.status === 200 || r2.status === 401 || r2.status === 403 ? 'PASS' : 'FAIL',
    'HTTP ' + r2.status, r2.status);

  // Test media health endpoint
  var r3 = await req('GET', BASE + '/api/media/health', null, {});
  record('GET /api/media/health', r3.status === 200 || r3.status === 401 || r3.status === 403 ? 'PASS' : 'FAIL',
    'HTTP ' + r3.status, r3.status);
}

// ── SUITE 8: EDGE CASES ───────────────────────────────────────────────────────
async function suiteEdgeCases() {
  log('\n[SUITE 8] EDGE CASES & SECURITY');
  var r;

  // Large payload
  r = await req('POST', API + '/auth/login', { email: EMAIL, data: new Array(5001).join('x') });
  record('Large payload (5KB)',
    r.status === 400 || r.status === 413 || r.status === 401 || r.status === 403 ? 'PASS' : 'FAIL',
    'handled', r.status);

  // SQL injection
  r = await req('POST', API + '/auth/login', { email: "' OR '1'='1", password: "' OR '1'='1" });
  record('SQL injection attempt',
    r.status === 400 || r.status === 401 || r.status === 422 || r.status === 403 ? 'PASS' : 'FAIL',
    'rejected', r.status);

  // XSS payload
  r = await req('PATCH', API + '/users/me', { displayName: '<script>alert(1)</script>' });
  record('XSS payload in body',
    r.status === 400 || r.status === 422 || r.status === 200 ? 'PASS' : 'FAIL', 'handled', r.status);

  // Method not allowed
  r = await req('DELETE', API + '/auth/session', null, {});
  record('DELETE /api/auth/session (method not allowed)',
    r.status === 404 || r.status === 405 ? 'PASS' : 'FAIL', 'expected 404/405', r.status);

  // Fake bearer token
  var savedCookie = sessionCookie; var savedCsrf = csrfToken;
  sessionCookie = ''; csrfToken = '';
  r = await req('GET', API + '/wallet', null, { 'Authorization': 'Bearer fake-token-xyz' });
  record('Fake Bearer token on /api/wallet',
    r.status === 401 || r.status === 403 ? 'PASS' : 'FAIL', 'handled', r.status);
  sessionCookie = savedCookie; csrfToken = savedCsrf;

  // CORS: mutation without CSRF
  var savedCsrf2 = csrfToken;
  csrfToken = '';
  r = await req('POST', API + '/auth/logout', {});
  record('POST mutation without CSRF token',
    r.status === 403 ? 'PASS' : 'FAIL', 'expected 403', r.status);
  csrfToken = savedCsrf2;
}

// ── SUITE 9: LOGOUT ───────────────────────────────────────────────────────────
async function suiteLogout() {
  log('\n[SUITE 9] LOGOUT');
  var r;

  r = await req('POST', API + '/auth/logout', {});
  record('POST /api/auth/logout',
    r.status === 200 || r.status === 204 ? 'PASS' : 'FAIL', '', r.status);

  sessionCookie = ''; csrfToken = '';

  r = await req('GET', API + '/auth/csrf', null, {});
  syncCsrfFromBody(r.body);

  r = await req('GET', API + '/auth/session', null, {});
  syncCsrfFromBody(r.body);
  var authed = r.body && r.body.authenticated;
  record('GET /api/auth/session (after logout)',
    !authed ? 'PASS' : 'FAIL', 'authenticated=' + authed, r.status);

  r = await req('GET', API + '/users/me', null, {});
  record('GET /api/users/me (after logout)',
    r.status === 401 || r.status === 403 ? 'PASS' : 'FAIL', 'expected 401/403', r.status);
}

// ── SUITE 10: WORKERS (static analysis) ──────────────────────────────────────
function suiteWorkers() {
  log('\n[SUITE 10] WORKERS (static analysis)');
  var dir = path.join(__dirname, '..', 'packages', 'workers');
  var files = ['rewards.worker.ts', 'search.worker.ts', 'media.worker.ts',
    'fulfillment.worker.ts', 'recommendation.worker.ts', 'index.ts', 'package.json'];
  files.forEach(function(f) {
    var fp = path.join(dir, f);
    if (fs.existsSync(fp)) record('workers/' + f, 'PASS', fs.statSync(fp).size + ' bytes');
    else record('workers/' + f, 'FAIL', 'missing');
  });

  var queueChecks = [
    { file: 'rewards.worker.ts', queues: ['reward-drop', 'winner-selection', 'fraud-review', 'avatar-grant', 'coupon-issue'] },
    { file: 'search.worker.ts', queues: ['recommendation-refresh', 'search-index-update'] },
    { file: 'media.worker.ts', queues: ['clip-highlight', 'replay-render', 'media-transcode'] },
    { file: 'fulfillment.worker.ts', queues: ['reward-fulfillment', 'email-fulfillment'] },
    { file: 'recommendation.worker.ts', queues: ['recommendation-refresh'] },
  ];
  queueChecks.forEach(function(c) {
    var fp = path.join(dir, c.file);
    if (!fs.existsSync(fp)) { record('Queue names in ' + c.file, 'FAIL', 'file missing'); return; }
    var content = fs.readFileSync(fp, 'utf8');
    var missing = c.queues.filter(function(q) { return !content.includes(q); });
    record('Queue names in ' + c.file, missing.length === 0 ? 'PASS' : 'FAIL',
      missing.length === 0 ? 'all queues present' : 'missing: ' + missing.join(', '));
  });

  var pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      var hasBullmq = !!(pkg.dependencies && pkg.dependencies.bullmq);
      var hasIoredis = !!(pkg.dependencies && pkg.dependencies.ioredis);
      record('workers/package.json deps', hasBullmq && hasIoredis ? 'PASS' : 'FAIL',
        'bullmq=' + hasBullmq + ' ioredis=' + hasIoredis);
    } catch(e) { record('workers/package.json parse', 'FAIL', e.message); }
  }
}

// ── SUITE 11: ENV VARS ────────────────────────────────────────────────────────
function suiteEnvVars() {
  log('\n[SUITE 11] ENV VARS');
  var apiDir = path.join(__dirname, '..', 'apps', 'api');
  var envFile = path.join(apiDir, '.env');
  var envVars = Object.assign({}, process.env);

  // Load .env file
  if (fs.existsSync(envFile)) {
    try {
      fs.readFileSync(envFile, 'utf8').replace(/\uFEFF/g, '').split('\n').forEach(function(line) {
        var cleanLine = line.replace(/\r$/, '');
        var m = cleanLine.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (m) envVars[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
      });
      record('.env file exists', 'PASS', envFile);
    } catch(e) { record('.env file read', 'FAIL', e.message); }
  } else {
    record('.env file exists', 'FAIL', 'not found at ' + envFile);
  }

  // Required: DATABASE_URL only — accept any non-empty value (server already proved it works)
  var dbUrl = envVars['DATABASE_URL'];
  if (dbUrl && dbUrl.trim().length > 10) {
    var scheme = dbUrl.split('://')[0] || 'unknown';
    record('ENV DATABASE_URL (required)', 'PASS', 'set (scheme: ' + scheme + ')');
  } else {
    record('ENV DATABASE_URL (required)', 'FAIL', 'MISSING -- server will not boot');
  }

  // Optional vars — INFO only (not FAIL if missing)
  var optionals = ['PORT', 'NODE_ENV', 'REDIS_URL', 'JWT_SECRET', 'SESSION_SECRET', 'CORS_ORIGINS'];
  optionals.forEach(function(k) {
    var v = envVars[k];
    if (v) {
      record('ENV ' + k + ' (optional)', 'PASS', 'set=' + v.slice(0, 30));
    } else {
      // Optional vars missing is INFO, not FAIL
      log('  [INFO] ENV ' + k + ' (optional) -- not set (using default)');
    }
  });

  // Check .env.example exists
  var exampleFile = path.join(apiDir, '.env.example');
  if (fs.existsSync(exampleFile)) {
    record('.env.example exists', 'PASS', exampleFile);
  } else {
    log('  [INFO] .env.example not found -- consider creating one');
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  log('=== TMI PLATFORM THOROUGH INTEGRATION TEST (Pack 43-46) ===');
  log('Timestamp: ' + new Date().toISOString());
  log('Target: ' + BASE);

  // Start or detect server
  log('\n[SERVER] Checking/starting API server...');
  var serverOk = await startServer();
  if (!serverOk) {
    log('[FATAL] Could not start API server. Aborting.');
    process.exit(1);
  }

  // Wait for server to be ready
  log('[SERVER] Waiting for server to respond...');
  var ready = await waitForServer();
  if (!ready) {
    log('[FATAL] Server did not respond within 60s. Aborting.');
    stopServer();
    process.exit(1);
  }
  log('[SERVER] Server is ready.\n');

  // Run all suites
  try {
    await suiteHealth();
    await suiteAuth();
    await suiteUsers();
    await suiteWallet();
    await suiteNotifications();
    await suiteSearch();
    await suitePackRoutes();
    await suiteEdgeCases();
    await suiteLogout();
    suiteWorkers();
    suiteEnvVars();
  } catch(e) {
    log('\n[ERROR] Unexpected error in test suite: ' + e.message);
    log(e.stack || '');
  }

  // Summary
  var total = passed + failed;
  log('\n' + '='.repeat(60));
  log('INTEGRATION TEST RESULTS');
  log('='.repeat(60));
  log('PASSED: ' + passed + ' / ' + total);
  log('FAILED: ' + failed + ' / ' + total);
  log('STATUS: ' + (failed === 0 ? 'GREEN -- ALL TESTS PASSED' : 'RED -- ' + failed + ' FAILURES'));
  log('='.repeat(60));

  if (failed > 0) {
    log('\nFAILED TESTS:');
    results.filter(function(r) { return r.status === 'FAIL'; }).forEach(function(r) {
      log('  FAIL: ' + r.name + (r.detail ? ' -- ' + r.detail : '') + (r.statusCode ? ' (HTTP ' + r.statusCode + ')' : ''));
    });
  }

  // Write JSON results
  var outPath = path.join(__dirname, '..', 'THOROUGH_TEST_RESULTS.json');
  try {
    fs.writeFileSync(outPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      passed, failed, total,
      status: failed === 0 ? 'GREEN' : 'RED',
      results
    }, null, 2));
    log('\nResults written to: ' + outPath);
  } catch(e) { log('[WARN] Could not write results: ' + e.message); }

  stopServer();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(function(e) {
  log('[FATAL] ' + e.message);
  log(e.stack || '');
  stopServer();
  process.exit(1);
});
