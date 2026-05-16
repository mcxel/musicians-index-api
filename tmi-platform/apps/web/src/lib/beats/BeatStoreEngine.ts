import { resolveLicenseTerms, type BeatLicenseType } from "@/lib/beats/BeatLicenseResolver";

export type BeatCatalogEntry = {
  beatId: string;
  title: string;
  producerId: string;
  producerName: string;
  producerSlug: string;
  bpm: number;
  genre: string;
  previewAudioUrl: string;
  waveformImageUrl: string;
  coverArtUrl: string;
  tags: string[];
  priceCents: number;
  licensePricing: Record<BeatLicenseType, number>;
  available: boolean;
};

const CATALOG: BeatCatalogEntry[] = [
  {
    beatId: "electric-sky",
    title: "Electric Sky",
    producerId: "producer-neon-vibe",
    producerName: "Neon Vibe",
    producerSlug: "neon-vibe",
    bpm: 140,
    genre: "Trap",
    previewAudioUrl: "/previews/electric-sky.mp3",
    waveformImageUrl: "/images/waveforms/electric-sky.png",
    coverArtUrl: "/images/beats/electric-sky-cover.jpg",
    tags: ["hard", "808", "arena", "battle"],
    priceCents: 2999,
    licensePricing: {
      "mp3-lease": resolveLicenseTerms("mp3-lease").pricingCents,
      "wav-lease": resolveLicenseTerms("wav-lease").pricingCents,
      "unlimited-lease": resolveLicenseTerms("unlimited-lease").pricingCents,
      "exclusive-rights": 89999,
    },
    available: true,
  },
  {
    beatId: "lagos-night",
    title: "Lagos Night",
    producerId: "producer-zuri-bloom",
    producerName: "Zuri Bloom",
    producerSlug: "zuri-bloom",
    bpm: 102,
    genre: "Afrobeats",
    previewAudioUrl: "/previews/lagos-night.mp3",
    waveformImageUrl: "/images/waveforms/lagos-night.png",
    coverArtUrl: "/images/beats/lagos-night-cover.jpg",
    tags: ["melodic", "groove", "summer"],
    priceCents: 2499,
    licensePricing: {
      "mp3-lease": 2499,
      "wav-lease": 4999,
      "unlimited-lease": 12999,
      "exclusive-rights": 64999,
    },
    available: true,
  },
  {
    beatId: "cipher-code",
    title: "Cipher Code",
    producerId: "producer-krypt",
    producerName: "KRYPT",
    producerSlug: "krypt",
    bpm: 88,
    genre: "Boom Bap",
    previewAudioUrl: "/previews/cipher-code.mp3",
    waveformImageUrl: "/images/waveforms/cipher-code.png",
    coverArtUrl: "/images/beats/cipher-code-cover.jpg",
    tags: ["raw", "lyrical", "vinyl"],
    priceCents: 1999,
    licensePricing: {
      "mp3-lease": 1999,
      "wav-lease": 4499,
      "unlimited-lease": 11999,
      "exclusive-rights": 54999,
    },
    available: true,
  },
  {
    beatId: "midnight-grind",
    title: "Midnight Grind",
    producerId: "producer-wavetek",
    producerName: "Wavetek",
    producerSlug: "wavetek",
    bpm: 88,
    genre: "Hip-Hop",
    previewAudioUrl: "/previews/midnight-grind.mp3",
    waveformImageUrl: "/images/waveforms/midnight-grind.png",
    coverArtUrl: "/tmi-curated/mag-58.jpg",
    tags: ["dark", "melodic", "trap"],
    priceCents: 2500,
    licensePricing: {
      "mp3-lease": 2500,
      "wav-lease": 5000,
      "unlimited-lease": 13000,
      "exclusive-rights": 65000,
    },
    available: true,
  },
  {
    beatId: "golden-hour",
    title: "Golden Hour",
    producerId: "producer-lyric-stone",
    producerName: "Lyric Stone",
    producerSlug: "lyric-stone",
    bpm: 76,
    genre: "R&B",
    previewAudioUrl: "/previews/golden-hour.mp3",
    waveformImageUrl: "/images/waveforms/golden-hour.png",
    coverArtUrl: "/tmi-curated/mag-66.jpg",
    tags: ["smooth", "soulful", "vibe"],
    priceCents: 2000,
    licensePricing: {
      "mp3-lease": 2000,
      "wav-lease": 4500,
      "unlimited-lease": 11500,
      "exclusive-rights": 55000,
    },
    available: true,
  },
  {
    beatId: "battle-code",
    title: "Battle Code",
    producerId: "producer-verse-knight",
    producerName: "Verse Knight",
    producerSlug: "verse-knight",
    bpm: 95,
    genre: "Hip-Hop",
    previewAudioUrl: "/previews/battle-code.mp3",
    waveformImageUrl: "/images/waveforms/battle-code.png",
    coverArtUrl: "/tmi-curated/mag-74.jpg",
    tags: ["battle", "raw", "boom-bap"],
    priceCents: 2900,
    licensePricing: {
      "mp3-lease": 2900,
      "wav-lease": 5900,
      "unlimited-lease": 14900,
      "exclusive-rights": 69999,
    },
    available: true,
  },
  {
    beatId: "neon-streets",
    title: "Neon Streets",
    producerId: "producer-neon-vibe",
    producerName: "Neon Vibe",
    producerSlug: "neon-vibe",
    bpm: 145,
    genre: "Drill",
    previewAudioUrl: "/previews/neon-streets.mp3",
    waveformImageUrl: "/images/waveforms/neon-streets.png",
    coverArtUrl: "/tmi-curated/mag-82.jpg",
    tags: ["drill", "UK", "dark"],
    priceCents: 3000,
    licensePricing: {
      "mp3-lease": 3000,
      "wav-lease": 6000,
      "unlimited-lease": 15500,
      "exclusive-rights": 79999,
    },
    available: true,
  },
  {
    beatId: "soul-splice",
    title: "Soul Splice",
    producerId: "producer-lyric-stone",
    producerName: "Lyric Stone",
    producerSlug: "lyric-stone",
    bpm: 88,
    genre: "Soul",
    previewAudioUrl: "/previews/soul-splice.mp3",
    waveformImageUrl: "/images/waveforms/soul-splice.png",
    coverArtUrl: "/tmi-curated/mag-42.jpg",
    tags: ["emotional", "soul", "piano"],
    priceCents: 2000,
    licensePricing: {
      "mp3-lease": 2000,
      "wav-lease": 4500,
      "unlimited-lease": 11500,
      "exclusive-rights": 54999,
    },
    available: true,
  },
];

