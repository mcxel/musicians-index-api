/**
 * One Community Gossip or Happy Days record, plus one Your Page magnet.
 * Moving the magnet does not copy the post. Magazine, friends, and private never land here.
 * The page document is the existing public-page document, saved on this device when the server table is unavailable.
 */

import type {
  HappyDaysAttribution,
  PublicPresentationChoice,
  SocialMomentChannel,
} from "./HappyDaysContracts";
import { formatAttributionLabel, HappyDaysRegistry } from "./HappyDaysStore";
import type { PublicPageCapability, PublicPageDocument, PublicPageProfileKind } from "@/lib/publicPage/publicPageDocument";
import { createMinimalPublicPage, placeSocialMomentOnPage } from "@/lib/publicPage/pageStudio";
import { validatePublicPageDocument } from "@/lib/publicPage/validatePublicPageDocument";

const SOURCE_KEY = "tmi_social_page_sources_v1";
const DRAFT_KEY = "tmi_public_page_local_draft_v1";

export type SocialPagePlacement = "QUEUED" | "PLACED" | "PLACEMENT_FAILED" | "REMOVED_FROM_PAGE";

export type SocialPageSource = {
  id: string;
  ownerUserId: string;
  channel: SocialMomentChannel;
  text: string;
  displayLabel: string;
  attribution: HappyDaysAttribution;
  presentation: PublicPresentationChoice;
  userId: string;
  visibility: "public_page" | "hidden";
  profileKind: PublicPageProfileKind;
  trackTitle?: string;
  createdAt: number;
  blockId: string | null;
  placement: SocialPagePlacement;
};

function readSources(): SocialPageSource[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SOURCE_KEY);
    const parsed = raw ? JSON.parse(raw) as SocialPageSource[] : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSources(sources: SocialPageSource[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOURCE_KEY, JSON.stringify(sources));
}

function draftKey(ownerUserId: string, profileKind: PublicPageProfileKind) {
  return `${DRAFT_KEY}:${ownerUserId}:${profileKind}`;
}

export function readLocalPublicPageDraft(ownerUserId: string, profileKind: PublicPageProfileKind): PublicPageDocument | null {
  if (typeof window === "undefined" || !ownerUserId || ownerUserId === "pending_owner") return null;
  try {
    const raw = window.localStorage.getItem(draftKey(ownerUserId, profileKind));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PublicPageDocument;
    const validated = validatePublicPageDocument(parsed);
    return validated.ok ? parsed : null;
  } catch {
    return null;
  }
}

export function writeLocalPublicPageDraft(ownerUserId: string, profileKind: PublicPageProfileKind, document: PublicPageDocument) {
  if (typeof window === "undefined" || !ownerUserId || ownerUserId === "pending_owner") return;
  const validated = validatePublicPageDocument(document);
  if (!validated.ok) return;
  window.localStorage.setItem(draftKey(ownerUserId, profileKind), JSON.stringify(document));
}

export function listSocialPageSources(ownerUserId: string): SocialPageSource[] {
  return readSources().filter((source) => source.ownerUserId === ownerUserId);
}

function boundIds(document: PublicPageDocument): Set<string> {
  return new Set(
    document.sections.flatMap((section) => section.blocks).flatMap((block) =>
      block.bindingRef?.recordId ? [block.bindingRef.recordId] : []),
  );
}

/** Drop queued public posts onto the page. Hide a block when its source is private or gone. */
export function applySocialMomentsToPage(
  document: PublicPageDocument,
  ownerUserId: string,
  capabilities: readonly PublicPageCapability[],
  rememberRemovals = true,
): PublicPageDocument {
  const sources = readSources();
  const mine = sources.filter((source) => source.ownerUserId === ownerUserId);
  let next = document;
  const present = boundIds(next);
  for (const source of mine) {
    if (source.visibility !== "public_page") continue;
    if (source.placement === "REMOVED_FROM_PAGE") continue;
    if (present.has(source.id)) {
      source.placement = "PLACED";
      continue;
    }
    if (source.placement === "PLACED" && rememberRemovals) {
      source.placement = "REMOVED_FROM_PAGE";
      source.blockId = null;
      continue;
    }
    const placed = placeSocialMomentOnPage(next, {
      contentId: source.id,
      title: source.channel === "HAPPY_DAYS" ? "Happy Days" : "Community Gossip",
      text: publicBody(source),
    }, capabilities);
    if (!placed.added || !placed.blockId) {
      source.placement = "PLACEMENT_FAILED";
      continue;
    }
    const validated = validatePublicPageDocument(placed.document);
    if (!validated.ok) {
      source.placement = "PLACEMENT_FAILED";
      continue;
    }
    next = placed.document;
    source.blockId = placed.blockId;
    source.placement = "PLACED";
    present.add(source.id);
  }
  next = hidePrivateSocialMoments(next, mine);
  writeSources(sources);
  return next;
}

