// ReactionEngine — applause/boo meter, audience reactions, crowd events

export type ReactionType = "applause" | "boo" | "fire" | "heart" | "hype" | "crown" | "100" | "laugh" | "shocked" | "wave";

export type ReactionEvent = {
  id: string;
  venueSlug: string;
  userId: string;
  reaction: ReactionType;
  targetId: string | null; // performerId or null for venue-wide
  timestamp: number;
};

export type CrowdMeter = {
  venueSlug: string;
  appLausePower: number; // 0-100
  booMeter: number; // 0-100
  hypeLevel: number; // 0-100
  fireMeter: number; // 0-100
  reactionCounts: Record<ReactionType, number>;
  lastUpdated: number;
};

const reactionLog = new Map<string, ReactionEvent[]>();
const crowdMeters = new Map<string, CrowdMeter>();

const ALL_REACTIONS: ReactionType[] = ["applause","boo","fire","heart","hype","crown","100","laugh","shocked","wave"];

function initMeter(venueSlug: string): CrowdMeter {
  const counts = Object.fromEntries(ALL_REACTIONS.map((r) => [r, 0])) as Record<ReactionType, number>;
  return { venueSlug, appLausePower: 0, booMeter: 0, hypeLevel: 0, fireMeter: 0, reactionCounts: counts, lastUpdated: Date.now() };
}

export function getCrowdMeter(venueSlug: string): CrowdMeter {
  if (!crowdMeters.has(venueSlug)) crowdMeters.set(venueSlug, initMeter(venueSlug));
  return crowdMeters.get(venueSlug)!;
}

export function submitReaction(
  venueSlug: string,
  userId: string,
  reaction: ReactionType,
  targetId: string | null = null,
): ReactionEvent {
  if (!reactionLog.has(venueSlug)) reactionLog.set(venueSlug, []);

  const event: ReactionEvent = {
    id: `rxn-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    venueSlug,
    userId,
    reaction,
    targetId,
    timestamp: Date.now(),
  };

  const log = reactionLog.get(venueSlug)!;
  log.push(event);
  // keep last 2000 events
  if (log.length > 2000) log.splice(0, log.length - 2000);

  // Update meters
  const meter = getCrowdMeter(venueSlug);
  meter.reactionCounts[reaction] += 1;

  const total = Object.values(meter.reactionCounts).reduce((a, b) => a + b, 0) || 1;
  meter.appLausePower = Math.min(100, Math.round((meter.reactionCounts.applause / total) * 100 * 3));
  meter.booMeter = Math.min(100, Math.round((meter.reactionCounts.boo / total) * 100 * 3));
  meter.hypeLevel = Math.min(100, Math.round(((meter.reactionCounts.hype + meter.reactionCounts.fire) / total) * 100 * 3));
  meter.fireMeter = Math.min(100, Math.round((meter.reactionCounts.fire / total) * 100 * 3));
  meter.lastUpdated = Date.now();

  return event;
}

export function getRecentReactions(venueSlug: string, limit = 50): ReactionEvent[] {
  const log = reactionLog.get(venueSlug) ?? [];
  return log.slice(-limit);
}

export function resetMeter(venueSlug: string): void {
  crowdMeters.set(venueSlug, initMeter(venueSlug));
  reactionLog.set(venueSlug, []);
}
