/**
 * Discrete crowd reaction SFX playback callsite — PERSONAL monitor only.
 * Gates BOO/GROAN/DISAPPOINTMENT for the active performer via
 * ChannelMixerDirector.shouldPlayDiscreteCrowdReactionInPersonal.
 * Audience PERSONAL and PROGRAM mixes are not rewritten here.
 */

"use client";

import { ChannelMixerDirector } from "@/lib/audio/mixer/ChannelMixerDirector";
import {
  resolvePersonalCrowdReactionSounds,
  type CrowdReactionFamily,
} from "@/lib/audio/CrowdAmbienceListenerMixPolicy";
import { playSound } from "@/lib/sound/playSound";
import type { ExperienceType } from "@/lib/venue-hud/TMIExperienceHudRuntime";

export type DiscreteCrowdReactionPlaybackResult = {
  played: boolean;
  suppressedBoo: boolean;
  allowInPersonalMonitor: boolean;
  soundIdsPlayed: readonly string[];
  programBusUnaffected: true;
};

/**
 * Canonical discrete crowd reaction playback for PERSONAL monitor.
 * Call this instead of raw playSound(crowd_boo_*) from HUD / pulse / MNS strips.
 */
export function playDiscreteCrowdReactionSfx(input: {
  reactionFamily: CrowdReactionFamily | string;
  listenerIsActivePerformer: boolean;
  experienceType?: ExperienceType | string | null;
}): DiscreteCrowdReactionPlaybackResult {
  const gate = ChannelMixerDirector.shouldPlayDiscreteCrowdReactionInPersonal({
    reactionFamily: input.reactionFamily,
    listenerIsActivePerformer: input.listenerIsActivePerformer,
    experienceType: input.experienceType,
  });

  // Performer PERSONAL suppression is authoritative via suppressedBoo.
  // Audience listeners are never suppressed by this policy even if mixer gain is unbound (0).
  if (input.listenerIsActivePerformer && gate.suppressedBoo) {
    return {
      played: false,
      suppressedBoo: true,
      allowInPersonalMonitor: false,
      soundIdsPlayed: [],
      programBusUnaffected: true,
    };
  }

  const routed = resolvePersonalCrowdReactionSounds({
    reaction: input.reactionFamily as CrowdReactionFamily,
    listenerIsActivePerformer: input.listenerIsActivePerformer,
    experienceType: input.experienceType,
  });

  if (routed.suppressedBoo || routed.soundIds.length === 0) {
    return {
      played: false,
      suppressedBoo: routed.suppressedBoo || gate.suppressedBoo,
      allowInPersonalMonitor: false,
      soundIdsPlayed: [],
      programBusUnaffected: true,
    };
  }

  const playedIds: string[] = [];
  for (const id of routed.soundIds) {
    playSound(id);
    playedIds.push(id);
  }

  return {
    played: playedIds.length > 0,
    suppressedBoo: false,
    allowInPersonalMonitor: true,
    soundIdsPlayed: playedIds,
    programBusUnaffected: true,
  };
}
