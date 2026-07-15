export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import prisma from '@/lib/prisma';

// Real Security Sentinel data — ModerationAction-backed only (Rule 20).
// There is no FailedLogin/Alert/threat-score model anywhere in the schema,
// so "100 Sentinels", threat level, and failed-login counts have been
// removed rather than fabricated. Only moderation activity — a real,
// narrowly-scoped signal — is reported here, explicitly labeled as such
// rather than renamed into broader "security telemetry" it doesn't represent.

const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface SecuritySentinelResponse {
  ok: true;
  securityTelemetryConfigured: false;
  securityTelemetryNote: string;
  moderation: {
    openActions: number;
    recentActions: number;
    source: 'moderation records';
  };
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const now = new Date();
  const recentSince = new Date(now.getTime() - RECENT_WINDOW_MS);

  const [openActions, recentActions] = await Promise.all([
    prisma.moderationAction.count({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    }),
    prisma.moderationAction.count({
      where: { createdAt: { gte: recentSince } },
    }),
  ]);

  const body: SecuritySentinelResponse = {
    ok: true,
    securityTelemetryConfigured: false,
    securityTelemetryNote: 'Security telemetry is not configured yet — no failed-login, threat-score, or sentinel-count source exists in the platform.',
    moderation: {
      openActions,
      recentActions,
      source: 'moderation records',
    },
  };

  return NextResponse.json(body);
}
