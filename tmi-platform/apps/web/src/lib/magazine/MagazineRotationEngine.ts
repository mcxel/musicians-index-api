/**
 * MagazineRotationEngine
 * Rotations for article, homepage article, ad, sponsor, rank, contest, and event surfaces.
 */

import { listArticleAdPlacements } from "../articles/ArticleAdPlacementEngine";
import { getAdSlotForZone } from "../commerce/SponsorRegistry";
import { editorialSubmissionEngine } from "../editorial-economy/EditorialSubmissionEngine";
import { getActiveLiveRooms } from "../live/LiveRoomEngine";
import { computeRanks, isRankedEligible, type PerformerIdentity } from "../performers/PerformerRegistry";
import { listMagazineRankings } from "../progression/MagazineRankingEngine";
import { getAllVenues } from "../venues/VenueRegistry";
import type { MagazineArticle } from "./MagazineArticleResolver";
import {
  DEFAULT_ISSUE_RHYTHM,
  editorialSubmissionToStory,
  isMagazinePerformerEligible,
  NON_LIVING_COMMUNITY_RANDOM,
  type EditorialStory,
  type MagazineIssueSlot,
  type MagazineNewsSlotSource,
  type MagazinePageClass,
  type MagazinePerformerSlotSource,
  type MagazineRandomSlotSource,
  type MonetizationLayer,
  type RandomPageSubtype,
} from "./MagazineIssueContract";
import {
  getNewsPoolArticles,
  getPerformerPoolArticles,
  type MagazineArticle as IssueMagazineArticle,
} from "./magazineIssueData";

export type RotationCandidate = {
  id: string;
  label: string;
  weight?: number;
};

export type MagazineRotationSnapshot = {
  articleRotation: RotationCandidate[];
  homepageArticleRotation: RotationCandidate[];
  adRotation: RotationCandidate[];
  sponsorRotation: RotationCandidate[];
  rankRotation: RotationCandidate[];
  contestFeatureRotation: RotationCandidate[];
  featuredEventRotation: RotationCandidate[];
  generatedAtMs: number;
};

function sortByWeight(items: RotationCandidate[]): RotationCandidate[] {
  return [...items].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
}

