"use client";

/**
 * MondayNightStageExperience — Broadcast Showcase Profile (Phase 4 Pass 4.5 + Phase 1 presentation).
 *
 * Classification: Broadcast Showcase / STAGE_SHOW (ExperienceRegistry).
 * LIVE_SHOWCASE remains an allowed RoleRegistry category alias.
 * This is the EOS module for Monday Night Stage — a weekly flagship live
 * showcase where performers entertain a live audience, receive real-time
 * reactions, and get discovered by fans, promoters, and industry professionals.
 *
 * Phase 1: composeMondayNightStageProgram → MondayNightStagePresentationShell
 * (PROGRAM.MNS_SHOW). Hosts from HostShowAssignment; never invents lineup /
 * winners / attendance. Canonical queue runtime remains /rooms/monday-stage.
 *
 * Configures EosArenaEventShell; no duplicate stage logic here.
 */

import { useEffect, useState } from "react";
import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";
import MondayNightStagePresentationShell from "@/components/live/MondayNightStagePresentationShell";
import { getMondayNightStageSchedule } from "@/lib/events/ScheduledEventRegistry";
import {
  clearMondayNightStageProgram,
  composeMondayNightStageProgram,
  getActiveMondayNightStageProgram,
  type MondayNightStageLifecyclePhase,
  type MondayNightStageProgramComposition,
} from "@/lib/experiencePresentation/composeMondayNightStageProgram";

export interface MondayNightStageExperienceProps {
  roomId?: string;
  venueId?: string;
}

function mapSchedulePhaseToLifecycle(
  phase: string | undefined
): MondayNightStageLifecyclePhase {
  switch ((phase ?? "").toUpperCase()) {
    case "LIVE":
      return "HOST_OPEN";
    case "PRESHOW":
      return "PRESHOW";
    case "ARCHIVE":
    case "POSTSHOW":
      return "POST_SHOW";
    case "CLOSED":
      return "PRESHOW";
    default:
      return "PRESHOW";
  }
}

export default function MondayNightStageExperience({
  roomId = "monday-night-stage",
  venueId,
}: MondayNightStageExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;
  const showId = "monday-night-stage";

  const [lifecyclePhase, setLifecyclePhase] =
    useState<MondayNightStageLifecyclePhase>("PRESHOW");
  const [mnsProgram, setMnsProgram] =
    useState<MondayNightStageProgramComposition | null>(null);

  // Schedule window only — featured/Who's Next stay null here (canonical queue is /rooms/monday-stage).
  useEffect(() => {
    const schedule = getMondayNightStageSchedule();
    setLifecyclePhase(mapSchedulePhaseToLifecycle(schedule.phase));
  }, []);

  useEffect(() => {
    const composed = composeMondayNightStageProgram({
      sessionId: `mns-session:${showId}`,
      showId,
      roomId: resolvedRoom,
      // No invented lineup on EOS mill path — room consumer owns real queue.
      featuredId: null,
      whosNextId: null,
      audiencePresenceCount: null,
      lifecyclePhase,
      bindJumbotron: true,
    });
    setMnsProgram(composed);

    return () => {
      if (getActiveMondayNightStageProgram()?.showId === showId) {
        clearMondayNightStageProgram("monday-night-stage-experience-unmount");
      }
    };
  }, [resolvedRoom, lifecyclePhase, showId]);

  if (manifest.experience.id !== "monday-night-stage") {
    return (
      <div style={{ padding: 16, color: "#FFD700", fontSize: 12 }}>
        MondayNightStageExperience requires experience id &quot;monday-night-stage&quot;, got{" "}
        {manifest.experience.id}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "min(80vh, 720px)" }}>
      <div style={{ marginBottom: 12 }}>
        <MondayNightStagePresentationShell composition={mnsProgram} />
      </div>
      <EosArenaEventShell
        config={{
          roomId: resolvedRoom,
          eventType: "monday-stage",
          mode: "audience",
          liveState: "live",
        }}
      />
    </div>
  );
}
