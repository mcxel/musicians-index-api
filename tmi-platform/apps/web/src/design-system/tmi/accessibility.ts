/**
 * TMI Design System — Accessibility Tokens
 *
 * WCAG 2.1 AA compliance standards, color contrast ratios, and accessible patterns.
 * Every design decision accounts for vision, motor, cognitive, and hearing accessibility.
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula)
 */

export const TMI_ACCESSIBILITY = {
  // Color Contrast Ratios (WCAG AA minimum: 4.5:1 for text, 3:1 for UI elements)
  contrast: {
    // Text on backgrounds
    textOnDark: {
      minimum: '4.5:1',
      white: '#ffffff',
      lightGray: '#e0e0e0',
      mediumGray: '#cccccc',
    },

    // UI element borders on backgrounds
    uiElementContrast: {
      minimum: '3:1',
      cyan: '#00ffff',
      magenta: '#ff00ff',
      red: '#ff0000',
    },

    // Focus indicators
    focusIndicator: {
      ratio: '3:1',
      color: '#00ffff',
      width: '3px',
    },
  },

  // Accessible Color Pairs (safe for colorblind users)
  colorblindSafe: {
    // Pairs that work for all types of colorblindness
    pairs: [
      { primary: '#00ffff', secondary: '#ff00ff', name: 'Cyan + Magenta' },
      { primary: '#ffd700', secondary: '#ff0000', name: 'Gold + Red' },
      { primary: '#00ff00', secondary: '#ff8800', name: 'Lime + Orange' },
      { primary: '#4169e1', secondary: '#ff00ff', name: 'Blue + Magenta' },
    ],

    // Never use these alone for critical information
    neverAlone: ['red', 'green', 'brown'],
  },

  // Focus States (keyboard navigation)
  focus: {
    // Standard focus ring
    ring: {
      width: '3px',
      color: '#00ffff',
      offset: '2px',
      style: 'solid',
    },

    // Keyboard focus visible only (not mouse)
    focusVisible: {
      outline: '3px solid #00ffff',
      outlineOffset: '2px',
    },
  },

  // Reduced Motion Support
  motionPreferences: {
    // Respects prefers-reduced-motion
    respectReducedMotion: true,

    // What to disable when user prefers reduced motion
    disableWhen: [
      'animations',
      'transitions longer than 200ms',
      'parallax effects',
      'auto-playing videos',
      'auto-rotating carousels',
      'particle effects',
    ],

    // Always allowed (too subtle to cause issues)
    alwaysAllow: [
      'focus indicators',
      'hover states',
      'short transitions (≤200ms)',
      'smooth scrolling',
    ],
  },

  // Touch Target Size (WCAG 2.1 AAA: 44×44px minimum)
  touchTarget: {
    minimum: '44px',
    recommended: '48px',
    padding: '8px',
  },

  // Text Size & Readability
  textReadability: {
    minimumSize: '12px',
    recommendedSize: '14px',
    lineHeight: '1.5',
    letterSpacing: '0.02em',

    // For body text
    body: {
      size: '14px',
      lineHeight: '1.6',
      color: '#ffffff',
      contrast: '7:1',
    },

    // For small text (labels, captions)
    small: {
      size: '12px',
      lineHeight: '1.4',
      color: '#cccccc',
      contrast: '4.5:1',
    },

    // For large headings
    heading: {
      size: '24px',
      lineHeight: '1.2',
      fontWeight: 700,
      contrast: '4.5:1',
    },
  },

  // ARIA Attributes (ready-to-use)
  aria: {
    // Live regions for dynamic content
    liveRegion: {
      ariaLive: 'polite',
      ariaAtomic: true,
      description: 'Screen reader announces changes',
    },

    // Alert regions (high priority)
    alert: {
      role: 'alert',
      ariaLive: 'assertive',
      description: 'Screen reader immediately announces alerts',
    },

    // Button with menu
    menuButton: {
      ariaHasPopup: 'menu',
      ariaExpanded: false,
    },

    // Tab panel
    tabPanel: {
      role: 'tabpanel',
      ariaLabelledBy: 'tab-id',
    },

    // Dialog/modal
    dialog: {
      role: 'dialog',
      ariaModal: true,
      ariaLabelledBy: 'dialog-title',
    },

    // Skip link
    skipLink: {
      href: '#main-content',
      text: 'Skip to main content',
    },
  },

  // Keyboard Navigation
  keyboard: {
    // Tab order (logical)
    tabOrder: [
      'Skip to main',
      'Navigation',
      'Primary CTA',
      'Secondary controls',
      'Footer',
    ],

    // Keyboard shortcuts (optional)
    shortcuts: {
      focusChat: 'C',
      focusInventory: 'I',
      focusPlaylist: 'P',
      toggleFullscreen: 'F',
      exitModal: 'Escape',
      acceptDialog: 'Enter',
    },
  },

  // Icons + Text (never icon-only for critical controls)
  iconText: {
    rule: 'Always pair icons with text labels for interactive elements',
    exception: 'Standard universal icons (close, menu) with aria-label',
    examples: {
      good: '🎵 PLAYLIST (icon + text)',
      bad: '🎵 (icon only)',
      exception: '✕ (close button with aria-label="Close")',
    },
  },

  // Semantic HTML
  semanticHTML: {
    // Use proper heading hierarchy
    headings: 'h1 → h2 → h3 (no skipping levels)',

    // Use native buttons, not divs
    buttons: '<button> for all interactive elements',

    // Use native form elements
    forms: '<input>, <label>, <select> (not custom equivalents)',

    // Use list elements for lists
    lists: '<ul>/<ol> for grouped content',

    // Use nav for navigation
    navigation: '<nav> for navigation regions',

    // Use main for primary content
    main: '<main> for primary content',

    // Use aside for secondary content
    aside: '<aside> for complementary content',
  },

  // Testing Checklist
  wcagChecklist: {
    perception: [
      'Color is not the only way to convey information',
      'Sufficient contrast for all text (4.5:1 minimum)',
      'Text can be resized without content loss',
      'No flashing or blinking content (3Hz+)',
    ],

    operability: [
      'All functionality keyboard accessible',
      'No keyboard traps',
      'Focus indicator always visible',
      'Touch targets 44×44px minimum',
      'Links and buttons have descriptive labels',
    ],

    understandability: [
      'Text is clear and simple',
      'Consistent navigation',
      'Clear error messages',
      'Help and documentation available',
    ],

    robustness: [
      'Valid HTML',
      'Proper ARIA usage',
      'Compatible with assistive technologies',
      'Accessible name/description for all controls',
    ],
  },

  // Assistive Technology Support
  assistiveTools: {
    screenReaders: ['NVDA (free)', 'JAWS (Windows)', 'VoiceOver (Mac/iOS)', 'TalkBack (Android)'],
    magnificationTools: ['ZoomText', 'Windows Magnifier', 'built-in zoom'],
    speechInput: ['Dragon NaturallySpeaking', 'built-in voice control'],
    switchAccess: ['Eye tracking', 'switch devices', 'voice control'],
  },
} as const;