export function getUniqueProducers(): { producerId: string; producerName: string; producerSlug: string; beatCount: number }[] {
  const map = new Map<string, { producerId: string; producerName: string; producerSlug: string; beatCount: number }>();
  for (const entry of CATALOG) {
    const existing = map.get(entry.producerSlug);
    if (existing) { existing.beatCount += 1; }
    else { map.set(entry.producerSlug, { producerId: entry.producerId, producerName: entry.producerName, producerSlug: entry.producerSlug, beatCount: 1 }); }
  }
  return Array.from(map.values());
}

export function listBeatCatalog(filters?: { genre?: string; producerSlug?: string; tags?: string[] }): BeatCatalogEntry[] {
  if (!filters) return [...CATALOG];
  const tags = filters.tags?.map((tag) => tag.toLowerCase()) ?? [];
  return CATALOG.filter((entry) => {
    const genreOk = !filters.genre || entry.genre.toLowerCase() === filters.genre.toLowerCase();
    const producerOk = !filters.producerSlug || entry.producerSlug === filters.producerSlug;
    const tagsOk = tags.length === 0 || tags.every((tag) => entry.tags.some((value) => value.toLowerCase() === tag));
    return genreOk && producerOk && tagsOk;
  });
}

export function getBeatById(beatId: string): BeatCatalogEntry | undefined {
  return CATALOG.find((entry) => entry.beatId === beatId);
}

export function formatBeatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}
