"use client";

/**
 * PeerVideoCallOverlay — Fan/Performer accepted-call media surface.
 * Reuses useObservatoryPeerCall (same WebRTC authority as Observatory).
 * Rule 35: floating sibling overlay — does not remount Hub monitors.
 * On accept/outgoing: places remote into first free canonical frame (M1 a–d, then M2 e–h).
 * Does NOT convert ObservatoryVideoCallPanel into a public admin surface.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useObservatoryPeerCall } from "@/hooks/useObservatoryPeerCall";
import {
  type FrameId,
  useCanonicalMediaPlayerRuntime,
} from "@/lib/media/canonicalMediaPlayerRuntime";
import { allocatePeerCallFrameFromRuntime } from "@/lib/media/peerCallPanelAllocator";
import {
  useAdaptiveVoltronStore,
  type DualPresenceChoice,
  type SocialCinemaMode,
  type VoltronCompositionFamily,
} from "@/lib/monitors/AdaptiveVoltronPresentationDirector";
import { syncVoltronAutoComposition } from "@/lib/monitors/VoltronAutomaticCompositionBridge";
import { useFloatingNotepadStore } from "@/lib/notes/floatingNotepadStore";
import { useTeleprompterStore } from "@/lib/teleprompter/teleprompterStore";
import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";
import { monitorMixController } from "@/lib/audio/mixer/MonitorMixGraph";
import {
  useScopedJukeboxNetworkStore,
  type JukeboxDjPermissionMode,
} from "@/lib/jukebox/JukeboxRoomBroadcastPolicy";

type CallSession = {
  callId: string;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  status: string;
};

type AcceptDetail = {
  callId?: string;
  frameId?: FrameId;
  bank?: "MONITOR_1" | "MONITOR_2";
};

const CINEMA_MODES: { id: SocialCinemaMode; label: string; icon: string }[] = [
  { id: "HANGOUT", label: "HANGOUT", icon: "💬" },
  { id: "CONCERT", label: "CONCERT", icon: "🎸" },
  { id: "AVATAR_LOBBY", label: "AVATAR", icon: "🕺" },
  { id: "STUDIO", label: "STUDIO", icon: "🎛️" },
];

const COMPOSITIONS: { id: VoltronCompositionFamily; label: string }[] = [
  { id: "LEFT_RIGHT", label: "SPLIT" },
  { id: "PRIMARY_PLUS_STRIP", label: "STRIP" },
  { id: "FOCUS_PLUS_FRIENDS", label: "FOCUS" },
  { id: "GRID_4", label: "GRID 4" },
  { id: "GRID_8", label: "8+8" },
  { id: "CINEMA_THEATER", label: "THEATER" },
  { id: "CORNER_PIP", label: "PIP" },
];

const PRESENCE_CHOICES: { id: DualPresenceChoice; label: string; icon: string }[] = [
  { id: "AVATAR_PLUS_CAMERA", label: "AVATAR + CAM", icon: "🧑‍🎤📷" },
  { id: "AVATAR_ONLY", label: "AVATAR ONLY", icon: "🧑‍🎤" },
  { id: "CAMERA_ONLY", label: "CAM ONLY", icon: "📷" },
  { id: "AUDIO_ONLY", label: "VOICE ONLY", icon: "🎙️" },
];

const QUICK_REACTIONS = [
  { emoji: "👏", label: "APPLAUSE" },
  { emoji: "🔥", label: "FIRE" },
  { emoji: "💎", label: "DIAMOND" },
  { emoji: "🎶", label: "VIBES" },
] as const;

export default function PeerVideoCallOverlay() {
  const [open, setOpen] = useState(false);
  const [meId, setMeId] = useState("");
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [callFrameId, setCallFrameId] = useState<FrameId | null>(null);
  const [studioExpanded, setStudioExpanded] = useState(true);
  const [jukeboxPanelOpen, setJukeboxPanelOpen] = useState(false);
  const [screenSharePrivacyPrompt, setScreenSharePrivacyPrompt] = useState(false);
  const [localScreenShareActive, setLocalScreenShareActive] = useState(false);
  const [showVolume, setShowVolume] = useState(0.85);
  const [callVolume, setCallVolume] = useState(0.95);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const callFrameRef = useRef<FrameId | null>(null);

  const notepadOpen = useFloatingNotepadStore((s) => s.open);
  const toggleNotepad = useFloatingNotepadStore((s) => s.togglePad);
  const teleprompterMode = useTeleprompterStore((s) => s.presentationMode);
  const setTeleprompterMode = useTeleprompterStore((s) => s.setPresentationMode);

  const {
    privateGroupMedia,
    joinedPrivateListening,
    localPrivateMusicMuted,
    privateMusicVolume,
    roomJukeboxVolume,
    concertPriorityBehavior,
    triggerScopedPlaybackAction,
    enqueueAuthorizedTrack,
    voteQueueTrack,
    setDjPermissionMode,
    setJoinedPrivateListening,
    setLocalPrivateMusicMuted,
    setScopeVolume,
    setConcertPriorityBehavior,
  } = useScopedJukeboxNetworkStore();
  const activeJukeboxTrack =
    privateGroupMedia.queue[privateGroupMedia.activeTrackIndex] ?? privateGroupMedia.queue[0];

  const {
    monitorMode,
    setMonitorMode,
    composition,
    setComposition,
    panels,
    friends,
    socialCinemaMode,
    setSocialCinemaMode,
    motionPreference,
    setMotionPreference,
    allowAmbientPanelMovement,
    setAllowAmbientPanelMovement,
    activeTransitionEffect,
    selfPresenceChoice,
    setSelfPresenceChoice,
    audienceModeActive,
    setAudienceModeActive,
    audienceCameraViewpoint,
    setAudienceCameraViewpoint,
    floatingHeadPanelsVisibleInShow,
    setFloatingHeadPanelsVisibleInShow,
    showCallAudioDucking,
    setShowCallAudioDucking,
    pendingExperienceInvite,
    proposeGroupExperienceInvite,
    respondGroupExperienceInvite,
    sitTogetherAssignment,
    requestSitTogether,
    recentReactions,
    sendSocialReaction,
    reactionsVisible,
    setReactionsVisible,
    moveCallToMonitor,
    shuffleDirectorViewpoints,
  } = useAdaptiveVoltronStore();

  const capacitySummary = useMemo(() => {
    const m1Used = panels.filter((p) => p.monitorId === "MONITOR_1" && p.occupancy !== "AVAILABLE").length;
    const m2Used = panels.filter((p) => p.monitorId === "MONITOR_2" && p.occupancy !== "AVAILABLE").length;
    return {
      m1Used,
      m2Used,
      totalUsed: m1Used + m2Used,
    };
  }, [panels]);

  const mediaActive =
    !!activeCall &&
    (activeCall.status === "accepted" ||
      activeCall.status === "connected" ||
      activeCall.status === "ringing");

  const { phase, error, localStream, remoteStream } = useObservatoryPeerCall({
    callId: activeCall?.callId ?? null,
    peerId: meId || "anon",
    isCaller,
    active:
      mediaActive &&
      (activeCall?.status === "accepted" || activeCall?.status === "connected"),
  });
  const setPeerCallStream = useCanonicalMediaPlayerRuntime((s) => s.setPeerCallStream);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    const frameId = callFrameRef.current;
    if (!frameId) return;
    setPeerCallStream(frameId, remoteStream);
  }, [remoteStream, setPeerCallStream]);

  useEffect(
    () => () => {
      const frameId = callFrameRef.current;
      if (frameId) {
        useCanonicalMediaPlayerRuntime.getState().setPeerCallStream(frameId, null);
      }
    },
    [],
  );

  const resolveFrame = useCallback((preferred?: FrameId | null): FrameId | null => {
    if (preferred) return preferred;
    const placement = allocatePeerCallFrameFromRuntime();
    if (placement.status === "ASSIGNED") return placement.frameId;
    return null;
  }, []);

  const clearFrame = useCallback(() => {
    const frameId = callFrameRef.current;
    if (frameId) {
      useCanonicalMediaPlayerRuntime.getState().setPeerCallStream(frameId, null);
    }
    callFrameRef.current = null;
    setCallFrameId(null);
  }, []);

  const bindCall = useCallback(
    async (callId: string, preferCaller?: boolean, preferredFrame?: FrameId | null) => {
      try {
        const frameId = resolveFrame(preferredFrame);
        if (!frameId) {
          setNote(
            "All media panels are occupied. Free a panel — we will not replace your show automatically.",
          );
          setOpen(true);
          return;
        }
        callFrameRef.current = frameId;
        setCallFrameId(frameId);

        const res = await fetch(
          `/api/admin/observatory-call?callId=${encodeURIComponent(callId)}`,
          { credentials: "include", cache: "no-store" },
        );
        if (!res.ok) {
          setNote("Could not load call.");
          return;
        }
        const data = (await res.json()) as { call?: CallSession };
        if (!data.call) {
          setNote("Call not found.");
          return;
        }
        const meRes = await fetch("/api/admin/observatory-call", {
          credentials: "include",
          cache: "no-store",
        });
        let uid = meId;
        if (meRes.ok) {
          const meData = (await meRes.json()) as { me?: { userId?: string } };
          if (meData.me?.userId) {
            uid = meData.me.userId;
            setMeId(uid);
          }
        }
        setActiveCall(data.call);
        setIsCaller(
          preferCaller === true
            ? true
            : preferCaller === false
              ? false
              : data.call.callerId === uid,
        );
        const peerName = data.call.callerId === uid ? data.call.calleeName : data.call.callerName;
        const peerUid = data.call.callerId === uid ? data.call.calleeId : data.call.callerId;
        const prevFriends = useAdaptiveVoltronStore.getState().friends.length;
        useAdaptiveVoltronStore.getState().allocateCall(data.call.callId, {
          id: peerUid || data.call.callId,
          displayName: peerName || "Friend",
        });
        syncVoltronAutoComposition({
          event: "FRIEND_CALL_ACCEPTED",
          previousFriendCount: prevFriends,
        });
        setOpen(true);
        setNote(
          data.call.status === "accepted" || data.call.status === "connected"
            ? "Connecting…"
            : "Waiting for peer…",
        );
      } catch {
        setNote("Network error loading call.");
      }
    },
    [meId, resolveFrame],
  );

  useEffect(() => {
    const onAccept = (ev: Event) => {
      const detail = (ev as CustomEvent<AcceptDetail>).detail;
      if (detail?.callId) void bindCall(detail.callId, false, detail.frameId ?? null);
    };
    const onOutgoing = (ev: Event) => {
      const detail = (ev as CustomEvent<{ callId?: string }>).detail;
      if (detail?.callId) void bindCall(detail.callId, true, null);
    };
    window.addEventListener("tmi:observatory-call-accept", onAccept);
    window.addEventListener("tmi:peer-call-outgoing", onOutgoing);
    return () => {
      window.removeEventListener("tmi:observatory-call-accept", onAccept);
      window.removeEventListener("tmi:peer-call-outgoing", onOutgoing);
    };
  }, [bindCall]);

  useEffect(() => {
    if (phase === "connected") {
      setNote("Connected");
    } else if (
      phase === "getting_media" ||
      phase === "signaling"
    ) {
      setNote("Connecting…");
    }
  }, [phase]);

  function handleShowVolumeChange(nextVal: number) {
    const clamped = Math.max(0, Math.min(1, nextVal));
    setShowVolume(clamped);
    monitorMixController.setMonitorGain("MONITOR_1", clamped);
  }

  function handleCallVolumeChange(nextVal: number) {
    const clamped = Math.max(0, Math.min(1, nextVal));
    setCallVolume(clamped);
    monitorMixController.setMonitorGain("MONITOR_2", clamped);
  }

  function toggleAudioDucking() {
    const next = !showCallAudioDucking;
    setShowCallAudioDucking(next);
    const duckedShow = next ? Math.min(showVolume, 0.45) : 0.85;
    setShowVolume(duckedShow);
    monitorMixController.setMonitorGain("MONITOR_1", duckedShow);
  }

  function reassignCallFrameToMonitor(targetMonitor: "MONITOR_1" | "MONITOR_2") {
    moveCallToMonitor(targetMonitor);
    const currentStream = remoteStream;
    const prevFrame = callFrameRef.current;
    const nextFrame: FrameId = targetMonitor === "MONITOR_1" ? "b" : "e";
    if (prevFrame && prevFrame !== nextFrame) {
      setPeerCallStream(prevFrame, null);
    }
    callFrameRef.current = nextFrame;
    setCallFrameId(nextFrame);
    if (currentStream) {
      setPeerCallStream(nextFrame, currentStream);
    }
  }

  function confirmStartScreenShare() {
    setScreenSharePrivacyPrompt(false);
    setLocalScreenShareActive(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tmi:performer-share-screen"));
    }
  }

  async function endCall() {
    if (activeCall) {
      await fetch("/api/admin/observatory-call", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          callId: activeCall.callId,
          status: "ended",
        }),
      }).catch(() => {});
    }
    const prevFriends = useAdaptiveVoltronStore.getState().friends.length;
    useAdaptiveVoltronStore.getState().endCall();
    syncVoltronAutoComposition({
      event: "ALL_CALLS_ENDED",
      previousFriendCount: prevFriends,
    });
    setActiveCall(null);
    clearFrame();
    setOpen(false);
    setNote(null);
    setScreenSharePrivacyPrompt(false);
    setLocalScreenShareActive(false);
  }

  if (!open) return null;

  const frameLabel = callFrameId ? callFrameId.toUpperCase() : "—";

  return (
    <div
      data-testid="peer-video-call-overlay"
      data-peer-call-phase={phase}
      data-peer-call-frame={callFrameId ?? undefined}
      data-social-cinema-mode={socialCinemaMode}
      data-voltron-composition={composition}
      data-transition-effect={activeTransitionEffect}
      data-presence-choice={selfPresenceChoice}
      data-audience-mode={audienceModeActive ? "1" : "0"}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 12000,
        width: "min(390px, calc(100vw - 24px))",
        maxHeight: "calc(100dvh - 32px)",
        overflowY: "auto",
        background: "rgba(5,5,16,0.96)",
        border: "1px solid rgba(0,255,255,0.42)",
        borderRadius: 14,
        boxShadow: "0 16px 48px rgba(0,0,0,0.72), 0 0 22px rgba(0,255,255,0.16)",
        color: "#fff",
      }}
    >
      {/* Top Header: Social Cinema Title + 8+8 Capacity + End Call */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
          color: "#00FFFF",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span>SOCIAL CINEMA · PANEL {frameLabel}</span>
          <span
            data-testid="call-8x8-capacity-badge"
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: "#FFD700",
              background: "rgba(255,215,0,0.12)",
              border: "1px solid rgba(255,215,0,0.35)",
              borderRadius: 4,
              padding: "1px 5px",
            }}
            title="8 viewpoints on Monitor 1 + 8 viewpoints on Monitor 2 (16 max)"
          >
            M1 {capacitySummary.m1Used}/8 · M2 {capacitySummary.m2Used}/8
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <button
            type="button"
            data-testid="peer-video-call-studio-toggle"
            onClick={() => setStudioExpanded((v) => !v)}
            style={chipBtn(studioExpanded, "#00FFFF")}
            title="Toggle Social Cinema Studio & Tool Deck"
          >
            {studioExpanded ? "STUDIO ▲" : "STUDIO ▼"}
          </button>
          <button
            type="button"
            onClick={() => void endCall()}
            data-testid="peer-video-call-end"
            style={{
              fontSize: 10,
              fontWeight: 800,
              background: "rgba(255,45,170,0.2)",
              border: "1px solid rgba(255,45,170,0.5)",
              color: "#FF2DAA",
              borderRadius: 6,
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            END
          </button>
        </div>
      </div>

      {/* Video Preview Row (Never remounted during layout/mode animations) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: 8 }}>
        <div style={{ position: "relative" }}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            data-testid="peer-video-local"
            style={{
              width: "100%",
              aspectRatio: "4/3",
              background: "#111",
              borderRadius: 8,
              objectFit: "cover",
              border: "1px solid rgba(0,255,255,0.28)",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: 6,
              bottom: 6,
              fontSize: 7.5,
              fontWeight: 900,
              background: "rgba(0,0,0,0.72)",
              color: "#00FFFF",
              padding: "2px 5px",
              borderRadius: 4,
              letterSpacing: "0.06em",
            }}
          >
            YOU · {selfPresenceChoice.replace(/_/g, " ")}
          </span>
        </div>
        <div
          data-testid="peer-video-remote-monitor-target"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            aspectRatio: "4/3",
            background: "radial-gradient(circle at 50% 35%, rgba(0,255,255,0.12), #0c0d1f 80%)",
            borderRadius: 8,
            border: "1px solid rgba(170,45,255,0.35)",
            color: "rgba(255,255,255,0.78)",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textAlign: "center",
            padding: 6,
            gap: 4,
          }}
        >
          <span>REMOTE · MONITOR {frameLabel}</span>
          <span style={{ fontSize: 7.5, color: "#00FF88" }}>
            {activeTransitionEffect !== "NONE" ? `FX: ${activeTransitionEffect}` : "VOLTRON LIVE"}
          </span>
          {friends.length > 0 ? (
            <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.5)" }}>
              {friends.length} {friends.length === 1 ? "friend" : "friends"} in call
            </span>
          ) : null}
        </div>
      </div>

      {/* Floating Tool Deck (Reuses canonical Notes, Teleprompter, Promote, Chat, Screen Share) */}
      <div
        data-testid="call-floating-tool-deck"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 5,
          padding: "6px 8px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,12,28,0.85)",
        }}
      >
        <button
          type="button"
          data-testid="call-tool-notes"
          onClick={() => toggleNotepad()}
          style={chipBtn(notepadOpen, "#FFD700")}
          title="Open Floating Notepad over the call without interrupting video"
        >
          📝 NOTES
        </button>
        <button
          type="button"
          data-testid="call-tool-teleprompter"
          onClick={() => {
            setTeleprompterMode(teleprompterMode === "OFF" ? "PAD" : "OFF");
            window.dispatchEvent(new CustomEvent("tmi:open-teleprompter"));
          }}
          style={chipBtn(teleprompterMode !== "OFF", "#FFD700")}
          title="Toggle private Teleprompter in call"
        >
          📜 PROMPTER
        </button>
        <button
          type="button"
          data-testid="call-tool-promote"
          onClick={() => window.dispatchEvent(new CustomEvent("tmi:hub-promote-toggle"))}
          style={chipBtn(false, "#FFD700")}
          title="Open Hub Promote panel"
        >
          📣 PROMOTE
        </button>
        <button
          type="button"
          data-testid="call-tool-chat"
          onClick={() => presentCanonicalWorkspace("messaging", "DRAWER")}
          style={chipBtn(false, "#00FFFF")}
          title="Open Messaging / DM drawer alongside the call"
        >
          💬 CHAT
        </button>
        <button
          type="button"
          data-testid="call-tool-screen-share"
          onClick={() => setScreenSharePrivacyPrompt((v) => !v)}
          style={chipBtn(localScreenShareActive || screenSharePrivacyPrompt, "#00FF88")}
          title="Share screen to monitor (with privacy confirmation)"
        >
          🖥️ {localScreenShareActive ? "SHARING (LOCAL)" : "SHARE SCREEN"}
        </button>
        <button
          type="button"
          data-testid="call-tool-jukebox"
          onClick={() => setJukeboxPanelOpen((v) => !v)}
          style={chipBtn(jukeboxPanelOpen || privateGroupMedia.playing, "#FF2DAA")}
          title="Open Private Call Jukebox Network (shared group listening without affecting lobby/lounge jukebox)"
        >
          📻 {privateGroupMedia.playing ? "JUKEBOX • PLAYING" : "JUKEBOX"}
        </button>
      </div>

      {/* Compact Mobile & Quick-Access Jukebox Bar (Always accessible in call) */}
      <div
        data-testid="call-jukebox-compact-bar"
        data-audio-scope="PRIVATE_GROUP_MEDIA"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          padding: "5px 8px",
          borderTop: "1px solid rgba(255,45,170,0.22)",
          background: "rgba(255,45,170,0.08)",
          fontSize: 8.5,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
          <span style={{ color: "#FF2DAA", fontWeight: 900 }}>
            {activeJukeboxTrack?.jukeboxCode ?? "#001"}
          </span>
          <span
            style={{
              color: "#fff",
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 135,
            }}
          >
            {joinedPrivateListening
              ? activeJukeboxTrack?.title ?? "Jukebox Ready"
              : "Left Shared Listening (In Call)"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            data-testid="call-jukebox-play-pause"
            onClick={() =>
              triggerScopedPlaybackAction({
                targetScope: "PRIVATE_GROUP_MEDIA",
                entryPoint: "IN_CALL_JUKEBOX_TOOLBAR",
                roomKind: "PRIVATE_ROOM",
                role: "HOST",
                isCallParticipant: true,
                action: "TOGGLE",
              })
            }
            style={chipBtn(privateGroupMedia.playing, "#00FF88")}
            title="Play or pause synchronized private call music"
          >
            {privateGroupMedia.playing ? "⏸" : "▶"}
          </button>
          <button
            type="button"
            data-testid="call-jukebox-next"
            onClick={() =>
              triggerScopedPlaybackAction({
                targetScope: "PRIVATE_GROUP_MEDIA",
                entryPoint: "IN_CALL_JUKEBOX_TOOLBAR",
                roomKind: "PRIVATE_ROOM",
                role: "HOST",
                isCallParticipant: true,
                action: "NEXT",
              })
            }
            style={chipBtn(false, "#00FFFF")}
            title="Skip to next queued track"
          >
            ⏭
          </button>
          <button
            type="button"
            data-testid="call-jukebox-local-mute"
            onClick={() => setLocalPrivateMusicMuted(!localPrivateMusicMuted)}
            style={chipBtn(localPrivateMusicMuted, "#FFD700")}
            title="Mute shared music locally for yourself without affecting other call participants"
          >
            {localPrivateMusicMuted ? "🔇 MUTED" : "🔊 MUSIC"}
          </button>
          <button
            type="button"
            data-testid="call-jukebox-toggle-membership"
            onClick={() => setJoinedPrivateListening(!joinedPrivateListening)}
            style={chipBtn(!joinedPrivateListening, "#AA2DFF")}
            title="Leave or rejoin shared listening without disconnecting from the video call"
          >
            {joinedPrivateListening ? "LEAVE MUSIC" : "JOIN MUSIC"}
          </button>
        </div>
      </div>

      {/* Expandable Private Call Jukebox Panel (Shared Queue, Now Playing & DJ Permissions) */}
      {jukeboxPanelOpen ? (
        <div
          data-testid="call-jukebox-panel"
          data-audio-scope="PRIVATE_GROUP_MEDIA"
          style={{
            margin: "6px 8px",
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,45,170,0.45)",
            background: "rgba(18,8,28,0.92)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 8.5,
          }}
        >
          <div
            data-testid="call-jukebox-scope-badge"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#FF2DAA",
              fontWeight: 900,
              letterSpacing: "0.06em",
            }}
          >
            <span>📻 PRIVATE CALL JUKEBOX · PRIVATE_GROUP_MEDIA</span>
            <span style={{ color: "#00FF88", fontSize: 7.5 }}>
              ISOLATED TO CALL (NO LOBBY/LOUNGE LEAK)
            </span>
          </div>

          <div
            style={{
              padding: "6px 8px",
              borderRadius: 7,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, color: "#fff", fontSize: 9.5 }}>
                {activeJukeboxTrack?.jukeboxCode} · {activeJukeboxTrack?.title}
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 8 }}>
                {activeJukeboxTrack?.creator} · {activeJukeboxTrack?.deliveryMode.replace(/_/g, " ")}
              </div>
            </div>
            <button
              type="button"
              data-testid="call-jukebox-concert-priority-toggle"
              onClick={() =>
                setConcertPriorityBehavior(concertPriorityBehavior === "DUCK" ? "PAUSE" : "DUCK")
              }
              style={chipBtn(true, "#FFD700")}
              title="When entering a live concert, automatically duck or pause private call music"
            >
              CONCERT: AUTO-{concertPriorityBehavior}
            </button>
          </div>

          {/* DJ Permissions */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>DJ MODE:</span>
            {(
              [
                { id: "HOST_ONLY", label: "HOST ONLY" },
                { id: "COLLABORATIVE_QUEUE", label: "COLLAB QUEUE" },
                { id: "ROTATING_DJ", label: "ROTATING DJ" },
                { id: "VOTE_NEXT", label: "VOTE NEXT" },
              ] as { id: JukeboxDjPermissionMode; label: string }[]
            ).map((dj) => (
              <button
                key={dj.id}
                type="button"
                data-testid={`call-jukebox-dj-mode-${dj.id}`}
                onClick={() => setDjPermissionMode("PRIVATE_GROUP_MEDIA", dj.id)}
                style={chipBtn(privateGroupMedia.djPermissionMode === dj.id, "#00FFFF")}
              >
                {dj.label}
              </button>
            ))}
          </div>

          {/* Shared Queue */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 800 }}>
                SHARED CALL QUEUE ({privateGroupMedia.queue.length})
              </span>
              <button
                type="button"
                data-testid="call-jukebox-add-track"
                onClick={() =>
                  enqueueAuthorizedTrack({
                    targetScope: "PRIVATE_GROUP_MEDIA",
                    entryPoint: "IN_CALL_JUKEBOX_TOOLBAR",
                    roomKind: "PRIVATE_ROOM",
                    role: "HOST",
                    isCallParticipant: true,
                    title: `Friend Pick #${privateGroupMedia.queue.length + 1}`,
                    creator: "TMI Authorized Catalog",
                    mediaType: "SONG",
                    origin: "TMI_OWNED_CATALOG",
                  })
                }
                style={chipBtn(false, "#00FF88")}
              >
                + ADD TRACK TO CALL QUEUE
              </button>
            </div>
            {privateGroupMedia.queue.map((item, idx) => (
              <div
                key={item.mediaId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 6px",
                  borderRadius: 5,
                  background:
                    idx === privateGroupMedia.activeTrackIndex
                      ? "rgba(0,255,255,0.14)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    idx === privateGroupMedia.activeTrackIndex
                      ? "1px solid rgba(0,255,255,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    triggerScopedPlaybackAction({
                      targetScope: "PRIVATE_GROUP_MEDIA",
                      entryPoint: "IN_CALL_JUKEBOX_TOOLBAR",
                      roomKind: "PRIVATE_ROOM",
                      role: "HOST",
                      isCallParticipant: true,
                      action: "PLAY",
                      selectIndex: idx,
                    })
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 8,
                    fontWeight: 800,
                  }}
                >
                  {item.jukeboxCode} · {item.title} ({item.creator})
                </button>
                <button
                  type="button"
                  data-testid={`call-jukebox-vote-${item.jukeboxNumber}`}
                  onClick={() => voteQueueTrack("PRIVATE_GROUP_MEDIA", item.mediaId)}
                  style={chipBtn(false, "#FFD700")}
                >
                  ▲ {item.votes}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Screen-Share Privacy Gate & Honest Transport Disclosure */}
      {screenSharePrivacyPrompt ? (
        <div
          data-testid="call-screen-share-privacy-warning"
          style={{
            margin: "6px 8px",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,215,0,0.55)",
            background: "rgba(255,215,0,0.1)",
            fontSize: 9,
            lineHeight: 1.4,
            color: "#FFD700",
          }}
        >
          <div style={{ fontWeight: 900, letterSpacing: "0.06em" }}>
            ⚠️ SCREEN SHARE PRIVACY WARNING
          </div>
          <div style={{ color: "rgba(255,255,255,0.82)", marginTop: 3 }}>
            Everything on your selected window/screen will be captured onto your local TMI Monitor.
            Remote peer-call screen-track transmission is gated on Claude&apos;s Daily SFU screen track binding.
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button
              type="button"
              data-testid="call-screen-share-confirm"
              onClick={confirmStartScreenShare}
              style={chipBtn(true, "#00FF88")}
            >
              CONFIRM &amp; PICK WINDOW
            </button>
            <button
              type="button"
              data-testid="call-screen-share-cancel"
              onClick={() => setScreenSharePrivacyPrompt(false)}
              style={chipBtn(false, "#ff4d6d")}
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : null}

      {studioExpanded ? (
        <div
          data-testid="social-cinema-director-deck"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "8px 10px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: 9,
          }}
        >
          {/* 1. Interactive Voltron Mode Planner */}
          <div>
            <div style={secHeader}>VOLTRON EXPERIENCE MODE (LIVING FRAMES)</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
              {CINEMA_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  data-testid={`call-cinema-mode-${m.id}`}
                  onClick={() => setSocialCinemaMode(m.id)}
                  style={chipBtn(socialCinemaMode === m.id, "#00FFFF")}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Live Director Mode & Monitor Reassignment */}
          <div>
            <div style={secHeader}>LIVE DIRECTOR · LAYOUT &amp; MONITOR ROUTING</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
              {COMPOSITIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  data-testid={`call-layout-${c.id}`}
                  onClick={() => setComposition(c.id)}
                  style={chipBtn(composition === c.id, "#AA2DFF")}
                >
                  {c.label}
                </button>
              ))}
              <button
                type="button"
                data-testid="call-director-shuffle"
                onClick={() => shuffleDirectorViewpoints()}
                style={chipBtn(false, "#00E5FF")}
                title="Smoothly rotate participant viewpoints without disconnecting media"
              >
                🔀 SHUFFLE
              </button>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5, alignItems: "center" }}>
              <button
                type="button"
                data-testid="call-move-to-m1"
                onClick={() => reassignCallFrameToMonitor("MONITOR_1")}
                style={chipBtn(callFrameId ? ["a", "b", "c", "d"].includes(callFrameId) : false, "#00FFFF")}
              >
                → MONITOR 1 (1–8)
              </button>
              <button
                type="button"
                data-testid="call-move-to-m2"
                onClick={() => reassignCallFrameToMonitor("MONITOR_2")}
                style={chipBtn(callFrameId ? ["e", "f", "g", "h"].includes(callFrameId) : false, "#00FFFF")}
              >
                → MONITOR 2 (9–16)
              </button>
              <button
                type="button"
                data-testid="call-toggle-dual-monitors"
                onClick={() => setMonitorMode(monitorMode === "SINGLE" ? "DUAL" : "SINGLE")}
                style={chipBtn(monitorMode === "DUAL", "#FFD700")}
              >
                {monitorMode === "DUAL" ? "DUAL 8+8 ON" : "1-MON MOBILE"}
              </button>
            </div>
          </div>

          {/* 3. Dual Presence & Concert Audience Mode */}
          <div>
            <div style={secHeader}>DUAL PRESENCE · AVATAR + REAL FACE + VOICE</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
              {PRESENCE_CHOICES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  data-testid={`call-presence-${p.id}`}
                  onClick={() => setSelfPresenceChoice(p.id)}
                  style={chipBtn(selfPresenceChoice === p.id, "#00FF88")}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5, alignItems: "center" }}>
              <button
                type="button"
                data-testid="call-audience-mode-toggle"
                onClick={() => setAudienceModeActive(!audienceModeActive)}
                style={chipBtn(audienceModeActive, "#FF2DAA")}
                title="Switch from floating video tiles to seated concert Audience Mode"
              >
                🪑 {audienceModeActive ? "AUDIENCE MODE: SEATED" : "ENTER AUDIENCE MODE"}
              </button>
              <button
                type="button"
                data-testid="call-sit-together-btn"
                onClick={() => requestSitTogether("main-auditorium", "Row B · Friends Section")}
                style={chipBtn(Boolean(sitTogetherAssignment), "#FFD700")}
                title="Request adjacent audience seats for your call group"
              >
                🤝 SIT TOGETHER
              </button>
              <button
                type="button"
                data-testid="call-camera-viewpoint-toggle"
                onClick={() =>
                  setAudienceCameraViewpoint(
                    audienceCameraViewpoint === "FIRST_PERSON" ? "THIRD_PERSON" : "FIRST_PERSON",
                  )
                }
                style={chipBtn(audienceCameraViewpoint === "FIRST_PERSON", "#00FFFF")}
              >
                🎥 {audienceCameraViewpoint === "FIRST_PERSON" ? "1ST PERSON POV" : "3RD PERSON POV"}
              </button>
              <button
                type="button"
                data-testid="call-head-panels-visibility"
                onClick={() => setFloatingHeadPanelsVisibleInShow(!floatingHeadPanelsVisibleInShow)}
                style={chipBtn(floatingHeadPanelsVisibleInShow, "#AA2DFF")}
                title="Auto-shrink or hide floating head video panels during performance so the stage is never obstructed"
              >
                {floatingHeadPanelsVisibleInShow ? "HEAD CAMS: SHOWN" : "HEAD CAMS: STAGE SAFE"}
              </button>
            </div>
            {sitTogetherAssignment ? (
              <div
                data-testid="call-sit-together-status"
                style={{ marginTop: 4, fontSize: 8, color: "#FFD700" }}
              >
                Seated Together: {sitTogetherAssignment.sectionLabel} (
                {Object.values(sitTogetherAssignment.seatIdsByParticipant).join(", ")})
              </div>
            ) : null}
          </div>

          {/* 4. Independent Show, Call, Private Jukebox & Room Jukebox Audio Mix */}
          <div>
            <div style={secHeader}>4-SCOPE INDEPENDENT AUDIO MIX &amp; DUCKING</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                <span style={{ fontSize: 8, color: "#00FFFF", minWidth: 38 }}>SHOW</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={showVolume}
                  data-testid="call-show-volume-slider"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    handleShowVolumeChange(v);
                    setScopeVolume("LIVE_PERFORMANCE_AUDIO", v);
                  }}
                  style={{ width: "100%", accentColor: "#00FFFF" }}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                <span style={{ fontSize: 8, color: "#00FF88", minWidth: 34 }}>CALL</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={callVolume}
                  data-testid="call-voice-volume-slider"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    handleCallVolumeChange(v);
                    setScopeVolume("PRIVATE_CALL_AUDIO", v);
                  }}
                  style={{ width: "100%", accentColor: "#00FF88" }}
                />
              </label>
              <button
                type="button"
                data-testid="call-audio-ducking-toggle"
                onClick={toggleAudioDucking}
                style={chipBtn(showCallAudioDucking, "#FFD700")}
                title="Automatically duck show and music volume when friends speak"
              >
                {showCallAudioDucking ? "DUCK: ON" : "DUCK: OFF"}
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                <span style={{ fontSize: 8, color: "#FF2DAA", minWidth: 52 }}>CALL MUSIC</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={privateMusicVolume}
                  data-testid="call-private-music-volume-slider"
                  onChange={(e) => setScopeVolume("PRIVATE_GROUP_MEDIA", Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#FF2DAA" }}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                <span style={{ fontSize: 8, color: "#AA2DFF", minWidth: 46 }}>ROOM JB</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={roomJukeboxVolume}
                  data-testid="call-room-jukebox-volume-slider"
                  onChange={(e) => setScopeVolume("LOBBY_JUKEBOX_AUDIO", Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#AA2DFF" }}
                />
              </label>
            </div>
          </div>

          {/* 5. Consent-Based Group Experience Invites (Portal Transition) */}
          <div data-testid="call-group-invite-bar">
            <div style={secHeader}>INVITE CALL GROUP TO EXPERIENCE (CONSENT-BASED)</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
              <button
                type="button"
                data-testid="call-invite-to-concert"
                onClick={() =>
                  proposeGroupExperienceInvite({
                    callSessionId: activeCall?.callId ?? "call-session",
                    fromUserId: meId || "self",
                    fromDisplayName: "You",
                    targetExperience: "CONCERT",
                    targetRoomId: "main-auditorium",
                    targetLabel: "Live Concert · Watch Together",
                    sitTogetherRequested: true,
                  })
                }
                style={chipBtn(false, "#FF2DAA")}
              >
                🎟️ INVITE TO CONCERT
              </button>
              <button
                type="button"
                data-testid="call-invite-to-avatar-lobby"
                onClick={() =>
                  proposeGroupExperienceInvite({
                    callSessionId: activeCall?.callId ?? "call-session",
                    fromUserId: meId || "self",
                    fromDisplayName: "You",
                    targetExperience: "FAN_AVATAR_LOBBY",
                    targetRoomId: "anchor-global-fan-lobby",
                    targetLabel: "3D Fan Avatar Lobby",
                    sitTogetherRequested: false,
                  })
                }
                style={chipBtn(false, "#00FFFF")}
              >
                🌀 PORTAL TO AVATAR LOBBY
              </button>
              <button
                type="button"
                data-testid="call-invite-to-lounge"
                onClick={() =>
                  proposeGroupExperienceInvite({
                    callSessionId: activeCall?.callId ?? "call-session",
                    fromUserId: meId || "self",
                    fromDisplayName: "You",
                    targetExperience: "LOUNGE",
                    targetRoomId: "vip-stone-fireplace-lounge",
                    targetLabel: "VIP Fireplace Lounge",
                    sitTogetherRequested: true,
                  })
                }
                style={chipBtn(false, "#FFD700")}
              >
                🛋️ INVITE TO LOUNGE
              </button>
            </div>

            {pendingExperienceInvite && pendingExperienceInvite.status === "PENDING" ? (
              <div
                data-testid="call-group-invite-consent-banner"
                style={{
                  marginTop: 6,
                  padding: "7px 9px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,255,255,0.45)",
                  background: "rgba(0,255,255,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                <div style={{ fontSize: 8.5, fontWeight: 800, color: "#00FFFF" }}>
                  🌀 PORTAL INVITE: {pendingExperienceInvite.targetLabel}
                  {pendingExperienceInvite.sitTogetherRequested ? " · Sit Together" : ""}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    data-testid="call-group-invite-accept"
                    onClick={() => respondGroupExperienceInvite("ACCEPTED")}
                    style={chipBtn(true, "#00FF88")}
                  >
                    JOIN GROUP THERE
                  </button>
                  <button
                    type="button"
                    data-testid="call-group-invite-stay"
                    onClick={() => respondGroupExperienceInvite("STAYED_BEHIND")}
                    style={chipBtn(false, "#FFD700")}
                  >
                    STAY HERE IN CALL
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* 6. Lightweight Social Reactions & Motion Controls */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={secHeader}>REACTIONS &amp; MOTION</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  data-testid="call-ambient-motion-toggle"
                  onClick={() => setAllowAmbientPanelMovement(!allowAmbientPanelMovement)}
                  style={chipBtn(allowAmbientPanelMovement, "#00FFFF")}
                  title="Allow gentle Voltron ambient movement (pauses during focused tasks)"
                >
                  {allowAmbientPanelMovement ? "MOTION: AUTO" : "MOTION: LOCKED"}
                </button>
                <button
                  type="button"
                  data-testid="call-reduced-motion-toggle"
                  onClick={() =>
                    setMotionPreference(motionPreference === "REDUCED" ? "AUTO" : "REDUCED")
                  }
                  style={chipBtn(motionPreference === "REDUCED", "#FFD700")}
                >
                  {motionPreference === "REDUCED" ? "REDUCED FX" : "FULL FX"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
              {QUICK_REACTIONS.map((rx) => (
                <button
                  key={rx.label}
                  type="button"
                  data-testid={`call-reaction-${rx.label}`}
                  onClick={() => sendSocialReaction(rx.emoji, rx.label)}
                  style={chipBtn(false, "#FF2DAA")}
                >
                  {rx.emoji} {rx.label}
                </button>
              ))}
              <button
                type="button"
                data-testid="call-reactions-visibility-toggle"
                onClick={() => setReactionsVisible(!reactionsVisible)}
                style={chipBtn(reactionsVisible, "#7878AA")}
              >
                {reactionsVisible ? "FX SHOWN" : "FX HIDDEN"}
              </button>
            </div>
            {reactionsVisible && recentReactions.length > 0 ? (
              <div
                data-testid="call-recent-reactions-strip"
                style={{
                  marginTop: 4,
                  display: "flex",
                  gap: 6,
                  overflowX: "auto",
                  fontSize: 9,
                  color: "#FFD700",
                }}
              >
                {recentReactions.slice(-4).map((r) => (
                  <span key={r.id}>
                    {r.emoji} {r.senderName}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div style={{ padding: "6px 12px 10px", fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
        {error ? `Error: ${error}` : note ?? `Phase: ${phase}`}
      </div>
    </div>
  );
}

const secHeader: CSSProperties = {
  fontSize: 7.5,
  fontWeight: 900,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.48)",
  textTransform: "uppercase",
};

function chipBtn(active: boolean, accent: string): CSSProperties {
  return {
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.06em",
    padding: "4px 7px",
    borderRadius: 5,
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.16)",
    background: active ? `${accent}2b` : "rgba(255,255,255,0.04)",
    color: active ? accent : "rgba(255,255,255,0.78)",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}
