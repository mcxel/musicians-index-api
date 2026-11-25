/**
 * Public Page composition contract (Gate C.2).
 *
 * Persistence-agnostic Visual Composition Document.
 * This is not a Prisma schema, not Page Studio UI, and not a renderer.
 *
 * Lineage (ADR §10), not a second engine:
 * - YoPhoCardDocument, Magazine CompositionEngine, and PublicProfileMediaComposer
 *   stay domain-specific. This module does not migrate them.
 * - PublicProfileConfig.visibleModules stays coarse visibility. It is not this AST.
 * - stylePackId / fontPairingId are presentation identities only.
 *   Acquisition paths (TIER / COIN / PAID) do not live on the document.
 */

import type { FontPairing } from "@/lib/profile/PublicProfileStyleEngine";

/** Current implemented purpose. Others exist so the lineage can extend later. */
export const PUBLIC_PAGE_DOCUMENT_SCHEMA_VERSION = 1 as const;

export const PUBLIC_PAGE_DOCUMENT_PURPOSES = [
  "PUBLIC_PAGE",
  "YOPHO",
  "MAGAZINE_ARTICLE",
] as const;

export type PublicPageDocumentPurpose = (typeof PUBLIC_PAGE_DOCUMENT_PURPOSES)[number];

/**
 * Only PUBLIC_PAGE is validated as a C.2 document.
 * YOPHO and MAGAZINE_ARTICLE are type-level extension points.
 * Their presence here does not mean those runtimes are connected.
 */
export const PUBLIC_PAGE_PURPOSES_RUNTIME_CONNECTED = ["PUBLIC_PAGE"] as const;

export type PublicPageProfileKind = "FAN" | "PERFORMER" | "WRITER_PORTFOLIO";

export type PublicPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type PublicPageSectionKind =
  | "HERO"
  | "IDENTITY"
  | "PRIMARY"
  | "SIDEBAR"
  | "FOOTER_DOCK"
  | "CUSTOM";

export type PublicPageVisibility = "PUBLIC" | "FRIENDS_ONLY" | "OWNER_ONLY" | "HIDDEN";

export type PublicPageCapability = "BASE" | "PERFORMER" | "WRITER";

/**
 * Owner-authored block vocabulary.
 * Guestbook, visitor walls, and arbitrary HTML/JS/CSS are permanently excluded.
 */
export const PUBLIC_PAGE_BLOCK_KINDS = [
  "HERO_BANNER",
  "STATUS_LINE",
  "LONG_FORM_WRITING",
  "POEM",
  "QUOTE",
  "HEADING",
  "PHOTO",
  "PHOTO_GALLERY",
  "TRACK",
  "ALBUM",
  "PLAYLIST",
  "VIDEO_SNIP",
  "NOTE",
  "MEMBER_SPOTLIGHT",
  "YOPHO",
  "LIVE_PRESENCE",
  "EVENT",
  "PUBLIC_ROOM",
  "BOOKING_CTA",
  "MERCH_SHELF",
  "MAGAZINE_FEATURE",
  "SOCIAL_LINKS",
  "QR_SHARE",
  "AVATAR_PRESENTATION",
  "STICKER",
  "FRAME",
  "DIVIDER",
  "SHAPE",
  "BADGE",
  "PATTERN",
  "TEXTURE",
  "SPARKLE",
  "LIGHT",
  "ORNAMENT",
] as const;

export type PublicPageBlockKind = (typeof PUBLIC_PAGE_BLOCK_KINDS)[number];

/** Explicitly rejected. Validators fail these; they are not catalog members. */
export const REJECTED_PUBLIC_PAGE_BLOCK_KINDS = [
  "GUESTBOOK",
  "GUESTBOOK_WALL",
  "VISITOR_WALL",
  "EXTENDED_BIO",
  "EXTENDED_BIO2",
  "CUSTOM_HTML_SANDBOX",
  "CUSTOM_HTML",
  "CUSTOM_CSS",
  "SCRIPT",
] as const;

