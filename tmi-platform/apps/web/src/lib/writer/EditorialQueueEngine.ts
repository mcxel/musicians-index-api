// EditorialQueueEngine — submission → review → approval → publish pipeline.

export type SubmissionCategory =
  | "artist-spotlight"
  | "performer-feature"
  | "battle-recap"
  | "culture-news"
  | "interview"
  | "review"
  | "sponsor-story"
  | "editorial";

export type PitchStatus =
  | "submitted"
  | "under-review"
  | "approved"
  | "rejected"
  | "assigned"
  | "submitted-for-review"
  | "published";

// Alias so consumers can use either name
export type SubmissionStatus = PitchStatus;
export type PitchCategory    = SubmissionCategory;

export interface Pitch {
  id: string;
  writerId: string;
  writerName?: string;
  title: string;
  /** Pitch body — also exposed as `summary` for UI consumption */
  summary: string;
  category: SubmissionCategory;
  references?: string[];
  pitchedTo?: "editors" | "sponsors" | "promoters";
  status: PitchStatus;
  editorNotes?: string;
  budget?: number;
  scheduledFor?: string;
  articleSlug?: string;
  submittedAt: string;
  updatedAt: string;
}

// Alias — legacy consumers that imported WriterSubmission still compile
export type WriterSubmission = Pitch;

const queue = new Map<string, Pitch>();

function makeId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

// ─── Writer actions ───────────────────────────────────────────────────────────

export function submitPitch(
  writerId: string,
  opts: {
    title: string;
    summary: string;
    category: SubmissionCategory;
    references?: string[];
    pitchedTo?: Pitch["pitchedTo"];
    targetPublicationDate?: string;
    writerName?: string;
  },
): Pitch {
  const now = new Date().toISOString();
  const p: Pitch = {
    id: makeId(),
    writerId,
    writerName: opts.writerName,
    title: opts.title,
    summary: opts.summary,
    category: opts.category,
    references: opts.references,
    pitchedTo: opts.pitchedTo,
    status: "submitted",
    scheduledFor: opts.targetPublicationDate,
    submittedAt: now,
    updatedAt: now,
  };
  queue.set(p.id, p);
  return p;
}

export function getPitchesByWriter(writerId: string): Pitch[] {
  return [...queue.values()]
    .filter((p) => p.writerId === writerId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function getMySubmissions(writerId: string): Pitch[] {
  return getPitchesByWriter(writerId);
}

// ─── Editor / admin actions ───────────────────────────────────────────────────

export function reviewSubmission(id: string): void {
  const p = queue.get(id);
  if (p) queue.set(id, { ...p, status: "under-review", updatedAt: new Date().toISOString() });
}

export function approveSubmission(
  id: string,
  opts: { budget?: number; scheduledFor?: string; editorNotes?: string } = {},
): void {
  const p = queue.get(id);
  if (!p) return;
  queue.set(id, {
    ...p,
    status: "approved",
    budget: opts.budget,
    scheduledFor: opts.scheduledFor,
    editorNotes: opts.editorNotes,
    updatedAt: new Date().toISOString(),
  });
}

export function rejectSubmission(id: string, editorNotes?: string): void {
  const p = queue.get(id);
  if (!p) return;
  queue.set(id, { ...p, status: "rejected", editorNotes, updatedAt: new Date().toISOString() });
}

export function markPublished(id: string, articleSlug?: string): void {
  const p = queue.get(id);
  if (!p) return;
  queue.set(id, { ...p, status: "published", articleSlug, updatedAt: new Date().toISOString() });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getAllSubmissions(): Pitch[] {
  return [...queue.values()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function getPendingReview(): Pitch[] {
  return getAllSubmissions().filter(
    (p) => p.status === "submitted" || p.status === "under-review",
  );
}

export function getApproved(): Pitch[] {
  return getAllSubmissions().filter((p) => p.status === "approved");
}

export function canSubmitToday(writerId: string): boolean {
  const today = new Date().toDateString();
  const count = [...queue.values()].filter(
    (p) => p.writerId === writerId && new Date(p.submittedAt).toDateString() === today,
  ).length;
  return count < 5;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

const seeded = new Set<string>();

export function seedPitches(writerId: string): void {
  if (seeded.has(writerId)) return;
  seeded.add(writerId);
  const base = Date.now();

  const demos: Pitch[] = [
    {
      id: `seed-p1-${writerId}`,
      writerId,
      title: "Nova Cipher: The 8-Streak Nobody Saw Coming",
      summary: "Nova's win record is unprecedented. I want to go behind the streak — her prep routine, scouting process, and how she reads crowd momentum before a round starts.",
      category: "performer-feature",
      status: "approved",
      editorNotes: "Strong angle. Budget approved at $150. Target: Issue 2.",
      budget: 150,
      scheduledFor: "2026-06-01",
      submittedAt: new Date(base - 5 * 86400000).toISOString(),
      updatedAt: new Date(base - 2 * 86400000).toISOString(),
    },
    {
      id: `seed-p2-${writerId}`,
      writerId,
      title: "Battle Culture in 2026 — A Platform Study",
      summary: "TMI has changed how battles are judged, watched, and monetized. The definitive piece on where battle rap culture stands right now.",
      category: "editorial",
      status: "published",
      editorNotes: "Published in Issue 1. Great work.",
      articleSlug: "battle-culture-2026",
      budget: 200,
      submittedAt: new Date(base - 45 * 86400000).toISOString(),
      updatedAt: new Date(base - 40 * 86400000).toISOString(),
    },
    {
      id: `seed-p3-${writerId}`,
      writerId,
      title: "SoundWave Audio: Inside the Gear Partnership",
      summary: "A behind-the-scenes look at how the SoundWave x TMI partnership came together and what it means for performers in Season 2.",
      category: "sponsor-story",
      status: "under-review",
      submittedAt: new Date(base - 86400000).toISOString(),
      updatedAt: new Date(base - 86400000).toISOString(),
    },
  ];
  demos.forEach((d) => queue.set(d.id, d));
}
