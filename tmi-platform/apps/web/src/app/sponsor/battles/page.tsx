'use client';

import Link from 'next/link';
import { useState } from 'react';
import { sponsorContestPool } from '@/lib/competition/SponsorContestPool';

const ACTIVE_BATTLES = [
  { id: 'arena-001', title: 'Astra Nova vs Neon Verse',     type: '1v1 RAP',     prize: '$500', status: 'LIVE',     viewers: 312, color: '#00FFFF' },
  { id: 'arena-002', title: 'Crown Mic vs Delta Flame',      type: 'FREESTYLE',   prize: '$250', status: 'LIVE',     viewers: 188, color: '#FF2DAA' },
  { id: 'arena-003', title: 'Velox Prime vs Sable Court',    type: 'DANCE OFF',   prize: '$200', status: 'LIVE',     viewers: 220, color: '#AA2DFF' },
  { id: 'b1',        title: 'Wavetek vs Krypt',              type: '1v1 RAP',     prize: '$500', status: 'UPCOMING', viewers: 0,   color: '#FFD700' },
  { id: 'b2',        title: 'Bar God vs Verse Knight',       type: 'MINI-BATTLE', prize: '$100', status: 'UPCOMING', viewers: 0,   color: '#00FF88' },
];

const SPONSOR_PACKAGES = [
  { tier: 'STARTER',   price: '$50',  cents: 5000,  features: ['Logo on battle overlay', 'Prize boost $50', '1 product mention', 'Post-battle recap tag'], color: '#00FFFF' },
  { tier: 'FEATURED',  price: '$150', cents: 15000, features: ['Banner placement', 'Prize boost $150', 'Intro announcement', 'Winner reward (merch)', 'Replay tags'], color: '#FFD700' },
  { tier: 'TITLE',     price: '$500', cents: 50000, features: ['Title sponsor branding', 'Prize boost $500+', 'Live host shoutout', 'Winner product award', 'Magazine feature', 'All replay slots'], color: '#FF2DAA' },
];

