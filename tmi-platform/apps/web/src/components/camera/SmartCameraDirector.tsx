"use client";

import type { ReactNode } from "react";
import type { CameraLayout, CameraMode, SlotGeometry, SlotName } from "@/lib/camera/SmartCameraDirectorEngine";
import { LAYOUT_MAP } from "@/lib/camera/SmartCameraDirectorEngine";

// Explicit properties so the browser can GPU-composite each change independently.
// z-index has 0ms delay — stacking must snap, not blend.
const SLOT_TRANSITION =
  "top 480ms cubic-bezier(0.4,0,0.2,1), " +
  "left 480ms cubic-bezier(0.4,0,0.2,1), " +
  "width 480ms cubic-bezier(0.4,0,0.2,1), " +
  "height 480ms cubic-bezier(0.4,0,0.2,1), " +
  "opacity 360ms ease, " +
  "border-radius 420ms ease";

export type PerformerInfo = {
  name: string;
  role?: string;
  accentColor?: string;
};

export type VoteData = {
  aVotes: number;
  bVotes: number;
};

export type SmartCameraDirectorProps = {
  mode: CameraMode;
  layout: CameraLayout;
  videoSlot?: ReactNode;
  artistSlot?: ReactNode;
  opponentSlot?: ReactNode;
  guestSlot?: ReactNode;
  performerA?: PerformerInfo;
  performerB?: PerformerInfo;
  heatScore?: number;
  voteData?: VoteData;
  sponsorHalo?: ReactNode;
  fanReactions?: ReactNode;
  replayControls?: ReactNode;
};

// ─── Slot wrapper ─────────────────────────────────────────────────────────────

function SlotWrapper({
  geo,
  label,
  isPip,
  children,
}: {
  geo: SlotGeometry;
  label?: PerformerInfo;
  isPip?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: geo.top,
        left: geo.left,
        width: geo.width,
        height: geo.height,
        opacity: geo.opacity,
        zIndex: geo.zIndex,
        borderRadius: geo.borderRadius,
        pointerEvents: geo.pointerEvents,
        overflow: "hidden",
        background: "#050508",
        transition: SLOT_TRANSITION,
        // PiP slots get a colored frame so they read as "secondary camera"
        boxShadow: isPip ? "0 0 0 2px rgba(255,255,255,0.18), 0 8px 32px rgba(0,0,0,0.6)" : "none",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {children}

        {/* Performer name label — always rendered, slot opacity handles visibility */}
        {label && (
          <div
            style={{
              position: "absolute",
              bottom: isPip ? 4 : 10,
              left: isPip ? 6 : 12,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              pointerEvents: "none",
            }}
          >
            {label.role && (
              <div
                style={{
                  fontSize: isPip ? 6 : 8,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: label.accentColor ?? "rgba(255,255,255,0.55)",
                  textShadow: "0 0 8px rgba(0,0,0,0.9)",
                }}
              >
                {label.role}
              </div>
            )}
            <div
              style={{
                fontSize: isPip ? 9 : 13,
                fontWeight: 900,
                color: "#fff",
                textShadow: "0 1px 8px rgba(0,0,0,0.95), 0 0 24px rgba(0,0,0,0.7)",
                letterSpacing: "0.03em",
              }}
            >
              {label.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Vote meter (battle mode) ─────────────────────────────────────────────────

function VoteMeter({
  voteData,
  geoA,
  geoB,
  performerA,
  performerB,
}: {
  voteData: VoteData;
  geoA: SlotGeometry;
  geoB: SlotGeometry;
  performerA?: PerformerInfo;
  performerB?: PerformerInfo;
}) {
  const bothVisible = geoA.opacity > 0 && geoB.opacity > 0 && geoA.width !== geoB.width;
  if (!bothVisible && !(geoA.opacity > 0 && geoB.opacity > 0 && geoA.left === geoB.left)) {
    // Only show vote meter when both performers are visible (split screen or both present)
    const eitherVisible = geoA.opacity > 0.5 && geoB.opacity > 0.5;
    if (!eitherVisible) return null;
  }

  const total = (voteData.aVotes + voteData.bVotes) || 1;
  const aPct = Math.round((voteData.aVotes / total) * 100);
  const bPct = 100 - aPct;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        width: "58%",
        minWidth: 220,
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            color: performerA?.accentColor ?? "#00FFFF",
            letterSpacing: "0.1em",
            minWidth: 28,
            textAlign: "right",
          }}
        >
          {aPct}%
        </span>
        <div
          style={{
            flex: 1,
            height: 5,
            borderRadius: 3,
            background: "rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${aPct}%`,
              background: `linear-gradient(90deg, ${performerA?.accentColor ?? "#00FFFF"}, ${performerB?.accentColor ?? "#FF2DAA"})`,
              borderRadius: 3,
              transition: "width 700ms ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            color: performerB?.accentColor ?? "#FF2DAA",
            letterSpacing: "0.1em",
            minWidth: 28,
          }}
        >
          {bPct}%
        </span>
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
        }}
      >
        Live Fan Vote
      </div>
    </div>
  );
}

