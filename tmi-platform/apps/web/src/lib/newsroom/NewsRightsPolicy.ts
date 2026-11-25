/**
 * §20982/§20983 — rights enforcement. A real, small, testable policy
 * function — not the full "rights engine" the spec describes (no per-item
 * override table, no legal-review workflow), but genuinely enforced: every
 * connector's declared rightsMode is checked here before any TMI surface may
 * use full text / an image / a video from that source. UNKNOWN_RIGHTS
 * defaults restrictive on every axis, per the owner's explicit law.
 */

import type { NewsSourceRightsMode } from "./NewsSourceConnectorRegistry";

export type NewsReuseKind = "FULL_TEXT" | "SHORT_QUOTE" | "LINK_AND_METADATA" | "IMAGE" | "VIDEO";

const ALLOWED_BY_RIGHTS_MODE: Record<NewsSourceRightsMode, ReadonlySet<NewsReuseKind>> = {
  // Discovery may attribute + link to the publisher's own URL — never full text/image/video.
  DISCOVERY_ONLY: new Set(["LINK_AND_METADATA"]),
  LINK_AND_METADATA: new Set(["LINK_AND_METADATA"]),
  SHORT_QUOTE_ALLOWED: new Set(["LINK_AND_METADATA", "SHORT_QUOTE"]),
  FULL_TEXT_LICENSED: new Set(["LINK_AND_METADATA", "SHORT_QUOTE", "FULL_TEXT"]),
  IMAGE_LICENSED: new Set(["LINK_AND_METADATA", "IMAGE"]),
  VIDEO_LICENSED: new Set(["LINK_AND_METADATA", "VIDEO"]),
  PUBLIC_DOMAIN: new Set(["LINK_AND_METADATA", "SHORT_QUOTE", "FULL_TEXT", "IMAGE", "VIDEO"]),
  OFFICIAL_PUBLIC_INFORMATION: new Set(["LINK_AND_METADATA", "SHORT_QUOTE", "FULL_TEXT"]),
  // Restrictive by law — never grant any reuse kind on unknown rights.
  UNKNOWN_RIGHTS: new Set([]),
};

export function canReuse(rightsMode: NewsSourceRightsMode, kind: NewsReuseKind): boolean {
  return ALLOWED_BY_RIGHTS_MODE[rightsMode].has(kind);
}

/**
 * The one rule that matters most: "discovery does not equal republication
 * permission." A GDELT-style DISCOVERY_ONLY source may never back a
 * full-text, image, or video reuse — only link+metadata of the discovered
 * publisher's own article URL (never GDELT's page, never scraped body).
 * UNKNOWN_RIGHTS stays fully denied until classified.
 */
export function isDiscoveryOnlySource(rightsMode: NewsSourceRightsMode): boolean {
  return rightsMode === "DISCOVERY_ONLY" || rightsMode === "UNKNOWN_RIGHTS";
}
