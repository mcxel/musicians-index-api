/**
 * TMI — GLOBAL ADMIN COMMAND HUD
 * Matches PDF page 3: Dark navy bg, orange neon text,
 * US heat map, bot activity, revenue stats, action buttons
 */
'use client';

import React, { useState, useEffect } from 'react';
import './AdminCommandHUD.css';

const BOT_STATUS = [
  { name: 'MAP BOTS',     active: true,  count: 14 },
  { name: 'BOOKING BOTS', active: true,  count: 7 },
  { name: 'GUARD BOTS',   active: false, count: 3 },
];

const STATS = [
  { label: 'TOTAL SHOWS', value: '564', icon: '🎪' },
  { label: 'QUEUE',        value: '23',  icon: '📋', sub: '▶▶▶' },
  { label: 'ALERTS',       value: '0',   icon: '⚠', delta: '△' },
];

function HeatMapUSA() {
  const dots = Array.from({ length: 60 }, (_, i) => ({
    x: 15 + Math.random() * 70,
    y: 20 + Math.random() * 60,
    size: Math.random() * 6 + 2,
    opacity: Math.random() * 0.7 + 0.3,
  }));
  return (
    <div className="heatmap-usa">
      <svg viewBox="0 0 100 70" className="heatmap-usa__svg">
        <path className="heatmap-usa__outline" d="M10,15 L90,12 L92,55 L80,58 L68,62 L50,60 L30,62 L15,58 L8,42 Z" />
        {dots.map((d, i) => (
          <circle key={i}
            cx={d.x} cy={d.y} r={d.size}
            fill={`rgba(255,107,0,${d.opacity})`}
            className="heatmap-usa__dot"
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

function BotActivityPanel({ bots }) {
  return (
    <div className="admin-panel">
      <div className="admin-panel__title">BOT ACTIVITY</div>
      {bots.map(bot => (
        <div key={bot.name} className="admin-panel__bot-row">
          <span className="admin-panel__bot-name">{bot.name}</span>
          <div className="admin-panel__bot-bar">
            <div
              className="admin-panel__bot-fill"
              style={{
                width: `${(bot.count / 20) * 100}%`,
                background: bot.active ? 'var(--neon-orange)' : 'var(--text-muted)',
              }}
            />
          </div>
          <span className={`admin-panel__bot-status ${bot.active ? 'is-active' : ''}`}>
            {bot.active ? '●' : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

function HeadBotPanel({ status = 'ONLINE' }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="admin-panel head-bot-panel">
      <div className="admin-panel__title">HEAD BOT</div>
      <div className={`head-bot-orb ${pulse ? 'head-bot-orb--pulse' : ''}`}>
        <div className="head-bot-orb__inner">
          <span className="head-bot-orb__label">{status}</span>
        </div>
      </div>
      <div className="head-bot-controls">
        {['○','○','═','═','POL'].map((c,i) => (
          <span key={i} className="head-bot-ctrl">{c}</span>
        ))}
      </div>
    </div>
  );
}

function MapStatusPanel() {
  return (
    <div className="admin-panel map-status-panel">
      <div className="admin-panel__title">MAP STATUS</div>
      <div className="map-status-warning">
        <div className="map-status-warning__triangle">
          <span className="map-status-warning__icon">!</span>
        </div>
        <div className="map-status-warning__dots">
          {['▲','▲','▲'].map((d,i) => <span key={i}>{d}</span>)}
        </div>
      </div>
    </div>
  );
}

export default function AdminCommandHUD() {
  const [revenueAnim, setRevenueAnim] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setRevenueAnim(p => !p), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="admin-hud">
      {/* ── HEADER ── */}
      <div className="admin-hud__header">
        <div className="admin-hud__subtitle">THE MUSICIAN'S INDEX</div>
        <h1 className="admin-hud__title">GLOBAL ADMIN COMMAND</h1>
        <div className="admin-hud__dashes">— — — —</div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="admin-hud__grid">
        {/* LEFT: Heatmap + Revenue + Stats */}
        <div className="admin-hud__left">
          <div className="admin-hud__map-box">
            <HeatMapUSA />
          </div>
          <div className="admin-hud__revenue">
            <div className="admin-hud__revenue-label">REVENUE</div>
            <div className={`admin-hud__revenue-value ${revenueAnim ? 'admin-hud__revenue-value--flash' : ''}`}>
              $ $ $ $
            </div>
          </div>
          <div className="admin-hud__stats-row">
            {STATS.map(s => (
              <div key={s.label} className="admin-stat">
                <div className="admin-stat__label">{s.label}</div>
                <div className="admin-stat__value">{s.value}</div>
                {s.sub && <div className="admin-stat__sub">{s.sub}</div>}
                {s.delta && <div className="admin-stat__delta">{s.delta} = {s.value}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Bot activity + Head bot + Map status */}
        <div className="admin-hud__right">
          <BotActivityPanel bots={BOT_STATUS} />
          <HeadBotPanel status="ONLINE" />
          <MapStatusPanel />
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="admin-hud__actions">
        {[
          { label: 'RUN DIAGNOSTICS', icon: '🔬', color: 'orange' },
          { label: 'EXECUTE PATCH',   icon: '⚡', color: 'cyan' },
          { label: 'OVERRIDE SYSTEM', icon: '🔒', color: 'pink' },
        ].map(a => (
          <button key={a.label} className={`admin-hud__action-btn admin-hud__action-btn--${a.color}`}>
            <span>{a.icon}</span> {a.label}
          </button>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div className="admin-hud__footer">BERNTOUTGLOBAL</div>
    </div>
  );
}
