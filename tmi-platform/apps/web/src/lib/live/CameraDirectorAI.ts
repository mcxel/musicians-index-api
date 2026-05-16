import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import type { CrowdIntentType } from '@/lib/rooms/CrowdIntentEngine';
import {
  evaluateCameraFocus,
  lockPerformerFocus,
  triggerCameraShift,
  type CameraFocusPlan,
} from '@/lib/live/CameraFocusReactionEngine';
import type { CrowdEmotionState } from '@/lib/runtime/CrowdEmotionGraph';
import { claimRuntimeAuthority } from '@/lib/runtime/RuntimeAuthorityRegistry';

const CAMERA_OWNER_ID = 'CameraDirectorAI';

export interface CameraDirectorDecision {
  roomId: ChatRoomId;
  plan: CameraFocusPlan;
  confidence: number;
  reason: string;
  generatedAtMs: number;
  authorityGranted: boolean;
}

const history = new Map<ChatRoomId, CameraDirectorDecision[]>();

function pushHistory(roomId: ChatRoomId, decision: CameraDirectorDecision): void {
  const list = history.get(roomId) ?? [];
  list.push(decision);
  history.set(roomId, list.slice(-100));
}

function ensureCameraAuthority(roomId: ChatRoomId): boolean {
  const camera = claimRuntimeAuthority({
    roomId,
    domain: 'camera-control',
    ownerId: CAMERA_OWNER_ID,
    ttlMs: 10_000,
    metadata: { source: 'camera-director' },
  });
  const performer = claimRuntimeAuthority({
    roomId,
    domain: 'performer-authority',
    ownerId: CAMERA_OWNER_ID,
    ttlMs: 10_000,
    metadata: { source: 'camera-targeting' },
  });

  return camera.granted && performer.granted;
}

export function directCameraForEmotion(input: {
  roomId: ChatRoomId;
  emotion: CrowdEmotionState;
  performerUserId?: string;
}): CameraDirectorDecision {
  const hasAuthority = ensureCameraAuthority(input.roomId);

  let plan = evaluateCameraFocus(input.roomId);
  let reason = hasAuthority ? 'baseline-evaluation' : 'authority-blocked-fallback';
  let confidence = hasAuthority ? 0.62 : 0.31;

  if (hasAuthority && input.emotion.hype > 82) {
    plan = lockPerformerFocus(input.roomId, input.performerUserId, 7000);
    reason = 'hype-peak-focus-lock';
    confidence = 0.88;
  } else if (hasAuthority && input.emotion.attentionCollapse > 55) {
    plan = triggerCameraShift(input.roomId, 'react' as CrowdIntentType, 78, input.performerUserId);
    reason = 'attention-collapse-recovery-cut';
    confidence = 0.79;
  }

  const decision: CameraDirectorDecision = {
    roomId: input.roomId,
    plan,
    confidence,
    reason,
    generatedAtMs: Date.now(),
    authorityGranted: hasAuthority,
  };

  pushHistory(input.roomId, decision);
  return decision;
}

export function getCameraDirectorHistory(roomId: ChatRoomId, limit = 20): CameraDirectorDecision[] {
  return (history.get(roomId) ?? []).slice(-limit).reverse();
}
