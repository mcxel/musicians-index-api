/**
 * Gate C.4 — in-memory draft edits and the preview model the existing
 * public pages render. No persistence. No reverse mapping into
 * PublicProfileConfig.
 */

import type { PublicPageCapability, PublicPageDocument } from "./publicPageDocument";
import { presentPublicProfile } from "./presentPublicPageDocument";
import type { DocumentPreviewPresentation } from "./presentPublicPageDocument";

export interface DraftTextRow {
  blockId: string;
  kind: string;
  text: string;
}

export interface DraftTrackRow {
  blockId: string;
  recordId: string;
  collapsedIntoSoundtrack: false;
}

export interface DraftMagnetRow {
  blockId: string;
  kind: string;
  bounds: { x: number; y: number; w: number; h: number; z: number };
  editable: false;
}

export interface DraftPreviewModel {
  ok: true;
  textBlocks: DraftTextRow[];
  trackBlocks: DraftTrackRow[];
  hero: { blockId: string; headline: string; persisted: false } | null;
  magnets: DraftMagnetRow[];
  capabilityDenied: string[];
  serializedToPublicProfileConfig: false;
}

export type DraftPreviewResult =
  | { mode: "LEGACY" }
  | { mode: "REJECTED" }
  | ({ mode: "DOCUMENT_PREVIEW" } & DraftPreviewModel);

/** Legacy profiles do not receive a synthesized document. */
export function previewDraftDocument(
  document: unknown,
  authorizedCapabilities: readonly PublicPageCapability[] = ["BASE"],
): DraftPreviewResult {
  if (document == null) return { mode: "LEGACY" };
  const presented = presentPublicProfile({
    mode: "DOCUMENT_PREVIEW",
    document,
    authorizedCapabilities,
  });
  if (!("mode" in presented) || presented.mode !== "DOCUMENT_PREVIEW") {
    return { mode: "REJECTED" };
  }
  return modelFromPresentation(presented);
}

export function editDraftPlainText(
  document: PublicPageDocument,
  blockId: string,
  text: string,
): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) =>
        block.id === blockId ? { ...block, plainText: { text } } : block,
      ),
    })),
  };
}

function modelFromPresentation(presented: DocumentPreviewPresentation): DraftPreviewResult {
  const textBlocks = presented.entries
    .filter((entry) => entry.disposition === "PRESENTABLE_TEXT" && entry.textFormat === "PLAIN")
    .map((entry) => ({
      blockId: entry.blockId,
      kind: entry.kind,
      text: entry.plainText ?? "",
    }));
  const trackBlocks = presented.entries
    .filter((entry) => entry.kind === "TRACK")
    .map((entry) => ({
      blockId: entry.blockId,
      recordId: entry.binding?.recordId ?? "",
      collapsedIntoSoundtrack: false as const,
    }));
  const heroEntry = presented.entries.find((entry) => entry.disposition === "HERO_PRESENTATION");
  const magnets = presented.entries
    .filter((entry) => entry.placement === "MAGNET")
    .map((entry) => ({
      blockId: entry.blockId,
      kind: entry.kind,
      bounds: {
        x: entry.bounds.x,
        y: entry.bounds.y,
        w: entry.bounds.w,
        h: entry.bounds.h,
        z: entry.bounds.z,
      },
      editable: false as const,
    }));
  return {
    mode: "DOCUMENT_PREVIEW",
    ok: true,
    textBlocks,
    trackBlocks,
    hero: heroEntry
      ? { blockId: heroEntry.blockId, headline: heroEntry.heroPresentation?.headline ?? "", persisted: false }
      : null,
    magnets,
    capabilityDenied: presented.entries
      .filter((entry) => entry.disposition === "CAPABILITY_DENIED")
      .map((entry) => entry.blockId),
    serializedToPublicProfileConfig: false,
  };
}
