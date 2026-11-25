"use client";

/**
 * Championship Belt hero — main plate + two side plates carrying a small,
 * engraved lineage clue. Tap opens the full Championship History panel.
 *
 * Zero-history law: a belt with no verified prior transfer shows "00" on
 * both side plates — never an invented former champion. VACANT (no current
 * holder) and zero-history (no verified past transfer) are independent:
 * a VACANT belt can still show real lineage if it has one.
 */

import type { CSSProperties } from "react";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import type { ChampionshipTitle } from "@/lib/championship";
import { resolveTitleLineagePair } from "@/lib/championship/resolveTitleLineagePair";
import { useChampionshipHistoryFocus } from "@/lib/championship/championshipHistoryFocus";
import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";

const HEX: CSSProperties["clipPath"] =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const GOLD_METAL =
  "conic-gradient(from 200deg, #7a5c10, #d4af37, #fff2b8, #d4af37, #a67c1e, #7a5c10)";
const DARK_FACE = "radial-gradient(circle at 35% 28%, #4a3610, #140f04 72%)";

function shortName(fullName: string | null | undefined): string | null {
  if (!fullName) return null;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].toUpperCase();
  return `${parts[0][0]?.toUpperCase() ?? ""}. ${parts[parts.length - 1].toUpperCase()}`;
}

function shortYear(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `'${String(d.getFullYear()).slice(-2)}`;
}

export interface ChampionshipBeltPlateProps {
  title: ChampionshipTitle;
}

export default function ChampionshipBeltPlate({ title }: ChampionshipBeltPlateProps) {
  const setFocusedTitleId = useChampionshipHistoryFocus((s) => s.setFocusedTitleId);
  const holder = title.currentHolderId ? getPerformerById(title.currentHolderId) : null;
  const { previousEntry } = resolveTitleLineagePair(title);
  const previousHolder = previousEntry ? getPerformerById(previousEntry.holderId) : null;

  const leftPlateText = previousHolder ? shortName(previousHolder.name) : "00";
  const leftPlateSub = previousEntry ? shortYear(previousEntry.to) : "00";
  const hasPreviousHolder = Boolean(previousHolder);

  const rightPlateText = holder ? shortName(holder.name) : "00";
  const rightPlateSub = title.lineage.length > 0 ? shortYear(title.lineage[0]?.from) : "00";

  const isVacant = title.status === "VACANT" || title.status === "RETIRED";

  const openHistory = () => {
    setFocusedTitleId(title.id);
    presentCanonicalWorkspace("championship-history");
  };

  return (
    <button
      type="button"
      onClick={openHistory}
      aria-label={`Open ${title.label} championship history`}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "18px 14px",
        borderRadius: 14,
        border: "1px solid rgba(255,215,0,0.18)",
        background: "radial-gradient(ellipse at 50% 0%, rgba(255,107,53,0.08), rgba(5,5,16,0.4))",
        opacity: isVacant ? 0.72 : 1,
        filter: isVacant ? "grayscale(0.35)" : undefined,
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            height: 26,
            background: "repeating-linear-gradient(100deg, #1a1410, #1a1410 8px, #241c15 8px, #241c15 16px)",
            borderTop: "1px solid #3a2e1c",
            borderBottom: "1px solid #0a0806",
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 56,
              height: 66,
              clipPath: HEX,
              background: GOLD_METAL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(212,175,55,0.25)",
            }}
          >
            <div
              style={{
                width: 46,
                height: 56,
                clipPath: HEX,
                background: hasPreviousHolder ? DARK_FACE : "radial-gradient(circle at 35% 28%, #2a2016, #0e0a05 72%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                position: "relative",
              }}
            >
              <div style={{ fontSize: 6, fontWeight: 700, letterSpacing: ".08em", color: "rgba(244,236,214,0.6)" }}>
                PREVIOUS
              </div>
              <div
                style={{
                  fontSize: hasPreviousHolder ? 9 : 12,
                  fontWeight: 900,
                  color: hasPreviousHolder ? "#f4ecd6" : "rgba(244,236,214,0.35)",
                  textAlign: "center",
                }}
              >
                {leftPlateText}
              </div>
              <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(244,236,214,0.45)" }}>{leftPlateSub}</div>
              {hasPreviousHolder ? (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(105deg, transparent 46%, rgba(255,255,255,0.12) 50%, transparent 54%)",
                    pointerEvents: "none",
                  }}
                />
              ) : null}
            </div>
          </div>

          <div
            style={{
              width: 108,
              height: 128,
              clipPath: HEX,
              background: GOLD_METAL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(212,175,55,0.3)",
            }}
          >
            <div
              style={{
                width: 92,
                height: 110,
                clipPath: HEX,
                background: DARK_FACE,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: 8,
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: 6.5, fontWeight: 700, letterSpacing: ".18em", color: "#f4ecd6" }}>
                TMI CHAMPIONSHIP
              </div>
              <svg width="26" height="26" viewBox="0 0 24 24">
                <polygon
                  points="12,2 14.8,9 22,9.3 16.3,14 18.2,21 12,17 5.8,21 7.7,14 2,9.3 9.2,9"
                  fill="#ffe9a8"
                />
              </svg>
              <div style={{ fontSize: 8, fontWeight: 900, color: "#f4ecd6", textAlign: "center", lineHeight: 1.15 }}>
                {title.label}
              </div>
            </div>
          </div>

          <div
            style={{
              width: 56,
              height: 66,
              clipPath: HEX,
              background: GOLD_METAL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(212,175,55,0.25)",
            }}
          >
            <div
              style={{
                width: 46,
                height: 56,
                clipPath: HEX,
                background: DARK_FACE,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <div style={{ fontSize: 6, fontWeight: 700, letterSpacing: ".08em", color: "rgba(244,236,214,0.6)" }}>
                REIGN SINCE
              </div>
              <div
                style={{
                  fontSize: title.lineage.length > 0 ? 9 : 12,
                  fontWeight: 900,
                  color: title.lineage.length > 0 ? "#f4ecd6" : "rgba(244,236,214,0.35)",
                  textAlign: "center",
                }}
              >
                {rightPlateText}
              </div>
              <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(244,236,214,0.45)" }}>{rightPlateSub}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <div
          style={{
            padding: "3px 12px",
            borderRadius: 5,
            border: isVacant ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,229,255,0.4)",
            background: "rgba(10,8,22,0.6)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: ".08em",
              color: isVacant ? "rgba(255,255,255,0.5)" : "#baf3ff",
            }}
          >
            {title.status === "VACANT" ? "VACANT" : "CURRENT CHAMPION"}
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff" }}>
          {holder?.name ?? (title.status === "VACANT" ? "No verified holder" : "Unverified")}
        </div>
        <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
          {title.successfulDefenses} defense{title.successfulDefenses === 1 ? "" : "s"} · tap for full history
        </div>
      </div>
    </button>
  );
}
