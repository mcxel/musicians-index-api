"use client";

/**
 * PerformerCurtainControlPanel — wires CurtainRuntimeManager into Performer Hub / Go Live.
 * Emits through existing presentation directors (no new CurtainDirector).
 * Overlay curtain + program-feed restore only — no 3D .glb venue claims (Rule 20).
 */

import { useCallback, useEffect, useState } from "react";
import { useLegacyVenueMountGuard } from "@/lib/venue/useLegacyVenueMountGuard";
import {
  executeCurtainTransition,
  getCanonicalTimerSnapshot,
  resolveCurtainAdCampaign,
  type CurtainState,
  type IntermissionType,
  type CanonicalTimerSnapshot,
  type CurtainRuntimeContext,
} from "@/lib/presentation/CurtainRuntimeManager";
import { ensurePresentationDirectorsStarted } from "@/lib/presentation/directors";
import {
  openCurtain as stageOpenCurtain,
  triggerIntermission,
  resumeFromIntermission,
  closeCurtainAndEnd,
  getStageSnapshot,
  startCountdown,
} from "@/lib/live/StageLifecycleEngine";

const PRESETS: { type: IntermissionType; label: string; seconds: number }[] = [
  { type: "WATER_BREAK", label: "Water Break", seconds: 90 },
  { type: "INTERMISSION", label: "Intermission", seconds: 180 },
  { type: "SPONSOR_BREAK", label: "Sponsor Break", seconds: 120 },
  { type: "OUTFIT_CHANGE", label: "Outfit Change", seconds: 180 },
  { type: "INSTRUMENT_CHANGE", label: "Instrument", seconds: 150 },
  { type: "AUDIENCE_QA", label: "Audience Q&A", seconds: 300 },
  { type: "DJ_TRANSITION", label: "DJ Transition", seconds: 60 },
  { type: "CUSTOM_TIMER", label: "Custom 5m", seconds: 300 },
];

const EXTENSIONS = [
  { label: "+30s", seconds: 30 },
  { label: "+1m", seconds: 60 },
  { label: "+2m", seconds: 120 },
  { label: "+5m", seconds: 300 },
];

export interface PerformerCurtainControlPanelProps {
  performerId: string;
  sessionId?: string;
  accentColor?: string;
  /** Compact for drawer; full for Go Live studio */
  compact?: boolean;
}

function mapUiState(curtain: CurtainState | null, stageState: string): CurtainState {
  if (curtain) return curtain;
  if (stageState === "CAMERA_LIVE" || stageState === "LIGHTING_SNAP") return "OPEN";
  if (stageState === "INTERMISSION") return "INTERMISSION";
  if (stageState === "ENDED" || stageState === "CURTAIN_CLOSE") return "POST_SHOW";
  if (stageState === "COUNTDOWN" || stageState === "CURTAIN_PART") return "OPENING";
  return "PRE_SHOW";
}

