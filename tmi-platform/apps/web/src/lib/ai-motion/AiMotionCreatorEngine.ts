import { normalizeMotionDuration, type MotionDurationSeconds } from "./AiMotionTimingEngine";

export type MotionType =
  | "host-intro"
  | "host-idle"
  | "host-reaction"
  | "host-celebration"
  | "venue-loop"
  | "environment-loop"
  | "battle-loop"
  | "billboard-loop"
  | "ticket-loop"
  | "nft-loop"
  | "avatar-loop";

export type MotionCreateRequest = {
  motionType: MotionType;
  subject: string;
  durationSeconds: number;
  sourceAssetRef?: string;
  ownerSystem: string;
  route: string;
};

export type MotionCreateResult = {
  motionId: string;
  duration: MotionDurationSeconds;
  outputRef: string;
  score: number;
};

function id(): string {
  return `mot_${Math.random().toString(36).slice(2, 11)}`;
}

export function createMotion(request: MotionCreateRequest): MotionCreateResult {
  const duration = normalizeMotionDuration(request.durationSeconds);
  return {
    motionId: id(),
    duration,
    outputRef: `motion://${request.motionType}/${request.subject.replace(/\s+/g, "-").toLowerCase()}-${duration}s`,
    score: 80,
  };
}
