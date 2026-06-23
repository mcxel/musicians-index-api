export type SongDnaBestPart = 'hook' | 'verse' | 'chorus' | 'beat' | 'vocals' | 'lyrics' | 'energy' | 'mix' | 'overall';
export type SongDnaNeedsWork = 'none' | 'hook' | 'verse' | 'chorus' | 'beat' | 'vocals' | 'lyrics' | 'energy' | 'mix' | 'overall';

export interface SongDnaFeedbackInput {
  songId: string;
  artistId: string;
  userId: string;
  bestPart: SongDnaBestPart;
  needsWork: SongDnaNeedsWork;
  listenAgainTomorrow: boolean;
  comment?: string;
}

export interface SongDnaFeedbackEntry extends SongDnaFeedbackInput {
  id: string;
  createdAt: string;
}

export interface SongDnaSummary {
  songId: string;
  artistId: string;
  totalFeedback: number;
  listenAgainTomorrowRate: number;
  bestPartBreakdown: Record<SongDnaBestPart, number>;
  needsWorkBreakdown: Record<SongDnaNeedsWork, number>;
}

const feedbackBySong = new Map<string, SongDnaFeedbackEntry[]>();

const BEST_PART_VALUES: SongDnaBestPart[] = ['hook', 'verse', 'chorus', 'beat', 'vocals', 'lyrics', 'energy', 'mix', 'overall'];
const NEEDS_WORK_VALUES: SongDnaNeedsWork[] = ['none', 'hook', 'verse', 'chorus', 'beat', 'vocals', 'lyrics', 'energy', 'mix', 'overall'];

function nowIso(): string {
  return new Date().toISOString();
}

function newFeedbackId(songId: string, userId: string): string {
  return `sdna_${songId}_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createBestPartBreakdown(): Record<SongDnaBestPart, number> {
  return {
    hook: 0,
    verse: 0,
    chorus: 0,
    beat: 0,
    vocals: 0,
    lyrics: 0,
    energy: 0,
    mix: 0,
    overall: 0,
  };
}

function createNeedsWorkBreakdown(): Record<SongDnaNeedsWork, number> {
  return {
    none: 0,
    hook: 0,
    verse: 0,
    chorus: 0,
    beat: 0,
    vocals: 0,
    lyrics: 0,
    energy: 0,
    mix: 0,
    overall: 0,
  };
}

export function isSongDnaBestPart(value: string): value is SongDnaBestPart {
  return BEST_PART_VALUES.includes(value as SongDnaBestPart);
}

export function isSongDnaNeedsWork(value: string): value is SongDnaNeedsWork {
  return NEEDS_WORK_VALUES.includes(value as SongDnaNeedsWork);
}

class SongAudienceIntelEngine {
  submit(input: SongDnaFeedbackInput): SongDnaFeedbackEntry {
    const current = feedbackBySong.get(input.songId) ?? [];
    const filtered = current.filter((entry) => entry.userId !== input.userId);

    const next: SongDnaFeedbackEntry = {
      ...input,
      id: newFeedbackId(input.songId, input.userId),
      createdAt: nowIso(),
      comment: input.comment?.slice(0, 500),
    };

    feedbackBySong.set(input.songId, [next, ...filtered]);
    return next;
  }

  getSummary(songId: string, artistId?: string): SongDnaSummary {
    const entries = feedbackBySong.get(songId) ?? [];
    const summary: SongDnaSummary = {
      songId,
      artistId: artistId ?? entries[0]?.artistId ?? 'unknown',
      totalFeedback: entries.length,
      listenAgainTomorrowRate: 0,
      bestPartBreakdown: createBestPartBreakdown(),
      needsWorkBreakdown: createNeedsWorkBreakdown(),
    };

    if (entries.length === 0) return summary;

    let listenAgainCount = 0;
    for (const entry of entries) {
      summary.bestPartBreakdown[entry.bestPart] += 1;
      summary.needsWorkBreakdown[entry.needsWork] += 1;
      if (entry.listenAgainTomorrow) listenAgainCount += 1;
    }

    summary.listenAgainTomorrowRate = Math.round((listenAgainCount / entries.length) * 100);
    return summary;
  }

  listRecent(songId: string, limit = 25): SongDnaFeedbackEntry[] {
    const entries = feedbackBySong.get(songId) ?? [];
    return entries.slice(0, Math.max(1, Math.min(limit, 100)));
  }
}

export const songAudienceIntelEngine = new SongAudienceIntelEngine();
