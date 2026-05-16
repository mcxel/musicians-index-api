import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import { getMomentumSnapshot } from '@/lib/live/crowdMomentumEngine';
import { roomEnergyEngine } from '@/lib/live/RoomEnergyEngine';
import { getLiveReactionSnapshot } from '@/lib/live/LiveReactionEngine';
import { getLivePresenceSnapshot } from '@/lib/live/LivePresenceEngine';
import { directCameraForEmotion } from '@/lib/live/CameraDirectorAI';
import { updateCrowdEmotionGraph, type CrowdEmotionState } from '@/lib/runtime/CrowdEmotionGraph';
import { advancePerformanceState, getPerformanceState, type PerformanceStateRecord } from '@/lib/runtime/PerformanceStateMachine';
import { updateAdaptiveLighting, type LightingState } from '@/lib/runtime/AdaptiveLightingRuntime';
import { updateDynamicStageFX, type StageFXState } from '@/lib/runtime/DynamicStageFXEngine';
import {
  claimRuntimeAuthority,
  clearExpiredRuntimeAuthorities,
  getRuntimeAuthorityRoomSummary,
  type RuntimeAuthorityRoomSummary,
} from '@/lib/runtime/RuntimeAuthorityRegistry';
import {
  detectRuntimeHealth,
  markRuntimeLoopHeartbeat,
  markRuntimeObserverHeartbeat,
  markRuntimeStreamHeartbeat,
  recoverRuntimeRoom,
  type RuntimeRecoveryReport,
} from '@/lib/runtime/RuntimeRecoveryEngine';
import { runVisualRecoveryCycle } from '@/lib/ai-visuals/VisualRecoveryCoordinator';
import {
  recordConductorHeartbeat,
  releaseConductor,
  getConductorStatus,
  runConductorHealthCheck,
} from '@/lib/runtime/ConductorLeaseManager';
import { detectDeadlock, executeDeadlockRecovery } from '@/lib/runtime/DeadlockRecoveryCoordinator';
import { sweepExpiredGeneratorLeases, listActiveGeneratorLeases } from '@/lib/ai-visuals/VisualAuthorityGateway';
import { arbitrateOverlayZIndex, sweepStaleOverlays } from '@/lib/runtime/overlay/OverlayConflictResolver';
import { runMotionPortraitSchedulerTick } from '@/lib/runtime/motion/MotionPortraitScheduler';
import { cleanupReconstructionCache } from '@/lib/runtime/cache/RuntimeReconstructionCache';
import {
  quarantineRuntimeDecision,
  getRuntimeQuarantineState,
  isRoomQuarantined,
  runRuntimeQuarantineMaintenance,
} from '@/lib/runtime/quarantine/RuntimeQuarantineMode';
import { synchronizeHomePair } from '@/lib/runtime/governor/HomeSyncGovernor';

const CONDUCTOR_OWNER_ID = 'RuntimeConductorEngine';

export interface RuntimeConductorSnapshot {
  roomId: ChatRoomId;
  crowdEmotion: CrowdEmotionState;
  performanceState: PerformanceStateRecord;
  lighting: LightingState;
  stageFx: StageFXState;
  camera: ReturnType<typeof directCameraForEmotion>;
  crowdMomentum: ReturnType<typeof getMomentumSnapshot>;
  presence: ReturnType<typeof getLivePresenceSnapshot>;
  reactions: ReturnType<typeof getLiveReactionSnapshot>;
  authority: RuntimeAuthorityRoomSummary;
  recovery: RuntimeRecoveryReport;
  hardening: {
    generatorLeases: number;
    overlayConflicts: number;
    portraitTasksProcessed: number;
    quarantineActive: boolean;
  };
  blockedByAuthorityConflict: boolean;
  updatedAtMs: number;
}

const snapshots = new Map<ChatRoomId, RuntimeConductorSnapshot>();

function ensureConductorAuthority(roomId: ChatRoomId): { ok: boolean; summary: RuntimeAuthorityRoomSummary } {
  const domains = [
    'runtime-conductor',
    'room-authority',
    'crowd-authority',
    'lighting-control',
    'fx-control',
    'motion-authority',
    'overlay-authority',
    'visual-hydration-control',
    'image-generation-control',
    'motion-portrait-authority',
  ] as const;

  let ok = true;
  for (const domain of domains) {
    const result = claimRuntimeAuthority({
      roomId,
      domain,
      ownerId: CONDUCTOR_OWNER_ID,
      ttlMs: 15_000,
      metadata: { source: 'conductor-tick' },
    });
    if (!result.granted) {
      ok = false;
    }
  }

  return {
    ok,
    summary: getRuntimeAuthorityRoomSummary(roomId),
  };
}

