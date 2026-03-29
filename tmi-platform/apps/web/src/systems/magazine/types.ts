export type PageKind = 'artist' | 'article' | 'random';

export type RandomPageKind =
  | 'sponsor'
  | 'advertisement'
  | 'poll'
  | 'trivia'
  | 'billboard'
  | 'horoscope'
  | 'contest'
  | 'game'
  | 'winner'
  | 'seasonal'
  | 'throwback'
  | 'store'
  | 'tip'
  | 'live-highlight';

export interface BasePageRef {
  id: string;
  route: string;
  title: string;
}

export interface ArtistPageRef extends BasePageRef {
  kind: 'artist';
  artistId: string;
  prestigeRank?: number | null;
}

export interface ArticlePageRef extends BasePageRef {
  kind: 'article';
  artistId: string;
  slug: string;
}

export interface RandomPageRef extends BasePageRef {
  kind: 'random';
  randomKind: RandomPageKind;
}

export type PageRef = ArtistPageRef | ArticlePageRef | RandomPageRef;

export interface IssueSlot {
  index: number;
  expectedKind: PageKind;
}

export interface IssueSequenceEntry {
  slot: IssueSlot;
  page: PageRef;
}

export interface ExposureEntry {
  artistId: string;
  exposureCount: number;
  lastSeenAt?: number | null;
  fairnessBoost?: number;
}

export interface PrestigeEntry {
  artistId: string;
  prestigeRank: number;
  points?: number;
  momentum?: number;
  originality?: number;
}

export interface RecentPageEntry {
  id: string;
  route: string;
  title: string;
  kind: PageKind;
  visitedAt: number;
}

export interface IssueBuildInput {
  artistPages: ArtistPageRef[];
  articlePages: ArticlePageRef[];
  randomPages: RandomPageRef[];
  randomHistory?: RandomPageKind[];
  length?: number;
}

export interface IssueBuildOutput {
  sequence: IssueSequenceEntry[];
  randomHistory: RandomPageKind[];
}

export interface MagazineBrainState {
  sequence: IssueSequenceEntry[];
  cursor: number;
  recentPages: RecentPageEntry[];
  randomHistory: RandomPageKind[];
}
