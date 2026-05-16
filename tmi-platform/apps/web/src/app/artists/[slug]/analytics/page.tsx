'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAnalyticsSnapshot, ENGINE_META, TIER_ORDER, type SubscriptionTier } from '@/lib/analytics/TieredAnalyticsEngine';

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free:     '#94a3b8',
  pro:      '#60a5fa',
  bronze:   '#cd7f32',
  silver:   '#94a3b8',
  gold:     '#FFD700',
  platinum: '#e2e8f0',
  diamond:  '#00FFFF',
};

export default function ArtistAnalyticsPage() {
  const [tier, setTier] = useState<SubscriptionTier>('gold');
  const snapshot = getAnalyticsSnapshot(tier, 'artist');
  const { capabilities, metrics, insights, upgradePrompt } = snapshot;

  const unlockedMetrics = metrics.filter((m) => !m.locked);
  const lockedMetrics   = metrics.filter((m) => m.locked);
  const unlockedInsights = insights.filter((i) => !i.locked);
  const lockedInsights   = insights.filter((i) => i.locked);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#07071a', color: '#e2e8f0', minHeight: '100vh', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: '#00FFFF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Artist Analytics</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Intelligence Dashboard</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
              {capabilities.historyDays}-day history · {capabilities.enabledEngines.length} AI engines active
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/hub/artist" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 8 }}>← Hub</Link>
            {/* Tier switcher (dev preview) */}
            {TIER_ORDER.map((t: SubscriptionTier) => (
              <button key={t} type="button" onClick={() => setTier(t)}
                style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid ${TIER_COLORS[t]}44`, background: t === tier ? `${TIER_COLORS[t]}22` : 'transparent', color: t === tier ? TIER_COLORS[t] : 'rgba(255,255,255,0.3)' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Active engines */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>Active AI Engines ({capabilities.enabledEngines.length}/7)</SectionLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(Object.keys(ENGINE_META) as (keyof typeof ENGINE_META)[]).map((eng) => {
              const active = capabilities.enabledEngines.includes(eng);
              const meta = ENGINE_META[eng];
              return (
                <div key={eng} title={meta.description}
                  style={{ fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 6, letterSpacing: '0.08em', border: `1px solid ${active ? meta.color + '44' : '#ffffff11'}`, background: active ? `${meta.color}11` : 'transparent', color: active ? meta.color : 'rgba(255,255,255,0.2)', cursor: 'default' }}>
                  {active ? '◉' : '○'} {meta.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics grid */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>Metrics</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {unlockedMetrics.map((m) => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${m.color}22`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{m.label}</div>
                {m.delta && <div style={{ fontSize: 10, color: m.color, marginTop: 6, fontWeight: 700 }}>{m.delta}</div>}
              </div>
            ))}
            {lockedMetrics.map((m) => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px', opacity: 0.4 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'rgba(255,255,255,0.15)' }}>—</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{m.label}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>🔒 {m.requiredTier.toUpperCase()}+</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>AI Insights ({unlockedInsights.length} active)</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {unlockedInsights.map((insight) => {
              const meta = ENGINE_META[insight.engine];
              const urgencyColor = insight.urgency === 'opportunity' ? '#00FF88' : insight.urgency === 'warning' ? '#FFD700' : '#60a5fa';
              return (
                <div key={insight.engine} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${urgencyColor}22`, borderLeft: `3px solid ${urgencyColor}`, borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: meta.color, textTransform: 'uppercase' }}>{meta.label}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: urgencyColor, textTransform: 'uppercase', marginLeft: 'auto' }}>{insight.urgency}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{insight.headline}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{insight.body}</div>
                </div>
              );
            })}
            {lockedInsights.map((insight) => {
              const meta = ENGINE_META[insight.engine];
              return (
                <div key={insight.engine} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 20px', opacity: 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>{meta.label}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>🔒 Upgrade to unlock</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{insight.headline}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upgrade prompt */}
        {upgradePrompt && (
          <div style={{ background: 'linear-gradient(135deg, rgba(0,255,255,0.05), rgba(170,45,255,0.05))', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#00FFFF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Unlock More Intelligence</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{upgradePrompt}</div>
            </div>
            <Link href="/subscriptions" style={{ fontSize: 12, fontWeight: 800, color: '#07071a', background: '#00FFFF', borderRadius: 8, padding: '10px 20px', textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Upgrade Now
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>
      {children}
    </div>
  );
}
