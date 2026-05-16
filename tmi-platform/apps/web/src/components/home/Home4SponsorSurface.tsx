'use client';
import Home4SponsorBillboard from './Home4SponsorBillboard';
import Home4SponsorTools from './Home4SponsorTools';
import Home4FeaturedDeals from './Home4FeaturedDeals';
import Home4AnalyticsBoard from './Home4AnalyticsBoard';
import Home4InventoryMatrix from './Home4InventoryMatrix';
import Home4DealsBoard from './Home4DealsBoard';
import Home4CampaignBuilderRail from './Home4CampaignBuilderRail';
import Home4ProductCarouselRail from './Home4ProductCarouselRail';
import GlobalTopNavRail from './GlobalTopNavRail';
import BreakingNewsTicker from './BreakingNewsTicker';
import SponsorTickerRail from './SponsorTickerRail';
import Home4SponsorDensityRail from './Home4SponsorDensityRail';
import { enforceRouteOwnership } from '@/lib/routes/TmiVisualRouteMap';
import { getVisualSlot } from '@/lib/visuals/TmiVisualSlotRegistry';
import "@/styles/tmiTypography.css";

export default function Home4SponsorSurface() {
  enforceRouteOwnership('/home/4');
  getVisualSlot('home-4-hero');

  const commerceCards = [
    { href: '/ads/inventory', title: 'Inventory Placements', subtitle: 'Slot depth + CPM lanes', color: '#00FFFF', glyph: '🧱' },
    { href: '/ads/analytics', title: 'Analytics Dashboard', subtitle: 'CTR, spend, conversion', color: '#FF2DAA', glyph: '📈' },
    { href: '/ads/contracts', title: 'Deals + Contracts', subtitle: 'Negotiation queue', color: '#AA2DFF', glyph: '🤝' },
    { href: '/products', title: 'Product Shelf', subtitle: 'Launch rail + promo cards', color: '#00FF88', glyph: '🛍️' },
  ] as const;

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 20% 80%, rgba(255,215,0,0.15), transparent 50%), #050510', color: '#fff', paddingBottom: 80 }}>
      <GlobalTopNavRail />
      <BreakingNewsTicker />
      <SponsorTickerRail />
      <Home4SponsorDensityRail />

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '34px 24px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FFD700', fontWeight: 800, marginBottom: 14 }}>
          SPONSOR + ADVERTISER MARKETPLACE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          <a href="/advertiser" style={{ textDecoration: 'none', color: '#fff' }}>
            <div style={{ minHeight: 220, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,215,0,0.4)', background: 'linear-gradient(145deg, rgba(255,215,0,0.22), rgba(5,5,16,0.82))', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'inline-flex', fontSize: 8, letterSpacing: '0.14em', color: '#FFD700', border: '1px solid rgba(255,215,0,0.45)', borderRadius: 4, padding: '3px 6px', width: 'fit-content' }}>MAIN BILLBOARD AD</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem,2.8vw,2.1rem)' }}>Campaign Builder + Secure Deal Gateway</h1>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>Create, checkout, place, and analyze sponsor and advertiser campaigns.</p>
              </div>
            </div>
          </a>

          {commerceCards.map((card) => (
            <a key={card.href} href={card.href} style={{ textDecoration: 'none', color: '#fff' }}>
              <div style={{ minHeight: 104, borderRadius: 12, overflow: 'hidden', border: `1px solid ${card.color}55`, background: `linear-gradient(145deg, ${card.color}30, rgba(5,5,16,0.82))`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 12 }}>
                <div style={{ fontSize: 16 }}>{card.glyph}</div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '0.08em', fontWeight: 800 }}>{card.title}</div>
                  <div style={{ marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.72)' }}>{card.subtitle}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Sponsor billboard */}
      <Home4SponsorBillboard />

      {/* Sponsor toolkit */}
      <Home4SponsorTools />

      {/* Analytics board */}
      <Home4AnalyticsBoard />

      {/* Inventory matrix */}
      <Home4InventoryMatrix />

      {/* Deals board */}
      <Home4DealsBoard />

      {/* Campaign builder rail */}
      <Home4CampaignBuilderRail />

      {/* Product carousel rail */}
      <Home4ProductCarouselRail />

      {/* Featured deals */}
      <Home4FeaturedDeals />
    </main>
  );
}
