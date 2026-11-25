"use client";

/**
 * Visual Your Page layout gallery.
 * START BLANK first, then the existing starter documents — not new templates.
 * Thumbnails and the large preview are the real starter composition.
 */

import { useMemo } from "react";
import PublicPagePublishedView from "@/components/profile/PublicPagePublishedView";
import { presentPublicProfile } from "@/lib/publicPage/presentPublicPageDocument";
import type { DocumentPreviewPresentation } from "@/lib/publicPage/presentPublicPageDocument";
import type { PublicPageCapability, PublicPageDocument, PublicPageProfileKind } from "@/lib/publicPage/publicPageDocument";
import {
  starterPreviewDocument,
  type PublicPageStarter,
} from "@/lib/publicPage/publicPageStarterRegistry";

const controlStyle: React.CSSProperties = { minHeight: 44, padding: "10px 12px" };

function asPreview(
  value: ReturnType<typeof presentPublicProfile>,
): DocumentPreviewPresentation | null {
  return value && "mode" in value && value.mode === "DOCUMENT_PREVIEW" ? value : null;
}

function regionLabels(document: PublicPageDocument): string {
  const kinds = document.sections.flatMap((section) =>
    [section.kind, section.layout, ...section.blocks.map((block) => block.kind)],
  );
  return Array.from(new Set(kinds)).join(" · ");
}

