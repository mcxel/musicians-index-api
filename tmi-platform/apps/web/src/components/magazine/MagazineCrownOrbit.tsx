"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { computeRanks, getTierColor } from "@/lib/performers/PerformerRegistry";
import MotionPosterPlayer from "@/components/media/MotionPosterPlayer";

interface CrownContender {
  id: string;
  name: string;
  votes: number;
  isCrownHolder?: boolean;
  orbitRadius?: number;
  orbitSpeed?: number;
  href: string;
  // Rule 2: Media chain
  imageUrl?: string;
  introVideoUrl?: string;
  motionPosterUrl?: string;
  isLive?: boolean;
  liveRoomRoute?: string;
  audienceCount?: number;
  accentColor?: string;
}

interface MagazineCrownOrbitProps {
  contenders?: CrownContender[];
  totalVotes?: number;
  votingClosesIn?: string;
  onVote?: (id: string) => void;
}

// Rule 3 + Rule 8: Rankings driven by computeRanks(), never hardcoded
const ORBIT_RADII  = [80, 100, 115, 130, 95];
const ORBIT_SPEEDS = [18, 24, 30, 20, 28];

const DEFAULT_CONTENDERS: CrownContender[] = computeRanks().slice(0, 5).map((p, i) => ({
  id: p.slug,
  name: p.name.split(' ')[0]!.toUpperCase(),
  votes: p.xp,
  isCrownHolder: i === 0,
  orbitRadius: ORBIT_RADII[i],
  orbitSpeed: ORBIT_SPEEDS[i],
  href: p.profileRoute,
  imageUrl: p.profileImageUrl,
  introVideoUrl: p.introVideoUrl,
  motionPosterUrl: p.motionPosterUrl,
  isLive: p.isLive,
  liveRoomRoute: p.liveRoomRoute,
  audienceCount: p.audienceCount,
  accentColor: getTierColor(p.tier),
}));

// ─── Orbit animation using requestAnimationFrame ──────────────────────────────