function rotate(items: RotationCandidate[], atMs = Date.now(), bucketMs = 15 * 60 * 1000): RotationCandidate[] {
  if (items.length <= 1) return [...items];
  const shift = Math.floor(atMs / bucketMs) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

export function rotateMagazineArticles(
  articles: MagazineArticle[],
  atMs = Date.now(),
  bucketMs = 20 * 60 * 1000,
): MagazineArticle[] {
  if (articles.length <= 1) return [...articles];
  const shift = Math.floor(atMs / bucketMs) % articles.length;
  return [...articles.slice(shift), ...articles.slice(0, shift)];
}

export function rotateArticles(articles: RotationCandidate[], limit = 8): RotationCandidate[] {
  return rotate(sortByWeight(articles)).slice(0, limit);
}

export function rotateHomepageArticles(articles: RotationCandidate[], limit = 6): RotationCandidate[] {
  return rotate(sortByWeight(articles), Date.now(), 10 * 60 * 1000).slice(0, limit);
}

export function rotateSponsorsForIssue(sponsors: RotationCandidate[], limit = 6): RotationCandidate[] {
  return rotate(sortByWeight(sponsors), Date.now(), 20 * 60 * 1000).slice(0, limit);
}

export function rotateAdsForIssue(articleId?: string, limit = 8): RotationCandidate[] {
  const placements = listArticleAdPlacements({
    articleId,
    activeOnly: true,
  });

  const candidates: RotationCandidate[] = placements.map((placement) => ({
    id: placement.placementId,
    label: `${placement.slot}:${placement.creativeId}`,
    weight: placement.weight.totalWeight,
  }));

  return rotate(sortByWeight(candidates), Date.now(), 5 * 60 * 1000).slice(0, limit);
}

export function rotateContestFeatures(contests: RotationCandidate[], limit = 5): RotationCandidate[] {
  return rotate(sortByWeight(contests), Date.now(), 30 * 60 * 1000).slice(0, limit);
}

export function rotateTopRanks(limit = 10): RotationCandidate[] {
  const ranks = listMagazineRankings().map((entry) => ({
    id: entry.artistId,
    label: `#${entry.currentRank} Artist ${entry.artistId}`,
    weight: Math.max(0, 1000 - entry.currentRank * 10 + entry.score),
  }));

  return rotate(sortByWeight(ranks), Date.now(), 60 * 60 * 1000).slice(0, limit);
}

export function rotateFeaturedEvents(events: RotationCandidate[], limit = 6): RotationCandidate[] {
  return rotate(sortByWeight(events), Date.now(), 30 * 60 * 1000).slice(0, limit);
}

export function buildMagazineRotationSnapshot(input: {
  articles: RotationCandidate[];
  homepageArticles: RotationCandidate[];
  sponsors: RotationCandidate[];
  contests: RotationCandidate[];
  events: RotationCandidate[];
  articleIdForAds?: string;
}): MagazineRotationSnapshot {
  return {
    articleRotation: rotateArticles(input.articles),
    homepageArticleRotation: rotateHomepageArticles(input.homepageArticles),
    adRotation: rotateAdsForIssue(input.articleIdForAds),
    sponsorRotation: rotateSponsorsForIssue(input.sponsors),
    rankRotation: rotateTopRanks(),
    contestFeatureRotation: rotateContestFeatures(input.contests),
    featuredEventRotation: rotateFeaturedEvents(input.events),
    generatedAtMs: Date.now(),
  };
}

// ── P / N / R issue sequence (canonical lock) ────────────────────────────────

export type MagazineRng = () => number;

export function hashStringToSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): MagazineRng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleCopy<T>(items: T[], rng: MagazineRng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/**
 * Rank first, randomize second:
 * GLOBAL #1 → shuffle remaining genre #1s → shuffle genre #2s → …
 * Never emit a genre #2 while a leftover genre #1 still exists.
 */
export function orderPerformersRankFirstShuffleSecond(
  performers: MagazinePerformerSlotSource[],
  rng: MagazineRng,
): MagazinePerformerSlotSource[] {
  const eligible = performers.filter(isMagazinePerformerEligible);
  if (eligible.length === 0) return [];

  const byXp = [...eligible].sort((a, b) => b.xp - a.xp || a.slug.localeCompare(b.slug));
  const global1 = byXp[0]!;

  const byGenre = new Map<string, MagazinePerformerSlotSource[]>();
  for (const p of byXp) {
    const list = byGenre.get(p.category) ?? [];
    list.push(p);
    byGenre.set(p.category, list);
  }

  const maxDepth = Math.max(0, ...[...byGenre.values()].map((list) => list.length));
  const ordered: MagazinePerformerSlotSource[] = [global1];
  for (let depth = 0; depth < maxDepth; depth += 1) {
    const cohort: MagazinePerformerSlotSource[] = [];
    for (const list of byGenre.values()) {
      const next = list[depth];
      if (next && next.slug !== global1.slug) cohort.push(next);
    }
    ordered.push(...shuffleCopy(cohort, rng));
  }
  return ordered;
}

function pickNextRandom(
  remaining: MagazineRandomSlotSource[],
  lastSubtype: RandomPageSubtype | undefined,
): { picked: MagazineRandomSlotSource; rest: MagazineRandomSlotSource[] } | null {
  if (remaining.length === 0) return null;

  const paid = remaining.filter((item) => item.paidObligation);
  const organic = remaining.filter((item) => !item.paidObligation);
  const prefer = paid.length > 0 ? paid : organic;

  const alternatives =
    lastSubtype && prefer.some((item) => item.subtype !== lastSubtype)
      ? prefer.filter((item) => item.subtype !== lastSubtype)
      : prefer;

  const picked = alternatives[0] ?? prefer[0] ?? remaining[0]!;
  return {
    picked,
    rest: remaining.filter((item) => item.id !== picked.id),
  };
}

export function buildMagazineIssueSequence(input: {
  performers: MagazinePerformerSlotSource[];
  news: MagazineNewsSlotSource[];
  randomPool: MagazineRandomSlotSource[];
  rng: MagazineRng;
  maxPerformerSlots?: number;
  rhythmOverride?: readonly MagazinePageClass[];
}): MagazineIssueSlot[] {
  const rhythm = input.rhythmOverride ?? DEFAULT_ISSUE_RHYTHM;
  const orderedPerformers = orderPerformersRankFirstShuffleSecond(input.performers, input.rng);
  const maxP = Math.max(1, input.maxPerformerSlots ?? 8);
  const performerQueue = orderedPerformers.slice(0, maxP);
  const newsPool = input.news.filter((n) => n.slug && n.title && n.href);
  const randomRemaining = [...input.randomPool].sort((a, b) => Number(b.paidObligation) - Number(a.paidObligation));

  if (performerQueue.length === 0 || newsPool.length === 0) return [];

  const slots: MagazineIssueSlot[] = [];
  let newsIndex = 0;
  let lastRandomSubtype: RandomPageSubtype | undefined;
  let randomBag = randomRemaining;

  const cycleCount = performerQueue.length;
  for (let cycle = 0; cycle < cycleCount; cycle += 1) {
    for (const pageClass of rhythm) {
      if (pageClass === "PERFORMER") {
        const performer = performerQueue[cycle];
        if (!performer) continue;
        const href = performer.articleSlug
          ? `/magazine/article/${performer.articleSlug}`
          : performer.profileRoute;
        slots.push({
          id: `p-${performer.slug}`,
          pageClass: "PERFORMER",
          title: performer.articleTitle ?? performer.name,
          href,
          deck: performer.articleSubtitle ?? `${performer.category} · #${performer.rank}`,
          heroColor: performer.heroColor,
          imageUrl: performer.profileImageUrl,
          xpEligible: Boolean(performer.articleSlug),
          monetizationLayer: "NONE",
          performerSlug: performer.slug,
          articleSlug: performer.articleSlug,
          liveHref: performer.liveRoomRoute,
          merchHref: performer.merchHref,
          isLive: performer.isLive,
        });
      } else if (pageClass === "NEWS") {
        const news = newsPool[newsIndex % newsPool.length]!;
        newsIndex += 1;
        slots.push({
          id: `n-${news.slug}-${cycle}`,
          pageClass: "NEWS",
          title: news.title,
          href: news.href,
          deck: news.preview ?? news.subtitle,
          heroColor: news.heroColor,
          xpEligible: true,
          monetizationLayer: "NONE",
          articleSlug: news.slug,
        });
      } else {
        let next = pickNextRandom(randomBag, lastRandomSubtype);
        if (!next) {
          randomBag = [...randomRemaining];
          next = pickNextRandom(randomBag, lastRandomSubtype);
        }
        if (!next) continue;
        randomBag = next.rest;
        lastRandomSubtype = next.picked.subtype;
        slots.push({
          id: `r-${next.picked.id}-${cycle}`,
          pageClass: "RANDOM",
          title: next.picked.title,
          href: next.picked.href,
          deck: next.picked.deck,
          imageUrl: next.picked.imageUrl,
          xpEligible: false,
          randomSubtype: next.picked.subtype,
          monetizationLayer: next.picked.monetizationLayer,
        });
      }
    }
  }

  return slots;
}

function articlePreview(article: IssueMagazineArticle): string | undefined {
  return article.blocks.find((block) => block.type === "paragraph")?.text ?? article.subtitle;
}

export function performersToSlotSources(
  ranked: PerformerIdentity[],
  articles: IssueMagazineArticle[],
): MagazinePerformerSlotSource[] {
  return ranked.filter(isRankedEligible).map((p) => {
    const article = articles.find((a) => a.performerSlug === p.slug);
    const merch = p.merch?.[0];
    return {
      slug: p.slug,
      name: p.name,
      category: p.category,
      xp: p.xp,
      rank: p.rank,
      profileRoute: p.profileRoute,
      liveRoomRoute: p.liveRoomRoute,
      isLive: p.isLive,
      profileImageUrl: p.profileImageUrl,
      articleSlug: article?.slug,
      articleTitle: article?.title,
      articleSubtitle: article?.subtitle,
      heroColor: article?.heroColor,
      merchHref: merch?.purchaseUrl,
    };
  });
}

export function newsArticlesToSlotSources(articles: IssueMagazineArticle[]): MagazineNewsSlotSource[] {
  return articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    href: `/magazine/article/${article.slug}`,
    heroColor: article.heroColor,
    preview: articlePreview(article),
    author: article.author,
  }));
}

