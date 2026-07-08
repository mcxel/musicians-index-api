'use client';

import { adProviderRegistry, ADSENSE_SLOTS, type ProviderStatus } from '@/lib/ads/AdProviderManager';
import Link from 'next/link';

const STATUS_COLOR: Record<ProviderStatus, string> = {
  'active':            '#00FF88',
  'pending-approval':  '#FFD700',
  'disabled':          'rgba(255,255,255,0.25)',
  'error':             '#FF4444',
};

const STATUS_LABEL: Record<ProviderStatus, string> = {
  'active':            'ACTIVE',
  'pending-approval':  'PENDING',
  'disabled':          'DISABLED',
  'error':             'ERROR',
};

const CATEGORY_LABEL: Record<string, string> = {
  'direct-sponsor':    'Direct Sponsor',
  'direct-advertiser': 'Direct Advertiser',
  'programmatic':      'Programmatic Network',
  'affiliate':         'Affiliate Network',
  'house-ad':          'House Ad',
  'cta-fallback':      'CTA Fallback',
};

export default function AdNetworksPage() {
  const providers = adProviderRegistry.getSorted();
  const activeCount = providers.filter((p) => p.isEnabled() && p.getStatus() === 'active').length;
  const slotEntries = Object.entries(ADSENSE_SLOTS);
  const slotsConfigured = slotEntries.filter(([, v]) => Boolean(v)).length;

  const byCategory = providers.reduce<Record<string, typeof providers>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 860, margin: '0 auto', padding: '32px 20px', color: '#fff' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FF2DAA', fontWeight: 900, marginBottom: 8 }}>ADMIN · MONETIZATION</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 6px' }}>Ad Engine — Provider Registry</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 12px' }}>
          {activeCount} of {providers.length} providers active · {slotsConfigured}/{slotEntries.length} AdSense slots configured
        </p>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
          Plugin architecture: adding a new ad network means registering one <code style={{ color: '#00FFFF', background: 'rgba(0,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>AdProvider</code> in
          {' '}<code style={{ color: '#00FFFF', background: 'rgba(0,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>AdProviderManager.ts</code> — no other files change.
          Priority order: Direct Sponsor → Direct Advertiser → Programmatic → Affiliate → House Ad → CTA Fallback.
        </div>
      </div>

      {/* Provider groups by category */}
      {Object.entries(byCategory).map(([category, catProviders]) => (
        <div key={category} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase' }}>
            {CATEGORY_LABEL[category] ?? category}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {catProviders.map((p) => {
              const status = p.getStatus();
              const meta = p.getMeta();
              const color = STATUS_COLOR[status];
              return (
                <div key={p.id} style={{
                  borderRadius: 12,
                  border: `1px solid ${p.isEnabled() ? color + '30' : 'rgba(255,255,255,0.07)'}`,
                  background: p.isEnabled() && status === 'active' ? `${color}04` : 'rgba(255,255,255,0.02)',
                  padding: '14px 18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: meta.notes ? 8 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                        background: p.isEnabled() ? color : 'rgba(255,255,255,0.15)',
                        boxShadow: p.isEnabled() ? `0 0 7px ${color}` : 'none',
                      }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{p.displayName}</div>
                        {meta.publisherId && (
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, fontFamily: 'monospace' }}>{meta.publisherId}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {meta.envVarName && (
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', padding: '2px 7px', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}>
                          {meta.envVarName}
                        </div>
                      )}
                      <div style={{
                        fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', padding: '3px 9px', borderRadius: 20,
                        background: `${color}18`, color, border: `1px solid ${color}30`,
                      }}>
                        {STATUS_LABEL[status]}
                      </div>
                    </div>
                  </div>
                  {meta.notes && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{meta.notes}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* AdSense slot IDs */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
          ADSENSE SLOT IDS — {slotsConfigured}/{slotEntries.length} CONFIGURED
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
          {slotEntries.map(([key, value], i) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '9px 16px',
              borderBottom: i < slotEntries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                NEXT_PUBLIC_ADSENSE_SLOT_{key.replace(/([A-Z])/g, '_$1').toUpperCase()}
              </div>
              <div style={{
                fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                color: value ? '#00FF88' : '#FF8800',
                background: value ? 'rgba(0,255,136,0.08)' : 'rgba(255,136,0,0.08)',
              }}>
                {value ? `✓ ${value}` : 'NOT SET — auto-ads active'}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 10, lineHeight: 1.6 }}>
          AdSense auto-ads fills unset slots based on page content — this is fine at launch.
          For higher CPMs, create named display units in AdSense → Ads → By ad unit → copy the slot ID → paste into Vercel.
        </div>
      </div>

      {/* Revenue action items */}
      <div style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.18)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700', marginBottom: 12 }}>NEXT ACTIONS</div>
        {[
          { done: true,  item: 'Google AdSense publisher ID wired + script loading' },
          { done: true,  item: 'ads.txt published (google.com, pub-4088577529436039, DIRECT)' },
          { done: true,  item: 'Infolinks in-text ads active' },
          { done: true,  item: 'BidVertiser site verified' },
          { done: true,  item: 'Plugin registry architecture — add networks without touching the engine' },
          { done: false, item: 'Apply for AdSense approval at adsense.google.com (needs 20+ real content pages)' },
          { done: false, item: 'Create named AdSense ad units → paste slot IDs into Vercel env vars' },
          { done: false, item: 'Set NEXT_PUBLIC_MEDIANET_CID → enables Yahoo/Bing contextual ads' },
          { done: false, item: 'Set NEXT_PUBLIC_AMAZON_PUB_ID → enables Amazon Publisher Services' },
          { done: false, item: 'Upload app icons 192×192 and 512×512 PNG to /public/icons/' },
        ].map((row) => (
          <div key={row.item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 7 }}>
            <span style={{ color: row.done ? '#00FF88' : '#FFD700', fontSize: 12, flexShrink: 0, marginTop: 1 }}>{row.done ? '✓' : '○'}</span>
            <span style={{ fontSize: 11, color: row.done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)', textDecoration: row.done ? 'line-through' : 'none' }}>{row.item}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link href="/admin/mobile-release" style={{ padding: '10px 18px', borderRadius: 8, fontSize: 11, fontWeight: 900, background: 'rgba(0,255,255,0.07)', border: '1px solid rgba(0,255,255,0.22)', color: '#00FFFF', textDecoration: 'none' }}>
          MOBILE RELEASE CHECKLIST →
        </Link>
        <Link href="/admin/revenue" style={{ padding: '10px 18px', borderRadius: 8, fontSize: 11, fontWeight: 900, background: 'rgba(255,45,170,0.07)', border: '1px solid rgba(255,45,170,0.2)', color: '#FF2DAA', textDecoration: 'none' }}>
          REVENUE DASHBOARD →
        </Link>
        <Link href="/admin/observatory" style={{ padding: '10px 18px', borderRadius: 8, fontSize: 11, fontWeight: 800, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
          OBSERVATORY →
        </Link>
      </div>
    </div>
  );
}
