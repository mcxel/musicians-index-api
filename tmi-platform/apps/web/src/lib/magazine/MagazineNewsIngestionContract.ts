/**
 * MagazineNewsIngestionContract — canonical ingested-news record for magazine.
 *
 * Pipeline (owner 2026-11-12):
 *   SOURCE → FETCH → PARSE → VALIDATE RIGHTS → DEDUPLICATE → STORE
 *   → EDITORIAL REVIEW → MAGAZINE COMPOSER
 *
 * Publicly reachable ≠ republication rights. Prefer LINK_AND_METADATA /
 * SHORT_QUOTE until a feed's terms explicitly allow more.
 *
 * Reuses NewsSourceRightsMode + NewsRightsPolicy — no duplicate rights engine.
 */

import type { NewsSourceRightsMode } from "@/lib/newsroom/NewsSourceConnectorRegistry";
import { canReuse } from "@/lib/newsroom/NewsRightsPolicy";

export type MagazineNewsRepublicationMode =
  | "LINK_AND_METADATA"
  | "SHORT_QUOTE"
  | "FULL_TEXT_AUTHORIZED"
  | "TMI_OWNED";

export type MagazineIngestedNewsRecord = {
  /** Stable id — prefer sourceId + canonicalUrl hash */
  recordId: string;
  headline: string;
  excerpt: string | null;
  /** Full body only when rights allow FULL_TEXT / TMI_OWNED */
  contentBody: string | null;
  originalImageUrl: string | null;
  imageCredit: string | null;
  imageReuseAllowed: boolean;
  sourceName: string;
  sourceUrl: string;
  canonicalUrl: string;
  author: string | null;
  publishedAt: string | null;
  language: string | null;
  rightsMode: NewsSourceRightsMode;
  republicationMode: MagazineNewsRepublicationMode;
  relatedPerformerSlug: string | null;
  relatedReleaseId: string | null;
  ingestedAt: string;
  editorialReviewRequired: boolean;
  providerId: string;
};

export function republicationModeFromRights(
  rightsMode: NewsSourceRightsMode,
  isTmiOwned: boolean,
): MagazineNewsRepublicationMode {
  if (isTmiOwned) return "TMI_OWNED";
  if (canReuse(rightsMode, "FULL_TEXT")) return "FULL_TEXT_AUTHORIZED";
  if (canReuse(rightsMode, "SHORT_QUOTE")) return "SHORT_QUOTE";
  return "LINK_AND_METADATA";
}

export function readableBodyForRecord(record: MagazineIngestedNewsRecord): string | null {
  if (record.republicationMode === "TMI_OWNED" || record.republicationMode === "FULL_TEXT_AUTHORIZED") {
    return record.contentBody ?? record.excerpt;
  }
  if (record.republicationMode === "SHORT_QUOTE") {
    return record.excerpt;
  }
  // LINK_AND_METADATA — headline + attribution only; excerpt optional short teaser
  return record.excerpt;
}

export function displayImageUrlForRecord(record: MagazineIngestedNewsRecord): string | null {
  if (!record.originalImageUrl) return null;
  if (!record.imageReuseAllowed) return null;
  if (!canReuse(record.rightsMode, "IMAGE") && record.republicationMode !== "TMI_OWNED") {
    return null;
  }
  return record.originalImageUrl;
}
