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
  Jan: "Winter Edition",
  Feb: "Winter Edition",
  Mar: "Winter Edition",
  Apr: "Spring Edition",
  May: "Spring Edition",
  Jun: "Spring Edition",
  Jul: "Summer Edition",
  Aug: "Summer Edition",
  Sep: "Summer Edition",
  Oct: "Fall Edition",
  Nov: "Fall Edition",
  Dec: "Fall Edition",
};

// Each issue covers one quarter (3 months)
const QUARTER_NAMES: Record<number, string> = {
  0: "Winter", 1: "Winter", 2: "Winter",
  3: "Spring", 4: "Spring", 5: "Spring",
  6: "Summer", 7: "Summer", 8: "Summer",
  9: "Fall",   10: "Fall",  11: "Fall",
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
      archiveAt: publishAt + (options.archiveDays ?? 91) * 86_400_000,
      articleIds: options.articleIds ?? [],
      coverArtistId: options.coverArtistId,
      editorialNote: options.editorialNote,
      createdAt: Date.now(),
    };
    this._issues.set(issue.id, issue);
    this._scheduleTransitions(issue);
    return issue;
  }

  /** @deprecated Use generateQuarterlyIssues — each TMI issue runs 3 months */
  generateMonthlyIssues(startYear: number, startMonth: number, count: number): MagazineIssue[] {
    return this.generateQuarterlyIssues(startYear, startMonth, count);
  }

  /** Each issue lasts one quarter (3 months / 91 days). */
  generateQuarterlyIssues(startYear: number, startMonth: number, count: number): MagazineIssue[] {
    const result: MagazineIssue[] = [];
    let year = startYear;
    let month = startMonth; // 0-indexed

    for (let i = 0; i < count; i++) {
      const publishDate = new Date(year, month, 1, 9, 0, 0);
      const seasonName = QUARTER_NAMES[month] ?? 'Seasonal';
      const issueNumber = i + 1;
      const issue = this.createIssue(
        issueNumber,
        `TMI Magazine — ${seasonName} ${year}`,
        publishDate.getTime(),
        {
          theme: MONTH_THEMES[MONTHS[month] as MonthName] ?? `${seasonName} Edition`,
          archiveDays: 91,
        },
      );
      result.push(issue);
      // Advance 3 months per issue
      month += 3;
      if (month > 11) { month = month - 12; year++; }
    }
    return result;
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
