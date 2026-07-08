import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { WinnerBadge } from '@/components/editorial/WinnerBadge';
import { VoteResults } from '@/components/editorial/VoteResults';
import StructuredData from '@/components/seo/StructuredData';
import { JsonContentRenderer } from '@/components/editorial/JsonContentRenderer';
import { getEditorialArticleBySlug, getLatestEditorialArticles, type NewsArticle } from '@/lib/editorial/NewsArticleModel';
import { getLocalArticleBySlug, getLatestLocalArticles, type LocalArticle } from '@/lib/editorial/localArticleCatalog';

type JsonNode = {
  type: string;
  attrs?: { level?: number; [key: string]: unknown };
  content?: JsonNode[];
  text?: string;
};

type VoteResult = { stageName: string; voteCount: number };
type WinnerInfo = { stageName?: string } | null;

type RemoteArticle = {
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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function normalizeJsonContent(v: unknown): JsonNode {
  if (isRecord(v) && typeof v.type === 'string') return v as JsonNode;
  if (typeof v === 'string' && v.trim()) return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: v }] }] };
  return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] };
}
function normalizeWinnerInfo(v: unknown): WinnerInfo {
  if (!isRecord(v)) return null;
  const stageName = typeof v.stageName === 'string' ? v.stageName : undefined;
  return stageName ? { stageName } : null;
}
function normalizeVoteResults(v: unknown): VoteResult[] | null {
  if (!Array.isArray(v)) return null;
  const r = v.filter(isRecord).map(e => ({
    stageName: typeof e.stageName === 'string' ? e.stageName : null,
    voteCount: typeof e.voteCount === 'number' ? e.voteCount : Number(e.voteCount),
  })).filter((e): e is VoteResult => !!e.stageName && Number.isFinite(e.voteCount));
  return r.length ? r : null;
}

async function fetchRemote(slug: string): Promise<RemoteArticle | null> {
  const base = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/editorial/articles/slug/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ─── Category → channel color/label ──────────────────────────────────────────

const CATEGORY_META: Record<string, { color: string; label: string; icon: string; channel: string }> = {
  artist:     { color: '#00FFFF', label: 'Artist',    icon: '🎤', channel: 'music'    },
  performer:  { color: '#FF2DAA', label: 'Performer', icon: '🎭', channel: 'music'    },
  news:       { color: '#FFD700', label: 'News',      icon: '📰', channel: 'world'    },
  sponsor:    { color: '#FFD700', label: 'Sponsor',   icon: '💎', channel: 'sponsors' },
  advertiser: { color: '#FF6B00', label: 'Brand',     icon: '📢', channel: 'sponsors' },
  interview:  { color: '#AA2DFF', label: 'Interview', icon: '🎙️', channel: 'music'    },
  feature:    { color: '#FF2DAA', label: 'Feature',   icon: '🎵', channel: 'music'    },
  review:     { color: '#00FF88', label: 'Review',    icon: '⭐', channel: 'music'    },
  editorial:  { color: '#AA2DFF', label: 'Editorial', icon: '✍️', channel: 'writers'  },
};

function getMeta(cat: string) {
  return CATEGORY_META[cat] ?? { color: '#00FFFF', label: cat.toUpperCase(), icon: '📰', channel: 'music' };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const editorial = getEditorialArticleBySlug(params.slug);
  const local = getLocalArticleBySlug(params.slug);
  const title = editorial?.title ?? local?.title ?? `Article — The Musician's Index`;
  const description = editorial?.snippet ?? local?.subtitle ?? 'Read on The Musician\'s Index.';
  return { title: `${title} — TMI`, description };
}

// ─── Magazine body renderer ───────────────────────────────────────────────────

function MagazineBody({ paragraphs, accent }: { paragraphs: string[]; accent: string }) {
  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.85, color: 'rgba(255,255,255,0.88)', maxWidth: 720, margin: '0 auto' }}>
      {paragraphs.map((p, i) => {
        if (i === 1 && paragraphs.length > 3) {
          return (
            <div key={i}>
              <blockquote style={{
                margin: '32px 0', padding: '20px 28px',
                borderLeft: `4px solid ${accent}`,
                background: `${accent}08`,
                fontFamily: "'Bebas Neue','Impact',sans-serif",
                fontSize: 'clamp(20px,2.4vw,28px)',
                color: '#fff', lineHeight: 1.2,
                letterSpacing: '0.02em',
                fontStyle: 'normal',
              }}>
                {p}
              </blockquote>
            </div>
          );
        }
        if (i > 0 && i % 4 === 0 && i < paragraphs.length - 1) {
          return (
            <div key={i}>
              <p style={{ marginBottom: 20 }}>{p}</p>
              <div style={{ height: 1, background: `linear-gradient(90deg, ${accent}44, transparent)`, margin: '28px 0' }} />
            </div>
          );
        }
        return <p key={i} style={{ marginBottom: 20 }}>{p}</p>;
      })}
    </div>
  );
}

