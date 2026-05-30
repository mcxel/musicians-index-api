'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProofStatus = 'pass' | 'fail' | 'warn' | 'pending' | 'manual';

interface CheckItem {
  label: string;
  detail: string;
  status: ProofStatus;
  actionLabel?: string;
  actionHref?: string;
}

interface ProofArea {
  id: string;
  icon: string;
  title: string;
  color: string;
  status: ProofStatus;
  items: CheckItem[];
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<ProofStatus, string> = {
  pass:    '#00FF88',
  fail:    '#FF4444',
  warn:    '#FFD700',
  pending: '#666688',
  manual:  '#00C8FF',
};

const STATUS_LABEL: Record<ProofStatus, string> = {
  pass:    '✓ PASS',
  fail:    '✗ FAIL',
  warn:    '⚠ WARN',
  pending: '· · ·',
  manual:  '● MANUAL',
};

function areaRollup(items: CheckItem[]): ProofStatus {
  if (items.every(i => i.status === 'manual')) return 'manual';
  if (items.some(i => i.status === 'fail'))    return 'fail';
  if (items.some(i => i.status === 'pending')) return 'pending';
  if (items.some(i => i.status === 'warn'))    return 'warn';
  if (items.some(i => i.status === 'manual'))  return 'warn';
  return 'pass';
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function overallScore(areas: ProofArea[]): { score: number; label: string; color: string } {
  const weights = { pass: 1, warn: 0.5, manual: 0.5, fail: 0, pending: 0 };
  const total   = areas.length;
  const earned  = areas.reduce((sum, a) => sum + (weights[a.status] ?? 0), 0);
  const pct     = Math.round((earned / total) * 100);
  if (pct >= 100) return { score: pct, label: 'LAUNCH READY',    color: '#00FF88' };
  if (pct >= 80)  return { score: pct, label: 'NEARLY READY',    color: '#FFD700' };
  if (pct >= 60)  return { score: pct, label: 'GAPS REMAIN',     color: '#FF9500' };
  return           { score: pct, label: 'NOT READY',             color: '#FF4444' };
}

// ─── API probe helpers ────────────────────────────────────────────────────────

async function probe(url: string): Promise<{ ok: boolean; status: number; data?: unknown }> {
  try {
    const res = await fetch(url, { cache: 'no-store', credentials: 'include' });
    let data: unknown;
    try { data = await res.json(); } catch { /* ignore */ }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0 };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LaunchProofPage() {
  const [areas, setAreas] = useState<ProofArea[]>(buildSkeleton());
  const [checkedManual, setCheckedManual] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runChecks = useCallback(async () => {
    setRunning(true);

    // ── Revenue / Stripe ──────────────────────────────────────────────────────
    const revenueRes = await probe('/api/admin/revenue');
    const revenueData = revenueRes.data as Record<string, unknown> | undefined;
    const stripeMode  = (revenueData?.mode as string) ?? '';
    const isLive      = stripeMode === 'live';

    // ── Database ──────────────────────────────────────────────────────────────
    const usersRes  = await probe('/api/admin/users');
    const usersData = usersRes.data as Record<string, unknown> | undefined;
    const dbOnline  = usersRes.ok;
    const userCount = (usersData?.totalUsers as number) ?? 0;

    // ── Webhook ───────────────────────────────────────────────────────────────
    const webhookRes  = await probe('/api/admin/stripe-telemetry');
    const webhookData = webhookRes.data as Record<string, unknown> | undefined;
    const webhookOk   = webhookRes.ok;

    // ── Runtime health ────────────────────────────────────────────────────────
    const healthRes  = await probe('/api/admin/runtime-health');
    const healthData = healthRes.data as Record<string, unknown> | undefined;
    const healthOk   = healthRes.ok;

    // ── Security: unauthenticated probe of a protected endpoint ──────────────
    // We fetch a generic admin API without credentials to check it returns 401/403
    const secRes = await fetch('/api/admin/stats', { cache: 'no-store', credentials: 'omit' });
    const adminLocked = secRes.status === 401 || secRes.status === 403;

    setAreas([
      // ── 1. Homepage ──────────────────────────────────────────────────────
      {
        id: 'homepage', icon: '🏛️', title: 'Homepage Proof', color: '#00C8FF',
        status: 'manual',
        items: [
          { label: '/home/1 — Cover Page',        detail: 'No blank, no flicker, orbit loads, CTA works',   status: 'manual', actionLabel: 'Open', actionHref: '/home/1' },
          { label: '/home/1-2 — Live Rankings',   detail: 'BillboardLiveWall renders, no flicker loop',     status: 'manual', actionLabel: 'Open', actionHref: '/home/1' },
          { label: '/home/2 — Editorial / Crown', detail: 'Magazine layout renders clean',                  status: 'manual', actionLabel: 'Open', actionHref: '/home/2' },
          { label: '/home/3 — Live World',        detail: 'Broadcast deck rotates, no 500s',                status: 'manual', actionLabel: 'Open', actionHref: '/home/3' },
          { label: '/home/4 — Sponsor World',     detail: 'Sponsor tiles and AdSense fallback show',        status: 'manual', actionLabel: 'Open', actionHref: '/home/4' },
          { label: '/home/5 — Battle Arena',      detail: 'Cypher/battle cards render, XP toasts fire',    status: 'manual', actionLabel: 'Open', actionHref: '/home/5' },
          { label: 'Mobile layout (375px)',       detail: 'No horizontal overflow, no collapsed sections',  status: 'manual' },
          { label: 'No hydration errors',         detail: 'Console clean — no "Hydration failed" warnings', status: 'manual' },
        ],
      },

      // ── 2. Revenue / Stripe ──────────────────────────────────────────────
      {
        id: 'revenue', icon: '💳', title: 'Revenue Proof', color: '#FFD700',
        status: 'pending',
        items: [
          {
            label: 'Stripe API reachable',
            detail: revenueRes.ok ? `Revenue endpoint OK (mode: ${stripeMode || 'unknown'})` : `Endpoint returned ${revenueRes.status}`,
            status: revenueRes.ok ? 'pass' : 'fail',
          },
          {
            label: 'Live keys active',
            detail: isLive ? 'STRIPE_SECRET_KEY is live mode' : 'Still in test mode — switch keys in Vercel before launch',
            status: isLive ? 'pass' : 'warn',
            actionLabel: 'Vercel Env', actionHref: 'https://vercel.com/dashboard',
          },
          {
            label: 'Revenue data returning',
            detail: revenueRes.ok && revenueData ? `Today: ${revenueData.today ?? '—'}  |  Month: ${revenueData.month ?? '—'}` : 'No revenue data yet',
            status: revenueRes.ok ? 'pass' : 'warn',
          },
          { label: 'Test checkout (Tip)',        detail: 'Manual: open /checkout/tip and complete a $1 test purchase', status: 'manual', actionLabel: 'Open', actionHref: '/checkout/tip' },
          { label: 'Test checkout (Membership)', detail: 'Manual: fan membership checkout completes and webhook fires', status: 'manual', actionLabel: 'Open', actionHref: '/checkout/membership' },
          { label: 'Test checkout (Shoutout)',   detail: 'Manual: shoutout checkout completes end-to-end',             status: 'manual', actionLabel: 'Open', actionHref: '/checkout/shoutout' },
          { label: 'User receives entitlement',  detail: 'After purchase, confirm user role/badge updates in /admin',  status: 'manual', actionLabel: 'Users', actionHref: '/admin/users' },
        ],
      },

      // ── 3. Webhook ───────────────────────────────────────────────────────
      {
        id: 'webhook', icon: '🔗', title: 'Webhook Proof', color: '#FF2DAA',
        status: 'pending',
        items: [
          {
            label: 'Webhook telemetry endpoint',
            detail: webhookOk ? 'Stripe telemetry endpoint responds OK' : `Endpoint failed (${webhookRes.status})`,
            status: webhookOk ? 'pass' : 'warn',
          },
          {
            label: 'checkout.session.completed',
            detail: 'Must be listed in Stripe webhook event subscriptions',
            status: (webhookData?.events as string[] | undefined)?.includes('checkout.session.completed') ? 'pass' : 'manual',
            actionLabel: 'Stripe Webhooks', actionHref: 'https://dashboard.stripe.com/webhooks',
          },
          {
            label: 'customer.subscription.updated',
            detail: 'Required for subscription lifecycle',
            status: (webhookData?.events as string[] | undefined)?.includes('customer.subscription.updated') ? 'pass' : 'manual',
          },
          {
            label: 'customer.subscription.deleted',
            detail: 'Required to revoke access on cancellation',
            status: (webhookData?.events as string[] | undefined)?.includes('customer.subscription.deleted') ? 'pass' : 'manual',
          },
          {
            label: 'invoice.payment_failed',
            detail: 'Required to handle failed renewals',
            status: (webhookData?.events as string[] | undefined)?.includes('invoice.payment_failed') ? 'pass' : 'manual',
          },
          {
            label: 'No 4xx delivery errors',
            detail: 'Stripe dashboard should show all webhook deliveries as 200',
            status: 'manual',
            actionLabel: 'Check Stripe', actionHref: 'https://dashboard.stripe.com/webhooks',
          },
          {
            label: 'STRIPE_WEBHOOK_SECRET set',
            detail: 'Verify STRIPE_WEBHOOK_SECRET is set in Vercel environment',
            status: 'manual',
            actionLabel: 'Vercel Env', actionHref: 'https://vercel.com/dashboard',
          },
        ],
      },

      // ── 4. Database ──────────────────────────────────────────────────────
      {
        id: 'database', icon: '🗄️', title: 'Database Proof', color: '#00FF88',
        status: 'pending',
        items: [
          {
            label: 'User store reachable',
            detail: dbOnline ? `DB responding — ${userCount} users registered` : 'Admin users endpoint failed — DB may be offline or mock-only',
            status: dbOnline ? 'pass' : 'fail',
          },
          {
            label: 'DATABASE_URL configured',
            detail: dbOnline && userCount > 0 ? 'Users exist → production DB is connected' : 'Set DATABASE_URL in Vercel to production Postgres (Neon/Supabase)',
            status: dbOnline ? (userCount > 0 ? 'pass' : 'warn') : 'fail',
            actionLabel: 'Vercel Env', actionHref: 'https://vercel.com/dashboard',
          },
          {
            label: 'Registration persists on refresh',
            detail: 'Manual: register a test user, refresh the page, verify session survives',
            status: 'manual',
            actionLabel: 'Sign Up', actionHref: '/signup',
          },
          {
            label: 'Registration persists on restart',
            detail: 'Manual: register, trigger a Vercel redeploy, verify user still exists',
            status: 'manual',
            actionLabel: 'Admin Users', actionHref: '/admin/users',
          },
          {
            label: 'Sign-out and sign-in works',
            detail: 'Manual: complete a full logout → login cycle and verify identity is restored',
            status: 'manual',
            actionLabel: 'Login', actionHref: '/login',
          },
        ],
      },

      // ── 5. AdSense ───────────────────────────────────────────────────────
      {
        id: 'adsense', icon: '📢', title: 'AdSense Proof', color: '#FF9500',
        status: 'manual',
        items: [
          {
            label: 'NEXT_PUBLIC_ADSENSE_PUB_ID set',
            detail: 'Required — format: ca-pub-XXXXXXXXXXXXXXXXX. Set in Vercel env vars.',
            status: 'manual',
            actionLabel: 'AdSense', actionHref: 'https://www.google.com/adsense',
          },
          {
            label: 'Ad unit IDs created',
            detail: 'Create ad units in AdSense → Ads → By ad unit for each slot',
            status: 'manual',
            actionLabel: 'AdSense Ads', actionHref: 'https://www.google.com/adsense/new/u/0/pub-0/ads',
          },
          {
            label: 'Ad component renders (Home 4)',
            detail: 'Visit /home/4 — AdSense or sponsor slot visible, layout not collapsed',
            status: 'manual',
            actionLabel: 'Open Home 4', actionHref: '/home/4',
          },
          {
            label: 'Fallback sponsor renders',
            detail: 'Sponsor slot shows ad fallback when no sponsor is booked',
            status: 'manual',
          },
          {
            label: 'Mobile ad placement correct',
            detail: 'No overflow, no collapsed ad containers on 375px viewport',
            status: 'manual',
          },
        ],
      },

      // ── 6. Security ──────────────────────────────────────────────────────
      {
        id: 'security', icon: '🔐', title: 'Security Proof', color: '#AA2DFF',
        status: 'pending',
        items: [
          {
            label: '/admin lockout for anonymous',
            detail: adminLocked ? 'Admin API returns 401/403 without auth credentials ✓' : 'Admin API may be accessible without auth — verify middleware',
            status: adminLocked ? 'pass' : 'fail',
          },
          {
            label: 'Admin layout auth guard',
            detail: 'Manual: open /admin in a private browser window — should redirect to /auth',
            status: 'manual',
          },
          {
            label: '/admin/live lockout',
            detail: 'Manual: verify /admin/live redirects unauthenticated users',
            status: 'manual',
            actionLabel: 'Admin Live', actionHref: '/admin/live',
          },
          {
            label: '/admin/overseer lockout',
            detail: 'Manual: verify /admin/overseer redirects unauthenticated users',
            status: 'manual',
            actionLabel: 'Overseer', actionHref: '/admin/overseer',
          },
          {
            label: 'Stripe routes protected',
            detail: 'Manual: POST /api/stripe/checkout without auth → should return 401',
            status: 'manual',
          },
          {
            label: 'No role spoofing',
            detail: 'Manual: set x-tmi-role: admin header and verify it does not bypass auth',
            status: 'manual',
          },
          {
            label: 'Runtime health locked',
            detail: healthOk
              ? 'Runtime health accessible (you are authed) — confirm anon cannot reach it'
              : 'Runtime health endpoint check inconclusive',
            status: 'manual',
            actionLabel: 'Runtime Health', actionHref: '/admin/conductor',
          },
        ],
      },

      // ── 7. Revenue Loop ──────────────────────────────────────────────────
      {
        id: 'revenue-loop', icon: '🔄', title: 'Revenue Loop Proof', color: '#FF2DAA',
        status: 'manual',
        items: [
          { label: '1. Fan registers',                   detail: 'New fan account created with correct role',             status: 'manual', actionLabel: 'Sign Up', actionHref: '/signup' },
          { label: '2. Fan buys membership',             detail: 'Fan membership checkout → Stripe payment succeeds',     status: 'manual', actionLabel: 'Checkout', actionHref: '/checkout/membership' },
          { label: '3. Webhook fires on purchase',       detail: 'checkout.session.completed received + logged in Stripe', status: 'manual' },
          { label: '4. Fan entitlement updates',         detail: 'Fan account shows "Member" badge after purchase',       status: 'manual', actionLabel: 'Admin Users', actionHref: '/admin/users' },
          { label: '5. Fan tips a performer',            detail: 'Tip checkout opens, payment completes',                 status: 'manual', actionLabel: 'Tip Flow', actionHref: '/checkout/tip' },
          { label: '6. Fan sends shoutout request',      detail: 'Shoutout submitted to performer queue',                 status: 'manual' },
          { label: '7. Performer receives request',      detail: 'Request appears in performer dashboard',                status: 'manual' },
          { label: '8. Performer accepts',               detail: 'Acceptance confirmed, fan notification fires',          status: 'manual' },
          { label: '9. Revenue appears in admin',        detail: 'Transaction visible in /admin/revenue panel',           status: 'manual', actionLabel: 'Revenue', actionHref: '/admin/revenue' },
        ],
      },
    ]);

    setRunning(false);
    setLastRun(new Date());
  }, []);

  useEffect(() => { runChecks(); }, [runChecks]);

  // Apply manual checkmarks
  const toggleManual = (areaId: string, label: string) => {
    const key = `${areaId}::${label}`;
    setCheckedManual(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Merge manual checks into areas for display
  const resolvedAreas: ProofArea[] = areas.map(area => ({
    ...area,
    items: area.items.map(item => {
      const key = `${area.id}::${item.label}`;
      const checked = checkedManual.has(key);
      return item.status === 'manual' && checked
        ? { ...item, status: 'pass' as ProofStatus }
        : item;
    }),
  })).map(area => ({ ...area, status: areaRollup(area.items) }));

  const score = overallScore(resolvedAreas);
  const passCount = resolvedAreas.filter(a => a.status === 'pass').length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #03020b 0%, #050510 60%, #0a0518 100%)', padding: '24px 20px 60px', fontFamily: "'Rajdhani', 'Orbitron', 'Segoe UI', sans-serif", color: '#fff' }}>

      {/* ── Header ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
          <Link href="/admin" style={{ fontSize: 11, letterSpacing: '0.25em', color: '#00C8FF', textDecoration: 'none', opacity: 0.7 }}>← ADMIN</Link>
          <span style={{ opacity: 0.3 }}>/</span>
          <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#fff', opacity: 0.5 }}>LAUNCH PROOF</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, letterSpacing: '0.04em', fontFamily: "'Orbitron', sans-serif" }}>
              🚀 LAUNCH PROOF
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em' }}>
              7 PROOF AREAS · {resolvedAreas.flatMap(a => a.items).length} CHECKS
              {lastRun && ` · Last run ${lastRun.toLocaleTimeString()}`}
            </p>
          </div>

          {/* Score badge */}
          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', border: `2px solid ${score.color}`, borderRadius: 14, padding: '10px 24px', boxShadow: `0 0 20px ${score.color}40` }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: score.color, lineHeight: 1, fontFamily: "'Orbitron', sans-serif" }}>{score.score}%</div>
            <div style={{ fontSize: 10, letterSpacing: '0.25em', color: score.color, marginTop: 2 }}>{score.label}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{passCount}/{resolvedAreas.length} AREAS READY</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 16, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score.score}%`, background: `linear-gradient(90deg, ${score.color}, ${score.color}aa)`, transition: 'width 0.8s ease', borderRadius: 2 }} />
        </div>

        {/* Run button */}
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={runChecks}
            disabled={running}
            style={{ padding: '7px 18px', background: running ? 'rgba(0,200,255,0.1)' : 'rgba(0,200,255,0.15)', border: '1px solid rgba(0,200,255,0.4)', borderRadius: 7, color: '#00C8FF', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', cursor: running ? 'wait' : 'pointer', transition: 'all 0.2s' }}
          >
            {running ? '⟳ RUNNING CHECKS…' : '⟳ RE-RUN AUTO-CHECKS'}
          </button>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: '30px' }}>
            · Click ✓ on manual items after you verify them
          </span>
        </div>
      </div>

      {/* ── Proof Areas Grid ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 20 }}>
        {resolvedAreas.map(area => (
          <ProofAreaCard
            key={area.id}
            area={area}
            checkedManual={checkedManual}
            onToggleManual={(label) => toggleManual(area.id, label)}
          />
        ))}
      </div>

      {/* ── Launch Sequence ── */}
      <div style={{ maxWidth: 1100, margin: '32px auto 0', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 3, height: 20, background: '#FFD700' }} />
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.3em', color: '#FFD700' }}>LAUNCH SEQUENCE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {LAUNCH_SEQUENCE.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, color: '#FFD700', fontWeight: 900, opacity: 0.5, minWidth: 18 }}>{i + 1}.</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>{step.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{step.detail}</div>
                {step.href && (
                  <a href={step.href} target={step.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    style={{ fontSize: 10, color: '#00C8FF', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>
                    {step.linkLabel ?? 'Open →'}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Proof Area Card ──────────────────────────────────────────────────────────

function ProofAreaCard({
  area,
  checkedManual,
  onToggleManual,
}: {
  area: ProofArea;
  checkedManual: Set<string>;
  onToggleManual: (label: string) => void;
}) {
  const s = area.status;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${STATUS_COLOR[s]}33`,
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: `0 0 30px ${STATUS_COLOR[s]}0d`,
    }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, background: `${area.color}0d` }}>
        <span style={{ fontSize: 20 }}>{area.icon}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', color: area.color }}>{area.title.toUpperCase()}</span>
        <StatusPill status={s} />
      </div>

      {/* Items */}
      <div style={{ padding: '6px 0' }}>
        {area.items.map((item) => {
          const manualKey = `${area.id}::${item.label}`;
          const isManual  = item.status === 'manual' && !checkedManual.has(manualKey);
          const isChecked = checkedManual.has(manualKey);
          const displayStatus: ProofStatus = isChecked ? 'pass' : item.status;

          return (
            <div key={item.label}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: isManual ? 'pointer' : 'default' }}
              onClick={isManual || isChecked ? () => onToggleManual(item.label) : undefined}
              title={isManual ? 'Click to mark verified' : undefined}
            >
              {/* Status dot */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[displayStatus], marginTop: 5, flexShrink: 0, boxShadow: `0 0 6px ${STATUS_COLOR[displayStatus]}` }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: displayStatus === 'fail' ? '#FF4444' : '#fff', letterSpacing: '0.04em' }}>{item.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1, lineHeight: 1.4 }}>{item.detail}</div>
              </div>

