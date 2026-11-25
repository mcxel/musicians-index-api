/**
 * QuarterlyEditorialPlacementAuthority.ts
 *
 * Canonical Three-Month (1 Quarter = 3 Calendar Months) Magazine Issue Duration,
 * Quarterly Editorial Placement Rotator, Adaptive Magazine Article Composition
 * Selector (Separate from Bio Narrative Variants), and Immutable Quarterly
 * Issue Snapshot Ledger.
 *
 * Locked Architectural Invariants (2910–2931):
 * 1. ONE MAGAZINE ISSUE = THREE MONTHS (`MAGAZINE_ISSUE_DURATION_MONTHS = 3`):
 *    - Centralized issue-duration authority (`ONE_ISSUE_EQUALS_THREE_MONTHS = true`).
 *    - A performer may occupy Magazine #1 / Apex for that three-month issue.
 * 2. NO POST-APEX COOLDOWN (`EXTRA_91_DAY_COOLDOWN_REMOVED = true`):
 *    - At the issue transition (`Issue A -> Issue B`), the outgoing #1 (`previousIssueApexPerformerId`)
 *      cannot automatically carry #1 into the immediately following issue (`CONSECUTIVE_APEX_CARRYOVER = BLOCKED`).
 *    - The outgoing #1 rotates into the appropriate lower eligible placement (`#2` if still highest score),
 *      and the highest eligible performer becomes the new #1 for Issue B.
 *    - From that point on, there is NO 91-day post-apex cooling period (`cooldownUntil = NONE`).
 *      The former #1 immediately returns to normal competitive movement and can climb back to #1
 *      in subsequent issues through legitimate activity and placement rules (`FORMER_APEX_CAN_CLIMB_AGAIN = true`).
 * 3. RAW SYSTEM D REMAINS UNCHANGED (`RAW_SYSTEM_D_UNCHANGED = true`):
 *    - `rawSystemDRank` and `rawScore` (`queryRankedUsers()`, `PerformerScoreEngine`) are NEVER
 *      reset, subtracted, deleted, or falsified by quarterly editorial placement.
 * 4. SIX NARRATIVES ≠ VISUAL LAYOUTS (`NARRATIVE_AND_LAYOUT_AUTHORITIES_SEPARATE = true`):
 *    - `BioFeaturePackEngine.ts` owns `BIO_NARRATIVE_VARIANT` (1..6 grounded literary narratives).
 *    - Adaptive Magazine Composition (`selectAdaptiveArticleComposition`) independently owns
 *      `ARTICLE_COMPOSITION` (compositions `COMP_01`..`COMP_12`: hero photo position, secondary
 *      photo position, photo grid, headline placement, dek placement, columns, pull quote,
 *      sidebar, Personal section, Wild Card section, and caption placement) with visual
 *      repetition defense across recent issues and same-performer history.
 *    - Before publication: `tryAnotherArticleComposition()` permits cycling layouts.
 *    - After publication: the selected `ARTICLE_COMPOSITION` is locked and deterministic in the
 *      published/archived issue snapshot (`PUBLISHED_LAYOUT_STABILITY = true`).
 */

import type { PerformerBioPack } from '@/lib/editorial/BioFeaturePackEngine';
import {
  ARTICLE_COMPOSITION_CATALOG,
  selectAdaptiveArticleComposition,
  tryAnotherArticleComposition,
  type ArticleCompositionId,
  type ArticleCompositionSpec,
  type CompositionFamily,
  type CompositionSelectionHistoryContext,
} from './AdaptiveMagazineCompositionAuthority';

// Re-exported for backward compatibility — the canonical definitions now
// live in AdaptiveMagazineCompositionAuthority.ts (owner-locked
// reconciliation, 2026-10-30, rule 3322: composition is a separate
// authority from quarterly issue/apex placement, never bundled "merely for
// convenience"). Existing importers of these names from this file continue
// to work unchanged.
export {
  ARTICLE_COMPOSITION_CATALOG,
  selectAdaptiveArticleComposition,
  tryAnotherArticleComposition,
  type ArticleCompositionId,
  type ArticleCompositionSpec,
  type CompositionFamily,
  type CompositionSelectionHistoryContext,
};

