/**
 * TMI — ARTICLES HUB COMPONENT
 * Matches PDF page 2: Collage mosaic layout, article cards,
 * floating shapes, sponsor logos, fan polls, Law Bubble ads
 */
'use client';

import React, { useState } from 'react';
import './ArticlesHub.css';

const DEMO_ARTICLES = [
  {
    id: 1, title: 'How Streaming Is Changing Global Listening Trends',
    excerpt: "As the accessibility of music expands worldwide, streaming services are influencing what people listen to and how...",
    tag: 'TRENDS', color: 'gold', hasWatch: false, img: null,
  },
  {
    id: 2, title: 'Studio Cypher Recap',
    excerpt: null, tag: 'VIDEO', color: 'cyan', hasWatch: true,
    img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&q=80',
  },
  {
    id: 3, title: 'Who Took the Crown and More!',
    excerpt: null, tag: 'RESULTS', color: 'orange', hasWatch: false, img: null,
  },
  {
    id: 4, title: 'Tours Kick Into High Gear',
    excerpt: 'On the rise and on the road, springtime tours are here. Five big acts will have concerts lined up all over...',
    tag: 'TOURS', color: 'pink', hasWatch: false, img: null,
  },
  {
    id: 5, title: 'House Committee Advances Ticket Sales Bill',
    excerpt: 'A fresh batch of releases includes artists who blend new-seen-territory...',
    tag: 'NEWS', color: 'magenta', hasWatch: false,
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80',
  },
  {
    id: 6, title: 'Ricardo Parker — Road to Stardom',
    excerpt: 'Some know him as the member of a chart-topping duo, but Parker\'s...',
    tag: 'PROFILE', color: 'cyan', hasWatch: false,
    img: 'https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?w=200&q=80',
  },
];

const FAN_POLL = {
  question: 'Which lyric site is on repeat?',
  options: [
    { label: 'Genius', votes: 47, pct: 47 },
    { label: 'SongPass', votes: 44, pct: 44 },
    { label: 'Album C', votes: 92, pct: 92 },
  ],
};

const SPONSORS = ['amazon', 'Nike', 'TRADER JOE\'S', '7-Eleven', 'NETFLIX', 'hulu'];

function ColorMap(color) {
  const m = {
    gold: 'var(--neon-gold)', cyan: 'var(--neon-cyan)',
    orange: 'var(--neon-orange)', pink: 'var(--neon-pink)',
    magenta: 'var(--neon-magenta)', red: 'var(--neon-red)',
  };
  return m[color] || 'var(--neon-cyan)';
}

function ArticleCard({ article }) {
  const accentColor = ColorMap(article.color);
  return (
    <div className="articles-hub__card" style={{ '--accent': accentColor }}>
      {article.img && (
        <div className="articles-hub__card-thumb">
          <img src={article.img} alt={article.title} />
        </div>
      )}
      <div className="articles-hub__card-body">
        <div className="articles-hub__card-tag">{article.tag}</div>
        <h3 className="articles-hub__card-title">{article.title}</h3>
        {article.excerpt && (
          <p className="articles-hub__card-excerpt">{article.excerpt}</p>
        )}
        <button className="articles-hub__read-btn">
          {article.hasWatch ? '▶ Watch Article' : '→ Read Article'}
        </button>
      </div>
    </div>
  );
}

function FanPollWidget({ poll }) {
  const [voted, setVoted] = useState(null);
  return (
    <div className="fan-poll">
      <div className="fan-poll__header">
        <span className="fan-poll__label">🗳 Fan Poll</span>
        <span className="fan-poll__question">{poll.question}</span>
      </div>
      <div className="fan-poll__options">
        {poll.options.map((opt, i) => (
          <div
            key={i}
            className={`fan-poll__option ${voted === i ? 'is-voted' : ''}`}
            onClick={() => setVoted(i)}
          >
            <div className="fan-poll__option-bar" style={{ width: `${opt.pct}%` }} />
            <span className="fan-poll__option-label">{opt.label}</span>
            <span className="fan-poll__option-pct">{opt.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LawBubbleAd() {
  return (
    <div className="law-bubble-ad">
      <div className="law-bubble-ad__badge">Law Bubble</div>
      <p className="law-bubble-ad__text">Your one-stop app for legal advice, how on your phone!</p>
      <button className="law-bubble-ad__cta tmi-btn tmi-btn-cyan">Learn More</button>
    </div>
  );
}

function SponsorBar({ sponsors }) {
  return (
    <div className="sponsor-bar">
      <div className="sponsor-bar__label">ADVERTISE WITH US</div>
      <div className="sponsor-bar__logos">
        {sponsors.map((s, i) => (
          <div key={i} className="sponsor-bar__logo">{s}</div>
        ))}
      </div>
    </div>
  );
}

export default function ArticlesHub({ articles = DEMO_ARTICLES }) {
  return (
    <div className="articles-hub tmi-grid-bg">
      {/* Background geometry */}
      <div className="articles-hub__bg-shapes" aria-hidden="true">
        <div className="articles-hub__shape articles-hub__shape--1" />
        <div className="articles-hub__shape articles-hub__shape--2" />
        <div className="articles-hub__shape articles-hub__shape--3" />
      </div>

      <div className="articles-hub__header">
        <h1 className="articles-hub__title section-title neon-gold">ARTICLES</h1>
        <div className="articles-hub__scatter-icons" aria-hidden="true">
          {['▲','▼','◆','▲','▼','◆','▲'].map((s,i) => (
            <span key={i} className="articles-hub__scatter-icon" style={{
              top: `${Math.random()*60+10}%`, left: `${Math.random()*90}%`,
              color: ['var(--neon-cyan)','var(--neon-orange)','var(--neon-pink)'][i%3],
              animationDelay: `${i*0.4}s`,
            }}>{s}</span>
          ))}
        </div>
      </div>

      {/* ── MOSAIC GRID ── */}
      <div className="articles-hub__mosaic">
        {/* Column 1 */}
        <div className="articles-hub__col">
          <ArticleCard article={articles[0]} />
          <ArticleCard article={articles[3]} />
          <LawBubbleAd />
          <ArticleCard article={articles[5]} />
        </div>
        {/* Column 2 — center */}
        <div className="articles-hub__col articles-hub__col--center">
          <ArticleCard article={articles[1]} />
          <ArticleCard article={articles[4]} />
          <FanPollWidget poll={FAN_POLL} />
        </div>
        {/* Column 3 */}
        <div className="articles-hub__col">
          <ArticleCard article={articles[2]} />
          <FanPollWidget poll={{ ...FAN_POLL, question:'Which is on repeat?' }} />
          <LawBubbleAd />
        </div>
      </div>

      {/* ── SPONSOR BAR ── */}
      <SponsorBar sponsors={SPONSORS} />
    </div>
  );
}
