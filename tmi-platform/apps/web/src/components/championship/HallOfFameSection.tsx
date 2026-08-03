"use client";

/**
 * Hall of Fame + Legacy Score — Phase 2C.
 * Alumni from lineage + trophies. Legacy Score = measured history only.
 */

import { useMemo, useState } from "react";
import {
  computeLegacyScore,
  listHallOfFameAlumni,
  LEGACY_SCORE_DISCLAIMER,
} from "@/lib/championship/legacyScore";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";

export interface HallOfFameSectionProps {
  /** Optional focus performer for Legacy Score card. */
  focusPerformerId?: string | null;
  accentColor?: string;
}

export default function HallOfFameSection({
  focusPerformerId,
  accentColor = "#FFD700",
}: HallOfFameSectionProps) {
  const alumni = useMemo(() => listHallOfFameAlumni(), []);
  const [selectedId, setSelectedId] = useState<string | null>(
    focusPerformerId ?? null,
  );

  const uniqueIds = useMemo(() => {
    const ids = new Set<string>();
    for (const a of alumni) ids.add(a.performerId);
    if (focusPerformerId) ids.add(focusPerformerId);
    return Array.from(ids);
  }, [alumni, focusPerformerId]);

  const legacy = useMemo(() => {
    const id = selectedId ?? focusPerformerId ?? uniqueIds[0] ?? null;
    return id ? computeLegacyScore(id) : null;
  }, [selectedId, focusPerformerId, uniqueIds]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: accentColor,
          }}
        >
          HALL OF FAME
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
          Past title holders + trophy alumni · no invented names
        </div>
      </div>

      {alumni.length === 0 ? (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1px dashed rgba(255,255,255,0.15)",
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.5,
          }}
        >
          Hall of Fame is empty. Alumni appear when titles change hands or trophies are awarded
          with verified lineage.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {alumni.slice(0, 20).map((row, i) => {
            const p = getPerformerById(row.performerId);
            return (
              <button
                key={`${row.titleId}_${row.performerId}_${i}`}
                type="button"
                onClick={() => setSelectedId(row.performerId)}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border:
                    selectedId === row.performerId
                      ? `1px solid ${accentColor}`
                      : "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800 }}>
                  {p?.name ?? `Unverified · ${row.performerId}`}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {row.titleLabel} · {row.kind}
                  {" · "}
                  {new Date(row.from).toLocaleDateString()}
                  {row.to ? ` → ${new Date(row.to).toLocaleDateString()}` : ""}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {legacy ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(170,45,255,0.35)",
            background: "rgba(170,45,255,0.08)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#AA2DFF",
            }}
          >
            LEGACY SCORE
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 4 }}>
            {legacy.legacyScore}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
            {getPerformerById(legacy.performerId)?.name ?? legacy.performerId}
            {" · "}
            {legacy.activeTitles} active · {legacy.successfulDefenses} defenses ·{" "}
            {legacy.trophyAwards} trophies · {legacy.longevityDays}d held
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            {LEGACY_SCORE_DISCLAIMER}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
          Select an alumni entry to view Legacy Score.{" "}
          {LEGACY_SCORE_DISCLAIMER}
        </div>
      )}
    </div>
  );
}
