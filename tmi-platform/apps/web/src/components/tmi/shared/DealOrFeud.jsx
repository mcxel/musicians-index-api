/**
 * TMI — DEAL OR FEUD 1000
 * Matches PDF pages 12-14: Game show stage, sponsor bar,
 * deal zone / feud board panels, avatar audience wall
 */
'use client';

import React, { useState, useEffect } from 'react';
import './DealOrFeud.css';

const FEUD_ANSWERS = [
  { rank:1, text:'', revealed: false },
  { rank:2, text:'', revealed: false },
  { rank:3, text:'', revealed: false },
  { rank:4, text:'', revealed: false },
  { rank:5, text:'', revealed: false },
];

const SHOW_SPONSORS = ['✓ Nike','✓ Nike','✓ Nike','Spasabsur','SpoFori'];

function AudienceWall({ rows = 5, cols = 10 }) {
  const emojis = ['😎','🎤','🎵','👑','🔥','💎','🎸','🥁','🎹','🎺','🧢','🕶️'];
  return (
    <div className="audience-wall">
      {Array.from({length: rows * cols}, (_, i) => (
        <div key={i} className="audience-wall__face"
          style={{ animationDelay: `${(i % 8) * 0.12}s` }}>
          {emojis[i % emojis.length]}
        </div>
      ))}
    </div>
  );
}

function DealZone({ isOpen }) {
  return (
    <div className="deal-zone">
      <div className="deal-zone__label">DEAL ZONE</div>
      <div className="deal-zone__door">
        <div className="deal-zone__door-panel deal-zone__door-panel--left" />
        <div className="deal-zone__door-panel deal-zone__door-panel--right" />
        {isOpen && <div className="deal-zone__door-open">❓</div>}
      </div>
    </div>
  );
}

function FeudBoard({ answers }) {
  const [revealed, setRevealed] = useState(answers.map(() => false));
  const toggleReveal = (i) => {
    setRevealed(r => r.map((v,j) => j===i ? !v : v));
  };
  return (
    <div className="feud-board">
      <div className="feud-board__label">FEUD</div>
      <div className="feud-board__rows">
        {answers.map((a,i) => (
          <div key={i} className={`feud-board__row ${revealed[i] ? 'is-revealed' : ''}`}
            onClick={() => toggleReveal(i)}>
            <span className="feud-board__row-num">{i+1}</span>
            <div className="feud-board__row-fill">
              {revealed[i] ? <span className="feud-board__answer">✓ Answer {i+1}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DealOrFeud() {
  const [dealOpen, setDealOpen] = useState(false);

  return (
    <div className="deal-or-feud">
      {/* ── SPONSOR BAR ── */}
      <div className="deal-or-feud__sponsor-bar">
        {SHOW_SPONSORS.map((s,i) => (
          <div key={i} className="deal-or-feud__sponsor">{s}</div>
        ))}
      </div>

      {/* ── TITLE ── */}
      <h1 className="deal-or-feud__title">
        <span className="deal-or-feud__title-deal">DEAL</span>
        <span className="deal-or-feud__title-or">or</span>
        <span className="deal-or-feud__title-feud">FEUD</span>
        <span className="deal-or-feud__title-num">1000</span>
      </h1>
      <div className="deal-or-feud__hosted">
        HOSTED BY <span className="deal-or-feud__host-name">BOBBY STANLEY</span>
      </div>

      {/* ── STAGE ── */}
      <div className="deal-or-feud__stage">
        <DealZone isOpen={dealOpen} />

        {/* Host */}
        <div className="deal-or-feud__host" onClick={() => setDealOpen(d => !d)}>
          <div className="deal-or-feud__host-avatar">
            <span style={{ fontSize:52 }}>🎙️</span>
          </div>
          <div className="deal-or-feud__podium" />
          <div className="deal-or-feud__podium-glow" />
        </div>

        <FeudBoard answers={FEUD_ANSWERS} />
      </div>

      {/* ── AUDIENCE WALL ── */}
      <AudienceWall rows={4} cols={12} />

      {/* ── SPONSOR STRIP ── */}
      <div className="deal-or-feud__bottom-sponsors">
        {['✓ Nike','✓ Nike','✓ Nike'].map((s,i) => (
          <div key={i} className="deal-or-feud__bottom-sponsor">{s}</div>
        ))}
      </div>
    </div>
  );
}
