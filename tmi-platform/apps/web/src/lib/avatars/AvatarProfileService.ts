"use client";

import { getAvatarProceduralDNA } from "./ProceduralStyleMatrix";

export interface AvatarProfileSnapshot {
  userId: string;
  danceStyle: string;
  reactionSpeed: number;
  confidence: number;
  xp: number;
  concertsAttended: number;
  streakDays: number;
  glowEnabled: boolean;
  primaryColor: string;
  unlockedKeys: string[];
  frequentReactions: string[];
  milestones: Array<{ key: string; desc: string }>;
}

// Client-side cache to minimize API round trips
const profileCache = new Map<string, AvatarProfileSnapshot>();

// Dirty tracking queue for asynchronous batching
const pendingXp = new Map<string, number>();
const pendingReactions = new Map<string, string[]>();
let flushTimer: NodeJS.Timeout | null = null;

/**
 * Loads the user's canonical avatar profile.
 * If cached, resolves immediately. Otherwise fetches from /api/avatar/profile
 */
export async function loadAvatarProfile(userId: string, forceRefresh = false): Promise<AvatarProfileSnapshot> {
  if (!forceRefresh && profileCache.has(userId)) {
    return profileCache.get(userId)!;
  }

  try {
    const res = await fetch(`/api/avatar/profile?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.ok && data.profile) {
      profileCache.set(userId, data.profile);
      return data.profile;
    }
  } catch (e) {
    console.error("Failed to load avatar profile, returning client defaults:", e);
  }

  // Fallback to deterministic defaults if API is offline or not found
  const dna = getAvatarProceduralDNA(userId);
  const fallback: AvatarProfileSnapshot = {
    userId,
    danceStyle: dna.swagger,
    reactionSpeed: dna.timingOffsetMs,
    confidence: dna.intensityMultiplier,
    xp: 0,
    concertsAttended: 0,
    streakDays: 0,
    glowEnabled: true,
    primaryColor: "#FF2DAA",
    unlockedKeys: ["CROWD_WAVE"],
    frequentReactions: [],
    milestones: [],
  };
  profileCache.set(userId, fallback);
  return fallback;
}

/**
 * Enqueues XP gains asynchronously.
 * Batches writes together every 10 seconds to avoid database locks during live events.
 */
export function enqueueXpGain(userId: string, amount: number) {
  // Update local cache immediately so UI is snappy
  const cached = profileCache.get(userId);
  if (cached) {
    cached.xp += amount;
    profileCache.set(userId, { ...cached });
  }

  // Queue background update
  const cur = pendingXp.get(userId) || 0;
  pendingXp.set(userId, cur + amount);

  scheduleQueueFlush();
}

/**
 * Enqueues reaction metrics asynchronously.
 */
export function enqueueReactionMetric(userId: string, reaction: string) {
  const cached = profileCache.get(userId);
  if (cached) {
    if (!cached.frequentReactions.includes(reaction)) {
      cached.frequentReactions = [...cached.frequentReactions.slice(-4), reaction];
      profileCache.set(userId, { ...cached });
    }
  }

  const cur = pendingReactions.get(userId) || [];
  if (!cur.includes(reaction)) {
    pendingReactions.set(userId, [...cur.slice(-4), reaction]);
  }

  scheduleQueueFlush();
}

/**
 * Trigger background API updates
 */
export async function flushBatchQueue() {
  if (pendingXp.size === 0 && pendingReactions.size === 0) return;

  // The API only ever syncs the authenticated caller's own avatar (Rule 26 —
  // avatar data is Fan-private, no cross-user writes) so each queued userId
  // is flushed as its own request rather than one batched cross-user call.
  const userIds = new Set([...pendingXp.keys(), ...pendingReactions.keys()]);
  const flushes = Array.from(userIds).map(async (userId) => {
    const xp = pendingXp.get(userId);
    const reactions = pendingReactions.get(userId);
    try {
      await fetch("/api/avatar/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "batch_sync", xp, reactions }),
      });
    } catch (e) {
      console.error("Failed to flush avatar progress queue:", e);
    }
  });

  pendingXp.clear();
  pendingReactions.clear();

  await Promise.all(flushes);
}

function scheduleQueueFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    await flushBatchQueue();
  }, 10000);
}

// Automatically flush queue when tab closes or refreshes
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    flushBatchQueue();
  });
}