              {/* Manual check button */}
              {(isManual || isChecked) && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleManual(item.label); }}
                  style={{ padding: '2px 8px', background: isChecked ? 'rgba(0,255,136,0.15)' : 'rgba(0,200,255,0.1)', border: `1px solid ${isChecked ? '#00FF88' : '#00C8FF'}55`, borderRadius: 5, color: isChecked ? '#00FF88' : '#00C8FF', fontSize: 10, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                >
                  {isChecked ? '✓' : '✓?'}
                </button>
              )}

              {/* Auto-status badge */}
              {!isManual && !isChecked && (
                <span style={{ fontSize: 9, letterSpacing: '0.15em', color: STATUS_COLOR[item.status], flexShrink: 0, paddingTop: 2 }}>
                  {STATUS_LABEL[item.status]}
                </span>
              )}

              {/* Action link */}
              {item.actionHref && (
                <a
                  href={item.actionHref}
                  target={item.actionHref.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', flexShrink: 0, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}
                >
                  {item.actionLabel ?? 'Open'}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ProofStatus }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 900, letterSpacing: '0.2em',
      padding: '3px 9px', borderRadius: 20,
      background: `${STATUS_COLOR[status]}22`,
      border: `1px solid ${STATUS_COLOR[status]}66`,
      color: STATUS_COLOR[status],
    }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── Skeleton (loading state) ─────────────────────────────────────────────────

function buildSkeleton(): ProofArea[] {
  const ids = ['homepage', 'revenue', 'webhook', 'database', 'adsense', 'security', 'revenue-loop'] as const;
  const meta: Record<string, { icon: string; title: string; color: string }> = {
    homepage:     { icon: '🏛️', title: 'Homepage Proof',      color: '#00C8FF' },
    revenue:      { icon: '💳', title: 'Revenue Proof',        color: '#FFD700' },
    webhook:      { icon: '🔗', title: 'Webhook Proof',        color: '#FF2DAA' },
    database:     { icon: '🗄️', title: 'Database Proof',       color: '#00FF88' },
    adsense:      { icon: '📢', title: 'AdSense Proof',        color: '#FF9500' },
    security:     { icon: '🔐', title: 'Security Proof',       color: '#AA2DFF' },
    'revenue-loop': { icon: '🔄', title: 'Revenue Loop Proof', color: '#FF2DAA' },
  };
  return ids.map(id => ({
    id,
    ...meta[id],
    status: 'pending' as ProofStatus,
    items: [{ label: 'Running checks…', detail: '', status: 'pending' as ProofStatus }],
  }));
}

// ─── Launch sequence data ─────────────────────────────────────────────────────

const LAUNCH_SEQUENCE = [
  { label: 'Set live Stripe keys',   detail: 'STRIPE_SECRET_KEY → live sk_live_…',        href: 'https://vercel.com/dashboard', linkLabel: 'Vercel Env →' },
  { label: 'Set webhook secret',     detail: 'STRIPE_WEBHOOK_SECRET in Vercel env',        href: 'https://vercel.com/dashboard', linkLabel: 'Vercel Env →' },
  { label: 'Activate webhook',       detail: 'Stripe → Webhooks → Add endpoint',           href: 'https://dashboard.stripe.com/webhooks', linkLabel: 'Stripe →' },
  { label: 'Configure AdSense',      detail: 'Create ad units, add pub ID to Vercel',      href: 'https://www.google.com/adsense', linkLabel: 'AdSense →' },
  { label: 'Point production DB',    detail: 'DATABASE_URL → Neon/Supabase prod URL',      href: 'https://vercel.com/dashboard', linkLabel: 'Vercel Env →' },
  { label: 'Deploy to production',   detail: 'Push main → Vercel auto-deploys',            href: 'https://vercel.com/dashboard', linkLabel: 'Vercel →' },
  { label: 'Verify homepage',        detail: 'Open /home/1 — no blank, orbit loads',       href: '/home/1', linkLabel: 'Home 1 →' },
  { label: 'Complete test purchase', detail: 'Fan tip → Stripe → webhook → entitlement',   href: '/checkout/tip', linkLabel: 'Tip flow →' },
  { label: 'Confirm admin revenue',  detail: 'Transaction visible in /admin/revenue',      href: '/admin/revenue', linkLabel: 'Revenue →' },
  { label: 'Onboard first users',    detail: 'Artists, fans, venues — real signups live',  href: '/signup', linkLabel: 'Sign Up →' },
];
