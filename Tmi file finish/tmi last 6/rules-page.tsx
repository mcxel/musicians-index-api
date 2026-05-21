/**
 * rules/page.tsx → apps/web/src/app/contest/rules/page.tsx
 */
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Rules | Contest | TMI' };

const RULES = [
  'Artists must secure 10 local sponsors and 10 major sponsors to qualify.',
  'Contest registration opens exclusively on August 8 each year.',
  'Each sponsor contribution must be verified by the platform before counting.',
  'Artists may enter only one category per season.',
  'Voting opens once the qualifying round is complete.',
  'Fan votes are weighted equally within each fan tier.',
  'The host panel (Ray Journey) announces all winners live.',
  'Prize fulfillment is handled by the platform post-announcement.',
  'Sponsor branding appears on the artist profile and during contest events.',
  'All decisions by the contest administration panel are final.',
];

export default function RulesPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#00e5ff', margin: '0 0 8px', textTransform: 'uppercase' }}>Contest</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Official Rules</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>Grand Platform Contest — read before entering.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {RULES.map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '18px 20px', background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,229,255,.1)', border: '1px solid rgba(0,229,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>{i + 1}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,.8)' }}>{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