export function hidePrivateSocialMoments(document: PublicPageDocument, sources = readSources()): PublicPageDocument {
  const byId = new Map(sources.map((source) => [source.id, source]));
  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) => {
        const recordId = block.bindingRef?.recordId;
        if (!recordId || !recordId.startsWith("hd-sub-")) return block;
        const source = byId.get(recordId);
        if (source && source.visibility === "public_page") return block;
        return { ...block, visibility: "HIDDEN" as const, plainText: { text: "" } };
      }),
    })),
  };
}

function publicBody(source: SocialPageSource): string {
  const lines = [source.text];
  if (source.trackTitle) lines.push(`Music: ${source.trackTitle}`);
  if (source.presentation !== "QUOTE_ONLY") lines.push(source.displayLabel);
  return lines.join("\n");
}

export function publishSocialMomentToPublicPage(input: {
  promptId: string;
  promptText: string;
  response: string;
  userRole: "fan" | "performer";
  userId: string;
  displayName: string;
  attribution: HappyDaysAttribution;
  presentation: PublicPresentationChoice;
  channel: SocialMomentChannel;
  trackTitle?: string;
  trackArtist?: string;
}): { ok: boolean; contentId: string | null; placement: SocialPagePlacement | null; notice: string } {
  if (!input.userId || input.userId === "anon-user") {
    return { ok: false, contentId: null, placement: null, notice: "Sign in to post this to your public page." };
  }
  const text = input.response.trim();
  if (!text) {
    return { ok: false, contentId: null, placement: null, notice: "Write something before posting to your public page." };
  }
  const profileKind: PublicPageProfileKind = input.userRole === "performer" ? "PERFORMER" : "FAN";
  const saved = HappyDaysRegistry.submitResponse({
    promptId: input.promptId,
    promptText: input.promptText,
    response: text,
    userRole: input.userRole,
    userId: input.userId,
    displayName: input.displayName,
    attributionPreference: input.attribution,
    destination: "public_page",
    attachedTrack: input.trackTitle ? { title: input.trackTitle, artist: input.trackArtist || input.displayName } : undefined,
  });
  const source: SocialPageSource = {
    id: saved.id,
    ownerUserId: input.userId,
    channel: input.channel,
    text,
    displayLabel: formatAttributionLabel(input.attribution, input.displayName, input.userRole, input.userId),
    attribution: input.attribution,
    presentation: input.presentation,
    userId: input.userId,
    visibility: "public_page",
    profileKind,
    trackTitle: input.trackTitle ? `${input.trackTitle}${input.trackArtist ? ` — ${input.trackArtist}` : ""}` : undefined,
    createdAt: saved.submittedAt,
    blockId: null,
    placement: "QUEUED",
  };
  const sources = readSources().filter((item) => item.id !== source.id);
  sources.unshift(source);
  writeSources(sources);
  const capabilities: PublicPageCapability[] = profileKind === "PERFORMER" ? ["BASE", "PERFORMER"] : ["BASE"];
  let document = readLocalPublicPageDraft(input.userId, profileKind);
  if (!document) {
    try {
      document = createMinimalPublicPage({
        documentId: `doc_${profileKind.toLowerCase()}_${input.userId}`,
        ownerUserId: input.userId,
        profileKind,
      });
    } catch {
      source.placement = "PLACEMENT_FAILED";
      writeSources(sources);
      return {
        ok: false,
        contentId: saved.id,
        placement: "PLACEMENT_FAILED",
        notice: "The post is saved. Your Page could not open a placement yet. Open Your Page and add it from saved posts.",
      };
    }
  }
  const placedDocument = applySocialMomentsToPage(document, input.userId, capabilities, Boolean(readLocalPublicPageDraft(input.userId, profileKind)));
  const placed = readSources().find((item) => item.id === saved.id);
  if (!placed || placed.placement !== "PLACED") {
    return {
      ok: false,
      contentId: saved.id,
      placement: placed?.placement ?? "PLACEMENT_FAILED",
      notice: "The post is saved. Placement on Your Page did not finish. Open Your Page and add it from saved posts.",
    };
  }
  writeLocalPublicPageDraft(input.userId, profileKind, placedDocument);
  return {
    ok: true,
    contentId: saved.id,
    placement: "PLACED",
    notice: "Posted to your public page. Open Your Page to move, resize, or restyle it. Magazine, friends, and private were not changed.",
  };
}

export function queueSocialMomentForPage(contentId: string): void {
  const sources = readSources();
  const source = sources.find((item) => item.id === contentId);
  if (!source || source.visibility !== "public_page") return;
  source.placement = "QUEUED";
  source.blockId = null;
  writeSources(sources);
}

export function sourcesMissingFromPage(ownerUserId: string, document: PublicPageDocument | null): SocialPageSource[] {
  const present = document ? boundIds(document) : new Set<string>();
  return listSocialPageSources(ownerUserId).filter((source) =>
    source.visibility === "public_page" && !present.has(source.id));
}
