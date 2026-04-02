'use client';
/**
 * contest/page.tsx
 * TMI Grand Platform Contest — Home / Discovery Hub
 * BerntoutGlobal XXL
 *
 * Repo path: apps/web/src/app/contest/page.tsx
 * Route: /contest
 * Auth: Public-facing, creator actions require auth
 */

'use client';

import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { Trophy, Star, Users, Zap, Play, ChevronRight } from 'lucide-react';

// TODO: Replace with real API calls via contest.service
function getContestData() {
  return {
    seasonName: 'Grand Platform Contest — Season 1',
    totalContestants: 0,
    totalSponsors: 0,
    prizePool: '$50,000+',
    daysUntilDeadline: 45,
    categories: [
      { id: 'singers', label: 'Singers', icon: '🎤', count: 0 },
      { id: 'rappers', label: 'Rappers', icon: '🎵', count: 0 },
      { id: 'comedians', label: 'Comedians', icon: '😄', count: 0 },
      { id: 'dancers', label: 'Dancers', icon: '💃', count: 0 },
      { id: 'djs', label: 'DJs', icon: '🎧', count: 0 },
      { id: 'bands', label: 'Bands', icon: '🎸', count: 0 },
      { id: 'beatmakers', label: 'Beatmakers', icon: '🥁', count: 0 },
      { id: 'magicians', label: 'Magicians', icon: '🪄', count: 0 },
      { id: 'influencers', label: 'Influencers', icon: '📱', count: 0 },
      { id: 'freestyle', label: 'Freestyle', icon: '🔥', count: 0 },
    ],
    featuredContestants: [],
    topSponsors: [],
  };
}

