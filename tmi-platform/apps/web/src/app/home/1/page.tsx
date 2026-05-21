import { MagazinePageFlipRuntime } from '@/components/magazine/MagazinePageFlipRuntime';
import HomeSurfacePage from '@/components/home/system/HomeSurfacePage';
import IgnitionBurstConfetti from '@/components/home/effects/IgnitionBurstConfetti';
import BillboardColumnPulse from '../../../components/home/BillboardColumnPulse';
import Home3LiveWorldSurface from '@/components/home/Home3LiveWorldSurface';
import Home4SponsorSurface from '@/components/home/Home4SponsorSurface';
import Home5BattleCypherSurface from '@/components/home/Home5BattleCypherSurface';
import LiveRibbonSystem from '@/components/home/LiveRibbonSystem';
import AvatarMiniPreview from '@/components/avatar/AvatarMiniPreview';
import TMIPricingPulse from '@/components/system/TMIPricingPulse';

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
    durationMs: 30000,
    content: (
      <main
        role="main"
        tabIndex={-1}
        data-telemetry="home.1.render"
        style={{
          position: 'relative',
          height: '100%',
          minHeight: '100%',
          background:
            'radial-gradient(ellipse at 20% 25%, rgba(120,0,255,0.55) 0%, transparent 50%), radial-gradient(ellipse at 80% 75%, rgba(0,200,180,0.45) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(255,0,150,0.35) 0%, transparent 50%), radial-gradient(ellipse at 10% 80%, rgba(255,180,0,0.2) 0%, transparent 40%), linear-gradient(160deg, #12043a 0%, #080c2a 45%, #061018 100%)',
        }}
      >
        <HomeSurfacePage surfaceId={1} />
        <IgnitionBurstConfetti
          zIndex={50}
          assetCategory="hipHop"
          burstDurationMs={2200}
          cycleMs={14000}
          burstCount={44}
        />
        {/* Live status ribbon — "VOTING LIVE", "CROWN UPDATING", etc. */}
        <div aria-live="polite" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60, pointerEvents: 'none' }}>
          <LiveRibbonSystem accent="#FF2DAA" />
        </div>
        {/* Avatar identity badge — bottom-right, above overlays */}
        <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 65, pointerEvents: 'auto' }}>
          <AvatarMiniPreview variant="mini" accentColor="#00FFFF" />
        </div>
        {/* Pricing pulse — fades out after 5 s */}
        <TMIPricingPulse />
        {/* Cover vignette — frames the stage */}
        <div aria-hidden="true" style={atmosphere('rgba(6,2,18,0.36)', 'rgba(120,0,255,0.08)', 'rgba(0,255,255,0.03)')} />
        <div aria-hidden="true" style={SCANLINE} />
      </main>
    ),
  },
  {
    id: 'home-1-2' as const,
    durationMs: 30000,
    content: (
      // BillboardColumnPulse manages its own atmosphere; overflowY allows second section below fold
      <main role="main" tabIndex={-1} data-telemetry="home.1-2.render" style={{ minHeight: '100%', overflowY: 'auto' }}>
        <BillboardColumnPulse />
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
