/**
 * C.9 — owner Page Studio and Magnet canvas.
 * One document. The persistence service from C.6B is the write authority.
 * Nothing here writes PublicProfileConfig.
 */

import {
  PUBLIC_PAGE_BLOCK_CATALOG,
  PUBLIC_PAGE_DOCUMENT_SCHEMA_VERSION,
  PUBLIC_PAGE_MASKS,
  type BlockStyleTokens,
  type PublicPageBindingAuthority,
  type PublicPageBlock,
  type PublicPageBlockKind,
  type PublicPageBounds,
  type PublicPageCapability,
  type PublicPageDocument,
  type PublicPageMask,
  type PublicPageProfileKind,
  type PublicPageViewportClass,
} from "./publicPageDocument";
import type {
  PublicPageActor,
  PublicPagePersistence,
} from "./publicPagePersistence";
import { editDraftPlainText } from "./editPublicPageDraft";
import { isRegisteredEffect } from "./publicPageComposition";
import { publicPageShape } from "./publicPageShapes";
import { validatePublicPageDocument } from "./validatePublicPageDocument";

export const MAGNET_GRID = 4;
export const MAGNET_CANVAS = 96;
/** Stable vertical step for auto-grown writing. Not a percentage of a capped section. */
export const WRITING_UNIT_PX = 18;

/** Pixel height of the writing itself. This is not stored as a section floor and is not capped at 4000. */
export function writingContentPx(text: string, widthUnits: number): number {
  const charsPerLine = Math.max(18, Math.round(Math.max(widthUnits, 4) * 1.6));
  const lines = text.split(/\n/).reduce((count, line) => count + Math.max(1, Math.ceil(Math.max(line.length, 1) / charsPerLine)), 0);
  return Math.max(160, lines * 28 + 120);
}

/** Content is meaningful. Decoration is personality. A frame can hold either. Same placement system. */
export type MagnetRole = "CONTENT" | "DECORATION" | "CONTAINER";

const DECORATION_KINDS = new Set<PublicPageBlockKind>([
  "STICKER", "DIVIDER", "BADGE", "PATTERN", "TEXTURE", "SPARKLE", "LIGHT", "ORNAMENT", "SHAPE",
]);

const DROP_PALETTE = ["#FF2DAA", "#00FFFF", "#FFD700", "#AA2DFF", "#7CFFB2"] as const;

export function magnetRole(kind: PublicPageBlockKind): MagnetRole {
  if (kind === "FRAME") return "CONTAINER";
  if (DECORATION_KINDS.has(kind)) return "DECORATION";
  return "CONTENT";
}

export function bindingAuthorityFor(kind: PublicPageBlockKind): PublicPageBindingAuthority {
  switch (kind) {
    case "TRACK": return "TRACK";
    case "PLAYLIST": return "PLAYLIST";
    case "YOPHO": return "YOPHO_CARD";
    case "MEMBER_SPOTLIGHT": return "USER";
    case "LIVE_PRESENCE": return "LIVE_SESSION";
    case "EVENT": return "EVENT";
    case "PUBLIC_ROOM": return "PUBLIC_ROOM";
    case "MAGAZINE_FEATURE": return "ARTICLE";
    case "MERCH_SHELF":
    case "ALBUM":
      return "PRODUCT";
    default:
      return "CONTENT";
  }
}

export type StudioViewport = PublicPageViewportClass | "VISITOR";

export type StudioPhase =
  | "DRAFT_SAVED"
  | "LOCAL_DRAFT"
  | "SAVE_FAILED"
  | "UNSAVED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "CONFLICT";

export interface StudioHistory {
  undo: PublicPageDocument[];
  redo: PublicPageDocument[];
}

export interface StudioSession {
  document: PublicPageDocument;
  savedDocument: PublicPageDocument;
  expectedRevision: number | null;
  persistenceState: "SERVER" | "LOCAL";
  publishedRevision: number | null;
  phase: StudioPhase;
  viewport: StudioViewport;
  proposal: PublicPageDocument | null;
  capabilities: readonly PublicPageCapability[];
  history?: StudioHistory;
}

export interface StudioLayoutFrame {
  blockId: string;
  stacked: boolean;
  editing: boolean;
  bounds: PublicPageBounds;
}

export function studioMount(isOwner: boolean): { drawer: "YOUR_PAGE" } | null {
  return isOwner ? { drawer: "YOUR_PAGE" } : null;
}

