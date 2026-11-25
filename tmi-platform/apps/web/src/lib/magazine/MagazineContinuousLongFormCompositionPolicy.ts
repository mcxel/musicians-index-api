/**
 * MagazineContinuousLongFormCompositionPolicy — §20955–§20977
 *
 * Tall physical magazine canvas + composition sequencing.
 * Extends AdaptiveMagazineCompositionAuthority — NEW_MAGAZINE_ENGINE = NO.
 *
 * Laws:
 * - NO article jump (sheet IS the reading surface)
 * - CONTENT determines length
 * - IMAGE_COUNT ≠ TEMPLATE_ID (many one-image variants)
 * - Distribute images through story (not bottom gallery)
 * - Tall canvas can MIX style languages across movements
 * - Subscription controls media CAPACITY (ArticlePhotoEntitlement), never design quality
 */

import {
  ARTICLE_COMPOSITION_CATALOG,
  selectAdaptiveArticleComposition,
  type ArticleCompositionId,
  type ArticleCompositionSpec,
  type CompositionFamily,
} from "./AdaptiveMagazineCompositionAuthority";
import type { MagazineArticle, ArticleBlock } from "./magazineIssueData";
import { resolveArticlePhotoCapacity } from "./ArticlePhotoEntitlement";
import type { AccountType, SubscriptionTier } from "@/lib/subscriptions/SubscriptionPricingEngine";
import { getPerformerBySlug } from "@/lib/performers/PerformerRegistry";
import { resolveAuthorizedMagazineImageUrl } from "./MagazineImageProvenance";

export const MAGAZINE_CONTINUOUS_LONG_FORM_POLICY_ID =
  "MAGAZINE_CONTINUOUS_LONG_FORM_COMPOSITION_POLICY_v1" as const;

export const NEW_MAGAZINE_ENGINE = false as const;
export const ARTICLE_JUMP_REQUIRED = 0 as const;
export const FULL_ARTICLE_INLINE = true as const;
export const CONTENT_DRIVEN_HEIGHT = true as const;
export const IMAGE_COUNT_IS_NOT_TEMPLATE_ID = true as const;
export const FREE_EQUALS_UGLY = 0 as const;
export const TALL_CANVAS_NOT_A_STYLE = true as const;

export type EditorialMovementKind =
  | "OPENING_HERO"
  | "STORY_COLUMNS"
  | "VISUAL_INTERRUPTION"
  | "PULL_QUOTE"
  | "PHOTO_PAIR_COLLAGE"
  | "TRIANGULAR_CASCADE"
  | "DEEP_COPY"
  | "BIO_CONTEXT"
  | "MEDIA_SPOT"
  | "CLOSING"
  | "CONVERSATION";

export type EditorialArtLanguage =
  | "GIANT_HERO"
  | "SPLIT_LEFT"
  | "SPLIT_RIGHT"
  | "CLASSIC_COLUMNS"
  | "MEMPHIS_POP"
  | "PHOTO_MOSAIC"
  | "MINIMAL"
  | "ASYMMETRIC"
  | "NEWS_EXPOSE"
  | "SCRAPBOOK";

export type DistributedImageRole =
  | "HERO"
  | "SIDE_PORTRAIT"
  | "FULL_WIDTH_INTERRUPT"
  | "DIAGONAL_SUPPORT"
  | "INSET_CAPTION"
  | "CLOSING"
  | "COLLAGE_A"
  | "COLLAGE_B";

export type DistributedImage = {
  url: string;
  caption?: string;
  role: DistributedImageRole;
  scale: "HERO" | "LARGE" | "MEDIUM" | "SMALL";
};

export type EditorialMovementMedia = {
  /** Real Rule 2 media-priority source only — never a fabricated video URL. */
  videoUrl: string;
  posterUrl?: string;
  /** Honest label for what this actually is (2-3s intro clip, not a long interview). */
  kind: "intro_video" | "motion_poster";
  /** Real catalog song (PerformerIdentity.songs[]) — never fabricated. */
  song?: { title: string; audioUrl: string };
};

