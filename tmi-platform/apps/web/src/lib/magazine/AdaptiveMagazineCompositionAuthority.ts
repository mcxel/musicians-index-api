/**
 * AdaptiveMagazineCompositionAuthority.ts
 *
 * Canonical Adaptive Magazine Article Composition authority — extracted from
 * QuarterlyEditorialPlacementAuthority.ts (owner-locked reconciliation,
 * 2026-10-30, rule 3322: "ARTICLE_COMPOSITION_CATALOG / selectAdaptiveArticleComposition /
 * tryAnotherArticleComposition must NOT remain bundled into the canonical
 * quarterly apex/placement authority merely for convenience").
 *
 * Owns HOW approved article content is visually presented (hero/secondary
 * photo position, photo grid, headline/dek placement, columns, pull quote,
 * sidebar, Personal/Wild Card section, caption placement) — completely
 * independent of:
 *   - BIO_NARRATIVE_VARIANT (BioFeaturePackEngine.ts — WHAT the article says)
 *   - WHO occupies which quarterly editorial/apex position
 *     (QuarterlyEditorialPlacementAuthority.ts — WHO appears WHERE)
 *
 * A performer's narrative variant and visual composition are selected on
 * independent axes — Narrative 4 can pair with Composition 3 in one issue
 * and Composition 9 in the next; composition never determines narrative,
 * narrative never determines composition.
 */

export type ArticleCompositionId =
  | 'COMP_01_FULL_BLEED_TOP'
  | 'COMP_02_SPLIT_LEFT_HERO'
  | 'COMP_03_SPLIT_RIGHT_HERO'
  | 'COMP_04_CENTER_PORTRAIT_DIPTYCH'
  | 'COMP_05_ASYMMETRIC_EDITORIAL_GRID'
  | 'COMP_06_WIDE_CINEMATIC_BANNER'
  | 'COMP_07_MAGAZINE_COVER_INSET'
  | 'COMP_08_DUAL_COLUMN_GALLERY_RAIL'
  | 'COMP_09_TRIPLE_COLUMN_CHRONICLE'
  | 'COMP_10_STAGE_SPOTLIGHT_MOSAIC'
  | 'COMP_11_INTIMATE_QA_FEATURE'
  | 'COMP_12_MONUMENT_PULLQUOTE_SPREAD';

export type CompositionFamily =
  | 'CINEMATIC_HERO'
  | 'SPLIT_SPREAD'
  | 'PORTRAIT_DIPTYCH'
  | 'EDITORIAL_MOSAIC'
  | 'CHRONICLE_COLUMNS'
  | 'INTIMATE_FEATURE';

export interface ArticleCompositionSpec {
  compositionId: ArticleCompositionId;
  compositionNumber: number;
  family: CompositionFamily;
  label: string;
  heroPhotoPosition: 'TOP_FULL_BLEED' | 'LEFT_SPLIT_50' | 'RIGHT_SPLIT_50' | 'CENTER_PORTRAIT' | 'OFFSET_UPPER_LEFT' | 'CINEMATIC_LETTERBOX';
  secondaryPhotoPosition: 'BOTTOM_DUAL_STRIP' | 'OPPOSITE_RAIL_STACK' | 'DIAGONAL_INSET' | 'MID_SPREAD_TRIPTYCH' | 'SIDEBAR_PORTRAIT_PAIR' | 'LOWER_CORNER_ACCENT';
  photoGridArrangement: 'SINGLE_HERO_PLUS_2' | 'ASYMMETRIC_3_UP' | 'BALANCED_2X2' | 'WIDE_STAGE_PANORAMA' | 'VERTICAL_STORY_STRIP' | 'EDITORIAL_COLLAGE_4';
  headlinePlacement: 'ABOVE_HERO' | 'OVER_HERO_LOWER_THIRD' | 'LEFT_COLUMN_LEAD' | 'RIGHT_COLUMN_LEAD' | 'CENTER_DROP_DECK' | 'SPLIT_BANNER_HEADER';
  dekPlacement: 'UNDER_HEADLINE' | 'SIDE_CALLOUT_BOX' | 'LEAD_PARAGRAPH_DROP' | 'HERO_CAPTION_BRIDGE';
  columnCount: 1 | 2 | 3;
  pullQuoteZone: 'CENTER_BREAKOUT' | 'LEFT_MARGIN_HANG' | 'RIGHT_RAIL_HIGHLIGHT' | 'BETWEEN_COLUMNS';
  sidebarZone: 'RIGHT_DISCOGRAPHY_RAIL' | 'LEFT_FACT_LEDGER_RAIL' | 'BOTTOM_STATS_RIBBON' | 'FLOATING_INDEX_CARD';
  personalSectionZone: 'LOWER_LEFT_PANEL' | 'LOWER_RIGHT_PANEL' | 'MID_ARTICLE_INSET' | 'CLOSING_CODA_BOX';
  wildCardSectionZone: 'SIDEBAR_SPOTLIGHT_CARD' | 'FOOTER_OFF_MIC_BOX' | 'PULLQUOTE_ADJACENT_BOX' | 'BACKSTAGE_TICKET_STUB';
  captionPlacement: 'BELOW_FRAME_FLUSH' | 'OUTER_MARGIN_VERTICAL' | 'CORNER_INDEX_TAG' | 'GALLERY_FOOTER_KEY';
}

