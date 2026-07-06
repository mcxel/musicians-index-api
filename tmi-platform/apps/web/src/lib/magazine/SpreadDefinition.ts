/**
 * SpreadDefinition — the canonical unit the Content Composition Engine operates on.
 * Every piece of content that can appear in the magazine flow (an article, a live
 * broadcast wall, an ad, a store slot) registers itself as one of these rather than
 * the platform inventing a new "page type" per feature.
 */

export type SpreadType = "editorial" | "live" | "commercial" | "interactive";

export type SpreadAvailability = "always" | "liveOnly" | "scheduled";

export type SpreadMonetization = "editorial" | "sponsored" | "ad" | "commerce" | "live";

export interface SpreadDefinition {
  id: string;
  type: SpreadType;
  title: string;
  category: string;

  /** Editorial importance, higher sorts earlier within its type bucket. */
  priority: number;

  /** Unix ms timestamp this content was published/went live — drives freshness scoring. */
  freshness: number;

  availability: SpreadAvailability;
  monetization: SpreadMonetization;

  /** Key the renderer resolves to an actual component — the Composition Engine never imports UI. */
  componentKey: string;

  /** What real system this spread came from, e.g. "NewsArticle", "LiveSession", "Ad", "Performer". */
  sourceType: string;

  tags: string[];

  /** Which WorkspaceRole values (or "all") this spread is eligible to show to. */
  roleTargeting: string[];

  estimatedReadTime?: number;
  duration?: number;

  /** Only meaningful for type "live" — whether the underlying session is currently active. */
  isLive?: boolean;

  /** Optional multiplier the Composition Engine applies on top of priority/freshness. */
  weight?: number;
}
