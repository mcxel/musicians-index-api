/**
 * PlayWidget.tsx
 * Purpose: Live event play widget — emote slots, icons, reactions, loadout by tier.
 * Placement: apps/web/src/components/hud/PlayWidget.tsx
 * Depends on: TierEngine, InventoryEngine, tmi-theme.css
 */

import React, { useState, useCallback, useRef } from 'react';

type Tier = 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

interface EmoteItem {
  id: string;
  name: string;
  iconUrl: string;
  animationUrl?: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
}

interface PlayWidgetProps {
  tier: Tier;
  equippedEmotes: (EmoteItem | null)[];
  equippedIcons: (EmoteItem | null)[];
  onEmoteSend?: (emote: EmoteItem) => void;
  onIconActivate?: (icon: EmoteItem) => void;
  onOpenInventory?: () => void;
  isLive?: boolean;
  className?: string;
}

const TIER_EMOTE_SLOTS: Record<Tier, number> = {
  FREE: 4, BRONZE: 4, SILVER: 5, GOLD: 6, DIAMOND: 6,
};

const TIER_ICON_SLOTS: Record<Tier, number> = {
  FREE: 4, BRONZE: 4, SILVER: 5, GOLD: 6, DIAMOND: 6,
};

const RARITY_GLOW: Record<string, string> = {
  COMMON: 'none',
  RARE: '0 0 6px #22E7FF',
  EPIC: '0 0 8px #6B39FF',
  LEGENDARY: '0 0 12px #FFD700',
  MYTHIC: '0 0 16px #FF2DAA, 0 0 32px #FF2DAA',
};

const RARITY_COLOR: Record<string, string> = {
  COMMON: '#AAAAAA', RARE: '#22E7FF', EPIC: '#6B39FF', LEGENDARY: '#FFD700', MYTHIC: '#FF2DAA',
};

