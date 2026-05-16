import { createMotion, type MotionCreateResult, type MotionType } from "./AiMotionCreatorEngine";
import { updateMotionSlotStatus } from "./AiMotionSlotRegistry";

export type MotionPriority = "critical" | "high" | "medium" | "low";
export type MotionQueueStatus = "queued" | "generating" | "failed" | "approved" | "deployed" | "cancelled";

export type MotionQueueRequest = {
  requestId: string;
  slotId?: string;
  route: string;
  motionType: MotionType;
  subject: string;
  durationSeconds: number;
  ownerSystem: string;
  priority: MotionPriority;
  status: MotionQueueStatus;
  attempts: number;
  maxAttempts: number;
  approvedMotionId?: string;
  updatedAt: number;
  createdAt: number;
  error?: string;
};

const queue = new Map<string, MotionQueueRequest>();

const weight: Record<MotionPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function id(): string {
  return `mreq_${Math.random().toString(36).slice(2, 11)}`;
}

export function queueMotionRequest(
  input: Omit<MotionQueueRequest, "requestId" | "status" | "attempts" | "createdAt" | "updatedAt" | "maxAttempts"> & {
    maxAttempts?: number;
  }
): MotionQueueRequest {
  const now = Date.now();
  const req: MotionQueueRequest = {
    ...input,
    requestId: id(),
    status: "queued",
    attempts: 0,
    maxAttempts: input.maxAttempts ?? 3,
    createdAt: now,
    updatedAt: now,
  };
  queue.set(req.requestId, req);
  if (req.slotId) updateMotionSlotStatus(req.slotId, "queued");
  return req;
}

export function listMotionQueue(): MotionQueueRequest[] {
  return [...queue.values()];
}

export function listMotionQueueRequests(): MotionQueueRequest[] {
  return listMotionQueue();
}

export function prioritizeMotionQueue(): MotionQueueRequest[] {
  return listMotionQueue()
    .filter((q) => q.status === "queued" || q.status === "failed")
    .sort((a, b) => {
      const p = weight[b.priority] - weight[a.priority];
      if (p !== 0) return p;
      return a.createdAt - b.createdAt;
    });
}

export function processNextMotion(): { request: MotionQueueRequest; result: MotionCreateResult | null } | null {
  const next = prioritizeMotionQueue()[0];
  if (!next) return null;

  const generating: MotionQueueRequest = { ...next, status: "generating", attempts: next.attempts + 1, updatedAt: Date.now() };
  queue.set(generating.requestId, generating);
  if (generating.slotId) updateMotionSlotStatus(generating.slotId, "generating");

  try {
    const result = createMotion({
      motionType: generating.motionType,
      subject: generating.subject,
      durationSeconds: generating.durationSeconds,
      ownerSystem: generating.ownerSystem,
      route: generating.route,
    });

    const approved: MotionQueueRequest = {
      ...generating,
      status: "approved",
      approvedMotionId: result.motionId,
      updatedAt: Date.now(),
    };
    queue.set(approved.requestId, approved);
    if (approved.slotId) updateMotionSlotStatus(approved.slotId, "approved");
    return { request: approved, result };
  } catch (error) {
    const failed: MotionQueueRequest = {
      ...generating,
      status: "failed",
      error: error instanceof Error ? error.message : "unknown-error",
      updatedAt: Date.now(),
    };
    queue.set(failed.requestId, failed);
    if (failed.slotId) updateMotionSlotStatus(failed.slotId, "queued");
    return { request: failed, result: null };
  }
}

export function retryMotionRequest(requestId: string): MotionQueueRequest | null {
  const current = queue.get(requestId);
  if (!current) return null;
  if (current.attempts >= current.maxAttempts) return null;
  const next: MotionQueueRequest = { ...current, status: "queued", updatedAt: Date.now(), error: undefined };
  queue.set(requestId, next);
  return next;
}

export function cancelMotionRequest(requestId: string): MotionQueueRequest | null {
  const current = queue.get(requestId);
  if (!current) return null;
  const next: MotionQueueRequest = { ...current, status: "cancelled", updatedAt: Date.now() };
  queue.set(requestId, next);
  return next;
}
