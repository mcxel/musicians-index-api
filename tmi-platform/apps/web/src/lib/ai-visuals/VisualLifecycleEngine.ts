import { archiveVisualAsset } from "@/lib/ai-visuals/VisualArchiveEngine";
import { recycleVisualAsset } from "@/lib/ai-visuals/VisualRecycleEngine";
import { retireVisualAsset, deleteRetiredVisualAsset } from "@/lib/ai-visuals/VisualRetirementEngine";
import { queueVisualUpgrade } from "@/lib/ai-visuals/VisualUpgradeEngine";

export type VisualLifecycleState =
  | "active"
  | "archived"
  | "recycled"
  | "retired"
  | "deleted"
  | "frozen"
  | "upgraded";

export type VisualLifecycleDecision =
  | "keep"
  | "archive"
  | "recycle"
  | "retire"
  | "delete"
  | "freeze"
  | "upgrade";

export type VisualLifecycleRecord = {
  assetId: string;
  state: VisualLifecycleState;
  decision: VisualLifecycleDecision;
  reason: string;
  updatedAt: number;
};

const lifecycleMap = new Map<string, VisualLifecycleRecord>();

export function listVisualLifecycleRecords(): VisualLifecycleRecord[] {
  return [...lifecycleMap.values()];
}

export function getVisualLifecycleRecord(assetId: string): VisualLifecycleRecord | null {
  return lifecycleMap.get(assetId) ?? null;
}

export function applyVisualLifecycleDecision(input: {
  assetId: string;
  decision: VisualLifecycleDecision;
  reason: string;
  fromSlot?: string;
  toSlot?: string;
}): VisualLifecycleRecord {
  const now = Date.now();
  let state: VisualLifecycleState = "active";

  switch (input.decision) {
    case "keep":
      state = "active";
      break;
    case "archive":
      archiveVisualAsset(input.assetId, input.reason);
      state = "archived";
      break;
    case "recycle":
      recycleVisualAsset({
        assetId: input.assetId,
        fromSlot: input.fromSlot ?? "unknown",
        toSlot: input.toSlot ?? "unknown",
        note: input.reason,
      });
      state = "recycled";
      break;
    case "retire":
      retireVisualAsset(input.assetId, input.reason);
      state = "retired";
      break;
    case "delete":
      deleteRetiredVisualAsset(input.assetId, input.reason);
      state = "deleted";
      break;
    case "freeze":
      state = "frozen";
      break;
    case "upgrade":
      queueVisualUpgrade(input.assetId, input.reason);
      state = "upgraded";
      break;
  }

  const next: VisualLifecycleRecord = {
    assetId: input.assetId,
    state,
    decision: input.decision,
    reason: input.reason,
    updatedAt: now,
  };
  lifecycleMap.set(input.assetId, next);
  return next;
}

export function evaluateLifecycleForPerformance(input: {
  assetId: string;
  qualityScore: number;
  engagementScore: number;
  conversionScore: number;
  corrupted?: boolean;
  duplicate?: boolean;
  seasonal?: boolean;
  campaignEnded?: boolean;
}): VisualLifecycleRecord {
  if (input.corrupted || input.duplicate) {
    return applyVisualLifecycleDecision({
      assetId: input.assetId,
      decision: "delete",
      reason: input.corrupted ? "corrupt-output" : "duplicate-output",
    });
  }

  if (input.campaignEnded) {
    return applyVisualLifecycleDecision({
      assetId: input.assetId,
      decision: "retire",
      reason: "campaign-ended",
    });
  }

  if (input.qualityScore < 60 || input.engagementScore < 40 || input.conversionScore < 35) {
    return applyVisualLifecycleDecision({
      assetId: input.assetId,
      decision: "upgrade",
      reason: "weak-performance",
    });
  }

  if (input.qualityScore > 90 && input.engagementScore > 88 && input.conversionScore > 80) {
    return applyVisualLifecycleDecision({
      assetId: input.assetId,
      decision: "freeze",
      reason: "high-performing-asset",
    });
  }

  if (input.seasonal) {
    return applyVisualLifecycleDecision({
      assetId: input.assetId,
      decision: "archive",
      reason: "seasonal-archive",
    });
  }

  return applyVisualLifecycleDecision({
    assetId: input.assetId,
    decision: "keep",
    reason: "healthy-active-asset",
  });
}
