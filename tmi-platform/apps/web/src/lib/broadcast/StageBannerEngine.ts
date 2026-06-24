/**
 * StageBannerEngine — animated banner controller for concerts and events.
 *
 * Supports: scrolling text, fade in/out, neon glow, LED style, stadium ribbon style.
 * Banners auto-rotate or can be manually triggered.
 * Used during performances and intermissions.
 */

export type BannerAnimation = 'scroll' | 'fade' | 'glow' | 'led' | 'ribbon' | 'wave' | 'typewriter';

export type BannerPosition = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'fullscreen';

export interface StageBanner {
  id: string;
  text: string;
  animation: BannerAnimation;
  durationMs: number;
  position: BannerPosition;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
}

export interface StageBannerRotation {
  banners: StageBanner[];
  autoRotateMs?: number; // 0 = manual only
  currentIndex: number;
  isActive: boolean;
}

// ─── Animation styles ───────────────────────────────────────────────────────

export const BANNER_ANIMATIONS: Record<BannerAnimation, { duration: number; keyframes: string }> = {
  'scroll': {
    duration: 6000,
    keyframes: `
      @keyframes stageBannerScroll {
        0%   { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
    `,
  },
  'fade': {
    duration: 3000,
    keyframes: `
      @keyframes stageBannerFade {
        0%   { opacity: 0; }
        15%  { opacity: 1; }
        85%  { opacity: 1; }
        100% { opacity: 0; }
      }
    `,
  },
  'glow': {
    duration: 4000,
    keyframes: `
      @keyframes stageBannerGlow {
        0%   { opacity: 0; text-shadow: 0 0 10px rgba(255,255,255,0); }
        25%  { opacity: 1; text-shadow: 0 0 20px rgba(255,255,255,0.8); }
        75%  { opacity: 1; text-shadow: 0 0 20px rgba(255,255,255,0.8); }
        100% { opacity: 0; text-shadow: 0 0 10px rgba(255,255,255,0); }
      }
    `,
  },
  'led': {
    duration: 5000,
    keyframes: `
      @keyframes stageBannerLED {
        0%   { clip-path: inset(0 100% 0 0); }
        100% { clip-path: inset(0 0 0 0); }
      }
    `,
  },
  'ribbon': {
    duration: 4000,
    keyframes: `
      @keyframes stageBannerRibbon {
        0%   { transform: scaleY(0); opacity: 0; }
        25%  { transform: scaleY(1); opacity: 1; }
        75%  { transform: scaleY(1); opacity: 1; }
        100% { transform: scaleY(0); opacity: 0; }
      }
    `,
  },
  'wave': {
    duration: 5000,
    keyframes: `
      @keyframes stageBannerWave {
        0%   { transform: translateY(0); }
        25%  { transform: translateY(-20px); }
        50%  { transform: translateY(0); }
        75%  { transform: translateY(-20px); }
        100% { transform: translateY(0); }
      }
    `,
  },
  'typewriter': {
    duration: 3000,
    keyframes: `
      @keyframes stageBannerTypewriter {
        0%   { width: 0; }
        100% { width: 100%; }
      }
    `,
  },
} as const;

// ─── Color presets for different concert styles ──────────────────────────────

export const BANNER_COLOR_PRESETS = {
  'thank-you': {
    text: '#FFD700',
    background: 'rgba(255,215,0,0.1)',
    glow: '#FFD700',
  },
  'tip-request': {
    text: '#FF2DAA',
    background: 'rgba(255,45,170,0.1)',
    glow: '#FF2DAA',
  },
  'album-release': {
    text: '#00E5FF',
    background: 'rgba(0,229,255,0.1)',
    glow: '#00E5FF',
  },
  'follow': {
    text: '#AA2DFF',
    background: 'rgba(170,45,255,0.1)',
    glow: '#AA2DFF',
  },
  'sponsor': {
    text: '#fff',
    background: 'rgba(255,255,255,0.05)',
    glow: '#fff',
  },
  'emergency-fundraiser': {
    text: '#FF4040',
    background: 'rgba(255,64,64,0.1)',
    glow: '#FF4040',
  },
} as const;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Creates a banner rotation schedule.
 */
export function createBannerRotation(banners: StageBanner[], autoRotateMs = 30000): StageBannerRotation {
  return {
    banners,
    autoRotateMs,
    currentIndex: 0,
    isActive: true,
  };
}

