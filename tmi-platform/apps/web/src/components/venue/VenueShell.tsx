"use client";

// Canon source: Venue Skins Plus Seating/ + game show and venue skins/
// Skins observed:
//   neon-club    — circular LED ceiling, VIP booth ring, open dance floor
//   space-lounge — galaxy ceiling, curved LED screens, floating stage
//   auditorium   — fixed row seating, wooden stage, curtain backdrop
//   outdoor      — tiered bench rows, open-air stage, natural backdrop
//   game-show    — neon podiums, marquee lightbulb frame, spotlight rig
//   dark-space   — default TMI deep-space (fallback)
//
// Layer stack (bottom → top):
//   VenueFloorLayer → VenueWallLayer → VenueEnvironmentLayer →
//   VenueStageLayer → VenueSeatLayer → VenueCrowdLayer →
//   VenueBillboardLayer → VenueLightingLayer → children (HUD/content)

import React from "react";

export type VenueSkin =
  | "neon-club"
  | "space-lounge"
  | "auditorium"
  | "outdoor"
  | "game-show"
  | "dark-space";

export type VenueLayout =
  | "standing"      // open floor, no fixed seats
  | "theater"       // fixed rows facing stage
  | "arena"         // tiered seating, center stage
  | "intimate"      // small club, scattered seating
  | "broadcast";    // game show / broadcast setup

interface VenueShellProps {
  /** Visual skin applied to walls, floor, atmosphere */
  skin?: VenueSkin;
  /** Determines seat/crowd layout configuration */
  layout?: VenueLayout;
  /** Optional: venue name shown in billboard slot if no billboard content provided */
  venueName?: string;
  /** Slot: content rendered in the main billboard/screen */
  billboard?: React.ReactNode;
  /** Slot: stage content (performer, podium, host) */
  stage?: React.ReactNode;
  /** Slot: seat map overlay */
  seats?: React.ReactNode;
  /** Slot: crowd/audience layer */
  crowd?: React.ReactNode;
  /** Slot: lighting effects overlay */
  lighting?: React.ReactNode;
  /** Slot: HUD / interactive overlays rendered on top of all layers */
  hud?: React.ReactNode;
  /** Full height mode (default true) */
  fullHeight?: boolean;
  /** Extra style overrides on the outer shell */
  style?: React.CSSProperties;
}

// ─── Per-skin visual tokens ────────────────────────────────────────────────────

const SKIN_CONFIG: Record<VenueSkin, {
  bg: string;
  wallColor: string;
  floorColor: string;
  glowColor: string;
  ambientOpacity: number;
  stageGlow: string;
}> = {
  "neon-club": {
    bg: "radial-gradient(ellipse at top, #1a0033 0%, #050510 60%, #000 100%)",
    wallColor: "rgba(170,45,255,0.12)",
    floorColor: "rgba(0,255,255,0.06)",
    glowColor: "#AA2DFF",
    ambientOpacity: 0.7,
    stageGlow: "#00FFFF",
  },
  "space-lounge": {
    bg: "radial-gradient(ellipse at top, #000428 0%, #004e92 40%, #050510 100%)",
    wallColor: "rgba(0,78,146,0.2)",
    floorColor: "rgba(0,255,255,0.04)",
    glowColor: "#00FFFF",
    ambientOpacity: 0.8,
    stageGlow: "#FF2DAA",
  },
  "auditorium": {
    bg: "linear-gradient(180deg, #1a1008 0%, #0d0a04 100%)",
    wallColor: "rgba(139,90,43,0.15)",
    floorColor: "rgba(100,70,30,0.1)",
    glowColor: "#FFD700",
    ambientOpacity: 0.5,
    stageGlow: "#FFD700",
  },
  "outdoor": {
    bg: "linear-gradient(180deg, #0a1628 0%, #1a2a1a 50%, #0d0d08 100%)",
    wallColor: "rgba(0,100,50,0.1)",
    floorColor: "rgba(50,80,30,0.12)",
    glowColor: "#00FF88",
    ambientOpacity: 0.4,
    stageGlow: "#00FF88",
  },
  "game-show": {
    bg: "radial-gradient(ellipse at center, #1a0050 0%, #050510 70%)",
    wallColor: "rgba(255,45,170,0.1)",
    floorColor: "rgba(170,45,255,0.08)",
    glowColor: "#FF2DAA",
    ambientOpacity: 0.9,
    stageGlow: "#FFD700",
  },
  "dark-space": {
    bg: "radial-gradient(ellipse at top, #0a0a1a 0%, #050510 60%, #000 100%)",
    wallColor: "rgba(255,255,255,0.04)",
    floorColor: "rgba(255,255,255,0.02)",
    glowColor: "#00FFFF",
    ambientOpacity: 0.3,
    stageGlow: "#00FFFF",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function VenueShell({
  skin = "dark-space",
  layout = "standing",
  venueName,
  billboard,
  stage,
  seats,
  crowd,
  lighting,
  hud,
  fullHeight = true,
  style,
}: VenueShellProps) {
  const cfg = SKIN_CONFIG[skin];

  return (
    <div
      data-venue-shell
      data-skin={skin}
      data-layout={layout}
      style={{
        position: "relative",
        width: "100%",
        minHeight: fullHeight ? "100vh" : 480,
        overflow: "hidden",
        background: cfg.bg,
        ...style,
      }}
    >
      {/* ── Layer 1: Floor ── */}
      <VenueFloorLayer color={cfg.floorColor} layout={layout} />

      {/* ── Layer 2: Walls / atmosphere ── */}
      <VenueWallLayer color={cfg.wallColor} glow={cfg.glowColor} skin={skin} />

      {/* ── Layer 3: Ambient ceiling / environment glow ── */}
      <VenueAmbientLayer glow={cfg.glowColor} opacity={cfg.ambientOpacity} skin={skin} />

      {/* ── Layer 4: Billboard / screen slot ── */}
      <div
        data-layer="billboard"
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "clamp(240px, 55%, 640px)",
          zIndex: 4,
        }}
      >
        {billboard ?? (
          <VenueDefaultBillboard venueName={venueName} glow={cfg.stageGlow} />
        )}
      </div>

      {/* ── Layer 5: Stage slot ── */}
      <div
        data-layer="stage"
        style={{
          position: "absolute",
          bottom: layout === "theater" || layout === "arena" ? "28%" : "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "clamp(200px, 60%, 700px)",
          zIndex: 5,
        }}
      >
        {stage ?? <VenueDefaultStage glow={cfg.stageGlow} layout={layout} />}
      </div>

      {/* ── Layer 6: Seats slot ── */}
      {seats && (
        <div data-layer="seats" style={{ position: "absolute", inset: 0, zIndex: 6 }}>
          {seats}
        </div>
      )}

      {/* ── Layer 7: Crowd slot ── */}
      {crowd && (
        <div data-layer="crowd" style={{ position: "absolute", inset: 0, zIndex: 7 }}>
          {crowd}
        </div>
      )}

      {/* ── Layer 8: Lighting effects slot ── */}
      <div data-layer="lighting" style={{ position: "absolute", inset: 0, zIndex: 8, pointerEvents: "none" }}>
        {lighting ?? <VenueDefaultLighting skin={skin} glow={cfg.glowColor} />}
      </div>

      {/* ── Layer 9: HUD / content slot ── */}
      {hud && (
        <div data-layer="hud" style={{ position: "absolute", inset: 0, zIndex: 20 }}>
          {hud}
        </div>
      )}
    </div>
  );
}

