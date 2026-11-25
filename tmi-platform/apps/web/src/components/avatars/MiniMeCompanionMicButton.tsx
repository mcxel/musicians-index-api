"use client";

/**
 * Dedicated Mini-Me companion microphone — Phase 3: wired to POST /api/minime/voice-session.
 * Never arms TMI MIC ON / WebRTC / room chat / Performer Go Live.
 * Uses SpeechTextAdapter.dictateToComposer for STT; typed fallback when STT unavailable.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COMPANION_MIC_ICON_MARKER,
  FIRST_HELLO_PROMPT,
  assertCompanionMicIsolation,
  type CompanionMicSurface,
  type CompanionMicSession,
  type CompanionMicSessionState,
} from "@/lib/avatars/MiniMeDedicatedMicLaw";
import type { MiniMeVocalStage } from "@/lib/avatars/MiniMeSlowGrowthLaw";
import {
  dictateToComposer,
  sttAvailability,
  type SttAvailability,
} from "@/lib/venue-hud/SpeechTextAdapter";
import {
  activateCompanionMic,
  startCompanionVoiceSession,
  stopCompanionVoiceSession,
  submitCompanionUtterance,
} from "@/lib/avatars/MiniMeCompanionClient";
import {
  playManufacturedVocalCue,
  type ManufacturedVocalCueClient,
} from "@/lib/avatars/MiniMeVocalCuePlayback";
import type { ArkitWeightMap } from "@/lib/avatars/AvatarFacialComposition";

const GOLD = "#FFD700";
const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";

export type MiniMeCompanionMicUiState =
  | "Ready"
  | "Listening"
  | "Processing"
  | "Responding"
  | "Permission denied"
  | "Speech recognition unavailable";

export type MiniMeCompanionMicButtonProps = {
  ownerUserId: string;
  companionId: string;
  surface: CompanionMicSurface;
  stage?: MiniMeVocalStage;
  /** Typed input remains available as graceful fallback — not a substitute for mic when STT works. */
  allowTypedFallback?: boolean;
  muted?: boolean;
  reducedMotion?: boolean;
  onStatus?: (line: string) => void;
  onReply?: (text: string, gesture: string) => void;
  /** Drive AvatarViewer talking + speech ARKit weights while cue plays. */
  onVocalPlayback?: (event: {
    talking: boolean;
    speechArkitWeights: ArkitWeightMap | null;
    pairedClip: string | null;
    phoneticTranscript: string | null;
  }) => void;
  onOwnerReturnWelcome?: (welcome: Record<string, unknown> | null) => void;
  onStageChange?: (stage: MiniMeVocalStage) => void;
};

function mapSessionToUi(
  state: CompanionMicSessionState,
  stt: SttAvailability,
  micDenied: boolean,
): MiniMeCompanionMicUiState {
  if (micDenied || state === "ERROR_PERMISSION_DENIED") return "Permission denied";
  if (stt === "unavailable" && state === "IDLE") return "Speech recognition unavailable";
  if (state === "LISTENING" || state === "REQUESTING_PERMISSION") return "Listening";
  if (state === "PROCESSING") return "Processing";
  if (state === "RESPONDING") return "Responding";
  return "Ready";
}

function asVocalCue(raw: unknown): ManufacturedVocalCueClient | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  if (typeof c.soundId !== "string" || !Array.isArray(c.visemeFrames)) return null;
  return {
    soundId: c.soundId,
    filename: typeof c.filename === "string" ? c.filename : `${c.soundId}.wav`,
    durationSec: typeof c.durationSec === "number" ? c.durationSec : 0.8,
    sampleRateHz: 24000,
    pairedClip: typeof c.pairedClip === "string" ? c.pairedClip : "Voice_MiniSpeak_Babble",
    defaultVolume: typeof c.defaultVolume === "number" ? c.defaultVolume : 0.22,
    visemeFrames: c.visemeFrames as ManufacturedVocalCueClient["visemeFrames"],
    phoneticTranscript:
      typeof c.phoneticTranscript === "string" ? c.phoneticTranscript : undefined,
  };
}

