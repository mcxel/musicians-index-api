export type MediaJobType = 'BATTLE_POSTER' | 'ARTICLE_COVER' | 'AVATAR_BOT' | 'SPONSOR_BANNER' | 'NFT_COVER' | 'SOCIAL_CARD';
export type MediaJobStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'GENERATED';

export interface MediaGenerationJob {
  id: string;
  type: MediaJobType;
  params: Record<string, unknown>;
  requestedBy: string;
  status: MediaJobStatus;
  createdAt: string;
  updatedAt: string;
  outputUrl?: string;
}

class MediaGenerationEngineClass {
  private queue: MediaGenerationJob[] = [];

  async requestGeneration(
    type: MediaJobType,
    params: Record<string, unknown>,
    requestedBy: string,
  ): Promise<MediaGenerationJob> {
    const job: MediaGenerationJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      params,
      requestedBy,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.queue.push(job);
    return job;
  }

  getApprovalQueue(): MediaGenerationJob[] {
    return this.queue.filter((j) => j.status === 'PENDING');
  }

  getAllJobs(): MediaGenerationJob[] {
    return [...this.queue];
  }

  updateJobStatus(jobId: string, status: 'APPROVED' | 'REJECTED'): MediaGenerationJob | null {
    const job = this.queue.find((j) => j.id === jobId);
    if (!job) return null;
    job.status = status;
    job.updatedAt = new Date().toISOString();
    return job;
  }

  getJob(jobId: string): MediaGenerationJob | null {
    return this.queue.find((j) => j.id === jobId) ?? null;
  }
}

export const mediaGenerationEngine = new MediaGenerationEngineClass();
