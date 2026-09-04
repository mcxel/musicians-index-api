"use client";

/**
 * Adaptive participant grid (1–8) for the lower media surface during screen share.
 * FLIP-style layout via framer-motion layout animations — no video remount when
 * panel identity (key) is stable. Respects prefers-reduced-motion.
 */

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ParticipantLayoutPlan } from "@/lib/monitors/MediaSurfaceLayoutDirector";

export interface ParticipantSurfaceTile {
  id: string;
  label?: string;
  /** Real camera / WebRTC surface — never fan avatar chrome in performer panels. */
  children: ReactNode;
}

export interface ParticipantSurfaceGridProps {
  layout: ParticipantLayoutPlan;
  tiles: ParticipantSurfaceTile[];
  activeSpeakerId?: string | null;
  overflowLabel?: string | null;
  style?: CSSProperties;
}

export default function ParticipantSurfaceGrid({
  layout,
  tiles,
  activeSpeakerId = null,
  overflowLabel = null,
  style,
}: ParticipantSurfaceGridProps) {
  const prefersReduced = useReducedMotion();
  const transition = prefersReduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.85 };

  const visibleTiles = useMemo(() => {
    const byId = new Map(tiles.map((t) => [t.id, t]));
    return layout.panels.map((panel, i) => {
      const tile = byId.get(panel.id) ?? tiles[i] ?? null;
      return { panel, tile };
    });
  }, [layout.panels, tiles]);

  const isPrimaryPlus =
    layout.kind === "primary_plus_2" && layout.gridTemplateColumns.includes("2fr");

  return (
    <div
      data-participant-surface-grid
      data-layout-kind={layout.kind}
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: layout.gridTemplateColumns,
        gridTemplateRows: layout.gridTemplateRows,
        gap: layout.gap,
        background: "#050510",
        overflow: "hidden",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleTiles.map(({ panel, tile }, index) => {
          const isFocus =
            panel.isFocus || (activeSpeakerId != null && tile?.id === activeSpeakerId);
          const gridColumn = isPrimaryPlus
            ? panel.colSpan > 1 || panel.rowSpan > 1
              ? `1 / 2`
              : `2 / 3`
            : undefined;
          const gridRow = isPrimaryPlus
            ? panel.rowSpan > 1
              ? `1 / 3`
              : `${panel.row + 1} / ${panel.row + 2}`
            : undefined;

          return (
            <motion.div
              key={tile?.id ?? panel.id}
              layout={!prefersReduced}
              initial={prefersReduced ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReduced ? undefined : { opacity: 0, scale: 0.94 }}
              transition={transition}
              data-participant-panel={panel.id}
              data-primary={panel.isPrimary ? "true" : "false"}
              data-focus={isFocus ? "true" : "false"}
              style={{
                position: "relative",
                overflow: "hidden",
                minWidth: 0,
                minHeight: 0,
                background: "#030318",
                border: isFocus
                  ? "2px solid rgba(0,255,136,0.85)"
                  : "1px solid rgba(255,255,255,0.1)",
                boxShadow: isFocus ? "0 0 16px rgba(0,255,136,0.25)" : "none",
                borderRadius: 4,
                gridColumn,
                gridRow,
                transition: prefersReduced
                  ? undefined
                  : "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              {tile?.children ?? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                  }}
                >
                  {tile?.label ?? `PARTICIPANT ${index + 1}`}
                </div>
              )}
              {tile?.label ? (
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    bottom: 6,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    fontSize: 8,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    pointerEvents: "none",
                  }}
                >
                  {tile.label}
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {overflowLabel || layout.hiddenCount > 0 ? (
        <div
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            padding: "3px 8px",
            borderRadius: 6,
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.75)",
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.1em",
            pointerEvents: "none",
          }}
        >
          {overflowLabel ?? `+${layout.hiddenCount} MORE`}
        </div>
      ) : null}
    </div>
  );
}
