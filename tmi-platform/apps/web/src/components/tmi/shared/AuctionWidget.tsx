/**
 * AuctionWidget.tsx
 * Purpose: Beat/item auction HUD — live bidding, countdown, lot display, bid history.
 * Placement: apps/web/src/components/hud/AuctionWidget.tsx
 * Depends on: tmi-theme.css, Progress component
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface AuctionLot {
  id: string;
  title: string;
  type: 'BEAT' | 'FEATURE_SLOT' | 'COSMETIC' | 'NAMING_RIGHT' | 'EXPERIENCE';
  sellerName: string;
  sellerAvatarEmoji?: string;
  previewUrl?: string;   // audio preview or image
  genre?: string;
  bpm?: number;
  durationSeconds?: number;
  startingBidPoints: number;
  currentBidPoints: number;
  topBidderId?: string;
  topBidderName?: string;
  bidCount: number;
  endsAt: Date;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDING_SOON' | 'ENDED';
  prizeValue?: string;
}

interface BidHistoryEntry {
  bidderId: string;
  bidderName: string;
  bidderEmoji?: string;
  amount: number;
  timestamp: Date;
}

interface AuctionWidgetProps {
  lot: AuctionLot;
  currentUserId: string;
  userPointsBalance: number;
  bidHistory?: BidHistoryEntry[];
  onBid?: (lotId: string, amount: number) => void;
  onWatchPreview?: (lot: AuctionLot) => void;
  className?: string;
}

export const AuctionWidget: React.FC<AuctionWidgetProps> = ({
  lot,
  currentUserId,
  userPointsBalance,
  bidHistory = [],
  onBid,
  onWatchPreview,
  className = '',
}) => {
  const [countdown, setCountdown] = useState('');
  const [bidAmount, setBidAmount] = useState(lot.currentBidPoints + 50);
  const [isEndingSoon, setIsEndingSoon] = useState(false);
  const [justBid, setJustBid] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const update = () => {
      const ms = Math.max(0, lot.endsAt.getTime() - Date.now());
      const secs = Math.floor(ms / 1000);
      const mins = Math.floor(secs / 60);
      const hours = Math.floor(mins / 60);
      if (hours > 0) setCountdown(`${hours}h ${mins % 60}m`);
      else if (mins > 0) setCountdown(`${mins}m ${secs % 60}s`);
      else setCountdown(`${secs}s`);
      setIsEndingSoon(ms < 5 * 60 * 1000);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lot.endsAt]);

  const minBid = lot.currentBidPoints + 50;
  const isWinning = lot.topBidderId === currentUserId;
  const canAfford = userPointsBalance >= bidAmount;

  const handleBid = useCallback(() => {
    if (!canAfford || bidAmount < minBid) return;
    onBid?.(lot.id, bidAmount);
    setJustBid(true);
    setPulsing(true);
    setBidAmount(prev => prev + 50);
    setTimeout(() => setJustBid(false), 1500);
    setTimeout(() => setPulsing(false), 600);
  }, [canAfford, bidAmount, minBid, lot.id, onBid]);

  const GENRE_COLORS: Record<string, string> = {
    TRAP: '#FF2DAA', HIPHOP: '#FF2DAA', RNB: '#6B39FF', POP: '#22E7FF',
    AFROBEATS: '#00FFA8', DRILL: '#FFD700', DANCE: '#22E7FF', DEFAULT: '#FF2DAA',
  };
  const accentColor = GENRE_COLORS[lot.genre?.toUpperCase() ?? 'DEFAULT'] ?? GENRE_COLORS.DEFAULT;

  return (
    <>
      <style>{`
        .aw-root {
          background: linear-gradient(180deg, rgba(15,12,35,0.97) 0%, rgba(11,11,30,0.99) 100%);
          border: 1px solid rgba(255,215,0,0.2);
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          font-family: system-ui, sans-serif;
        }
        .aw-header {
          padding: 12px 14px 10px;
          background: linear-gradient(90deg, rgba(255,215,0,0.08) 0%, transparent 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .aw-type-badge {
          font-family: 'Courier New', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(255,215,0,0.12);
          color: #FFD700;
          border: 1px solid rgba(255,215,0,0.25);
        }
        .aw-countdown {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          font-weight: 700;
          color: var(--aw-accent);
          letter-spacing: 1px;
        }
        .aw-countdown--ending {
          animation: aw-blink 0.8s infinite;
          color: #FF2DAA;
        }
        .aw-lot-info {
          padding: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .aw-lot-title {
          font-size: 16px;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 4px;
        }
        .aw-lot-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .aw-meta-chip {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          padding: 2px 6px;
        }
        .aw-meta-chip--accent {
          color: var(--aw-accent);
          background: rgba(var(--aw-accent-rgb), 0.1);
        }
        .aw-seller {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 11px;
          color: rgba(255,255,255,0.6);
        }
        .aw-bid-section {
          padding: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .aw-current-bid {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 4px;
        }
        .aw-bid-label {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
        }
        .aw-bid-amount {
          font-family: 'Courier New', monospace;
          font-size: 26px;
          font-weight: 700;
          color: var(--aw-accent);
          letter-spacing: 1px;
          transition: all 0.2s;
        }
        .aw-bid-amount--pulse {
          animation: aw-score-flash 0.4s ease;
        }
        .aw-bid-pts {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }
        .aw-winning-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: #00FFA8;
          background: rgba(0,255,168,0.1);
          border: 1px solid rgba(0,255,168,0.3);
          border-radius: 4px;
          padding: 2px 8px;
          margin-top: 4px;
          animation: aw-pulse-green 2s infinite;
        }
        .aw-bid-count {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-top: 4px;
        }
        .aw-bid-input-row {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .aw-bid-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 8px 12px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #FFFFFF;
          outline: none;
          transition: border-color 0.2s;
        }
        .aw-bid-input:focus { border-color: var(--aw-accent); }
        .aw-bid-input::placeholder { color: rgba(255,255,255,0.25); }
        .aw-bid-btn {
          padding: 8px 16px;
          background: var(--aw-accent);
          border: none;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #0b0b1e;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .aw-bid-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
        .aw-bid-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .aw-bid-btn--just-bid {
          animation: aw-pop 0.4s ease;
        }
        .aw-balance {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          margin-top: 6px;
          display: flex;
          justify-content: space-between;
        }
        .aw-balance--low { color: #FF2DAA; }
        .aw-history {
          padding: 10px 14px 14px;
        }
        .aw-history-label {
          font-family: 'Courier New', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .aw-bid-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          transition: opacity 0.2s;
        }
        .aw-bid-row:first-child { color: rgba(255,255,255,0.9); }
        .aw-bid-row-amount {
          margin-left: auto;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          color: var(--aw-accent);
        }
        .aw-ended-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11,11,30,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          letter-spacing: 3px;
          text-transform: uppercase;
          border-radius: 12px;
        }
        @keyframes aw-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes aw-pop { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes aw-score-flash { 0% { transform: scale(1); } 30% { transform: scale(1.15); color: #FFFFFF; } 100% { transform: scale(1); } }
        @keyframes aw-pulse-green { 0%,100% { box-shadow: 0 0 0 rgba(0,255,168,0); } 50% { box-shadow: 0 0 8px rgba(0,255,168,0.3); } }
      `}</style>

      <div
        className={`aw-root ${className}`}
        style={{
          '--aw-accent': accentColor,
          position: 'relative',
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className="aw-header">
          <div className="aw-type-badge">
            {LOT_TYPE_ICONS[lot.type]} {lot.type.replace('_', ' ')}
          </div>
          <div className={`aw-countdown ${isEndingSoon ? 'aw-countdown--ending' : ''}`}>
            {lot.status === 'ENDED' ? 'ENDED' : `⏱ ${countdown}`}
          </div>
        </div>

        {/* Lot Info */}
        <div className="aw-lot-info">
          <div className="aw-lot-title">{lot.title}</div>
          <div className="aw-lot-meta">
            {lot.genre && <span className="aw-meta-chip aw-meta-chip--accent">{lot.genre}</span>}
            {lot.bpm && <span className="aw-meta-chip">{lot.bpm} BPM</span>}
            {lot.durationSeconds && <span className="aw-meta-chip">{Math.floor(lot.durationSeconds / 60)}:{String(lot.durationSeconds % 60).padStart(2, '0')}</span>}
          </div>
          <div className="aw-seller">
            <span>{lot.sellerAvatarEmoji ?? '🎤'}</span>
            <span>by {lot.sellerName}</span>
            {onWatchPreview && lot.previewUrl && (
              <span
                onClick={() => onWatchPreview(lot)}
                style={{ marginLeft: 'auto', color: accentColor, cursor: 'pointer', fontSize: 10, fontFamily: 'Courier New', letterSpacing: 1 }}
              >
                ▶ PREVIEW
              </span>
            )}
          </div>
        </div>

        {/* Bid Section */}
        <div className="aw-bid-section">
          <div className="aw-bid-label">Current Bid</div>
          <div className="aw-current-bid">
            <div className={`aw-bid-amount ${pulsing ? 'aw-bid-amount--pulse' : ''}`}>
              {lot.currentBidPoints.toLocaleString()}
            </div>
            <div className="aw-bid-pts">pts</div>
          </div>

          {isWinning && (
            <div className="aw-winning-badge">✓ YOU'RE WINNING</div>
          )}

          <div className="aw-bid-count">{lot.bidCount} bid{lot.bidCount !== 1 ? 's' : ''}</div>

          {lot.status !== 'ENDED' && (
            <>
              <div className="aw-bid-input-row">
                <input
                  className="aw-bid-input"
                  type="number"
                  value={bidAmount}
                  min={minBid}
                  step={50}
                  onChange={e => setBidAmount(Number(e.target.value))}
                  placeholder={`Min ${minBid}`}
                />
                <button
                  className={`aw-bid-btn ${justBid ? 'aw-bid-btn--just-bid' : ''}`}
                  onClick={handleBid}
                  disabled={!canAfford || bidAmount < minBid}
                >
                  {justBid ? '✓ BID PLACED' : '⚡ BID NOW'}
                </button>
              </div>
              <div className={`aw-balance ${userPointsBalance < minBid ? 'aw-balance--low' : ''}`}>
                <span>Your balance: {userPointsBalance.toLocaleString()} pts</span>
                <span>Min: {minBid.toLocaleString()} pts</span>
              </div>
            </>
          )}
        </div>

        {/* Bid History */}
        {bidHistory.length > 0 && (
          <div className="aw-history">
            <div className="aw-history-label">Bid History</div>
            {bidHistory.slice(0, 5).map((b, i) => (
              <div key={i} className="aw-bid-row">
                <span>{b.bidderEmoji ?? '👤'}</span>
                <span>{b.bidderName}</span>
                <span className="aw-bid-row-amount">{b.amount.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        )}

        {lot.status === 'ENDED' && (
          <div className="aw-ended-overlay">AUCTION CLOSED</div>
        )}
      </div>
    </>
  );
};

const LOT_TYPE_ICONS: Record<AuctionLot['type'], string> = {
  BEAT: '🎹',
  FEATURE_SLOT: '🎤',
  COSMETIC: '✨',
  NAMING_RIGHT: '🏷️',
  EXPERIENCE: '🌟',
};

export default AuctionWidget;
