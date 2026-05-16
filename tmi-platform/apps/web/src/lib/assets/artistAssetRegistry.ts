// ─── Canonical Artist Asset Registry ────────────────────────────────────────
// Image paths: /artists/artist-[01-10].(png|jpg)
// These are real public assets that exist in /public and should not 404.

import type { RuntimeAssetEntry } from "./RuntimeAssetEntry";

export const artistAssetRegistry: RuntimeAssetEntry[] = [
  {
    id: "artist-kova",
    slug: "kova",
    tileImage: "/artists/artist-01.png",
    profileImage: "/artists/artist-01.png",
    fallbackTheme: "neon-crown",
    replacementRoute: "/artists/kova",
  },
  {
    id: "artist-nera-vex",
    slug: "nera-vex",
    tileImage: "/artists/artist-02.png",
    profileImage: "/artists/artist-02.png",
    fallbackTheme: "cool-cyan",
    replacementRoute: "/artists/nera-vex",
  },
  {
    id: "artist-beatarchitect",
    slug: "beatarchitect",
    tileImage: "/artists/artist-03.png",
    profileImage: "/artists/artist-03.png",
    fallbackTheme: "studio-amber",
    replacementRoute: "/artists/beatarchitect",
  },
  {
    id: "artist-zuri-bloom",
    slug: "zuri-bloom",
    tileImage: "/artists/artist-04.png",
    profileImage: "/artists/artist-04.png",
    fallbackTheme: "afro-gold",
    replacementRoute: "/artists/zuri-bloom",
  },
  {
    id: "artist-krypt",
    slug: "krypt",
    tileImage: "/artists/artist-05.jpg",
    profileImage: "/artists/artist-05.jpg",
    fallbackTheme: "underground-violet",
    replacementRoute: "/artists/krypt",
  },
  {
    id: "artist-lyra-sine",
    slug: "lyra-sine",
    tileImage: "/artists/artist-06.jpg",
    profileImage: "/artists/artist-06.jpg",
    fallbackTheme: "rnb-midnight",
    replacementRoute: "/artists/lyra-sine",
  },
  {
    id: "artist-neon-vibe",
    slug: "neon-vibe",
    tileImage: "/artists/artist-07.jpg",
    profileImage: "/artists/artist-07.jpg",
    fallbackTheme: "trap-neon",
    replacementRoute: "/artists/neon-vibe",
  },
  {
    id: "artist-orion-drop",
    slug: "orion-drop",
    tileImage: "/artists/artist-08.jpg",
    profileImage: "/artists/artist-08.jpg",
    fallbackTheme: "deep-space",
    replacementRoute: "/artists/orion-drop",
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const _byId = new Map(artistAssetRegistry.map((e) => [e.id, e]));
const _bySlug = new Map(artistAssetRegistry.map((e) => [e.slug, e]));

export function resolveArtistAsset(id: string): RuntimeAssetEntry | undefined {
  return _byId.get(id);
}

export function resolveArtistAssetBySlug(slug: string): RuntimeAssetEntry | undefined {
  return _bySlug.get(slug);
}
