import React from 'react';
import type { Metadata } from 'next';
import { MagazinePageFlipRuntime } from '@/components/magazine/MagazinePageFlipRuntime';

export const metadata: Metadata = {
  title: "The Musician's Index — Live Music Platform",
  description: "The Musician's Index is a live interactive music platform where artists battle, fans vote, venues broadcast, and music discovery happens in real time.",
  openGraph: {
    title: "The Musician's Index | Your Stage. Be Original.",
    description: "Live battles, cyphers, shows, artist discovery, and fan engagement — all on one platform. The scene is live right now.",
    url: "https://themusiciansindex.com/home/1",
    images: [{ url: "https://themusiciansindex.com/og-image.jpg", width: 1200, height: 630, alt: "The Musician's Index — Live Music Platform" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Musician's Index | Your Stage. Be Original.",
    description: "Live battles, cyphers, shows, artist discovery, and fan engagement — all on one platform.",
    images: ["https://themusiciansindex.com/og-image.jpg"],
  },
};
import HomeSurfacePage from '@/components/home/system/HomeSurfacePage';
import BillboardColumnPulse from '../../../components/home/BillboardColumnPulse';
import Home3LiveWorldSurface from '@/components/home/Home3LiveWorldSurface';
import Home4SponsorSurface from '@/components/home/Home4SponsorSurface';
import Home5BattleCypherSurface from '@/components/home/Home5BattleCypherSurface';
import Home1CoverPage from '@/components/home/Home1CoverPage';
import BillboardLiveWall from '@/components/media/BillboardLiveWall';
import Home1CinematicLightingPass from '@/components/home/Home1CinematicLightingPass';

// ─── Scene atmosphere constants ───────────────────────────────────────────────

// Universal scanline overlay — same for all pages
const SCANLINE: React.CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 198,
  backgroundImage:
    'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
  backgroundSize: '100% 4px',
};

// Page-specific vignette + rim color
function atmosphere(
  vignColor: string,
  rimTop: string,
  rimSide: string,
): React.CSSProperties {
  return {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 199,
    background: [
      // Edge vignette
      `radial-gradient(ellipse at 50% 50%, transparent 50%, ${vignColor} 100%)`,
      // Top rim light (characteristic color per scene)
      `radial-gradient(ellipse at 50% 0%, ${rimTop} 0%, transparent 45%)`,
      // Side rim wash
      `linear-gradient(90deg, ${rimSide} 0%, transparent 18%, transparent 82%, ${rimSide} 100%)`,
    ].join(', '),
  };
}

// Per-scene atmosphere definitions
const ATMO = {
  // Scene 2 — Editorial/Crown: deep indigo press lighting
  'home-2': atmosphere(
    'rgba(30,0,80,0.38)',
    'rgba(100,0,255,0.10)',
    'rgba(80,0,200,0.06)',
  ),
  // Scene 3 — Live World: warm amber stage heat, red side fill
  'home-3': atmosphere(
    'rgba(80,10,0,0.42)',
    'rgba(255,110,20,0.13)',
    'rgba(200,50,0,0.07)',
  ),
  // Scene 4 — Sponsor World: gold billboard wash, luxury amber columns
  'home-4': atmosphere(
    'rgba(40,30,0,0.40)',
    'rgba(255,200,0,0.11)',
    'rgba(180,110,0,0.07)',
  ),
  // Scene 5 — Battle Arena: crimson overhead, purple flanks
  'home-5': atmosphere(
    'rgba(60,0,10,0.44)',
    'rgba(200,0,40,0.15)',
    'rgba(130,0,180,0.07)',
  ),
} as const;

// ─── Scenes ───────────────────────────────────────────────────────────────────

export const MAGAZINE_FULL_ROTATION_SCENES = [
  {
    id: 'home-1' as const,
    durationMs: 60000,
    content: (
      <main
        role="main"
        tabIndex={-1}
        data-telemetry="home.1.render"
        className="tmi-home1-cinematic-lock"
        style={{ position: 'relative', minHeight: '100%', overflowX: 'hidden', overflowY: 'auto' }}
      >
        <Home1CoverPage />
        <Home1CinematicLightingPass />
      </main>
    ),
  },
  {
    id: 'home-1-2' as const,
    durationMs: 60000,
    content: (
      <main role="main" tabIndex={-1} data-telemetry="home.1-2.render" style={{ position: 'relative', minHeight: '100%', overflowX: 'hidden', overflowY: 'auto', background: '#00C8FF', filter: 'contrast(1.12) saturate(1.18)' }}>
        {/* CMYK ink stripe */}
        <div style={{ display: 'flex', height: 6, position: 'sticky', top: 0, zIndex: 50 }}>
          {(['#FF2DAA','#FFD700','#AA2DFF','#00FF88','#FF4400'] as const).map((c) => <div key={c} style={{ flex: 1, background: c }} />)}
        </div>
        {/* Halftone underlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,0,30,0.2) 1px, transparent 1px)', backgroundSize: '10px 10px', mixBlendMode: 'multiply', pointerEvents: 'none', zIndex: 0 }} />
        {/* Section header */}
        <div style={{ background: '#050310', padding: '10px 20px', borderBottom: '4px solid #FFD700', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', color: '#00C8FF', fontFamily: 'Inter,sans-serif' }}>THE MUSICIAN&apos;S INDEX</div>
          <div style={{ flex: 1, height: 2, background: '#FFD700', minWidth: 20 }} />
          <div style={{ fontSize: 'clamp(18px,3.5vw,28px)', fontFamily: "'Bebas Neue',Impact,sans-serif", color: '#FFD700', letterSpacing: '0.04em', textShadow: '2px 2px 0 #050310', whiteSpace: 'nowrap' }}>LIVE RANKINGS &amp; NOW PLAYING</div>
          <div style={{ flex: 1, height: 2, background: '#FFD700', minWidth: 20 }} />
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <BillboardColumnPulse />
          <div style={{ background: 'rgba(5,5,16,0.88)', borderTop: '2px solid rgba(255,0,68,0.6)', borderBottom: '2px solid rgba(0,200,255,0.25)', padding: '20px 20px 28px', maxWidth: 1100, margin: '0 auto', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 6, height: 24, background: '#FF0044', boxShadow: '0 0 12px rgba(255,0,68,0.7)' }} />
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#fff', fontFamily: 'Inter,sans-serif' }}>🔴 LIVE NOW — PERFORMING TONIGHT</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,45,170,0.6), transparent)' }} />
            </div>
            <BillboardLiveWall mode="home" maxTiles={12} title="LIVE NOW" />
          </div>
        </div>
        <div aria-hidden="true" style={SCANLINE} />
      </main>
    ),
  },
  {
    id: 'home-2' as const,
    durationMs: 60000,
    content: (
      <main role="main" tabIndex={-1} data-telemetry="home.2.render" style={{ position: 'relative', minHeight: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        <HomeSurfacePage surfaceId={2} />
        <div aria-hidden="true" style={ATMO['home-2']} />
        <div aria-hidden="true" style={SCANLINE} />
      </main>
    ),
  },
  {
    id: 'home-3' as const,
    durationMs: 60000,
    content: (
      <main role="main" tabIndex={-1} data-telemetry="home.3.render" style={{ position: 'relative', minHeight: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        <Home3LiveWorldSurface />
        <div aria-hidden="true" style={ATMO['home-3']} />
        <div aria-hidden="true" style={SCANLINE} />
      </main>
    ),
  },
  {
    id: 'home-4' as const,
    durationMs: 60000,
    content: (
      <main role="main" tabIndex={-1} data-telemetry="home.4.render" style={{ position: 'relative', minHeight: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        <Home4SponsorSurface />
        <div aria-hidden="true" style={ATMO['home-4']} />
        <div aria-hidden="true" style={SCANLINE} />
      </main>
    ),
  },
  {
    id: 'home-5' as const,
    durationMs: 60000,
    content: (
      <main role="main" tabIndex={-1} data-telemetry="home.5.render" style={{ position: 'relative', minHeight: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        <Home5BattleCypherSurface />
        <div aria-hidden="true" style={ATMO['home-5']} />
        <div aria-hidden="true" style={SCANLINE} />
      </main>
    ),
  },
];

export default function Home1Page() {
  return (
    <MagazinePageFlipRuntime
      scenes={MAGAZINE_FULL_ROTATION_SCENES}
      initialIndex={0}
    />
  );
}
