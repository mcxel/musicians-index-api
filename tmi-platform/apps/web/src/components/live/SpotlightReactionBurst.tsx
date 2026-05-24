"use client";

import { useEffect, useRef, useState } from "react";
import type { SpotlightPhase } from "@/hooks/useSpotlight";

const EMOTES = ["🔥", "❤️", "⚡", "👑", "🎧", "✨", "🎤", "🌊"];
const MAX_PER_BURST = 5;
const GLOBAL_CAP = 120;
const GLOBAL_RESET_MS = 60_000;

let globalCount = 0;
if (typeof window !== "undefined") {
  setInterval(() => { globalCount = 0; }, GLOBAL_RESET_MS);
}

interface Particle {
  id: number;
  emoji: string;
  x: number;
  dur: number;
}

let nextId = 0;

export function SpotlightReactionBurst({
  phase,
  emotes,
}: {
  phase: SpotlightPhase;
  emotes?: string[];
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevPhase = useRef<SpotlightPhase>("idle");

  useEffect(() => {
    const wasRevealed = prevPhase.current !== "revealed" && phase === "revealed";
    prevPhase.current = phase;
    if (!wasRevealed) return;

    const available = Math.min(MAX_PER_BURST, GLOBAL_CAP - globalCount);
    if (available <= 0) return;

    globalCount += available;
    const pool = emotes && emotes.length > 0 ? emotes : EMOTES;

    const burst: Particle[] = Array.from({ length: available }, () => ({
      id: nextId++,
      emoji: pool[Math.floor(Math.random() * pool.length)]!,
      x: 12 + Math.random() * 56,
      dur: 1100 + Math.floor(Math.random() * 500),
    }));

    setParticles(burst);
    const t = setTimeout(() => setParticles([]), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  if (particles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes spotBurstRise {
          0%   { transform: translateY(0) scale(1) translateZ(0);    opacity: 1; }
          80%  { opacity: 0.7; }
          100% { transform: translateY(-80px) scale(0.65) translateZ(0); opacity: 0; }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: 155,
          left: 0,
          width: 280,
          height: 90,
          pointerEvents: "none",
          zIndex: 101,
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              bottom: 0,
              fontSize: 22,
              lineHeight: 1,
              animation: `spotBurstRise ${p.dur}ms ease-out forwards`,
              willChange: "transform, opacity",
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>
    </>
  );
}
