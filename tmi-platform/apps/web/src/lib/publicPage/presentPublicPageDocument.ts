/**
 * Gate C.3 — one-way public-page render bridge.
 *
 * LEGACY authorities and an optional in-memory PublicPageDocument feed a
 * presentation plan for the existing Fan/Performer pages.
 *
 * This module does not render, persist, or write PublicProfileConfig,
 * visibleModules, pinnedItems, or Prisma.
 * It does not resolve Content, Track, User, Event, or Product records.
 */

import type { ProfileHeroConfig } from "@/lib/profile/PublicProfileStyleEngine";
import {
  getPublicPageBlockCatalogEntry,
  type BlockStyleTokens,
  type CanonicalBinding,
  type PublicPageA11y,
  type PublicPageBlock,
  type PublicPageBlockKind,
  type PublicPageCapability,
  type PublicPageDocument,
  type PublicPagePlacement,
  type PublicPageResponsiveRules,
  type PublicPageSection,
  type PublicPageVisibility,
} from "./publicPageDocument";
import { buildCanvasPlan, documentHasComposition, type PublicPageCanvasPlan } from "./publicPageComposition";
import { validatePublicPageDocument } from "./validatePublicPageDocument";

export type PublicProfileBridgeMode = "LEGACY" | "DOCUMENT_PREVIEW";

/**
 * Existing presentation authorities. Names only — this file does not import
 * client components.
 */
export type PublicPagePresentationTarget =
  | "ProfileHeroBanner"
  | "PersonalWritingWall"
  | "PublicProfileMediaComposer"
  | "ProfileMediaPlayerShowcase"
  | "ProfileSoundtrackPlayer"
  | "ArtistIdShareStrip"
  | "BookingCanister"
  | "GroupMemberRoster";

export type BlockPresentationClass =
  | "REUSE_EXISTING_COMPONENT"
  | "ADAPT_EXISTING_COMPONENT"
  | "NO_EXISTING_RENDERER"
  | "CAPABILITY_GATED"
  | "NOT_CONNECTED_THIS_GATE";

export interface BlockPresentationAudit {
  kind: PublicPageBlockKind;
  classification: BlockPresentationClass;
  /** Nearest existing component. Null when none should be mounted. */
  target: PublicPagePresentationTarget | null;
  /** Why C.3 does not invent a rendered experience for this kind. */
  c3Limit: string;
}

