export type SeatConfidenceLevel = "uncertain" | "claimed" | "held" | "confirmed" | "locked";

export interface BotSeatConfidence {
  botId: string;
  venueId: string;
  seatId: string;
  confidence: number;
  level: SeatConfidenceLevel;
  claimedAt: string;
  confirmedAt?: string;
  expiresAt?: string;
  contestedBy?: string;
}

const confidenceMap = new Map<string, BotSeatConfidence>();

function key(botId: string, venueId: string) { return `${botId}@${venueId}`; }

function levelFromScore(score: number): SeatConfidenceLevel {
  if (score < 20) return "uncertain";
  if (score < 40) return "claimed";
  if (score < 65) return "held";
  if (score < 90) return "confirmed";
  return "locked";
}

export function claimSeat(
  botId: string,
  venueId: string,
  seatId: string,
  initialConfidence = 30,
  expiresInMs = 5 * 60 * 1000,
): BotSeatConfidence {
  const record: BotSeatConfidence = {
    botId,
    venueId,
    seatId,
    confidence: initialConfidence,
    level: levelFromScore(initialConfidence),
    claimedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
  };
  confidenceMap.set(key(botId, venueId), record);
  return record;
}

export function increaseConfidence(botId: string, venueId: string, amount = 15): BotSeatConfidence | null {
  const k = key(botId, venueId);
  const record = confidenceMap.get(k);
  if (!record) return null;
  const confidence = Math.min(100, record.confidence + amount);
  const next: BotSeatConfidence = {
    ...record,
    confidence,
    level: levelFromScore(confidence),
    confirmedAt: confidence >= 65 ? (record.confirmedAt ?? new Date().toISOString()) : record.confirmedAt,
  };
  confidenceMap.set(k, next);
  return next;
}

export function decreaseConfidence(botId: string, venueId: string, amount = 20): BotSeatConfidence | null {
  const k = key(botId, venueId);
  const record = confidenceMap.get(k);
  if (!record) return null;
  const confidence = Math.max(0, record.confidence - amount);
  const next: BotSeatConfidence = { ...record, confidence, level: levelFromScore(confidence) };
  confidenceMap.set(k, next);
  return next;
}

export function contestSeat(botId: string, venueId: string, contestingBotId: string): BotSeatConfidence | null {
  const record = confidenceMap.get(key(botId, venueId));
  if (!record) return null;
  const next: BotSeatConfidence = { ...record, contestedBy: contestingBotId };
  confidenceMap.set(key(botId, venueId), next);
  return decreaseConfidence(botId, venueId, 25);
}

export function getSeatConfidence(botId: string, venueId: string): BotSeatConfidence | null {
  const record = confidenceMap.get(key(botId, venueId));
  if (!record) return null;
  if (record.expiresAt && new Date().toISOString() > record.expiresAt) {
    confidenceMap.delete(key(botId, venueId));
    return null;
  }
  return record;
}

export function releaseSeatClaim(botId: string, venueId: string): void {
  confidenceMap.delete(key(botId, venueId));
}

export function getConfidentSeats(venueId: string, minLevel: SeatConfidenceLevel = "confirmed"): BotSeatConfidence[] {
  const levelOrder: SeatConfidenceLevel[] = ["uncertain", "claimed", "held", "confirmed", "locked"];
  const minIdx = levelOrder.indexOf(minLevel);
  return [...confidenceMap.values()].filter(
    (r) => r.venueId === venueId && levelOrder.indexOf(r.level) >= minIdx,
  );
}
