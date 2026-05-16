"use client";

import { useMemo } from "react";
import { buildStarfieldBurst } from "@/lib/homepage/tmiStarfieldBurstEngine";

export default function HomepageStarfieldBurst({ seed }: { seed: number }) {
  const particles = useMemo(() => buildStarfieldBurst(seed, 28), [seed]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute block rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.scale * 6}px`,
            height: `${p.scale * 6}px`,
            background: `hsla(${p.hue}, 100%, 65%, 0.9)`,
            boxShadow: `0 0 ${Math.round(p.scale * 18)}px hsla(${p.hue}, 100%, 60%, 0.7)`,
            animation: `tmi-star-burst ${p.lifeMs}ms ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}
