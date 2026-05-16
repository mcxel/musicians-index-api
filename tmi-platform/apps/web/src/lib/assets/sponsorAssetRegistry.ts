// ─── Canonical Sponsor Asset Registry ───────────────────────────────────────
// Image paths: /assets/generated/sponsors/[slug]-[variant].jpg
// Use generated brand visuals — studio lighting, product renders, logo environments.
// Do not reference PDF assets or internal blueprint images.

import type { RuntimeAssetEntry } from "./RuntimeAssetEntry";

export const sponsorAssetRegistry: RuntimeAssetEntry[] = [
  {
    id: "sponsor-soundwave-audio",
    slug: "soundwave-audio",
    tileImage: "/assets/generated/sponsors/soundwave-audio-tile.jpg",
    profileImage: "/assets/generated/sponsors/soundwave-audio-profile.jpg",
    fallbackTheme: "gold-neon",
    replacementRoute: "/sponsors/soundwave-audio",
  },
  {
    id: "sponsor-beatvault-pro",
    slug: "beatvault-pro",
    tileImage: "/assets/generated/sponsors/beatvault-pro-tile.jpg",
    profileImage: "/assets/generated/sponsors/beatvault-pro-profile.jpg",
    fallbackTheme: "violet-neon",
    replacementRoute: "/sponsors/beatvault-pro",
  },
  {
    id: "sponsor-tmi-marketplace",
    slug: "tmi-marketplace",
    tileImage: "/assets/generated/sponsors/tmi-marketplace-tile.jpg",
    profileImage: "/assets/generated/sponsors/tmi-marketplace-profile.jpg",
    fallbackTheme: "cyan-tech",
    replacementRoute: "/sponsors/tmi-marketplace",
  },
  {
    id: "sponsor-neonwear-apparel",
    slug: "neonwear-apparel",
    tileImage: "/assets/generated/sponsors/neonwear-apparel-tile.jpg",
    profileImage: "/assets/generated/sponsors/neonwear-apparel-profile.jpg",
    fallbackTheme: "fuchsia-fashion",
    replacementRoute: "/sponsors/neonwear-apparel",
  },
  {
    id: "sponsor-arena-energy",
    slug: "arena-energy",
    tileImage: "/assets/generated/sponsors/arena-energy-tile.jpg",
    profileImage: "/assets/generated/sponsors/arena-energy-profile.jpg",
    fallbackTheme: "electric-red",
    replacementRoute: "/sponsors/arena-energy",
  },
  {
    id: "sponsor-cipher-cloud",
    slug: "cipher-cloud",
    tileImage: "/assets/generated/sponsors/cipher-cloud-tile.jpg",
    profileImage: "/assets/generated/sponsors/cipher-cloud-profile.jpg",
    fallbackTheme: "deep-blue-tech",
    replacementRoute: "/sponsors/cipher-cloud",
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const _byId = new Map(sponsorAssetRegistry.map((e) => [e.id, e]));
const _bySlug = new Map(sponsorAssetRegistry.map((e) => [e.slug, e]));

export function resolveSponsorAsset(id: string): RuntimeAssetEntry | undefined {
  return _byId.get(id);
}

export function resolveSponsorAssetBySlug(slug: string): RuntimeAssetEntry | undefined {
  return _bySlug.get(slug);
}
