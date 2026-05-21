// apps/web/src/lib/sponsors/artistSponsorReveal.engine.ts
// When an artist appears: 3-sponsor stack animates in, stays 2-4s, fades out.
// Also powers screen ads, intermission ads, "powered by" credits.
// Keeps sponsor moments SHORT and CLEAN — never interrupts performance.

export interface SponsorSlot {
  tier: "primary" | "secondary" | "standard";
  sponsorId: string;
  sponsorName: string;
  logoUrl?: string;
  color: string;
  displayDurationMs: number;
}

export interface ArtistSponsorPack {
  artistId: string;
  slots: SponsorSlot[];       // max 3 primary
  revealDurationMs: number;   // total reveal window (default 3000ms)
  fadeInMs: number;
  fadeOutMs: number;
  showFor: "artist_intro" | "post_performance" | "idle_screens" | "winner_reveal";
}

export const DEFAULT_REVEAL_CONFIG = {
  revealDurationMs: 3000,   // 3 second total reveal
  fadeInMs: 400,
  fadeOutMs: 600,
  maxPrimary: 3,
  maxSecondary: 5,
} as const;

export function buildSponsorReveal(artistId: string, sponsors: SponsorSlot[]): ArtistSponsorPack {
  const primary = sponsors.filter(s => s.tier === "primary").slice(0, 3);
  return {
    artistId,
    slots: primary,
    revealDurationMs: DEFAULT_REVEAL_CONFIG.revealDurationMs,
    fadeInMs: DEFAULT_REVEAL_CONFIG.fadeInMs,
    fadeOutMs: DEFAULT_REVEAL_CONFIG.fadeOutMs,
    showFor: "artist_intro",
  };
}

// Sponsor timeline per show phase
export const SPONSOR_TIMELINE = {
  pre_show:       { showAds: true,  showBranding: true,  showPerformanceSponsor: false },
  artist_intro:   { showAds: false, showBranding: false, showPerformanceSponsor: true  }, // 3-stack reveal
  performance:    { showAds: false, showBranding: false, showPerformanceSponsor: false }, // NEVER during performance
  intermission:   { showAds: true,  showBranding: true,  showPerformanceSponsor: false },
  post_performance: { showAds: false, showBranding: false, showPerformanceSponsor: true }, // "powered by" credit
  winner_reveal:  { showAds: false, showBranding: true,  showPerformanceSponsor: true  },
} as const;

// "3 advertiser thing" — the 3-sponsor stack CSS animation spec
export const SPONSOR_STACK_ANIMATION = `
/* Inject into component styles */
.sponsor-stack { display: flex; gap: 12px; position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 50; }
.sponsor-badge { background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 6px 16px; font-family: 'Oswald', sans-serif; font-size: 12px; color: white; letter-spacing: 1px; animation: sponsor-pop 3s ease-in-out forwards; }
@keyframes sponsor-pop {
  0%   { opacity:0; transform:translateY(10px); }
  15%  { opacity:1; transform:translateY(0); }
  75%  { opacity:1; transform:translateY(0); }
  100% { opacity:0; transform:translateY(-5px); }
}
`;
