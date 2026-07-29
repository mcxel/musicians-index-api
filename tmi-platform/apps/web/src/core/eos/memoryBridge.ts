/**
 * EOS Phase 7 — Achievement / history adapter (NOT Memory Wall scrapbook)
 *
 * Adapts EOS MemoryLedger / HighlightEngine → legacy `types/memory.ts` MemoryItem
 * for achievement/history surfaces only.
 *
 * PRODUCT LOCK: Do NOT feed MATCH_COMPLETED / WINNER_DECLARED into the Memory &
 * Collectibles photo wall. Use `achievementBridge` for competition drafts and
 * `lib/memory/collectiblesPersistence` for photos/tickets/YoPho/posters.
 *
 * Callers may pass `[]` when the ledger has no rows (Rule 14 honest empty).
 */

import type { MemoryItem } from "@/types/memory";
import type { MemoryHighlight, MemoryImportance } from "./memoryRegistry";
import { getHighlightsByActor } from "./highlightEngine";
import {
  getAchievementDraftsForActor,
  type AchievementDraft,
} from "./achievementBridge";

/** Map EOS importance → MemoryItem.kind (closest existing UI kind) — achievement path only. */
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
 * Convert a promoted highlight into a MemoryItem for achievement/history UI.
 * No fabricated media URLs — mediaUrl omitted until real.
 * @deprecated-for-photo-wall Prefer achievementBridge for competition events;
 * use collectiblesPersistence for Memory Wall media.
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
 * Actor-scoped competition/runtime highlights as MemoryItem (achievement path).
 * Returns [] when the in-memory ledger has nothing — never writes to photo wall.
 */
export function getHighlightsForActor(actorId: string): MemoryItem[] {
  if (!actorId.trim()) return [];
  return getHighlightsByActor(actorId).map(highlightToMemoryItem);
}

/** Typed achievement drafts for future Achievement Engine (no fake UI). */
export function getAchievementHistoryForActor(actorId: string): AchievementDraft[] {
  return getAchievementDraftsForActor(actorId);
}
