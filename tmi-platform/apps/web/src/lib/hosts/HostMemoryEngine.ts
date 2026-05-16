/**
 * HostMemoryEngine
 * Persistent per-user memory for hosts. Hosts remember names, interactions,
 * performance history, and personal details across sessions.
 */

export interface UserMemoryRecord {
  userId: string;
  displayName: string;
  /** Approximate age category */
  ageCategory?: "teen" | "young-adult" | "adult";
  /** How many times this user has been in a show */
  showCount: number;
  /** Best performance score seen */
  bestScore?: number;
  /** Tags the host uses to personalize references */
  tags: string[];
  /** Host's last spoken reference to this user */
  lastReference?: string;
  /** Unix ms of last interaction */
  lastSeenAt: number;
  /** Milestones achieved */
  milestones: string[];
}

export interface HostMemorySession {
  hostId: string;
  showId: string;
  openedAt: number;
  interactions: InteractionLog[];
}

export interface InteractionLog {
  userId: string;
  displayName: string;
  eventType: "entrance" | "vote" | "reaction" | "win" | "elimination" | "purchase" | "chat";
  detail?: string;
  timestamp: number;
}

export interface MemoryRecall {
  userId: string;
  hostLine: string;
  tone: "warm" | "hype" | "congratulatory" | "sympathetic" | "playful";
}

const WARM_OPENERS = ["Hey", "Welcome back", "Look who's here", "Oh it's"];
const HYPE_OPENERS = ["YO", "LETS GO", "Here comes", "The one and only"];
const FIRST_TIME = ["First time here?", "We love a newcomer!", "Brand new to the show!"];

export class HostMemoryEngine {
  private static _instance: HostMemoryEngine | null = null;

  private _users: Map<string, UserMemoryRecord> = new Map();
  private _session: HostMemorySession | null = null;

  static getInstance(): HostMemoryEngine {
    if (!HostMemoryEngine._instance) {
      HostMemoryEngine._instance = new HostMemoryEngine();
    }
    return HostMemoryEngine._instance;
  }

  // ── Session ────────────────────────────────────────────────────────────────

  openSession(hostId: string, showId: string): void {
    this._session = {
      hostId,
      showId,
      openedAt: Date.now(),
      interactions: [],
    };
  }

  closeSession(): HostMemorySession | null {
    const s = this._session;
    this._session = null;
    return s;
  }

  // ── User memory ────────────────────────────────────────────────────────────

  remember(userId: string, displayName: string, tags: string[] = []): UserMemoryRecord {
    const existing = this._users.get(userId);
    if (existing) {
      existing.displayName = displayName;
      existing.showCount++;
      existing.lastSeenAt = Date.now();
      if (tags.length) existing.tags = [...new Set([...existing.tags, ...tags])];
      return existing;
    }
    const record: UserMemoryRecord = {
      userId,
      displayName,
      showCount: 1,
      tags,
      lastSeenAt: Date.now(),
      milestones: [],
    };
    this._users.set(userId, record);
    return record;
  }

  recall(userId: string): UserMemoryRecord | null {
    return this._users.get(userId) ?? null;
  }

  recordScore(userId: string, score: number): void {
    const rec = this._users.get(userId);
    if (!rec) return;
    if (rec.bestScore === undefined || score > rec.bestScore) {
      rec.bestScore = score;
      rec.milestones.push(`Best score: ${score}`);
    }
  }

  addMilestone(userId: string, milestone: string): void {
    const rec = this._users.get(userId);
    if (rec && !rec.milestones.includes(milestone)) {
      rec.milestones.push(milestone);
    }
  }

  logInteraction(log: Omit<InteractionLog, "timestamp">): void {
    if (!this._session) return;
    this._session.interactions.push({ ...log, timestamp: Date.now() });
  }

  // ── Personalized recall lines ──────────────────────────────────────────────

  generateRecallLine(userId: string): MemoryRecall | null {
    const rec = this._users.get(userId);
    if (!rec) return null;

    const isFirstTime = rec.showCount === 1;
    let hostLine: string;
    let tone: MemoryRecall["tone"] = "warm";

    if (isFirstTime) {
      hostLine = `${FIRST_TIME[Math.floor(Math.random() * FIRST_TIME.length)]} ${rec.displayName}!`;
      tone = "warm";
    } else if (rec.bestScore !== undefined && rec.bestScore > 90) {
      hostLine = `${HYPE_OPENERS[Math.floor(Math.random() * HYPE_OPENERS.length)]} ${rec.displayName}! Last time you scored ${rec.bestScore}. Can you top it?`;
      tone = "hype";
    } else if (rec.milestones.length > 0) {
      const milestone = rec.milestones[rec.milestones.length - 1];
      hostLine = `${WARM_OPENERS[Math.floor(Math.random() * WARM_OPENERS.length)]} ${rec.displayName}! ${milestone}!`;
      tone = "congratulatory";
    } else {
      hostLine = `${WARM_OPENERS[Math.floor(Math.random() * WARM_OPENERS.length)]} ${rec.displayName}! Show number ${rec.showCount} for you!`;
      tone = "warm";
    }

    rec.lastReference = hostLine;
    return { userId, hostLine, tone };
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  getUserCount(): number {
    return this._users.size;
  }

  getTopPerformers(limit = 5): UserMemoryRecord[] {
    return [...this._users.values()]
      .sort((a, b) => (b.bestScore ?? 0) - (a.bestScore ?? 0))
      .slice(0, limit);
  }

  getFrequentUsers(minShows = 3): UserMemoryRecord[] {
    return [...this._users.values()].filter((u) => u.showCount >= minShows);
  }
}

export const hostMemoryEngine = HostMemoryEngine.getInstance();
