// Sponsor placement authority — all zones and tiers for editorial magazine ad system.

export type SponsorPlacementZone =
  | "top-banner"
  | "mid-article"
  | "side-rail"
  | "footer-strip"
  | "full-page";

export type SponsorTier = 1 | 2 | 3; // 1=sidebar, 2=half-page, 3=full-page spread

export interface SponsorPlacement {
  id: string;
  sponsorSlug: string;
  sponsorName: string;
  zone: SponsorPlacementZone;
  tier: SponsorTier;
  headline: string;
  body?: string;
  ctaLabel: string;
  ctaRoute: string; // always → /profile/sponsor/[slug]
  promoCode?: string;
  imageUrl?: string;
  accentColor: string;
  rewardTrigger?: string;
}

export const SPONSOR_PLACEMENTS: SponsorPlacement[] = [
  {
    id: "sp-soundwave-001",
    sponsorSlug: "soundwave-audio",
    sponsorName: "SoundWave Audio",
    zone: "mid-article",
    tier: 2,
    headline: "$10,000 Gear Prize Pool",
    body: "Top-ranked TMI artists win professional studio kits from SoundWave Audio.",
    ctaLabel: "Learn More",
    ctaRoute: "/profile/sponsor/soundwave-audio",
    accentColor: "#AA2DFF",
  },
  {
    id: "sp-beatmarket-001",
    sponsorSlug: "beatmarket",
    sponsorName: "BeatMarket",
    zone: "side-rail",
    tier: 1,
    headline: "$2,500 Cash — Weekly Prize",
    body: "BeatMarket pays out every week to the top battle performer.",
    ctaLabel: "Enter Now",
    ctaRoute: "/profile/sponsor/beatmarket",
    accentColor: "#00FFFF",
  },
  {
    id: "sp-tmi-official-001",
    sponsorSlug: "tmi-official",
    sponsorName: "TMI Official",
    zone: "top-banner",
    tier: 1,
    headline: "1M Points — Season Ladder",
    body: "Race for the TMI Season 1 point ladder and claim the official title.",
    ctaLabel: "See Standings",
    ctaRoute: "/rankings",
    accentColor: "#FFD700",
  },
  {
    id: "sp-soundwave-full-001",
    sponsorSlug: "soundwave-audio",
    sponsorName: "SoundWave Audio",
    zone: "full-page",
    tier: 3,
    headline: "The Beat Vault — $10,000 in Gear",
    body: "Exclusively for TMI Season 1. Applications open Friday April 30.",
    ctaLabel: "Apply for The Beat Vault",
    ctaRoute: "/profile/sponsor/soundwave-audio",
    promoCode: "TMI-VAULT-S1",
    accentColor: "#AA2DFF",
    rewardTrigger: "10xp-on-apply",
  },
];

export function getSponsorPlacementById(id: string): SponsorPlacement | undefined {
  return SPONSOR_PLACEMENTS.find((p) => p.id === id);
}

export function getSponsorPlacementsByZone(zone: SponsorPlacementZone): SponsorPlacement[] {
  return SPONSOR_PLACEMENTS.filter((p) => p.zone === zone);
}
