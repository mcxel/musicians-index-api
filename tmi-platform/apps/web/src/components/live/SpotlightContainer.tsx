"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGhostForce } from "@/hooks/useGhostForce";
import { useSpotlight } from "@/hooks/useSpotlight";
import { useRoomEnergy } from "@/hooks/useRoomEnergy";
import { StageSpotlightWidget } from "@/components/live/StageSpotlightWidget";
import { SpotlightReactionBurst } from "@/components/live/SpotlightReactionBurst";
import SeatProfileOverlay, { type SeatProfile } from "@/components/live/SeatProfileOverlay";
import type { RawUser } from "@/lib/engine/SpotlightEventManager";
import { getSpotlightEmotes, getReactionMultiplier } from "@/lib/live/GhostArchetypeEngine";
import { predictVibeMode } from "@/lib/live/VibePredictor";
import { computeWarpAdapt } from "@/lib/live/WarpAdaptEngine";
import { WarpEntryLog } from "@/lib/live/WarpEntryLog";

interface Props {
  roomId: string;
}

export default function SpotlightContainer({ roomId }: Props) {
  const { messages } = useGhostForce(roomId);
  const { bumpEnergy, energyScore } = useRoomEnergy();
  const [openProfile, setOpenProfile] = useState<SeatProfile | null>(null);

  // Computed once at mount — self-correction params from prior warp history
  const adaptParams = useMemo(() => computeWarpAdapt(WarpEntryLog.getAll()), []);

  const ghostUsers = useMemo<RawUser[]>(() => {
    const seen = new Set<string>();
    const out: RawUser[] = [];
    for (const m of messages) {
      if (!seen.has(m.botName)) {
        seen.add(m.botName);
        const id = `ghost-${m.botName}`;
        const multiplier = getReactionMultiplier(id);
        const baseScore = m.type === "tip" ? 85 : m.type === "hype" ? 70 : 35;
        // Ghost boost: raise scores when crowd engagement is low
        const boosted = adaptParams.ghostBoostActive
          ? Math.min(100, baseScore + 15)
          : baseScore;
        out.push({
          id,
          name: m.botName,
          role: "Ghost Listener",
          energyScore: Math.round(boosted * multiplier),
          isGhost: true,
          joinedAt: m.ts,
        });
      }
    }
    // Priority boost: surface new arrivals first when crowd is hot
    if (adaptParams.spotlightPriorityBoost) {
      out.sort((a, b) => (b.joinedAt ?? 0) - (a.joinedAt ?? 0));
    }
    return out.slice(0, 20);
  }, [messages, adaptParams]);

  const { phase, target } = useSpotlight([], ghostUsers);

  // Energy bump scaled by arrival velocity trend
  useEffect(() => {
    if (phase === "revealed") {
      const prediction = predictVibeMode(WarpEntryLog.getAll(), energyScore);
      const bump = prediction.velocityTrend === "rising" ? 12 : 8;
      bumpEnergy(bump);
    }
  }, [phase, bumpEnergy, energyScore]);

  // Archetype-specific emote burst on spotlight reveal
  const targetEmotes = useMemo(
    () => (target ? getSpotlightEmotes(target.id) : undefined),
    [target],
  );

  const handleSpotlightClick = useCallback(() => {
    if (!target) return;
    setOpenProfile({
      id: target.id,
      name: target.name,
      role: target.role,
      energy: target.energy,
      energyScore: target.energyScore,
      isBot: target.isGhost,
      isNew: target.isNew,
    });
  }, [target]);

  return (
    <>
      <StageSpotlightWidget phase={phase} target={target} onClick={handleSpotlightClick} />
      <SpotlightReactionBurst phase={phase} emotes={targetEmotes} />
      <SeatProfileOverlay profile={openProfile} onClose={() => setOpenProfile(null)} />
    </>
  );
}
