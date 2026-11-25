"use client";

/**
 * WorldDancePartyExperience — canonical world-dance-party module (Branch B).
 * Configures EosArenaEventShell for full-body dance floor mode.
 * Phase 1: composeDancePartyProgram → DancePartyPresentationShell (PROGRAM.WDP_COMPOSITE).
 * Official Friday pool overlay wired via WorldDancePartyNowPlayingOverlay.
 * Default outdoor festival amphitheater (selectable indoor neon-club).
 * Never invents DJ / track / dancer counts (Rule 20). World = Record Ralph only.
 */

import { useEffect, useMemo, useState } from "react";
import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";
import WorldDancePartyNowPlayingOverlay from "@/components/dance/WorldDancePartyNowPlayingOverlay";
import DancePartyPresentationShell, {
  type DjBoothCameraMode,
} from "@/components/live/DancePartyPresentationShell";
import { resolveFlagshipVenueAtmosphere } from "@/lib/events/FlagshipVenueAtmosphere";
import { RECORD_RALPH_BOT_ID } from "@/lib/dance/WorldDancePartyRotationPool";
import { WorldDancePartyRuntimeEngine } from "@/lib/dance/WorldDancePartyRuntimeEngine";
import { resolveWdpCanonicalPlayback } from "@/lib/dance/wdpCanonicalPlayback";
import { DancePartyPresentationAdapter } from "@/lib/dance/DancePartyPresentationAdapter";
import { canCreateDanceParty } from "@/lib/subscriptions/BattleCreationGate";
import type { UserTier } from "@/lib/showmanship/AssetLockerPolicy";
import {
  clearDancePartyProgram,
  composeDancePartyProgram,
  getActiveDancePartyProgram,
  type DancePartyLifecyclePhase,
  type DancePartyProgramComposition,
  type DancePartyTrack,
} from "@/lib/experiencePresentation/composeDancePartyProgram";

export interface WorldDancePartyExperienceProps {
  roomId?: string;
  venueId?: string;
}

type NowPlayingApi = {
  nowPlaying?: {
    overlayArtist?: string;
    overlayTitle?: string;
    entryId?: string | null;
    audioUrl?: string | null;
    active?: boolean;
    phase?: string;
  };
};

function mapShowtimePhaseToLifecycle(phase: string | undefined): DancePartyLifecyclePhase {
  switch ((phase ?? "").toUpperCase()) {
    case "LIVE":
      return "DANCE_SESSION";
    case "SUBMIT_OPEN":
      return "WARMUP";
    case "ARCHIVE":
      return "AFTER_HOURS";
    case "CLOSED":
      return "VENUE_OPENING";
    default:
      return "WARMUP";
  }
}

