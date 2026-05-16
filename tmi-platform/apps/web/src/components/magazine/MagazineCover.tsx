"use client";

// Canon source: Tmi Homepage 1.png — 3D magazine book on geometric retro background
// Structure: geometric retro bg (blue/purple/teal/yellow) + 3D book cover + performer grid
//            + VOTING LIVE badge + CYPHER ARENA OPEN badge
// Motion: hover tilt (rotateY) + click → expand signal

import React, { useState } from "react";
import Link from "next/link";

interface PerformerSlot {
  id: string;
  name: string;
  genre?: string;
  isCrownHolder?: boolean;
  rank?: number;
}

interface MagazineCoverProps {
  headline?: string;
  subheadline?: string;
  performers?: PerformerSlot[];
  votingLive?: boolean;
  cipherArenaOpen?: boolean;
  href?: string;
  issueNumber?: string | number;
  style?: React.CSSProperties;
}

const DEFAULT_PERFORMERS: PerformerSlot[] = [
  { id: "p1", name: "KOVA",         genre: "Afrobeat",   isCrownHolder: true,  rank: 1 },
  { id: "p2", name: "BLAZE CARTEL", genre: "Trap",       rank: 2 },
  { id: "p3", name: "SOLARA",       genre: "Alt Pop",    rank: 3 },
  { id: "p4", name: "DRIFT SOUND",  genre: "Electronic", rank: 4 },
  { id: "p5", name: "ASHA WAVE",    genre: "Soul",       rank: 5 },
  { id: "p6", name: "YUMI",         genre: "J-Pop",      rank: 6 },
];

// ─── Geometric retro tile background ─────────────────────────────────────────