// ── Centralized Issue Duration Authority (2927, 2935) ─────────────────────────

export const MAGAZINE_ISSUE_DURATION_MONTHS = 3 as const;
export const MAGAZINE_ISSUE_DURATION_MODEL = 'CALENDAR_THREE_MONTH_ISSUE_WINDOW' as const;
export const ONE_ISSUE_EQUALS_THREE_MONTHS = true as const;
export const EXTRA_91_DAY_COOLDOWN_REMOVED = true as const;

/**
 * Computes the canonical 3-calendar-month UTC window (`[startMs, endMs)`) for a
 * given year and quarter (Q1 = Jan 1..Apr 1, Q2 = Apr 1..Jul 1, Q3 = Jul 1..Oct 1,
 * Q4 = Oct 1..Jan 1 next year). Never relies on hardcoded 90-day or 91-day counts,
 * so leap years and varying month lengths never drift across services.
 */
export function getCalendarThreeMonthIssueWindow(year: number, quarter: 1 | 2 | 3 | 4): {
  quarterKey: string;
  issueDurationMonths: typeof MAGAZINE_ISSUE_DURATION_MONTHS;
  durationModel: typeof MAGAZINE_ISSUE_DURATION_MODEL;
  startMonthIndexUtc: number;
  startIsoUtc: string;
  endIsoUtc: string;
  startMs: number;
  endMs: number;
} {
  const startMonthIndexUtc = (quarter - 1) * 3;
  const startMs = Date.UTC(year, startMonthIndexUtc, 1, 0, 0, 0, 0);
  const endYear = quarter === 4 ? year + 1 : year;
  const endMonthIndexUtc = quarter === 4 ? 0 : startMonthIndexUtc + 3;
  const endMs = Date.UTC(endYear, endMonthIndexUtc, 1, 0, 0, 0, 0);

  return {
    quarterKey: `${year}-Q${quarter}`,
    issueDurationMonths: MAGAZINE_ISSUE_DURATION_MONTHS,
    durationModel: MAGAZINE_ISSUE_DURATION_MODEL,
    startMonthIndexUtc,
    startIsoUtc: new Date(startMs).toISOString(),
    endIsoUtc: new Date(endMs).toISOString(),
    startMs,
    endMs,
  };
}

export const QUARTERLY_PLACEMENT_AUTHORITY_INVARIANTS = {
  ONE_ISSUE_EQUALS_THREE_MONTHS: true,
  EXTRA_91_DAY_COOLDOWN_REMOVED: true,
  CONSECUTIVE_APEX_CARRYOVER_BLOCKED: true,
  FORMER_APEX_CAN_CLIMB_AGAIN: true,
  BIO_DOES_NOT_ALTER_RANK: true,
  ORBITAL_UI_DOES_NOT_ALTER_RANK: true,
  MAGAZINE_COMPOSITION_DOES_NOT_ALTER_RANK: true,
  ROTATOR_DOES_NOT_ALTER_RAW_SCORE: true,
  SYSTEM_D_DOES_NOT_GENERATE_BIO: true,
  ARTICLE_GENERATOR_DOES_NOT_CHOOSE_NUMBER_ONE: true,
  NARRATIVE_AND_LAYOUT_AUTHORITIES_SEPARATE: true,
  PUBLISHED_LAYOUT_STABILITY: true,
} as const;

export type EditorialPlacementReason =
  | 'EARNED_APEX_ELIGIBLE'
  | 'PROMOTED_APEX_VIA_QUARTERLY_ROTATION'
  | 'QUARTERLY_APEX_TENURE_ROTATED'
  | 'CLIMBED_BACK_TO_APEX'
  | 'STANDARD_EDITORIAL_CASCADE';

