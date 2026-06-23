import Link from 'next/link';
import type { CSSProperties } from 'react';

type SponsorSlot = {
  id: string;
  brand: string;
  lane: string;
  status: 'active' | 'available';
  budget: string;
  ctaHref: string;
  accent: string;
};

const SLOTS: SponsorSlot[] = [
  { id: 's-1', brand: 'SoundWave Audio', lane: 'Battle Crown', status: 'active', budget: '$12,000/mo', ctaHref: '/sponsor/campaigns/new', accent: '#FFD700' },
  { id: 's-2', brand: 'BeatMarket Pro', lane: 'Cypher Arena', status: 'active', budget: '$8,500/mo', ctaHref: '/sponsor/campaigns/new', accent: '#00FFFF' },
  { id: 's-3', brand: 'Open Slot', lane: 'Homepage Billboard', status: 'available', budget: '$6,000/mo', ctaHref: '/signup/sponsor', accent: '#FF2DAA' },
  { id: 's-4', brand: 'Open Slot', lane: 'World Premiere', status: 'available', budget: '$4,200/mo', ctaHref: '/signup/sponsor', accent: '#39FF14' },
];

const SMALL_BUSINESS_TYPES = [
  'Restaurants', 'Food Trucks', 'Barbershops', 'Salons', 'Tattoo Shops',
  'Auto Shops', 'Local Stores', 'Real Estate Agents', 'Service Businesses',
];

const BRAND_CHANNELS = [
  'Homepages', 'Magazine Features', 'Live Shows', 'Battles & Cyphers',
  'Leaderboards', 'Venue Rooms', 'Concert Events', 'Video Screens', 'Digital Billboards',
];

export default function SponsorBoard() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '34px 20px 64px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Hero — leads with affordability, not enterprise pricing */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 900 }}>SPONSOR COMMAND</div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 'clamp(28px,4vw,54px)', lineHeight: 0.95 }}>Sponsor Artists &amp; Reach Real Fans</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.62)', fontSize: 13, maxWidth: 640 }}>
            Whether you&apos;re a small local business or a major brand, we have sponsorship opportunities designed for every budget.
          </p>
        </div>

        {/* Small Business Sponsorships — the real, affordable entry point */}
        <section style={{ border: '1px solid rgba(0,255,136,0.35)', background: 'linear-gradient(145deg, rgba(0,255,136,0.08), rgba(5,5,16,0.92))', borderRadius: 14, padding: 22, marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#00FF88', fontWeight: 900, marginBottom: 6 }}>SMALL BUSINESS SPONSORSHIPS</div>
          <h2 style={{ margin: '0 0 10px', fontSize: 26 }}>Starting at $25/month</h2>
          <p style={{ margin: '0 0 12px', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            Perfect for {SMALL_BUSINESS_TYPES.join(', ')}. Sponsor performers directly and put your business in front of engaged local audiences.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#fff' }}><strong style={{ color: '#00FF88' }}>$25/mo</strong> — solo performers</div>
            <div style={{ fontSize: 12, color: '#fff' }}><strong style={{ color: '#00FF88' }}>$50/mo</strong> — bands &amp; groups</div>
          </div>
          <Link href="/performers" style={{ textDecoration: 'none', fontSize: 10, letterSpacing: '0.12em', fontWeight: 900, color: '#050510', background: '#00FF88', padding: '10px 18px', borderRadius: 8, display: 'inline-block' }}>
            FIND PERFORMERS TO SPONSOR →
          </Link>
        </section>

        {/* Two ways to grow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 28 }}>
          <div style={{ border: '1px solid rgba(0,255,255,0.3)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>🤝</div>
            <strong style={{ fontSize: 13 }}>Sponsor a Performer</strong>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '6px 0 0' }}>Support individual artists, bands, DJs, comedians, dancers, writers, and creators.</p>
          </div>
          <div style={{ border: '1px solid rgba(255,45,170,0.3)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>📢</div>
            <strong style={{ fontSize: 13 }}>Advertise Your Business</strong>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '6px 0 0' }}>Promote your brand across The Musician&apos;s Index network.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <Link href="/signup/sponsor" style={pill('#FFD700', '#050510')}>Become Sponsor</Link>
          <Link href="/sponsor/campaigns/new" style={pill('#00FFFF', '#050510')}>Create Campaign</Link>
          <Link href="/advertisers" style={pill('#FF2DAA', '#fff')}>Advertiser Hub</Link>
          <Link href="/admin/stripe-audit" style={pill('rgba(255,255,255,0.08)', '#fff', '1px solid rgba(255,255,255,0.2)')}>Stripe Audit</Link>
        </div>

        {/* Business & Brand Advertising — bigger campaigns, shown after the affordable entry point */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#FF2DAA', fontWeight: 900, marginBottom: 4 }}>BUSINESS &amp; BRAND ADVERTISING</div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            Larger exposure across {BRAND_CHANNELS.join(', ')} — for regional businesses, national brands, record labels, and corporate sponsors.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
          {SLOTS.map((slot) => (
            <article key={slot.id} style={{ border: `1px solid ${slot.accent}44`, background: `linear-gradient(145deg, ${slot.accent}11, rgba(5,5,16,0.92))`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: slot.accent, fontSize: 12, letterSpacing: '0.08em' }}>{slot.lane.toUpperCase()}</strong>
                <span style={{ fontSize: 9, fontWeight: 800, color: slot.status === 'active' ? '#00FF88' : '#FFD700' }}>
                  {slot.status === 'active' ? 'ACTIVE' : 'AVAILABLE'}
                </span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: 22, lineHeight: 1 }}>{slot.brand}</h3>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Budget target: {slot.budget}</p>
              <Link href={slot.ctaHref} style={{ textDecoration: 'none', fontSize: 10, letterSpacing: '0.12em', fontWeight: 900, color: slot.accent }}>
                {slot.status === 'active' ? 'MANAGE SLOT →' : 'CLAIM SLOT →'}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function pill(background: string, color: string, border = '1px solid transparent'): CSSProperties {
  return {
    textDecoration: 'none',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.11em',
    textTransform: 'uppercase',
    border,
    borderRadius: 8,
    padding: '8px 12px',
    background,
    color,
  };
}
