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

import AudienceScene, { type VenueIndex } from "@/components/live/AudienceScene";
import ArenaImmersivePanel from "@/components/live/ArenaImmersivePanel";
import AvatarVenueAnchor from "@/components/avatar/AvatarVenueAnchor";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ── Arena header badge ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
        background: "rgba(5,5,16,0.9)", borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: "#FF2020", flexShrink: 0,
          animation: "tmiArenaBlink 1s step-end infinite",
          boxShadow: "0 0 6px #FF2020",
        }} />
        <style>{`@keyframes tmiArenaBlink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        <span style={{
          fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FF2020",
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
          <span style={{ marginLeft: "auto", fontSize: 9, color: "#00FFFF", fontWeight: 700 }}>
            {watcherCount.toLocaleString()} watching
          </span>
        )}
      </div>

      {/* ── 3D canvas + hero overlay ── */}
      <div style={{ position: "relative" }}>
        <AudienceScene
          view={mode === "performer" ? "performer" : "fan"}
          venue={venueIndex}
          watcherCount={watcherCount}
          hideControls={mode === "performer"}
        />
        {showHeroes && (
          <AvatarVenueAnchor
            venueSlug={venueSlug}
            venueIndex={venueIndex}
          />
        )}
      </div>

      {/* ── Full arena panel: seats, chat, moderation, performer controls ── */}
      <ArenaImmersivePanel roomId={roomId} mode={mode} />
    </div>
  );
}
