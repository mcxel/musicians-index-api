/**
 * TMI — GAME NIGHT HUB
 * Matches PDF page 10: Neon show grid, game tiles,
 * audience avatars, sponsor missions, countdown
 */
import React, { useState, useEffect } from 'react';
import './GameNightHub.css';

const GAMES = [
  { id: 1, title: 'NAME THAT TUNE', status: 'LIVE', players: 350, icon: '🎵', sub: 'LIVE', accent: '#FF1493' },
  { id: 2, title: 'DEAL OR NO DEAL', status: 'TIP', players: 127, icon: '💼', sub: 'MUSIC EDITION', accent: '#FFB800' },
  { id: 3, title: '1 vs 10000', status: 'HARD', players: null, icon: '⚔️', sub: 'DIFFICULT · 9:00 PM', accent: '#00D4FF' },
  { id: 4, title: 'COVER ART ZOOM', status: 'JOIN', players: 221, icon: '🎨', sub: null, accent: '#00FF88' },
  { id: 5, title: 'LYRIC FILL', status: 'JOIN', players: 126, icon: '📝', sub: "80's HITS", accent: '#FF6B00' },
  { id: 6, title: 'DJ MIX-OFF', status: 'SPONSOR', players: 62, icon: '🎧', sub: null, accent: '#D400FF' },
];

function Countdown({ from = 180 }) {
  const [sec, setSec] = useState(from);
  useEffect(() => {
    const t = setInterval(() => setSec(s => s > 0 ? s - 1 : from), 1000);
    return () => clearInterval(t);
  }, [from]);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return <span className="countdown">{mm}:{ss}</span>;
}

function AvatarGrid({ count = 40 }) {
  return (
    <div className="avatar-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="avatar-grid__cell"
          style={{ animationDelay: `${i * 0.04}s` }}>
          <span style={{ fontSize: '18px' }}>
            {['😎','🎤','🎵','👑','🔥','💎','🎸','🥁','🎹','🎺'][i % 10]}
          </span>
        </div>
      ))}
    </div>
  );
}

function GameTile({ game }) {
  return (
    <div className="game-tile" style={{ '--tile-accent': game.accent }}>
      <div className="game-tile__icon">{game.icon}</div>
      <div className="game-tile__info">
        <div className="game-tile__title">{game.title}</div>
        {game.sub && <div className="game-tile__sub">{game.sub}</div>}
        {game.players && (
          <div className="game-tile__players">{game.players.toLocaleString()} PLAYERS</div>
        )}
      </div>
      <div className="game-tile__status-badge" data-status={game.status}>
        {game.status}
      </div>
    </div>
  );
}

export default function GameNightHub() {
  return (
    <div className="game-night">
      {/* ── HEADER ── */}
      <div className="game-night__header">
        <div className="game-night__day-tabs">
          <button className="game-night__day-tab is-active">MONDAY</button>
          <button className="game-night__day-tab">WED-SUN</button>
        </div>
        <div className="game-night__coins">
          <span className="game-night__coin-icon">🪙</span>
          <span className="game-night__coin-amt">350</span>
          <span className="game-night__bell">🔔</span>
        </div>
      </div>

      {/* ── TITLE ── */}
      <div className="game-night__title-block">
        <h1 className="game-night__title">
          <span className="game-night__title-game">GAME</span>
          <span className="game-night__title-night">NIGHT</span>
        </h1>
        <div className="game-night__tagline">— FEEL THE GLOW —</div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="game-night__main">
        {/* Feature game on-air card */}
        <div className="game-night__feature-card">
          <div className="game-night__on-air">
            <span className="live-badge">ON AIR</span>
            <div className="game-night__host-avatar">🎙️</div>
          </div>
          <div className="game-night__feature-info">
            <Countdown from={201} />
            <div className="game-night__prize">🏆 Win limited Neon Jacket</div>
            <div className="game-night__crown-icon">👑</div>
          </div>
          <div className="game-night__feature-btns">
            <button className="game-night__feature-btn game-night__feature-btn--join">JOIN QUEUE</button>
            <button className="game-night__feature-btn">PREVIEW</button>
            <button className="game-night__feature-btn">PRACTICE</button>
          </div>
        </div>

        {/* Avatar grid */}
        <AvatarGrid count={40} />
      </div>

      {/* ── GAME TILES ── */}
      <div className="game-night__tiles">
        {GAMES.map(g => <GameTile key={g.id} game={g} />)}
      </div>

      {/* ── SPONSOR MISSION ── */}
      <div className="game-night__sponsor-mission">
        <span className="game-night__sponsor-label">SPONSOR MISSION</span>
        <span className="game-night__sponsor-text">
          Complete Mission · <span style={{ color:'var(--neon-cyan)' }}>'Glow Stick Pack'</span> unlock
        </span>
      </div>

      {/* ── TICKER ── */}
      <div className="game-night__ticker">
        <span>Top Artist last week: <strong>Chario Ace</strong></span>
        <span>·</span>
        <span>18-streak by <strong>Yumi</strong></span>
        <span>·</span>
        <span style={{ color: 'var(--neon-pink)' }}>New Neon Pack drops</span>
      </div>
    </div>
  );
}