export interface SystemDRankedPerformerInput {
  performerId: string;
  slug: string;
  displayName: string;
  rawSystemDRank: number;
  rawScore: number;
  genre?: string;
  profileRoute?: string;
  articleSlug?: string;
  avatarUrl?: string;
  isLive?: boolean;
  verified?: boolean;
  approvedBioPack?: PerformerBioPack | null;
  fallbackApprovedSnippet?: string;
  /** Optional pre-selected or overridden compositionId (separate from narrative variantId) */
  preferredCompositionId?: ArticleCompositionId;
}

/**
 * Context describing the immediately preceding three-month issue's #1 apex holder.
 * Note: There is NO 91-day post-apex cooldown. Only the holder of #1 in the
 * immediately preceding issue (`previousIssueApexPerformerId`) is blocked from
 * automatic consecutive carryover at the issue transition. Any performer who
 * rotated out in an earlier issue (`priorFormerApexPerformerIds`) is 100%
 * eligible to climb back to #1 immediately.
 */
export interface QuarterlyIssueTransitionContext {
  previousIssueId?: string | null;
  previousQuarterKey?: string | null;
  /** Performer who held #1 in the immediately preceding 3-month issue (rotates out at boundary) */
  previousIssueApexPerformerId?: string | null;
  /** Performers who held #1 in older issues and have already rotated out (can climb back to #1) */
  priorFormerApexPerformerIds?: ReadonlyArray<string>;
}

// ── Quarterly Editorial Placement & Issue Snapshot Models ────────────────────

export interface QuarterlyEditorialPlacementEntry {
  performerId: string;
  slug: string;
  displayName: string;
  /** Raw System D rank — NEVER altered by the rotator */
  rawSystemDRank: number;
  /** Raw System D score — NEVER altered by the rotator */
  rawScore: number;
  /** Quarterly Magazine & Orbital Wheel placement (1 = Current Magazine #1 / Apex) */
  editorialPlacement: number;
  /** Whether this performer is eligible for the #1 Quarterly Apex slot in this issue */
  apexEligibility: boolean;
  /** Whether this performer remains active and eligible to climb immediately (always true) */
  canClimbImmediately: true;
  placementReason: EditorialPlacementReason;
  genre: string;
  profileRoute: string;
  articleHref: string;
  avatarUrl?: string;
  isLive: boolean;
  verified: boolean;
  /** Narrative Variant Authority (BioFeaturePackEngine) */
  approvedVariantId: string | null;
  approvedHeadline: string | null;
  approvedFeatureTeaser: string | null;
  /** Visual Composition Authority (Adaptive Magazine Composition — independent of Narrative Variant) */
  articleComposition: ArticleCompositionSpec;
}

export interface QuarterlyIssuePerformerSnapshot {
  issueId: string;
  quarterKey: string;
  issueDurationMonths: typeof MAGAZINE_ISSUE_DURATION_MONTHS;
  performerId: string;
  slug: string;
  displayName: string;
  rawSystemDRankAtPublication: number;
  rawScoreAtPublication: number;
  editorialPlacement: number;
  apexEligibility: boolean;
  placementReason: EditorialPlacementReason;
  approvedVariantIdAtPublication: string | null;
  approvedHeadlineSnapshot: string | null;
  approvedNarrativeTextSnapshot: string | null;
  /** Locked visual composition at publication — reloading never moves photos */
  articleCompositionIdAtPublication: ArticleCompositionId;
  articleCompositionSnapshot: ArticleCompositionSpec;
  publishedAtMs: number;
}

export interface QuarterlyIssueTransitionReceipt {
  receiptId: string;
  fromIssueId: string | null;
  toIssueId: string;
  fromQuarterKey: string | null;
  toQuarterKey: string;
  issueDurationMonths: typeof MAGAZINE_ISSUE_DURATION_MONTHS;
  previousApexPerformerId: string | null;
  newApexPerformerId: string | null;
  rotatedOutApexPerformerId: string | null;
  rotatedOutPerformerNewPlacement: number | null;
  rotatedOutPerformerCanClimbImmediately: true;
  postApexCooldownDays: 0;
  rawRankPreserved: true;
  rawScorePreserved: true;
  transitionedAtMs: number;
}

