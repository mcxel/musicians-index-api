import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";
import type { CrowdArchetype } from "@/lib/rooms/CrowdIntentEngine";
import { getRoomPopulation } from "@/lib/rooms/RoomPopulationEngine";
import { getIntentSummary } from "@/lib/rooms/CrowdIntentEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CrowdArchetypeProfile = {
  archetype: CrowdArchetype;
  count: number;
  percent: number;
  dominantIntents: string[];
  engagementMultiplier: number;
};

export type CrowdArchetypeSnapshot = {
  roomId: ChatRoomId;
  total: number;
  profiles: CrowdArchetypeProfile[];
  dominant: CrowdArchetype;
  capturedAtMs: number;
};

// ─── Archetype definitions ────────────────────────────────────────────────────

type ArchetypeRule = {
  basePercent: number;
  heatThreshold?: number;
  heatBoost?: number;
  engagementMultiplier: number;
  dominantIntents: string[];
};

const ARCHETYPE_RULES: Record<CrowdArchetype, ArchetypeRule> = {
  superfan:    { basePercent: 12, heatThreshold: 60, heatBoost: 8,  engagementMultiplier: 1.8, dominantIntents: ["hype","encore","tip"] },
  critic:      { basePercent: 8,  heatThreshold: 30, heatBoost: 5,  engagementMultiplier: 1.2, dominantIntents: ["boo","ask","askQuestion"] },
  lurker:      { basePercent: 25, heatThreshold: 0,  heatBoost: 0,  engagementMultiplier: 0.4, dominantIntents: ["react"] },
  hypebot:     { basePercent: 10, heatThreshold: 50, heatBoost: 12, engagementMultiplier: 1.5, dominantIntents: ["hype","react","promote"] },
  casual:      { basePercent: 35, heatThreshold: 0,  heatBoost: 0,  engagementMultiplier: 1.0, dominantIntents: ["react","vote"] },
  sponsorRep:  { basePercent: 5,  heatThreshold: 0,  heatBoost: 0,  engagementMultiplier: 1.3, dominantIntents: ["promote","tip","vote"] },
};

const ARCHETYPE_ORDER: CrowdArchetype[] = ["superfan", "critic", "lurker", "hypebot", "casual", "sponsorRep"];

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeCrowdArchetypes(roomId: ChatRoomId): CrowdArchetypeSnapshot {
  const pop = getRoomPopulation(roomId);
  const summary = getIntentSummary(roomId, Date.now());
  const total = pop.audienceCount || 1;
  const heat = pop.heatLevel;

  const profiles: CrowdArchetypeProfile[] = ARCHETYPE_ORDER.map(archetype => {
    const rule = ARCHETYPE_RULES[archetype];
    const boost = heat >= (rule.heatThreshold ?? 0) ? (rule.heatBoost ?? 0) : 0;
    const rawPercent = Math.min(100, rule.basePercent + boost);
    const count = Math.round(total * rawPercent / 100);
    return {
      archetype,
      count,
      percent: rawPercent,
      dominantIntents: rule.dominantIntents,
      engagementMultiplier: rule.engagementMultiplier,
    };
  });

  // Dominant = highest engagement-weighted count
  const dominant = profiles.reduce((best, p) => {
    const score = p.count * p.engagementMultiplier;
    const bestScore = best.count * best.engagementMultiplier;
    return score > bestScore ? p : best;
  }, profiles[0]);

  // Apply intent summary: boost superfan if hype dominates
  if (summary.dominantIntent === "hype" || summary.hypeScore > 60) {
    const superfan = profiles.find(p => p.archetype === "superfan");
    if (superfan) superfan.percent = Math.min(100, superfan.percent + 5);
  }

  return {
    roomId,
    total,
    profiles,
    dominant: dominant.archetype,
    capturedAtMs: Date.now(),
  };
}

export function getArchetypeProfile(
  roomId: ChatRoomId,
  archetype: CrowdArchetype,
): CrowdArchetypeProfile | undefined {
  return computeCrowdArchetypes(roomId).profiles.find(p => p.archetype === archetype);
}

export function getDominantArchetype(roomId: ChatRoomId): CrowdArchetype {
  return computeCrowdArchetypes(roomId).dominant;
}
