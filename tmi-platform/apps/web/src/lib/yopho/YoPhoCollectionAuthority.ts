/**
 * YoPhoCollectionAuthority — MY YOPHOS collection + slot capacity (§6177–§6222, §6286–§6287).
 *
 * Reuses existing edition + published-card + living-project stores.
 * Does not invent a second card database. CREATE workspace dirty state is
 * in-memory (drawer) plus the existing composition localStorage draft.
 */

import { listEditionsForCreator, type YoPhoEditionRecord } from "./YoPhoEditionEngine";
import { listPublishedCardsLocal, type PublishedYoPhoCard } from "./YoPhoCardRegistry";
import { listYoPhoLivingProjects } from "./living/YoPhoLivingProjectStore";
import type { YoPhoLivingProject } from "./living/YoPhoLivingProject";
import { getPortraitEntitlement } from "./YoPhoPortraitEngine";
import { normalizeYoPhoTier } from "./YoPhoImageCapacity";

export type YoPhoCollectionStatus = "DRAFT" | "CURRENT" | "ARCHIVED" | "SAVED";

export interface YoPhoCollectionItem {
  id: string;
  title: string;
  status: YoPhoCollectionStatus;
  kind: "edition" | "published" | "living";
  updatedAt: string;
  editionNumber: number | null;
  retired: boolean;
  cardId: string | null;
}

export interface YoPhoSlotSnapshot {
  tierKey: string;
  activeCount: number;
  maxActive: number;
  remaining: number;
  retiredCount: number;
  upgradeHref: string;
  full: boolean;
}

export function listMyYophos(ownerKey: string): YoPhoCollectionItem[] {
  const byId = new Map<string, YoPhoCollectionItem>();

  for (const ed of listEditionsForCreator(ownerKey)) {
    byId.set(ed.id, {
      id: ed.id,
      title: ed.title,
      status: ed.status === "ARCHIVED" ? "ARCHIVED" : ed.status === "CURRENT" ? "CURRENT" : "DRAFT",
      kind: "edition",
      updatedAt: ed.updatedAt,
      editionNumber: ed.editionNumber || null,
      retired: ed.status === "ARCHIVED",
      cardId: ed.id,
    });
  }

  for (const card of listPublishedCardsLocal()) {
    if (ownerKey && card.ownerKey && card.ownerKey !== ownerKey) continue;
    if (byId.has(card.cardId)) {
      const prev = byId.get(card.cardId)!;
      byId.set(card.cardId, { ...prev, title: prev.title || card.editionTitle || card.displayName, kind: prev.kind });
      continue;
    }
    byId.set(card.cardId, {
      id: card.cardId,
      title: card.editionTitle || card.displayName || "YoPho",
      status: card.isCanonical ? "CURRENT" : "SAVED",
      kind: "published",
      updatedAt: card.updatedAt,
      editionNumber: null,
      retired: false,
      cardId: card.cardId,
    });
  }

  for (const project of listYoPhoLivingProjects()) {
    if (ownerKey && project.ownerId && project.ownerId !== ownerKey && ownerKey !== "local") continue;
    if (byId.has(project.projectId)) continue;
    byId.set(project.projectId, {
      id: project.projectId,
      title: project.title,
      status: "DRAFT",
      kind: "living",
      updatedAt: project.updatedAt,
      editionNumber: null,
      retired: false,
      cardId: null,
    });
  }

  return Array.from(byId.values()).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getYoPhoSlotSnapshot(
  ownerKey: string,
  tierOrRole?: string | null,
): YoPhoSlotSnapshot {
  const tierKey = normalizeYoPhoTier(tierOrRole);
  const entitlement = getPortraitEntitlement(tierKey === "BAND" ? "PLATINUM" : tierKey);
  const items = listMyYophos(ownerKey);
  const activeCount = items.filter((i) => !i.retired && i.status !== "ARCHIVED").length;
  const retiredCount = items.filter((i) => i.retired || i.status === "ARCHIVED").length;
  const maxActive = entitlement.maxSavedEditions;
  return {
    tierKey,
    activeCount,
    maxActive,
    remaining: Math.max(0, maxActive - activeCount),
    retiredCount,
    upgradeHref: "/account/subscription",
    full: activeCount >= maxActive,
  };
}

export function canActivateAnotherYoPho(ownerKey: string, tierOrRole?: string | null): boolean {
  return !getYoPhoSlotSnapshot(ownerKey, tierOrRole).full;
}

export function collectionItemFromEdition(ed: YoPhoEditionRecord): YoPhoCollectionItem {
  return {
    id: ed.id,
    title: ed.title,
    status: ed.status === "ARCHIVED" ? "ARCHIVED" : ed.status === "CURRENT" ? "CURRENT" : "DRAFT",
    kind: "edition",
    updatedAt: ed.updatedAt,
    editionNumber: ed.editionNumber || null,
    retired: ed.status === "ARCHIVED",
    cardId: ed.id,
  };
}

export function publishedCardTitle(card: PublishedYoPhoCard): string {
  return card.editionTitle || card.displayName || "YoPho";
}

export function livingProjectTitle(project: YoPhoLivingProject): string {
  return project.title;
}
