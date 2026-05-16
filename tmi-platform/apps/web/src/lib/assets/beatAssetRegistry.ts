// ─── Canonical Beat Asset Registry ───────────────────────────────────────────
// Image paths: /assets/generated/beats/[slug]-[variant].jpg
// Use generated beat visuals — instruments, studio renders, waveform art, equipment.
// Beat IDs MUST align with BeatDropEngine.ts SEED_DROP_BEATS entries.
// Do not reference PDF assets or internal blueprint images.

import type { RuntimeAssetEntry } from "./RuntimeAssetEntry";

export const beatAssetRegistry: RuntimeAssetEntry[] = [
  // ── Active BeatDropEngine seeds (aligned to BeatDropEngine.ts) ───────────
  {
    id: "beat-electric-sky",
    slug: "electric-sky",
    tileImage: "/assets/generated/beats/electric-sky-tile.jpg",
    profileImage: "/assets/generated/beats/electric-sky-profile.jpg",
    fallbackTheme: "trap-neon",
    replacementRoute: "/beats/electric-sky",
  },
  {
    id: "beat-lagos-night",
    slug: "lagos-night",
    tileImage: "/assets/generated/beats/lagos-night-tile.jpg",
    profileImage: "/assets/generated/beats/lagos-night-profile.jpg",
    fallbackTheme: "afro-gold",
    replacementRoute: "/beats/lagos-night",
  },
  {
    id: "beat-cipher-code",
    slug: "cipher-code",
    tileImage: "/assets/generated/beats/cipher-code-tile.jpg",
    profileImage: "/assets/generated/beats/cipher-code-profile.jpg",
    fallbackTheme: "underground-violet",
    replacementRoute: "/beats/cipher-code",
  },
  // ── Extended beat roster ──────────────────────────────────────────────────
  {
    id: "beat-midnight-rnb-loop",
    slug: "midnight-rnb-loop",
    tileImage: "/assets/generated/beats/midnight-rnb-loop-tile.jpg",
    profileImage: "/assets/generated/beats/midnight-rnb-loop-profile.jpg",
    fallbackTheme: "rnb-midnight",
    replacementRoute: "/beats/midnight-rnb-loop",
  },
  {
    id: "beat-crown-duel-pack",
    slug: "crown-duel-pack",
    tileImage: "/assets/generated/beats/crown-duel-pack-tile.jpg",
    profileImage: "/assets/generated/beats/crown-duel-pack-profile.jpg",
    fallbackTheme: "battle-heat",
    replacementRoute: "/beats/crown-duel-pack",
  },
  {
    id: "beat-after-hours-guitar",
    slug: "after-hours-guitar",
    tileImage: "/assets/generated/beats/after-hours-guitar-tile.jpg",
    profileImage: "/assets/generated/beats/after-hours-guitar-profile.jpg",
    fallbackTheme: "after-hours",
    replacementRoute: "/beats/after-hours-guitar",
  },
  {
    id: "beat-solar-trap-808",
    slug: "solar-trap-808",
    tileImage: "/assets/generated/beats/solar-trap-808-tile.jpg",
    profileImage: "/assets/generated/beats/solar-trap-808-profile.jpg",
    fallbackTheme: "solar-fire",
    replacementRoute: "/beats/solar-trap-808",
  },
  {
    id: "beat-vault-keys",
    slug: "vault-keys",
    tileImage: "/assets/generated/beats/vault-keys-tile.jpg",
    profileImage: "/assets/generated/beats/vault-keys-profile.jpg",
    fallbackTheme: "gold-vault",
    replacementRoute: "/beats/vault-keys",
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const _byId = new Map(beatAssetRegistry.map((e) => [e.id, e]));
const _bySlug = new Map(beatAssetRegistry.map((e) => [e.slug, e]));

export function resolveBeatAsset(id: string): RuntimeAssetEntry | undefined {
  return _byId.get(id);
}

export function resolveBeatAssetBySlug(slug: string): RuntimeAssetEntry | undefined {
  return _bySlug.get(slug);
}
