/**
 * AvatarInteractionMemoryEngine
 * Maintains a rolling memory of meaningful avatar interactions.
 * Used to avoid repeating the same behavior and to inform future tuning.
 * Bounded: never grows unbounded, never stores sensitive personal data.
 */

import type { InteractionType } from "@/lib/avatar/AvatarLearningEngine";

export interface InteractionMemoryEntry {
  avatarId: string;
  interactionType: InteractionType;
  context: string;
  timestamp: number;
  repeatCount: number;
  lastSignal: "positive" | "negative" | "neutral";
}

export interface AvatarInteractionMemory {
  avatarId: string;
  entries: InteractionMemoryEntry[];
  uniqueContextsExperienced: number;
  dominantInteractionType: InteractionType | null;
  lastReset: number;
}

const MAX_ENTRIES = 150;
const memoryStore = new Map<string, AvatarInteractionMemory>();

function getMemory(avatarId: string): AvatarInteractionMemory {
  const existing = memoryStore.get(avatarId);
  if (existing) return existing;
  const fresh: AvatarInteractionMemory = {
    avatarId,
    entries: [],
    uniqueContextsExperienced: 0,
    dominantInteractionType: null,
    lastReset: Date.now(),
  };
  memoryStore.set(avatarId, fresh);
  return fresh;
}

export function recordMemoryEntry(
  avatarId: string,
  type: InteractionType,
  context: string,
  signal: "positive" | "negative" | "neutral"
): InteractionMemoryEntry {
  const mem = getMemory(avatarId);
  const existing = mem.entries.find(e => e.interactionType === type && e.context === context);

  let entry: InteractionMemoryEntry;
  if (existing) {
    existing.repeatCount += 1;
    existing.lastSignal = signal;
    existing.timestamp = Date.now();
    entry = existing;
  } else {
    entry = { avatarId, interactionType: type, context, timestamp: Date.now(), repeatCount: 1, lastSignal: signal };
    mem.entries.unshift(entry);
  }

  const trimmed = mem.entries.slice(0, MAX_ENTRIES);
  const contextSet = new Set(trimmed.map(e => e.context));
  const typeCounts = trimmed.reduce<Record<string, number>>((acc, e) => {
    acc[e.interactionType] = (acc[e.interactionType] ?? 0) + e.repeatCount;
    return acc;
  }, {});
  const dominant = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as InteractionType | undefined;

  memoryStore.set(avatarId, {
    ...mem,
    entries: trimmed,
    uniqueContextsExperienced: contextSet.size,
    dominantInteractionType: dominant ?? null,
  });
  return entry;
}

export function getAvatarMemory(avatarId: string): AvatarInteractionMemory {
  return getMemory(avatarId);
}

export function hasExperienced(avatarId: string, type: InteractionType): boolean {
  return getMemory(avatarId).entries.some(e => e.interactionType === type);
}

export function getMostRepeatedInteraction(avatarId: string): InteractionMemoryEntry | null {
  const entries = getMemory(avatarId).entries;
  if (entries.length === 0) return null;
  return entries.reduce((max, e) => (e.repeatCount > max.repeatCount ? e : max), entries[0]);
}

export function clearMemory(avatarId: string): void {
  memoryStore.set(avatarId, {
    avatarId,
    entries: [],
    uniqueContextsExperienced: 0,
    dominantInteractionType: null,
    lastReset: Date.now(),
  });
}
