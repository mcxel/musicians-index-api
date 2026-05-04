"use client";

// Lobby Billboard Surface — mirrors live LobbyFeedBus state onto lobby screens.
// Variant "entrance" = thin header bar  | "hanging" = stage-top strip
// Variant "wall"     = full side panel  | "side"    = compact side panel
// All variants read from the same LobbyFeedBus — single feed, no duplication.

import { useEffect, useRef, useState } from "react";
import {
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  type LobbyFeedState,
} from "@/lib/lobby/LobbyFeedBus";

type Variant = "entrance" | "hanging" | "wall" | "side";

interface LobbyBillboardSurfaceProps {
  variant?: Variant;
  slug?: string;
}

const STATUS_ACCENT: Record<string, string> = {
  "LIVE":        "#f87171",
  "PRE-SHOW":    "#fcd34d",
  "QUEUE OPEN":  "#86efac",
  "STANDBY":     "#c4b5fd",
};

// ── Shared: idle-pulse dot ────────────────────────────────────────────────────

function LiveDot({ color, size = 6, live }: { color: string; size?: number; live: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: live ? `0 0 ${size + 2}px ${color}` : "none",
        flexShrink: 0,
        animation: "lobbyBillboardPulse 2.4s ease-in-out infinite",
      }}
    />
  );
}

// ── Shared: occupancy bar ────────────────────────────────────────────────────

