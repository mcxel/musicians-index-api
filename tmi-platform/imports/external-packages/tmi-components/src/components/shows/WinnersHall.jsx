/**
 * TMI — WINNER'S HALL
 * Matches PDF page 9: Champion leaderboard, trophy 3D,
 * rank cards with crowns, live now banner, sponsor CTA
 */
import React, { useState } from 'react';
import './WinnersHall.css';

const DEMO_WINNERS = [
  { rank: 1, name: 'Charro Ace', weeks: 4, change: '+', badge: '👑', title: 'Best Stage Presence', sub: '100% Accuracy' },
  { rank: 2, name: 'Mia Jay',    weeks: 7, change: '+', badge: '⭐', title: 'Fan Favorite', sub: '7 WEEK streak' },
  { rank: 3, name: 'DJ Blend',   weeks: 3, change: '+1', badge: '🎧', title: 'Best DJ Set', sub: null },
  { rank: 4, name: 'Lani Flame', weeks: 4, change: '+2', badge: '🔥', title: 'Rising Star', sub: null },
];

function WinnerCard({ winner }) {
  return (
    <div className="winner-card" style={{ '--rank': winner.rank }}>
      <div className="winner-card__crown">{winner.badge}</div>
      <div className="winner-card__photo">
        <span style={{ fontSize: 28 }}>🎤</span>
      </div>
      <div className="winner-card__name">{winner.name}</div>
      {winner.sub && <div className="winner-card__sub">{winner.sub}</div>}
      <div className="winner-card__meta">
        <span className="winner-card__rank">#{winner.rank}</span>
        <span className={`change-badge change-badge--up`}>👑 {winner.weeks}+</span>
      </div>
    </div>
  );
}

export default function WinnersHall() {
  return (
    <div className="winners-hall">
      {/* Marquee header */}
      <div className="winners-hall__marquee">
        <span>THIS WEEK'S CHAMPIONS</span>
        <span className="live-badge">LIVE NOW!</span>
        <span>Top Artists · Top Fans · Top DJs · Top Crews · Sponsor MVPs</span>
      </div>

      <h1 className="winners-hall__title">THE WINNER'S HALL</h1>
      <div className="winners-hall__presented">— PRESENTED BY THE MUSICIANS INDEX —</div>

      {/* Main content */}
      <div className="winners-hall__body">
        {/* Left badges */}
        <div className="winners-hall__badges-left">
          <div className="winners-hall__badge-pill winners-hall__badge-pill--cyan">100% ACCURACY</div>
          <div className="winners-hall__badge-pill winners-hall__badge-pill--gold">BEST STAGE PRESENCE</div>
          <div className="winners-hall__badge-pill winners-hall__badge-pill--orange">BEST DJ SET</div>
        </div>

        {/* Trophy center */}
        <div className="winners-hall__trophy-center">
          <div className="winners-hall__trophy-char">🎉</div>
          <div className="winners-hall__trophy">🏆</div>
          <div className="winners-hall__trophy-glow" />
        </div>

        {/* Winner cards right */}
        <div className="winners-hall__cards">
          {DEMO_WINNERS.map(w => <WinnerCard key={w.rank} winner={w} />)}
        </div>
      </div>

      {/* Action row */}
      <div className="winners-hall__actions">
        <button className="tmi-btn tmi-btn-outline">📺 View Performance</button>
        <button className="tmi-btn tmi-btn-ghost">🎵 Hear Highlight</button>
        <button className="tmi-btn tmi-btn-primary">🎁 Send Gift</button>
      </div>

      {/* Sponsor next show */}
      <div className="winners-hall__sponsor-row">
        <div className="winners-hall__sponsor-logo">✓ Nike</div>
        <button className="winners-hall__sponsor-btn">💼 SPONSOR NEXT WEEK'S SHOW</button>
      </div>
    </div>
  );
}
