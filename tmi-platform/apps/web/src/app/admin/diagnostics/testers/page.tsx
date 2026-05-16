'use client';
import { useState } from 'react';
import Link from 'next/link';

interface TesterSpec {
  name: string;
  email: string;
  role: string;
  tier: string;
  username: string;
  accountType: string;
}

const TESTERS: TesterSpec[] = [
  {
    name:        'Marcel Dickens',
    email:       'berntmusic33@gmail.com',
    role:        'ADMIN',
    tier:        'Diamond',
    username:    'marcel',
    accountType: 'ADMIN',
  },
  {
    name:        'Twan King',
    email:       'antoineking@gmail.com',
    role:        'ARTIST',
    tier:        'Diamond',
    username:    'twanking',
    accountType: 'ARTIST',
  },
  {
    name:        'Kreach',
    email:       'kreacher.616@gmail.com',
    role:        'ARTIST',
    tier:        'Diamond',
    username:    'kreach',
    accountType: 'ARTIST',
  },
];

const PROVISION_CHECKLIST = [
  'User record — role + emailVerified',
  'UserProfile — displayName, username, bio',
  'Wallet — 10,000 fanCredits, 5,000 balance',
  'ArtistProfile — stageName, genres, verified=true (artists only)',
  'FanProfile — favoriteGenres',
  'Subscription — Diamond · active · 1-year period',
  'onboardingState — COMPLETE',
  'Password — set via Forgot Password flow',
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN:  '#ff6b1a',
  ARTIST: '#00FFFF',
  SPONSOR: '#ffd700',
};

const ONBOARDING_STEPS = [
  { step: 1, label: 'Run seed script', cmd: 'cd apps/api && npx tsx src/seed-testers.ts', done: false },
  { step: 2, label: 'Marcel sets password', link: '/auth?mode=forgot', done: false },
  { step: 3, label: 'Twan sets password', link: '/auth?mode=forgot', done: false },
  { step: 4, label: 'Kreach sets password', link: '/auth?mode=forgot', done: false },
  { step: 5, label: 'Marcel verifies admin dashboard', link: '/admin/observatory', done: false },
  { step: 6, label: 'Twan verifies artist hub', link: '/hub/artist', done: false },
  { step: 7, label: 'Kreach verifies artist hub', link: '/hub/artist', done: false },
  { step: 8, label: 'Verify analytics (Diamond tier)', link: '/artists/twanking/analytics', done: false },
  { step: 9, label: 'Verify XP ladder state', link: '/xp', done: false },
  { step: 10, label: 'Submit test purchase (Stripe test mode)', link: '/store', done: false },
  { step: 11, label: 'Verify telemetry capture', link: '/admin/diagnostics/payments', done: false },
  { step: 12, label: 'Verify recovery flow', link: '/support/account-recovery', done: false },
];

