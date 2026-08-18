/**
 * MagazineLayoutRuntime.ts
 *
 * Data-driven magazine layout engine and template evaluator.
 * Transforms description manifests into rich editorial dual-spread pages:
 * Cover, Split Feature, Interview, Album Review, and Full-Page Sponsor Ads.
 */

export type EditorialTemplateId =
  | "COVER_HERO"
  | "FEATURE_SPLIT"
  | "INTERVIEW_TWO_COLUMN"
  | "ALBUM_REVIEW"
  | "SPONSOR_FULL_PAGE";

export interface ArticleBlock {
  headline: string;
  subhead?: string;
  author?: string;
  heroImage?: string;
  body: string[];
  pullQuote?: string;
  ratings?: { track: string; score: number }[];
  audioUrl?: string;
}

export interface MagazinePageManifest {
  pageNumber: number;
  templateId: EditorialTemplateId;
  title: string;
  type: "cover" | "editorial" | "article" | "sponsor" | "interview";
  accentColor: string;
  block: ArticleBlock;
}

export interface MagazineSpreadManifest {
  spreadNumber: number;
  leftPage: MagazinePageManifest;
  rightPage: MagazinePageManifest;
}

export interface IssueManifest {
  issueId: string;
  issueNumber: string;
  title: string;
  coverImage: string;
  publicationDate: string;
  spreads: MagazineSpreadManifest[];
  status: "DRAFT" | "PREVIEW" | "REVIEW" | "APPROVED" | "PUBLISHED";
}

export const SAMPLE_ISSUE_MANIFEST: IssueManifest = {
  issueId: "issue-1",
  issueNumber: "01",
  title: "The Musician's Index — Inaugural Edition",
  coverImage: "/images/magazine/cover-issue1.jpg",
  publicationDate: "August 2026",
  status: "PUBLISHED",
  spreads: [
    {
      spreadNumber: 1,
      leftPage: {
        pageNumber: 1,
        templateId: "COVER_HERO",
        title: "Lyric Stone's Debut Album",
        type: "cover",
        accentColor: "#00FFFF",
        block: {
          headline: "LYRIC STONE: THE SOUND OF REVOLUTION",
          subhead: "Inside the 3D venue revolution reshaping live audio performance.",
          heroImage: "/images/magazine/lyric-stone.jpg",
          body: [
            "Lyric Stone steps onto the global stage with an album that fuses raw vocal acoustics with spatial 3D audio environments.",
            "Recorded live across six cities, this release marks a new epoch for independent music distribution.",
          ],
          pullQuote: "Music isn't just heard anymore — it's inhabited.",
        },
      },
      rightPage: {
        pageNumber: 2,
        templateId: "INTERVIEW_TWO_COLUMN",
        title: "Zuri Bloom Interview",
        type: "interview",
        accentColor: "#FF2DAA",
        block: {
          headline: "ZURI BLOOM IS THE FUTURE OF AFROBEATS",
          subhead: "Polyrhythms, high-density crowds, and the new digital cypher.",
          author: "Marcus Vance",
          body: [
            "Zuri Bloom has spent the last year engineering polyrhythmic beats that break traditional tempo constraints.",
            "Her live Cypher performances on TMI have set attendance records across three continents.",
          ],
          pullQuote: "The cypher belongs to the people who feel the frequency first.",
        },
      },
    },
    {
      spreadNumber: 2,
      leftPage: {
        pageNumber: 3,
        templateId: "ALBUM_REVIEW",
        title: "Track-by-Track Review",
        type: "article",
        accentColor: "#AA2DFF",
        block: {
          headline: "ALBUM DEEP DIVE: HIGH FREQUENCY 2090",
          subhead: "An exhaustive breakdown of production quality and vocal dynamics.",
          body: [
            "Synthesizers collide with acoustic brass in a triumph of modern engineering.",
            "Each track pushes the limits of spatial headphone rendering.",
          ],
          ratings: [
            { track: "01. Starfield Warp", score: 9.8 },
            { track: "02. Velvet Skyline", score: 9.5 },
            { track: "03. Neon Cypher", score: 9.9 },
          ],
        },
      },
      rightPage: {
        pageNumber: 4,
        templateId: "SPONSOR_FULL_PAGE",
        title: "Founder Diamond Pass Sponsor Feature",
        type: "sponsor",
        accentColor: "#FFD700",
        block: {
          headline: "FOUNDER DIAMOND PASS — EXCLUSIVE LIVE ACCESS",
          subhead: "Unlock 100% royalty keep, VIP 3D stage seats, and private Lounge rooms.",
          body: [
            "Elevate your artist career with lifetime platform privileges and revenue priority.",
          ],
          pullQuote: "Ownership is the ultimate artist entitlement.",
        },
      },
    },
  ],
};

export class MagazineLayoutRuntime {
  private activeManifest: IssueManifest;

  constructor(manifest: IssueManifest = SAMPLE_ISSUE_MANIFEST) {
    this.activeManifest = manifest;
  }

  public getIssue(): IssueManifest {
    return this.activeManifest;
  }

  public getSpread(spreadNumber: number): MagazineSpreadManifest | null {
    return this.activeManifest.spreads.find((s) => s.spreadNumber === spreadNumber) ?? null;
  }

  public getTotalSpreads(): number {
    return this.activeManifest.spreads.length;
  }
}
