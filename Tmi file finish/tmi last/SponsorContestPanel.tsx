/**
 * SponsorContestPanel.tsx
 * Repo: apps/web/src/components/sponsor/SponsorContestPanel.tsx
 * Purpose: Sponsor's view of all contests they've backed + active invitations
 */
'use client';
import { useState } from 'react';
import { Trophy, Star, TrendingUp, Eye, ChevronRight, CheckCircle, Clock } from 'lucide-react';

interface SponsoredEntry {
  id: string;
  artistName: string;
  artistAvatar?: string;
  category: string;
  packageLabel: string;
  packageType: 'local' | 'major';
  amount: number;
  status: 'invited' | 'pending_payment' | 'verified' | 'rejected';
  entryStatus: string;
  profileViews: number;
  stageMentions: number;
}

interface SponsorContestPanelProps {
  sponsorId: string;
  sponsorName: string;
  sponsoredEntries?: SponsoredEntry[];
  totalInvested?: number;
  totalReach?: number;
  onViewEntry?: (entryId: string) => void;
  onBrowseArtists?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  invited: '#ffd700',
  pending_payment: '#ff6b1a',
  verified: '#00e5ff',
  rejected: '#ff5252',
};

const STATUS_LABELS: Record<string, string> = {
  invited: 'Invited',
  pending_payment: 'Awaiting Payment',
  verified: '✓ Verified',
  rejected: 'Rejected',
};

export function SponsorContestPanel({
  sponsorId,
  sponsorName,
  sponsoredEntries = [],
  totalInvested = 0,
  totalReach = 0,
  onViewEntry,
  onBrowseArtists,
}: SponsorContestPanelProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'all'>('active');

  const filtered = sponsoredEntries.filter(e => {
    if (activeTab === 'active') return e.status === 'verified';
    if (activeTab === 'pending') return ['invited', 'pending_payment'].includes(e.status);
    return true;
  });

  return (
    <div className="sponsor-panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Contest Sponsorships</h3>
          <p className="panel-sub">Your active and pending artist sponsorships</p>
        </div>
        <button className="browse-btn" onClick={onBrowseArtists}>
          Browse Artists <ChevronRight size={14} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="stats-strip">
        <div className="stat-box">
          <span className="stat-val">{sponsoredEntries.filter(e => e.status === 'verified').length}</span>
          <span className="stat-lbl">Active Sponsorships</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">${totalInvested.toLocaleString()}</span>
          <span className="stat-lbl">Total Invested</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{totalReach.toLocaleString()}</span>
          <span className="stat-lbl">Est. Reach</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{sponsoredEntries.reduce((a, e) => a + e.stageMentions, 0)}</span>
          <span className="stat-lbl">Stage Mentions</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['active', 'pending', 'all'] as const).map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'tab-on' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="tab-count">
              {t === 'active' ? sponsoredEntries.filter(e => e.status === 'verified').length
                : t === 'pending' ? sponsoredEntries.filter(e => ['invited','pending_payment'].includes(e.status)).length
                : sponsoredEntries.length}
            </span>
          </button>
        ))}
      </div>

      {/* Entry list */}
      <div className="entry-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Trophy size={32} className="empty-icon" />
            <p>No {activeTab} sponsorships yet.</p>
            <button className="browse-btn-sm" onClick={onBrowseArtists}>Find Artists to Sponsor</button>
          </div>
        ) : filtered.map(entry => (
          <div key={entry.id} className="entry-card">
            <div className="entry-avatar">
              {entry.artistAvatar ? <img src={entry.artistAvatar} alt={entry.artistName} /> : <span>{entry.artistName[0]}</span>}
            </div>
            <div className="entry-info">
              <div className="entry-top">
                <span className="entry-name">{entry.artistName}</span>
                <span className="entry-status" style={{ color: STATUS_COLORS[entry.status] }}>
                  {STATUS_LABELS[entry.status]}
                </span>
              </div>
              <div className="entry-meta">
                <span className="meta-chip">{entry.category}</span>
                <span className="meta-chip pkg-chip">{entry.packageLabel}</span>
                <span className="meta-chip amount-chip">${entry.amount.toLocaleString()}</span>
              </div>
              <div className="entry-stats">
                <span><Eye size={11} /> {entry.profileViews} views</span>
                <span><Star size={11} /> {entry.stageMentions} mentions</span>
              </div>
            </div>
            <button className="view-btn" onClick={() => onViewEntry?.(entry.id)}>
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .sponsor-panel { background: #0d1117; border: 1px solid rgba(255,107,26,.2); border-radius: 12px; padding: 24px; color: #fff; }
        .panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .panel-title { font-size: 18px; font-weight: 700; color: #ff6b1a; margin: 0 0 4px; }
        .panel-sub { font-size: 13px; color: rgba(255,255,255,.4); margin: 0; }
        .browse-btn { display: flex; align-items: center; gap: 4px; padding: 8px 14px; background: rgba(0,229,255,.08); border: 1px solid rgba(0,229,255,.3); border-radius: 8px; color: #00e5ff; font-size: 13px; cursor: pointer; }
        .stats-strip { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
        .stat-box { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: 14px; text-align: center; }
        .stat-val { display: block; font-size: 22px; font-weight: 800; color: #ff6b1a; }
        .stat-lbl { font-size: 11px; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .06em; }
        .tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .tab { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; color: rgba(255,255,255,.5); font-size: 13px; cursor: pointer; transition: all .2s; }
        .tab-on { background: rgba(255,107,26,.1); border-color: rgba(255,107,26,.4); color: #ff6b1a; }
        .tab-count { background: rgba(255,255,255,.08); padding: 1px 6px; border-radius: 10px; font-size: 11px; }
        .entry-list { display: flex; flex-direction: column; gap: 10px; }
        .empty-state { text-align: center; padding: 40px 20px; color: rgba(255,255,255,.3); }
        .empty-icon { margin: 0 auto 12px; opacity: .3; display: block; }
        .entry-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 10px; transition: border-color .2s; }
        .entry-card:hover { border-color: rgba(255,107,26,.3); }
        .entry-avatar { width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; overflow: hidden; flex-shrink: 0; }
        .entry-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .entry-info { flex: 1; }
        .entry-top { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .entry-name { font-size: 14px; font-weight: 600; }
        .entry-status { font-size: 12px; font-weight: 600; }
        .entry-meta { display: flex; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
        .meta-chip { font-size: 10px; padding: 2px 8px; background: rgba(255,255,255,.06); border-radius: 10px; color: rgba(255,255,255,.6); }
        .pkg-chip { color: #ffd700; }
        .amount-chip { color: #00e5ff; }
        .entry-stats { display: flex; gap: 12px; font-size: 11px; color: rgba(255,255,255,.35); }
        .entry-stats span { display: flex; align-items: center; gap: 4px; }
        .view-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,.1); background: transparent; color: rgba(255,255,255,.4); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .browse-btn-sm { margin-top: 12px; padding: 8px 16px; background: rgba(255,107,26,.1); border: 1px solid rgba(255,107,26,.3); border-radius: 8px; color: #ff6b1a; font-size: 13px; cursor: pointer; }
      `}</style>
    </div>
  );
}
export default SponsorContestPanel;
