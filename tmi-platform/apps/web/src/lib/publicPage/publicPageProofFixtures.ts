/**
 * Non-production proof documents. Same document, studio, and renderer.
 * Bindings are canonical ids. They are not fabricated member profiles.
 */

import { editDraftPlainText } from "./editPublicPageDraft";
import { addRepeatableBlock, createMinimalPublicPage, removeBlock } from "./pageStudio";
import {
  addSection,
  applyBrightStart,
  colorTile,
  imageTile,
  setAccentColor,
  setAtmosphere,
  setFlickerPlace,
  setOpening,
  setOverlay,
  setPaneTiles,
  setPerformanceTier,
  setSectionBackground,
  setSectionHeight,
  setSectionLayout,
  setUnderlay,
  setWorldBackground,
  videoLoopTile,
  washTile,
} from "./publicPageComposition";
import type { BlockStyleTokens, PublicPageDocument } from "./publicPageDocument";
import { validatePublicPageDocument } from "./validatePublicPageDocument";

const CAPABILITIES = ["BASE"] as const;

function base(id: string, pack: string, accent: string): PublicPageDocument {
  const document = createMinimalPublicPage({
    documentId: id,
    ownerUserId: "owner_proof",
    profileKind: "FAN",
    now: "2026-09-27T07:00:00.000Z",
  });
  return {
    ...document,
    theme: { ...document.theme, stylePackId: pack, accentColorHex: accent, fontPairingId: pack === "editorial" ? "EDITORIAL" : "DISPLAY" },
  };
}

function write(document: PublicPageDocument, blockId: string, text: string): PublicPageDocument {
  return editDraftPlainText(document, blockId, text);
}

function paint(document: PublicPageDocument, blockId: string, style: BlockStyleTokens): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) => (block.id === blockId ? { ...block, style: { ...block.style, ...style } } : block)),
    })),
  };
}

function addText(document: PublicPageDocument, kind: "QUOTE" | "POEM" | "LONG_FORM_WRITING" | "HEADING", text: string, style?: BlockStyleTokens): PublicPageDocument {
  const added = addRepeatableBlock(document, kind, CAPABILITIES);
  if (!added.added || !added.blockId) return document;
  const written = write(added.document, added.blockId, text);
  return style ? paint(written, added.blockId, style) : written;
}

function addPhoto(document: PublicPageDocument, assetId: string): PublicPageDocument {
  return addRepeatableBlock(document, "PHOTO", CAPABILITIES, assetId).document;
}

export function glitterChromePage(): PublicPageDocument {
  let document = setAtmosphere(base("proof_glitter", "glitter_chrome", "#FFD700"), "GLITTER");
  document = setWorldBackground(document, { tileId: "tile_glitter_world", source: "PATTERN", assetId: "glitter", colorHex: "#140010", opacity: 100, muted: true });
  document = setOpening(document, "KEEP");
  document = setSectionLayout(document, "sec_primary", "SIDEBAR_LEFT");
  document = setSectionHeight(document, "sec_primary", "FULL_SCREEN");
  document = setSectionBackground(document, "sec_primary", { tileId: "tile_glitter_section", source: "PATTERN", assetId: "glitter", colorHex: "#2a0020", opacity: 80, muted: true });
  document = paint(write(document, "blk_status", "Still that girl."), "blk_status", { sizeScale: "XL", fontPairingId: "DISPLAY", textGlow: true, align: "CENTER", motionPreset: "float", colorHex: "#FFD700" });
  document = addText(document, "QUOTE", "Unbothered. Blessed.", { sizeScale: "XL", fontPairingId: "DISPLAY", textGlow: true, align: "CENTER", colorHex: "#FF2DAA", motionPreset: "flicker" });
  document = addText(document, "POEM", "Gold on black. A name, a line, a song of the self.", { sizeScale: "LG", fontPairingId: "EDITORIAL", colorHex: "#F4E7C5", maxWidthCh: 28 });
  document = addSection(document, "GALLERY");
  const galleryId = document.sections[document.sections.length - 1]?.sectionId ?? "";
  document = setSectionHeight(document, galleryId, "COMPACT");
  document = setPaneTiles(document, galleryId, [
    colorTile("tile_glitter_a", "#3a1028"),
    colorTile("tile_glitter_b", "#6a1840"),
    colorTile("tile_glitter_c", "#1a0814"),
  ]);
  return document;
}

