import { FIXTURE_MINIMAL_FAN_PAGE } from "../publicPageFixtures";
import {
  addSection,
  buildCanvasPlan,
  isSafeDeliveryPath,
  deleteSection,
  documentHasComposition,
  getPublicPageEffect,
  governPlayback,
  addPageLink,
  applyBrightStart,
  parsePageLink,
  previewEmbed,
  reshapePreview,
  resizePreview,
  sceneBackground,
  setAccentColor,
  setWritingColor,
  setWritingFlicker,
  moveSection,
  proposeSupercharge,
  imageTile,
  moveBackground,
  presentBackground,
  scaleBackground,
  setPageSurface,
  setWorldBackground,
  videoLoopTile,
  washTile,
} from "../publicPageComposition";
import { recordEdit, sessionFromDraft, setBlockEffect, undoEdit } from "../pageStudio";
import { assertProofFixturesValid, publicPageProofFixtures } from "../publicPageProofFixtures";
import { PUBLIC_PAGE_LINK_SERVICES } from "../publicPageDocument";
import { validatePublicPageDocument } from "../validatePublicPageDocument";
import { presentPublicProfile } from "../presentPublicPageDocument";

describe("public page super-site composition", () => {
  it("keeps a certified v1 document valid without composition fields", () => {
    expect(documentHasComposition(FIXTURE_MINIMAL_FAN_PAGE)).toBe(false);
    expect(validatePublicPageDocument(FIXTURE_MINIMAL_FAN_PAGE).ok).toBe(true);
  });

  it("grows by sections and can return to one section", () => {
    let document = FIXTURE_MINIMAL_FAN_PAGE;
    for (let n = 0; n < 5; n += 1) document = addSection(document, "FULL");
    expect(document.sections).toHaveLength(6);
    expect(validatePublicPageDocument(document).ok).toBe(true);
    const extra = document.sections[document.sections.length - 1].sectionId;
    document = deleteSection(document, extra);
    expect(document.sections).toHaveLength(5);
    expect(deleteSection({ ...document, sections: [document.sections[0]] }, document.sections[0].sectionId).sections).toHaveLength(1);
  });

  it("reorders sections without dropping blocks", () => {
    const document = addSection(FIXTURE_MINIMAL_FAN_PAGE, "QUAD");
    const first = document.sections[0].sectionId;
    const moved = moveSection(document, first, 1);
    expect(moved.sections.map((section) => section.sectionId)[1]).toBe(first);
    expect(moved.sections[0].order).toBe(0);
  });

  it("rejects an audible background loop and an unknown effect", () => {
    const loud = videoLoopTile("tile_loud", "asset_loop", "asset_poster");
    const document = { ...FIXTURE_MINIMAL_FAN_PAGE, worldBackground: { ...loud, muted: false } };
    const result = validatePublicPageDocument(document);
    expect(result.ok).toBe(false);
    const badMotion = {
      ...FIXTURE_MINIMAL_FAN_PAGE,
      sections: FIXTURE_MINIMAL_FAN_PAGE.sections.map((section) => ({
        ...section,
        blocks: section.blocks.map((block) => ({ ...block, style: { ...block.style, motionPreset: "not_an_effect" } })),
      })),
    };
    expect(validatePublicPageDocument(badMotion).ok).toBe(false);
    expect(getPublicPageEffect("fade")?.reducedMotionBehavior).toBe("STATIC_FALLBACK");
    expect(getPublicPageEffect("flicker")?.reducedMotionBehavior).toBe("STATIC_FALLBACK");
  });

  it("lets an owner pick colors and turn neon flicker on without inventing words", () => {
    const before = FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks[0].plainText?.text;
    const colored = setWritingColor(setAccentColor(FIXTURE_MINIMAL_FAN_PAGE, "#ff2daa"), "#00ffff");
    expect(colored.theme.accentColorHex).toBe("#ff2daa");
    expect(colored.sections[0].blocks[0].style.colorHex).toBe("#00ffff");
    expect(colored.sections[0].blocks[0].plainText?.text).toBe(before);
    expect(setAccentColor(FIXTURE_MINIMAL_FAN_PAGE, "red")).toBe(FIXTURE_MINIMAL_FAN_PAGE);
    const flickering = setWritingFlicker(colored, true);
    expect(flickering.sections[0].blocks[0].style.motionPreset).toBe("flicker");
    expect(validatePublicPageDocument(flickering).ok).toBe(true);
    expect(setWritingFlicker(flickering, false).sections[0].blocks[0].style.motionPreset).toBeUndefined();
  });

  it("stacks a split on the phone plan while keeping desktop layout", () => {
    const document = addSection(setLayout(FIXTURE_MINIMAL_FAN_PAGE), "SPLIT_V_50");
    const plan = buildCanvasPlan(document);
    expect(plan.sections.some((section) => section.layout === "SPLIT_V_50")).toBe(true);
    expect(plan.sections[0].panes[0].blockIds.length).toBeGreaterThan(0);
  });

  it("pauses offscreen and reduced-motion video", () => {
    expect(governPlayback({ tier: "CINEMATIC", inView: false, reducedMotion: false, activeLoops: 0, source: "VIDEO_LOOP" }).decode).toBe(false);
    expect(governPlayback({ tier: "CINEMATIC", inView: true, reducedMotion: true, activeLoops: 0, source: "VIDEO_LOOP" }).usePoster).toBe(true);
    expect(governPlayback({ tier: "LIGHT", inView: true, reducedMotion: false, activeLoops: 0, source: "VIDEO_LOOP" }).decode).toBe(false);
    expect(governPlayback({ tier: "CINEMATIC", inView: true, reducedMotion: false, activeLoops: 0, source: "VIDEO_LOOP" }).decode).toBe(true);
  });

  it("proposes a supercharge without saving or inventing text", () => {
    const proposal = proposeSupercharge(FIXTURE_MINIMAL_FAN_PAGE);
    expect(proposal).not.toBeNull();
    expect(proposal?.openingPresentation).toBe("COMPACT");
    const before = FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks[0].plainText?.text;
    expect(proposal?.sections[0].blocks[0].plainText?.text).toBe(before);
  });

  it("undoes a section add inside editor state", () => {
    const session = sessionFromDraft(FIXTURE_MINIMAL_FAN_PAGE, 1, ["BASE"]);
    const edited = recordEdit(session, addSection(session.document, "FULL"));
    expect(edited.document.sections).toHaveLength(2);
    expect(edited.phase).toBe("UNSAVED");
    expect(undoEdit(edited).document.sections).toHaveLength(1);
  });

  it("renders six different proof fixtures from one validator", () => {
    expect(assertProofFixturesValid()).toEqual([]);
    const pages = publicPageProofFixtures();
    expect(new Set(pages.map((page) => page.theme.stylePackId)).size).toBeGreaterThanOrEqual(6);
    const layouts = new Set(pages.flatMap((page) => page.sections.map((section) => section.layout ?? "NONE")));
    expect(layouts.size).toBeGreaterThan(3);
    const cyber = pages.find((page) => page.documentId === "proof_cyber");
    const presented = presentPublicProfile({ mode: "DOCUMENT_PREVIEW", document: cyber, authorizedCapabilities: ["BASE"] });
    if (!("canvas" in presented)) throw new Error("missing canvas");
    expect(presented.canvas?.world?.source).toBe("VIDEO_LOOP");
    expect(presented.canvas?.world?.muted).not.toBe(false);
    expect(isSafeDeliveryPath("/bot-images/Bot image 1.png")).toBe(true);
    const bot = pages.find((page) => page.documentId === "proof_bot_wavetek");
    expect(bot?.worldBackground?.deliveryPath).toBe("/bot-images/Bot image 1.png");
    expect(bot?.theme.flickerPlace).toBe("MOTTO");
    expect(bot?.sections.find((section) => section.sectionId === "sec_about")?.background?.deliveryPath).toBe("/bot-images/Bot image 2.png");
    expect(bot?.sections.length).toBeGreaterThanOrEqual(5);
    expect(bot?.sections.find((section) => section.sectionId === "sec_primary")?.background?.deliveryPath).toBe("/bot-images/Bot image 1.png");
    expect(bot?.sections.find((section) => section.sectionId === "sec_listen")?.background?.deliveryPath).toBe("/bot-images/Bot image 3.png");
    expect(bot?.sections.find((section) => section.background?.tileId === "tile_scene_close")?.background?.colorHex).toBe("#f4f1ff");
    expect(sceneBackground(null, 0, bot?.worldBackground ?? null)?.tileId).toBe("tile_wavetek_world");
    expect(sceneBackground(null, 1, bot?.worldBackground ?? null)).toBeNull();
    expect(bot?.sections.find((section) => section.sectionId === "sec_primary")?.overlay?.colorHex).toBe("#FF2DAA");
    const gallery = bot?.sections.find((section) => section.layout === "QUAD");
    expect(gallery?.panes?.map((pane) => pane.tile?.deliveryPath)).toEqual([
      "/bot-images/Bot image 1.png",
      "/bot-images/Bot image 2.png",
      "/bot-images/Bot image 3.png",
      "/bot-images/Bot image 4.png",
    ]);
    const botView = presentPublicProfile({ mode: "DOCUMENT_PREVIEW", document: bot, authorizedCapabilities: ["BASE"] });
    if (!("canvas" in botView)) throw new Error("missing canvas");
    expect(botView.canvas?.world?.deliveryPath).toBe("/bot-images/Bot image 1.png");
    expect(botView.canvas?.sections.find((section) => section.sectionId === "sec_primary")?.overlay?.source).toBe("COLOR");
  });

  it("starts in the bright arrangement and flickers only the motto", () => {
    const started = applyBrightStart(FIXTURE_MINIMAL_FAN_PAGE);
    expect(validatePublicPageDocument(started).ok).toBe(true);
    expect(started.theme.flickerPlace).toBe("MOTTO");
    expect(started.sections.length).toBeGreaterThan(3);
    expect(started.sections[0].layout).toBe("SIDEBAR_LEFT");
    const poem = started.sections.flatMap((section) => section.blocks).find((block) => block.kind === "POEM");
    expect(poem?.plainText?.text).toBe("One poem is a finished page.");
    expect(poem?.style.motionPreset).toBeUndefined();
    const motto = started.sections.flatMap((section) => section.blocks).find((block) => block.kind === "STATUS_LINE");
    expect(motto?.style.motionPreset).toBeUndefined();
    const again = applyBrightStart(started);
    const headings = again.sections.flatMap((section) => section.blocks).filter((block) => block.plainText?.text === "About");
    expect(headings).toHaveLength(1);
  });

  it("turns an allowlisted URL into a preview window that can change size and shape", () => {
    expect(parsePageLink("https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh")?.externalId).toBe("track/4iV5W9uYEdYUVa79Axb7Rh");
    expect(parsePageLink("https://youtu.be/abcdefghijk")?.service).toBe("YOUTUBE");
    expect(parsePageLink("https://music.apple.com/us/album/night/123")?.service).toBe("APPLE_MUSIC");
    expect(parsePageLink("https://www.pandora.com/artist/example")?.service).toBe("PANDORA");
    expect(parsePageLink("https://themusiciansindex.com/playlist/night-drive")?.externalId).toBe("night-drive");
    expect(parsePageLink("https://www.instagram.com/nasa/")?.service).toBe("INSTAGRAM");
    expect(parsePageLink("https://www.facebook.com/nasa")?.service).toBe("FACEBOOK");
    expect(parsePageLink("https://www.tiktok.com/@nasa")?.service).toBe("TIKTOK");
    expect(parsePageLink("https://www.snapchat.com/add/nasa")?.service).toBe("SNAPCHAT");
    expect(parsePageLink("https://kick.com/nasa")?.externalId).toBe("nasa");
    expect(parsePageLink("https://www.twitch.tv/nasa")?.externalId).toBe("nasa");
    expect(parsePageLink("javascript:alert(1)")).toBeNull();
    expect(parsePageLink("https://evil.example/track/abc")).toBeNull();
    expect(previewEmbed({ service: "YOUTUBE", externalId: "abcdefghijk" })).toBe("https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0");
    expect(previewEmbed({ service: "SPOTIFY", externalId: "track/4iV5W9uYEdYUVa79Axb7Rh" })).not.toContain("autoplay");

    const started = applyBrightStart(FIXTURE_MINIMAL_FAN_PAGE);
    const services = started.sections.flatMap((section) => section.blocks).flatMap((block) => (block.mediaLink ? [block.mediaLink.service] : []));
    expect(services).toEqual(expect.arrayContaining([...PUBLIC_PAGE_LINK_SERVICES]));
    expect(services.filter((service) => service === "SPOTIFY")).toHaveLength(1);
    const empty = started.sections.flatMap((section) => section.blocks).find((block) => block.mediaLink?.service === "SPOTIFY");
    expect(empty?.mediaLink?.externalId).toBeUndefined();
    const again = applyBrightStart(started);
    expect(again.sections.flatMap((section) => section.blocks).filter((block) => block.mediaLink?.service === "SPOTIFY")).toHaveLength(1);

    const filled = addPageLink(started, "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh");
    expect(filled).not.toBeNull();
    const poem = filled!.sections.flatMap((section) => section.blocks).find((block) => block.kind === "POEM");
    expect(poem?.plainText?.text).toBe("One poem is a finished page.");
    const spot = filled!.sections.flatMap((section) => section.blocks).find((block) => block.mediaLink?.service === "SPOTIFY");
    const shaped = reshapePreview(resizePreview(filled!, spot!.id, { w: 8, h: 6 }), spot!.id, "CIRCLE");
    const window = shaped.sections.flatMap((section) => section.blocks).find((block) => block.id === spot!.id);
    expect(window?.bounds.w).toBe((spot?.bounds.w ?? 0) + 8);
    expect(window?.bounds.h).toBe((spot?.bounds.h ?? 0) + 6);
    expect(window?.style.mask).toBe("CIRCLE");
    expect(validatePublicPageDocument(shaped).ok).toBe(true);
    const presented = presentPublicProfile({ mode: "DOCUMENT_PREVIEW", document: shaped, authorizedCapabilities: ["BASE"] });
    if (!("entries" in presented)) throw new Error("missing entries");
    expect(presented.entries.find((entry) => entry.blockId === spot!.id)?.mediaLink?.service).toBe("SPOTIFY");
    expect(addPageLink(started, "https://evil.example")).toBeNull();
  });

  it("does not accept guestbook authorship", () => {
    const document = {
      ...FIXTURE_MINIMAL_FAN_PAGE,
      sections: FIXTURE_MINIMAL_FAN_PAGE.sections.map((section) => ({
        ...section,
        blocks: section.blocks.map((block) => ({ ...block, kind: "GUESTBOOK_WALL" })),
      })),
    };
    expect(validatePublicPageDocument(document).ok).toBe(false);
  });

  it("scales a background picture without covering the page color or copying the asset", () => {
    const pictured = setWorldBackground(FIXTURE_MINIMAL_FAN_PAGE, imageTile("tile_world", "asset_world"));
    const painted = setPageSurface(pictured, "#ff2daa");
    expect(painted.theme.surfaceColorHex).toBe("#FF2DAA");
    expect(painted.worldBackground?.assetId).toBe("asset_world");
    const fit = presentBackground(painted, null, { fit: "CONTAIN", frameW: 72, frameH: 84, frameX: 14, frameY: 8 });
    const smaller = scaleBackground(fit, null, -8);
    expect(smaller.worldBackground?.fit).toBe("CUSTOM");
    expect(smaller.worldBackground?.frameW).toBe(64);
    expect(smaller.worldBackground?.assetId).toBe("asset_world");
    const moved = moveBackground(smaller, null, -4, 0);
    expect(moved.worldBackground?.frameX).toBeLessThan(smaller.worldBackground?.frameX ?? 0);
    const plan = buildCanvasPlan(moved);
    expect(plan.surfaceColorHex).toBe("#FF2DAA");
    expect(plan.world?.assetId).toBe("asset_world");
    expect(validatePublicPageDocument(moved).ok).toBe(true);
    const covered = presentBackground(moved, null, { fit: "COVER" });
    expect(covered.worldBackground?.frameW).toBeUndefined();
    expect(covered.worldBackground?.assetId).toBe("asset_world");
  });

  it("keeps a picture bright until the owner asks for an overlay", () => {
    const pictured = imageTile("tile_face", "asset_face");
    expect(pictured.overlayOpacity).toBeUndefined();
    expect(pictured.overlayHex).toBeUndefined();
    const wash = washTile("tile_wash", "#FF2DAA", 90);
    expect(wash.opacity).toBe(70);
    expect(wash.blend).toBeUndefined();
  });

  it("applies flicker to the selected object and leaves the next object alone", () => {
    const first = FIXTURE_MINIMAL_FAN_PAGE.sections[0]?.blocks[0];
    expect(first).toBeTruthy();
    if (!first) return;
    const flickering = setBlockEffect(FIXTURE_MINIMAL_FAN_PAGE, first.id, "flicker");
    const hit = flickering.sections[0]?.blocks.find((block) => block.id === first.id);
    const other = flickering.sections.flatMap((section) => section.blocks).find((block) => block.id !== first.id);
    expect(hit?.style.motionPreset).toBe("flicker");
    expect(hit?.style.textGlow).toBe(true);
    expect(other?.style.motionPreset).toBeUndefined();
    const stopped = setBlockEffect(flickering, first.id, null);
    expect(stopped.sections[0]?.blocks.find((block) => block.id === first.id)?.style.motionPreset).toBeUndefined();
    expect(validatePublicPageDocument(flickering).ok).toBe(true);
  });
});

function setLayout(document: typeof FIXTURE_MINIMAL_FAN_PAGE) {
  return {
    ...document,
    sections: document.sections.map((section, index) => (index === 0 ? { ...section, layout: "SPLIT_V_50" as const } : section)),
  };
}
