import { instantiateStarter, PUBLIC_PAGE_STARTERS, starterPreviewDocument } from "@/lib/publicPage/publicPageStarterRegistry";

const IDS = ["dense", "cyber", "editorial", "scrapbook", "cinematic", "minimal", "wavetek", "blank"];

describe("public page starter registry", () => {
  it("registers the approved designs and a blank start", () => {
    expect(PUBLIC_PAGE_STARTERS.map((starter) => starter.id)).toEqual(IDS);
  });

  it("clones a sanitized draft that is not the proof account", () => {
    for (const starterId of IDS) {
      const first = instantiateStarter(starterId, {
        ownerUserId: "owner_a",
        profileKind: "FAN",
        documentId: "doc_a",
        now: "2026-09-27T12:00:00.000Z",
      });
      const second = instantiateStarter(starterId, {
        ownerUserId: "owner_b",
        profileKind: "PERFORMER",
        documentId: "doc_b",
        now: "2026-09-27T12:00:00.000Z",
      });
      expect(first.ownerUserId).toBe("owner_a");
      expect(first.documentId).toBe("doc_a");
      expect(first.status).toBe("DRAFT");
      expect(first.publishedVersion).toBeNull();
      const packed = JSON.stringify(first);
      expect(packed).not.toMatch(/wavetek|owner_proof|proof_|\/bot-images\/|bot_image|pp_pass|asset_quad_|asset_loop|asset_poster|track_one|img_wavetek/i);
      const tileIds = packed.match(/"tileId":"[^"]+"/g) ?? [];
      expect(tileIds.join(" ")).not.toMatch(/wavetek|proof|bot_/i);
      expect(first.sections.flatMap((section) => section.blocks).some((block) => block.kind === "PHOTO" || block.kind === "TRACK")).toBe(false);
      first.theme.accentColorHex = "#000000";
      expect(second.ownerUserId).toBe("owner_b");
      expect(second.theme.accentColorHex).not.toBe("#000000");
    }
  });

  it("previews a real photo binding and leaves a page without one unbound", () => {
    const empty = starterPreviewDocument("minimal", {
      ownerUserId: "owner_a",
      profileKind: "FAN",
      documentId: "doc_preview",
      now: "2026-09-27T12:00:00.000Z",
    });
    expect(empty.sections.flatMap((section) => section.blocks).some((block) => block.kind === "PHOTO")).toBe(false);
    const bound = starterPreviewDocument("minimal", {
      ownerUserId: "owner_a",
      profileKind: "FAN",
      documentId: "doc_preview",
      photoRecordId: "img_owner_real",
      now: "2026-09-27T12:00:00.000Z",
    });
    const photo = bound.sections.flatMap((section) => section.blocks).find((block) => block.kind === "PHOTO");
    expect(photo?.bindingRef?.recordId).toBe("img_owner_real");
    const chosen = instantiateStarter("cyber", {
      ownerUserId: "owner_a",
      profileKind: "FAN",
      documentId: "doc_live",
      now: "2026-09-27T12:00:00.000Z",
    });
    expect(chosen.documentId).toBe("doc_live");
    expect(JSON.stringify(chosen)).not.toContain("starter_cyber");
  });
});
