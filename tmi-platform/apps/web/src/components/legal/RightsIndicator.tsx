"use client";

/**
 * Compact RIGHTS indicator for live / battle / recording surfaces.
 * 🟢 RECORDING SAFE · 🟡 TMI PLAYBACK ONLY / Creator Safe Mode · 🔴 restricted
 * Never shows "No Copyright Intended".
 */

import { useEffect, useState } from "react";

type IndicatorState = {
  light: "GREEN" | "YELLOW" | "RED";
  label: string;
  creatorSafeModeActive: boolean;
  recordingMixAction: string;
  experienceMixAction: string;
  attributionLine: string | null;
  reasons: string[];
};

export default function RightsIndicator({
  assetId = "beat-001",
  userRecordingOrBroadcasting = true,
  freestyleActive = false,
  surface = "BATTLE",
  compact = true,
}: {
  assetId?: string | null;
  userRecordingOrBroadcasting?: boolean;
  freestyleActive?: boolean;
  surface?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<IndicatorState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams({
      assetId: assetId ?? "",
      recording: userRecordingOrBroadcasting ? "1" : "0",
      freestyle: freestyleActive ? "1" : "0",
      surface,
    });
    fetch(`/api/legal/rights/indicator?${q.toString()}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
        setState(data.indicator as IndicatorState);
        setError(null);
      })
      .catch((e: Error) => {
        setError(e.message);
        setState(null);
      });
  }, [assetId, userRecordingOrBroadcasting, freestyleActive, surface]);

  const accent =
    state?.light === "GREEN" ? "#00FF88" : state?.light === "RED" ? "#FF4444" : "#FFD700";

  return (
    <div
      data-testid="rights-indicator"
      title={state?.reasons?.join(" · ") ?? "Rights state"}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 4,
        border: `1px solid ${accent}55`,
        borderRadius: 8,
        padding: compact ? "6px 10px" : "10px 12px",
        background: `${accent}12`,
        maxWidth: compact ? 320 : 420,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: accent,
          textTransform: "uppercase",
        }}
      >
        Rights
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
        {error ? "Unable to load rights state" : state?.label ?? "Loading rights…"}
      </div>
      {!compact && state ? (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
          Experience mix: {state.experienceMixAction} · Recording mix: {state.recordingMixAction}
          {state.creatorSafeModeActive ? " · Creator Safe Mode" : ""}
          {state.attributionLine ? ` · ${state.attributionLine}` : ""}
        </div>
      ) : null}
    </div>
  );
}
