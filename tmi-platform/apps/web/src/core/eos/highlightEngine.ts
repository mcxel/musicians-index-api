/**
 * EOS Phase 7 — Highlight Engine
 *
 * Subscribes to MemoryLedger and promotes significant entries into
 * MemoryHighlight objects with importance tiers.
 *
 * The ledger records facts; this layer assigns editorial weight.
 *
 * Auto-Director integration: subscribe via `subscribeHighlights()` to
 * surface "Champion crowned 2 minutes ago" on idle monitor slots.
 */

import {
  FEATURED_KINDS,
  IMPORTANT_KINDS,
  LEGENDARY_KINDS,
  MEMORY_ICONS,
  MEMORY_LABELS,
  type LedgerEntry,
  type MemoryHighlight,
  type MemoryImportance,
} from "./memoryRegistry";
import { MemoryLedger } from "./memoryLedger";

// ─── Importance resolution ────────────────────────────────────────────────────

function resolveImportance(entry: LedgerEntry): MemoryImportance {
  if (LEGENDARY_KINDS.has(entry.kind)) return "LEGENDARY";
  if (FEATURED_KINDS.has(entry.kind)) return "FEATURED";
  if (IMPORTANT_KINDS.has(entry.kind)) return "IMPORTANT";
  return "NORMAL";
}

/** Promote a single LedgerEntry into a MemoryHighlight. Pure — no side effects. */
export function promote(entry: LedgerEntry): MemoryHighlight {
  return {
    entry,
    importance: resolveImportance(entry),
    label: MEMORY_LABELS[entry.kind],
    icon: MEMORY_ICONS[entry.kind],
  };
}

// ─── Highlight subscription bus ───────────────────────────────────────────────

type HighlightSubscriber = (highlight: MemoryHighlight) => void;
const _highlightSubscribers = new Set<HighlightSubscriber>();

// Wire to ledger at module load — every new ledger entry flows here.
MemoryLedger.subscribe((entry) => {
  const highlight = promote(entry);
  for (const sub of _highlightSubscribers) {
    sub(highlight);
  }
});

/**
 * Subscribe to all promoted highlights as they arrive.
 * Returns an unsubscribe function — call on component unmount.
 */
export function subscribeHighlights(handler: HighlightSubscriber): () => void {
  _highlightSubscribers.add(handler);
  return () => _highlightSubscribers.delete(handler);
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

const IMPORTANCE_ORDER: readonly MemoryImportance[] = [
  "NORMAL",
  "IMPORTANT",
  "FEATURED",
  "LEGENDARY",
];

/** Returns highlights at or above the given minimum importance tier. */
export function filterByImportance(
  highlights: readonly MemoryHighlight[],
  minimum: MemoryImportance,
): MemoryHighlight[] {
  const minIdx = IMPORTANCE_ORDER.indexOf(minimum);
  return highlights.filter(
    (h) => IMPORTANCE_ORDER.indexOf(h.importance) >= minIdx,
  );
}

/** Snapshot of all past entries promoted to highlights, oldest first. */
export function getAllHighlights(): MemoryHighlight[] {
  return MemoryLedger.getAll().map(promote);
}

/** Snapshot for a specific actor. */
export function getHighlightsByActor(actorId: string): MemoryHighlight[] {
  return MemoryLedger.getByActor(actorId).map(promote);
}

/** Snapshot for a specific room. */
export function getHighlightsByRoom(roomId: string): MemoryHighlight[] {
  return MemoryLedger.getByRoom(roomId).map(promote);
}

// ─── Auto-Director optional feed ──────────────────────────────────────────────

export interface HighlightSuggestion {
  id: string;
  /** Prefer LIVE_PREVIEW for room-backed highlights; NEWS otherwise. */
  contentType: "LIVE_PREVIEW" | "NEWS";
  contentId: string;
  /** Real route only — omitted when no roomId (caller must skip). */
  entryRoute?: string;
  title: string;
  /** Honest copy — never includes fabricated viewer/opponent counts. */
  subtitle: string;
  icon: string;
  accentColor: string;
  priority: number;
  importance: MemoryImportance;
}

const HIGHLIGHT_ACCENT: Readonly<Record<MemoryImportance, string>> = {
  NORMAL: "#94a3b8",
  IMPORTANT: "#38bdf8",
  FEATURED: "#FFD700",
  LEGENDARY: "#FF2DAA",
};

/**
 * FEATURED / LEGENDARY highlights as Auto-Director / ProgramBoard suggestion
 * cards. Empty array when ledger has none — never fabricates wins (Rule 20).
 * Only attaches entryRoute when a real roomId was recorded.
 */
export function highlightsToSuggestions(
  minimum: MemoryImportance = "FEATURED",
): HighlightSuggestion[] {
  const eligible = filterByImportance(getAllHighlights(), minimum);
  return eligible.map((h) => {
    const roomId = h.entry.roomId;
    const contentType: HighlightSuggestion["contentType"] = roomId
      ? "LIVE_PREVIEW"
      : "NEWS";
    return {
      id: `highlight-${h.entry.id}`,
      contentType,
      contentId: h.entry.id,
      entryRoute: roomId ? `/live/rooms/${roomId}` : undefined,
      title: `${h.icon} ${h.label}`,
      subtitle:
        h.importance === "LEGENDARY"
          ? "Legendary moment recorded"
          : "Featured highlight recorded",
      icon: h.icon,
      accentColor: HIGHLIGHT_ACCENT[h.importance],
      priority: h.importance === "LEGENDARY" ? 250 : 180,
      importance: h.importance,
    };
  });
}

/**
 * Narrow to ResolvedAutoDirectorPreview-compatible rows (needs entryRoute).
 * Drop NEWS-only rows without a destination — Rule 14 no dead cards.
 */
export function highlightsToAutoDirectorPreviews(
  minimum: MemoryImportance = "FEATURED",
): Array<{
  id: string;
  lane: "LIVE_EXPERIENCE";
  contentType: "LIVE_PREVIEW";
  contentId: string;
  entryRoute: string;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  priority: number;
}> {
  return highlightsToSuggestions(minimum)
    .filter((s): s is HighlightSuggestion & { entryRoute: string } =>
      Boolean(s.entryRoute?.startsWith("/")),
    )
    .map((s) => ({
      id: s.id,
      lane: "LIVE_EXPERIENCE" as const,
      contentType: "LIVE_PREVIEW" as const,
      contentId: s.contentId,
      entryRoute: s.entryRoute,
      title: s.title,
      subtitle: s.subtitle,
      icon: s.icon,
      accentColor: s.accentColor,
      priority: s.priority,
    }));
}
