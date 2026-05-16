"use client";

import type { FanHubMode } from "./FanTierSkinEngine";

const MODE_LABELS: Record<FanHubMode, { label: string; icon: string }> = {
  neutral: { label: "Neutral Hub", icon: "🏠" },
  "live-auditorium": { label: "Live Auditorium", icon: "🎭" },
  lobby: { label: "Lobby Pop-up", icon: "🚪" },
  "earn-points": { label: "Fan Points / Earn", icon: "💰" },
  shop: { label: "Shop / Cosmetics", icon: "🛍️" },
  trivia: { label: "Trivia / Voting", icon: "🎯" },
  livestream: { label: "Livestream Control", icon: "📹" },
};

type FanModeSwitcherProps = {
  mode: FanHubMode;
  onChange: (next: FanHubMode) => void;
  modeEnabled: (mode: FanHubMode) => boolean;
  accent: string;
};

export default function FanModeSwitcher({ mode, onChange, modeEnabled, accent }: FanModeSwitcherProps) {
  const modes = Object.keys(MODE_LABELS) as FanHubMode[];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {modes.map((modeKey) => {
        const enabled = modeEnabled(modeKey);
        const active = mode === modeKey;
        const { label, icon } = MODE_LABELS[modeKey];

        return (
          <button
            key={modeKey}
            type="button"
            onClick={() => enabled && onChange(modeKey)}
            disabled={!enabled}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              borderRadius: 999,
              border: `1px solid ${active ? accent : "rgba(90,215,255,0.24)"}`,
              padding: "5px 12px",
              fontSize: 11,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontWeight: 800,
              color: active ? accent : "#bde7ff",
              background: active ? `${accent}1c` : "rgba(6,16,38,0.7)",
              cursor: enabled ? "pointer" : "not-allowed",
              opacity: enabled ? 1 : 0.4,
              boxShadow: active ? `0 0 10px ${accent}44, inset 0 0 0 1px ${accent}30` : "none",
              transition: "box-shadow 140ms, background 140ms",
            }}
          >
            {/* LED dot */}
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: active ? accent : "rgba(90,215,255,0.3)",
                boxShadow: active ? `0 0 5px ${accent}` : "none",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
