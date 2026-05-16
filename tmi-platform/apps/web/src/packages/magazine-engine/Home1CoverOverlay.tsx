"use client";

/**
 * Home1CoverOverlay
 *
 * Recreates the TMI Magazine Home1 cover overlay artifacts:
 *   - The Musician's Index logo/title strip
 *   - "Who took the crown this week?" (via PromoMessageRotator)
 *   - Voting Live chip
 *   - Crown Updating badge
 *   - Weekly Cyphers footer → /magazine/issues/current/cyphers
 *   - Cypher Arena Open badge
 *   - Vote For #4 callout
 *   - Hype Bot: Artist moving up
 *   - Stream & Win chip
 *   - Lightning/confetti layer
 *
 * Overlay ONLY — the underlying content renders under this.
 * All decorative elements: pointer-events:none
 * All CTA buttons/links: pointer-events:auto
 */

import Link from "next/link";
import MagazinePromoMessageRotator from "./MagazinePromoMessageRotator";
import ConfettiMotionLayer from "./ConfettiMotionLayer";

export type Home1CoverOverlayProps = {
  currentGenre?: string;
  rankOneName?: string;
  rankOneId?: string;
  votingLive?: boolean;
  crownUpdating?: boolean;
  confettiActive?: boolean;
  "data-testid"?: string;
};

export default function Home1CoverOverlay({
  currentGenre = "R&B",
  rankOneName,
  rankOneId,
  votingLive = true,
  crownUpdating = false,
  confettiActive = false,
  "data-testid": testId,
}: Home1CoverOverlayProps) {
  return (
    <div
      className="home1-cover-overlay pointer-events-none absolute inset-0"
      style={{ zIndex: 40 }}
      data-testid={testId ?? "home1-cover-overlay"}
      aria-hidden
    >
      {/* ── Top strip: TMI logo + genre ── */}
      <div className="home1-cover-overlay__top-strip pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between px-3 py-1.5">
        <span className="home1-cover-overlay__logo text-xs font-black uppercase tracking-widest text-white drop-shadow-lg">
          The Musician's Index
        </span>
        <span className="home1-cover-overlay__genre rounded-full bg-cyan-500/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          {currentGenre}
        </span>
      </div>

      {/* ── Promo message rotator strip (top center) ── */}
      <div
        className="home1-cover-overlay__promo pointer-events-auto absolute left-0 right-0"
        style={{ top: 28, zIndex: 2 }}
      >
        <MagazinePromoMessageRotator
          intervalMs={4500}
          showIcon
          showRoute
          variant="overlay"
          data-testid="home1-promo-rotator"
        />
      </div>

      {/* ── Live chip row ── */}
      <div className="home1-cover-overlay__chips pointer-events-auto absolute right-2 flex flex-col gap-1" style={{ top: 52 }}>
        {votingLive && (
          <Link
            href="/vote"
            className="home1-chip home1-chip--live flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md pointer-events-auto"
            data-testid="voting-live-chip"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Voting Live
          </Link>
        )}
        {crownUpdating && (
          <span className="home1-chip home1-chip--crown flex items-center gap-1 rounded-full bg-yellow-500/90 px-2 py-0.5 text-[10px] font-bold text-black shadow-md">
            👑 Crown Updating
          </span>
        )}
      </div>

      {/* ── Left badges ── */}
      <div className="home1-cover-overlay__badges pointer-events-auto absolute left-2 flex flex-col gap-1.5" style={{ top: 52 }}>
        <Link
          href="/cypher"
          className="home1-badge home1-badge--cypher flex items-center gap-1 rounded-md bg-purple-700/90 px-2 py-0.5 text-[10px] font-bold text-white shadow pointer-events-auto"
          data-testid="cypher-arena-badge"
        >
          ⚡ Cypher Arena Open
        </Link>
        <Link
          href="/vote/rank/4"
          className="home1-badge home1-badge--vote flex items-center gap-1 rounded-md bg-cyan-700/90 px-2 py-0.5 text-[10px] font-bold text-white shadow pointer-events-auto"
          data-testid="vote-rank4-badge"
        >
          🗳️ Vote For #4
        </Link>
      </div>

      {/* ── Hype Bot notification ── */}
      <div
        className="home1-cover-overlay__hype pointer-events-none absolute bottom-12 left-2"
        style={{ zIndex: 2 }}
      >
        <span className="hype-bot-chip flex items-center gap-1 rounded-md bg-emerald-700/85 px-2 py-0.5 text-[10px] font-semibold text-white">
          🤖 Hype Bot:{" "}
          {rankOneName ? `${rankOneName} moving up` : "Artist moving up"}
        </span>
      </div>

      {/* ── Stream & Win chip ── */}
      <div
        className="home1-cover-overlay__stream-win pointer-events-auto absolute bottom-12 right-2"
        style={{ zIndex: 2 }}
      >
        <Link
          href="/stream-win"
          className="stream-win-chip flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-3 py-0.5 text-[10px] font-bold text-white shadow pointer-events-auto"
          data-testid="stream-win-chip"
        >
          🎬 Stream &amp; Win
        </Link>
      </div>

      {/* ── Footer strip: Weekly Cyphers promo ── */}
      <div className="home1-cover-overlay__footer pointer-events-auto absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/90 via-cyan-900/90 to-purple-900/90 px-3 py-1">
        <Link
          href="/magazine/issues/current/cyphers"
          className="flex items-center justify-center gap-2 text-[11px] font-bold text-cyan-300 pointer-events-auto"
          data-testid="weekly-cyphers-footer"
        >
          <span>⚡</span>
          <MagazinePromoMessageRotator
            intervalMs={6000}
            showIcon={false}
            showRoute={false}
            variant="strip"
            data-testid="footer-promo-rotator"
          />
          <span>⚡</span>
        </Link>
      </div>

      {/* ── Confetti / lightning layer ── */}
      <ConfettiMotionLayer active={confettiActive} count={24} zIndex={3} />
    </div>
  );
}
