/**
 * SubmissionEngine — unified content ingestion pipeline for TMI.
 *
 * All track, video, beat, and cypher submissions flow through here.
 * On creation, a viral share link is automatically seeded in ShareTrackingEngine
 * and an XP event is awarded to the submitter.
 */

import { awardXP } from '@/lib/profile/ProfileRewardsEngine';
import { recordPlaylistShareEvent, buildPlaylistReferralUrl } from '@/lib/share/ShareTrackingEngine';
import { emitAdminLiveEvent } from '@/lib/admin/AdminLiveEventEngine';

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
const submissionStore = new Map<string, Submission>();
const XP_ON_SUBMIT = 50;

function genId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitize(input: string, max = 120): string {
  return input.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max);
}

function countPendingForUser(submitterId: string): number {
  let count = 0;
  for (const s of submissionStore.values()) {
    if (s.submitterId === submitterId && (s.status === 'pending' || s.status === 'live')) count++;
  }
  return count;
}

export function createSubmission(input: SubmissionInput): SubmissionResult {
  const submitterId = sanitize(input.submitterId, 64);
  const title = sanitize(input.title, 80);
  const url = input.url?.trim() ?? '';

  if (!submitterId || !title || !url) {
    return { ok: false, error: 'invalid_input' };
  }

  if (countPendingForUser(submitterId) >= PENDING_MAX_PER_USER) {
    return { ok: false, error: 'quota_exceeded' };
  }

  const id = genId();
  const genre = sanitize(input.genre ?? 'General', 40);
  const description = sanitize(input.description ?? '', 400);
  const tags = (input.tags ?? []).map((t) => sanitize(t, 30)).filter(Boolean).slice(0, 10);

  // Build share URL for this submission immediately
  const shareUrl = buildPlaylistReferralUrl({
    playlistId: id,
    curatorId: submitterId,
    playlistTitle: title,
    path: `/submit/confirm?id=${encodeURIComponent(id)}`,
  });

  const submission: Submission = {
    id,
    submitterId,
    title,
    type: input.type,
    status: 'pending',
    url,
    genre,
    description,
    bpm: input.bpm != null && Number.isFinite(input.bpm) ? Math.round(input.bpm) : null,
    tags,
    shareUrl,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  submissionStore.set(id, submission);

  // Seed tracking immediately — first share event is the submission itself
  recordPlaylistShareEvent({
    event: 'share',
    playlistId: id,
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

export function getSubmission(id: string): Submission | null {
  return submissionStore.get(id) ?? null;
}

export function updateSubmissionStatus(id: string, status: SubmissionStatus): Submission | null {
  const s = submissionStore.get(id);
  if (!s) return null;
  const updated = { ...s, status, updatedAt: Date.now() };
  submissionStore.set(id, updated);

  if (status === 'approved' || status === 'live') {
    emitAdminLiveEvent({
      type: 'submission_approved',
      message: `[${new Date().toLocaleTimeString()}] ✅ Submission ${status}: ${updated.title} (${updated.type})`,
      meta: {
        submissionId: updated.id,
        submitterId: updated.submitterId,
        submissionType: updated.type,
        status: updated.status,
      },
    });
  }

  return updated;
}

export function listSubmissions(filter?: {
  submitterId?: string;
  type?: SubmissionType;
  status?: SubmissionStatus;
  limit?: number;
}): Submission[] {
  let results = Array.from(submissionStore.values());
  if (filter?.submitterId) results = results.filter((s) => s.submitterId === filter.submitterId);
  if (filter?.type) results = results.filter((s) => s.type === filter.type);
  if (filter?.status) results = results.filter((s) => s.status === filter.status);
  results.sort((a, b) => b.createdAt - a.createdAt);
  return filter?.limit ? results.slice(0, filter.limit) : results;
}

export function getSubmissionCount(): { total: number; pending: number; live: number } {
  let pending = 0;
  let live = 0;
  for (const s of submissionStore.values()) {
    if (s.status === 'pending') pending++;
    if (s.status === 'live') live++;
  }
  return { total: submissionStore.size, pending, live };
}
