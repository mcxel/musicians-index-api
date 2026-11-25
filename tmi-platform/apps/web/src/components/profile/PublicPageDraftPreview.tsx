"use client";

/**
 * Owner in-memory draft surface. Renders the C.3 presentation plan.
 * It is not a second public-page renderer and it does not edit Magnet bounds.
 */

import type { PublicPageCapability, PublicPageDocument } from "@/lib/publicPage/publicPageDocument";
import { editDraftPlainText, previewDraftDocument } from "@/lib/publicPage/editPublicPageDraft";

export default function PublicPageDraftPreview({
  document,
  authorizedCapabilities = ["BASE"],
  onDocumentChange,
}: {
  document: PublicPageDocument;
  authorizedCapabilities?: readonly PublicPageCapability[];
  onDocumentChange?: (next: PublicPageDocument) => void;
}) {
  const preview = previewDraftDocument(document, authorizedCapabilities);
  if (preview.mode === "REJECTED") {
    return (
      <section data-testid="public-page-draft-rejected">
        This draft is not a valid public page. Nothing was invented to fill it.
      </section>
    );
  }
  if (preview.mode !== "DOCUMENT_PREVIEW") return null;

  return (
    <section data-testid="public-page-draft-preview">
      {preview.hero ? (
        <p data-testid="draft-hero">{preview.hero.headline}</p>
      ) : null}
      {preview.textBlocks.map((row) => (
        <label key={row.blockId} data-testid={`draft-text-${row.blockId}`} style={{ display: "block" }}>
          <span>{row.kind}</span>
          <textarea
            value={row.text}
            onChange={(event) => {
              onDocumentChange?.(editDraftPlainText(document, row.blockId, event.target.value));
            }}
          />
        </label>
      ))}
      {preview.trackBlocks.map((row) => (
        <p key={row.blockId} data-testid={`draft-track-${row.blockId}`}>
          Track {row.recordId} is not resolved. It is not the profile soundtrack.
        </p>
      ))}
      {preview.magnets.map((row) => (
        <p key={row.blockId} data-testid={`draft-magnet-${row.blockId}`}>
          Placement {row.bounds.x},{row.bounds.y} {row.bounds.w}×{row.bounds.h} z{row.bounds.z}
        </p>
      ))}
      {preview.capabilityDenied.map((blockId) => (
        <p key={blockId} data-testid={`draft-denied-${blockId}`}>
          This block is not available for the current capability.
        </p>
      ))}
    </section>
  );
}