/**
 * Gets the current banner in rotation.
 */
export function getCurrentBanner(rotation: StageBannerRotation): StageBanner | null {
  if (!rotation.isActive || rotation.banners.length === 0) return null;
  return rotation.banners[rotation.currentIndex] ?? null;
}

/**
 * Advances to the next banner.
 */
export function nextBanner(rotation: StageBannerRotation): StageBanner | null {
  rotation.currentIndex = (rotation.currentIndex + 1) % rotation.banners.length;
  return getCurrentBanner(rotation);
}

/**
 * Manually set a specific banner.
 */
export function showBanner(rotation: StageBannerRotation, index: number): StageBanner | null {
  if (index >= 0 && index < rotation.banners.length) {
    rotation.currentIndex = index;
  }
  return getCurrentBanner(rotation);
}

/**
 * Pause the auto-rotation.
 */
export function pauseBannerRotation(rotation: StageBannerRotation): void {
  rotation.isActive = false;
}

/**
 * Resume the auto-rotation.
 */
export function resumeBannerRotation(rotation: StageBannerRotation): void {
  rotation.isActive = true;
}

/**
 * Create common banner templates.
 */
export const BANNER_TEMPLATES = {
  thankYou: (name: string): StageBanner => ({
    id: `banner-thank-you-${Date.now()}`,
    text: `THANK YOU ${name.toUpperCase()}`,
    animation: 'fade',
    durationMs: 4000,
    position: 'top',
    textColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.08)',
    fontSize: 28,
  }),

  tipRequest: (cause?: string): StageBanner => ({
    id: `banner-tip-request-${Date.now()}`,
    text: cause ? `💰 ${cause}` : '💰 TIP THE ARTIST',
    animation: 'glow',
    durationMs: 15000,
    position: 'bottom',
    textColor: '#FF2DAA',
    backgroundColor: 'rgba(255,45,170,0.08)',
    fontSize: 24,
  }),

  newAlbum: (albumName: string): StageBanner => ({
    id: `banner-album-${Date.now()}`,
    text: `🎵 ${albumName.toUpperCase()} OUT NOW`,
    animation: 'led',
    durationMs: 8000,
    position: 'center',
    textColor: '#00E5FF',
    backgroundColor: 'rgba(0,229,255,0.08)',
    fontSize: 26,
  }),

  follow: (handle: string): StageBanner => ({
    id: `banner-follow-${Date.now()}`,
    text: `FOLLOW @${handle.toUpperCase()}`,
    animation: 'scroll',
    durationMs: 6000,
    position: 'bottom',
    textColor: '#AA2DFF',
    backgroundColor: 'rgba(170,45,255,0.08)',
    fontSize: 20,
  }),

  guestAnnouncement: (guestName: string): StageBanner => ({
    id: `banner-guest-${Date.now()}`,
    text: `🎤 WELCOME ${guestName.toUpperCase()}`,
    animation: 'typewriter',
    durationMs: 4000,
    position: 'top',
    textColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.08)',
    fontSize: 26,
  }),

  nextSong: (songTitle: string): StageBanner => ({
    id: `banner-next-${Date.now()}`,
    text: `NEXT: ${songTitle.toUpperCase()}`,
    animation: 'wave',
    durationMs: 3000,
    position: 'center',
    textColor: '#00E5FF',
    backgroundColor: 'rgba(0,229,255,0.08)',
    fontSize: 22,
  }),

  emergencyFundraiser: (cause: string): StageBanner => ({
    id: `banner-emergency-${Date.now()}`,
    text: `🚨 ${cause.toUpperCase()}`,
    animation: 'glow',
    durationMs: 10000,
    position: 'fullscreen',
    textColor: '#FF4040',
    backgroundColor: 'rgba(255,64,64,0.12)',
    fontSize: 32,
  }),
} as const;

/**
 * Get CSS for a banner animation.
 */
export function getBannerAnimationCSS(banner: StageBanner): string {
  const anim = BANNER_ANIMATIONS[banner.animation];
  if (!anim) return '';

  const duration = banner.durationMs || anim.duration;
  return `
    ${anim.keyframes}
    animation: ${banner.animation} ${duration}ms ease-in-out;
  `;
}
