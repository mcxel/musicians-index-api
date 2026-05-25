"use client";

import { useState } from "react";

export type HubMode = "interactive" | "observer";

interface Props {
  initialMode?: HubMode;
  role: string;
  onModeChange?: (mode: HubMode) => void;
}

const ROLE_INTERACTIVE_LABEL: Record<string, string> = {
  advertiser: "Campaign Manager",
  sponsor: "Brand Activations",
  venue: "Stage Director",
  promoter: "Event Control",
  performer: "Performer Mode",
  artist: "Creator Studio",
  fan: "Fan Interactive",
  default: "Interactive",
};

const ROLE_OBSERVER_LABEL: Record<string, string> = {
  advertiser: "Analytics View",
  sponsor: "Sponsor Deck",
  venue: "Venue Monitor",
  promoter: "Promoter Overview",
  performer: "Audience View",
  artist: "Viewer Mode",
  fan: "Watch Mode",
  default: "Observer",
};

export default function HubRoleMode({ initialMode = "interactive", role, onModeChange }: Props) {
  const [mode, setMode] = useState<HubMode>(initialMode);

  function toggle(m: HubMode) {
    setMode(m);
    onModeChange?.(m);
  }

  const interactiveLabel = ROLE_INTERACTIVE_LABEL[role] ?? ROLE_INTERACTIVE_LABEL.default;
  const observerLabel    = ROLE_OBSERVER_LABEL[role]    ?? ROLE_OBSERVER_LABEL.default;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
      <button
        onClick={() => toggle("interactive")}
        style={{
          padding: "8px 16px",
          background: mode === "interactive" ? "rgba(0,200,255,0.15)" : "transparent",
          border: "none",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          color: mode === "interactive" ? "#00FFFF" : "rgba(255,255,255,0.35)",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.12em",
          cursor: "pointer",
          transition: "all 0.18s",
        }}
      >
        ⚡ {interactiveLabel.toUpperCase()}
      </button>
      <button
        onClick={() => toggle("observer")}
        style={{
          padding: "8px 16px",
          background: mode === "observer" ? "rgba(170,45,255,0.12)" : "transparent",
          border: "none",
          color: mode === "observer" ? "#AA2DFF" : "rgba(255,255,255,0.35)",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.12em",
          cursor: "pointer",
          transition: "all 0.18s",
        }}
      >
        👁 {observerLabel.toUpperCase()}
      </button>
    </div>
  );
}