export const PUBLIC_PAGE_PRESENTATION_AUDIT: readonly BlockPresentationAudit[] = [
  { kind: "HERO_BANNER", classification: "REUSE_EXISTING_COMPONENT", target: "ProfileHeroBanner", c3Limit: "In-memory hero view only. No image unless a binding is resolved. Not saved." },
  { kind: "STATUS_LINE", classification: "ADAPT_EXISTING_COMPONENT", target: "ProfileHeroBanner", c3Limit: "Banner accepts one thoughtOfTheDay. Bridge keeps every status block distinct." },
  { kind: "LONG_FORM_WRITING", classification: "ADAPT_EXISTING_COMPONENT", target: "PersonalWritingWall", c3Limit: "Pages currently pick one writing via find(). Bridge does not collapse instances." },
  { kind: "POEM", classification: "ADAPT_EXISTING_COMPONENT", target: "PersonalWritingWall", c3Limit: "Same repeatability gap as long writing." },
  { kind: "QUOTE", classification: "ADAPT_EXISTING_COMPONENT", target: "PersonalWritingWall", c3Limit: "Pages currently surface one happy-day quote. Bridge keeps each quote." },
  { kind: "HEADING", classification: "ADAPT_EXISTING_COMPONENT", target: "PersonalWritingWall", c3Limit: "Plain text only. No HTML." },
  { kind: "NOTE", classification: "ADAPT_EXISTING_COMPONENT", target: "PersonalWritingWall", c3Limit: "Plain text only. No HTML." },
  { kind: "PHOTO", classification: "ADAPT_EXISTING_COMPONENT", target: "PublicProfileMediaComposer", c3Limit: "IMAGE block exists. Binding is not resolved here, so no image is invented." },
  { kind: "PHOTO_GALLERY", classification: "ADAPT_EXISTING_COMPONENT", target: "PublicProfileMediaComposer", c3Limit: "GALLERY block exists. No photos invented from an unresolved binding." },
  { kind: "TRACK", classification: "ADAPT_EXISTING_COMPONENT", target: "PublicProfileMediaComposer", c3Limit: "TRACK media type exists. Not folded into ProfileSoundtrackPlayer." },
  { kind: "PLAYLIST", classification: "ADAPT_EXISTING_COMPONENT", target: "PublicProfileMediaComposer", c3Limit: "PLAYLIST media type exists. Record is not fetched." },
  { kind: "VIDEO_SNIP", classification: "ADAPT_EXISTING_COMPONENT", target: "PublicProfileMediaComposer", c3Limit: "SNIP media type exists. No video URL invented." },
  { kind: "YOPHO", classification: "ADAPT_EXISTING_COMPONENT", target: "PublicProfileMediaComposer", c3Limit: "YOPHO media type exists. YoPhoCardDocument is not migrated or fetched." },
  { kind: "LIVE_PRESENCE", classification: "ADAPT_EXISTING_COMPONENT", target: "PublicProfileMediaComposer", c3Limit: "LIVE_PREVIEW exists for a real user live flag. Session binding is not resolved." },
  { kind: "MAGAZINE_FEATURE", classification: "ADAPT_EXISTING_COMPONENT", target: "PublicProfileMediaComposer", c3Limit: "MAGAZINE media type exists. Article record is not resolved." },
  { kind: "ALBUM", classification: "CAPABILITY_GATED", target: "ProfileMediaPlayerShowcase", c3Limit: "Performer capability required. No album record copied into the plan." },
  { kind: "EVENT", classification: "CAPABILITY_GATED", target: null, c3Limit: "Performer capability required. No event list is fabricated." },
  { kind: "BOOKING_CTA", classification: "CAPABILITY_GATED", target: "BookingCanister", c3Limit: "Canister exists off these pages. Declaration does not grant booking rights." },
  { kind: "MERCH_SHELF", classification: "CAPABILITY_GATED", target: "PublicProfileMediaComposer", c3Limit: "MERCH media type exists. Product record is not resolved." },
  { kind: "MEMBER_SPOTLIGHT", classification: "NO_EXISTING_RENDERER", target: "GroupMemberRoster", c3Limit: "Roster is group metadata, not a USER binding. No person is invented." },
  { kind: "PUBLIC_ROOM", classification: "NOT_CONNECTED_THIS_GATE", target: null, c3Limit: "No public-page room card is bound from PUBLIC_ROOM id in C.3." },
  { kind: "SOCIAL_LINKS", classification: "NOT_CONNECTED_THIS_GATE", target: null, c3Limit: "No document link list is rendered. No placeholder links." },
  { kind: "QR_SHARE", classification: "NOT_CONNECTED_THIS_GATE", target: "ArtistIdShareStrip", c3Limit: "Share strip exists for the profile identity, not as a document block renderer." },
  { kind: "AVATAR_PRESENTATION", classification: "NOT_CONNECTED_THIS_GATE", target: null, c3Limit: "Fan avatar image is profile identity, not a resolved USER binding. No avatar is invented." },
];

const AUDIT_BY_KIND = new Map(PUBLIC_PAGE_PRESENTATION_AUDIT.map((row) => [row.kind, row]));

const TEXT_KINDS = new Set<PublicPageBlockKind>([
  "STATUS_LINE",
  "LONG_FORM_WRITING",
  "POEM",
  "QUOTE",
  "HEADING",
  "NOTE",
]);

export type PresentationDisposition =
  | "PRESENTABLE_TEXT"
  | "HERO_PRESENTATION"
  | "BINDING_UNRESOLVED"
  | "CAPABILITY_DENIED"
  | "NOT_CONNECTED"
  | "SUPPRESSED_UNSAFE_TEXT";