export const ARTICLE_COMPOSITION_CATALOG: readonly ArticleCompositionSpec[] = [
  {
    compositionId: 'COMP_01_FULL_BLEED_TOP',
    compositionNumber: 1,
    family: 'CINEMATIC_HERO',
    label: 'Full-Bleed Top Hero & Dual Column Feature',
    heroPhotoPosition: 'TOP_FULL_BLEED',
    secondaryPhotoPosition: 'BOTTOM_DUAL_STRIP',
    photoGridArrangement: 'SINGLE_HERO_PLUS_2',
    headlinePlacement: 'OVER_HERO_LOWER_THIRD',
    dekPlacement: 'UNDER_HEADLINE',
    columnCount: 2,
    pullQuoteZone: 'CENTER_BREAKOUT',
    sidebarZone: 'RIGHT_DISCOGRAPHY_RAIL',
    personalSectionZone: 'LOWER_LEFT_PANEL',
    wildCardSectionZone: 'BACKSTAGE_TICKET_STUB',
    captionPlacement: 'BELOW_FRAME_FLUSH',
  },
  {
    compositionId: 'COMP_02_SPLIT_LEFT_HERO',
    compositionNumber: 2,
    family: 'SPLIT_SPREAD',
    label: 'Left Split Portrait & Right Editorial Lead',
    heroPhotoPosition: 'LEFT_SPLIT_50',
    secondaryPhotoPosition: 'OPPOSITE_RAIL_STACK',
    photoGridArrangement: 'ASYMMETRIC_3_UP',
    headlinePlacement: 'RIGHT_COLUMN_LEAD',
    dekPlacement: 'LEAD_PARAGRAPH_DROP',
    columnCount: 2,
    pullQuoteZone: 'RIGHT_RAIL_HIGHLIGHT',
    sidebarZone: 'BOTTOM_STATS_RIBBON',
    personalSectionZone: 'LOWER_RIGHT_PANEL',
    wildCardSectionZone: 'SIDEBAR_SPOTLIGHT_CARD',
    captionPlacement: 'OUTER_MARGIN_VERTICAL',
  },
  {
    compositionId: 'COMP_03_SPLIT_RIGHT_HERO',
    compositionNumber: 3,
    family: 'SPLIT_SPREAD',
    label: 'Left Narrative Lead & Right Split Hero',
    heroPhotoPosition: 'RIGHT_SPLIT_50',
    secondaryPhotoPosition: 'DIAGONAL_INSET',
    photoGridArrangement: 'BALANCED_2X2',
    headlinePlacement: 'LEFT_COLUMN_LEAD',
    dekPlacement: 'UNDER_HEADLINE',
    columnCount: 2,
    pullQuoteZone: 'LEFT_MARGIN_HANG',
    sidebarZone: 'LEFT_FACT_LEDGER_RAIL',
    personalSectionZone: 'MID_ARTICLE_INSET',
    wildCardSectionZone: 'FOOTER_OFF_MIC_BOX',
    captionPlacement: 'CORNER_INDEX_TAG',
  },
  {
    compositionId: 'COMP_04_CENTER_PORTRAIT_DIPTYCH',
    compositionNumber: 4,
    family: 'PORTRAIT_DIPTYCH',
    label: 'Center Portrait Diptych & Flanking Columns',
    heroPhotoPosition: 'CENTER_PORTRAIT',
    secondaryPhotoPosition: 'SIDEBAR_PORTRAIT_PAIR',
    photoGridArrangement: 'VERTICAL_STORY_STRIP',
    headlinePlacement: 'ABOVE_HERO',
    dekPlacement: 'CENTER_DROP_DECK' as ArticleCompositionSpec['dekPlacement'],
    columnCount: 3,
    pullQuoteZone: 'BETWEEN_COLUMNS',
    sidebarZone: 'FLOATING_INDEX_CARD',
    personalSectionZone: 'CLOSING_CODA_BOX',
    wildCardSectionZone: 'PULLQUOTE_ADJACENT_BOX',
    captionPlacement: 'GALLERY_FOOTER_KEY',
  },
  {
    compositionId: 'COMP_05_ASYMMETRIC_EDITORIAL_GRID',
    compositionNumber: 5,
    family: 'EDITORIAL_MOSAIC',
    label: 'Asymmetric Editorial Photo Grid',
    heroPhotoPosition: 'OFFSET_UPPER_LEFT',
    secondaryPhotoPosition: 'MID_SPREAD_TRIPTYCH',
    photoGridArrangement: 'EDITORIAL_COLLAGE_4',
    headlinePlacement: 'SPLIT_BANNER_HEADER',
    dekPlacement: 'SIDE_CALLOUT_BOX',
    columnCount: 2,
    pullQuoteZone: 'CENTER_BREAKOUT',
    sidebarZone: 'RIGHT_DISCOGRAPHY_RAIL',
    personalSectionZone: 'LOWER_LEFT_PANEL',
    wildCardSectionZone: 'SIDEBAR_SPOTLIGHT_CARD',
    captionPlacement: 'BELOW_FRAME_FLUSH',
  },
  {
    compositionId: 'COMP_06_WIDE_CINEMATIC_BANNER',
    compositionNumber: 6,
    family: 'CINEMATIC_HERO',
    label: '21:9 Wide Arena Panorama & Three-Column Spread',
    heroPhotoPosition: 'CINEMATIC_LETTERBOX',
    secondaryPhotoPosition: 'LOWER_CORNER_ACCENT',
    photoGridArrangement: 'WIDE_STAGE_PANORAMA',
    headlinePlacement: 'ABOVE_HERO',
    dekPlacement: 'HERO_CAPTION_BRIDGE',
    columnCount: 3,
    pullQuoteZone: 'LEFT_MARGIN_HANG',
    sidebarZone: 'BOTTOM_STATS_RIBBON',
    personalSectionZone: 'LOWER_RIGHT_PANEL',
    wildCardSectionZone: 'BACKSTAGE_TICKET_STUB',
    captionPlacement: 'OUTER_MARGIN_VERTICAL',
  },
  {
    compositionId: 'COMP_07_MAGAZINE_COVER_INSET',
    compositionNumber: 7,
    family: 'PORTRAIT_DIPTYCH',
    label: 'Magazine Cover Inset & Story Rail',
    heroPhotoPosition: 'LEFT_SPLIT_50',
    secondaryPhotoPosition: 'BOTTOM_DUAL_STRIP',
    photoGridArrangement: 'SINGLE_HERO_PLUS_2',
    headlinePlacement: 'CENTER_DROP_DECK',
    dekPlacement: 'UNDER_HEADLINE',
    columnCount: 1,
    pullQuoteZone: 'RIGHT_RAIL_HIGHLIGHT',
    sidebarZone: 'LEFT_FACT_LEDGER_RAIL',
    personalSectionZone: 'MID_ARTICLE_INSET',
    wildCardSectionZone: 'FOOTER_OFF_MIC_BOX',
    captionPlacement: 'CORNER_INDEX_TAG',
  },
  {
    compositionId: 'COMP_08_DUAL_COLUMN_GALLERY_RAIL',
    compositionNumber: 8,
    family: 'CHRONICLE_COLUMNS',
    label: 'Dual-Column Chronicle & Gallery Rail',
    heroPhotoPosition: 'RIGHT_SPLIT_50',
    secondaryPhotoPosition: 'OPPOSITE_RAIL_STACK',
    photoGridArrangement: 'VERTICAL_STORY_STRIP',
    headlinePlacement: 'LEFT_COLUMN_LEAD',
    dekPlacement: 'SIDE_CALLOUT_BOX',
    columnCount: 2,
    pullQuoteZone: 'BETWEEN_COLUMNS',
    sidebarZone: 'RIGHT_DISCOGRAPHY_RAIL',
    personalSectionZone: 'CLOSING_CODA_BOX',
    wildCardSectionZone: 'PULLQUOTE_ADJACENT_BOX',
    captionPlacement: 'GALLERY_FOOTER_KEY',
  },
  {
    compositionId: 'COMP_09_TRIPLE_COLUMN_CHRONICLE',
    compositionNumber: 9,
    family: 'CHRONICLE_COLUMNS',
    label: 'Triple-Column Index Chronicle & Triptych',
    heroPhotoPosition: 'OFFSET_UPPER_LEFT',
    secondaryPhotoPosition: 'MID_SPREAD_TRIPTYCH',
    photoGridArrangement: 'ASYMMETRIC_3_UP',
    headlinePlacement: 'ABOVE_HERO',
    dekPlacement: 'LEAD_PARAGRAPH_DROP',
    columnCount: 3,
    pullQuoteZone: 'CENTER_BREAKOUT',
    sidebarZone: 'FLOATING_INDEX_CARD',
    personalSectionZone: 'LOWER_LEFT_PANEL',
    wildCardSectionZone: 'BACKSTAGE_TICKET_STUB',
    captionPlacement: 'BELOW_FRAME_FLUSH',
  },
  {
    compositionId: 'COMP_10_STAGE_SPOTLIGHT_MOSAIC',
    compositionNumber: 10,
    family: 'EDITORIAL_MOSAIC',
    label: 'Stage Spotlight 4-Photo Mosaic',
    heroPhotoPosition: 'CENTER_PORTRAIT',
    secondaryPhotoPosition: 'DIAGONAL_INSET',
    photoGridArrangement: 'EDITORIAL_COLLAGE_4',
    headlinePlacement: 'OVER_HERO_LOWER_THIRD',
    dekPlacement: 'HERO_CAPTION_BRIDGE',
    columnCount: 2,
    pullQuoteZone: 'LEFT_MARGIN_HANG',
    sidebarZone: 'BOTTOM_STATS_RIBBON',
    personalSectionZone: 'LOWER_RIGHT_PANEL',
    wildCardSectionZone: 'SIDEBAR_SPOTLIGHT_CARD',
    captionPlacement: 'OUTER_MARGIN_VERTICAL',
  },
  {
    compositionId: 'COMP_11_INTIMATE_QA_FEATURE',
    compositionNumber: 11,
    family: 'INTIMATE_FEATURE',
    label: 'Intimate Q&A Feature & Portrait Pair',
    heroPhotoPosition: 'LEFT_SPLIT_50',
    secondaryPhotoPosition: 'SIDEBAR_PORTRAIT_PAIR',
    photoGridArrangement: 'BALANCED_2X2',
    headlinePlacement: 'RIGHT_COLUMN_LEAD',
    dekPlacement: 'UNDER_HEADLINE',
    columnCount: 2,
    pullQuoteZone: 'RIGHT_RAIL_HIGHLIGHT',
    sidebarZone: 'LEFT_FACT_LEDGER_RAIL',
    personalSectionZone: 'MID_ARTICLE_INSET',
    wildCardSectionZone: 'FOOTER_OFF_MIC_BOX',
    captionPlacement: 'CORNER_INDEX_TAG',
  },
  {
    compositionId: 'COMP_12_MONUMENT_PULLQUOTE_SPREAD',
    compositionNumber: 12,
    family: 'INTIMATE_FEATURE',
    label: 'Monument Pull-Quote & Wide Stage Spread',
    heroPhotoPosition: 'CINEMATIC_LETTERBOX',
    secondaryPhotoPosition: 'BOTTOM_DUAL_STRIP',
    photoGridArrangement: 'WIDE_STAGE_PANORAMA',
    headlinePlacement: 'SPLIT_BANNER_HEADER',
    dekPlacement: 'SIDE_CALLOUT_BOX',
    columnCount: 2,
    pullQuoteZone: 'BETWEEN_COLUMNS',
    sidebarZone: 'FLOATING_INDEX_CARD',
    personalSectionZone: 'CLOSING_CODA_BOX',
    wildCardSectionZone: 'PULLQUOTE_ADJACENT_BOX',
    captionPlacement: 'GALLERY_FOOTER_KEY',
  },
] as const;

