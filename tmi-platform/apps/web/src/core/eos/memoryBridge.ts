/**
 * EOS Phase 7 — Memory Wall bridge (Rule 8)
 *
 * Adapters between EOS MemoryLedger / HighlightEngine and the existing
 * `types/memory.ts` MemoryItem shape used by MemoryWall UI.
 *
 * Does NOT replace MemoryWall, MemoryWallCanister, or types/memory.ts.
 * Callers may pass `[]` when the ledger has no rows (Rule 14 honest empty).
 */

import type { MemoryItem } from "@/types/memory";
import type { MemoryHighlight, MemoryImportance } from "./memoryRegistry";
import { getHighlightsByActor } from "./highlightEngine";

/** Map EOS importance → MemoryItem.kind (closest existing UI kind). */
function importanceToKind(importance: MemoryImportance): MemoryItem["kind"] {
  switch (importance) {
    case "LEGENDARY":
      return "prize";
    case "FEATURED":
      return "badge";
    case "IMPORTANT":
      return "event-poster";
    default:
      return "polaroid";
  }
}

/**
 * Convert a promoted highlight into a MemoryWall-consumable MemoryItem.
 * No fabricated media URLs or viewer counts — mediaUrl omitted until real.
 */
export function highlightToMemoryItem(highlight: MemoryHighlight): MemoryItem {
  const { entry, importance, label, icon } = highlight;
  const eventTitle =
    typeof entry.payload?.eventType === "string"
      ? String(entry.payload.eventType)
      : undefined;

  return {
    id: entry.id,
    kind: importanceToKind(importance),
    title: `${icon} ${label}`,
    subtitle: eventTitle ? `Event: ${eventTitle}` : undefined,
    eventId: entry.roomId ?? entry.experienceId,
    eventTitle,
    date: new Date(entry.occurredAtMs).toISOString(),
    visibility: "public",
    capturedAt: new Date(entry.occurredAtMs).toISOString(),
  };
}

/**
 * Actor-scoped highlights shaped for MemoryWall.
 * Alias preferred by Phase 7 consumers (`getHighlightsForActor`).
 * Returns [] when the in-memory ledger has nothing yet (honest empty).
 */
export function getHighlightsForActor(actorId: string): MemoryItem[] {
  if (!actorId.trim()) return [];
  return getHighlightsByActor(actorId).map(highlightToMemoryItem);
}
