"use client";

/**
 * MagazineShellSystem
 *
 * Reusable 3-layer card wrapper:
 *   1. Back shape layer  — teal/purple/orange blobs (z: -1)
 *   2. Media/content slot — untouched rectangle (z: 0)
 *   3. Front overlay layer — frame + badges + confetti (z: 10+)
 *
 * The awkward magazine shape is ONLY in layers 1 and 3.
 * The media in layer 2 is NEVER distorted or clipped.
 *
 * Usage:
 *   <MagazineShellSystem
 *     rank={1}
 *     artistId="ray-journey"
 *     artistName="Ray Journey"
 *     href="/artists/ray-journey"
 *     spotlit={activeRank === 1}
 *     crownActive={crownRank === 1}
 *     showConfetti={activeRank === 1}
 *   >
 *     <ImageSlotWrapper imageId="img-n38xvo" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
 *   </MagazineShellSystem>
 */

import type { CSSProperties } from "react";
import Link from "next/link";
import AwkwardShapeOverlayFrame from "./AwkwardShapeOverlayFrame";
import ConfettiMotionLayer from "./ConfettiMotionLayer";
import RankOverlayBadge from "./RankOverlayBadge";
import type { OverlayFrameVariant } from "./AwkwardShapeOverlayFrame";

export type MagazineShellSystemProps = {
  children: React.ReactNode;
  rank?: number;
  artistId?: string;
  artistName?: string;
  /** Clicking the card navigates here */
  href?: string;
  /** Frame style override; auto-selected by rank if omitted */
  frameVariant?: OverlayFrameVariant;
  /** Whether this card is currently in the spotlight */
  spotlit?: boolean;
  /** Crown animation active right now */
  crownActive?: boolean;
  /** Show confetti burst */
  showConfetti?: boolean;
  /** Confetti count */
  confettiCount?: number;
  className?: string;
  style?: CSSProperties;
  "data-testid"?: string;
  onCardClick?: () => void;
};

export default function MagazineShellSystem({
  children,
  rank,
  artistId,
  artistName,
  href,
  frameVariant,
  spotlit = false,
  crownActive = false,
  showConfetti = false,
  confettiCount = 20,
  className = "",
  style,
  "data-testid": testId,
  onCardClick,
}: MagazineShellSystemProps) {
  const resolvedVariant: OverlayFrameVariant =
    frameVariant ?? (rank === 1 ? "crown" : rank === 2 || rank === 3 ? "gold" : "magazine");

  const inner = (
    <AwkwardShapeOverlayFrame
      variant={resolvedVariant}
      rank={rank}
      animated
      showBackShapes
      className={`magazine-shell ${spotlit ? "magazine-shell--spotlit" : ""} ${className}`}
      style={style}
      data-testid={testId ?? "magazine-shell-system"}
    >
      {/* ── Layer 2: media/content — stays clean rectangle ── */}
      {children}

      {/* ── Layer 3a: Rank overlay badge (front, pointer-events:none) ── */}
      {rank != null && (
        <RankOverlayBadge
          rank={rank}
          artistName={artistName}
          artistId={artistId}
          spotlit={spotlit}
          crownActive={crownActive}
          size={rank === 1 ? "lg" : rank <= 4 ? "md" : "sm"}
        />
      )}

      {/* ── Layer 3b: Confetti burst ── */}
      <ConfettiMotionLayer active={showConfetti} count={confettiCount} zIndex={15} />
    </AwkwardShapeOverlayFrame>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="magazine-shell__link block"
        data-testid={`magazine-shell-link-${artistId ?? rank}`}
        onClick={onCardClick}
        style={{ display: "block", position: "relative" }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      style={{ position: "relative" }}
      onClick={onCardClick}
      data-testid={testId ?? "magazine-shell-system"}
    >
      {inner}
    </div>
  );
}
