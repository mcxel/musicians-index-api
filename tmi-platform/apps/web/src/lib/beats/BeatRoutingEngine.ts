import { formatCountdownMs } from "@/lib/live/CountdownResolver";
import { formatBeatPrice, listBeatCatalog, type BeatCatalogEntry } from "@/lib/beats/BeatStoreEngine";

export type BeatRoutes = {
  beatRoute: string;
  previewRoute: string;
  buyRoute: string;
  producerRoute: string;
};

export type BeatCommercePromo = {
  beatId: string;
  title: string;
  producerName: string;
  genre: string;
  bpm: number;
  priceLabel: string;
  countdownLabel: string;
  beatRoute: string;
  previewRoute: string;
  buyRoute: string;
  producerRoute: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildBeatRoutes(beatId: string, producerSlugOrName: string): BeatRoutes {
  const producerSlug = producerSlugOrName.includes(" ") ? slugify(producerSlugOrName) : producerSlugOrName;
  return {
    beatRoute: `/beats/${beatId}`,
    previewRoute: `/beats/${beatId}/preview`,
    buyRoute: `/beats/${beatId}/buy`,
    producerRoute: `/producers/${producerSlug}`,
  };
}

function toPromo(entry: BeatCatalogEntry, now: Date, index: number): BeatCommercePromo {
  const releaseAt = now.getTime() + (index + 1) * 45 * 60 * 1000;
  const countdownLabel = `Drops in ${formatCountdownMs(releaseAt - now.getTime())}`;
  const routes = buildBeatRoutes(entry.beatId, entry.producerSlug);
  return {
    beatId: entry.beatId,
    title: entry.title,
    producerName: entry.producerName,
    genre: entry.genre,
    bpm: entry.bpm,
    priceLabel: `from ${formatBeatPrice(entry.priceCents)}`,
    countdownLabel,
    ...routes,
  };
}

export function buildHome5BeatPromos(now: Date, limit = 2): BeatCommercePromo[] {
  return listBeatCatalog()
    .filter((entry) => entry.available)
    .slice(0, limit)
    .map((entry, index) => toPromo(entry, now, index));
}

export function buildHome3ProducerBeatSpotlight(now: Date): BeatCommercePromo | null {
  const [top] = listBeatCatalog({ tags: ["battle"] });
  if (!top) return null;
  return toPromo(top, now, 0);
}
