"use client";

/**
 * Championship History panel — opened by tapping a belt/crown/trophy glyph.
 * Reuses the real registry + the existing TitleLineageTimeline (never a
 * second lineage renderer). Presentation only: VACANT vs zero-history are
 * kept as two independent, honest states — a belt can be VACANT with a long
 * real lineage, or held with no verified prior transfer yet (00 / 00).
 */

import { listChampionshipTitles } from "@/lib/championship";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { useChampionshipHistoryFocus } from "@/lib/championship/championshipHistoryFocus";
import { resolveTitleLineagePair } from "@/lib/championship/resolveTitleLineagePair";
import ChampionshipAssetGlyph from "./ChampionshipAssetGlyph";
import TitleLineageTimeline from "./TitleLineageTimeline";

const ASSET_ACCENT: Record<string, string> = {
  CROWN: "#ffd700",
  BELT: "#ff6b35",
  TROPHY: "#00ffff",
};

export default function ChampionshipHistoryPanel() {
  const focusedTitleId = useChampionshipHistoryFocus((s) => s.focusedTitleId);
  const title = focusedTitleId
    ? listChampionshipTitles().find((t) => t.id === focusedTitleId) ?? null
    : null;

  if (!title) {
    return (
      <div style={{ padding: 16, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
        No title selected. Tap a belt, crown, or trophy to open its history.
      </div>
    );
  }

  const accent = ASSET_ACCENT[title.assetType] ?? "#FFD700";
  const holder = title.currentHolderId ? getPerformerById(title.currentHolderId) : null;

  const { currentEntry, previousEntry } = resolveTitleLineagePair(title);
  const previousHolder = previousEntry ? getPerformerById(previousEntry.holderId) : null;

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ChampionshipAssetGlyph
          assetType={title.assetType}
          size={44}
          dimmed={title.status === "VACANT" || title.status === "RETIRED"}
        />
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accent }}>
            {title.assetType} HISTORY
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#ffffff", marginTop: 2 }}>
            {title.label}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {title.geographicTier} · {title.category} · {title.status}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${accent}44`,
          background: `${accent}10`,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: accent }}>
          {title.status === "VACANT" ? "VACANT" : "CURRENT HOLDER"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", marginTop: 4 }}>
          {holder?.name ?? (title.status === "VACANT" ? "No verified holder" : "Unverified")}
        </div>
        {currentEntry ? (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Won {new Date(currentEntry.from).toLocaleDateString()} · {title.successfulDefenses} defense
            {title.successfulDefenses === 1 ? "" : "s"}
          </div>
        ) : null}
      </div>

      {previousHolder || previousEntry ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
            DEFEATED
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
            {previousHolder?.name ?? `Unverified id · ${previousEntry?.holderId}`}
          </div>
          {previousEntry?.to ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              {new Date(previousEntry.to).toLocaleDateString()}
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
          00 — no previous verified titleholder. This is the first recorded reign.
        </div>
      )}

      <TitleLineageTimeline lineage={title.lineage} accentColor={accent} />
    </div>
  );
}
