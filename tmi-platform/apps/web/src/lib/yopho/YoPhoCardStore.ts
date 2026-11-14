/**
 * Server-side in-memory store for published YoPho interactive cards.
 * Soft-launch glue — swap for DB later. Survives within the Node process.
 *
 * YoPho Lounge Wall Placement Law (deferred post–Step 5A):
 * `.cursor/artifacts/yopho-lounge/TMI_YOPHO_LOUNGE_WALL_PLACEMENT_LAW.md`
 * This store is authoring/publish persistence only — not lounge socket placement.
 */

import type { PublishedYoPhoCard } from "./YoPhoCardRegistry";

const cards = new Map<string, PublishedYoPhoCard>();

export function upsertYoPhoCard(card: PublishedYoPhoCard): PublishedYoPhoCard {
  const next = { ...card, updatedAt: new Date().toISOString() };
  cards.set(next.cardId, next);
  return next;
}

export function getYoPhoCard(cardId: string): PublishedYoPhoCard | null {
  return cards.get(cardId) ?? null;
}

export function listYoPhoCards(limit = 40): PublishedYoPhoCard[] {
  return Array.from(cards.values())
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, limit);
}
