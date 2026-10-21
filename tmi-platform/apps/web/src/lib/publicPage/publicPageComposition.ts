/**
 * Super-site composition layer for the canonical PublicPageDocument.
 * Not a second page, renderer, or persistence authority.
 */

import {
  PUBLIC_PAGE_ATMOSPHERES,
  PUBLIC_PAGE_LINK_SERVICES,
  PUBLIC_PAGE_SECTION_LAYOUTS,
  type MediaTile,
  type PublicPageAtmosphere,
  type PublicPageBlock,
  type PublicPageDocument,
  type PublicPageLinkService,
  type PublicPageMediaLink,
  type PublicPageMask,
  PUBLIC_PAGE_PATTERN_IDS,
  type PublicPageOpening,
  type PublicPagePatternId,
  type PublicPagePerformanceTier,
  type PublicPageSection,
  type PublicPageSectionHeight,
  type PublicPageSectionLayout,
  type PublicPageSectionTransition,
} from "./publicPageDocument";

export const PUBLIC_PAGE_EFFECT_CATEGORIES = [
  "ENTRANCE",
  "IDLE",
  "SCROLL",
  "INTERACTION",
  "AUDIO_REACTIVE",
  "LIVE_REACTIVE",
  "ATMOSPHERE",
  "TRANSITION",
] as const;

export type PublicPageEffectCategory = (typeof PUBLIC_PAGE_EFFECT_CATEGORIES)[number];

export interface PublicPageEffectDefinition {
  effectId: string;
  category: PublicPageEffectCategory;
  compatibleTargets: readonly string[];
  parameters: readonly string[];
  parameterBounds: Record<string, readonly [number, number]>;
  performanceCost: 1 | 2 | 3 | 4;
  mobileSupport: boolean;
  reducedMotionBehavior: "OFF" | "STATIC_FALLBACK";
  fallback: string;
  accessibilityBehavior: string;
  gpuRequirement: "NONE" | "OPTIONAL";
  version: 1;
}

const bounded = { intensity: [0, 100] as const, speed: [0.25, 2] as const };

function effect(
  effectId: string,
  category: PublicPageEffectCategory,
  cost: 1 | 2 | 3 | 4,
  mobileSupport = true,
): PublicPageEffectDefinition {
  return {
    effectId,
    category,
    compatibleTargets: ["SECTION", "BLOCK", "MEDIA_TILE"],
    parameters: ["intensity", "speed"],
    parameterBounds: bounded,
    performanceCost: cost,
    mobileSupport,
    reducedMotionBehavior: "STATIC_FALLBACK",
    fallback: "STATIC",
    accessibilityBehavior: "Honor prefers-reduced-motion. No strobe.",
    gpuRequirement: cost >= 3 ? "OPTIONAL" : "NONE",
    version: 1,
  };
}

export const PUBLIC_PAGE_EFFECT_REGISTRY: readonly PublicPageEffectDefinition[] = [
  effect("fade", "ENTRANCE", 1),
  effect("rise", "ENTRANCE", 1),
  effect("drop", "ENTRANCE", 1),
  effect("zoom", "ENTRANCE", 1),
  effect("flip", "ENTRANCE", 2),
  effect("reveal", "ENTRANCE", 1),
  effect("float", "IDLE", 1),
  effect("breathe", "IDLE", 1),
  effect("shimmer", "IDLE", 2),
  effect("glow", "IDLE", 1),
  effect("flicker", "IDLE", 1),
  effect("orbit", "IDLE", 2),
  effect("light_sweep", "IDLE", 2),
  effect("parallax", "SCROLL", 2),
  effect("scroll_reveal", "SCROLL", 1),
  effect("drift", "SCROLL", 1),
  effect("scale", "SCROLL", 1),
  effect("pin", "SCROLL", 2, false),
  effect("tilt", "INTERACTION", 1),
  effect("spring", "INTERACTION", 1),
  effect("magnetic", "INTERACTION", 2),
  effect("expand", "INTERACTION", 1),
  effect("burst", "INTERACTION", 2),
  effect("pulse", "AUDIO_REACTIVE", 1),
  effect("spectrum", "AUDIO_REACTIVE", 2),
  effect("border_glow", "AUDIO_REACTIVE", 1),
  effect("background_ripple", "AUDIO_REACTIVE", 2),
  effect("presence_glow", "LIVE_REACTIVE", 1),
  effect("going_live_reveal", "LIVE_REACTIVE", 1),
  effect("event_pulse", "LIVE_REACTIVE", 1),
  effect("glitter", "ATMOSPHERE", 2),
  effect("sparkles", "ATMOSPHERE", 2),
  effect("stars", "ATMOSPHERE", 1),
  effect("dust", "ATMOSPHERE", 1),
  effect("haze", "ATMOSPHERE", 1),
  effect("fog", "ATMOSPHERE", 1),
  effect("rain", "ATMOSPHERE", 2),
  effect("snow", "ATMOSPHERE", 2),
  effect("bubbles", "ATMOSPHERE", 2),
  effect("petals", "ATMOSPHERE", 2),
  effect("ember", "ATMOSPHERE", 2),
  effect("none", "TRANSITION", 1),
  effect("fade_transition", "TRANSITION", 1),
  effect("dissolve", "TRANSITION", 1),
  effect("wipe", "TRANSITION", 1),
  effect("slide", "TRANSITION", 1),
  effect("zoom_through", "TRANSITION", 2),
  effect("film_burn", "TRANSITION", 2),
  effect("glitch", "TRANSITION", 2),
];

const EFFECT_IDS = new Set(PUBLIC_PAGE_EFFECT_REGISTRY.map((row) => row.effectId));

