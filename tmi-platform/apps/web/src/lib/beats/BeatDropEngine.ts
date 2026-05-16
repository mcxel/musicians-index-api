import type { Beat } from "@/lib/beats/BeatStoreCommerceEngine";
import { resolveBeatReleaseWindow, pickNextRelease } from "@/lib/beats/BeatReleaseResolver";
import { buildBeatDropInventory } from "@/lib/beats/BeatInventoryEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BeatDropPromo = {
  beatId: string;
  title: string;
  producerName: string;
  genre: string;
  countdownLabel: string;
  priceLabel: string;
  purchaseRoute: string;
  status: "live" | "dropping-soon" | "scheduled" | "sold-out";
  available: boolean;
};

// ─── Seed catalog for Home 5 drops (static until real DB is wired) ────────────

const SEED_DROP_BEATS: Beat[] = [
  {
    id: "electric-sky",
    title: "Electric Sky",
    producerId: "neon-vibe",
    producerName: "Neon Vibe",
    bpm: 140,
    key: "F# min",
    genre: "Trap",
    tags: ["hard", "808", "drop"],
    previewUrl: "/previews/electric-sky.mp3",
    durationSec: 168,
    plays: 24000,
    licenses: { non_exclusive: 2999, exclusive: 19999, stems: 7999, unlimited: 49999 },
    uploadedAtMs: Date.UTC(2026, 3, 1),
  },
  {
    id: "lagos-night",
    title: "Lagos Night",
    producerId: "zuri-bloom",
    producerName: "Zuri Bloom",
    bpm: 102,
    key: "A maj",
    genre: "Afrobeats",
    tags: ["smooth", "groove", "melodic"],
    previewUrl: "/previews/lagos-night.mp3",
    durationSec: 192,
    plays: 18000,
    licenses: { non_exclusive: 2499, exclusive: 14999, stems: 6499, unlimited: 39999 },
    uploadedAtMs: Date.UTC(2026, 3, 7),
  },
  {
    id: "cipher-code",
    title: "Cipher Code",
    producerId: "krypt",
    producerName: "KRYPT",
    bpm: 88,
    key: "E min",
    genre: "Boom Bap",
    tags: ["crisp", "jazz", "raw"],
    previewUrl: "/previews/cipher-code.mp3",
    durationSec: 176,
    plays: 14000,
    licenses: { non_exclusive: 1999, exclusive: 12999, stems: 5499, unlimited: 34999 },
    uploadedAtMs: Date.UTC(2026, 3, 14),
  },
];

// ─── Release schedule (relative to now; replaced by DB queries in prod) ────────

function buildReleaseSchedule(now: Date): Array<{ beat: Beat; releasesAt: Date }> {
  const base = now.getTime();
  return [
    { beat: SEED_DROP_BEATS[0]!, releasesAt: new Date(base + 2  * 60 * 60 * 1000)  },   // 2 h out
    { beat: SEED_DROP_BEATS[1]!, releasesAt: new Date(base - 30 * 60 * 1000)       },   // already live (30 min ago)
    { beat: SEED_DROP_BEATS[2]!, releasesAt: new Date(base + 18 * 60 * 60 * 1000)  },   // 18 h out
  ];
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a sorted list of beat drop promos for the Home 5 drop card.
 * Returns live/dropping-soon beats first, then scheduled.
 */
export function buildBeatDropPromos(now: Date, limit = 2): BeatDropPromo[] {
  const schedule = buildReleaseSchedule(now);

  const windows = schedule.map(({ beat, releasesAt }) =>
    resolveBeatReleaseWindow(beat, releasesAt, now),
  );

  const active = windows.filter((w) => w.status !== "expired");
  const sorted = active.sort((a, b) => {
    const order = { live: 0, "dropping-soon": 1, scheduled: 2, expired: 3 } as const;
    return order[a.status] - order[b.status];
  });

  return sorted.slice(0, limit).map((window) => {
    const beat = schedule.find((s) => s.beat.id === window.beatId)!.beat;
    const inventory = buildBeatDropInventory(beat.id, beat.licenses);

    return {
      beatId: beat.id,
      title: window.title,
      producerName: window.producerName,
      genre: window.genre,
      countdownLabel: window.countdownLabel,
      priceLabel: inventory.cheapestLabel,
      purchaseRoute: window.purchaseRoute,
      status: (inventory.hasAvailability
        ? (window.status === "expired" ? "scheduled" : window.status)
        : "sold-out") as BeatDropPromo["status"],
      available: inventory.hasAvailability,
    };
  });
}
