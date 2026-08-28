"use client";

/**
 * Performance rail: INTERMISSION ↔ RESUME only (performer).
 * Identity (ARTIST ID / FAN ID) lives in CommandCenterMediaStack utility row.
 * Intermission ≠ END LIVE — same liveSessionId / roomId / WebRTC / audio owner.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelIntermissionArm,
  getPerformanceState,
  getStageSnapshot,
  markIntermissionAdOpportunity,
  requestIntermission,
  resumeFromIntermission,
  subscribeStage,
  type PerformanceState,
  type StageSnapshot,
} from "@/lib/live/StageLifecycleEngine";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { resolveCurtainAdCampaign } from "@/lib/presentation/CurtainRuntimeManager";
import { useGoLiveBootstrapStore } from "@/lib/live/goLiveBootstrapStore";

export interface PerformanceRailControlsProps {
  role: "fan" | "performer";
  userId?: string | null;
  displayName?: string | null;
}

const railBtn = (
  active: boolean,
  accent: string,
  disabled?: boolean,
): React.CSSProperties => ({
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: "0.08em",
  padding: "3px 9px",
  borderRadius: 6,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.45 : 1,
  border: active ? `1px solid ${accent}` : `1px solid ${accent}66`,
  background: active ? `${accent}22` : "transparent",
  color: accent,
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  gap: 4,
  whiteSpace: "nowrap",
});

export default function PerformanceRailControls({
  role,
}: PerformanceRailControlsProps) {
  const [snap, setSnap] = useState<StageSnapshot>(() => getStageSnapshot());
  const [perf, setPerf] = useState<PerformanceState>(() => getPerformanceState());
  const [adNote, setAdNote] = useState<string | null>(null);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const bootPhase = useGoLiveBootstrapStore((s) => s.phase);
  const micWasOnRef = useRef(false);

  useEffect(() => {
    return subscribeStage((s) => {
      setSnap({ ...s, analytics: { ...s.analytics } });
      setPerf(getPerformanceState());
    });
  }, []);

  useEffect(() => {
    const privacy = useLivePrivacyState.getState();
    if (snap.audienceMicMuted && snap.state === "INTERMISSION") {
      micWasOnRef.current = privacy.micPreviewActive;
      privacy.setMicPreviewActive(false);
      const stream = privacy.previewStream;
      stream?.getAudioTracks().forEach((t) => {
        t.enabled = false;
      });
    } else if (snap.state === "CAMERA_LIVE" && !snap.audienceMicMuted) {
      const stream = privacy.previewStream;
      if (micWasOnRef.current || privacy.isLivePublished) {
        privacy.setMicPreviewActive(true);
        stream?.getAudioTracks().forEach((t) => {
          t.enabled = true;
        });
      }
    }
  }, [snap.audienceMicMuted, snap.state]);

  const liveReady =
    isLivePublished || bootPhase === "READY" || perf === "LIVE" || perf === "INTERMISSION";

  const arming = snap.intermissionArmRemaining != null && snap.intermissionArmRemaining > 0;
  const inIntermission = perf === "INTERMISSION" || snap.state === "INTERMISSION";

  const onIntermission = useCallback(() => {
    if (!liveReady || inIntermission) return;
    const campaign = resolveCurtainAdCampaign("curtain-ad-rail");
    const eligible = Boolean(campaign.campaignId);
    markIntermissionAdOpportunity({
      created: eligible,
      played: false,
      completed: false,
      campaignId: campaign.campaignId,
    });
    setAdNote(
      campaign.isHousePromotion
        ? `Break board: ${campaign.advertiserName} (promo / advertise CTA — not paid unless sponsor slot)`
        : `Break board: ${campaign.advertiserName} (paid sponsor slot)`,
    );
    requestIntermission({ countdownSeconds: 3 });
  }, [liveReady, inIntermission]);

  const onCancelArm = useCallback(() => {
    cancelIntermissionArm();
    setAdNote(null);
  }, []);

  const onResume = useCallback(() => {
    resumeFromIntermission(() => {
      const stream = useLivePrivacyState.getState().previewStream;
      const videoOk =
        !stream ||
        stream.getVideoTracks().some((t) => t.readyState === "live");
      if (stream && !videoOk) {
        return { ok: false, error: "Camera track ended — re-enable CAM then RETRY." };
      }
      markIntermissionAdOpportunity({ completed: true });
      setAdNote(null);
      return { ok: true };
    });
  }, []);

  if (role !== "performer") return null;

  return (
    <div
      data-performance-rail
      style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", position: "relative" }}
    >
      <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)", margin: "0 2px" }} />

      {arming ? (
        <button
          type="button"
          data-testid="tmi-intermission-cancel"
          onClick={onCancelArm}
          title="Cancel intermission countdown"
          style={railBtn(true, "#FFD700")}
        >
          <span>✕</span>
          <span>CANCEL {snap.intermissionArmRemaining}</span>
        </button>
      ) : inIntermission ? (
        <button
          type="button"
          data-testid="tmi-resume-rail"
          onClick={onResume}
          title="Resume show — same session, open curtains"
          style={railBtn(true, "#00FF88")}
        >
          <span>▶</span>
          <span>RESUME</span>
        </button>
      ) : (
        <button
          type="button"
          data-testid="tmi-intermission-rail"
          onClick={onIntermission}
          disabled={!liveReady || perf === "ENDING" || perf === "ENDED" || perf === "PREPARING"}
          title="Intermission — closes curtains, keeps live session"
          style={railBtn(false, "#FF2DAA", !liveReady)}
        >
          <span>⏸</span>
          <span>INTERMISSION</span>
        </button>
      )}

      <span
        data-performance-state={perf}
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.1em",
          color:
            perf === "LIVE"
              ? "#FF2020"
              : perf === "INTERMISSION"
                ? "#FFD700"
                : "rgba(255,255,255,0.35)",
        }}
      >
        {perf}
      </span>

      {snap.resumeError ? (
        <button
          type="button"
          onClick={onResume}
          style={railBtn(true, "#FF2DAA")}
          title={snap.resumeError}
        >
          RETRY RESUME
        </button>
      ) : null}

      {adNote && inIntermission ? (
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", maxWidth: 180 }}>
          {adNote}
        </span>
      ) : null}
    </div>
  );
}