export const PUBLIC_PAGE_BINDING_AUTHORITIES = [
  "CONTENT",
  "YOPHO_CARD",
  "PLAYLIST",
  "TRACK",
  "LIVE_SESSION",
  "EVENT",
  "PRODUCT",
  "USER",
  "ARTICLE",
  "PUBLIC_ROOM",
] as const;

export type PublicPageBindingAuthority = (typeof PUBLIC_PAGE_BINDING_AUTHORITIES)[number];

export type PublicPageSnapshotPolicy = "LIVE_RESOLVE" | "PINNED_REVISION";

export interface CanonicalBinding {
  authority: PublicPageBindingAuthority;
  /** Stable domain id. Not a copied domain record. */
  recordId: string;
  snapshotPolicy: PublicPageSnapshotPolicy;
  /** Present only when snapshotPolicy is PINNED_REVISION. Opaque label, not a table key. */
  pinnedRevisionLabel?: string;
}

export type PublicPagePlacement = "FLOW" | "MAGNET";

export type PublicPageColumn = "L" | "R" | "FULL";

export interface PublicPageBounds {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  column?: PublicPageColumn;
}

export type PublicPageBackgroundTreatment = "NONE" | "GLASS" | "SOLID" | "GRADIENT";

export type PublicPageSizeScale = "XS" | "SM" | "MD" | "LG" | "XL";

export type PublicPageFontWeight = "REGULAR" | "MEDIUM" | "BOLD";

export const PUBLIC_PAGE_SECTION_LAYOUTS = [
  "FULL",
  "ONE_COLUMN",
  "TWO_COLUMN",
  "THREE_COLUMN",
  "SIDEBAR_LEFT",
  "SIDEBAR_RIGHT",
  "ASYMMETRIC",
  "COLLAGE",
  "GALLERY",
  "CENTER_STAGE",
  "FREEFORM",
  "SPLIT_V_50",
  "SPLIT_V_35_65",
  "SPLIT_V_65_35",
  "SPLIT_H_50",
  "SPLIT_H_35_65",
  "SPLIT_H_65_35",
  "QUAD",
  "HERO_STRIP",
  "MOSAIC",
] as const;

export type PublicPageSectionLayout = (typeof PUBLIC_PAGE_SECTION_LAYOUTS)[number];

/** Minimum size of one scene. FULL_SCREEN is the section, not the page. */
export const PUBLIC_PAGE_SECTION_HEIGHTS = ["AUTO", "COMPACT", "STANDARD", "FULL_SCREEN"] as const;

export type PublicPageSectionHeight = (typeof PUBLIC_PAGE_SECTION_HEIGHTS)[number];

export const PUBLIC_PAGE_MEDIA_SOURCES = [
  "COLOR",
  "GRADIENT",
  "IMAGE",
  "ANIMATED_IMAGE",
  "VIDEO_LOOP",
  "PATTERN",
  "EFFECT",
] as const;

/** Approved repeating wallpapers. The renderer paints only these ids. */
export const PUBLIC_PAGE_PATTERN_IDS = [
  "glitter",
  "starburst",
  "scanlines",
  "cyber_mesh",
  "carbon",
] as const;

export type PublicPagePatternId = (typeof PUBLIC_PAGE_PATTERN_IDS)[number];

export type PublicPageMediaSource = (typeof PUBLIC_PAGE_MEDIA_SOURCES)[number];

export const PUBLIC_PAGE_SECTION_TRANSITIONS = [
  "NONE",
  "FADE",
  "DISSOLVE",
  "WIPE",
  "SLIDE",
  "ZOOM_THROUGH",
  "PARALLAX",
  "LIGHT_SWEEP",
  "GLITCH",
  "FILM_BURN",
] as const;

export type PublicPageSectionTransition = (typeof PUBLIC_PAGE_SECTION_TRANSITIONS)[number];

export const PUBLIC_PAGE_MASKS = [
  "RECTANGLE",
  "ROUNDED",
  "CIRCLE",
  "OVAL",
  "ARCH",
  "HEART",
  "STAR",
  "RECORD",
  "POSTER",
  "POLAROID",
  "SQUARE",
  "PILL",
  "CLOUD",
  "SPEECH_BUBBLE",
  "NOTE",
  "DIAMOND",
  "HEXAGON",
  "BURST",
  "TICKET",
  "TORN_PAPER",
  "FRAME",
  "APPROVED_MASK",
] as const;