function adSlotToRandom(zone: string, index: number): MagazineRandomSlotSource {
  const slot = getAdSlotForZone(zone);
  if (slot.type === "paid" && slot.sponsor) {
    return {
      id: `direct-sponsor-${slot.sponsor.sponsorId}-${index}`,
      subtype: "DIRECT_SPONSOR",
      paidObligation: true,
      title: slot.sponsor.name,
      href: slot.sponsor.ctaHref,
      deck: slot.sponsor.tagline,
      monetizationLayer: "TMI_DIRECT_SPONSOR",
      imageUrl: slot.sponsor.logoUrl,
    };
  }
  if (slot.type === "adnetwork") {
    return {
      id: `adsense-full-${index}`,
      subtype: "FULL_PAGE_AD",
      paidObligation: true,
      title: "Advertisement",
      href: "/magazine/issue/current",
      deck: "Google ad unit — not a TMI direct sponsor.",
      monetizationLayer: "ADSENSE",
    };
  }
  if (slot.type === "platform" && slot.platformPromo) {
    return {
      id: `platform-${index}`,
      subtype: "PLATFORM_UPDATE",
      paidObligation: false,
      title: slot.platformPromo.headline,
      href: slot.platformPromo.ctaHref,
      deck: slot.platformPromo.body,
      monetizationLayer: "PLATFORM_PROMO",
    };
  }
  return {
    id: `advertise-cta-${index}`,
    subtype: "PREMIUM_PLACEMENT",
    paidObligation: false,
    title: "Advertise in TMI Magazine",
    href: "/sponsors/advertise",
    deck: "Paid placement inventory — not an editorial page.",
    monetizationLayer: "ADVERTISE_CTA",
  };
}

