/**
 * Bootstrap Unit Tests — main.ts / readiness.ts pure-function coverage
 * Standalone Node.js — no Jest, no external deps required
 * Run: node tests/bootstrap-unit-test.js  (from tmi-platform/apps/api/)
 */

'use strict';

// ─── Load compiled readiness module ──────────────────────────────────────────
const path = require('path');
const readiness = require(path.join(__dirname, '../dist/modules/health/readiness'));

const {
  getBootEnvValidationErrors,
  validateBootEnvOrThrow,
  findMissingEnv,
  parseOptionalUpstreamTargets,
  parseOptionalUpstreamTimeoutOverrides,
  resolveBuildIdentity,
  normalizeReadinessReasons,
  shouldEmitReadinessAlert,
  reasonSetKey,
  buildReadinessResponse,
  isReadinessDegradedForAlert,
} = readiness;

// ─── Minimal test harness ─────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];

function assert(name, condition, detail) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}${detail ? ' — ' + detail : ''}`);
    failed++;
    failures.push({ name, detail });
  }
}

function suite(name, fn) {
  console.log(`\n[SUITE] ${name}`);
  fn();
}

// ─── SUITE 1: getBootEnvValidationErrors ─────────────────────────────────────
suite('getBootEnvValidationErrors', () => {
  assert(
    'returns error when DATABASE_URL missing',
    getBootEnvValidationErrors({}).length > 0,
  );

  assert(
    'returns error when DATABASE_URL has invalid scheme',
    getBootEnvValidationErrors({ DATABASE_URL: 'mysql://localhost/db' }).some(e =>
      e.includes('DATABASE_URL'),
    ),
  );

  assert(
    'accepts postgresql:// scheme',
    getBootEnvValidationErrors({ DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' }).length === 0,
  );

  assert(
    'accepts postgres:// scheme',
    getBootEnvValidationErrors({ DATABASE_URL: 'postgres://user:pass@localhost:5432/db' }).length === 0,
  );

  assert(
    'rejects invalid NODE_ENV',
    getBootEnvValidationErrors({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      NODE_ENV: 'staging',
    }).some(e => e.includes('NODE_ENV')),
  );

  assert(
    'accepts valid NODE_ENV=production',
    getBootEnvValidationErrors({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      NODE_ENV: 'production',
    }).length === 0,
  );

  assert(
    'accepts valid NODE_ENV=development',
    getBootEnvValidationErrors({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      NODE_ENV: 'development',
    }).length === 0,
  );

  assert(
    'rejects PORT=0',
    getBootEnvValidationErrors({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      PORT: '0',
    }).some(e => e.includes('PORT')),
  );

  assert(
    'rejects PORT=99999',
    getBootEnvValidationErrors({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      PORT: '99999',
    }).some(e => e.includes('PORT')),
  );

  assert(
    'accepts PORT=4000',
    getBootEnvValidationErrors({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      PORT: '4000',
    }).length === 0,
  );

  assert(
    'rejects invalid CORS_ORIGINS',
    getBootEnvValidationErrors({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      CORS_ORIGINS: 'not-a-url',
    }).some(e => e.includes('CORS_ORIGINS')),
  );

  assert(
    'accepts wildcard CORS_ORIGINS=*',
    getBootEnvValidationErrors({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      CORS_ORIGINS: '*',
    }).length === 0,
  );

  assert(
    'accepts valid CORS_ORIGINS URL',
    getBootEnvValidationErrors({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      CORS_ORIGINS: 'http://localhost:3000',
    }).length === 0,
  );
});

// ─── SUITE 2: validateBootEnvOrThrow ─────────────────────────────────────────
suite('validateBootEnvOrThrow', () => {
  const origEnv = process.env.DATABASE_URL;

  process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
  let threw = false;
  try {
    validateBootEnvOrThrow();
  } catch {
    threw = true;
  }
  assert('does not throw with valid DATABASE_URL', !threw);

  delete process.env.DATABASE_URL;
  threw = false;
  try {
    validateBootEnvOrThrow();
  } catch {
    threw = true;
  }
  assert('throws when DATABASE_URL missing', threw);

  // Restore
  if (origEnv) process.env.DATABASE_URL = origEnv;
  else delete process.env.DATABASE_URL;
});

// ─── SUITE 3: findMissingEnv ──────────────────────────────────────────────────
suite('findMissingEnv', () => {
  const origEnv = { ...process.env };

  process.env.TEST_VAR_A = 'hello';
  delete process.env.TEST_VAR_B;

  assert(
    'finds missing env var',
    findMissingEnv(['TEST_VAR_A', 'TEST_VAR_B']).includes('TEST_VAR_B'),
  );

  assert(
    'does not flag present env var',
    !findMissingEnv(['TEST_VAR_A']).includes('TEST_VAR_A'),
  );

  assert(
    'returns empty array when all present',
    findMissingEnv(['TEST_VAR_A']).length === 0,
  );

  delete process.env.TEST_VAR_A;
});

// ─── SUITE 4: parseOptionalUpstreamTargets ────────────────────────────────────
suite('parseOptionalUpstreamTargets', () => {
  assert(
    'parses single URL',
    parseOptionalUpstreamTargets('http://a.com').length === 1,
  );

  assert(
    'parses comma-separated URLs',
    parseOptionalUpstreamTargets('http://a.com,http://b.com').length === 2,
  );

  assert(
    'trims whitespace',
    parseOptionalUpstreamTargets(' http://a.com , http://b.com ').every(u => !u.startsWith(' ')),
  );

  assert(
    'returns empty array for empty string',
    parseOptionalUpstreamTargets('').length === 0,
  );

  assert(
    'filters blank entries',
    parseOptionalUpstreamTargets('http://a.com,,http://b.com').length === 2,
  );
});

// ─── SUITE 5: parseOptionalUpstreamTimeoutOverrides ──────────────────────────
suite('parseOptionalUpstreamTimeoutOverrides', () => {
  assert(
    'returns empty object for undefined',
    Object.keys(parseOptionalUpstreamTimeoutOverrides(undefined)).length === 0,
  );

  assert(
    'returns empty object for empty string',
    Object.keys(parseOptionalUpstreamTimeoutOverrides('')).length === 0,
  );

  assert(
    'parses numeric timeout',
    parseOptionalUpstreamTimeoutOverrides('{"http://a.com": 500}')['http://a.com'] === 500,
  );

  assert(
    'parses object with timeoutMs',
    parseOptionalUpstreamTimeoutOverrides('{"http://a.com": {"timeoutMs": 300}}')['http://a.com'] === 300,
  );

  assert(
    'returns empty object for invalid JSON',
    Object.keys(parseOptionalUpstreamTimeoutOverrides('not-json')).length === 0,
  );

  assert(
    'clamps timeout to max 10000',
    parseOptionalUpstreamTimeoutOverrides('{"http://a.com": 99999}')['http://a.com'] === 10000,
  );
});

// ─── SUITE 6: resolveBuildIdentity ───────────────────────────────────────────
suite('resolveBuildIdentity', () => {
  const id1 = resolveBuildIdentity({});
  assert('returns null commitSha when not set', id1.commitSha === null);
  assert('returns null releaseTag when not set', id1.releaseTag === null);
  assert('returns null appVersion when not set', id1.appVersion === null);
  assert('returns "unknown" revision when nothing set', id1.revision === 'unknown');

  const id2 = resolveBuildIdentity({ BUILD_COMMIT_SHA: 'abc123' });
  assert('returns commitSha when set', id2.commitSha === 'abc123');
  assert('uses commitSha as revision', id2.revision === 'abc123');

  const id3 = resolveBuildIdentity({ BUILD_RELEASE_TAG: 'v1.0.0' });
  assert('returns releaseTag when set', id3.releaseTag === 'v1.0.0');
  assert('uses releaseTag as revision when no commitSha', id3.revision === 'v1.0.0');
});

// ─── SUITE 7: normalizeReadinessReasons ──────────────────────────────────────
suite('normalizeReadinessReasons', () => {
  const healthyChecks = {
    env: { ok: true, missing: [] },
    database: { ok: true },
    cache: { ok: true, configured: false },
    upstreams: { ok: true, targets: [] },
  };

  assert(
    'returns empty array for healthy checks',
    normalizeReadinessReasons(healthyChecks, true).length === 0,
  );

  const envFailChecks = {
    ...healthyChecks,
    env: { ok: false, missing: ['DATABASE_URL'] },
  };
  assert(
    'returns env_invalid when env fails',
    normalizeReadinessReasons(envFailChecks, false).includes('env_invalid'),
  );

  const dbFailChecks = {
    ...healthyChecks,
    database: { ok: false },
  };
  assert(
    'returns database_unready when db fails',
    normalizeReadinessReasons(dbFailChecks, false).includes('database_unready'),
  );

  const cacheFailChecks = {
    ...healthyChecks,
    cache: { ok: false, configured: true },
  };
  assert(
    'returns cache_unready when cache configured and fails',
    normalizeReadinessReasons(cacheFailChecks, false).includes('cache_unready'),
  );

  const cacheNotConfiguredChecks = {
    ...healthyChecks,
    cache: { ok: false, configured: false },
  };
  assert(
    'does NOT return cache_unready when cache not configured',
    !normalizeReadinessReasons(cacheNotConfiguredChecks, true).includes('cache_unready'),
  );

  const unknownFailChecks = { ...healthyChecks };
  assert(
    'returns unknown_dependency_failure when ok=false but no specific reason',
    normalizeReadinessReasons(unknownFailChecks, false).includes('unknown_dependency_failure'),
  );
});

// ─── SUITE 8: reasonSetKey ────────────────────────────────────────────────────
suite('reasonSetKey', () => {
  assert(
    'returns empty string for empty array',
    reasonSetKey([]) === '',
  );

  assert(
    'returns single reason',
    reasonSetKey(['env_invalid']) === 'env_invalid',
  );

  assert(
    'sorts reasons alphabetically',
    reasonSetKey(['database_unready', 'env_invalid']) === 'database_unready|env_invalid',
  );

  assert(
    'deduplicates reasons',
    reasonSetKey(['env_invalid', 'env_invalid']).split('|').length === 1,
  );
});

// ─── SUITE 9: shouldEmitReadinessAlert ───────────────────────────────────────
suite('shouldEmitReadinessAlert', () => {
  const base = {
    degraded: true,
    reasons: ['database_unready'],
    consecutiveDegradedCount: 3,
    alertThreshold: 3,
    alertCooldownMs: 60000,
    nowMs: 200000,
    lastAlertAtMs: 0,
    lastAlertReasonSetKey: '',
  };

  assert(
    'emits alert when degraded and threshold met',
    shouldEmitReadinessAlert(base).shouldEmit === true,
  );

  assert(
    'does not emit when not degraded',
    shouldEmitReadinessAlert({ ...base, degraded: false }).shouldEmit === false,
  );

  assert(
    'does not emit when below threshold',
    shouldEmitReadinessAlert({ ...base, consecutiveDegradedCount: 2 }).shouldEmit === false,
  );

  assert(
    'does not emit during cooldown with same reason set',
    shouldEmitReadinessAlert({
      ...base,
      nowMs: 10000,
      lastAlertAtMs: 5000,
      lastAlertReasonSetKey: 'database_unready',
    }).shouldEmit === false,
  );

  assert(
    'emits during cooldown if reason set changed',
    shouldEmitReadinessAlert({
      ...base,
      nowMs: 10000,
      lastAlertAtMs: 5000,
      lastAlertReasonSetKey: 'env_invalid',
    }).shouldEmit === true,
  );
});

// ─── SUITE 10: buildReadinessResponse ────────────────────────────────────────
suite('buildReadinessResponse', () => {
  const healthyChecks = {
    env: { ok: true, missing: [] },
    database: { ok: true },
    cache: { ok: false, configured: false },
    upstreams: { ok: true, targets: [] },
  };

  const resp = buildReadinessResponse(healthyChecks);

  assert('ok=true for healthy checks', resp.ok === true);
  assert('service name correct', resp.service === 'tmi-platform-api');
  assert('has timestamp', typeof resp.timestamp === 'string');
  assert('has contract name', resp.contract.name === 'tmi-platform-readyz');
  assert('has contract version', resp.contract.version === '1.0');
  assert('blockers empty for healthy', resp.blockers.length === 0);

  const failChecks = {
    ...healthyChecks,
    database: { ok: false },
  };
  const failResp = buildReadinessResponse(failChecks);
  assert('ok=false when database fails', failResp.ok === false);
  assert('blockers non-empty when database fails', failResp.blockers.length > 0);
  assert(
    'blocker mentions database',
    failResp.blockers.some(b => b.includes('database')),
  );
});

// ─── SUITE 11: isReadinessDegradedForAlert ────────────────────────────────────
suite('isReadinessDegradedForAlert', () => {
  const healthyChecks = {
    env: { ok: true, missing: [] },
    database: { ok: true },
    cache: { ok: false, configured: false },
    upstreams: { ok: true, targets: [] },
  };

  const result = isReadinessDegradedForAlert(healthyChecks, true);
  assert('not degraded for healthy system', result.degraded === false);
  assert('no reasons for healthy system', result.reasons.length === 0);

  const failChecks = {
    ...healthyChecks,
    database: { ok: false },
  };
  const failResult = isReadinessDegradedForAlert(failChecks, false);
  assert('degraded when database fails', failResult.degraded === true);
  assert('has database_unready reason', failResult.reasons.includes('database_unready'));
});

// ─── RESULTS ──────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log(`BOOTSTRAP UNIT TEST RESULTS`);
console.log('='.repeat(60));
console.log(`Total:  ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  - ${f.name}${f.detail ? ': ' + f.detail : ''}`));
}

console.log('='.repeat(60));
process.exit(failed > 0 ? 1 : 0);
