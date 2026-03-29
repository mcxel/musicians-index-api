/**
 * TMI — BILLBOARD BOARD COMPONENT
 * Matches PDF page 6: Scroll/parchment style banner,
 * neon artist portrait cards, ranking system
 */
'use client';

import React, { useState } from 'react';
import './BillboardBoard.css';

const DEMO_RANKINGS = [
  {
    rank: 1, name: 'Charro Ace', weeks: 4,
    change: '+2', tier: 'diamond', genre: 'Hip-Hop',
    score: 12400, badges: ['👑', '🔥'],
    img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80',
  },
  {
    rank: 2, name: 'Mia Jay', weeks: 7,
    change: '+1', tier: 'platinum', genre: 'R&B',
    score: 9800, badges: ['⭐', '🎵'],
    img: 'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?w=200&q=80',
  },
  {
    rank: 3, name: 'DJ Blend', weeks: 3,
    change: '+3', tier: 'gold', genre: 'Electronic',
    score: 7600, badges: ['🎧'],
    img: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=200&q=80',
  },
  {
    rank: 4, name: 'Lani Flame', weeks: 2,
    change: '+2', tier: 'gold', genre: 'Pop',
    score: 6200, badges: ['🔥'],
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80',
  },
  {
    rank: 5, name: 'Neon Vibe', weeks: 1,
    change: 'NEW', tier: 'bronze', genre: 'Trap',
    score: 4800, badges: ['🆕'],
    img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&q=80',
  },
];

function RankBadge({ rank }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  if (medals[rank]) return <span className="rank-badge rank-badge--medal">{medals[rank]}</span>;
  return <span className="rank-badge">#{rank}</span>;
}

function ChangeIndicator({ change }) {
  if (change === 'NEW') return <span className="change-badge change-badge--new">NEW</span>;
  const isUp = change.startsWith('+');
  return (
    <span className={`change-badge change-badge--${isUp ? 'up' : 'down'}`}>
      {isUp ? '▲' : '▼'} {change}
    </span>
  );
}

function BillboardCard({ entry, isFeature = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`billboard-card ${isFeature ? 'billboard-card--feature' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ '--tier-color': `var(--tier-${entry.tier})` }}
    >
      {/* ── NEON BORDER GLOW based on tier ── */}
      <div className="billboard-card__frame">
        {/* Photo */}
        <div className="billboard-card__photo-wrap live-photo-container">
          <img
            src={entry.img}
            alt={entry.name}
            className={`billboard-card__photo ${hovered ? 'live-photo-anim' : ''}`}
          />
          <div className="billboard-card__photo-overlay" />
        </div>

        {/* Rank overlay */}
        <div className="billboard-card__rank-overlay">
          <RankBadge rank={entry.rank} />
        </div>

        {/* Badges overlay */}
        <div className="billboard-card__badges">
          {entry.badges.map((b, i) => (
            <span key={i} className="billboard-card__badge">{b}</span>
          ))}
        </div>
      </div>

      {/* ── INFO ── */}
      <div className="billboard-card__info">
        <div className="billboard-card__name">{entry.name}</div>
        <div className="billboard-card__genre">{entry.genre}</div>
        <div className="billboard-card__meta">
          <ChangeIndicator change={entry.change} />
          <span className="billboard-card__weeks">{entry.weeks}w</span>
        </div>
        <div className="billboard-card__score">
          {entry.score.toLocaleString()} pts
        </div>
        <span className={`tier-badge tier-${entry.tier}`}>{entry.tier}</span>
      </div>
    </div>
  );
}

export default function BillboardBoard({ rankings = DEMO_RANKINGS, mode = 'founding' }) {
  const [activeTab, setActiveTab] = useState('week');

  return (
    <div className="billboard-board">
      {/* ── SCROLL HEADER ── */}
      <div className="billboard-board__scroll-header">
        <div className="billboard-board__scroll-top" />
        <div className="billboard-board__scroll-body">
          <div className="billboard-board__brand">BERNTOUTGLOBAL'S</div>
          <h1 className="billboard-board__title">BILLBOARD BOARD</h1>
          {mode === 'founding' && (
            <div className="billboard-board__founding-badge">
              ⭐ FOUNDING ARTIST ERA ⭐
            </div>
          )}
        </div>
        <div className="billboard-board__scroll-bottom" />
      </div>

      {/* ── TABS ── */}
      <div className="billboard-board__tabs">
        {[
          { key: 'week', label: 'THIS WEEK' },
          { key: 'month', label: 'THIS MONTH' },
          { key: 'alltime', label: 'ALL TIME' },
        ].map(t => (
          <button
            key={t.key}
            className={`billboard-board__tab ${activeTab === t.key ? 'is-active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── FEATURED TOP 3 ── */}
      <div className="billboard-board__featured">
        {rankings.slice(0, 3).map(entry => (
          <BillboardCard key={entry.rank} entry={entry} isFeature />
        ))}
      </div>

      {/* ── REMAINING RANKS ── */}
      <div className="billboard-board__list">
        {rankings.slice(3).map(entry => (
          <div key={entry.rank} className="billboard-list-row">
            <RankBadge rank={entry.rank} />
            <div className="billboard-list-row__photo-sm">
              <img src={entry.img} alt={entry.name} />
            </div>
            <div className="billboard-list-row__info">
              <div className="billboard-list-row__name">{entry.name}</div>
              <div className="billboard-list-row__genre">{entry.genre}</div>
            </div>
            <div className="billboard-list-row__right">
              <ChangeIndicator change={entry.change} />
              <span className="billboard-list-row__score">{entry.score.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="billboard-board__cta-row">
        <button className="tmi-btn tmi-btn-orange">▶ View Full Chart</button>
        <button className="tmi-btn tmi-btn-outline">📤 Share</button>
        <button className="tmi-btn tmi-btn-ghost">🏆 Sponsor Next Week</button>
      </div>
    </div>
  );
}
