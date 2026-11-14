/**
 * Fail-closed Preview financial isolation (§32 release safety).
 *
 * Vercel Preview must never process live Stripe keys or share an unverified
 * production database. When VERCEL_ENV=preview:
 * - sk_live_ / rk_live_ secrets refuse Stripe client creation
 * - DATABASE_URL / DIRECT_URL that match an explicit production fingerprint
 *   (PRODUCTION_DATABASE_HOST_FINGERPRINT) refuse boot for money paths
 *
 * This does not configure Vercel — it stops a misconfigured Preview from
 * touching live money if a live key or production DB host leaks into Preview.
 */

export type PreviewFinancialIsolationResult = {
  ok: boolean;
  vercelEnv: string | null;
  stripeMode: 'missing' | 'placeholder' | 'test' | 'live' | 'restricted_test' | 'restricted_live' | 'unknown';
  databaseBlocked: boolean;
  reason?: string;
};

function normalizeKey(raw: string | undefined | null): string {
  return (raw || '').trim();
}

function isPlaceholderKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return (
    normalized.endsWith('_xxx') ||
    normalized.includes('replace_me') ||
    normalized.includes('your_') ||
    normalized === 'sk_test_xxx' ||
    normalized === 'sk_live_xxx'
  );
}

export function classifyStripeSecretMode(raw: string | undefined | null): PreviewFinancialIsolationResult['stripeMode'] {
  const key = normalizeKey(raw);
  if (!key) return 'missing';
  if (isPlaceholderKey(key)) return 'placeholder';
  if (key.startsWith('sk_test_')) return 'test';
  if (key.startsWith('sk_live_')) return 'live';
  if (key.startsWith('rk_test_')) return 'restricted_test';
  if (key.startsWith('rk_live_')) return 'restricted_live';
  return 'unknown';
}

export function isVercelPreviewRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  return (env.VERCEL_ENV || '').trim().toLowerCase() === 'preview';
}

function databaseHostMatchesProductionFingerprint(
  databaseUrl: string | undefined,
  fingerprint: string | undefined,
): boolean {
  const url = (databaseUrl || '').trim();
  const fp = (fingerprint || '').trim().toLowerCase();
  if (!url || !fp) return false;
  return url.toLowerCase().includes(fp);
}

/**
 * Evaluate Preview financial isolation. Safe to call with process.env;
 * never logs secret material.
 */
export function evaluatePreviewFinancialIsolation(
  env: NodeJS.ProcessEnv = process.env,
): PreviewFinancialIsolationResult {
  const vercelEnv = (env.VERCEL_ENV || '').trim() || null;
  const stripeMode = classifyStripeSecretMode(env.STRIPE_SECRET_KEY);
  const fingerprint = env.PRODUCTION_DATABASE_HOST_FINGERPRINT;
  const databaseBlocked =
    isVercelPreviewRuntime(env) &&
    (databaseHostMatchesProductionFingerprint(env.DATABASE_URL, fingerprint) ||
      databaseHostMatchesProductionFingerprint(env.DIRECT_URL, fingerprint));

  if (!isVercelPreviewRuntime(env)) {
    return { ok: true, vercelEnv, stripeMode, databaseBlocked: false };
  }

  if (stripeMode === 'live' || stripeMode === 'restricted_live') {
    return {
      ok: false,
      vercelEnv,
      stripeMode,
      databaseBlocked,
      reason: 'PREVIEW_LIVE_STRIPE_KEY_BLOCKED',
    };
  }

  if (databaseBlocked) {
    return {
      ok: false,
      vercelEnv,
      stripeMode,
      databaseBlocked: true,
      reason: 'PREVIEW_PRODUCTION_DATABASE_FINGERPRINT_BLOCKED',
    };
  }

  return { ok: true, vercelEnv, stripeMode, databaseBlocked: false };
}

/**
 * Throws when Preview would use live Stripe or a fingerprinted production DB.
 * Call from money-path entrypoints (Stripe client, webhook).
 */
export function assertPreviewFinancialIsolation(env: NodeJS.ProcessEnv = process.env): void {
  const result = evaluatePreviewFinancialIsolation(env);
  if (!result.ok) {
    throw new Error(
      `[PreviewFinancialIsolation] ${result.reason || 'BLOCKED'} — Preview cannot use live Stripe or production DB. Isolate Preview env vars (test Stripe + non-prod DATABASE_URL) or unset PRODUCTION_DATABASE_HOST_FINGERPRINT after verifying isolation.`,
    );
  }
}

/**
 * Stripe client gate: Preview + live key → null (fail closed, no throw at import).
 */
export function allowStripeClientInCurrentRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  if (!isVercelPreviewRuntime(env)) return true;
  const mode = classifyStripeSecretMode(env.STRIPE_SECRET_KEY);
  return mode !== 'live' && mode !== 'restricted_live';
}
