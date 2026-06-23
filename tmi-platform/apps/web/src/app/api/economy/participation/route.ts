import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { participationEconomyEngine } from '@/lib/economy/ParticipationEconomyEngine';

type EarnBody = {
  mode: 'earn';
  role: 'fan' | 'performer';
  action: string;
  meta?: Record<string, string | number | boolean>;
};

type SpendBody = {
  mode: 'spend';
  action: string;
  meta?: Record<string, string | number | boolean>;
};

type Body = EarnBody | SpendBody;

async function resolveAuthedUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await resolveAuthedUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const wallet = participationEconomyEngine.getWallet(userId);
  const ledger = participationEconomyEngine.getLedger(userId);
  return NextResponse.json({ ok: true, wallet, ledger });
}

export async function POST(req: NextRequest) {
  const userId = await resolveAuthedUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let body: Body;
  try {
    body = await req.json() as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.mode === 'earn') {
    const result = participationEconomyEngine.earn(userId, body.role, body.action as never, body.meta);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (body.mode === 'spend') {
    const result = participationEconomyEngine.spend(userId, body.action as never, body.meta);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, error: 'Unsupported mode' }, { status: 400 });
}
