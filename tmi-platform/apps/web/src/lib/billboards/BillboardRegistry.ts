import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import { getCountry } from "@/lib/global/GlobalCountryRegistry";

export type BillboardStatus = "draft" | "active" | "public" | "archived" | "replaced";
export type BillboardCampaignType = "artist-feature" | "event-promo" | "battle-promo" | "sponsor-campaign";

export interface BillboardRecord {
  billboardId: string;
  slug: string;
  artistSlug: string;
  title: string;
  country: string;
  genre: string;
  mediaAsset: string;
  campaignType: BillboardCampaignType;
  sponsorId?: string;
  startDate: string;
  endDate: string;
  publicUrl: string;
  seoTitle: string;
  seoDescription: string;
  status: BillboardStatus;
  linkedArticleSlug?: string;
  linkedVenueSlug?: string;
  linkedEventSlug?: string;
}

function buildRecord(index: number, artistSlug: string): BillboardRecord {
  const artist = ARTIST_SEED.find((item) => item.id === artistSlug);
  const country = ["US", "NG", "GB", "JM", "BR", "ZA"][index % 6];
  const countryData = getCountry(country);
  const normalizedGenre = (artist?.genre ?? "Music").toLowerCase().replace(/\s+/g, "-");
  const slug = `${artistSlug}-campaign-${String(index + 1).padStart(2, "0")}`;

  return {
    billboardId: `bb-${String(index + 1).padStart(4, "0")}`,
    slug,
    artistSlug,
    title: `${artist?.name ?? artistSlug} Global Campaign`,
    country,
    genre: artist?.genre ?? "Music",
    mediaAsset: `/billboards/${slug}.jpg`,
    campaignType: index % 3 === 0 ? "event-promo" : "artist-feature",
    sponsorId: index % 2 === 0 ? "soundwave-audio" : undefined,
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    publicUrl: `/billboards/${slug}`,
    seoTitle: `${artist?.name ?? artistSlug} Billboard Campaign | BernoutGlobal`,
    seoDescription: `${artist?.name ?? artistSlug} is featured on The Musician's Index billboard campaign in ${countryData?.name ?? country}.`,
    status: index % 5 === 0 ? "active" : "public",
    linkedArticleSlug: `${artistSlug}-spotlight`,
    linkedVenueSlug: ["neon-palace", "beat-lab", "cypher-stage"][index % 3],
    linkedEventSlug: `${normalizedGenre}-showcase-${index + 1}`,
  };
}

const FEATURED_SLUGS = ARTIST_SEED.slice(0, 12).map((item) => item.id);

const BILLBOARD_REGISTRY: BillboardRecord[] = FEATURED_SLUGS.map((slug, index) =>
  buildRecord(index, slug),
);

export function listBillboards(includePrivate = false): BillboardRecord[] {
  if (includePrivate) return BILLBOARD_REGISTRY;
  return BILLBOARD_REGISTRY.filter((item) => item.status === "public" || item.status === "active");
}

export function getBillboardBySlug(slug: string): BillboardRecord | null {
  return BILLBOARD_REGISTRY.find((item) => item.slug === slug) ?? null;
}

export function listArtistBillboards(artistSlug: string): BillboardRecord[] {
  return listBillboards().filter((item) => item.artistSlug === artistSlug);
}

export function listBillboardsByCountry(countryCode: string): BillboardRecord[] {
  const code = countryCode.toUpperCase();
  return listBillboards().filter((item) => item.country === code);
}

export function listBillboardSlugs(): string[] {
  return listBillboards().map((item) => item.slug);
}