export default function TesterDiagnosticsPage() {
  const [provisionStates, setProvisionStates] = useState<Record<string, 'idle' | 'running' | 'done' | 'error'>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const handleProvision = async (tester: TesterSpec) => {
    setProvisionStates((prev) => ({ ...prev, [tester.email]: 'running' }));
    try {
      const res = await fetch('/api/admin/provision-tester', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: tester.email, accountType: tester.accountType }),
      });
      if (res.ok) {
        setProvisionStates((prev) => ({ ...prev, [tester.email]: 'done' }));
      } else {
        setProvisionStates((prev) => ({ ...prev, [tester.email]: 'error' }));
      }
    } catch {
      setProvisionStates((prev) => ({ ...prev, [tester.email]: 'error' }));
    }
  };

  const toggleStep = (n: number) => {
    setCompletedSteps((prev) => ({ ...prev, [n]: !prev[n] }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  return (
    <main style={{ background: '#050510', minHeight: '100vh', padding: '40px 24px', fontFamily: 'inherit', color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link href="/admin/diagnostics/routes" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 10px' }}>
            ← Diagnostics
          </Link>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#ff6b1a', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Tester Provisioning
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 36 }}>
          Diamond-tier entitlements for Marcel · Twan · Kreach. Run the seed script first, then verify here.
        </p>

        {/* Seed script command */}
        <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#00ff88', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Step 1 — Run DB Seed Script
          </div>
          <code style={{ fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 6, display: 'block', fontFamily: 'monospace' }}>
            cd apps/api &amp;&amp; npx tsx src/seed-testers.ts
          </code>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            Safe to re-run. All operations are upserts. No data will be lost.
          </div>
        </div>

        {/* Tester cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 40 }}>
          {TESTERS.map((tester) => {
            const state = provisionStates[tester.email] ?? 'idle';
            const roleColor = ROLE_COLORS[tester.role] ?? '#fff';
            return (
              <div key={tester.email} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${roleColor}33`,
                borderRadius: 14,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{tester.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{tester.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${roleColor}18`, border: `1px solid ${roleColor}44`, color: roleColor }}>
                    {tester.role}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.35)', color: '#ffd700' }}>
                    {tester.tier}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', padding: '3px 8px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}>
                    @{tester.username}
                  </span>
                </div>
                <button
                  onClick={() => handleProvision(tester)}
                  disabled={state === 'running' || state === 'done'}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    cursor: state === 'idle' ? 'pointer' : 'default',
                    fontWeight: 700,
                    fontSize: 12,
                    background:
                      state === 'done'    ? 'rgba(0,255,136,0.15)' :
                      state === 'error'   ? 'rgba(255,82,82,0.15)' :
                      state === 'running' ? 'rgba(255,255,255,0.05)' :
                                           'rgba(255,107,26,0.15)',
                    color:
                      state === 'done'    ? '#00ff88' :
                      state === 'error'   ? '#ff5252' :
                      state === 'running' ? 'rgba(255,255,255,0.4)' :
                                           '#ff6b1a',
                    border:
                      state === 'done'    ? '1px solid rgba(0,255,136,0.3)' :
                      state === 'error'   ? '1px solid rgba(255,82,82,0.3)' :
                                           '1px solid rgba(255,107,26,0.3)',
                  }}
                >
                  {state === 'done'    ? '✓ Provision Chain Triggered' :
                   state === 'error'   ? '✗ Failed — Check Logs' :
                   state === 'running' ? 'Running...' :
                                        'Trigger Provision Chain'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Provision checklist */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            What Gets Provisioned Per Tester
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {PROVISION_CHECKLIST.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                <span style={{ color: '#00ff88', flexShrink: 0, marginTop: 1 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding checklist */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              Onboarding Verification Checklist
            </h2>
            <span style={{ fontSize: 13, fontWeight: 700, color: completedCount === ONBOARDING_STEPS.length ? '#00ff88' : '#ffd700' }}>
              {completedCount}/{ONBOARDING_STEPS.length} done
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ONBOARDING_STEPS.map((item) => {
              const done = !!completedSteps[item.step];
              return (
                <div key={item.step} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: done ? 'rgba(0,255,136,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${done ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 8,
                }}>
                  <button
                    onClick={() => toggleStep(item.step)}
                    style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                      border: done ? '2px solid #00ff88' : '2px solid rgba(255,255,255,0.2)',
                      background: done ? '#00ff88' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#000', fontWeight: 900,
                    }}
                  >
                    {done ? '✓' : ''}
                  </button>
                  <span style={{ flex: 1, fontSize: 13, color: done ? 'rgba(255,255,255,0.5)' : '#fff', textDecoration: done ? 'line-through' : 'none' }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginRight: 8 }}>{item.step}.</span>
                    {item.label}
                  </span>
                  {item.cmd && (
                    <code style={{ fontSize: 10, color: '#00ff88', background: 'rgba(0,255,136,0.08)', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
                      {item.cmd}
                    </code>
                  )}
                  {item.link && !item.cmd && (
                    <Link href={item.link} style={{ fontSize: 10, color: '#00e5ff', textDecoration: 'none', padding: '2px 8px', border: '1px solid rgba(0,229,255,0.25)', borderRadius: 4 }}>
                      Open →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Admin Observatory', href: '/admin/observatory' },
            { label: 'Artist Hub', href: '/hub/artist' },
            { label: 'Fan Hub', href: '/hub/fan' },
            { label: 'Analytics', href: '/artists/twanking/analytics' },
            { label: 'XP Ladder', href: '/xp' },
            { label: 'Stripe Diagnostics', href: '/admin/diagnostics/payments' },
            { label: 'Email Diagnostics', href: '/admin/diagnostics/email' },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{
              fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
              padding: '7px 14px', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, transition: 'all 0.2s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