export interface PublishedQuarterlyIssueSnapshot {
  issueId: string;
  quarterKey: string;
  issueDurationMonths: typeof MAGAZINE_ISSUE_DURATION_MONTHS;
  status: 'PUBLISHED' | 'ARCHIVED';
  publishedAtMs: number;
  archivedAtMs?: number;
  apexPerformerId: string | null;
  placements: readonly QuarterlyIssuePerformerSnapshot[];
  transitionReceipt?: QuarterlyIssueTransitionReceipt;
}

const publishedQuarterlyIssues = new Map<string, PublishedQuarterlyIssueSnapshot>();
let currentActiveQuarterlyIssueId: string | null = null;
const performerLastPublishedCompositionMap = new Map<string, ArticleCompositionId>();

/**
 * Evaluates whether a performer is eligible for the #1 Magazine Apex slot in the
 * new three-month issue.
 *
 * Canonical Rule (2910–2914):
 * - ONE MAGAZINE ISSUE = THREE MONTHS.
 * - FORBIDDEN: Automatic consecutive issue apex carryover (`performerId === previousIssueApexPerformerId`).
 *   At the issue transition, the outgoing #1 must rotate out of #1.
 * - ALLOWED: Legitimate climb back toward the apex after rotation. There is NO 91-day
 *   post-apex cooling period. As soon as another performer has taken the new issue's
 *   #1 spot, the former #1 is immediately in normal competitive movement and is 100%
 *   eligible to reclaim #1 in the next issue.
 */
export function evaluateQuarterlyApexEligibility(
  performerId: string,
  transitionContext?: QuarterlyIssueTransitionContext | null,
): {
  apexEligible: boolean;
  canClimbImmediately: true;
  postApexCooldownDays: 0;
  reason:
    | 'ELIGIBLE_NO_CONSECUTIVE_CARRYOVER'
    | 'ELIGIBLE_CLIMB_BACK_ALLOWED'
    | 'ROTATED_OUT_NO_CONSECUTIVE_APEX_CARRYOVER';
} {
  const outgoingApexId = transitionContext?.previousIssueApexPerformerId ?? null;
  if (outgoingApexId && outgoingApexId === performerId) {
    return {
      apexEligible: false,
      canClimbImmediately: true,
      postApexCooldownDays: 0,
      reason: 'ROTATED_OUT_NO_CONSECUTIVE_APEX_CARRYOVER',
    };
  }

  const wasPriorApex =
    transitionContext?.priorFormerApexPerformerIds?.includes(performerId) ?? false;

  return {
    apexEligible: true,
    canClimbImmediately: true,
    postApexCooldownDays: 0,
    reason: wasPriorApex ? 'ELIGIBLE_CLIMB_BACK_ALLOWED' : 'ELIGIBLE_NO_CONSECUTIVE_CARRYOVER',
  };
}

function resolveApprovedTeaserFromPack(
  pack?: PerformerBioPack | null,
  fallbackSnippet?: string,
): {
  variantId: string | null;
  headline: string | null;
  narrativeText: string | null;
} {
  if (pack) {
    const primary =
      pack.variants.find((v) => v.variantId === pack.primaryVariantId && v.approvalStatus === 'APPROVED') ??
      pack.variants.find((v) => v.approvalStatus === 'APPROVED') ??
      null;
    if (primary) {
      return {
        variantId: primary.variantId,
        headline: primary.headline,
        narrativeText: primary.narrativeText,
      };
    }
  }
  if (fallbackSnippet && fallbackSnippet.trim()) {
    return {
      variantId: 'fallback-approved-snippet',
      headline: null,
      narrativeText: fallbackSnippet.trim(),
    };
  }
  return {
    variantId: null,
    headline: null,
    narrativeText: null,
  };
}

