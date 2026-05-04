"use client";

import { useEffect, useState } from "react";
import type { LobbyRuntimeState } from "@/lib/lobby/LobbyStateEngine";
import { computeBillboardRuntime, getNextRotationMs } from "@/lib/billboards/VenueBillboardRuntime";
import { getChannelLabel, type BillboardChannelId } from "@/lib/billboards/VenueBillboardStateSelector";
import TmiLiveFeedBoard from "@/components/billboards/TmiLiveFeedBoard";
import TmiRankingBoard from "@/components/billboards/TmiRankingBoard";
import TmiSponsorWall from "@/components/billboards/TmiSponsorWall";
import TmiVenueBoard from "@/components/billboards/TmiVenueBoard";
import TmiContestWinnerBoard from "@/components/billboards/TmiContestWinnerBoard";
import TmiParticipationBoard from "@/components/billboards/TmiParticipationBoard";
import {
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  type LobbyFeedState,
} from "@/lib/lobby/LobbyFeedBus";

const CHANNEL_ACCENT: Record<BillboardChannelId, string> = {
  live: "#f87171",
  ranking: "#f0abfc",
  sponsor: "#86efac",
  advertiser: "#fcd34d",
  venue: "#c4b5fd",
  battle: "#fb923c",
  winner: "#FFD700",
};

// B2: Venue live mirror — shows lobby feed state for the "live" channel.
// Current performer, next performer, sponsor takeover — all from LobbyFeedBus.
function VenueLiveMirrorPanel({ feed, accent }: { feed: LobbyFeedState; accent: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Current performer */}
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${accent}33`,
          background: `${accent}08`,
        }}
      >
        <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.22em", color: accent, textTransform: "uppercase", marginBottom: 4 }}>
          Now Performing
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#f3e9ff", letterSpacing: "0.02em" }}>
          {feed.performer !== "—" ? feed.performer : "Stage Standby"}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>
          {feed.currentEvent !== "—" ? feed.currentEvent : feed.status}
        </div>
      </div>

      {/* Next performer */}
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 10,
          border: `1px solid rgba(255,255,255,0.08)`,
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 2 }}>
            Up Next
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>
            {feed.nextPerformer !== "—" ? feed.nextPerformer : "Queue open"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
            Occupancy
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: accent }}>
            {feed.occupancy} · {feed.occupancyPct}%
          </div>
        </div>
      </div>

      {/* Sponsor takeover strip */}
      <a
        href="/articles/sponsor/soundwave-audio-presents-the-beat-vault"
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: `1px solid #FFD70022`,
            background: "#FFD70008",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.22em", color: "#FFD700", textTransform: "uppercase" }}>
            Sponsor · SoundWave Audio
          </span>
          <span style={{ fontSize: 7, color: "#FFD700", fontWeight: 700 }}>View →</span>
        </div>
      </a>
    </div>
  );
}

function ChannelRenderer({ channel, lobbyFeed }: { channel: BillboardChannelId; lobbyFeed: LobbyFeedState }) {
  const accent = CHANNEL_ACCENT[channel];
  switch (channel) {
    case "live":
      return <VenueLiveMirrorPanel feed={lobbyFeed} accent={accent} />;
    case "ranking":
      return <TmiRankingBoard />;
    case "sponsor":
      return <TmiSponsorWall />;
    case "advertiser":
      return <TmiParticipationBoard />;
    case "venue":
      return <TmiVenueBoard />;
    case "battle":
      return <TmiContestWinnerBoard />;
    case "winner":
      return <TmiContestWinnerBoard />;
    default:
      return <TmiLiveFeedBoard />;
  }
}

type VenueBillboardSurfaceProps = {
  runtimeState: LobbyRuntimeState;
  compact?: boolean;
};

export default function VenueBillboardSurface({ runtimeState, compact = false }: VenueBillboardSurfaceProps) {
  const [now, setNow] = useState(() => Date.now());

  // B2: Subscribe to LobbyFeedBus — venue screens mirror lobby live state
  const [lobbyFeed, setLobbyFeed] = useState(() => getLobbyFeedSnapshot());
  useEffect(() => subscribeLobbyFeed(setLobbyFeed), []);

  const runtime = computeBillboardRuntime(runtimeState, now);
  const accent = CHANNEL_ACCENT[runtime.activeChannel];

  useEffect(() => {
    const nextMs = getNextRotationMs(runtime, now);
    const id = window.setTimeout(() => setNow(Date.now()), Math.max(500, nextMs));
    return () => window.clearTimeout(id);
  });

  return (
    <section
      style={{
        border: `1px solid ${accent}44`,
        borderRadius: compact ? 10 : 14,
        background: "rgba(3,2,11,0.95)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: compact ? "6px 10px" : "8px 14px",
          borderBottom: `1px solid ${accent}33`,
          background: `${accent}0a`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 6px ${accent}`,
            }}
          />
          <span style={{ color: accent, fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {getChannelLabel(runtime.activeChannel)}
          </span>
          <span style={{ color: "#334155", fontSize: 8 }}>· VENUE SCREEN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#334155", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {runtime.selection.label}
          </span>
          <span
            style={{
              borderRadius: 999,
              border: `1px solid ${accent}44`,
              background: `${accent}12`,
              color: accent,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 6px",
            }}
          >
            {runtimeState}
          </span>
        </div>
      </header>

      <div style={{ padding: compact ? 8 : 12 }}>
        <ChannelRenderer channel={runtime.activeChannel} lobbyFeed={lobbyFeed} />
      </div>

      {!compact && (
        <footer
          style={{
            borderTop: `1px solid ${accent}22`,
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#1e293b", fontSize: 8, letterSpacing: "0.1em" }}>
            NEXT → {getChannelLabel(runtime.nextChannel)}
          </span>
          <span style={{ color: "#1e293b", fontSize: 8 }}>
            rotating every {Math.round(runtime.rotateMs / 1000)}s
          </span>
        </footer>
      )}
    </section>
  );
}