export function getPublicPageEffect(effectId: string): PublicPageEffectDefinition | undefined {
  return PUBLIC_PAGE_EFFECT_REGISTRY.find((row) => row.effectId === effectId);
}

export function isRegisteredEffect(effectId: string): boolean {
  return EFFECT_IDS.has(effectId);
}

const SAFE_PATH = /^\/(?!\/)(?!.*\.\.)(?!.*[?#])[A-Za-z0-9_./ -]+$/;

export function isSafeDeliveryPath(value: string): boolean {
  return SAFE_PATH.test(value);
}

export function documentHasComposition(document: PublicPageDocument): boolean {
  if (document.worldBackground || document.openingPresentation || document.performanceTier || document.atmosphere || Boolean(document.theme?.surfaceColorHex)) {
    return true;
  }
  return document.sections.some(
    (section) =>
      section.layout !== undefined ||
      section.background !== undefined ||
      section.overlay !== undefined ||
      (section.panes !== undefined && section.panes.length > 0) ||
      section.transition !== undefined ||
      section.hidden !== undefined ||
      section.atmosphere !== undefined ||
      section.minHeightPx !== undefined ||
      section.heightMode !== undefined,
  );
}

export interface PlaybackDecision {
  decode: boolean;
  usePoster: boolean;
  particleScale: number;
}

export function governPlayback(input: {
  tier: PublicPagePerformanceTier;
  inView: boolean;
  reducedMotion: boolean;
  activeLoops: number;
  source: MediaTile["source"];
}): PlaybackDecision {
  if (input.source !== "VIDEO_LOOP" && input.source !== "ANIMATED_IMAGE") {
    return { decode: false, usePoster: false, particleScale: input.reducedMotion ? 0 : 1 };
  }
  if (input.reducedMotion || !input.inView) {
    return { decode: false, usePoster: true, particleScale: 0 };
  }
  const cap = input.tier === "LIGHT" ? 0 : input.tier === "RICH" ? 1 : input.tier === "CINEMATIC" ? 2 : 1;
  if (input.activeLoops >= cap) {
    return { decode: false, usePoster: true, particleScale: 0.25 };
  }
  return { decode: true, usePoster: false, particleScale: input.tier === "SPATIAL" ? 0.5 : 1 };
}

export function videoLoopIsMuted(tile: MediaTile): boolean {
  return tile.source !== "VIDEO_LOOP" || tile.muted !== false;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nextSectionId(document: PublicPageDocument): string {
  const ids = new Set(document.sections.map((section) => section.sectionId));
  let n = document.sections.length + 1;
  let id = `sec_${n}`;
  while (ids.has(id)) {
    n += 1;
    id = `sec_${n}`;
  }
  return id;
}

export function addSection(document: PublicPageDocument, layout: PublicPageSectionLayout = "FULL"): PublicPageDocument {
  const section: PublicPageSection = {
    sectionId: nextSectionId(document),
    kind: "CUSTOM",
    order: document.sections.length,
    visibility: "PUBLIC",
    blocks: [],
    layout,
    transition: "FADE",
    heightMode: "STANDARD",
  };
  return { ...document, sections: [...document.sections, section] };
}

export function moveSection(document: PublicPageDocument, sectionId: string, direction: -1 | 1): PublicPageDocument {
  const ordered = [...document.sections].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((section) => section.sectionId === sectionId);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= ordered.length) return document;
  const swap = ordered[index];
  ordered[index] = ordered[next];
  ordered[next] = swap;
  return { ...document, sections: ordered.map((section, order) => ({ ...section, order })) };
}

export function deleteSection(document: PublicPageDocument, sectionId: string): PublicPageDocument {
  if (document.sections.length <= 1) return document;
  const sections = document.sections
    .filter((section) => section.sectionId !== sectionId)
    .map((section, order) => ({ ...section, order }));
  if (sections.length === document.sections.length) return document;
  return { ...document, sections };
}

export function hideSection(document: PublicPageDocument, sectionId: string, hidden: boolean): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => (section.sectionId === sectionId ? { ...section, hidden } : section)),
  };
}

export function duplicateSectionPresentation(document: PublicPageDocument, sectionId: string): PublicPageDocument {
  const source = document.sections.find((section) => section.sectionId === sectionId);
  if (!source) return document;
  const copy: PublicPageSection = {
    sectionId: nextSectionId(document),
    kind: source.kind,
    order: document.sections.length,
    visibility: source.visibility,
    blocks: [],
    layout: source.layout,
    background: source.background ? clone(source.background) : undefined,
    transition: source.transition,
    minHeightPx: source.minHeightPx,
    paddingPx: source.paddingPx,
    gapPx: source.gapPx,
    atmosphere: source.atmosphere,
    panes: source.panes?.map((pane, index) => ({
      paneId: `${nextSectionId(document)}_pane_${index}`,
      order: pane.order,
      tile: pane.tile ? { ...clone(pane.tile), tileId: `${nextSectionId(document)}_tile_${index}` } : undefined,
      blockIds: [],
    })),
  };
  return { ...document, sections: [...document.sections, copy] };
}

function layoutPaneCount(layout: PublicPageSectionLayout): number {
  switch (layout) {
    case "QUAD":
    case "MOSAIC":
      return 4;
    case "THREE_COLUMN":
      return 3;
    case "TWO_COLUMN":
    case "SPLIT_V_50":
    case "SPLIT_V_35_65":
    case "SPLIT_V_65_35":
    case "SPLIT_H_50":
    case "SPLIT_H_35_65":
    case "SPLIT_H_65_35":
    case "SIDEBAR_LEFT":
    case "SIDEBAR_RIGHT":
    case "ASYMMETRIC":
    case "HERO_STRIP":
    case "COLLAGE":
      return 2;
    default:
      return 1;
  }
}