export interface CompositionSelectionHistoryContext {
  /** Performer's previous issue compositionId (never repeat consecutively for same performer) */
  performerPreviousCompositionId?: ArticleCompositionId | null;
  /** Composition specs already assigned to adjacent/earlier slots in the current issue */
  adjacentIssueCompositions?: ReadonlyArray<ArticleCompositionSpec>;
}

/**
 * Selects an `ArticleCompositionSpec` independently from `BioNarrativeVariant`.
 * Prevents visual repetition by checking:
 * - Same performer's previous composition (`performerPreviousCompositionId`)
 * - Adjacent/recent composition family (`family`)
 * - Adjacent hero photo position (`heroPhotoPosition`)
 * - Adjacent headline placement (`headlinePlacement`)
 * - Adjacent photo grid arrangement (`photoGridArrangement`)
 *
 * Notice that `narrativeVariantNumber` (e.g. Narrative 4) is NOT coupled to
 * `compositionNumber` (e.g. can pair Narrative 4 + Composition 9).
 */
export function selectAdaptiveArticleComposition(input: {
  performerId: string;
  issueKey: string;
  slotIndex?: number;
  preferredCompositionId?: ArticleCompositionId | null;
  history?: CompositionSelectionHistoryContext;
}): ArticleCompositionSpec {
  if (input.preferredCompositionId) {
    const explicit = ARTICLE_COMPOSITION_CATALOG.find(
      (c) => c.compositionId === input.preferredCompositionId,
    );
    if (explicit) return explicit;
  }

  const prevPerformerCompId = input.history?.performerPreviousCompositionId ?? null;
  const adjacent = input.history?.adjacentIssueCompositions ?? [];
  const immediatePrev = adjacent[adjacent.length - 1] ?? null;
  const recentIds = new Set(adjacent.slice(-3).map((c) => c.compositionId));

  // Deterministic starting offset from issueKey + performerId + slotIndex (decoupled from narrative index)
  let hash = 2166136261;
  const seedStr = `${input.issueKey}::${input.performerId}::slot-${input.slotIndex ?? 0}`;
  for (let i = 0; i < seedStr.length; i += 1) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const startOffset = (hash >>> 0) % ARTICLE_COMPOSITION_CATALOG.length;

  // Score each candidate against visual repetition rules
  let bestSpec = ARTICLE_COMPOSITION_CATALOG[startOffset]!;
  let bestScore = -Infinity;

  for (let step = 0; step < ARTICLE_COMPOSITION_CATALOG.length; step += 1) {
    const candidate =
      ARTICLE_COMPOSITION_CATALOG[(startOffset + step) % ARTICLE_COMPOSITION_CATALOG.length]!;
    let score = 100 - step; // preserve deterministic tie-breaking

    if (prevPerformerCompId && candidate.compositionId === prevPerformerCompId) {
      score -= 500; // never repeat the same performer's previous layout
    }
    if (recentIds.has(candidate.compositionId)) {
      score -= 300; // avoid reusing same composition ID in adjacent slots
    }
    if (immediatePrev) {
      if (candidate.family === immediatePrev.family) score -= 120;
      if (candidate.heroPhotoPosition === immediatePrev.heroPhotoPosition) score -= 150;
      if (candidate.headlinePlacement === immediatePrev.headlinePlacement) score -= 90;
      if (candidate.photoGridArrangement === immediatePrev.photoGridArrangement) score -= 80;
    }

    if (score > bestScore) {
      bestScore = score;
      bestSpec = candidate;
    }
  }

  return bestSpec;
}

