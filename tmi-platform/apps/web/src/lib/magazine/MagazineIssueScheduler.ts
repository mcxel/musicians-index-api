/**
 * MagazineIssueScheduler
 * Monthly issue rotation, publish windows, and editorial calendar.
 */

export type IssueStatus = "draft" | "scheduled" | "live" | "archived" | "cancelled";

export interface MagazineIssue {
  id: string;
  issueNumber: number;
  title: string;
  coverImageUrl?: string;
  theme: string;
  status: IssueStatus;
  publishAt: number;
  archiveAt: number;
  articleIds: string[];
  coverArtistId?: string;
  editorialNote?: string;
  createdAt: number;
}

export interface IssueSchedule {
  currentIssue: MagazineIssue | null;
  nextIssue: MagazineIssue | null;
  upcomingIssues: MagazineIssue[];
  archivedIssues: MagazineIssue[];
}

export type MonthName = "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

const MONTH_THEMES: Record<MonthName, string> = {
  Jan: "New Year, New Sound",
  Feb: "Love & Music",
  Mar: "Spring Showcase",
  Apr: "Rising Stars",
  May: "Festival Season",
  Jun: "Summer Vibes",
  Jul: "Independence Beats",
  Aug: "Back to the Stage",
  Sep: "Fall Freshness",
  Oct: "Haunted Frequencies",
  Nov: "Gratitude Sessions",
  Dec: "Year in Review",
};

const MONTHS: MonthName[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export class MagazineIssueScheduler {
  private static _instance: MagazineIssueScheduler | null = null;

  private _issues: Map<string, MagazineIssue> = new Map();
  private _listeners: Set<(issue: MagazineIssue) => void> = new Set();
  private _timers: ReturnType<typeof setTimeout>[] = [];

  static getInstance(): MagazineIssueScheduler {
    if (!MagazineIssueScheduler._instance) {
      MagazineIssueScheduler._instance = new MagazineIssueScheduler();
    }
    return MagazineIssueScheduler._instance;
  }

  // ── Issue creation ─────────────────────────────────────────────────────────

  createIssue(
    issueNumber: number,
    title: string,
    publishAt: number,
    options: {
      theme?: string;
      coverImageUrl?: string;
      coverArtistId?: string;
      editorialNote?: string;
      articleIds?: string[];
      archiveDays?: number;
    } = {},
  ): MagazineIssue {
    const issue: MagazineIssue = {
      id: `issue-${issueNumber}`,
      issueNumber,
      title,
      coverImageUrl: options.coverImageUrl,
      theme: options.theme ?? "Monthly Spotlight",
      status: publishAt <= Date.now() ? "live" : "scheduled",
      publishAt,
      archiveAt: publishAt + (options.archiveDays ?? 32) * 86_400_000,
      articleIds: options.articleIds ?? [],
      coverArtistId: options.coverArtistId,
      editorialNote: options.editorialNote,
      createdAt: Date.now(),
    };
    this._issues.set(issue.id, issue);
    this._scheduleTransitions(issue);
    return issue;
  }

  generateMonthlyIssues(startYear: number, startMonth: number, count: number): MagazineIssue[] {
    const issues: MagazineIssue[] = [];
    let year = startYear;
    let month = startMonth; // 0-indexed

    for (let i = 0; i < count; i++) {
      const publishDate = new Date(year, month, 1, 9, 0, 0);
      const monthName = MONTHS[month];
      const issueNumber = (year - 2024) * 12 + month + 1;
      const issue = this.createIssue(
        issueNumber,
        `TMI Magazine — ${monthName} ${year}`,
        publishDate.getTime(),
        { theme: MONTH_THEMES[monthName] },
      );
      issues.push(issue);
      month++;
      if (month > 11) { month = 0; year++; }
    }
    return issues;
  }

  // ── Schedule transitions ───────────────────────────────────────────────────

  private _scheduleTransitions(issue: MagazineIssue): void {
    const now = Date.now();
    if (issue.publishAt > now) {
      const t = setTimeout(() => {
        issue.status = "live";
        this._emit(issue);
      }, issue.publishAt - now);
      this._timers.push(t);
    }
    if (issue.archiveAt > now) {
      const t = setTimeout(() => {
        if (issue.status === "live") {
          issue.status = "archived";
          this._emit(issue);
        }
      }, issue.archiveAt - now);
      this._timers.push(t);
    }
  }

  // ── Access ────────────────────────────────────────────────────────────────

  getCurrentIssue(): MagazineIssue | null {
    const now = Date.now();
    return [...this._issues.values()]
      .filter((i) => i.status === "live" && i.publishAt <= now && i.archiveAt > now)
      .sort((a, b) => b.issueNumber - a.issueNumber)[0] ?? null;
  }

  getNextIssue(): MagazineIssue | null {
    return [...this._issues.values()]
      .filter((i) => i.status === "scheduled")
      .sort((a, b) => a.publishAt - b.publishAt)[0] ?? null;
  }

  getSchedule(): IssueSchedule {
    const all = [...this._issues.values()].sort((a, b) => b.issueNumber - a.issueNumber);
    return {
      currentIssue: this.getCurrentIssue(),
      nextIssue: this.getNextIssue(),
      upcomingIssues: all.filter((i) => i.status === "scheduled"),
      archivedIssues: all.filter((i) => i.status === "archived"),
    };
  }

  getIssue(id: string): MagazineIssue | null {
    return this._issues.get(id) ?? null;
  }

  addArticleToIssue(issueId: string, articleId: string): void {
    const issue = this._issues.get(issueId);
    if (issue && !issue.articleIds.includes(articleId)) {
      issue.articleIds.push(articleId);
    }
  }

  publishImmediately(issueId: string): void {
    const issue = this._issues.get(issueId);
    if (issue && issue.status === "draft") {
      issue.status = "live";
      issue.publishAt = Date.now();
      this._emit(issue);
    }
  }

  archiveIssue(issueId: string): void {
    const issue = this._issues.get(issueId);
    if (issue && issue.status === "live") {
      issue.status = "archived";
      this._emit(issue);
    }
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onIssueChange(cb: (issue: MagazineIssue) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(issue: MagazineIssue): void {
    for (const cb of this._listeners) cb(issue);
  }
}

export const magazineIssueScheduler = MagazineIssueScheduler.getInstance();