export function setPaneTiles(document: PublicPageDocument, sectionId: string, tiles: readonly MediaTile[]): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => {
      if (section.sectionId !== sectionId) return section;
      const panes = tiles.map((tile, order) => ({ paneId: `${section.sectionId}_pane_${order}`, order, tile }));
      return { ...section, panes };
    }),
  };
}

export function setSectionLayout(
  document: PublicPageDocument,
  sectionId: string,
  layout: PublicPageSectionLayout,
): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => (section.sectionId === sectionId ? { ...section, layout } : section)),
  };
}

const COLOR_HEX = /^#[0-9A-Fa-f]{6}$/;
const WRITING_KINDS = new Set(["STATUS_LINE", "QUOTE", "POEM", "LONG_FORM_WRITING", "HEADING", "NOTE"]);

export function setAccentColor(document: PublicPageDocument, colorHex: string): PublicPageDocument {
  if (!COLOR_HEX.test(colorHex)) return document;
  return { ...document, theme: { ...document.theme, accentColorHex: colorHex } };
}

export function setWritingColor(document: PublicPageDocument, colorHex: string): PublicPageDocument {
  if (!COLOR_HEX.test(colorHex)) return document;
  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) =>
        WRITING_KINDS.has(block.kind) ? { ...block, style: { ...block.style, colorHex, textGlow: true } } : block,
      ),
    })),
  };
}

export function setFlickerPlace(document: PublicPageDocument, place: "MOTTO" | "OFF"): PublicPageDocument {
  return { ...document, theme: { ...document.theme, flickerPlace: place } };
}

export function setWritingFlicker(document: PublicPageDocument, enabled: boolean): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) => {
        if (!WRITING_KINDS.has(block.kind)) return block;
        if (enabled) return { ...block, style: { ...block.style, motionPreset: "flicker", textGlow: true } };
        if (block.style.motionPreset !== "flicker") return block;
        const style = { ...block.style };
        delete style.motionPreset;
        return { ...block, style };
      }),
    })),
  };
}

export function setSectionHeight(document: PublicPageDocument, sectionId: string, heightMode: PublicPageSectionHeight): PublicPageDocument {
  if (heightMode !== "AUTO" && heightMode !== "COMPACT" && heightMode !== "STANDARD" && heightMode !== "FULL_SCREEN") return document;
  return {
    ...document,
    sections: document.sections.map((section) => (section.sectionId === sectionId ? { ...section, heightMode } : section)),
  };
}

/** The page image stays on the opening scene. Later scenes use their own underlay, or a solid field. */
export function sceneBackground(background: MediaTile | null, index: number, world: MediaTile | null): MediaTile | null {
  if (background) return background;
  return index === 0 ? world : null;
}

export function setSectionMinHeight(document: PublicPageDocument, sectionId: string, minHeightPx: number): PublicPageDocument {
  const height = Math.max(180, Math.min(1600, Math.round(minHeightPx)));
  return {
    ...document,
    sections: document.sections.map((section) => (section.sectionId === sectionId ? { ...section, minHeightPx: height } : section)),
  };
}

function flowBlock(id: string, kind: PublicPageBlock["kind"], text: string, style: PublicPageBlock["style"] = {}): PublicPageBlock {
  return {
    id,
    kind,
    placement: "FLOW",
    bounds: { x: 0, y: 0, w: 24, h: 8, z: 1, column: "FULL" },
    style: { opacity: 1, backgroundTreatment: "NONE", ...style },
    visibility: "PUBLIC",
    a11y: { label: kind, reduceMotionSafe: true, semanticRole: "ARTICLE" },
    plainText: { text },
  };
}

function photoSlot(id: string, recordId: string): PublicPageBlock {
  return {
    id,
    kind: "PHOTO",
    placement: "FLOW",
    bounds: { x: 0, y: 0, w: 24, h: 16, z: 1, column: "FULL" },
    style: { opacity: 1, backgroundTreatment: "NONE" },
    visibility: "PUBLIC",
    a11y: { label: "PHOTO", reduceMotionSafe: true, semanticRole: "IMG" },
    bindingRef: { authority: "CONTENT", recordId, snapshotPolicy: "LIVE_RESOLVE" },
  };
}

function takeBlocks(blocks: PublicPageBlock[], predicate: (block: PublicPageBlock) => boolean): PublicPageBlock[] {
  const taken: PublicPageBlock[] = [];
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    if (!predicate(blocks[index])) continue;
    taken.unshift(blocks[index]);
    blocks.splice(index, 1);
  }
  return taken;
}

const LISTEN_SERVICES = new Set<PublicPageLinkService>(["SPOTIFY", "APPLE_MUSIC", "PANDORA", "YOUTUBE", "TMI_PLAYLIST"]);
const SOCIAL_SERVICES = new Set<PublicPageLinkService>(["INSTAGRAM", "FACEBOOK", "TIKTOK", "SNAPCHAT", "KICK", "TWITCH"]);
const LINK_ID = /^[A-Za-z0-9_./@-]{1,180}$/;

function safePath(pathname: string): string | null {
  const path = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!path || path.includes("..") || !LINK_ID.test(path)) return null;
  return path;
}

function tokenId(value: string | undefined): string | null {
  if (!value || !/^[A-Za-z0-9_-]{1,80}$/.test(value)) return null;
  return value;
}