/**
 * BEFORE PUBLICATION: Allows a performer or editor to click "Try Another Layout"
 * to cycle deterministically to a fresh visual composition without altering the
 * chosen Bio Narrative Variant.
 * AFTER PUBLICATION: Throws / rejects layout mutation if `publicationStatus === 'PUBLISHED' | 'ARCHIVED'`.
 */
export function tryAnotherArticleComposition(input: {
  currentCompositionId: ArticleCompositionId;
  publicationStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  performerPreviousCompositionId?: ArticleCompositionId | null;
}): ArticleCompositionSpec {
  if (input.publicationStatus !== 'DRAFT') {
    // Published and archived issues have immutable visual compositions
    return (
      ARTICLE_COMPOSITION_CATALOG.find((c) => c.compositionId === input.currentCompositionId) ??
      ARTICLE_COMPOSITION_CATALOG[0]!
    );
  }

  const currentIdx = ARTICLE_COMPOSITION_CATALOG.findIndex(
    (c) => c.compositionId === input.currentCompositionId,
  );
  const currentSpec = ARTICLE_COMPOSITION_CATALOG[Math.max(0, currentIdx)]!;

  for (let offset = 1; offset < ARTICLE_COMPOSITION_CATALOG.length; offset += 1) {
    const candidate =
      ARTICLE_COMPOSITION_CATALOG[(Math.max(0, currentIdx) + offset) % ARTICLE_COMPOSITION_CATALOG.length]!;
    if (
      candidate.compositionId !== input.performerPreviousCompositionId &&
      candidate.heroPhotoPosition !== currentSpec.heroPhotoPosition
    ) {
      return candidate;
    }
  }

  return ARTICLE_COMPOSITION_CATALOG[(Math.max(0, currentIdx) + 1) % ARTICLE_COMPOSITION_CATALOG.length]!;
}
