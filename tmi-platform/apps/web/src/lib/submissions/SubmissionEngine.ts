/**
 * SubmissionEngine — unified content ingestion pipeline for TMI.
 *
 * All track, video, beat, and cypher submissions flow through here.
 * On creation, a viral share link is automatically seeded in ShareTrackingEngine
 * and an XP event is awarded to the submitter.
 *
 * Backed by Prisma (Submission table) — submit/approve/rotate state survives
 * server restarts and is consistent across instances. Previously an
 * in-memory Map; that meant the Stream & Win queue reset on every deploy.
 */

import { prisma } from '@/lib/prisma';
import { awardXP } from '@/lib/profile/ProfileRewardsEngine';
import { recordPlaylistShareEvent, buildPlaylistReferralUrl } from '@/lib/share/ShareTrackingEngine';
import type { Submission as PrismaSubmission } from '@prisma/client';

export type SubmissionType = 'track' | 'video' | 'beat' | 'cypher' | 'battle' | 'comedy' | 'dance' | 'show';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'live' | 'expired';

export interface SubmissionInput {
  submitterId: string;
  title: string;
  type: SubmissionType;
  url: string;
  genre?: string;
  description?: string;
  bpm?: number;
  tags?: string[];
}

export interface Submission {
  id: string;
  submitterId: string;
  title: string;
  type: SubmissionType;
  status: SubmissionStatus;
  url: string;
  genre: string;
  description: string;
  bpm: number | null;
  tags: string[];
  shareUrl: string;
  createdAt: number;
  updatedAt: number;
}

export interface SubmissionResult {
  ok: boolean;
  submission?: Submission;
  shareUrl?: string;
  error?: 'quota_exceeded' | 'invalid_input' | 'duplicate';
}

const PENDING_MAX_PER_USER = 5;
const XP_ON_SUBMIT = 50;

function toSubmission(row: PrismaSubmission): Submission {
  return {
    id: row.id,
    submitterId: row.submitterId,
    title: row.title,
    type: row.type as SubmissionType,
    status: row.status as SubmissionStatus,
    url: row.url,
    genre: row.genre,
    description: row.description,
    bpm: row.bpm,
    tags: row.tags,
    shareUrl: row.shareUrl,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  };
}

function stripControlChars(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 32 && code !== 127) out += ch;
  }
  return out;
}

function sanitize(input: string, max = 120): string {
  return stripControlChars(input.trim()).slice(0, max);
}

async function countPendingForUser(submitterId: string): Promise<number> {
  return prisma.submission.count({
    where: { submitterId, status: { in: ['pending', 'live'] } },
  });
}

export async function createSubmission(input: SubmissionInput): Promise<SubmissionResult> {
  const submitterId = sanitize(input.submitterId, 64);
  const title = sanitize(input.title, 80);
  const url = input.url?.trim() ?? '';

  if (!submitterId || !title || !url) {
    return { ok: false, error: 'invalid_input' };
  }

  if ((await countPendingForUser(submitterId)) >= PENDING_MAX_PER_USER) {
    return { ok: false, error: 'quota_exceeded' };
  }

  const genre = sanitize(input.genre ?? 'General', 40);
  const description = sanitize(input.description ?? '', 400);
  const tags = (input.tags ?? []).map((t) => sanitize(t, 30)).filter(Boolean).slice(0, 10);
  const bpm = input.bpm != null && Number.isFinite(input.bpm) ? Math.round(input.bpm) : null;

  // Reserve the row first so we have a real id to build the share URL from.
  const created = await prisma.submission.create({
    data: {
      submitterId,
      title,
      type: input.type,
      status: 'pending',
      url,
      genre,
      description,
      bpm,
      tags,
      shareUrl: '',
    },
  });

  const shareUrl = buildPlaylistReferralUrl({
    playlistId: created.id,
    curatorId: submitterId,
    playlistTitle: title,
    path: `/submit/confirm?id=${encodeURIComponent(created.id)}`,
  });

  const final = await prisma.submission.update({
    where: { id: created.id },
    data: { shareUrl },
  });

  const submission = toSubmission(final);

  // Seed tracking immediately — first share event is the submission itself
  recordPlaylistShareEvent({
    event: 'share',
    playlistId: submission.id,
    curatorId: submitterId,
    referrerId: submitterId,
    source: 'submission_create',
    platform: 'native',
    occurredAt: submission.createdAt,
  });

  // Award XP for submitting
  void awardXP(submitterId, XP_ON_SUBMIT, `Submitted: ${title}`);

  return { ok: true, submission, shareUrl };
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const row = await prisma.submission.findUnique({ where: { id } });
  return row ? toSubmission(row) : null;
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<Submission | null> {
  const existing = await prisma.submission.findUnique({ where: { id } });
  if (!existing) return null;
  const updated = await prisma.submission.update({ where: { id }, data: { status } });
  return toSubmission(updated);
}

export async function listSubmissions(filter?: {
  submitterId?: string;
  type?: SubmissionType;
  status?: SubmissionStatus;
  limit?: number;
}): Promise<Submission[]> {
  const rows = await prisma.submission.findMany({
    where: {
      ...(filter?.submitterId ? { submitterId: filter.submitterId } : {}),
      ...(filter?.type ? { type: filter.type } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    ...(filter?.limit ? { take: filter.limit } : {}),
  });
  return rows.map(toSubmission);
}

export async function getSubmissionCount(): Promise<{ total: number; pending: number; live: number }> {
  const [total, pending, live] = await Promise.all([
    prisma.submission.count(),
    prisma.submission.count({ where: { status: 'pending' } }),
    prisma.submission.count({ where: { status: 'live' } }),
  ]);
  return { total, pending, live };
}
