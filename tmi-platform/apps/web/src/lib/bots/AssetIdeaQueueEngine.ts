import {
  queueAssetRequest,
  type VisualQueueAssetKind,
  type VisualQueuePriority,
} from "@/lib/ai-visuals/AiVisualQueueEngine";
import type { AiGeneratedAssetType } from "@/lib/ai-visuals/AiGeneratedAssetRegistry";

export type FeederIdeaStatus =
  | "queued"
  | "approved"
  | "rejected"
  | "promoted"
  | "generating"
  | "deployed"
  | "failed";

export type FeederIdeaAssetType =
  | "artist-portrait"
  | "venue-skin"
  | "ticket-design"
  | "sponsor-ad"
  | "advertiser-campaign"
  | "battle-poster"
  | "magazine-cover"
  | "homepage-hero"
  | "bot-face"
  | "host-animation"
  | "background"
  | "scene"
  | "motion-loop";

export type VisualFeederIdea = {
  ideaId: string;
  sourceBotId: string;
  targetRoute: string;
  targetSlot: string;
  assetType: FeederIdeaAssetType;
  prompt: string;
  priority: VisualQueuePriority;
  reason: string;
  status: FeederIdeaStatus;
  queueRequestId?: string;
  createdAt: number;
  updatedAt: number;
};

const ideaMap = new Map<string, VisualFeederIdea>();

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

const ASSET_TYPE_TO_QUEUE_KIND: Record<FeederIdeaAssetType, { queueKind: VisualQueueAssetKind; aiType: AiGeneratedAssetType }> = {
  "artist-portrait": { queueKind: "artist-profile-art", aiType: "image" },
  "venue-skin": { queueKind: "venue-skin", aiType: "venue-skin" },
  "ticket-design": { queueKind: "ticket-art", aiType: "ticket-design" },
  "sponsor-ad": { queueKind: "sponsor-ad", aiType: "sponsor-ad" },
  "advertiser-campaign": { queueKind: "sponsor-ad", aiType: "sponsor-ad" },
  "battle-poster": { queueKind: "battle-poster", aiType: "battle-stage" },
  "magazine-cover": { queueKind: "magazine-cover", aiType: "magazine-spread" },
  "homepage-hero": { queueKind: "homepage-hero-art", aiType: "image" },
  "bot-face": { queueKind: "artist-profile-art", aiType: "avatar-reference" },
  "host-animation": { queueKind: "artist-profile-art", aiType: "animation-storyboard" },
  "background": { queueKind: "venue-skin", aiType: "background" },
  "scene": { queueKind: "venue-skin", aiType: "stage-scene" },
  "motion-loop": { queueKind: "homepage-hero-art", aiType: "animation-storyboard" },
};

export function queueFeederIdea(input: Omit<VisualFeederIdea, "ideaId" | "status" | "createdAt" | "updatedAt">): VisualFeederIdea {
  const now = Date.now();
  const next: VisualFeederIdea = {
    ...input,
    ideaId: id("idea"),
    status: "queued",
    createdAt: now,
    updatedAt: now,
  };
  ideaMap.set(next.ideaId, next);
  return next;
}

export function listFeederIdeas(filter?: { status?: FeederIdeaStatus; sourceBotId?: string }): VisualFeederIdea[] {
  const all = [...ideaMap.values()];
  if (!filter) return all;
  return all.filter((idea) => {
    if (filter.status && idea.status !== filter.status) return false;
    if (filter.sourceBotId && idea.sourceBotId !== filter.sourceBotId) return false;
    return true;
  });
}

export function setFeederIdeaStatus(ideaId: string, status: FeederIdeaStatus): VisualFeederIdea | null {
  const current = ideaMap.get(ideaId);
  if (!current) return null;
  const next: VisualFeederIdea = { ...current, status, updatedAt: Date.now() };
  ideaMap.set(ideaId, next);
  return next;
}

export function promoteFeederIdeaToVisualJob(ideaId: string, ownerSystem = "creative_prompt_feeder_engine"): VisualFeederIdea | null {
  const current = ideaMap.get(ideaId);
  if (!current) return null;
  const mapping = ASSET_TYPE_TO_QUEUE_KIND[current.assetType];
  if (!mapping) return null;

  const request = queueAssetRequest({
    assetKind: mapping.queueKind,
    aiAssetType: mapping.aiType,
    subject: current.prompt,
    ownerSystem,
    route: current.targetRoute,
    component: current.targetSlot,
    slotId: current.targetSlot,
    priority: current.priority,
  });

  const next: VisualFeederIdea = {
    ...current,
    status: "promoted",
    queueRequestId: request.requestId,
    updatedAt: Date.now(),
  };
  ideaMap.set(ideaId, next);
  return next;
}