export function studioStatusLabel(session: Pick<StudioSession, "phase" | "publishedRevision" | "persistenceState">): string {
  if (session.persistenceState === "LOCAL") return "LOCAL DRAFT (NOT PERSISTED)";
  if (session.phase === "SAVE_FAILED") return "Save failed — retry";
  if (session.phase === "UNSAVED") return "Unsaved Changes";
  if (session.phase === "PUBLISHING") return "Publishing...";
  if (session.phase === "PUBLISHED") return `Published (v${session.publishedRevision ?? 0})`;
  if (session.phase === "CONFLICT") return "Conflict (Reload Required)";
  return "Draft Saved";
}

export function blockAddAllowed(
  kind: PublicPageBlockKind,
  capabilities: readonly PublicPageCapability[],
): boolean {
  const entry = PUBLIC_PAGE_BLOCK_CATALOG.find((item) => item.kind === kind);
  if (!entry) return false;
  return entry.capability === "BASE" || capabilities.includes(entry.capability);
}

export function createMinimalPublicPage(input: {
  documentId: string;
  ownerUserId: string;
  profileKind: PublicPageProfileKind;
  now?: string;
}): PublicPageDocument {
  const document: PublicPageDocument = {
    documentId: input.documentId,
    ownerUserId: input.ownerUserId,
    schemaVersion: PUBLIC_PAGE_DOCUMENT_SCHEMA_VERSION,
    documentPurpose: "PUBLIC_PAGE",
    profileKind: input.profileKind,
    status: "DRAFT",
    publishedVersion: null,
    draftRevisionLabel: null,
    theme: {
      accentColorHex: "#00FFFF",
      stylePackId: "tmi_classic",
      animationIntensity: "LOW",
      fontPairingId: "INTER",
      surfaceColorHex: "#FFFFFF",
    },
    sections: [
      {
        sectionId: "sec_primary",
        kind: "PRIMARY",
        order: 0,
        layout: "FREEFORM",
        heightMode: "STANDARD",
        minHeightPx: 720,
        visibility: "PUBLIC",
        blocks: [
          textBlock("blk_status", "STATUS_LINE", ""),
        ],
      },
    ],
    responsiveRules: {
      mobileStrategy: "STACK_PRESERVE_ORDER",
      magnetCollapse: "FLOW",
      viewports: ["DESKTOP", "TABLET", "PHONE"],
      phoneCertificationTarget: "390x844",
    },
    a11y: { label: "Public page", reduceMotionSafe: true, semanticRole: "REGION" },
    updatedAt: input.now ?? "2026-09-26T20:00:00.000Z",
  };
  const validated = validatePublicPageDocument(document);
  if (!validated.ok) {
    throw new Error(validated.issues.map((issue) => issue.message).join("; "));
  }
  return document;
}

function textBlock(id: string, kind: PublicPageBlockKind, text: string): PublicPageBlock {
  return {
    id,
    kind,
    placement: "FLOW",
    bounds: { x: 0, y: 0, w: 12, h: 4, z: 0, column: "FULL" },
    style: { opacity: 1, backgroundTreatment: "NONE" },
    visibility: "PUBLIC",
    a11y: { label: kind, reduceMotionSafe: true, semanticRole: "ARTICLE" },
    plainText: { text },
  };
}

function nextBlockId(document: PublicPageDocument, kind: PublicPageBlockKind): string {
  const existing = new Set(document.sections.flatMap((section) => section.blocks.map((block) => block.id)));
  let n = existing.size + 1;
  let id = `blk_${kind.toLowerCase()}_${n}`;
  while (existing.has(id)) {
    n += 1;
    id = `blk_${kind.toLowerCase()}_${n}`;
  }
  return id;
}

function mapBlocks(
  document: PublicPageDocument,
  change: (blocks: PublicPageBlock[], sectionIndex: number) => PublicPageBlock[],
): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section, index) => ({
      ...section,
      blocks: change(section.blocks, index),
    })),
  };
}