// ─── Heat bar ────────────────────────────────────────────────────────────────

function HeatBar({ score }: { score: number }) {
  const hot = score > 75;
  const warm = score > 40;
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 45,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: hot ? "rgba(255,100,0,0.9)" : "rgba(255,255,255,0.4)",
        }}
      >
        Heat
      </div>
      <div
        style={{
          width: 4,
          height: 72,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <div
          style={{
            width: "100%",
            height: `${score}%`,
            background: hot
              ? "linear-gradient(0deg, #FF3300, #FF9900)"
              : warm
                ? "linear-gradient(0deg, #FF7700, #FFCC00)"
                : "linear-gradient(0deg, #666, #aaa)",
            borderRadius: 2,
            transition: "height 900ms ease, background 600ms ease",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          color: hot ? "#FF7700" : "rgba(255,255,255,0.5)",
          transition: "color 600ms ease",
        }}
      >
        {score}
      </div>
    </div>
  );
}

// ─── Active performer rim glow ────────────────────────────────────────────────

function TurnRimGlow({ layout }: { layout: CameraLayout }) {
  if (layout !== "TURN_A_FULL" && layout !== "TURN_B_FULL") return null;
  const color =
    layout === "TURN_A_FULL"
      ? "rgba(0,255,255,0.12)"
      : "rgba(255,45,170,0.12)";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 35,
        pointerEvents: "none",
        boxShadow: `inset 0 0 80px ${color}`,
        transition: "box-shadow 500ms ease",
      }}
    />
  );
}

// ─── Split screen divider ─────────────────────────────────────────────────────

function SplitDivider({ layout }: { layout: CameraLayout }) {
  if (layout !== "SPLIT_SCREEN") return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "50%",
        width: 2,
        transform: "translateX(-50%)",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.35) 20%, rgba(255,255,255,0.35) 80%, transparent 100%)",
        zIndex: 30,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Mode/layout badge ────────────────────────────────────────────────────────

function ModeBadge({ mode, layout }: { mode: CameraMode; layout: CameraLayout }) {
  const modeLabel =
    mode === "WORLD_RELEASE" ? "LIVE RELEASE" :
    mode === "VERSUS_BATTLE" ? "VERSUS 2026" :
    "GUEST JAM";
  const layoutLabel = layout.replace(/_/g, " ");

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 12,
        zIndex: 45,
        display: "flex",
        alignItems: "center",
        gap: 6,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "#FF2020",
          boxShadow: "0 0 8px rgba(255,32,32,0.9)",
        }}
      />
      <span
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.65)",
          textShadow: "0 0 12px rgba(0,0,0,1)",
        }}
      >
        {modeLabel} · {layoutLabel}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SmartCameraDirector({
  mode,
  layout,
  videoSlot,
  artistSlot,
  opponentSlot,
  guestSlot,
  performerA,
  performerB,
  heatScore,
  voteData,
  sponsorHalo,
  fanReactions,
  replayControls,
}: SmartCameraDirectorProps) {
  const geo = LAYOUT_MAP[layout];

  // Determine which slots are currently PiP (small, framed secondary cameras)
  const artistIsPip =
    layout === "ARTIST_PIP" ||
    layout === "TURN_B_FULL" ||
    (layout === "OPPONENT_PIP" && false); // artist is full in OPPONENT_PIP
  const opponentIsPip =
    layout === "OPPONENT_PIP" ||
    layout === "TURN_A_FULL";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#050508",
      }}
    >
      {/* ── Slots (always in DOM, never remounted) ── */}

      <SlotWrapper geo={geo.video}>
        {videoSlot}
      </SlotWrapper>

      <SlotWrapper geo={geo.artist} label={performerA} isPip={artistIsPip}>
        {artistSlot}
      </SlotWrapper>

      <SlotWrapper geo={geo.opponent} label={performerB} isPip={opponentIsPip}>
        {opponentSlot}
      </SlotWrapper>

      <SlotWrapper geo={geo.guest}>
        {guestSlot}
      </SlotWrapper>

      {/* ── Layout chrome ── */}

      <TurnRimGlow layout={layout} />
      <SplitDivider layout={layout} />
      <ModeBadge mode={mode} layout={layout} />

      {/* ── Data overlays (never block slots) ── */}

      {voteData && (
        <VoteMeter
          voteData={voteData}
          geoA={geo.artist}
          geoB={geo.opponent}
          performerA={performerA}
          performerB={performerB}
        />
      )}

      {heatScore !== undefined && <HeatBar score={heatScore} />}

      {sponsorHalo && (
        <div style={{ position: "absolute", inset: 0, zIndex: 36, pointerEvents: "none" }}>
          {sponsorHalo}
        </div>
      )}

      {fanReactions && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "16%",
            zIndex: 38,
            pointerEvents: "none",
          }}
        >
          {fanReactions}
        </div>
      )}

      {layout === "REPLAY_VIEW" && replayControls && (
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 42,
          }}
        >
          {replayControls}
        </div>
      )}
    </div>
  );
}
