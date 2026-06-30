/**
 * SubmissionQueueEngine.ts
 *
 * Manages submissions to editorial/radio platforms.
 * SEPARATE from Personal Playlist.
 *
 * Personal Playlist = User's uploaded songs (immediate)
 * Submission Queue = Songs submitted for editorial/radio approval (queue)
 *
 * Rule: Submitting a song requires explicit user action via Music Studio.
 */

export type SubmissionStatus = 'pending' | 'approved' | 'scheduled' | 'live' | 'featured' | 'archived';

export interface SubmissionMetadata {
  genre: string;
  mood: string;
  bpm?: number;
  key?: string;
  description?: string;
}

export interface SubmissionStats {
  plays: number;
  saves: number;
  shares: number;
  completionRate?: number;
}

export interface SubmissionQueueItem {
  submissionId: string;
  userId: string;
  songId: string;
  title: string;
  destinations: string[]; // 'stream-radio', 'one-prayer', 'magazine', 'world-release', 'world-concert'
  metadata: SubmissionMetadata;
  status: SubmissionStatus;
  submittedAt: string;
  approvedAt?: string;
  scheduledFor?: string;
  rejectionReason?: string;
  stats?: SubmissionStats;
  updatedAt: string;
}

class SubmissionQueueEngine {
  private queue = new Map<string, SubmissionQueueItem>();
  private userSubmissions = new Map<string, string[]>(); // userId → [submissionId, ...]

  /**
   * Submit a song to the queue.
   * User must have this song in their Personal Playlist.
   */
  submit(input: {
    userId: string;
    songId: string;
    title: string;
    destinations: string[];
    metadata: SubmissionMetadata;
  }): SubmissionQueueItem {
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();

    const submission: SubmissionQueueItem = {
      submissionId,
      userId: input.userId,
      songId: input.songId,
      title: input.title,
      destinations: input.destinations,
      metadata: input.metadata,
      status: 'pending',
      submittedAt: now,
      updatedAt: now,
      stats: {
        plays: 0,
        saves: 0,
        shares: 0,
      },
    };

    this.queue.set(submissionId, submission);

    // Track user's submissions
    if (!this.userSubmissions.has(input.userId)) {
      this.userSubmissions.set(input.userId, []);
    }
    this.userSubmissions.get(input.userId)!.push(submissionId);

    return submission;
  }

  /**
   * Get a submission by ID.
   */
  getSubmission(submissionId: string): SubmissionQueueItem | undefined {
    return this.queue.get(submissionId);
  }

  /**
   * Get all submissions for a user.
   */
  getUserSubmissions(userId: string): SubmissionQueueItem[] {
    const submissionIds = this.userSubmissions.get(userId) || [];
    return submissionIds
      .map((id) => this.queue.get(id))
      .filter((sub) => !!sub) as SubmissionQueueItem[];
  }

  /**
   * Get submissions by status.
   */
  getSubmissionsByStatus(status: SubmissionStatus): SubmissionQueueItem[] {
    return Array.from(this.queue.values()).filter((sub) => sub.status === status);
  }

  /**
   * Get user's submissions by status.
   */
  getUserSubmissionsByStatus(userId: string, status: SubmissionStatus): SubmissionQueueItem[] {
    return this.getUserSubmissions(userId).filter((sub) => sub.status === status);
  }

  /**
   * Update submission status.
   * Called by editorial team during review.
   */
  updateStatus(
    submissionId: string,
    status: SubmissionStatus,
    updates?: {
      rejectionReason?: string;
      scheduledFor?: string;
    }
  ): SubmissionQueueItem | undefined {
    const submission = this.queue.get(submissionId);

    if (submission) {
      submission.status = status;
      submission.updatedAt = new Date().toISOString();

      if (status === 'approved') {
        submission.approvedAt = new Date().toISOString();
      }

      if (updates?.rejectionReason) {
        submission.rejectionReason = updates.rejectionReason;
      }

      if (updates?.scheduledFor) {
        submission.scheduledFor = updates.scheduledFor;
      }
    }

    return submission;
  }

  /**
   * Update submission stats.
   * Called when submission goes live and gets engagement.
   */
  updateStats(
    submissionId: string,
    stats: Partial<SubmissionStats>
  ): SubmissionQueueItem | undefined {
    const submission = this.queue.get(submissionId);

    if (submission) {
      submission.stats = {
        ...submission.stats,
        ...stats,
      } as SubmissionStats;
      submission.updatedAt = new Date().toISOString();
    }

    return submission;
  }

  /**
   * Get all submissions in queue (for editorial team).
   */
  getAllSubmissions(): SubmissionQueueItem[] {
    return Array.from(this.queue.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  /**
   * Get pending submissions (for review).
   */
  getPendingSubmissions(): SubmissionQueueItem[] {
    return this.getSubmissionsByStatus('pending');
  }

  /**
   * Get live submissions (currently airing).
   */
  getLiveSubmissions(): SubmissionQueueItem[] {
    return this.getSubmissionsByStatus('live');
  }

  /**
   * Count submissions by status.
   */
  countByStatus(): Record<SubmissionStatus, number> {
    const counts: Record<SubmissionStatus, number> = {
      pending: 0,
      approved: 0,
      scheduled: 0,
      live: 0,
      featured: 0,
      archived: 0,
    };

    this.queue.forEach((sub) => {
      counts[sub.status]++;
    });

    return counts;
  }
}

export const submissionQueueEngine = new SubmissionQueueEngine();