export function addRepeatableBlock(
  document: PublicPageDocument,
  kind: PublicPageBlockKind,
  capabilities: readonly PublicPageCapability[],
  bindingRecordId?: string,
): { document: PublicPageDocument; added: boolean; blockId: string | null } {
  if (!blockAddAllowed(kind, capabilities)) {
    return { document, added: false, blockId: null };
  }
  const entry = PUBLIC_PAGE_BLOCK_CATALOG.find((item) => item.kind === kind);
  if (entry?.requiresBinding && !bindingRecordId?.trim()) {
    return { document, added: false, blockId: null };
  }
  const blockId = nextBlockId(document, kind);
  const block: PublicPageBlock = {
    ...textBlock(blockId, kind, ""),
    ...(entry?.requiresBinding
      ? {
          plainText: undefined,
          bindingRef: {
            authority: bindingAuthorityFor(kind),
            recordId: bindingRecordId!.trim(),
            snapshotPolicy: "LIVE_RESOLVE" as const,
          },
        }
      : {}),
  };
  const primary = document.sections.findIndex((section) => section.kind === "PRIMARY");
  const target = primary >= 0 ? primary : 0;
  return {
    added: true,
    blockId,
    document: mapBlocks(document, (blocks, index) => (index === target ? [...blocks, block] : blocks)),
  };
}

export function removeBlock(document: PublicPageDocument, blockId: string): PublicPageDocument {
  const total = document.sections.reduce((count, section) => count + section.blocks.length, 0);
  if (total <= 1) return document;
  return mapBlocks(document, (blocks) => blocks.filter((block) => block.id !== blockId));
}

export function reorderBlock(
  document: PublicPageDocument,
  blockId: string,
  direction: -1 | 1,
): PublicPageDocument {
  return mapBlocks(document, (blocks) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= blocks.length) return blocks;
    const copy = blocks.slice();
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    return copy;
  });
}

export function snapMagnet(value: number): number {
  return Math.round(value / MAGNET_GRID) * MAGNET_GRID;
}

export function clampMagnetBounds(bounds: PublicPageBounds): PublicPageBounds {
  const w = Math.min(MAGNET_CANVAS, Math.max(MAGNET_GRID, snapMagnet(bounds.w)));
  const h = Math.min(MAGNET_CANVAS, Math.max(MAGNET_GRID, snapMagnet(bounds.h)));
  const x = Math.min(MAGNET_CANVAS - w, Math.max(0, snapMagnet(bounds.x)));
  const y = Math.min(MAGNET_CANVAS - h, Math.max(0, snapMagnet(bounds.y)));
  const z = Math.max(0, Math.round(bounds.z));
  return { ...bounds, x, y, w, h, z };
}

/** Screen point on a section, expressed on the same 0–96 magnet grid the canvas paints. */
export function clientPointToMagnet(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } {
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);
  const x = ((clientX - rect.left) / width) * MAGNET_CANVAS;
  const y = ((clientY - rect.top) / height) * MAGNET_CANVAS;
  return {
    x: Math.max(0, Math.min(MAGNET_CANVAS, x)),
    y: Math.max(0, Math.min(MAGNET_CANVAS, y)),
  };
}

/** Centers an existing magnet on a captured page point. Clamp keeps it on the canvas. */
export function centerMagnetOn(
  document: PublicPageDocument,
  blockId: string,
  pointX: number,
  pointY: number,
): PublicPageDocument {
  const block = findBlock(document, blockId);
  if (!block || block.placement !== "MAGNET") return document;
  return applyMagnetBounds(document, blockId, {
    x: pointX - block.bounds.w / 2,
    y: pointY - block.bounds.h / 2,
  });
}

/** Keeps a fixed-size shelf inside the viewport. The shelf does not grow with its inventory. */
export function placeShelf(
  anchorX: number,
  anchorY: number,
  shelfWidth: number,
  shelfHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  margin = 8,
): { left: number; top: number } {
  const maxLeft = Math.max(margin, viewportWidth - shelfWidth - margin);
  const maxTop = Math.max(margin, viewportHeight - shelfHeight - margin);
  let left = anchorX;
  let top = anchorY;
  if (left + shelfWidth > viewportWidth - margin) left = anchorX - shelfWidth;
  if (top + shelfHeight > viewportHeight - margin) top = anchorY - shelfHeight;
  return {
    left: Math.min(maxLeft, Math.max(margin, left)),
    top: Math.min(maxTop, Math.max(margin, top)),
  };
}

/** One page of a shelf. The panel stays the same size; the owner pages the rest. */
export function shelfWindow<T>(items: readonly T[], page: number, size: number): { page: number; pages: number; items: readonly T[] } {
  const pages = Math.max(1, Math.ceil(items.length / Math.max(size, 1)));
  const safe = Math.max(0, Math.min(pages - 1, Math.round(page)));
  const start = safe * size;
  return { page: safe, pages, items: items.slice(start, start + size) };
}

