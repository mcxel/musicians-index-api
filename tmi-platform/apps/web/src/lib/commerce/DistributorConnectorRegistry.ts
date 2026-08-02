/**
 * DistributorConnectorRegistry — Creator Economy Phase 1 add-on.
 *
 * Hybrid model: DistroKid / TuneCore / CD Baby / UnitedMasters remain the
 * artist's DSP distribution path. TMI is monetization + engagement + Own/Support
 * commerce — not a DistroKid competitor.
 *
 * Phase 1: link profile/storefront URLs + optional ISRC paste.
 * Statuses are honest (Rule 20). No DistroKid API sync, no fake multi-platform
 * dollar analytics, no full Creator Connect OAuth for every DSP.
 *
 * Shopify stays under CommerceConnectorRegistry — not listed here.
 */

export type DistributorProviderId =
  | "distrokid"
  | "tunecore"
  | "cdbaby"
  | "unitedmasters"
  | "landr"
  | "symphonic"
  | "believe"
  | "routenote"
  | "too_lost"
  | "soundcloud"
  | "audiomack"
  | "bandcamp"
  | "spotify_artist"
  | "apple_music_artists"
  | "youtube_oac"
  | "tiktok_artist";

/** Alias used by PerformerRegistry / Living Catalog consumers. */
export type DistributorConnectorId = DistributorProviderId;

/** Per-link / provider availability — Rule 20 honest. */
export type DistributorLinkStatus = "CONNECTED" | "LINKED_URL" | "COMING_SOON";

export interface DistributorProvider {
  id: DistributorConnectorId;
  label: string;
  /** Platform-level capability for this provider in Phase 1. */
  status: DistributorLinkStatus;
  category: "distributor" | "streaming_profile" | "creator_profile";
  purpose: string;
  capabilityNote: string;
  /** Placeholder hint for the URL field. */
  urlPlaceholder: string;
}

