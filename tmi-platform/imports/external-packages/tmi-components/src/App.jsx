/**
 * TMI — MASTER APP ROUTER
 * Connects all page components into one navigable demo.
 * This is the root entry point for your VS Code repo.
 */
import React, { useState } from 'react';
import './styles/globals.css';
import './App.css';

// ── Page Imports ──
import PromotionalHub        from './components/hub/PromotionalHub';
import ArticlesHub           from './components/articles/ArticlesHub';
import AdminCommandHUD       from './components/admin/AdminCommandHUD';
import ArtistBookingDashboard from './components/booking/ArtistBookingDashboard';
import BillboardBoard        from './components/billboard/BillboardBoard';
import AudienceRoom          from './components/audience/AudienceRoom';
import GameNightHub          from './components/games/GameNightHub';
import WinnersHall           from './components/shows/WinnersHall';
import DealOrFeud            from './components/shows/DealOrFeud';
import SponsorBoard          from './components/sponsor/SponsorBoard';

const PAGES = [
  { id: 'hub',       label: 'Promotional Hub',      icon: '📡', component: PromotionalHub },
  { id: 'articles',  label: 'Articles Hub',          icon: '📰', component: ArticlesHub },
  { id: 'admin',     label: 'Admin Command',         icon: '🛡', component: AdminCommandHUD },
  { id: 'booking',   label: 'Artist Booking',        icon: '🗺', component: ArtistBookingDashboard },
  { id: 'billboard', label: 'Billboard Board',       icon: '🏆', component: BillboardBoard },
  { id: 'audience',  label: 'Audience Room',         icon: '🎭', component: AudienceRoom },
  { id: 'gamenight', label: 'Game Night',            icon: '🎮', component: GameNightHub },
  { id: 'winners',   label: 'Winners Hall',          icon: '👑', component: WinnersHall },
  { id: 'dealfeud',  label: 'Deal or Feud',          icon: '🎲', component: DealOrFeud },
  { id: 'sponsors',  label: 'Sponsor Board',         icon: '🏅', component: SponsorBoard },
];

export default function App() {
  const [activePage, setActivePage] = useState('hub');
  const [navOpen, setNavOpen] = useState(false);

  const current = PAGES.find(p => p.id === activePage) || PAGES[0];
  const ActiveComponent = current.component;

  return (
    <div className="tmi-app">
      {/* ── TOP NAV ── */}
      <header className="tmi-app__topbar">
        <div className="tmi-app__brand">
          <span className="tmi-app__brand-icon">🎵</span>
          <span className="tmi-app__brand-name">TMI</span>
          <span className="tmi-app__brand-sub">THE MUSICIAN'S INDEX</span>
        </div>

        <button className="tmi-app__menu-toggle" onClick={() => setNavOpen(o => !o)}>
          {navOpen ? '✕' : '☰'}
        </button>

        <nav className={`tmi-app__nav ${navOpen ? 'is-open' : ''}`}>
          {PAGES.map(p => (
            <button
              key={p.id}
              className={`tmi-app__nav-btn ${activePage === p.id ? 'is-active' : ''}`}
              onClick={() => { setActivePage(p.id); setNavOpen(false); }}
            >
              <span className="tmi-app__nav-icon">{p.icon}</span>
              <span className="tmi-app__nav-label">{p.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main className="tmi-app__content" key={activePage}>
        <ActiveComponent />
      </main>

      {/* ── BOTTOM PAGE SWITCHER ── */}
      <footer className="tmi-app__pagebar">
        {PAGES.map((p, i) => (
          <button
            key={p.id}
            className={`tmi-app__pagebar-dot ${activePage === p.id ? 'is-active' : ''}`}
            onClick={() => setActivePage(p.id)}
            title={p.label}
          >
            <span>{p.icon}</span>
          </button>
        ))}
      </footer>
    </div>
  );
}