/** Pixel deltas on the owner canvas, in the same units the canvas paints. */
export function pointerDeltaToMagnetPatch(
  start: PublicPageBounds,
  mode: "move" | "resize",
  deltaXPx: number,
  deltaYPx: number,
  canvasWidthPx: number,
  canvasHeightPx: number,
): Partial<PublicPageBounds> {
  const width = Math.max(canvasWidthPx, 1);
  const height = Math.max(canvasHeightPx, 1);
  const dx = (deltaXPx / width) * 100;
  const dy = (deltaYPx / height) * MAGNET_CANVAS;
  if (mode === "resize") return { w: start.w + dx, h: start.h + dy };
  return { x: start.x + dx, y: start.y + dy };
}

export function applyMagnetBounds(
  document: PublicPageDocument,
  blockId: string,
  next: Partial<PublicPageBounds>,
): PublicPageDocument {
  return mapBlocks(document, (blocks) =>
    blocks.map((block) => {
      if (block.id !== blockId || block.placement !== "MAGNET") return block;
      return { ...block, bounds: clampMagnetBounds({ ...block.bounds, ...next }) };
    }),
  );
}

export function placeAsMagnet(
  document: PublicPageDocument,
  blockId: string,
  bounds: PublicPageBounds,
): PublicPageDocument {
  return mapBlocks(document, (blocks) =>
    blocks.map((block) =>
      block.id === blockId
        ? { ...block, placement: "MAGNET", bounds: clampMagnetBounds(bounds) }
        : block,
    ),
  );
}

export function raiseMagnetLayer(document: PublicPageDocument, blockId: string): PublicPageDocument {
  const zs = document.sections.flatMap((section) => section.blocks.map((block) => block.bounds.z));
  const top = zs.reduce((max, z) => Math.max(max, z), 0);
  return applyMagnetBounds(document, blockId, { z: top + 1 });
}

export function lowerMagnetLayer(document: PublicPageDocument, blockId: string): PublicPageDocument {
  return mapBlocks(document, (blocks) =>
    blocks.map((block) => {
      if (block.id !== blockId || block.placement !== "MAGNET") return block;
      return { ...block, bounds: { ...block.bounds, z: Math.max(0, block.bounds.z - 1) } };
    }),
  );
}

export function bringMagnetToFront(document: PublicPageDocument, blockId: string): PublicPageDocument {
  const zs = document.sections.flatMap((section) => section.blocks.map((block) => block.bounds.z));
  const top = zs.reduce((max, z) => Math.max(max, z), 0);
  return applyMagnetBounds(document, blockId, { z: top + 1 });
}

export function sendMagnetToBack(document: PublicPageDocument, blockId: string): PublicPageDocument {
  const zs = document.sections.flatMap((section) => section.blocks.map((block) => block.bounds.z));
  const min = zs.reduce((lowest, z) => Math.min(lowest, z), 0);
  return applyMagnetBounds(document, blockId, { z: Math.max(0, min - 1) });
}

function findBlock(document: PublicPageDocument, blockId: string): PublicPageBlock | null {
  for (const section of document.sections) {
    const hit = section.blocks.find((block) => block.id === blockId);
    if (hit) return hit;
  }
  return null;
}

export function patchBlockStyle(
  document: PublicPageDocument,
  blockId: string,
  patch: Partial<BlockStyleTokens>,
): PublicPageDocument {
  return mapBlocks(document, (blocks) =>
    blocks.map((block) => (block.id === blockId ? { ...block, style: { ...block.style, ...patch } } : block)),
  );
}

/** One object's registered effect. It does not restyle the rest of the page. */
export function setBlockEffect(
  document: PublicPageDocument,
  blockId: string,
  effectId: string | null,
): PublicPageDocument {
  if (effectId !== null && !isRegisteredEffect(effectId)) return document;
  return mapBlocks(document, (blocks) =>
    blocks.map((block) => {
      if (block.id !== blockId) return block;
      const style = { ...block.style };
      if (!effectId) {
        delete style.motionPreset;
        return { ...block, style };
      }
      return {
        ...block,
        style: {
          ...style,
          motionPreset: effectId,
          textGlow: effectId === "flicker" || effectId === "glow",
        },
      };
    }),
  );
}

