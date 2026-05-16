/**
 * ArticleSnippetRotationEngine
 * Serves randomized article snippets across homepage and magazine surfaces.
 * 3 snippets per rotation, weighted by recency and editorial score.
 */

export type SnippetSurface = "homepage" | "lobby" | "sidebar" | "tv-lean-back" | "kiosk" | "mobile-feed";
export type ArticleCategory = "music" | "artist-spotlight" | "industry" | "culture" | "interview" | "how-to" | "events" | "winners";

export interface ArticleSnippet {
  articleId: string;
  issueId: string;
  title: string;
  subtitle?: string;
  excerpt: string;      // max 140 chars
  author: string;
  category: ArticleCategory;
  coverImageUrl?: string;
  publishedAt: number;
  editorialScore: number; // 0–100, set by editors
  clickCount: number;
  impressionCount: number;
  tags: string[];
  href: string;
}

export interface RotationSet {
  surface: SnippetSurface;
  snippets: ArticleSnippet[];
  rotatedAt: number;
  nextRotateAt: number;
}

const ROTATION_INTERVALS: Record<SnippetSurface, number> = {
  homepage:      15 * 60 * 1000,  // 15 min
  lobby:         10 * 60 * 1000,  // 10 min
  sidebar:       20 * 60 * 1000,
  "tv-lean-back": 5 * 60 * 1000,
  kiosk:         8 * 60 * 1000,
  "mobile-feed": 12 * 60 * 1000,
};

function weightedScore(snippet: ArticleSnippet): number {
  const ageMs = Date.now() - snippet.publishedAt;
  const ageDays = ageMs / 86_400_000;
  const recencyScore = Math.max(0, 40 - ageDays * 2); // decay over 20 days
  const engagementRate = snippet.impressionCount > 0
    ? (snippet.clickCount / snippet.impressionCount) * 100 : 0;
  const engagementScore = Math.min(engagementRate * 2, 30);
  return snippet.editorialScore * 0.3 + recencyScore + engagementScore;
}

export class ArticleSnippetRotationEngine {
  private static _instance: ArticleSnippetRotationEngine | null = null;

  private _pool: Map<string, ArticleSnippet> = new Map();
  private _rotations: Map<SnippetSurface, RotationSet> = new Map();
  private _timers: Map<SnippetSurface, ReturnType<typeof setInterval>> = new Map();
  private _listeners: Set<(surface: SnippetSurface, set: RotationSet) => void> = new Set();

  static getInstance(): ArticleSnippetRotationEngine {
    if (!ArticleSnippetRotationEngine._instance) {
      ArticleSnippetRotationEngine._instance = new ArticleSnippetRotationEngine();
    }
    return ArticleSnippetRotationEngine._instance;
  }

  // ── Pool management ────────────────────────────────────────────────────────

  addSnippet(snippet: ArticleSnippet): void {
    this._pool.set(snippet.articleId, snippet);
  }

  addSnippets(snippets: ArticleSnippet[]): void {
    for (const s of snippets) this.addSnippet(s);
  }

  updateSnippet(articleId: string, updates: Partial<ArticleSnippet>): void {
    const existing = this._pool.get(articleId);
    if (existing) this._pool.set(articleId, { ...existing, ...updates });
  }

  recordImpression(articleId: string): void {
    const s = this._pool.get(articleId);
    if (s) s.impressionCount++;
  }

  recordClick(articleId: string): void {
    const s = this._pool.get(articleId);
    if (s) { s.clickCount++; }
  }

  // ── Rotation ──────────────────────────────────────────────────────────────

  rotate(surface: SnippetSurface, count = 3, filter?: { category?: ArticleCategory; issueId?: string; tags?: string[] }): RotationSet {
    const now = Date.now();
    const interval = ROTATION_INTERVALS[surface];

    let candidates = [...this._pool.values()];
    if (filter?.category) candidates = candidates.filter((s) => s.category === filter.category);
    if (filter?.issueId) candidates = candidates.filter((s) => s.issueId === filter.issueId);
    if (filter?.tags?.length) candidates = candidates.filter((s) => filter.tags!.some((t) => s.tags.includes(t)));

    // Sort by weighted score + slight randomization to prevent lock-in
    candidates.sort((a, b) => (weightedScore(b) + Math.random() * 10) - (weightedScore(a) + Math.random() * 10));

    const snippets = candidates.slice(0, count);
    for (const s of snippets) s.impressionCount++;

    const rotationSet: RotationSet = {
      surface,
      snippets,
      rotatedAt: now,
      nextRotateAt: now + interval,
    };

    this._rotations.set(surface, rotationSet);
    for (const cb of this._listeners) cb(surface, rotationSet);
    return rotationSet;
  }

  getRotation(surface: SnippetSurface): RotationSet | null {
    const set = this._rotations.get(surface);
    if (!set) return this.rotate(surface);
    // Auto-rotate if stale
    if (Date.now() > set.nextRotateAt) return this.rotate(surface);
    return set;
  }

  // ── Auto-rotation ──────────────────────────────────────────────────────────

  startAutoRotation(surface: SnippetSurface): void {
    this.stopAutoRotation(surface);
    const interval = ROTATION_INTERVALS[surface];
    this.rotate(surface);
    const timer = setInterval(() => this.rotate(surface), interval);
    this._timers.set(surface, timer);
  }

  stopAutoRotation(surface: SnippetSurface): void {
    const timer = this._timers.get(surface);
    if (timer) { clearInterval(timer); this._timers.delete(surface); }
  }

  startAllAutoRotations(): void {
    const surfaces: SnippetSurface[] = ["homepage", "lobby", "sidebar", "tv-lean-back", "kiosk", "mobile-feed"];
    for (const s of surfaces) this.startAutoRotation(s);
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  getTopSnippets(limit = 10): ArticleSnippet[] {
    return [...this._pool.values()]
      .sort((a, b) => weightedScore(b) - weightedScore(a))
      .slice(0, limit);
  }

  getPoolSize(): number {
    return this._pool.size;
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onRotation(cb: (surface: SnippetSurface, set: RotationSet) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }
}

export const articleSnippetRotationEngine = ArticleSnippetRotationEngine.getInstance();