/** Turns a pasted URL into a service id. Unknown sites are refused. */
export function parsePageLink(raw: string): PublicPageMediaLink | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 400) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "open.spotify.com" || host === "spotify.com") {
    const start = parts[0] === "embed" ? 1 : 0;
    const type = parts[start];
    const id = tokenId(parts[start + 1]);
    if (!id || !type || !["track", "album", "playlist", "episode"].includes(type)) return null;
    return { service: "SPOTIFY", externalId: `${type}/${id}` };
  }
  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const fromPath = parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live" ? parts[1] : host === "youtu.be" ? parts[0] : undefined;
    const id = fromPath ?? url.searchParams.get("v") ?? "";
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return { service: "YOUTUBE", externalId: id };
  }
  if (host === "music.apple.com" || host === "embed.music.apple.com") {
    const path = safePath(url.pathname);
    return path ? { service: "APPLE_MUSIC", externalId: path } : null;
  }
  if (host === "pandora.com") {
    const path = safePath(url.pathname);
    return path ? { service: "PANDORA", externalId: path } : null;
  }
  if (host === "instagram.com") {
    const path = safePath(url.pathname);
    return path ? { service: "INSTAGRAM", externalId: path } : null;
  }
  if (host === "facebook.com" || host === "m.facebook.com" || host === "fb.watch") {
    const path = safePath(url.pathname);
    return path ? { service: "FACEBOOK", externalId: path } : null;
  }
  if (host === "tiktok.com") {
    const path = safePath(url.pathname);
    return path ? { service: "TIKTOK", externalId: path } : null;
  }
  if (host === "snapchat.com") {
    const path = safePath(url.pathname);
    return path ? { service: "SNAPCHAT", externalId: path } : null;
  }
  if (host === "kick.com") {
    const user = tokenId(parts[0]);
    return user ? { service: "KICK", externalId: user } : null;
  }
  if (host === "twitch.tv") {
    const user = tokenId(parts[0]);
    if (!user || user === "directory" || user === "settings") return null;
    return { service: "TWITCH", externalId: user };
  }
  if ((host === "themusiciansindex.com" || host.endsWith(".themusiciansindex.com")) && parts[0] === "playlist") {
    const id = tokenId(parts[1]);
    return id ? { service: "TMI_PLAYLIST", externalId: id } : null;
  }
  return null;
}

export function previewHref(link: PublicPageMediaLink): string | null {
  if (!link.externalId) return null;
  switch (link.service) {
    case "SPOTIFY":
      return `https://open.spotify.com/${link.externalId}`;
    case "YOUTUBE":
      return `https://www.youtube.com/watch?v=${link.externalId}`;
    case "APPLE_MUSIC":
      return `https://music.apple.com/${link.externalId}`;
    case "PANDORA":
      return `https://www.pandora.com/${link.externalId}`;
    case "TMI_PLAYLIST":
      return `/playlist/${link.externalId}`;
    case "INSTAGRAM":
      return `https://www.instagram.com/${link.externalId}`;
    case "FACEBOOK":
      return `https://www.facebook.com/${link.externalId}`;
    case "TIKTOK":
      return `https://www.tiktok.com/${link.externalId}`;
    case "SNAPCHAT":
      return `https://www.snapchat.com/${link.externalId}`;
    case "KICK":
      return `https://kick.com/${link.externalId}`;
    case "TWITCH":
      return `https://www.twitch.tv/${link.externalId}`;
    default:
      return null;
  }
}

/** Official embed for services that publish one. Everything else stays a linked preview. */
export function previewEmbed(link: PublicPageMediaLink): string | null {
  if (!link.externalId) return null;
  if (link.service === "SPOTIFY") return `https://open.spotify.com/embed/${link.externalId}`;
  if (link.service === "YOUTUBE") return `https://www.youtube-nocookie.com/embed/${link.externalId}?rel=0`;
  if (link.service === "APPLE_MUSIC") return `https://embed.music.apple.com/${link.externalId}`;
  return null;
}

function linkWindow(id: string, link: PublicPageMediaLink): PublicPageBlock {
  return {
    id,
    kind: "SOCIAL_LINKS",
    placement: "FLOW",
    bounds: { x: 8, y: 8, w: 36, h: 22, z: 2, column: "FULL" },
    style: { opacity: 1, backgroundTreatment: "GLASS", mask: "ROUNDED", cornerRadiusPx: 18 },
    visibility: "PUBLIC",
    a11y: { label: link.service, reduceMotionSafe: true, semanticRole: "LINK" },
    mediaLink: link,
  };
}

function nextLinkId(document: PublicPageDocument): string {
  const ids = new Set(document.sections.flatMap((section) => section.blocks.map((block) => block.id)));
  let n = ids.size + 1;
  let id = `blk_link_${n}`;
  while (ids.has(id)) {
    n += 1;
    id = `blk_link_${n}`;
  }
  return id;
}

function mapLinkBlocks(document: PublicPageDocument, change: (block: PublicPageBlock) => PublicPageBlock): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) => change(block)),
    })),
  };
}

/** Fills an empty spot of the same service, or adds another preview window further down the page. */
export function addPageLink(document: PublicPageDocument, raw: string): PublicPageDocument | null {
  const link = parsePageLink(raw);
  if (!link?.externalId) return null;
  const blocks = document.sections.flatMap((section) => section.blocks);
  const empty = blocks.find((block) => block.mediaLink?.service === link.service && !block.mediaLink.externalId);
  if (empty) {
    return mapLinkBlocks(document, (block) => (block.id === empty.id ? { ...block, mediaLink: link } : block));
  }
  const windowBlock = linkWindow(nextLinkId(document), link);
  const home = LISTEN_SERVICES.has(link.service) ? "sec_listen" : "sec_social";
  if (document.sections.some((section) => section.sectionId === home)) {
    return {
      ...document,
      sections: document.sections.map((section) =>
        section.sectionId === home ? { ...section, blocks: [...section.blocks, windowBlock] } : section,
      ),
    };
  }
  return {
    ...document,
    sections: [
      ...document.sections,
      {
        sectionId: home,
        kind: "CUSTOM",
        order: document.sections.length,
        visibility: "PUBLIC",
        blocks: [windowBlock],
        layout: "FULL",
        minHeightPx: 420,
        transition: "FADE",
      },
    ],
  };
}

