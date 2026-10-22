/**
 * C.8 /p/[username] dual-read proofs.
 * Pure hydration only. Does not call getPrismaClient or the live route.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FIXTURE_FREEFORM_MAGNET_PAGE,
  FIXTURE_MINIMAL_FAN_PAGE,
  FIXTURE_MINIMAL_PERFORMER_PAGE,
  FIXTURE_RESPONSIVE_PAGE,
  FIXTURE_RICH_MULTIMEDIA_PAGE,
} from "../publicPageFixtures";
import type { PublicPageDocument } from "../publicPageDocument";
import type { PublicPageLegacyFallback, PublicPagePublishedView } from "../publicPagePersistence";
import { hydrateVisitorPublishedPage } from "../publicPageRouteHydration";

function published(document: PublicPageDocument, revisionNumber = 2): PublicPagePublishedView {
  return {
    ok: true,
    mode: "PUBLISHED",
    ownerUserId: document.ownerUserId,
    profileKind: document.profileKind,
    revisionId: "rev_published",
    revisionNumber,
    document,
    touchesPublicProfileConfig: false,
    databaseCascadePhysicallyTested: false,
  };
}

const LEGACY: PublicPageLegacyFallback = {
  ok: true,
  mode: "LEGACY_FALLBACK",
  ownerUserId: "user_legacy",
  profileKind: "FAN",
  touchesPublicProfileConfig: false,
  databaseCascadePhysicallyTested: false,
};

function texts(document: PublicPageDocument | undefined) {
  if (!document) return [];
  return document.sections.flatMap((section) =>
    section.blocks.filter((block) => block.plainText).map((block) => block.plainText?.text ?? ""),
  );
}

describe("C.8 visitor dual-read hydration", () => {
  it("1 legacy user with no public page document stays on the legacy path", () => {
    const result = hydrateVisitorPublishedPage({ published: LEGACY, role: "FAN" });
    expect(result.mode).toBe("LEGACY");
    expect(result.publishedPresentation).toBeNull();
    expect(result.presentation.mode).toBe("LEGACY");
    if (result.presentation.mode === "LEGACY") {
      expect(result.presentation.usesPublicProfileConfig).toBe(true);
      expect(result.presentation.documentSynthesized).toBe(false);
    }
  });

  it("2 published document is presented to the visitor", () => {
    const result = hydrateVisitorPublishedPage({
      published: published(FIXTURE_MINIMAL_FAN_PAGE),
      role: "FAN",
    });
    expect(result.mode).toBe("DOCUMENT");
    expect(result.publishedPresentation?.mode).toBe("DOCUMENT_PREVIEW");
    expect(texts(result.publishedPresentation ? FIXTURE_MINIMAL_FAN_PAGE : undefined)).toContain(
      "One poem is a finished page.",
    );
    expect(result.publishedPresentation?.entries.some((entry) => entry.plainText === "One poem is a finished page.")).toBe(true);
  });

  it("3 a private draft alone does not change the visitor page", () => {
    const result = hydrateVisitorPublishedPage({
      published: LEGACY,
      role: "FAN",
      ownerDraft: FIXTURE_MINIMAL_FAN_PAGE,
    });
    expect(result.mode).toBe("LEGACY");
    expect(result.publishedPresentation).toBeNull();
    expect(JSON.stringify(result)).not.toContain("One poem is a finished page.");
  });

  it("4 a newer draft does not replace the published revision", () => {
    const newerDraft: PublicPageDocument = {
      ...FIXTURE_MINIMAL_FAN_PAGE,
      documentId: "doc_newer_draft",
      sections: FIXTURE_MINIMAL_FAN_PAGE.sections.map((section) => ({
        ...section,
        blocks: section.blocks.map((block) =>
          block.plainText ? { ...block, plainText: { text: "Unpublished draft only." } } : block,
        ),
      })),
    };
    const result = hydrateVisitorPublishedPage({
      published: published(FIXTURE_MINIMAL_FAN_PAGE, 2),
      role: "FAN",
      ownerDraft: newerDraft,
    });
    expect(result.mode).toBe("DOCUMENT");
    expect(result.publishedPresentation?.entries.some((entry) => entry.plainText === "One poem is a finished page.")).toBe(true);
    expect(result.publishedPresentation?.entries.some((entry) => entry.plainText === "Unpublished draft only.")).toBe(false);
  });

  it("5 and 6 repeatable quotes and tracks survive hydration", () => {
    const result = hydrateVisitorPublishedPage({
      published: published(FIXTURE_RICH_MULTIMEDIA_PAGE),
      role: "FAN",
    });
    const quotes = result.publishedPresentation?.entries.filter((entry) => entry.kind === "QUOTE") ?? [];
    const tracks = result.publishedPresentation?.entries.filter((entry) => entry.kind === "TRACK") ?? [];
    expect(quotes.map((entry) => entry.plainText)).toEqual(["First quote.", "Second quote."]);
    expect(tracks.map((entry) => entry.binding?.recordId)).toEqual(["track_1", "track_2"]);
    expect(tracks.every((entry) => entry.binding?.authority === "TRACK")).toBe(true);
  });

  it("7 hero comes from the document", () => {
    const result = hydrateVisitorPublishedPage({
      published: published(FIXTURE_RESPONSIVE_PAGE),
      role: "FAN",
    });
    const hero = result.publishedPresentation?.entries.find((entry) => entry.disposition === "HERO_PRESENTATION");
    expect(hero?.heroPresentation?.headline).toBe("Hero lives in the document, not in profile config.");
  });

  it("8 magnet bounds round-trip", () => {
    const result = hydrateVisitorPublishedPage({
      published: published(FIXTURE_FREEFORM_MAGNET_PAGE),
      role: "FAN",
    });
    const magnet = result.publishedPresentation?.entries.find((entry) => entry.blockId === "blk_magnet_a");
    expect(magnet?.placement).toBe("MAGNET");
    expect(magnet?.bounds).toMatchObject({ x: 4, y: 8, w: 20, h: 12, z: 2 });
  });

  it("9 performer capability renders booking only for an authorized performer role", () => {
    const fan = hydrateVisitorPublishedPage({
      published: published(FIXTURE_MINIMAL_PERFORMER_PAGE),
      role: "FAN",
    });
    const performer = hydrateVisitorPublishedPage({
      published: published(FIXTURE_MINIMAL_PERFORMER_PAGE),
      role: "PERFORMER",
    });
    expect(fan.publishedPresentation?.entries.find((entry) => entry.kind === "BOOKING_CTA")?.disposition).toBe(
      "CAPABILITY_DENIED",
    );
    expect(performer.publishedPresentation?.entries.find((entry) => entry.kind === "BOOKING_CTA")?.disposition).not.toBe(
      "CAPABILITY_DENIED",
    );
  });

  it("10 a base account cannot acquire performer capability from the document", () => {
    const result = hydrateVisitorPublishedPage({
      published: published(FIXTURE_MINIMAL_PERFORMER_PAGE),
      role: "FAN",
    });
    expect(result.publishedPresentation?.authorizedCapabilities).toEqual(["BASE"]);
    expect(result.publishedPresentation?.authorizedCapabilities).not.toContain("PERFORMER");
  });

  it("14 document mode does not write config or content", () => {
    const result = hydrateVisitorPublishedPage({
      published: published(FIXTURE_MINIMAL_FAN_PAGE),
      role: "FAN",
    });
    expect(result.touchesPublicProfileConfig).toBe(false);
    expect(result.touchesContent).toBe(false);
  });

  it("15 the same published input hydrates the same page twice", () => {
    const first = hydrateVisitorPublishedPage({ published: published(FIXTURE_RICH_MULTIMEDIA_PAGE), role: "FAN" });
    const second = hydrateVisitorPublishedPage({ published: published(FIXTURE_RICH_MULTIMEDIA_PAGE), role: "FAN" });
    expect(second).toEqual(first);
  });

  it("11 12 13 and 16 page source preserves legacy, privacy, and the canonical route", () => {
    const page = readFileSync(join(__dirname, "../../../app/p/[username]/page.tsx"), "utf8");
    const reader = readFileSync(join(__dirname, "../publicPageRouteRead.ts"), "utf8");
    const hydration = readFileSync(join(__dirname, "../publicPageRouteHydration.ts"), "utf8");
    const view = readFileSync(join(__dirname, "../../../components/profile/PublicPagePublishedView.tsx"), "utf8");
    expect(page).toMatch(/if \(!dbUser\) \{\s*notFound\(\);/);
    expect(page).toMatch(/profileVisibility !== "public"/);
    expect(page).toMatch(/status: "blocked"/);
    expect(page).toMatch(/getPublicProfileConfig/);
    expect(page).toMatch(/soundtrack: DEFAULT_PUBLIC_PROFILE_CONFIG\.soundtrack/);
    expect(page).toMatch(/canonicalPublicPath/);
    expect(page).toMatch(/readVisitorPublishedPresentation/);
    expect(page).not.toMatch(/draftDocument=/);
    for (const source of [page, reader, hydration, view]) {
      expect(source).not.toMatch(/saveProfileConfig\s*\(/);
      expect(source).not.toMatch(/prisma\.content/);
      expect(source).not.toMatch(/contentRevision\.(create|update|delete|upsert)/);
    }
    expect(view).not.toMatch(/<textarea/);
    expect(reader).toMatch(/visitorMayRead: true/);
    expect(reader).toMatch(/catch \{/);
  });
});
