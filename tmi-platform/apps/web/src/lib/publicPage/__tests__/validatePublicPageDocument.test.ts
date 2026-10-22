/**
 * Gate C.2 — composition contract unit tests.
 * Structural validation only. No Prisma, no renderer, no Page Studio.
 */

import { DEFAULT_PUBLIC_PROFILE_CONFIG } from "@/lib/profile/PublicProfileStyleEngine";
import {
  PUBLIC_PAGE_BINDING_AUTHORITIES,
  PUBLIC_PAGE_BLOCK_CATALOG,
  PUBLIC_PAGE_BLOCK_KINDS,
  PUBLIC_PAGE_SCHEMA_MIGRATIONS,
  PUBLIC_PAGE_WRITER_COMPATIBLE_KINDS,
  REJECTED_PUBLIC_PAGE_BLOCK_KINDS,
} from "@/lib/publicPage/publicPageDocument";
import {
  FIXTURE_CANONICAL_BINDING_PAGE,
  FIXTURE_FREEFORM_MAGNET_PAGE,
  FIXTURE_INVALID_DOCUMENTS,
  FIXTURE_MINIMAL_FAN_PAGE,
  FIXTURE_MINIMAL_PERFORMER_PAGE,
  FIXTURE_RESPONSIVE_PAGE,
  FIXTURE_RICH_MULTIMEDIA_PAGE,
} from "@/lib/publicPage/publicPageFixtures";
import {
  documentHasHeroBlock,
  validatePublicPageDocument,
} from "@/lib/publicPage/validatePublicPageDocument";

function codes(result: ReturnType<typeof validatePublicPageDocument>): string[] {
  return result.ok ? [] : result.issues.map((item) => item.code);
}