export type PublicPageMask = (typeof PUBLIC_PAGE_MASKS)[number];

export const PUBLIC_PAGE_BLENDS = ["NORMAL", "MULTIPLY", "SCREEN", "OVERLAY", "LUMINOSITY"] as const;

export type PublicPageBlend = (typeof PUBLIC_PAGE_BLENDS)[number];

export const PUBLIC_PAGE_DEPTHS = ["BACKGROUND", "MIDGROUND", "FOREGROUND", "OVERLAY"] as const;

export type PublicPageDepth = (typeof PUBLIC_PAGE_DEPTHS)[number];

export const PUBLIC_PAGE_PEOPLE_PRESENTATIONS = [
  "COUNT_4",
  "COUNT_8",
  "COUNT_12",
  "COUNT_16",
  "GRID",
  "ORBIT",
  "POLAROID",
  "CARDS",
  "AVATAR_PODS",
  "MINIMAL",
] as const;

export type PublicPagePeoplePresentation = (typeof PUBLIC_PAGE_PEOPLE_PRESENTATIONS)[number];

export const PUBLIC_PAGE_OPENINGS = [
  "KEEP",
  "COMPACT",
  "RESTYLE",
  "MEDIA",
  "SPLIT",
  "QUAD",
  "FULL_BLEED",
  "SECTION_OPENING",
] as const;

export type PublicPageOpening = (typeof PUBLIC_PAGE_OPENINGS)[number];

export const PUBLIC_PAGE_PERFORMANCE_TIERS = ["LIGHT", "RICH", "CINEMATIC", "SPATIAL"] as const;

export type PublicPagePerformanceTier = (typeof PUBLIC_PAGE_PERFORMANCE_TIERS)[number];

export const PUBLIC_PAGE_ATMOSPHERES = [
  "NONE",
  "GLITTER",
  "SPARKLES",
  "STARS",
  "DUST",
  "HAZE",
  "FOG",
  "RAIN",
  "SNOW",
  "BUBBLES",
  "PETALS",
  "EMBER",
  "LIGHT_SWEEP",
] as const;

export type PublicPageAtmosphere = (typeof PUBLIC_PAGE_ATMOSPHERES)[number];

export const PUBLIC_PAGE_TEXT_REVEALS = [
  "NONE",
  "LINE",
  "WORD",
  "CHARACTER",
  "TYPE_ON",
  "SHIMMER",
  "GLOW",
  "FADE",
  "RISE",
] as const;

export type PublicPageTextReveal = (typeof PUBLIC_PAGE_TEXT_REVEALS)[number];

export const PUBLIC_PAGE_INTERACTIONS = [
  "NONE",
  "FLIP",
  "EXPAND",
  "ROTATE",
  "FAN_OUT",
  "TILT",
  "SPRING",
  "REVEAL",
] as const;

export type PublicPageInteraction = (typeof PUBLIC_PAGE_INTERACTIONS)[number];

export const PUBLIC_PAGE_FITS = ["COVER", "CONTAIN", "ORIGINAL", "CUSTOM", "STRETCH", "TILE", "REPEAT_X", "REPEAT_Y"] as const;

export type PublicPageFit = (typeof PUBLIC_PAGE_FITS)[number];

export const PUBLIC_PAGE_PARALLAX = ["NONE", "SUBTLE", "DEEP"] as const;

export type PublicPageParallax = (typeof PUBLIC_PAGE_PARALLAX)[number];

/**
 * Programmable visual surface. Durable identity is assetAuthority + assetId.
 * deliveryPath is a resolved relative path for this runtime, not ownership.
 */
