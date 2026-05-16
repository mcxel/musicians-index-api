import { createAiVisual } from "./AiVisualCreatorEngine";
import type { AiGeneratedAssetRecord, AiGeneratedAssetType } from "./AiGeneratedAssetRegistry";

export type VisualQueuePriority = "critical" | "high" | "medium" | "low";
export type VisualQueueStatus = "queued" | "generating" | "failed" | "approved" | "deployed" | "cancelled";

export type VisualQueueAssetKind =
  | "artist-profile-art"
  | "homepage-hero-art"
  | "battle-poster"
  | "venue-skin"
  | "ticket-art"
  | "nft-art"
  | "magazine-cover"
  | "article-thumbnail"
  | "sponsor-ad"
  | "billboard-art"
  | "avatar-clothing"
  | "avatar-prop"
  | "instrument"
  | "show-poster"
  | "prize-card";

export type VisualQueueRequest = {
  requestId: string;
  assetKind: VisualQueueAssetKind;
  aiAssetType: AiGeneratedAssetType;
  subject: string;
  ownerSystem: string;
  route: string;
  component: string;
  slotId?: string;
  priority: VisualQueuePriority;
  status: VisualQueueStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  updatedAt: number;
  approvedAssetId?: string;
  deployedAssetId?: string;
  failureReason?: string;
};

const requests = new Map<string, VisualQueueRequest>();

const priorityWeight: Record<VisualQueuePriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export function queueAssetRequest(
  input: Omit<VisualQueueRequest, "requestId" | "status" | "attempts" | "createdAt" | "updatedAt" | "maxAttempts"> & { maxAttempts?: number }
): VisualQueueRequest {
  const now = Date.now();
  const request: VisualQueueRequest = {
    ...input,
    requestId: id("vreq"),
    status: "queued",
    attempts: 0,
    maxAttempts: input.maxAttempts ?? 3,
    createdAt: now,
    updatedAt: now,
  };
  requests.set(request.requestId, request);
  return request;
}

export function listQueueRequests(): VisualQueueRequest[] {
  return [...requests.values()];
}

export function prioritizeQueue(): VisualQueueRequest[] {
  return [...requests.values()]
    .filter((r) => r.status === "queued" || r.status === "failed")
    .sort((a, b) => {
      const p = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (p !== 0) return p;
      return a.createdAt - b.createdAt;
    });
}

export function processNext(): { request: VisualQueueRequest; generatedAsset: AiGeneratedAssetRecord | null } | null {
  const next = prioritizeQueue()[0];
  if (!next) return null;

  const generating: VisualQueueRequest = {
    ...next,
    status: "generating",
    attempts: next.attempts + 1,
    updatedAt: Date.now(),
  };
  requests.set(generating.requestId, generating);

  try {
    const generated = createAiVisual({
      assetType: generating.aiAssetType,
      subject: generating.subject,
      ownerSystem: generating.ownerSystem,
      targetRoute: generating.route,
      targetComponent: generating.component,
    });

    const approved: VisualQueueRequest = {
      ...generating,
      status: generated.status === "approved" ? "approved" : "failed",
      approvedAssetId: generated.status === "approved" ? generated.assetId : undefined,
      failureReason: generated.status === "approved" ? undefined : "quality-rejected",
      updatedAt: Date.now(),
    };
    requests.set(approved.requestId, approved);

    return { request: approved, generatedAsset: generated };
  } catch (error) {
    const failed: VisualQueueRequest = {
      ...generating,
      status: "failed",
      failureReason: error instanceof Error ? error.message : "unknown-error",
      updatedAt: Date.now(),
    };
    requests.set(failed.requestId, failed);
    return { request: failed, generatedAsset: null };
  }
}

export function retryFailed(requestId: string): VisualQueueRequest | null {
  const current = requests.get(requestId);
  if (!current) return null;
  if (current.attempts >= current.maxAttempts) return null;

  const retried: VisualQueueRequest = {
    ...current,
    status: "queued",
    failureReason: undefined,
    updatedAt: Date.now(),
  };
  requests.set(requestId, retried);
  return retried;
}

export function cancelRequest(requestId: string): VisualQueueRequest | null {
  const current = requests.get(requestId);
  if (!current) return null;
  const cancelled: VisualQueueRequest = {
    ...current,
    status: "cancelled",
    updatedAt: Date.now(),
  };
  requests.set(requestId, cancelled);
  return cancelled;
}

export function approveAsset(requestId: string, assetId: string): VisualQueueRequest | null {
  const current = requests.get(requestId);
  if (!current) return null;
  const approved: VisualQueueRequest = {
    ...current,
    status: "approved",
    approvedAssetId: assetId,
    updatedAt: Date.now(),
  };
  requests.set(requestId, approved);
  return approved;
}

export function markDeployed(requestId: string, assetId: string): VisualQueueRequest | null {
  const current = requests.get(requestId);
  if (!current) return null;
  const deployed: VisualQueueRequest = {
    ...current,
    status: "deployed",
    deployedAssetId: assetId,
    updatedAt: Date.now(),
  };
  requests.set(requestId, deployed);
  return deployed;
}
