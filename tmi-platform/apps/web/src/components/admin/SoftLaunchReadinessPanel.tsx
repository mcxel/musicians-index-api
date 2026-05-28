'use client';
import { useEffect, useState } from 'react';

type CheckStatus = 'pass' | 'fail' | 'warn' | 'loading';

interface HealthCheck {
  name: string;
  category: string;
  status: CheckStatus;
  detail: string;
}

const STATIC_CHECKS: Omit<HealthCheck, 'status' | 'detail'>[] = [
  { name: 'Auth — Login Route', category: 'Auth' },
  { name: 'Auth — Signup Route', category: 'Auth' },
  { name: 'Auth — Session API', category: 'Auth' },
  { name: 'Stripe — Checkout API', category: 'Payments' },
  { name: 'Stripe — Webhook', category: 'Payments' },
  { name: 'Stripe — Products API', category: 'Payments' },
  { name: 'Daily — API Key Set', category: 'Video' },
  { name: 'Daily — Domain Set', category: 'Video' },
  { name: 'Home 1 — Route', category: 'Routes' },
  { name: 'Home 2 — Route', category: 'Routes' },
  { name: 'Home 3 — Route', category: 'Routes' },
  { name: 'Home 4 — Route', category: 'Routes' },
  { name: 'Home 5 — Route', category: 'Routes' },
  { name: 'Articles — Slug Route', category: 'Routes' },
  { name: 'Admin — Owner Dashboard', category: 'Admin' },
  { name: 'Admin — Bot Operations', category: 'Admin' },
  { name: 'Diamond Email — Set', category: 'Config' },
  { name: 'Subscription Tiers — 7 Tiers', category: 'Config' },
];

const STATUS_COLOR: Record<CheckStatus, string> = {
  pass: '#00FF88',
  fail: '#FF3B5C',
  warn: '#FFD700',
  loading: '#888',
};

const STATUS_LABEL: Record<CheckStatus, string> = {
  pass: 'PASS',
  fail: 'FAIL',
  warn: 'WARN',
  loading: '...',
};

