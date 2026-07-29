"use client";

/**
 * InstantGoLiveStage — performer lands on empty venue immediately.
 * Ambient life + Venue Support Presence (labeled bots) without fake viewers.
 * humanViewers only for watching / arrival toasts (Rule 20).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import GoLiveRuntime from "@/components/live/GoLiveRuntime";
import PerformerCommandPanel from "@/components/live/PerformerCommandPanel";
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
}

function categoryToEventType(
  category: string,
): "concert" | "battle" | "cypher" | "challenge" | "live-show" | "lounge" | "world-dance-party" {
  const c = category.toLowerCase();
  if (c === "battle") return "battle";
  if (c === "cypher") return "cypher";
  if (c === "challenge") return "challenge";
  if (c === "concert") return "concert";
  if (c === "dance-party" || c === "world-dance-party") return "world-dance-party";
  if (c === "lounge") return "lounge";
  return "live-show";
}

export default function InstantGoLiveStage({
  roomId,
  category = "live",
  privacy = "public",
}: InstantGoLiveStageProps) {
  const [metrics, setMetrics] = useState<VenuePresenceMetrics>(EMPTY_VENUE_PRESENCE_METRICS);
  const [envVerified, setEnvVerified] = useState(false);
  const [soundOk, setSoundOk] = useState(false);
  const [hostMode, setHostMode] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [supportCue, setSupportCue] = useState<SupportCue | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const firstPoll = useRef(true);
  const humanRef = useRef(0);

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
  const useArenaShell =
    eventType === "battle" ||
    eventType === "cypher" ||
    eventType === "challenge" ||
    eventType === "concert";

  const watching = metrics.humanViewers;

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        height: "100vh",
        background: "#050510",
        color: "#fff",
        overflow: "hidden",
      }}
      data-instant-go-live="true"
      data-privacy={privacy}
    >
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
        <span style={{ color: "#FF2020" }}>● LIVE</span>
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

      {useArenaShell ? (
        <ArenaEventShell
          roomId={roomId}
          eventType={eventType}
          mode="performer"
          liveState="live"
          watcherCount={watching}
          instantEmptyStage
        />
      ) : (
        <GoLiveRuntime roomId={roomId} eventType="live-show" instantEmptyStage />
      )}

      <PerformerCommandPanel
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
              position: "fixed",
              bottom: 120,
              right: 20,
              zIndex: 9300,
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
              position: "fixed",
              bottom: 168,
              left: 20,
              zIndex: 9300,
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
    </main>
  );
}
