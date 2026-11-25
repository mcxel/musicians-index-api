/**
 * MagazineExtendedReelPlacementAuthority
 *
 * Owner law (2026-11-12): extended magazine footers are reusable inventory —
 * AdSense / TMI paid / performer / YoPho / Advertise CTA / occasional Gossip OR Happy Days.
 * Never mount Community Gossip + Happy Days together on every page.
 *
 * Deterministic per (issueKey, pageNumber, articleSlug) so reload/navigation stays stable.
 * Google AdSense remains a separate technical serve path from TMI-controlled content.
 */

import {
  getActiveSponsorForZone,
  type ActiveSponsorDisplay,
  type AdSlotDescriptor,
} from "@/lib/commerce/SponsorRegistry";
import { zoneHasAdSenseInventory } from "@/lib/ads/adConfig";
import { ADSENSE_SLOT_ENV } from "@/lib/ads/adConfig";

export type ExtendedReelMode =
  | "ADSENSE"
  | "TMI_PAID"
  | "PLATFORM_PROMO"
  | "PERFORMER_SPOTLIGHT"
  | "ADVERTISE_CTA"
  | "COMMUNITY_GOSSIP"
  | "HAPPY_DAYS"
  | "NONE";

export type ExtendedReelPlacement = {
  issueId: string;
  pageId: string;
  positionId: string;
  mode: ExtendedReelMode;
  /** Paid sponsor when mode === TMI_PAID */
  paidSponsor: ActiveSponsorDisplay | null;
  /** Platform promo copy when mode === PLATFORM_PROMO */
  platformPromo: NonNullable<AdSlotDescriptor["platformPromo"]> | null;
  /** AdSense slot id when mode === ADSENSE (empty string = not configured) */
  adsenseSlotId: string;
  performerSlug: string | null;
  stableSeed: number;
};

const PLATFORM_PROMOS: NonNullable<AdSlotDescriptor["platformPromo"]>[] = [
  {
    headline: "GO LIVE ON TMI",
    body: "Reach fans in real time from your Hub.",
    ctaLabel: "START BROADCASTING",
    ctaHref: "/hub/performer?golive=1",
    accentColor: "#00E5FF",
  },
  {
    headline: "CREATE A YOPHO",
    body: "Build cards, playlists, and release art in Page Studio.",
    ctaLabel: "OPEN YOPHO",
    ctaHref: "/yopho",
    accentColor: "#FFD700",
  },
  {
    headline: "ADVERTISE WITH TMI",
    body: "Magazine, Lobby Wall, and live rooms — real inventory.",
    ctaLabel: "SEE PLACEMENTS",
    ctaHref: "/sponsors/advertise",
    accentColor: "#FF2DAA",
  },
];

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Occasional community features: Gossip on one cadence, Happy Days on another.
 * Never both on the same page. Spacing ≈ every 6–8 pages depending on seed.
 */
export function resolveCommunityFeatureMode(input: {
  issueKey: string;
  pageNumber: number;
}): "COMMUNITY_GOSSIP" | "HAPPY_DAYS" | null {
  const page = Math.max(1, Math.floor(input.pageNumber));
  const base = hashSeed(input.issueKey) % 5; // 0..4 offsets the pattern per issue
  const phase = (page + base) % 7;
  if (phase === 0) return "COMMUNITY_GOSSIP";
  if (phase === 3) return "HAPPY_DAYS";
  return null;
}

/**
 * Resolve the extended footer / reel placement for one magazine page slot.
 */
export function resolveExtendedReelPlacement(input: {
  issueKey: string;
  pageNumber?: number;
  articleSlug: string;
  performerSlug?: string | null;
}): ExtendedReelPlacement {
  const issueId = input.issueKey || "current";
  const pageNumber = input.pageNumber ?? 0;
  const pageId = `page-${pageNumber || "x"}`;
  const positionId = `extended-reel:${issueId}:${pageId}:${input.articleSlug}`;
  const seed = hashSeed(`${issueId}|${pageNumber}|${input.articleSlug}`);
  const zone = `magazine-extended-${issueId}-p${pageNumber}`;

  const paid = getActiveSponsorForZone(zone) ?? getActiveSponsorForZone("magazine-magazineInline");
  if (paid) {
    return {
      issueId,
      pageId,
      positionId,
      mode: "TMI_PAID",
      paidSponsor: paid,
      platformPromo: null,
      adsenseSlotId: "",
      performerSlug: input.performerSlug ?? null,
      stableSeed: seed,
    };
  }

  // Occasional independent community departments (not every page, never paired).
  if (pageNumber > 0) {
    const community = resolveCommunityFeatureMode({ issueKey: issueId, pageNumber });
    if (community) {
      return {
        issueId,
        pageId,
        positionId,
        mode: community,
        paidSponsor: null,
        platformPromo: null,
        adsenseSlotId: "",
        performerSlug: input.performerSlug ?? null,
        stableSeed: seed,
      };
    }
  }

  // Commercial / promotional reel — deterministic, Rule 12-aligned, AdSense separate.
  const adsenseReady =
    zoneHasAdSenseInventory("magazine") ||
    Boolean(ADSENSE_SLOT_ENV.magazineInline || ADSENSE_SLOT_ENV.magazineArticleEnd);
  const bucket = seed % 10;

  if (adsenseReady && bucket <= 2) {
    return {
      issueId,
      pageId,
      positionId,
      mode: "ADSENSE",
      paidSponsor: null,
      platformPromo: null,
      adsenseSlotId: ADSENSE_SLOT_ENV.magazineInline || ADSENSE_SLOT_ENV.magazineArticleEnd || "",
      performerSlug: input.performerSlug ?? null,
      stableSeed: seed,
    };
  }

  if (input.performerSlug && (bucket === 3 || bucket === 4)) {
    return {
      issueId,
      pageId,
      positionId,
      mode: "PERFORMER_SPOTLIGHT",
      paidSponsor: null,
      platformPromo: null,
      adsenseSlotId: "",
      performerSlug: input.performerSlug,
      stableSeed: seed,
    };
  }

  if (bucket === 5 || bucket === 6) {
    return {
      issueId,
      pageId,
      positionId,
      mode: "ADVERTISE_CTA",
      paidSponsor: null,
      platformPromo: null,
      adsenseSlotId: "",
      performerSlug: input.performerSlug ?? null,
      stableSeed: seed,
    };
  }

  const promo = PLATFORM_PROMOS[seed % PLATFORM_PROMOS.length] ?? PLATFORM_PROMOS[0]!;
  return {
    issueId,
    pageId,
    positionId,
    mode: "PLATFORM_PROMO",
    paidSponsor: null,
    platformPromo: promo,
    adsenseSlotId: "",
    performerSlug: input.performerSlug ?? null,
    stableSeed: seed,
  };
}

/** Test helper: count community modes across a page range for one issue. */
export function auditCommunityFeatureSpacing(issueKey: string, pageCount: number): {
  gossipPages: number[];
  happyPages: number[];
  pairedPages: number[];
} {
  const gossipPages: number[] = [];
  const happyPages: number[] = [];
  const pairedPages: number[] = [];
  for (let p = 1; p <= pageCount; p++) {
    const m = resolveCommunityFeatureMode({ issueKey, pageNumber: p });
    if (m === "COMMUNITY_GOSSIP") gossipPages.push(p);
    if (m === "HAPPY_DAYS") happyPages.push(p);
  }
  for (const g of gossipPages) {
    if (happyPages.includes(g)) pairedPages.push(g);
  }
  return { gossipPages, happyPages, pairedPages };
}