export interface MediaTile {
  tileId: string;
  source: PublicPageMediaSource;
  assetAuthority?: PublicPageBindingAuthority;
  assetId?: string;
  posterAssetId?: string;
  deliveryPath?: string;
  posterPath?: string;
  colorHex?: string;
  fit?: PublicPageFit;
  /** Percent of the scene box. Used when the picture does not cover the page. */
  frameX?: number;
  frameY?: number;
  frameW?: number;
  frameH?: number;
  focalX?: number;
  focalY?: number;
  opacity?: number;
  overlayHex?: string;
  overlayOpacity?: number;
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  tintHex?: string;
  parallax?: PublicPageParallax;
  loop?: boolean;
  muted?: boolean;
  speed?: number;
  mask?: PublicPageMask;
  blend?: PublicPageBlend;
}

export interface PublicPagePane {
  paneId: string;
  order: number;
  tile?: MediaTile;
  blockIds?: string[];
}

/** Certified presentation primitives. No cssText, custom CSS, HTML, or script. */
export interface BlockStyleTokens {
  opacity?: number;
  blurPx?: number;
  borderWidthPx?: number;
  cornerRadiusPx?: number;
  backgroundTreatment?: PublicPageBackgroundTreatment;
  /** Hex accent or certified token id. Not a CSS declaration. */
  glowAccentRef?: string;
  fontPairingId?: FontPairing;
  sizeScale?: PublicPageSizeScale;
  weight?: PublicPageFontWeight;
  /** Approved skin id (for example tmi-style-classic). Not executable CSS. */
  skinRef?: string;
  align?: "START" | "CENTER" | "END";
  letterSpacingEm?: number;
  lineHeight?: number;
  colorHex?: string;
  outline?: boolean;
  textShadow?: boolean;
  textGlow?: boolean;
  rotationDeg?: number;
  maxWidthCh?: number;
  textReveal?: PublicPageTextReveal;
  mask?: PublicPageMask;
  blend?: PublicPageBlend;
  depth?: PublicPageDepth;
  /** AUTO grows the box with the writing. FIXED keeps the size the owner chose. */
  textFit?: "AUTO" | "FIXED";
  /** How the canonical media sits inside the shape. The file itself is not cropped. */
  mediaFit?: "FILL" | "FIT" | "FREE";
  /** Scale inside the mask. 1 is the starting size. Not a new image file. */
  mediaZoom?: number;
  /** 0–1. Where the picture sits inside the mask. */
  mediaFocalX?: number;
  mediaFocalY?: number;
  /** Turn the picture inside the mask. The mask stays put. */
  mediaRotationDeg?: number;
  mediaFlipX?: boolean;
  mediaFlipY?: boolean;
  /** Decoration around the mask. Removing it does not unclip the picture. */
  framePreset?: "NONE" | "THIN" | "HEAVY" | "NEON" | "POLAROID" | "CARD";
  motionPreset?: string;
  motionIntensity?: number;
  motionSpeed?: number;
  peoplePresentation?: PublicPagePeoplePresentation;
  interaction?: PublicPageInteraction;
}

export type PublicPageSemanticRole =
  | "REGION"
  | "IMG"
  | "ARTICLE"
  | "NOTE"
  | "PRESENTATION"
  | "LINK";

export interface PublicPageA11y {
  /** Required unless semanticRole is PRESENTATION (decorative). */
  label?: string;
  description?: string;
  reduceMotionSafe: boolean;
  semanticRole?: PublicPageSemanticRole;
}

export type PublicPageViewportClass = "DESKTOP" | "TABLET" | "PHONE";

export type PublicPageMobileStrategy = "STACK_PRESERVE_ORDER" | "SECTION_TEMPLATES";

export type PublicPageMagnetCollapse = "FLOW" | "CAROUSEL_WITHIN_SECTION";

/**
 * 390×844 is a physical certification target, not the universal phone size
 * encoded into layout math.
 */
export const PUBLIC_PAGE_PHONE_CERTIFICATION_TARGET = "390x844" as const;

export interface PublicPageResponsiveRules {
  mobileStrategy: PublicPageMobileStrategy;
  magnetCollapse: PublicPageMagnetCollapse;
  viewports: PublicPageViewportClass[];
  phoneCertificationTarget?: typeof PUBLIC_PAGE_PHONE_CERTIFICATION_TARGET;
}