export function rotateBlock(document: PublicPageDocument, blockId: string, deltaDeg = 8): PublicPageDocument {
  const block = findBlock(document, blockId);
  if (!block) return document;
  const rotationDeg = Math.max(-180, Math.min(180, Math.round((block.style.rotationDeg ?? 0) + deltaDeg)));
  return patchBlockStyle(document, blockId, { rotationDeg });
}

export function cycleBlockMask(document: PublicPageDocument, blockId: string): PublicPageDocument {
  const block = findBlock(document, blockId);
  if (!block) return document;
  const current = block.style.mask ?? "ROUNDED";
  const index = PUBLIC_PAGE_MASKS.indexOf(current);
  const mask: PublicPageMask = PUBLIC_PAGE_MASKS[(index + 1) % PUBLIC_PAGE_MASKS.length] ?? "ROUNDED";
  const backgroundTreatment = block.style.backgroundTreatment && block.style.backgroundTreatment !== "NONE"
    ? block.style.backgroundTreatment
    : "GLASS";
  return patchBlockStyle(document, blockId, { mask, backgroundTreatment });
}

const DROP_SIZE: Partial<Record<PublicPageBlockKind, Pick<PublicPageBounds, "w" | "h">>> = {
  QUOTE: { w: 28, h: 12 },
  POEM: { w: 28, h: 16 },
  NOTE: { w: 24, h: 16 },
  HEADING: { w: 32, h: 8 },
  LONG_FORM_WRITING: { w: 40, h: 16 },
  STATUS_LINE: { w: 28, h: 8 },
  PHOTO: { w: 20, h: 24 },
  PHOTO_GALLERY: { w: 36, h: 20 },
  TRACK: { w: 32, h: 12 },
  PLAYLIST: { w: 36, h: 20 },
  VIDEO_SNIP: { w: 32, h: 18 },
  YOPHO: { w: 24, h: 28 },
  MEMBER_SPOTLIGHT: { w: 20, h: 16 },
  SOCIAL_LINKS: { w: 20, h: 8 },
  SHAPE: { w: 16, h: 16 },
  STICKER: { w: 12, h: 12 },
  FRAME: { w: 28, h: 20 },
};

/** Add, then drop it on the canvas. The owner moves it after. Sections stay underneath. */
export function dropObject(
  document: PublicPageDocument,
  kind: PublicPageBlockKind,
  capabilities: readonly PublicPageCapability[],
  bindingRecordId?: string,
): { document: PublicPageDocument; added: boolean; blockId: string | null } {
  const added = addRepeatableBlock(document, kind, capabilities, bindingRecordId);
  if (!added.added || !added.blockId) return added;
  const count = added.document.sections.reduce((sum, section) => sum + section.blocks.length, 0);
  const size = DROP_SIZE[kind] ?? { w: 24, h: 12 };
  const occupied = added.document.sections.flatMap((section) => section.blocks)
    .filter((block) => block.id !== added.blockId && block.placement === "MAGNET")
    .map((block) => block.bounds);
  const step = MAGNET_GRID * 3;
  let x = 0;
  let y = 0;
  const collides = (candidateX: number, candidateY: number) => occupied.some((bounds) =>
    candidateX < bounds.x + bounds.w && candidateX + size.w > bounds.x
    && candidateY < bounds.y + bounds.h && candidateY + size.h > bounds.y);
  if (occupied.length > 0) {
    let placed = false;
    for (let row = 0; row <= MAGNET_CANVAS - size.h && !placed; row += step) {
      for (let column = 0; column <= MAGNET_CANVAS - size.w && !placed; column += step) {
        if (!collides(column, row)) {
          x = column;
          y = row;
          placed = true;
        }
      }
    }
  }
  let next = placeAsMagnet(added.document, added.blockId, {
    x, y, w: size.w, h: size.h, z: count, column: "FULL",
  });
  if (magnetRole(kind) !== "CONTENT") {
    next = patchBlockStyle(next, added.blockId, {
      backgroundTreatment: "SOLID",
      colorHex: DROP_PALETTE[count % DROP_PALETTE.length],
      mask: kind === "SHAPE" ? "CIRCLE" : kind === "FRAME" ? "POLAROID" : "ROUNDED",
      opacity: kind === "STICKER" ? 0.85 : 1,
    });
  }
  return { document: next, added: true, blockId: added.blockId };
}

function safeWritingTitle(title: string): string {
  const cleaned = title.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
  return cleaned.length > 0 ? cleaned : "Untitled";
}

