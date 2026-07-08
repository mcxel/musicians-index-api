'use client';

/**
 * MagazineThemeProvider
 *
 * Injects ThemeManifest CSS variables into a container div.
 * All child components read `var(--tmi-mag-*)` — they never know which theme is active.
 *
 * Usage:
 *   <MagazineThemeProvider theme={resolvedTheme}>
 *     <TieredArticleGallery ... />
 *     <ArticleBody ... />
 *   </MagazineThemeProvider>
 *
 * Theme switching = swap the `theme` prop → CSS variables update → instant visual change.
 * No re-render of child DOM nodes. Pure CSS cascade.
 */

import type React from 'react';
import { manifestToCssVars } from '@/lib/theme/MagazineThemeEngine';
import type { ThemeManifest } from '@/lib/theme/ThemeRegistry';

interface Props {
  theme: ThemeManifest;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function MagazineThemeProvider({ theme, children, className, style }: Props) {
  const vars = manifestToCssVars(theme) as React.CSSProperties;

  return (
    <div
      className={className}
      data-tmi-theme={theme.id}
      data-tmi-era={theme.era}
      data-tmi-mood={theme.mood}
      style={{
        // Inject all CSS custom properties for this theme
        ...vars,
        // Allow callers to pass additional style overrides
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Hook form — returns the CSS vars object so components can apply
 * them themselves when they can't be wrapped by MagazineThemeProvider.
 */
export function useMagazineThemeVars(theme: ThemeManifest): React.CSSProperties {
  return manifestToCssVars(theme) as React.CSSProperties;
}