export function resizePreview(document: PublicPageDocument, blockId: string, delta: { w?: number; h?: number }): PublicPageDocument {
  return mapLinkBlocks(document, (block) => {
    if (block.id !== blockId || !block.mediaLink) return block;
    const w = Math.max(8, Math.min(96, Math.round(block.bounds.w + (delta.w ?? 0))));
    const h = Math.max(6, Math.min(72, Math.round(block.bounds.h + (delta.h ?? 0))));
    return { ...block, bounds: { ...block.bounds, w, h } };
  });
}

export function reshapePreview(document: PublicPageDocument, blockId: string, mask: PublicPageMask): PublicPageDocument {
  if (mask !== "RECTANGLE" && mask !== "ROUNDED" && mask !== "CIRCLE") return document;
  return mapLinkBlocks(document, (block) =>
    block.id === blockId && block.mediaLink ? { ...block, style: { ...block.style, mask } } : block,
  );
}

/**
 * Starting arrangement. Keeps the owner's words and moves them into
 * sections they can reorder, resize, and restyle later.
 * The motto (status line and quote) is the flicker place.
 */
export function applyBrightStart(document: PublicPageDocument): PublicPageDocument {
  const blocks = document.sections.flatMap((section) => section.blocks).map((block) => ({ ...block, style: { ...block.style } }));
  const mottoStyle = { sizeScale: "XL" as const, fontPairingId: "DISPLAY" as const, textGlow: true, align: "CENTER" as const, colorHex: "#FF2DAA" };
  for (const block of blocks) {
    if (block.kind === "STATUS_LINE" || block.kind === "QUOTE") block.style = { ...block.style, ...mottoStyle };
  }
  if (!blocks.some((block) => block.kind === "STATUS_LINE")) blocks.unshift(flowBlock("blk_status", "STATUS_LINE", "", mottoStyle));
  if (!blocks.some((block) => block.kind === "HEADING" && block.plainText?.text === "About")) blocks.push(flowBlock("blk_heading_about", "HEADING", "About", { sizeScale: "LG", fontPairingId: "DISPLAY", colorHex: "#FF2DAA" }));
  if (!blocks.some((block) => block.kind === "LONG_FORM_WRITING")) blocks.push(flowBlock("blk_about_writing", "LONG_FORM_WRITING", "", { fontPairingId: "EDITORIAL", sizeScale: "MD", colorHex: "#F4F1FF" }));
  if (!blocks.some((block) => block.kind === "HEADING" && block.plainText?.text === "Interests")) blocks.push(flowBlock("blk_heading_interests", "HEADING", "Interests", { sizeScale: "LG", fontPairingId: "DISPLAY", colorHex: "#FF2DAA" }));
  if (!blocks.some((block) => block.kind === "HEADING" && block.plainText?.text === "Playlist")) blocks.push(flowBlock("blk_heading_playlist", "HEADING", "Playlist", { sizeScale: "LG", fontPairingId: "DISPLAY", colorHex: "#FF2DAA" }));
  if (!blocks.some((block) => block.kind === "HEADING" && block.plainText?.text === "Find me")) blocks.push(flowBlock("blk_heading_social", "HEADING", "Find me", { sizeScale: "LG", fontPairingId: "DISPLAY", colorHex: "#FF2DAA" }));
  if (!blocks.some((block) => block.kind === "HEADING" && block.plainText?.text === "My People")) blocks.push(flowBlock("blk_heading_people", "HEADING", "My People", { sizeScale: "LG", fontPairingId: "DISPLAY", colorHex: "#FF2DAA" }));
  if (!blocks.some((block) => block.kind === "PHOTO")) blocks.push(photoSlot("blk_photo_owner", "owner_photo"));
  const linked = new Set(blocks.flatMap((block) => (block.mediaLink ? [block.mediaLink.service] : [])));
  for (const service of PUBLIC_PAGE_LINK_SERVICES) {
    if (!linked.has(service)) blocks.push(linkWindow(`blk_spot_${service.toLowerCase()}`, { service }));
  }

  const pool = blocks.slice();
  const motto = takeBlocks(pool, (block) => block.kind === "STATUS_LINE" || block.kind === "QUOTE");
  const photos = takeBlocks(pool, (block) => block.kind === "PHOTO" || block.kind === "PHOTO_GALLERY");
  const about = takeBlocks(pool, (block) => block.plainText?.text === "About" || block.kind === "LONG_FORM_WRITING" || block.kind === "POEM");
  const interests = takeBlocks(pool, (block) => block.plainText?.text === "Interests");
  const listen = takeBlocks(pool, (block) => block.plainText?.text === "Playlist" || block.kind === "TRACK" || Boolean(block.mediaLink && LISTEN_SERVICES.has(block.mediaLink.service)));
  const social = takeBlocks(pool, (block) => block.plainText?.text === "Find me" || Boolean(block.mediaLink && SOCIAL_SERVICES.has(block.mediaLink.service)));
  const people = takeBlocks(pool, (block) => block.plainText?.text === "My People" || block.kind === "MEMBER_SPOTLIGHT");
  const groups: Array<{ sectionId: string; layout: PublicPageSectionLayout; heightMode: PublicPageSectionHeight; blocks: PublicPageBlock[] }> = [
    { sectionId: "sec_primary", layout: "SIDEBAR_LEFT", heightMode: "FULL_SCREEN", blocks: [...motto, ...photos.slice(0, 1)] },
    { sectionId: "sec_about", layout: "ONE_COLUMN", heightMode: "STANDARD", blocks: about },
    { sectionId: "sec_interests", layout: "TWO_COLUMN", heightMode: "AUTO", blocks: interests },
    { sectionId: "sec_listen", layout: "TWO_COLUMN", heightMode: "AUTO", blocks: listen },
    { sectionId: "sec_social", layout: "TWO_COLUMN", heightMode: "AUTO", blocks: social },
    { sectionId: "sec_people", layout: "FULL", heightMode: "AUTO", blocks: people },
    { sectionId: "sec_photos", layout: "GALLERY", heightMode: "AUTO", blocks: [...photos.slice(1), ...pool] },
  ];
  const sections: PublicPageSection[] = groups
    .filter((group) => group.blocks.length > 0)
    .map((group, order) => ({
      sectionId: group.sectionId,
      kind: order === 0 ? "PRIMARY" : "CUSTOM",
      order,
      visibility: "PUBLIC",
      blocks: group.blocks,
      layout: group.layout,
      heightMode: group.heightMode,
      transition: "FADE",
    }));
  return {
    ...document,
    theme: {
      ...document.theme,
      accentColorHex: document.theme.accentColorHex === "#00FFFF" ? "#FF2DAA" : document.theme.accentColorHex,
      stylePackId: document.theme.stylePackId === "tmi_classic" ? "bright_profile" : document.theme.stylePackId,
      fontPairingId: "DISPLAY",
      animationIntensity: document.theme.animationIntensity === "OFF" ? "OFF" : "NORMAL",
      flickerPlace: document.theme.flickerPlace ?? "MOTTO",
    },
    atmosphere: document.atmosphere ?? "GLITTER",
    openingPresentation: document.openingPresentation ?? "KEEP",
    worldBackground: document.worldBackground ?? colorTile("tile_world_color", "#07010f"),
    sections,
  };
}

