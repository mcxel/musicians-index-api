/**
 * TMI Design System — Typography
 *
 * Four-tier typography system for a futuristic entertainment network.
 *
 * Tier 1 — Hero Display Font: Main headlines, LIVE NOW, GO LIVE, etc.
 * Tier 2 — Magazine Accent Font: Artist names, "Featuring", event titles (10-15% usage)
 * Tier 3 — UI Font: Navigation, buttons, forms, messages (clean & readable)
 * Tier 4 — Countdown Font: Timers, scores, stats (digital broadcast style)
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula)
 */

export const TMI_TYPOGRAPHY = {
  // Font Family Definitions
  fonts: {
    // Tier 1: Hero Display Font
    // Bold, wide, glossy, metallic, chrome highlights, neon glow
    // Use for: main page headlines, LIVE NOW, GO LIVE, STREAM & WIN, BATTLES, CYPHERS
    hero: {
      family: "'Futura', 'Proxima Nova', 'Montserrat', sans-serif",
      fallback: "'Arial Black', sans-serif",
      weight: 900,
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      style: 'normal',
    },

    // Tier 2: Magazine Accent Font
    // Flowing, elegant, handwritten-inspired BUT completely readable
    // NOT cursive, NOT connected handwriting
    // Elegant curves, stylish terminals, modern magazine signature
    // Use for: "Featuring", "Presented by", artist names, "Tonight's Spotlight", event titles
    // Usage: 10-15% of UI only
    magazine: {
      family: "'Caveat', 'Pacifico', 'Brush Script MT', cursive",
      fallback: "'Georgia', serif",
      weight: 700,
      letterSpacing: '0.02em',
      textTransform: 'none' as const,
      style: 'italic',
      fontSize: '1.1em', // Slightly larger for elegance
    },

    // Tier 3: UI Font
    // Clean, highly readable, professional
    // Use for: menus, settings, forms, buttons, notifications, search, messages
    ui: {
      family: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
      fallback: "'Helvetica Neue', sans-serif",
      weight: 600,
      letterSpacing: '0.01em',
      textTransform: 'none' as const,
      style: 'normal',
    },

    // Tier 4: Countdown Font
    // Digital broadcast clock style
    // Use for: timers, statistics, scores, revenue, XP, points, ranks, listener counts
    countdown: {
      family: "'Courier New', 'IBM Plex Mono', monospace",
      fallback: "'Monaco', monospace",
      weight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      style: 'normal',
      fontSize: '1.2em', // Slightly larger for digital feel
    },
  },

  // Size Scale (in rem, based on 16px root)
  sizes: {
    xs: '0.75rem',   // 12px — tiny labels, secondary text
    sm: '0.875rem',  // 14px — small text, captions
    base: '1rem',    // 16px — body text, standard
    lg: '1.125rem',  // 18px — larger text, form labels
    xl: '1.25rem',   // 20px — large headings
    '2xl': '1.5rem', // 24px — section titles
    '3xl': '1.875rem', // 30px — feature headings
    '4xl': '2.25rem', // 36px — major headlines
    '5xl': '3rem',   // 48px — hero headlines
    '6xl': '3.75rem', // 60px — massive hero displays
  },

  // Weight Scale
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Text Styles — Pre-composed for common use cases
  styles: {
    // Hero Display — Large, bold, uppercase, glossy, glowing
    heroDisplay: {
      fontSize: '3rem',
      fontWeight: 900,
      fontFamily: "'Futura', 'Proxima Nova', 'Montserrat', sans-serif",
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      lineHeight: 1.2,
      textShadow: '0 2px 4px rgba(255, 255, 255, 0.2)', // Glossy effect
    },

    // Feature Button Text
    // Emoji + UPPERCASE + color + glow
    featureButton: {
      fontSize: '1rem',
      fontWeight: 700,
      fontFamily: "'Inter', '-apple-system', sans-serif",
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      lineHeight: 1.4,
    },

    // Magazine Accent Headline
    // Used for "Featuring", "Presented by", artist names, featured events
    magazineAccent: {
      fontSize: '1.3rem',
      fontWeight: 700,
      fontFamily: "'Caveat', 'Pacifico', 'Brush Script MT', cursive",
      letterSpacing: '0.02em',
      fontStyle: 'italic',
      lineHeight: 1.4,
    },

    // Navigation Label
    navigation: {
      fontSize: '0.875rem',
      fontWeight: 600,
      fontFamily: "'Inter', '-apple-system', sans-serif",
      letterSpacing: '0.03em',
      textTransform: 'uppercase' as const,
      lineHeight: 1.4,
    },

    // Countdown Timer
    countdown: {
      fontSize: '2.25rem',
      fontWeight: 700,
      fontFamily: "'Courier New', 'IBM Plex Mono', monospace",
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      lineHeight: 1.2,
      fontVariantNumeric: 'tabular-nums',
    },

    // Body Text — Clean, readable
    body: {
      fontSize: '1rem',
      fontWeight: 400,
      fontFamily: "'Inter', '-apple-system', sans-serif",
      letterSpacing: '0em',
      lineHeight: 1.6,
      color: '#ffffff',
    },

    // Secondary Text
    secondary: {
      fontSize: '0.875rem',
      fontWeight: 400,
      fontFamily: "'Inter', '-apple-system', sans-serif",
      letterSpacing: '0em',
      lineHeight: 1.5,
      color: '#aaaaaa',
    },

    // Label / Small Text
    label: {
      fontSize: '0.75rem',
      fontWeight: 600,
      fontFamily: "'Inter', '-apple-system', sans-serif",
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      lineHeight: 1.4,
    },
  },

  // Chrome/Glossy Text Effect
  glossy: {
    textShadow: '0 2px 4px rgba(255, 255, 255, 0.2)',
  },

  // Feature-Specific Text Colors (use with feature colors)
  colorUsage: {
    playlist: '#00ffff',
    memoryWall: '#ff00ff',
    goLive: '#ff0000',
    streamAndWin: '#9b59ff',
    battles: '#ffd700',
    cyphers: '#00ff00',
    challenges: '#ff8800',
    dance: '#ff1493',
    messages: '#00dddd',
    booking: '#4169e1',
    store: '#00ff88',
    revenue: '#ffd700',
    sponsors: '#c0c0c0',
    radio: '#9b59ff',
    analytics: '#8000ff',
  },
} as const;

/**
 * Apply Tier 2 (Magazine Accent) styling to text
 * Usage: 10-15% of UI only — performer names, featured events, special callouts
 * @example applyMagazineStyle('Featuring Big Kazhdog')
 */
export function applyMagazineStyle(text: string): React.CSSProperties {
  return {
    ...TMI_TYPOGRAPHY.styles.magazineAccent,
    fontFamily: TMI_TYPOGRAPHY.fonts.magazine.family,
    fontStyle: 'italic',
  };
}

/**
 * Apply glossy chrome effect to text
 */
export function applyGlossyEffect(): React.CSSProperties {
  return {
    textShadow: TMI_TYPOGRAPHY.glossy.textShadow,
  };
}

/**
 * Apply hero display styling
 */
export function applyHeroStyle(): React.CSSProperties {
  return {
    ...TMI_TYPOGRAPHY.styles.heroDisplay,
  };
}

/**
 * Apply feature button styling with color
 * @example applyFeatureButtonStyle('#00ffff')
 */
export function applyFeatureButtonStyle(color: string): React.CSSProperties {
  return {
    ...TMI_TYPOGRAPHY.styles.featureButton,
    color,
    textShadow: `0 0 10px ${color}, 0 0 20px ${color}33`,
  };
}
