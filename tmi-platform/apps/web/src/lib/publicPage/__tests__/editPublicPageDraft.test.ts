/**
 * Gate C.4 — in-memory draft preview. No route render, no Prisma.
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
import { editDraftPlainText, previewDraftDocument } from "@/lib/publicPage/editPublicPageDraft";

describe("Gate C.4 in-memory draft preview", () => {
  it("stays on the legacy path when no document is supplied", () => {
    expect(previewDraftDocument(null)).toEqual({ mode: "LEGACY" });
    expect(previewDraftDocument(undefined)).toEqual({ mode: "LEGACY" });
  });

  it("keeps two quotes as two rows", () => {
    const preview = previewDraftDocument(FIXTURE_RICH_MULTIMEDIA_PAGE);
    expect(preview.mode).toBe("DOCUMENT_PREVIEW");
    if (preview.mode !== "DOCUMENT_PREVIEW") return;
    const quotes = preview.textBlocks.filter((row) => row.kind === "QUOTE");
    expect(quotes.map((row) => row.text)).toEqual(["First quote.", "Second quote."]);
  });

  it("keeps two tracks out of the soundtrack field", () => {
    const preview = previewDraftDocument(FIXTURE_RICH_MULTIMEDIA_PAGE);
    if (preview.mode !== "DOCUMENT_PREVIEW") throw new Error("expected preview");
    expect(preview.trackBlocks.map((row) => row.recordId)).toEqual(["track_1", "track_2"]);
    expect(preview.trackBlocks.every((row) => row.collapsedIntoSoundtrack === false)).toBe(true);
    expect(preview).not.toHaveProperty("soundtrack");
  });

  it("treats one poem as a complete page", () => {
    const preview = previewDraftDocument(FIXTURE_MINIMAL_FAN_PAGE);
    if (preview.mode !== "DOCUMENT_PREVIEW") throw new Error("expected preview");
    expect(preview.textBlocks).toEqual([
      { blockId: "blk_poem", kind: "POEM", text: "One poem is a finished page." },
    ]);
  });

  it("previews a hero without writing PublicProfileConfig", () => {
    const preview = previewDraftDocument(FIXTURE_RESPONSIVE_PAGE);
    if (preview.mode !== "DOCUMENT_PREVIEW") throw new Error("expected preview");
    expect(preview.hero?.persisted).toBe(false);
    expect(preview.hero?.headline).toContain("Hero lives in the document");
    expect(preview.serializedToPublicProfileConfig).toBe(false);
    expect(DEFAULT_PUBLIC_PROFILE_CONFIG).not.toHaveProperty("sections");
  });

  it("exposes magnet bounds as read-only placement", () => {
    const preview = previewDraftDocument(FIXTURE_FREEFORM_MAGNET_PAGE);
    if (preview.mode !== "DOCUMENT_PREVIEW") throw new Error("expected preview");
    expect(preview.magnets[0].editable).toBe(false);
    expect(preview.magnets[0].bounds).toEqual({ x: 4, y: 8, w: 20, h: 12, z: 2 });
  });

  it("rejects an invalid draft and a magazine purpose", () => {
    expect(previewDraftDocument(FIXTURE_INVALID_DOCUMENTS.guestbook).mode).toBe("REJECTED");
    expect(previewDraftDocument({
      ...FIXTURE_MINIMAL_FAN_PAGE,
      documentPurpose: "MAGAZINE_ARTICLE",
    }).mode).toBe("REJECTED");
  });

  it("edits one quote in memory without touching the other", () => {
    const next = editDraftPlainText(FIXTURE_RICH_MULTIMEDIA_PAGE, "blk_quote_a", "Edited quote.");
    const preview = previewDraftDocument(next);
    if (preview.mode !== "DOCUMENT_PREVIEW") throw new Error("expected preview");
    const quotes = preview.textBlocks.filter((row) => row.kind === "QUOTE");
    expect(quotes.map((row) => row.text)).toEqual(["Edited quote.", "Second quote."]);
    expect(FIXTURE_RICH_MULTIMEDIA_PAGE.sections[0].blocks[0].plainText?.text).toBe("First quote.");
  });

  it("does not grant booking from a performer block on a base capability", () => {
    const preview = previewDraftDocument(FIXTURE_MINIMAL_PERFORMER_PAGE, ["BASE"]);
    if (preview.mode !== "DOCUMENT_PREVIEW") throw new Error("expected preview");
    expect(preview.capabilityDenied).toContain("blk_booking");
  });
});