/**
 * Computes deterministic Quarterly Editorial & Orbital Wheel placements from
 * canonical System D ranked performers WITHOUT mutating `rawSystemDRank` or `rawScore`.
 *
 * Cascade Law:
 * - Sort inputs by `rawSystemDRank` ascending (preserving System D truth).
 * - If `previousIssueApexPerformerId` is #1 at the issue boundary, they cannot
 *   automatically carry #1 into the new issue (`apexEligibility = false`).
 * - The highest eligible performer becomes the new #1 (`editorialPlacement = 1`),
 *   and the outgoing #1 rotates into the appropriate lower eligible placement (`#2`
 *   if still #1 in raw score) while remaining active and immediately able to climb.
 */
export function computeQuarterlyEditorialPlacements(
  rankedPerformers: readonly SystemDRankedPerformerInput[],
  transitionContext?: QuarterlyIssueTransitionContext | null,
  issueKey = 'current-issue',
): QuarterlyEditorialPlacementEntry[] {
  if (rankedPerformers.length === 0) return [];

  const sortedByRawRank = [...rankedPerformers].sort(
    (a, b) => a.rawSystemDRank - b.rawSystemDRank || b.rawScore - a.rawScore || a.slug.localeCompare(b.slug),
  );

  const eligibilityMap = new Map<string, ReturnType<typeof evaluateQuarterlyApexEligibility>>();
  for (const p of sortedByRawRank) {
    eligibilityMap.set(p.performerId, evaluateQuarterlyApexEligibility(p.performerId, transitionContext));
  }

  // Highest System D performer eligible for the new issue's #1 Apex
  const apexWinner =
    sortedByRawRank.find((p) => eligibilityMap.get(p.performerId)?.apexEligible === true) ??
    sortedByRawRank[0]!;

  const editorialOrdered: SystemDRankedPerformerInput[] = [
    apexWinner,
    ...sortedByRawRank.filter((p) => p.performerId !== apexWinner.performerId),
  ];

  const assignedCompositions: ArticleCompositionSpec[] = [];

  return editorialOrdered.map((p, idx) => {
    const editorialPlacement = idx + 1;
    const evalResult = eligibilityMap.get(p.performerId)!;
    const apexEligibility = evalResult.apexEligible;

    let placementReason: EditorialPlacementReason = 'STANDARD_EDITORIAL_CASCADE';
    if (editorialPlacement === 1 && !apexEligibility) {
      // No eligible population edge case (e.g. exactly one real ranked
      // performer, and they are the immediately-outgoing apex): there is no
      // one else to structurally occupy placement #1, but they must never
      // be mislabeled as having earned/been promoted to apex while their
      // own apexEligibility is false — that would self-contradict the
      // single-rollover-exclusion law. Consumers must gate apex-specific
      // presentation on apexEligibility, never on editorialPlacement alone.
      placementReason = 'QUARTERLY_APEX_TENURE_ROTATED';
    } else if (editorialPlacement === 1) {
      if (evalResult.reason === 'ELIGIBLE_CLIMB_BACK_ALLOWED') {
        placementReason = 'CLIMBED_BACK_TO_APEX';
      } else {
        placementReason =
          p.rawSystemDRank === 1 ? 'EARNED_APEX_ELIGIBLE' : 'PROMOTED_APEX_VIA_QUARTERLY_ROTATION';
      }
    } else if (!apexEligibility && p.rawSystemDRank < editorialPlacement) {
      placementReason = 'QUARTERLY_APEX_TENURE_ROTATED';
    }

    const approved = resolveApprovedTeaserFromPack(p.approvedBioPack, p.fallbackApprovedSnippet);
    const profileRoute = p.profileRoute || `/performers/${p.slug}`;
    const articleHref = p.articleSlug
      ? `/magazine/issue/current?article=${encodeURIComponent(p.articleSlug)}`
      : `/articles/performer/${encodeURIComponent(p.slug)}`;

    const compositionSpec = selectAdaptiveArticleComposition({
      performerId: p.performerId,
      issueKey,
      slotIndex: idx,
      preferredCompositionId: p.preferredCompositionId,
      history: {
        performerPreviousCompositionId: performerLastPublishedCompositionMap.get(p.performerId) ?? null,
        adjacentIssueCompositions: assignedCompositions,
      },
    });
    assignedCompositions.push(compositionSpec);

    return {
      performerId: p.performerId,
      slug: p.slug,
      displayName: p.displayName,
      rawSystemDRank: p.rawSystemDRank,
      rawScore: p.rawScore,
      editorialPlacement,
      apexEligibility,
      canClimbImmediately: true,
      placementReason,
      genre: p.genre ?? 'Independent',
      profileRoute,
      articleHref,
      avatarUrl: p.avatarUrl,
      isLive: Boolean(p.isLive),
      verified: Boolean(p.verified),
      approvedVariantId: approved.variantId,
      approvedHeadline: approved.headline,
      approvedFeatureTeaser: approved.narrativeText,
      articleComposition: compositionSpec,
    };
  });
}

