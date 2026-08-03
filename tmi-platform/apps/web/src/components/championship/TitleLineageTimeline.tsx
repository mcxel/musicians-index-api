"use client";

/**
 * Title Lineage Timeline — real lineage array only (Phase 2C).
 * Never invents holder names.
 */

import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import type { ChampionshipLineageEntry } from "@/lib/championship";

export interface TitleLineageTimelineProps {
  lineage: ChampionshipLineageEntry[];
  accentColor?: string;
}

export default function TitleLineageTimeline({
  lineage,
  accentColor = "#FFD700",
}: TitleLineageTimelineProps) {
  if (lineage.length === 0) {
    return (
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
        No lineage recorded — title has no verified past holders.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 4 }}>
      <div
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: accentColor,
          marginBottom: 6,
        }}
      >
        TITLE LINEAGE
      </div>
      {lineage.map((entry, i) => {
        const holder = getPerformerById(entry.holderId);
        const name = holder?.name ?? null;
        return (
          <div
            key={`${entry.holderId}_${entry.from}_${i}`}
            style={{
              display: "flex",
              gap: 10,
              paddingBottom: i < lineage.length - 1 ? 10 : 0,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: entry.to ? "rgba(255,255,255,0.35)" : accentColor,
                  border: `1px solid ${accentColor}`,
                  flexShrink: 0,
                }}
              />
              {i < lineage.length - 1 ? (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    background: "rgba(255,255,255,0.12)",
                    marginTop: 2,
                  }}
                />
              ) : null}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.8)" }}>
                {name ?? `Unverified id · ${entry.holderId}`}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {new Date(entry.from).toLocaleDateString()}
                {" → "}
                {entry.to ? new Date(entry.to).toLocaleDateString() : "present"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