export const DISTRIBUTOR_PROVIDERS: DistributorProvider[] = [
  {
    id: "distrokid",
    label: "DistroKid",
    status: "LINKED_URL",
    category: "distributor",
    purpose: "Global DSP distribution — keep uploading here; TMI sells Own/Support.",
    capabilityNote: "Link your DistroKid artist/profile URL. No API sync in Phase 1.",
    urlPlaceholder: "https://distrokid.com/…",
  },
  {
    id: "tunecore",
    label: "TuneCore",
    status: "LINKED_URL",
    category: "distributor",
    purpose: "DSP distribution via TuneCore.",
    capabilityNote: "Link your TuneCore artist/storefront URL. No API sync in Phase 1.",
    urlPlaceholder: "https://www.tunecore.com/…",
  },
  {
    id: "cdbaby",
    label: "CD Baby",
    status: "LINKED_URL",
    category: "distributor",
    purpose: "DSP distribution via CD Baby.",
    capabilityNote: "Link your CD Baby artist URL. No API sync in Phase 1.",
    urlPlaceholder: "https://store.cdbaby.com/…",
  },
  {
    id: "unitedmasters",
    label: "UnitedMasters",
    status: "LINKED_URL",
    category: "distributor",
    purpose: "DSP distribution via UnitedMasters.",
    capabilityNote: "Link your UnitedMasters artist URL. No API sync in Phase 1.",
    urlPlaceholder: "https://unitedmasters.com/…",
  },
  {
    id: "landr",
    label: "LANDR",
    status: "COMING_SOON",
    category: "distributor",
    purpose: "DSP distribution via LANDR.",
    capabilityNote: "Coming soon — no honest LANDR link flow in Phase 1.",
    urlPlaceholder: "https://www.landr.com/…",
  },
  {
    id: "symphonic",
    label: "Symphonic",
    status: "COMING_SOON",
    category: "distributor",
    purpose: "DSP distribution via Symphonic Distribution.",
    capabilityNote: "Coming soon — no honest Symphonic link flow in Phase 1.",
    urlPlaceholder: "https://symphonicdistribution.com/…",
  },
  {
    id: "believe",
    label: "Believe",
    status: "COMING_SOON",
    category: "distributor",
    purpose: "DSP distribution via Believe.",
    capabilityNote: "Coming soon — no honest Believe link flow in Phase 1.",
    urlPlaceholder: "https://believe.com/…",
  },
  {
    id: "routenote",
    label: "RouteNote",
    status: "COMING_SOON",
    category: "distributor",
    purpose: "DSP distribution via RouteNote.",
    capabilityNote: "Coming soon — no honest RouteNote link flow in Phase 1.",
    urlPlaceholder: "https://routenote.com/…",
  },
  {
    id: "too_lost",
    label: "Too Lost",
    status: "COMING_SOON",
    category: "distributor",
    purpose: "DSP distribution via Too Lost.",
    capabilityNote: "Coming soon — no honest Too Lost link flow in Phase 1.",
    urlPlaceholder: "https://toolost.com/…",
  },
  {
    id: "soundcloud",
    label: "SoundCloud",
    status: "LINKED_URL",
    category: "streaming_profile",
    purpose: "Streaming / discovery profile link.",
    capabilityNote: "Paste your public SoundCloud profile URL.",
    urlPlaceholder: "https://soundcloud.com/…",
  },
  {
    id: "audiomack",
    label: "Audiomack",
    status: "LINKED_URL",
    category: "streaming_profile",
    purpose: "Streaming / discovery profile link.",
    capabilityNote: "Paste your public Audiomack profile URL.",
    urlPlaceholder: "https://audiomack.com/…",
  },
  {
    id: "bandcamp",
    label: "Bandcamp",
    status: "LINKED_URL",
    category: "streaming_profile",
    purpose: "Bandcamp page — listen + optional buy on Bandcamp; TMI Own stays separate.",
    capabilityNote: "Paste your Bandcamp artist/page URL.",
    urlPlaceholder: "https://….bandcamp.com",
  },
  {
    id: "spotify_artist",
    label: "Spotify for Artists",
    status: "LINKED_URL",
    category: "creator_profile",
    purpose: "Public Spotify artist page (not OAuth).",
    capabilityNote: "Paste open.spotify.com/artist/… URL. Full Spotify OAuth deferred.",
    urlPlaceholder: "https://open.spotify.com/artist/…",
  },
  {
    id: "apple_music_artists",
    label: "Apple Music for Artists",
    status: "LINKED_URL",
    category: "creator_profile",
    purpose: "Public Apple Music artist page (not OAuth).",
    capabilityNote: "Paste music.apple.com/artist/… URL. Full Apple OAuth deferred.",
    urlPlaceholder: "https://music.apple.com/…",
  },
  {
    id: "youtube_oac",
    label: "YouTube OAC",
    status: "LINKED_URL",
    category: "creator_profile",
    purpose: "Official Artist Channel link.",
    capabilityNote: "Paste your YouTube channel URL. OAC API sync deferred.",
    urlPlaceholder: "https://youtube.com/@…",
  },
  {
    id: "tiktok_artist",
    label: "TikTok Artist",
    status: "COMING_SOON",
    category: "creator_profile",
    purpose: "TikTok artist / creator profile connector.",
    capabilityNote: "Not connected yet — no honest TikTok artist link flow in Phase 1.",
    urlPlaceholder: "https://www.tiktok.com/@…",
  },
];

export function getDistributorProvider(
  id: DistributorProviderId,
): DistributorProvider | undefined {
  return DISTRIBUTOR_PROVIDERS.find((p) => p.id === id);
}

export function listDistributorProviders(): DistributorProvider[] {
  return [...DISTRIBUTOR_PROVIDERS];
}

export function listLinkableDistributorProviders(): DistributorProvider[] {
  return DISTRIBUTOR_PROVIDERS.filter((p) => p.status !== "COMING_SOON");
}

/** Per-performer linked distributor / streaming identity. */
export interface PerformerDistributorLink {
  performerId: string;
  providerId: DistributorProviderId;
  /** Public profile / artist / storefront URL */
  profileUrl: string;
  /** Optional ISRC paste for catalog matching (Phase 1 manual). */
  isrc?: string;
  linkedAt: string;
  /** Always LINKED_URL in Phase 1 unless a real OAuth path exists (none yet). */
  status: "LINKED_URL" | "CONNECTED";
}

