export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import prisma from '@/lib/prisma';

// Real Chain Command roster — UserRole-backed (Rule 20: no seed data).
// Presence is honestly UNKNOWN for everyone: User.lastSeenAt exists in the
// schema but is never written by any code path in this codebase (verified
// by repo-wide search), so it cannot support a real ONLINE/RECENT/OFFLINE
// claim yet. Wiring a real heartbeat writer is a separate, larger decision
// (touches shared session code) — flagged, not built here.

const ADMIN_TIER_ROLES = ['ADMIN', 'STAFF'] as const;
const PRESENCE_ONLINE_MS = 5 * 60 * 1000;
const PRESENCE_RECENT_MS = 30 * 60 * 1000;

export interface ChainCommandOperator {
  userId: string;
  displayName: string;
  imageUrl: string | null;
  assignedRoles: string[];
  activeRole: string | null;
  lastSeenAt: string | null;
  presence: 'ONLINE' | 'RECENT' | 'OFFLINE' | 'UNKNOWN';
}

function resolvePresence(lastSeenAt: Date | null): ChainCommandOperator['presence'] {
  if (!lastSeenAt) return 'UNKNOWN';
  const ageMs = Date.now() - lastSeenAt.getTime();
  if (ageMs <= PRESENCE_ONLINE_MS) return 'ONLINE';
  if (ageMs <= PRESENCE_RECENT_MS) return 'RECENT';
  return 'OFFLINE';
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const roleAssignments = await prisma.userRole.findMany({
    where: { role: { in: [...ADMIN_TIER_ROLES] } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          activeRole: true,
          lastSeenAt: true,
        },
      },
    },
  });

  const byUser = new Map<string, ChainCommandOperator>();
  for (const assignment of roleAssignments) {
    const u = assignment.user;
    const existing = byUser.get(u.id);
    if (existing) {
      existing.assignedRoles.push(assignment.role);
      continue;
    }
    byUser.set(u.id, {
      userId: u.id,
      displayName: u.displayName || u.name || `Operator ${u.id.slice(0, 6)}`,
      imageUrl: u.image ?? null,
      assignedRoles: [assignment.role],
      activeRole: u.activeRole ?? null,
      lastSeenAt: u.lastSeenAt ? u.lastSeenAt.toISOString() : null,
      presence: resolvePresence(u.lastSeenAt),
    });
  }

  return NextResponse.json({
    ok: true,
    operators: Array.from(byUser.values()),
    presenceNote: 'Live presence unavailable — heartbeat service not configured yet.',
  });
}
