export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { mediaGenerationEngine } from '@/lib/media/MediaGenerationEngine';

export async function GET() {
  try {
    if (mediaGenerationEngine.getApprovalQueue().length === 0) {
      await mediaGenerationEngine.requestGeneration('BATTLE_POSTER', { artistA: 'Wavetek', artistB: 'Nova' }, 'BOT');
      await mediaGenerationEngine.requestGeneration('ARTICLE_COVER', { headline: 'The Rise of Neon Sound' }, 'BOT');
      await mediaGenerationEngine.requestGeneration('AVATAR_BOT', { role: 'Sentinel' }, 'BOT');
    }
    const queue = mediaGenerationEngine.getApprovalQueue();
    return NextResponse.json({ queue });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { jobId?: string; action?: string };
    const { jobId, action } = body;

    if (!jobId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const job = mediaGenerationEngine.updateJobStatus(jobId, action === 'APPROVE' ? 'APPROVED' : 'REJECTED');
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    return NextResponse.json({ ok: true, jobId, action, job });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
