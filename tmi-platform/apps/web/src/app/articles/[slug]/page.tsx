import { ImageSlotWrapper } from '@/components/visual-enforcement';
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

function ArticleNotFound({ slug }: { slug: string }) {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>STORY LOADING</div>
      <h1 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, marginBottom: 12, maxWidth: 560 }}>
        This story is being prepared for the current issue
      </h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 480, lineHeight: 1.7, marginBottom: 32 }}>
        The article <strong style={{ color: "#FFD700" }}>/{slug}</strong> is queued for the magazine. Explore live rooms, the current issue, or featured stories below.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/articles" style={{ padding: "10px 22px", background: "#FFD700", color: "#050510", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none", letterSpacing: 1 }}>ALL STORIES</a>
        <a href="/magazine" style={{ padding: "10px 22px", border: "1px solid rgba(0,255,255,0.3)", color: "#00FFFF", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none", letterSpacing: 1 }}>MAGAZINE</a>
        <a href="/join" style={{ padding: "10px 22px", background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none", letterSpacing: 1 }}>JOIN TMI</a>
      </div>
    </main>
  );
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  if (!article) {
    return <ArticleNotFound slug={params.slug} />;
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
              <ImageSlotWrapper
                imageId={`article-author-${article.id}`}
                roomId={`article-${article.slug}`}
                priority="normal"
                fallbackUrl={article.author.image}
                className="w-full h-full object-cover rounded-full"
                altText={`${article.author?.name || 'TMI Staff'} avatar`}
                containerStyle={{ width: 40, height: 40 }}
              />
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