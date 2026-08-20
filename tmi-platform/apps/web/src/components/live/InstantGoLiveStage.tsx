"use client";

/**
 * InstantGoLiveStage — performer lands on empty venue immediately.
 * Ambient life + Venue Support Presence (labeled bots) without fake viewers.
 * humanViewers only for watching / arrival toasts (Rule 20).
 * Parallel camera/mic/broadcast init via compact status pill (never full setup page).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import GoLiveRuntime from "@/components/live/GoLiveRuntime";
import PerformerCommandPanel from "@/components/live/PerformerCommandPanel";
import GoLiveStatusPill, { type GoLiveInitPhase } from "@/components/live/GoLiveStatusPill";
import GoLiveDeviceDrawer from "@/components/live/GoLiveDeviceDrawer";
import { showBannerText, clearBannerText } from "@/lib/live/StageDirectorEngine";
import {
  startVenueSupportPresence,
  tickVenueSupport,
  buildVenuePresenceMetrics,
  getLatestSupportCue,
  subscribeVenueSupport,
  type SupportCue,
} from "@/lib/venues/VenueSupportPresenceEngine";
import {
  EMPTY_VENUE_PRESENCE_METRICS,
  type VenuePresenceMetrics,
} from "@/lib/venues/venuePresenceMetrics";
import {
  buildLiveMediaConstraints,
  hasPriorLiveDevices,
  loadPersistedLiveDevices,
  persistDevicesFromStream,
} from "@/lib/live/liveDevicePersistence";
import { launchDockStore } from "@/lib/dock/launchDockStore";
import {
  resolveEventVenueEnvironment,
  type VenueEnvironmentKind,
} from "@/lib/venues/EventVenueEnvironment";

const ArenaEventShell = dynamic(() => import("@/components/live/ArenaEventShell"), {
  ssr: false,
});

type AudienceMember = {
  userId: string;
  displayName: string;
  role: string;
};

interface InstantGoLiveStageProps {
  roomId: string;
  category?: string;
  privacy?: string;
  /** Fill the assigned media player instead of taking over the viewport. */
  contained?: boolean;
  /** Persisted / URL indoor|outdoor — fed into EventVenueEnvironment on join. */
  venueEnvironment?: VenueEnvironmentKind | null;
  venueSkinId?: string | null;
}

function categoryToEventType(
  category: string,
): "concert" | "battle" | "cypher" | "challenge" | "live-show" | "lounge" | "world-dance-party" | "slow-jams" {
  const c = category.toLowerCase();
  if (c === "battle") return "battle";
  if (c === "cypher") return "cypher";
  if (c === "challenge") return "challenge";
  if (c === "concert" || c === "release-party") return "concert";
  if (c === "dance-party" || c === "world-dance-party") return "world-dance-party";
  if (c === "listening" || c.includes("slow-jam")) return "slow-jams";
  if (c === "lounge") return "lounge";
  return "live-show";
}