function RetroGeometricBg() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "radial-gradient(ellipse at center, #0a0040 0%, #050510 100%)",
      }}
    >
      {/* Diamond grid overlay */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="retro-diamond" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <polygon points="20,2 38,20 20,38 2,20" fill="none" stroke="#AA2DFF" strokeWidth="0.8" />
          </pattern>
          <pattern id="retro-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="url(#retro-diamond)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#retro-grid)" />
      </svg>
      {/* Color blobs */}
      <div style={{ position: "absolute", top: "10%", left: "5%",  width: 200, height: 200, borderRadius: "50%", background: "#004e9220", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", top: "20%", right: "8%", width: 160, height: 160, borderRadius: "50%", background: "#AA2DFF18", filter: "blur(50px)" }} />
      <div style={{ position: "absolute", bottom: "15%", left: "15%", width: 180, height: 120, borderRadius: "50%", background: "#00FFFF12", filter: "blur(45px)" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 140, height: 140, borderRadius: "50%", background: "#FFD70015", filter: "blur(40px)" }} />
    </div>
  );
}

// ─── Performer grid on the cover ──────────────────────────────────────────────

function PerformerGrid({ performers }: { performers: PerformerSlot[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 4,
        padding: 8,
      }}
    >
      {performers.slice(0, 6).map((p) => (
        <div
          key={p.id}
          style={{
            background: p.isCrownHolder
              ? "linear-gradient(135deg, #FFD70020, #AA2DFF18)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${p.isCrownHolder ? "#FFD70040" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 5,
            padding: "5px 4px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            position: "relative",
          }}
        >
          {/* Crown badge */}
          {p.isCrownHolder && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -3,
                fontSize: 10,
                filter: "drop-shadow(0 0 4px #FFD700)",
              }}
            >
              👑
            </span>
          )}
          {/* Rank */}
          <span style={{ fontSize: 7, fontWeight: 900, color: p.isCrownHolder ? "#FFD700" : "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
            #{p.rank}
          </span>
          {/* Name */}
          <span style={{ fontSize: 6, fontWeight: 800, color: "#fff", textAlign: "center", letterSpacing: "0.08em", lineHeight: 1.2 }}>
            {p.name}
          </span>
          {/* Genre */}
          {p.genre && (
            <span style={{ fontSize: 5, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
              {p.genre.toUpperCase()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main cover ───────────────────────────────────────────────────────────────

export default function MagazineCover({
  headline = "WHO TOOK\nTHE MUSICIAN'S INDEX",
  subheadline,
  performers = DEFAULT_PERFORMERS,
  votingLive = true,
  cipherArenaOpen = true,
  href = "/magazine",
  issueNumber = "001",
  style,
}: MagazineCoverProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 560,
        margin: "0 auto",
        ...style,
      }}
    >
      <RetroGeometricBg />

      {/* Outer centering wrapper */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 24px",
          minHeight: 480,
        }}
      >
        {/* ── 3D Book wrapper ── */}
        <Link
          href={href}
          aria-label="Open The Musician's Index Magazine"
          style={{ textDecoration: "none", display: "block" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            style={{
              width: 240,
              perspective: "900px",
              cursor: "pointer",
            }}
          >
            {/* Book body */}
            <div
              style={{
                width: 240,
                background: "linear-gradient(160deg, #1a0040 0%, #050510 100%)",
                border: "1px solid rgba(170,45,255,0.35)",
                borderRadius: "3px 10px 10px 3px",
                boxShadow: hovered
                  ? "6px 8px 30px rgba(170,45,255,0.5), -3px 0 0 rgba(0,0,0,0.6), 0 0 60px rgba(170,45,255,0.25)"
                  : "4px 6px 20px rgba(170,45,255,0.3), -3px 0 0 rgba(0,0,0,0.5)",
                transform: hovered ? "rotateY(-8deg) scale(1.02)" : "rotateY(-4deg)",
                transformOrigin: "left center",
                transition: "transform 0.35s ease, box-shadow 0.35s ease",
                overflow: "hidden",
              }}
            >
              {/* Cover top bar */}
              <div
                style={{
                  background: "linear-gradient(to right, #AA2DFF, #FF2DAA)",
                  padding: "6px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 5, fontWeight: 900, letterSpacing: "0.3em", color: "rgba(255,255,255,0.8)" }}>THE</div>
                  <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "#fff" }}>MUSICIAN'S</div>
                  <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "#00FFFF" }}>INDEX</div>
                </div>
                <div style={{ fontSize: 7, fontWeight: 900, color: "rgba(255,255,255,0.7)", letterSpacing: "0.15em" }}>
                  ISSUE {issueNumber}
                </div>
              </div>

              {/* Headline */}
              <div style={{ padding: "8px 10px 4px" }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "0.08em",
                    lineHeight: 1.3,
                    textTransform: "uppercase",
                    whiteSpace: "pre-line",
                  }}
                >
                  {headline}
                </p>
                {subheadline && (
                  <p style={{ fontSize: 7, color: "#FFD700", letterSpacing: "0.12em", marginTop: 3 }}>
                    {subheadline}
                  </p>
                )}
              </div>

              {/* Performer grid */}
              <PerformerGrid performers={performers} />

              {/* Live badges */}
              <div style={{ display: "flex", gap: 6, padding: "4px 10px 10px", flexWrap: "wrap" }}>
                {votingLive && (
                  <span
                    style={{
                      fontSize: 6,
                      fontWeight: 900,
                      letterSpacing: "0.15em",
                      color: "#fff",
                      background: "#FF2DAA",
                      borderRadius: 3,
                      padding: "2px 6px",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", animation: "pulse 1s infinite" }} />
                    VOTING LIVE
                  </span>
                )}
                {cipherArenaOpen && (
                  <span
                    style={{
                      fontSize: 6,
                      fontWeight: 900,
                      letterSpacing: "0.15em",
                      color: "#050510",
                      background: "#00FFFF",
                      borderRadius: 3,
                      padding: "2px 6px",
                    }}
                  >
                    CYPHER ARENA OPEN
                  </span>
                )}
              </div>
            </div>

            {/* Book spine */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 8,
                background: "linear-gradient(to bottom, #AA2DFF, #FF2DAA)",
                borderRadius: "3px 0 0 3px",
                transform: "rotateY(90deg)",
                transformOrigin: "right center",
              }}
            />
          </div>
        </Link>
      </div>
    </div>
  );
}