export default function PerformerCurtainControlPanel({
  performerId,
  sessionId: sessionIdProp,
  accentColor = "#FF2DAA",
  compact = false,
}: PerformerCurtainControlPanelProps) {
  useLegacyVenueMountGuard("PerformerCurtainControlPanel", "components/performer/PerformerCurtainControlPanel.tsx", "LEGACY-VENUE-002");
  const sessionId = sessionIdProp ?? `curtain-session-${performerId}`;
  const [curtainState, setCurtainState] = useState<CurtainState>("PRE_SHOW");
  const [timer, setTimer] = useState<CanonicalTimerSnapshot | undefined>();
  const [preset, setPreset] = useState<IntermissionType>("WATER_BREAK");
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [adLabel, setAdLabel] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    ensurePresentationDirectorsStarted();
    const campaign = resolveCurtainAdCampaign("curtain-ad-rail");
    setAdLabel(
      campaign.isHousePromotion
        ? `Ad rail: ${campaign.advertiserName} (house / promo — Rule 12)`
        : `Ad rail: ${campaign.advertiserName} (paid sponsor)`,
    );
    const snap = getStageSnapshot();
    setCurtainState(mapUiState(null, snap.state));
    setTimer(getCanonicalTimerSnapshot(sessionId));
  }, [sessionId]);

  const runAction = useCallback(
    async (
      targetAction: "TAKE_BREAK" | "RESUME_SHOW" | "END_PERFORMANCE" | "OPEN_STAGE" | "EXTEND_TIME",
      opts?: { extensionSecondsToAdd?: number; countdownSeconds?: number; intermissionType?: IntermissionType },
    ) => {
      if (!performerId) {
        setError("Sign in as a performer to control the curtain.");
        return;
      }
      setBusy(true);
      setError("");
      setStatusMsg("");

      const ctx: CurtainRuntimeContext = {
        currentState: curtainState,
        userCountryCode: "US",
        sessionConnected: true,
        activeCampaign: resolveCurtainAdCampaign("curtain-ad-rail"),
      };

      const result = await executeCurtainTransition(
        ctx,
        {
          performerId,
          sessionId,
          targetAction,
          isAuthorized: true,
          intermissionType: opts?.intermissionType ?? preset,
          countdownSeconds: opts?.countdownSeconds,
          extensionSecondsToAdd: opts?.extensionSecondsToAdd,
        },
        `curtain-rt-${performerId}`,
      );

      if (!result.success) {
        setError(result.error ?? "Curtain action failed.");
        setBusy(false);
        return;
      }

      if (result.newState) setCurtainState(result.newState);
      if (result.timerSnapshot) setTimer(result.timerSnapshot);
      else if (targetAction === "RESUME_SHOW" || targetAction === "OPEN_STAGE" || targetAction === "END_PERFORMANCE") {
        setTimer(undefined);
      } else {
        setTimer(getCanonicalTimerSnapshot(sessionId));
      }

      // Keep StageLifecycleEngine in sync (existing Go Live / broadcast path)
      try {
        if (targetAction === "OPEN_STAGE") {
          const stage = getStageSnapshot().state;
          if (stage === "STAGE_PREP") startCountdown();
          else if (stage === "COUNTDOWN") stageOpenCurtain();
        } else if (targetAction === "TAKE_BREAK") {
          triggerIntermission();
        } else if (targetAction === "RESUME_SHOW") {
          resumeFromIntermission();
        } else if (targetAction === "END_PERFORMANCE") {
          closeCurtainAndEnd();
        }
      } catch {
        /* stage engine optional when not in a live room */
      }

      const feedNote =
        targetAction === "RESUME_SHOW" || targetAction === "OPEN_STAGE"
          ? "Program feed restored (overlay curtain only — no 3D venue mesh)."
          : result.adRailActive
            ? "Curtain overlay + ad rail active."
            : "Curtain transition applied.";
      setStatusMsg(feedNote);
      setBusy(false);
    },
    [performerId, sessionId, curtainState, preset],
  );

  const inBreak =
    curtainState === "INTERMISSION" ||
    curtainState === "EXTENDED_INTERMISSION" ||
    curtainState === "TECHNICAL_DELAY";
  const isOpen = curtainState === "OPEN" || curtainState === "OPENING";
  const selectedPreset = PRESETS.find((p) => p.type === preset) ?? PRESETS[0];

  const btn = (
    label: string,
    onClick: () => void,
    opts?: { primary?: boolean; danger?: boolean; disabled?: boolean },
  ) => (
    <button
      type="button"
      disabled={busy || opts?.disabled}
      onClick={onClick}
      style={{
        padding: compact ? "6px 10px" : "8px 12px",
        borderRadius: 8,
        border: opts?.danger
          ? "1px solid rgba(255,68,68,0.55)"
          : opts?.primary
            ? `1px solid ${accentColor}88`
            : "1px solid rgba(255,255,255,0.15)",
        background: opts?.danger
          ? "rgba(255,68,68,0.18)"
          : opts?.primary
            ? `${accentColor}22`
            : "rgba(255,255,255,0.04)",
        color: opts?.danger ? "#FF6B6B" : opts?.primary ? accentColor : "#fff",
        fontSize: compact ? 9 : 10,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: busy || opts?.disabled ? "not-allowed" : "pointer",
        opacity: busy || opts?.disabled ? 0.45 : 1,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 8 : 12,
        padding: compact ? 10 : 14,
        borderRadius: 12,
        border: `1px solid ${accentColor}33`,
        background: "rgba(5,5,16,0.92)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>
          CURTAIN CONTROL
        </span>
        <span
          style={{
            fontSize: 8,
            fontWeight: 800,
            color: inBreak ? "#FFD700" : isOpen ? "#00FF88" : "rgba(255,255,255,0.45)",
            letterSpacing: "0.08em",
          }}
        >
          {curtainState.replace(/_/g, " ")}
        </span>
      </div>

      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
        Overlay curtain + program feed. Ad rail uses sponsor registry fallbacks (Rule 12). Not a 3D venue reveal.
      </div>

      {timer ? (
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#FFD700",
            padding: "6px 10px",
            borderRadius: 8,
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.25)",
          }}
        >
          {timer.displayStatusText}
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {btn("OPEN STAGE", () => void runAction("OPEN_STAGE"), {
          primary: true,
          disabled: isOpen && !inBreak,
        })}
        {btn("TAKE BREAK", () =>
          void runAction("TAKE_BREAK", {
            intermissionType: selectedPreset.type,
            countdownSeconds: selectedPreset.seconds,
          }), {
          disabled: inBreak || curtainState === "POST_SHOW",
        })}
        {btn("RESUME", () => void runAction("RESUME_SHOW"), {
          primary: true,
          disabled: !inBreak,
        })}
        {btn("END SHOW", () => void runAction("END_PERFORMANCE"), { danger: true })}
      </div>

      <div>
        <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
          INTERMISSION PRESET
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {PRESETS.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => setPreset(p.type)}
              style={{
                fontSize: 8,
                fontWeight: 800,
                padding: "4px 7px",
                borderRadius: 6,
                border: preset === p.type ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
                background: preset === p.type ? `${accentColor}28` : "transparent",
                color: preset === p.type ? accentColor : "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {inBreak ? (
        <div>
          <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
            EXTEND TIMER
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {EXTENSIONS.map((e) =>
              btn(e.label, () => void runAction("EXTEND_TIME", { extensionSecondsToAdd: e.seconds })),
            )}
          </div>
        </div>
      ) : null}

      {adLabel ? (
        <div style={{ fontSize: 8, color: "rgba(0,255,255,0.65)" }}>{adLabel}</div>
      ) : null}
      {statusMsg ? (
        <div style={{ fontSize: 9, color: "#00FF88" }}>{statusMsg}</div>
      ) : null}
      {error ? (
        <div style={{ fontSize: 9, color: "#FF6B6B" }}>{error}</div>
      ) : null}
    </div>
  );
}
