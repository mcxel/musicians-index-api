// packages/cross-device/src/device-detection.ts
// Universal device detection for web, mobile, TV, kiosk, scanner.

export type DeviceClass = 'web' | 'mobile' | 'tablet' | 'tv' | 'desktop' | 'kiosk' | 'scanner';
export type InputMode = 'pointer' | 'touch' | 'dpad' | 'scanner' | 'voice';

export interface DeviceProfile {
  deviceClass: DeviceClass;
  inputMode: InputMode;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  isTouchPrimary: boolean;
  supportsDpad: boolean;
  supportsHover: boolean;
  supportsKeyboard: boolean;
  supportsCamera: boolean;
  prefersReducedMotion: boolean;
  prefersReducedAudio: boolean;
  isLowBandwidth: boolean;
  isPWA: boolean;
  isTV: boolean;
  locale: string;
  timezone: string;
}

export function detectDevice(): DeviceProfile {
  if (typeof window === 'undefined') {
    return defaultProfile('web');
  }

  const ua = navigator.userAgent;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const touch = navigator.maxTouchPoints > 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // TV detection
  const isTV = /TV|SmartTV|AppleTV|SMART-TV|Tizen|WebOS|Vizio|hbbtv/i.test(ua)
    || (w >= 1920 && !touch && window.matchMedia('(hover: none)').matches);

  // Kiosk/scanner detection via URL or custom user agent
  const isKiosk = /kiosk|scanner|operator/i.test(ua) || window.location.pathname.startsWith('/kiosk') || window.location.pathname.startsWith('/scanner');

  // Mobile
  const isMobile = /Android|iPhone|iPod/i.test(ua) || (touch && w < 768);
  const isTablet = touch && w >= 768 && w < 1200;

  const isPWA = window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true;

  let deviceClass: DeviceClass = 'web';
  let inputMode: InputMode = 'pointer';

  if (isTV) { deviceClass = 'tv'; inputMode = 'dpad'; }
  else if (isKiosk && /scanner/i.test(ua)) { deviceClass = 'scanner'; inputMode = 'scanner'; }
  else if (isKiosk) { deviceClass = 'kiosk'; inputMode = 'touch'; }
  else if (isMobile) { deviceClass = 'mobile'; inputMode = 'touch'; }
  else if (isTablet) { deviceClass = 'tablet'; inputMode = 'touch'; }
  else if (!touch && w > 1400) { deviceClass = 'desktop'; inputMode = 'pointer'; }

  return {
    deviceClass,
    inputMode,
    screenWidth: w,
    screenHeight: h,
    pixelRatio: window.devicePixelRatio || 1,
    isTouchPrimary: touch,
    supportsDpad: isTV,
    supportsHover: !touch,
    supportsKeyboard: !isTV,
    supportsCamera: 'mediaDevices' in navigator,
    prefersReducedMotion: reducedMotion,
    prefersReducedAudio: false, // user setting in app
    isLowBandwidth: (navigator as any).connection?.effectiveType === '2g' || (navigator as any).connection?.effectiveType === 'slow-2g',
    isPWA,
    isTV,
    locale: navigator.language || 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
  };
}

function defaultProfile(deviceClass: DeviceClass): DeviceProfile {
  return { deviceClass, inputMode: 'pointer', screenWidth: 1920, screenHeight: 1080, pixelRatio: 1, isTouchPrimary: false, supportsDpad: false, supportsHover: true, supportsKeyboard: true, supportsCamera: false, prefersReducedMotion: false, prefersReducedAudio: false, isLowBandwidth: false, isPWA: false, isTV: false, locale: 'en-US', timezone: 'America/Los_Angeles' };
}

// ── LAYOUT BREAKPOINTS BY DEVICE ─────────────────────────
export const DEVICE_LAYOUT = {
  web:     { columns: 12, maxWidth: 1440, cardSize: 'standard', navStyle: 'top' },
  tablet:  { columns: 8,  maxWidth: 1024, cardSize: 'standard', navStyle: 'top' },
  mobile:  { columns: 4,  maxWidth: 428,  cardSize: 'compact',  navStyle: 'bottom' },
  tv:      { columns: 12, maxWidth: 1920, cardSize: 'large',    navStyle: 'overlay', focusVisible: true },
  desktop: { columns: 16, maxWidth: 2560, cardSize: 'standard', navStyle: 'side' },
  kiosk:   { columns: 6,  maxWidth: 1080, cardSize: 'large',    navStyle: 'bottom' },
  scanner: { columns: 1,  maxWidth: 480,  cardSize: 'fullwidth', navStyle: 'minimal' },
} as const;

// ── TV DPAD FOCUS ENGINE ──────────────────────────────────
export const TV_FOCUS_CONFIG = {
  enableFocusOutline: true,
  focusOutlineColor: '#FFB800', // TMI gold
  focusOutlineWidth: 4,
  focusTransitionMs: 150,
  scrollIntoViewOnFocus: true,
  escapeToBackButton: true,
  longPressMs: 500,
} as const;

// ── QR HANDOFF / CONTINUE ON PHONE ───────────────────────
export interface CrossDeviceHandoff {
  fromDevice: DeviceClass;
  toDevice: DeviceClass;
  handoffType: 'continue_watching' | 'continue_onboarding' | 'continue_checkout' | 'continue_game' | 'login_from_tv';
  entityType?: string;
  entityId?: string;
  positionSeconds?: number;
  sessionData?: Record<string, unknown>;
  qrCode?: string;
  pairingCode?: string;
  expiresAt: Date;
}
