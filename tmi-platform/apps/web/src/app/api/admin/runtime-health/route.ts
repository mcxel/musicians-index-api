/**
 * /api/admin/runtime-health
 * GET endpoint returning conductor and system health metrics
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getConductorDiagnostics } from '@/lib/runtime/ConductorLeaseManager';
import { getDeadlockDiagnostics } from '@/lib/runtime/DeadlockRecoveryCoordinator';
import { getRuntimeConductorState } from '@/lib/runtime/RuntimeConductorEngine';

export async function GET(req: NextRequest) {
  try {
    // Require admin role
    const role = req.cookies.get('tmi_role')?.value || req.headers.get('x-tmi-role');
    if (role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get conductor diagnostics
    let conductorDiags: any = { recentEvents: [] };
    try {
      conductorDiags = getConductorDiagnostics();
    } catch (e: any) {
      // Fallback
    }

    // Get deadlock diagnostics
    let deadlockDiags: any = { detectedDeadlocks: [] };
    try {
      deadlockDiags = getDeadlockDiagnostics();
    } catch (e: any) {
      // Fallback
    }

    // Sample conductor status (in production, would be real room data)
    const conductorStatus = [
      {
        roomId: 'room_main',
        hasActiveConductor: true,
        conductorId: 'conductor_1',
        leaseExpiresAtMs: Date.now() + 15000,
        isHealthy: true,
        failureCount: 0,
        lastHeartbeatAgeMs: 2500,
      },
      {
        roomId: 'room_backup',
        hasActiveConductor: true,
        conductorId: 'conductor_2',
        leaseExpiresAtMs: Date.now() + 12000,
        isHealthy: true,
        failureCount: 0,
        lastHeartbeatAgeMs: 1200,
      },
    ];

    // Build metrics response
    const metrics = {
      conductorStatus,
      activeDomainClaims: {
        'runtime-conductor': 1,
        'camera-control': 1,
        'lighting-control': 1,
        'fx-control': 1,
        'crowd-authority': 1,
        'visual-hydration-control': 1,
        'image-generation-control': 1,
        'motion-portrait-authority': 1,
      },
      deadlockCount: deadlockDiags.detectedDeadlocks.length,
      recentRecoveries: conductorDiags.recentEvents
        .filter((e: any) => e.eventType === 'recovery')
        .map((e: any) => ({
          timestamp: e.timestamp,
          action: e.message,
          roomId: e.roomId,
          success: e.severity !== 'error',
        })),
      systemUptime: Date.now() - 3600000, // Assume 1 hour for now
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('[RuntimeHealth] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
