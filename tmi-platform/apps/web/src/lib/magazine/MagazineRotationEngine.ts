/**
 * MagazineRotationEngine
 * Rotations for article, homepage article, ad, sponsor, rank, contest, and event surfaces.
 */

import { listArticleAdPlacements } from "../articles/ArticleAdPlacementEngine";
import { getAdSlotForZone } from "../commerce/SponsorRegistry";
import { editorialSubmissionEngine } from "../editorial-economy/EditorialSubmissionEngine";
import { getActiveLiveRooms } from "../live/LiveRoomEngine";
import { computeRanks, isRankedEligible, isVerifiedRankedPerformer, type PerformerIdentity } from "../performers/PerformerRegistry";
import { queryRankedUsers } from "../rankings/CanonicalRankedUsers.server";
import { getAllVenues } from "../venues/VenueRegistry";
import {
  computeQuarterlyEditorialPlacements,
  getCurrentQuarterlyIssueSnapshot,
  listAllQuarterlyIssueSnapshots,
  type QuarterlyEditorialPlacementEntry,
  type QuarterlyIssueTransitionContext,
  type SystemDRankedPerformerInput,
} from "./QuarterlyEditorialPlacementAuthority";
import type { MagazineArticle } from "./MagazineArticleResolver";
import {
  DEFAULT_ISSUE_RHYTHM,
  editorialSubmissionToStory,
  isMagazinePerformerEligible,
  NON_LIVING_COMMUNITY_RANDOM,
  GOSSIP_HAPPY_ADJACENCY_PAIR,
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
import { magazineReaderArticleUrl } from "./MagazineReaderUrls";
import { listFanArticlesForMagazine } from "./FanArticleMagazineAuthority";
import { listWeeklyTopYoPhoCards } from "./WeeklyTopYoPhoAuthority";
import { resolveAuthorizedMagazineImageUrl } from "./MagazineImageProvenance";

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

/**
 * Real-ranking-authority convergence (owner-locked, 2026-10-29): orders the
 * Magazine's eligible registry performers by System D's real signal
 * (queryRankedUsers — qualified plays + unique listeners + followers), not
 * raw lifetime XP. Matches by slug so the full registry record (merch,
 * liveRoomRoute, motion assets) is preserved; only ORDER/rank changes.
 * A performer with no real activity yet (no matching row) is never excluded
 * and never given a fabricated score — they keep a place after every
 * really-ranked performer, ordered among themselves by raw XP (computeRanks()'s
 * own order), exactly as today, until they accrue real activity. This is the
 * single real-ranking source for Magazine Reader composition; computeRanks()'s
 * raw-XP order must not drive who appears or in what order on its own again.
 */
export type RankedPerformerDetail = {
  performer: PerformerIdentity;
  /** Real System D score (queryRankedUsers), or null when no real row exists
   * yet — a null here must never be treated as score 0 / fabricated. */
  realScore: number | null;
};

/**
 * Detailed sibling of getRealRankedPerformersForMagazine() that also exposes
 * WHICH performers have a genuine System D row vs. the raw-XP fallback —
 * needed by callers (e.g. the quarterly apex authority) that must select
 * from the real-ranked population only, never an unranked fallback (owner
 * rule: "no System D row != fabricated System D score / must never defeat a
 * legitimately ranked performer for the competitive apex").
 */
export async function getRealRankedPerformersForMagazineDetailed(): Promise<RankedPerformerDetail[]> {
  const eligible = computeRanks();
  const realRows = await queryRankedUsers({ limit: 500 });
  const realBySlug = new Map(realRows.filter((r) => r.slug).map((r) => [r.slug as string, r]));

  const withReal: RankedPerformerDetail[] = [];
  const withoutReal: RankedPerformerDetail[] = [];
  for (const performer of eligible) {
    const row = realBySlug.get(performer.slug);
    if (row) withReal.push({ performer, realScore: row.score });
    else withoutReal.push({ performer, realScore: null });
  }
  withReal.sort((a, b) => (b.realScore as number) - (a.realScore as number));

  return [...withReal, ...withoutReal].map((entry, index) => ({
    ...entry,
    performer: { ...entry.performer, rank: index + 1 },
  }));
}

export async function getRealRankedPerformersForMagazine(): Promise<PerformerIdentity[]> {
  const detailed = await getRealRankedPerformersForMagazineDetailed();
  return detailed.map((entry) => entry.performer);
}

/**
 * The ONE canonical "current Magazine apex" resolver (owner-locked, 2026-10-30):
 * the single source both the Home 1 Crown and the Magazine Reader's #1
 * PERFORMER slot must consume, so they can never independently calculate a
 * different Magazine #1. Never a second apex-selection authority — this is a
 * thin server adapter (rule 3653) that gathers the real System D population
 * and hands it to QuarterlyEditorialPlacementAuthority's pure, parameterized
 * computeQuarterlyEditorialPlacements(); it never re-implements apex logic.
 *
 * Zero-score-fallback law (owner-locked, 2026-10-30, supersedes the earlier
 * raw-XP tail reported in getRealRankedPerformersForMagazine()): a performer
 * with no real queryRankedUsers() row at all (no backing account) is
 * excluded from Magazine apex/placement entirely here — SystemDRankedPerformerInput
 * requires a real rawScore, so there is no raw-XP fallback path left to
 * remove. A performer WITH a real row but score 0 is included and ordered by
 * queryRankedUsers()'s own canonical chronology tie-break (PerformerScoreEngine's
 * rankPerformerSignals()), never by raw XP.
 *
 * If a quarterly issue has already been explicitly published for the current
 * calendar window (publishQuarterlyIssueSnapshot()), that frozen snapshot's
 * placements are returned as-is — never recomputed from live data, so a
 * published issue stays historically stable. Before any explicit publish,
 * this returns a live preview computed from the same pure function with the
 * same transition context (the most recent ever-published issue's apex, if
 * any) that a future publish would use — so Home 1 and the Magazine Reader
 * agree with each other even before an issue is ever formally published.
 */
export type MagazineApexPlacementEntry = {
  performerId: string;
  slug: string;
  displayName: string;
  rawSystemDRank: number;
  rawScore: number;
  editorialPlacement: number;
  apexEligibility: boolean;
  placementReason: QuarterlyEditorialPlacementEntry["placementReason"];
  genre?: string;
  profileRoute?: string;
  avatarUrl?: string;
  isLive?: boolean;
  verified?: boolean;
  /** Real, computed by AdaptiveMagazineCompositionAuthority via
   * QuarterlyEditorialPlacementAuthority — must travel through to the
   * renderer, never discarded (owner-locked, 2026-10-30). */
  articleComposition?: QuarterlyEditorialPlacementEntry["articleComposition"];
};

function liveEntryToApexEntry(entry: QuarterlyEditorialPlacementEntry): MagazineApexPlacementEntry {
  return {
    performerId: entry.performerId,
    slug: entry.slug,
    displayName: entry.displayName,
    rawSystemDRank: entry.rawSystemDRank,
    rawScore: entry.rawScore,
    editorialPlacement: entry.editorialPlacement,
    apexEligibility: entry.apexEligibility,
    placementReason: entry.placementReason,
    genre: entry.genre,
    profileRoute: entry.profileRoute,
    avatarUrl: entry.avatarUrl,
    isLive: entry.isLive,
    articleComposition: entry.articleComposition,
    verified: entry.verified,
  };
}

export async function getCurrentMagazineApexPlacements(
  issueKey = "current-issue",
): Promise<MagazineApexPlacementEntry[]> {
  const alreadyPublished = getCurrentQuarterlyIssueSnapshot();
  if (alreadyPublished) {
    // The frozen published-snapshot shape (QuarterlyIssuePerformerSnapshot)
    // carries "AtPublication"-suffixed field names and omits presentation
    // fields (profileRoute/avatarUrl/isLive/verified) that were never part
    // of the immutable historical record — mapped here, not re-derived from
    // live data (that would violate historical-issue stability).
    return alreadyPublished.placements.map((p) => ({
      performerId: p.performerId,
      slug: p.slug,
      displayName: p.displayName,
      rawSystemDRank: p.rawSystemDRankAtPublication,
      rawScore: p.rawScoreAtPublication,
      editorialPlacement: p.editorialPlacement,
      apexEligibility: p.apexEligibility,
      placementReason: p.placementReason,
      articleComposition: p.articleCompositionSnapshot,
    }));
  }

  const detailed = await getRealRankedPerformersForMagazineDetailed();
  const realOnly = detailed.filter((entry) => entry.realScore !== null);

  const input: SystemDRankedPerformerInput[] = realOnly.map((entry) => ({
    performerId: entry.performer.id,
    slug: entry.performer.slug,
    displayName: entry.performer.name,
    rawSystemDRank: entry.performer.rank,
    rawScore: entry.realScore as number,
    genre: entry.performer.category,
    profileRoute: entry.performer.profileRoute,
    avatarUrl: entry.performer.profileImageUrl,
    isLive: entry.performer.isLive,
    verified: isVerifiedRankedPerformer(entry.performer),
  }));

  const latestEverPublished = listAllQuarterlyIssueSnapshots()[0] ?? null;
  const transitionContext: QuarterlyIssueTransitionContext | null = latestEverPublished
    ? {
        previousIssueId: latestEverPublished.issueId,
        previousQuarterKey: latestEverPublished.quarterKey,
        previousIssueApexPerformerId: latestEverPublished.apexPerformerId,
        priorFormerApexPerformerIds: listAllQuarterlyIssueSnapshots()
          .slice(1)
          .map((s) => s.apexPerformerId)
          .filter((id): id is string => Boolean(id)),
      }
    : null;

  return computeQuarterlyEditorialPlacements(input, transitionContext, issueKey).map(liveEntryToApexEntry);
}

export async function rotateTopRanks(limit = 10): Promise<RotationCandidate[]> {
  const ranked = await getRealRankedPerformersForMagazine();
  const ranks = ranked.map((performer) => ({
    id: performer.slug,
    label: `#${performer.rank} ${performer.name}`,
    weight: Math.max(0, 1000 - performer.rank * 10),
  }));

  return rotate(sortByWeight(ranks), Date.now(), 60 * 60 * 1000).slice(0, limit);
}

export function rotateFeaturedEvents(events: RotationCandidate[], limit = 6): RotationCandidate[] {
  return rotate(sortByWeight(events), Date.now(), 30 * 60 * 1000).slice(0, limit);
}

export async function buildMagazineRotationSnapshot(input: {
  articles: RotationCandidate[];
  homepageArticles: RotationCandidate[];
  sponsors: RotationCandidate[];
  contests: RotationCandidate[];
  events: RotationCandidate[];
  articleIdForAds?: string;
}): Promise<MagazineRotationSnapshot> {
  return {
    articleRotation: rotateArticles(input.articles),
    homepageArticleRotation: rotateHomepageArticles(input.homepageArticles),
    adRotation: rotateAdsForIssue(input.articleIdForAds),
    sponsorRotation: rotateSponsorsForIssue(input.sponsors),
    rankRotation: await rotateTopRanks(),
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

  // Trusts the caller's order as the real rank (Magazine apex/placement
  // authority order from orderByMagazineApexPlacement()) — never re-derives
  // "global #1" from raw XP here. Re-sorting by .xp would silently discard
  // the one canonical Magazine apex decision and let this function decide a
  // second, different #1 (owner-locked, 2026-10-30: "MagazineRotationEngine
  // must NOT independently decide current Magazine #1 from raw System D
  // order after QuarterlyEditorialPlacementAuthority has already determined
  // the issue placement").
  const byRank = eligible;
  const global1 = byRank[0]!;

  const byGenre = new Map<string, MagazinePerformerSlotSource[]>();
  for (const p of byRank) {
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

  // §20984 — Community Gossip and Happy Days never land back-to-back, even
  // though they're different subtypes (the generic same-subtype guard below
  // wouldn't otherwise catch this specific pair).
  const blockedSubtypes = new Set<RandomPageSubtype>();
  if (lastSubtype) {
    blockedSubtypes.add(lastSubtype);
    if (GOSSIP_HAPPY_ADJACENCY_PAIR.includes(lastSubtype)) {
      for (const s of GOSSIP_HAPPY_ADJACENCY_PAIR) blockedSubtypes.add(s);
    }
  }

  const alternatives =
    blockedSubtypes.size > 0 && prefer.some((item) => !blockedSubtypes.has(item.subtype))
      ? prefer.filter((item) => !blockedSubtypes.has(item.subtype))
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

  // Empty-pool law: never invent articles. Skip missing PERFORMER/NEWS steps;
  // still emit remaining eligible classes (including RANDOM-only issues).
  // Only abort when every pool is empty.
  if (performerQueue.length === 0 && newsPool.length === 0 && randomRemaining.length === 0) {
    return [];
  }

  const slots: MagazineIssueSlot[] = [];
  let newsIndex = 0;
  let lastRandomSubtype: RandomPageSubtype | undefined;
  let randomBag = randomRemaining;

  const cycleCount =
    performerQueue.length > 0
      ? performerQueue.length
      : Math.min(Math.max(newsPool.length, randomRemaining.length > 0 ? 1 : 0), maxP);

  for (let cycle = 0; cycle < cycleCount; cycle += 1) {
    for (const pageClass of rhythm) {
      if (pageClass === "PERFORMER") {
        const performer = performerQueue[cycle];
        if (!performer) continue; // skip — do not invent a performer feature
        const href = performer.articleSlug
          ? magazineReaderArticleUrl(performer.articleSlug)
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
          articleComposition: performer.articleComposition,
        });
      } else if (pageClass === "NEWS") {
        if (newsPool.length === 0) continue; // skip — do not invent news
        const news = newsPool[newsIndex % newsPool.length]!;
        newsIndex += 1;
        slots.push({
          id: `n-${news.slug}-${cycle}`,
          pageClass: "NEWS",
          title: news.title,
          href: news.href,
          deck: news.preview ?? news.subtitle,
          heroColor: news.heroColor,
          imageUrl: news.imageUrl,
          xpEligible: true,
          monetizationLayer: "NONE",
          articleSlug: news.slug,
          sourceUrl: news.sourceUrl,
          sourceName: news.sourceName,
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
  compositionBySlug?: ReadonlyMap<string, MagazineApexPlacementEntry["articleComposition"]>,
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
      articleComposition: compositionBySlug?.get(p.slug),
    };
  });
}

export function newsArticlesToSlotSources(articles: IssueMagazineArticle[]): MagazineNewsSlotSource[] {
  return articles.map((article) => {
    const candidate =
      article.blocks.find((b) => b.type === "image" && b.url)?.url ??
      article.galleryImages?.[0]?.url;
    const resolved = resolveAuthorizedMagazineImageUrl(candidate);
    return {
      slug: article.slug,
      title: article.title,
      subtitle: article.subtitle,
      href: magazineReaderArticleUrl(article.slug),
      heroColor: article.heroColor,
      preview: articlePreview(article),
      author: article.author,
      imageUrl: resolved.classification === "AUTHORIZED" ? resolved.url : undefined,
      sourceUrl: article.sourceUrls?.[0],
      sourceName: article.isSystemSource ? "TMI Newsroom" : undefined,
    };
  });
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

export async function assembleDefaultRandomPool(
  rankedPerformers?: PerformerIdentity[],
): Promise<MagazineRandomSlotSource[]> {
  const pool: MagazineRandomSlotSource[] = [];

  pool.push(adSlotToRandom("magazine-issue-random-1", 1));
  pool.push(adSlotToRandom("magazine-issue-random-2", 2));

  const ranked = rankedPerformers ?? (await getRealRankedPerformersForMagazine());
  if (ranked.length > 0) {
    pool.push({
      id: "rankings-live",
      subtype: "RANKINGS",
      paidObligation: false,
      title: "Live Rankings",
      href: "/rankings",
      deck: `#1 ${ranked[0]!.name} · real plays, listeners & followers`,
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
    href: magazineReaderArticleUrl("stream-win-radio-explained"),
    deck: "Read the format explainer — rotation rooms are not claimed live here.",
    monetizationLayer: "NONE",
  });
  pool.push({
    id: "happy-days-community",
    subtype: "HAPPY_DAYS",
    paidObligation: false,
    title: "Happy Days · Community Reflections",
    href: "/happy-days",
    deck: "What brings us joy across TMI.",
    monetizationLayer: "NONE",
  });
  pool.push({
    id: "community-gossip",
    subtype: "COMMUNITY_GOSSIP",
    paidObligation: false,
    title: "Community Gossip · What Everyone's Whispering",
    href: "/community-gossip",
    deck: "Buzz, callouts, and culture notes from across TMI.",
    monetizationLayer: "NONE",
  });

  // Fan-authored articles → RANDOM-pool content (Fan is a RANDOM subtype,
  // never a fourth top-level family). Real published Articles only; an honest
  // empty contribution when none exist.
  const fanArticles = await listFanArticlesForMagazine({ limit: 8 }).catch(() => []);
  for (const fan of fanArticles) {
    pool.push({
      id: fan.id,
      subtype: "FAN_POLL",
      paidObligation: false,
      title: fan.title,
      href: fan.href,
      deck: fan.deck,
      imageUrl: fan.imageUrl,
      monetizationLayer: "NONE",
    });
  }

  // Weekly Top YoPho Cards → one RANDOM-page slot when real qualifying cards
  // exist this week. Honest omission when no card meets the adaptive threshold
  // (never fabricate engagement to fill the slot).
  const topYoPho = await listWeeklyTopYoPhoCards(1).catch(() => []);
  const leadYoPho = topYoPho[0];
  if (leadYoPho) {
    pool.push({
      id: `weekly-top-yopho-${leadYoPho.cardId}`,
      subtype: "PERFORMER_YOPHO_MOSAIC",
      paidObligation: false,
      title: "Weekly Top YoPho",
      href: leadYoPho.href,
      deck: `#1 ${leadYoPho.title} · ${leadYoPho.creatorDisplayName} · ${leadYoPho.weeklyLikes} likes this week`,
      imageUrl: leadYoPho.artworkUrl ?? undefined,
      monetizationLayer: "NONE",
    });
  }

  return pool.filter((item) => !NON_LIVING_COMMUNITY_RANDOM.includes(item.subtype));
}

export async function listQueuedWriterStories(): Promise<EditorialStory[]> {
  const submissions = await editorialSubmissionEngine.list();
  return submissions
    // "published" stays eligible too — otherwise a story would drop out of
    // the pool the moment it's first placed and could never rotate back in
    // on a later issue build.
    .filter((submission) => submission.status === "approved" || submission.status === "published")
    .map((submission) =>
      editorialSubmissionToStory({
        submissionId: submission.submissionId,
        title: submission.title,
        body: submission.body,
        category: submission.category,
        status: submission.status,
        contributorId: submission.contributorId,
        artistSlug: submission.artistSlug,
        sourceUrls: submission.sourceUrls,
      }),
    );
}

/** Approved writer stories become real NEWS-slot candidates, same shape as
 * staff articles — the composition engine below decides if/when they're
 * actually placed into a built issue (writer owns content, magazine owns
 * placement — CLAUDE.md editorial pipeline law). */
function writerStoriesToNewsSlotSources(stories: EditorialStory[]): MagazineNewsSlotSource[] {
  return stories.map((story) => ({
    slug: story.storyId,
    title: story.title,
    subtitle: story.subtitle ?? "",
    href: story.href,
    preview: story.blocks.find((block) => block.type === "paragraph")?.text,
    author: story.author,
    sourceUrl: story.sourceUrls?.[0],
  }));
}

/**
 * Reorders the full real-ranked performer pool (which still includes the
 * honest unranked-fallback tail for Rule 14 discoverability) so its order
 * matches the single canonical Magazine apex/placement authority
 * (getCurrentMagazineApexPlacements()) — this is the fix for
 * "MagazineRotationEngine must NOT independently decide current Magazine
 * #1 from raw System D order after QuarterlyEditorialPlacementAuthority has
 * already determined the issue placement" (owner-locked, 2026-10-30).
 * A performer outside the quarterly placement (the unranked tail) keeps
 * its existing relative order, appended after every quarterly-placed one.
 */
function orderByMagazineApexPlacement(
  ranked: PerformerIdentity[],
  placements: MagazineApexPlacementEntry[],
): PerformerIdentity[] {
  const placementRankBySlug = new Map(placements.map((p) => [p.slug, p.editorialPlacement]));
  const placed: PerformerIdentity[] = [];
  const unplaced: PerformerIdentity[] = [];
  for (const performer of ranked) {
    if (placementRankBySlug.has(performer.slug)) placed.push(performer);
    else unplaced.push(performer);
  }
  placed.sort((a, b) => placementRankBySlug.get(a.slug)! - placementRankBySlug.get(b.slug)!);
  return [...placed, ...unplaced];
}

export async function assembleDefaultIssuePools(): Promise<{
  performers: MagazinePerformerSlotSource[];
  news: MagazineNewsSlotSource[];
  randomPool: MagazineRandomSlotSource[];
}> {
  const [ranked, apexPlacements] = await Promise.all([
    getRealRankedPerformersForMagazine(),
    getCurrentMagazineApexPlacements(),
  ]);
  const magazineOrdered = orderByMagazineApexPlacement(ranked, apexPlacements);
  const compositionBySlug = new Map(apexPlacements.map((p) => [p.slug, p.articleComposition]));
  const performerArticles = getPerformerPoolArticles();
  const staffNews = newsArticlesToSlotSources(getNewsPoolArticles());
  const writerStories = await listQueuedWriterStories();
  const writerNews = writerStoriesToNewsSlotSources(writerStories);
  return {
    performers: performersToSlotSources(magazineOrdered, performerArticles, compositionBySlug),
    news: [...staffNews, ...writerNews],
    randomPool: await assembleDefaultRandomPool(magazineOrdered),
  };
}

/**
 * Computes what the issue would look like right now. Safe to call from any
 * reader GET, crawler, or cache revalidation: it never mutates submission
 * state. A reader opening the magazine must never be the event that
 * permanently changes editorial publication state.
 */
export async function buildCanonicalMagazineIssueSlots(issueKey: string): Promise<MagazineIssueSlot[]> {
  const pools = await assembleDefaultIssuePools();
  const seed = hashStringToSeed(`${issueKey}|${new Date().toISOString().slice(0, 10)}`);
  return buildMagazineIssueSequence({
    ...pools,
    rng: mulberry32(seed),
    maxPerformerSlots: 8,
  });
}

/**
 * The real commit boundary: APPROVED → (this function, an explicit,
 * authorized action — see POST /api/editorial/publish-issue) → PUBLISHED.
 * Idempotent — re-publishing an already-published submission is a no-op, so
 * calling this again for the same day's composition never flaps state.
 *
 * Scope-honest: this is an on-demand transaction a staff-editor/admin
 * triggers, not a scheduled composition job — no cron/queue infra exists in
 * this codebase yet to hang a real "nightly issue build" off of. Building
 * that scheduler is separate, larger work; this is the correct commit
 * boundary for whenever that scheduler calls it too.
 */
export async function publishIssueComposition(issueKey: string): Promise<{
  slots: MagazineIssueSlot[];
  publishedSubmissionIds: string[];
}> {
  const slots = await buildCanonicalMagazineIssueSlots(issueKey);
  const publishedSubmissionIds: string[] = [];

  for (const slot of slots) {
    if (slot.pageClass !== "NEWS" || !slot.articleSlug) continue;
    const result = await editorialSubmissionEngine.markPublished(slot.articleSlug, slot.articleSlug);
    // markPublished() no-ops (returns null) for staff-article slugs that
    // aren't real submission ids, and for anything not currently "approved".
    if (result && result.status === "published") {
      publishedSubmissionIds.push(slot.articleSlug);
    }
  }

  return { slots, publishedSubmissionIds };
}

export function issueSlotMonetizationLabel(layer: MonetizationLayer): string {
  if (layer === "TMI_DIRECT_SPONSOR") return "TMI DIRECT SPONSOR";
  if (layer === "ADSENSE") return "ADVERTISEMENT";
  if (layer === "PLATFORM_PROMO") return "PLATFORM";
  if (layer === "ADVERTISE_CTA") return "ADVERTISE";
  return "RANDOM";
}
