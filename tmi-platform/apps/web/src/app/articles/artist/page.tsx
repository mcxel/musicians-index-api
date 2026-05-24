'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type ArtistArticle = {
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
  INTERVIEW: '#00FFFF',
  FEATURE:   '#FF2DAA',
  PROFILE:   '#AA2DFF',
  REVIEW:    '#FFD700',
};

const CATEGORY_ICONS: Record<string, string> = {
  INTERVIEW: '🎤',
  FEATURE:   '🎵',
  PROFILE:   '👤',
  REVIEW:    '⭐',
};

const SEED_ARTICLES: ArtistArticle[] = [
  {
    id: '1',
    slug: 'rising-voices-cypher-champion',
    title: 'Rising Voices: The Cypher Champion Nobody Saw Coming',
    subtitle: 'How one unsigned artist climbed the TMI leaderboard in under 30 days',
    category: 'FEATURE',
    publishedAt: '2026-05-10',
    author: 'TMI Editorial',
    readTime: '6 min read',
  },
  {
    id: '2',
    slug: 'interview-danika-the-producer',
    title: 'Interview: Danika — When Production Meets Performance',
    subtitle: 'The genre-bending producer talks live sets, AI tools, and building a fanbase from scratch',
    category: 'INTERVIEW',
    publishedAt: '2026-05-07',
    author: 'Interviews Desk',
    readTime: '8 min read',
  },
  {
    id: '3',
    slug: 'profile-mic-maestro-the-arc',
    title: 'Artist Profile: Mic Maestro and the Long Arc',
    subtitle: 'From street cyphers to TMI Season 1 — a three-year journey told in four verses',
    category: 'PROFILE',
    publishedAt: '2026-05-03',
    author: 'Staff Writer',
    readTime: '5 min read',
  },
  {
    id: '4',
    slug: 'review-season-1-debut-drops',
    title: 'Review: Season 1 Debut Drops Are Here',
    subtitle: 'We reviewed every artist debut release submitted in the first competition wave',
    category: 'REVIEW',
    publishedAt: '2026-04-28',
    author: 'Music Desk',
    readTime: '10 min read',
  },
  {
    id: '5',
    slug: 'feature-women-who-run-tmi',
    title: "The Women Running TMI's Top Charts",
    subtitle: "Female artists hold 6 of the top 10 spots this week — here's why that matters",
    category: 'FEATURE',
    publishedAt: '2026-04-22',
    author: 'TMI Editorial',
    readTime: '7 min read',
  },
  {
    id: '6',
    slug: 'interview-bar-architect-process',
    title: 'Interview: Bar Architect on His Creative Process',
    subtitle: 'Writing 16 bars a day, the discipline behind the bars, and what keeps him sharp',
    category: 'INTERVIEW',
    publishedAt: '2026-04-18',
    author: 'Interviews Desk',
    readTime: '9 min read',
  },
  {
    id: '7',
    slug: 'profile-from-garage-to-arena',
    title: 'Profile: From Garage Sessions to Arena Stage',
    subtitle: 'A deep look at the self-produced artist who never left their hometown — and still won',
    category: 'PROFILE',
    publishedAt: '2026-04-14',
    author: 'Features Team',
    readTime: '6 min read',
  },
  {
    id: '8',
    slug: 'review-live-battle-ep-round-3',
    title: 'Live Battle EP: Round 3 Reviewed',
    subtitle: 'Eight artists, four matchups, one brutal leaderboard — we break down every track',
    category: 'REVIEW',
    publishedAt: '2026-04-10',
    author: 'Music Desk',
    readTime: '11 min read',
  },
];

export default function ArtistArticlesPage() {
  const [filter, setFilter] = useState('ALL');

  const filtered =
    filter === 'ALL' ? SEED_ARTICLES : SEED_ARTICLES.filter((a) => a.category === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(160deg, #0a0020 0%, #050510 60%)',
          padding: '56px 32px 40px',
          borderBottom: '1px solid #AA2DFF33',
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
              color: '#AA2DFF',
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
            ARTIST ARTICLES
          </h1>
          <p style={{ color: '#aaa', fontSize: 15, maxWidth: 520, lineHeight: 1.6 }}>
            Interviews, features, profiles, and reviews covering the artists competing and
            creating on TMI.
          </p>
        </motion.div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28 }}>
          {CATEGORIES.map((cat) => {
            const accent = CATEGORY_COLORS[cat] ?? '#AA2DFF';
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
            const accent = CATEGORY_COLORS[article.category] ?? '#AA2DFF';
            const icon = CATEGORY_ICONS[article.category] ?? '🎵';
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