export function assembleDefaultRandomPool(): MagazineRandomSlotSource[] {
  const pool: MagazineRandomSlotSource[] = [];

  pool.push(adSlotToRandom("magazine-issue-random-1", 1));
  pool.push(adSlotToRandom("magazine-issue-random-2", 2));

  const ranked = computeRanks();
  if (ranked.length > 0) {
    pool.push({
      id: "rankings-live",
      subtype: "RANKINGS",
      paidObligation: false,
      title: "Live Rankings",
      href: "/rankings",
      deck: `#1 ${ranked[0]!.name} · XP from computeRanks`,
      monetizationLayer: "NONE",
    });
    pool.push({
      id: "chart-live",
      subtype: "CHART",
      paidObligation: false,
      title: "Index Chart",
      href: "/rankings",
      deck: `${ranked.length} ranked performers`,
      monetizationLayer: "NONE",
    });
  }

  const venues = getAllVenues();
  const venue = venues[0];
  if (venue) {
    pool.push({
      id: `venue-${venue.slug}`,
      subtype: "VENUE",
      paidObligation: false,
      title: venue.name,
      href: venue.profileRoute,
      deck: `${venue.city} · ${venue.category}`,
      imageUrl: venue.profileImage,
      monetizationLayer: "NONE",
    });
  }

  const liveRooms = getActiveLiveRooms();
  if (liveRooms.length > 0) {
    const room = liveRooms[0]!;
    pool.push({
      id: `lobby-${room.roomId}`,
      subtype: "LOBBY",
      paidObligation: false,
      title: room.title,
      href: `/live/rooms/${room.roomId}`,
      deck: "Live now",
      monetizationLayer: "NONE",
    });
    const battle = liveRooms.find((r) => r.roomType === "battle");
    if (battle) {
      pool.push({
        id: `battle-${battle.roomId}`,
        subtype: "BATTLE_RECAP",
        paidObligation: false,
        title: battle.title,
        href: `/live/rooms/${battle.roomId}`,
        monetizationLayer: "NONE",
      });
    }
    const cypher = liveRooms.find((r) => r.roomType === "cypher");
    if (cypher) {
      pool.push({
        id: `cypher-${cypher.roomId}`,
        subtype: "CYPHER_RECAP",
        paidObligation: false,
        title: cypher.title,
        href: `/live/rooms/${cypher.roomId}`,
        monetizationLayer: "NONE",
      });
    }
    const eventRoom = liveRooms.find((r) => r.roomType === "event");
    if (eventRoom) {
      pool.push({
        id: `event-${eventRoom.roomId}`,
        subtype: "EVENT",
        paidObligation: false,
        title: eventRoom.title,
        href: `/live/rooms/${eventRoom.roomId}`,
        monetizationLayer: "NONE",
      });
    }
  }

  pool.push({
    id: "marketplace",
    subtype: "MARKETPLACE",
    paidObligation: false,
    title: "Marketplace",
    href: "/marketplace",
    deck: "Beats, merch, and drops.",
    monetizationLayer: "NONE",
  });
  pool.push({
    id: "shop",
    subtype: "SHOP",
    paidObligation: false,
    title: "TMI Shop",
    href: "/marketplace",
    monetizationLayer: "NONE",
  });
  pool.push({
    id: "stream-win-discovery",
    subtype: "STREAM_AND_WIN_DISCOVERY",
    paidObligation: false,
    title: "Stream & Win Radio",
    href: "/magazine/article/stream-win-radio-explained",
    deck: "Read the format explainer — rotation rooms are not claimed live here.",
    monetizationLayer: "NONE",
  });

  return pool.filter((item) => !NON_LIVING_COMMUNITY_RANDOM.includes(item.subtype));
}

