/**
 * ContestBanner.tsx
 * TMI Grand Platform Contest — Artist Profile Banner
 * BerntoutGlobal XXL
 *
 * Repo path: apps/web/src/components/contest/ContestBanner.tsx
 * Dependencies: SponsorProgressCard, ContestQualificationStatus
 * Wiring: Attach to artist profile page layout, connect to useContestEntry hook
 */

'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Users, ChevronRight, Flame } from 'lucide-react';

interface ContestBannerProps {
  artistId: string;
  artistName: string;
  localSponsors: number;
  majorSponsors: number;
  isQualified?: boolean;
  seasonName?: string;
  seasonDeadline?: Date;
  onFindSponsors?: () => void;
  onInviteSponsors?: () => void;
  onViewContest?: () => void;
}

const LOCAL_REQUIRED = 10;
const MAJOR_REQUIRED = 10;
const TOTAL_REQUIRED = 20;

export function ContestBanner({
  artistId,
  artistName,
  localSponsors = 0,
  majorSponsors = 0,
  isQualified = false,
  seasonName = 'Grand Platform Contest — Season 1',
  seasonDeadline,
  onFindSponsors,
  onInviteSponsors,
  onViewContest,
}: ContestBannerProps) {
  const [pulse, setPulse] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const totalSponsors = localSponsors + majorSponsors;
  const progressPercent = Math.min((totalSponsors / TOTAL_REQUIRED) * 100, 100);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (seasonDeadline) {
      const days = Math.ceil(
        (seasonDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      setDaysLeft(days > 0 ? days : 0);
    }
  }, [seasonDeadline]);

  return (
    <div className="contest-banner-wrapper">
      {/* Animated background glow */}
      <div className={`contest-banner-glow ${pulse ? 'glow-active' : ''}`} />

      <div className="contest-banner">
        {/* Header row */}
        <div className="banner-header">
          <div className="banner-title-group">
            <Flame className="flame-icon" size={20} />
            <span className="banner-eyebrow">GRAND PLATFORM CONTEST</span>
            {isQualified && (
              <span className="qualified-badge">✓ QUALIFIED</span>
            )}
          </div>
          {daysLeft !== null && (
            <div className="deadline-chip">
              <Zap size={12} />
              <span>{daysLeft}d left</span>
            </div>
          )}
        </div>

        <p className="season-name">{seasonName}</p>

        {/* Sponsor progress */}
        <div className="sponsor-progress-section">
          <div className="progress-label-row">
            <span className="progress-label">Sponsors secured</span>
            <span className="progress-count">
              <span className={totalSponsors >= TOTAL_REQUIRED ? 'count-complete' : 'count-active'}>
                {totalSponsors}
              </span>
              <span className="count-total"> / {TOTAL_REQUIRED}</span>
            </span>
          </div>

          {/* Main progress bar */}
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Sub-progress bars */}
          <div className="sub-progress-row">
            <div className="sub-progress-item">
              <span className="sub-label">
                <Users size={11} />
                Local
              </span>
              <div className="sub-track">
                <div
                  className="sub-fill sub-fill-local"
                  style={{ width: `${Math.min((localSponsors / LOCAL_REQUIRED) * 100, 100)}%` }}
                />
              </div>
              <span className="sub-count">{localSponsors}/{LOCAL_REQUIRED}</span>
            </div>

            <div className="sub-progress-item">
              <span className="sub-label">
                <Star size={11} />
                Major
              </span>
              <div className="sub-track">
                <div
                  className="sub-fill sub-fill-major"
                  style={{ width: `${Math.min((majorSponsors / MAJOR_REQUIRED) * 100, 100)}%` }}
                />
              </div>
              <span className="sub-count">{majorSponsors}/{MAJOR_REQUIRED}</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="banner-actions">
          <button
            className="banner-btn banner-btn-primary"
            onClick={onFindSponsors}
          >
            <Zap size={14} />
            Find Sponsors
          </button>
          <button
            className="banner-btn banner-btn-secondary"
            onClick={onInviteSponsors}
          >
            <Users size={14} />
            Invite Sponsors
          </button>
          <button
            className="banner-btn banner-btn-ghost"
            onClick={onViewContest}
          >
            View Contest
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Trophy decoration */}
        <Trophy className="banner-trophy-icon" size={48} />
      </div>

      <style jsx>{`
        .contest-banner-wrapper {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          margin: 16px 0;
        }

        .contest-banner-glow {
          position: absolute;
          inset: -2px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ff6b1a, #00e5ff, #ffd700);
          opacity: 0.4;
          transition: opacity 1.8s ease;
          z-index: 0;
          filter: blur(1px);
        }

        .contest-banner-glow.glow-active {
          opacity: 0.9;
        }

        .contest-banner {
          position: relative;
          z-index: 1;
          background: linear-gradient(135deg, #0a0a0f 0%, #111827 60%, #0d1117 100%);
          border: 1px solid rgba(255, 107, 26, 0.3);
          border-radius: 12px;
          padding: 20px 24px;
          overflow: hidden;
        }

        .banner-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .banner-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .flame-icon {
          color: #ff6b1a;
          animation: flicker 1.5s ease-in-out infinite alternate;
        }

        @keyframes flicker {
          from { opacity: 0.8; transform: scale(1); }
          to { opacity: 1; transform: scale(1.1); }
        }

        .banner-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #ff6b1a;
          text-transform: uppercase;
        }

        .qualified-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #0a0a0f;
          background: #00e5ff;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .deadline-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #ffd700;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          padding: 4px 10px;
          border-radius: 20px;
        }

        .season-name {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin: 0 0 16px;
        }

        .sponsor-progress-section {
          margin-bottom: 20px;
        }

        .progress-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-label {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
        }

        .count-active {
          font-size: 18px;
          font-weight: 700;
          color: #ff6b1a;
        }

        .count-complete {
          font-size: 18px;
          font-weight: 700;
          color: #00e5ff;
        }

        .count-total {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
        }

        .progress-track {
          height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff6b1a, #ffd700);
          border-radius: 3px;
          transition: width 0.6s ease;
          box-shadow: 0 0 8px rgba(255, 107, 26, 0.6);
        }

        .sub-progress-row {
          display: flex;
          gap: 16px;
        }

        .sub-progress-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sub-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          white-space: nowrap;
        }

        .sub-track {
          flex: 1;
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }

        .sub-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .sub-fill-local { background: #00e5ff; }
        .sub-fill-major { background: #ffd700; }

        .sub-count {
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
        }

        .banner-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .banner-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }

        .banner-btn-primary {
          background: linear-gradient(135deg, #ff6b1a, #ff8c42);
          color: #fff;
        }

        .banner-btn-primary:hover {
          background: linear-gradient(135deg, #ff8c42, #ffaa66);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 26, 0.4);
        }

        .banner-btn-secondary {
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.3);
          color: #00e5ff;
        }

        .banner-btn-secondary:hover {
          background: rgba(0, 229, 255, 0.2);
          transform: translateY(-1px);
        }

        .banner-btn-ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.6);
        }

        .banner-btn-ghost:hover {
          border-color: rgba(255,255,255,0.3);
          color: #fff;
        }

        .banner-trophy-icon {
          position: absolute;
          right: 20px;
          bottom: 16px;
          color: rgba(255, 215, 0, 0.15);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default ContestBanner;
