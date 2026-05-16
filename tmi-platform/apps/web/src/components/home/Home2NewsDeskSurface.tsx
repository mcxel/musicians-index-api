'use client';
import Home2EditorialRail from './Home2EditorialRail';
import Home2PremieresRail from './Home2PremieresRail';
import Home2MonetizationRail from './Home2MonetizationRail';
import Home2DiscoveryRail from './Home2DiscoveryRail';
import Home2MarketplaceRail from './Home2MarketplaceRail';
import GlobalTopNavRail from './GlobalTopNavRail';
import BreakingNewsTicker from './BreakingNewsTicker';
import SponsorTickerRail from './SponsorTickerRail';
import Home2SponsorArticleStrip from './Home2SponsorArticleStrip';
import Home2ReadNextRail from './Home2ReadNextRail';
import Home2TrendingIssueRail from './Home2TrendingIssueRail';
import Home2NewsDensityRail from './Home2NewsDensityRail';
import WorldTrendingBelt from './WorldTrendingBelt';
import { enforceRouteOwnership } from '@/lib/routes/TmiVisualRouteMap';
import { getVisualSlot } from '@/lib/visuals/TmiVisualSlotRegistry';
import "@/styles/tmiTypography.css";

export default function Home2NewsDeskSurface() {
  enforceRouteOwnership('/home/2');
  getVisualSlot('home-2-hero');

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, rgba(170,45,255,0.15), transparent 50%), #050510', color: '#fff', paddingBottom: 80 }}>
      <GlobalTopNavRail />
      <BreakingNewsTicker />
      <SponsorTickerRail />
      <Home2NewsDensityRail />

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '34px 24px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 14 }}>
          ARTICLES · DISCOVERY · MARKETPLACE
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: 12,
          }}
        >
          <a href="/articles/news" style={{ textDecoration: 'none', color: '#fff' }}>
            <div style={{ minHeight: 220, position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,255,255,0.35)', background: "linear-gradient(145deg, rgba(0,255,255,0.22), rgba(5,5,16,0.72)), url('/tmi-curated/mag-74.jpg') center/cover" }}>
              <div style={{ position: 'absolute', top: 12, right: 12, background: '#00FFFF', color: '#000', fontSize: 10, padding: '4px 10px', borderRadius: 4, fontWeight: 800 }}>NEW ISSUE</div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#00FFFF', fontWeight: 800, marginBottom: 8 }}>FEATURE STORY</div>
                <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem,2.8vw,2.1rem)', lineHeight: 1.05 }}>Music News, Interviews, and Studio Recaps</h1>
              </div>
            </div>
          </a>

          {[
            { href: '/articles/interview/weekly-feature', title: 'Interviews', img: '/tmi-curated/mag-58.jpg', color: '#FF2DAA' },
            { href: '/articles/recap/studio-week', title: 'Studio Recaps', img: '/tmi-curated/mag-66.jpg', color: '#FFD700' },
            { href: '/genres/hip-hop', title: 'Genre Cluster', img: '/tmi-curated/mag-42.jpg', color: '#AA2DFF' },
            { href: '/sponsors', title: 'Sponsor Spotlight', img: '/tmi-curated/mag-50.jpg', color: '#00FF88' },
          ].map((card, index) => (
            <a key={card.href} href={card.href} style={{ textDecoration: 'none', color: '#fff' }}>
              <div style={{ minHeight: 104, position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${card.color}55`, background: `linear-gradient(145deg, ${card.color}30, rgba(5,5,16,0.78)), url('${card.img}') center/cover`, display: 'flex', alignItems: 'flex-end', padding: 12 }}>
                {index === 0 && <div style={{ position: 'absolute', top: 8, right: 8, background: card.color, color: '#000', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>HOT</div>}
                <div style={{ fontSize: 12, letterSpacing: '0.08em', fontWeight: 800 }}>{card.title}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Editorial rail */}
      <Home2EditorialRail />

      {/* Discovery rail */}
      <Home2DiscoveryRail />

      {/* Premieres rail */}
      <Home2PremieresRail />

      {/* Monetization rail */}
      <Home2MonetizationRail />

      {/* Marketplace rail */}
      <Home2MarketplaceRail />

      {/* Sponsor Article Strip */}
      <Home2SponsorArticleStrip />

      {/* Read Next Rail */}
      <Home2ReadNextRail />

      {/* Trending Issue Rail */}
      <Home2TrendingIssueRail />

      {/* World trending global belt */}
      <WorldTrendingBelt />
    </main>
  );
}