export function cyberpunkNeonPage(): PublicPageDocument {
  let document = setAtmosphere(base("proof_cyber", "cyberpunk_neon", "#00FFFF"), "LIGHT_SWEEP");
  document = setPerformanceTier(document, "CINEMATIC");
  document = setOpening(document, "FULL_BLEED");
  document = setWorldBackground(document, videoLoopTile("tile_cyber_loop", "asset_loop_cyber", "asset_poster_cyber"));
  document = setSectionLayout(document, "sec_primary", "FREEFORM");
  document = setSectionHeight(document, "sec_primary", "FULL_SCREEN");
  document = paint(write(document, "blk_status", "Signal is live."), "blk_status", { sizeScale: "SM", fontPairingId: "MONO", colorHex: "#00FFFF", rotationDeg: -6 });
  document = addText(document, "HEADING", "AFTER MIDNIGHT", { sizeScale: "XL", fontPairingId: "DISPLAY", colorHex: "#FF2DAA", textGlow: true, motionPreset: "rise", rotationDeg: 4 });
  document = addSection(document, "COLLAGE");
  const scatterId = document.sections[document.sections.length - 1]?.sectionId ?? "";
  document = setSectionHeight(document, scatterId, "STANDARD");
  document = setPaneTiles(document, scatterId, [
    colorTile("tile_cyber_a", "#041820"),
    colorTile("tile_cyber_b", "#200818"),
  ]);
  return document;
}

export function obsidianGlassPage(): PublicPageDocument {
  let document = setAtmosphere(base("proof_obsidian", "obsidian_glass", "#C8B4FF"), "HAZE");
  document = setOpening(document, "MEDIA");
  document = setSectionLayout(document, "sec_primary", "SPLIT_V_35_65");
  document = setSectionHeight(document, "sec_primary", "FULL_SCREEN");
  document = setSectionBackground(document, "sec_primary", imageTile("tile_obsidian_photo", "bot_image_2", "/bot-images/Bot image 2.png"));
  document = write(document, "blk_status", "");
  document = addText(document, "LONG_FORM_WRITING", "The room is dark glass. The sentence sits in front of the photograph.", { sizeScale: "LG", fontPairingId: "EDITORIAL", colorHex: "#F4F1FF", maxWidthCh: 28, motionPreset: "rise" });
  document = addSection(document, "ONE_COLUMN");
  const quietId = document.sections[document.sections.length - 1]?.sectionId ?? "";
  document = setSectionHeight(document, quietId, "AUTO");
  return document;
}

export function editorialPage(): PublicPageDocument {
  let document = base("proof_editorial", "editorial", "#F4E7C5");
  document = { ...document, theme: { ...document.theme, fontPairingId: "EDITORIAL" } };
  document = setOpening(document, "RESTYLE");
  document = setSectionLayout(document, "sec_primary", "TWO_COLUMN");
  document = setSectionHeight(document, "sec_primary", "STANDARD");
  document = setUnderlay(document, "sec_primary", colorTile("tile_editorial_paper", "#1a140c"));
  document = write(document, "blk_status", "Issue 01");
  document = addText(document, "HEADING", "A page that reads like a magazine", { sizeScale: "XL", fontPairingId: "EDITORIAL", colorHex: "#F4E7C5" });
  document = addText(document, "LONG_FORM_WRITING", "Drop the dashboard. Keep the column. Let the writing sit beside the quiet margin.", { sizeScale: "LG", fontPairingId: "EDITORIAL", colorHex: "#F4E7C5", maxWidthCh: 36 });
  document = addText(document, "QUOTE", "The column is the picture.", { sizeScale: "LG", fontPairingId: "EDITORIAL", align: "CENTER", colorHex: "#F4E7C5" });
  return document;
}

export function collagePage(): PublicPageDocument {
  let document = setOpening(base("proof_collage", "photo_collage", "#FFD700"), "QUAD");
  document = setSectionLayout(document, "sec_primary", "QUAD");
  document = setPaneTiles(document, "sec_primary", [
    colorTile("tile_quad_a", "#3A2208"),
    colorTile("tile_quad_b", "#6A4010"),
    colorTile("tile_quad_c", "#1A1208"),
    colorTile("tile_quad_d", "#8A5A18"),
  ]);
  document = addPhoto(document, "asset_quad_a");
  document = addPhoto(document, "asset_quad_b");
  document = addPhoto(document, "asset_quad_c");
  document = addPhoto(document, "asset_quad_d");
  document = addSection(document, "SPLIT_H_50");
  document = addSection(document, "COLLAGE");
  document = write(document, "blk_status", "Four pictures. One page.");
  return document;
}

