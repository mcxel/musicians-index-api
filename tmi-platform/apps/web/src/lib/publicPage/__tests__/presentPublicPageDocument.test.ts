/**
 * Gate C.3 — one-way render bridge tests.
 * No route render, no Prisma, no persistence.
 */

import { DEFAULT_PUBLIC_PROFILE_CONFIG } from "@/lib/profile/PublicProfileStyleEngine";
import {
  FIXTURE_FREEFORM_MAGNET_PAGE,
  FIXTURE_INVALID_DOCUMENTS,
  FIXTURE_MINIMAL_FAN_PAGE,
  FIXTURE_MINIMAL_PERFORMER_PAGE,
  FIXTURE_RESPONSIVE_PAGE,
  FIXTURE_RICH_MULTIMEDIA_PAGE,
} from "@/lib/publicPage/publicPageFixtures";
import { presentPublicProfile } from "@/lib/publicPage/presentPublicPageDocument";
import type { DocumentPreviewPresentation } from "@/lib/publicPage/presentPublicPageDocument";

function preview(result: ReturnType<typeof presentPublicProfile>): DocumentPreviewPresentation {
  if (!("mode" in result) || result.mode !== "DOCUMENT_PREVIEW") {
    throw new Error("expected document preview");
  }
  return result;
}

