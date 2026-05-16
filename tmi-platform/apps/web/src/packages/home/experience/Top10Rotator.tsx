"use client";

import { useEffect, useMemo, useState } from "react";
import GenreOrbitEngine from "./GenreOrbitEngine";
import Top10RankList from "./Top10RankList";
import MagazineArtifactCanvas from "./MagazineArtifactCanvas";
import { GENRE_ORDER, TOP10_FACE_BY_GENRE, type GenreKey } from "./top10FaceData";
import { MOTION_TIMING } from "./MotionTimingRegistry";
import Home1CoverOverlay from "@/packages/magazine-engine/Home1CoverOverlay";

const SLOT_HOLDS = MOTION_TIMING.SLOT_HOLDS;
const FADE_MS = MOTION_TIMING.STARBURST_MS;
const GENRE_THEME: Record<GenreKey, string> = {
  rnb: "genre-rnb",
  hiphop: "genre-hiphop",
  rock: "genre-rock",
  pop: "genre-pop",
  afrobeat: "genre-afrobeat",
  local: "genre-local",
  worldwide: "genre-worldwide",
  global: "genre-global",
};

type Top10RotatorProps = {
  onGenreChange?: (genre: GenreKey) => void;
  compact?: boolean;
};

type RotationPhase = "idle" | "entering" | "active" | "exiting";

export default function Top10Rotator({ onGenreChange, compact = false }: Top10RotatorProps) {
  const [genreIndex, setGenreIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [sparkleOn, setSparkleOn] = useState(false);
  const [phase, setPhase] = useState<RotationPhase>("idle");
  const [crownActive, setCrownActive] = useState(false);
  const [spotlit, setSpotlit] = useState(false);

  const genre = GENRE_ORDER[genreIndex];
  const entries = useMemo(() => {
    return TOP10_FACE_BY_GENRE[genre];
  }, [genre, genreIndex]);

  useEffect(() => {
    const slotHold = SLOT_HOLDS[genreIndex % SLOT_HOLDS.length] ?? 5000;
    const crownDelay = Math.max(300, Math.floor(slotHold * 0.7));

    setPhase("entering");
    setCrownActive(false);
    setSpotlit(false);
    const enterTimer = window.setTimeout(() => {
      setPhase("active");
      setSpotlit(true);

      // Crown appears at 70% through the hold window
      const crownTimer = window.setTimeout(() => {
        setCrownActive(true);
        // Crown fades out after 1800ms (or before hold ends)
        const crownFadeTimer = window.setTimeout(() => {
          setCrownActive(false);
        }, Math.min(1800, slotHold * 0.25));
        return () => window.clearTimeout(crownFadeTimer);
      }, crownDelay);

      return () => window.clearTimeout(crownTimer);
    }, 300);

    const holdTimer = window.setTimeout(() => {
      setPhase("exiting");
      setSparkleOn(true);
      setIsFading(true);
      setCrownActive(false);
      setSpotlit(false);

      const swapTimer = window.setTimeout(() => {
        const next = (genreIndex + 1) % GENRE_ORDER.length;
        setGenreIndex(next);
        onGenreChange?.(GENRE_ORDER[next]);
        setIsFading(false);
        setSparkleOn(false);
        setPhase("entering");
      }, FADE_MS);

      return () => {
        window.clearTimeout(swapTimer);
      };
    }, slotHold);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(holdTimer);
    };
  }, [genreIndex, onGenreChange]);

  return (
    <section
      className={`top10-rotator top10-rotator--enhanced ${compact ? "top10-rotator--compact" : ""} ${GENRE_THEME[genre]} relative overflow-hidden`}
      data-rotation-phase={phase}
      aria-label="Top 10 Rotator"
    >
      <MagazineArtifactCanvas />

      {/* Cover overlay — magazine artifacts + promo rotator */}
      <Home1CoverOverlay
        currentGenre={genre}
        rankOneName={entries[0]?.name}
        rankOneId={entries[0]?.id}
        votingLive
        crownUpdating={crownActive}
        confettiActive={sparkleOn}
        data-testid="top10-cover-overlay"
      />

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ${sparkleOn ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-300/25 to-cyan-400/0" />
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_70%_75%,rgba(217,70,239,0.2),transparent_42%)]" />
        <div className="absolute inset-0 starburst-layer" />
      </div>
      <header className="top10-rotator__header relative z-10">
        <p className="top10-rotator__kicker">5s Genre Motion Engine</p>
        <h2 className="top10-rotator__title">Top 10 Faces — {genre.toUpperCase()}</h2>
      </header>

      <div className="relative z-10 grid grid-cols-1 gap-3">
        {!compact ? (
          <GenreOrbitEngine
            genre={genre}
            entries={entries}
            isFading={isFading}
            crownActive={crownActive}
            spotlit={spotlit}
          />
        ) : null}
        <Top10RankList entries={entries} />
      </div>
    </section>
  );
}
