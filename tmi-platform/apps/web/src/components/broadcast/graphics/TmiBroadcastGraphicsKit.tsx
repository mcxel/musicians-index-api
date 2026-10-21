"use client";

/**
 * TmiBroadcastGraphicsKit — actual reusable visual renderers for the frozen
 * TMI_BROADCAST_COMPONENTS (30). REFERENCE != RUNTIME. No MP4 ingest.
 * Extends OverlayRuntime / venue presentation — NOT a second broadcast engine.
 */

import type { CSSProperties, ReactNode } from "react";
import type {
  BroadcastComponentId,
  BroadcastLayoutId,
} from "@/lib/broadcast/TmiBroadcastGraphicsRegistry";
import {
  TMI_BROADCAST_COMPONENTS,
  componentAllowedForExperience,
} from "@/lib/broadcast/TmiBroadcastGraphicsRegistry";
import type { TmiExperienceType } from "@/lib/experience/UniversalPlayableExperienceContract";

export type GraphicsLiveState =
  | "LIVE"
  | "CONNECTING"
  | "RECONNECTING"
  | "ENDED"
  | "WAITING";

export type GraphicsParticipant = {
  id: string;
  displayName?: string | null;
  imageUrl?: string | null;
  score?: number | null;
};

export type GraphicsSceneContext = {
  experience: TmiExperienceType;
  title?: string | null;
  phaseLabel?: string | null;
  liveState?: GraphicsLiveState;
  participants?: GraphicsParticipant[];
  activeParticipantId?: string | null;
  nextParticipantId?: string | null;
  timerLabel?: string | null;
  countdownSeconds?: number | null;
  scoreA?: number | null;
  scoreB?: number | null;
  winnerId?: string | null;
  voteOpen?: boolean;
  /** Real tip/reaction labels only — never invent counts. */
  reactionLabels?: string[];
  trackTitle?: string | null;
  /** Honest empty when no program media. */
  hasProgramMedia?: boolean;
  variantCompetitive?: boolean;
};

const neon: CSSProperties = {
  fontFamily: "Orbitron, Rajdhani, system-ui, sans-serif",
  letterSpacing: "0.08em",
  fontWeight: 800,
};

function shell(
  accent: string,
  extra?: CSSProperties,
): CSSProperties {
  return {
    ...neon,
    border: `1px solid ${accent}`,
    background: "rgba(5,5,16,0.82)",
    boxShadow: `0 0 18px ${accent}33`,
    borderRadius: 8,
    color: "#fff",
    ...extra,
  };
}

function Frame({
  children,
  accent = "#00FFFF",
  label,
}: {
  children?: ReactNode;
  accent?: string;
  label?: string;
}) {
  return (
    <div
      data-tmi-gfx="TmiPerformerFrame"
      style={{
        ...shell(accent, {
          position: "relative",
          overflow: "hidden",
          minHeight: 120,
          aspectRatio: "16 / 9",
        }),
      }}
    >
      {label ? (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            zIndex: 2,
            fontSize: 8,
            color: accent,
            background: "rgba(1,3,8,0.75)",
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,255,255,0.12), rgba(5,5,16,0.95) 70%)",
          fontSize: 10,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        {children ?? "PROGRAM SURFACE"}
      </div>
    </div>
  );
}

function Badge({
  state = "WAITING",
}: {
  state?: GraphicsLiveState;
}) {
  const color =
    state === "LIVE"
      ? "#FF2020"
      : state === "CONNECTING" || state === "RECONNECTING"
        ? "#FFD700"
        : "rgba(255,255,255,0.45)";
  return (
    <span
      data-tmi-gfx="TmiLiveBadge"
      style={{
        ...neon,
        fontSize: 9,
        padding: "3px 8px",
        borderRadius: 4,
        background: color,
        color: state === "LIVE" ? "#fff" : "#050510",
      }}
    >
      ● {state}
    </span>
  );
}

function Nameplate({ name }: { name?: string | null }) {
  return (
    <div
      data-tmi-gfx="TmiNameplate"
      style={{
        ...shell("#FF2DAA", { padding: "4px 10px", fontSize: 10, display: "inline-block" }),
      }}
    >
      {name?.trim() || "WAITING"}
    </div>
  );
}

