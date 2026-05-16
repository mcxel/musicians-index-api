"use client";

import { useEffect, useMemo, useState } from "react";
import { createStarfieldBurst, stepStarfield } from "@/lib/homepage/tmiHomepageStarfieldBurstEngine";

export default function TmiHomepageStarfieldBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState(() => createStarfieldBurst(32));
  const seed = useMemo(() => createStarfieldBurst(32), []);

  useEffect(() => {
    if (!active) return;
    setParticles(seed);
    const id = window.setInterval(() => {
      setParticles((prev) => stepStarfield(prev, 0.03));
    }, 30);
    return () => window.clearInterval(id);
  }, [active, seed]);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {particles.map((p) => {
        const x = 50 + Math.cos(p.angle) * p.radius;
        const y = 50 + Math.sin(p.angle) * p.radius;
        return (
          <span
            key={p.id}
            className="absolute h-1 w-1 rounded-full bg-cyan-200"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              boxShadow: `0 0 ${6 + p.glow * 12}px rgba(34,211,238,${p.glow})`,
              opacity: p.glow,
            }}
          />
        );
      })}
    </div>
  );
}