export interface PublicPageTheme {
  accentColorHex: string;
  /** Presentation identity only. Pricing and tier gates stay outside this AST. */
  stylePackId: string;
  animationIntensity: "OFF" | "LOW" | "NORMAL" | "HIGH";
  /** Owned by the versioned document theme (ADR §8). Not a Prisma column. */
  fontPairingId: FontPairing;
  /**
   * MOTTO flickers the status line and quote only.
   * Absent or OFF leaves those words still.
   */
  flickerPlace?: "MOTTO" | "OFF";
  /** Base surface under background media. Exposed when a picture does not cover the page. */
  surfaceColorHex?: string;
  surfaceGradientHex?: string;
}

/** Owner-authored plain text. Not HTML. */
export interface PublicPagePlainText {
  text: string;
}

/** Allowlisted link preview. The id is parsed from the URL. The URL itself is not stored. */
export const PUBLIC_PAGE_LINK_SERVICES = [
  "SPOTIFY",
  "APPLE_MUSIC",
  "PANDORA",
  "YOUTUBE",
  "TMI_PLAYLIST",
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "SNAPCHAT",
  "KICK",
  "TWITCH",
] as const;

export type PublicPageLinkService = (typeof PUBLIC_PAGE_LINK_SERVICES)[number];

export interface PublicPageMediaLink {
  service: PublicPageLinkService;
  externalId?: string;
}

export interface PublicPageBlock {
  id: string;
  kind: PublicPageBlockKind;
  /** MAGNET is placement of this block, not a second content type. */
  placement: PublicPagePlacement;
  bounds: PublicPageBounds;
  style: BlockStyleTokens;
  visibility: PublicPageVisibility;
  a11y: PublicPageA11y;
  bindingRef?: CanonicalBinding;
  plainText?: PublicPagePlainText;
  mediaLink?: PublicPageMediaLink;
}

export interface PublicPageSection {
  sectionId: string;
  kind: PublicPageSectionKind;
  order: number;
  visibility: PublicPageVisibility;
  blocks: PublicPageBlock[];
  /** Absent on certified v1 documents. Renderer stacks those sections in order. */
  layout?: PublicPageSectionLayout;
  panes?: PublicPagePane[];
  /** Picture or color behind this section's words and windows. */
  background?: MediaTile;
  /** Wash or picture in front of this section. Clicks pass through it. */
  overlay?: MediaTile;
  transition?: PublicPageSectionTransition;
  minHeightPx?: number;
  heightMode?: PublicPageSectionHeight;
  paddingPx?: number;
  gapPx?: number;
  hidden?: boolean;
  atmosphere?: PublicPageAtmosphere;
}

export interface PublicPageDocument {
  documentId: string;
  ownerUserId: string;
  schemaVersion: number;
  documentPurpose: PublicPageDocumentPurpose;
  profileKind: PublicPageProfileKind;
  status: PublicPageStatus;
  publishedVersion: number | null;
  /** Opaque draft label. Not a database foreign key. */
  draftRevisionLabel: string | null;
  theme: PublicPageTheme;
  sections: PublicPageSection[];
  responsiveRules: PublicPageResponsiveRules;
  a11y: PublicPageA11y;
  updatedAt: string;
  /** Optional page-wide visual surface. Not a second document. */
  worldBackground?: MediaTile;
  openingPresentation?: PublicPageOpening;
  performanceTier?: PublicPagePerformanceTier;
  atmosphere?: PublicPageAtmosphere;
}

export interface PublicPageBlockCatalogEntry {
  kind: PublicPageBlockKind;
  capability: PublicPageCapability;
  /** Domain-bound blocks must carry CanonicalBinding. Text blocks may use plainText. */
  requiresBinding: boolean;
}