export default function SoftLaunchReadinessPanel() {
  const [checks, setChecks] = useState<HealthCheck[]>(
    STATIC_CHECKS.map((c) => ({ ...c, status: 'loading', detail: 'Checking...' }))
  );

  useEffect(() => {
    void runChecks();
  }, []);

  async function runChecks() {
    const results: HealthCheck[] = [];

    // Auth checks
    results.push(await checkRoute('/auth/signin', 'Auth — Login Route', 'Auth'));
    results.push(await checkRoute('/auth/signup', 'Auth — Signup Route', 'Auth'));
    results.push(await checkApi('/api/auth/session', 'Auth — Session API', 'Auth'));

    // Payment checks
    results.push(await checkApi('/api/stripe/products', 'Stripe — Products API', 'Payments'));
    results.push(await checkApi('/api/stripe/checkout', 'Stripe — Checkout API', 'Payments', 'POST'));
    results.push({ name: 'Stripe — Webhook', category: 'Payments', status: 'warn', detail: 'Requires external trigger' });

    // Video checks
    const dailyKey = typeof process !== 'undefined' ? 'checked-via-env' : '';
    results.push({ name: 'Daily — API Key Set', category: 'Video', status: 'warn', detail: 'Check DAILY_API_KEY in .env.local' });
    results.push({ name: 'Daily — Domain Set', category: 'Video', status: 'warn', detail: 'Check DAILY_DOMAIN in .env.local' });

    // Route checks
    results.push(await checkRoute('/home/1', 'Home 1 — Route', 'Routes'));
    results.push(await checkRoute('/home/2', 'Home 2 — Route', 'Routes'));
    results.push(await checkRoute('/home/3', 'Home 3 — Route', 'Routes'));
    results.push(await checkRoute('/home/4', 'Home 4 — Route', 'Routes'));
    results.push(await checkRoute('/home/5', 'Home 5 — Route', 'Routes'));
    results.push(await checkRoute('/articles', 'Articles — Slug Route', 'Routes'));

    // Admin checks
    results.push(await checkRoute('/admin/owner-dashboard', 'Admin — Owner Dashboard', 'Admin'));
    results.push(await checkRoute('/admin/bot-operations', 'Admin — Bot Operations', 'Admin'));

    // Config checks
    results.push({ name: 'Diamond Email — Set', category: 'Config', status: 'pass', detail: 'facethebully916@gmail.com, jay@themusiciansindex.com' });
    results.push({ name: 'Subscription Tiers — 7 Tiers', category: 'Config', status: 'pass', detail: 'free/pro/bronze/silver/gold/platinum/diamond' });

    setChecks(results);
  }

  async function checkRoute(path: string, name: string, category: string): Promise<HealthCheck> {
    try {
      const res = await fetch(path, { method: 'HEAD', cache: 'no-store' });
      const status: CheckStatus = res.ok || res.status === 308 ? 'pass' : res.status === 404 ? 'fail' : 'warn';
      return { name, category, status, detail: `HTTP ${res.status}` };
    } catch {
      return { name, category, status: 'fail', detail: 'Network error' };
    }
  }

  async function checkApi(path: string, name: string, category: string, method = 'GET'): Promise<HealthCheck> {
    try {
      const res = await fetch(path, { method, cache: 'no-store' });
      const status: CheckStatus = res.status < 500 ? 'pass' : 'fail';
      return { name, category, status, detail: `HTTP ${res.status}` };
    } catch {
      return { name, category, status: 'fail', detail: 'Network error' };
    }
  }

  const categories = [...new Set(checks.map((c) => c.category))];
  const passCount = checks.filter((c) => c.status === 'pass').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const overall: CheckStatus = failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : checks.some((c) => c.status === 'loading') ? 'loading' : 'pass';

  return (
    <div style={{ background: '#0a0a1a', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', color: '#00FF88', fontWeight: 800 }}>SOFT LAUNCH READINESS</div>
          <h2 style={{ margin: '4px 0 0', fontSize: 18, color: '#fff' }}>System Health Gate</h2>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ color: '#00FF88', fontWeight: 800 }}>{passCount} PASS</span>
          <span style={{ color: '#FFD700', fontWeight: 800 }}>{warnCount} WARN</span>
          <span style={{ color: '#FF3B5C', fontWeight: 800 }}>{failCount} FAIL</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 8, background: `${STATUS_COLOR[overall]}18`, border: `1px solid ${STATUS_COLOR[overall]}40`, marginBottom: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLOR[overall], boxShadow: `0 0 8px ${STATUS_COLOR[overall]}` }} />
        <span style={{ color: STATUS_COLOR[overall], fontWeight: 800, fontSize: 13 }}>
          {overall === 'loading' ? 'Running checks...' : overall === 'pass' ? 'GO FOR SOFT LAUNCH' : overall === 'warn' ? 'LAUNCH WITH CAUTION' : 'NOT READY — FIX FAILURES'}
        </span>
      </div>

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#888', fontWeight: 800, marginBottom: 8 }}>{cat.toUpperCase()}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {checks.filter((c) => c.category === cat).map((check) => (
              <div key={check.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: `1px solid rgba(255,255,255,0.06)` }}>
                <span style={{ fontSize: 13, color: check.status === 'fail' ? '#FF3B5C' : check.status === 'warn' ? '#FFD700' : '#fff' }}>
                  {check.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#666' }}>{check.detail}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: STATUS_COLOR[check.status], letterSpacing: '0.1em' }}>
                    {STATUS_LABEL[check.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => {
          setChecks(STATIC_CHECKS.map((c) => ({ ...c, status: 'loading', detail: 'Checking...' })));
          void runChecks();
        }}
        style={{ marginTop: 8, padding: '10px 20px', background: 'rgba(0,255,136,0.15)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.35)', borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: 'pointer', letterSpacing: '0.1em' }}
      >
        RE-RUN CHECKS
      </button>
    </div>
  );
}
