"use client";

/**
 * Battle Presentation Pack v1 — honest preview surface.
 * Plays the real package grammar timeline (phases, surfaces, camera cues).
 * Does NOT fabricate battle scores or live audience counts (Rule 20).
 */

import { useCallback, useEffect, useState } from "react";
import {
  BATTLE_PRESENTATION_PACK_V1,
  getBattlePackPreviewTimeline,
} from "@/lib/presentation/packs/BattlePresentationPackV1";
import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "@/lib/presentation/ShowPackageDirector";
import {
  MONITOR_ANCHOR_ZONES,
  monitorAnchorZoneToCss,
} from "@/lib/presentation/MonitorAnchorZones";
import { getLayerZIndex } from "@/lib/presentation/LayerStack";
import LayerStackHost, { LayerSlot } from "./LayerStackHost";
import PresentationEventBridge from "@/lib/presentation/PresentationEventBridge";

const PHASE_COLORS: Record<string, string> = {
  INTRO: "#00FFFF",
  VS: "#FF2DAA",
  PERFORMANCE: "#AA2DFF",
  VOTING: "#FFD700",
  WINNER: "#00FF88",
};

export default function BattlePresentationPreview() {
  const [snap, setSnap] = useState<ActiveShowPackageSnapshot>(
    ShowPackageDirector.getSnapshot()
  );
  const [playing, setPlaying] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    PresentationEventBridge.initialize();
    return ShowPackageDirector.subscribe(setSnap);
  }, []);

  const pushLog = useCallback((line: string) => {
    setLog((prev) => [`${new Date().toLocaleTimeString()} · ${line}`, ...prev].slice(0, 8));
  }, []);

  const playPreview = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    pushLog("Preview package start — Battle Presentation Pack v1");
    try {
      await ShowPackageDirector.playPreviewTimeline((s) => {
        setSnap(s);
        pushLog(`Phase ${s.phaseId ?? "—"} · ${s.cameraCaption ?? "no camera cue"}`);
      });
      pushLog("Preview complete (no scores fabricated)");
    } finally {
      setPlaying(false);
    }
  }, [playing, pushLog]);

  const activePhase = snap.phaseId
    ? BATTLE_PRESENTATION_PACK_V1.phases[snap.phaseId]
    : null;
  const accent = snap.phaseId ? PHASE_COLORS[snap.phaseId] ?? "#00FFFF" : "#00FFFF";

  return (
    <div
      style={{
        height: "100%",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(0,255,255,0.28)",
        background: "linear-gradient(160deg, rgba(10,8,20,0.96), rgba(5,5,16,0.98))",
        color: "#fff",
        fontFamily: "monospace",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: accent, fontWeight: 900 }}>
            PRESENTATION FRAMEWORK · PREVIEW PACKAGE
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
            {BATTLE_PRESENTATION_PACK_V1.name} — grammar only, no fake scores
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            disabled={playing}
            onClick={() => void playPreview()}
            style={{
              borderRadius: 6,
              border: `1px solid ${accent}`,
              background: playing ? "rgba(255,255,255,0.06)" : "rgba(0,255,255,0.12)",
              color: accent,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              padding: "6px 10px",
              cursor: playing ? "wait" : "pointer",
            }}
          >
            {playing ? "PLAYING…" : "PLAY TIMELINE"}
          </button>
          <button
            type="button"
            onClick={() => {
              ShowPackageDirector.reset();
              pushLog("Reset → IDLE");
            }}
            style={{
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.75)",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            RESET
          </button>
        </div>
      </div>

      {/* 16:9 preview monitor */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: 8,
          border: `2px solid ${accent}55`,
          background: "radial-gradient(ellipse at center, #1a1030 0%, #050510 70%)",
          overflow: "hidden",
        }}
      >
        <LayerStackHost>
          <LayerSlot layer="BACKGROUND">
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)",
              }}
            />
          </LayerSlot>

          {activePhase?.surfaces.map((surface) => (
            <div
              key={`${snap.phaseId}-${surface.surfaceId}`}
              data-surface={surface.surfaceId}
              style={{
                ...monitorAnchorZoneToCss(surface.anchorId),
                zIndex: getLayerZIndex(surface.layer),
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  border: `1px solid ${accent}`,
                  background: "rgba(0,0,0,0.55)",
                  color: accent,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "6px 10px",
                  borderRadius: 4,
                  boxShadow: `0 0 16px ${accent}33`,
                  maxWidth: "100%",
                  textAlign: "center",
                }}
              >
                {surface.label}
                <div style={{ fontSize: 8, opacity: 0.65, marginTop: 2, letterSpacing: "0.06em" }}>
                  {surface.anchorId} · {surface.layer}
                </div>
              </div>
            </div>
          ))}

          {!activePhase && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.45)",
                fontSize: 12,
                letterSpacing: "0.1em",
              }}
            >
              IDLE — press PLAY TIMELINE
            </div>
          )}
        </LayerStackHost>

        <div
          style={{
            position: "absolute",
            top: 6,
            right: 8,
            fontSize: 9,
            fontWeight: 800,
            color: snap.mode === "PREVIEW" ? "#FFD700" : "rgba(255,255,255,0.5)",
            letterSpacing: "0.14em",
          }}
        >
          {snap.mode}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 10 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            padding: 8,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 800 }}>
            ACTIVE PACKAGE
          </div>
          <div>
            Phase: <strong style={{ color: accent }}>{snap.phaseLabel ?? "NONE"}</strong>
          </div>
          <div>
            Event: <strong>{snap.triggerEvent ?? "—"}</strong>
          </div>
          <div>
            Camera: <strong style={{ color: "#00FF88" }}>{snap.cameraCaption ?? "—"}</strong>
          </div>
          <div>
            Surfaces: <strong>{snap.activeSurfaceIds.length}</strong>
          </div>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            padding: 8,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 800 }}>
            GRAMMAR / ANCHORS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
            {getBattlePackPreviewTimeline().map((p) => (
              <span
                key={p.phaseId}
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 3,
                  border: `1px solid ${PHASE_COLORS[p.phaseId]}66`,
                  color: PHASE_COLORS[p.phaseId],
                  background:
                    snap.phaseId === p.phaseId ? `${PHASE_COLORS[p.phaseId]}22` : "transparent",
                }}
              >
                {p.phaseId}
              </span>
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 8 }}>
            Zones: {Object.keys(MONITOR_ANCHOR_ZONES).length} · LayerStack 6 bands
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 9,
          color: "rgba(255,255,255,0.45)",
          maxHeight: 72,
          overflow: "auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 6,
        }}
      >
        {log.length === 0 ? (
          <div>Event log empty — preview uses real pack phase data only.</div>
        ) : (
          log.map((line) => <div key={line}>{line}</div>)
        )}
      </div>
    </div>
  );
}
