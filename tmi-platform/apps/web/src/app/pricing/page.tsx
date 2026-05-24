import { headers } from 'next/headers';
import Link from 'next/link';
import {
  getRegion,
  applyRegion,
  formatPrice,
  getRegionalPriceId,
  REGION_BADGE,
  SUBSCRIPTION_TIERS,
} from '@/lib/stripe/regionalPricing';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pricing | TMI' };

export default async function PricingPage() {
  const hdrs = await headers();
  const country = hdrs.get('x-vercel-ip-country');
  const region = getRegion(country);
  const badge = REGION_BADGE[region];

  return (
    <main style={{ minHeight: '100vh', background: '#060410', color: '#fff', padding: '60px 20px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ color: '#AA2DFF', fontSize: 10, letterSpacing: 4, marginBottom: 8 }}>TMI MEMBERSHIP</div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,44px)', fontWeight: 900, letterSpacing: 2, margin: 0 }}>PLANS & PRICING</h1>
          <p style={{ color: '#555', fontSize: 13, marginTop: 12 }}>Choose your level. Cancel anytime.</p>

          {badge && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16,
              padding: '8px 18px', background: 'rgba(0,255,136,0.07)',
              border: '1px solid rgba(0,255,136,0.25)', borderRadius: 20,
            }}>
              <span style={{ fontSize: 13, color: '#00FF88', fontWeight: 800, letterSpacing: '0.08em' }}>{badge}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20, marginBottom: 48 }}>
          {SUBSCRIPTION_TIERS.map((tier) => {
            const regionalCents = applyRegion(tier.basePriceCents, region);
            const displayPrice = `${formatPrice(regionalCents)}/mo`;
            const priceId = getRegionalPriceId(tier.tier1PriceId, tier.key, region);
            const isDiscounted = regionalCents < tier.basePriceCents;

            return (
              <div
                key={tier.key}
                style={{
                  background: `linear-gradient(135deg,${tier.color}12,rgba(6,4,16,0.98))`,
                  border: `1px solid ${tier.color}44`,
                  borderRadius: 14,
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                <div>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{tier.icon}</div>
                  <div style={{ color: tier.color, fontSize: 11, fontWeight: 900, letterSpacing: 3, marginBottom: 6 }}>{tier.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#fff' }}>{displayPrice}</div>
                    {isDiscounted && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>
                        {formatPrice(tier.basePriceCents)}
                      </div>
                    )}
                  </div>
                </div>

                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tier.perks.map((p) => (
                    <li key={p} style={{ color: '#888', fontSize: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: tier.color, flexShrink: 0 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/api/stripe/checkout?priceId=${priceId}&mode=subscription`}
                  style={{
                    display: 'block', textAlign: 'center', padding: '12px 0',
                    background: `linear-gradient(135deg,${tier.color},${tier.color}99)`,
                    borderRadius: 8, color: '#050510', fontWeight: 900, fontSize: 12,
                    letterSpacing: 2, textDecoration: 'none',
                  }}
                >
                  GET STARTED
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', color: '#333', fontSize: 11, letterSpacing: 2 }}>
          All plans include a 7-day free trial · No contracts · Cancel anytime
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/season-pass" style={{ color: '#AA2DFF', fontSize: 11, letterSpacing: 2, textDecoration: 'none' }}>
            VIEW SEASON PASS OPTIONS →
          </Link>
        </div>
      </div>
    </main>
  );
}