export type EditorialMovement = {
  id: string;
  kind: EditorialMovementKind;
  artLanguage: EditorialArtLanguage;
  compositionId: ArticleCompositionId;
  family: CompositionFamily;
  blocks: ArticleBlock[];
  images: DistributedImage[];
  colorField: "sunshine" | "cream" | "cyan" | "magenta" | "white" | "jewel" | "quiet";
  media?: EditorialMovementMedia;
};

export type LongFormCompositionPlan = {
  articleSlug: string;
  imageCount: number;
  movements: EditorialMovement[];
  openingComposition: ArticleCompositionSpec;
  spotlightHero: boolean;
  section: "PERFORMER" | "NEWS" | "EDITORIAL";
  entitlementNote: string;
};

function inventoryImages(article: MagazineArticle, heroFallback?: string): Array<{ url: string; caption?: string }> {
  const out: Array<{ url: string; caption?: string }> = [];
  const seen = new Set<string>();
  const push = (url?: string, caption?: string) => {
    if (!url) return;
    const resolved = resolveAuthorizedMagazineImageUrl(url);
    // Stock substitutes are dropped — never invent alternate photography.
    if (resolved.classification === "STOCK_BLOCKED") return;
    if (seen.has(resolved.url)) return;
    seen.add(resolved.url);
    out.push({
      url: resolved.url,
      caption: resolved.needsEditorialReview
        ? caption
          ? `${caption} · Editorial review required`
          : "Editorial photography pending approval"
        : caption,
    });
  };
  for (const b of article.blocks) {
    if (b.type === "image" && b.url) push(b.url, b.text);
  }
  for (const g of article.galleryImages ?? []) push(g.url, g.caption);
  if (heroFallback) push(heroFallback, "Feature photography");
  return out;
}

function rolesForCount(n: number): DistributedImageRole[] {
  if (n <= 0) return [];
  if (n === 1) return ["HERO"];
  if (n === 2) return ["HERO", "CLOSING"];
  if (n === 3) return ["HERO", "SIDE_PORTRAIT", "FULL_WIDTH_INTERRUPT"];
  if (n === 4) return ["HERO", "SIDE_PORTRAIT", "DIAGONAL_SUPPORT", "CLOSING"];
  if (n === 5) return ["HERO", "SIDE_PORTRAIT", "FULL_WIDTH_INTERRUPT", "COLLAGE_A", "CLOSING"];
  return ["HERO", "SIDE_PORTRAIT", "FULL_WIDTH_INTERRUPT", "COLLAGE_A", "COLLAGE_B", "CLOSING"];
}

function scaleForRole(role: DistributedImageRole): DistributedImage["scale"] {
  switch (role) {
    case "HERO":
      return "HERO";
    case "FULL_WIDTH_INTERRUPT":
      return "LARGE";
    case "SIDE_PORTRAIT":
    case "CLOSING":
      return "MEDIUM";
    default:
      return "SMALL";
  }
}

function distributeImages(
  images: Array<{ url: string; caption?: string }>,
): DistributedImage[] {
  const roles = rolesForCount(images.length);
  return images.map((img, i) => {
    const role = roles[Math.min(i, roles.length - 1)]!;
    return { url: img.url, caption: img.caption, role, scale: scaleForRole(role) };
  });
}

/** One-image layout variants — IMAGE_COUNT=1 must not imply one template. */
export const ONE_IMAGE_COMPOSITION_VARIANTS: ArticleCompositionId[] = [
  "COMP_02_SPLIT_LEFT_HERO",
  "COMP_03_SPLIT_RIGHT_HERO",
  "COMP_01_FULL_BLEED_TOP",
  "COMP_07_MAGAZINE_COVER_INSET",
  "COMP_04_CENTER_PORTRAIT_DIPTYCH",
  "COMP_06_WIDE_CINEMATIC_BANNER",
  "COMP_11_INTIMATE_QA_FEATURE",
  "COMP_12_MONUMENT_PULLQUOTE_SPREAD",
];

function pickOneImageVariant(seed: string, preferred?: ArticleCompositionSpec | null): ArticleCompositionSpec {
  if (preferred && ONE_IMAGE_COMPOSITION_VARIANTS.includes(preferred.compositionId)) {
    return preferred;
  }
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const id = ONE_IMAGE_COMPOSITION_VARIANTS[(hash >>> 0) % ONE_IMAGE_COMPOSITION_VARIANTS.length]!;
  return ARTICLE_COMPOSITION_CATALOG.find((c) => c.compositionId === id) ?? ARTICLE_COMPOSITION_CATALOG[0]!;
}

