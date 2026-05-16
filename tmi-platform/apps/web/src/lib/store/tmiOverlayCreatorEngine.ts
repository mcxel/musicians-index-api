import type { TmiOverlayCategory, TmiOverlayRarity } from "@/lib/store/tmiOverlayMarketplaceEngine";

export type TmiOverlayDraftStatus = "draft" | "submitted" | "approved" | "rejected" | "published";

export type TmiOverlayDraft = {
  id: string;
  creatorId: string;
  title: string;
  category: TmiOverlayCategory;
  rarity: TmiOverlayRarity;
  neonPreset: string;
  animationPreset: string;
  shapePreset: string;
  status: TmiOverlayDraftStatus;
  rejectionReason?: string;
  createdAt: number;
  updatedAt: number;
};

const DRAFTS: TmiOverlayDraft[] = [];

export function createOverlayDraft(input: Omit<TmiOverlayDraft, "id" | "status" | "createdAt" | "updatedAt">) {
  const row: TmiOverlayDraft = {
    ...input,
    id: `draft_${Math.random().toString(36).slice(2, 10)}`,
    status: "draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  DRAFTS.push(row);
  return row;
}

export function submitOverlayDraft(creatorId: string, draftId: string) {
  const target = DRAFTS.find((x) => x.id === draftId && x.creatorId === creatorId);
  if (!target) return { ok: false, reason: "DRAFT_NOT_FOUND" } as const;
  target.status = "submitted";
  target.updatedAt = Date.now();
  return { ok: true, draft: target } as const;
}

export function approveOverlayDraft(draftId: string) {
  const target = DRAFTS.find((x) => x.id === draftId);
  if (!target) return { ok: false, reason: "DRAFT_NOT_FOUND" } as const;
  target.status = "approved";
  target.rejectionReason = undefined;
  target.updatedAt = Date.now();
  return { ok: true, draft: target } as const;
}

export function rejectOverlayDraft(draftId: string, reason: string) {
  const target = DRAFTS.find((x) => x.id === draftId);
  if (!target) return { ok: false, reason: "DRAFT_NOT_FOUND" } as const;
  target.status = "rejected";
  target.rejectionReason = reason;
  target.updatedAt = Date.now();
  return { ok: true, draft: target } as const;
}

export function publishOverlay(draftId: string) {
  const target = DRAFTS.find((x) => x.id === draftId);
  if (!target) return { ok: false, reason: "DRAFT_NOT_FOUND" } as const;
  if (target.status !== "approved") return { ok: false, reason: "DRAFT_NOT_APPROVED" } as const;
  target.status = "published";
  target.updatedAt = Date.now();
  return { ok: true, draft: target } as const;
}

export function listCreatorDrafts(creatorId: string) {
  return DRAFTS.filter((x) => x.creatorId === creatorId);
}