export function setOpening(document: PublicPageDocument, opening: PublicPageOpening): PublicPageDocument {
  return { ...document, openingPresentation: opening };
}

export function setPerformanceTier(document: PublicPageDocument, tier: PublicPagePerformanceTier): PublicPageDocument {
  return { ...document, performanceTier: tier };
}

export function setAtmosphere(document: PublicPageDocument, atmosphere: PublicPageAtmosphere): PublicPageDocument {
  if (!PUBLIC_PAGE_ATMOSPHERES.includes(atmosphere)) return document;
  return { ...document, atmosphere };
}

export function colorTile(tileId: string, colorHex: string): MediaTile {
  return { tileId, source: "COLOR", colorHex, fit: "COVER", opacity: 100, muted: true };
}

export function patternBackgroundImage(patternId: string): { image: string; size: string } | null {
  const cell = "32px 32px";
  switch (patternId) {
    case "glitter":
      return { image: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1.5px)", size: cell };
    case "starburst":
      return { image: "repeating-conic-gradient(from 0deg, rgba(255,215,0,0.55) 0deg 8deg, transparent 8deg 22deg)", size: "80px 80px" };
    case "scanlines":
      return { image: "repeating-linear-gradient(to bottom, rgba(0,255,255,0.28) 0 1px, transparent 1px 5px)", size: "auto" };
    case "cyber_mesh":
      return {
        image: "linear-gradient(rgba(0,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(170,45,255,0.35) 1px, transparent 1px)",
        size: "28px 28px, 28px 28px",
      };
    case "carbon":
      return { image: "repeating-linear-gradient(45deg, #1a1a24 0 2px, #0e0e14 2px 5px)", size: "auto" };
    default:
      return null;
  }
}

export function patternTile(tileId: string, patternId: PublicPagePatternId, colorHex = "#050510"): MediaTile | null {
  if (!PUBLIC_PAGE_PATTERN_IDS.includes(patternId) || !patternBackgroundImage(patternId)) return null;
  return { tileId, source: "PATTERN", assetId: patternId, colorHex, fit: "TILE", opacity: 100, muted: true, speed: 0.8 };
}

export function imageTile(tileId: string, assetId: string, deliveryPath?: string): MediaTile {
  return {
    tileId,
    source: "IMAGE",
    assetAuthority: "CONTENT",
    assetId,
    ...(deliveryPath && isSafeDeliveryPath(deliveryPath) ? { deliveryPath } : {}),
    fit: "COVER",
    opacity: 100,
    muted: true,
  };
}

export function videoLoopTile(tileId: string, assetId: string, posterAssetId: string, deliveryPath?: string, posterPath?: string): MediaTile {
  return {
    tileId,
    source: "VIDEO_LOOP",
    assetAuthority: "CONTENT",
    assetId,
    posterAssetId,
    ...(deliveryPath && isSafeDeliveryPath(deliveryPath) ? { deliveryPath } : {}),
    ...(posterPath && isSafeDeliveryPath(posterPath) ? { posterPath } : {}),
    fit: "COVER",
    opacity: 100,
    loop: true,
    muted: true,
    speed: 0.75,
    parallax: "SUBTLE",
  };
}

const SURFACE_HEX = /^#[0-9A-Fa-f]{6}$/;

