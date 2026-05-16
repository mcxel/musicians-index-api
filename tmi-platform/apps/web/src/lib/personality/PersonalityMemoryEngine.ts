/**
 * PersonalityMemoryEngine
 * Stores and retrieves interaction memories for hosts, Julius, and NPCs.
 * Shapes future behavior by surfacing relevant past context.
 */

export type MemoryCategory =
  | "crowd-reaction"
  | "performer-interaction"
  | "fan-moment"
  | "revenue-event"
  | "conflict"
  | "victory"
  | "callback-opportunity"
  | "running-joke"
  | "escalation";

export interface PersonalityMemory {
  memoryId: string;
  entityId: string;
  category: MemoryCategory;
  summary: string;
  emotionalWeight: number;    // 0-1; higher = more likely to surface
  recalledCount: number;
  createdAt: number;
  lastRecalledAt: number | null;
  expiresAt: number | null;
  tags: string[];
}

export interface MemoryRecallResult {
  entityId: string;
  recalled: PersonalityMemory[];
  context: string;
  recalledAt: number;
}

const MAX_MEMORIES_PER_ENTITY = 50;
const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const memoryStore = new Map<string, PersonalityMemory[]>();

function getEntityMemories(entityId: string): PersonalityMemory[] {
  return memoryStore.get(entityId) ?? [];
}

function setEntityMemories(entityId: string, memories: PersonalityMemory[]): void {
  // Evict lowest-weight memories when at cap
  let sorted = memories.sort((a, b) => b.emotionalWeight - a.emotionalWeight);
  if (sorted.length > MAX_MEMORIES_PER_ENTITY) {
    sorted = sorted.slice(0, MAX_MEMORIES_PER_ENTITY);
  }
  memoryStore.set(entityId, sorted);
}

export function storeMemory(
  entityId: string,
  category: MemoryCategory,
  summary: string,
  opts: {
    emotionalWeight?: number;
    ttlMs?: number;
    tags?: string[];
  } = {}
): PersonalityMemory {
  const memoryId = `mem_${entityId}_${category}_${Date.now()}`;
  const memory: PersonalityMemory = {
    memoryId, entityId, category, summary,
    emotionalWeight: opts.emotionalWeight ?? 0.5,
    recalledCount: 0,
    createdAt: Date.now(),
    lastRecalledAt: null,
    expiresAt: opts.ttlMs !== undefined ? Date.now() + opts.ttlMs : Date.now() + DEFAULT_TTL_MS,
    tags: opts.tags ?? [],
  };

  const existing = getEntityMemories(entityId);
  setEntityMemories(entityId, [...existing, memory]);
  return memory;
}

export function recallMemories(
  entityId: string,
  context: string,
  opts: {
    limit?: number;
    categories?: MemoryCategory[];
    minWeight?: number;
    tags?: string[];
  } = {}
): MemoryRecallResult {
  const now = Date.now();
  const limit = opts.limit ?? 5;
  const minWeight = opts.minWeight ?? 0;

  let memories = getEntityMemories(entityId).filter(m => {
    if (m.expiresAt !== null && m.expiresAt < now) return false;
    if (m.emotionalWeight < minWeight) return false;
    if (opts.categories && !opts.categories.includes(m.category)) return false;
    if (opts.tags?.length && !opts.tags.some(t => m.tags.includes(t))) return false;
    return true;
  });

  // Score: weight × recency decay × recall penalty
  memories = memories.sort((a, b) => {
    const ageA = (now - a.createdAt) / 3_600_000;
    const ageB = (now - b.createdAt) / 3_600_000;
    const scoreA = a.emotionalWeight * Math.exp(-ageA * 0.1) * (1 / (1 + a.recalledCount));
    const scoreB = b.emotionalWeight * Math.exp(-ageB * 0.1) * (1 / (1 + b.recalledCount));
    return scoreB - scoreA;
  });

  const recalled = memories.slice(0, limit);

  // Update recall counts
  const all = getEntityMemories(entityId);
  const recalledIds = new Set(recalled.map(m => m.memoryId));
  setEntityMemories(entityId, all.map(m =>
    recalledIds.has(m.memoryId)
      ? { ...m, recalledCount: m.recalledCount + 1, lastRecalledAt: now }
      : m
  ));

  return { entityId, recalled, context, recalledAt: now };
}

export function forgetMemory(entityId: string, memoryId: string): boolean {
  const existing = getEntityMemories(entityId);
  const filtered = existing.filter(m => m.memoryId !== memoryId);
  if (filtered.length === existing.length) return false;
  memoryStore.set(entityId, filtered);
  return true;
}

export function clearExpiredMemories(entityId: string): number {
  const now = Date.now();
  const existing = getEntityMemories(entityId);
  const fresh = existing.filter(m => m.expiresAt === null || m.expiresAt >= now);
  memoryStore.set(entityId, fresh);
  return existing.length - fresh.length;
}

export function getMemoryStats(entityId: string): {
  total: number;
  byCategory: Record<string, number>;
  avgWeight: number;
} {
  const memories = getEntityMemories(entityId);
  const byCategory: Record<string, number> = {};
  let weightSum = 0;
  for (const m of memories) {
    byCategory[m.category] = (byCategory[m.category] ?? 0) + 1;
    weightSum += m.emotionalWeight;
  }
  return {
    total: memories.length,
    byCategory,
    avgWeight: memories.length ? weightSum / memories.length : 0,
  };
}
