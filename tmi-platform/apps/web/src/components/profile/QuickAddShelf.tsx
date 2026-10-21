"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { PUBLIC_PAGE_SHAPES, WRITING_LABELS, type PublicPageShapeGroup } from "@/lib/publicPage/publicPageShapes";
import { placeShelf, shelfWindow } from "@/lib/publicPage/pageStudio";
import type { PublicPageMask } from "@/lib/publicPage/publicPageDocument";

const SHELF_W = 216;
const SHELF_H = 248;
const PAGE_SIZE = 4;

const SHAPE_GROUPS: readonly PublicPageShapeGroup[] = ["BASIC", "PERSONAL", "CREATIVE", "FRAME"];

const GLYPH: Partial<Record<PublicPageMask, string>> = {
  RECTANGLE: "▭",
  ROUNDED: "▢",
  SQUARE: "■",
  CIRCLE: "○",
  OVAL: "⬭",
  PILL: "▭",
  HEART: "♥",
  STAR: "★",
  CLOUD: "☁",
  SPEECH_BUBBLE: "💬",
  NOTE: "📝",
  DIAMOND: "◇",
  HEXAGON: "⬡",
  BURST: "✸",
  TICKET: "🎫",
  POLAROID: "▣",
  TORN_PAPER: "▭",
  FRAME: "▢",
  ARCH: "⌢",
  RECORD: "◉",
  POSTER: "▤",
  APPROVED_MASK: "▢",
};

export type QuickAddAnchor = {
  clientX: number;
  clientY: number;
  magnetX: number;
  magnetY: number;
  blockId: string | null;
  kind: string | null;
};

type ShelfId = "ROOT" | "WRITE" | "SHAPES" | PublicPageShapeGroup | "OBJECT";

/**
 * Compact add-here shelf. Child shelves replace this panel.
 * They do not open a second menu beside it.
 */