export function minimalPage(): PublicPageDocument {
  let document = setOpening(base("proof_minimal", "minimal", "#FFFFFF"), "COMPACT");
  document = setPerformanceTier(document, "LIGHT");
  document = setSectionLayout(document, "sec_primary", "CENTER_STAGE");
  document = setSectionHeight(document, "sec_primary", "FULL_SCREEN");
  document = setUnderlay(document, "sec_primary", imageTile("tile_minimal_portrait", "bot_image_4", "/bot-images/Bot image 4.png"));
  document = paint(write(document, "blk_status", "One sentence."), "blk_status", { sizeScale: "XL", fontPairingId: "EDITORIAL", align: "CENTER", colorHex: "#FFFFFF", textGlow: true });
  const track = addRepeatableBlock(document, "TRACK", CAPABILITIES, "track_one");
  return track.document;
}

/** Seed portrait already stored at /bot-images. Built only by the page tools. Not a live member and not a fan count. */
export function botPortraitPage(): PublicPageDocument {
  let document = applyBrightStart(base("proof_bot_wavetek", "bright_profile", "#FF2DAA"));
  document = setAccentColor(document, "#FF2DAA");
  document = setAtmosphere(document, "GLITTER");
  document = setFlickerPlace(document, "MOTTO");
  document = write(document, "blk_status", "Wavetek");
  document = write(
    document,
    "blk_about_writing",
    "Seed portrait from the TMI bot image set. The picture, the writing, and the pink wash are the page. Nothing here is a separate About, Music, or Shop destination.",
  );
  document = write(document, "blk_heading_about", "");
  document = write(document, "blk_heading_interests", "");
  document = write(document, "blk_heading_playlist", "");
  document = write(document, "blk_heading_social", "");
  document = write(document, "blk_heading_people", "");
  document = setSectionLayout(document, "sec_primary", "ASYMMETRIC");
  document = setWorldBackground(document, {
    ...imageTile("tile_wavetek_world", "bot_image_1", "/bot-images/Bot image 1.png"),
    overlayHex: "#07010f",
    overlayOpacity: 36,
  });
  document = setSectionHeight(document, "sec_primary", "FULL_SCREEN");
  document = setUnderlay(document, "sec_primary", imageTile("tile_scene_open", "bot_image_1", "/bot-images/Bot image 1.png"));
  document = setOverlay(document, "sec_primary", washTile("tile_wavetek_over", "#FF2DAA", 34));
  document = setSectionHeight(document, "sec_about", "STANDARD");
  document = setUnderlay(document, "sec_about", imageTile("tile_scene_about", "bot_image_2", "/bot-images/Bot image 2.png"));
  document = setSectionHeight(document, "sec_listen", "COMPACT");
  document = setUnderlay(document, "sec_listen", imageTile("tile_scene_music", "bot_image_3", "/bot-images/Bot image 3.png"));
  document = setUnderlay(document, "sec_social", colorTile("tile_scene_social", "#12081c"));
  document = addSection(document, "QUAD");
  const galleryId = document.sections[document.sections.length - 1]?.sectionId ?? "";
  document = setSectionHeight(document, galleryId, "STANDARD");
  document = setUnderlay(document, galleryId, colorTile("tile_scene_people", "#1a1208"));
  document = setPaneTiles(document, galleryId, [
    imageTile("tile_bot_1", "bot_image_1", "/bot-images/Bot image 1.png"),
    imageTile("tile_bot_2", "bot_image_2", "/bot-images/Bot image 2.png"),
    imageTile("tile_bot_3", "bot_image_3", "/bot-images/Bot image 3.png"),
    imageTile("tile_bot_4", "bot_image_4", "/bot-images/Bot image 4.png"),
  ]);
  document = addSection(document, "FULL");
  const closeId = document.sections[document.sections.length - 1]?.sectionId ?? "";
  document = setSectionHeight(document, closeId, "COMPACT");
  document = setUnderlay(document, closeId, colorTile("tile_scene_close", "#f4f1ff"));
  document = removeBlock(document, "blk_photo_owner");
  const bar = addRepeatableBlock(document, "DIVIDER", CAPABILITIES);
  return bar.document;
}

export function publicPageProofFixtures(): PublicPageDocument[] {
  return [botPortraitPage(), glitterChromePage(), cyberpunkNeonPage(), obsidianGlassPage(), editorialPage(), collagePage(), minimalPage()];
}

export function assertProofFixturesValid(): string[] {
  return publicPageProofFixtures().flatMap((document) => {
    const result = validatePublicPageDocument(document);
    return result.ok ? [] : result.issues.map((issue) => `${document.documentId}: ${issue.path} ${issue.message}`);
  });
}
