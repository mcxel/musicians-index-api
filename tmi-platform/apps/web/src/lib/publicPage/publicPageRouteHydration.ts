/**
 * C.8 visitor hydration. Published Public Page documents only.
 * A private draft is never an input to the visitor presentation.
 */

import type { PublicPageCapability, PublicPageProfileKind } from "./publicPageDocument";
import type { PublicPageFailure, PublicPageLegacyFallback, PublicPagePublishedView } from "./publicPagePersistence";
import {
  presentPublicProfile,
  type DocumentPreviewPresentation,
  type PublicProfilePresentation,
} from "./presentPublicPageDocument";

export type PublishedRead = PublicPagePublishedView | PublicPageLegacyFallback | PublicPageFailure | null;

export interface VisitorHydration {
  mode: "LEGACY" | "DOCUMENT";
  presentation: PublicProfilePresentation;
  publishedPresentation: DocumentPreviewPresentation | null;
  touchesPublicProfileConfig: false;
  touchesContent: false;
}

const NO_WRITES = {
  touchesPublicProfileConfig: false as const,
  touchesContent: false as const,
};

export function capabilitiesFromDbRole(role: string): readonly PublicPageCapability[] {
  const normalized = role.trim().toUpperCase();
  if (normalized === "PERFORMER" || normalized === "ARTIST" || normalized === "BAND") {
    return ["BASE", "PERFORMER"];
  }
  return ["BASE"];
}

export function profileKindForPublicRole(role: string): PublicPageProfileKind | null {
  const normalized = role.trim().toUpperCase();
  if (normalized === "FAN" || normalized === "MEMBER" || normalized === "USER") return "FAN";
  if (normalized === "PERFORMER" || normalized === "ARTIST" || normalized === "BAND") return "PERFORMER";
  return null;
}

function isProfilePresentation(
  value: ReturnType<typeof presentPublicProfile>,
): value is PublicProfilePresentation {
  return "mode" in value;
}

function legacyHydration(): VisitorHydration {
  const presentation = presentPublicProfile({ mode: "LEGACY" });
  if (!isProfilePresentation(presentation) || presentation.mode !== "LEGACY") {
    return {
      mode: "LEGACY",
      presentation: { mode: "LEGACY", usesPublicProfileConfig: true, documentSynthesized: false, entries: [] },
      publishedPresentation: null,
      ...NO_WRITES,
    };
  }
  return { mode: "LEGACY", presentation, publishedPresentation: null, ...NO_WRITES };
}

/**
 * Visitor read. `ownerDraft` is accepted only so callers can prove it is ignored.
 */
export function hydrateVisitorPublishedPage(input: {
  published: PublishedRead;
  role: string;
  ownerDraft?: unknown;
}): VisitorHydration {
  void input.ownerDraft;
  if (!input.published || input.published.ok !== true || input.published.mode !== "PUBLISHED") {
    return legacyHydration();
  }
  const presented = presentPublicProfile({
    mode: "DOCUMENT_PREVIEW",
    document: input.published.document,
    authorizedCapabilities: capabilitiesFromDbRole(input.role),
  });
  if (!isProfilePresentation(presented) || presented.mode !== "DOCUMENT_PREVIEW") return legacyHydration();
  return {
    mode: "DOCUMENT",
    presentation: presented,
    publishedPresentation: presented,
    ...NO_WRITES,
  };
}