export const PlayWidget: React.FC<PlayWidgetProps> = ({
  tier,
  equippedEmotes,
  equippedIcons,
  onEmoteSend,
  onIconActivate,
  onOpenInventory,
  isLive = true,
  className = '',
}) => {
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({});
  const [activeEmote, setActiveEmote] = useState<string | null>(null);
  const [floatingEmotes, setFloatingEmotes] = useState<Array<{ id: string; x: number; emote: EmoteItem }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const emoteSlots = TIER_EMOTE_SLOTS[tier];
  const iconSlots = TIER_ICON_SLOTS[tier];
  const emotes = equippedEmotes.slice(0, emoteSlots);
  const icons = equippedIcons.slice(0, iconSlots);

  const handleEmote = useCallback((emote: EmoteItem) => {
    if (cooldowns[emote.id] || !isLive) return;

    // Trigger cooldown (1s)
    setCooldowns(prev => ({ ...prev, [emote.id]: true }));
    setTimeout(() => setCooldowns(prev => ({ ...prev, [emote.id]: false })), 1000);

    // Floating emote animation
    const x = 20 + Math.random() * 60;
    const floatId = `${emote.id}_${Date.now()}`;
    setFloatingEmotes(prev => [...prev, { id: floatId, x, emote }]);
    setTimeout(() => setFloatingEmotes(prev => prev.filter(f => f.id !== floatId)), 2500);

    setActiveEmote(emote.id);
    setTimeout(() => setActiveEmote(null), 300);

    onEmoteSend?.(emote);
  }, [cooldowns, isLive, onEmoteSend]);

  const handleIcon = useCallback((icon: EmoteItem) => {
    if (!isLive) return;
    onIconActivate?.(icon);
  }, [isLive, onIconActivate]);

  return (
    <>
      <style>{`
        .pw-root {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: linear-gradient(180deg, rgba(15,12,35,0.95) 0%, rgba(11,11,30,0.98) 100%);
          border: 1px solid rgba(255,45,170,0.25);
          border-radius: 12px;
          backdrop-filter: blur(12px);
          user-select: none;
        }
        .pw-label {
          font-family: 'Courier New', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 2px;
        }
        .pw-slots {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .pw-slot {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .pw-slot:hover:not(.pw-slot--empty):not(.pw-slot--cooldown) {
          transform: translateY(-2px) scale(1.05);
          border-color: rgba(255,45,170,0.6);
        }
        .pw-slot:active:not(.pw-slot--empty):not(.pw-slot--cooldown) {
          transform: scale(0.95);
        }
        .pw-slot--active {
          animation: pw-pop 0.3s ease forwards;
        }
        .pw-slot--cooldown {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pw-slot--empty {
          border-style: dashed;
          cursor: default;
          opacity: 0.4;
        }
        .pw-slot-icon {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }
        .pw-slot-emoji {
          font-size: 24px;
          line-height: 1;
        }
        .pw-rarity-dot {
          position: absolute;
          bottom: 3px;
          right: 3px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
        .pw-cooldown-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          border-radius: 8px;
        }
        .pw-floating-container {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          height: 200px;
          pointer-events: none;
          overflow: hidden;
        }
        .pw-floating-emote {
          position: absolute;
          bottom: 0;
          font-size: 28px;
          animation: pw-float-up 2.5s ease-out forwards;
        }
        .pw-divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 2px 0;
        }
        .pw-inventory-btn {
          width: 100%;
          padding: 6px;
          background: rgba(255,45,170,0.1);
          border: 1px solid rgba(255,45,170,0.25);
          border-radius: 8px;
          color: #FF2DAA;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }
        .pw-inventory-btn:hover {
          background: rgba(255,45,170,0.2);
          border-color: rgba(255,45,170,0.5);
        }
        .pw-tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: 'Courier New', monospace;
          font-size: 9px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--tier-color);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 2px 6px;
        }
        .pw-offline {
          opacity: 0.5;
          pointer-events: none;
        }
        @keyframes pw-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes pw-float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(-180px) scale(0.7); opacity: 0; }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`pw-root ${!isLive ? 'pw-offline' : ''} ${className}`}
        style={{ '--tier-color': TIER_BADGE_COLORS[tier] } as React.CSSProperties}
      >
        {/* Floating emotes */}
        <div className="pw-floating-container">
          {floatingEmotes.map(f => (
            <div key={f.id} className="pw-floating-emote" style={{ left: `${f.x}%` }}>
              {f.emote.iconUrl.startsWith('http') ? '💃' : f.emote.iconUrl}
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="pw-label">Play Widget</div>
          <div className="pw-tier-badge">
            {TIER_EMOJIS[tier]} {tier}
          </div>
        </div>

        {/* Emote Slots */}
        <div>
          <div className="pw-label">Emotes</div>
          <div className="pw-slots">
            {Array.from({ length: emoteSlots }).map((_, idx) => {
              const emote = emotes[idx];
              const isCooldown = emote ? cooldowns[emote.id] : false;
              const isActive = emote?.id === activeEmote;
              return (
                <div
                  key={idx}
                  className={`pw-slot ${!emote ? 'pw-slot--empty' : ''} ${isCooldown ? 'pw-slot--cooldown' : ''} ${isActive ? 'pw-slot--active' : ''}`}
                  style={{
                    boxShadow: emote ? RARITY_GLOW[emote.rarity] : 'none',
                    borderColor: emote ? `${RARITY_COLOR[emote.rarity]}44` : undefined,
                  }}
                  onClick={() => emote && handleEmote(emote)}
                  title={emote?.name ?? 'Empty Slot'}
                >
                  {emote ? (
                    <>
                      <span className="pw-slot-emoji">{EMOTE_FALLBACK_ICONS[emote.id] ?? '✨'}</span>
                      <div
                        className="pw-rarity-dot"
                        style={{ background: RARITY_COLOR[emote.rarity] }}
                      />
                      {isCooldown && <div className="pw-cooldown-overlay" />}
                    </>
                  ) : (
                    <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.15)' }}>+</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pw-divider" />

        {/* Icon Slots */}
        <div>
          <div className="pw-label">Icons</div>
          <div className="pw-slots">
            {Array.from({ length: iconSlots }).map((_, idx) => {
              const icon = icons[idx];
              return (
                <div
                  key={idx}
                  className={`pw-slot ${!icon ? 'pw-slot--empty' : ''}`}
                  style={{
                    boxShadow: icon ? RARITY_GLOW[icon.rarity] : 'none',
                    borderColor: icon ? `${RARITY_COLOR[icon.rarity]}44` : undefined,
                  }}
                  onClick={() => icon && handleIcon(icon)}
                  title={icon?.name ?? 'Empty Slot'}
                >
                  {icon ? (
                    <>
                      <span className="pw-slot-emoji">{ICON_FALLBACK[icon.id] ?? '⭐'}</span>
                      <div className="pw-rarity-dot" style={{ background: RARITY_COLOR[icon.rarity] }} />
                    </>
                  ) : (
                    <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.15)' }}>+</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Button */}
        {onOpenInventory && (
          <button className="pw-inventory-btn" onClick={onOpenInventory}>
            ⚙ Customize Loadout
          </button>
        )}

        {!isLive && (
          <div style={{
            textAlign: 'center',
            fontFamily: 'Courier New, monospace',
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '1px',
          }}>
            WIDGET ACTIVE DURING LIVE EVENTS
          </div>
        )}
      </div>
    </>
  );
};

// Fallback emoji icons for demo
const TIER_BADGE_COLORS: Record<Tier, string> = {
  FREE: '#AAAAAA', BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700', DIAMOND: '#22E7FF',
};
const TIER_EMOJIS: Record<Tier, string> = {
  FREE: '⚪', BRONZE: '🥉', SILVER: '🥈', GOLD: '🥇', DIAMOND: '💎',
};
const EMOTE_FALLBACK_ICONS: Record<string, string> = {
  emote_clap: '👏', emote_heart: '❤️', emote_fire: '🔥', emote_wave: '👋',
  emote_dance1: '🕺', emote_dance2: '💃', emote_confetti: '🎊', emote_crowd: '🙌', emote_throne: '👑',
};
const ICON_FALLBACK: Record<string, string> = {
  icon_star: '⭐', icon_lightning: '⚡', icon_crown: '👑', icon_mic: '🎤', icon_trophy: '🏆',
};

export default PlayWidget;
