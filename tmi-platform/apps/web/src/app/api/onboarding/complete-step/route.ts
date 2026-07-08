export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { getStepById } from '@/lib/onboarding/FirstRunExperienceEngine';
import { awardXP } from '@/lib/profile/ProfileRewardsEngine';

/**
 * POST /api/onboarding/complete-step
 * Awards real, persistent XP (UserStats/ParticipationLedger) when a First
 * Steps checklist item is marked done. Previously this only wrote to
 * localStorage — the "+N XP" shown in the UI was never actually granted.
 */
export async function POST(req: NextRequest) {
  const session = await getTmiAuth();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'authentication_required' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const stepId = typeof body?.stepId === 'string' ? body.stepId : '';
  const step = getStepById(stepId);
  if (!step) {
    return NextResponse.json({ ok: false, error: 'unknown_step' }, { status: 400 });
  }

  if (step.xpGrant > 0) {
    await awardXP(session.user.id, step.xpGrant, `First Steps: ${step.title}`);
  }

  return NextResponse.json({ ok: true, xpAwarded: step.xpGrant });
}