/**
 * Get WCAG contrast ratio for text on dark background
 * @example getTextContrast('white')
 */
export function getTextContrast(colorType: keyof typeof TMI_ACCESSIBILITY.contrast.textOnDark): string {
  return TMI_ACCESSIBILITY.contrast.textOnDark[colorType];
}

/**
 * Get accessible focus style
 * @example getAccessibleFocusStyle()
 */
export function getAccessibleFocusStyle(): React.CSSProperties {
  return {
    outline: `${TMI_ACCESSIBILITY.focus.focusVisible.outline}`,
    outlineOffset: `${TMI_ACCESSIBILITY.focus.focusVisible.outlineOffset}`,
  };
}

/**
 * Get touch-friendly padding for buttons/links
 * @example getTouchTargetPadding()
 */
export function getTouchTargetPadding(): string {
  return TMI_ACCESSIBILITY.touchTarget.padding;
}

/**
 * Get reduced-motion CSS variable
 * @example getReducedMotionCSS()
 */
export function getReducedMotionCSS(): string {
  return `@media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
  }`;
}

/**
 * Apply accessible button styling
 * @example applyAccessibleButton()
 */
export function applyAccessibleButton(): React.CSSProperties {
  return {
    minWidth: TMI_ACCESSIBILITY.touchTarget.minimum,
    minHeight: TMI_ACCESSIBILITY.touchTarget.minimum,
    padding: TMI_ACCESSIBILITY.touchTarget.padding,
    fontSize: TMI_ACCESSIBILITY.textReadability.body.size,
    ...getAccessibleFocusStyle(),
  };
}

/**
 * Check if color pair is colorblind-safe
 * @example isColorblindSafe('cyan', 'magenta')
 */
export function isColorblindSafe(
  color1: string,
  color2: string,
): boolean {
  return TMI_ACCESSIBILITY.colorblindSafe.pairs.some(
    (pair) => (pair.primary === color1 && pair.secondary === color2) ||
              (pair.primary === color2 && pair.secondary === color1),
  );
}