/**
 * Publishes an immutable Three-Month Quarterly Issue Snapshot.
 * When transitioning from a prior published issue (`Issue A -> Issue B`),
 * automatically blocks consecutive #1 carryover from Issue A's apex holder,
 * rotates them into their appropriate active placement, and records a transition
 * receipt with `postApexCooldownDays: 0` and `rotatedOutPerformerCanClimbImmediately: true`.
 */
export function publishQuarterlyIssueSnapshot(input: {
  issueId: string;
  quarterKey: string;
  rankedPerformers: readonly SystemDRankedPerformerInput[];
  transitionContext?: QuarterlyIssueTransitionContext | null;
  publishedAtMs?: number;
}): PublishedQuarterlyIssueSnapshot {
  const publishedAtMs = input.publishedAtMs ?? Date.now();

  const prevIssue =
    currentActiveQuarterlyIssueId && publishedQuarterlyIssues.has(currentActiveQuarterlyIssueId)
      ? publishedQuarterlyIssues.get(currentActiveQuarterlyIssueId)!
      : null;

  // Gather older former apex holders (issues before prevIssue) so we can prove they can climb back
  const priorFormerApexIds: string[] = [];
  for (const issue of publishedQuarterlyIssues.values()) {
    if (prevIssue && issue.issueId === prevIssue.issueId) continue;
    if (issue.apexPerformerId) priorFormerApexIds.push(issue.apexPerformerId);
  }

  const effectiveTransitionContext: QuarterlyIssueTransitionContext = input.transitionContext ?? {
    previousIssueId: prevIssue?.issueId ?? null,
    previousQuarterKey: prevIssue?.quarterKey ?? null,
    previousIssueApexPerformerId: prevIssue?.apexPerformerId ?? null,
    priorFormerApexPerformerIds: priorFormerApexIds,
  };

  const placements = computeQuarterlyEditorialPlacements(
    input.rankedPerformers,
    effectiveTransitionContext,
    input.issueId,
  );

  const frozenSnapshots: QuarterlyIssuePerformerSnapshot[] = placements.map((entry) => {
    performerLastPublishedCompositionMap.set(entry.performerId, entry.articleComposition.compositionId);
    return Object.freeze({
      issueId: input.issueId,
      quarterKey: input.quarterKey,
      issueDurationMonths: MAGAZINE_ISSUE_DURATION_MONTHS,
      performerId: entry.performerId,
      slug: entry.slug,
      displayName: entry.displayName,
      rawSystemDRankAtPublication: entry.rawSystemDRank,
      rawScoreAtPublication: entry.rawScore,
      editorialPlacement: entry.editorialPlacement,
      apexEligibility: entry.apexEligibility,
      placementReason: entry.placementReason,
      approvedVariantIdAtPublication: entry.approvedVariantId,
      approvedHeadlineSnapshot: entry.approvedHeadline,
      approvedNarrativeTextSnapshot: entry.approvedFeatureTeaser,
      articleCompositionIdAtPublication: entry.articleComposition.compositionId,
      articleCompositionSnapshot: Object.freeze({ ...entry.articleComposition }),
      publishedAtMs,
    });
  });

  let transitionReceipt: QuarterlyIssueTransitionReceipt | undefined;
  if (prevIssue || effectiveTransitionContext.previousIssueApexPerformerId) {
    if (prevIssue) {
      const archivedPrev: PublishedQuarterlyIssueSnapshot = Object.freeze({
        ...prevIssue,
        status: 'ARCHIVED',
        archivedAtMs: publishedAtMs,
      });
      publishedQuarterlyIssues.set(prevIssue.issueId, archivedPrev);
    }

    // NO_ELIGIBLE_POPULATION edge case (e.g. exactly one real ranked performer,
    // and they are the immediately-outgoing apex): placements[0].apexEligibility
    // is false even though they structurally occupy placement #1 — never report
    // them as a legitimate new apex in the transition receipt.
    const newApex = frozenSnapshots[0]?.apexEligibility ? frozenSnapshots[0] : null;
    const rotatedOut =
      frozenSnapshots.find(
        (s) => s.placementReason === 'QUARTERLY_APEX_TENURE_ROTATED' && s.performerId !== newApex?.performerId,
      ) ?? null;

    transitionReceipt = Object.freeze({
      receiptId: `q-transition-${effectiveTransitionContext.previousIssueId ?? 'prev'}-to-${input.issueId}`,
      fromIssueId: effectiveTransitionContext.previousIssueId ?? prevIssue?.issueId ?? null,
      toIssueId: input.issueId,
      fromQuarterKey: effectiveTransitionContext.previousQuarterKey ?? prevIssue?.quarterKey ?? null,
      toQuarterKey: input.quarterKey,
      issueDurationMonths: MAGAZINE_ISSUE_DURATION_MONTHS,
      previousApexPerformerId:
        effectiveTransitionContext.previousIssueApexPerformerId ?? prevIssue?.apexPerformerId ?? null,
      newApexPerformerId: newApex?.performerId ?? null,
      rotatedOutApexPerformerId: rotatedOut?.performerId ?? null,
      rotatedOutPerformerNewPlacement: rotatedOut?.editorialPlacement ?? null,
      rotatedOutPerformerCanClimbImmediately: true,
      postApexCooldownDays: 0,
      rawRankPreserved: true,
      rawScorePreserved: true,
      transitionedAtMs: publishedAtMs,
    });
  }

  const snapshot: PublishedQuarterlyIssueSnapshot = Object.freeze({
    issueId: input.issueId,
    quarterKey: input.quarterKey,
    issueDurationMonths: MAGAZINE_ISSUE_DURATION_MONTHS,
    status: 'PUBLISHED',
    publishedAtMs,
    apexPerformerId: frozenSnapshots[0]?.apexEligibility ? frozenSnapshots[0].performerId : null,
    placements: Object.freeze(frozenSnapshots),
    transitionReceipt,
  });

  publishedQuarterlyIssues.set(input.issueId, snapshot);
  currentActiveQuarterlyIssueId = input.issueId;
  return snapshot;
}

export function getQuarterlyIssueSnapshot(issueId: string): PublishedQuarterlyIssueSnapshot | null {
  return publishedQuarterlyIssues.get(issueId) ?? null;
}

export function getCurrentQuarterlyIssueSnapshot(): PublishedQuarterlyIssueSnapshot | null {
  if (!currentActiveQuarterlyIssueId) return null;
  return publishedQuarterlyIssues.get(currentActiveQuarterlyIssueId) ?? null;
}

export function listAllQuarterlyIssueSnapshots(): PublishedQuarterlyIssueSnapshot[] {
  return [...publishedQuarterlyIssues.values()].sort((a, b) => b.publishedAtMs - a.publishedAtMs);
}

export function __resetQuarterlyEditorialPlacementForTests(): void {
  publishedQuarterlyIssues.clear();
  currentActiveQuarterlyIssueId = null;
  performerLastPublishedCompositionMap.clear();
}
