export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { submitEventEntry } from '@/lib/events/EventSubmissionEngine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const showType = searchParams.get('showType') ?? 'monday-stage';

  try {
    const submissions = await prisma.showSubmission.findMany({
      where: {
        showType: showType.toLowerCase().includes('monday') ? 'monday-stage' : showType,
        status: { in: ['APPROVED_IN_ROTATION', 'QUEUED', 'SUBMITTED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ ok: true, submissions });
  } catch (err: any) {
    console.warn('[Submissions API] Database query warning (falling back to memory):', err?.message);
    return NextResponse.json({ ok: true, submissions: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userName, category, title, bpm, genre, audioUrl, videoUrl, rightsAttested, sampleClearanceDeclared } = body;

    if (!title) {
      return NextResponse.json({ ok: false, error: 'Title is required' }, { status: 400 });
    }

    // Write to DB
    const dbEntry = await prisma.showSubmission.create({
      data: {
        userId: userId || 'user_active_creator',
        userName: userName || 'Active Performer',
        showType: category === 'WORLD_DANCE_PARTY' ? 'dance-party' : 'monday-stage',
        actTitle: title,
        talentCategory: category || 'SINGING_MUSIC',
        bpm: parseInt(bpm, 10) || 95,
        genre: genre || 'Hip-Hop / R&B',
        audioUrl: audioUrl || undefined,
        videoUrl: videoUrl || undefined,
        rightsAttested: Boolean(rightsAttested),
        sampleClearanceDeclared: Boolean(sampleClearanceDeclared),
        status: 'APPROVED_IN_ROTATION',
      },
    });

    // Also mirror to memory engine
    submitEventEntry({
      userId: dbEntry.userId,
      userName: dbEntry.userName,
      category: category || 'MONDAY_NIGHT_STAGE',
      title: dbEntry.actTitle,
      bpm: dbEntry.bpm || 95,
      genre: dbEntry.genre || 'Hip-Hop / R&B',
      audioUrl: dbEntry.audioUrl || undefined,
      videoUrl: dbEntry.videoUrl || undefined,
      rightsAttested: dbEntry.rightsAttested,
      sampleClearanceDeclared: dbEntry.sampleClearanceDeclared,
    });

    return NextResponse.json({ ok: true, submission: dbEntry });
  } catch (err: any) {
    console.error('[Submissions API POST Error]', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to submit' }, { status: 500 });
  }
}
