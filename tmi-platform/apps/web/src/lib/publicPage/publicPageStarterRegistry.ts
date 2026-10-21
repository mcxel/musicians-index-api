/**
 * First-run page designs. Each starter is a sanitized PublicPageDocument seed.
 * Choosing one clones that seed into the owner's draft. It does not publish,
 * and it does not keep the page bound to the starter definition.
 */

import { createMinimalPublicPage, dropObject } from "./pageStudio";
import {
  collagePage,
  cyberpunkNeonPage,
  editorialPage,
  glitterChromePage,
  minimalPage,
  obsidianGlassPage,
  botPortraitPage,
} from "./publicPageProofFixtures";
import type { PublicPageDocument, PublicPageProfileKind } from "./publicPageDocument";
import { validatePublicPageDocument } from "./validatePublicPageDocument";

const BOUND_KINDS = new Set(["PHOTO", "TRACK", "PLAYLIST", "VIDEO", "SNIP"]);

export interface PublicPageStarter {
  id: string;
  name: string;
  summary: string;
  accentHex: string;
}

export const PUBLIC_PAGE_STARTERS: readonly PublicPageStarter[] = [
  { id: "dense", name: "DENSE", summary: "Gold type, a poem, and a compact gallery.", accentHex: "#FFD700" },
  { id: "cyber", name: "CYBER", summary: "Cyan signal type on a dark freeform stage.", accentHex: "#00FFFF" },
  { id: "editorial", name: "EDITORIAL", summary: "Magazine columns and a quiet paper ground.", accentHex: "#F4E7C5" },
  { id: "scrapbook", name: "SCRAPBOOK", summary: "A four-part layout with room for your own pictures.", accentHex: "#FFD700" },
  { id: "cinematic", name: "CINEMATIC", summary: "A full-screen dark glass opening.", accentHex: "#C8B4FF" },
  { id: "minimal", name: "MINIMAL", summary: "One sentence on a full-screen stage.", accentHex: "#FFFFFF" },
  { id: "wavetek", name: "WAVETEK", summary: "A bright stage layout. Your name and your pictures go here.", accentHex: "#FF2DAA" },
  { id: "blank", name: "START BLANK", summary: "An empty page. You place the first object.", accentHex: "#FFFFFF" },
];

const SOURCES: Record<string, () => PublicPageDocument> = {
  dense: glitterChromePage,
  cyber: cyberpunkNeonPage,
  editorial: editorialPage,
  scrapbook: collagePage,
  cinematic: obsidianGlassPage,
  minimal: minimalPage,
  wavetek: botPortraitPage,
};

const PROOF_IDENTITY = /wavetek|owner_proof|proof_|\/bot-images\/|bot_image|bot_|pp_pass|asset_quad_|asset_loop|asset_poster|track_one|img_wavetek/i;

function scrubIdentity(value: string): string {
  return value
    .replace(/wavetek/ig, "stage")
    .replace(/owner_proof/ig, "member")
    .replace(/proof_/ig, "seed_")
    .replace(/\/bot-images\/\S*/ig, "")
    .replace(/bot_image_\d+/ig, "swatch")
    .replace(/bot_/ig, "swatch_")
    .replace(/pp_pass\w*/ig, "member")
    .replace(/asset_quad_\w+/ig, "swatch")
    .replace(/asset_loop\w*/ig, "motion")
    .replace(/asset_poster\w*/ig, "poster")
    .replace(/track_one/ig, "track")
    .replace(/img_wavetek\w*/ig, "photo");
}