export function listQueuedWriterStories(): EditorialStory[] {
  return editorialSubmissionEngine
    .list()
    .filter((submission) => submission.status === "approved")
    .map((submission) =>
      editorialSubmissionToStory({
        submissionId: submission.submissionId,
        title: submission.title,
        body: submission.body,
        category: submission.category,
        status: submission.status,
        contributorId: submission.contributorId,
        artistSlug: submission.artistSlug,
      }),
    );
}

export function assembleDefaultIssuePools(): {
  performers: MagazinePerformerSlotSource[];
  news: MagazineNewsSlotSource[];
  randomPool: MagazineRandomSlotSource[];
} {
  const ranked = computeRanks();
  const performerArticles = getPerformerPoolArticles();
  const news = newsArticlesToSlotSources(getNewsPoolArticles());
  return {
    performers: performersToSlotSources(ranked, performerArticles),
    news,
    randomPool: assembleDefaultRandomPool(),
  };
}

export function buildCanonicalMagazineIssueSlots(issueKey: string): MagazineIssueSlot[] {
  const pools = assembleDefaultIssuePools();
  const seed = hashStringToSeed(`${issueKey}|${new Date().toISOString().slice(0, 10)}`);
  return buildMagazineIssueSequence({
    ...pools,
    rng: mulberry32(seed),
    maxPerformerSlots: 8,
  });
}

export function issueSlotMonetizationLabel(layer: MonetizationLayer): string {
  if (layer === "TMI_DIRECT_SPONSOR") return "TMI DIRECT SPONSOR";
  if (layer === "ADSENSE") return "ADVERTISEMENT";
  if (layer === "PLATFORM_PROMO") return "PLATFORM";
  if (layer === "ADVERTISE_CTA") return "ADVERTISE";
  return "RANDOM";
}
