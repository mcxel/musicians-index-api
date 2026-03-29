/**
 * TMI — PROMOTIONAL HUB COMPONENT
 * Matches PDF page 1: Live artist cards, 2×2 grid, LIVE badges
 * Includes live-photo 3-second motion, hover effects, sponsor HUD
 */
'use client';

import React, { useState, useEffect } from 'react';
import './PromotionalHub.css';

const DEMO_ARTISTS = [
  {
    id: 1, name: 'Diana Electro', showName: 'Neon City Warm-Up Set',
    viewers: 213, reacts: 157, status: 'Just vibing', isLive: true,
    genre: 'Electronic', tier: 'gold',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
  },
  {
    id: 2, name: 'Darkwave Diva', showName: 'Synthesizer Dreams',
    viewers: 98, reacts: 243, status: 'Watch Highlight', isLive: true,
    genre: 'Synthwave', tier: 'platinum',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
  },
  {
    id: 3, name: 'Poptronica', showName: 'Friday Night Hangs',
    viewers: 145, reacts: 132, status: 'pop · interactive', isLive: true,
    genre: 'Pop', tier: 'bronze',
    img: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=400&q=80',
  },
  {
    id: 4, name: 'NightRider Beats', showName: 'Mixing New Tracks',
    viewers: 0, reacts: 98, status: 'Beats · creation', isLive: false,
    genre: 'Hip-Hop', tier: 'free',
    img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80',
  },
];

function TierBadge({ tier }) {
  return <span className={`tier-badge tier-${tier}`}>{tier}</span>;
}

function LiveBadge({ viewers }) {
  return (
    <div className="live-badge artist-card__live-badge">
      <span className="artist-card__viewer-count">LIVE · {viewers}</span>
    </div>
  );
}

function ArtistCard({ artist }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`artist-card ${!artist.isLive ? 'is-offline' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── MEDIA ZONE ── */}
      <div className="artist-card__media live-photo-container">
        <img
          className={`artist-card__media-img ${hovered ? 'live-photo-anim' : ''}`}
          src={artist.img}
          alt={artist.name}
          loading="lazy"
        />
        {artist.isLive && <LiveBadge viewers={artist.viewers} />}
        <div className="artist-card__reactions">🔥 👀 ✨</div>
      </div>

      {/* ── BODY ── */}
      <div className="artist-card__body">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
          <div className="artist-card__name">{artist.name}</div>
          <TierBadge tier={artist.tier} />
        </div>
        <div className="artist-card__show-name">{artist.showName}</div>

        <div className="artist-card__meta">
          <span className="artist-card__reacts">🔥 {artist.reacts} reacts</span>
          <span className={`artist-card__status ${!artist.isLive ? 'artist-card__offline' : ''}`}>
            {artist.status}
          </span>
        </div>

        <div className="artist-card__actions">
          <button className="artist-card__join-btn">
            {artist.isLive ? '▶ Join Now' : '📅 Set Reminder'}
          </button>
          <div className="artist-card__sub-actions">
            <button className="artist-card__sub-btn">📺 Watch Highlight</button>
            <button className="artist-card__sub-btn artist-card__hype-btn">🔥 Hype</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromotionalHub({ artists = DEMO_ARTISTS }) {
  return (
    <div className="promo-hub tmi-grid-bg">
      <div className="promo-hub__bg-glow" />

      {/* ── NAV ── */}
      <nav className="promo-hub__nav">
        <ul className="promo-hub__nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Browse</a></li>
          <li><a href="#" style={{ color:'var(--neon-gold)' }}>Creators</a></li>
          <li><a href="#">Pricing</a></li>
        </ul>
        <div className="promo-hub__nav-right">
          <div className="promo-hub__nav-icon">🎵</div>
          <div className="promo-hub__nav-wallet">0.00 ▶</div>
        </div>
      </nav>

      {/* ── TITLE ── */}
      <h1 className="promo-hub__title section-title">PROMOTIONAL HUB</h1>

      {/* ── GRID ── */}
      <div className="promo-hub__grid">
        {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
      </div>
    </div>
  );
}