const STORAGE_PREFIX = "tmi_distributor_links_";

function storageKey(performerId: string): string {
  return `${STORAGE_PREFIX}${performerId}`;
}

/** Empty seed — never invent distributor connections (Rule 20). */
const SEED_LINKS: PerformerDistributorLink[] = [];

function readLocal(performerId: string): PerformerDistributorLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(performerId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PerformerDistributorLink[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(performerId: string, links: PerformerDistributorLink[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(performerId), JSON.stringify(links));
  } catch {
    /* quota — ignore */
  }
}

export function listPerformerDistributorLinks(
  performerId: string,
): PerformerDistributorLink[] {
  if (!performerId) return [];
  const seeded = SEED_LINKS.filter((l) => l.performerId === performerId);
  const local = readLocal(performerId);
  const byProvider = new Map<DistributorProviderId, PerformerDistributorLink>();
  for (const l of [...seeded, ...local]) byProvider.set(l.providerId, l);
  return Array.from(byProvider.values());
}

export function getPerformerDistributorLink(
  performerId: string,
  providerId: DistributorProviderId,
): PerformerDistributorLink | null {
  return (
    listPerformerDistributorLinks(performerId).find((l) => l.providerId === providerId) ??
    null
  );
}

export function savePerformerDistributorLink(
  link: Omit<PerformerDistributorLink, "linkedAt" | "status"> & {
    linkedAt?: string;
    status?: PerformerDistributorLink["status"];
  },
): PerformerDistributorLink {
  const provider = getDistributorProvider(link.providerId);
  if (!provider || provider.status === "COMING_SOON") {
    throw new Error("Provider is not available for linking yet.");
  }
  const record: PerformerDistributorLink = {
    performerId: link.performerId,
    providerId: link.providerId,
    profileUrl: link.profileUrl.trim(),
    isrc: link.isrc?.trim().toUpperCase() || undefined,
    linkedAt: link.linkedAt ?? new Date().toISOString(),
    // Phase 1: URL link only — never claim CONNECTED OAuth without real tokens.
    status: "LINKED_URL",
  };
  const existing = readLocal(record.performerId).filter(
    (l) => l.providerId !== record.providerId,
  );
  writeLocal(record.performerId, [...existing, record]);
  return record;
}

export function clearPerformerDistributorLink(
  performerId: string,
  providerId: DistributorProviderId,
): void {
  const next = readLocal(performerId).filter((l) => l.providerId !== providerId);
  writeLocal(performerId, next);
}

export function resolveDistributorProfileUrl(
  link: PerformerDistributorLink | null,
): string | null {
  if (!link) return null;
  const url = (link.profileUrl || "").trim();
  return url || null;
}

/** UI copy framing only — no fake revenue charts. */
export const STREAM_VS_OWN_COPY =
  "One ~$9.99 album sale can equal thousands of $0.003 streams. Keep DistroKid (or your distributor) for global DSPs; sell Own on TMI.";

export const HYBRID_DISTRIBUTOR_NOTE =
  "Keep DistroKid for global DSPs; sell Own on TMI.";

/** Prefer public streaming/creator profile URLs for Listen CTAs. */
const LISTEN_PROVIDER_PRIORITY: DistributorProviderId[] = [
  "spotify_artist",
  "apple_music_artists",
  "soundcloud",
  "audiomack",
  "bandcamp",
  "youtube_oac",
  "distrokid",
  "tunecore",
  "cdbaby",
  "unitedmasters",
];

/**
 * First linked streaming/distributor profile URL for a performer.
 * Honest null when nothing is linked (Rule 20).
 */
export function resolvePrimaryListenProfileUrl(performerId: string): string | null {
  if (!performerId) return null;
  const links = listPerformerDistributorLinks(performerId);
  if (links.length === 0) return null;
  for (const id of LISTEN_PROVIDER_PRIORITY) {
    const hit = links.find((l) => l.providerId === id);
    const url = resolveDistributorProfileUrl(hit ?? null);
    if (url) return url;
  }
  return resolveDistributorProfileUrl(links[0] ?? null);
}