describe("Gate C.3 public page render bridge", () => {
  it("keeps legacy profile mode valid without a document", () => {
    const result = presentPublicProfile({ mode: "LEGACY", document: FIXTURE_MINIMAL_FAN_PAGE });
    expect(result).toEqual({
      mode: "LEGACY",
      usesPublicProfileConfig: true,
      documentSynthesized: false,
      entries: [],
    });
  });

  it("admits a valid in-memory PUBLIC_PAGE document", () => {
    const result = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_MINIMAL_FAN_PAGE,
      authorizedCapabilities: ["BASE"],
    }));
    expect(result.documentId).toBe("doc_fan_min");
    expect(result.persisted).toBe(false);
    expect(result.serializedToPublicProfileConfig).toBe(false);
    expect(result.entries).toHaveLength(1);
  });

  it("rejects MAGAZINE_ARTICLE", () => {
    const result = presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: { ...FIXTURE_MINIMAL_FAN_PAGE, documentPurpose: "MAGAZINE_ARTICLE" },
    });
    expect("ok" in result && result.ok).toBe(false);
  });

  it("represents a one-block page", () => {
    const result = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_MINIMAL_FAN_PAGE,
    }));
    expect(result.entries.map((entry) => entry.kind)).toEqual(["POEM"]);
    expect(result.entries[0].plainText).toBe("One poem is a finished page.");
    expect(result.entries[0].textFormat).toBe("PLAIN");
  });

  it("keeps repeatable quotes distinct", () => {
    const result = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_RICH_MULTIMEDIA_PAGE,
    }));
    const quotes = result.entries.filter((entry) => entry.kind === "QUOTE");
    expect(quotes.map((entry) => [entry.blockId, entry.plainText])).toEqual([
      ["blk_quote_a", "First quote."],
      ["blk_quote_b", "Second quote."],
    ]);
  });

  it("keeps multiple tracks distinct and unbound to one soundtrack", () => {
    const result = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_RICH_MULTIMEDIA_PAGE,
    }));
    const tracks = result.entries.filter((entry) => entry.kind === "TRACK");
    expect(tracks.map((entry) => entry.binding?.recordId)).toEqual(["track_1", "track_2"]);
    expect(tracks.every((entry) => entry.disposition === "BINDING_UNRESOLVED")).toBe(true);
    expect(tracks.every((entry) => entry.target !== "ProfileSoundtrackPlayer")).toBe(true);
    expect(result).not.toHaveProperty("soundtrack");
  });

  it("maps HERO_BANNER onto a transient hero view without persistence", () => {
    const result = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_RESPONSIVE_PAGE,
    }));
    const hero = result.entries.find((entry) => entry.kind === "HERO_BANNER");
    expect(hero?.target).toBe("ProfileHeroBanner");
    expect(hero?.heroPresentation?.enabled).toBe(true);
    expect(hero?.heroPresentation?.headline).toBe("Hero lives in the document, not in profile config.");
    expect(hero?.heroPresentation).not.toHaveProperty("imageUrl");
    expect(DEFAULT_PUBLIC_PROFILE_CONFIG.visibleModules).not.toContain("HERO_BANNER");
    expect(result.persisted).toBe(false);
  });

  it("keeps MAGNET as placement metadata", () => {
    const result = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_FREEFORM_MAGNET_PAGE,
    }));
    expect(result.entries.map((entry) => entry.placement)).toEqual(["MAGNET", "MAGNET"]);
    expect(result.entries.map((entry) => entry.kind)).toEqual(["QUOTE", "HEADING"]);
    expect(result.entries[0].bounds).toEqual({ x: 4, y: 8, w: 20, h: 12, z: 2, column: "L" });
    expect(result.entries[0].style).toEqual({ opacity: 0.9, blurPx: 8, cornerRadiusPx: 12, backgroundTreatment: "GLASS" });
    expect(result.entries[0].visibility).toBe("PUBLIC");
    expect(result.entries[0].a11y.label).toBe("Magnet quote");
    expect(result.entries.some((entry) => entry.kind === ("MAGNET" as never))).toBe(false);
  });

  it("carries responsive rules without treating 390x844 as layout geometry", () => {
    const result = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_RESPONSIVE_PAGE,
    }));
    expect(result.responsiveRules).toEqual(FIXTURE_RESPONSIVE_PAGE.responsiveRules);
    expect(result.responsiveRules.phoneCertificationTarget).toBe("390x844");
    expect(result.responsiveRules.mobileStrategy).toBe("SECTION_TEMPLATES");
  });

  it("rejects a malformed document before presentation", () => {
    const result = presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_INVALID_DOCUMENTS.invalidSchemaVersion,
    });
    expect("ok" in result && result.ok).toBe(false);
  });

  it("preserves canonical binding ids without domain copies", () => {
    const result = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_RICH_MULTIMEDIA_PAGE,
      authorizedCapabilities: ["BASE"],
    }));
    const photo = result.entries.find((entry) => entry.blockId === "blk_photo");
    expect(photo?.binding).toEqual({
      authority: "CONTENT",
      recordId: "content_photo_1",
      snapshotPolicy: "PINNED_REVISION",
      pinnedRevisionLabel: "rev-4",
    });
    expect(photo?.disposition).toBe("BINDING_UNRESOLVED");
    expect(JSON.stringify(photo)).not.toMatch(/Obsidian|Ricardo|title/);
  });

  it("does not grant performer capability from block presence", () => {
    const denied = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_MINIMAL_PERFORMER_PAGE,
      authorizedCapabilities: ["BASE"],
    }));
    const booking = denied.entries.find((entry) => entry.kind === "BOOKING_CTA");
    expect(booking?.disposition).toBe("CAPABILITY_DENIED");
    expect(booking?.target).toBeNull();
    expect(denied.profileKind).toBe("PERFORMER");
  });

  it("does not fabricate content for unresolved or unconnected blocks", () => {
    const result = preview(presentPublicProfile({
      mode: "DOCUMENT_PREVIEW",
      document: FIXTURE_RICH_MULTIMEDIA_PAGE,
    }));
    const unresolved = result.entries.filter((entry) => entry.disposition === "BINDING_UNRESOLVED");
    expect(unresolved.length).toBeGreaterThan(0);
    expect(unresolved.every((entry) => entry.fabricated === false)).toBe(true);
    expect(unresolved.every((entry) => entry.plainText === null)).toBe(true);
  });

  it("rejects guestbook, custom html, and unsafe style before presentation", () => {
    for (const doc of [
      FIXTURE_INVALID_DOCUMENTS.guestbook,
      FIXTURE_INVALID_DOCUMENTS.customHtml,
      FIXTURE_INVALID_DOCUMENTS.unsafeStyle,
    ]) {
      const result = presentPublicProfile({ mode: "DOCUMENT_PREVIEW", document: doc });
      expect("ok" in result && result.ok).toBe(false);
    }
  });
});
