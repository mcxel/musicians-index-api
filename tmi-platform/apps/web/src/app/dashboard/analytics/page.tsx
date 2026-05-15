'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAnalyticsSnapshot, TIER_ORDER, ENGINE_META, type SubscriptionTier } from '@/lib/analytics/TieredAnalyticsEngine';

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: '#94a3b8', pro: '#60a5fa', bronze: '#cd7f32', silver: '#94a3b8',
  gold: '#FFD700', platinum: '#e2e8f0', diamond: '#00FFFF',
};

const CONTEXT_OPTIONS = [
  { value: 'artist' as const,     label: 'Artist',     color: '#00FFFF' },
  { value: 'fan' as const,        label: 'Fan',         color: '#FF2DAA' },
  { value: 'sponsor' as const,    label: 'Sponsor',     color: '#FF9200' },
  { value: 'advertiser' as const, label: 'Advertiser',  color: '#60a5fa' },
  { value: 'venue' as const,      label: 'Venue',       color: '#AA2DFF' },
];

export default function DashboardAnalyticsPage() {
  const [tier, setTier] = useState<SubscriptionTier>('platinum');
  const [context, setContext] = useState<'artist' | 'fan' | 'sponsor' | 'advertiser' | 'venue'>('artist');
  const snapshot = getAnalyticsSnapshot(tier, context);
  const { capabilities, metrics, insights, upgradePrompt } = snapshot;

  const ctxMeta = CONTEXT_OPTIONS.find((c) => c.value === context)!;
  const unlockedMetrics  = metrics.filter((m) => !m.locked);
  const lockedMetrics    = metrics.filter((m) => m.locked);
  const unlockedInsights = insights.filter((i) => !i.locked);
  const lockedInsights   = insights.filter((i) => i.locked);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#07071a', color: '#e2e8f0', minHeight: '100vh', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: ctxMeta.color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Dashboard Analytics</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>TMI Intelligence Suite</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
              {capabilities.historyDays}d history · {capabilities.enabledEngines.length}/7 engines · {tier.toUpperCase()} tier
            </p>
          </div>
          <Link href="/admin/analytics" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Admin View →</Link>
        </div>

        {/* Context + Tier switchers */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Role</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {CONTEXT_OPTIONS.map((c) => (
                <button key={c.value} type="button" onClick={() => setContext(c.value)}
                  style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: `1px solid ${c.color}44`, background: context === c.value ? `${c.color}22` : 'transparent', color: context === c.value ? c.color : 'rgba(255,255,255,0.3)' }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Tier</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TIER_ORDER.map((t: SubscriptionTier) => (
                <button key={t} type="button" onClick={() => setTier(t)}
                  style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid ${TIER_COLORS[t]}44`, background: t === tier ? `${TIER_COLORS[t]}22` : 'transparent', color: t === tier ? TIER_COLORS[t] : 'rgba(255,255,255,0.25)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Engines */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {(Object.keys(ENGINE_META) as (keyof typeof ENGINE_META)[]).map((eng) => {
            const active = capabilities.enabledEngines.includes(eng);
            const meta = ENGINE_META[eng];
            return (
              <div key={eng} title={meta.description}
                style={{ fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: `1px solid ${active ? meta.color + '44' : '#ffffff10'}`, background: active ? `${meta.color}11` : 'transparent', color: active ? meta.color : 'rgba(255,255,255,0.18)' }}>
                {active ? '◉' : '○'} {meta.label}
              </div>
            );
          })}
        </div>

        {/* Metrics */}
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>Metrics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 32 }}>
          {unlockedMetrics.map((m) => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${m.color}22`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{m.label}</div>
              {m.delta && <div style={{ fontSize: 10, color: m.color, marginTop: 5, fontWeight: 700 }}>{m.delta}</div>}
            </div>
          ))}
          {lockedMetrics.map((m) => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px 16px', opacity: 0.35 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'rgba(255,255,255,0.1)' }}>—</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{m.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>🔒 {m.requiredTier}</div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>
          AI Insights ({unlockedInsights.length} active · {lockedInsights.length} locked)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {unlockedInsights.map((insight) => {
            const meta = ENGINE_META[insight.engine];
            const urgencyColor = insight.urgency === 'opportunity' ? '#00FF88' : insight.urgency === 'warning' ? '#FFD700' : '#60a5fa';
            return (
              <div key={insight.engine} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${urgencyColor}22`, borderLeft: `3px solid ${urgencyColor}`, borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: meta.color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{meta.label}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: urgencyColor, textTransform: 'uppercase', marginLeft: 'auto' }}>{insight.urgency}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{insight.headline}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{insight.body}</div>
              </div>
            );
          })}
          {lockedInsights.map((insight) => (
            <div key={insight.engine} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 18px', opacity: 0.35 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>🔒 {ENGINE_META[insight.engine].label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{insight.headline}</div>
            </div>
          ))}
        </div>

        {upgradePrompt && (
          <div style={{ background: `${ctxMeta.color}08`, border: `1px solid ${ctxMeta.color}22`, borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{upgradePrompt}</div>
            <Link href="/subscriptions" style={{ fontSize: 11, fontWeight: 800, color: '#07071a', background: ctxMeta.color, borderRadius: 7, padding: '9px 18px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Upgrade</Link>
          </div>
        )}
      </div>
    </div>
  );
}
