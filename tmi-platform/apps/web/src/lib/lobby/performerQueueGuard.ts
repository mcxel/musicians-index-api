import type { PerformerQueueEntry } from "@/lib/lobby/performerQueueState";

export type QueueGuardAction =
  | { type: "none" }
  | { type: "autoSkip"; performerId: string; reason: string }
  | { type: "failedEntryFallback"; performerId: string; reason: string }
  | { type: "hostOverride"; performerId: string; reason: string };

export function evaluatePerformerQueueGuard(
  entries: PerformerQueueEntry[],
  nowMs = Date.now(),
): QueueGuardAction {
  const onDeckEntry = entries.find((entry) => entry.state === "onDeck");
  if (!onDeckEntry) return { type: "none" };

  if (onDeckEntry.readyTimerEndsAt !== null && nowMs >= onDeckEntry.readyTimerEndsAt) {
    return {
      type: "autoSkip",
      performerId: onDeckEntry.performerId,
      reason: "Performer ready timer expired",
    };
  }

  return { type: "none" };
}

export function markFailedEntry(
  entries: PerformerQueueEntry[],
  performerId: string,
): { updated: PerformerQueueEntry[]; action: QueueGuardAction } {
  const target = entries.find((entry) => entry.performerId === performerId);
  if (!target) return { updated: entries, action: { type: "none" } };

  const updated = entries.map((entry) =>
    entry.performerId === performerId
      ? { ...entry, failedEntryCount: entry.failedEntryCount + 1, state: "complete" as const }
      : entry,
  );

  return {
    updated,
    action: {
      type: "failedEntryFallback",
      performerId,
      reason: "Performer failed entry, fallback applied",
    },
  };
}

export function applyHostOverride(
  entries: PerformerQueueEntry[],
  performerId?: string,
): QueueGuardAction {
  const liveEntry = performerId
    ? entries.find((entry) => entry.performerId === performerId)
    : entries.find((entry) => entry.state === "onDeck" || entry.state === "waiting");

  if (!liveEntry) return { type: "none" };

  return {
    type: "hostOverride",
    performerId: liveEntry.performerId,
    reason: "Host override advanced performer",
  };
}