function artForKind(kind: EditorialMovementKind, section: LongFormCompositionPlan["section"]): EditorialArtLanguage {
  if (section === "NEWS") {
    if (kind === "OPENING_HERO") return "NEWS_EXPOSE";
    if (kind === "VISUAL_INTERRUPTION") return "ASYMMETRIC";
    if (kind === "DEEP_COPY") return "CLASSIC_COLUMNS";
    return "MINIMAL";
  }
  switch (kind) {
    case "OPENING_HERO":
      return "GIANT_HERO";
    case "STORY_COLUMNS":
      return "CLASSIC_COLUMNS";
    case "VISUAL_INTERRUPTION":
      return "MEMPHIS_POP";
    case "PHOTO_PAIR_COLLAGE":
    case "TRIANGULAR_CASCADE":
      return "PHOTO_MOSAIC";
    case "PULL_QUOTE":
      return "ASYMMETRIC";
    case "BIO_CONTEXT":
      return "MINIMAL";
    case "MEDIA_SPOT":
      return "MEMPHIS_POP";
    default:
      return "CLASSIC_COLUMNS";
  }
}

function colorForKind(kind: EditorialMovementKind, idx: number): EditorialMovement["colorField"] {
  const cycle: EditorialMovement["colorField"][] = [
    "sunshine",
    "cream",
    "cyan",
    "white",
    "magenta",
    "jewel",
    "quiet",
  ];
  if (kind === "DEEP_COPY" || kind === "BIO_CONTEXT" || kind === "CONVERSATION") return "cream";
  if (kind === "PULL_QUOTE") return "magenta";
  if (kind === "VISUAL_INTERRUPTION") return "cyan";
  return cycle[idx % cycle.length]!;
}

/**
 * Plan continuous tall-sheet movements from real article content.
 * Does not invent images. Does not fabricate copy.
 */
