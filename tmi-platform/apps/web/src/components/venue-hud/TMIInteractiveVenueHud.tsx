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

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  HudCommandBus,
  resolveHudCapabilities,
  resolveHudVisibility,
  type BroadcastState,
  type ExperienceType,
  type HudPresentationState,
  type UserRoleCapability,
} from "@/lib/venue-hud/TMIExperienceHudRuntime";
import VenueHUDParticipantRail, { type PresenceParticipant } from "./VenueHUDParticipantRail";
import VenueControlConsole, { type GoLiveQuality, type ExperienceMode } from "./VenueControlConsole";
import { resolveParticipationHudActions } from "@/lib/venue-hud/HudActionRegistry";
import {
  joinQueue as joinQueueEngine,
  getQueuePosition,
  getQueueSnapshot,
} from "@/lib/live/queueEngine";
import type { ParticipationState, VenueHudActionId } from "@/lib/live/ParticipationStateMachine";
import { directorTick } from "@/lib/live/BotQueueDirector";
import {
  closeQuickVoteFromHud,
  executeHostControl,
  openQuickVoteFromHud,
  resolveHostControlCapabilities,
} from "@/lib/live/HostRoomControlBridge";
import { resolveVotingOpen } from "@/lib/live/ParticipationVotingBridge";
import CompactVotingPanel from "@/components/voting/CompactVotingPanel";
import VenueToolsToggleButton from "@/components/hud/VenueToolsToggleButton";
import InRoomMixerPanel from "@/components/venue-hud/InRoomMixerPanel";
import VenueHudPerimeterActionDock from "@/components/venue-hud/VenueHudPerimeterActionDock";
import { ChannelMixerDirector } from "@/lib/audio/mixer";
import { ensureMixerHealthRegistered } from "@/lib/audio/mixer";
import { endInstantGoLiveSession } from "@/lib/dock/executeInstantGoLive";
import { releasePerformerLiveWrite } from "@/lib/live/liveWritePresentation";
import { clearEffect } from "@/lib/live/StageDirectorEngine";
import { presentInstantGoLiveInPlace } from "@/lib/dock/presentInstantGoLiveInPlace";
import { toggleExistingHubMediaTrack, useLivePrivacyState } from "@/lib/live/livePrivacyState";
import {
  enterComposerMode,
  submitComposer,
  type HudComposerMode,
} from "@/lib/venue-hud/HudComposerModeAuthority";
import {
  isHostResponseWindowOpen,
  submitHostResponse,
} from "@/lib/venue-hud/HostResponseRouter";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";
const RED = "#FF4466";

