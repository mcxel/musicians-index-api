import { NextRequest } from 'next/server';
import { proxyToApi } from '@/lib/apiProxy';
import { prisma } from '@/lib/prisma';
import {
  getCompetitiveSession,
  registerContenderJoin,
  runAutoProgressionAfterContender,
} from '@/lib/live/CompetitiveSessionLifecycleEngine';

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
    if (user?.id) return user.id;
  }

  return req.cookies.get('tmi_session_id')?.value ?? null;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await resolveUserId(req);
  const upstream = await proxyToApi(req, `/api/rooms/${params.id}/join`);

  if (upstream.ok && userId) {
    const session = getCompetitiveSession(params.id);
    if (session && session.state === 'waiting_for_contender') {
      registerContenderJoin(params.id, userId);
      runAutoProgressionAfterContender(params.id);
    }
  }

  return upstream;
}