export default function SponsorBattlesPage() {
  const [selectedBattle, setSelectedBattle] = useState<string | null>(null);
  const [selectedTier, setSelectedTier]     = useState<string | null>(null);
  const [submitting, setSubmitting]          = useState(false);
  const [notice, setNotice]                  = useState('');

  async function handleAttach() {
    if (!selectedBattle || !selectedTier) return;
    setSubmitting(true);
    const pkg = SPONSOR_PACKAGES.find(p => p.tier === selectedTier);
    if (!pkg) { setSubmitting(false); return; }

    // For Starter: points-only, no Stripe; Featured/Title: Stripe checkout
    if (pkg.tier === 'STARTER') {
      setNotice(`✅ Starter sponsorship attached to battle ${selectedBattle}. Your logo will appear in the overlay within 60 seconds.`);
      setSubmitting(false);
      return;
    }

    const res = await fetch('/api/stripe/checkout?' + new URLSearchParams({
      priceId: `battle-sponsor-${pkg.tier.toLowerCase()}`,
      mode: 'payment',
      metadata: JSON.stringify({ battleId: selectedBattle, sponsorTier: pkg.tier }),
    }));

    if (!res.ok || !res.url.includes('stripe')) {
      // Fallback: redirect directly to checkout endpoint
      window.location.href = `/api/stripe/checkout?priceId=battle-sponsor-${pkg.tier.toLowerCase()}&mode=payment`;
      return;
    }
    setSubmitting(false);
  }

  const stats = sponsorContestPool.getCapacityStats();
  const allSponsors = sponsorContestPool.getAllSponsors();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.88)', borderBottom: '1px solid rgba(255,215,0,0.2)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FFD700', fontWeight: 800 }}>🤝 SPONSOR A LIVE BATTLE</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>Battle Sponsorship Marketplace</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/sponsor/campaigns" style={{ fontSize: 10, color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>ALL CAMPAIGNS</Link>
          <Link href="/hub/sponsor" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>SPONSOR HUB</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 0' }}>

        {/* Pool stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 32 }}>
          {[
            { label: 'Active Sponsors',   value: String(allSponsors.length + stats.totalSponsors), color: '#FFD700' },
            { label: 'Sponsor Slots Left', value: String(20 - stats.totalSponsors),              color: '#00FFFF' },
            { label: 'Total Prize Pool',   value: `$${sponsorContestPool.getTotalPrizePool().toLocaleString()}`, color: '#00FF88' },
            { label: 'Live Battles',       value: String(ACTIVE_BATTLES.filter(b => b.status === 'LIVE').length), color: '#FF2DAA' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20`, borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* Left — battle picker + package */}
          <div>
            {/* Step 1: Pick battle */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 14 }}>STEP 1 — CHOOSE YOUR BATTLE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ACTIVE_BATTLES.map((b) => (
                  <button key={b.id} onClick={() => setSelectedBattle(b.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: selectedBattle === b.id ? `${b.color}12` : 'rgba(255,255,255,0.02)', border: `1.5px solid ${selectedBattle === b.id ? b.color + '60' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {b.status === 'LIVE' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 6px #00FF88', display: 'inline-block' }} />}
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{b.title}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{b.type} · Prize {b.prize}{b.viewers > 0 ? ` · ${b.viewers} watching` : ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: b.status === 'LIVE' ? '#00FF88' : b.color, border: `1px solid ${b.status === 'LIVE' ? 'rgba(0,255,136,0.4)' : b.color + '40'}`, padding: '3px 8px', borderRadius: 4 }}>{b.status}</span>
                      {selectedBattle === b.id && <span style={{ fontSize: 14, color: b.color }}>✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Pick package */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 14 }}>STEP 2 — CHOOSE SPONSOR PACKAGE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {SPONSOR_PACKAGES.map((pkg) => (
                  <button key={pkg.tier} onClick={() => setSelectedTier(pkg.tier)}
                    style={{ padding: '18px', background: selectedTier === pkg.tier ? `${pkg.color}12` : 'rgba(255,255,255,0.02)', border: `1.5px solid ${selectedTier === pkg.tier ? pkg.color + '60' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 9, letterSpacing: '0.15em', color: pkg.color, fontWeight: 800 }}>{pkg.tier}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 2 }}>{pkg.price}</div>
                      </div>
                      {selectedTier === pkg.tier && <span style={{ fontSize: 18, color: pkg.color }}>✓</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {pkg.features.map((f) => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 8, color: pkg.color }}>●</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notice */}
            {notice && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 10, fontSize: 12, color: '#00FF88', marginBottom: 20 }}>
                {notice}
              </div>
            )}

            {/* CTA */}
            <button onClick={() => void handleAttach()} disabled={!selectedBattle || !selectedTier || submitting}
              style={{ width: '100%', padding: '14px', background: selectedBattle && selectedTier ? 'linear-gradient(90deg,#FFD700,#FF9500)' : 'rgba(255,255,255,0.05)', color: selectedBattle && selectedTier ? '#000' : 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: selectedBattle && selectedTier ? 'pointer' : 'not-allowed', letterSpacing: '0.08em', transition: 'all 0.15s' }}>
              {submitting ? 'PROCESSING...' : 'ATTACH SPONSORSHIP →'}
            </button>
          </div>

          {/* Right — current sponsors */}
          <div style={{ position: 'sticky', top: 70 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,215,0,0.12)', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#FFD700', fontWeight: 800, marginBottom: 16 }}>CURRENT SPONSORS</div>
              {allSponsors.length === 0 ? (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0' }}>No sponsors yet — be first.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {allSponsors.slice(0, 8).map((s) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                      <span style={{ fontSize: 18 }}>🤝</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700 }}>{s.name}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{s.category.toUpperCase()} · ${s.prizePool}</div>
                      </div>
                      <span style={{ fontSize: 9, color: '#00FF88', fontWeight: 800, border: '1px solid rgba(0,255,136,0.3)', padding: '2px 6px', borderRadius: 4 }}>ACTIVE</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 16, padding: '12px', background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 10 }}>
                <div style={{ fontSize: 9, color: '#FFD700', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 6 }}>WHY SPONSOR A BATTLE?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['Brand in front of live audience', 'Prize association = memory', 'Winner wears/uses your product', 'Replay views = free exposure'].map(p => (
                    <div key={p} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ color: '#FFD700', fontSize: 8, marginTop: 2 }}>●</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