function OccupancyBar({ pct, accent }: { pct: number; accent: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: 3,
        borderRadius: 2,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, pct)}%`,
          background: accent,
          borderRadius: 2,
          transition: "width 0.9s ease",
        }}
      />
    </div>
  );
}

// ── Variant: entrance — single-line header bar ────────────────────────────────

function EntranceBillboard({ feed, accent }: { feed: LobbyFeedState; accent: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "5px 14px",
        borderRadius: 6,
        border: `1px solid ${accent}30`,
        background: `${accent}07`,
        transition: "border-color 0.3s",
        overflow: "hidden",
      }}
    >
      <LiveDot color={accent} size={6} live={feed.status === "LIVE"} />
      <span
        style={{
          fontSize: 8,
          fontWeight: 900,
          color: accent,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {feed.status}
      </span>
      <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "rgba(255,255,255,0.55)",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          letterSpacing: "0.04em",
        }}
      >
        {feed.title}
      </span>
      <span
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        {feed.performer}
      </span>
      <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.28)", flexShrink: 0 }}>
        {feed.occupancy} seated
      </span>
    </div>
  );
}

// ── Variant: hanging — horizontal strip above stage ───────────────────────────

function HangingBillboard({
  feed,
  accent,
  performerFlash,
  rankFlash,
}: {
  feed: LobbyFeedState;
  accent: string;
  performerFlash: boolean;
  rankFlash: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "7px 14px",
        borderRadius: 8,
        border: `1px solid ${accent}2a`,
        background: "rgba(3,2,11,0.88)",
        transition: "border-color 0.4s",
      }}
    >
      <LiveDot color={accent} size={5} live={feed.status === "LIVE"} />
      <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, overflow: "hidden" }}>
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.26em",
            color: accent,
            textTransform: "uppercase",
          }}
        >
          {feed.status} · {feed.roomType.toUpperCase()}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: performerFlash ? accent : "#e4e4f0",
            transition: "color 0.35s",
            letterSpacing: "0.02em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {feed.performer}
        </span>
        <span
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.06em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {feed.currentEvent}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: rankFlash ? "#FFD700" : "rgba(255,255,255,0.4)",
            transition: "color 0.4s",
            lineHeight: 1,
          }}
        >
          #{feed.ranking || "—"}
        </span>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.22)", letterSpacing: "0.1em" }}>RANK</span>
      </div>
      <OccupancyBar pct={feed.occupancyPct} accent={accent} />
    </div>
  );
}

// ── Variant: wall + side — full card ─────────────────────────────────────────

function CardBillboard({
  feed,
  accent,
  performerFlash,
  rankFlash,
  liveFlash,
  compact,
}: {
  feed: LobbyFeedState;
  accent: string;
  performerFlash: boolean;
  rankFlash: boolean;
  liveFlash: boolean;
  compact: boolean;
}) {
  const pad = compact ? "6px 10px" : "9px 14px";
  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${accent}${liveFlash ? "44" : "1e"}`,
        background: "rgba(3,2,11,0.93)",
        overflow: "hidden",
        transition: "border-color 0.22s",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: pad,
          borderBottom: `1px solid ${accent}18`,
          background: `${accent}07`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <LiveDot color={accent} size={5} live={feed.status === "LIVE"} />
          <span
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.22em",
              color: accent,
              textTransform: "uppercase",
            }}
          >
            {feed.status}
          </span>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.18)" }}>·</span>
          <span
            style={{
              fontSize: 7,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {feed.roomType}
          </span>
        </div>
        <span
          style={{
            fontSize: compact ? 11 : 13,
            fontWeight: 900,
            color: rankFlash ? "#FFD700" : "rgba(255,255,255,0.32)",
            transition: "color 0.4s",
            letterSpacing: "0.04em",
          }}
        >
          #{feed.ranking || "—"}
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          padding: compact ? "7px 10px" : "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: compact ? 5 : 7,
        }}
      >
        {/* Title */}
        <div>
          <div
            style={{
              fontSize: 7,
              color: "rgba(255,255,255,0.24)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Room
          </div>
          <div
            style={{
              fontSize: compact ? 11 : 12,
              fontWeight: 900,
              color: "#e4e4f0",
              letterSpacing: "0.02em",
              lineHeight: 1.2,
            }}
          >
            {feed.title}
          </div>
        </div>

        {/* Performer */}
        <div
          style={{
            padding: compact ? "4px 7px" : "5px 9px",
            borderRadius: 6,
            background: performerFlash ? `${accent}18` : `${accent}08`,
            border: `1px solid ${accent}${performerFlash ? "33" : "16"}`,
            transition: "background 0.35s, border-color 0.35s",
          }}
        >
          <div
            style={{
              fontSize: 7,
              color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Performer
          </div>
          <div
            style={{
              fontSize: compact ? 10 : 11,
              fontWeight: 800,
              color: performerFlash ? accent : "#e4e4f0",
              transition: "color 0.35s",
            }}
          >
            {feed.performer}
          </div>
        </div>

        {/* Occupancy */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 7,
                color: "rgba(255,255,255,0.24)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Occupancy
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {feed.occupancy}
            </span>
          </div>
          <OccupancyBar pct={feed.occupancyPct} accent={accent} />
        </div>

        {/* Event */}
        <div
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.36)",
            letterSpacing: "0.05em",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: compact ? 5 : 6,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {feed.currentEvent}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function LobbyBillboardSurface({
  variant = "wall",
  slug,
}: LobbyBillboardSurfaceProps) {
  const [feed, setFeed] = useState<LobbyFeedState>(() => getLobbyFeedSnapshot());
  const [performerFlash, setPerformerFlash] = useState(false);
  const [rankFlash, setRankFlash] = useState(false);
  const [liveFlash, setLiveFlash] = useState(false);
  const prevPerf = useRef(feed.performer);
  const prevRank = useRef(feed.ranking);

  useEffect(() => {
    return subscribeLobbyFeed((next) => {
      if (slug && next.slug && next.slug !== slug) return;

      if (next.performer !== prevPerf.current) {
        setPerformerFlash(true);
        window.setTimeout(() => setPerformerFlash(false), 800);
        prevPerf.current = next.performer;
      }
      if (next.ranking !== prevRank.current) {
        setRankFlash(true);
        window.setTimeout(() => setRankFlash(false), 700);
        prevRank.current = next.ranking;
      }
      setLiveFlash(true);
      window.setTimeout(() => setLiveFlash(false), 350);
      setFeed(next);
    });
  }, [slug]);

  const accent = STATUS_ACCENT[feed.status] ?? "#c4b5fd";
  const isLive = feed.status === "LIVE";

  return (
    <>
      <style>{`
        @keyframes lobbyBillboardPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>

      {variant === "entrance" && (
        <EntranceBillboard feed={feed} accent={accent} />
      )}
      {variant === "hanging" && (
        <HangingBillboard
          feed={feed}
          accent={accent}
          performerFlash={performerFlash}
          rankFlash={rankFlash}
        />
      )}
      {(variant === "wall" || variant === "side") && (
        <CardBillboard
          feed={feed}
          accent={accent}
          performerFlash={performerFlash}
          rankFlash={rankFlash}
          liveFlash={liveFlash}
          compact={variant === "side"}
        />
      )}

      {/* Suppress unused-var lint for isLive used in LiveDot */}
      {isLive && null}
    </>
  );
}