/** One writing box. The label is a starter name, not a new component. */
export function addWritingBox(
  document: PublicPageDocument,
  capabilities: readonly PublicPageCapability[],
  title: string,
): { document: PublicPageDocument; added: boolean; blockId: string | null } {
  const dropped = dropObject(document, "LONG_FORM_WRITING", capabilities);
  if (!dropped.added || !dropped.blockId) return dropped;
  const label = safeWritingTitle(title === "Custom" ? "" : title);
  const next = mapBlocks(dropped.document, (blocks) =>
    blocks.map((block) =>
      block.id === dropped.blockId
        ? {
            ...block,
            a11y: { ...block.a11y, label },
            style: {
              ...block.style,
              textFit: "AUTO" as const,
              mask: "ROUNDED" as const,
              backgroundTreatment: "GLASS" as const,
              fontPairingId: "EDITORIAL" as const,
            },
          }
        : block,
    ),
  );
  return { document: next, added: true, blockId: dropped.blockId };
}

export function setWritingTitle(document: PublicPageDocument, blockId: string, title: string): PublicPageDocument {
  const label = safeWritingTitle(title);
  return mapBlocks(document, (blocks) =>
    blocks.map((block) => (block.id === blockId ? { ...block, a11y: { ...block.a11y, label } } : block)),
  );
}

export function setWritingFit(document: PublicPageDocument, blockId: string, textFit: "AUTO" | "FIXED"): PublicPageDocument {
  return patchBlockStyle(document, blockId, { textFit });
}

/**
 * The same words can wear a rectangle, a circle, or a heart.
 * Changing the shape does not rewrite the text.
 */
export function applyShape(document: PublicPageDocument, blockId: string, shapeId: PublicPageMask): PublicPageDocument {
  const shape = publicPageShape(shapeId);
  if (!shape) return document;
  let next = patchBlockStyle(document, blockId, { mask: shape.shapeId });
  if (shape.resize !== "PRESERVE") return next;
  const block = findBlock(next, blockId);
  if (!block || block.placement !== "MAGNET") return next;
  const side = Math.max(block.bounds.w, block.bounds.h);
  next = applyMagnetBounds(next, blockId, { w: side, h: side });
  return next;
}

/** Moves the picture inside the mask. The mask, the file, and the page position stay put. */
export function setMediaViewport(
  document: PublicPageDocument,
  blockId: string,
  patch: Pick<BlockStyleTokens, "mediaFit" | "mediaZoom" | "mediaFocalX" | "mediaFocalY" | "mediaRotationDeg" | "mediaFlipX" | "mediaFlipY">,
): PublicPageDocument {
  const block = findBlock(document, blockId);
  if (!block) return document;
  const zoom = patch.mediaZoom ?? block.style.mediaZoom ?? 1;
  const focalX = patch.mediaFocalX ?? block.style.mediaFocalX ?? 0.5;
  const focalY = patch.mediaFocalY ?? block.style.mediaFocalY ?? 0.5;
  return patchBlockStyle(document, blockId, {
    ...patch,
    mediaZoom: Math.max(0.5, Math.min(8, zoom)),
    mediaFocalX: Math.max(0, Math.min(1, focalX)),
    mediaFocalY: Math.max(0, Math.min(1, focalY)),
  });
}

export function setMediaFrame(
  document: PublicPageDocument,
  blockId: string,
  framePreset: NonNullable<BlockStyleTokens["framePreset"]>,
): PublicPageDocument {
  return patchBlockStyle(document, blockId, { framePreset });
}

export const WRITING_TREATMENTS = ["TRANSPARENT", "SOLID_DARK", "SOLID_LIGHT", "GLASS"] as const;
export type WritingTreatment = (typeof WRITING_TREATMENTS)[number];

const WRITING_TREATMENT_KINDS = new Set(["LONG_FORM_WRITING", "NOTE", "QUOTE", "POEM", "HEADING", "STATUS_LINE"]);

/** One writing box, four container fills. The label stays whatever the owner typed. */
export function setWritingTreatment(
  document: PublicPageDocument,
  blockId: string,
  treatment: WritingTreatment,
): PublicPageDocument {
  const block = findBlock(document, blockId);
  if (!block || !WRITING_TREATMENT_KINDS.has(block.kind)) return document;
  if (treatment === "TRANSPARENT") return patchBlockStyle(document, blockId, { backgroundTreatment: "NONE", skinRef: "card_clear" });
  if (treatment === "SOLID_DARK") return patchBlockStyle(document, blockId, { backgroundTreatment: "SOLID", skinRef: "card_dark" });
  if (treatment === "SOLID_LIGHT") return patchBlockStyle(document, blockId, { backgroundTreatment: "SOLID", skinRef: "card_light" });
  return patchBlockStyle(document, blockId, { backgroundTreatment: "GLASS", skinRef: "card_glass" });
}