export default function QuickAddShelf({
  anchor,
  onClose,
  onWriting,
  onShape,
  onPhoto,
  onBox,
  onDecor,
  onDuplicate,
  onForward,
  onBack,
  onDelete,
  onAdjust,
}: {
  anchor: QuickAddAnchor;
  onClose: () => void;
  onWriting: (label: string) => void;
  onShape: (shapeId: PublicPageMask) => void;
  onPhoto: () => void;
  onBox: () => void;
  onDecor: () => void;
  onDuplicate: () => void;
  onForward: () => void;
  onBack: () => void;
  onDelete: () => void;
  onAdjust: () => void;
}) {
  const root: ShelfId = anchor.blockId ? "OBJECT" : "ROOT";
  const [shelf, setShelf] = useState<ShelfId>(root);
  const [page, setPage] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState(() =>
    placeShelf(anchor.clientX, anchor.clientY, SHELF_W, SHELF_H, window.innerWidth, window.innerHeight),
  );

  useEffect(() => {
    setShelf(anchor.blockId ? "OBJECT" : "ROOT");
    setPage(0);
    setPosition(placeShelf(anchor.clientX, anchor.clientY, SHELF_W, SHELF_H, window.innerWidth, window.innerHeight));
    panelRef.current?.focus();
  }, [anchor]);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (panelRef.current?.contains(event.target as Node)) return;
      onClose();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function openShelf(next: ShelfId) {
    setShelf(next);
    setPage(0);
  }

  const writing = shelf === "WRITE" ? shelfWindow(["Blank", ...WRITING_LABELS], page, PAGE_SIZE) : null;
  const shapes = SHAPE_GROUPS.includes(shelf as PublicPageShapeGroup)
    ? shelfWindow(PUBLIC_PAGE_SHAPES.filter((shape) => shape.group === shelf), page, PAGE_SIZE)
    : null;
  const paged = writing ?? shapes;

  function turn(delta: number) {
    if (!paged) return;
    setPage((current) => Math.max(0, Math.min(paged.pages - 1, current + delta)));
  }

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={anchor.blockId ? "Object" : "Add here"}
      tabIndex={-1}
      data-testid="quick-add-shelf"
      data-shelf={shelf}
      data-magnet-x={Math.round(anchor.magnetX)}
      data-magnet-y={Math.round(anchor.magnetY)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
        if (event.key === "ArrowLeft") turn(-1);
        if (event.key === "ArrowRight") turn(1);
        if (event.key === "Backspace" && shelf !== "ROOT" && shelf !== "OBJECT") {
          event.preventDefault();
          openShelf(SHAPE_GROUPS.includes(shelf as PublicPageShapeGroup) ? "SHAPES" : "ROOT");
        }
      }}
      onWheel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        turn(event.deltaY > 0 ? 1 : -1);
      }}
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
        zIndex: 120,
        width: SHELF_W,
        maxWidth: "calc(100vw - 16px)",
        height: SHELF_H,
        maxHeight: "min(248px, 42vh)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        padding: 8,
        borderRadius: 14,
        color: "#f4f1ff",
        background: "rgba(5,5,16,0.94)",
        border: "1px solid rgba(0,255,255,0.45)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {shelf !== "ROOT" && shelf !== "OBJECT" ? (
          <button type="button" data-testid="quick-add-back" aria-label="Back" onClick={() => openShelf(SHAPE_GROUPS.includes(shelf as PublicPageShapeGroup) ? "SHAPES" : "ROOT")} style={iconButton}>‹</button>
        ) : <span style={{ width: 32 }} />}
        <strong style={{ flex: 1, fontSize: 12, letterSpacing: "0.08em" }}>{anchor.blockId ? "OBJECT" : shelf === "ROOT" ? "ADD HERE" : shelf}</strong>
        <button type="button" data-testid="quick-add-close" aria-label="Close" onClick={onClose} style={iconButton}>×</button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }} data-testid="quick-add-body">
        {shelf === "ROOT" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <ShelfButton testId="quick-add-write" label="Write" glyph="✎" onClick={() => openShelf("WRITE")} />
            <ShelfButton testId="quick-add-photo" label="Photo" glyph="▣" onClick={onPhoto} />
            <ShelfButton testId="quick-add-shapes" label="Shape" glyph="♡" onClick={() => openShelf("SHAPES")} />
            <ShelfButton testId="quick-add-box" label="Box" glyph="▢" onClick={onBox} />
            <ShelfButton testId="quick-add-decor" label="Decor" glyph="★" onClick={onDecor} />
          </div>
        ) : null}
        {shelf === "SHAPES" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {SHAPE_GROUPS.map((group) => (
              <ShelfButton key={group} testId={`quick-add-group-${group}`} label={group === "FRAME" ? "Frames" : group[0] + group.slice(1).toLowerCase()} glyph="▸" onClick={() => openShelf(group)} />
            ))}
          </div>
        ) : null}
        {shelf === "WRITE" && writing ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {writing.items.map((label) => (
              <ShelfButton key={label} testId={`quick-add-writing-${label.replace(/\s+/g, "-")}`} label={label} glyph="✎" onClick={() => onWriting(label === "Blank" ? "Custom" : label)} />
            ))}
          </div>
        ) : null}
        {shapes ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {shapes.items.map((shape) => (
              <button
                key={shape.shapeId}
                type="button"
                data-testid={`quick-add-shape-${shape.shapeId}`}
                aria-label={shape.label}
                title={shape.label}
                onClick={() => onShape(shape.shapeId)}
                style={{ ...iconButton, width: "100%", height: 52, display: "grid", placeItems: "center" }}
              >
                <span aria-hidden="true" style={{ width: 28, height: 28, display: "grid", placeItems: "center", background: "rgba(255,45,170,0.2)", clipPath: shape.clipPath, borderRadius: shape.radius, border: "1px solid #00FFFF" }}>
                  {GLYPH[shape.shapeId] ?? "▢"}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {shelf === "OBJECT" ? (
          <div style={{ display: "grid", gap: 6 }}>
            <ShelfButton testId="quick-add-edit" label="Edit" glyph="✎" onClick={onClose} />
            {anchor.kind === "PHOTO" ? <ShelfButton testId="quick-add-adjust" label="Adjust photo" glyph="▣" onClick={onAdjust} /> : null}
            <ShelfButton testId="quick-add-duplicate" label="Duplicate" glyph="⧉" onClick={onDuplicate} />
            <ShelfButton testId="quick-add-forward" label="Bring forward" glyph="↑" onClick={onForward} />
            <ShelfButton testId="quick-add-backward" label="Send backward" glyph="↓" onClick={onBack} />
            <ShelfButton testId="quick-add-delete" label="Delete" glyph="✕" onClick={onDelete} />
          </div>
        ) : null}
      </div>
      {paged && paged.pages > 1 ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <button type="button" data-testid="quick-add-prev" aria-label="Previous" disabled={paged.page === 0} onClick={() => turn(-1)} style={iconButton}>◀</button>
          <span style={{ fontSize: 11, alignSelf: "center" }}>{paged.page + 1} / {paged.pages}</span>
          <button type="button" data-testid="quick-add-next" aria-label="Next" disabled={paged.page >= paged.pages - 1} onClick={() => turn(1)} style={iconButton}>▶</button>
        </div>
      ) : null}
    </div>
  );

  return createPortal(panel, document.body);
}

function ShelfButton({ testId, label, glyph, onClick }: { testId: string; label: string; glyph: string; onClick: () => void }) {
  return (
    <button type="button" data-testid={testId} onClick={onClick} style={{ ...iconButton, width: "100%", minHeight: 40, display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-start", padding: "0 8px", fontSize: 12 }}>
      <span aria-hidden="true">{glyph}</span>
      {label}
    </button>
  );
}

const iconButton: CSSProperties = {
  color: "#f4f1ff",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(0,255,255,0.35)",
  borderRadius: 8,
  minWidth: 32,
  minHeight: 32,
  cursor: "pointer",
};
