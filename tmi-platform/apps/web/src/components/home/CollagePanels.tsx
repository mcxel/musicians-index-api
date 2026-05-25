"use client";

import Link from "next/link";
import { useState } from "react";

interface SeedArtist {
  name: string;
  rank: number;
  score: number;
  delta: number;
  genre: string;
}

interface Palette {
  primary: string;
  secondary: string;
}

interface CollagePanelsProps {
  side: "left" | "right";
  artists: SeedArtist[];
  palette: Palette;
  positionFlags: readonly string[];
}

const CUTOUT_CLIPS = [
  "polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
  "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
  "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
];

const RANK_SHAPES = [
  "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
];

const RANK_ACCENT_COLORS = ["#FFD700", "#AA2DFF", "#00FFFF", "#FF2DAA"];
const LEFT_TILTS = [-7, 3, -4];
const LEFT_OFFSETS = [{ x: -8, y: 0 }, { x: 8, y: 12 }, { x: -4, y: 24 }];

function PanelKeyframes() {
  return (
    <style>{`
      @keyframes collagePanelFloat {
        0%,100% { transform: var(--panel-base-transform) translateY(0px); }
        50% { transform: var(--panel-base-transform) translateY(-7px); }
      }
      @keyframes rankGlow {
        0%,100% { filter: brightness(1) drop-shadow(0 0 8px var(--rank-color)); }
        50% { filter: brightness(1.3) drop-shadow(0 0 20px var(--rank-color)); }
      }
      @keyframes collagePanelIn {
        0% { opacity: 0; transform: var(--panel-base-transform) translateX(var(--slide-dir, -24px)) scale(0.88); }
        100% { opacity: 1; transform: var(--panel-base-transform) translateX(0) scale(1); }
      }
    `}</style>
  );
}

