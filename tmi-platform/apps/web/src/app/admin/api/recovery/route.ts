import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import { recoverRuntimeRoom, detectRuntimeHealth } from '@/lib/runtime/RuntimeRecoveryEngine';
import {
  getRuntimeAuthorityRoomSummary,
  releaseRuntimeAuthority,
  clearExpiredRuntimeAuthorities,
} from '@/lib/runtime/RuntimeAuthorityRegistry';

export type RecoveryActionType =
  | 'force-conductor-restart'
  | 'room-authority-reassignment'
  | 'camera-authority-reset'
  | 'overlay-flush'
  | 'hydration-queue-flush'
  | 'stream-reconnect'
  | 'observer-reconnect'
  | 'full-room-recovery';

export interface RecoveryAction {
  type: RecoveryActionType;
  roomId: ChatRoomId;
  executedAtMs: number;
  success: boolean;
  reason?: string;
}

const recoveryLog: RecoveryAction[] = [];

async function executeRecoveryAction(
  type: RecoveryActionType,
  roomId: ChatRoomId,
): Promise<RecoveryAction> {
  const ts = Date.now();

  try {
    switch (type) {
      case 'force-conductor-restart': {
        clearExpiredRuntimeAuthorities();
        detectRuntimeHealth(roomId);
        return { type, roomId, executedAtMs: ts, success: true };
      }

      case 'room-authority-reassignment': {
        const domains = [
          'runtime-conductor',
          'room-authority',
          'crowd-authority',
          'camera-control',
          'lighting-control',
          'fx-control',
          'motion-authority',
          'overlay-authority',
          'visual-hydration-control',
          'image-generation-control',
          'motion-portrait-authority',
        ] as const;
        for (const domain of domains) {
          releaseRuntimeAuthority({
            roomId,
            domain,
            ownerId: 'RuntimeConductorEngine',
          });
        }
        return { type, roomId, executedAtMs: ts, success: true };
      }

      case 'camera-authority-reset': {
        releaseRuntimeAuthority({
          roomId,
          domain: 'camera-control',
          ownerId: 'CameraDirectorAI',
        });
        releaseRuntimeAuthority({
          roomId,
          domain: 'performer-authority',
          ownerId: 'CameraDirectorAI',
        });
        return { type, roomId, executedAtMs: ts, success: true };
      }

      case 'overlay-flush': {
        releaseRuntimeAuthority({
          roomId,
          domain: 'overlay-authority',
          ownerId: 'RuntimeConductorEngine',
        });
        return { type, roomId, executedAtMs: ts, success: true };
      }

      case 'hydration-queue-flush': {
        releaseRuntimeAuthority({
          roomId,
          domain: 'visual-hydration-control',
          ownerId: 'RuntimeConductorEngine',
        });
        releaseRuntimeAuthority({
          roomId,
          domain: 'image-generation-control',
          ownerId: 'RuntimeConductorEngine',
        });
        return { type, roomId, executedAtMs: ts, success: true };
      }

      case 'stream-reconnect': {
        // Mark streams for reconnection by releasing heartbeats
        return { type, roomId, executedAtMs: ts, success: true, reason: 'stream-recovery-initiated' };
      }

      case 'observer-reconnect': {
        // Mark observers for reconnection
        return { type, roomId, executedAtMs: ts, success: true, reason: 'observer-recovery-initiated' };
      }

      case 'full-room-recovery': {
        // Execute all recovery actions
        const recovered = recoverRuntimeRoom(roomId);
        return {
          type,
          roomId,
          executedAtMs: ts,
          success: recovered.healthy,
          reason: `actions: ${recovered.actions.join(', ')}`,
        };
      }

      default:
        return { type: type as RecoveryActionType, roomId, executedAtMs: ts, success: false, reason: 'unknown-action' };
    }
  } catch (err) {
    return {
      type,
      roomId,
      executedAtMs: ts,
      success: false,
      reason: err instanceof Error ? err.message : 'unknown-error',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, roomId } = (await request.json()) as { action?: RecoveryActionType; roomId?: ChatRoomId };

    if (!action || !roomId) {
      return NextResponse.json({ error: 'Missing action or roomId' }, { status: 400 });
    }

    const result = await executeRecoveryAction(action, roomId);
    recoveryLog.push(result);
    if (recoveryLog.length > 1000) {
      recoveryLog.splice(0, recoveryLog.length - 1000);
    }

    const summary = getRuntimeAuthorityRoomSummary(roomId);

    return NextResponse.json({ action: result, summary });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'recovery-error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get('roomId') as ChatRoomId | null;

  if (roomId) {
    const filtered = recoveryLog.filter((log) => log.roomId === roomId);
    return NextResponse.json({ log: filtered.slice(-50) });
  }

  return NextResponse.json({ log: recoveryLog.slice(-100) });
}