export const PUBLIC_PAGE_BLOCK_CATALOG: readonly PublicPageBlockCatalogEntry[] = [
  { kind: "HERO_BANNER", capability: "BASE", requiresBinding: false },
  { kind: "STATUS_LINE", capability: "BASE", requiresBinding: false },
  { kind: "LONG_FORM_WRITING", capability: "BASE", requiresBinding: false },
  { kind: "POEM", capability: "BASE", requiresBinding: false },
  { kind: "QUOTE", capability: "BASE", requiresBinding: false },
  { kind: "HEADING", capability: "BASE", requiresBinding: false },
  { kind: "PHOTO", capability: "BASE", requiresBinding: true },
  { kind: "PHOTO_GALLERY", capability: "BASE", requiresBinding: true },
  { kind: "TRACK", capability: "BASE", requiresBinding: true },
  { kind: "ALBUM", capability: "PERFORMER", requiresBinding: true },
  { kind: "PLAYLIST", capability: "BASE", requiresBinding: true },
  { kind: "VIDEO_SNIP", capability: "BASE", requiresBinding: true },
  { kind: "NOTE", capability: "BASE", requiresBinding: false },
  { kind: "MEMBER_SPOTLIGHT", capability: "BASE", requiresBinding: true },
  { kind: "YOPHO", capability: "BASE", requiresBinding: true },
  { kind: "LIVE_PRESENCE", capability: "BASE", requiresBinding: true },
  { kind: "EVENT", capability: "PERFORMER", requiresBinding: true },
  { kind: "PUBLIC_ROOM", capability: "BASE", requiresBinding: true },
  { kind: "BOOKING_CTA", capability: "PERFORMER", requiresBinding: true },
  { kind: "MERCH_SHELF", capability: "PERFORMER", requiresBinding: true },
  { kind: "MAGAZINE_FEATURE", capability: "BASE", requiresBinding: true },
  { kind: "SOCIAL_LINKS", capability: "BASE", requiresBinding: false },
  { kind: "QR_SHARE", capability: "BASE", requiresBinding: false },
  { kind: "AVATAR_PRESENTATION", capability: "BASE", requiresBinding: true },
  { kind: "STICKER", capability: "BASE", requiresBinding: false },
  { kind: "FRAME", capability: "BASE", requiresBinding: false },
  { kind: "DIVIDER", capability: "BASE", requiresBinding: false },
  { kind: "SHAPE", capability: "BASE", requiresBinding: false },
  { kind: "BADGE", capability: "BASE", requiresBinding: false },
  { kind: "PATTERN", capability: "BASE", requiresBinding: false },
  { kind: "TEXTURE", capability: "BASE", requiresBinding: false },
  { kind: "SPARKLE", capability: "BASE", requiresBinding: false },
  { kind: "LIGHT", capability: "BASE", requiresBinding: false },
  { kind: "ORNAMENT", capability: "BASE", requiresBinding: false },
];

/**
 * Text primitives a future MAGAZINE_ARTICLE purpose may reuse.
 * Catalog metadata only. Writer Newsroom is not connected in C.2.
 */
export const PUBLIC_PAGE_WRITER_COMPATIBLE_KINDS = [
  "LONG_FORM_WRITING",
  "POEM",
  "QUOTE",
  "HEADING",
] as const;

const CATALOG_BY_KIND: ReadonlyMap<string, PublicPageBlockCatalogEntry> = new Map(
  PUBLIC_PAGE_BLOCK_CATALOG.map((entry) => [entry.kind, entry]),
);

export function getPublicPageBlockCatalogEntry(
  kind: string,
): PublicPageBlockCatalogEntry | undefined {
  return CATALOG_BY_KIND.get(kind);
}

/**
 * Smallest future-migration seam. No stored-version migrations exist in C.2.
 */
export interface PublicPageSchemaMigration {
  fromVersion: number;
  toVersion: number;
}

export const PUBLIC_PAGE_SCHEMA_MIGRATIONS: readonly PublicPageSchemaMigration[] = [];

const BLOCK_KIND_SET: ReadonlySet<string> = new Set(PUBLIC_PAGE_BLOCK_KINDS);

export function isPublicPageBlockKind(kind: string): kind is PublicPageBlockKind {
  return BLOCK_KIND_SET.has(kind);
}
