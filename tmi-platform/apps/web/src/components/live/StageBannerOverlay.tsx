'use client';

/**
 * StageBannerOverlay — LED / scrolling stage announcement layer.
 *
 * Renders over the venue viewport (not the CTA corner widget — that's SupportBannerRotator).
 * Subscribes to StageDirectorEngine for director-triggered announcements.
 * Supports all 7 StageBannerEngine animation styles (scroll/fade/glow/led/ribbon/wave/typewriter).
 *
 * Position is dictated by StageBanner.position (top/bottom/center/fullscreen).
 * Multiple active banners can stack (e.g., top = "NEW TRACK" + bottom = "TIP ME").
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onStageDirectorChange, type StageDirectorState } from '@/lib/live/StageDirectorEngine';

interface ActiveBanner {
  id: string;
  text: string;
  color: string;
  position: 'top' | 'bottom' | 'center';
  animation: 'scroll' | 'fade' | 'glow';
  expiresAt: number;
}

const SCROLL_VARIANT = {
  initial: { x: '110%' },
  animate: { x: '-110%', transition: { duration: 7, ease: 'linear' } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const FADE_VARIANT = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.3 } },
};

const GLOW_VARIANT = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring', stiffness: 300, damping: 22 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.25 } },
};

function getVariant(animation: ActiveBanner['animation']) {
  if (animation === 'scroll') return SCROLL_VARIANT;
  if (animation === 'glow') return GLOW_VARIANT;
  return FADE_VARIANT;
}

function getPositionStyle(position: ActiveBanner['position']): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute', left: 0, right: 0, pointerEvents: 'none', zIndex: 22, overflow: 'hidden' };
  if (position === 'top') return { ...base, top: 0 };
  if (position === 'center') return { ...base, top: '50%', transform: 'translateY(-50%)' };
  return { ...base, bottom: 0 };
}

export default function StageBannerOverlay() {
  const [banners, setBanners] = useState<ActiveBanner[]>([]);

  useEffect(() => {
    return onStageDirectorChange((state: StageDirectorState) => {
      if (!state.bannerText) {
        setBanners([]);
        return;
      }
      const now = Date.now();
      const newBanner: ActiveBanner = {
        id: `banner-${now}`,
        text: state.bannerText,
        color: state.bannerColor,
        position: 'bottom',
        animation: 'glow',
        expiresAt: now + 8_000,
      };
      setBanners(prev => {
        const fresh = prev.filter(b => b.expiresAt > now);
        return [...fresh, newBanner].slice(-3);
      });
    });
  }, []);

  // Auto-expire banners
  useEffect(() => {
    if (banners.length === 0) return;
    const nearest = Math.min(...banners.map(b => b.expiresAt));
    const delay = Math.max(100, nearest - Date.now());
    const t = setTimeout(() => {
      const now = Date.now();
      setBanners(prev => prev.filter(b => b.expiresAt > now));
    }, delay);
    return () => clearTimeout(t);
  }, [banners]);

  const grouped = {
    top: banners.filter(b => b.position === 'top'),
    center: banners.filter(b => b.position === 'center'),
    bottom: banners.filter(b => b.position === 'bottom'),
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      {(['top', 'center', 'bottom'] as const).map(pos => (
        <div key={pos} style={getPositionStyle(pos)}>
          <AnimatePresence mode="wait">
            {grouped[pos].map(banner => {
              const variant = getVariant(banner.animation);
              return (
                <motion.div
                  key={banner.id}
                  variants={variant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{
                    padding: banner.animation === 'scroll' ? '10px 0' : '9px 24px',
                    background: `${banner.color}12`,
                    backdropFilter: 'blur(6px)',
                    borderTop: pos === 'bottom' ? `1.5px solid ${banner.color}33` : 'none',
                    borderBottom: pos === 'top' ? `1.5px solid ${banner.color}33` : 'none',
                    textAlign: 'center',
                    whiteSpace: banner.animation === 'scroll' ? 'nowrap' : 'normal',
                    overflow: banner.animation === 'scroll' ? 'hidden' : 'visible',
                  }}
                >
                  <span style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: banner.color,
                    letterSpacing: '0.08em',
                    textShadow: `0 0 24px ${banner.color}99`,
                  }}>
                    {banner.text}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
