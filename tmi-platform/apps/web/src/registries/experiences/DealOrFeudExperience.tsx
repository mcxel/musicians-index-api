"use client";

/**
 * DealOrFeudExperience — canonical deal-or-feud module (Phase 4 Pass 4.6 + Phase 1 presentation).
 * Configures EosArenaEventShell; composes PROGRAM.GAME_SHOW from HostShowAssignment.
 * Never invents contestants / scores / prize winners (Rule 20).
 */

import { useEffect, useState } from "react";
import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";
import GameShowPresentationShell from "@/components/live/GameShowPresentationShell";
import {
  clearGameShowProgram,
  composeGameShowProgram,
  getActiveGameShowProgram,
  type GameShowProgramComposition,
} from "@/lib/experiencePresentation/composeGameShowProgram";

export interface DealOrFeudExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function DealOrFeudExperience({
  roomId = "deal-vs-feud",
  venueId,
}: DealOrFeudExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;
  const [composition, setComposition] = useState<GameShowProgramComposition | null>(null);

  useEffect(() => {
    if (manifest.experience.id !== "deal-or-feud") return;

    const sessionId = `game-show:${resolvedRoom}`;
    const next = composeGameShowProgram({
      sessionId,
      roomId: resolvedRoom,
      formatId: "DEAL_OR_FEUD",
      showId: "deal-or-feud",
      // Honest empty contestants until engine/session supplies real roster (Rule 20).
      contestants: null,
      board: null,
      bindJumbotron: true,
    });
    setComposition(next);

    if (typeof window !== "undefined") {
      (
        window as unknown as { __TMI_GAME_SHOW_PROGRAM__?: GameShowProgramComposition | null }
      ).__TMI_GAME_SHOW_PROGRAM__ = getActiveGameShowProgram();
    }

    return () => {
      clearGameShowProgram("deal-or-feud-unmount");
      setComposition(null);
    };
  }, [manifest.experience.id, resolvedRoom]);

  if (manifest.experience.id !== "deal-or-feud") {
    return (
      <div style={{ padding: 16, color: "#FF2DAA", fontSize: 12 }}>
        DealOrFeudExperience requires experience id &quot;deal-or-feud&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <div data-deal-or-feud-experience="production" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <GameShowPresentationShell composition={composition} />
      <EosArenaEventShell
        config={{
          roomId: resolvedRoom,
          eventType: "deal-or-feud",
          mode: "audience",
          liveState: "live",
        }}
      />
    </div>
  );
}
