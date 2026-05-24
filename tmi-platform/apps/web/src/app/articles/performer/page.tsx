'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type PerformerArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  publishedAt: string;
  author: string;
  readTime: string;
};

const CATEGORIES = ['ALL', 'INTERVIEW', 'FEATURE', 'PROFILE', 'REVIEW'];

const CATEGORY_COLORS: Record<string, string> = {
  INTERVIEW: '#FF2DAA',
  FEATURE:   '#00FFFF',
  PROFILE:   '#FFD700',
  REVIEW:    '#AA2DFF',
};

const CATEGORY_ICONS: Record<string, string> = {
  INTERVIEW: '🎤',
  FEATURE:   '🕺',
  PROFILE:   '🎭',
  REVIEW:    '⭐',
};

const SEED_ARTICLES: PerformerArticle[] = [
  {
    id: '1',
    slug: 'performer-spotlight-stage-command',
    title: 'Stage Command: What Separates Good from Great Performers',
    subtitle: 'TMI judges break down the five elements they score hardest when a performer hits the stage',
    category: 'FEATURE',
    publishedAt: '2026-05-12',
    author: 'TMI Editorial',
    readTime: '7 min read',
  },
  {
    id: '2',
    slug: 'interview-vibe-architect',
    title: 'Interview: Vibe Architect on Live Performance Energy',
    subtitle: 'The TMI Season 1 finalist on crowd reading, set design, and never having a bad show',
    category: 'INTERVIEW',
    publishedAt: '2026-05-08',
    author: 'Interviews Desk',
    readTime: '9 min read',
  },
  {
    id: '3',
    slug: 'profile-the-encore-king',
    title: 'Profile: The Encore King Who Never Planned One',
    subtitle: "Spontaneity, rehearsal, and a crowd that refuses to let him leave — a performer's story",
    category: 'PROFILE',
    publishedAt: '2026-05-02',
    author: 'Features Team',
    readTime: '5 min read',
  },
  {
    id: '4',
    slug: 'review-performer-showcase-april',
    title: 'Review: April Performer Showcase — All 12 Sets Scored',
    subtitle: 'From opening act to headliner, we graded every performance in the April showcase',
    category: 'REVIEW',
    publishedAt: '2026-04-30',
    author: 'Music Desk',
    readTime: '12 min read',
  },
  {
    id: '5',
    slug: 'feature-dancers-as-performers',
    title: 'When Dancers Become the Show: A TMI Feature',
    subtitle: 'How movement-based performers are changing the scoring dynamic in live competitions',
    category: 'FEATURE',
    publishedAt: '2026-04-25',
    author: 'TMI Editorial',
    readTime: '6 min read',
  },
  {
    id: '6',
    slug: 'interview-la-luna-performance-ritual',
    title: 'Interview: La Luna on Pre-Show Rituals and Stage Presence',
    subtitle: 'What goes into two hours of mental prep before stepping in front of 5,000 fans',
    category: 'INTERVIEW',
    publishedAt: '2026-04-20',
    author: 'Interviews Desk',
    readTime: '8 min read',
  },
  {
    id: '7',
    slug: 'profile-circus-meets-soul-singer',
    title: 'Profile: When Circus Arts Meet Soul Music',
    subtitle: 'This performer fuses aerial acrobatics with live vocal performance — and judges are obsessed',
    category: 'PROFILE',
    publishedAt: '2026-04-15',
    author: 'Staff Writer',
    readTime: '6 min read',
  },
  {
    id: '8',
    slug: 'review-cypher-stage-finals',
    title: 'Cypher Stage Finals: Performance Reviews',
    subtitle: 'Ten finalists, one night, unlimited chaos — a full breakdown of every finalist set',
    category: 'REVIEW',
    publishedAt: '2026-04-08',
    author: 'Music Desk',
    readTime: '10 min read',
  },
];

export default function PerformerArticlesPage() {
  const [filter, setFilter] = useState('ALL');

  const filtered =
    filter === 'ALL' ? SEED_ARTICLES : SEED_ARTICLES.filter((a) => a.category === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(160deg, #1a0520 0%, #050510 60%)',
          padding: '56px 32px 40px',
          borderBottom: '1px solid #FF2DAA33',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              color: '#FF2DAA',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            TMI Magazine
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 10px',
              lineHeight: 1.1,
            }}
          >
            PERFORMER ARTICLES
          </h1>
          <p style={{ color: '#aaa', fontSize: 15, maxWidth: 520, lineHeight: 1.6 }}>
            Interviews, features, profiles, and reviews spotlighting the performers who command
            the TMI stage.
          </p>
        </motion.div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28 }}>
          {CATEGORIES.map((cat) => {
            const accent = CATEGORY_COLORS[cat] ?? '#FF2DAA';
            const active = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: `1px solid ${active ? accent : '#333'}`,
                  background: active ? `${accent}22` : 'transparent',
                  color: active ? accent : '#888',
                  fontSize: 11,
                  letterSpacing: 2,
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all .2s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '40px 32px 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {filtered.map((article, i) => {
            const accent = CATEGORY_COLORS[article.category] ?? '#FF2DAA';
            const icon = CATEGORY_ICONS[article.category] ?? '🕺';
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      background: '#0a0a1a',
                      border: '1px solid #1a1a2e',
                      borderTop: `2px solid ${accent}`,
                      borderRadius: 12,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'border-color .2s',
                    }}
                  >
                    {/* Cover band */}
                    <div
                      style={{
                        height: 140,
                        background: `linear-gradient(135deg, ${accent}18 0%, #050510 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 48,
                      }}
                    >
                      {icon}
                    </div>

                    <div style={{ padding: '16px 18px 20px' }}>
                      <div
                        style={{
                          fontSize: 10,
                          letterSpacing: 2,
                          color: accent,
                          marginBottom: 8,
                          fontWeight: 700,
                        }}
                      >
                        {article.category}
                      </div>
                      <div
                        style={{
                          color: '#fff',
                          fontSize: 16,
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: 8,
                        }}
                      >
                        {article.title}
                      </div>
                      <div
                        style={{ color: '#888', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}
                      >
                        {article.subtitle}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 11,
                          color: '#555',
                        }}
                      >
                        <span>{article.author}</span>
                        <span style={{ display: 'flex', gap: 8 }}>
                          <span>{article.readTime}</span>
                          <span>·</span>
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ color: '#555', padding: '60px 0', textAlign: 'center', fontSize: 15 }}>
            No {filter.toLowerCase()} articles yet.
          </div>
        )}
      </div>
    </div>
  );
}