function scrubNode(value: unknown, key = ""): unknown {
  if (typeof value === "string") {
    if (key === "text" || key === "label") {
      const copy = starterCopy(value);
      return PROOF_IDENTITY.test(copy) ? "YOUR NAME" : copy;
    }
    return PROOF_IDENTITY.test(value) ? scrubIdentity(value) : value;
  }
  if (Array.isArray(value)) return value.map((entry) => scrubNode(entry));
  if (!value || typeof value !== "object") return value;
  const record = { ...(value as Record<string, unknown>) };
  for (const child of Object.keys(record)) record[child] = scrubNode(record[child], child);
  const path = typeof record.deliveryPath === "string" ? record.deliveryPath : "";
  const asset = typeof record.assetId === "string" ? record.assetId : "";
  const poster = typeof record.posterPath === "string" ? record.posterPath : "";
  if (
    typeof record.tileId === "string"
    && (path.includes("/bot-images/") || poster.includes("/bot-images/") || record.source === "VIDEO" || asset.startsWith("bot_") || asset.startsWith("asset_loop") || asset.startsWith("asset_poster") || asset.startsWith("asset_quad") || asset.startsWith("swatch") || asset === "motion" || asset === "poster")
  ) {
    return { tileId: record.tileId, source: "COLOR", colorHex: typeof record.colorHex === "string" ? record.colorHex : "#120018", opacity: 100, muted: true };
  }
  return record;
}

function starterCopy(text: string): string {
  if (/wavetek/i.test(text)) return "YOUR NAME";
  if (/bot image|seed portrait/i.test(text)) return "Write the line that belongs on this page.";
  return text;
}

function stripBoundBlocks(document: PublicPageDocument): PublicPageDocument {
  return {
    ...document,
    sections: document.sections.map((section) => {
      const blocks = section.blocks.flatMap((block) => {
        if (BOUND_KINDS.has(block.kind) || block.bindingRef) return [];
        const text = block.plainText?.text;
        return [text ? { ...block, plainText: { ...block.plainText, text: starterCopy(text) } } : block];
      });
      const kept = new Set(blocks.map((block) => block.id));
      return {
        ...section,
        blocks,
        panes: section.panes?.map((pane) => ({ ...pane, blockIds: pane.blockIds?.filter((id) => kept.has(id)) })),
      };
    }),
  };
}

function seed(starterId: string): PublicPageDocument {
  const source = SOURCES[starterId];
  if (!source) throw new Error(`Unknown starter ${starterId}`);
  const scrubbed = stripBoundBlocks(scrubNode(source()) as PublicPageDocument);
  return {
    ...scrubbed,
    documentId: `starter_${starterId}`,
    ownerUserId: "starter_registry",
    status: "DRAFT",
    publishedVersion: null,
    draftRevisionLabel: null,
  };
}

export function instantiateStarter(
  starterId: string,
  input: { ownerUserId: string; profileKind: PublicPageProfileKind; documentId: string; now?: string },
): PublicPageDocument {
  const now = input.now ?? new Date().toISOString();
  const document = starterId === "blank"
    ? createMinimalPublicPage({ documentId: input.documentId, ownerUserId: input.ownerUserId, profileKind: input.profileKind, now })
    : structuredClone(seed(starterId));
  const next: PublicPageDocument = {
    ...document,
    documentId: input.documentId,
    ownerUserId: input.ownerUserId,
    profileKind: input.profileKind,
    status: "DRAFT",
    publishedVersion: null,
    draftRevisionLabel: null,
    updatedAt: now,
  };
  const validated = validatePublicPageDocument(next);
  if (!validated.ok) {
    throw new Error(validated.issues.map((issue) => `${issue.path} ${issue.message}`).join("; "));
  }
  return next;
}

/** Preview may show the owner's real library photo. It never invents a binding. */
export function starterPreviewDocument(
  starterId: string,
  input: { ownerUserId: string; profileKind: PublicPageProfileKind; documentId: string; photoRecordId?: string | null; now?: string },
): PublicPageDocument {
  const document = instantiateStarter(starterId, input);
  const recordId = input.photoRecordId?.trim();
  if (!recordId) return document;
  const placed = dropObject(document, "PHOTO", ["BASE"], recordId);
  return placed.added ? placed.document : document;
}
