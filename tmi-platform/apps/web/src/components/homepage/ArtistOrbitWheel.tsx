"use client";

import { useEffect, useState, useRef } from "react";
import type { ArtistCardData, ArtistOrbitState } from "@/engines/ArtistRotationEngine";
import { ArtistRotationEngine } from "@/engines/ArtistRotationEngine";
import ArtistOrbitCard from "./ArtistOrbitCard";
import ArtistSpinRing from "./ArtistSpinRing";
import { getBadgeStyle, getHeroGradient, getMagazineCardStyle } from "@/theme/magazine-palette-engine";

export interface ArtistOrbitWheelProps {
  artists: ArtistCardData[];
  rotationInterval?: number;
  heading?: string;
  description?: string;
}

/**
 * ArtistOrbitWheel
 * Displays a circular orbit of artist profile cards with timed rotation.
 * Features:
 *   - Automatic rotation with configurable interval
 *   - Click any card to view artist profile
 *   - Hover to highlight and freeze rotation
 *   - Crown pulse on active artist
 *   - Smooth animations and glow effects
 */
export default function ArtistOrbitWheel({
  artists,
  rotationInterval = 3500,
  heading = "Featured Artists",
  description = "Rotating top performers",
}: ArtistOrbitWheelProps) {
  const engineRef = useRef<ArtistRotationEngine | null>(null);
  const [state, setState] = useState<ArtistOrbitState>({
    currentIndex: 0,
    isRotating: true,
    hoveredIndex: null,
    crowns: [],
  });

  // Initialize engine and subscribe to state changes
  useEffect(() => {
    const engine = new ArtistRotationEngine(artists, rotationInterval);
    engineRef.current = engine;
    setState({
      ...engine.getState(),
      crowns: [...engine.getState().crowns] as any,
    });

    const unsubscribe = engine.subscribe((newState) => {
      setState({
        ...newState,
        crowns: [...newState.crowns] as any,
      });
    });

    engine.start();

    return () => {
      unsubscribe();
      engine.dispose();
    };
  }, [artists, rotationInterval]);

  const handleHoverStart = (index: number) => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current.setHovered(index);
    }
  };

  const handleHoverEnd = () => {
    if (engineRef.current) {
      engineRef.current.setHovered(null);
      engineRef.current.start();
    }
  };

  const handlePrev = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current.prev();
      setTimeout(() => engineRef.current?.start(), 500);
    }
  };

  const handleNext = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current.next();
      setTimeout(() => engineRef.current?.start(), 500);
    }
  };

  return (
    <div className="w-full relative">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-100" style={{ backgroundImage: getHeroGradient("cypher"), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {heading}
        </h2>
        <p className="text-xs text-cyan-300/70 uppercase tracking-[0.14em]">
          {description}
        </p>
      </div>

      {/* Orbit container */}
      <div className="relative mx-auto w-full max-w-md aspect-square rounded-full border border-cyan-500/30 bg-gradient-to-br from-black/60 to-blue-950/30 overflow-hidden" style={getMagazineCardStyle("cypher")}>
        {/* Background ring */}
        <ArtistSpinRing />

        {/* Artist cards in orbit */}
        <div className="absolute inset-0">
          {artists.map((artist, index) => (
            <ArtistOrbitCard
              key={artist.id}
              artist={artist}
              index={index}
              total={artists.length}
              isActive={index === state.currentIndex}
              isHovered={index === state.hoveredIndex}
              crown={state.crowns[index] ?? 0}
              onHoverStart={() => handleHoverStart(index)}
              onHoverEnd={handleHoverEnd}
            />
          ))}
        </div>
      </div>

      {/* Controls footer */}
      <div className="mt-6 flex items-center justify-between">
        {/* Prev button */}
        <button
          onClick={handlePrev}
          className="px-4 py-2 rounded-lg border border-cyan-400/50 bg-black/40 hover:bg-cyan-500/20 text-cyan-300 text-sm font-bold uppercase transition-colors"
          style={getBadgeStyle("cypher", "ghost")}
          aria-label="Previous artist"
        >
          ← Prev
        </button>

        {/* Dot indicator */}
        <div className="flex gap-1">
          {artists.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => {
                if (engineRef.current) {
                  const target = index;
                  let current = state.currentIndex;
                  const distance = Math.abs(target - current);
                  const isClockwise = target > current;

                  engineRef.current.stop();
                  while (current !== target) {
                    if (isClockwise) {
                      engineRef.current.next();
                      current = (current + 1) % artists.length;
                    } else {
                      engineRef.current.prev();
                      current =
                        (current - 1 + artists.length) % artists.length;
                    }
                  }
                  setTimeout(() => engineRef.current?.start(), 500);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === state.currentIndex
                  ? "bg-yellow-300 w-3"
                  : "bg-cyan-400/40 hover:bg-cyan-400/70"
              }`}
              aria-label={`Go to artist ${index + 1}`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-lg border border-cyan-400/50 bg-black/40 hover:bg-cyan-500/20 text-cyan-300 text-sm font-bold uppercase transition-colors"
          style={getBadgeStyle("hip-hop", "ghost")}
          aria-label="Next artist"
        >
          Next →
        </button>
      </div>

      {/* Current artist info card */}
      {artists[state.currentIndex] && (
        <div className="mt-6 rounded-lg border border-cyan-300/30 bg-black/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200 mb-2">
            Now Spotlight
          </p>
          <p className="text-lg font-bold text-cyan-100">
            {artists[state.currentIndex].name}
          </p>
          <p className="text-xs text-cyan-300/60 mt-1">
            Artist #{state.currentIndex + 1} of {artists.length}
          </p>
        </div>
      )}
    </div>
  );
}
