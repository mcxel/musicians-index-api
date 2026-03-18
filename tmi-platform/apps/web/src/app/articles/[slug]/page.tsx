import { notFound } from 'next/navigation';
import { JsonContentRenderer } from '@/components/editorial/JsonContentRenderer';
import { WinnerBadge } from '@/components/editorial/WinnerBadge';
import { VoteResults } from '@/components/editorial/VoteResults';
import { StructuredData } from '@/components/seo/StructuredData';

type JsonNode = {
  type: string;
  attrs?: { level?: number; [key: string]: unknown };
  content?: JsonNode[];
  text?: string;
};

type VoteResult = {
  stageName: string;
  voteCount: number;
};

type WinnerInfo = {
  stageName?: string;
} | null;

type Article = {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  content: unknown;
  publishedAt: string | null;
  author: { name: string | null; image: string | null } | null;
  pollSnapshot: {
    results: unknown;
    winnerInfo: unknown;
    contestRound: { name: string } | null;
  } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeJsonContent(value: unknown): JsonNode {
  if (isRecord(value) && typeof value.type === 'string') {
    return value as JsonNode;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: value }] }],
    };
  }

  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Article content is not available yet.' }] }],
  };
}

function normalizeWinnerInfo(value: unknown): WinnerInfo {
  if (!isRecord(value)) return null;
  const stageName = typeof value.stageName === 'string' ? value.stageName : undefined;
  return stageName ? { stageName } : null;
}

function normalizeVoteResults(value: unknown): VoteResult[] | null {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .filter(isRecord)
    .map((entry) => ({
      stageName: typeof entry.stageName === 'string' ? entry.stageName : null,
      voteCount:
        typeof entry.voteCount === 'number'
          ? entry.voteCount
          : typeof entry.voteCount === 'string'
            ? Number(entry.voteCount)
            : NaN,
    }))
    .filter((entry): entry is VoteResult => !!entry.stageName && Number.isFinite(entry.voteCount));

  return normalized.length > 0 ? normalized : null;
}

function getFallbackArticle(slug: string): Article | null {
  if (slug !== 'phase-c-artist') return null;

  return {
    id: 'fallback-phase-c-artist',
    title: 'Phase C Artist Spotlight',
    subtitle: 'Artist → Article → Random proof article fallback',
    slug,
    publishedAt: new Date().toISOString(),
    author: { name: 'TMI Editorial', image: null },
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This fallback keeps /articles/phase-c-artist available when the external editorial API is unavailable.',
            },
          ],
        },
      ],
    },
    pollSnapshot: null,
  };
}

async function getArticle(slug: string): Promise<Article | null> {
  const apiBase = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return getFallbackArticle(slug);

  try {
    const res = await fetch(`${apiBase}/api/editorial/articles/slug/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return getFallbackArticle(slug);
    }

    return res.json();
  } catch {
    return getFallbackArticle(slug);
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toISOString()
    : undefined;
  const content = normalizeJsonContent(article.content);
  const winnerInfo = normalizeWinnerInfo(article.pollSnapshot?.winnerInfo);
  const results = normalizeVoteResults(article.pollSnapshot?.results);
  const contestRoundName = article.pollSnapshot?.contestRound?.name ?? 'this round';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    datePublished: publishedDate,
    author: {
      '@type': 'Organization',
      name: article.author?.name || 'The Musician\'s Index',
    },
    mainEntityOfPage: `https://themusiciansindex.com/articles/${article.slug}`,
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white py-16 px-4">
      <StructuredData data={jsonLd} />
      <article className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{article.title}</h1>
          {article.subtitle && <p className="mt-4 text-xl text-gray-400">{article.subtitle}</p>}
          <div className="mt-6 flex items-center justify-center gap-4">
            {article.author?.image && (
              <img src={article.author.image} alt={article.author.name || ''} className="h-10 w-10 rounded-full" />
            )}
            <div>
              <p className="text-sm font-medium text-white">{article.author?.name || 'TMI Staff'}</p>
              <p className="text-sm text-gray-500">
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}
              </p>
            </div>
          </div>
        </header>

        {winnerInfo && <WinnerBadge winner={winnerInfo} />}

        <div className="prose prose-invert lg:prose-xl mx-auto">
          <JsonContentRenderer content={content} />
        </div>

        {results && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Full Results for {contestRoundName}</h2>
            <VoteResults results={results} />
          </section>
        )}
      </article>
    </main>
  );
}