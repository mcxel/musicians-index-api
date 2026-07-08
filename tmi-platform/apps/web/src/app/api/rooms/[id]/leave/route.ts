import { NextRequest } from 'next/server';
import { proxyToApi } from '@/lib/apiProxy';
import { prisma } from '@/lib/prisma';
import { handleCompetitiveParticipantLeave } from '@/lib/live/CompetitiveSessionLifecycleEngine';

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
  const upstream = await proxyToApi(req, `/api/rooms/${params.id}/leave`);

  if (upstream.ok && userId) {
    handleCompetitiveParticipantLeave(params.id, userId);
  }

  return upstream;
}
