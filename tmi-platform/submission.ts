export type SubmissionType = 'radio_track' | 'battle_challenge' | 'playlist_curation';

export type SubmissionStatus = 'pending' | 'in_review' | 'approved' | 'live' | 'rejected';

export interface SubmissionRecord {
  id: string;
  userId: string;
  type: SubmissionType;
  title: string;
  mediaUrl: string; // Link to the audio/video asset
  description?: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Core Submission Engine
 * In a production environment, this interfaces with Prisma or Supabase.
 */
export class SubmissionEngine {
  static async createSubmission(data: Omit<SubmissionRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<SubmissionRecord> {
    // Mock database insertion
    return {
      ...data,
      id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending', // Starts pending, picked up by automation or admin
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}