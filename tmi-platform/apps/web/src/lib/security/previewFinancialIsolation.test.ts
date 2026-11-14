import {
  allowStripeClientInCurrentRuntime,
  assertPreviewFinancialIsolation,
  classifyStripeSecretMode,
  evaluatePreviewFinancialIsolation,
} from './previewFinancialIsolation';

describe('previewFinancialIsolation', () => {
  it('classifies Stripe secret modes without needing network', () => {
    expect(classifyStripeSecretMode(undefined)).toBe('missing');
    expect(classifyStripeSecretMode('sk_test_abc')).toBe('test');
    expect(classifyStripeSecretMode('sk_live_abc')).toBe('live');
    expect(classifyStripeSecretMode('rk_live_abc')).toBe('restricted_live');
    expect(classifyStripeSecretMode('sk_live_xxx')).toBe('placeholder');
  });

  function envOf(partial: Record<string, string>): NodeJS.ProcessEnv {
    return partial as unknown as NodeJS.ProcessEnv;
  }

  it('allows non-preview runtimes even with a live-shaped key present', () => {
    const env = envOf({
      VERCEL_ENV: 'production',
      STRIPE_SECRET_KEY: 'sk_live_example_not_used',
    });
    expect(evaluatePreviewFinancialIsolation(env).ok).toBe(true);
    expect(allowStripeClientInCurrentRuntime(env)).toBe(true);
  });

  it('blocks Preview when a live Stripe secret is configured', () => {
    const env = envOf({
      VERCEL_ENV: 'preview',
      STRIPE_SECRET_KEY: 'sk_live_example_not_used',
    });
    const result = evaluatePreviewFinancialIsolation(env);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('PREVIEW_LIVE_STRIPE_KEY_BLOCKED');
    expect(allowStripeClientInCurrentRuntime(env)).toBe(false);
    expect(() => assertPreviewFinancialIsolation(env)).toThrow(/PREVIEW_LIVE_STRIPE_KEY_BLOCKED/);
  });

  it('allows Preview with a test Stripe secret', () => {
    const env = envOf({
      VERCEL_ENV: 'preview',
      STRIPE_SECRET_KEY: 'sk_test_example_not_used',
    });
    expect(evaluatePreviewFinancialIsolation(env).ok).toBe(true);
    expect(allowStripeClientInCurrentRuntime(env)).toBe(true);
  });

  it('blocks Preview when DATABASE_URL matches production host fingerprint', () => {
    const env = envOf({
      VERCEL_ENV: 'preview',
      STRIPE_SECRET_KEY: 'sk_test_example_not_used',
      PRODUCTION_DATABASE_HOST_FINGERPRINT: 'prod-neon-host.example',
      DATABASE_URL: 'postgresql://u:p@prod-neon-host.example/db',
    });
    const result = evaluatePreviewFinancialIsolation(env);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('PREVIEW_PRODUCTION_DATABASE_FINGERPRINT_BLOCKED');
  });
});
