import { notFound } from 'next/navigation';
import { JsonContentRenderer } from '@/components/editorial/JsonContentRenderer';
import { WinnerBadge } from '@/components/editorial/WinnerBadge';
import { VoteResults } from '@/components/editorial/VoteResults';
import { StructuredData } from '@/components/seo/StructuredData';

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
    contestRound: { name: string };
  } | null;
};

async function getArticle(slug: string): Promise<Article | null> {
  const apiBase = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return null;

  try {
    const res = await fetch(`${apiBase}/api/editorial/articles/slug/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
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

        {article.pollSnapshot?.winnerInfo && <WinnerBadge winner={article.pollSnapshot.winnerInfo} />}

        <div className="prose prose-invert lg:prose-xl mx-auto">
          <JsonContentRenderer content={article.content} />
        </div>

        {article.pollSnapshot?.results && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Full Results for {article.pollSnapshot.contestRound.name}</h2>
            <VoteResults results={article.pollSnapshot.results} />
          </section>
        )}
      </article>
    </main>
  );
}