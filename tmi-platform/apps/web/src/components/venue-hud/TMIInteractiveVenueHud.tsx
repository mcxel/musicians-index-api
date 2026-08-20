"use client";

/**
 * TMI Interactive Venue HUD — Master Viewport Control Layer.
 *
 * User-facing Name: TMI Interactive Venue HUD
 * Core Package: Base Live HUD
 * Technical Engine: TMI Experience HUD Runtime
 *
 * Laws:
 *   1. Mounted over the active Media Player / Monitor / Venue Viewport.
 *   2. Pre-live console contracts into perimeter HUD rails on [ GO LIVE ].
 *   3. CLEAN_STAGE mode hides rails but keeps persistent HUD Recall Control ([ ◰ HUD ]) in top-right.
 *   4. Zero document layout mutation (Δx=0, Δy=0, Δwidth=0, Δheight=0 for venue viewport).
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  HudCommandBus,
  resolveHudCapabilities,
  type BroadcastState,
  type ExperienceType,
  type HudPresentationState,
  type UserRoleCapability,
} from "@/lib/venue-hud/TMIExperienceHudRuntime";
import { resolveParticipationHudActions } from "@/lib/venue-hud/HudActionRegistry";
import {
  joinQueue as joinQueueEngine,
  getQueuePosition,
  getQueueSnapshot,
} from "@/lib/live/queueEngine";
import type { ParticipationState, VenueHudActionId } from "@/lib/live/ParticipationStateMachine";
import { directorTick } from "@/lib/live/BotQueueDirector";
import {
  executeHostControl,
  resolveHostControlCapabilities,
} from "@/lib/live/HostRoomControlBridge";
import { resolveVotingOpen } from "@/lib/live/ParticipationVotingBridge";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";
const RED = "#FF4466";

export interface TMIInteractiveVenueHudProps {
  roomId: string;
  roomTitle: string;
  experienceType?: ExperienceType;
  role?: UserRoleCapability;
  tier?: "FREE" | "PRO" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
  onBroadcastStateChange?: (state: BroadcastState) => void;
  /** True when signed-in user owns this room (host controls). */
  isRoomOwner?: boolean;
  /** Honest voting gate from battle/cypher engines — never fabricate open voting. */
  votingOpen?: boolean;
  participationState?: ParticipationState;
  /** Bot/system room → Queue Director auto-advance; human-owned → host approve. */
  ownership?: "human_owned" | "bot_operated" | "platform";
  battleId?: string;
  /** Real human viewer count from live registry — 0 when unknown (Rule 20). */
  humanViewerCount?: number;
  /** PREVIEW / VENUE TEST — never show as real viewers. */
  isPreview?: boolean;
  /** e.g. "TEST: 250 / 1,000 OCCUPANCY" */
  testOccupancyLabel?: string | null;
}