describe("Gate C.2 public page composition contract", () => {
  it("validates a minimal one-block page", () => {
    expect(validatePublicPageDocument(FIXTURE_MINIMAL_FAN_PAGE)).toEqual({ ok: true });
    expect(FIXTURE_MINIMAL_FAN_PAGE.sections).toHaveLength(1);
    expect(FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks).toHaveLength(1);
  });

  it("validates a rich repeatable-block page", () => {
    expect(validatePublicPageDocument(FIXTURE_RICH_MULTIMEDIA_PAGE)).toEqual({ ok: true });
  });

  it("allows multiple quote instances", () => {
    const quotes = FIXTURE_RICH_MULTIMEDIA_PAGE.sections[0].blocks.filter((block) => block.kind === "QUOTE");
    expect(quotes.map((block) => block.id)).toEqual(["blk_quote_a", "blk_quote_b"]);
    expect(validatePublicPageDocument(FIXTURE_RICH_MULTIMEDIA_PAGE).ok).toBe(true);
  });

  it("allows multiple song and media blocks", () => {
    const kinds = FIXTURE_RICH_MULTIMEDIA_PAGE.sections[0].blocks.map((block) => block.kind);
    expect(kinds.filter((kind) => kind === "TRACK")).toHaveLength(2);
    expect(kinds).toContain("VIDEO_SNIP");
    expect(kinds).toContain("PHOTO");
  });

  it("rejects duplicate block ids", () => {
    const result = validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.duplicateBlockIds);
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("DUPLICATE_ID");
  });

  it("rejects an invalid canonical authority", () => {
    const result = validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.invalidBindingAuthority);
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("BINDING_AUTHORITY");
  });

  it("rejects an empty canonical record id", () => {
    const result = validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.emptyRecordId);
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("BINDING_RECORD");
  });

  it("rejects an unsupported block kind", () => {
    const result = validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.unsupportedKind);
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("BLOCK_KIND");
  });

  it("rejects an unsafe styling payload", () => {
    const result = validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.unsafeStyle);
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("UNSAFE_PRESENTATION");
  });

  it("accepts valid responsive metadata", () => {
    expect(validatePublicPageDocument(FIXTURE_RESPONSIVE_PAGE)).toEqual({ ok: true });
    expect(FIXTURE_RESPONSIVE_PAGE.responsiveRules.mobileStrategy).toBe("SECTION_TEMPLATES");
    expect(FIXTURE_RESPONSIVE_PAGE.responsiveRules.viewports).toContain("PHONE");
  });

  it("rejects invalid responsive metadata", () => {
    const result = validatePublicPageDocument({
      ...FIXTURE_RESPONSIVE_PAGE,
      responsiveRules: {
        mobileStrategy: "PIXEL_LOCK_390",
        magnetCollapse: "FLOW",
        viewports: ["PHONE"],
      },
    });
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("RESPONSIVE");
  });

  it("represents Hero in the document without PublicProfileConfig persistence", () => {
    expect(documentHasHeroBlock(FIXTURE_RESPONSIVE_PAGE)).toBe(true);
    expect(validatePublicPageDocument(FIXTURE_RESPONSIVE_PAGE).ok).toBe(true);
    expect(DEFAULT_PUBLIC_PROFILE_CONFIG).not.toHaveProperty("sections");
    expect(DEFAULT_PUBLIC_PROFILE_CONFIG).not.toHaveProperty("documentPurpose");
    expect(DEFAULT_PUBLIC_PROFILE_CONFIG.visibleModules).not.toContain("HERO_BANNER");
  });

  it("expresses performer-gated blocks on the same document schema", () => {
    expect(validatePublicPageDocument(FIXTURE_MINIMAL_PERFORMER_PAGE)).toEqual({ ok: true });
    const booking = PUBLIC_PAGE_BLOCK_CATALOG.find((entry) => entry.kind === "BOOKING_CTA");
    const merch = PUBLIC_PAGE_BLOCK_CATALOG.find((entry) => entry.kind === "MERCH_SHELF");
    expect(booking?.capability).toBe("PERFORMER");
    expect(merch?.capability).toBe("PERFORMER");
    expect(FIXTURE_MINIMAL_FAN_PAGE.documentPurpose).toBe(FIXTURE_MINIMAL_PERFORMER_PAGE.documentPurpose);
    expect(PUBLIC_PAGE_WRITER_COMPATIBLE_KINDS).toContain("QUOTE");
  });

  it("does not include a visitor guestbook block", () => {
    expect(PUBLIC_PAGE_BLOCK_KINDS).not.toContain("GUESTBOOK");
    expect(REJECTED_PUBLIC_PAGE_BLOCK_KINDS).toContain("GUESTBOOK");
    const result = validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.guestbook);
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("REJECTED_BLOCK_KIND");
  });

  it("does not include arbitrary HTML, JS, or CSS blocks", () => {
    expect(PUBLIC_PAGE_BLOCK_KINDS).not.toContain("CUSTOM_HTML_SANDBOX");
    expect(PUBLIC_PAGE_BLOCK_KINDS).not.toContain("CUSTOM_CSS");
    expect(PUBLIC_PAGE_BLOCK_KINDS).not.toContain("SCRIPT");
    const result = validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.customHtml);
    expect(codes(result)).toContain("REJECTED_BLOCK_KIND");
  });

  it("preserves simple-page equality", () => {
    const sectionKinds = new Set(FIXTURE_MINIMAL_FAN_PAGE.sections.map((section) => section.kind));
    expect(sectionKinds.has("HERO")).toBe(false);
    expect(sectionKinds.has("SIDEBAR")).toBe(false);
    expect(validatePublicPageDocument(FIXTURE_MINIMAL_FAN_PAGE).ok).toBe(true);
  });

  it("rejects malformed ids, bounds, visibility, and schema version", () => {
    expect(codes(validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.malformedId))).toContain("MALFORMED_ID");
    expect(codes(validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.malformedBounds))).toContain("BOUNDS");
    expect(codes(validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.invalidVisibility))).toContain("VISIBILITY");
    expect(codes(validatePublicPageDocument(FIXTURE_INVALID_DOCUMENTS.invalidSchemaVersion))).toContain("SCHEMA_VERSION");
  });

  it("validates canonical bindings and freeform magnets without a second content type", () => {
    expect(validatePublicPageDocument(FIXTURE_CANONICAL_BINDING_PAGE)).toEqual({ ok: true });
    expect(validatePublicPageDocument(FIXTURE_FREEFORM_MAGNET_PAGE)).toEqual({ ok: true });
    expect(FIXTURE_FREEFORM_MAGNET_PAGE.sections[0].blocks.every((block) => block.placement === "MAGNET")).toBe(true);
    expect(PUBLIC_PAGE_BINDING_AUTHORITIES).toEqual([
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
    ]);
    expect(PUBLIC_PAGE_SCHEMA_MIGRATIONS).toEqual([]);
  });

  it("does not treat YOPHO or MAGAZINE_ARTICLE purposes as runtime-connected", () => {
    const result = validatePublicPageDocument({
      ...FIXTURE_MINIMAL_FAN_PAGE,
      documentPurpose: "MAGAZINE_ARTICLE",
    });
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("DOCUMENT_PURPOSE");
  });
});
