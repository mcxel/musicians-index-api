"use client";

/**
 * Mini-Me companion surface — Creation Center / Canister / Quick Panel / Lobby / Venue HUD.
 * Binds GET/POST /api/minime/companion for forgetfulness, idle, callbacks, and resets.
 * Server state is authoritative — no parallel frontend inactivity clock.
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import MiniMeCompanionMicButton from "@/components/avatars/MiniMeCompanionMicButton";
import type { CompanionMicSurface } from "@/lib/avatars/MiniMeDedicatedMicLaw";
import type { MiniMeVocalStage } from "@/lib/avatars/MiniMeSlowGrowthLaw";
import type { MiniMeSpeechSurface } from "@/lib/avatars/MiniMeSpontaneousCallbackPolicy";
import type { MiniMeResetKind } from "@/lib/avatars/MiniMeCreationContracts";
import type { ArkitWeightMap } from "@/lib/avatars/AvatarFacialComposition";
import {
  companionIdleTick,
  companionInteract,
  companionResetRebirth,
  companionSpontaneousCallback,
  fetchCompanionState,
} from "@/lib/avatars/MiniMeCompanionClient";
import {
  playManufacturedVocalCue,
  type ManufacturedVocalCueClient,
} from "@/lib/avatars/MiniMeVocalCuePlayback";

const GOLD = "#FFD700";
const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";

export type MiniMeCompanionSurfaceProps = {
  ownerUserId: string;
  companionId: string;
  micSurface: CompanionMicSurface;
  speechSurface: MiniMeSpeechSurface;
  performanceActive?: boolean;
  ownerInputActive?: boolean;
  reducedMotion?: boolean;
  muted?: boolean;
  showControls?: boolean;
  onVocalPlayback?: (event: {
    talking: boolean;
    speechArkitWeights: ArkitWeightMap | null;
    pairedClip: string | null;
    phoneticTranscript: string | null;
  }) => void;
  onIdleAction?: (kind: string | null) => void;
  onRustPresentation?: (severity: string | null, welcome: string | null) => void;
};

function rustLabel(severity: string | null | undefined): string {
  switch (severity) {
    case "SHARP":
      return "Sharp · Days 1–20";
    case "SLIGHTLY_RUSTY":
      return "Slightly rusty · Day 21+";
    case "FUNNY_FORGETFUL":
      return "Funny forgetful · Day 30+";
    case "NEEDS_REMINDER":
      return "Needs a reminder · Day 45+";
    default:
      return severity ?? "—";
  }
}

export default function MiniMeCompanionSurface(props: MiniMeCompanionSurfaceProps) {
  const [stage, setStage] = useState<MiniMeVocalStage>("STAGE_1_BABY_MINI_SPEAK");
  const [rustSeverity, setRustSeverity] = useState<string | null>(null);
  const [idleDays, setIdleDays] = useState<number | null>(null);
  const [welcome, setWelcome] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastIdle, setLastIdle] = useState<string | null>(null);
  const [personalityHint, setPersonalityHint] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const r = await fetchCompanionState({ companionId: props.companionId });
    if (!r.ok) {
      setLoadError(r.error);
      return;
    }
    setLoadError(null);
    const stageVal = r.companion.stage;
    if (typeof stageVal === "string") setStage(stageVal as MiniMeVocalStage);
    const sev = r.forgetfulness.companionRustSeverity;
    const days = r.forgetfulness.companionIdleDays;
    const welcomeEv = r.forgetfulness.ownerReturnWelcome as
      | { message?: string }
      | null
      | undefined;
    setRustSeverity(typeof sev === "string" ? sev : null);
    setIdleDays(typeof days === "number" ? days : null);
    const welcomeMsg =
      welcomeEv && typeof welcomeEv.message === "string" ? welcomeEv.message : null;
    setWelcome(welcomeMsg);
    props.onRustPresentation?.(typeof sev === "string" ? sev : null, welcomeMsg);
    const traits = r.companion.personalityTraits as Record<string, number> | undefined;
    if (traits) {
      const top = Object.entries(traits).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
      if (top) setPersonalityHint(`${top[0]} ${Math.round((top[1] ?? 0) * 100)}%`);
    }
  }, [props]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (props.reducedMotion) return;
    const id = window.setInterval(() => {
      void (async () => {
        const tick = await companionIdleTick({
          companionId: props.companionId,
          ownerInputActive: props.ownerInputActive,
          performanceOrBroadcastActive: props.performanceActive,
          reducedMotion: props.reducedMotion,
        });
        if (!tick.ok) return;
        const kind =
          typeof tick.value.kind === "string"
            ? tick.value.kind
            : typeof (tick.value as { idleKind?: string }).idleKind === "string"
              ? (tick.value as { idleKind: string }).idleKind
              : null;
        setLastIdle(kind);
        props.onIdleAction?.(kind);
      })();
    }, 12_000);
    return () => window.clearInterval(id);
  }, [props]);

  const runCallback = async () => {
    const r = await companionSpontaneousCallback({
      companionId: props.companionId,
      surface: props.speechSurface,
      performanceActive: props.performanceActive,
    });
    if (!r.ok) {
      setStatus(`Callback: ${r.error}`);
      return;
    }
    const decision = r.value.decision as { allow?: boolean; reason?: string } | undefined;
    if (!decision?.allow) {
      setStatus(`Quiet: ${decision?.reason ?? "blocked"}`);
      return;
    }
    if (r.value.ownerPrivateAudioOnly && r.value.publicVenueBroadcastAllowed === false) {
      setStatus("Private local audio only — not on PROGRAM");
    }
    const cue = r.value.vocalCue as ManufacturedVocalCueClient | null;
    if (cue?.soundId && cue.visemeFrames) {
      playManufacturedVocalCue(cue, {
        muted: props.muted,
        reducedMotion: props.reducedMotion,
        onVisemeFrame: (weights) => {
          props.onVocalPlayback?.({
            talking: Object.keys(weights).length > 0,
            speechArkitWeights: Object.keys(weights).length ? weights : null,
            pairedClip: cue.pairedClip,
            phoneticTranscript: cue.phoneticTranscript ?? null,
          });
        },
        onEnd: () => {
          props.onVocalPlayback?.({
            talking: false,
            speechArkitWeights: null,
            pairedClip: null,
            phoneticTranscript: null,
          });
        },
      });
    }
  };

  const runReset = async (kind: MiniMeResetKind) => {
    const r = await companionResetRebirth({ companionId: props.companionId, kind });
    setStatus(r.ok ? `${kind} complete` : `${kind}: ${r.error}`);
    await refresh();
  };

  const playTogether = async () => {
    await companionInteract({
      companionId: props.companionId,
      interactionKind: "PLAY_EMOTE_WITH_COMPANION",
      surface: props.micSurface,
    });
    props.onIdleAction?.("YIELD_OWNER_INPUT");
    await refresh();
  };

  return (
    <div
      data-testid="mini-me-companion-surface"
      data-rust-severity={rustSeverity ?? ""}
      data-idle-days={idleDays ?? ""}
      data-stage={stage}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        borderRadius: 12,
        border: "1px solid rgba(255,215,0,0.25)",
        background: "rgba(5,5,16,0.85)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: GOLD, letterSpacing: "0.08em" }}>
          MINI-ME COMPANION
        </span>
        <span data-testid="mini-me-rust-badge" style={{ fontSize: 10, color: CYAN, fontWeight: 700 }}>
          {rustLabel(rustSeverity)}
          {idleDays != null ? ` · ${idleDays}d idle` : ""}
        </span>
      </div>

      {welcome ? (
        <div
          data-testid="mini-me-owner-return-welcome"
          style={{ fontSize: 11, color: FUCHSIA, fontWeight: 800 }}
        >
          {welcome}
        </div>
      ) : null}

      {personalityHint ? (
        <div data-testid="mini-me-personality-hint" style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>
          Personality lead: {personalityHint}
          {lastIdle ? ` · idle: ${lastIdle}` : ""}
        </div>
      ) : null}

      <MiniMeCompanionMicButton
        ownerUserId={props.ownerUserId}
        companionId={props.companionId}
        surface={props.micSurface}
        stage={stage}
        allowTypedFallback
        muted={props.muted}
        reducedMotion={props.reducedMotion}
        onStatus={setStatus}
        onVocalPlayback={props.onVocalPlayback}
        onStageChange={setStage}
        onOwnerReturnWelcome={(w) => {
          const msg = w && typeof w.message === "string" ? w.message : null;
          setWelcome(msg);
          props.onRustPresentation?.(rustSeverity, msg);
        }}
        onReply={(_text, gesture) => {
          props.onIdleAction?.(gesture);
          void refresh();
        }}
      />

      {props.showControls !== false ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button
            type="button"
            data-testid="mini-me-play-together"
            onClick={() => void playTogether()}
            style={chipStyle(CYAN)}
          >
            Play together
          </button>
          <button
            type="button"
            data-testid="mini-me-spontaneous-callback"
            onClick={() => void runCallback()}
            style={chipStyle(GOLD)}
          >
            Callback
          </button>
          <button
            type="button"
            data-testid="mini-me-voice-reset"
            onClick={() => void runReset("VOICE_RESET")}
            style={chipStyle("#888")}
          >
            Voice reset
          </button>
          <button
            type="button"
            data-testid="mini-me-personality-reset"
            onClick={() => void runReset("PERSONALITY_RESET")}
            style={chipStyle("#888")}
          >
            Personality reset
          </button>
          <button
            type="button"
            data-testid="mini-me-full-rebirth"
            onClick={() => void runReset("FULL_REBIRTH")}
            style={chipStyle(FUCHSIA)}
          >
            Full rebirth
          </button>
        </div>
      ) : null}

      {status ? (
        <div data-testid="mini-me-surface-status" style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
          {status}
        </div>
      ) : null}
      {loadError ? (
        <div data-testid="mini-me-surface-load-error" style={{ fontSize: 10, color: FUCHSIA }}>
          Companion API: {loadError}
        </div>
      ) : null}
    </div>
  );
}

function chipStyle(color: string): CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 8,
    border: `1px solid ${color}`,
    background: `${color}18`,
    color,
    fontWeight: 800,
    fontSize: 10,
    cursor: "pointer",
  };
}
