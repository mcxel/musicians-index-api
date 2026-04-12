export interface HomeEditorialArticle {
  id: string;
  title: string;
  category: string;
  slug: string;
  excerpt?: string;
  authorName?: string;
}

const FALLBACK_ARTICLES: HomeEditorialArticle[] = [
  { id: '1', title: 'The New Wave: How Gen Z Is Reshaping Hip-Hop', category: 'FEATURE', slug: '' },
  { id: '2', title: 'Crown Season: Inside the Most Competitive Week Yet', category: 'EXCLUSIVE', slug: '' },
  { id: '3', title: 'Rising Voices: 10 Artists You Need to Hear Now', category: 'SPOTLIGHT', slug: '' },
  { id: '4', title: 'The Business of Beats: Monetizing in the Digital Age', category: 'INDUSTRY', slug: '' },
];

const FALLBACK_NEWS = [
  '🏆 Crown Season enters Week 14 — voting closes Friday midnight',
  '🎙️ Nova Reign drops surprise visual for "Frequencies" — 2M views overnight',
  '🎮 Game Night: Name That Tune tournament kicks off at 9PM EST',
  '📢 New: Live Cypher Rooms now open to all members',
  '🎤 Interview: Amirah Wells talks touring, healing, and her next era',
  '🔥 DJ Cyphers mix goes viral — 500K streams in 48 hours',
  '💰 Brand partnerships up 40% this quarter on the Index',
  '🌍 Platform now live in 24 countries worldwide',
];

export interface HomeEditorialData {
  cover: HomeEditorialArticle[];
  news: string[];
  interviews: HomeEditorialArticle[];
}

import type { HomeDataEnvelope } from './types';
import { getHomepageRuntimeOverrides } from '@/lib/homepageAdmin/runtimeOverrides';
import type { HomepageRuntimeOverrides } from '@/lib/homepageAdmin/types';

interface HomeEditorialOptions {
  featuredArticleId?: string;
  overrides?: HomepageRuntimeOverrides;
}

function prioritizeById<T extends { id: string }>(items: T[], id: string | undefined): T[] {
  if (!id) return items;
  const selected = items.find((item) => item.id === id);
  if (!selected) return items;
  return [selected, ...items.filter((item) => item.id !== id)];
}

function toArticle(record: Record<string, unknown>, index: number): HomeEditorialArticle {
  const author = typeof record.author === 'object' && record.author !== null ? record.author as Record<string, unknown> : null;
  return {
    id: typeof record.id === 'string' ? record.id : `${index + 1}`,
    title: typeof record.title === 'string' ? record.title : 'Untitled Story',
    category: typeof record.category === 'string' ? record.category.toUpperCase() : 'FEATURE',
    slug: typeof record.slug === 'string' ? record.slug : '',
    excerpt: typeof record.excerpt === 'string' ? record.excerpt : undefined,
    authorName: typeof author?.name === 'string' ? author.name : undefined,
  };
}

async function loadBeltArticles(belt: 'cover' | 'news' | 'interviews', limit: number): Promise<HomeEditorialArticle[]> {
  try {
    const response = await fetch(`/api/homepage/belt-feed?belt=${belt}&limit=${limit}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = (await response.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data)) return [];
    return data.map(toArticle);
  } catch {
    return [];
  }
}

export async function getHomeEditorial(options: HomeEditorialOptions = {}): Promise<HomeDataEnvelope<HomeEditorialData>> {
  const timestamp = new Date().toISOString();
  const runtimeOverrides = options.overrides ?? getHomepageRuntimeOverrides();
  const featuredArticleId = options.featuredArticleId ?? runtimeOverrides.featuredArticleId;
  try {
    const response = await fetch('/api/homepage/editorial', { cache: 'no-store' });
    if (!response.ok) {
      const prioritizedCover = prioritizeById(FALLBACK_ARTICLES, featuredArticleId);
      return {
        data: {
          cover: prioritizedCover,
          news: FALLBACK_NEWS,
          interviews: prioritizedCover.slice(0, 3),
        },
        source: 'fallback',
        timestamp,
        error: `HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as {
      cover?: Array<Record<string, unknown>>;
      news?: Array<Record<string, unknown>>;
      interviews?: Array<Record<string, unknown>>;
    };

    const cover = Array.isArray(payload.cover) ? payload.cover.map(toArticle) : [];
    const newsArticles = Array.isArray(payload.news) ? payload.news.map(toArticle) : [];
    const interviews = Array.isArray(payload.interviews) ? payload.interviews.map(toArticle) : [];

    const isLive = cover.length > 0 || newsArticles.length > 0 || interviews.length > 0;

    const resolvedCover = cover.length > 0 ? cover : FALLBACK_ARTICLES;
    const prioritizedCover = prioritizeById(resolvedCover, featuredArticleId);
    const resolvedInterviews = interviews.length > 0 ? interviews : FALLBACK_ARTICLES.slice(0, 3);

    return {
      data: {
        cover: prioritizedCover,
        news: newsArticles.length > 0 ? newsArticles.map((article) => article.title) : FALLBACK_NEWS,
        interviews: prioritizeById(resolvedInterviews, featuredArticleId),
      },
      source: isLive ? 'live' : 'fallback',
      timestamp,
      error: isLive ? undefined : 'Empty editorial payload',
    };
  } catch {
    const prioritizedCover = prioritizeById(FALLBACK_ARTICLES, featuredArticleId);
    return {
      data: {
        cover: prioritizedCover,
        news: FALLBACK_NEWS,
        interviews: prioritizedCover.slice(0, 3),
      },
      source: 'fallback',
      timestamp,
      error: 'Editorial fetch failed',
    };
  }
}