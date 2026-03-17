/**
 * TMI — SPONSOR BOARD COMPONENT
 * Motocross jacket / race suit style sponsor board
 * Popup mode + full page mode, animated tiles, tier hierarchy
 */
import React, { useState } from 'react';
import './SponsorBoard.css';

const DEMO_SPONSORS = [
  { id: 1, name: 'Nike', tier: 'diamond', slot: 'title', logo: '✓ Nike', desc: 'Official Apparel Partner', active: true, color: '#FFD700' },
  { id: 2, name: 'Amazon', tier: 'platinum', slot: 'main', logo: 'amazon', desc: 'Digital Distribution', active: true, color: '#FF9900' },
  { id: 3, name: 'Frito-Lay', tier: 'gold', slot: 'main', logo: 'Frito-Lay', desc: 'Snack Sponsor', active: true, color: '#FF6B00' },
  { id: 4, name: 'Delta', tier: 'gold', slot: 'main', logo: '▲ Delta', desc: 'Official Travel', active: true, color: '#003DA5' },
  { id: 5, name: 'Trader Joe\'s', tier: 'silver', slot: 'side', logo: "Trader Joe's", desc: 'Food Partner', active: true, color: '#C8372D' },
  { id: 6, name: 'Netflix', tier: 'silver', slot: 'side', logo: 'NETFLIX', desc: 'Media Partner', active: true, color: '#E50914' },
  { id: 7, name: 'Hulu', tier: 'bronze', slot: 'strip', logo: 'hulu', desc: 'Stream Partner', active: true, color: '#1CE783' },
  { id: 8, name: '7-Eleven', tier: 'bronze', slot: 'strip', logo: '7 Eleven', desc: 'Convenience', active: true, color: '#FF6B00' },
  { id: 9, name: 'Open Slot', tier: 'bronze', slot: 'strip', logo: 'YOUR BRAND', desc: 'Become a Sponsor', active: false, color: '#5A6080' },
];

const TIER_ORDER = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

function SponsorTile({ sponsor, size = 'md', onClick }) {
  return (
    <div
      className={`sponsor-tile sponsor-tile--${size} sponsor-tile--${sponsor.tier} ${!sponsor.active ? 'sponsor-tile--open' : ''}`}
      style={{ '--sponsor-color': sponsor.color }}
      onClick={() => onClick?.(sponsor)}
    >
      <div className="sponsor-tile__glow" />
      <div className="sponsor-tile__inner">
        <div className="sponsor-tile__logo">{sponsor.logo}</div>
        {size !== 'xs' && (
          <div className="sponsor-tile__desc">{sponsor.desc}</div>
        )}
      </div>
      {!sponsor.active && (
        <div className="sponsor-tile__open-label">OPEN SLOT</div>
      )}
      <div className={`sponsor-tile__tier-bar`} />
    </div>
  );
}

function SponsorModal({ sponsor, onClose }) {
  if (!sponsor) return null;
  return (
    <div className="sponsor-modal-overlay" onClick={onClose}>
      <div className="sponsor-modal" onClick={e => e.stopPropagation()}>
        <button className="sponsor-modal__close" onClick={onClose}>✕</button>
        <div className="sponsor-modal__logo">{sponsor.logo}</div>
        <div className="sponsor-modal__name">{sponsor.name}</div>
        <div className="sponsor-modal__desc">{sponsor.desc}</div>
        <span className={`tier-badge tier-${sponsor.tier}`}>{sponsor.tier} PARTNER</span>
        {!sponsor.active ? (
          <button className="tmi-btn tmi-btn-primary" style={{ marginTop: 16, width: '100%' }}>
            🤝 Become a Sponsor
          </button>
        ) : (
          <a href="#" className="tmi-btn tmi-btn-outline" style={{ marginTop: 16, width: '100%', display: 'block', textAlign: 'center' }}>
            Visit Partner →
          </a>
        )}
      </div>
    </div>
  );
}

export default function SponsorBoard({ sponsors = DEMO_SPONSORS, artistName = 'This Artist', isPopup = false }) {
  const [selected, setSelected] = useState(null);

  const byTier = tier => sponsors.filter(s => s.tier === tier);
  const titleSponsor = sponsors.find(s => s.slot === 'title');

  return (
    <div className={`sponsor-board ${isPopup ? 'sponsor-board--popup' : ''}`}>
      {/* ── HEADER ── */}
      <div className="sponsor-board__header">
        <div className="sponsor-board__artist-name">{artistName}</div>
        <h2 className="sponsor-board__title">OFFICIAL SPONSORS</h2>
        <p className="sponsor-board__subtitle">These partners help support this artist's journey</p>
      </div>

      {/* ── JACKET / BOARD VISUAL ── */}
      <div className="sponsor-board__jacket">
        {/* Artist silhouette center */}
        <div className="sponsor-board__artist-center">
          <div className="sponsor-board__artist-silhouette">
            <span className="sponsor-board__artist-icon">🎤</span>
            <div className="sponsor-board__artist-glow" />
          </div>
        </div>

        {/* TITLE SPONSOR — crown zone */}
        {titleSponsor && (
          <div className="sponsor-board__crown-zone">
            <div className="sponsor-board__crown-label">TITLE SPONSOR</div>
            <SponsorTile sponsor={titleSponsor} size="lg" onClick={setSelected} />
          </div>
        )}

        {/* PLATINUM/GOLD — main patches */}
        <div className="sponsor-board__patch-zone">
          {['platinum','gold'].flatMap(tier => byTier(tier)).map(s => (
            <SponsorTile key={s.id} sponsor={s} size="md" onClick={setSelected} />
          ))}
        </div>

        {/* SILVER — side rails */}
        <div className="sponsor-board__side-left">
          {byTier('silver').slice(0,2).map(s => (
            <SponsorTile key={s.id} sponsor={s} size="sm" onClick={setSelected} />
          ))}
        </div>
        <div className="sponsor-board__side-right">
          {byTier('silver').slice(2).map(s => (
            <SponsorTile key={s.id} sponsor={s} size="sm" onClick={setSelected} />
          ))}
        </div>

        {/* BRONZE — bottom strip */}
        <div className="sponsor-board__strip-zone">
          {byTier('bronze').map(s => (
            <SponsorTile key={s.id} sponsor={s} size="xs" onClick={setSelected} />
          ))}
        </div>
      </div>

      {/* ── CAROUSEL (rotating feature) ── */}
      <div className="sponsor-board__carousel">
        <div className="sponsor-board__carousel-track">
          {sponsors.filter(s => s.active).concat(sponsors.filter(s => s.active)).map((s, i) => (
            <div key={i} className="sponsor-board__carousel-card" style={{ '--c': s.color }}>
              <div className="sponsor-board__carousel-logo">{s.logo}</div>
              <div className="sponsor-board__carousel-desc">{s.desc}</div>
              <span className={`tier-badge tier-${s.tier}`}>{s.tier}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="sponsor-board__cta">
        <button className="tmi-btn tmi-btn-primary">🤝 Become a Sponsor</button>
        <button className="tmi-btn tmi-btn-ghost">📊 View Packages</button>
      </div>

      {/* ── MODAL ── */}
      {selected && <SponsorModal sponsor={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
