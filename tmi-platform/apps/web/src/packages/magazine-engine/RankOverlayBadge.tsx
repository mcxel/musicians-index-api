"use client";

/**
 * RankOverlayBadge
 *
 * Per-rank overlay badge shown during spotlight.
 * Combines RankNumberPop + CrownPopAnimation + glitter border.
 * Sits in the front overlay layer (pointer-events: none for decorative, auto for buttons).
 */

import RankNumberPop from "./RankNumberPop";
import CrownPopAnimation from "./CrownPopAnimation";

export type RankOverlayBadgeProps = {
  rank: number;
  artistName?: string;
  artistId?: string;
  /** Spotlight is currently active for this rank */
  spotlit: boolean;
  /** Crown should be popping right now (only rank 1, timed by scheduler) */
  crownActive: boolean;
  size?: "sm" | "md" | "lg";
  "data-testid"?: string;
};

export default function RankOverlayBadge({
  rank,
  artistName,
  artistId,
  spotlit,
  crownActive,
  size = "md",
  "data-testid": testId,
}: RankOverlayBadgeProps) {
  return (
    <div
      className="rank-overlay-badge pointer-events-none absolute inset-0"
      style={{ zIndex: 18 }}
      data-testid={testId ?? `rank-overlay-badge-${rank}`}
      data-rank={rank}
      data-spotlit={spotlit}
    >
      {/* Rank number badge — top-left */}
      <RankNumberPop rank={rank} active={spotlit} size={size} position="top-left" />

      {/* Crown pop — only for #1 */}
      {rank === 1 && (
        <CrownPopAnimation
          active={crownActive}
          artistName={artistName}
          size={size === "lg" ? 56 : size === "sm" ? 32 : 44}
        />
      )}

      {/* Spotlight glow rim */}
      {spotlit && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-sm"
          style={{
            boxShadow:
              rank === 1
                ? "inset 0 0 0 2px rgba(255,215,0,0.7), 0 0 20px rgba(255,215,0,0.4)"
                : rank <= 4
                ? "inset 0 0 0 1.5px rgba(192,192,192,0.6), 0 0 12px rgba(192,192,192,0.3)"
                : "inset 0 0 0 1px rgba(34,211,238,0.4), 0 0 8px rgba(34,211,238,0.2)",
            zIndex: 19,
          }}
        />
      )}
    </div>
  );
}
