"use client";

/**
 * Premium ceremonial glyph for a ChampionshipTitle's assetType — replaces the
 * plain emoji (👑/🥋/🏆) previously used in ChampionshipChallengeCard. Uses
 * the locked --tmi-champion-crown/belt/trophy accent colors (globals.css)
 * verbatim, not a new palette. Presentation only — never derives or infers
 * ownership; assetType/status come from the real ChampionshipTitle record.
 */

import type { ChampionshipAssetType } from "@/lib/championship";

const ASSET_ACCENT: Record<ChampionshipAssetType, string> = {
  CROWN: "#ffd700",
  BELT: "#ff6b35",
  TROPHY: "#00ffff",
};

export interface ChampionshipAssetGlyphProps {
  assetType: ChampionshipAssetType;
  /** Diameter in px. Small (24-32) for list rows, larger (56+) for a trophy-case hero card. */
  size?: number;
  /** VACANT / RETIRED / no verified holder — desaturated, no glow. */
  dimmed?: boolean;
}

export default function ChampionshipAssetGlyph({
  assetType,
  size = 32,
  dimmed = false,
}: ChampionshipAssetGlyphProps) {
  const accent = ASSET_ACCENT[assetType];
  const iconSize = Math.round(size * 0.56);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, #2c2c38, #0c0c12 75%)",
        border: `1.5px solid ${accent}`,
        boxShadow: dimmed
          ? "inset 0 1px 2px rgba(255,255,255,.1), inset 0 -2px 4px rgba(0,0,0,.55)"
          : `0 0 ${Math.round(size * 0.32)}px ${accent}66, inset 0 1px 2px rgba(255,255,255,.18), inset 0 -2px 4px rgba(0,0,0,.5)`,
        opacity: dimmed ? 0.55 : 1,
        filter: dimmed ? "grayscale(0.45)" : undefined,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          position: "absolute",
          top: "8%",
          left: "18%",
          width: "38%",
          height: "26%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,.35), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" style={{ position: "relative" }}>
        {assetType === "CROWN" ? (
          <polygon points="2,18 2,9 7,13 12,4 17,13 22,9 22,18" fill={accent} />
        ) : assetType === "BELT" ? (
          <polygon points="12,2 20,6 20,12 12,22 4,12 4,6" fill={accent} />
        ) : (
          <>
            <polygon points="6,4 18,4 14,14 10,14" fill={accent} />
            <rect x="10" y="14" width="4" height="4" fill={accent} />
            <rect x="6" y="19" width="12" height="2" fill={accent} />
          </>
        )}
      </svg>
    </span>
  );
}