export function planContinuousLongFormComposition(input: {
  article: MagazineArticle;
  heroImageUrl?: string;
  preferredComposition?: ArticleCompositionSpec | null;
  spotlight?: boolean;
  issueKey?: string;
}): LongFormCompositionPlan {
  const article = input.article;
  const section: LongFormCompositionPlan["section"] =
    article.category === "news"
      ? "NEWS"
      : article.performerSlug
        ? "PERFORMER"
        : "EDITORIAL";

  const images = inventoryImages(article, input.heroImageUrl);
  const distributed = distributeImages(images);
  const paragraphs = article.blocks.filter((b) => b.type === "paragraph" || b.type === "heading");
  const quotes = article.blocks.filter((b) => b.type === "pullquote");

  const opening =
    distributed.length <= 1
      ? pickOneImageVariant(`${article.slug}::${input.issueKey ?? "current"}`, input.preferredComposition)
      : input.preferredComposition ??
        selectAdaptiveArticleComposition({
          performerId: article.performerSlug ?? article.slug,
          issueKey: input.issueKey ?? "current",
          slotIndex: 0,
        });

  const spotlightHero = Boolean(input.spotlight) && section === "PERFORMER";
  const movements: EditorialMovement[] = [];

  const heroImg = distributed.filter((d) => d.role === "HERO");
  const sideImg = distributed.filter((d) => d.role === "SIDE_PORTRAIT");
  const interruptImg = distributed.filter((d) => d.role === "FULL_WIDTH_INTERRUPT" || d.role === "DIAGONAL_SUPPORT");
  const collageImg = distributed.filter((d) => d.role === "COLLAGE_A" || d.role === "COLLAGE_B");
  const closingImg = distributed.filter((d) => d.role === "CLOSING" || d.role === "INSET_CAPTION");

  const mid = Math.ceil(paragraphs.length / 2) || 1;
  const firstCopy = paragraphs.slice(0, mid);
  const secondCopy = paragraphs.slice(mid);

  movements.push({
    id: `${article.slug}-m1`,
    kind: "OPENING_HERO",
    artLanguage: spotlightHero ? "GIANT_HERO" : artForKind("OPENING_HERO", section),
    compositionId: opening.compositionId,
    family: opening.family,
    blocks: [],
    images: heroImg.length ? heroImg : distributed.slice(0, 1),
    colorField: section === "NEWS" ? "white" : "sunshine",
  });

  if (firstCopy.length) {
    movements.push({
      id: `${article.slug}-m2`,
      kind: "STORY_COLUMNS",
      artLanguage: opening.heroPhotoPosition === "RIGHT_SPLIT_50" ? "SPLIT_RIGHT" : "SPLIT_LEFT",
      compositionId: opening.compositionId,
      family: opening.family,
      blocks: firstCopy,
      images: sideImg,
      colorField: "cream",
    });
  }

  if (quotes[0]) {
    movements.push({
      id: `${article.slug}-m3`,
      kind: "PULL_QUOTE",
      artLanguage: "ASYMMETRIC",
      compositionId: "COMP_12_MONUMENT_PULLQUOTE_SPREAD",
      family: "INTIMATE_FEATURE",
      blocks: [quotes[0]],
      images: [],
      colorField: "magenta",
    });
  }

  if (interruptImg.length) {
    movements.push({
      id: `${article.slug}-m4`,
      kind: "VISUAL_INTERRUPTION",
      artLanguage: artForKind("VISUAL_INTERRUPTION", section),
      compositionId: "COMP_06_WIDE_CINEMATIC_BANNER",
      family: "CINEMATIC_HERO",
      blocks: [],
      images: interruptImg.slice(0, 1),
      colorField: colorForKind("VISUAL_INTERRUPTION", 3),
    });
  }

  // Real Rule 2 media-priority source only (introVideoUrl → motionPosterUrl).
  // Never a fabricated YouTube/interview embed — MagazineArticle carries no
  // real video field of its own, so this binds to the same canonical
  // performer identity every other real surface (Home 1, profile, discovery)
  // already reads from. Live video is a separate, session-identity-matched
  // concern (§20961) and is intentionally not conflated with this movement.
  if (section === "PERFORMER" && article.performerSlug) {
    const performer = getPerformerBySlug(article.performerSlug);
    const videoUrl = performer?.introVideoUrl ?? performer?.motionPosterUrl ?? null;
    const realSong = performer?.songs?.find((s) => Boolean(s.audioUrl));
    if (videoUrl || realSong) {
      movements.push({
        id: `${article.slug}-media`,
        kind: "MEDIA_SPOT",
        artLanguage: artForKind("MEDIA_SPOT", section),
        compositionId: opening.compositionId,
        family: opening.family,
        blocks: [],
        images: [],
        colorField: "jewel",
        media: videoUrl
          ? {
              videoUrl,
              posterUrl: performer?.motionPosterUrl ?? performer?.profileImageUrl,
              kind: performer?.introVideoUrl ? "intro_video" : "motion_poster",
              song: realSong ? { title: realSong.title, audioUrl: realSong.audioUrl! } : undefined,
            }
          : {
              // Audio-only spot — honest: no real video source, song still real.
              videoUrl: "",
              kind: "motion_poster",
              song: { title: realSong!.title, audioUrl: realSong!.audioUrl! },
            },
      });
    }
  }

  if (secondCopy.length) {
    movements.push({
      id: `${article.slug}-m5`,
      kind: "DEEP_COPY",
      artLanguage: "CLASSIC_COLUMNS",
      compositionId: "COMP_09_TRIPLE_COLUMN_CHRONICLE",
      family: "CHRONICLE_COLUMNS",
      blocks: secondCopy,
      images: [],
      colorField: "quiet",
    });
  }

  if (collageImg.length >= 2) {
    movements.push({
      id: `${article.slug}-m6`,
      kind: "PHOTO_PAIR_COLLAGE",
      artLanguage: "PHOTO_MOSAIC",
      compositionId: "COMP_10_STAGE_SPOTLIGHT_MOSAIC",
      family: "EDITORIAL_MOSAIC",
      blocks: [],
      images: collageImg,
      colorField: "cyan",
    });
  } else if (collageImg.length === 1) {
    movements.push({
      id: `${article.slug}-m6`,
      kind: "TRIANGULAR_CASCADE",
      artLanguage: "ASYMMETRIC",
      compositionId: "COMP_05_ASYMMETRIC_EDITORIAL_GRID",
      family: "EDITORIAL_MOSAIC",
      blocks: [],
      images: collageImg,
      colorField: "jewel",
    });
  }

  if (article.performerSlug || article.groupMembers?.length) {
    movements.push({
      id: `${article.slug}-m7`,
      kind: "BIO_CONTEXT",
      artLanguage: "MINIMAL",
      compositionId: "COMP_11_INTIMATE_QA_FEATURE",
      family: "INTIMATE_FEATURE",
      blocks: [],
      images: closingImg.slice(0, 1),
      colorField: "cream",
    });
  }

  // Real source/attribution only — News articles carry real
  // EditorialSubmission.sourceUrls through getArticleBySlug; never fabricated.
  if (section === "NEWS" && article.sourceUrls?.length) {
    movements.push({
      id: `${article.slug}-sources`,
      kind: "CLOSING",
      artLanguage: "MINIMAL",
      compositionId: opening.compositionId,
      family: opening.family,
      blocks: article.sourceUrls.map((url) => ({ type: "paragraph" as const, text: url })),
      images: [],
      colorField: "white",
    });
  }

  movements.push({
    id: `${article.slug}-m8`,
    kind: "CONVERSATION",
    artLanguage: "MINIMAL",
    compositionId: opening.compositionId,
    family: opening.family,
    blocks: [],
    images: [],
    colorField: "quiet",
  });

  return {
    articleSlug: article.slug,
    imageCount: distributed.length,
    movements,
    openingComposition: opening,
    spotlightHero,
    section,
    entitlementNote:
      "Media capacity from ArticlePhotoEntitlement → SubscriptionEntitlementEngine.imageSlots (FREE=1…DIAMOND=20). Capacity ≠ design quality.",
  };
}

