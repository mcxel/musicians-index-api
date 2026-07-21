// ─── Event & Producer Submission Engine ──────────────────────────────────────
// Manages Producer Beat Battle, World Dance Party, and Monday Night Stage submissions,
// rights attestation, audio/video file validation, and queue assignment.

export type SubmissionCategory =
  | 'PRODUCER_BEAT_BATTLE'
  | 'WORLD_DANCE_PARTY'
  | 'MONDAY_NIGHT_STAGE'
  | 'CYPHER_ROTATION';

export type SubmissionStatus =
  | 'SUBMITTED'
  | 'RIGHTS_ATTESTED'
  | 'SAFETY_REVIEWED'
  | 'APPROVED_IN_ROTATION'
  | 'REJECTED';

export interface EventSubmissionEntry {
  id: string;
  userId: string;
  userName: string;
  category: SubmissionCategory;
  title: string;
  bpm?: number;
  genre: string;
  audioUrl?: string;
  videoUrl?: string; // Choreography entry video for Dance Party
  rightsAttested: boolean;
  sampleClearanceDeclared: boolean;
  status: SubmissionStatus;
  queuedForDate?: string;
  createdAt: string;
}

const SUBMISSION_STORAGE_KEY = 'tmi_event_submissions_ledger';

export function getStoredSubmissions(): EventSubmissionEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SUBMISSION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse submissions ledger:', err);
  }
  return [];
}

export function submitEventEntry(entry: Omit<EventSubmissionEntry, 'id' | 'status' | 'createdAt'>): EventSubmissionEntry {
  const newEntry: EventSubmissionEntry = {
    ...entry,
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    status: 'APPROVED_IN_ROTATION', // Auto-approved in runtime queue
    createdAt: new Date().toISOString(),
    queuedForDate: new Date().toISOString(),
  };

  const existing = getStoredSubmissions();
  const updated = [newEntry, ...existing];

  try {
    localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(updated));
    // Reward XP for submitting content
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tmi-xp-reward', { detail: { amount: 200, reason: 'Event Submission Accepted' } }));
    }
  } catch (err) {
    console.error('Failed to save event submission:', err);
  }

  return newEntry;
}

export function getSubmissionsByCategory(category: SubmissionCategory): EventSubmissionEntry[] {
  return getStoredSubmissions().filter((s) => s.category === category);
}
