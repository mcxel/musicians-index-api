"use client";

// Canon source: Tmi Homepage 2.png — Weekly Crown Winner orbit display
// Structure: central crown glyph + orbiting artist bubbles + live vote counter
// Motion: artist bubbles orbit the crown at varying radii + speeds
//         crown holder bubble is larger and glows gold

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface CrownContender {
  id: string;
  name: string;
  votes: number;
  isCrownHolder?: boolean;
  orbitRadius?: number;   // px, default assigned per index
  orbitSpeed?: number;    // seconds per revolution, default assigned
  href: string;
}

interface MagazineCrownOrbitProps {
  contenders?: CrownContender[];
  totalVotes?: number;
  votingClosesIn?: string;   // e.g. "2d 14h"
  onVote?: (id: string) => void;
}

const DEFAULT_CONTENDERS: CrownContender[] = [
  { id: "kova",         name: "KOVA",         votes: 9820, isCrownHolder: true,  orbitRadius: 80,  orbitSpeed: 18, href: "/artists/kova" },
  { id: "blaze-cartel", name: "BLAZE",        votes: 9590, orbitRadius: 100, orbitSpeed: 24, href: "/artists/blaze-cartel" },
  { id: "solara",       name: "SOLARA",       votes: 8770, orbitRadius: 115, orbitSpeed: 30, href: "/artists/solara" },
  { id: "drift-sound",  name: "DRIFT",        votes: 8340, orbitRadius: 130, orbitSpeed: 20, href: "/artists/drift-sound" },
  { id: "asha-wave",    name: "ASHA",         votes: 7910, orbitRadius: 95,  orbitSpeed: 28, href: "/artists/asha-wave" },
];

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
            <Link key={c.id} href={c.href} style={{ textDecoration: "none" }}>
              <div
                aria-label={`${c.name} — ${c.votes.toLocaleString()} votes`}
                style={{
                  position: "absolute",
                  top: y - size / 2,
                  left: x - size / 2,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: c.isCrownHolder
                    ? "linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,45,170,0.2))"
                    : "rgba(255,255,255,0.06)",
                  border: `${c.isCrownHolder ? "2px" : "1px"} solid ${c.isCrownHolder ? "#FFD700" : "rgba(255,255,255,0.2)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: c.isCrownHolder ? "0 0 12px rgba(255,215,0,0.5)" : "none",
                  zIndex: c.isCrownHolder ? 9 : 5,
                  transition: "box-shadow 0.2s",
                }}
                title={`${c.name}: ${c.votes.toLocaleString()} votes`}
              >
                <span
                  style={{
                    fontSize: c.isCrownHolder ? 7 : 6,
                    fontWeight: 900,
                    color: c.isCrownHolder ? "#FFD700" : "rgba(255,255,255,0.8)",
                    textAlign: "center",
                    letterSpacing: "0.06em",
                    lineHeight: 1.1,
                    padding: "0 2px",
                  }}
                >
                  {c.name}
                </span>
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
