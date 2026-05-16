"use client";

// SponsorRibbon
// Horizontally scrolling sponsor ribbon for Home 2 bottom
// Auto-scrolls through sponsor names/logos

import { useEffect, useRef } from "react";

type Sponsor = {
  id: string;
  name: string;
  logo?: string;   // URL — optional
  accentColor?: string;
  href?: string;
};

const DEFAULT_SPONSORS: Sponsor[] = [
  { id: "sp-1",  name: "BeatVault Studio",     accentColor: "#00FFFF",  href: "/sponsors/beatvault" },
  { id: "sp-2",  name: "SoundWave Pro",        accentColor: "#FF2DAA",  href: "/sponsors/soundwave" },
  { id: "sp-3",  name: "Crown Audio",          accentColor: "#FFD700",  href: "/sponsors/crown-audio" },
  { id: "sp-4",  name: "NeonBeat Records",     accentColor: "#AA2DFF",  href: "/sponsors/neonbeat" },
  { id: "sp-5",  name: "VaultDrop Merch",      accentColor: "#FF6B35",  href: "/sponsors/vaultdrop" },
  { id: "sp-6",  name: "CypherTech Solutions", accentColor: "#00FF88",  href: "/sponsors/cyphertech" },
];

type Props = {
  sponsors?: Sponsor[];
  speedPx?: number;   // pixels per second
};

export default function SponsorRibbon({ sponsors = DEFAULT_SPONSORS, speedPx = 38 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef     = useRef(0);
  const rafRef   = useRef<number | undefined>(undefined);

  useEffect(() => {
    let last = 0;

    function tick(ts: number) {
      if (last === 0) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;

      const track = trackRef.current;
      if (!track) { rafRef.current = requestAnimationFrame(tick); return; }

      xRef.current -= speedPx * dt;
      const half = track.scrollWidth / 2;
      if (Math.abs(xRef.current) >= half) xRef.current = 0;

      track.style.transform = `translateX(${xRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [speedPx]);

  // Double the list for seamless loop
  const doubled = [...sponsors, ...sponsors];

  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "7px 0",
        position: "relative",
      }}
    >
      {/* Fade masks */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 40,
          background: "linear-gradient(90deg, rgba(4,2,10,1), transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 40,
          background: "linear-gradient(270deg, rgba(4,2,10,1), transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div
        ref={trackRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          whiteSpace: "nowrap",
          willChange: "transform",
        }}
      >
        {doubled.map((s, i) => (
          <a
            key={`${s.id}-${i}`}
            href={s.href ?? "#"}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: s.accentColor ?? "#fff",
                opacity: 0.55,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: s.accentColor
                  ? `${s.accentColor}bb`
                  : "rgba(255,255,255,0.38)",
              }}
            >
              {s.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