export default function ContestPage() {
  const data = getContestData();

  useEffect(() => {
    document.title = 'Grand Platform Contest | TMI';
  }, []);

  return (
    <main className="contest-page">
      {/* Hero Section */}
      <section className="contest-hero">
        <div className="hero-glow-left" />
        <div className="hero-glow-right" />

        <div className="hero-eyebrow">
          <Trophy size={16} />
          <span>GRAND PLATFORM CONTEST</span>
          <span className="season-chip">Season 1</span>
        </div>

        <h1 className="hero-title">
          The Stage Is
          <span className="title-gradient"> Yours</span>
        </h1>

        <p className="hero-subtitle">
          The BerntoutGlobal Grand Stage — where every creator category competes for the ultimate prize.
          Secure 20 sponsors and enter the biggest show on the platform.
        </p>

        {/* Stats row */}
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-number">{data.totalContestants}</span>
            <span className="stat-label">Contestants</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{data.totalSponsors}</span>
            <span className="stat-label">Sponsors</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{data.prizePool}</span>
            <span className="stat-label">Prize Pool</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{data.daysUntilDeadline}d</span>
            <span className="stat-label">Until Deadline</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="hero-ctas">
          <a href="/contest/qualify" className="btn-primary">
            <Zap size={16} />
            Enter the Contest
          </a>
          <a href="/contest/rules" className="btn-secondary">
            View Rules
            <ChevronRight size={16} />
          </a>
          <a href="/contest/host" className="btn-ghost">
            <Play size={14} />
            Meet Ray Journey
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2 className="section-title">How to Qualify</h2>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon"><Users size={24} /></div>
            <h3>Secure 10 Local Sponsors</h3>
            <p>Reach out to local businesses, fans, and community brands on the platform. Each sponsor pays from $50.</p>
          </div>
          <div className="step-card step-card-accent">
            <div className="step-number">02</div>
            <div className="step-icon"><Star size={24} /></div>
            <h3>Secure 10 Major Sponsors</h3>
            <p>Land national brands, industry partners, and major advertisers. Major packages start at $1,000.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon"><Trophy size={24} /></div>
            <h3>Compete on the Grand Stage</h3>
            <p>Once qualified, compete through regional rounds, semi-finals, and the Grand Final hosted by Ray Journey.</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <h2 className="section-title">Open to All Creator Types</h2>
        <div className="categories-grid">
          {data.categories.map((cat) => (
            <a key={cat.id} href={`/contest/discover?category=${cat.id}`} className="category-card">
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
              <span className="cat-count">{cat.count} entered</span>
            </a>
          ))}
        </div>
      </section>

      {/* Sponsor packages preview */}
      <section className="sponsor-preview">
        <h2 className="section-title">Sponsor Packages</h2>
        <p className="section-subtitle">Become a sponsor and get your brand in front of a platform-wide audience</p>

        <div className="packages-row">
          {[
            { tier: 'Local Bronze', price: '$50', color: '#cd7f32', type: 'local' },
            { tier: 'Local Gold', price: '$250', color: '#ffd700', type: 'local' },
            { tier: 'Major Bronze', price: '$1,000', color: '#cd7f32', type: 'major' },
            { tier: 'Major Gold', price: '$10,000', color: '#ffd700', type: 'major' },
            { tier: 'Title Sponsor', price: '$25,000+', color: '#00e5ff', type: 'title' },
          ].map((pkg) => (
            <div key={pkg.tier} className="pkg-preview-card" style={{ '--pkg-color': pkg.color } as CSSProperties}>
              <span className="pkg-type">{pkg.type.toUpperCase()}</span>
              <span className="pkg-tier">{pkg.tier}</span>
              <span className="pkg-price">{pkg.price}</span>
            </div>
          ))}
        </div>

        <a href="/contest/sponsors" className="btn-secondary" style={{ marginTop: '24px', display: 'inline-flex' }}>
          View All Sponsor Packages
          <ChevronRight size={16} />
        </a>
      </section>

      <style jsx>{`
        .contest-page {
          min-height: 100vh;
          background: #070a0f;
          color: #fff;
          overflow-x: hidden;
        }

        .contest-hero {
          position: relative;
          text-align: center;
          padding: 80px 24px 60px;
          overflow: hidden;
        }

        .hero-glow-left {
          position: absolute;
          top: 0; left: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,107,26,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-glow-right {
          position: absolute;
          top: 0; right: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #ff6b1a;
          margin-bottom: 24px;
        }

        .season-chip {
          background: rgba(255,107,26,0.15);
          border: 1px solid rgba(255,107,26,0.3);
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
        }

        .hero-title {
          font-size: clamp(40px, 8vw, 80px);
          font-weight: 900;
          line-height: 1.05;
          margin: 0 0 20px;
          letter-spacing: -0.02em;
        }

        .title-gradient {
          background: linear-gradient(135deg, #ff6b1a, #ffd700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255,255,255,0.6);
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .stats-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 32px;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 800;
          color: #ff6b1a;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.1);
        }

        .hero-ctas {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #ff6b1a, #ff8c42);
          color: #fff;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,107,26,0.4);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.3);
          color: #00e5ff;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.6);
          border-radius: 8px;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .how-it-works, .categories-section, .sponsor-preview {
          padding: 64px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px;
        }

        .section-subtitle {
          color: rgba(255,255,255,0.5);
          margin: 0 0 40px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }

        .step-card {
          padding: 32px;
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .step-card-accent {
          border-color: rgba(255,107,26,0.3);
          background: linear-gradient(135deg, #0d1117, #12100a);
        }

        .step-number {
          font-size: 56px;
          font-weight: 900;
          color: rgba(255,255,255,0.04);
          position: absolute;
          top: 16px;
          right: 20px;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .step-icon {
          color: #ff6b1a;
          margin-bottom: 16px;
        }

        .step-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 10px;
        }

        .step-card p {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 40px;
        }

        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px 16px;
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
          color: #fff;
        }

        .category-card:hover {
          border-color: rgba(255,107,26,0.4);
          background: #121620;
          transform: translateY(-2px);
        }

        .cat-icon { font-size: 28px; }
        .cat-label { font-size: 13px; font-weight: 600; }
        .cat-count { font-size: 11px; color: rgba(255,255,255,0.3); }

        .packages-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 32px;
        }

        .pkg-preview-card {
          flex: 1;
          min-width: 140px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 20px;
          background: #0d1117;
          border: 1px solid rgba(var(--pkg-color), 0.2);
          border-radius: 12px;
          border-color: var(--pkg-color, rgba(255,255,255,0.1));
          border-opacity: 0.3;
        }

        .pkg-type {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.3);
        }

        .pkg-tier {
          font-size: 13px;
          font-weight: 700;
          color: var(--pkg-color);
        }

        .pkg-price {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
        }
      `}</style>
    </main>
  );
}
