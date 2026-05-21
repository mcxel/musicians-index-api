/**
 * qualify/page.tsx
 * Repo: apps/web/src/app/contest/qualify/page.tsx
 * Action: CREATE | Wave: W4
 */
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Qualify | Contest | TMI' };

export default async function QualifyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', margin: '0 0 8px', textTransform: 'uppercase' }}>Contest</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Qualify to Compete</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>
          Secure 10 local sponsors + 10 major sponsors to enter the Grand Platform Contest.
          Contest registration opens every August 8.
        </p>

        {/* Sponsor Progress — wire to ContestQualificationStatus once placed */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,107,26,.2)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ff6b1a', margin: '0 0 20px' }}>Your Sponsor Progress</h2>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>
            {/* TODO: Import ContestQualificationStatus and SponsorInvitePanel */}
            Log in as an artist to see your sponsor progress and invite sponsors.
          </p>
        </div>

        {/* Package tiers — wire to SponsorPackageTierCard once placed */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Sponsor Package Tiers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[['Local Bronze', '$50'], ['Local Silver', '$100'], ['Local Gold', '$250'], ['Major Bronze', '$1,000'], ['Major Silver', '$5,000'], ['Major Gold', '$10,000'], ['Title Sponsor', '$25,000+']].map(([tier, price]) => (
              <div key={tier} style={{ padding: '16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{tier}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#ff6b1a' }}>{price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