function LayoutCompositionThumb({
  starterId,
  document,
  accentHex,
}: {
  starterId: string;
  document: PublicPageDocument;
  accentHex: string;
}) {
  const surface = document.theme.surfaceColorHex || "#050510";
  const ink = accentHex === "#FFFFFF" || accentHex === "#F4E7C5" || accentHex === "#FFD700" ? "#120018" : "#F4F1FF";
  return (
    <div
      data-testid={`layout-thumb-art-${starterId}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        height: 120,
        padding: 8,
        background: surface === "#FFFFFF" ? "#0a0614" : surface,
        overflow: "hidden",
      }}
    >
      {document.sections.map((section) => (
        <div
          key={section.sectionId}
          style={{
            flex: section.heightMode === "FULL_SCREEN" ? 2 : 1,
            minHeight: 22,
            border: `1px solid ${accentHex}`,
            borderRadius: 6,
            padding: 4,
            background: `${accentHex}22`,
            color: ink,
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.04em",
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            alignContent: "flex-start",
          }}
        >
          <span style={{ width: "100%", opacity: 0.9 }}>{section.layout}</span>
          {section.blocks.slice(0, 6).map((block) => (
            <span
              key={block.id}
              style={{
                border: `1px solid ${accentHex}`,
                borderRadius: 3,
                padding: "1px 4px",
                background: "#050510",
                color: accentHex,
              }}
            >
              {block.kind}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function YourPageLayoutPicker({
  firstUse,
  starters,
  selectedId,
  onSelect,
  onApply,
  onClose,
  ownerUserId,
  profileKind,
  documentId,
  photoRecordId,
  capabilities,
}: {
  firstUse: boolean;
  starters: readonly PublicPageStarter[];
  selectedId: string | null;
  onSelect: (starterId: string) => void;
  onApply: (starterId: string) => void;
  onClose: () => void;
  ownerUserId: string;
  profileKind: PublicPageProfileKind;
  documentId: string;
  photoRecordId?: string | null;
  capabilities: readonly PublicPageCapability[];
}) {
  const chosen = selectedId ?? starters[0]?.id ?? "blank";
  const docs = useMemo(() => {
    return starters.map((starter) => ({
      starter,
      document: starterPreviewDocument(starter.id, {
        ownerUserId,
        profileKind,
        documentId: `${documentId}_${starter.id}_preview`,
        photoRecordId: starter.id === "blank" ? null : photoRecordId,
      }),
    }));
  }, [starters, ownerUserId, profileKind, documentId, photoRecordId]);
  const selected = docs.find((entry) => entry.starter.id === chosen) ?? docs[0];
  const hero = selected
    ? asPreview(presentPublicProfile({
        mode: "DOCUMENT_PREVIEW",
        document: selected.document,
        authorizedCapabilities: capabilities,
      }))
    : null;

  return (
    <div
      data-testid="starter-picker"
      data-layout-picker="visual"
      data-first-use={firstUse ? "1" : "0"}
      style={{
        position: "fixed",
        zIndex: 80,
        top: 8,
        left: 8,
        right: 8,
        bottom: 8,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#050510",
        border: "1px solid #FF2DAA",
        borderRadius: 12,
        color: "#F4F1FF",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
          padding: "12px 14px 8px",
          flexShrink: 0,
        }}
      >
        <div>
          <p style={{ margin: 0, fontWeight: 800, letterSpacing: "0.08em" }}>
            {firstUse ? "CHOOSE YOUR PAGE LAYOUT" : "CHANGE PAGE LAYOUT"}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(244,241,255,0.75)", lineHeight: 1.4 }}>
            START BLANK is first. The pictures are the real layouts. Applying a layout rearranges the page — it does not replace your profile, media, or YoPho.
          </p>
        </div>
        <button
          type="button"
          data-testid="starter-close"
          aria-label="Close layout picker"
          onClick={onClose}
          style={{ ...controlStyle, minWidth: 44, fontWeight: 900, background: "transparent", color: "#F4F1FF", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 8 }}
        >
          X
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "0 14px 12px" }}>
        {selected ? (
          <div data-testid="starter-preview" data-layout-hero={selected.starter.id} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#FFD700", marginBottom: 6 }}>
              {selected.starter.name} PREVIEW
            </div>
            <div
              style={{
                maxHeight: "46vh",
                overflow: "auto",
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: 10,
                background: "#0a0614",
              }}
            >
              {hero ? (
                <PublicPagePublishedView presentation={hero} />
              ) : (
                <LayoutCompositionThumb starterId={selected.starter.id} document={selected.document} accentHex={selected.starter.accentHex} />
              )}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: "rgba(244,241,255,0.7)" }}>
              {regionLabels(selected.document)}
            </div>
          </div>
        ) : null}

        <div
          data-testid="layout-gallery"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 8,
          }}
        >
          {docs.map(({ starter, document }) => {
            const selectedCard = starter.id === chosen;
            const labelColor = starter.accentHex === "#FFFFFF" || starter.accentHex === "#F4E7C5" || starter.accentHex === "#FFD700" ? "#120018" : "#F4F1FF";
            return (
              <button
                key={starter.id}
                type="button"
                data-testid={`starter-${starter.id}`}
                onClick={() => onSelect(starter.id)}
                style={{
                  textAlign: "left",
                  padding: 0,
                  overflow: "hidden",
                  borderRadius: 10,
                  border: selectedCard ? "2px solid #FFFFFF" : "1px solid rgba(255,255,255,0.35)",
                  background: starter.accentHex,
                  color: labelColor,
                  cursor: "pointer",
                }}
              >
                <LayoutCompositionThumb starterId={starter.id} document={document} accentHex={starter.accentHex} />
                <span style={{ display: "block", padding: "8px 10px 4px", fontWeight: 800 }}>{starter.name}</span>
                <span style={{ display: "block", padding: "0 10px 10px", fontWeight: 500, fontSize: 11, color: "#120018" }}>{starter.summary}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 12,
          flexShrink: 0,
          borderTop: "1px solid rgba(255,45,170,0.35)",
          background: "#050510",
        }}
      >
        <button type="button" data-testid="starter-close-footer" style={{ ...controlStyle, flex: 1, fontWeight: 800 }} onClick={onClose}>
          BACK
        </button>
        <button
          type="button"
          data-testid="starter-use"
          disabled={!chosen}
          style={{ ...controlStyle, flex: 2, fontWeight: 900, background: "linear-gradient(135deg, #FFD700, #FF6B00)", border: "none", color: "#050510", borderRadius: 8 }}
          onClick={() => onApply(chosen)}
        >
          APPLY LAYOUT
        </button>
      </div>
    </div>
  );
}