export default function MiniMeCompanionMicButton(props: MiniMeCompanionMicButtonProps) {
  const stage = props.stage ?? "STAGE_1_BABY_MINI_SPEAK";
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<Partial<CompanionMicSession> & {
    state: CompanionMicSessionState;
    firstHelloCompleted: boolean;
    broadcastMicArmed: false;
    webrtcPublishArmed: false;
    roomChatPublishArmed: false;
  }>({
    state: "IDLE",
    firstHelloCompleted: false,
    broadcastMicArmed: false,
    webrtcPublishArmed: false,
    roomChatPublishArmed: false,
  });
  const [demoText, setDemoText] = useState("Hello");
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [uiState, setUiState] = useState<MiniMeCompanionMicUiState>("Ready");
  const [stt, setStt] = useState<SttAvailability>("unavailable");
  const [micDenied, setMicDenied] = useState(false);
  const [variantTick, setVariantTick] = useState(0);
  const [authBlocked, setAuthBlocked] = useState(false);
  const stopDictationRef = useRef<(() => void) | null>(null);
  const cueStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setStt(sttAvailability());
  }, []);

  useEffect(() => {
    return () => {
      stopDictationRef.current?.();
      cueStopRef.current?.();
      if (sessionId) {
        void stopCompanionVoiceSession({ sessionId, mute: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isolation = useMemo(
    () =>
      assertCompanionMicIsolation({
        sessionId: sessionId ?? "pending",
        ownerUserId: props.ownerUserId,
        companionId: props.companionId,
        surface: props.surface,
        state: session.state,
        firstHelloCompleted: session.firstHelloCompleted,
        broadcastMicArmed: false,
        webrtcPublishArmed: false,
        roomChatPublishArmed: false,
        listeningStartedAtMs: null,
        lastError: null,
      }),
    [props.ownerUserId, props.companionId, props.surface, session.state, session.firstHelloCompleted, sessionId],
  );

  const listening = session.state === "LISTENING";

  const applyReplyPlayback = useCallback(
    async (value: Record<string, unknown>) => {
      const reply = value.reply as { text?: string; gestureHint?: string } | undefined;
      const text = reply?.text ?? "…";
      const gesture = reply?.gestureHint ?? "SUBTLE_BREATHE";
      setLastReply(text);
      props.onReply?.(text, gesture);
      if (value.firstHelloMilestoneCompleted) {
        setSession((s) => ({ ...s, firstHelloCompleted: true }));
      }
      if (typeof value.stage === "string") {
        props.onStageChange?.(value.stage as MiniMeVocalStage);
      }
      if (value.ownerReturnWelcome) {
        props.onOwnerReturnWelcome?.(value.ownerReturnWelcome as Record<string, unknown>);
      }

      const cue = asVocalCue(value.vocalCue);
      setSession((s) => ({ ...s, state: "RESPONDING", broadcastMicArmed: false }));
      setUiState("Responding");
      props.onStatus?.(
        value.firstHelloMilestoneCompleted
          ? `First Hello · Mini-Speak: ${text}`
          : `Mini-Me: ${text}`,
      );

      if (!cue) {
        props.onVocalPlayback?.({
          talking: true,
          speechArkitWeights: { jawOpen: 0.35, mouthSmileLeft: 0.3, mouthSmileRight: 0.3 },
          pairedClip: null,
          phoneticTranscript: text,
        });
        window.setTimeout(() => {
          props.onVocalPlayback?.({
            talking: false,
            speechArkitWeights: null,
            pairedClip: null,
            phoneticTranscript: null,
          });
          setSession((s) => ({ ...s, state: "IDLE" }));
          setUiState(mapSessionToUi("IDLE", stt, micDenied));
        }, 900);
        return;
      }

      cueStopRef.current?.();
      const handle = playManufacturedVocalCue(cue, {
        muted: props.muted,
        reducedMotion: props.reducedMotion,
        onVisemeFrame: (weights) => {
          props.onVocalPlayback?.({
            talking: Object.keys(weights).length > 0,
            speechArkitWeights: Object.keys(weights).length ? weights : null,
            pairedClip: cue.pairedClip,
            phoneticTranscript: cue.phoneticTranscript ?? text,
          });
        },
        onEnd: () => {
          props.onVocalPlayback?.({
            talking: false,
            speechArkitWeights: null,
            pairedClip: null,
            phoneticTranscript: null,
          });
          setSession((s) => ({ ...s, state: "IDLE" }));
          setUiState(mapSessionToUi("IDLE", stt, micDenied));
        },
      });
      cueStopRef.current = handle.stop;
      await handle.promise;
    },
    [props, stt, micDenied],
  );

  const ensureSession = useCallback(
    async (micPermission: "granted" | "denied" | "unavailable" | "prompt") => {
      const sttNow = sttAvailability();
      setStt(sttNow);
      const started = await startCompanionVoiceSession({
        companionId: props.companionId,
        surface: props.surface,
        micPermission,
        sttAvailability: sttNow,
      });
      if (!started.ok) {
        if (started.status === 401 || started.status === 403) {
          setAuthBlocked(true);
          props.onStatus?.(`Companion mic auth: ${started.error}`);
        } else {
          props.onStatus?.(`Companion session failed: ${started.error}`);
        }
        return null;
      }
      setAuthBlocked(false);
      const sid =
        typeof (started.value as { sessionId?: string }).sessionId === "string"
          ? (started.value as { sessionId: string }).sessionId
          : null;
      if (!sid) return null;
      setSessionId(sid);
      const sess = (started.value as { session?: CompanionMicSession }).session;
      if (sess) {
        setSession({
          state: sess.state,
          firstHelloCompleted: sess.firstHelloCompleted,
          broadcastMicArmed: false,
          webrtcPublishArmed: false,
          roomChatPublishArmed: false,
        });
      }
      return sid;
    },
    [props],
  );

  const deliverUtterance = useCallback(
    async (raw: string, sid: string) => {
      setSession((s) => ({ ...s, state: "PROCESSING" }));
      setUiState("Processing");
      props.onStatus?.("Processing companion speech…");
      const result = await submitCompanionUtterance({
        sessionId: sid,
        companionId: props.companionId,
        surface: props.surface,
        transcript: raw,
        variantIndex: variantTick,
      });
      setVariantTick((n) => n + 1);
      if (!result.ok) {
        props.onStatus?.(`Utterance failed: ${result.error}`);
        setSession((s) => ({ ...s, state: "IDLE" }));
        setUiState(mapSessionToUi("IDLE", stt, micDenied));
        return;
      }
      await applyReplyPlayback(result.value);
    },
    [applyReplyPlayback, props, variantTick, stt, micDenied],
  );

  const stopListening = useCallback(async () => {
    stopDictationRef.current?.();
    stopDictationRef.current = null;
    if (sessionId) {
      await stopCompanionVoiceSession({ sessionId });
    }
    setSession((s) => ({ ...s, state: "STOPPED" }));
    setUiState("Ready");
    props.onStatus?.("Companion mic stopped (broadcast MIC untouched)");
  }, [sessionId, props]);

  const toggleListen = async () => {
    if (!isolation.ok) {
      props.onStatus?.(`Companion mic blocked: ${isolation.reason}`);
      return;
    }
    if (listening) {
      await stopListening();
      return;
    }

    let permission: "granted" | "denied" | "unavailable" | "prompt" = "prompt";
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        permission = "granted";
        setMicDenied(false);
      } else {
        permission = "unavailable";
      }
    } catch {
      permission = "denied";
      setMicDenied(true);
      setUiState("Permission denied");
      props.onStatus?.("Microphone permission denied — typed fallback available");
    }

    const sid = await ensureSession(permission);
    if (!sid) return;

    if (permission === "denied") {
      setSession((s) => ({ ...s, state: "ERROR_PERMISSION_DENIED" }));
      return;
    }

    const activated = await activateCompanionMic({ sessionId: sid });
    if (!activated.ok) {
      props.onStatus?.(`Activate mic failed: ${activated.error}`);
      return;
    }
    setSession((s) => ({ ...s, state: "LISTENING", broadcastMicArmed: false }));
    setUiState("Listening");
    props.onStatus?.("Listening to Mini-Me only — TMI MIC ON not armed");

    const sttNow = sttAvailability();
    setStt(sttNow);
    if (sttNow === "unavailable") {
      setUiState("Speech recognition unavailable");
      props.onStatus?.("Speech recognition unavailable — use typed fallback");
      return;
    }

    stopDictationRef.current?.();
    const handle = dictateToComposer({
      onTranscript: (text) => {
        void deliverUtterance(text, sid);
      },
      onError: (reason) => {
        if (reason === "unavailable" || reason === "not-allowed") {
          setMicDenied(reason === "not-allowed");
          setUiState(
            reason === "not-allowed" ? "Permission denied" : "Speech recognition unavailable",
          );
        }
        props.onStatus?.(`STT: ${reason}`);
      },
      onEnd: () => {
        /* single utterance — wait for processing */
      },
    });
    stopDictationRef.current = handle?.stop ?? null;
    if (!handle) {
      setUiState("Speech recognition unavailable");
    }
  };

  const runTypedFallback = async () => {
    if (!props.allowTypedFallback) return;
    const sid = sessionId ?? (await ensureSession(micDenied ? "denied" : "prompt"));
    if (!sid) return;
    await activateCompanionMic({ sessionId: sid });
    setSession((s) => ({ ...s, state: "LISTENING" }));
    await deliverUtterance(demoText, sid);
  };

  return (
    <div
      data-testid="mini-me-companion-mic"
      data-companion-mic-icon={COMPANION_MIC_ICON_MARKER}
      data-broadcast-mic-armed="0"
      data-webrtc-publish-armed="0"
      data-isolation-ok={isolation.ok ? "1" : "0"}
      data-first-hello-done={session.firstHelloCompleted ? "1" : "0"}
      data-ui-state={uiState}
      data-auth-blocked={authBlocked ? "1" : "0"}
      data-stage={stage}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        borderRadius: 12,
        border: `1px solid ${listening ? CYAN : "rgba(255,255,255,0.18)"}`,
        background: listening ? `${CYAN}14` : "rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          data-testid="mini-me-companion-mic-toggle"
          aria-label="Talk to Mini-Me (not broadcast MIC ON)"
          onClick={() => void toggleListen()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            borderRadius: 999,
            border: `1px solid ${listening ? FUCHSIA : GOLD}`,
            background: listening ? `${FUCHSIA}22` : `${GOLD}18`,
            color: "#fff",
            fontWeight: 800,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          <span aria-hidden style={{ fontSize: 14 }}>
            🙂🎙
          </span>
          {listening ? "LISTENING · Mini-Me" : "Talk to Mini-Me"}
        </button>
        <span
          data-testid="mini-me-companion-mic-ui-state"
          style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}
        >
          {uiState}
        </span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
          Separate from MIC ON · never broadcasts
        </span>
      </div>

      {!session.firstHelloCompleted ? (
        <div
          data-testid="mini-me-first-hello-prompt"
          style={{ fontSize: 12, fontWeight: 800, color: GOLD }}
        >
          {FIRST_HELLO_PROMPT}
        </div>
      ) : null}

      {props.allowTypedFallback ||
      micDenied ||
      stt === "unavailable" ||
      uiState === "Permission denied" ||
      uiState === "Speech recognition unavailable" ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <input
            data-testid="mini-me-companion-mic-demo-input"
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            placeholder='Try "Hello"'
            style={{
              flex: 1,
              minWidth: 120,
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "#0a0614",
              color: "#fff",
              fontSize: 12,
            }}
          />
          <button
            type="button"
            data-testid="mini-me-companion-mic-demo-send"
            onClick={() => void runTypedFallback()}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${CYAN}`,
              background: `${CYAN}18`,
              color: CYAN,
              fontWeight: 800,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Say it
          </button>
        </div>
      ) : null}

      {authBlocked ? (
        <div
          data-testid="mini-me-companion-mic-auth-blocked"
          style={{ fontSize: 10, color: FUCHSIA, fontWeight: 700 }}
        >
          Sign in required for durable companion memory (in-memory demo unavailable without session).
        </div>
      ) : null}

      {lastReply ? (
        <div
          data-testid="mini-me-companion-reply"
          style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}
        >
          Mini-Me: {lastReply}
        </div>
      ) : null}
    </div>
  );
}