/**
 * AUTO keeps the full writing and lets the page paint grow with it.
 * FIXED keeps the owner's box. Neither path deletes text or writes the 4000px section floor.
 */
export function fitWritingToText(document: PublicPageDocument, blockId: string, text: string): PublicPageDocument {
  const block = findBlock(document, blockId);
  if (!block) return document;
  return editDraftPlainText(document, blockId, text);
}

export function duplicateBlock(
  document: PublicPageDocument,
  blockId: string,
): { document: PublicPageDocument; blockId: string | null } {
  const sectionIndex = document.sections.findIndex((section) => section.blocks.some((block) => block.id === blockId));
  const source = sectionIndex >= 0 ? document.sections[sectionIndex]?.blocks.find((block) => block.id === blockId) : undefined;
  if (!source || sectionIndex < 0) return { document, blockId: null };
  const id = nextBlockId(document, source.kind);
  const copy: PublicPageBlock = {
    ...source,
    id,
    style: { ...source.style },
    bounds: source.placement === "MAGNET"
      ? clampMagnetBounds({ ...source.bounds, x: source.bounds.x + MAGNET_GRID, y: source.bounds.y + MAGNET_GRID, z: source.bounds.z + 1 })
      : { ...source.bounds, z: source.bounds.z + 1 },
    plainText: source.plainText ? { ...source.plainText } : undefined,
    bindingRef: source.bindingRef ? { ...source.bindingRef } : undefined,
    a11y: { ...source.a11y },
  };
  return {
    blockId: id,
    document: mapBlocks(document, (blocks, index) => (index === sectionIndex ? [...blocks, copy] : blocks)),
  };
}

export function framesForViewport(document: PublicPageDocument, viewport: StudioViewport): StudioLayoutFrame[] {
  const stack = viewport === "PHONE" || viewport === "VISITOR";
  const editing = viewport !== "VISITOR";
  const blocks = document.sections.flatMap((section) => section.blocks);
  return blocks.map((block, index) => {
    if (stack || block.placement !== "MAGNET") {
      return {
        blockId: block.id,
        stacked: true,
        editing: editing && block.placement === "MAGNET" && viewport !== "PHONE",
        bounds: { x: 0, y: index * 8, w: 12, h: 4, z: index, column: "FULL" },
      };
    }
    return {
      blockId: block.id,
      stacked: false,
      editing,
      bounds: block.bounds,
    };
  });
}

export function viewportWidth(viewport: StudioViewport): number {
  if (viewport === "PHONE") return 390;
  if (viewport === "TABLET") return 768;
  return 1200;
}

export function proposeHelpLayout(document: PublicPageDocument): PublicPageDocument | null {
  const block = document.sections.flatMap((section) => section.blocks).find((item) => item.plainText);
  if (!block) return null;
  return placeAsMagnet(document, block.id, { x: 8, y: 8, w: 32, h: 16, z: 1, column: "FULL" });
}

export function acceptProposal(session: StudioSession): StudioSession {
  if (!session.proposal) return session;
  const undo = [...(session.history?.undo ?? []), session.document].slice(-40);
  return {
    ...session,
    document: session.proposal,
    proposal: null,
    phase: "UNSAVED",
    history: { undo, redo: [] },
  };
}

export function recordEdit(session: StudioSession, document: PublicPageDocument): StudioSession {
  const undo = [...(session.history?.undo ?? []), session.document].slice(-40);
  return markUnsaved({ ...session, history: { undo, redo: [] } }, document);
}

export function undoEdit(session: StudioSession): StudioSession {
  const undo = session.history?.undo ?? [];
  if (undo.length === 0) return session;
  const previous = undo[undo.length - 1];
  return markUnsaved(
    { ...session, history: { undo: undo.slice(0, -1), redo: [...(session.history?.redo ?? []), session.document] } },
    previous,
  );
}

export function redoEdit(session: StudioSession): StudioSession {
  const redo = session.history?.redo ?? [];
  if (redo.length === 0) return session;
  const next = redo[redo.length - 1];
  return markUnsaved(
    { ...session, history: { undo: [...(session.history?.undo ?? []), session.document], redo: redo.slice(0, -1) } },
    next,
  );
}

