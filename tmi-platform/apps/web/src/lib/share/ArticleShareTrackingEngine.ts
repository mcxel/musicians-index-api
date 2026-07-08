import { buildShareUrl, type ShareTarget } from '@/lib/share/ShareLinkEngine';

export type ArticleShareMode = 'still' | 'motion' | 'live' | 'premiere';
export type ArticleShareEventType = 'share' | 'copy' | 'open' | 'click' | 'engaged_read';

export interface ArticleShareBuildInput {
  articleSlug: string;
  performerSlug: string;
  performerName: string;
  headline: string;
  path: string;
  referrerId?: string;
  mode?: ArticleShareMode;
  platform?: string;
}

export interface ArticleShareEvent {
  event: ArticleShareEventType;
  articleSlug: string;
  performerSlug: string;
  referrerId?: string;
  mode?: ArticleShareMode;
  source?: string;
  platform?: string;
  occurredAt: number;
}

export interface ArticleShareSnapshot {
  articleSlug: string;
  shares: number;
  opens: number;
  clicks: number;
  copies: number;
  engagedReads: number;
  lastAt: number;
}

const eventStore = new Map<string, ArticleShareSnapshot>();

function sanitizeId(input: string | undefined, fallback: string): string {
  if (!input) return fallback;
  const cleaned = input.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned.length > 0 ? cleaned.slice(0, 64) : fallback;
}

function normalizePath(path: string): string {
  if (!path) return '/articles';
  return path.startsWith('/') ? path : `/${path}`;
}

export function buildArticleReferralUrl(input: ArticleShareBuildInput): string {
  const articleSlug = sanitizeId(input.articleSlug, 'article');
  const performerSlug = sanitizeId(input.performerSlug, 'performer');
  const referrerId = sanitizeId(input.referrerId, performerSlug);
  const mode: ArticleShareMode = input.mode ?? 'still';

  const target: ShareTarget = {
    title: `${input.performerName} | TMI Magazine`,
    text: `${input.headline} — Read on The Musician's Index`,
    path: normalizePath(input.path),
    context: {
      source: input.platform ? `article_share_${input.platform}` : 'article_share',
      medium: 'social',
      campaign: 'living_magazine',
      ref: referrerId,
    },
  };

  const sharedUrl = new URL(buildShareUrl(target));
  sharedUrl.searchParams.set('article', articleSlug);
  sharedUrl.searchParams.set('performer', performerSlug);
  sharedUrl.searchParams.set('mode', mode);
  return sharedUrl.toString();
}

export function buildArticleOGUrl(input: {
  articleSlug: string;
  performerName: string;
  headline: string;
  mode?: ArticleShareMode;
  isLive?: boolean;
  viewers?: number;
}): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://themusiciansindex.com';
  const url = new URL('/api/og/performer-article', base);
  url.searchParams.set('article', sanitizeId(input.articleSlug, 'article'));
  url.searchParams.set('performer', input.performerName.slice(0, 64));
  url.searchParams.set('headline', input.headline.slice(0, 96));
  url.searchParams.set('mode', input.mode ?? (input.isLive ? 'live' : 'still'));
  if (input.isLive) url.searchParams.set('live', '1');
  if (typeof input.viewers === 'number') url.searchParams.set('viewers', String(Math.max(0, input.viewers)));
  return url.toString();
}

export function recordArticleShareEvent(evt: ArticleShareEvent): ArticleShareSnapshot {
  const articleSlug = sanitizeId(evt.articleSlug, 'article');
  const previous = eventStore.get(articleSlug) || {
    articleSlug,
    shares: 0,
    opens: 0,
    clicks: 0,
    copies: 0,
    engagedReads: 0,
    lastAt: evt.occurredAt,
  };

  const next: ArticleShareSnapshot = { ...previous, lastAt: evt.occurredAt };
  if (evt.event === 'share') next.shares += 1;
  if (evt.event === 'open') next.opens += 1;
  if (evt.event === 'click') next.clicks += 1;
  if (evt.event === 'copy') next.copies += 1;
  if (evt.event === 'engaged_read') next.engagedReads += 1;

  eventStore.set(articleSlug, next);
  return next;
}

export function getArticleShareSnapshot(articleSlug: string): ArticleShareSnapshot {
  const normalized = sanitizeId(articleSlug, 'article');
  return (
    eventStore.get(normalized) || {
      articleSlug: normalized,
      shares: 0,
      opens: 0,
      clicks: 0,
      copies: 0,
      engagedReads: 0,
      lastAt: Date.now(),
    }
  );
}