export function tickRuntimeConductor(roomId: ChatRoomId): RuntimeConductorSnapshot {
  sweepExpiredGeneratorLeases();
  cleanupReconstructionCache();
  runRuntimeQuarantineMaintenance();

  clearExpiredRuntimeAuthorities();
  const authorityResult = ensureConductorAuthority(roomId);

  markRuntimeLoopHeartbeat(roomId, 'runtime-conductor');
  markRuntimeObserverHeartbeat(roomId, 'admin-observatory');
  markRuntimeStreamHeartbeat(roomId, 'live-reaction-stream');

  // Record conductor heartbeat to keep lease alive
  recordConductorHeartbeat(roomId, CONDUCTOR_OWNER_ID);

  // Check for deadlock conditions
  const deadlock = detectDeadlock(roomId, authorityResult.summary);
  if (deadlock) {
    console.warn(`[Conductor] Deadlock detected: ${deadlock.description}`);
    executeDeadlockRecovery(roomId, deadlock).catch((err) => {
      console.error(`[Conductor] Deadlock recovery failed:`, err);
    });
  }

  arbitrateOverlayZIndex(roomId);
  const overlaySweep = sweepStaleOverlays(roomId);
  const portraitTick = runMotionPortraitSchedulerTick(roomId);
  synchronizeHomePair(roomId, 'home-1', 'home-1-2');

  if (!authorityResult.ok) {
    const fallback = snapshots.get(roomId);
    const recovery = recoverRuntimeRoom(roomId);

    if (fallback) {
      const blockedSnapshot: RuntimeConductorSnapshot = {
        ...fallback,
        authority: authorityResult.summary,
        recovery,
        hardening: {
          generatorLeases: listActiveGeneratorLeases(roomId).length,
          overlayConflicts: overlaySweep.duplicateSuppressed,
          portraitTasksProcessed: portraitTick.processed.length,
          quarantineActive: isRoomQuarantined(roomId),
        },
        blockedByAuthorityConflict: true,
        updatedAtMs: Date.now(),
      };
      snapshots.set(roomId, blockedSnapshot);
      return blockedSnapshot;
    }
  }

  const momentum = getMomentumSnapshot(roomId);
  const presence = getLivePresenceSnapshot(roomId);
  const reactions = getLiveReactionSnapshot(roomId);
  const energy = roomEnergyEngine.getState(roomId) ?? roomEnergyEngine.initRoom(roomId);

  const emotion = updateCrowdEmotionGraph({
    roomId,
    momentumCurrent: momentum.current,
    roomEnergy: energy.energyScore,
    reactionSnapshot: reactions,
  });

  const performance = advancePerformanceState(roomId, emotion, energy.energyScore);
  const lighting = updateAdaptiveLighting(roomId, emotion, energy.energyScore);
  const stageFx = updateDynamicStageFX({
    roomId,
    performanceState: performance.state,
    emotion,
    roomEnergy: energy.energyScore,
  });

  const performer = presence.activePerformers[0]?.userId;
  const camera = directCameraForEmotion({
    roomId,
    emotion,
    performerUserId: performer,
  });

  markRuntimeStreamHeartbeat(roomId, 'presence-stream');
  markRuntimeStreamHeartbeat(roomId, 'momentum-stream');
  markRuntimeStreamHeartbeat(roomId, 'camera-stream');

  const recovery = detectRuntimeHealth(roomId);

  quarantineRuntimeDecision({
    roomId,
    deadlockCount: deadlock ? 1 : 0,
    stalledGeneratorCount: listActiveGeneratorLeases(roomId).filter((lease) => {
      return Date.now() - lease.generatorHeartbeat > 7_500;
    }).length,
    overlayConflictCount: overlaySweep.duplicateSuppressed,
    orphanOwnershipCount: authorityResult.summary.duplicateOrchestratorDetected ? 1 : 0,
  });

  // Run visual recovery cycle (blocked/failed visual rehydration)
  // This is async but we don't await it; let it run in background
  runVisualRecoveryCycle(roomId).catch((err) => {
    console.error(`[Conductor] Visual recovery cycle failed for room ${roomId}:`, err);
  });

  const snapshot: RuntimeConductorSnapshot = {
    roomId,
    crowdEmotion: emotion,
    performanceState: performance,
    lighting,
    stageFx,
    camera,
    crowdMomentum: momentum,
    presence,
    reactions,
    authority: authorityResult.summary,
    recovery,
    hardening: {
      generatorLeases: listActiveGeneratorLeases(roomId).length,
      overlayConflicts: overlaySweep.duplicateSuppressed,
      portraitTasksProcessed: portraitTick.processed.length,
      quarantineActive: Boolean(getRuntimeQuarantineState(roomId)),
    },
    blockedByAuthorityConflict: false,
    updatedAtMs: Date.now(),
  };

  snapshots.set(roomId, snapshot);
  return snapshot;
}

export function getRuntimeConductorSnapshot(roomId: ChatRoomId): RuntimeConductorSnapshot | undefined {
  return snapshots.get(roomId);
}

export function getRuntimeConductorState(roomId: ChatRoomId): RuntimeConductorSnapshot {
  return getRuntimeConductorSnapshot(roomId) ?? tickRuntimeConductor(roomId);
}

export function listRuntimeConductorSnapshots(): RuntimeConductorSnapshot[] {
  return [...snapshots.values()].sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}

export function peekPerformanceState(roomId: ChatRoomId) {
  return getPerformanceState(roomId);
}