/** Page color stays under the picture. It does not replace the picture. */
export function setPageSurface(document: PublicPageDocument, colorHex: string, gradientHex?: string): PublicPageDocument {
  const color = colorHex.trim();
  if (!SURFACE_HEX.test(color)) return document;
  const theme = { ...document.theme, surfaceColorHex: color.toUpperCase() };
  if (gradientHex !== undefined) {
    const fade = gradientHex.trim();
    if (!SURFACE_HEX.test(fade)) return document;
    theme.surfaceGradientHex = fade.toUpperCase();
  }
  return { ...document, theme };
}

function backgroundTile(document: PublicPageDocument, sectionId: string | null): MediaTile | null {
  if (!sectionId) return document.worldBackground ?? null;
  return document.sections.find((section) => section.sectionId === sectionId)?.background ?? null;
}

function writeBackground(document: PublicPageDocument, sectionId: string | null, tile: MediaTile): PublicPageDocument {
  if (!sectionId) return { ...document, worldBackground: tile };
  return {
    ...document,
    sections: document.sections.map((section) => (section.sectionId === sectionId ? { ...section, background: tile } : section)),
  };
}

/** How the existing background picture sits on the page. Same asset id. */
export function presentBackground(
  document: PublicPageDocument,
  sectionId: string | null,
  patch: Partial<Pick<MediaTile, "fit" | "frameX" | "frameY" | "frameW" | "frameH" | "focalX" | "focalY" | "opacity" | "speed">>,
): PublicPageDocument {
  const tile = backgroundTile(document, sectionId);
  if (!tile || tile.source === "COLOR") return document;
  const next: MediaTile = { ...tile, ...patch };
  if (next.fit === "COVER" || next.fit === "STRETCH" || next.fit === "TILE" || next.fit === "REPEAT_X" || next.fit === "REPEAT_Y") {
    delete next.frameX;
    delete next.frameY;
    delete next.frameW;
    delete next.frameH;
  }
  return writeBackground(document, sectionId, next);
}

export function scaleBackground(document: PublicPageDocument, sectionId: string | null, delta: number): PublicPageDocument {
  const tile = backgroundTile(document, sectionId);
  if (!tile || tile.source === "COLOR") return document;
  if (tile.source === "PATTERN") {
    const speed = Math.max(0.25, Math.min(1.5, (tile.speed ?? 0.8) + delta / 50));
    const fit = tile.fit === "REPEAT_X" || tile.fit === "REPEAT_Y" ? tile.fit : "TILE";
    return presentBackground(document, sectionId, { fit, speed });
  }
  const currentW = tile.frameW ?? (tile.fit === "COVER" || tile.fit === "STRETCH" ? 100 : 72);
  const currentH = tile.frameH ?? (tile.fit === "COVER" || tile.fit === "STRETCH" ? 100 : 84);
  const frameW = Math.max(12, Math.min(100, currentW + delta));
  const frameH = Math.max(12, Math.min(100, currentH + delta));
  const frameX = Math.max(0, Math.min(100 - frameW, tile.frameX ?? Math.round((100 - frameW) / 2)));
  const frameY = Math.max(0, Math.min(100 - frameH, tile.frameY ?? Math.round((100 - frameH) / 2)));
  return presentBackground(document, sectionId, { fit: "CUSTOM", frameW, frameH, frameX, frameY });
}

export function moveBackground(document: PublicPageDocument, sectionId: string | null, deltaX: number, deltaY: number): PublicPageDocument {
  const tile = backgroundTile(document, sectionId);
  if (!tile || tile.source === "COLOR") return document;
  const frameW = tile.frameW ?? 72;
  const frameH = tile.frameH ?? 84;
  const frameX = Math.max(0, Math.min(100 - frameW, (tile.frameX ?? Math.round((100 - frameW) / 2)) + deltaX));
  const frameY = Math.max(0, Math.min(100 - frameH, (tile.frameY ?? Math.round((100 - frameH) / 2)) + deltaY));
  return presentBackground(document, sectionId, { fit: tile.fit === "COVER" ? "CUSTOM" : (tile.fit ?? "CUSTOM"), frameW, frameH, frameX, frameY });
}

export function setWorldBackground(document: PublicPageDocument, tile: MediaTile): PublicPageDocument {
  return { ...document, worldBackground: tile };
}

export function setSectionBackground(document: PublicPageDocument, sectionId: string, tile: MediaTile): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => (section.sectionId === sectionId ? { ...section, background: tile } : section)),
  };
}

/** Layer behind a section. The page background still shows everywhere else. */
export function setUnderlay(document: PublicPageDocument, sectionId: string, tile: MediaTile): PublicPageDocument {
  return setSectionBackground(document, sectionId, tile);
}

/** Layer in front of a section. It does not block the words or the preview windows. */
export function setOverlay(document: PublicPageDocument, sectionId: string, tile: MediaTile): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => (section.sectionId === sectionId ? { ...section, overlay: tile } : section)),
  };
}

export function clearUnderlay(document: PublicPageDocument, sectionId: string): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => {
      if (section.sectionId !== sectionId) return section;
      const next = { ...section };
      delete next.background;
      return next;
    }),
  };
}

export function clearOverlay(document: PublicPageDocument, sectionId: string): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => {
      if (section.sectionId !== sectionId) return section;
      const next = { ...section };
      delete next.overlay;
      return next;
    }),
  };
}

export function washTile(tileId: string, colorHex: string, opacity: number): MediaTile {
  return {
    tileId,
    source: "COLOR",
    colorHex,
    fit: "COVER",
    opacity: Math.max(0, Math.min(70, Math.round(opacity))),
    muted: true,
  };
}

