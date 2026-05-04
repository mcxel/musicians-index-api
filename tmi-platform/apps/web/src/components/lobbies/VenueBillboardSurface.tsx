"use client";

import { useEffect, useState } from "react";
import type { LobbyRuntimeState } from "@/lib/lobby/LobbyStateEngine";
import { computeBillboardRuntime, getNextRotationMs } from "@/lib/billboards/VenueBillboardRuntime";
import { getChannelLabel, type BillboardChannelId } from "@/lib/billboards/VenueBillboardStateSelector";
import TmiLiveFeedBoard from "@/components/billboards/TmiLiveFeedBoard";
import TmiContestWinnerBoard from "@/components/billboards/TmiContestWinnerBoard";
import TmiParticipationBoard from "@/components/billboards/TmiParticipationBoard";
import {
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  deriveVenueAdSlots,
  deriveVenueRankings,
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

  // B3: Derive venue-specific data for wired channels
  const adSlots = deriveVenueAdSlots(lobbyFeed);
  const rankings = deriveVenueRankings(lobbyFeed);
  const sponsorSlot = adSlots.find((s) => s.type === "sponsor");
  const eventSlot = adSlots.find((s) => s.type === "event");

  switch (channel) {
    case "live":
      return <VenueLiveMirrorPanel feed={lobbyFeed} accent={accent} />;

    case "ranking":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { label: "Room Rank", value: rankings.room, a: "#00FFFF" },
            { label: "Performer", value: rankings.performer, a: "#00CC44" },
            { label: "Venue", value: rankings.venue, a: "#c4b5fd" },
            { label: "Contest", value: rankings.contest, a: "#f87171" },
          ].map(({ label, value, a }) => (
            <div
              key={label}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "7px 10px", borderRadius: 8,
                border: `1px solid ${a}22`, background: `${a}08`,
              }}
            >
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.14em", color: a, textTransform: "uppercase" }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#f3e9ff" }}>#{value > 0 ? value : "—"}</span>
            </div>
          ))}
        </div>
      );

    case "sponsor":
      return sponsorSlot ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${sponsorSlot.accent}33`, background: `${sponsorSlot.accent}08` }}>
            <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.22em", color: sponsorSlot.accent, textTransform: "uppercase", marginBottom: 4 }}>
              Active Sponsor
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#f3e9ff" }}>{sponsorSlot.title}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{sponsorSlot.subtitle}</div>
          </div>
          <a href={sponsorSlot.ctaRoute} style={{ textDecoration: "none" }}>
            <div style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${sponsorSlot.accent}44`, background: `${sponsorSlot.accent}12`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.18em", color: sponsorSlot.accent, textTransform: "uppercase" }}>{sponsorSlot.ctaLabel}</span>
              <span style={{ fontSize: 7, color: sponsorSlot.accent, fontWeight: 700 }}>View →</span>
            </div>
          </a>
        </div>
      ) : null;

    case "venue":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${accent}33`, background: `${accent}08` }}>
            <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.22em", color: accent, textTransform: "uppercase", marginBottom: 4 }}>Venue Promo</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#f3e9ff" }}>
              {lobbyFeed.venuePromo.title !== "—" ? lobbyFeed.venuePromo.title : lobbyFeed.title}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>
              {lobbyFeed.occupancy} attending · {lobbyFeed.occupancyPct}%
            </div>
          </div>
          <a href={lobbyFeed.venuePromo.ctaRoute} style={{ textDecoration: "none" }}>
            <div style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${accent}44`, background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.18em", color: accent, textTransform: "uppercase" }}>Enter Venue</span>
              <span style={{ fontSize: 7, color: accent, fontWeight: 700 }}>View →</span>
            </div>
          </a>
        </div>
      );

    case "battle":
      return eventSlot ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${eventSlot.accent}33`, background: `${eventSlot.accent}08` }}>
            <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.22em", color: eventSlot.accent, textTransform: "uppercase", marginBottom: 4 }}>Upcoming Event</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#f3e9ff" }}>{eventSlot.title}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{eventSlot.subtitle}</div>
            {lobbyFeed.upcomingEvent.countdownSeconds > 0 && (
              <div style={{ fontSize: 9, color: eventSlot.accent, marginTop: 4, fontWeight: 700 }}>
                {Math.floor(lobbyFeed.upcomingEvent.countdownSeconds / 60)}m {lobbyFeed.upcomingEvent.countdownSeconds % 60}s
              </div>
            )}
          </div>
          <a href={eventSlot.ctaRoute} style={{ textDecoration: "none" }}>
            <div style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${eventSlot.accent}44`, background: `${eventSlot.accent}12`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.18em", color: eventSlot.accent, textTransform: "uppercase" }}>{eventSlot.ctaLabel}</span>
              <span style={{ fontSize: 7, color: eventSlot.accent, fontWeight: 700 }}>View →</span>
            </div>
          </a>
        </div>
      ) : <TmiContestWinnerBoard />;

    case "winner":
      return <TmiContestWinnerBoard />;
    case "advertiser":
      return <TmiParticipationBoard />;
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
  const [adIdx, setAdIdx] = useState(0);

  // B2: Subscribe to LobbyFeedBus — venue screens mirror lobby live state
  const [lobbyFeed, setLobbyFeed] = useState(() => getLobbyFeedSnapshot());
  useEffect(() => subscribeLobbyFeed(setLobbyFeed), []);

  // B3: 4-type ad rotation strip — cycles every 8s
  const adSlots = deriveVenueAdSlots(lobbyFeed);
  const activeAd = adSlots[adIdx % Math.max(1, adSlots.length)];

  useEffect(() => {
    const id = window.setInterval(() => setAdIdx((i) => (i + 1) % Math.max(1, adSlots.length)), 8000);
    return () => window.clearInterval(id);
  }, [adSlots.length]);

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

      {activeAd && (
        <a
          href={activeAd.ctaRoute}
          style={{ textDecoration: "none", display: "block", padding: compact ? "0 8px 6px" : "0 14px 8px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px 10px",
              borderRadius: 7,
              border: `1px solid ${activeAd.accent}22`,
              background: `${activeAd.accent}08`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, overflow: "hidden" }}>
              <span
                style={{
                  fontSize: 6,
                  fontWeight: 900,
                  letterSpacing: "0.2em",
                  color: activeAd.accent,
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                {activeAd.type.toUpperCase()}
              </span>
              <div style={{ width: 1, height: 8, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#d4e0ff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {activeAd.title}
              </span>
            </div>
            <span style={{ fontSize: 7, color: activeAd.accent, fontWeight: 800, flexShrink: 0, marginLeft: 8 }}>
              {activeAd.ctaLabel} →
            </span>
          </div>
        </a>
      )}

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
