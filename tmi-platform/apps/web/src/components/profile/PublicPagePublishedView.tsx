import type { DocumentPreviewPresentation } from "@/lib/publicPage/presentPublicPageDocument";
import PublicPageCanvas from "@/components/profile/PublicPageCanvas";

/**
 * Read-only visitor presentation of a published Public Page document.
 * No textareas, no draft mutation, no config write.
 */
export default function PublicPagePublishedView({
  presentation,
  selectedSectionId,
  onSelectSection,
  selectedBlockId,
  onSelectBlock,
  onMagnetPointerDown,
  onMagnetPointerMove,
  onMagnetPointerUp,
  ownerUserId,
  adjustingBlockId,
  onBeginAdjust,
  onCanvasPlace,
  editingBlockId,
  onUpdateBlockText,
  onSetEditingBlockId,
}: {
  presentation: DocumentPreviewPresentation;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  onMagnetPointerDown?: (blockId: string, mode: "move" | "resize" | "rotate", event: React.PointerEvent<HTMLElement>) => void;
  onMagnetPointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
  onMagnetPointerUp?: () => void;
  ownerUserId?: string;
  adjustingBlockId?: string | null;
  onBeginAdjust?: (blockId: string) => void;
  editingBlockId?: string | null;
  onUpdateBlockText?: (blockId: string, text: string) => void;
  onSetEditingBlockId?: (blockId: string | null) => void;
  onCanvasPlace?: (detail: {
    sectionId: string;
    clientX: number;
    clientY: number;
    rect: { left: number; top: number; width: number; height: number };
    blockId: string | null;
    kind: string | null;
  }) => void;
}) {
  if (presentation.canvas) {
    return (
      <section data-testid="public-page-published" data-document-id={presentation.documentId}>
        <PublicPageCanvas
          presentation={presentation}
          selectedSectionId={selectedSectionId}
          onSelectSection={onSelectSection}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onMagnetPointerDown={onMagnetPointerDown}
          onMagnetPointerMove={onMagnetPointerMove}
          onMagnetPointerUp={onMagnetPointerUp}
          ownerUserId={ownerUserId}
          adjustingBlockId={adjustingBlockId}
          onBeginAdjust={onBeginAdjust}
          onCanvasPlace={onCanvasPlace}
          editingBlockId={editingBlockId}
          onUpdateBlockText={onUpdateBlockText}
          onSetEditingBlockId={onSetEditingBlockId}
        />
      </section>
    );
  }
  const visible = presentation.entries.filter(
    (entry) => entry.disposition !== "CAPABILITY_DENIED" && entry.disposition !== "SUPPRESSED_UNSAFE_TEXT",
  );
  const hero = visible.find((entry) => entry.disposition === "HERO_PRESENTATION");
  const texts = visible.filter((entry) => entry.disposition === "PRESENTABLE_TEXT");
  const tracks = visible.filter((entry) => entry.kind === "TRACK");
  const magnets = visible.filter((entry) => entry.placement === "MAGNET");

  return (
    <section data-testid="public-page-published" data-document-id={presentation.documentId}>
      {hero ? (
        <h1 data-testid="published-hero">{hero.heroPresentation?.headline ?? hero.plainText ?? ""}</h1>
      ) : null}
      {texts.map((entry) => (
        <p key={entry.blockId} data-testid={`published-text-${entry.blockId}`} data-kind={entry.kind}>
          {entry.plainText ?? ""}
        </p>
      ))}
      {tracks.map((entry) => (
        <p
          key={entry.blockId}
          data-testid={`published-track-${entry.blockId}`}
          data-authority={entry.binding?.authority ?? ""}
          data-record-id={entry.binding?.recordId ?? ""}
        />
      ))}
      {magnets.map((entry) => (
        <div
          key={entry.blockId}
          data-testid={`published-magnet-${entry.blockId}`}
          data-x={entry.bounds.x}
          data-y={entry.bounds.y}
          data-w={entry.bounds.w}
          data-h={entry.bounds.h}
          data-z={entry.bounds.z}
        >
          {entry.plainText ?? ""}
        </div>
      ))}
    </section>
  );
}