export function proposeSupercharge(document: PublicPageDocument): PublicPageDocument | null {
  let next = clone(document);
  let changed = false;
  const blocks = next.sections.flatMap((section) => section.blocks);
  const photo = blocks.find((block) => block.kind === "PHOTO" && block.bindingRef);
  if (photo?.bindingRef && !next.worldBackground) {
    next = setWorldBackground(next, imageTile("tile_world", photo.bindingRef.recordId));
    changed = true;
  }
  const photos = blocks.filter((block) => block.kind === "PHOTO");
  const primary = next.sections[0];
  if (primary && photos.length >= 4 && primary.layout !== "QUAD") {
    next = setSectionLayout(next, primary.sectionId, "QUAD");
    changed = true;
  } else if (primary && photos.length >= 2 && !primary.layout) {
    next = setSectionLayout(next, primary.sectionId, "SPLIT_V_50");
    changed = true;
  }
  const writing = blocks.find((block) => block.kind === "LONG_FORM_WRITING" || block.kind === "POEM" || block.kind === "QUOTE");
  if (writing && !writing.style.textGlow) {
    next = mapBlock(next, writing.id, (block) => ({
      ...block,
      style: { ...block.style, textGlow: true, depth: "FOREGROUND", motionPreset: "rise", motionIntensity: 40, motionSpeed: 1 },
    }));
    changed = true;
  }
  const people = blocks.filter((block) => block.kind === "MEMBER_SPOTLIGHT");
  if (people.length >= 4 && people.some((block) => !block.style.peoplePresentation)) {
    for (const person of people) {
      next = mapBlock(next, person.id, (block) => ({
        ...block,
        style: { ...block.style, peoplePresentation: "ORBIT" },
      }));
    }
    changed = true;
  }
  if (!next.openingPresentation) {
    next = setOpening(next, photos.length > 0 ? "MEDIA" : "COMPACT");
    changed = true;
  }
  if (!changed) return null;
  const validatedIds = new Set(PUBLIC_PAGE_SECTION_LAYOUTS);
  if (next.sections.some((section) => section.layout && !validatedIds.has(section.layout))) return null;
  return next;
}

function mapBlock(document: PublicPageDocument, blockId: string, change: (block: PublicPageBlock) => PublicPageBlock): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) => (block.id === blockId ? change(block) : block)),
    })),
  };
}

export interface PublicPageCanvasPane {
  paneId: string;
  order: number;
  tile: MediaTile | null;
  blockIds: string[];
}

export interface PublicPageCanvasSection {
  sectionId: string;
  order: number;
  hidden: boolean;
  layout: PublicPageSectionLayout;
  transition: PublicPageSectionTransition;
  minHeightPx: number;
  heightMode: PublicPageSectionHeight | null;
  background: MediaTile | null;
  overlay: MediaTile | null;
  atmosphere: PublicPageAtmosphere;
  panes: PublicPageCanvasPane[];
}

export interface PublicPageCanvasPlan {
  opening: PublicPageOpening;
  performanceTier: PublicPagePerformanceTier;
  atmosphere: PublicPageAtmosphere;
  accentColorHex: string;
  fontPairingId: string;
  stylePackId: string;
  flickerPlace: "MOTTO" | "OFF";
  surfaceColorHex: string | null;
  surfaceGradientHex: string | null;
  world: MediaTile | null;
  sections: PublicPageCanvasSection[];
}

export function buildCanvasPlan(document: PublicPageDocument): PublicPageCanvasPlan {
  const sections = [...document.sections].sort((a, b) => a.order - b.order).map((section) => {
    const blockIds = section.blocks.map((block) => block.id);
    const wanted = layoutPaneCount(section.layout ?? "FULL");
    const authored = section.panes && section.panes.length > 0 ? [...section.panes].sort((a, b) => a.order - b.order) : [];
    const panes: PublicPageCanvasPane[] = Array.from({ length: Math.max(wanted, authored.length, 1) }, (_, order) => {
      const pane = authored[order];
      return {
        paneId: pane?.paneId ?? `${section.sectionId}_pane_${order}`,
        order,
        tile: pane?.tile ?? (order === 0 ? section.background ?? null : null),
        blockIds: pane?.blockIds && pane.blockIds.length > 0 ? [...pane.blockIds] : [],
      };
    });
    const assigned = new Set(panes.flatMap((pane) => pane.blockIds));
    const unassigned = blockIds.filter((id) => !assigned.has(id));
    unassigned.forEach((blockId, index) => {
      const pane = panes[index % panes.length];
      panes[index % panes.length] = { ...pane, blockIds: [...pane.blockIds, blockId] };
    });
    return {
      sectionId: section.sectionId,
      order: section.order,
      hidden: section.hidden === true,
      layout: section.layout ?? "FULL",
      transition: section.transition ?? "NONE",
      minHeightPx: section.heightMode === "AUTO" ? 0 : (section.minHeightPx ?? 0),
      heightMode: section.heightMode ?? null,
      background: section.background ?? null,
      overlay: section.overlay ?? null,
      atmosphere: section.atmosphere ?? "NONE",
      panes,
    };
  });
  return {
    opening: document.openingPresentation ?? "KEEP",
    performanceTier: document.performanceTier ?? "RICH",
    atmosphere: document.atmosphere ?? "NONE",
    accentColorHex: document.theme.accentColorHex,
    fontPairingId: document.theme.fontPairingId,
    stylePackId: document.theme.stylePackId,
    flickerPlace: document.theme.animationIntensity === "OFF" ? "OFF" : (document.theme.flickerPlace ?? "OFF"),
    surfaceColorHex: document.theme.surfaceColorHex ?? null,
    surfaceGradientHex: document.theme.surfaceGradientHex ?? null,
    world: document.worldBackground ?? null,
    sections,
  };
}
