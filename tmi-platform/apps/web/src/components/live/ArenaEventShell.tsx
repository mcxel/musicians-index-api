"use client";

/**
 * ArenaEventShell — universal arena host for all TMI event types.
 *
 * All live events (concerts, battles, cyphers, challenges, live shows,
 * performances) are hosted inside this arena shell.
 *
 * World Dance Party is the ONLY exception and is handled by DanceArena3D
 * (no chairs — standing/dance-floor only).
 *
 * Venue mapping (matches VENUE_SYSTEM_README.md):
 *   concert    → Arena  (1)  — 18,500 cap, stadium wrap
 *   battle     → Arena  (1)  — ring-side + stadium
 *   cypher     → Theater(0)  — 2,730 cap, intimate circle
 *   challenge  → Outdoor(3)  — 8,200 cap, festival stage
 *   live-show  → Theater(0)  — general go-live performance
 *   monday-stage → Theater(0)— weekly flagship
 */

import dynamic from "next/dynamic";
import type { VenueIndex } from "@/components/live/AudienceScene";
import { useActiveCompetitionTheme, type CompetitionFormat } from "@/lib/competition/ThemeRegistry";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false }
);

const AvatarVenueAnchor = dynamic(
  () => import("@/components/avatar/AvatarVenueAnchor"),
  { ssr: false }
);

// NOTE (2026-07-23): components/competition/CompetitionAudienceViewport is
// NOT wired in here. It's a real, polished shell but every performer/chat/
// viewer-count value inside it is still hardcoded mock data (no props flow
// from real WebRTC participants, no live chat backend) - mounting it here
// would replace the real Daily.co video + real audience for every battle/
// cypher/challenge room with a fake-data screen. Do not re-wire it as a
// default render path until it consumes real production data; see Phase 3
// of the Competition Runtime plan for the harvest-presentation-pieces
// approach instead of a wholesale swap.

export type ArenaEventType =
  | "concert"
  | "battle"
  | "cypher"
  | "challenge"
  | "live-show"
  | "monday-stage";

export type ArenaLiveState = "soon" | "live" | "ended";

const VENUE_MAP: Record<ArenaEventType, VenueIndex> = {
  "concert":      1,
  "battle":       1,
  "cypher":       0,
  "challenge":    3,
  "live-show":    0,
  "monday-stage": 0,
};

const EVENT_LABELS: Record<ArenaEventType, string> = {
  "concert":      "CONCERT ARENA",
  "battle":       "BATTLE ARENA",
  "cypher":       "CYPHER CIRCLE",
  "challenge":    "CHALLENGE STAGE",
  "live-show":    "LIVE STAGE",
  "monday-stage": "MONDAY NIGHT STAGE",
};

// Maps ArenaEventType → venueSlug used by HeroPresenceRegistry
const VENUE_SLUG_MAP: Record<ArenaEventType, string> = {
  "concert":      "world-concert",
  "battle":       "battle-arena",
  "cypher":       "cypher",
  "challenge":    "challenge-arena",
  "live-show":    "world-concert",
  "monday-stage": "monday-stage",
};

// Only battle/cypher/challenge are competition formats with a themeable
// identity (Rule 21: same one Venue Runtime, theming is presentation-only).
const COMPETITION_FORMAT_MAP: Partial<Record<ArenaEventType, CompetitionFormat>> = {
  battle: "BATTLE",
  cypher: "CYPHER",
  challenge: "CHALLENGE",
};

interface ArenaEventShellProps {
  roomId: string;
  eventType?: ArenaEventType;
  mode?: "audience" | "performer";
  watcherCount?: number;
  liveState?: ArenaLiveState;
}

export default function ArenaEventShell({
  roomId,
  eventType = "live-show",
  mode = "audience",
  watcherCount,
  liveState = "live",
}: ArenaEventShellProps) {
  const venueIndex = VENUE_MAP[eventType] ?? 0;
  const label = EVENT_LABELS[eventType] ?? "TMI ARENA";
  const venueSlug = VENUE_SLUG_MAP[eventType];
  const showHeroes = liveState === "live";

  // Hooks must run unconditionally - default to BATTLE's theme set when this
  // isn't a competition format, but its colors only get used below when
  // competitionFormat is non-null (concert/live-show/monday-stage keep the
  // original red/cyan styling untouched).
  const competitionFormat = COMPETITION_FORMAT_MAP[eventType] ?? null;
  const theme = useActiveCompetitionTheme(competitionFormat ?? "BATTLE");
  const liveColor = competitionFormat ? theme.colors.alert : "#FF2020";
  const watchingColor = competitionFormat ? theme.colors.leftFrame : "#00FFFF";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ── Arena header badge ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
        background: "rgba(5,5,16,0.9)", borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: liveColor, flexShrink: 0,
          animation: "tmiArenaBlink 1s step-end infinite",
          boxShadow: `0 0 6px ${liveColor}`,
        }} />
        <style>{`@keyframes tmiArenaBlink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        <span style={{
          fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: liveColor,
        }}>
          {liveState === "soon" ? "SOON" : liveState === "ended" ? "ENDED" : "LIVE"}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.55)", marginLeft: 4,
        }}>
          {label}
        </span>
        {watcherCount !== undefined && (
          <span style={{ marginLeft: "auto", fontSize: 9, color: watchingColor, fontWeight: 700 }}>
            {watcherCount.toLocaleString()} watching
          </span>
        )}
      </div>

      {/* ── Hero overlay sits above the renderer's own AudienceScene ── */}
      {showHeroes && (
        <div style={{ position: "relative" }}>
          <AvatarVenueAnchor venueSlug={venueSlug} venueIndex={venueIndex} />
        </div>
      )}

      {/* ── Universal Venue Renderer: AudienceScene + seats + chat + moderation +
           performer controls, all in one (Phase 3B convergence, 2026-06-20) ── */}
      <UniversalVenueRenderer roomId={roomId} mode={mode} venueIndex={venueIndex} />
    </div>
  );
}
