"use client";

/**
 * WorldDancePartyExperience — canonical world-dance-party module (Branch B).
 * Configures EosArenaEventShell for full-body dance floor mode.
 * Phase 1: composeDancePartyProgram → DancePartyPresentationShell (PROGRAM.WDP_COMPOSITE).
 * Official Friday pool overlay wired via WorldDancePartyNowPlayingOverlay.
 * Default outdoor festival amphitheater (selectable indoor neon-club).
 * Never invents DJ / track / dancer counts (Rule 20). World = Record Ralph only.
 */

import { useEffect, useState } from "react";
import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";
import WorldDancePartyNowPlayingOverlay from "@/components/dance/WorldDancePartyNowPlayingOverlay";
import DancePartyPresentationShell from "@/components/live/DancePartyPresentationShell";
import { resolveFlagshipVenueAtmosphere } from "@/lib/events/FlagshipVenueAtmosphere";
import { RECORD_RALPH_BOT_ID } from "@/lib/dance/WorldDancePartyRotationPool";
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
          setNowPlaying({
            trackId: np.entryId.trim(),
            title: np.overlayTitle.trim(),
            artistName: np.overlayArtist?.trim() || "Unknown artist",
            bpm: null,
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
    const composed = composeDancePartyProgram({
      sessionId: `wdp-session:${partyId}`,
      partyId,
      roomId: resolvedRoom,
      scope: "WORLD",
      djId: RECORD_RALPH_BOT_ID,
      djDisplayName: "DJ Record Ralph",
      djIsBot: true,
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
  }, [resolvedRoom, nowPlaying, lifecyclePhase, partyId]);

  if (manifest.experience.id !== "world-dance-party") {
    return (
      <div style={{ padding: 16, color: "#00E5FF", fontSize: 12 }}>
        WorldDancePartyExperience requires experience id &quot;world-dance-party&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "min(80vh, 720px)" }}>
      <div style={{ marginBottom: 12 }}>
        <DancePartyPresentationShell composition={danceProgram} />
      </div>
      <EosArenaEventShell
        config={{
          roomId: resolvedRoom,
          eventType: "world-dance-party",
          mode: "audience",
          liveState: "live",
          venueEnvironment: atmosphere.environment,
          venueSkinId: atmosphere.skinId,
        }}
      />
      <WorldDancePartyNowPlayingOverlay />
    </div>
  );
}