export function renderBroadcastGraphic(
  componentId: BroadcastComponentId,
  ctx: GraphicsSceneContext,
): ReactNode {
  const people = ctx.participants ?? [];
  const primary =
    people.find((p) => p.id === ctx.activeParticipantId) ?? people[0] ?? null;
  const secondary =
    people.find((p) => p.id !== primary?.id) ?? people[1] ?? null;

  switch (componentId) {
    case "TmiPerformerFrame":
      return (
        <Frame
          accent="#00FFFF"
          label={primary?.displayName ?? "STAGE"}
        >
          {ctx.hasProgramMedia ? "● PROGRAM" : "WAITING FOR PROGRAM"}
        </Frame>
      );
    case "TmiParticipantFrame":
      return (
        <Frame accent="#FF2DAA" label={secondary?.displayName ?? "PARTICIPANT"}>
          {secondary ? secondary.displayName : "OPEN SLOT"}
        </Frame>
      );
    case "TmiPerformerLowerThird":
      return (
        <div
          data-tmi-gfx="TmiPerformerLowerThird"
          style={shell("#00FFFF", {
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 11,
          })}
        >
          <span>{primary?.displayName ?? "PERFORMER"}</span>
          <span style={{ color: "#FFD700" }}>
            {ctx.trackTitle?.trim() || ctx.phaseLabel || "NOW"}
          </span>
        </div>
      );
    case "TmiNameplate":
      return <Nameplate name={primary?.displayName} />;
    case "TmiLiveBadge":
      return <Badge state={ctx.liveState ?? "WAITING"} />;
    case "TmiExperienceHeader":
      return (
        <div
          data-tmi-gfx="TmiExperienceHeader"
          style={shell("#FFD700", {
            padding: "8px 14px",
            textAlign: "center",
            fontSize: 13,
            color: "#FFD700",
          })}
        >
          {(ctx.title ?? ctx.experience).toString().replace(/_/g, " ")}
        </div>
      );
    case "TmiExperiencePhaseHeader":
      return (
        <div
          data-tmi-gfx="TmiExperiencePhaseHeader"
          style={shell("#AA2DFF", {
            padding: "6px 12px",
            textAlign: "center",
            fontSize: 11,
            color: "#AA2DFF",
          })}
        >
          {ctx.phaseLabel ?? "PERFORMANCE PHASE"}
        </div>
      );
    case "TmiParticipantRail":
      return (
        <div
          data-tmi-gfx="TmiParticipantRail"
          style={shell("#00FFFF", { padding: 8, display: "flex", flexDirection: "column", gap: 6 })}
        >
          <div style={{ fontSize: 8, color: "#00FFFF" }}>PARTICIPANTS</div>
          {people.length === 0 ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>None yet</div>
          ) : (
            people.map((p) => (
              <div key={p.id} style={{ fontSize: 10 }}>
                {p.id === ctx.activeParticipantId ? "▶ " : ""}
                {p.displayName ?? p.id}
              </div>
            ))
          )}
        </div>
      );
    case "TmiAudienceCommunityWall":
      return (
        <div
          data-tmi-gfx="TmiAudienceCommunityWall"
          style={shell("#AA2DFF", {
            padding: 10,
            minHeight: 72,
            fontSize: 10,
            color: "rgba(255,255,255,0.55)",
            textAlign: "center",
          })}
        >
          AUDIENCE WALL · real presence only
        </div>
      );
    case "TmiSidecarPanel":
      return (
        <div data-tmi-gfx="TmiSidecarPanel" style={shell("#00FFFF", { padding: 8, fontSize: 10 })}>
          SIDECAR
        </div>
      );
    case "TmiAttachedLowerPanel":
      return (
        <div
          data-tmi-gfx="TmiAttachedLowerPanel"
          style={shell("#FF2DAA", { padding: 8, fontSize: 10 })}
        >
          LOWER PANEL
        </div>
      );
    case "TmiFloatingCallout":
      return (
        <div
          data-tmi-gfx="TmiFloatingCallout"
          style={shell("#FFD700", { padding: "6px 10px", fontSize: 10, display: "inline-block" })}
        >
          {ctx.phaseLabel ?? "CALLOUT"}
        </div>
      );
    case "TmiParticipantPiP":
      return (
        <div
          data-tmi-gfx="TmiParticipantPiP"
          style={shell("#FF2DAA", {
            width: 120,
            aspectRatio: "16 / 9",
            fontSize: 9,
            display: "grid",
            placeItems: "center",
          })}
        >
          PiP · {secondary?.displayName ?? "OPEN"}
        </div>
      );
    case "TmiUpNextCard": {
      const next =
        people.find((p) => p.id === ctx.nextParticipantId) ??
        people.find((p) => p.id !== ctx.activeParticipantId) ??
        null;
      return (
        <div
          data-tmi-gfx="TmiUpNextCard"
          style={shell("#FFD700", { padding: "8px 10px", fontSize: 10 })}
        >
          UP NEXT · {next?.displayName ?? "—"}
        </div>
      );
    }
    case "TmiExperienceTimer":
      return (
        <div
          data-tmi-gfx="TmiExperienceTimer"
          style={shell("#00FFFF", { padding: "6px 10px", fontSize: 12, fontVariantNumeric: "tabular-nums" })}
        >
          {ctx.timerLabel ?? "—:—"}
        </div>
      );
    case "TmiExperienceCountdown":
      return (
        <div
          data-tmi-gfx="TmiExperienceCountdown"
          style={shell("#FFD700", {
            padding: 16,
            fontSize: 28,
            textAlign: "center",
            color: "#FFD700",
          })}
        >
          {ctx.countdownSeconds ?? "…"}
        </div>
      );
    case "TmiVotePanel":
      return (
        <div
          data-tmi-gfx="TmiVotePanel"
          style={shell("#FF2DAA", { padding: 10, fontSize: 11, textAlign: "center" })}
        >
          {ctx.voteOpen ? "VOTE OPEN" : "VOTE CLOSED"}
        </div>
      );
    case "TmiSplitResultBar":
      return (
        <div
          data-tmi-gfx="TmiSplitResultBar"
          style={{
            ...shell("#FFD700", { padding: 6, display: "flex", gap: 4 }),
            height: 14,
          }}
        >
          <div
            style={{
              flex: Number.isFinite(ctx.scoreA) ? Math.max(1, ctx.scoreA ?? 1) : 1,
              background: "#00FFFF",
              borderRadius: 2,
            }}
          />
          <div
            style={{
              flex: Number.isFinite(ctx.scoreB) ? Math.max(1, ctx.scoreB ?? 1) : 1,
              background: "#FF2DAA",
              borderRadius: 2,
            }}
          />
        </div>
      );
    case "TmiScoreChip":
      return (
        <div
          data-tmi-gfx="TmiScoreChip"
          style={shell("#FFD700", { padding: "4px 8px", fontSize: 11, display: "inline-flex", gap: 8 })}
        >
          <span>{Number.isFinite(ctx.scoreA) ? ctx.scoreA : "—"}</span>
          <span style={{ opacity: 0.5 }}>:</span>
          <span>{Number.isFinite(ctx.scoreB) ? ctx.scoreB : "—"}</span>
        </div>
      );
    case "TmiReactionStack":
      return (
        <div
          data-tmi-gfx="TmiReactionStack"
          style={shell("#AA2DFF", { padding: 8, display: "flex", gap: 6, flexWrap: "wrap", fontSize: 12 })}
        >
          {(ctx.reactionLabels?.length ? ctx.reactionLabels : ["·"]).map((r, i) => (
            <span key={`${r}-${i}`}>{r}</span>
          ))}
        </div>
      );
    case "TmiWorldReactionField":
      return (
        <div
          data-tmi-gfx="TmiWorldReactionField"
          style={shell("#AA2DFF", {
            padding: 12,
            minHeight: 48,
            fontSize: 10,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
          })}
        >
          WORLD REACTIONS · real only
        </div>
      );
    case "TmiProgramWaveform":
      return (
        <div
          data-tmi-gfx="TmiProgramWaveform"
          style={shell("#00FFFF", {
            padding: "10px 12px",
            display: "flex",
            gap: 3,
            alignItems: "flex-end",
            height: 40,
          })}
        >
          {[4, 10, 7, 14, 6, 12, 8, 16, 5, 11].map((h, i) => (
            <span
              key={i}
              style={{
                width: 4,
                height: ctx.hasProgramMedia ? h : 3,
                background: ctx.hasProgramMedia ? "#00FFFF" : "rgba(255,255,255,0.2)",
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      );
    case "TmiVersusTransition":
      return (
        <div
          data-tmi-gfx="TmiVersusTransition"
          style={shell("#FFD700", {
            padding: 20,
            textAlign: "center",
            fontSize: 22,
            color: "#FFD700",
          })}
        >
          VS
        </div>
      );
    case "TmiEnergyOrbit":
      return (
        <div
          data-tmi-gfx="TmiEnergyOrbit"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "2px solid #00FFFF",
            boxShadow: "0 0 20px #00FFFF66, inset 0 0 12px #FF2DAA44",
          }}
        />
      );
    case "TmiEnergyDivider":
      return (
        <div
          data-tmi-gfx="TmiEnergyDivider"
          style={{
            width: 2,
            alignSelf: "stretch",
            minHeight: 48,
            background: "linear-gradient(180deg, #00FFFF, #FF2DAA)",
            boxShadow: "0 0 12px #FFD70088",
          }}
        />
      );
    case "TmiWinnerScene": {
      const winner =
        people.find((p) => p.id === ctx.winnerId) ??
        (ctx.winnerId ? { id: ctx.winnerId, displayName: ctx.winnerId } : null);
      return (
        <div
          data-tmi-gfx="TmiWinnerScene"
          style={shell("#FFD700", {
            padding: 18,
            textAlign: "center",
            fontSize: 16,
            color: "#FFD700",
          })}
        >
          {winner ? `WINNER · ${winner.displayName ?? winner.id}` : "RESULT PENDING"}
        </div>
      );
    }
    case "TmiResultCard":
      return (
        <div
          data-tmi-gfx="TmiResultCard"
          style={shell("#FFD700", { padding: 12, fontSize: 11 })}
        >
          RESULT · A {Number.isFinite(ctx.scoreA) ? ctx.scoreA : "—"} · B{" "}
          {Number.isFinite(ctx.scoreB) ? ctx.scoreB : "—"}
        </div>
      );
    case "TmiWorldMediaPanel":
      return (
        <div
          data-tmi-gfx="TmiWorldMediaPanel"
          style={shell("#00FFFF", {
            padding: 12,
            minHeight: 80,
            fontSize: 10,
            textAlign: "center",
            color: "rgba(255,255,255,0.55)",
          })}
        >
          WORLD MEDIA PANEL · in-world destination
        </div>
      );
    case "TmiWorldPlaylistStation":
      return (
        <div
          data-tmi-gfx="TmiWorldPlaylistStation"
          style={shell("#FF2DAA", {
            padding: 12,
            fontSize: 11,
            textAlign: "center",
          })}
        >
          PLAYLIST STATION · {ctx.trackTitle ?? "No track"}
        </div>
      );
    case "TmiJoinControlCluster":
      return (
        <div
          data-tmi-gfx="TmiJoinControlCluster"
          style={{ display: "flex", gap: 8 }}
        >
          {["JOIN", "TIP", "MERCH"].map((label) => (
            <span
              key={label}
              style={shell("#00FFFF", { padding: "6px 10px", fontSize: 9 })}
            >
              {label}
            </span>
          ))}
        </div>
      );
    case "TmiExperienceCommandStrip":
      return (
        <div
          data-tmi-gfx="TmiExperienceCommandStrip"
          style={shell("#AA2DFF", {
            padding: "6px 10px",
            display: "flex",
            gap: 10,
            fontSize: 9,
          })}
        >
          <span>REACT</span>
          <span>SHARE</span>
          <span>QUEUE</span>
        </div>
      );
    default:
      return null;
  }
}

export function layoutStyle(layout: BroadcastLayoutId): CSSProperties {
  switch (layout) {
    case "DUAL_EQUAL":
    case "DUAL_VERSUS":
      return { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, width: "100%" };
    case "PRIMARY_PLUS_PIP":
      return { display: "grid", gridTemplateColumns: "1fr 140px", gap: 8, width: "100%" };
    case "PRIMARY_PLUS_SIDE_RAIL":
    case "PRIMARY_PLUS_AUDIENCE_RAIL":
      return { display: "grid", gridTemplateColumns: "1fr 160px", gap: 8, width: "100%" };
    case "WORLD_PLUS_MEDIA_PANEL":
      return { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 8, width: "100%" };
    case "WORLD_SOCIAL_CLUSTER":
    case "WORLD_PLAYLIST_STATION":
      return { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" };
    case "QUEUE_FOCUS":
    case "RESULT_FOCUS":
    case "WINNER_FOCUS":
    case "INTRO_STAGE":
    case "OUTRO_STAGE":
    case "GAME_SHOW_HOST":
    case "CREATION_STUDIO":
    case "SINGLE_FOCUS":
    case "WORLD_WIDE":
    default:
      return { display: "flex", flexDirection: "column", gap: 8, width: "100%" };
  }
}

/** All 30 registry component ids must have a renderer. */
export function listGraphicsKitCoverage(): {
  registered: number;
  rendered: number;
  missing: BroadcastComponentId[];
} {
  const registered = TMI_BROADCAST_COMPONENTS.map((c) => c.componentId);
  const missing: BroadcastComponentId[] = [];
  for (const id of registered) {
    const node = renderBroadcastGraphic(id, {
      experience: "LIVE_SHOW",
      liveState: "WAITING",
    });
    if (node == null) missing.push(id);
  }
  return {
    registered: registered.length,
    rendered: registered.length - missing.length,
    missing,
  };
}

export function filterComponentsForExperience(
  componentIds: readonly BroadcastComponentId[],
  experience: TmiExperienceType,
  variantCompetitive = false,
): BroadcastComponentId[] {
  const byId = new Map(TMI_BROADCAST_COMPONENTS.map((c) => [c.componentId, c]));
  return componentIds.filter((id) => {
    const def = byId.get(id);
    if (!def) return false;
    return componentAllowedForExperience(def, experience, variantCompetitive);
  });
}
