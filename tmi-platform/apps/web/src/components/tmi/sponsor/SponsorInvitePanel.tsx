/**
 * SponsorInvitePanel.tsx
 * TMI Grand Platform Contest — Sponsor Invitation System
 * BerntoutGlobal XXL
 *
 * Repo path: apps/web/src/components/contest/SponsorInvitePanel.tsx
 * Dependencies: SponsorArtistCard, SponsorPackageTierCard
 * Wiring: Connect to /api/contest/invite-sponsor endpoint
 */

'use client';
import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';
import { useState } from 'react';
import { Search, Star, Users, Send, ChevronDown, CheckCircle } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  type: 'local' | 'major';
  category: string;
  logo?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'title';
}

interface SponsorInvitePanelProps {
  artistId: string;
  artistName: string;
  contestEntryId: string;
  availableSponsors?: Sponsor[];
  onSendInvite?: (sponsorId: string, packageTier: string, message: string) => Promise<void>;
}

const SPONSOR_PACKAGES = [
  { id: 'local-bronze', label: 'Local Bronze', price: '$50', type: 'local', description: 'Name on profile' },
  { id: 'local-silver', label: 'Local Silver', price: '$100', type: 'local', description: 'Name + logo on profile' },
  { id: 'local-gold', label: 'Local Gold', price: '$250', type: 'local', description: 'Logo + stage mention' },
  { id: 'major-bronze', label: 'Major Bronze', price: '$1,000', type: 'major', description: 'Logo + profile placement' },
  { id: 'major-silver', label: 'Major Silver', price: '$5,000', type: 'major', description: 'Logo + stage overlay + analytics' },
  { id: 'major-gold', label: 'Major Gold', price: '$10,000', type: 'major', description: 'Priority mention + all surfaces' },
  { id: 'title', label: 'Title Sponsor', price: '$25,000+', type: 'major', description: 'Full naming rights + exclusive overlays' },
];

