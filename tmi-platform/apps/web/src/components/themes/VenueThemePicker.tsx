'use client';

/**
 * VenueThemePicker — compact swatch grid for venue/dashboard color theme selection.
 *
 * Shows free themes first, then tier-unlocked, then premium.
 * Locked themes display a lock indicator; clicking them opens the store.
 *
 * Usage (Broadcast Control Deck, Dashboard Settings):
 *   <VenueThemePicker
 *     currentThemeId={themeId}
 *     unlockedPacks={user.unlockedThemePacks}
 *     memberTier={user.tier}
 *     onSelect={(id) => setTheme(id)}
 *     onBuy={(id) => router.push('/store/themes')}
 *   />
 */

import { motion } from 'framer-motion';
import {
  VENUE_THEME_REGISTRY,
  canUseTheme,
  type VenueThemePack,
} from '@/lib/themes/VenueThemeRegistry';

export interface VenueThemePickerProps {
  currentThemeId: string;
  unlockedPacks?: string[];
  memberTier?: string;
  onSelect: (id: string) => void;
  /** Called when user taps a locked premium theme — show the store */
  onBuy?: (themeId: string) => void;
  /** Compact mode: smaller swatches for sidebar use */
  compact?: boolean;
}

const TIER_LABEL: Record<string, string> = {
  tier_silver:   'Silver',
  tier_gold:     'Gold',
  tier_platinum: 'Platinum',
  tier_diamond:  'Diamond',
};

export default function VenueThemePicker({
  currentThemeId,
  unlockedPacks = [],
  memberTier = 'FREE',
  onSelect,
  onBuy,
  compact = false,
}: VenueThemePickerProps) {
  const swatchSize = compact ? 48 : 64;
  const swatchRadius = compact ? 8 : 10;

  function handleClick(theme: VenueThemePack) {
    const allowed = canUseTheme(theme.id, unlockedPacks, memberTier);
    if (allowed) {
      onSelect(theme.id);
    } else if (theme.tier === 'premium') {
      onBuy?.(theme.id);
    }
  }

  function getGroupLabel(tier: string): string {
    if (tier === 'free') return 'Free';
    if (tier === 'premium') return 'Premium';
    return `${TIER_LABEL[tier] ?? tier} Tier`;
  }

  // Group themes by tier category for section headers
  const groups: Array<{ label: string; themes: VenueThemePack[] }> = [
    { label: 'Free',     themes: VENUE_THEME_REGISTRY.filter(t => t.tier === 'free') },
    { label: 'Tier',     themes: VENUE_THEME_REGISTRY.filter(t => t.tier.startsWith('tier_')) },
    { label: 'Premium',  themes: VENUE_THEME_REGISTRY.filter(t => t.tier === 'premium') },
  ].filter(g => g.themes.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 18 }}>
      {groups.map(group => (
        <div key={group.label}>
          {/* Section header */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--tmi-text-muted, #8899aa)',
              marginBottom: compact ? 6 : 8,
            }}
          >
            {group.label === 'Tier' ? 'Tier Rewards' : group.label}
          </div>

          {/* Swatches */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: compact ? 6 : 8,
            }}
          >
            {group.themes.map(theme => {
              const isSelected = theme.id === currentThemeId;
              const isUnlocked = canUseTheme(theme.id, unlockedPacks, memberTier);

              return (
                <motion.button
                  key={theme.id}
                  type="button"
                  title={`${theme.name}${theme.price ? ` — $${theme.price.toFixed(2)}` : !isUnlocked ? ` — Unlock at ${getGroupLabel(theme.tier)}` : ''}`}
                  onClick={() => handleClick(theme)}
                  whileTap={isUnlocked ? { scale: 0.92 } : undefined}
                  style={{
                    position: 'relative',
                    width: swatchSize,
                    height: swatchSize,
                    borderRadius: swatchRadius,
                    background: theme.swatch,
                    border: isSelected
                      ? `2px solid ${theme.colors.accent1}`
                      : '2px solid transparent',
                    outline: isSelected
                      ? `1px solid ${theme.colors.accent1}44`
                      : 'none',
                    boxShadow: isSelected
                      ? `0 0 12px ${theme.colors.glow}66, 0 0 4px ${theme.colors.glow}33`
                      : 'none',
                    cursor: isUnlocked ? 'pointer' : 'pointer',
                    opacity: isUnlocked ? 1 : 0.55,
                    transition: 'border-color 0.2s, box-shadow 0.2s, opacity 0.2s',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: compact ? 14 : 18,
                      }}
                    >
                      ✓
                    </div>
                  )}

                  {/* Lock indicator for non-free locked themes */}
                  {!isUnlocked && !isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: compact ? 12 : 14,
                        background: 'rgba(0,0,0,0.35)',
                      }}
                    >
                      {theme.tier === 'premium' ? '🛒' : '🔒'}
                    </div>
                  )}

                  {/* Price tag for premium */}
                  {theme.tier === 'premium' && theme.price && !isUnlocked && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 3,
                        fontSize: 8,
                        fontWeight: 700,
                        color: '#ffffff',
                        background: 'rgba(0,0,0,0.7)',
                        borderRadius: 3,
                        padding: '1px 3px',
                        lineHeight: 1.2,
                      }}
                    >
                      ${theme.price.toFixed(2)}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Premium upgrade CTA */}
          {group.label === 'Premium' && (
            <div
              style={{
                fontSize: 10,
                color: 'var(--tmi-text-muted, #8899aa)',
                marginTop: 6,
              }}
            >
              Purchase premium packs from the Store
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
