'use client';
import Home2EditorialRail from './Home2EditorialRail';
import Home2PremieresRail from './Home2PremieresRail';
import Home2MonetizationRail from './Home2MonetizationRail';
import Home2DiscoveryRail from './Home2DiscoveryRail';
import Home2MarketplaceRail from './Home2MarketplaceRail';
import Home2NewsTickerRail from './Home2NewsTickerRail';
import GlobalTopNavRail from './GlobalTopNavRail';
import BreakingNewsTicker from './BreakingNewsTicker';
import SponsorTickerRail from './SponsorTickerRail';
import Home2SponsorArticleStrip from './Home2SponsorArticleStrip';
import Home2ReadNextRail from './Home2ReadNextRail';
import Home2TrendingIssueRail from './Home2TrendingIssueRail';
import Home2NewsDensityRail from './Home2NewsDensityRail';
import WorldTrendingBelt from './WorldTrendingBelt';
import LiveMagazineVoiceTicker from './LiveMagazineVoiceTicker';
import { enforceRouteOwnership } from '@/lib/routes/TmiVisualRouteMap';
import { getVisualSlot } from '@/lib/visuals/TmiVisualSlotRegistry';
import RoomContainer from '@/components/room/RoomContainer';
import WidgetDrawer from '@/components/room/WidgetDrawer';
import NeonWaveUnderlay from '@/components/atmosphere/NeonWaveUnderlay';
import UnifiedAdSlot from '@/components/ads/UnifiedAdSlot';
import DesktopAtmosphereRails from '@/components/home/DesktopAtmosphereRails';
import "@/styles/tmiTypography.css";

export default function Home2NewsDeskSurface() {
  enforceRouteOwnership('/home/2');
  getVisualSlot('home-2-hero');

  return (
    <RoomContainer roomId="home-2" title="News Desk" accentColor="#00FFFF" bpm={90}>
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, rgba(170,45,255,0.15), transparent 50%), #050510', color: '#fff', paddingBottom: 80, position: 'relative' }}>
      <DesktopAtmosphereRails />
      <NeonWaveUnderlay colorA="#00FFFF" colorB="#AA2DFF" colorC="#FF2DAA" opacity={0.1} zIndex={0} />
      <style>{`
        @media (max-width: 639px) {
          [data-tmi-home2-feature-grid] {
            grid-template-columns: 1fr !important;
          }
          [data-tmi-home2-feature-grid] > a > div {
            min-height: 120px !important;
          }
        }
      `}</style>
      <GlobalTopNavRail />
      <BreakingNewsTicker />
      <SponsorTickerRail />
      <LiveMagazineVoiceTicker pageId="home-2" accent="#AA2DFF" />

      {/* ══ MAGAZINE MASTHEAD — blueprint tmi_magazine_all_page_templates ══ */}
      <div style={{ background: 'linear-gradient(180deg,rgba(255,107,0,.12),rgba(255,215,0,.06),rgba(10,6,40,1))', borderBottom: '2px solid #FF6B00', padding: '16px 24px' }}>
        {/* Issue header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'Impact,"Arial Black",sans-serif', fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: '#FF6B00', textShadow: '0 0 14px #FF6B0099', letterSpacing: '.03em', lineHeight: 1.05 }}>
              THE MUSICIAN&apos;S INDEX
            </div>
            <div style={{ fontFamily: 'Impact,"Arial Black",sans-serif', fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: '#FFD700', textShadow: '0 0 10px #FFD70099', letterSpacing: '.03em', lineHeight: 1.05 }}>
              MAGAZINE
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background: '#FF6B00', color: '#fff', fontSize: 9, fontWeight: 900, padding: '3px 10px', borderRadius: 3, letterSpacing: '.1em', marginBottom: 4, display: 'inline-block' }}>CURRENT ISSUE</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontFamily: 'Inter,sans-serif' }}>VOL.1 · Rolling Stone meets Billboard</div>
          </div>
        </div>
        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            { label: 'ARTICLES', href: '/articles', color: '#FF6B00' },
            { label: 'EDITORIAL', href: '#editorial', color: '#FFD700' },
            { label: 'DISCOVERY', href: '#discovery', color: '#00D4FF' },
            { label: 'LIVE ROOMS', href: '/live/lobby', color: '#FF2DAA' },
            { label: 'GAMES', href: '/games', color: '#00A896' },
            { label: 'MARKETPLACE', href: '/sponsors', color: '#6B2FB3' },
          ].map((tab) => (
            <a key={tab.href} href={tab.href} style={{ padding: '4px 10px', borderRadius: 4, border: `1px solid ${tab.color}66`, background: 'transparent', color: tab.color, fontSize: 8, fontWeight: 900, cursor: 'pointer', fontFamily: 'Inter,sans-serif', letterSpacing: '.08em', textDecoration: 'none', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              {tab.label}
            </a>
          ))}
        </div>
        {/* Divider line */}
        <div style={{ height: 2, background: 'linear-gradient(90deg,#FF6B00,#FFD700,#00D4FF)', margin: '10px 0 0', borderRadius: 1 }} />
      </div>

      {/* ── AD BREAK — leaderboard after ticker, before editorial ── */}
      <UnifiedAdSlot venue="home-2" slotKey="homepageBanner" format="horizontal" label="ADVERTISEMENT" style={{ margin: '0 24px 8px', minHeight: 90 }} accentColor="#00FFFF" />
      <Home2NewsDensityRail />

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '34px 24px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 14 }}>
          ARTICLES · DISCOVERY · MARKETPLACE
        </div>
        <div
          data-tmi-home2-feature-grid
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

      <Home2NewsTickerRail accentColor="#FFD700" />

      {/* Editorial rail */}
      <div id="editorial">
        <Home2EditorialRail />
      </div>

      {/* ── AD BREAK 2 — rectangle between editorial and discovery ── */}
      <UnifiedAdSlot venue="home-2" slotKey="homepageMid" format="rectangle" label="ADVERTISEMENT" style={{ margin: '0 24px 8px', minHeight: 250 }} accentColor="#00FFFF" />

      {/* Discovery rail */}
      <div id="discovery">
        <Home2DiscoveryRail />
      </div>

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
      <WidgetDrawer />
    </main>
    </RoomContainer>
  );
}
