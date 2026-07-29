/**
 * EOS Layer 6 — Memory → friend-activity bridge (optional, honest).
 *
 * Maps MemoryLedger WINNER_DECLARED entries into FRIEND_ACTIVITY-shaped
 * suggestions for Auto-Director / ProgramBoard — ONLY when the winner is an
 * ACTIVE FRIEND of the viewer in the supplied RelationshipGraphEngine.
 *
 * Empty graph or no friend wins → [] (Rule 20). Never fabricates friends.
 */

import type { LedgerEntry } from "@/core/eos/memoryRegistry";
import type { ProgramBoardSource } from "@/core/eos/programBoard";
import { MemoryLedger } from "@/core/eos/memoryLedger";
import type { RelationshipGraphEngine } from "@/lib/eos/RelationshipGraphEngine";
import { RelationshipGraph } from "@/lib/eos/RelationshipGraphEngine";

/** Suggestion shape compatible with ProgramBoard FRIEND_ACTIVITY / Auto-Director pools. */
export interface FriendActivitySuggestion {
  id: string;
  source: Extract<ProgramBoardSource, "FRIEND_ACTIVITY">;
  contentType: "LIVE_PREVIEW";
  contentId: string;
  /** Real room route when roomId is present; otherwise omitted (drop from clickable pools). */
  entryRoute?: string;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  priority: number;
  friendUserId: string;
  ledgerEntryId: string;
}

export interface FriendActivityBridgeOptions {
  viewerUserId: string;
  /** Defaults to shared RelationshipGraph singleton */
  graph?: RelationshipGraphEngine;
  /** Defaults to MemoryLedger.getAll() filtered to WINNER_DECLARED */
  entries?: readonly LedgerEntry[];
  /** Max suggestions to return (default 5) */
  limit?: number;
}

function entryRouteFor(entry: LedgerEntry): string | undefined {
  if (entry.roomId?.trim()) {
    return `/live/rooms/${entry.roomId}`;
  }
  return undefined;
}

/**
 * Build friend-activity suggestions from WINNER_DECLARED ledger facts.
 * Returns [] when the viewer has no friends in the graph or no matching wins.
 */
export function winnerDeclaredToFriendActivity(
  options: FriendActivityBridgeOptions,
): FriendActivitySuggestion[] {
  const viewerUserId = options.viewerUserId?.trim();
  if (!viewerUserId) return [];

  const graph = options.graph ?? RelationshipGraph;
  const friends = graph.getFriends(viewerUserId);
  if (!friends.length) return [];

  const friendIds = new Set(friends.map((f) => f.userId));
  const limit = options.limit ?? 5;
  const entries =
    options.entries ??
    MemoryLedger.getAll().filter((e) => e.kind === "WINNER_DECLARED");

  const out: FriendActivitySuggestion[] = [];

  for (const entry of entries) {
    if (out.length >= limit) break;
    if (!friendIds.has(entry.actorId)) continue;
    if (graph.isBlocked(viewerUserId, entry.actorId)) continue;

    const entryRoute = entryRouteFor(entry);
    out.push({
      id: `friend-win-${entry.id}`,
      source: "FRIEND_ACTIVITY",
      contentType: "LIVE_PREVIEW",
      contentId: entry.experienceId ?? entry.roomId ?? entry.id,
      entryRoute,
      title: "Friend won a match",
      subtitle: "A friend was declared winner — open the room if still live",
      icon: "🏆",
      accentColor: "#FFD700",
      priority: 160,
      friendUserId: entry.actorId,
      ledgerEntryId: entry.id,
    });
  }

  return out;
}

/**
 * Narrow to Auto-Director-compatible rows (requires a real entryRoute).
 * Drops suggestions without a destination — Rule 14 no dead cards.
 */
export function friendActivityToAutoDirectorPreviews(
  options: FriendActivityBridgeOptions,
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
  return winnerDeclaredToFriendActivity(options)
    .filter((s): s is FriendActivitySuggestion & { entryRoute: string } =>
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