export default function WorldDancePartyExperience({
  roomId = "world-dance-party",
  venueId,
}: WorldDancePartyExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;
  const atmosphere = resolveFlagshipVenueAtmosphere({ experience: "world-dance-party" });
  const partyId = "world-dance-party";

  const [nowPlaying, setNowPlaying] = useState<DancePartyTrack | null>(null);
  const [lifecyclePhase, setLifecyclePhase] = useState<DancePartyLifecyclePhase>("WARMUP");
  const [danceProgram, setDanceProgram] = useState<DancePartyProgramComposition | null>(null);
  const [djBoothMode, setDjBoothMode] = useState<DjBoothCameraMode>("REAL_EQUIPMENT_WIDE");
  const [authUser, setAuthUser] = useState<{
    id: string;
    displayName: string;
    role: string;
    tier: UserTier;
    authorizedDj: boolean;
  } | null>(null);
  const [humanDj, setHumanDj] = useState<{ id: string; displayName: string } | null>(null);

  const runtimeEngine = useMemo(
    () =>
      new WorldDancePartyRuntimeEngine(resolvedRoom, {
        djId: RECORD_RALPH_BOT_ID,
        name: "DJ Record Ralph",
        isBot: true,
        genre: "Dance",
        currentBpm: 128,
      }),
    [resolvedRoom],
  );

  const presentationAdapter = useMemo(
    () => new DancePartyPresentationAdapter(resolvedRoom, venueId ?? "dance-floor-arena"),
    [resolvedRoom, venueId],
  );

  useEffect(() => {
    runtimeEngine.start247Room();
    presentationAdapter.initialize();
    void presentationAdapter.handleDanceLifecycleEvent("RoomStarted", { roomId: resolvedRoom });
  }, [runtimeEngine, presentationAdapter, resolvedRoom]);

  // Resolve authenticated human user & DJ booth authorization (Silver+ tier or ADMIN/STAFF/performer role).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.authenticated || !data.user?.id) return;
        const id = String(data.user.id);
        const displayName = String(data.user.displayName || data.user.name || id);
        const role = String(data.user.role || "USER").toUpperCase();
        const rawTier = String(data.user.tier || data.user.subscriptionTier || "free");
        const validTiers: UserTier[] = ["free", "pro", "RUBY", "silver", "gold", "platinum", "diamond"];
        const normalized =
          rawTier.toUpperCase() === "RUBY"
            ? ("RUBY" as const)
            : (rawTier.toLowerCase() as UserTier);
        const tier: UserTier = validTiers.includes(normalized) ? normalized : "free";
        const gate = canCreateDanceParty(tier);
        const authorizedDj =
          gate.allowed ||
          role === "ADMIN" ||
          role === "STAFF" ||
          role === "ARTIST" ||
          manifest.role === "performer" ||
          manifest.role === "admin";
        setAuthUser({ id, displayName, role, tier, authorizedDj });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [manifest.role]);

  const handleTakeoverHumanDj = (djIdentity: { id: string; displayName: string }) => {
    runtimeEngine.transitionDj({
      djId: djIdentity.id,
      name: djIdentity.displayName,
      isBot: false,
      genre: "Live DJ Set",
      currentBpm: typeof nowPlaying?.bpm === "number" ? nowPlaying.bpm : 128,
    });
    setHumanDj(djIdentity);
  };

  const handleYieldToBotDj = () => {
    runtimeEngine.transitionDj({
      djId: RECORD_RALPH_BOT_ID,
      name: "DJ Record Ralph",
      isBot: true,
      genre: "Dance",
      currentBpm: 128,
    });
    setHumanDj(null);
  };

  // Poll real rotation pool via existing API — never invent tracks.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/world-dance-party/now-playing", { cache: "no-store" });
        const data = (await res.json()) as NowPlayingApi;
        if (cancelled) return;
        const np = data.nowPlaying;
        setLifecyclePhase(mapShowtimePhaseToLifecycle(np?.phase));
        if (np?.active && np.overlayTitle?.trim() && np.entryId?.trim()) {
          const playback = resolveWdpCanonicalPlayback(np.audioUrl);
          setNowPlaying({
            trackId: np.entryId.trim(),
            title: np.overlayTitle.trim(),
            artistName: np.overlayArtist?.trim() || "Unknown artist",
            bpm: null,
            audioUrl: playback.audioUrl,
            playback: playback.status,
          });
        } else {
          setNowPlaying(null);
        }
      } catch {
        if (!cancelled) setNowPlaying(null);
      }
    };
    void load();
    const t = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const activeDjId = humanDj ? humanDj.id : RECORD_RALPH_BOT_ID;
    const activeDjName = humanDj ? humanDj.displayName : "DJ Record Ralph";
    const activeDjIsBot = !humanDj;

    const composed = composeDancePartyProgram({
      sessionId: `wdp-session:${partyId}`,
      partyId,
      roomId: resolvedRoom,
      scope: "WORLD",
      djId: activeDjId,
      djDisplayName: activeDjName,
      djIsBot: activeDjIsBot,
      nowPlaying,
      // Floor presence unknown until seat/presence engines publish — never invent.
      floorPresenceCount: null,
      lifecyclePhase,
      bindJumbotron: true,
    });
    setDanceProgram(composed);

    return () => {
      if (getActiveDancePartyProgram()?.partyId === partyId) {
        clearDancePartyProgram("world-dance-party-unmount");
      }
    };
  }, [resolvedRoom, nowPlaying, lifecyclePhase, partyId, humanDj]);

  if (manifest.experience.id !== "world-dance-party") {
    return (
      <div style={{ padding: 16, color: "#00E5FF", fontSize: 12 }}>
        WorldDancePartyExperience requires experience id &quot;world-dance-party&quot;, got {manifest.experience.id}
      </div>
    );
  }

  const canTakeDjBooth = Boolean(
    authUser?.authorizedDj || manifest.role === "performer" || manifest.role === "admin",
  );
  const candidateHumanDj = authUser
    ? { id: authUser.id, displayName: authUser.displayName }
    : manifest.role === "performer" || manifest.role === "admin"
      ? { id: "authorized-human-dj", displayName: "Authorized Human DJ" }
      : null;

  return (
    <div style={{ position: "relative", minHeight: "min(80vh, 720px)" }}>
      {/* Human DJ Admission & Bot Yielding Controls */}
      <div
        data-testid="wdp-dj-admission-controls"
        data-dj-owner-kind={humanDj ? "HUMAN_DJ" : "BOT_FALLBACK"}
        data-active-dj-id={danceProgram?.dj?.id ?? RECORD_RALPH_BOT_ID}
        style={{
          marginBottom: 8,
          padding: "8px 12px",
          borderRadius: 6,
          background: "rgba(5,5,16,0.9)",
          border: "1px solid rgba(0,255,255,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 800 }}>
          DJ BOOTH AUTHORITY:{" "}
          <span style={{ color: humanDj ? "#00FF88" : "#00FFFF" }}>
            {humanDj
              ? `🎧 ${humanDj.displayName} (REAL HUMAN DJ · BOT YIELDED)`
              : "🤖 DJ Record Ralph (BOT FALLBACK — YIELDS ON HUMAN DJ ARRIVAL)"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!humanDj && canTakeDjBooth && candidateHumanDj && (
            <button
              type="button"
              data-testid="wdp-take-dj-booth-btn"
              onClick={() => handleTakeoverHumanDj(candidateHumanDj)}
              style={{
                padding: "5px 12px",
                borderRadius: 4,
                border: "1px solid #00FF88",
                background: "rgba(0,255,136,0.16)",
                color: "#00FF88",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              🎧 TAKE DJ BOOTH (HUMAN DJ)
            </button>
          )}
          {humanDj && (
            <button
              type="button"
              data-testid="wdp-yield-dj-booth-btn"
              onClick={handleYieldToBotDj}
              style={{
                padding: "5px 12px",
                borderRadius: 4,
                border: "1px solid #FF2DAA",
                background: "rgba(255,45,170,0.16)",
                color: "#FF2DAA",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              LEAVE BOOTH / YIELD TO BOT DJ
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <DancePartyPresentationShell
          composition={danceProgram}
          djBoothMode={djBoothMode}
          onChangeDjBoothMode={setDjBoothMode}
          canTriggerEffects={Boolean(humanDj || canTakeDjBooth)}
          onTriggerDjEffect={(eventName) => {
            void presentationAdapter.handleDanceLifecycleEvent(eventName, {
              roomId: resolvedRoom,
              intensity: 0.9,
            });
          }}
        />
      </div>
      <EosArenaEventShell
        config={{
          roomId: resolvedRoom,
          eventType: "world-dance-party",
          mode: humanDj ? "performer" : "audience",
          liveState: "live",
          venueEnvironment: atmosphere.environment,
          venueSkinId: atmosphere.skinId,
          leftParticipant: danceProgram?.dj
            ? {
                id: danceProgram.dj.id,
                displayName: danceProgram.dj.displayName,
              }
            : {
                id: RECORD_RALPH_BOT_ID,
                displayName: "DJ Record Ralph",
              },
        }}
      />
      <WorldDancePartyNowPlayingOverlay />
    </div>
  );
}
