"use client";

import { useEffect, useState } from "react";
import PresentationStateMachine, {
  type PresentationState,
} from "@/lib/presentation/PresentationStateMachine";
import PresentationDirector from "@/lib/presentation/PresentationDirector";
import PresentationTimelineEngine, {
  type ActiveTimelinePlayback,
} from "@/lib/presentation/PresentationTimelineEngine";
import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "@/lib/presentation/ShowPackageDirector";

interface PresentationTelemetryPanelProps {
  accentColor?: string;
}

export function PresentationTelemetryPanel({
  accentColor = "#00FFFF",
}: PresentationTelemetryPanelProps) {
  const [state, setState] = useState<PresentationState>(PresentationStateMachine.getState());
  const [playback, setPlayback] = useState<ActiveTimelinePlayback | null>(
    PresentationTimelineEngine.getPlaybackState()
  );
  const [showPack, setShowPack] = useState<ActiveShowPackageSnapshot>(
    ShowPackageDirector.getSnapshot()
  );

  useEffect(() => {
    const unsubState = PresentationStateMachine.subscribe((s) => setState(s));
    const unsubPack = ShowPackageDirector.subscribe(setShowPack);
    const interval = window.setInterval(() => {
      setPlayback(PresentationTimelineEngine.getPlaybackState());
    }, 200);

    return () => {
      unsubState();
      unsubPack();
      window.clearInterval(interval);
    };
  }, []);

  const cameraState = PresentationDirector.getCameraState();
  const overlays = PresentationDirector.getActiveOverlays();

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.4)",
        border: `1px solid ${accentColor}33`,
        borderRadius: 12,
        padding: "14px 18px",
        color: "#fff",
        fontFamily: "monospace",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.25em", color: accentColor, fontWeight: 900 }}>
          LIVE PRESENTATION TELEMETRY
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: state === "LIVE" ? "#00FF88" : state === "WINNER_REVEAL" ? "#FFD700" : accentColor,
            background: "rgba(255,255,255,0.05)",
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          STATE: {state}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 11 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 800 }}>
            CURRENT PLAYBACK
          </div>
          <div>Package: <strong style={{ color: accentColor }}>{playback?.packageId ?? "NONE (IDLE)"}</strong></div>
          <div>Status: <strong>{playback?.status ?? "IDLE"}</strong></div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 800 }}>
            CAMERA & OVERLAYS
          </div>
          <div>Camera Mode: <strong>{cameraState.mode}</strong></div>
          <div>Target Anchor: <strong style={{ color: "#00FF88" }}>{cameraState.targetAnchorId}</strong></div>
          <div>Active Overlays: <strong>{overlays.length}</strong></div>
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
            background: "rgba(255,255,255,0.03)",
            padding: 10,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 800 }}>
            SHOW PACKAGE DIRECTOR
          </div>
          <div>
            Pack: <strong style={{ color: accentColor }}>{showPack.packId}</strong> · Mode:{" "}
            <strong>{showPack.mode}</strong>
          </div>
          <div>
            Phase: <strong>{showPack.phaseLabel ?? "NONE"}</strong> · Event:{" "}
            <strong>{showPack.triggerEvent ?? "—"}</strong>
          </div>
          <div>
            Camera cue: <strong style={{ color: "#00FF88" }}>{showPack.cameraCaption ?? "—"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PresentationTelemetryPanel;
