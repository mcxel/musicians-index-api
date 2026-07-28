"use client";

/**
 * MondayNightStageExperience — Broadcast Showcase Profile (Phase 4 Pass 4.5).
 *
 * Classification: LIVE_SHOWCASE (not a Competition Profile).
 * This is the EOS module for Monday Night Stage — a weekly flagship live
 * showcase where performers entertain a live audience, receive real-time
 * reactions, and get discovered by fans, promoters, and industry professionals.
 *
 * Flow: Host Opens Show → Featured Performer → Audience Reaction →
 *        Host Commentary → Fan Voting (optional) → Encore or Next Performer
 *
 * Widget profile: broadcast_controls, performer_card, crowd_meter,
 *                 applause_meter, boo_meter, tip_performer, follow_artist,
 *                 book_artist, coming_up_next, live_chat.
 * Configures EosArenaEventShell; no duplicate stage logic here.
 */

import EosArenaEventShell from "@/components/eos/ArenaEventShell";
import { useExperienceRuntime } from "@/components/eos/ExperienceRuntimeContext";

export interface MondayNightStageExperienceProps {
  roomId?: string;
  venueId?: string;
}

export default function MondayNightStageExperience({
  roomId = "monday-night-stage",
  venueId,
}: MondayNightStageExperienceProps) {
  const manifest = useExperienceRuntime();
  const resolvedRoom = venueId ? `${roomId}-${venueId}` : roomId;

  if (manifest.experience.id !== "monday-night-stage") {
    return (
      <div style={{ padding: 16, color: "#FFD700", fontSize: 12 }}>
        MondayNightStageExperience requires experience id &quot;monday-night-stage&quot;, got {manifest.experience.id}
      </div>
    );
  }

  return (
    <EosArenaEventShell
      config={{
        roomId: resolvedRoom,
        eventType: "monday-stage",
        mode: "audience",
        liveState: "live",
      }}
    />
  );
}
