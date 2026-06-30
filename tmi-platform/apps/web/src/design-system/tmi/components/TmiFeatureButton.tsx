'use client';

/**
 * TMI Feature Button
 *
 * Core button component for the platform.
 * Uses: emoji icon + uppercase label + feature color + glow + motion
 *
 * No plain white buttons. Every button has:
 * - Emoji or icon
 * - Uppercase text
 * - Assigned feature color
 * - Glow effect (hover/active)
 * - Smooth motion
 * - Chrome/glossy effect
 *
 * @example
 * <TmiFeatureButton feature="playlist" onClick={handleClick}>PLAYLIST</TmiFeatureButton>
 * <TmiFeatureButton feature="goLive" size="large" variant="hero">GO LIVE</TmiFeatureButton>
 */

import React, { useState } from 'react';
import { FEATURE_TOKENS, getFeatureToken } from '../featureTokens';
import { TMI_MOTION } from '../motion';
import { TMI_TYPOGRAPHY } from '../typography';

interface TmiFeatureButtonProps {
  /** Feature ID (playlist, memoryWall, goLive, etc.) */
  feature: keyof typeof FEATURE_TOKENS;

  /** Button label (usually UPPERCASE) */
  children: React.ReactNode;

  /** Button size */
  size?: 'small' | 'normal' | 'large';

  /** Button variant */
  variant?: 'default' | 'hero' | 'subtle';

  /** Show as disabled */
  disabled?: boolean;

  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /** Additional styles */
  style?: React.CSSProperties;

  /** CSS class names */
  className?: string;

  /** Tab to show when clicked (optional, for nav buttons) */
  tabId?: string;
}

export function TmiFeatureButton({
  feature,
  children,
  size = 'normal',
  variant = 'default',
  disabled = false,
  onClick,
  style,
  className,
  tabId,
}: TmiFeatureButtonProps) {
  const token = getFeatureToken(feature as string);
  if (!token) return null;

  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Size variants
  const sizeMap = {
    small: {
      padding: '6px 12px',
      fontSize: '0.875rem',
      height: '28px',
    },
    normal: {
      padding: '8px 16px',
      fontSize: '1rem',
      height: '36px',
    },
    large: {
      padding: '12px 24px',
      fontSize: '1.1rem',
      height: '48px',
    },
  };

  // Variant styles
  const variantMap = {
    default: {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: isHovered ? token.color.primary : `${token.color.primary}66`,
      background: isHovered
        ? `rgba(${token.color.rgb}, 0.1)`
        : 'rgba(255, 255, 255, 0.02)',
    },
    hero: {
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: token.color.primary,
      background: `rgba(${token.color.rgb}, 0.15)`,
      fontWeight: 900,
    },
    subtle: {
      borderWidth: '0px',
      borderStyle: 'none',
      borderColor: 'transparent',
      background: 'transparent',
    },
  };

  const currentVariant = variantMap[variant];

  // Compute glow intensity based on state
  let glowIntensity: 'subtle' | 'normal' | 'intense' = 'subtle';
  if (isActive) glowIntensity = 'intense';
  else if (isHovered) glowIntensity = 'normal';

  const glowText =
    glowIntensity === 'subtle'
      ? token.glow.textGlowSubtle
      : glowIntensity === 'normal'
        ? token.glow.textGlowNormal
        : token.glow.textGlowIntense;

  const baseStyle: React.CSSProperties = {
    // Layout
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: '6px',
    transition: `all ${TMI_MOTION.durations.quick}ms ${TMI_MOTION.easing.snappy}`,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'relative',

    // Size
    ...sizeMap[size],

    // Color & text
    color: disabled ? '#555555' : token.color.primary,
    fontWeight: token.typography.buttonFontWeight,
    fontSize: size === 'large' ? '1.1rem' : size === 'small' ? '0.875rem' : '1rem',
    letterSpacing: token.typography.letterSpacing,
    textTransform: 'uppercase' as const,
    textShadow: disabled ? 'none' : glowText,

    // Border & background
    ...currentVariant,

    // Effects
    boxShadow:
      disabled || variant === 'subtle'
        ? 'none'
        : isHovered || isActive
          ? `0 0 ${isActive ? '20' : '15'}px ${token.color.primary}88`
          : `0 0 10px ${token.color.primary}44`,

    // Opacity states
    opacity: disabled ? 0.5 : 1,

    // Hover/active scale
    transform: isActive ? 'scale(1.1)' : isHovered ? 'scale(1.05)' : 'scale(1)',

    // Glassmorphism
    backdropFilter: variant !== 'subtle' ? 'blur(20px)' : 'none',

    // Chrome highlight (glossy effect)
    ...(isHovered && {
      outline: `1px solid rgba(255, 255, 255, 0.2)`,
      outlineOffset: '2px',
    }),

    // User override
    ...style,
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    setIsActive(true);
    setTimeout(() => setIsActive(false), TMI_MOTION.durations.normal);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      disabled={disabled}
      style={baseStyle}
      className={className}
      data-feature={feature}
      data-tab={tabId}
    >
      {/* Icon (emoji or icon component) */}
      <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.2em' }}>
        {token.icon}
      </span>

      {/* Label */}
      <span>{children}</span>

      {/* Active indicator (small underline or arrow) */}
      {isActive && (
        <span
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '2px',
            background: token.color.primary,
            borderRadius: '1px',
            boxShadow: `0 0 8px ${token.color.primary}`,
            animation: `slideUp ${TMI_MOTION.durations.normal}ms ${TMI_MOTION.easing.snappy}`,
          }}
        />
      )}
    </button>
  );
}

export default TmiFeatureButton;