export default function TMIInteractiveVenueHud({
  roomId,
  roomTitle,
  experienceType = "LIVE",
  role = "performer",
  tier = "FREE",
  onBroadcastStateChange,
  isRoomOwner = false,
  votingOpen = false,
  participationState = "SPECTATOR",
  ownership = "platform",
  battleId,
  humanViewerCount = 0,
  isPreview = false,
  testOccupancyLabel = null,
}: TMIInteractiveVenueHudProps) {
  const [hudState, setHudState] = useState<HudPresentationState>("PRE_LIVE");
  const [broadcastState, setBroadcastState] = useState<BroadcastState>("IDLE");
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sessionSec, setSessionSec] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [activeReactions, setActiveReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [myQueuePos, setMyQueuePos] = useState<number | null>(null);
  const [localParticipation, setLocalParticipation] = useState<ParticipationState>(participationState);
  const [liveVotingOpen, setLiveVotingOpen] = useState(votingOpen);
  const [spotlightOn, setSpotlightOn] = useState(false);
  const [audienceAudioOn, setAudienceAudioOn] = useState(true);

  const capabilities = useMemo(() => resolveHudCapabilities(role), [role]);

  const competition =
    experienceType === "BATTLE" || experienceType === "CYPHER" || experienceType === "CHALLENGE";

  const hostCaps = useMemo(() => resolveHostControlCapabilities(roomId), [roomId]);

  const syncVotingOpen = useCallback(() => {
    const resolved = resolveVotingOpen({
      roomId,
      battleId,
      propVotingOpen: votingOpen || undefined,
    });
    setLiveVotingOpen(resolved.votingOpen);
  }, [roomId, battleId, votingOpen]);

  const hudActions = useMemo(
    () =>
      resolveParticipationHudActions({
        role: isRoomOwner ? "host" : role,
        experienceType,
        isRoomOwner,
        votingOpen: liveVotingOpen,
        participationState: localParticipation,
        queueEngineAvailable: true,
        hostControlsAvailable: isRoomOwner || role === "host" || role === "admin",
        hostActionCapabilities: hostCaps,
        gameActionsAvailable: false,
      }),
    [role, experienceType, isRoomOwner, liveVotingOpen, localParticipation, hostCaps],
  );

  const syncQueueCount = useCallback(() => {
    const snap = getQueueSnapshot(roomId);
    setQueueCount(snap.count);
    const uid = payloadUserId();
    setMyQueuePos(getQueuePosition(roomId, uid));
  }, [roomId]);

  useEffect(() => {
    syncQueueCount();
  }, [syncQueueCount]);

  useEffect(() => {
    setLocalParticipation(participationState);
  }, [participationState]);

  useEffect(() => {
    syncVotingOpen();
    const onOpen = () => syncVotingOpen();
    const onClose = () => syncVotingOpen();
    if (typeof window !== "undefined") {
      window.addEventListener("tmi:voting:open", onOpen);
      window.addEventListener("tmi:voting:close", onClose);
    }
    const t = setInterval(syncVotingOpen, 2000);
    return () => {
      clearInterval(t);
      if (typeof window !== "undefined") {
        window.removeEventListener("tmi:voting:open", onOpen);
        window.removeEventListener("tmi:voting:close", onClose);
      }
    };
  }, [syncVotingOpen]);

  function payloadUserId(): string {
    if (typeof window === "undefined") return `user-${roomId}`;
    try {
      return sessionStorage.getItem("tmi_user_id") ?? `guest-${roomId}`;
    } catch {
      return `guest-${roomId}`;
    }
  }

  const runHostAction = useCallback(
    (actionId: VenueHudActionId, params?: Record<string, unknown>) => {
      if (!isRoomOwner && role !== "host" && role !== "admin") {
        setStatusLine("Host only");
        return false;
      }
      const result = executeHostControl(actionId, roomId, params);
      setStatusLine(result.message);
      syncQueueCount();
      syncVotingOpen();
      return result.ok;
    },
    [isRoomOwner, role, roomId, syncQueueCount, syncVotingOpen],
  );

  // Register command handlers
  useEffect(() => {
    const unsubs = [
      HudCommandBus.register("GO_LIVE", async () => {
        setBroadcastState("CONNECTING");
        onBroadcastStateChange?.("CONNECTING");
        setStatusLine("Connecting to venue edge...");

        await new Promise((res) => setTimeout(res, 800));

        setBroadcastState("LIVE");
        setHudState("LIVE_VISIBLE");
        onBroadcastStateChange?.("LIVE");
        setStatusLine("You are LIVE!");
        return true;
      }),

      HudCommandBus.register("END_LIVE", async () => {
        setBroadcastState("ENDING");
        onBroadcastStateChange?.("ENDING");

        await new Promise((res) => setTimeout(res, 500));

        setBroadcastState("IDLE");
        setHudState("PRE_LIVE");
        onBroadcastStateChange?.("IDLE");
        setSessionSec(0);
        setStatusLine("Broadcast ended.");
        return true;
      }),

      HudCommandBus.register("TOGGLE_MIC", () => {
        setMicMuted((m) => !m);
        setStatusLine(micMuted ? "Microphone active" : "Microphone muted");
        return true;
      }),

      HudCommandBus.register("TOGGLE_CAMERA", () => {
        setCameraOff((c) => !c);
        setStatusLine(cameraOff ? "Camera active" : "Camera off");
        return true;
      }),

      HudCommandBus.register("EMIT_REACTION", (payload) => {
        const emoji = payload.params?.emoji ?? "🔥";
        setReactionCount((c) => c + 1);
        const id = Math.random().toString(36).substring(2, 9);
        const x = Math.floor(Math.random() * 80) + 10;
        setActiveReactions((prev) => [...prev.slice(-15), { id, emoji, x }]);
        setTimeout(() => {
          setActiveReactions((prev) => prev.filter((r) => r.id !== id));
        }, 1200);
        return true;
      }),

      HudCommandBus.register("JOIN_QUEUE", () => {
        const slot = joinQueueEngine(roomId, payloadUserId(), "Performer", 5);
        setLocalParticipation("QUEUED");
        syncQueueCount();
        const pos = getQueuePosition(roomId, payloadUserId());
        setStatusLine(
          pos != null
            ? `Queued · #${pos} of ${getQueueSnapshot(roomId).count} · watching`
            : `Queued · ${slot.status}`,
        );
        return true;
      }),

      HudCommandBus.register("APPROVE_NEXT", () => {
        if (!isRoomOwner && role !== "host" && role !== "admin") {
          setStatusLine("Host only");
          return false;
        }
        if (ownership === "bot_operated" || ownership === "platform") {
          const result = directorTick({
            venueSlug: roomId,
            battleId,
            ownership,
            policy: battleId ? "winner_stays" : "fifo",
          });
          setStatusLine(result.ok ? "Queue Director advanced next" : result.reason ?? "Queue empty");
          if (result.participationState) setLocalParticipation(result.participationState);
          syncQueueCount();
          return result.ok;
        }
        return runHostAction("approve_next");
      }),

      HudCommandBus.register("REJECT_PARTICIPANT", () => runHostAction("reject_participant")),
      HudCommandBus.register("REORDER_QUEUE", (payload) =>
        runHostAction("reorder_queue", payload.params),
      ),
      HudCommandBus.register("BRING_ON_STAGE", () => runHostAction("bring_on_stage")),
      HudCommandBus.register("REMOVE_FROM_STAGE", () => runHostAction("remove_from_stage")),
      HudCommandBus.register("BROADCAST_SPOTLIGHT", () => {
        const next = !spotlightOn;
        setSpotlightOn(next);
        return runHostAction("broadcast_spotlight", { active: next });
      }),
      HudCommandBus.register("AUDIENCE_AUDIO", () => {
        const next = !audienceAudioOn;
        setAudienceAudioOn(next);
        return runHostAction("audience_audio", { enabled: next });
      }),
      HudCommandBus.register("PARTICIPANT_MIC", (payload) =>
        runHostAction("participant_mic", payload.params ?? { allowed: true }),
      ),
      HudCommandBus.register("AUDIENCE_MUTE", () => runHostAction("audience_mute")),
      HudCommandBus.register("TOGGLE_QA", () => runHostAction("toggle_qa")),
      HudCommandBus.register("ALLOW_REACTIONS", () => runHostAction("allow_reactions")),
      HudCommandBus.register("ALLOW_VOTING", () => runHostAction("allow_voting", { eventId: roomId })),
      HudCommandBus.register("LOCK_ENTRY", () => runHostAction("lock_entry")),

      HudCommandBus.register("VOTE", () => {
        if (!liveVotingOpen) {
          setStatusLine("Voting closed");
          return false;
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("tmi:vote:focus", { detail: { roomId, battleId } }),
          );
        }
        setStatusLine("Voting open — use rubric dock");
        return true;
      }),

      HudCommandBus.register("SPECTATE_GAME", () => {
        setLocalParticipation("SPECTATOR");
        setStatusLine("Spectating");
        return true;
      }),
      HudCommandBus.register("PLAY_GAME", () => {
        setStatusLine("Game round engine not mounted for this room");
        return false;
      }),
      HudCommandBus.register("JOIN_NEXT_ROUND", () => {
        setStatusLine("Game round engine not mounted for this room");
        return false;
      }),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [
    micMuted,
    cameraOff,
    onBroadcastStateChange,
    roomId,
    isRoomOwner,
    role,
    ownership,
    battleId,
    liveVotingOpen,
    syncQueueCount,
    runHostAction,
    spotlightOn,
    audienceAudioOn,
  ]);

  // Live session timer
  useEffect(() => {
    if (broadcastState !== "LIVE") return;
    const interval = setInterval(() => setSessionSec((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [broadcastState]);

  const formatClock = (sec: number) => {
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const executeParticipationAction = (id: VenueHudActionId) => {
    const map: Partial<Record<VenueHudActionId, string>> = {
      join_queue: "JOIN_QUEUE",
      challenge_winner: "JOIN_QUEUE",
      vote: "VOTE",
      approve_next: "APPROVE_NEXT",
      reject_participant: "REJECT_PARTICIPANT",
      reorder_queue: "REORDER_QUEUE",
      bring_on_stage: "BRING_ON_STAGE",
      remove_from_stage: "REMOVE_FROM_STAGE",
      broadcast_spotlight: "BROADCAST_SPOTLIGHT",
      audience_audio: "AUDIENCE_AUDIO",
      participant_mic: "PARTICIPANT_MIC",
      audience_mute: "AUDIENCE_MUTE",
      toggle_qa: "TOGGLE_QA",
      allow_reactions: "ALLOW_REACTIONS",
      allow_voting: "ALLOW_VOTING",
      lock_entry: "LOCK_ENTRY",
      play_game: "PLAY_GAME",
      join_next_round: "JOIN_NEXT_ROUND",
      spectate_game: "SPECTATE_GAME",
    };
    const cmd = map[id];
    if (cmd) void HudCommandBus.execute(cmd);
  };

  const handleGoLive = () => {
    void HudCommandBus.execute("GO_LIVE");
  };

  const handleEndLive = () => {
    void HudCommandBus.execute("END_LIVE");
  };

  const toggleCleanStage = () => {
    setHudState((current) => (current === "CLEAN_STAGE" ? "LIVE_VISIBLE" : "CLEAN_STAGE"));
  };

  const isCleanStage = hudState === "CLEAN_STAGE";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
        overflow: "hidden",
        isolation: "isolate",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* REACTION FLOATING PARTICLE LAYER */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {activeReactions.map((r) => (
          <div
            key={r.id}
            style={{
              position: "absolute",
              bottom: "15%",
              left: `${r.x}%`,
              fontSize: 24,
              animation: "hudReactionRise 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* PERMANENT HUD RECALL CONTROL ([ ◰ HUD ] / [ ◱ HIDE HUD ]) IN TOP-RIGHT EDGE */}
      <div style={{ position: "absolute", top: 12, right: 12, pointerEvents: "auto", zIndex: 120 }}>
        <button
          type="button"
          onClick={toggleCleanStage}
          title={isCleanStage ? "Show Venue HUD" : "Hide Venue HUD (Clean Stage)"}
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${isCleanStage ? GOLD : CYAN}`,
            background: "rgba(6,6,20,0.85)",
            color: isCleanStage ? GOLD : CYAN,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: `0 0 12px ${isCleanStage ? GOLD : CYAN}44`,
          }}
        >
          <span>{isCleanStage ? "◰ SHOW HUD" : "◱ HIDE HUD"}</span>
        </button>
      </div>

      {/* PRE-LIVE CENTERED CONTROL DECK */}
      {hudState === "PRE_LIVE" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(280px, 85vw, 560px)",
            padding: "20px 24px",
            borderRadius: 20,
            border: `1.5px solid ${CYAN}66`,
            background: "rgba(8,8,24,0.92)",
            backdropFilter: "blur(16px)",
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            boxShadow: `0 0 32px ${CYAN}33`,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: CYAN }}>
              PRE-LIVE CONTROL DECK
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginTop: 2 }}>{roomTitle}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Mode: {experienceType} · Tier: {tier}
            </div>
          </div>

          {/* STATEFUL CENTER GO LIVE BUTTON */}
          <button
            type="button"
            onClick={handleGoLive}
            disabled={broadcastState === "CONNECTING"}
            style={{
              width: "100%",
              maxWidth: 240,
              height: 56,
              borderRadius: 28,
              border: `2px solid ${GREEN}`,
              background: `linear-gradient(135deg, ${GREEN}33 0%, rgba(0,255,136,0.1) 100%)`,
              color: GREEN,
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: "0.14em",
              cursor: "pointer",
              boxShadow: `0 0 24px ${GREEN}66`,
              transition: "transform 80ms ease, background 180ms ease",
            }}
          >
            {broadcastState === "CONNECTING" ? "CONNECTING..." : "▶ GO LIVE"}
          </button>

          {/* SURROUNDING SETUP QUICK CONTROLS */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => HudCommandBus.execute("TOGGLE_MIC")}
              style={iconChip(micMuted ? RED : CYAN)}
            >
              {micMuted ? "🎙 MUTE" : "🎤 MIC ACTIVE"}
            </button>

            <button
              type="button"
              onClick={() => HudCommandBus.execute("TOGGLE_CAMERA")}
              style={iconChip(cameraOff ? RED : CYAN)}
            >
              {cameraOff ? "🚫 CAM OFF" : "🎥 CAM ACTIVE"}
            </button>
          </div>

          {/* Participation Law actions — role × room (no dead no-ops) */}
          {hudActions.filter((a) =>
            [
              "join_queue",
              "challenge_winner",
              "vote",
              "approve_next",
              "reject_participant",
              "bring_on_stage",
              "remove_from_stage",
              "play_game",
              "join_next_round",
              "spectate_game",
            ].includes(a.id),
          ).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, width: "100%" }}>
              {hudActions
                .filter((a) =>
                  [
                    "join_queue",
                    "challenge_winner",
                    "vote",
                    "approve_next",
                    "reject_participant",
                    "bring_on_stage",
                    "remove_from_stage",
                    "play_game",
                    "join_next_round",
                    "spectate_game",
                  ].includes(a.id),
                )
                .map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={!action.enabled}
                    title={action.reason ?? action.label}
                    onClick={() => {
                      if (!action.enabled) {
                        setStatusLine(action.reason ?? "Unavailable");
                        return;
                      }
                      void executeParticipationAction(action.id);
                    }}
                    style={{
                      ...iconChip(action.enabled ? GOLD : "rgba(255,255,255,0.35)"),
                      opacity: action.enabled ? 1 : 0.45,
                      cursor: action.enabled ? "pointer" : "not-allowed",
                    }}
                  >
                    {action.icon} {action.label}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* LIVE PERIMETER HUD RAILS (VISIBLE WHEN LIVE & NOT CLEAN_STAGE) */}
      {broadcastState === "LIVE" && !isCleanStage && (
        <>
          {/* TOP STATUS RAIL */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 120, // Keep space for HUD recall button in top right
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              borderRadius: 14,
              border: `1px solid ${CYAN}44`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: isPreview ? GOLD : RED,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isPreview ? GOLD : RED,
                    boxShadow: `0 0 8px ${isPreview ? GOLD : RED}`,
                  }}
                />
                {isPreview ? "VENUE TEST" : "LIVE"}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: GOLD, fontFamily: "monospace" }}>
                {formatClock(sessionSec)}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{roomTitle}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 10, color: isPreview ? GOLD : CYAN, fontWeight: 800 }}>
                {isPreview && testOccupancyLabel
                  ? testOccupancyLabel
                  : `👁 ${humanViewerCount > 0 ? humanViewerCount.toLocaleString() : "—"}`}
              </span>
              <span style={{ fontSize: 10, color: FUCHSIA, fontWeight: 800 }}>
                ♥ {reactionCount.toLocaleString()}
              </span>
              {queueCount > 0 && (
                <span style={{ fontSize: 10, color: GOLD, fontWeight: 800 }}>Q {queueCount}</span>
              )}
            </div>
          </div>

          {/* LEFT CONTROL RAIL */}
          <div
            style={{
              position: "absolute",
              top: 68,
              left: 12,
              width: 46,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 8,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            <button
              type="button"
              title="Toggle Mic"
              onClick={() => HudCommandBus.execute("TOGGLE_MIC")}
              style={sideIconBtn(micMuted ? RED : CYAN)}
            >
              {micMuted ? "🎙" : "🎤"}
            </button>
            <button
              type="button"
              title="Toggle Camera"
              onClick={() => HudCommandBus.execute("TOGGLE_CAMERA")}
              style={sideIconBtn(cameraOff ? RED : CYAN)}
            >
              {cameraOff ? "🚫" : "🎥"}
            </button>
            {(isRoomOwner || role === "host" || role === "admin") && (
              <>
                <button
                  type="button"
                  title="Approve next in queue"
                  onClick={() => HudCommandBus.execute("APPROVE_NEXT")}
                  style={sideIconBtn(GREEN)}
                >
                  ✅
                </button>
                <button
                  type="button"
                  title="Reject next request"
                  onClick={() => HudCommandBus.execute("REJECT_PARTICIPANT")}
                  style={sideIconBtn(RED)}
                >
                  ⛔
                </button>
                <button
                  type="button"
                  title="Remove from stage"
                  onClick={() => HudCommandBus.execute("REMOVE_FROM_STAGE")}
                  style={sideIconBtn(FUCHSIA)}
                >
                  🚪
                </button>
                <button
                  type="button"
                  title="Spotlight"
                  onClick={() => HudCommandBus.execute("BROADCAST_SPOTLIGHT")}
                  style={sideIconBtn(spotlightOn ? GOLD : CYAN)}
                >
                  💡
                </button>
              </>
            )}
          </div>

          {/* RIGHT EXPERIENCE CONTEXT MODULE RAIL */}
          <div
            style={{
              position: "absolute",
              top: 68,
              right: 12,
              width: 160,
              padding: 10,
              borderRadius: 14,
              border: `1px solid ${CYAN}33`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 900, color: CYAN, letterSpacing: "0.12em" }}>
              {experienceType} MODULE
            </div>

            {competition && (
              <div style={{ fontSize: 10, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ color: GOLD, fontWeight: 800 }}>
                  {localParticipation === "QUEUED" || localParticipation === "READY"
                    ? myQueuePos != null
                      ? `IN QUEUE #${myQueuePos} · WATCHING`
                      : "IN QUEUE · WATCHING"
                    : localParticipation === "ON_STAGE" || localParticipation === "ACTIVE"
                      ? "ON STAGE"
                      : "SPECTATING"}
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>
                  Queue: {queueCount > 0 ? `${queueCount} waiting` : "Empty"}
                  {myQueuePos != null ? ` · you #${myQueuePos}` : ""}
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
                  Vote: {liveVotingOpen ? "Open" : "Closed"}
                </div>
              </div>
            )}

            {experienceType === "WORLD_CONCERT" && (
              <div style={{ fontSize: 10, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ color: GREEN, fontWeight: 800 }}>CONCERT MODE</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>Setlist from room runtime</div>
              </div>
            )}

            {experienceType === "WORLD_RELEASE" && (
              <div style={{ fontSize: 10, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ color: FUCHSIA, fontWeight: 800 }}>RELEASE MODE</div>
                <div style={{ fontSize: 8, color: GOLD }}>Store when catalog wired</div>
              </div>
            )}

            {experienceType === "LIVE" && (
              <div style={{ fontSize: 10, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <div>Audience Active</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>Participation: {localParticipation}</div>
              </div>
            )}

            {experienceType === "GAME_SHOW" && (
              <div style={{ fontSize: 10, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ color: GREEN, fontWeight: 800 }}>GAME MODE</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>
                  Spectate available · Play/Next round pending engine
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {hudActions
                    .filter((a) => ["spectate_game", "play_game", "join_next_round"].includes(a.id))
                    .map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        disabled={!a.enabled}
                        title={a.reason ?? a.label}
                        onClick={() => {
                          if (!a.enabled) {
                            setStatusLine(a.reason ?? "Unavailable");
                            return;
                          }
                          executeParticipationAction(a.id);
                        }}
                        style={{
                          ...iconChip(a.enabled ? GREEN : "rgba(255,255,255,0.35)"),
                          fontSize: 8,
                          padding: "4px 6px",
                          opacity: a.enabled ? 1 : 0.45,
                          cursor: a.enabled ? "pointer" : "not-allowed",
                        }}
                      >
                        {a.icon} {a.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM INTERACTION RAIL */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              right: 12,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              borderRadius: 14,
              border: `1px solid ${CYAN}44`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            {/* Reaction Trigger Bar */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {["🔥", "❤️", "👏", "💎"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => HudCommandBus.execute("EMIT_REACTION", { params: { emoji } })}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.06)",
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {emoji}
                </button>
              ))}
              {competition && (role === "performer" || role === "admin") && !isRoomOwner && (
                <button
                  type="button"
                  title="Join Queue"
                  disabled={localParticipation === "QUEUED" || localParticipation === "READY" || localParticipation === "ON_STAGE"}
                  onClick={() => HudCommandBus.execute("JOIN_QUEUE")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 14,
                    border: `1px solid ${FUCHSIA}`,
                    background: `${FUCHSIA}22`,
                    color: FUCHSIA,
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  📋 QUEUE
                </button>
              )}
              {role === "fan" && (
                <>
                <button
                  type="button"
                  title={liveVotingOpen ? "Vote" : "Voting closed"}
                  disabled={!liveVotingOpen}
                  onClick={() => HudCommandBus.execute("VOTE")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 14,
                    border: `1px solid ${liveVotingOpen ? GOLD : "rgba(255,255,255,0.2)"}`,
                    background: liveVotingOpen ? `${GOLD}22` : "rgba(255,255,255,0.04)",
                    color: liveVotingOpen ? GOLD : "rgba(255,255,255,0.35)",
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: liveVotingOpen ? "pointer" : "not-allowed",
                  }}
                >
                  🗳️ VOTE
                </button>
                <button
                  type="button"
                  title="Tip performer / DJ"
                  onClick={() => {
                    const tipUrl = `/api/stripe/checkout?priceId=price_tip&amount=500&mode=payment&type=tip&roomId=${encodeURIComponent(roomId)}&productName=${encodeURIComponent(`Tip · ${roomTitle}`)}`;
                    window.location.href = tipUrl;
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 14,
                    border: `1px solid ${FUCHSIA}`,
                    background: `${FUCHSIA}22`,
                    color: FUCHSIA,
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  💎 TIP
                </button>
                </>
              )}
              {(isRoomOwner || role === "host" || role === "admin") && (
                <>
                  {hudActions
                    .filter((a) =>
                      [
                        "reorder_queue",
                        "audience_mute",
                        "audience_audio",
                        "participant_mic",
                        "allow_reactions",
                        "allow_voting",
                        "lock_entry",
                        "toggle_qa",
                      ].includes(a.id),
                    )
                    .map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        title={a.reason ?? a.label}
                        disabled={!a.enabled}
                        onClick={() => {
                          if (!a.enabled) {
                            setStatusLine(a.reason ?? "Unavailable");
                            return;
                          }
                          executeParticipationAction(a.id);
                        }}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 14,
                          border: `1px solid ${a.enabled ? CYAN : "rgba(255,255,255,0.2)"}`,
                          background: a.enabled ? `${CYAN}18` : "rgba(255,255,255,0.04)",
                          color: a.enabled ? CYAN : "rgba(255,255,255,0.35)",
                          fontSize: 9,
                          fontWeight: 900,
                          cursor: a.enabled ? "pointer" : "not-allowed",
                          opacity: a.enabled ? 1 : 0.45,
                        }}
                      >
                        {a.icon} {a.label}
                      </button>
                    ))}
                </>
              )}
              {(localParticipation === "QUEUED" || localParticipation === "READY") && myQueuePos != null && (
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 14,
                    border: `1px solid ${GOLD}66`,
                    background: `${GOLD}14`,
                    color: GOLD,
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  📋 #{myQueuePos} · watching
                </span>
              )}
            </div>

            {/* Performer Action Button */}
            {capabilities.canEndLive && (
              <button
                type="button"
                onClick={handleEndLive}
                style={{
                  padding: "8px 16px",
                  borderRadius: 18,
                  border: `1px solid ${RED}`,
                  background: `${RED}22`,
                  color: RED,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                }}
              >
                ⏹ END LIVE
              </button>
            )}
          </div>
        </>
      )}

      {statusLine ? (
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "4px 12px",
            borderRadius: 12,
            background: "rgba(0,0,0,0.75)",
            border: `1px solid ${CYAN}66`,
            color: CYAN,
            fontSize: 10,
            fontWeight: 800,
            pointerEvents: "none",
          }}
        >
          {statusLine}
        </div>
      ) : null}
    </div>
  );
}

function iconChip(color: string): CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontSize: 10,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: "0.04em",
  };
}

function sideIconBtn(color: string): CSSProperties {
  return {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}
