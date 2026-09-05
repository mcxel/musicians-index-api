"use client";

import type { MobileControlMode } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import VenueControlPanel from "@/components/hud/panels/VenueControlPanel";

const MODE_LABELS: Record<Exclude<MobileControlMode, null>, string> = {
  AVATAR_NAVIGATION: "Avatar Navigation Controller",
  SPATIAL_VIDEO: "Spatial Video Controller",
  VIDEO_SHUFFLE: "Video Shuffle Controller",
  WEB_RADIO: "Web Radio Controller",
  BATTLE_ACTION: "Battle Action Controller",
  CYPHER_CONTROL: "Cypher Controller",
  GAME_ACTION: "Game Controller",
  VENUE_PRODUCTION: "Venue Production Controller",
  SPECTATOR: "Spectator Controller",
};

const MODE_HINTS: Partial<Record<Exclude<MobileControlMode, null>, string[]>> = {
  AVATAR_NAVIGATION: ["Move", "Rotate", "Walk / Run", "Sit / Stand", "Interact", "Emote"],
  SPATIAL_VIDEO: ["Move Panel", "Near / Far", "Scale", "Anchor", "Follow", "Lock"],
  VIDEO_SHUFFLE: ["Broadcast", "Prev", "Play / Pause", "Next", "Queue", "Source Bank"],
  WEB_RADIO: ["On Air", "Mic", "Queue", "Guests", "Requests", "Cast A / B"],
};

function controlButton(label: string) {
  return (
    <button
      type="button"
      style={{
        minHeight: 40,
        borderRadius: 12,
        border: "1px solid rgba(0,229,255,0.28)",
        background: "linear-gradient(180deg, rgba(14,24,48,0.96), rgba(6,10,22,0.96))",
        color: "#F7FBFF",
        fontWeight: 800,
        letterSpacing: "0.04em",
        fontSize: 11,
        padding: "10px 12px",
        cursor: "pointer",
        boxShadow: "0 10px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {label}
    </button>
  );
}

export default function ExperienceControlDeck({
  mode,
  userId = "session",
  role = "fan",
}: {
  mode: MobileControlMode | null;
  userId?: string;
  role?: "fan" | "performer";
}) {
  const resolvedMode = mode ?? "SPECTATOR";

  if (resolvedMode === "VENUE_PRODUCTION") {
    return (
      <section
        data-experience-control-deck
        data-control-mode={resolvedMode}
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "min(58vh, 640px)",
          borderRadius: 14,
          border: "1px solid rgba(0,255,255,0.22)",
          background: "linear-gradient(180deg, rgba(6,10,22,0.98), rgba(9,14,30,0.98))",
          overflow: "hidden",
        }}
      >
        <VenueControlPanel role={role} userId={userId} accentColor="#00FF88" />
      </section>
    );
  }

  const labels = MODE_LABELS[resolvedMode];
  const hints = MODE_HINTS[resolvedMode] ?? ["Control", "Adjust", "Broadcast", "Focus", "Sync", "Return"];

  return (
    <section
      data-experience-control-deck
      data-control-mode={resolvedMode}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: "min(58vh, 640px)",
        padding: 16,
        borderRadius: 14,
        border: "1px solid rgba(0,229,255,0.22)",
        background: "linear-gradient(180deg, rgba(6,10,22,0.98), rgba(9,14,30,0.98))",
        boxShadow: "0 16px 42px rgba(0,0,0,0.42), inset 0 1px 0 rgba(0,229,255,0.12)",
        animation: "tmiControlDeckEnter 220ms cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ color: "#00FFFF", fontSize: 11, fontWeight: 900, letterSpacing: "0.16em" }}>CONTROL MODE</div>
        <div style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{labels}</div>
        <div style={{ color: "rgba(255,255,255,0.68)", fontSize: 12 }}>
          The active media/world viewport remains visible while this contextual controller owns the reclaimed area.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 10,
        }}
      >
        {hints.map((hint) => controlButton(hint))}
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          paddingTop: 6,
          color: "rgba(255,255,255,0.58)",
          fontSize: 11,
        }}
      >
        <span>Shared controller deck</span>
        <span>Mode: {resolvedMode.replace(/_/g, " ")}</span>
      </div>
    </section>
  );
}