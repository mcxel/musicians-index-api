"use client";

// DynamicRadialAura — sponsor logos orbit the performer profile.
// Speed = sponsorCount × BASE_SPEED. More sponsors → faster orbit.
// 1-5: slow elegant · 6-9: medium · 10+: high-speed data-orbit

import { useMemo } from "react";

type SponsorSlot = {
  id: string;
  label: string;
  color?: string;
  logo?: string;
};

type Props = {
  sponsors: SponsorSlot[];
  radius?: number;          // orbit radius in px (default 90)
  performerSize?: number;   // center avatar diameter in px (default 80)
  children?: React.ReactNode; // center content (avatar / profile pic)
  className?: string;
};

const BASE_PERIOD_S = 18; // seconds for a single sponsor to complete one orbit

function getOrbitPeriod(count: number): number {
  if (count <= 0) return BASE_PERIOD_S;
  // More sponsors → faster. Floor at 1.5s to keep legible.
  return Math.max(1.5, BASE_PERIOD_S / Math.sqrt(count));
}

function getSpeedLabel(count: number): string {
  if (count >= 10) return "fast";
  if (count >= 6) return "medium";
  return "slow";
}

export default function DynamicRadialAura({
  sponsors,
  radius = 90,
  performerSize = 80,
  children,
}: Props) {
  const count = sponsors.length;
  const periodS = getOrbitPeriod(count);
  const containerSize = (radius + 40) * 2;

  const slots = useMemo(() =>
    sponsors.map((s, i) => ({
      ...s,
      startDeg: (360 / count) * i,
      delay: -(periodS / count) * i, // stagger so they don't stack at start
    })),
    [sponsors, count, periodS],
  );

  if (count === 0) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: performerSize, height: performerSize }}>
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: containerSize,
        height: containerSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/* Injected keyframe styles */}
      <style>{`
        @keyframes tmi-radial-orbit {
          from { transform: rotate(var(--start-deg)) translateX(var(--orbit-r)) rotate(calc(-1 * var(--start-deg))); }
          to   { transform: rotate(calc(var(--start-deg) + 360deg)) translateX(var(--orbit-r)) rotate(calc(-360deg - var(--start-deg))); }
        }
      `}</style>

      {/* Orbit track (subtle ring) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: radius * 2,
          height: radius * 2,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />

      {/* Orbiting sponsor chips */}
      {slots.map((s) => (
        <div
          key={s.id}
          aria-label={s.label}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -12,
            marginLeft: -12,
            // CSS custom properties for the keyframe
            ["--start-deg" as string]: `${s.startDeg}deg`,
            ["--orbit-r" as string]:   `${radius}px`,
            animation: `tmi-radial-orbit ${periodS}s linear ${s.delay}s infinite`,
            willChange: "transform",
          }}
        >
          <div
            style={{
              background: s.color ?? "rgba(255,215,0,0.15)",
              border: `1px solid ${s.color ?? "#FFD700"}55`,
              borderRadius: 6,
              padding: "3px 7px",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: "#fff",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              boxShadow: `0 0 8px ${s.color ?? "#FFD700"}40`,
              maxWidth: 80,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {s.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.logo} alt={s.label} style={{ height: 14, objectFit: "contain" }} />
            ) : (
              s.label.slice(0, 12)
            )}
          </div>
        </div>
      ))}

      {/* Center performer content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: performerSize,
          height: performerSize,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export { getOrbitPeriod, getSpeedLabel };
export type { SponsorSlot };