/** Read-only entitlement mirror for audits — does not invent limits. */
export function auditArticlePhotoEntitlementLadder(
  accountType: AccountType = "performer",
): Record<string, number> {
  // Canonical ladder from SubscriptionEntitlementEngine via ArticlePhotoEntitlement — do not invent.
  const tiers: SubscriptionTier[] = [
    "free",
    "pro",
    "RUBY",
    "silver",
    "gold",
    "platinum",
    "diamond",
  ];
  const out: Record<string, number> = {};
  for (const tier of tiers) {
    out[tier] = resolveArticlePhotoCapacity(accountType, tier).maxPhotos;
  }
  return out;
}

export function continuousLongFormBoundaryLocks() {
  return {
    NEW_MAGAZINE_ENGINE,
    ARTICLE_JUMP_REQUIRED,
    FULL_ARTICLE_INLINE,
    CONTENT_DRIVEN_HEIGHT,
    IMAGE_COUNT_IS_NOT_TEMPLATE_ID,
    FREE_EQUALS_UGLY,
    TALL_CANVAS_NOT_A_STYLE,
    CANONICAL_COMPOSITION_AUTHORITY: "AdaptiveMagazineCompositionAuthority",
    CANONICAL_PHOTO_ENTITLEMENT: "ArticlePhotoEntitlement → SubscriptionEntitlementEngine.imageSlots",
    PHOTO_ENTITLEMENT_LADDER: auditArticlePhotoEntitlementLadder("performer"),
    ONE_IMAGE_VARIANT_COUNT: ONE_IMAGE_COMPOSITION_VARIANTS.length,
    OWNER_REVIEW_GATES: {
      FULL_ARTICLE_INLINE: "OWNER_REVIEW",
      ARTICLE_JUMP_REQUIRED: "OWNER_REVIEW",
      MULTI_IMAGE_DISTRIBUTED_THROUGH_ARTICLE: "OWNER_REVIEW",
      ONE_IMAGE_VARIANTS: "OWNER_REVIEW",
      LONG_MOSAIC_FLOW: "OWNER_REVIEW",
      PAGE_PROPORTION: "OWNER_REVIEW",
      COMPOSITION_VARIATION: "OWNER_REVIEW",
      MOBILE_CONTINUOUS_ARTICLE: "OWNER_REVIEW",
    } as const,
  };
}
