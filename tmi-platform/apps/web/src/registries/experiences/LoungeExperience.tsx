"use client";

/**
 * LoungeExperience — canonical VIP video lounge module (Branch A).
 * Configures EosArenaEventShell for presence-based lounge mode.
 * Phase 1: composeLoungeProgram → LoungePresentationShell (PROGRAM.LOUNGE).
 * DNA: WebRTC panels only — never Fan Lobby avatar stadium / Battle VS / Cypher.
 * Never invents panel occupancy (Rule 20).
 */

import { useEffect, useState } from "react";
import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";
import LoungePresentationShell from "@/components/live/LoungePresentationShell";
import {
  clearLoungeProgram,
  composeLoungeProgram,
  getActiveLoungeProgram,
  type LoungeProgramComposition,
} from "@/lib/experiencePresentation/composeLoungeProgram";

export interface LoungeExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function LoungeExperience({
  roomId = "vip-lounge",
  venueId,
}: LoungeExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;
  const [composition, setComposition] = useState<LoungeProgramComposition | null>(null);

  useEffect(() => {
    if (manifest.experience.id !== "lounge") return;

    const sessionId = `lounge:${resolvedRoom}`;
    const next = composeLoungeProgram({
      sessionId,
      roomId: resolvedRoom,
      loungeMode: "CHILL_LOUNGE",
      // Honest empty until loungeVideoPresenceLaw publishes real panel counts.
      panelPresenceCount: null,
      lifecyclePhase: "ROAM",
      bindJumbotron: true,
    });
    setComposition(next);

    if (typeof window !== "undefined") {
      (
        window as unknown as { __TMI_LOUNGE_PROGRAM__?: LoungeProgramComposition | null }
      ).__TMI_LOUNGE_PROGRAM__ = getActiveLoungeProgram();
    }

    return () => {
      clearLoungeProgram("lounge-experience-unmount");
      setComposition(null);
    };
  }, [manifest.experience.id, resolvedRoom]);

  if (manifest.experience.id !== "lounge") {
    return (
      <div style={{ padding: 16, color: "#AA2DFF", fontSize: 12 }}>
        LoungeExperience requires experience id &quot;lounge&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <div data-lounge-experience="production" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <LoungePresentationShell composition={composition} />
      <EosArenaEventShell
        config={{
          roomId: resolvedRoom,
          eventType: "lounge",
          mode: "audience",
          liveState: "live",
        }}
      />
    </div>
  );
}