// ─── Sidebar related articles ─────────────────────────────────────────────────

function RelatedArticles({ current, accent }: { current: string; accent: string }) {
  const items = getLatestEditorialArticles(4).filter(a => a.slug !== current).slice(0, 3);
  if (!items.length) return null;
  return (
    <aside style={{ borderTop: `2px solid ${accent}44`, marginTop: 48, paddingTop: 32 }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', color: accent, marginBottom: 20 }}>MORE FROM THE INDEX</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
        {items.map(a => {
          const m = getMeta(a.category);
          return (
            <Link key={a.id} href={`/articles/${a.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`, borderTop: `3px solid ${m.color}`, padding: '14px 16px', transition: 'transform 0.2s' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, color: m.color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>{m.icon} {m.label}</div>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, color: '#fff', lineHeight: 1.1 }}>{a.title}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>By {a.author}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Genre slugs from the old articles/[category] route — redirect to magazine channel
const GENRE_CATEGORY_SLUGS = new Set([
  'hip-hop', 'r-b', 'rnb', 'gospel', 'edm', 'jazz', 'pop', 'soul', 'rap',
  'dance', 'comedy', 'spoken-word', 'afrobeat',
]);

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Category slug → redirect to magazine channel or articles list filtered by genre
  if (GENRE_CATEGORY_SLUGS.has(slug)) {
    redirect(`/articles?genre=${slug}`);
  }

  // Resolution order: editorial catalog → local catalog → remote API
  const editorial: NewsArticle | undefined = getEditorialArticleBySlug(slug);
  const local: LocalArticle | undefined = !editorial ? getLocalArticleBySlug(slug) : undefined;
  const remote: RemoteArticle | null = !editorial && !local ? await fetchRemote(slug) : null;

  if (!editorial && !local && !remote) notFound();

  // Normalize into a unified shape
  const title = editorial?.title ?? local?.title ?? remote?.title ?? '';
  const subtitle = editorial?.headline ?? local?.subtitle ?? remote?.subtitle ?? null;
  const author = editorial?.author ?? local?.author ?? remote?.author?.name ?? 'TMI Editorial';
  const writerSlug = editorial?.writerSlug;
  const publishedAt = editorial?.publishedAt ?? local?.publishedAt ?? remote?.publishedAt ?? null;
  const category = editorial?.category ?? local?.category ?? 'news';
  const heroColor = editorial?.heroColor ?? local?.heroColor ?? '#1a0a2e';
  const accent = editorial?.accentColor ?? local?.heroColor ?? '#00FFFF';
  const tags = editorial?.tags ?? local?.tags ?? [];
  const paragraphs: string[] = editorial?.body
    ? editorial.body.map((block) => block.text).filter((text): text is string => Boolean(text))
    : local?.body ?? [];

  // Remote-specific
  const remoteContent = remote ? normalizeJsonContent(remote.content) : null;
  const winnerInfo = remote ? normalizeWinnerInfo(remote.pollSnapshot?.winnerInfo) : null;
  const voteResults = remote ? normalizeVoteResults(remote.pollSnapshot?.results) : null;
  const contestRoundName = remote?.pollSnapshot?.contestRound?.name ?? 'this round';

  const meta = getMeta(category);
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    datePublished: publishedAt ?? undefined,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: "The Musician's Index", url: 'https://themusiciansindex.com' },
    mainEntityOfPage: `https://themusiciansindex.com/articles/${slug}`,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      <StructuredData data={jsonLd} />

      {/* Paper grain overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")', opacity: 0.5 }} />

      {/* Top accent bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg, #FF2DAA, ${accent}, #FFD700, #AA2DFF)` }} />

      {/* Masthead nav */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/articles" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>← THE MUSICIAN'S INDEX</div>
        </Link>
        <Link href={`/articles/c/${meta.channel}`} style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: meta.color, textTransform: 'uppercase', padding: '4px 10px', border: `1px solid ${meta.color}44`, borderRadius: 3 }}>
            {meta.icon} {meta.label}
          </div>
        </Link>
      </div>

      {/* Hero header */}
      <div style={{
        background: `linear-gradient(165deg, ${heroColor}cc 0%, #050510 65%)`,
        borderBottom: `2px solid ${accent}33`,
        padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,48px) clamp(24px,4vw,48px)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Category tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ background: accent, color: '#050510', fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', padding: '4px 12px', textTransform: 'uppercase' }}>
              {meta.icon} {meta.label}
            </div>
            {tags.slice(0, 3).map(t => (
              <div key={t} style={{ border: `1px solid rgba(255,255,255,0.15)`, fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.4)', padding: '4px 10px', borderRadius: 2 }}>
                {t}
              </div>
            ))}
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Bebas Neue','Impact',sans-serif",
            fontSize: 'clamp(2.4rem,6vw,4.8rem)',
            fontWeight: 900, lineHeight: 0.95,
            color: '#fff', margin: '0 0 16px',
            letterSpacing: '0.01em',
            textShadow: `2px 4px 0 ${accent}22`,
          }}>
            {title}
          </h1>

          {/* Deck */}
          {subtitle && (
            <p style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(14px,1.8vw,20px)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, maxWidth: 680, margin: '0 0 28px' }}>
              {subtitle}
            </p>
          )}

          {/* Byline bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', paddingTop: 20, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}44, ${heroColor})`, border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✍️</div>
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {writerSlug ? (
                  <Link href={`/profile/writer/${writerSlug}`} style={{ color: accent, textDecoration: 'none' }}>{author}</Link>
                ) : author}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{formattedDate}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
              <div>THE MUSICIAN'S INDEX</div>
              <div style={{ color: accent }}>MAGAZINE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px)', position: 'relative', zIndex: 1 }}>

        {winnerInfo && <WinnerBadge winner={winnerInfo} />}

        {/* Local/editorial body */}
        {paragraphs.length > 0 && <MagazineBody paragraphs={paragraphs} accent={accent} />}

        {/* Remote JSON content */}
        {remoteContent && (
          <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.85, color: 'rgba(255,255,255,0.88)', maxWidth: 720, margin: '0 auto' }}>
            <JsonContentRenderer content={remoteContent} />
          </div>
        )}

        {/* Vote results */}
        {voteResults && (
          <section style={{ marginTop: 48 }}>
            <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 28, color: '#fff', marginBottom: 16 }}>Full Results for {contestRoundName}</div>
            <VoteResults results={voteResults} />
          </section>
        )}

        {/* Writer promo strip */}
        <div style={{ margin: '48px 0', padding: '20px 24px', background: `${accent}0a`, border: `1px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: '#fff' }}>WRITE FOR THE INDEX</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Paid articles starting at $25. Apply with Writer/Reporter role.</div>
          </div>
          <Link href="/hub/writer/pitches" style={{ textDecoration: 'none' }}>
            <div style={{ background: accent, color: '#050510', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, padding: '10px 24px', whiteSpace: 'nowrap' }}>SUBMIT A PITCH →</div>
          </Link>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32 }}>
            {tags.map(t => (
              <div key={t} style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', padding: '4px 12px', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                #{t}
              </div>
            ))}
          </div>
        )}

        <RelatedArticles current={slug} accent={accent} />

        {/* Bottom nav */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/articles" style={{ textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>← ALL STORIES</Link>
          <Link href={`/articles/c/${meta.channel}`} style={{ textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: meta.color, letterSpacing: '0.2em', textTransform: 'uppercase' }}>MORE {meta.label.toUpperCase()} →</Link>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, #AA2DFF, ${accent}, #FF2DAA)` }} />
    </div>
  );
}