export function SponsorInvitePanel({
  artistId,
  artistName,
  contestEntryId,
  availableSponsors = [],
  onSendInvite,
}: SponsorInvitePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'major'>('local');

  const filteredSponsors = availableSponsors.filter(
    (s) =>
      s.type === activeTab &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const availablePackages = SPONSOR_PACKAGES.filter(
    (p) => activeTab === 'major' ? p.type === 'major' : p.type === 'local'
  );

  const handleSend = async () => {
    if (!selectedSponsor || !selectedPackage) return;
    setSending(true);
    try {
      await onSendInvite?.(selectedSponsor.id, selectedPackage, message);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setSelectedSponsor(null);
        setSelectedPackage('');
        setMessage('');
      }, 2500);
    } finally {
      setSending(false);
    }
  };

  const defaultMessage = selectedSponsor
    ? `Hi! I'm ${artistName} and I'm competing in the BerntoutGlobal Grand Platform Contest. I'd love to have ${selectedSponsor.name} as one of my official sponsors! Your brand will be featured on my profile and during live performances. Let's connect!`
    : '';

  return (
    <div className="invite-panel">
      <div className="panel-header">
        <h3 className="panel-title">Invite a Sponsor</h3>
        <p className="panel-subtitle">Search and invite sponsors to back your contest entry</p>
      </div>

      {/* Type tabs */}
      <div className="type-tabs">
        <button
          className={`type-tab ${activeTab === 'local' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('local')}
        >
          <Users size={14} />
          Local Sponsors
          <span className="tab-required">Need 10</span>
        </button>
        <button
          className={`type-tab ${activeTab === 'major' ? 'tab-active-major' : ''}`}
          onClick={() => setActiveTab('major')}
        >
          <Star size={14} />
          Major Sponsors
          <span className="tab-required">Need 10</span>
        </button>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${activeTab} sponsors...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Sponsor list */}
      <div className="sponsor-list">
        {filteredSponsors.length === 0 ? (
          <div className="empty-state">No {activeTab} sponsors found on platform</div>
        ) : (
          filteredSponsors.map((sponsor) => (
            <button
              key={sponsor.id}
              className={`sponsor-card ${selectedSponsor?.id === sponsor.id ? 'sponsor-selected' : ''}`}
              onClick={() => setSelectedSponsor(sponsor)}
            >
              <div className="sponsor-avatar">
                {sponsor.logo ? (
                  <ImageSlotWrapper imageId="img-d7zfr" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
                ) : (
                  <span>{sponsor.name[0]}</span>
                )}
              </div>
              <div className="sponsor-info">
                <span className="sponsor-name">{sponsor.name}</span>
                <span className="sponsor-category">{sponsor.category}</span>
              </div>
              {selectedSponsor?.id === sponsor.id && (
                <CheckCircle size={16} className="check-icon" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Package selector */}
      {selectedSponsor && (
        <div className="package-section">
          <label className="field-label">Select Sponsor Package</label>
          <div className="package-grid">
            {availablePackages.map((pkg) => (
              <button
                key={pkg.id}
                className={`package-card ${selectedPackage === pkg.id ? 'package-selected' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <span className="pkg-label">{pkg.label}</span>
                <span className="pkg-price">{pkg.price}</span>
                <span className="pkg-desc">{pkg.description}</span>
              </button>
            ))}
          </div>

          {/* Message */}
          <label className="field-label">Personalize Your Message</label>
          <textarea
            className="message-textarea"
            value={message || defaultMessage}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Write a personal message to this sponsor..."
          />

          {/* Send button */}
          <button
            className={`send-btn ${sent ? 'send-btn-sent' : ''}`}
            onClick={handleSend}
            disabled={sending || sent || !selectedPackage}
          >
            {sent ? (
              <>
                <CheckCircle size={16} />
                Request Sent!
              </>
            ) : sending ? (
              'Sending...'
            ) : (
              <>
                <Send size={16} />
                Send Sponsorship Request
              </>
            )}
          </button>
        </div>
      )}

      <style jsx>{`
        .invite-panel {
          background: #0d1117;
          border: 1px solid rgba(255, 107, 26, 0.2);
          border-radius: 12px;
          padding: 24px;
          color: #fff;
        }

        .panel-header { margin-bottom: 20px; }
        .panel-title {
          font-size: 18px;
          font-weight: 700;
          color: #ff6b1a;
          margin: 0 0 4px;
        }
        .panel-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        .type-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .type-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-active {
          background: rgba(0, 229, 255, 0.1);
          border-color: rgba(0, 229, 255, 0.4);
          color: #00e5ff;
        }

        .tab-active-major {
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.4);
          color: #ffd700;
        }

        .tab-required {
          font-size: 10px;
          opacity: 0.6;
          background: rgba(255,255,255,0.05);
          padding: 2px 6px;
          border-radius: 10px;
        }

        .search-wrap {
          position: relative;
          margin-bottom: 12px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.3);
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          box-sizing: border-box;
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(255, 107, 26, 0.4);
        }

        .sponsor-list {
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .empty-state {
          text-align: center;
          color: rgba(255,255,255,0.3);
          font-size: 13px;
          padding: 24px;
        }

        .sponsor-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          color: #fff;
        }

        .sponsor-selected {
          border-color: rgba(255, 107, 26, 0.5);
          background: rgba(255, 107, 26, 0.08);
        }

        .sponsor-avatar {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .sponsor-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .sponsor-name { font-size: 13px; font-weight: 600; }
        .sponsor-category { font-size: 11px; color: rgba(255,255,255,0.4); }
        .check-icon { color: #ff6b1a; margin-left: auto; }

        .package-section { margin-top: 8px; }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .package-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
          margin-bottom: 20px;
        }

        .package-card {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          color: #fff;
        }

        .package-selected {
          border-color: rgba(255, 107, 26, 0.5);
          background: rgba(255, 107, 26, 0.1);
        }

        .pkg-label { font-size: 12px; font-weight: 600; }
        .pkg-price { font-size: 14px; font-weight: 700; color: #ffd700; }
        .pkg-desc { font-size: 10px; color: rgba(255,255,255,0.4); }

        .message-textarea {
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
          box-sizing: border-box;
          margin-bottom: 16px;
          font-family: inherit;
        }

        .message-textarea:focus {
          outline: none;
          border-color: rgba(255, 107, 26, 0.4);
        }

        .send-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #ff6b1a, #ff8c42);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 107, 26, 0.4);
        }

        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .send-btn-sent {
          background: linear-gradient(135deg, #00c853, #00e676);
        }
      `}</style>
    </div>
  );
}

export default SponsorInvitePanel;