/** Runtime presentation support. Block-type existence is not enough. */
export type PresentationSupport =
  | "REUSE_EXISTING"
  | "ADAPT_EXISTING"
  | "CAPABILITY_GATED"
  | "STRUCTURAL_ONLY"
  | "NOT_CONNECTED";

export interface PublicPagePresentationEntry {
  blockId: string;
  kind: PublicPageBlockKind;
  sectionId: string;
  sectionKind: PublicPageSection["kind"];
  sectionOrder: number;
  sectionVisibility: PublicPageVisibility;
  placement: PublicPagePlacement;
  bounds: PublicPageBlock["bounds"];
  visibility: PublicPageVisibility;
  a11y: PublicPageA11y;
  style: BlockStyleTokens;
  capability: PublicPageCapability;
  support: PresentationSupport;
  disposition: PresentationDisposition;
  target: PublicPagePresentationTarget | null;
  /** Owner text kept as text. Never an HTML payload. */
  plainText: string | null;
  textFormat: "PLAIN" | null;
  binding: CanonicalBinding | null;
  /** Parsed link preview. Omitted when the block has no link. */
  mediaLink?: PublicPageBlock["mediaLink"];
  /** Transient view for ProfileHeroBanner. Not a persisted hero. */
  heroPresentation: ProfileHeroConfig | null;
  fabricated: false;
}

export interface LegacyProfilePresentation {
  mode: "LEGACY";
  usesPublicProfileConfig: true;
  documentSynthesized: false;
  entries: [];
}

export interface DocumentPreviewPresentation {
  mode: "DOCUMENT_PREVIEW";
  documentId: string;
  documentPurpose: "PUBLIC_PAGE";
  profileKind: PublicPageDocument["profileKind"];
  /** Caller-supplied rights. Block presence does not add capabilities. */
  authorizedCapabilities: readonly PublicPageCapability[];
  responsiveRules: PublicPageResponsiveRules;
  entries: PublicPagePresentationEntry[];
  serializedToPublicProfileConfig: false;
  persisted: false;
  /** Present only when the document uses the super-site composition fields. */
  canvas?: PublicPageCanvasPlan;
}

export type PublicProfilePresentation = LegacyProfilePresentation | DocumentPreviewPresentation;

export interface PresentPublicProfileInput {
  mode: PublicProfileBridgeMode;
  /** Ignored in LEGACY mode. Validated, never trusted, in DOCUMENT_PREVIEW. */
  document?: unknown;
  authorizedCapabilities?: readonly PublicPageCapability[];
}

const MARKUP_RE = /[<>]|&lt;|&gt;|javascript\s*:|@import\b/i;

function bindingView(binding: CanonicalBinding): CanonicalBinding {
  return {
    authority: binding.authority,
    recordId: binding.recordId,
    snapshotPolicy: binding.snapshotPolicy,
    ...(binding.pinnedRevisionLabel ? { pinnedRevisionLabel: binding.pinnedRevisionLabel } : {}),
  };
}

function heroView(headline: string): ProfileHeroConfig {
  return {
    enabled: true,
    variant: "WIDE_CINEMATIC",
    headline,
    showNowPlaying: false,
    showLiveIndicator: false,
    showBio: false,
  };
}

function supportFor(disposition: PresentationDisposition, auditClass: BlockPresentationClass | undefined): PresentationSupport {
  if (disposition === "CAPABILITY_DENIED" || auditClass === "CAPABILITY_GATED") return "CAPABILITY_GATED";
  if (disposition === "BINDING_UNRESOLVED") return "STRUCTURAL_ONLY";
  if (disposition === "NOT_CONNECTED" || disposition === "SUPPRESSED_UNSAFE_TEXT" || auditClass === "NOT_CONNECTED_THIS_GATE" || auditClass === "NO_EXISTING_RENDERER") {
    return "NOT_CONNECTED";
  }
  if (auditClass === "REUSE_EXISTING_COMPONENT") return "REUSE_EXISTING";
  return "ADAPT_EXISTING";
}

