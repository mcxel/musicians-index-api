'use client';

/**
 * TMI Smart Panel
 *
 * Rotating content panel (magazine-style covers, featured artists, event sponsors, etc.)
 * Auto-rotates through content with smooth fade/slide transitions.
 *
 * Structure:
 * ┌────────────────────┐
 * │                    │
 * │  Featured Artist   │
 * │  Album Cover Art   │
 * │  with glow         │
 * │                    │
 * │ Artist Name        │
 * │ LISTEN NOW         │
 * │                    │
 * └────────────────────┘
 *
 * Features:
 * - Auto-rotate every 8-12 seconds
 * - Smooth fade + slide transitions
 * - High-contrast cover image
 * - Neon edge glow
 * - Glossy title text
 * - Call-to-action button (matching color)
 * - Mouse hover pause
 * - Touch-friendly on mobile
 *
 * @example
 * <TmiSmartPanel
 *   items={[
 *     { feature: 'playlist', title: 'Now Playing', subtitle: 'Chill Vibes Mix', imageUrl: '...', onCTA: () => {} },
 *     { feature: 'battles', title: 'RAP BATTLE', subtitle: 'Friday Night', imageUrl: '...', onCTA: () => {} },
 *   ]}
 *   holdTime={8000}
 * />
 */

import React, { useState, useEffect } from 'react';
import { getFeatureToken } from '../featureTokens';
import { TMI_MOTION } from '../motion';
import { TmiFeatureButton } from './TmiFeatureButton';

interface SmartPanelItem {
  /** Feature ID for color/styling */
  feature: string;

  /** Main title */
  title: string;

  /** Subtitle */
  subtitle?: string;

  /** Cover image URL */
  imageUrl?: string;

  /** CTA button label */
  ctaLabel?: string;

  /** CTA button click handler */
  onCTA?: () => void;

  /** Optional unique key (if not provided, index is used) */
  key?: string;
}

interface TmiSmartPanelProps {
  /** Array of content items to rotate */
  items: SmartPanelItem[];

  /** Milliseconds to hold each card (default: 8000) */
  holdTime?: number;

  /** Panel width (default: 280px) */
  width?: string | number;

  /** Panel height (default: 400px) */
  height?: string | number;

  /** Custom styling */
  style?: React.CSSProperties;

  /** Auto-rotate? (default: true) */
  autoRotate?: boolean;

  /** Called when card changes */
  onCardChange?: (index: number) => void;
}

export function TmiSmartPanel({
  items,
  holdTime = 8000,
  width = '280px',
  height = '400px',
  style,
  autoRotate = true,
  onCardChange,
}: TmiSmartPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const currentItem = items[currentIndex];
  const token = getFeatureToken(currentItem.feature);

  if (!token || items.length === 0) {
    return null;
  }

  // Auto-rotate timer
  useEffect(() => {
    if (!autoRotate || isHovered) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setIsTransitioning(false);
      }, TMI_MOTION.durations.slow);
    }, holdTime);

    return () => clearInterval(timer);
  }, [autoRotate, isHovered, items.length, holdTime]);

  // Notify when card changes
  useEffect(() => {
    onCardChange?.(currentIndex);
  }, [currentIndex, onCardChange]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#050510',
    border: `2px solid ${token.color.primary}`,
    boxShadow: `0 0 20px ${token.color.primary}88, inset 0 0 10px ${token.color.primary}22`,
    transition: `all ${TMI_MOTION.durations.normal}ms ${TMI_MOTION.easing.smooth}`,
    ...style,
  };

  // Background image with gradient overlay
  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundImage: currentItem.imageUrl
      ? `linear-gradient(135deg, rgba(${token.color.rgb}, 0.3) 0%, rgba(${token.color.rgb}, 0.1) 100%), url('${currentItem.imageUrl}')`
      : `linear-gradient(135deg, rgba(${token.color.rgb}, 0.2), rgba(${token.color.rgb}, 0.05))`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: isTransitioning ? 0 : 1,
    transition: `opacity ${TMI_MOTION.durations.slow}ms ${TMI_MOTION.easing.smooth}`,
  };

  // Content container
  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '16px',
    gap: '12px',
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%)`,
    zIndex: 2,
  };

  // Feature icon + title
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: token.color.primary,
    textShadow: token.glow.textGlowNormal,
  };

  // Main title (use magazine font for artist names)
  const titleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    fontFamily: "'Caveat', 'Pacifico', cursive",
    fontStyle: 'italic',
    color: '#ffffff',
    lineHeight: 1.2,
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
  };

  // Subtitle
  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: '#aaaaaa',
  };

  // Navigation dots
  const dotsStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    display: 'flex',
    gap: '6px',
    zIndex: 3,
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image with overlay */}
      <div style={backgroundStyle} />

      {/* Content */}
      <div style={contentStyle}>
        {/* Feature icon + label */}
        <div style={headerStyle}>
          <span>{token.icon}</span>
          <span>{token.name}</span>
        </div>

        {/* Title */}
        <div style={titleStyle}>{currentItem.title}</div>

        {/* Subtitle */}
        {currentItem.subtitle && <div style={subtitleStyle}>{currentItem.subtitle}</div>}

        {/* CTA Button */}
        <div style={{ marginTop: '8px' }}>
          <TmiFeatureButton
            feature={currentItem.feature as any}
            onClick={currentItem.onCTA}
            size="small"
            variant="default"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '0.875rem',
            }}
          >
            {currentItem.ctaLabel || 'EXPLORE'}
          </TmiFeatureButton>
        </div>
      </div>

      {/* Navigation dots */}
      {items.length > 1 && (
        <div style={dotsStyle}>
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentIndex ? token.color.primary : 'rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: `all ${TMI_MOTION.durations.quick}ms ${TMI_MOTION.easing.smooth}`,
                boxShadow:
                  index === currentIndex
                    ? `0 0 8px ${token.color.primary}`
                    : 'none',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hover overlay (fade) */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(${token.color.rgb}, 0.1)`,
            backdropFilter: 'blur(2px)',
            zIndex: 1,
            animation: `fadeIn ${TMI_MOTION.durations.quick}ms ${TMI_MOTION.easing.smooth}`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Multiple Smart Panels (left + right layout for Smart Panels container)
 */
interface TmiSmartPanelsLayoutProps {
  leftItems: SmartPanelItem[];
  rightItems: SmartPanelItem[];
  holdTime?: number;
  style?: React.CSSProperties;
}

export function TmiSmartPanelsLayout({
  leftItems,
  rightItems,
  holdTime = 8000,
  style,
}: TmiSmartPanelsLayoutProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        ...style,
      }}
    >
      <TmiSmartPanel items={leftItems} holdTime={holdTime} />
      <TmiSmartPanel items={rightItems} holdTime={holdTime} />
    </div>
  );
}

export default TmiSmartPanel;