export default function InstantGoLiveStage({
  roomId,
  category = "live",
  privacy = "public",
  contained = false,
  venueEnvironment = null,
  venueSkinId = null,
}: InstantGoLiveStageProps) {
  const [metrics, setMetrics] = useState<VenuePresenceMetrics>(EMPTY_VENUE_PRESENCE_METRICS);
  const [envVerified, setEnvVerified] = useState(false);
  const [soundOk, setSoundOk] = useState(false);
  const [hostMode, setHostMode] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [supportCue, setSupportCue] = useState<SupportCue | null>(null);
  const [initPhase, setInitPhase] = useState<GoLiveInitPhase>("preparing_venue");
  const [initError, setInitError] = useState("");
  const [deviceDrawerOpen, setDeviceDrawerOpen] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const firstPoll = useRef(true);
  const humanRef = useRef(0);
  const mediaStarted = useRef(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const attachPreview = useCallback((stream: MediaStream | null) => {
    if (streamRef.current && streamRef.current !== stream) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = stream;
    setLocalStream(stream);
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = stream;
      if (stream) void previewVideoRef.current.play().catch(() => {});
    }
  }, []);

  const finishBroadcastInit = useCallback(() => {
    setInitPhase("initializing_broadcast");
    window.setTimeout(() => {
      setInitPhase("live");
      launchDockStore.setCamReady(true);
      launchDockStore.setMicReady(true);
    }, 350);
  }, []);

  const runMediaInit = useCallback(async () => {
    setInitPhase("preparing_venue");
    setInitError("");

    // Brief venue paint beat before camera — stage already visible
    await new Promise((r) => window.setTimeout(r, 120));
    setInitPhase("connecting_camera");

    const persisted = loadPersistedLiveDevices();
    const prior = hasPriorLiveDevices();

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        buildLiveMediaConstraints(persisted),
      );
      persistDevicesFromStream(stream);
      attachPreview(stream);
      launchDockStore.setCamReady(Boolean(stream.getVideoTracks()[0]));
      setInitPhase("connecting_mic");
      launchDockStore.setMicReady(Boolean(stream.getAudioTracks()[0]));
      finishBroadcastInit();
    } catch (err) {
      const denied =
        err instanceof Error &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setInitPhase("error");
      setInitError(
        denied
          ? "Camera/mic permission denied. Open Devices to retry, or continue without camera."
          : "Could not connect camera/mic. Open Devices to pick another input.",
      );
      // Only auto-open drawer when no prior approved devices (repeat launch stays clean)
      if (!prior) setDeviceDrawerOpen(true);
    }
  }, [attachPreview, finishBroadcastInit]);

  // Parallel media init — explicit device drawer only (never on mount).
  // Hub Command Center uses livePrivacyState + HubMonitorCameraPlayer instead.

  useEffect(() => {
    if (!previewVideoRef.current || !localStream) return;
    previewVideoRef.current.srcObject = localStream;
    void previewVideoRef.current.play().catch(() => {});
  }, [localStream]);

  const onDeviceStreamReady = useCallback(
    (stream: MediaStream) => {
      attachPreview(stream);
      launchDockStore.setCamReady(Boolean(stream.getVideoTracks()[0]));
      launchDockStore.setMicReady(Boolean(stream.getAudioTracks()[0]));
      setInitError("");
      finishBroadcastInit();
    },
    [attachPreview, finishBroadcastInit],
  );

  const onSkipDevices = useCallback(() => {
    setDeviceDrawerOpen(false);
    setInitError("");
    // Honest no-cam mode — venue stays open, broadcast listed without local preview
    finishBroadcastInit();
  }, [finishBroadcastInit]);

  const refreshPresence = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/live/audience?venue=${encodeURIComponent(roomId)}&messages=0`,
        { credentials: "include", cache: "no-store" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        present?: number;
        activeMembers?: AudienceMember[];
      };
      // Humans only — strip bots / support roles from watching
      const members = (data.activeMembers ?? []).filter((m) => {
        const role = (m.role || "").toLowerCase();
        const name = (m.displayName || "").toLowerCase();
        if (role === "bot" || role === "support") return false;
        if (name.includes("[bot]") || name.startsWith("bot:")) return false;
        if (name.includes("support crew") || name.includes("venue technician")) return false;
        if (name.includes("performance assistant") || name.includes("environment inspector")) {
          return false;
        }
        return true;
      });
      // Prefer identifiable humans only. Opaque aggregates without member rows
      // stay at 0 — never invent watching from support or unknown present.
      const honestHumans = Array.isArray(data.activeMembers)
        ? members.length
        : 0;

      if (!firstPoll.current && hostMode) {
        for (const m of members) {
          if (!seenIds.current.has(m.userId)) {
            seenIds.current.add(m.userId);
            const name = (m.displayName || "Fan").split("|")[0]?.slice(0, 18) ?? "Fan";
            setToast(`${name} just walked in`);
            window.setTimeout(() => setToast(null), 3200);
          }
        }
      } else {
        for (const m of members) seenIds.current.add(m.userId);
        firstPoll.current = false;
      }

      humanRef.current = honestHumans;
      const supportState = tickVenueSupport(roomId, {
        humanViewers: honestHumans,
        performerPreparing: honestHumans === 0,
      });
      setEnvVerified(supportState.environmentVerified);
      setSoundOk(supportState.soundCheckComplete);
      setMetrics(
        buildVenuePresenceMetrics({
          roomId,
          humanViewers: honestHumans,
          humanParticipants: 0,
          moderators: 0,
        }),
      );
      const cue = getLatestSupportCue(roomId);
      if (cue) setSupportCue(cue);
    } catch {
      /* venue already visible */
    }
  }, [roomId, hostMode]);

  useEffect(() => {
    const stop = startVenueSupportPresence(roomId, { isFirstSession: true });
    const unsub = subscribeVenueSupport((id, state) => {
      if (id !== roomId) return;
      setEnvVerified(state.environmentVerified);
      setSoundOk(state.soundCheckComplete);
      setMetrics(
        buildVenuePresenceMetrics({
          roomId,
          humanViewers: humanRef.current,
        }),
      );
      const cue = state.cues[state.cues.length - 1];
      if (cue) setSupportCue(cue);
    });
    void refreshPresence();
    const id = window.setInterval(() => void refreshPresence(), 2500);
    return () => {
      stop();
      unsub();
      window.clearInterval(id);
    };
  }, [roomId, refreshPresence]);

  // Support cues — attributed to assistants, never fake fans
  useEffect(() => {
    if (!supportCue) return;
    const t = window.setTimeout(() => {
      showBannerText(`${supportCue.message} — ${supportCue.attributedTo}`);
      window.setTimeout(() => clearBannerText(), 3500);
    }, 400);
    return () => window.clearTimeout(t);
  }, [supportCue?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onWelcome = useCallback(() => {
    const n = metrics.humanViewers;
    showBannerText(n === 0 ? "Welcome — venue is open" : `Welcome to the show · ${n} human attendee(s)`);
    window.setTimeout(() => clearBannerText(), 4000);
  }, [metrics.humanViewers]);

  const onWave = useCallback(() => {
    showBannerText("🌊 Performer waves to the crowd");
    window.setTimeout(() => clearBannerText(), 2500);
  }, []);

  const eventType = categoryToEventType(category);
  const envResolution = resolveEventVenueEnvironment({
    kind:
      eventType === "world-dance-party"
        ? "mini-dance-party"
        : eventType === "slow-jams"
          ? "mini-slow-jam"
          : eventType,
    environment: venueEnvironment,
    skinId: venueSkinId,
  });
  const useArenaShell =
    eventType === "battle" ||
    eventType === "cypher" ||
    eventType === "challenge" ||
    eventType === "concert" ||
    eventType === "world-dance-party" ||
    eventType === "slow-jams";

  const watching = metrics.humanViewers;
  const RootTag = contained ? "div" : "main";
  const hudPos = contained ? "absolute" : "fixed";

  return (
    <RootTag
      style={{
        position: "relative",
        minHeight: contained ? 0 : "100vh",
        height: contained ? "100%" : "100vh",
        width: "100%",
        background: "#050510",
        color: "#fff",
        overflow: "hidden",
        flex: contained ? 1 : undefined,
      }}
      data-instant-go-live="true"
      data-instant-go-live-contained={contained ? "true" : "false"}
      data-privacy={privacy}
    >
      {(!contained || initPhase === "error") && (
        <GoLiveStatusPill
          contained={contained}
          phase={initPhase}
          errorMsg={initError}
          onOpenDevices={() => setDeviceDrawerOpen(true)}
        />
      )}

      <GoLiveDeviceDrawer
        contained={contained}
        open={deviceDrawerOpen}
        onClose={() => setDeviceDrawerOpen(false)}
        onStreamReady={onDeviceStreamReady}
        onSkip={onSkipDevices}
      />

      {/* Compact local preview — not a setup page */}
      {localStream && (
        <video
          ref={previewVideoRef}
          muted
          playsInline
          autoPlay
          style={{
            position: "absolute",
            bottom: 24,
            left: 16,
            zIndex: 55,
            width: contained ? 88 : 140,
            height: contained ? 56 : 90,
            objectFit: "cover",
            borderRadius: 10,
            border: "1px solid rgba(0,255,255,0.45)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            background: "#000",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Honest live strip — humanViewers only */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 16,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 12px",
          borderRadius: 10,
          background: "rgba(5,5,16,0.85)",
          border: "1px solid rgba(255,255,255,0.12)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.06em",
          pointerEvents: "none",
          flexWrap: "wrap",
          maxWidth: "55%",
        }}
      >
        <span style={{ color: initPhase === "live" ? "#FF2020" : "#00FFFF" }}>
          {initPhase === "live" ? "● ON STAGE" : "○ PREPARING"}
        </span>
        <span style={{ color: "#00FFFF" }}>{watching} watching</span>
        <span style={{ color: "rgba(255,255,255,0.45)" }}>Venue Open</span>
        {watching === 0 && (
          <span style={{ color: "rgba(255,255,255,0.35)" }}>Waiting for audience…</span>
        )}
        {metrics.supportAgents > 0 && (
          <span style={{ color: "rgba(170,45,255,0.75)" }}>
            🛠 {metrics.supportAgents} support
          </span>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          minHeight: 0,
        }}
      >
        {useArenaShell ? (
          <ArenaEventShell
            roomId={roomId}
            eventType={eventType}
            mode="performer"
            liveState="soon"
            watcherCount={watching}
            instantEmptyStage
            venueEnvironment={envResolution.environment}
            venueSkinId={envResolution.skinId}
          />
        ) : (
          <GoLiveRuntime
            roomId={roomId}
            eventType="live-show"
            instantEmptyStage
            contained={contained}
            showLiveChrome={false}
            venueIndex={envResolution.policy === "exempt" ? 1 : envResolution.venueIndex}
          />
        )}
      </div>

      <PerformerCommandPanel
        contained={contained}
        roomId={roomId}
        audienceCount={watching}
        metrics={metrics}
        environmentVerified={envVerified}
        soundCheckComplete={soundOk}
        hostMode={hostMode}
        onHostModeChange={setHostMode}
        onWelcome={onWelcome}
        onWave={onWave}
      />

      {/* Human arrival toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35 }}
            style={{
              position: hudPos,
              bottom: contained ? 8 : 120,
              right: contained ? 8 : 20,
              zIndex: 60,
              padding: "10px 16px",
              borderRadius: 4,
              background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.75))",
              borderLeft: "3px solid #FF2DAA",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              maxWidth: 280,
              pointerEvents: "none",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support cue toast — clearly labeled assistant, not a fan */}
      <AnimatePresence>
        {supportCue && (
          <motion.div
            key={supportCue.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: hudPos,
              bottom: contained ? 40 : 168,
              left: contained ? 8 : 20,
              zIndex: 60,
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(10,8,24,0.9)",
              border: "1px solid rgba(170,45,255,0.35)",
              maxWidth: 320,
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 900, color: "#AA2DFF", letterSpacing: "0.12em" }}>
              [BOT] {supportCue.attributedTo}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
              {supportCue.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </RootTag>
  );
}
