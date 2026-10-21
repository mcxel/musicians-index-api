/**
 * 1200×630 social poster ingredients from a published Public Page document.
 * Callers must pass the published revision. This module does not read drafts.
 */

import type { PublicPageDocument, PublicPageSection } from "./publicPageDocument";

const HEX = /^#[0-9A-Fa-f]{6}$/;
const TEXT_KINDS = new Set(["STATUS_LINE", "LONG_FORM_WRITING", "POEM", "QUOTE", "HEADING", "NOTE"]);

export interface PublishedSocialCard {
  displayName: string;
  title: string;
  description: string;
  revisionNumber: number | null;
  accentHex: string;
  surfaceHex: string;
  motto: string;
}

function hex(value: string | undefined, fallback: string): string {
  return value && HEX.test(value) ? value : fallback;
}

function safeLine(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

function publicText(section: PublicPageSection): string | null {
  if (section.hidden || section.visibility !== "PUBLIC") return null;
  for (const block of section.blocks) {
    if (block.visibility !== "PUBLIC" || !TEXT_KINDS.has(block.kind)) continue;
    const text = safeLine(block.plainText?.text ?? "");
    if (text.length > 0) return text.slice(0, 140);
  }
  return null;
}

export function composePublishedSocialCard(input: {
  displayName: string;
  document: PublicPageDocument | null;
  revisionNumber: number | null;
}): PublishedSocialCard {
  const displayName = safeLine(input.displayName).slice(0, 80) || "TMI";
  const document = input.document;
  const lines = document
    ? document.sections.slice().sort((a, b) => a.order - b.order).map(publicText).filter((line): line is string => Boolean(line))
    : [];
  const motto = lines.find((line) => line.toLowerCase() !== displayName.toLowerCase()) ?? lines[0] ?? "";
  const colored = document?.sections.find((section) => !section.hidden && section.visibility === "PUBLIC" && section.background?.colorHex);
  return {
    displayName,
    title: `${displayName} | TMI`,
    description: motto || `${displayName} on The Musician's Index.`,
    revisionNumber: document ? input.revisionNumber : null,
    accentHex: hex(document?.theme.accentColorHex, "#00FFFF"),
    surfaceHex: hex(document?.theme.surfaceColorHex ?? colored?.background?.colorHex, "#050510"),
    motto,
  };
}

/** Production share origin. A localhost env value is not a public canonical URL. */
export function canonicalShareOrigin(configured: string): string {
  try {
    const url = new URL(configured);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return "https://themusiciansindex.com";
    return configured.replace(/\/$/, "");
  } catch {
    return "https://themusiciansindex.com";
  }
}

export function publishedSocialImagePath(username: string, revisionNumber: number | null): string {
  const slug = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "") || "page";
  const path = `/p/${encodeURIComponent(slug)}/og`;
  return revisionNumber == null ? path : `${path}?rev=${revisionNumber}`;
}