function entryForBlock(
  block: PublicPageBlock,
  section: PublicPageSection,
  authorized: ReadonlySet<PublicPageCapability>,
): PublicPagePresentationEntry {
  const catalog = getPublicPageBlockCatalogEntry(block.kind);
  const audit = AUDIT_BY_KIND.get(block.kind);
  const capability = catalog?.capability ?? "BASE";
  const base: PublicPagePresentationEntry = {
    blockId: block.id,
    kind: block.kind,
    sectionId: section.sectionId,
    sectionKind: section.kind,
    sectionOrder: section.order,
    sectionVisibility: section.visibility,
    placement: block.placement,
    bounds: block.bounds,
    visibility: block.visibility,
    a11y: block.a11y,
    style: block.style,
    capability,
    support: "NOT_CONNECTED",
    disposition: "NOT_CONNECTED",
    target: audit?.target ?? null,
    plainText: null,
    textFormat: null,
    binding: block.bindingRef ? bindingView(block.bindingRef) : null,
    ...(block.mediaLink ? { mediaLink: block.mediaLink } : {}),
    heroPresentation: null,
    fabricated: false,
  };

  if (capability !== "BASE" && !authorized.has(capability)) {
    return {
      ...base,
      disposition: "CAPABILITY_DENIED",
      support: "CAPABILITY_GATED",
      target: null,
      heroPresentation: null,
    };
  }

  const text = block.plainText?.text;
  if (typeof text === "string" && MARKUP_RE.test(text)) {
    return { ...base, disposition: "SUPPRESSED_UNSAFE_TEXT", target: null, plainText: null };
  }

  if (block.kind === "HERO_BANNER") {
    return {
      ...base,
      disposition: "HERO_PRESENTATION",
      support: "REUSE_EXISTING",
      target: "ProfileHeroBanner",
      plainText: text ?? null,
      textFormat: text ? "PLAIN" : null,
      heroPresentation: heroView(text ?? ""),
    };
  }

  if (TEXT_KINDS.has(block.kind)) {
    return {
      ...base,
      disposition: "PRESENTABLE_TEXT",
      support: supportFor("PRESENTABLE_TEXT", audit?.classification),
      plainText: text ?? "",
      textFormat: "PLAIN",
    };
  }

  if (catalog?.requiresBinding || block.bindingRef) {
    return { ...base, disposition: "BINDING_UNRESOLVED", support: "STRUCTURAL_ONLY" };
  }

  return {
    ...base,
    disposition: "NOT_CONNECTED",
    support: "NOT_CONNECTED",
    target: audit?.classification === "NOT_CONNECTED_THIS_GATE" ? null : base.target,
  };
}

export function presentPublicProfile(input: PresentPublicProfileInput): PublicProfilePresentation | { ok: false; issues: { code: string; path: string; message: string }[] } {
  if (input.mode === "LEGACY") {
    return {
      mode: "LEGACY",
      usesPublicProfileConfig: true,
      documentSynthesized: false,
      entries: [],
    };
  }

  const validated = validatePublicPageDocument(input.document);
  if (!validated.ok) return validated;

  const document = input.document as PublicPageDocument;
  if (document.documentPurpose !== "PUBLIC_PAGE") {
    return { ok: false, issues: [{ code: "DOCUMENT_PURPOSE", path: "$.documentPurpose", message: "Only PUBLIC_PAGE can enter the C.3 bridge." }] };
  }
  const authorized = new Set<PublicPageCapability>(input.authorizedCapabilities ?? ["BASE"]);
  const entries: PublicPagePresentationEntry[] = [];
  const sections = [...document.sections].sort((a, b) => a.order - b.order);
  for (const section of sections) {
    for (const block of section.blocks) {
      entries.push(entryForBlock(block, section, authorized));
    }
  }

  return {
    mode: "DOCUMENT_PREVIEW",
    documentId: document.documentId,
    documentPurpose: "PUBLIC_PAGE",
    profileKind: document.profileKind,
    authorizedCapabilities: [...authorized],
    responsiveRules: document.responsiveRules,
    entries,
    serializedToPublicProfileConfig: false,
    persisted: false,
    ...(documentHasComposition(document) ? { canvas: buildCanvasPlan(document) } : {}),
  };
}
