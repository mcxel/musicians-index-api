'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import SectionTitle from '@/components/ui/SectionTitle';

type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  category?: string | null;
  publishedAt: string | null;
  author?: { name: string | null } | null;
  coverImage?: string | null;
};

const CATEGORIES = ['ALL', 'FEATURE', 'EXCLUSIVE', 'INTERVIEW', 'INDUSTRY', 'SPOTLIGHT', 'NEWS'];

const CATEGORY_COLORS: Record<string, string> = {
  FEATURE: '#FF2DAA',
  EXCLUSIVE: '#00FFFF',
  INTERVIEW: '#AA2DFF',
  INDUSTRY: '#FFD700',
  SPOTLIGHT: '#FF2DAA',
  NEWS: '#00FFFF',
};

const STUB_ARTICLES: Article[] = [
  { id: '1', slug: 'the-crown-never-rests', title: 'The Crown Never Rests', subtitle: 'How the TMI weekly winner system is reshaping the music industry', category: 'FEATURE', publishedAt: '2026-04-01', author: { name: 'TMI Editorial' } },
  { id: '2', slug: 'cypher-arena-explained', title: 'Cypher Arena Explained', subtitle: 'Breaking down how artists compete live in real-time', category: 'EXCLUSIVE', publishedAt: '2026-03-29', author: { name: 'Staff Writer' } },
  { id: '3', slug: 'stream-win-radio-launch', title: 'Stream & Win Radio Is Live', subtitle: 'The first music competition radio station drops this month', category: 'NEWS', publishedAt: '2026-03-25', author: { name: 'TMI News Desk' } },
  { id: '4', slug: 'artist-dashboard-breakdown', title: 'Your Artist Dashboard: A Full Breakdown', subtitle: 'Analytics, bookings, wallet, and more — all in one place', category: 'INDUSTRY', publishedAt: '2026-03-20', author: { name: 'Platform Team' } },
  { id: '5', slug: 'bobblehead-avatars-arrive', title: 'Bobblehead Avatars Have Arrived', subtitle: 'Create your animated stage presence inside the platform', category: 'SPOTLIGHT', publishedAt: '2026-03-15', author: { name: 'TMI Editorial' } },
  { id: '6', slug: 'interview-rising-mc', title: 'Interview: The Rising MC Taking Over', subtitle: 'We sat down with one of this season\'s biggest Cypher contenders', category: 'INTERVIEW', publishedAt: '2026-03-10', author: { name: 'Interviews Desk' } },
];

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(STUB_ARTICLES);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/homepage/latest-articles?limit=24')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length) setArticles(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? articles : articles.filter((a) => a.category === filter);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
          {/* Hero */}
          <div style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #050510 60%)', padding: '64px 32px 48px', borderBottom: '1px solid #FF2DAA33' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#FF2DAA', textTransform: 'uppercase', marginBottom: 12 }}>THE MUSICIANS INDEX</div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>MAGAZINE</h1>
              <p style={{ color: '#aaa', fontSize: 16, maxWidth: 480 }}>Features, exclusives, interviews, and industry intel — straight from the culture.</p>
            </motion.div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 32 }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${filter === cat ? '#FF2DAA' : '#333'}`, background: filter === cat ? '#FF2DAA22' : 'transparent', color: filter === cat ? '#FF2DAA' : '#888', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontWeight: 700, transition: 'all .2s' }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{ padding: '48px 32px 0' }}>
            <SectionTitle title={filter === 'ALL' ? 'ALL ARTICLES' : filter} accent="pink" />
            {loading && <div style={{ color: '#555', padding: '40px 0' }}>Loading articles…</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
              {filtered.map((article, i) => {
                const cat = article.category ?? 'NEWS';
                const accent = CATEGORY_COLORS[cat] ?? '#00FFFF';
                return (
                  <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#0a0a1a', border: '1px solid #1a1a2e', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s', borderTopColor: accent }}>
                        {/* Cover image placeholder */}
                        <div style={{ height: 160, background: `linear-gradient(135deg, ${accent}22 0%, #050510 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                          {cat === 'INTERVIEW' ? '🎤' : cat === 'FEATURE' ? '🎵' : cat === 'EXCLUSIVE' ? '👑' : cat === 'INDUSTRY' ? '📊' : '📰'}
                        </div>
                        <div style={{ padding: '16px 18px 20px' }}>
                          <div style={{ fontSize: 10, letterSpacing: 2, color: accent, marginBottom: 8, fontWeight: 700 }}>{cat}</div>
                          <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{article.title}</div>
                          {article.subtitle && <div style={{ color: '#888', fontSize: 13, lineHeight: 1.5 }}>{article.subtitle}</div>}
                          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#555' }}>
                            <span>{article.author?.name ?? 'TMI Editorial'}</span>
                            <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}