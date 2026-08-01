"use client";

/**
 * ObservatoryWorkspaceGrid — Phase 2 NOC tile workspace for Control Desk primary area.
 * Snap-to-grid move/resize, pin, collapse, maximize/restore, duplicate, hide/show.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

import { DeskPanelContent } from "@/components/admin/overseer/ObservatoryDeskPanels";
import {
  DESK_GRID_COLS,
  DESK_GRID_ROW_PX,
  DESK_RAIL_ITEMS,
  DESK_TILE_COLLAPSED_H,
  DESK_TILE_MAX_H,
  DESK_TILE_MAX_W,
  DESK_TILE_MIN_H,
  DESK_TILE_MIN_W,
  deskPanelLabel,
  duplicateTile,
  findFreeSlot,
  newTileId,
  updateTile,
  type DeskPanelId,
  type DeskPeriod,
  type DeskTile,
} from "@/lib/admin/ObservatoryDeskState";

type DragKind = "move" | "resize";

type DragState = {
  kind: DragKind;
  tileId: string;
  startX: number;
  startY: number;
  orig: DeskTile;
  colW: number;
};

type Props = {
  period: DeskPeriod;
  focusPanel: DeskPanelId;
  tiles: DeskTile[];
  maximizedTileId: string | null;
  onTilesChange: (tiles: DeskTile[]) => void;
  onMaximizedChange: (tileId: string | null) => void;
  onFocusPanel: (panel: DeskPanelId) => void;
};

function chromeBtn(active?: boolean): CSSProperties {
  return {
    border: active ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.2)",
    background: active ? "rgba(0,255,255,0.15)" : "rgba(0,0,0,0.35)",
    color: active ? "#00FFFF" : "rgba(255,255,255,0.75)",
    borderRadius: 4,
    padding: "2px 6px",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
    lineHeight: 1.2,
  };
}

export default function ObservatoryWorkspaceGrid({
  period,
  focusPanel,
  tiles,
  maximizedTileId,
  onTilesChange,
  onMaximizedChange,
  onFocusPanel,
}: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [draft, setDraft] = useState<DeskTile | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const visibleTiles = useMemo(() => tiles.filter((t) => !t.hidden), [tiles]);
  const maximized = maximizedTileId ? tiles.find((t) => t.id === maximizedTileId && !t.hidden) : null;

  const gridRows = useMemo(() => {
    const list = draft
      ? visibleTiles.map((t) => (t.id === draft.id ? draft : t))
      : visibleTiles;
    return Math.max(6, list.reduce((m, t) => Math.max(m, t.y + t.h), 0) + 1);
  }, [visibleTiles, draft]);

  const resolveColW = useCallback(() => {
    const el = gridRef.current;
    if (!el) return 80;
    return Math.max(24, el.clientWidth / DESK_GRID_COLS);
  }, []);

  const beginDrag = (kind: DragKind, tile: DeskTile, e: ReactPointerEvent) => {
    if (tile.pinned && kind === "move") return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({
      kind,
      tileId: tile.id,
      startX: e.clientX,
      startY: e.clientY,
      orig: { ...tile },
      colW: resolveColW(),
    });
    setDraft({ ...tile });
  };

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const dCol = Math.round(dx / drag.colW);
      const dRow = Math.round(dy / DESK_GRID_ROW_PX);

      if (drag.kind === "move") {
        setDraft({
          ...drag.orig,
          x: Math.max(0, Math.min(DESK_GRID_COLS - drag.orig.w, drag.orig.x + dCol)),
          y: Math.max(0, drag.orig.y + dRow),
        });
      } else {
        const nextW = Math.max(
          DESK_TILE_MIN_W,
          Math.min(DESK_TILE_MAX_W, drag.orig.w + dCol),
        );
        const nextH = drag.orig.collapsed
          ? DESK_TILE_COLLAPSED_H
          : Math.max(DESK_TILE_MIN_H, Math.min(DESK_TILE_MAX_H, drag.orig.h + dRow));
        setDraft({
          ...drag.orig,
          w: Math.min(nextW, DESK_GRID_COLS - drag.orig.x),
          h: nextH,
        });
      }
    };

    const onUp = () => {
      setDraft((current) => {
        if (current) onTilesChange(updateTile(tiles, current.id, current));
        return null;
      });
      setDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, onTilesChange, tiles]);

  const renderTile = (base: DeskTile, fullscreen: boolean) => {
    const t = draft?.id === base.id ? draft : base;
    const isFocus = t.panelId === focusPanel;
    const accent = DESK_RAIL_ITEMS.find((i) => i.id === t.panelId)?.accent ?? "#00FFFF";

    const style: CSSProperties = fullscreen
      ? {
          gridColumn: "1 / -1",
          gridRow: "1 / -1",
          zIndex: 5,
          minHeight: DESK_GRID_ROW_PX * 6,
        }
      : {
          gridColumn: `${t.x + 1} / span ${t.w}`,
          gridRow: `${t.y + 1} / span ${t.h}`,
          zIndex: drag?.tileId === t.id ? 4 : 1,
        };

    return (
      <div
        key={t.id}
        data-desk-tile={t.id}
        data-panel={t.panelId}
        style={{
          ...style,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          borderRadius: 8,
          border: isFocus ? "1.5px solid #00FFFF" : `1px solid ${accent}44`,
          background: "rgba(0,0,0,0.45)",
          boxShadow: isFocus ? "0 0 14px rgba(0,255,255,0.2)" : "none",
          overflow: "hidden",
        }}
      >
        <header
          onPointerDown={(e) => {
            if (!fullscreen && !t.pinned) beginDrag("move", t, e);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,255,255,0.04)",
            cursor: fullscreen || t.pinned ? "default" : "grab",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: isFocus ? "#00FFFF" : accent,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {deskPanelLabel(t.panelId)}
            {t.pinned ? " · PIN" : ""}
          </span>
          <button
            type="button"
            style={chromeBtn(t.pinned)}
            title={t.pinned ? "Unpin" : "Pin"}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onTilesChange(updateTile(tiles, t.id, { pinned: !t.pinned }))}
          >
            Pin
          </button>
          <button
            type="button"
            style={chromeBtn(t.collapsed)}
            title={t.collapsed ? "Expand" : "Collapse"}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              if (t.collapsed) {
                onTilesChange(
                  updateTile(tiles, t.id, { collapsed: false, h: Math.max(DESK_TILE_MIN_H, 3) }),
                );
              } else {
                onTilesChange(updateTile(tiles, t.id, { collapsed: true, h: DESK_TILE_COLLAPSED_H }));
              }
            }}
          >
            {t.collapsed ? "Expand" : "Min"}
          </button>
          <button
            type="button"
            style={chromeBtn(fullscreen)}
            title={fullscreen ? "Restore" : "Maximize"}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              onFocusPanel(t.panelId);
              onMaximizedChange(fullscreen ? null : t.id);
            }}
          >
            {fullscreen ? "Restore" : "Max"}
          </button>
          <button
            type="button"
            style={chromeBtn()}
            title="Duplicate tile"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              onTilesChange(duplicateTile(tiles, t.id));
              onMaximizedChange(null);
            }}
          >
            Dup
          </button>
          <button
            type="button"
            style={chromeBtn()}
            title="Hide tile"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              onTilesChange(updateTile(tiles, t.id, { hidden: true }));
              if (maximizedTileId === t.id) onMaximizedChange(null);
            }}
          >
            Hide
          </button>
        </header>

        {!t.collapsed ? (
          <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 8 }}>
            <DeskPanelContent panel={t.panelId} period={period} />
          </div>
        ) : null}

        {!fullscreen && !t.pinned ? (
          <div
            onPointerDown={(e) => beginDrag("resize", t, e)}
            title="Resize"
            style={{
              position: "absolute",
              right: 2,
              bottom: 2,
              width: 14,
              height: 14,
              cursor: "nwse-resize",
              borderRight: `2px solid ${accent}`,
              borderBottom: `2px solid ${accent}`,
              opacity: 0.7,
            }}
          />
        ) : null}
      </div>
    );
  };

  const togglePanelVisibility = (panelId: DeskPanelId) => {
    const existing = tiles.filter((t) => t.panelId === panelId);
    if (existing.length === 0) {
      const slot = findFreeSlot(tiles, 6, 4);
      onTilesChange([
        ...tiles,
        {
          id: newTileId(),
          panelId,
          x: slot.x,
          y: slot.y,
          w: 6,
          h: 4,
        },
      ]);
      onFocusPanel(panelId);
      return;
    }
    const anyVisible = existing.some((t) => !t.hidden);
    if (anyVisible) {
      onTilesChange(
        tiles.map((t) => (t.panelId === panelId ? { ...t, hidden: true } : t)),
      );
      if (maximized && maximized.panelId === panelId) onMaximizedChange(null);
    } else {
      onTilesChange(
        tiles.map((t) => (t.panelId === panelId ? { ...t, hidden: false } : t)),
      );
      onFocusPanel(panelId);
    }
  };

  if (maximized) {
    return (
      <div
        data-desk-workspace-grid
        data-maximized="true"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: `repeat(${DESK_GRID_COLS}, minmax(0, 1fr))`,
          gridAutoRows: DESK_GRID_ROW_PX,
          gap: 8,
          minHeight: DESK_GRID_ROW_PX * 6,
        }}
      >
        {renderTile(maximized, true)}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
          Layout mode · drag headers to move · corner to resize · cyan border = focus module
        </div>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            style={chromeBtn(pickerOpen)}
            onClick={() => setPickerOpen((v) => !v)}
          >
            Tile Picker
          </button>
          {pickerOpen ? (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "110%",
                zIndex: 20,
                width: 240,
                maxHeight: 280,
                overflow: "auto",
                borderRadius: 8,
                border: "1px solid rgba(0,255,255,0.35)",
                background: "rgba(8,8,14,0.98)",
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                boxShadow: "0 12px 28px rgba(0,0,0,0.55)",
              }}
            >
              {DESK_RAIL_ITEMS.map((item) => {
                const shown = tiles.some((t) => t.panelId === item.id && !t.hidden);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePanelVisibility(item.id)}
                    style={{
                      ...chromeBtn(shown),
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ color: shown ? "#00FF88" : "rgba(255,255,255,0.35)" }}>
                      {shown ? "ON" : "OFF"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {visibleTiles.length === 0 ? (
        <div
          style={{
            minHeight: 200,
            borderRadius: 8,
            border: "1px dashed rgba(107,114,128,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            padding: 16,
            textAlign: "center",
          }}
        >
          No tiles visible. Use Tile Picker or Control Rail to add a module.
        </div>
      ) : (
        <div
          ref={gridRef}
          data-desk-workspace-grid
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: `repeat(${DESK_GRID_COLS}, minmax(0, 1fr))`,
            gridAutoRows: DESK_GRID_ROW_PX,
            gridTemplateRows: `repeat(${gridRows}, ${DESK_GRID_ROW_PX}px)`,
            gap: 8,
            minHeight: DESK_GRID_ROW_PX * 6,
          }}
        >
          {visibleTiles.map((t) => renderTile(t, false))}
        </div>
      )}
    </div>
  );
}