function LeftCollage({ artists, palette, positionFlags }: Omit<CollagePanelsProps, "side">) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <>
      <PanelKeyframes />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: 0, position: "relative", width: "100%", height: "100%", padding: "0 8px 0 0" }}>
        {artists.slice(1, 4).map((artist, index) => {
          const tilt = LEFT_TILTS[index] ?? 0;
          const offset = LEFT_OFFSETS[index] ?? { x: 0, y: 0 };
          const clip = CUTOUT_CLIPS[index % CUTOUT_CLIPS.length]!;
          const isHovered = hoveredIndex === index;
          const baseTransform = `rotate(${tilt}deg) translateX(${offset.x}px) translateY(${offset.y}px)`;

          return (
            <Link key={artist.name} href="/rankings" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  width: "clamp(100px, 14vw, 148px)",
                  aspectRatio: "3 / 4",
                  clipPath: clip,
                  background: isHovered ? `linear-gradient(135deg, ${palette.primary}3a, ${palette.secondary}2a)` : `linear-gradient(145deg, ${palette.primary}22, ${palette.secondary}14)`,
                  border: `2px solid ${isHovered ? palette.primary : `${palette.primary}66`}`,
                  boxShadow: isHovered ? `0 0 24px ${palette.primary}88, 0 0 48px ${palette.primary}44, 0 12px 28px rgba(0,0,0,0.5)` : `0 0 14px ${palette.primary}44, 0 10px 22px rgba(0,0,0,0.42)`,
                  padding: "10px 8px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  position: "relative",
                  backdropFilter: "blur(8px)",
                  cursor: "pointer",
                  transition: "box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease",
                  ["--panel-base-transform" as string]: baseTransform,
                  ["--slide-dir" as string]: "-24px",
                  animation: `collagePanelIn 0.6s ${index * 0.1}s cubic-bezier(0.16,1,0.3,1) both, collagePanelFloat ${4.2 + index * 0.4}s ${index * 0.3}s ease-in-out infinite`,
                }}
              >
                <div style={{ position: "absolute", top: -8, left: -8, width: 24, height: 24, borderRadius: "50%", background: artist.rank === 1 ? "#FFD700" : "rgba(0,0,0,0.9)", border: `2px solid ${artist.rank === 1 ? "#FFD700" : palette.primary}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: artist.rank === 1 ? "#000" : palette.primary, boxShadow: `0 0 10px ${palette.primary}66`, zIndex: 4 }}>
                  {artist.rank}
                </div>
                <div style={{ position: "absolute", bottom: 5, right: 5, fontSize: 11, lineHeight: 1, filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.9))", zIndex: 3 }}>
                  {positionFlags[(index + 1) % positionFlags.length]}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${palette.primary}55, ${palette.secondary}22)`, border: `2px solid ${palette.primary}88`, boxShadow: `0 0 14px ${palette.primary}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: palette.primary, flexShrink: 0 }}>
                  {artist.name.charAt(0)}
                </div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.04em", color: isHovered ? "#fff" : "rgba(255,255,255,0.82)", textAlign: "center", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                  {artist.name}
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>{artist.score.toLocaleString()}</span>
                  <span style={{ fontSize: 7, fontWeight: 900, color: artist.delta > 0 ? "#00FF88" : "#FF4444" }}>
                    {artist.delta > 0 ? `▲${artist.delta}` : `▼${Math.abs(artist.delta)}`}
                  </span>
                </div>
                <div style={{ padding: "2px 7px", fontSize: 6, fontWeight: 900, letterSpacing: "0.12em", border: `1px solid ${palette.primary}44`, color: palette.primary, textTransform: "uppercase", clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}>
                  {artist.genre}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function RightCollage({ artists, palette }: Omit<CollagePanelsProps, "side">) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <>
      <PanelKeyframes />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, position: "relative", width: "100%", height: "100%", padding: "0 0 0 8px" }}>
        {artists.slice(0, 4).map((artist, index) => {
          const shape = RANK_SHAPES[index % RANK_SHAPES.length]!;
          const accent = RANK_ACCENT_COLORS[index % RANK_ACCENT_COLORS.length]!;
          const isHovered = hoveredIndex === index;
          const tilt = (index % 2 === 0 ? 1 : -1) * (3 + index * 1.5);

          return (
            <Link key={artist.name} href="/rankings" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  ["--panel-base-transform" as string]: `rotate(${tilt}deg)`,
                  ["--slide-dir" as string]: "24px",
                  ["--rank-color" as string]: accent,
                  animation: `collagePanelIn 0.6s ${index * 0.12}s cubic-bezier(0.16,1,0.3,1) both, collagePanelFloat ${4.0 + index * 0.5}s ${index * 0.25}s ease-in-out infinite`,
                  transition: "opacity 0.2s ease",
                }}
              >
                <div style={{ width: "clamp(52px, 7vw, 72px)", height: "clamp(52px, 7vw, 72px)", clipPath: shape, background: index === 0 ? `radial-gradient(circle at 40% 40%, ${accent}88, ${accent}44)` : `radial-gradient(circle at 40% 40%, ${accent}55, ${accent}22)`, border: isHovered ? `2px solid ${accent}` : `2px solid ${accent}88`, boxShadow: isHovered ? `0 0 28px ${accent}aa, 0 0 56px ${accent}55` : `0 0 16px ${accent}66`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: `rankGlow ${3.2 + index * 0.5}s ${index * 0.4}s ease-in-out infinite`, transition: "box-shadow 0.22s ease", ["--rank-color" as string]: accent }}>
                  <span style={{ fontSize: "clamp(14px, 2vw, 20px)", fontWeight: 900, color: index === 0 ? "#050510" : accent, lineHeight: 1, textShadow: index === 0 ? "none" : `0 0 8px ${accent}` }}>
                    {artist.rank === 1 ? "👑" : `#${artist.rank}`}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, opacity: isHovered ? 1 : 0.72, transition: "opacity 0.2s ease" }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: accent, letterSpacing: "0.04em", textShadow: `0 0 10px ${accent}66`, maxWidth: "clamp(60px, 9vw, 100px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {artist.name}
                  </div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: artist.delta > 0 ? "#00FF88" : "#FF4444", letterSpacing: "0.08em" }}>
                    {artist.delta > 0 ? `▲${artist.delta}` : `▼${Math.abs(artist.delta)}`}
                  </div>
                  <div style={{ fontSize: 6, fontWeight: 900, color: "rgba(255,255,255,0.28)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {artist.genre}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default function CollagePanels({ side, artists, palette, positionFlags }: CollagePanelsProps) {
  return side === "left"
    ? <LeftCollage artists={artists} palette={palette} positionFlags={positionFlags} />
    : <RightCollage artists={artists} palette={palette} positionFlags={positionFlags} />;
}

