'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAnalyticsSnapshot, ENGINE_META, TIER_ORDER, type SubscriptionTier } from '@/lib/analytics/TieredAnalyticsEngine';

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: '#94a3b8', pro: '#60a5fa', bronze: '#cd7f32', silver: '#94a3b8',
  gold: '#FFD700', platinum: '#e2e8f0', diamond: '#00FFFF',
};

export default function AdvertiserAnalyticsPage() {
  const [tier, setTier] = useState<SubscriptionTier>('silver');
  const snapshot = getAnalyticsSnapshot(tier, 'advertiser');
  const { capabilities, metrics, insights, upgradePrompt } = snapshot;

  const unlockedMetrics  = metrics.filter((m) => !m.locked);
  const unlockedInsights = insights.filter((i) => !i.locked);
  const lockedInsights   = insights.filter((i) => i.locked);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#07071a', color: '#e2e8f0', minHeight: '100vh', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: '#60a5fa', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Advertiser Analytics</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Ad Performance Intelligence</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
              {capabilities.historyDays}-day window · {capabilities.enabledEngines.length} engines active
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/hub/advertiser" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 8 }}>← Hub</Link>
            {TIER_ORDER.map((t: SubscriptionTier) => (
              <button key={t} type="button" onClick={() => setTier(t)}
                style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid ${TIER_COLORS[t]}44`, background: t === tier ? `${TIER_COLORS[t]}22` : 'transparent', color: t === tier ? TIER_COLORS[t] : 'rgba(255,255,255,0.25)' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 32 }}>
          {unlockedMetrics.map((m) => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${m.color}22`, borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{m.label}</div>
              {m.delta && <div style={{ fontSize: 10, color: m.color, marginTop: 5, fontWeight: 700 }}>{m.delta}</div>}
            </div>
          ))}
          {metrics.filter((m) => m.locked).map((m) => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 18px', opacity: 0.35 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'rgba(255,255,255,0.1)' }}>—</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{m.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>🔒 {m.requiredTier.toUpperCase()}+</div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>AI Insights</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {unlockedInsights.map((insight) => {
            const meta = ENGINE_META[insight.engine];
            const urgencyColor = insight.urgency === 'opportunity' ? '#00FF88' : '#FFD700';
            return (
              <div key={insight.engine} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${urgencyColor}22`, borderLeft: `3px solid ${urgencyColor}`, borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: meta.color, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5 }}>{meta.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{insight.headline}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{insight.body}</div>
              </div>
            );
          })}
          {lockedInsights.map((insight) => (
            <div key={insight.engine} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 18px', opacity: 0.4 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>🔒 {ENGINE_META[insight.engine].label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{insight.headline}</div>
            </div>
          ))}
        </div>

        {upgradePrompt && (
          <div style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{upgradePrompt}</div>
            <Link href="/subscriptions" style={{ fontSize: 11, fontWeight: 800, color: '#07071a', background: '#60a5fa', borderRadius: 7, padding: '9px 18px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Upgrade</Link>
          </div>
        )}
      </div>
    </div>
  );
}
