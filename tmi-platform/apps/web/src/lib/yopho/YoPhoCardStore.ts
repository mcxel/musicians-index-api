/**
 * Server-side in-memory store for published YoPho interactive cards.
 * Soft-launch glue — swap for DB later. Survives within the Node process.
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