function useOrbitAngles(contenders: CrownContender[]) {
  const anglesRef = useRef<number[]>(contenders.map((_, i) => (i / contenders.length) * 360));
  const [angles, setAngles] = useState<number[]>(anglesRef.current);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    function tick(now: number) {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;

      anglesRef.current = anglesRef.current.map((a, i) => {
        const speed = contenders[i]?.orbitSpeed ?? 24;
        return (a + (360 / speed) * dt) % 360;
      });
      setAngles([...anglesRef.current]);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [contenders]);

  return angles;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MagazineCrownOrbit({
  contenders = DEFAULT_CONTENDERS,
  totalVotes,
  votingClosesIn = "2d 14h",
  onVote,
}: MagazineCrownOrbitProps) {
  const angles = useOrbitAngles(contenders);
  const crownHolder = contenders.find((c) => c.isCrownHolder);
  const computedTotal = totalVotes ?? contenders.reduce((s, c) => s + c.votes, 0);

  // Canvas size — orbit container
  const SIZE = 300;
  const CENTER = SIZE / 2;

  return (
    <div
      data-crown-orbit
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Crown orbit canvas area */}
      <div
        style={{
          position: "relative",
          width: SIZE,
          height: SIZE,
          flexShrink: 0,
        }}
      >
        {/* Orbit rings (decorative) */}
        {contenders.map((c, i) => (
          <div
            key={`ring-${c.id}`}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: CENTER - (c.orbitRadius ?? 80),
              left: CENTER - (c.orbitRadius ?? 80),
              width: (c.orbitRadius ?? 80) * 2,
              height: (c.orbitRadius ?? 80) * 2,
              borderRadius: "50%",
              border: `1px solid ${c.isCrownHolder ? "rgba(255,215,0,0.18)" : "rgba(255,255,255,0.05)"}`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Central crown glyph */}
        <div
          style={{
            position: "absolute",
            top: CENTER - 28,
            left: CENTER - 28,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
            border: "2px solid rgba(255,215,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            boxShadow: "0 0 20px rgba(255,215,0,0.4)",
            zIndex: 10,
          }}
        >
          👑
        </div>

        {/* Orbiting artist bubbles */}
        {contenders.map((c, i) => {
          const angle = (angles[i] ?? 0) * (Math.PI / 180);
          const r = c.orbitRadius ?? 80;
          const x = CENTER + Math.cos(angle) * r;
          const y = CENTER + Math.sin(angle) * r;
          const size = c.isCrownHolder ? 42 : 32;

          return (
            <Link key={c.id} href={c.isLive && c.liveRoomRoute ? c.liveRoomRoute : c.href} style={{ textDecoration: "none" }}>
              <div
                aria-label={`${c.name} — ${c.votes.toLocaleString()} XP`}
                style={{
                  position: "absolute",
                  top: y - size / 2,
                  left: x - size / 2,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `${c.isCrownHolder ? "2px" : "1px"} solid ${c.isCrownHolder ? "#FFD700" : (c.accentColor ?? "rgba(255,255,255,0.2)")}`,
                  boxShadow: c.isCrownHolder ? "0 0 14px rgba(255,215,0,0.55)" : c.isLive ? "0 0 8px rgba(230,48,0,0.5)" : "none",
                  zIndex: c.isCrownHolder ? 9 : 5,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                }}
                title={`${c.name}: ${c.votes.toLocaleString()} XP`}
              >
                {/* Rule 2: Crown holder gets motion poster — others get static profile image */}
                {c.isCrownHolder && c.imageUrl ? (
                  <MotionPosterPlayer
                    isLive={c.isLive}
                    liveRoomRoute={c.liveRoomRoute}
                    introVideoUrl={c.introVideoUrl}
                    motionPosterUrl={c.motionPosterUrl}
                    staticImageUrl={c.imageUrl}
                    alt={c.name}
                    audienceCount={c.audienceCount}
                    showLiveOverlay={false}
                    replayOnHover
                    width={size}
                    height={size}
                    objectFit="cover"
                  />
                ) : c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.name} style={{ width: size, height: size, objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: size, height: size, background: c.isCrownHolder ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: c.isCrownHolder ? 7 : 6, fontWeight: 900, color: c.isCrownHolder ? "#FFD700" : "rgba(255,255,255,0.8)", textAlign: "center", letterSpacing: "0.06em", lineHeight: 1.1, padding: "0 2px" }}>
                      {c.name}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Crown holder callout */}
      {crownHolder && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "rgba(255,215,0,0.07)",
            border: "1px solid rgba(255,215,0,0.25)",
            borderRadius: 20,
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,215,0,0.6)", letterSpacing: "0.15em" }}>WEEKLY CROWN WINNER</span>
          <span
            style={{
              background: "#FFD700",
              color: "#050510",
              fontWeight: 900,
              borderRadius: 10,
              padding: "2px 10px",
              fontSize: 9,
              letterSpacing: "0.08em",
            }}
          >
            {crownHolder.name}
          </span>
          <span style={{ fontSize: 11 }}>⚡</span>
        </div>
      )}

      {/* Vote stats */}
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#FFD700" }}>{computedTotal.toLocaleString()}</div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}>TOTAL VOTES</div>
        </div>
        <div
          style={{
            width: 1,
            height: 30,
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#FF2DAA" }}>{votingClosesIn}</div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}>CLOSES IN</div>
        </div>

        {onVote && crownHolder && (
          <button
            onClick={() => onVote(crownHolder.id)}
            style={{
              background: "linear-gradient(135deg, #FFD700, #FF2DAA)",
              border: "none",
              borderRadius: 20,
              padding: "7px 16px",
              fontSize: 8,
              fontWeight: 900,
              color: "#050510",
              letterSpacing: "0.15em",
              cursor: "pointer",
            }}
          >
            VOTE NOW
          </button>
        )}
      </div>
    </div>
  );
}