export interface TMIInteractiveVenueHudProps {
  /** Real room presence participants — no fake data (Rule 20) */
  roomPresence?: PresenceParticipant[];
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
  /** Tip recipient for Fan dock — performer slug/id. */
  tipArtistSlug?: string;
  /** Real performer User.id for the Fan dock's FOLLOW control — honest unavailable when missing. */
  performerUserId?: string;
  performerName?: string;
  liveSessionId?: string;
  venueId?: string;
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
  roomPresence = [],
  tipArtistSlug,
  performerUserId,
  performerName,
  liveSessionId,
  venueId,
}: TMIInteractiveVenueHudProps) {
  const [hudState, setHudState] = useState<HudPresentationState>("PRE_LIVE");
  const [broadcastState, setBroadcastState] = useState<BroadcastState>("IDLE");
  const micMuted = useLivePrivacyState((state) => !state.micPreviewActive);
  const cameraOff = useLivePrivacyState((state) => !state.cameraPreviewActive);
  const [sessionSec, setSessionSec] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [activeReactions, setActiveReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [myQueuePos, setMyQueuePos] = useState<number | null>(null);
  const [localParticipation, setLocalParticipation] = useState<ParticipationState>(participationState);
  const [liveVotingOpen, setLiveVotingOpen] = useState(votingOpen);
  const [activeVote, setActiveVote] = useState<{
    id: string;
    title?: string;
    choices: { id: string; label: string }[];
    opensAt: number;
    closesAt: number;
    allowWinnerVote: boolean;
  } | null>(null);
  const [spotlightOn, setSpotlightOn] = useState(false);
  const [audienceAudioOn, setAudienceAudioOn] = useState(true);
  const [chatInput, setChatInput] = useState("");
  // §20985-C/D — ONE composer, contextual destination. Mode set by the dock's
  // contextual action (THROW IN AN IDEA / RESPOND TO HOST). Default CHAT.
  const [composerMode, setComposerMode] = useState<HudComposerMode>("CHAT");
  const [consoleMicMuted, setConsoleMicMuted] = useState(false);
  const [consoleCameraOff, setConsoleCameraOff] = useState(false);
  const [consoleQuality, setConsoleQuality] = useState<GoLiveQuality>("720p");
  const [consoleMode, setConsoleMode] = useState<ExperienceMode>(experienceType as ExperienceMode);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [mixerFocusParticipantId, setMixerFocusParticipantId] = useState<string | null>(null);
  /** Rule 40: pin disables inactivity fade; default fades rails after idle. */
  const [keepHudOn, setKeepHudOn] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const HUD_IDLE_MS = 8000;
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const capabilities = useMemo(() => resolveHudCapabilities(role), [role]);

  const competition =
    experienceType === "BATTLE" || experienceType === "CYPHER" || experienceType === "CHALLENGE";

  const hostCaps = useMemo(() => resolveHostControlCapabilities(roomId), [roomId]);

  const syncActiveVoteFromServer = useCallback(async () => {
    try {
      const res = await fetch(`/api/votes?active=1&roomId=${encodeURIComponent(roomId)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        ok?: boolean;
        record?: {
          id: string;
          title?: string;
          choices: { id: string; label: string }[];
          opensAt: number;
          closesAt: number;
          allowWinnerVote: boolean;
        } | null;
      };
      if (data.ok && data.record) {
        setActiveVote({
          id: data.record.id,
          title: data.record.title,
          choices: data.record.choices,
          opensAt: data.record.opensAt,
          closesAt: data.record.closesAt,
          allowWinnerVote: data.record.allowWinnerVote,
        });
        setLiveVotingOpen(true);
      } else if (data.ok && !data.record) {
        setActiveVote(null);
      }
    } catch {
      // Keep last known vote state; local resolveVotingOpen still runs.
    }
  }, [roomId]);

  const syncVotingOpen = useCallback(() => {
    const resolved = resolveVotingOpen({
      roomId,
      battleId,
      propVotingOpen: votingOpen || undefined,
    });
    if (resolved.votingOpen) {
      setLiveVotingOpen(true);
    }
    void syncActiveVoteFromServer().then(() => {
      if (!resolved.votingOpen) {
        // Server active Quick Vote may still keep the panel open.
        const still = resolveVotingOpen({
          roomId,
          battleId,
          propVotingOpen: votingOpen || undefined,
        });
        if (!still.votingOpen) {
          // syncActiveVoteFromServer already set open=true if a record exists.
        }
      }
    });
  }, [roomId, battleId, votingOpen, syncActiveVoteFromServer]);

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
    ChannelMixerDirector.bindSession({
      roomId,
      liveSessionId: `live:${roomId}`,
      experienceType,
    });
    ensureMixerHealthRegistered();
    ChannelMixerDirector.syncRoster(
      roomPresence.map((p) => ({
        participantId: p.id,
        displayName: p.displayName,
        role: p.role,
        // hasRealSource omitted — LiveRoomMixerBind sets true only when a real WebRTC track attaches
      })),
    );
  }, [roomId, experienceType, roomPresence]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 720px)");
    const apply = () => setIsCompactViewport(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    setLocalParticipation(participationState);
  }, [participationState]);

  // Session continuity: if this room is already registry-published, HUD opens LIVE
  // without a second mint or fake delay (curtain/HUD toggles must not remount media).
  useEffect(() => {
    const privacy = useLivePrivacyState.getState();
    if (privacy.isLivePublished && privacy.publishedRoomId === roomId) {
      setBroadcastState("LIVE");
      setHudState("LIVE_VISIBLE");
      onBroadcastStateChange?.("LIVE");
      setStatusLine("You are LIVE!");
    }
  }, [roomId, onBroadcastStateChange]);

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
      // CANONICAL GO LIVE (Step 4 Slice 1): never fake-delay "LIVE".
      // Authority = presentInstantGoLiveInPlace → executeInstantGoLive → POST /api/live/go.
      // Continuity: reuse roomId / published session; do not remount media on HUD chrome.
      HudCommandBus.register("GO_LIVE", async () => {
        setBroadcastState("CONNECTING");
        onBroadcastStateChange?.("CONNECTING");
        setStatusLine("Publishing live session…");

        const privacy = useLivePrivacyState.getState();
        const boundRoomId =
          useGoLiveTransition.getState().inPlace?.roomId?.trim() ||
          privacy.publishedRoomId?.trim() ||
          roomId;

        if (privacy.isLivePublished && privacy.publishedRoomId === boundRoomId) {
          setBroadcastState("LIVE");
          setHudState("LIVE_VISIBLE");
          onBroadcastStateChange?.("LIVE");
          setStatusLine("You are LIVE!");
          return true;
        }

        const result = await presentInstantGoLiveInPlace({
          role: role === "fan" ? "FAN" : "PERFORMER",
          preferredExperience: "live",
          roomId: boundRoomId,
          publishSession: true,
        });

        const liveOk =
          result.ok &&
          (Boolean(result.published) || useLivePrivacyState.getState().isLivePublished);
        if (!liveOk) {
          setBroadcastState("IDLE");
          setHudState("PRE_LIVE");
          onBroadcastStateChange?.("IDLE");
          setStatusLine(result.error ?? "Go Live failed — not claiming LIVE.");
          return false;
        }

        setBroadcastState("LIVE");
        setHudState("LIVE_VISIBLE");
        onBroadcastStateChange?.("LIVE");
        setStatusLine(
          result.error
            ? `LIVE · ${result.error}`
            : `You are LIVE${result.roomId ? ` · ${result.roomId}` : ""}!`,
        );
        return true;
      }),

      HudCommandBus.register("END_LIVE", async () => {
        setBroadcastState("ENDING");
        onBroadcastStateChange?.("ENDING");
        setStatusLine("Ending live session…");

        const rid =
          useGoLiveTransition.getState().inPlace?.roomId?.trim() ||
          useLivePrivacyState.getState().publishedRoomId?.trim() ||
          roomId;
        try {
          await endInstantGoLiveSession(rid);
        } catch {
          /* still clear local HUD — registry may already be empty */
        }

        setBroadcastState("IDLE");
        setHudState("PRE_LIVE");
        onBroadcastStateChange?.("IDLE");
        setSessionSec(0);
        setStatusLine("Broadcast ended.");
        return true;
      }),

      HudCommandBus.register("TOGGLE_MIC", () => {
        if (!capabilities.canMuteAudio || !toggleExistingHubMediaTrack("audio", roomId)) {
          setStatusLine("Microphone unavailable for this session");
          return false;
        }
        setStatusLine(useLivePrivacyState.getState().micPreviewActive ? "Microphone active" : "Microphone muted");
        return true;
      }),

      HudCommandBus.register("TOGGLE_CAMERA", () => {
        if (!capabilities.canToggleCamera || !toggleExistingHubMediaTrack("video", roomId)) {
          setStatusLine("Camera unavailable for this session");
          return false;
        }
        setStatusLine(useLivePrivacyState.getState().cameraPreviewActive ? "Camera active" : "Camera off");
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
      HudCommandBus.register("ALLOW_VOTING", async () => {
        if (!isRoomOwner && role !== "host" && role !== "admin") {
          setStatusLine("Host only");
          return false;
        }
        const eventId = battleId ?? roomId;
        const choices =
          experienceType === "CYPHER"
            ? [
                { id: "fire", label: "Fire" },
                { id: "love", label: "Love It" },
              ]
            : [
                { id: "a", label: "Contestant A" },
                { id: "b", label: "Contestant B" },
              ];

        if (liveVotingOpen || activeVote) {
          runHostAction("allow_voting", {
            eventId,
            hostUserId: payloadUserId(),
          });
          const closed = await closeQuickVoteFromHud({
            roomId,
            voteId: activeVote?.id,
            eventId,
          });
          setActiveVote(null);
          setLiveVotingOpen(false);
          setStatusLine(closed.message);
          return closed.ok;
        }

        runHostAction("allow_voting", {
          eventId,
          hostUserId: payloadUserId(),
          choices,
        });
        const opened = await openQuickVoteFromHud({
          roomId,
          eventId,
          title: experienceType === "CYPHER" ? "React" : "Quick Vote",
          choices,
          allowWinnerVote: experienceType !== "CYPHER",
        });
        setStatusLine(opened.message);
        if (opened.ok) {
          setLiveVotingOpen(true);
          await syncActiveVoteFromServer();
        }
        return opened.ok;
      }),
      HudCommandBus.register("LOCK_ENTRY", () => runHostAction("lock_entry")),

      HudCommandBus.register("VOTE", () => {
        if (!liveVotingOpen && !activeVote) {
          setStatusLine("Voting closed");
          return false;
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("tmi:vote:focus", {
              detail: { roomId, battleId, voteId: activeVote?.id },
            }),
          );
        }
        setStatusLine(activeVote ? "Voting open — cast your ballot" : "Voting open");
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
    capabilities,
    micMuted,
    cameraOff,
    onBroadcastStateChange,
    roomId,
    isRoomOwner,
    role,
    ownership,
    battleId,
    liveVotingOpen,
    activeVote,
    experienceType,
    syncQueueCount,
    syncActiveVoteFromServer,
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
    setConsoleMicMuted(micMuted);
    setConsoleCameraOff(cameraOff);
    void HudCommandBus.execute("GO_LIVE");
  };

  const handleEndLive = () => {
    releasePerformerLiveWrite(isRoomOwner ? "host" : "performer");
    clearEffect();
    void HudCommandBus.execute("END_LIVE");
  };

  const toggleCleanStage = () => {
    setHudState((current) => resolveHudVisibility(current, keepHudOn, "toggle"));
  };

  // §SHOW⇄WORK — Work Mode is a retractable translucent control surface over the
  // SAME live venue. Opening/closing it changes ONLY presentation — never remounts
  // media, WebRTC, seating, queue, voting, or competition state.
  const openWorkMode = useCallback(() => {
    setHudState((current) => resolveHudVisibility(current, keepHudOn, "open-work"));
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current); // Work stays until closed
  }, [keepHudOn]);

  const backToShow = useCallback(() => {
    setHudState((current) => resolveHudVisibility(current, keepHudOn, "back-to-show"));
    bumpHudActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keepHudOn]);

  const recallHud = useCallback(() => {
    setHudState((current) => resolveHudVisibility(current, keepHudOn, "recall"));
  }, [keepHudOn]);

  const bumpHudActivity = useCallback(() => {
    setHudState((current) => resolveHudVisibility(current, keepHudOn, "activity"));
    if (keepHudOn || hudState === "PRE_LIVE") return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setHudState((current) => resolveHudVisibility(current, keepHudOn, "idle"));
    }, HUD_IDLE_MS);
  }, [keepHudOn, hudState, HUD_IDLE_MS]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setKeepHudOn(window.localStorage.getItem("tmi:keep-venue-hud-on") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (keepHudOn) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      setHudState((current) => resolveHudVisibility(current, true, "activity"));
      return;
    }
    if (hudState === "LIVE_VISIBLE") bumpHudActivity();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [keepHudOn, hudState, bumpHudActivity]);

  const toggleKeepHudOn = () => {
    setKeepHudOn((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("tmi:keep-venue-hud-on", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleSendChat = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    routeComposerMessage(msg);
    setChatInput("");
    chatInputRef.current?.focus();
  };

  /**
   * §20985-C/D route ONE composer message to its contextual destination.
   * CHAT → room chat (tmi:chat:send). IDEA → Prompt Hat pool. HOST → host
   * response queue. Never leaks host/idea text into Room Chat. Never remounts
   * media or resets room/vote state.
   */
  const routeComposerMessage = (msg: string) => {
    const state = enterComposerMode(composerMode, msg);
    const r = submitComposer({ state, fanId: performerUserId ?? "local-user" });
    if (!r.ok) return;
    if (typeof window === "undefined") return;
    if (r.destination === "ROOM_CHAT") {
      window.dispatchEvent(new CustomEvent("tmi:chat:send", { detail: { roomId, message: msg } }));
      return;
    }
    if (r.destination === "HOST_RESPONSE") {
      if (isHostResponseWindowOpen(roomId, null)) {
        submitHostResponse({
          experienceId: roomId,
          roundId: null,
          participantId: performerUserId ?? "local-user",
          text: msg,
          viaMic: false,
        });
        setStatusLine("Response sent to host");
      } else {
        setStatusLine("No host question open — kept out of chat");
      }
      return;
    }
    if (r.destination === "IDEA_POOL") {
      window.dispatchEvent(
        new CustomEvent("tmi:idea:submit", { detail: { roomId, text: msg, dimension: r.ideaDimension } }),
      );
      setStatusLine("Idea submitted");
      return;
    }
    // GAME_ANSWER / PREDICTION → route to the active experience's answer rail.
    window.dispatchEvent(new CustomEvent("tmi:composer:submit", { detail: { roomId, mode: composerMode, text: msg } }));
  };

  const isCleanStage = hudState === "CLEAN_STAGE";

  return (
    <div
      data-testid="tmi-interactive-venue-hud"
      data-keep-hud-on={keepHudOn ? "1" : "0"}
      data-hud-state={hudState}
      onPointerDown={bumpHudActivity}
      onPointerMove={bumpHudActivity}
      onKeyDown={bumpHudActivity}
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
      <div style={{ position: "absolute", top: 12, right: 12, pointerEvents: "auto", zIndex: 120, display: "flex", gap: 8, alignItems: "center" }}>
        {hudState !== "PRE_LIVE" ? (
          <button
            type="button"
            data-testid="keep-venue-hud-on"
            onClick={toggleKeepHudOn}
            title={keepHudOn ? "HUD stays visible" : "HUD fades after inactivity"}
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
              padding: "6px 8px",
              borderRadius: 8,
              border: keepHudOn ? `1px solid ${GOLD}` : "1px solid rgba(255,255,255,0.2)",
              background: keepHudOn ? "rgba(255,215,0,0.15)" : "rgba(0,0,0,0.55)",
              color: keepHudOn ? GOLD : "rgba(255,255,255,0.7)",
              cursor: "pointer",
            }}
          >
            {keepHudOn ? "KEEP HUD ON" : "AUTO-HIDE"}
          </button>
        ) : null}
        {/* §SHOW⇄WORK — enter Work Mode from Show Mode. Presentation-only; no remount. */}
        {hudState !== "PRE_LIVE" && hudState !== "WORK" ? (
          <button
            type="button"
            data-testid="hud-open-work"
            onClick={openWorkMode}
            title="Open Work Mode (controls over the live venue)"
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.08em",
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${CYAN}`,
              background: "rgba(0,255,255,0.12)",
              color: CYAN,
              cursor: "pointer",
            }}
          >
            ⚙ WORK
          </button>
        ) : null}
        {isCleanStage ? (
          <button
            type="button"
            data-testid="hud-recall"
            onClick={recallHud}
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
              padding: "6px 8px",
              borderRadius: 8,
              border: `1px solid ${CYAN}`,
              background: "rgba(0,255,255,0.12)",
              color: CYAN,
              cursor: "pointer",
            }}
          >
            ◰ HUD
          </button>
        ) : null}
        {(isRoomOwner || role === "performer") && hudState !== "PRE_LIVE" ? (
          <VenueToolsToggleButton
            accent={GREEN}
            roomId={roomId}
            role={role === "performer" ? "performer" : "fan"}
            policyContext={{ isGoLiveContext: true }}
            testId="tmi-venue-tools-venue-hud"
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 10,
              minHeight: 36,
            }}
          />
        ) : null}
        <button
          type="button"
          onClick={() => setMixerOpen((v) => !v)}
          title="In-room audio mixer"
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${mixerOpen ? GOLD : CYAN}`,
            background: "rgba(6,6,20,0.85)",
            color: mixerOpen ? GOLD : CYAN,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
          data-testid="venue-hud-audio-btn-recall"
        >
          🔊 AUDIO
        </button>
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

      {/* Mixer mounts at HUD root — available PRE_LIVE + LIVE (toggle, no navigation) */}
      <InRoomMixerPanel
        roomId={roomId}
        liveSessionId={`live:${roomId}`}
        experienceType={experienceType}
        auth={{
          userId: payloadUserId(),
          role: isRoomOwner
            ? "host"
            : role === "admin"
              ? "admin"
              : role === "host"
                ? "host"
                : role === "fan"
                  ? "fan"
                  : "performer",
          isRoomOwner,
        }}
        open={mixerOpen}
        onClose={() => {
          setMixerOpen(false);
          setMixerFocusParticipantId(null);
        }}
        focusParticipantId={mixerFocusParticipantId}
        compact={isCompactViewport}
      />

      {/* PRE-LIVE full setup console (first entry, not yet live) */}
      <AnimatePresence>
      {hudState === "PRE_LIVE" && (
        <VenueControlConsole
          roomTitle={roomTitle}
          experienceMode={consoleMode}
          onExperienceModeChange={(m) => setConsoleMode(m)}
          micMuted={consoleMicMuted}
          cameraOff={consoleCameraOff}
          quality={consoleQuality}
          onToggleMic={() => {
            setConsoleMicMuted((v) => !v);
            void HudCommandBus.execute("TOGGLE_MIC");
          }}
          onToggleCamera={() => {
            setConsoleCameraOff((v) => !v);
            void HudCommandBus.execute("TOGGLE_CAMERA");
          }}
          onQualityChange={(q) => setConsoleQuality(q)}
          isConnecting={broadcastState === "CONNECTING"}
          onGoLive={handleGoLive}
        />
      )}
      </AnimatePresence>

      {/* WORK MODE — retractable translucent control surface OVER the live venue.
          Same session/media/seating underneath; BACK TO SHOW folds it back. */}
      <AnimatePresence>
      {hudState === "WORK" && (
        <motion.div
          key="work-mode"
          data-testid="venue-hud-work-mode"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          style={{
            position: "absolute",
            inset: "6% 8%",
            borderRadius: 20,
            border: `1px solid ${CYAN}55`,
            background: "rgba(8,10,18,0.72)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            padding: 18,
            overflowY: "auto",
            pointerEvents: "auto",
            zIndex: 130,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: CYAN, letterSpacing: "0.14em" }}>
              WORK · CONTROLS
            </div>
            <button
              type="button"
              data-testid="work-back-to-show"
              onClick={backToShow}
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.1em",
                color: "#050510",
                background: CYAN,
                border: "none",
                borderRadius: 10,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              ▶ BACK TO SHOW
            </button>
          </div>
          <VenueControlConsole
            roomTitle={roomTitle}
            experienceMode={consoleMode}
            onExperienceModeChange={(m) => setConsoleMode(m)}
            micMuted={consoleMicMuted}
            cameraOff={consoleCameraOff}
            quality={consoleQuality}
            onToggleMic={() => {
              setConsoleMicMuted((v) => !v);
              void HudCommandBus.execute("TOGGLE_MIC");
            }}
            onToggleCamera={() => {
              setConsoleCameraOff((v) => !v);
              void HudCommandBus.execute("TOGGLE_CAMERA");
            }}
            onQualityChange={(q) => setConsoleQuality(q)}
            isConnecting={broadcastState === "CONNECTING"}
            onGoLive={handleGoLive}
          />
        </motion.div>
      )}
      </AnimatePresence>
      {/* LEGACY inline pre-live block — KEPT for backward compat, only shows when VenueControlConsole is not visible */}
      {false && hudState === "PRE_LIVE" && (
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

      {/* LIVE PERIMETER HUD RAILS — animated reveal from perimeter (video-reference: 1.75 sec+) */}
      <AnimatePresence>
      {broadcastState === "LIVE" && !isCleanStage && (
        <>
          {/* TOP STATUS RAIL — video-reference: x 52→1228, y 34→100, 9.2% height */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: "absolute",
              top: "4.7%",
              left: "4.1%",
              right: "calc(4.1% + 90px)", // Keep space for HUD recall button
              height: "9.2%",
              minHeight: 44,
              maxHeight: 66,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(12,14,22,0.68)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.45)",
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

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 10, color: isPreview ? GOLD : CYAN, fontWeight: 800 }}>{
                isPreview && testOccupancyLabel
                  ? testOccupancyLabel
                  : `👁 ${humanViewerCount > 0 ? humanViewerCount.toLocaleString() : "—"}`
              }</span>
              {/* Reaction counter — pulses on increment (video-reference: x ~1080–1216, y ~120–163) */}
              <motion.span
                key={reactionCount}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: 10, color: FUCHSIA, fontWeight: 800 }}
              >
                ♥ {reactionCount.toLocaleString()}
              </motion.span>
              {queueCount > 0 && (
                <span style={{ fontSize: 10, color: GOLD, fontWeight: 800 }}>Q {queueCount}</span>
              )}
            </div>
          </motion.div>

          {/* LEFT CONTROL RAIL — video-reference: x 61→118, y 118→611 */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1], delay: 0.04 }}
            style={{
              position: "absolute",
              top: "calc(4.7% + 9.2% + 12px)",
              left: "4.1%",
              width: "4.3%",
              minWidth: 44,
              maxWidth: 56,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 8,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(12,14,22,0.62)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
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
          </motion.div>

          {/* RIGHT — PARTICIPANT PRESENCE RAIL (video-reference: x 1165→1220, y 185→630) */}
          <VenueHUDParticipantRail
            participants={roomPresence}
            onParticipantTap={(p) => {
              setStatusLine(`${p.displayName} · ${p.role ?? "participant"} · mixer`);
              setMixerFocusParticipantId(p.id);
              setMixerOpen(true);
              ChannelMixerDirector.upsertParticipantChannel({
                participantId: p.id,
                displayName: p.displayName,
                role: p.role,
                hasRealSource: p.isConnected !== false,
              });
            }}
          />

          {/* RIGHT EXPERIENCE CONTEXT MODULE (compact overlay, not full rail) */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1], delay: 0.06 }}
            style={{
              position: "absolute",
              top: "calc(4.7% + 9.2% + 12px)",
              right: "calc(4.1% + 50px)", // shifted left of participant rail
              width: 130,
              padding: 10,
              borderRadius: 14,
              border: `1px solid ${CYAN}22`,
              background: "rgba(12,14,22,0.62)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
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
          </motion.div>

          {/* VOTING PANEL — floats above bottom dock when a real Quick Vote is open */}
          {liveVotingOpen && activeVote && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(4.7% + 80px)",
                left: "50%",
                transform: "translateX(-50%)",
                pointerEvents: "auto",
                zIndex: 110,
              }}
            >
              <CompactVotingPanel
                voteId={activeVote.id}
                title={activeVote.title ?? (experienceType === "CYPHER" ? "REACT" : "VOTE")}
                choices={activeVote.choices}
                opensAt={activeVote.opensAt}
                closesAt={activeVote.closesAt}
                allowWinnerVote={activeVote.allowWinnerVote}
                onVoteCast={(choiceId) => setStatusLine(`Voted \u2713 \u00b7 ${choiceId}`)}
              />
            </div>
          )}

          {/* BOTTOM DOCK — Rule 40 perimeter: flush edge, visual trays expand UP */}
          <VenueHudPerimeterActionDock
            roomId={roomId}
            role={
              role === "performer" || role === "host" || role === "admin"
                ? role
                : "fan"
            }
            tipArtistSlug={tipArtistSlug}
            performerUserId={performerUserId}
            performerName={performerName}
            liveSessionId={liveSessionId}
            venueId={venueId ?? roomId}
            performerId={isRoomOwner ? "host" : undefined}
            onStatus={setStatusLine}
            onToggleHud={toggleCleanStage}
            onActivity={bumpHudActivity}
            composerMode={composerMode}
            onComposerModeChange={(m) => setComposerMode(m)}
            onSendChat={(msg) => {
              setChatInput(msg);
              routeComposerMessage(msg);
              setChatInput("");
            }}
          />
        </>
      )}
      </AnimatePresence>

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
