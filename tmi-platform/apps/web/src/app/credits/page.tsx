'use client';
import Link from 'next/link';
import { useGamificationEngine } from '@/hooks/useGamificationEngine';

const BUNDLES = [
  {
    id: 'starter',
    credits: 500,
    price: '$4.99',
    priceId: 'price_credits_starter',
    label: 'Starter Pack',
    color: '#00FFFF',
    perks: ['500 TM Credits', 'Enough for 2–3 avatar items', 'Instant delivery'],
  },
  {
    id: 'popular',
    credits: 2000,
    price: '$14.99',
    priceId: 'price_credits_popular',
    label: 'Popular Pack',
    color: '#FF2DAA',
    popular: true,
    perks: ['2,000 TM Credits', 'Best value — 25% bonus', 'Instant delivery', 'Unlock any featured item'],
  },
  {
    id: 'pro',
    credits: 5000,
    price: '$34.99',
    priceId: 'price_credits_pro',
    label: 'Pro Pack',
    color: '#FFD700',
    perks: ['5,000 TM Credits', 'Full season of items', 'Priority support badge', 'Season 1 bonus emote'],
  },
];

const HOW_TO_EARN = [
  { icon: '📖', action: 'Read an article', credits: '+5 cr' },
  { icon: '🗳️', action: 'Vote in a battle', credits: '+3 cr' },
  { icon: '🎤', action: 'Join a live stage', credits: '+10 cr' },
  { icon: '💬', action: 'Send a message', credits: '+2 cr' },
  { icon: '🔑', action: 'Daily login', credits: '+25 cr' },
];

export default function CreditsPage() {
  const { walletCredits } = useGamificationEngine();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <section style={{ textAlign: 'center', padding: '56px 24px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#FFD700', fontWeight: 800, marginBottom: 10 }}>TM CREDITS</div>
        <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 900, marginBottom: 12 }}>Buy Credits</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', maxWidth: 440, margin: '0 auto' }}>
          Spend TM Credits in the shop on emotes, avatar props, skins, and exclusive drops.
        </p>
        <div style={{ display: 'inline-flex', gap: 8, marginTop: 18, padding: '10px 20px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 30 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Current balance:</span>
          <span style={{ fontSize: 11, color: '#00FF88', fontWeight: 800 }}>{walletCredits.toLocaleString()} TM Credits</span>
        </div>
      </section>

      <section style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
        {BUNDLES.map(bundle => (
          <div key={bundle.id} style={{ position: 'relative', background: (bundle as typeof bundle & { popular?: boolean }).popular ? `${bundle.color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${bundle.color}${(bundle as typeof bundle & { popular?: boolean }).popular ? '40' : '20'}`, borderRadius: 16, padding: '28px 22px 22px' }}>
            {(bundle as typeof bundle & { popular?: boolean }).popular && (
              <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: bundle.color, color: '#050510', fontSize: 7, fontWeight: 900, letterSpacing: '0.15em', padding: '3px 12px', borderRadius: 20 }}>BEST VALUE</div>
            )}
            <div style={{ fontSize: 11, fontWeight: 700, color: bundle.color, letterSpacing: '0.08em', marginBottom: 6 }}>{bundle.label.toUpperCase()}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: '#fff' }}>{bundle.price}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: bundle.color, marginBottom: 20 }}>
              {bundle.credits.toLocaleString()} credits
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {bundle.perks.map(perk => (
                <li key={perk} style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 8 }}>
                  <span style={{ color: bundle.color, fontSize: 10 }}>✓</span>{perk}
                </li>
              ))}
            </ul>
            <Link
              href={`/api/stripe/checkout?priceId=${bundle.priceId}&mode=payment`}
              style={{ display: 'block', textAlign: 'center', padding: '11px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: (bundle as typeof bundle & { popular?: boolean }).popular ? '#050510' : bundle.color, background: (bundle as typeof bundle & { popular?: boolean }).popular ? bundle.color : 'transparent', border: `1px solid ${bundle.color}`, borderRadius: 8, textDecoration: 'none' }}
            >
              BUY {bundle.credits.toLocaleString()} CREDITS →
            </Link>
          </div>
        ))}
      </section>

      <section style={{ maxWidth: 600, margin: '48px auto 0', padding: '0 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: 16 }}>OR EARN FREE CREDITS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
          {HOW_TO_EARN.map(item => (
            <div key={item.action} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{item.action}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#00FF88' }}>{item.credits}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', marginTop: 40 }}>
        <Link href="/shop" style={{ fontSize: 10, color: '#00FFFF', textDecoration: 'none' }}>Spend your credits in the shop →</Link>
      </section>
    </main>
  );
}