// ─── Default sub-layers ────────────────────────────────────────────────────────

function VenueFloorLayer({ color, layout }: { color: string; layout: VenueLayout }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: layout === "theater" || layout === "arena" ? "45%" : "30%",
        background: `linear-gradient(to top, ${color} 0%, transparent 100%)`,
        zIndex: 1,
      }}
    />
  );
}

function VenueWallLayer({ color, glow, skin }: { color: string; glow: string; skin: VenueSkin }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      {/* Left wall glow */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "18%", background: `linear-gradient(to right, ${color}, transparent)` }} />
      {/* Right wall glow */}
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "18%", background: `linear-gradient(to left, ${color}, transparent)` }} />
      {/* Top border glow */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, transparent, ${glow}, transparent)` }} />
      {/* Bottom border glow */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${glow}80, transparent)` }} />
      {/* Game-show marquee frame */}
      {skin === "game-show" && <GameShowMarqueeFrame glow={glow} />}
    </div>
  );
}

function VenueAmbientLayer({ glow, opacity, skin }: { glow: string; opacity: number; skin: VenueSkin }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        height: "40%",
        background: `radial-gradient(ellipse at top, ${glow}${Math.round(opacity * 30).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        zIndex: 3,
        pointerEvents: "none",
      }}
    />
  );
}

function VenueDefaultBillboard({ venueName, glow }: { venueName?: string; glow: string }) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.7)",
        border: `1px solid ${glow}40`,
        borderRadius: 10,
        aspectRatio: "16/9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 40px ${glow}20`,
      }}
    >
      {venueName ? (
        <span style={{ fontSize: 18, fontWeight: 900, color: glow, letterSpacing: "0.1em" }}>
          {venueName}
        </span>
      ) : (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>
          SCREEN SLOT
        </span>
      )}
    </div>
  );
}

function VenueDefaultStage({ glow, layout }: { glow: string; layout: VenueLayout }) {
  const isGameShow = layout === "broadcast";
  return (
    <div
      style={{
        height: isGameShow ? 80 : 48,
        borderRadius: "50% 50% 0 0",
        background: `linear-gradient(to top, ${glow}20, transparent)`,
        border: `1px solid ${glow}30`,
        borderBottom: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isGameShow ? 40 : 0,
      }}
    >
      {isGameShow && (
        <>
          <PodiumPill glow={glow} />
          <PodiumPill glow={glow} />
          <PodiumPill glow={glow} />
        </>
      )}
    </div>
  );
}

function PodiumPill({ glow }: { glow: string }) {
  return (
    <div
      style={{
        width: 40,
        height: 60,
        borderRadius: "8px 8px 0 0",
        background: `linear-gradient(to top, ${glow}40, ${glow}10)`,
        border: `1px solid ${glow}50`,
        borderBottom: "none",
      }}
    />
  );
}

function VenueDefaultLighting({ skin, glow }: { skin: VenueSkin; glow: string }) {
  if (skin === "game-show") {
    return (
      <>
        {/* Spotlight cones */}
        {[25, 50, 75].map((left) => (
          <div
            key={left}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: `${left}%`,
              transform: "translateX(-50%)",
              width: 3,
              height: "60%",
              background: `linear-gradient(to bottom, ${glow}80 0%, transparent 100%)`,
              filter: `blur(4px)`,
              pointerEvents: "none",
            }}
          />
        ))}
      </>
    );
  }
  return null;
}

function GameShowMarqueeFrame({ glow }: { glow: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "5%",
        left: "5%",
        right: "5%",
        bottom: "5%",
        border: `2px solid ${glow}30`,
        borderRadius: 16,
        boxShadow: `inset 0 0 60px ${glow}08, 0 0 60px ${glow}08`,
      }}
    />
  );
}
