/**
 * ProgramQueueRegistry — default rotation sequences / weights (EOS Layer 5).
 *
 * All EXPERIENCE rows reference ExperienceRegistry ids only — no hardcoded
 * OverseerDeck, no fabricated live rooms. Non-experience sources are listed
 * as optional future lanes with weight 0 until real feeds exist (Rule 20).
 */

import type { ProgramQueueItem } from "@/core/eos/programBoard";
import { getExperienceById } from "./ExperienceRegistry";

/** Named default sequences for RotationScheduler. */
export type ProgramSequenceId =
  | "arena-rotation"
  | "vocal-improv"
  | "official-shows"
  | "social-lobbies";

export interface ProgramSequenceDefinition {
  id: ProgramSequenceId;
  title: string;
  /** Ordered queue items (weights relative within sequence) */
  items: readonly ProgramQueueItem[];
}

/**
 * 15-minute block defaults live in RotationSchedulerEngine config.
 * Registry only owns **what** can enter the queue.
 */
export const PROGRAM_SEQUENCE_REGISTRY: Record<
  ProgramSequenceId,
  ProgramSequenceDefinition
> = {
  "arena-rotation": {
    id: "arena-rotation",
    title: "Arena Rotation",
    items: [
      {
        id: "pq-battle",
        source: "EXPERIENCE",
        experienceId: "battle",
        weight: 100,
        title: "Battle Arena",
        subtitle: "Head-to-head — crowd votes",
        icon: "⚔️",
        accentColor: "#FF2DAA",
      },
      {
        id: "pq-cypher",
        source: "EXPERIENCE",
        experienceId: "cypher",
        weight: 90,
        title: "Cypher Circle",
        subtitle: "Open circle — every bar counts",
        icon: "🔄",
        accentColor: "#00FFFF",
      },
      {
        id: "pq-challenge",
        source: "EXPERIENCE",
        experienceId: "challenge",
        weight: 80,
        title: "Challenge Arena",
        subtitle: "Producer & artist challenges",
        icon: "🏆",
        accentColor: "#FFD700",
      },
      {
        id: "pq-jazz-scat",
        source: "EXPERIENCE",
        experienceId: "jazz-scat-battle",
        weight: 70,
        title: "Jazz Scat Battle",
        subtitle: "Vocal improv — scat vs scat",
        icon: "🎷",
        accentColor: "#FFD700",
      },
      {
        id: "pq-gibberish",
        source: "EXPERIENCE",
        experienceId: "gibberish-battle",
        weight: 70,
        title: "Gibberish Battle",
        subtitle: "Vocal improv — nonsense duel",
        icon: "🗣️",
        accentColor: "#00FFFF",
      },
    ],
  },

  "vocal-improv": {
    id: "vocal-improv",
    title: "Vocal Improv Blocks",
    items: [
      {
        id: "pq-vi-jazz",
        source: "EXPERIENCE",
        experienceId: "jazz-scat-battle",
        weight: 100,
        title: "Jazz Scat Battle",
        icon: "🎷",
        accentColor: "#FFD700",
      },
      {
        id: "pq-vi-gibberish",
        source: "EXPERIENCE",
        experienceId: "gibberish-battle",
        weight: 100,
        title: "Gibberish Battle",
        icon: "🗣️",
        accentColor: "#00FFFF",
      },
    ],
  },

  "official-shows": {
    id: "official-shows",
    title: "Official Shows",
    items: [
      {
        id: "pq-monday-night",
        source: "EXPERIENCE",
        experienceId: "monday-night-stage",
        weight: 100,
        title: "Monday Night Stage",
        subtitle: "Weekly flagship showcase",
        icon: "🎤",
        accentColor: "#FF2DAA",
      },
      {
        id: "pq-deal-or-feud",
        source: "EXPERIENCE",
        experienceId: "deal-or-feud",
        weight: 90,
        title: "Deal or Feud 1000",
        subtitle: "Game show — risk it all",
        icon: "🎰",
        accentColor: "#FFD700",
      },
      {
        id: "pq-world-dance",
        source: "EXPERIENCE",
        experienceId: "world-dance-party",
        weight: 85,
        title: "World Dance Party",
        icon: "💃",
        accentColor: "#FF2DAA",
      },
    ],
  },

  "social-lobbies": {
    id: "social-lobbies",
    title: "Social Lobbies",
    items: [
      {
        id: "pq-fan-lobby",
        source: "EXPERIENCE",
        experienceId: "fan-lobby",
        weight: 60,
        title: "Fan Lobby",
        icon: "👥",
        accentColor: "#AA2DFF",
      },
      {
        id: "pq-lounge",
        source: "EXPERIENCE",
        experienceId: "lounge",
        weight: 55,
        title: "VIP Lounge",
        icon: "🛋️",
        accentColor: "#AA2DFF",
      },
    ],
  },
};

/**
 * Default master sequence for ProgramBoard snapshots:
 * arena → vocal improv → official shows (no OverseerDeck hardcode).
 */
export const DEFAULT_PROGRAM_SEQUENCE_ORDER: readonly ProgramSequenceId[] = [
  "arena-rotation",
  "vocal-improv",
  "official-shows",
  "social-lobbies",
] as const;

/**
 * Flatten default sequences into one ordered queue.
 * Drops EXPERIENCE rows whose ExperienceRegistry id is missing (never invents).
 */
export function getDefaultProgramQueue(): ProgramQueueItem[] {
  const out: ProgramQueueItem[] = [];
  const seen = new Set<string>();

  for (const seqId of DEFAULT_PROGRAM_SEQUENCE_ORDER) {
    const seq = PROGRAM_SEQUENCE_REGISTRY[seqId];
    for (const item of seq.items) {
      if (item.source === "EXPERIENCE") {
        if (!item.experienceId) continue;
        const exp = getExperienceById(item.experienceId);
        if (!exp?.entryRoute?.startsWith("/")) continue;
      }
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push({ ...item });
    }
  }

  return out;
}

export function getProgramSequence(
  id: ProgramSequenceId,
): ProgramSequenceDefinition | undefined {
  return PROGRAM_SEQUENCE_REGISTRY[id];
}

export function assertProgramQueueRegistryIntegrity(): void {
  const queue = getDefaultProgramQueue();
  if (queue.length === 0) {
    throw new Error("ProgramQueueRegistry: no resolvable EXPERIENCE queue items");
  }
  for (const item of queue) {
    if (item.source !== "EXPERIENCE" || !item.experienceId) continue;
    const exp = getExperienceById(item.experienceId);
    if (!exp?.entryRoute?.startsWith("/")) {
      throw new Error(
        `ProgramQueueRegistry: experience ${item.experienceId} missing entryRoute`,
      );
    }
  }
}