export function dismissProposal(session: StudioSession): StudioSession {
  return { ...session, proposal: null };
}

export function sessionFromDraft(
  document: PublicPageDocument,
  expectedRevision: number | null,
  capabilities: readonly PublicPageCapability[],
): StudioSession {
  return {
    document,
    savedDocument: document,
    expectedRevision,
    persistenceState: expectedRevision === null ? "LOCAL" : "SERVER",
    publishedRevision: null,
    phase: expectedRevision === null ? "LOCAL_DRAFT" : "DRAFT_SAVED",
    viewport: "DESKTOP",
    proposal: null,
    capabilities,
  };
}

export function markUnsaved(session: StudioSession, document: PublicPageDocument): StudioSession {
  return { ...session, document, phase: "UNSAVED", proposal: null };
}

export async function saveStudioDraft(
  session: StudioSession,
  persistence: PublicPagePersistence,
  actor: PublicPageActor,
  profileKind: PublicPageProfileKind,
): Promise<StudioSession> {
  if (session.persistenceState === "LOCAL") {
    try {
      const created = await persistence.createDraft(actor, profileKind, session.document);
      if (!created.ok) return { ...session, phase: "LOCAL_DRAFT" };
      return {
        ...session,
        document: created.document,
        savedDocument: created.document,
        expectedRevision: created.revisionNumber,
        persistenceState: "SERVER",
        phase: "DRAFT_SAVED",
        proposal: null,
      };
    } catch {
      return { ...session, phase: "LOCAL_DRAFT" };
    }
  }
  if (session.expectedRevision === null) return { ...session, phase: "SAVE_FAILED" };
  try {
    const saved = await persistence.saveDraft(actor, profileKind, session.expectedRevision, session.document);
    if (!saved.ok) {
      if (saved.code === "REVISION_CONFLICT") return { ...session, phase: "CONFLICT" };
      return { ...session, phase: "SAVE_FAILED" };
    }
    return {
      ...session,
      document: saved.document,
      savedDocument: saved.document,
      expectedRevision: saved.revisionNumber,
      phase: "DRAFT_SAVED",
      proposal: null,
    };
  } catch {
    return { ...session, phase: "SAVE_FAILED" };
  }
}

export async function publishStudioDraft(
  session: StudioSession,
  persistence: PublicPagePersistence,
  actor: PublicPageActor,
  profileKind: PublicPageProfileKind,
): Promise<StudioSession> {
  if (session.persistenceState !== "SERVER" || session.expectedRevision === null || session.phase === "UNSAVED" || session.phase === "SAVE_FAILED" || session.phase === "LOCAL_DRAFT" || session.phase === "CONFLICT") return session;
  const expectedRevision = session.expectedRevision;
  const publishing: StudioSession = { ...session, phase: "PUBLISHING" };
  const published = await persistence.publishDraft(actor, profileKind, expectedRevision);
  if (!published.ok) {
    if (published.code === "REVISION_CONFLICT") return { ...session, phase: "CONFLICT" };
    return session;
  }
  return {
    ...session,
    publishedRevision: published.revisionNumber,
    phase: "PUBLISHED",
    expectedRevision: session.expectedRevision,
  };
}

export async function restoreStudioRevision(
  session: StudioSession,
  persistence: PublicPagePersistence,
  actor: PublicPageActor,
  profileKind: PublicPageProfileKind,
  sourceRevisionId: string,
): Promise<StudioSession> {
  if (session.expectedRevision === null) return session;
  const restored = await persistence.restoreRevision(
    actor,
    profileKind,
    sourceRevisionId,
    session.expectedRevision,
  );
  if (!restored.ok) {
    if (restored.code === "REVISION_CONFLICT") return { ...session, phase: "CONFLICT" };
    return session;
  }
  return {
    ...session,
    document: restored.document,
    savedDocument: restored.document,
    expectedRevision: restored.revisionNumber,
    phase: "DRAFT_SAVED",
    proposal: null,
  };
}

export function reloadAfterConflict(session: StudioSession, fresh: PublicPageDocument, revision: number): StudioSession {
  return {
    ...session,
    document: fresh,
    savedDocument: fresh,
    expectedRevision: revision,
    phase: "DRAFT_SAVED",
    proposal: null,
  };
}
