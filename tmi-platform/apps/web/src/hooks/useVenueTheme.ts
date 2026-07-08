'use client';

/**
 * useVenueTheme — apply and persist a venue/dashboard color theme.
 *
 * Writes CSS custom properties to a scoped container ref (or to :root if no ref).
 * Persists the chosen theme ID to localStorage so it survives page reloads.
 *
 * Usage:
 *   const { themeId, setTheme, currentTheme } = useVenueTheme(containerRef);
 *
 *   // In JSX:
 *   <div ref={containerRef} style={{ colorScheme: 'dark' }}>
 *     ... all themed content uses var(--tmi-accent-1) etc. ...
 *   </div>
 *
 * CSS custom properties available after applying:
 *   --tmi-accent-1   primary neon color
 *   --tmi-accent-2   secondary neon color
 *   --tmi-accent-3   tertiary accent
 *   --tmi-bg-primary deep background
 *   --tmi-bg-surface card/panel background
 *   --tmi-bg-glass   frosted glass tint
 *   --tmi-glow       bloom glow color
 *   --tmi-text       primary text
 *   --tmi-text-muted muted text
 *   --tmi-border     border/separator
 */

import { useState, useEffect, useCallback, type RefObject } from 'react';
import {
  getTheme,
  themeToCSS,
  canUseTheme,
  type VenueThemePack,
} from '@/lib/themes/VenueThemeRegistry';

const STORAGE_KEY = 'tmi_venue_theme';
const DEFAULT_THEME_ID = 'tmi_default';

export interface UseVenueThemeReturn {
  themeId: string;
  currentTheme: VenueThemePack | undefined;
  setTheme: (id: string) => void;
  canApplyTheme: (id: string) => boolean;
}

export function useVenueTheme(
  containerRef?: RefObject<HTMLElement | null>,
  /** User's unlocked premium pack IDs from their profile */
  unlockedPacks: string[] = [],
  /** User's current membership tier (FREE/PRO/RUBY/SILVER/GOLD/PLATINUM/DIAMOND) */
  memberTier = 'FREE',
): UseVenueThemeReturn {
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME_ID;
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID;
  });

  const applyTheme = useCallback((id: string) => {
    const theme = getTheme(id);
    if (!theme) return;
    const props = themeToCSS(theme.colors);
    const target = containerRef?.current ?? document.documentElement;
    for (const [prop, value] of Object.entries(props)) {
      target.style.setProperty(prop, value);
    }
  }, [containerRef]);

  // Apply on mount and whenever themeId changes
  useEffect(() => {
    applyTheme(themeId);
  }, [themeId, applyTheme]);

  const setTheme = useCallback((id: string) => {
    const allowed = canUseTheme(id, unlockedPacks, memberTier);
    if (!allowed) return; // silently no-op — UI should gate this before calling
    setThemeId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, [unlockedPacks, memberTier]);

  const canApplyTheme = useCallback((id: string) => {
    return canUseTheme(id, unlockedPacks, memberTier);
  }, [unlockedPacks, memberTier]);

  return {
    themeId,
    currentTheme: getTheme(themeId),
    setTheme,
    canApplyTheme,
  };
}
